import 'dotenv/config'

import faker from 'faker'
import * as _ from 'lodash'

import {
  REDIS_TICKET_LOCK_PREFIX,
  REDIS_TICKET_POOL_PREFIX,
  REDIS_CACHE_FLIGHTS_PREFIX,
  REDIS_BLOOMFILTER_AUTH_TOKEN,
  REDIS_CACHE_AUTH_TOKEN_PREFIX,
} from '../src/constants'
import { sequelize, redis, bloomfilter } from '../src/facilities'
import { logger, redisKey } from '../src/utils'

const airports: Array<any> = []
const routes: Array<any> = []
const flights: Array<any> = []
const travelers: Array<any> = []
const tickets: Array<any> = []
const authTokens: Array<any> = [
  { traveler_id: 1, token: 'abc' },
  { traveler_id: 1, token: '123' },
]

const now = new Date()
const twoDaysLater = new Date(now.getTime())
twoDaysLater.setDate(twoDaysLater.getDate() + 2)

for (let i = 10000; i > 0; i--) {
  const traveler = {
    id: i,
    name: `${faker.name.firstName()} ${faker.name.lastName()}`,
  }
  travelers.push(traveler)
}

for (let i = 1000; i > 0; i--) {
  const airport = {
    id: i,
    name: faker.address.city(),
  }
  airports.push(airport)
}

for (let i = 200; i > 0; i--) {
  const route = {
    id: i,
    airports: [_.random(1, 1000), _.random(1, 1000)],
  }

  const flight = {
    id: i,
    capacity: _.random(20, 80),
    route_id: route.id,
    departure_time: faker.datatype.datetime({ min: now.getTime(), max: twoDaysLater.getTime() }),
    base_price: _.random(100, 5000),
  }

  for (let j = flight.capacity; j > 0; j--) {
    const ticket = {
      ticket_no: faker.datatype.uuid(),
      flight_id: flight.id,
    }
    tickets.push(ticket)
  }

  flights.push(flight)
  routes.push(route)
}

const flight_for_stress_test = {
  id: 999,
  capacity: 100000,
  route_id: 1,
  departure_time: faker.datatype.datetime({ min: now.getTime(), max: twoDaysLater.getTime() }),
  base_price: _.random(100, 5000),
}

const tickets_for_stress_test: Array<any> = []
for (let i = flight_for_stress_test.capacity; i > 0; i--) {
  const ticket = {
    ticket_no: faker.datatype.uuid(),
    flight_id: flight_for_stress_test.id,
  }
  tickets_for_stress_test.push(ticket)
}

async function seedDB() {
  await sequelize.authenticate()
  await sequelize.sync({ force: true })
  logger.info(`database schema sync finished`)

  await sequelize.models.Airport.bulkCreate(airports)
  await sequelize.models.Route.bulkCreate(routes)
  await sequelize.models.Flight.bulkCreate(flights)
  await sequelize.models.Traveler.bulkCreate(travelers)
  await sequelize.models.Ticket.bulkCreate(tickets)
  logger.info(`database seed completed`)
}

async function seedRedisForCoreFlows() {
  await redis.flushall()

  flights.forEach(async (f) => {
    await redis.set(`${REDIS_CACHE_FLIGHTS_PREFIX}${f.id}`, JSON.stringify(f))
  })

  tickets.forEach(async (t) => {
    await redis.lpush(`${REDIS_TICKET_POOL_PREFIX}${t.flight_id}`, `${t.ticket_no}`)
  })

  await redis.set(`${REDIS_TICKET_LOCK_PREFIX}{flight_id}_{traveler_id}_{ticket_no}`, '{ticket_price}')

  authTokens.forEach(async (t) => {
    await bloomfilter.add(REDIS_BLOOMFILTER_AUTH_TOKEN, t.token)
    await redis.set(redisKey.authToken(t.token), t.traveler_id)
  })

  logger.info(`redis seed completed`)
}

async function seedRedisForStressTest() {
  await redis.set(`${REDIS_CACHE_FLIGHTS_PREFIX}${flight_for_stress_test.id}`, JSON.stringify(flight_for_stress_test))

  tickets_for_stress_test.forEach(async (t) => {
    await redis.lpush(`${REDIS_TICKET_POOL_PREFIX}${t.flight_id}`, `${t.ticket_no}`)
  })

  logger.info(`redis seed for stress test completed`)
}

async function seed() {
  try {
    await seedDB()
    await seedRedisForCoreFlows()
    await seedRedisForStressTest()
  } catch (err) {
    console.error(err)
    logger.error('error on seeding database/redis', err)
  } finally {
    process.exit(0)
  }
}

seed()
