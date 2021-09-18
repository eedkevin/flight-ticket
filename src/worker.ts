import 'dotenv/config'

import { sequelize, redis, pubsub, messageBroker } from './facilities'
import { logger, redisKey } from './utils'
import domains from './domains'

import {
  EVENT_DB_SAVE_BILL,
  EVENT_DB_UPDATE_BILL,
  EVENT_DB_UPDATE_TICKET,
  EVENT_REDIS_COMPENSATE_TICKET_POOL,
  EVENT_REDIS_UPDATE_FLIGHT_THUMBNAIL,
  GRAPHQL_PUBSUB_FLIGHT_THUMBNAIL_UPDATED,
} from './constants'

async function main() {
  logger.info('worker started')

  // db save bill
  await messageBroker.subscribe(EVENT_DB_SAVE_BILL, async (err, msg) => {
    if (err) {
      console.error(err)
      logger.error(err)
    } else {
      logger.info(JSON.stringify(msg))
      const bill = msg.data
      await sequelize.models.Bill.create(bill)
    }
  })

  // db update bill
  await messageBroker.subscribe(EVENT_DB_UPDATE_BILL, async (err, msg) => {
    if (err) {
      console.error(err)
      logger.error(err)
    } else {
      logger.info(JSON.stringify(msg))
      const bill = msg.data
      await sequelize.models.Bill.update(bill, { where: { payment_no: bill.payment_no } })
    }
  })

  // db update ticket
  await messageBroker.subscribe(EVENT_DB_UPDATE_TICKET, async (err, msg) => {
    if (err) {
      console.error(err)
      logger.error(err)
    } else {
      logger.info(JSON.stringify(msg))
      const ticket = msg.data
      await sequelize.models.Ticket.update(ticket, { where: { ticket_no: ticket.ticket_no } })
    }
  })

  // redis compensate ticket_pool
  await messageBroker.subscribe(EVENT_REDIS_COMPENSATE_TICKET_POOL, async (err, msg) => {
    if (err) {
      console.error(err)
      logger.error(err)
    } else {
      logger.info(JSON.stringify(msg))
      const { flight_id, ticket_no } = msg.data
      await redis.lpush(redisKey.ticketPool(flight_id), ticket_no)
    }
  })

  // redis update flight thumbnail
  await messageBroker.subscribe(EVENT_REDIS_UPDATE_FLIGHT_THUMBNAIL, async (err, msg) => {
    if (err) {
      console.error(err)
      logger.error(err)
    } else {
      logger.info(JSON.stringify(msg))
      const { flight_id } = msg.data
      const flightThumb = await domains.flightDomain.getFlightThumb(flight_id)

      pubsub.publish(GRAPHQL_PUBSUB_FLIGHT_THUMBNAIL_UPDATED, {
        getFlightThumbInstant: flightThumb,
      })
    }
  })
}

main()
