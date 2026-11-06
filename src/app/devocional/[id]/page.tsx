import type { Metadata } from 'next'
import Link from 'next/link'
import './devocional.css'

export const metadata: Metadata = {
  title: 'Devocional — Lampas',
}

export default async function DevocionalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const num = parseInt(id, 10)

  return (
    <div className="dv-root">
      <header className="dv-topbar">
        <Link href="/" className="dv-brand">Lampas</Link>
        <nav className="dv-topnav">
          <Link href="/auth/login" className="dv-entrar">Entrar</Link>
        </nav>
      </header>

      <main className="dv-main">
        <div className="dv-wrap">
          <p className="dv-eyebrow">Devocional Anual 2027 · {num}ª</p>
          <h1 className="dv-title">Em preparação</h1>
          <p className="dv-body">
            O conteúdo desta devocional estará disponível em 2027. Acompanhe o lançamento.
          </p>
          <div className="dv-ctas">
            <Link href="/" className="dv-btn">← Voltar à página inicial</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
