import { Injectable, signal } from '@angular/core';

export interface LoggedError {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  context: string;
  errorObject: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorLoggingService {
  private readonly _loggedErrors = signal<LoggedError[]>([]);
  readonly loggedErrors = this._loggedErrors.asReadonly();

  /**
   * Logs an error with context and returns a unique ID for user-facing messages.
   * @param error The error object or string.
   * @param context A string describing where the error occurred (e.g., 'AI Slide Analysis').
   * @returns A unique error reference ID string.
   */
  logError(error: unknown, context: string): string {
    const errorId = `err-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();
    
    let message = 'An unknown error occurred.';
    let stack: string | undefined;

    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
    } else if (typeof error === 'string') {
      message = error;
    }

    const loggedError: LoggedError = {
      id: errorId,
      timestamp,
      message,
      stack,
      context,
      errorObject: error,
    };

    // In a real application, this would send the error to a backend service.
    // For this demo, we log it to the console for administrators and store it in a signal.
    console.error(`[ADMIN LOG] Error in ${context} | ID: ${errorId} | Timestamp: ${timestamp}`);
    console.error('Error Details:', error);

    this._loggedErrors.update(errors => [loggedError, ...errors]);

    return errorId;
  }
}
