import * as Sentry from '@sentry/nextjs'

export function captureError(err: unknown, context?: Record<string, unknown>): void {
  if (context) Sentry.setContext('context', context)
  Sentry.captureException(err)
  // Fallback para console em dev ou sem Sentry configurado
  if (process.env.NODE_ENV === 'development' || !process.env.SENTRY_DSN) {
    console.error('[lampas]', err, context ?? '')
  }
}

export function captureMessage(msg: string, level: Sentry.SeverityLevel = 'info'): void {
  Sentry.captureMessage(msg, level)
}
