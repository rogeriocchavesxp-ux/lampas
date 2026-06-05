import Link from 'next/link'
import type { Metadata } from 'next'
import { LampasLogo } from '@/components/LampasLogo'
import { createClient } from '@/lib/supabase/server'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export const metadata: Metadata = {
  title: 'Boletim — Lampas',
  description: 'Novidades, melhorias e atualizações da plataforma Lampas.',
}

type BoletimEntry = {
  id: string
  version: string
  release_date: string
  title: string
  content: string
  tags: string[]
}

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  feat:        { bg: '#c9921a22', text: '#a0720f' },
  fix:         { bg: '#ef444422', text: '#b91c1c' },
  design:      { bg: '#8b5cf622', text: '#6d28d9' },
  performance: { bg: '#10b98122', text: '#047857' },
  'conteúdo':  { bg: '#3b82f622', text: '#1d4ed8' },
}

const TAG_LABELS: Record<string, string> = {
  feat:        'Novo',
  fix:         'Correção',
  design:      'Design',
  performance: 'Performance',
  'conteúdo':  'Conteúdo',
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function BoletimPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('boletim_entries')
    .select('id, version, release_date, title, content, tags')
    .eq('published', true)
    .order('release_date', { ascending: false })

  const entries: BoletimEntry[] = data ?? []

  return (
    <main className="bl-shell">

      <header className="bl-header">
        <Link href="/" className="bl-brand" aria-label="Lampas — página inicial">
          <LampasLogo height={40} />
        </Link>
        <nav className="bl-nav" aria-label="Navegação">
          <Link href="/#recursos">Recursos</Link>
          <Link href="/#planos">Planos</Link>
          <Link href="/auth/login">Entrar</Link>
        </nav>
        <Link href="/auth/login" className="bl-cta">Começar grátis</Link>
      </header>

      <div className="bl-container">

        <div className="bl-page-header">
          <p className="bl-eyebrow">Plataforma</p>
          <h1 className="bl-title">Boletim Lampas</h1>
          <p className="bl-subtitle">Novidades, melhorias e atualizações da plataforma.</p>
        </div>

        {entries.length === 0 ? (
          <p className="bl-empty">Nenhuma atualização publicada ainda.</p>
        ) : (
          <div className="bl-entries">
            {entries.map((entry) => (
              <article key={entry.id} className="bl-entry">
                <div className="bl-entry-meta">
                  <span className="bl-version">v{entry.version}</span>
                  <time className="bl-date" dateTime={entry.release_date}>
                    {formatDate(entry.release_date)}
                  </time>
                </div>

                <h2 className="bl-entry-title">{entry.title}</h2>

                {entry.tags.length > 0 && (
                  <div className="bl-tags" aria-label="Categorias">
                    {entry.tags.map((tag) => {
                      const c = TAG_COLORS[tag] ?? { bg: '#0f172a14', text: '#475569' }
                      return (
                        <span
                          key={tag}
                          className="bl-tag"
                          style={{ background: c.bg, color: c.text }}
                        >
                          {TAG_LABELS[tag] ?? tag}
                        </span>
                      )
                    })}
                  </div>
                )}

                {entry.content.trim() && (
                  <div className="bl-content">
                    <MarkdownRenderer content={entry.content} moduleColor="#c9921a" />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

      </div>

      <footer className="bl-footer">
        <LampasLogo height={32} />
        <p>Estudo bíblico com profundidade, método e clareza.</p>
        <nav className="bl-footer-nav" aria-label="Links do rodapé">
          <Link href="/">Início</Link>
          <Link href="/#planos">Planos</Link>
          <Link href="/auth/login">Entrar</Link>
          <Link href="mailto:contato@lampas.com.br">Contato</Link>
        </nav>
      </footer>

      <style>{`
        .bl-shell {
          min-height: 100vh;
          background: #f5f0e8;
          color: #0f172a;
          font-family: inherit;
        }

        /* ── Header ─────────────────────────────── */
        .bl-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2.5rem;
          border-bottom: 1px solid #e0d9ce;
          background: #f5f0e8;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .bl-brand { display: flex; align-items: center; text-decoration: none; }
        .bl-nav { display: flex; gap: 1.75rem; align-items: center; }
        .bl-nav a {
          color: #6b5d4a;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.15s;
        }
        .bl-nav a:hover { color: #c9921a; }
        .bl-cta {
          display: inline-block;
          padding: 0.45rem 1.1rem;
          background: #c9921a;
          color: #fff;
          font-size: 0.82rem;
          font-weight: 600;
          border-radius: 6px;
          text-decoration: none;
          transition: background 0.15s;
        }
        .bl-cta:hover { background: #b07d15; }

        /* ── Container ───────────────────────────── */
        .bl-container {
          max-width: 720px;
          margin: 0 auto;
          padding: 4rem 1.5rem 6rem;
        }

        /* ── Page header ─────────────────────────── */
        .bl-page-header { margin-bottom: 3.5rem; }
        .bl-eyebrow {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #c9921a;
          margin: 0 0 0.5rem;
        }
        .bl-title {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: clamp(2rem, 5vw, 2.75rem);
          font-weight: 500;
          line-height: 1.15;
          color: #0a0f1a;
          margin: 0 0 0.75rem;
        }
        .bl-subtitle {
          font-size: 1rem;
          color: #6b5d4a;
          line-height: 1.6;
          margin: 0;
        }

        /* ── Entries ─────────────────────────────── */
        .bl-entries { display: flex; flex-direction: column; }
        .bl-entry {
          padding: 2.5rem 0;
          border-bottom: 1px solid #e0d9ce;
        }
        .bl-entry:first-child { padding-top: 0; }
        .bl-entry:last-child { border-bottom: none; }

        .bl-entry-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .bl-version {
          display: inline-block;
          padding: 0.18rem 0.55rem;
          background: #c9921a;
          color: #fff;
          font-size: 0.7rem;
          font-weight: 700;
          border-radius: 4px;
          letter-spacing: 0.04em;
          font-family: ui-monospace, monospace;
        }
        .bl-date { font-size: 0.82rem; color: #8c7a62; }

        .bl-entry-title {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 1.5rem;
          font-weight: 500;
          line-height: 1.3;
          color: #0a0f1a;
          margin: 0 0 0.75rem;
        }

        .bl-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-bottom: 1.1rem;
        }
        .bl-tag {
          font-size: 0.66rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: 3px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .bl-content { margin-top: 0.25rem; }

        .bl-empty {
          text-align: center;
          padding: 4rem 0;
          color: #8c7a62;
          font-size: 0.95rem;
        }

        /* ── Footer ──────────────────────────────── */
        .bl-footer {
          background: #0a0f1a;
          color: #f5f0e8;
          padding: 3rem 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          text-align: center;
        }
        .bl-footer p { font-size: 0.83rem; color: #8c9ab0; margin: 0; }
        .bl-footer-nav {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 0.25rem;
        }
        .bl-footer-nav a {
          color: #8c9ab0;
          text-decoration: none;
          font-size: 0.82rem;
          transition: color 0.15s;
        }
        .bl-footer-nav a:hover { color: #f5f0e8; }

        @media (max-width: 640px) {
          .bl-header { padding: 1rem 1.25rem; }
          .bl-nav { display: none; }
          .bl-container { padding: 2.5rem 1.25rem 4rem; }
          .bl-footer { padding: 2rem 1.25rem; }
        }
      `}</style>

    </main>
  )
}
