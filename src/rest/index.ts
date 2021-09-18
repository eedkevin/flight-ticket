import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { v4 as uuidv4 } from 'uuid'

import express from 'express'
import router from './router'

export function createExpressServer(path: string, env: string): express.Application {
  const app = express()

  app.use(`${path}/healthz`, (req, res) => {
    res.status(200).send('ok')
  })

  applyMiddleware(app, path, env)

  return app
}

export function applyMiddleware(server: express.Application, path: string, env: string) {
  server.use(path, (req, res, next) => {
    req.header['reqId'] = uuidv4()
    next()
  })

  if ('dev' === env) {
    server.use(path, morgan('combined'), router)
  }

  server.use(path, cors(), router)
  server.use(path, helmet(), router)
  server.use(express.json())
  server.use(express.urlencoded({ extended: true }))
}
