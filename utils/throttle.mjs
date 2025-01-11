/**
 * Throttle class ensures that a given function runs only once at a time.
 * If the function is already running, any subsequent calls will be ignored
 * until the currently running function completes its execution.
 *
 * Usage:
 * 1. Create an instance of Throttle.
 * 2. Pass your function to the throttle() method.
 * 3. Use the returned throttled function in your code.
 *
 * Example:
 * const throttleInstance = new Throttle();
 * const throttledFunction = throttleInstance.throttle(asyncTask);
 * throttledFunction();  // Starts the task
 * throttledFunction();  // Ignored if the task is still running
 */
export class Throttle {
  constructor() {
    // This flag keeps track of whether the function is currently running
    this.isRunning = false;
  }

  /**
   * Throttles the given function to ensure it only runs one at a time.
   * If the function is already running, new calls will be ignored.
   *
   * @param {Function} func - The function to throttle.
   * @returns {Function} - A throttled version of the input function.
   */
  throttle(func) {
    return async (...args) => {
      // If the function is already running, ignore the new call
      if (this.isRunning) {
        return;
      }

      // Mark the function as running
      this.isRunning = true;

      try {
        // Execute the function and wait for it to complete
        await func(...args);
      } finally {
        // Once the function completes, reset the isRunning flag
        this.isRunning = false;
      }
    };
  }
}
