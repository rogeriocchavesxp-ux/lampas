import type { Metadata } from 'next'
import { Inter, EB_Garamond, Crimson_Pro, Source_Sans_3 } from 'next/font/google'
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

const crimson = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-crimson',
  display: 'swap',
  weight: ['400', '600'],
  style: ['normal', 'italic'],
})

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source',
  display: 'swap',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Lampas — A Grande História',
  description: 'De Gênesis ao Apocalipse em um ano. Devocionais diários enraizados na Escritura.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`h-full ${inter.variable} ${garamond.variable} ${crimson.variable} ${sourceSans.variable}`}>
      <body className="h-full">
        <TopNav />
        {children}
      </body>
    </html>
  )
}
