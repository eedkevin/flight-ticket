enum General {
  OK = 200,
  Fail = 400,
  Unauthorized = 401,
  ServerError = 500,
}

enum Domain {
  FlightFullyOccupied = 40001,
  TicketLockExpired = 40002,
  PaymentGatewayFailed = 40003,
  TicketNotCancellable = 40004,
  TicketNotExists = 40005,
  BillNotExists = 40006,
  FlightNotExists = 40007,
}

export function getStatus(code: number) {
  switch (code) {
    case General.OK:
      return 'success'
    default:
      return 'fail'
  }
}

export function getMsg(code: number) {
  switch (code) {
    case General.Unauthorized:
      return 'unauthorized'
    case General.ServerError:
      return 'server_error'
    case Domain.FlightFullyOccupied:
      return 'flight_fully_occupied'
    case Domain.TicketLockExpired:
      return 'ticket_lock_expired'
    case Domain.PaymentGatewayFailed:
      return 'payment_gateway_failed'
    case Domain.TicketNotCancellable:
      return 'ticket_not_cancellable'
    case Domain.TicketNotExists:
      return 'ticket_not_exists'
    case Domain.BillNotExists:
      return 'bill_not_exists'
    case Domain.FlightNotExists:
      return 'flight_not_exists'
    case General.OK:
    case General.Fail:
    default:
      return ''
  }
}

const systemCodes = {
  General,
  Domain,
}

export { systemCodes }
