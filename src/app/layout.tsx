import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hokmá — Do texto ao púlpito',
  description: 'Plataforma de estudo bíblico e produção homilética com IA reformada',
  icons: {
    icon: '/mark.svg',
    shortcut: '/mark.svg',
    apple: '/mark.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
