import flightResolver from './flight'

const customScalarResolver = {}
const indexResolver = {
  Query: {
    healthz: () => {
      return 'ok'
    },
  },
}

export default [indexResolver, customScalarResolver, flightResolver]
