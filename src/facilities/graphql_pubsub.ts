import { RedisPubSub } from 'graphql-redis-subscriptions'

import { createIORedisClient } from './redis'

const pubsub = new RedisPubSub({
  publisher: createIORedisClient(),
  subscriber: createIORedisClient(),
})

export default pubsub
