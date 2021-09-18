import * as _ from 'lodash'

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, _.random(250, 3000)))
}

function succeed(posibility: number): boolean {
  return _.random(0, 99) < posibility * 100
}

async function callAPI(posibility: number): Promise<boolean> {
  await delay()
  return succeed(posibility) ? true : false
}

export async function pay(amount: number, ref: any): Promise<boolean> {
  return await callAPI(0.9)
}

export async function refund(paymentNo: string, ref: any): Promise<boolean> {
  return await callAPI(0.9)
}

export async function bookTicket(ticketNo: string, ref: any): Promise<boolean> {
  return await callAPI(0.8)
}

export async function cancelTicket(ticketNo: string, ref: any): Promise<boolean> {
  return await callAPI(0.8)
}

const util = {
  delay,
  pay,
  refund,
  bookTicket,
  cancelTicket,
}

export default util
