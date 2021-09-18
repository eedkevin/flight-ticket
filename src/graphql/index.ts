import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { makeExecutableSchema } from '@graphql-tools/schema'

import resolvers from './resolvers'
import typeDefs from './typedefs'

async function createApolloServer(app: express.Application, path: string, env: string): Promise<ApolloServer> {
  const schema = makeExecutableSchema({ typeDefs, resolvers })

  const apolloServer = new ApolloServer({
    schema,
    subscriptions: {
      path: `${path}/subscriptions`,
    },
    formatError: (error: Error) => {
      // remove the internal sequelize error message
      // leave only the important validation error
      const message = error.message.replace('SequelizeValidationError: ', '').replace('Validation error: ', '')
      return 'prod' === env ? { message } : { ...error, message }
    },
  })

  await apolloServer.start()
  apolloServer.applyMiddleware({ app, path })
  return apolloServer
}

export { createApolloServer }
