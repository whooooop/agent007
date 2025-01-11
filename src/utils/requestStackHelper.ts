import { promisify } from 'util';

const sleep = promisify(setTimeout);

type RequestFunction = () => Promise<any>;

export class RequestStackHelper {
  private stack: Array<() => Promise<void>>;
  private interval: number;
  private isRunning: boolean;
  private maxRetries: number;
  private retryDelay: number;

  constructor(interval: number = 5000, maxRetries: number = 50, retryDelay: number = 5000) {
    this.stack = [];
    this.interval = interval;
    this.isRunning = false;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

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

  private async _executeWithRetry(requestFunction: RequestFunction): Promise<any> {
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      try {
        return await requestFunction();
      } catch (error: any) {
        if (error?.response?.status === 429 || error?.message?.includes('429')) {
          console.warn(
            `Attempt ${attempt + 1} failed with 429. Retrying in ${this.retryDelay * (attempt + 1)} ms...`
          );
          await sleep(this.retryDelay * (attempt + 1));
          attempt++;
        } else {
          throw error; // If it's not a 429 error, throw it
        }
      }
    }

    throw new Error(`Request failed after ${this.maxRetries} retries.`);
  }
}
