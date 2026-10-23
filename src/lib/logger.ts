/**
 * Enterprise Structured Logger & Observability Adapter
 * Emits machine-readable JSON logs in production (compatible with Datadog, Axiom, CloudWatch, Logflare)
 * and readable colored logs during local development.
 * Supports Sentry/exception capture integration.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

const isProduction = process.env.NODE_ENV === 'production';

function formatLog(level: LogLevel, message: string, context?: LogContext) {
  const timestamp = new Date().toISOString();

  if (isProduction) {
    // Structured JSON logging for cloud aggregators
    const payload = {
      timestamp,
      level,
      message,
      environment: process.env.NODE_ENV,
      service: 'hermit-energy-monitor',
      ...context
    };
    return JSON.stringify(payload);
  }

  // Developer-friendly output in local development
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  if (context && Object.keys(context).length > 0) {
    return `${prefix} ${message} ${JSON.stringify(context)}`;
  }
  return `${prefix} ${message}`;
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (!isProduction) {
      console.debug(formatLog('debug', message, context));
    }
  },

  info(message: string, context?: LogContext) {
    console.info(formatLog('info', message, context));
  },

  warn(message: string, context?: LogContext) {
    console.warn(formatLog('warn', message, context));
  },

  error(message: string, error?: Error | any, context?: LogContext) {
    const errorDetails = error instanceof Error
      ? { errorName: error.name, errorMessage: error.message, stack: error.stack }
      : { rawError: error };

    const mergedContext = { ...context, ...errorDetails };
    console.error(formatLog('error', message, mergedContext));

    // Optional: Sentry error capture integration point
    if (typeof (globalThis as any).Sentry?.captureException === 'function' && error) {
      (globalThis as any).Sentry.captureException(error, { extra: context });
    }
  }
};
