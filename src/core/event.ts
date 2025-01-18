import { Logger } from "../utils/logger";
import { EventsRegistry, EventPayload } from "../config/events.config";

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
   * Subscribe to an event with a filter condition.
   * The handler will only be called if the payload matches the filter.
   * Internally uses the `on` method to register the handler.
   *
   * @template K - The event name type.
   * @param {K} event - The event to subscribe to.
   * @param {Partial<EventPayload[K]>} filter - The filter condition to apply to the payload.
   * @param {(payload: EventPayload[K]) => void} handler - The handler function to execute when the event is emitted and matches the filter.
   */
  subscribe<K extends EventName>(
      event: K,
      filter: Partial<EventPayload[K]>,
      handler: (payload: EventPayload[K]) => void
  ): void {
    // Use the `on` method to register a wrapped handler
    this.on(event, (payload) => {
      // Check if the payload matches the filter
      if (this._matchesFilter(payload, filter)) {
        handler(payload);
      }
    });
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

  /**
   * Checks if the payload matches the filter condition.
   *
   * @private
   * @template K - The event name type.
   * @param {EventPayload[K]} payload - The payload to check.
   * @param {Partial<EventPayload[K]>} filter - The filter condition.
   * @returns {boolean} True if the payload matches the filter, false otherwise.
   */
  private _matchesFilter<K extends EventName>(
      payload: EventPayload[K],
      filter: Partial<EventPayload[K]>
  ): boolean {
    for (const key in filter) {
      if (payload[key] !== filter[key]) {
        return false;
      }
    }
    return true;
  }
}
