// logger.ts

// =====================================
// This file defines a custom Logger class for structured logging purposes.
// The Logger provides multiple log levels such as info, debug, and error.
// It also offers the flexibility to handle message formatting and output.
// =====================================

/**
 * @class Logger
 * Custom logger class for structured logging with different levels.
 * Supports levels: info, error, debug, and warn.
 * Log messages include timestamps and class context for better traceability.
 */

import * as chalk from 'chalk';
import { Chalk } from "chalk";

/**
 * Represents the different log levels supported by the Logger.
 */
export type LogLevel = 'info' | 'error' | 'warn' | 'debug' | 'verbose';

let enabledLogLevels: Set<LogLevel> = new Set(['info', 'error']);
let excludeContexts: Set<string> = new Set([]);

/**
 * Custom Logger class for structured logging.
 */
export class Logger {
  private readonly context: string;
  private readonly logLevels: Set<string>;
  private readonly colors: Map<LogLevel, Chalk> = new Map([
    ['info', chalk.blue],
    ['error', chalk.red],
    ['warn', chalk.yellow],
    ['debug', chalk.magenta],
    ['verbose', chalk.cyan]
  ]);

  /**
   * Initializes the Logger with the context of the calling class.
   *
   * @param {string} context - The name of the context using the logger.
   * @param {LogLevel[]} [logLevels] - Optional array of log levels to enable for this instance.
   */
  constructor(context: string, logLevels?: LogLevel[]) {
    this.context = context;
    if (logLevels) {
      this.logLevels = new Set(logLevels);
    }
  }

  /**
   * Sets the log levels that should be enabled globally.
   *
   * @static
   * @param {LogLevel[]} logLevels - An array of log levels to enable.
   */
  static set levels(logLevels: LogLevel[]) {
    enabledLogLevels = new Set(logLevels);
  }

  /**
   * Gets the currently enabled log levels globally.
   *
   * @static
   * @returns {Set<LogLevel>} The set of enabled log levels.
   */
  static get levels(): Set<LogLevel> {
    return new Set(Array.from(enabledLogLevels));
  }

  /**
   * Sets the contexts that should be excluded from logging.
   *
   * @static
   * @param {string[]} contexts - An array of contexts to exclude.
   */
  static set excludeContexts(contexts: string[]) {
    excludeContexts = new Set(contexts);
  }

  /**
   * Formats the current timestamp for log entries.
   *
   * @private
   * @returns {string} The formatted timestamp.
   */
  private formatTime(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return chalk.gray(`${day}.${month} ${hours}:${minutes}:${seconds}`);
  }

  /**
   * Formats the class name for log entries.
   *
   * @private
   * @returns {string} The formatted class name.
   */
  private formatClassName(): string {
    return chalk.hex('#FFA500')(`[${this.context}]`);
  }

  /**
   * Formats the log level for log entries.
   *
   * @private
   * @param {LogLevel} level - The log level to format.
   * @returns {string} The formatted log level.
   */
  private formatLogLevel(level: LogLevel): string {
    let result = level.padEnd(7).toUpperCase();
    return this.colors.get(level)(result);
  }

  /**
   * Checks if the specified log level should be logged.
   *
   * @param {LogLevel} level - The log level to check.
   * @returns {boolean} True if the level is enabled, false otherwise.
   */
  public canSend(level: LogLevel): boolean {
    return (this.logLevels ? this.logLevels.has(level) : enabledLogLevels.has(level))
      && !excludeContexts.has(this.context);
  }

  /**
   * Internal method to log messages with the specified level.
   *
   * @private
   * @param {LogLevel} level - The log level.
   * @param {...any[]} args - The arguments to log.
   */
  private log(level: LogLevel, ...args: any[]): void {
    console.log(`${this.formatTime()} ${this.formatLogLevel(level)} ${this.formatClassName()}`, ...args);
  }

  /**
   * Logs an informational message.
   *
   * @param {...any[]} args - The arguments to log.
   */
  public info(...args: any[]): void {
    if (this.canSend('info')) {
      this.log('info', ...args);
    }
  }

  /**
   * Logs an error message.
   *
   * @param {...any[]} args - The arguments to log.
   */
  public error(...args: any[]): void {
    if (this.canSend('error')) {
      this.log('error', ...args);
    }
  }

  /**
   * Logs a debug message.
   *
   * @param {...any[]} args - The arguments to log.
   */
  public debug(...args: any[]): void {
    if (this.canSend('debug')) {
      this.log('debug', ...args);
    }
  }

  /**
   * Logs a warning message.
   *
   * @param {...any[]} args - The arguments to log.
   */
  public warn(...args: any[]): void {
    if (this.canSend('warn')) {
      this.log('warn', ...args);
    }
  }

  /**
   * Logs a verbose message.
   *
   * @param {...any[]} args - The arguments to log.
   */
  public verbose(...args: any[]): void {
    if (this.canSend('verbose')) {
      this.log('verbose', ...args);
    }
  }
}
