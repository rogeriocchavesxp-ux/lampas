import type { Metadata } from 'next'
import { Inter, EB_Garamond } from 'next/font/google'
import './globals.css'
import TopNav from '@/components/nav/TopNav'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const garamond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-garamond',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Lampas — Devocional Anual 2027',
  description: 'De Gênesis ao Apocalipse em um ano. Devocionais diários enraizados na Escritura.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`h-full ${inter.variable} ${garamond.variable}`}>
      <body className="h-full">
        <TopNav />
        {children}
      </body>
    </html>
  )
}
