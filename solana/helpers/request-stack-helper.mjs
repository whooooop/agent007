import { promisify } from 'util'

const sleep = promisify(setTimeout);

export class RequestStackHelper {
    constructor(interval = 5000) {
        this.stack = [];
        this.interval = interval;
        this.isRunning = false;
    }

    addRequest(requestFunction) {
        if (typeof requestFunction !== "function") {
            throw new Error("Request must be a function that returns a Promise!");
        }

        return new Promise((resolve, reject) => {
            this.stack.push(async () => {
                try {
                    const result = await requestFunction();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });

            this._processStack();
        });
    }

    async _processStack() {
        if (this.isRunning) return;

        this.isRunning = true;

        while (this.stack.length > 0) {
            const requestFunction = this.stack.shift();
            try {
                await requestFunction();
            } catch (error) {
                console.error("Request failed:", error);
            }
            await sleep(this.interval);
        }

        this.isRunning = false;
    }
}
