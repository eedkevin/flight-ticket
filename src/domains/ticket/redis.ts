import { redis } from '../../facilities'
import { app as config } from '../../configs'
import { Flight, Bill } from '../../types'
import { redisKey } from '../../utils'

export interface IRedisTicket {
  lockOneTicket(flightId: number, travelerId: number, ticketPrice: string): Promise<string>
  ticketExists(flightId: number, travelerId: number, ticketNo: string): Promise<boolean>
  getLockedTicketPrice(flightId: number, travelerId: number, ticketNo: string): Promise<string | null>
  getNumOfRemainSeats(flightId: number): Promise<number>
  getAndDelLockedTicketPrice(flightId: number, travelerId: number, ticketNo: string): Promise<string | null>
  delLockedTicket(flightId: number, travelerId: number, ticketNo: string): Promise<boolean>
  getFlight(flightId: number): Promise<Flight | null>
  getBill(paymentNo: string): Promise<Bill | null>
}

async function lockOneTicket(flightId: number, travelerId: number, ticketPrice: string): Promise<string> {
  const poolKey = redisKey.ticketPool(flightId)
  const ticketNo = await redis.rpop(poolKey)
  if (ticketNo == null) {
    throw new Error()
  }
  const lockKey = redisKey.ticketLock(flightId, travelerId, ticketNo)
  await redis.setex(lockKey, config.ticketLockExpireSec, ticketPrice)
  return ticketNo
}

async function ticketExists(flightId: number, travelerId: number, ticketNo: string): Promise<boolean> {
  const key = redisKey.ticketLock(flightId, travelerId, ticketNo)
  return 0 === (await redis.exists(key)) ? false : true
}

async function getLockedTicketPrice(flightId: number, travelerId: number, ticketNo: string): Promise<string | null> {
  const key = redisKey.ticketLock(flightId, travelerId, ticketNo)
  return await redis.get(key)
}

async function getNumOfRemainSeats(flightId: number): Promise<number> {
  if (0 === (await redis.exists(redisKey.ticketPool(flightId)))) {
    // key doesn't exist
    return 0
  } else {
    return await redis.llen(redisKey.ticketPool(flightId))
  }
}

async function getAndDelLockedTicketPrice(
  flightId: number,
  travelerId: number,
  ticketNo: string
): Promise<string | null> {
  const key = redisKey.ticketLock(flightId, travelerId, ticketNo)

  // handy-redis currently doesn't support atomic redis.getdel command
  // TODO: to switch to a more completed redis client library
  const [ticket, _] = await redis.multi().get(key).del(key).exec_atomic()
  return ticket ? ticket.toString() : null
}

async function delLockedTicket(flightId: number, travelerId: number, ticketNo: string): Promise<boolean> {
  const key = redisKey.ticketLock(flightId, travelerId, ticketNo)
  return 0 === (await redis.del(key)) ? false : true
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

async function getBill(paymentNo: string): Promise<Bill | null> {
  const key = redisKey.bill(paymentNo)
  const bill_str = await redis.get(key)
  if (bill_str) {
    const bill: Bill = JSON.parse(bill_str)
    return bill
  } else {
    return null
  }
}

const redisLock: IRedisTicket = {
  lockOneTicket,
  ticketExists,
  getLockedTicketPrice,
  getNumOfRemainSeats,
  getAndDelLockedTicketPrice,
  delLockedTicket,
  getFlight,
  getBill,
}

export default redisLock
