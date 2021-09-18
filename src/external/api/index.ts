import { PaymentGateway } from './Payment'
import { AirlineGateway } from './Airline'

export default {
  payment: new PaymentGateway(),
  airline: new AirlineGateway(),
}

export { IPaymentGateway, PaymentResponse, PaymentPayResponse, PaymentRefundResponse } from './Payment'
export { IAirlineGateway, AirlineResponse } from './Airline'
