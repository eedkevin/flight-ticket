import 'dotenv/config'
import { expect } from 'chai'

import { TicketDomain } from '../../../../src/domains/ticket'
import { price } from '../../../../src/utils/'

import { MessageBrokerMock } from './message_broker_mock'
import { PaymentGatewayMock, AirlineGatewayMock } from './external_api_mock'
import { RedisTicketMock } from './redis_mock'
import { BillRepoMock } from './bill_repo_mock'

describe('Ticket Domain', () => {
  describe('#createTicketOrder(number,number,string)', () => {
    const redismock = new RedisTicketMock()
    const msgbrokermock = new MessageBrokerMock()
    const airlinemock = new AirlineGatewayMock()
    const paymentmock = new PaymentGatewayMock()
    const billrepomock = new BillRepoMock()
    const ticketDomain = new TicketDomain(redismock, msgbrokermock, airlinemock, paymentmock, billrepomock)

    const input = {
      flightId: 1,
      travelerId: 1,
    }
    const mockdata = {
      numOfRemainSeats: 20,
      flight: {
        id: 1,
        capacity: 80,
        base_price: 1000,
        route_id: 1,
      },
      lockOneTicket: 'e0114ce3-67d3-46d0-a736-d165fb1d4f52',
      bookTicket: {
        status: 'success',
        ticketNo: 'e0114ce3-67d3-46d0-a736-d165fb1d4f52',
      },
      publishUpdateMsg: null,
      publishCompensateMsg: null,
    }

    redismock.setData([mockdata.lockOneTicket, mockdata.flight, mockdata.numOfRemainSeats])
    airlinemock.setData([mockdata.bookTicket])
    msgbrokermock.setData([mockdata.publishUpdateMsg, mockdata.publishCompensateMsg])

    let actual
    it('should return a JSON object of CreateOrderResult', async () => {
      actual = await ticketDomain.createTicketOrder(input.flightId, input.travelerId)

      expect(actual).not.to.be.empty
      expect(actual).to.have.property('ticketNo')
      expect(actual).to.have.property('ticketPrice')
    })

    it('should return the correct calculation on ticketPrice', () => {
      const occupied = mockdata.flight.capacity - mockdata.numOfRemainSeats
      const ticketPrice = price.calc(mockdata.flight.base_price, mockdata.flight.capacity, occupied)
      expect(actual.ticketPrice).to.be.eql(ticketPrice)
    })
  })

  describe('#payTicketOrder(number,number,string)', () => {
    const redismock = new RedisTicketMock()
    const msgbrokermock = new MessageBrokerMock()
    const airlinemock = new AirlineGatewayMock()
    const paymentmock = new PaymentGatewayMock()
    const billrepomock = new BillRepoMock()
    const ticketDomain = new TicketDomain(redismock, msgbrokermock, airlinemock, paymentmock, billrepomock)

    const input = {
      flightId: 1,
      travelerId: 1,
      ticketNo: 'e0114ce3-67d3-46d0-a736-d165fb1d4f52',
    }

    const mockdata = {
      lockedTicketPrice: 2500,
      pay: {
        status: 'success',
        paymentNo: '8d95f73d-1fc3-430f-8c84-84926a9b7443',
      },
      publishSaveBill: null,
      publishUpdateTicket: null,
      flush: null,
      delLockedTicket: true,
    }

    redismock.setData([mockdata.delLockedTicket, mockdata.lockedTicketPrice])
    paymentmock.setData([mockdata.pay])
    msgbrokermock.setData([mockdata.flush, mockdata.publishUpdateTicket, mockdata.publishSaveBill])

    let actual
    it('should return a JSON object of PayOrderResult', async () => {
      actual = await ticketDomain.payTicketOrder(input.flightId, input.travelerId, input.ticketNo)

      expect(actual).not.to.be.empty
      expect(actual).to.have.property('paymentNo')
    })
  })

  describe('#cancelTicketOrder(number,number,string,number,string)', () => {
    const redismock = new RedisTicketMock()
    const msgbrokermock = new MessageBrokerMock()
    const airlinemock = new AirlineGatewayMock()
    const paymentmock = new PaymentGatewayMock()
    const billrepomock = new BillRepoMock()
    const ticketDomain = new TicketDomain(redismock, msgbrokermock, airlinemock, paymentmock, billrepomock)

    const input = {
      flightId: 1,
      travelerId: 1,
      ticketNo: 'e0114ce3-67d3-46d0-a736-d165fb1d4f52',
      ticketPrice: 2500,
      paymentNo: '8d95f73d-1fc3-430f-8c84-84926a9b7443',
    }

    const twoDaysLater = new Date()
    twoDaysLater.setDate(twoDaysLater.getDate() + 2)

    const mockdata = {
      flight: {
        id: 1,
        capacity: 80,
        base_price: 1000,
        route_id: 1,
        departure_time: twoDaysLater.toISOString(),
      },
      getAndDelLockedTicketPrice: null,
      billExists: true,
      refund: {
        status: 'success',
        refundNo: '32ca8751-9421-416f-b725-d8fb04f920d5',
      },
      publishCompensateTicket: null,
      publishUpdateFlight: null,
      publishUpdateBill: null,
      publishUpdateTicket: null,
      flush: null,
    }

    redismock.setData([mockdata.getAndDelLockedTicketPrice, mockdata.flight])
    billrepomock.setData([mockdata.billExists])
    paymentmock.setData([mockdata.refund])
    msgbrokermock.setData([
      mockdata.flush,
      mockdata.publishUpdateTicket,
      mockdata.publishUpdateBill,
      mockdata.publishUpdateFlight,
      mockdata.publishCompensateTicket,
    ])

    let actual
    it('should return a JSON object of CancelOrderResult', async () => {
      actual = await ticketDomain.cancelTicketOrder(
        input.flightId,
        input.travelerId,
        input.ticketNo,
        input.ticketPrice,
        input.paymentNo
      )

      console.log(actual)

      expect(actual).not.to.be.empty
      expect(actual).to.have.property('refundNo')
      expect(actual).to.have.property('paymentNo')
    })
  })
})
