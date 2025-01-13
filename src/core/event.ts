import { Logger } from "../utils/logger";
import { EventsRegistry } from "../config/events.config";
import { EventPayload } from "../types/appEvents";

type EventName = typeof EventsRegistry[keyof typeof EventsRegistry];

export class AppEvents {
  private readonly logger = new Logger('AppEvents');
  private registry: { [K in EventName]?: Array<(payload: EventPayload[K]) => void> } = {};

  constructor() {
    this.logger.info('created');
  }


  /**
   * Register an event handler for a specific event.
   * @param event - The event to subscribe to.
   * @param handler - The handler function to execute when the event is emitted.
   */
  on<K extends EventName>(event: K, handler: (payload: EventPayload[K]) => void): void {
    if (!this.registry[event]) {
      this.registry[event] = [];
    }
    this.registry[event]!.push(handler);
  }


  /**
   * Emits a registered event and processes all its subscribers sequentially.
   * Returns a Promise that resolves when all subscribers have finished processing.
   * @param eventName - The name of the event to emit.
   * @param payload - The data to pass to the event handlers.
   * @returns A Promise that resolves when all handlers have completed processing.
   */
  async emit<K extends EventName>(eventName: K, payload: EventPayload[K]): Promise<void> {
    this.logger.debug('emit event', eventName);

    const handlers = this.registry[eventName];
    if (handlers) {
      for (const handler of handlers) {
        try {
          await handler(payload);
        } catch (e) {
          this.logger.error('Fail while emit', eventName, payload);
        }
      }
    }
  }
}
