export class Loop {
  private intervalIndex: NodeJS.Timeout | null = null;
  private interval: number;
  private processing: boolean = false;
  private handler: () => Promise<void>;

  constructor(interval: number, handler: () => Promise<void>) {
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function.');
    }

    this.interval = interval;
    this.handler = handler;
  }

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

  stop(): void {
    if (this.intervalIndex) {
      clearInterval(this.intervalIndex);
      this.intervalIndex = null;
    }
  }
}
