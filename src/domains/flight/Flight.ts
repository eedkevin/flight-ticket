import { FlightThumb } from '../../types'
import { IRedisFlight } from './redis'
import { price } from '../../utils'

export interface IFlightDomain {
  listFlightThumbs(): Promise<FlightThumb[]>
  getFlightThumb(flightId: number): Promise<FlightThumb | null>
}

export class FlightDomain implements IFlightDomain {
  redis: IRedisFlight

  constructor(redis: IRedisFlight) {
    this.redis = redis
  }

  async listFlightThumbs(): Promise<FlightThumb[]> {
    const ticketPool = await this.redis.listTicketPool()
    const flights = await this.redis.listFlights()

    const FlightThumbs: FlightThumb[] = []
    for (let i = flights.length - 1; i >= 0; i--) {
      const f = flights[i]
      const numOfRemainSeats = ticketPool[f.id]
      FlightThumbs.push({
        id: f.id,
        capacity: f.capacity,
        remainSeats: numOfRemainSeats,
        currentPrice: price.calc(f.base_price, f.capacity, f.capacity - numOfRemainSeats),
      })
    }
    return FlightThumbs
  }

  async getFlightThumb(flightId: number): Promise<FlightThumb | null> {
    const flight = await this.redis.getFlight(flightId)
    if (!flight) {
      return null
    } else {
      const numOfRemainSeats = await this.redis.getNumOfRemainSeats(flightId)
      const FlightThumb: FlightThumb = {
        id: flight.id,
        capacity: flight.capacity,
        remainSeats: numOfRemainSeats,
        currentPrice: price.calc(flight.base_price, flight.capacity, flight.capacity - numOfRemainSeats),
      }
      return FlightThumb
    }
  }
}
