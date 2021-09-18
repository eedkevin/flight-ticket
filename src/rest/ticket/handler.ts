import * as express from 'express'
import { StatusCodes } from 'http-status-codes'

import domains from '../../domains'
import { errors } from '../../domains/ticket'
import { logger, genRespBody } from '../../utils'
import { systemCodes as codes } from '../../constants'

const { ticketDomain } = domains

const createTicketOrder: express.RequestHandler = async function (req, res) {
  try {
    const { flight_id, traveler_id } = req.query
    const result = await ticketDomain.createTicketOrder(Number(flight_id), Number(traveler_id))
    const resp = genRespBody(codes.General.OK, result)
    return res.status(StatusCodes.OK).json(resp)
  } catch (e) {
    if (e instanceof errors.FlightFullyOccupiedError) {
      return res.status(StatusCodes.BAD_REQUEST).json(genRespBody(codes.Domain.FlightFullyOccupied))
    } else {
      logger.error(e)
      console.error(e)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(genRespBody(codes.General.ServerError))
    }
  }
}

const payTicketOrder: express.RequestHandler = async function (req, res) {
  try {
    const { flight_id, traveler_id, ticket_no } = req.query
    const result = await ticketDomain.payTicketOrder(Number(flight_id), Number(traveler_id), String(ticket_no))
    const resp = genRespBody(codes.General.OK, result)
    return res.status(StatusCodes.OK).json(resp)
  } catch (e) {
    if (e instanceof errors.TicketLockExpireError) {
      return res.status(StatusCodes.BAD_REQUEST).json(genRespBody(codes.Domain.TicketLockExpired))
    } else if (e instanceof errors.PaymentGatewayFailureError) {
      return res.status(StatusCodes.BAD_REQUEST).json(genRespBody(codes.Domain.PaymentGatewayFailed))
    } else {
      logger.error(e)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(genRespBody(codes.General.ServerError))
    }
  }
}

const cancelTicketOrder: express.RequestHandler = async function (req, res) {
  try {
    const { flight_id, payment_no, traveler_id, ticket_no, ticket_price } = req.query
    const result = await ticketDomain.cancelTicketOrder(
      Number(flight_id),
      Number(traveler_id),
      String(ticket_no),
      Number(ticket_price),
      String(payment_no)
    )
    const resp = genRespBody(codes.General.OK, result)
    return res.status(StatusCodes.OK).json(resp)
  } catch (e) {
    if (e instanceof errors.FlightNotExistsError) {
      return res.status(StatusCodes.BAD_REQUEST).json(genRespBody(codes.Domain.FlightNotExists))
    } else if (e instanceof errors.TicketNotCancellableError) {
      return res.status(StatusCodes.BAD_REQUEST).json(genRespBody(codes.Domain.TicketNotCancellable))
    } else if (e instanceof errors.PaymentGatewayFailureError) {
      return res.status(StatusCodes.BAD_REQUEST).json(genRespBody(codes.Domain.PaymentGatewayFailed))
    } else if (e instanceof errors.TicketNotExistsError) {
      return res.status(StatusCodes.BAD_REQUEST).json(genRespBody(codes.Domain.TicketNotExists))
    } else if (e instanceof errors.BillNotExistsError) {
      return res.status(StatusCodes.BAD_REQUEST).json(genRespBody(codes.Domain.BillNotExists))
    } else {
      logger.error(e)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(genRespBody(codes.General.ServerError))
    }
  }
}

const handler = {
  createTicketOrder,
  payTicketOrder,
  cancelTicketOrder,
}

export default handler
