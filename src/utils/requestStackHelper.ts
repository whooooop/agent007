import { promisify } from 'util';

const sleep = promisify(setTimeout);

/**
 * Represents a function that performs a request and returns a Promise.
 */
type RequestFunction = () => Promise<any>;
type RetryRuleFunction = (e: Error) => Promise<boolean>;

/**
 * @class RequestStackHelper
 * A utility class to manage and execute a stack of requests with retry logic and rate limiting.
 * Requests are executed sequentially with a configurable interval between them.
 * Supports retrying failed requests with exponential backoff for 429 (Too Many Requests) errors.
 */
export class RequestStackHelper {
  private stack: Array<() => Promise<void>>;
  private interval: number;
  private isRunning: boolean;
  private retryDelay: number;

  /**
   * Initializes the RequestStackHelper with the specified configuration.
   *
   * @param {number} [interval=5000] - The interval (in milliseconds) between executing requests.
   */
  constructor(interval: number = 5000) {
    this.stack = [];
    this.interval = interval;
    this.isRunning = false;
  }

  /**
   * Adds a request to the stack and returns a Promise that resolves when the request is completed.
   *
   * @param {RequestFunction} requestFunction - A function that performs the request and returns a Promise.
   * @returns {Promise<any>} A Promise that resolves with the result of the request or rejects with an error.
   * @throws {Error} If the requestFunction is not a function.
   */
  addRequest(requestFunction: RequestFunction): Promise<any> {
    if (typeof requestFunction !== 'function') {
      throw new Error('Request must be a function that returns a Promise!');
    }

    return new Promise((resolve, reject) => {
      this.stack.push(async () => {
        try {
          const result = await this._executeWithRetry(requestFunction);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this._processStack();
    });
  }

  /**
   * Processes the stack of requests sequentially with the configured interval.
   * This method is called automatically when a request is added to the stack.
   *
   * @private
   */
  private async _processStack(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;

    while (this.stack.length > 0) {
      const requestFunction = this.stack.shift();
      if (requestFunction) {
        try {
          await requestFunction();
        } catch (error) {
          console.error('Request failed:', error);
        }
      }
      await sleep(this.interval);
    }

    this.isRunning = false;
  }

  /**
   * Executes a request function with retry logic for 429 (Too Many Requests) errors.
   * Retries are performed with exponential backoff based on the retryDelay and attempt count.
   *
   * @private
   * @param {RequestFunction} requestFunction - The request function to execute.
   * @returns {Promise<any>} A Promise that resolves with the result of the request.
   * @throws {Error} If the request fails after the maximum number of retries.
   */
  private async _executeWithRetry(requestFunction: RequestFunction): Promise<any> {
    let attempt = 0;
    const retryDelay = Math.min(1000 * (attempt + 1), 1000 * 60 * 10);

    while (true) {
      try {
        const result = await requestFunction();
        if (attempt > 5) {
          console.log('OK');
        }
        return result;
      } catch (error: any) {
        if (
          error?.response?.status === 429 ||
          error?.message?.includes('429') ||
          error?.cause?.errno === -3008 ||
          error?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
          error?.type === 'union' ||
          error?.value?.error === "couldn't complete the request, try again later"
        ) {

          if(attempt > 5) {
            console.warn(
              `Attempt ${attempt + 1} failed. Retrying in ${retryDelay} ms...`
            );
            console.log('e', error)
            console.log('value', error.value)
            console.log('type', error.type)
            console.log('cause', error.cause); // ENOTFOUND
          }
          await sleep(retryDelay);
          attempt++;
        } else {
          throw error; // If it's not a 429 error, throw it
        }
      }
    }
  }
}
