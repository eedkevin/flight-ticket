import { MockBase } from '../../support'

import { IBillRepo } from '../../../../src/domains/ticket'
export class BillRepoMock extends MockBase implements IBillRepo {
  billExists(paymentNo: string, flightId: number, travelerId: number, ticketNo: string): Promise<boolean> {
    return super.mock()
  }
}
