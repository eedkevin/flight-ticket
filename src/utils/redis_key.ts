import {
  REDIS_TICKET_LOCK_PREFIX,
  REDIS_TICKET_POOL_PREFIX,
  REDIS_CACHE_FLIGHTS_PREFIX,
  REDIS_CACHE_BILLS_PREFIX,
  REDIS_BLOOMFILTER_AUTH_TOKEN,
  REDIS_CACHE_AUTH_TOKEN_PREFIX,
} from '../constants'

function ticketPool(flightId: number): string {
  return `${REDIS_TICKET_POOL_PREFIX}${flightId}`
}

function ticketLock(flightId: number, travelerId: number, ticketNo: string): string {
  return `${REDIS_TICKET_LOCK_PREFIX}${flightId}_${travelerId}_${ticketNo || '{ticket_no}'}`
}

function flight(flightId: number): string {
  return `${REDIS_CACHE_FLIGHTS_PREFIX}${flightId}`
}

function ticketPoolWildcard(): string {
  return `${REDIS_TICKET_POOL_PREFIX}*`
}

function flightCacheWildcard(): string {
  return `${REDIS_CACHE_FLIGHTS_PREFIX}*`
}

function bill(paymentNo: string): string {
  return `${REDIS_CACHE_BILLS_PREFIX}${paymentNo}`
}

function bloomFilterAuthToken(): string {
  return REDIS_BLOOMFILTER_AUTH_TOKEN
}

function authToken(token: string): string {
  return `${REDIS_CACHE_AUTH_TOKEN_PREFIX}${token}`
}

export const redisKey = {
  ticketPool,
  ticketLock,
  flight,
  ticketPoolWildcard,
  flightCacheWildcard,
  bill,
  bloomFilterAuthToken,
  authToken,
}
