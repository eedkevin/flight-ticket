import { redis, bloomfilter } from '../../facilities'
import { redisKey } from '../../utils'

export interface IRedisAccount {
  bloomfilterCheck(token: string): Promise<boolean>
  authTokenExists(token: string): Promise<boolean>
}

async function bloomfilterCheck(token: string): Promise<boolean> {
  const key = redisKey.bloomFilterAuthToken()
  return await bloomfilter.exists(key, token)
}

async function authTokenExists(token: string): Promise<boolean> {
  const key = redisKey.authToken(token)
  return 0 === (await redis.exists(key)) ? false : true
}

const redisAccount: IRedisAccount = {
  bloomfilterCheck,
  authTokenExists,
}

export default redisAccount
