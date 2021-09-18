import { Table, Column, Model, DataType } from 'sequelize-typescript'

@Table({
  tableName: 'airport',
  timestamps: true,
})
class Airport extends Model {
  @Column({ type: DataType.STRING })
  name: string
}

export default Airport
