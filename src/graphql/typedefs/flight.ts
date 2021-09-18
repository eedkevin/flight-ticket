import { gql } from 'apollo-server-express'

export default gql`
  type FlightThumb {
    id: Int!
    capacity: Int
    remainSeats: Int
    currentPrice: Float
  }

  extend type Query {
    getFlightThumb(flightId: Int): FlightThumb
    listFlightThumbs: [FlightThumb]!
  }

  extend type Subscription {
    getFlightThumbInstant: FlightThumb
  }
`
