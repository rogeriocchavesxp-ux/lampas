import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Lampas — Iluminando a sua jornada de estudo bíblico',
  description: 'Iluminando a sua jornada de estudo bíblico com IA reformada',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`h-full ${inter.variable}`}>
      <body className="h-full">{children}</body>
    </html>
  )
}
