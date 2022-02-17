import winston from 'winston'

/**
 * The global logger instance.
 */
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info) => {
      const { timestamp, level, message } = info as { timestamp: string, level: string, message: string }
      return `${timestamp} ${level}: ${message}`
    })
  ),
  transports: [
    new winston.transports.Console()
  ]
})
