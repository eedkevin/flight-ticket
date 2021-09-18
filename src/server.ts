import 'dotenv/config'
import http from 'http'

import configs from './configs'
import { createExpressServer } from './rest'
import { createApolloServer } from './graphql'
import { logger } from './utils'

export async function createServer(): Promise<http.Server> {
  const app = createExpressServer('/api/rest', configs.env)
  const apollo = await createApolloServer(app, '/api/graphql', configs.env)

  const httpServer = http.createServer(app)
  apollo.installSubscriptionHandlers(httpServer)

  return httpServer
}

export async function runServer() {
  const httpServer = await createServer()

  const port = Number(process.env.PORT || 3000)
  const host = String(process.env.HOST || '0.0.0.0')
  httpServer.listen({ host, port }, () => {
    logger.info(`Server running on http://${host}:${port}/`)
  })
}

if (require.main === module) {
  runServer()
}
