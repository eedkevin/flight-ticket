import { pay, refund } from './util'
import { v4 as uuidv4 } from 'uuid'

export class PaymentGatewayFailureError extends Error {}
export class PaymentPayFailureError extends PaymentGatewayFailureError {}
export class PaymentRefundFailureError extends PaymentGatewayFailureError {}

export interface PaymentResponse {
  status: string
  ref?: any
}

export interface PaymentPayResponse extends PaymentResponse {
  paymentNo: string
}

export interface PaymentRefundResponse extends PaymentResponse {
  refundNo: string
}

export interface IPaymentGateway {
  pay(amount: number, ref: any): Promise<PaymentPayResponse>
  refund(paymentNo: string, ref: any): Promise<PaymentRefundResponse>
}

export class PaymentGateway implements IPaymentGateway {
  async pay(amount: number, ref: any): Promise<PaymentPayResponse> {
    const success = await pay(amount, ref)
    if (!success) {
      throw new PaymentPayFailureError('payment#pay_failed')
    } else {
      const resp: PaymentPayResponse = {
        status: 'success',
        paymentNo: uuidv4(),
        ref: ref,
      }
      return resp
    }
  }

  async refund(paymentNo: string, ref: any): Promise<PaymentRefundResponse> {
    const success = await refund(paymentNo, ref)
    if (!success) {
      throw new PaymentRefundFailureError('payment#refund_failed')
    } else {
      const resp: PaymentRefundResponse = {
        status: 'success',
        refundNo: uuidv4(),
        ref: ref,
      }
      return resp
    }
  }
}
