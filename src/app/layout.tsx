import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="pt-BR" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
