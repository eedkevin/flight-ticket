import { RedisBloom } from 'redis-modules-sdk'
import IORedis from 'ioredis'
import { createIORedisClient } from './redis'

export interface IBloomFilter {
  add(key: string, item: string): Promise<boolean>
  exists(key: string, item: string): Promise<boolean>
}

// a wordaround to use an existing redis client
const opt: IORedis.RedisOptions = { host: '', port: 0 }
const client = new RedisBloom(opt)
client.redis = createIORedisClient()

async function add(key: string, item: string): Promise<boolean> {
  return '0' === (await client.add(key, item)) ? false : true
}

async function exists(key: string, item: string): Promise<boolean> {
  return '0' === (await client.exists(key, item)) ? false : true
}

const filter: IBloomFilter = {
  add,
  exists,
}

export default filter
