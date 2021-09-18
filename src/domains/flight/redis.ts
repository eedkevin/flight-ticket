import { redis } from '../../facilities'
import { Flight } from '../../types'
import { redisKey } from '../../utils'
import { REDIS_TICKET_POOL_PREFIX } from '../../constants'

export interface TicketPoolForCalc {
  [propName: string]: number // flightId -> numOfRemainSeats
}

export interface IRedisFlight {
  listTicketPool(): Promise<TicketPoolForCalc>
  listFlights(): Promise<Flight[]>
  getFlight(flightId: number): Promise<Flight | null>
  getNumOfRemainSeats(flightId: number): Promise<number>
}

async function listTicketPool(): Promise<TicketPoolForCalc> {
  const keys = await redis.keys(redisKey.ticketPoolWildcard())

  const ticketPool: TicketPoolForCalc = {}
  for (let i = keys.length - 1; i >= 0; i--) {
    const k = keys[i]
    const numOfRemainTickets = await redis.llen(k)
    const flightId = k.split(REDIS_TICKET_POOL_PREFIX)[1]
    ticketPool[flightId] = numOfRemainTickets
  }
  return ticketPool
}

async function listFlights(): Promise<Flight[]> {
  const keys = await redis.keys(redisKey.flightCacheWildcard())
  const flight_arr = await redis.mget(...keys)

  const flights: Flight[] = []
  for (let i = flight_arr.length - 1; i >= 0; i--) {
    const str = flight_arr[i]
    if (str) {
      flights.push(JSON.parse(str))
    }
  }
  return flights
}

async function getFlight(flightId: number): Promise<Flight | null> {
  const key = redisKey.flight(flightId)
  const flight_str = await redis.get(key)
  if (flight_str) {
    const flight: Flight = JSON.parse(flight_str)
    return flight
  } else {
    return null
  }
}

async function getNumOfRemainSeats(flightId: number): Promise<number> {
  if (0 === (await redis.exists(redisKey.ticketPool(flightId)))) {
    // key doesn't exist
    return 0
  } else {
    return await redis.llen(redisKey.ticketPool(flightId))
  }
}

const redisCache: IRedisFlight = {
  listFlights,
  listTicketPool,
  getFlight,
  getNumOfRemainSeats,
}

export default redisCache
