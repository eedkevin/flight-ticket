import { Table, Column, Model, DataType } from 'sequelize-typescript'

@Table({
  tableName: 'route',
  timestamps: true,
})
class Route extends Model {
  @Column({ type: DataType.ARRAY(DataType.BIGINT) })
  airports: Array<number>
}

export default Route
