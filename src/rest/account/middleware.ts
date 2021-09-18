import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { systemCodes as code } from '../../constants'
import { genRespBody } from '../../utils'

import domains from '../../domains'
const { accountDomain } = domains

async function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const bearer = req.headers.authorization
    if (!bearer || -1 === bearer.indexOf('Bearer ')) {
      return res.status(StatusCodes.UNAUTHORIZED).json(genRespBody(code.General.Unauthorized))
    } else {
      const token = bearer?.split('Bearer ')[1]
      if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(genRespBody(code.General.Unauthorized))
      } else {
        const ok = await accountDomain.auth(token)
        if (!ok) {
          return res.status(StatusCodes.UNAUTHORIZED).json(genRespBody(code.General.Unauthorized))
        } else {
          return next()
        }
      }
    }
  } catch (e) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(genRespBody(code.General.ServerError))
  }
}

export { authMiddleware }
