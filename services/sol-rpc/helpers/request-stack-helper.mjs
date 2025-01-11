import { promisify } from 'util'

const sleep = promisify(setTimeout)

export class RequestStackHelper {
  constructor(interval = 5000, maxRetries = 50, retryDelay = 5000) {
    this.stack = [];         // Queue of requests
    this.interval = interval; // Time between requests
    this.isRunning = false;   // Indicates if the queue is being processed
    this.maxRetries = maxRetries; // Max number of retries for a failed request
    this.retryDelay = retryDelay; // Delay before retrying a failed request
  }

  addRequest(requestFunction) {
    if (typeof requestFunction !== 'function') {
      throw new Error('Request must be a function that returns a Promise!')
    }

    return new Promise((resolve, reject) => {
      this.stack.push(async () => {
        try {
          const result = await this._executeWithRetry(requestFunction)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      this._processStack()
    })
  }

  async _processStack() {
    if (this.isRunning) return

    this.isRunning = true

    while (this.stack.length > 0) {
      const requestFunction = this.stack.shift()
      try {
        await requestFunction()
      } catch (error) {
        console.error('Request failed:', error)
      }
      await sleep(this.interval)
    }

    this.isRunning = false
  }

  // Execute a request with retries on failure
  async _executeWithRetry(requestFunction) {
    let attempt = 0

    while (attempt <= this.maxRetries) {
      try {
        return await requestFunction()
      } catch (error) {
        if (error?.response?.status === 429 || error?.message?.includes('429') ) {
          console.warn(`Attempt ${ attempt + 1 } failed with 429. Retrying in ${ this.retryDelay * (attempt + 1)} ms...`)
          await sleep(this.retryDelay * (attempt + 1))
          attempt++
        } else {
          throw error // If it's not a 429 error, throw it
        }
      }
    }

    throw new Error(`Request failed after ${ this.maxRetries } retries.`)
  }
}
