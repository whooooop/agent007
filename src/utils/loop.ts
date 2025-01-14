export class Loop {
  private intervalIndex: NodeJS.Timeout | null = null;

  // The interval duration in milliseconds
  private interval: number;

  // Flag to indicate if the handler is currently being processed
  private processing: boolean = false;

  // The handler function that will be executed at each interval
  private handler: () => Promise<void>;

  /**
   * Creates an instance of the Loop class.
   * @param {number} interval - The time interval (in milliseconds) between each execution of the handler.
   * @param {() => Promise<void>} handler - The asynchronous function to execute at each interval.
   * @throws {Error} Throws an error if the handler is not a function.
   */
  constructor(interval: number, handler: () => Promise<void>) {
    // Validate that the handler is a function
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function.');
    }

    this.interval = interval;
    this.handler = handler;
  }

  /**
   * Starts the loop, executing the handler function at the specified interval.
   * If the handler is still processing from the previous interval, the next execution is skipped.
   */
  run(): void {
    this.intervalIndex = setInterval(async () => {
      if (this.processing) return;

      try {
        this.processing = true;
        await this.handler();
      } finally {
        this.processing = false;
      }
    }, this.interval);
  }

  /**
   * Stops the loop, clearing the interval and preventing further executions of the handler.
   * If the loop is not running, this method does nothing.
   */
  stop(): void {
    if (this.intervalIndex) {
      clearInterval(this.intervalIndex);
      this.intervalIndex = null;
    }
  }
}
