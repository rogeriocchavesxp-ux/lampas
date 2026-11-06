import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Devocional — Lampas',
}

export default function DevocionalPage({ params }: { params: { id: string } }) {
  const num = parseInt(params.id, 10)

  return (
    <div className={styles.root}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand}>Lampas</Link>
        <nav className={styles.topnav}>
          <Link href="/auth/login" className={styles.entrar}>Entrar</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>Devocional Anual 2027 · {num}ª</p>
          <h1 className={styles.title}>Em preparação</h1>
          <p className={styles.body}>
            O conteúdo desta devocional estará disponível em 2027. Acompanhe o lançamento.
          </p>
          <div className={styles.ctas}>
            <Link href="/" className={styles.btn}>← Voltar à página inicial</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
