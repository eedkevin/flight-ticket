import winston = require('winston')

const logger: winston.Logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss Z',
    }),
    winston.format.printf((info) => `${info.timestamp} [${info.level}] ${info.message}`)
  ),
  transports: [new winston.transports.Console()],
})

export { logger }
