/**
 * Simple Logger Utility
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private isDev = process.env.NODE_ENV === 'development'

  private log(level: LogLevel, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`

    if (this.isDev || level === 'error' || level === 'warn') {
      console[level === 'debug' ? 'log' : level](`${prefix} ${message}`, ...args)
    }
  }

  debug(message: string, ...args: any[]) {
    this.log('debug', message, ...args)
  }

  info(message: string, ...args: any[]) {
    this.log('info', message, ...args)
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args)
  }

  error(message: string, error?: Error | unknown, ...args: any[]) {
    if (error instanceof Error) {
      this.log('error', message, error.message, error.stack, ...args)
    } else {
      this.log('error', message, error, ...args)
    }
  }
}

export const logger = new Logger()
export default logger
