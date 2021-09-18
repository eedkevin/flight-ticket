// redis keys
export const REDIS_TICKET_POOL_PREFIX = 'ticket_pool:'
export const REDIS_TICKET_LOCK_PREFIX = 'ticket_lock:'
export const REDIS_CACHE_FLIGHTS_PREFIX = 'cache:flights:'
export const REDIS_CACHE_BILLS_PREFIX = 'cache:bills:'
export const REDIS_CACHE_AUTH_TOKEN_PREFIX = 'cache:auth_token:'

// redis bloom filter keys
export const REDIS_BLOOMFILTER_AUTH_TOKEN = 'bloomfilter:auth_token'

// event names
export const EVENT_DB_SAVE_BILL = 'db:save:bill'
export const EVENT_DB_UPDATE_BILL = 'db:update:bill'
export const EVENT_DB_UPDATE_TICKET = 'db:update:ticket'
export const EVENT_REDIS_COMPENSATE_TICKET_POOL = 'redis:compensate:ticket_pool'
export const EVENT_REDIS_UPDATE_FLIGHT_THUMBNAIL = 'redis:update:flight_thumbnail'

// graphql pub-sub names
export const GRAPHQL_PUBSUB_FLIGHT_THUMBNAIL_UPDATED = 'FLIGHT_SEAT_UPDATED'
