import { Sequelize } from 'sequelize-typescript'
import { WrappedNodeRedisClient } from 'handy-redis'
import { Client } from 'ts-nats'
import { RedisPubSub } from 'graphql-redis-subscriptions'

import sequelize from './sequelize'
import redis from './redis'
import { getNatsClient } from './nats'
import pubsub from './graphql_pubsub'
import messageBroker, { IMessageBroker } from './message_broker'
import bloomfilter, { IBloomFilter } from './bloomfilter'

export interface Facilities {
  sequelize: Sequelize
  redis: WrappedNodeRedisClient
  getNatsClient: () => Promise<Client>
  pubsub: RedisPubSub
  messageBroker: IMessageBroker
  bloomfilter: IBloomFilter
}

const facilities: Facilities = {
  sequelize,
  redis,
  getNatsClient,
  pubsub,
  messageBroker,
  bloomfilter,
}

export default facilities
export { sequelize, redis, getNatsClient, pubsub, messageBroker, bloomfilter }
