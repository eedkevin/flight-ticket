import { getNatsClient } from './'
import { FlushCallback } from 'ts-nats'

export interface IMessageBroker {
  publish(event: string, data: any, flush?: boolean): Promise<void>
  subscribe(event: string, callback: (err: Error | null, data: any) => void): Promise<void>
  flush(callback?: FlushCallback): Promise<void>
}

async function publish(event: string, data: any, flush = true): Promise<void> {
  const nats = await getNatsClient()
  nats.publish(event, data)
  if (flush) await nats.flush()
}

async function subscribe(event: string, callback: (err: Error | null, data: any) => void): Promise<void> {
  const nats = await getNatsClient()
  await nats.subscribe(event, (err, msg) => {
    callback(err, msg)
  })
  await nats.flush()
}

async function flush(callback?: FlushCallback): Promise<void> {
  const nats = await getNatsClient()
  await nats.flush(callback)
}

const messageBroker: IMessageBroker = {
  publish,
  subscribe,
  flush,
}

export default messageBroker
