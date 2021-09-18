import {
  IPaymentGateway,
  IAirlineGateway,
  PaymentPayResponse,
  PaymentRefundResponse,
  AirlineResponse,
} from '../../../../src/external/api'

import { MockBase } from '../../support'

export class PaymentGatewayMock extends MockBase implements IPaymentGateway {
  pay(amount: number, ref: any): Promise<PaymentPayResponse> {
    return super.mock()
  }

  refund(paymentNo: string, ref: any): Promise<PaymentRefundResponse> {
    return super.mock()
  }
}

export class AirlineGatewayMock extends MockBase implements IAirlineGateway {
  bookTicket(ticketNo: string, ref: any): Promise<AirlineResponse> {
    return super.mock()
  }

  cancelTicket(ticketNo: string, ref: any): Promise<AirlineResponse> {
    return super.mock()
  }
}
