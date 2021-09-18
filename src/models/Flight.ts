import { Table, Column, Model, DataType } from 'sequelize-typescript'

@Table({
  tableName: 'flight',
  timestamps: true,
})
class Flight extends Model {
  @Column({ type: DataType.INTEGER })
  capacity: number

  @Column({ type: DataType.BIGINT })
  route_id: number

  @Column({ type: DataType.DATE })
  departure_time: Date

  @Column({ type: DataType.INTEGER })
  base_price: number
}

export default Flight
