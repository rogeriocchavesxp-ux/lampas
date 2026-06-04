import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {}

// Sentry só é ativado quando a auth token está disponível (produção configurada).
// Sem SENTRY_AUTH_TOKEN o build do Vercel falha — disabling gracefully.
const sentryConfigured = !!process.env.SENTRY_AUTH_TOKEN

export default sentryConfigured
  ? withSentryConfig(nextConfig, {
      org:    process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: true,
      widenClientFileUpload: true,
      sourcemaps: { disable: true },
      disableLogger: true,
      automaticVercelMonitors: true,
    })
  : nextConfig
