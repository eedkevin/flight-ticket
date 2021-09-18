import { FlushCallback } from 'ts-nats'
import { IMessageBroker } from '../../../../src/facilities/message_broker'

import { MockBase } from '../../support'

export class MessageBrokerMock extends MockBase implements IMessageBroker {
  publish(event: string, data: any, flush = true): Promise<void> {
    return super.mock()
  }

  subscribe(event: string, callback: (err: Error | null, data: any) => void): Promise<void> {
    return super.mock()
  }

  flush(callback?: FlushCallback): Promise<void> {
    return super.mock()
  }
}
