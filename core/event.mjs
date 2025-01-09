export class AppEvents {
  constructor() {
    this.registry = {} // Stores event subscribers
    this.allowedEvents = new Set() // Set of registered events
    this.queue = [] // Event queue for sequential processing
    this.isProcessing = false // Flag to indicate if the queue is being processed
  }

  /**
   * Registers a new event in the system.
   * Only registered events can be emitted or subscribed to.
   * @param {string} eventName - The name of the event to register.
   */
  registerEvent(eventName) {
    if (!eventName || typeof eventName !== 'string') {
      throw new Error('Event name must be a non-empty string.')
    }
    if (this.allowedEvents.has(eventName)) {
      throw new Error('Event already registered.')
    }
    this.allowedEvents.add(eventName)
    if (!this.registry[eventName]) {
      this.registry[eventName] = []
    }
  }

  /**
   * Subscribes a handler function to a registered event.
   * @param {string} eventName - The name of the event to subscribe to.
   * @param {function} handler - The handler function to execute when the event is emitted.
   */
  on(eventName, handler) {
    if (!this.allowedEvents.has(eventName)) {
      throw new Error(`Event "${ eventName }" is not registered.`)
    }
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function.')
    }
    this.registry[eventName].push(handler)
  }

  /**
   * Emits a registered event and processes all its subscribers sequentially.
   * Returns a Promise that resolves when all subscribers have finished processing.
   * @param {string} eventName - The name of the event to emit.
   * @param {any} payload - The data to pass to the event handlers.
   * @returns {Promise} - Resolves when all handlers have completed processing.
   */
  emit(eventName, payload) {
    if (!this.allowedEvents.has(eventName)) {
      return Promise.reject(new Error(`Event "${ eventName }" is not registered.`))
    }

    return new Promise((resolve, reject) => {
      if (!this.registry[eventName] || this.registry[eventName].length === 0) {
        return resolve() // Resolve immediately if no subscribers
      }

      // Add the event to the queue
      this.queue.push({eventName, payload, resolve, reject})

      // Start processing the queue
      this._processQueue()
    })
  }

  /**
   * Processes the event queue sequentially.
   * Ensures that each event is handled one by one in the order they were emitted.
   */
  async _processQueue() {
    if (this.isProcessing) return // Avoid parallel processing
    this.isProcessing = true

    while (this.queue.length > 0) {
      const {eventName, payload, resolve, reject} = this.queue.shift()
      try {
        // Call each subscriber function for the event
        for (const handler of this.registry[eventName]) {
          await handler(payload)
        }
        resolve()
      } catch (error) {
        reject(error)
      }
    }

    this.isProcessing = false
  }
}
