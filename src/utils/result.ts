/**
 * Represents a result that can either be a success (with a value) or a failure (with an error).
 * This is a type-safe way to handle operations that may fail.
 *
 * @template T - The type of the value in case of success.
 * @template E - The type of the error in case of failure.
 */
export class Result<T, E> {
  /**
   * Protected constructor to enforce the use of static factory methods.
   *
   * @param {T | null} value - The value in case of success.
   * @param {E | null} error - The error in case of failure.
   */
  protected constructor(private readonly value: T | null, private readonly error: E | null) {
  }

  /**
   * Creates a successful result with a value.
   *
   * @static
   * @template T - The type of the value.
   * @template E - The type of the error (never in this case).
   * @param {T} value - The value to wrap in the result.
   * @returns {Result<T, E>} A successful result.
   */
  static success<T, E = never>(value: T): Result<T, E> {
    return new Result<T, E>(value, null);
  }

  /**
   * Creates a failed result with an error.
   *
   * @static
   * @template E - The type of the error.
   * @template T - The type of the value (never in this case).
   * @param {E} error - The error to wrap in the result.
   * @returns {Result<T, E>} A failed result.
   */
  static failure<E, T = never>(error: E): Result<T, E> {
    return new Result<T, E>(null as never, error);
  }

  /**
   * Checks if the result is a success.
   *
   * @returns {this is Success<T>} True if the result is a success, false otherwise.
   */
  isSuccess(): this is Success<T> {
    return this.error === null;
  }

  /**
   * Checks if the result is a failure.
   *
   * @returns {this is Failure<E>} True if the result is a failure, false otherwise.
   */
  isFailure(): this is Failure<E> {
    return this.value === null;
  }

  /**
   * Gets the value from a successful result.
   *
   * @returns {T} The value if the result is a success.
   * @throws {Error} If the result is a failure.
   */
  getValue(): T {
    if (this.isFailure()) {
      throw new Error('Cannot get value from a failure result.');
    }
    return this.value!;
  }

  /**
   * Gets the error from a failed result.
   *
   * @returns {E} The error if the result is a failure.
   * @throws {Error} If the result is a success.
   */
  getError(): E {
    if (this.isSuccess()) {
      throw new Error('Cannot get error from a success result.');
    }
    return this.error!;
  }

  /**
   * Applies a function to the value of a successful result.
   *
   * @template U - The type of the new value.
   * @param {(value: T) => U} fn - The function to apply.
   * @returns {Result<U, E>} A new result with the transformed value or the same error.
   */
  map<U>(fn: (value: T) => U): Result<U, E> {
    return this.isSuccess() ? Result.success(fn(this.value!)) : Result.failure(this.error!);
  }

  /**
   * Applies a function to the error of a failed result.
   *
   * @template U - The type of the new error.
   * @param {(error: E) => U} fn - The function to apply.
   * @returns {Result<T, U>} A new result with the transformed error or the same value.
   */
  mapError<U>(fn: (error: E) => U): Result<T, U> {
    return this.isFailure() ? Result.failure(fn(this.error!)) : Result.success(this.value!);
  }

  /**
   * Transforms a successful result into another result.
   *
   * @template U - The type of the new value.
   * @param {(value: T) => Result<U, E>} fn - The function to apply.
   * @returns {Result<U, E>} A new result after applying the function.
   */
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this.isSuccess() ? fn(this.value!) : Result.failure(this.error!);
  }

  /**
   * Gets the value from a successful result or a default value if the result is a failure.
   *
   * @param {T} defaultValue - The default value to return in case of failure.
   * @returns {T} The value if the result is a success, or the default value if it is a failure.
   */
  getOrElse(defaultValue: T): T {
    return this.isSuccess() ? this.value! : defaultValue;
  }
}

/**
 * Represents a successful result with a value.
 *
 * @template T - The type of the value.
 */
class Success<T> extends Result<T, never> {
  /**
   * Creates a successful result.
   *
   * @param {T} value - The value to wrap in the result.
   */
  constructor(value: T) {
    super(value, null as never); // Use `null as never` to satisfy TypeScript's type system
  }
}

/**
 * Represents a failed result with an error.
 *
 * @template E - The type of the error.
 */
class Failure<E> extends Result<never, E> {
  /**
   * Creates a failed result.
   *
   * @param {E} error - The error to wrap in the result.
   */
  constructor(error: E) {
    super(null as never, error); // Use `null as never` to satisfy TypeScript's type system
  }
}

export default Result;
