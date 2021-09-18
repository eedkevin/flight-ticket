import { Table, Column, Model, DataType, Unique } from 'sequelize-typescript'

@Table({
  tableName: 'ticket',
  timestamps: true,
})
class Ticket extends Model {
  @Unique
  @Column({ type: DataType.STRING })
  ticket_no: string

  @Column({ type: DataType.FLOAT })
  price: number

  @Column({ type: DataType.BIGINT })
  traveler_id: number

  @Column({ type: DataType.BIGINT })
  flight_id: string
}

export default Ticket
