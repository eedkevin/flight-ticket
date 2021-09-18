import { gql } from 'apollo-server-express'
import flightSchema from './flight'

const linkSchema = gql`
  type Query {
    _: Boolean

    "A simple type for getting started!"
    healthz: String
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`

export default [linkSchema, flightSchema]
