/**
 * @class Logger
 * Custom logger class for structured logging with different levels.
 * Supports levels: info, error, debug, and warn.
 * Log messages include timestamps and class context for better traceability.
 */

import * as chalk from 'chalk'

export type LogLevel = 'info' | 'error' | 'debug' | 'warn';

let enabledLogLevels: Set<LogLevel> = new Set(['info', 'error']);

export class Logger {
  private readonly className: string;

  /**
   * Initializes the Logger with the context of the calling class.
   *
   * @param {string} className - The name of the class using the logger.
   */
  constructor(className: string) {
    this.className = className;
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
    return chalk.hex('#FFA500')(`[${this.className}]`);
  }

  /**
   * Checks if the specified log level should be logged.
   *
   * @param {LogLevel} level - The log level to check.
   * @returns {boolean} True if the level is enabled, false otherwise.
   */
  private shouldLog(level: LogLevel): boolean {
    return enabledLogLevels.has(level);
  }

  /**
   * Logs an informational message.
   *
   * @param {...any[]} args - The arguments to log.
   */
  public info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(`${this.formatTime()} ${chalk.blue('INFO')} ${this.formatClassName()}`, ...args);
    }
  }

  /**
   * Logs an error message.
   *
   * @param {...any[]} args - The arguments to log.
   */
  public error(...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(`${this.formatTime()} ${chalk.red('ERROR')} ${this.formatClassName()}`, ...args);
    }
  }

  /**
   * Logs a debug message.
   *
   * @param {...any[]} args - The arguments to log.
   */
  public debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(`${this.formatTime()} ${chalk.green('DEBUG')} ${this.formatClassName()}`, ...args);
    }
  }

  /**
   * Logs a warn message.
   *
   * @param {...any[]} args - The arguments to log.
   */
  public warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`${this.formatTime()} ${chalk.yellow('WARN')} ${this.formatClassName()}`, ...args);
    }
  }
}
