/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

/**
 * Simple logging utility with different log levels
 */
export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  /**
   * Format a log message with timestamp and context
   */
  private formatMessage(message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${this.context}] ${message}`;
  }

  /**
   * Log an informational message
   */
  info(message: string, ...args: any[]): void {
    console.log(this.formatMessage(message), ...args);
  }

  /**
   * Log a warning message
   */
  warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage(message), ...args);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: any): void {
    console.error(this.formatMessage(message));
    
    if (error) {
      if (error instanceof Error) {
        console.error(this.formatMessage(`Error details: ${error.message}`));
        console.error(this.formatMessage(`Stack trace: ${error.stack}`));
      } else {
        console.error(this.formatMessage('Error details:'), error);
      }
    }
  }

  /**
   * Log a debug message (only in dev environment)
   */
  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage(message), ...args);
    }
  }
}

/**
 * Create a logger for a specific context
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}
