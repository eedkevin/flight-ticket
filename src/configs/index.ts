export interface IAppConfig {
  ticketLockExpireSec: number
  ticketAllowCancelHour: number
}

export interface IRedisConfig {
  connUrl: string
  noReadyCheck: boolean
}

export interface IDatabasePoolConfig {
  max: number
  min: number
  idle: number
}

export interface IDatabaseConfig {
  dialect: string
  connUrl: string
  pool: IDatabasePoolConfig
}

export interface INatsConfig {
  connUrl: string
}

export interface IConfig {
  env: string
  app: IAppConfig
  redis: IRedisConfig
  database: IDatabaseConfig
  nats: INatsConfig
}

const env: string = String(process.env.NODE_ENV) || 'dev'

const app: IAppConfig = {
  ticketLockExpireSec: Number(process.env.APP_TICKET_LOCK_EXPIRE_SEC) || 180,
  ticketAllowCancelHour: Number(process.env.APP_TICKET_ALLOW_CANCEL_HOUR) || 2,
}

const redis: IRedisConfig = {
  connUrl: String(process.env.REDIS_CONNECTION_URL),
  noReadyCheck: Boolean(process.env.REDIS_NO_READY_CHECK) || true,
}

const database: IDatabaseConfig = {
  dialect: String(process.env.DATABASE_DIALECT),
  connUrl: String(process.env.DATABASE_CONNECTION_URL),
  pool: {
    max: Number(process.env.DATABASE_POOL_MAX) || 5,
    min: Number(process.env.DATABASE_POOL_MIN) || 1,
    idle: Number(process.env.DATABASE_POOL_IDLE) || 0,
  },
}

const nats: INatsConfig = {
  connUrl: String(process.env.NATS_CONNECTION_URL),
}

const config: IConfig = {
  env,
  app,
  redis,
  database,
  nats,
}

export default config
export { env, app, redis, database, nats }
