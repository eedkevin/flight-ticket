import { Flight } from '../../../../src/types'
import { IRedisFlight, TicketPoolForCalc } from '../../../../src/domains/flight'

import { MockBase } from '../../support'

export class RedisFlightMock extends MockBase implements IRedisFlight {
  listTicketPool(): Promise<TicketPoolForCalc> {
    return super.mock()
  }

  listFlights(): Promise<Flight[]> {
    return super.mock()
  }

  getFlight(flightId: number): Promise<Flight | null> {
    return super.mock()
  }

  getNumOfRemainSeats(flightId: number): Promise<number> {
    return super.mock()
  }
}
