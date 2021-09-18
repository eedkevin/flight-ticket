import { Table, Column, Model, DataType } from 'sequelize-typescript'

@Table({
  tableName: 'traveler',
  timestamps: true,
})
class Traveler extends Model {
  @Column({ type: DataType.STRING })
  name: string
}

export default Traveler
