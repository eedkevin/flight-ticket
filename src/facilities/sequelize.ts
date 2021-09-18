import { Sequelize } from 'sequelize-typescript'
import { database as config } from '../configs'

import models from '../models'

const sequelize = new Sequelize(config.connUrl, {
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    idle: config.pool.idle,
  },
  models: [...models],
})

export default sequelize
