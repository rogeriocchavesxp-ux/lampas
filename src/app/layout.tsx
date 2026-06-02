import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Lampas — Do texto ao púlpito',
  description: 'Plataforma de estudo bíblico e produção homilética com IA reformada',
  icons: {
    icon: '/lampas-mark.svg',
    shortcut: '/lampas-mark.svg',
    apple: '/lampas-mark.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`h-full ${inter.variable}`}>
      <body className="h-full">{children}</body>
    </html>
  )
}
