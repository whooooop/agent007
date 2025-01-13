/**
 * @class Logger
 * Custom logger class for structured logging with different levels.
 * Supports levels: info, error, debug, and warn.
 * Log messages include timestamps and class context for better traceability.
 */

import * as chalk from 'chalk'

export type LogLevel = 'info' | 'error' | 'warn' | 'debug' | 'verbose';

let enabledLogLevels: Set<LogLevel> = new Set(['info', 'error']);
let excludeContexts: Set<string> = new Set([]);

export class Logger {
  private readonly context: string;

  /**
   * Initializes the Logger with the context of the calling class.
   *
   * @param {string} context - The name of the context using the logger.
   */
  constructor(context: string) {
    this.context = context;
  }

  /**
   * Sets the log levels that should be enabled.
   *
   * @static
   * @param {LogLevel[]} logLevels - An array of log levels to enable.
   */
  static set levels (logLevels: LogLevel[]) {
    enabledLogLevels = new Set(logLevels);
  }


  static set excludeContexts (contexts: string[]) {
    excludeContexts = new Set(contexts);
  }

  /**
   * Formats the current timestamp for log entries.
   *
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
   * @returns {string} The formatted class name.
   */
  private formatClassName(): string {
    return chalk.hex('#FFA500')(`[${this.context}]`);
  }

  private formatLogLevel(level: LogLevel): string {
    let result = level.padEnd(7).toUpperCase();

    if (level === 'info') {
      return chalk.blue(result);
    } else if (level === 'error') {
      return chalk.red(result);
    } else if (level === 'debug') {
      return chalk.magenta(result);
    } else if (level === 'warn') {
      return chalk.yellow(result);
    } else if (level === 'verbose') {
      return chalk.cyan(result);
    }
  }

  /**
   * Checks if the specified log level should be logged.
   *
   * @param {LogLevel} level - The log level to check.
   * @returns {boolean} True if the level is enabled, false otherwise.
   */
  private shouldLog(level: LogLevel): boolean {
    return enabledLogLevels.has(level) && !excludeContexts.has(this.context);
  }

  /**
   * Logs an informational message.
   *
   * @param {...any[]} args - The arguments to log.
   */
  public info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(`${this.formatTime()} ${this.formatLogLevel('info')} ${this.formatClassName()}`, ...args);
    }
  }

  /**
   * Logs an error message.
   *
   * @param {...any[]} args - The arguments to log.
   */
  public error(...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(`${this.formatTime()} ${this.formatLogLevel('error')} ${this.formatClassName()}`, ...args);
    }
  }

  /**
   * Logs a debug message.
   *
   * @param {...any[]} args - The arguments to log.
   */
  public debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(`${this.formatTime()} ${this.formatLogLevel('debug')} ${this.formatClassName()}`, ...args);
    }
  }

  /**
   * Logs a warn message.
   *
   * @param {...any[]} args - The arguments to log.
   */
  public warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`${this.formatTime()} ${this.formatLogLevel('warn')} ${this.formatClassName()}`, ...args);
    }
  }

  /**
   * Logs a verbose message.
   *
   * @param {...any[]} args - The arguments to log.
   */
  public verbose(...args: any[]): void {
    if (this.shouldLog('verbose')) {
      console.warn(`${this.formatTime()} ${this.formatLogLevel('verbose')} ${this.formatClassName()}`, ...args);
    }
  }
}
