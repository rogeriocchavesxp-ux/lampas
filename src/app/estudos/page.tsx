import Link from 'next/link'
import type { Metadata } from 'next'
import { LampasLogo } from '@/components/LampasLogo'
import { getEstudos } from '@/lib/estudos'

export const metadata: Metadata = {
  title: 'Estudos — Lampas',
  description: 'Estudos panorâmicos de Teologia Bíblica na tradição Reformada.',
}

export default async function EstudosPage() {
  const estudos = await getEstudos('panorama-biblico')

  // group by subcategory preserving order
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
                <Link key={e.slug} href={`/estudos/${e.slug}`} className="est-sidebar-link">
                  {e.title}
                </Link>
              ))}
            </div>
          ))}
        </aside>

        {/* ── Main ── */}
        <main className="est-main">
          <header className="est-page-header">
            <h1 className="est-page-title">Panorama Bíblico</h1>
            <p className="est-page-sub">Estudos introdutórios às Escrituras na tradição Reformada Calvinista.</p>
          </header>

          {Object.entries(grupos).map(([subcat, items]) => (
            <section key={subcat} className="est-section">
              <h2 className="est-section-title">{subcat}</h2>
              <div className="est-grid">
                {items.map(e => (
                  <Link key={e.slug} href={`/estudos/${e.slug}`} className="est-card">
                    <h3 className="est-card-title">{e.title}</h3>
                    {e.subtitle && <p className="est-card-sub">{e.subtitle}</p>}
                    <p className="est-card-meta">
                      {e.reading_time ? `${e.reading_time} min de leitura` : ''}
                      {e.referencia ? ` · ${e.referencia}` : ''}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ))}

          {estudos.length === 0 && (
            <p className="est-empty">Nenhum estudo publicado ainda.</p>
          )}
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
        .est-nav { display: flex; gap: 1.5rem; }
        .est-nav a {
          color: var(--est-muted);
          font-size: 0.84rem;
          text-decoration: none;
        }
        .est-nav a:hover { color: var(--est-accent); }

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

        /* ── Main ── */
        .est-main {
          flex: 1;
          min-width: 0;
          padding: 2rem 0 4rem;
        }
        .est-page-header { margin-bottom: 2.5rem; }
        .est-page-title {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          line-height: 1.05;
          margin: 0 0 0.5rem;
          color: var(--est-text);
        }
        .est-page-sub {
          color: var(--est-muted);
          font-size: 1rem;
          margin: 0;
          line-height: 1.6;
        }

        /* ── Section ── */
        .est-section { margin-bottom: 3rem; }
        .est-section-title {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--est-accent);
          border-top: 2px solid var(--est-accent);
          padding-top: 0.5rem;
          margin: 0 0 1rem;
        }
        .est-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1rem;
        }
        .est-card {
          display: block;
          padding: 1.25rem 1.4rem;
          background: var(--est-surface);
          border: 1px solid var(--est-border);
          border-radius: 8px;
          text-decoration: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .est-card:hover {
          border-color: var(--est-accent);
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }
        .est-card-title {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--est-text);
          margin: 0 0 0.4rem;
          line-height: 1.25;
        }
        .est-card-sub {
          font-size: 0.84rem;
          color: var(--est-muted);
          margin: 0 0 0.7rem;
          line-height: 1.5;
        }
        .est-card-meta {
          font-size: 0.74rem;
          color: var(--est-muted);
          margin: 0;
        }

        .est-empty {
          color: var(--est-muted);
          font-size: 1rem;
          padding: 3rem 0;
          text-align: center;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .est-sidebar {
            display: none;
          }
        }
        @media (max-width: 480px) {
          .est-nav { display: none; }
          .est-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
