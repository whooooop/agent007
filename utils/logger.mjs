import chalk from 'chalk'

export const levels = {
  log: 'log',
  error: 'error',
  debug: 'debug'
}

export class Logger {
  constructor(context) {
    this.context = context
  }

  // static setOptions (options) {}

  log() {
    const currentDate = new Date()
    const formattedTime = currentDate.toLocaleTimeString()
    const args = [chalk.gray(formattedTime), chalk.blue('[LOG]'), chalk.yellow(this.context), ...arguments]
    console.log.apply(console, args)
  }

  error() {
    const currentDate = new Date()
    const formattedTime = currentDate.toLocaleTimeString()
    const args = [chalk.gray(formattedTime), chalk.red('[ERROR]'), chalk.yellow(this.context), ...arguments]
    console.log.apply(console, args)
  }

  debug() {
    const currentDate = new Date()
    const formattedTime = currentDate.toLocaleTimeString()
    const args = [chalk.gray(formattedTime), chalk.magenta('[DEBUG]'), chalk.yellow(this.context), ...arguments]
    console.log.apply(console, args)
  }
}
