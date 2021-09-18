import { retryAsync as retry } from 'ts-retry'

import {
  EVENT_DB_SAVE_BILL,
  EVENT_DB_UPDATE_BILL,
  EVENT_DB_UPDATE_TICKET,
  EVENT_REDIS_COMPENSATE_TICKET_POOL,
  EVENT_REDIS_UPDATE_FLIGHT_THUMBNAIL,
} from '../../constants'
import {
  TicketLockExpireError,
  PaymentGatewayFailureError,
  TicketNotCancellableError,
  TicketNotExistsError,
  FlightFullyOccupiedError,
  FlightNotExistsError,
  BillNotExistsError,
} from './errors'

import { logger, price } from '../../utils'
import { app as config } from '../../configs'
import { IAirlineGateway, IPaymentGateway } from 'src/external/api'
import { IRedisTicket } from './redis'
import { IMessageBroker } from '../../facilities/message_broker'

import { IBillRepo } from './repo'

export interface CancelOrderResult {
  paymentNo: string
  refundNo?: string
}

export interface PayOrderResult {
  paymentNo: string
}

export interface CreateOrderResult {
  ticketNo: string
  ticketPrice: number
}

export interface ITicketDomain {
  isTicketCancellable(flightId: number, travelerId: number, ticketNo: string): Promise<boolean>
  createTicketOrder(flightId: number, travelerId: number): Promise<CreateOrderResult>
  payTicketOrder(flightId: number, travelerId: number, ticketNo: string): Promise<PayOrderResult>
  cancelTicketOrder(
    flightId: number,
    travelerId: number,
    ticketNo: string,
    ticketPrice: number,
    paymentNo: string
  ): Promise<CancelOrderResult>
}

export class TicketDomain implements ITicketDomain {
  redis: IRedisTicket
  msgBroker: IMessageBroker
  airline: IAirlineGateway
  payment: IPaymentGateway
  billRepo: IBillRepo

  constructor(
    redis: IRedisTicket,
    msgBroker: IMessageBroker,
    airline: IAirlineGateway,
    payment: IPaymentGateway,
    billRepo: IBillRepo
  ) {
    this.redis = redis
    this.airline = airline
    this.payment = payment
    this.msgBroker = msgBroker
    this.billRepo = billRepo
  }

  async createTicketOrder(flightId: number, travelerId: number): Promise<CreateOrderResult> {
    const numOfRemainSeats = await this.redis.getNumOfRemainSeats(flightId)
    if (0 >= numOfRemainSeats) {
      throw new FlightFullyOccupiedError()
    }

    const flight = await this.redis.getFlight(flightId)
    if (!flight) {
      throw new FlightNotExistsError(`ticket#create_ticket_order: flight[${flightId}] does not exist`)
    }

    const ticketPrice = price.calc(flight.base_price, flight.capacity, flight.capacity - numOfRemainSeats)
    const ticketNo = await this.redis.lockOneTicket(flightId, travelerId, String(ticketPrice))

    // a workaround for compensating ticket_pool once ticket_lock expired
    // TODO: to switch to a delayed queue approach
    setTimeout(async () => {
      // emit event: redis compensate ticket_pool
      await this.msgBroker.publish(
        EVENT_REDIS_COMPENSATE_TICKET_POOL,
        {
          flight_id: flightId,
          ticket_no: ticketNo,
        },
        true
      )
    }, config.ticketLockExpireSec * 1000)

    try {
      const bookTicketResp = await retry(
        async () => await this.airline.bookTicket(ticketNo, { flightId, travelerId, ticketPrice }),
        { maxTry: 3, delay: 100 }
      )

      // emit event: update flight_thumbnail
      await this.msgBroker.publish(EVENT_REDIS_UPDATE_FLIGHT_THUMBNAIL, { flight_id: flightId })

      return { ticketNo: bookTicketResp.ticketNo, ticketPrice }
    } catch (e) {
      logger.warn(
        `failed on booking ticket[${flightId}, ${travelerId}, ${ticketNo}] from airline gateway. rollback ticket lock`
      )
      await this.redis.getAndDelLockedTicketPrice(flightId, travelerId, String(ticketNo))
      throw e
    }
  }

  async payTicketOrder(flightId: number, travelerId: number, ticketNo: string): Promise<PayOrderResult> {
    const ticketPrice = await this.redis.getLockedTicketPrice(flightId, travelerId, ticketNo)
    if (!ticketPrice) {
      throw new TicketLockExpireError('ticket#ticket_lock_expired')
    } else {
      try {
        const payResp = await retry(
          async () => await this.payment.pay(Number(ticketPrice), { flightId, travelerId, ticketNo }),
          {
            maxTry: 3,
            delay: 100,
          }
        )

        // emit event: db save bill
        await this.msgBroker.publish(EVENT_DB_SAVE_BILL, {
          payment_no: payResp.paymentNo,
          traveler_id: travelerId,
          ticket_no: ticketNo,
          flight_id: flightId,
          amount: Number(ticketPrice),
          status: 'paid',
          paid_at: new Date().toISOString(),
        })

        // emit event: db update ticket
        await this.msgBroker.publish(EVENT_DB_UPDATE_TICKET, {
          ticket_no: ticketNo,
          traveler_id: travelerId,
          price: ticketPrice,
        })
        await this.msgBroker.flush()

        await this.redis.delLockedTicket(flightId, travelerId, ticketNo)
        return { paymentNo: payResp.paymentNo }
      } catch (e) {
        console.error(e)
        logger.error(e)
        throw new PaymentGatewayFailureError((e as Error).message)
      }
    }
  }

  async isTicketCancellable(flightId: number, travelerId: number, ticketNo: string): Promise<boolean> {
    const flight = await this.redis.getFlight(flightId)
    if (!flight) {
      throw new FlightNotExistsError(`flight[${flightId}] not exists`)
    } else {
      const now = new Date()
      const deadline = new Date(flight.departure_time)
      deadline.setHours(deadline.getHours() - config.ticketAllowCancelHour)
      return now < deadline
    }
  }

  async cancelAndRefund(
    flightId: number,
    travelerId: number,
    ticketNo: string,
    ticketPrice: number,
    paymentNo: string
  ): Promise<CancelOrderResult> {
    const lockedTicketPrice = await this.redis.getAndDelLockedTicketPrice(flightId, travelerId, ticketNo)

    // the ticket still in locked state and hasn't been paid yet
    if (lockedTicketPrice) {
      return { paymentNo }
    }

    const billExists = await this.billRepo.billExists(paymentNo, flightId, travelerId, ticketNo)
    if (!billExists) {
      throw new BillNotExistsError('ticket#bill_not_exists')
    }

    const refund = await retry(
      async () => await this.payment.refund(paymentNo, { travelerId, ticketNo, ticketPrice }),
      {
        maxTry: 3,
        delay: 100,
      }
    )

    return { paymentNo, refundNo: refund.refundNo }
  }

  async cancelTicketOrder(
    flightId: number,
    travelerId: number,
    ticketNo: string,
    ticketPrice: number,
    paymentNo: string
  ): Promise<CancelOrderResult> {
    if (!(await this.isTicketCancellable(flightId, travelerId, ticketNo))) {
      throw new TicketNotCancellableError()
    }

    const result = await this.cancelAndRefund(flightId, travelerId, ticketNo, ticketPrice, paymentNo)

    // emit event: redis compensate ticket_pool
    await this.msgBroker.publish(
      EVENT_REDIS_COMPENSATE_TICKET_POOL,
      {
        flight_id: flightId,
        ticket_no: ticketNo,
      },
      false
    )

    // emit event: redis update flight_thumbnail
    await this.msgBroker.publish(
      EVENT_REDIS_UPDATE_FLIGHT_THUMBNAIL,
      {
        flight_id: flightId,
      },
      false
    )

    // emit event: db update bill
    await this.msgBroker.publish(
      EVENT_DB_UPDATE_BILL,
      {
        payment_no: paymentNo,
        refund_no: result.refundNo,
        status: 'refunded',
        refund_at: new Date().toISOString(),
      },
      false
    )

    // emit event: db update ticket
    await this.msgBroker.publish(
      EVENT_DB_UPDATE_TICKET,
      {
        ticket_no: ticketNo,
        traveler_id: null,
        price: null,
      },
      false
    )

    await this.msgBroker.flush()

    return result
  }
}
