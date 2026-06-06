import Link from 'next/link'
import type { Metadata } from 'next'
import { LampasLogo } from '@/components/LampasLogo'
import { createClient } from '@/lib/supabase/server'
import { BOLETIM_EDITORIAS, inferBoletimEditorias } from '@/lib/boletim-editorial'

export const metadata: Metadata = {
  title: 'Observatório Lampas — Iluminando os acontecimentos à luz da Palavra',
  description: 'Curadoria cristã de acontecimentos relevantes para a Igreja, famílias e sociedade.',
}

type Entry = {
  id: string
  version: string
  release_date: string
  title: string
  content: string
  tags: string[]
}

// ── Parsers ───────────────────────────────────────────────

function getSection(content: string, header: string): string {
  const esc = header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return content.match(new RegExp(`##\\s+${esc}[^\n]*\\n([\\s\\S]+?)(?=\\n##|$)`))?.[1]?.trim() ?? ''
}

function plainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*_>`~\[\]\-()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function readTime(content: string): string {
  const w = plainText(content).split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.ceil(w / 220))} min`
}

function fmtDate(s: string, style: 'long' | 'short' = 'short'): string {
  const d = new Date(s + 'T12:00:00')
  return style === 'long'
    ? d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    : d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function sourceOf(content: string): string {
  return getSection(content, 'Fonte original').split('\n')[0].trim() || 'Observatório Lampas'
}

function linkOf(content: string): string | null {
  return getSection(content, 'Link original').match(/https?:\/\/[^\s\n]+/)?.[0] ?? null
}

function excerptOf(content: string, len: number): string {
  const resumo = getSection(content, 'Resumo')
  const text = plainText(resumo || content)
  return text.slice(0, len) + (text.length > len ? '…' : '')
}

function categoryOf(e: Entry): string {
  return inferBoletimEditorias(e.title, e.tags)[0] ?? 'Igreja e Reino'
}

// ── Components ────────────────────────────────────────────

function Source({ label }: { label: string }) {
  return (
    <span className="obs-source">{label}</span>
  )
}

function Meta({ date, time }: { date: string; time: string }) {
  return (
    <p className="obs-meta">{date} · {time}</p>
  )
}

function LeadArticle({ entry }: { entry: Entry }) {
  const src = sourceOf(entry.content)
  const url = linkOf(entry.content)
  return (
    <article className="lead-article">
      <Source label={src} />
      <h2 className="lead-title">
        <Link href={`/boletim/${entry.id}`}>{entry.title}</Link>
      </h2>
      <p className="lead-excerpt">{excerptOf(entry.content, 320)}</p>
      <Meta date={fmtDate(entry.release_date, 'long')} time={readTime(entry.content)} />
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="obs-cta">
          Ler na fonte original →
        </a>
      )}
    </article>
  )
}

function SideArticle({ entry }: { entry: Entry }) {
  const src = sourceOf(entry.content)
  const url = linkOf(entry.content)
  return (
    <article className="side-article">
      <Source label={src} />
      <h3 className="side-title">
        <Link href={`/boletim/${entry.id}`}>{entry.title}</Link>
      </h3>
      <p className="side-excerpt">{excerptOf(entry.content, 130)}</p>
      <Meta date={fmtDate(entry.release_date, 'short')} time={readTime(entry.content)} />
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="obs-cta-sm">
          Fonte original →
        </a>
      )}
    </article>
  )
}

function GridArticle({ entry }: { entry: Entry }) {
  const src = sourceOf(entry.content)
  const url = linkOf(entry.content)
  return (
    <article className="grid-article">
      <Source label={src} />
      <h3 className="grid-title">
        <Link href={`/boletim/${entry.id}`}>{entry.title}</Link>
      </h3>
      <p className="grid-excerpt">{excerptOf(entry.content, 160)}</p>
      <Meta date={fmtDate(entry.release_date, 'short')} time={readTime(entry.content)} />
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="obs-cta-sm">
          Aprofundar →
        </a>
      )}
    </article>
  )
}

// ── Page ──────────────────────────────────────────────────

export default async function BoletimPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('boletim_entries')
    .select('id, version, release_date, title, content, tags')
    .eq('published', true)
    .order('release_date', { ascending: false })

  const entries: Entry[] = data ?? []
  const lead = entries[0]
  const secondary = entries.slice(1, 4)

  const editionLabel = lead?.version ? `Edição ${lead.version}` : null
  const editionDate = lead?.release_date
    ? fmtDate(lead.release_date, 'long')
    : fmtDate(new Date().toISOString().slice(0, 10), 'long')

  const sections = BOLETIM_EDITORIAS
    .map(name => ({ name, items: entries.filter(e => categoryOf(e) === name) }))
    .filter(s => s.items.length > 0)

  return (
    <main className="obs-shell">

      {/* ── Topbar ── */}
      <header className="obs-topbar">
        <Link href="/" className="obs-brand" aria-label="Lampas">
          <LampasLogo height={34} />
        </Link>
        <nav className="obs-nav" aria-label="Navegação">
          <Link href="/#planos">Planos</Link>
          <Link href="/auth/login">Entrar</Link>
        </nav>
      </header>

      <div className="obs-paper">

        {/* ── Edition nav ── */}
        <nav className="obs-editoria-nav" aria-label="Editorias">
          {BOLETIM_EDITORIAS.map(name => (
            <a key={name} href={`#${name.toLowerCase().replaceAll(' ', '-')}`}>{name}</a>
          ))}
        </nav>

        {/* ── Masthead ── */}
        <section className="obs-masthead">
          <div className="obs-rule-thick" />
          {editionLabel && (
            <p className="obs-edition">{editionLabel} · {editionDate}</p>
          )}
          <h1 className="obs-pub-title">Observatório Lampas</h1>
          <p className="obs-pub-slogan">Iluminando os acontecimentos à luz da Palavra.</p>
          <div className="obs-rule-thick" />
        </section>

        {/* ── Front page ── */}
        {lead ? (
          <section className="obs-front">
            <LeadArticle entry={lead} />
            {secondary.length > 0 && (
              <aside className="obs-sidebar">
                {secondary.map(e => <SideArticle key={e.id} entry={e} />)}
              </aside>
            )}
          </section>
        ) : (
          <section className="obs-empty">
            <p>A primeira edição está sendo preparada.</p>
          </section>
        )}

        {/* ── Editorial sections ── */}
        <div className="obs-sections">
          {sections.map(({ name, items }) => (
            <section
              key={name}
              id={name.toLowerCase().replaceAll(' ', '-')}
              className="obs-section-row"
            >
              <div className="obs-section-label">
                <h2>{name}</h2>
              </div>
              <div className="obs-section-grid">
                {items.slice(0, 3).map(e => (
                  <GridArticle key={e.id} entry={e} />
                ))}
              </div>
            </section>
          ))}
        </div>

      </div>

      {/* ── Footer ── */}
      <footer className="obs-footer">
        <LampasLogo height={28} />
        <div className="obs-footer-text">
          <strong>Observatório Lampas</strong>
          <span>Uma central de curadoria cristã para acompanhar acontecimentos, fontes confiáveis e recursos de aprofundamento.</span>
        </div>
      </footer>

      <style>{`
        /* ── Shell ── */
        .obs-shell {
          min-height: 100vh;
          background: #f3efe6;
          color: #15110c;
          font-family: system-ui, -apple-system, sans-serif;
        }

        /* ── Topbar ── */
        .obs-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem clamp(1.25rem, 4vw, 3rem);
          border-bottom: 1px solid #d8cdbd;
          background: #f8f4ed;
        }
        .obs-brand { display: flex; text-decoration: none; }
        .obs-nav { display: flex; gap: 1.5rem; }
        .obs-nav a {
          color: #6d6256;
          font-size: 0.84rem;
          text-decoration: none;
        }
        .obs-nav a:hover { color: #9a6a1f; }

        /* ── Paper container ── */
        .obs-paper {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 clamp(1.1rem, 3vw, 2.4rem) 4rem;
        }

        /* ── Editoria nav ── */
        .obs-editoria-nav {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.3rem 1.1rem;
          padding: 0.8rem 0;
          border-bottom: 1px solid #d8cdbd;
        }
        .obs-editoria-nav a {
          color: #5b5147;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          text-decoration: none;
        }
        .obs-editoria-nav a:hover { color: #9a6a1f; }

        /* ── Masthead ── */
        .obs-masthead {
          text-align: center;
          padding: 1.5rem 0 1.75rem;
        }
        .obs-rule-thick {
          height: 3px;
          border-top: 1px solid #15110c;
          border-bottom: 1px solid #15110c;
        }
        .obs-edition {
          margin: 1rem 0 0.4rem;
          color: #7a6d5d;
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .obs-pub-title {
          margin: 0;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(2.8rem, 9vw, 6.2rem);
          font-weight: 700;
          line-height: 0.95;
          letter-spacing: -0.01em;
        }
        .obs-pub-slogan {
          margin: 0.55rem 0 1.1rem;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(1rem, 2.2vw, 1.4rem);
          font-style: italic;
          font-weight: 400;
          color: #5b5147;
        }

        /* ── Source label ── */
        .obs-source {
          display: block;
          color: #9a6a1f;
          font-size: 0.68rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.55rem;
        }

        /* ── Meta line ── */
        .obs-meta {
          margin: 0.6rem 0 0;
          color: #7a6d5d;
          font-size: 0.74rem;
        }

        /* ── CTAs ── */
        .obs-cta {
          display: inline-block;
          margin-top: 0.9rem;
          color: #9a6a1f;
          font-size: 0.82rem;
          font-weight: 700;
          text-decoration: none;
          letter-spacing: 0.01em;
        }
        .obs-cta:hover { text-decoration: underline; }
        .obs-cta-sm {
          display: inline-block;
          margin-top: 0.5rem;
          color: #9a6a1f;
          font-size: 0.74rem;
          font-weight: 700;
          text-decoration: none;
        }
        .obs-cta-sm:hover { text-decoration: underline; }

        /* ── Front page ── */
        .obs-front {
          display: grid;
          grid-template-columns: minmax(0, 1.75fr) minmax(240px, 0.65fr);
          gap: 2.25rem;
          padding: 2rem 0 2.25rem;
          border-bottom: 2px solid #15110c;
        }

        /* ── Lead article ── */
        .lead-article { min-width: 0; }
        .lead-title {
          margin: 0;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(2.1rem, 4.5vw, 3.6rem);
          font-weight: 700;
          line-height: 1.0;
          letter-spacing: -0.01em;
        }
        .lead-title a { color: #15110c; text-decoration: none; }
        .lead-title a:hover { color: #9a6a1f; }
        .lead-excerpt {
          margin: 1rem 0 0;
          color: #4a4037;
          font-size: 1.05rem;
          line-height: 1.62;
          max-width: 58ch;
        }

        /* ── Sidebar ── */
        .obs-sidebar {
          border-left: 1px solid #d8cdbd;
          padding-left: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* ── Side article ── */
        .side-article {
          padding-bottom: 1.1rem;
          margin-bottom: 1.1rem;
          border-bottom: 1px solid #d8cdbd;
        }
        .side-article:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .side-title {
          margin: 0;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 1.12rem;
          font-weight: 700;
          line-height: 1.22;
        }
        .side-title a { color: #15110c; text-decoration: none; }
        .side-title a:hover { color: #9a6a1f; }
        .side-excerpt {
          margin: 0.45rem 0 0;
          color: #5b5147;
          font-size: 0.88rem;
          line-height: 1.5;
        }

        /* ── Editorial sections ── */
        .obs-sections { margin-top: 0.25rem; }
        .obs-section-row {
          display: grid;
          grid-template-columns: 175px 1fr;
          gap: 1.5rem;
          padding: 1.75rem 0;
          border-bottom: 1px solid #d8cdbd;
        }
        .obs-section-label { padding-top: 0.15rem; }
        .obs-section-label h2 {
          margin: 0;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 1.1rem;
          font-weight: 700;
          border-top: 2px solid #9a6a1f;
          padding-top: 0.5rem;
          color: #15110c;
        }
        .obs-section-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 1.25rem 1.5rem;
        }

        /* ── Grid article ── */
        .grid-article { min-width: 0; }
        .grid-title {
          margin: 0;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 1.18rem;
          font-weight: 700;
          line-height: 1.2;
        }
        .grid-title a { color: #15110c; text-decoration: none; }
        .grid-title a:hover { color: #9a6a1f; }
        .grid-excerpt {
          margin: 0.5rem 0 0;
          color: #5b5147;
          font-size: 0.88rem;
          line-height: 1.52;
        }

        /* ── Empty state ── */
        .obs-empty {
          padding: 4rem 0;
          text-align: center;
          border-bottom: 1px solid #d8cdbd;
          color: #7a6d5d;
          font-size: 1rem;
        }

        /* ── Footer ── */
        .obs-footer {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 2.25rem clamp(1.25rem, 4vw, 3rem);
          border-top: 1px solid #d8cdbd;
          background: #f8f4ed;
        }
        .obs-footer-text {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .obs-footer-text strong {
          color: #15110c;
          font-size: 0.88rem;
        }
        .obs-footer-text span {
          color: #7a6d5d;
          font-size: 0.8rem;
          max-width: 520px;
          line-height: 1.5;
        }

        /* ── Responsive ── */
        @media (max-width: 860px) {
          .obs-front {
            grid-template-columns: 1fr;
          }
          .obs-sidebar {
            border-left: none;
            border-top: 1px solid #d8cdbd;
            padding-left: 0;
            padding-top: 1.5rem;
          }
          .obs-section-row {
            grid-template-columns: 1fr;
          }
          .obs-section-label h2 {
            font-size: 0.82rem;
            text-transform: uppercase;
            letter-spacing: 0.07em;
          }
        }

        @media (max-width: 560px) {
          .obs-nav { display: none; }
          .obs-editoria-nav { justify-content: flex-start; }
          .obs-section-grid { grid-template-columns: 1fr; }
          .obs-footer { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

    </main>
  )
}
