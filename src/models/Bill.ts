import { Table, Column, Model, DataType, Default, Unique, AllowNull } from 'sequelize-typescript'

@Table({
  tableName: 'bill',
  timestamps: true,
})
class Bill extends Model {
  @Column({ type: DataType.BIGINT })
  traveler_id: number

  @Column({ type: DataType.STRING })
  ticket_no: string

  @Column({ type: DataType.BIGINT })
  flight_id: number

  @Unique
  @Column({ type: DataType.STRING })
  payment_no: string

  @AllowNull
  @Default(null)
  @Column({ type: DataType.STRING })
  refund_no: string

  @Column({ type: DataType.FLOAT })
  amount: number

  @Default('unpaid')
  @Column({ type: DataType.ENUM('unpaid', 'paid', 'refunded') })
  status: string

  @Default(DataType.NOW)
  @Column({ type: DataType.DATE })
  paid_at: Date

  @AllowNull
  @Default(null)
  @Column({ type: DataType.DATE })
  refund_at: Date
}

export default Bill
