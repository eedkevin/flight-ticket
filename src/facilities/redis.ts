import { createNodeRedisClient } from 'handy-redis'

import { redis as config } from '../configs'
import IORedis from 'ioredis'

const client = createNodeRedisClient({
  url: config.connUrl,
  no_ready_check: config.noReadyCheck,
})

function createIORedisClient(): IORedis.Redis {
  return new IORedis(config.connUrl)
}

export default client
export { createIORedisClient }
