import { IResolvers } from 'apollo-server-express'

import domains from '../../domains'
import { pubsub } from '../../facilities'
import { FlightThumb } from '../../types'

import { GRAPHQL_PUBSUB_FLIGHT_THUMBNAIL_UPDATED } from '../../constants'

const { flightDomain } = domains

const resolver: IResolvers = {
  Query: {
    getFlightThumb: async (_, args, context): Promise<FlightThumb | null> => {
      const { flightId } = args
      return await flightDomain.getFlightThumb(Number(flightId))
    },
    listFlightThumbs: async (_, args, context): Promise<FlightThumb[]> => {
      return await flightDomain.listFlightThumbs()
    },
  },
  Subscription: {
    getFlightThumbInstant: {
      subscribe: () => {
        return pubsub.asyncIterator([GRAPHQL_PUBSUB_FLIGHT_THUMBNAIL_UPDATED])
      },
    },
  },
}

export default resolver
