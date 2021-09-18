import { Sequelize } from 'sequelize-typescript'

export interface IBillRepo {
  billExists(paymentNo: string, flightId: number, travelerId: number, ticketNo: string): Promise<boolean>
}

export class BillRepo implements IBillRepo {
  db: Sequelize

  constructor(db: Sequelize) {
    this.db = db
  }

  async billExists(paymentNo: string, flightId: number, travelerId: number, ticketNo: string): Promise<boolean> {
    const bill = await this.db.models.Bill.findOne({
      where: { payment_no: paymentNo, flight_id: flightId, traveler_id: travelerId, ticket_no: ticketNo },
    })
    return bill ? true : false
  }
}
