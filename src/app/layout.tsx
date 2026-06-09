import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import KnowledgePanelWrapper from '@/components/KnowledgePanelWrapper'
import TopNav from '@/components/nav/TopNav'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Lampas — Exegese e Sermões com IA',
  description: 'Exegese bíblica com rigor reformado. Prepare sermões com método, profundidade e IA — em português.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`h-full ${inter.variable}`}>
      <body className="h-full">
        <TopNav />
        {children}
        <KnowledgePanelWrapper />
      </body>
    </html>
  )
}
