import { IRedisAccount } from './redis'

export interface IAccountDomain {
  auth(authToken: string): Promise<boolean>
}

export class AccountDomain implements IAccountDomain {
  redis: IRedisAccount

  constructor(redis: IRedisAccount) {
    this.redis = redis
  }

  async auth(authToken: string): Promise<boolean> {
    if (!(await this.redis.bloomfilterCheck(authToken))) {
      return false
    } else {
      return await this.redis.authTokenExists(authToken)
    }
  }
}
