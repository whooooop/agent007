export class Loop {
  intervalIndex = null
  interval = 30000
  processing = false

  constructor(interval, handler) {
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function.')
    }

    this.interval = interval
    this.handler = handler
  }

  run() {
    this.intervalIndex = setInterval(async () => {
      if (this.processing) return
      try {
        this.processing = true
        await this.handler()
      } finally {
        this.processing = false
      }
    }, this.interval)
  }
}
