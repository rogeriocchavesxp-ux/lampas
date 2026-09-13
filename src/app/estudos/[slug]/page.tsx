import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LampasLogo } from '@/components/LampasLogo'
import { getEstudo, getEstudos, getAllEstudos, getEstudoNav } from '@/lib/estudos'
import EstudoBody from '../EstudoBody'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const estudos = await getAllEstudos()
  return estudos.map(e => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const estudo = await getEstudo(slug)
  if (!estudo) return { title: 'Estudo não encontrado — Lampas' }
  return {
    title: `${estudo.title} — Lampas`,
    description: estudo.subtitle ?? undefined,
  }
}

export default async function EstudoPage({ params }: Props) {
  const { slug } = await params
  const [estudo, estudos, { prev, next }] = await Promise.all([
    getEstudo(slug),
    getEstudos('panorama-biblico'),
    getEstudoNav(slug, 'panorama-biblico'),
  ])

  if (!estudo) notFound()

  const grupos: Record<string, typeof estudos> = {}
  for (const e of estudos) {
    const key = e.subcategory ?? 'Geral'
    if (!grupos[key]) grupos[key] = []
    grupos[key].push(e)
  }

  return (
    <div className="est-shell">

      {/* ── Topbar ── */}
      <header className="est-topbar">
        <Link href="/" className="est-brand" aria-label="Lampas">
          <LampasLogo height={32} />
        </Link>
        <nav className="est-nav">
          <Link href="/estudos" className="est-back">← Estudos</Link>
          <Link href="/#planos">Planos</Link>
          <Link href="/auth/login">Entrar</Link>
        </nav>
      </header>

      <div className="est-layout">

        {/* ── Sidebar ── */}
        <aside className="est-sidebar">
          <p className="est-sidebar-label">Panorama Bíblico</p>
          {Object.entries(grupos).map(([subcat, items]) => (
            <div key={subcat} className="est-sidebar-group">
              <p className="est-sidebar-subcat">{subcat}</p>
              {items.map(e => (
                <Link
                  key={e.slug}
                  href={`/estudos/${e.slug}`}
                  className={`est-sidebar-link${e.slug === slug ? ' est-sidebar-link--active' : ''}`}
                >
                  {e.title}
                </Link>
              ))}
            </div>
          ))}
        </aside>

        {/* ── Article ── */}
        <main className="est-main">
          <article className="est-article">

            <header className="est-article-header">
              {estudo.subcategory && (
                <p className="est-article-subcat">{estudo.subcategory}</p>
              )}
              <h1 className="est-article-title">{estudo.title}</h1>
              {estudo.subtitle && (
                <p className="est-article-subtitle">{estudo.subtitle}</p>
              )}
              <div className="est-article-meta">
                {estudo.reading_time && (
                  <span>{estudo.reading_time} min de leitura</span>
                )}
                {estudo.referencia && (
                  <span>{estudo.referencia}</span>
                )}
              </div>
            </header>

            <div className="est-divider" />

            {estudo.content ? (
              <EstudoBody content={estudo.content} />
            ) : (
              <p className="est-no-content">Conteúdo em preparação.</p>
            )}

            {/* ── Nav prev/next ── */}
            {(prev || next) && (
              <nav className="est-article-nav">
                {prev ? (
                  <Link href={`/estudos/${prev.slug}`} className="est-nav-btn est-nav-prev">
                    <span className="est-nav-dir">← Anterior</span>
                    <span className="est-nav-name">{prev.title}</span>
                  </Link>
                ) : <span />}
                {next ? (
                  <Link href={`/estudos/${next.slug}`} className="est-nav-btn est-nav-next">
                    <span className="est-nav-dir">Próximo →</span>
                    <span className="est-nav-name">{next.title}</span>
                  </Link>
                ) : <span />}
              </nav>
            )}

          </article>
        </main>
      </div>

      <style>{`
        :root {
          --est-bg: #f7f4ef;
          --est-surface: #ffffff;
          --est-border: #e0d9ce;
          --est-text: #1a160f;
          --est-muted: #6b6257;
          --est-accent: #8a5c1a;
          --est-sidebar-w: 230px;
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) {
            --est-bg: #141210;
            --est-surface: #1e1b17;
            --est-border: #2e2a24;
            --est-text: #e8e2d8;
            --est-muted: #9a9186;
            --est-accent: #c88d3a;
          }
        }
        :root[data-theme="dark"] {
          --est-bg: #141210;
          --est-surface: #1e1b17;
          --est-border: #2e2a24;
          --est-text: #e8e2d8;
          --est-muted: #9a9186;
          --est-accent: #c88d3a;
        }

        .est-shell {
          min-height: 100vh;
          background: var(--est-bg);
          color: var(--est-text);
          font-family: system-ui, -apple-system, sans-serif;
        }

        /* ── Topbar ── */
        .est-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.9rem clamp(1rem, 3vw, 2.5rem);
          border-bottom: 1px solid var(--est-border);
          background: var(--est-surface);
          position: sticky;
          top: 0;
          z-index: 20;
        }
        .est-brand { display: flex; text-decoration: none; }
        .est-nav { display: flex; align-items: center; gap: 1.5rem; }
        .est-nav a {
          color: var(--est-muted);
          font-size: 0.84rem;
          text-decoration: none;
        }
        .est-nav a:hover { color: var(--est-accent); }
        .est-back {
          font-weight: 600;
          color: var(--est-accent) !important;
        }

        /* ── Layout ── */
        .est-layout {
          display: flex;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 clamp(1rem, 3vw, 2rem);
          gap: 2rem;
          align-items: flex-start;
        }

        /* ── Sidebar ── */
        .est-sidebar {
          width: var(--est-sidebar-w);
          flex-shrink: 0;
          position: sticky;
          top: calc(53px + 1rem);
          padding: 1.5rem 0 2rem;
          border-right: 1px solid var(--est-border);
          padding-right: 1.5rem;
          min-height: calc(100vh - 70px);
        }
        .est-sidebar-label {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--est-accent);
          margin: 0 0 1rem;
        }
        .est-sidebar-group { margin-bottom: 1.25rem; }
        .est-sidebar-subcat {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--est-muted);
          margin: 0 0 0.4rem;
        }
        .est-sidebar-link {
          display: block;
          padding: 0.3rem 0.5rem;
          font-size: 0.88rem;
          color: var(--est-text);
          text-decoration: none;
          border-radius: 4px;
          margin-bottom: 0.15rem;
          line-height: 1.35;
        }
        .est-sidebar-link:hover {
          background: var(--est-border);
          color: var(--est-accent);
        }
        .est-sidebar-link--active {
          background: var(--est-border);
          color: var(--est-accent);
          font-weight: 600;
        }

        /* ── Main ── */
        .est-main {
          flex: 1;
          min-width: 0;
          padding: 2.5rem 0 4rem;
        }

        /* ── Article ── */
        .est-article { max-width: 720px; }
        .est-article-subcat {
          font-size: 0.68rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--est-accent);
          margin: 0 0 0.75rem;
        }
        .est-article-title {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          line-height: 1.05;
          margin: 0 0 0.6rem;
          color: var(--est-text);
        }
        .est-article-subtitle {
          font-size: 1.1rem;
          color: var(--est-muted);
          font-style: italic;
          margin: 0 0 0.8rem;
          line-height: 1.5;
        }
        .est-article-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem 1rem;
          font-size: 0.78rem;
          color: var(--est-muted);
        }
        .est-divider {
          height: 2px;
          background: var(--est-border);
          margin: 1.5rem 0 2rem;
        }
        .est-no-content {
          color: var(--est-muted);
          font-style: italic;
        }

        /* ── Markdown body ── */
        .est-body { line-height: 1.8; }
        .est-h1 { font-family: Georgia, serif; font-size: 1.5rem; font-weight: 700; color: var(--est-text); margin: 2.5rem 0 0.8rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--est-border); }
        .est-h2 { font-family: Georgia, serif; font-size: 1.2rem; font-weight: 700; color: var(--est-text); margin: 2rem 0 0.6rem; }
        .est-h3 { font-size: 1rem; font-weight: 700; color: var(--est-text); margin: 1.5rem 0 0.5rem; }
        .est-h4 { font-size: 0.9rem; font-weight: 700; color: var(--est-text); margin: 1.2rem 0 0.4rem; }
        .est-p  { font-size: 1rem; color: var(--est-text); line-height: 1.85; margin: 0 0 1rem; }
        .est-strong { font-weight: 700; }
        .est-em { font-style: italic; color: var(--est-muted); }
        .est-ul { padding-left: 1.5rem; margin: 0.5rem 0 1rem; list-style-type: disc; }
        .est-ol { padding-left: 1.5rem; margin: 0.5rem 0 1rem; list-style-type: decimal; }
        .est-li { font-size: 1rem; color: var(--est-text); line-height: 1.75; margin-bottom: 0.25rem; }
        .est-bq { border-left: 3px solid var(--est-accent); margin: 1rem 0; padding: 0.75rem 1.25rem; background: var(--est-surface); border-radius: 0 6px 6px 0; font-style: italic; color: var(--est-muted); }
        .est-hr { border: none; border-top: 1px solid var(--est-border); margin: 1.75rem 0; }
        .est-table-wrap { overflow-x: auto; margin-bottom: 1rem; }
        .est-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .est-thead { background: var(--est-surface); }
        .est-tr { border-bottom: 1px solid var(--est-border); }
        .est-th { padding: 0.5rem 0.9rem; text-align: left; font-weight: 700; border-bottom: 2px solid var(--est-border); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--est-muted); }
        .est-td { padding: 0.5rem 0.9rem; color: var(--est-text); vertical-align: top; line-height: 1.6; }
        .est-pre { background: var(--est-surface); border: 1px solid var(--est-border); border-radius: 8px; padding: 1rem 1.2rem; overflow-x: auto; margin: 0.5rem 0 1rem; line-height: 1.6; font-size: 0.88rem; font-family: ui-monospace, monospace; color: var(--est-text); }
        .est-code { background: var(--est-border); border-radius: 4px; padding: 2px 5px; font-size: 0.85em; font-family: ui-monospace, monospace; color: var(--est-accent); }
        .est-code-block { font-family: ui-monospace, monospace; font-size: 0.85rem; color: var(--est-text); }

        /* ── Prev/Next nav ── */
        .est-article-nav {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin-top: 3rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--est-border);
        }
        .est-nav-btn {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          text-decoration: none;
          padding: 0.75rem 1rem;
          border: 1px solid var(--est-border);
          border-radius: 8px;
          background: var(--est-surface);
          max-width: 48%;
          transition: border-color 0.15s;
        }
        .est-nav-btn:hover { border-color: var(--est-accent); }
        .est-nav-next { text-align: right; }
        .est-nav-dir {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--est-accent);
        }
        .est-nav-name {
          font-family: Georgia, serif;
          font-size: 0.95rem;
          color: var(--est-text);
          line-height: 1.3;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .est-sidebar { display: none; }
        }
        @media (max-width: 480px) {
          .est-nav .est-back { display: none; }
          .est-nav a:not(.est-back) { display: none; }
          .est-article-nav { flex-direction: column; }
          .est-nav-btn { max-width: 100%; }
          .est-nav-next { text-align: left; }
        }
      `}</style>
    </div>
  )
}
