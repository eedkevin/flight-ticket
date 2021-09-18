import { connect, NatsConnectionOptions, Payload, Client } from 'ts-nats'

import { logger } from '../utils'
import { nats as config } from '../configs'

let nats: Client | undefined = undefined

const opts: NatsConnectionOptions = {
  url: config.connUrl,
  payload: Payload.JSON,
}

async function getNatsClient(): Promise<Client> {
  if (nats) {
    return nats
  } else {
    nats = await connect(opts)
    nats.on('permissionError', (err) => {
      console.error(err)
      logger.error(err)
    })
    return nats
  }
}

export { getNatsClient }
