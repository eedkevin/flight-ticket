import { bookTicket, cancelTicket } from './util'

export class AirlineGatewayFailureError extends Error {}
export class AirlineBookTicketFailureError extends AirlineGatewayFailureError {}

export interface AirlineResponse {
  status: string
  ticketNo: string
  ref?: any
}

export interface IAirlineGateway {
  bookTicket(ticketNo: string, ref: any): Promise<AirlineResponse>
  cancelTicket(ticketNo: string, ref: any): Promise<AirlineResponse>
}

export class AirlineGateway implements IAirlineGateway {
  async bookTicket(ticketNo: string, ref: any): Promise<AirlineResponse> {
    const success = await bookTicket(ticketNo, ref)
    if (!success) {
      throw new AirlineBookTicketFailureError('airline#book_failed')
    } else {
      const resp: AirlineResponse = {
        status: 'success',
        ticketNo: ticketNo,
        ref: ref,
      }
      return resp
    }
  }

  async cancelTicket(ticketNo: string, ref: any): Promise<AirlineResponse> {
    const success = await cancelTicket(ticketNo, ref)
    if (!success) {
      throw new AirlineBookTicketFailureError('airline#book_failed')
    } else {
      const resp: AirlineResponse = {
        status: 'success',
        ticketNo: ticketNo,
        ref: ref,
      }
      return resp
    }
  }
}
