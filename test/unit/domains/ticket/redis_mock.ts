import { Flight, Bill } from '../../../../src/types'
import { IRedisTicket } from '../../../../src/domains/ticket'

import { MockBase } from '../../support'

export class RedisTicketMock extends MockBase implements IRedisTicket {
  lockOneTicket(flightId: number, travelerId: number, ticketPrice: string): Promise<string> {
    return super.mock()
  }

  ticketExists(flightId: number, travelerId: number, ticketNo: string): Promise<boolean> {
    return super.mock()
  }

  getLockedTicketPrice(flightId: number, travelerId: number, ticketNo: string): Promise<string | null> {
    return super.mock()
  }

  getNumOfRemainSeats(flightId: number): Promise<number> {
    return super.mock()
  }

  getAndDelLockedTicketPrice(flightId: number, travelerId: number, ticketNo: string): Promise<string | null> {
    return super.mock()
  }

  delLockedTicket(flightId: number, travelerId: number, ticketNo: string): Promise<boolean> {
    return super.mock()
  }

  getFlight(flightId: number): Promise<Flight | null> {
    return super.mock()
  }

  getBill(paymentNo: string): Promise<Bill | null> {
    return super.mock()
  }
}
