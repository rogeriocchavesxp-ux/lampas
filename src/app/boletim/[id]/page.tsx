import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { LampasLogo } from '@/components/LampasLogo'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { createClient } from '@/lib/supabase/server'
import { inferBoletimEditorias } from '@/lib/boletim-editorial'

type Props = { params: Promise<{ id: string }> }

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

function fmtDate(s: string): string {
  return new Date(s + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function sourceOf(content: string): string {
  return getSection(content, 'Fonte original').split('\n')[0].trim() || 'Observatório Lampas'
}

function authorOf(content: string): string | null {
  const a = getSection(content, 'Autor').split('\n')[0].trim()
  return (!a || a.toLowerCase().startsWith('não informado')) ? null : a
}

function linkOf(content: string): string | null {
  return getSection(content, 'Link original').match(/https?:\/\/[^\s\n]+/)?.[0] ?? null
}

function lede(content: string): string {
  const resumo = getSection(content, 'Resumo')
  const text = plainText(resumo || content)
  return text.slice(0, 320) + (text.length > 320 ? '…' : '')
}

// ── Data ─────────────────────────────────────────────────

async function loadEntry(id: string): Promise<Entry | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('boletim_entries')
    .select('id, version, release_date, title, content, tags')
    .eq('id', id)
    .eq('published', true)
    .maybeSingle()
  return data as Entry | null
}

// ── Metadata ─────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const entry = await loadEntry(id)
  if (!entry) return { title: 'Matéria não encontrada — Observatório Lampas' }
  return {
    title: `${entry.title} — Observatório Lampas`,
    description: lede(entry.content),
  }
}

// ── Page ─────────────────────────────────────────────────

export default async function BoletimArticlePage({ params }: Props) {
  const { id } = await params
  const entry = await loadEntry(id)
  if (!entry) notFound()

  const source = sourceOf(entry.content)
  const author = authorOf(entry.content)
  const originalLink = linkOf(entry.content)
  const categories = inferBoletimEditorias(entry.title, entry.tags)

  const conteudo = getSection(entry.content, 'Resumo do conteúdo')
  const leituraAdicional = getSection(entry.content, 'Leitura adicional')

  return (
    <main className="art-shell">

      {/* ── Topbar ── */}
      <header className="art-topbar">
        <Link href="/" className="art-brand" aria-label="Lampas">
          <LampasLogo height={34} />
        </Link>
        <div className="art-topbar-right">
          <Link href="/boletim" className="art-back">← Observatório Lampas</Link>
          {originalLink && (
            <a href={originalLink} target="_blank" rel="noopener noreferrer" className="art-source-cta">
              Ler na fonte original ↗
            </a>
          )}
        </div>
      </header>

      <article className="art-body">

        {/* ── Article header ── */}
        <div className="art-rule-thick" />
        <p className="art-categories">{categories.join(' · ')}</p>
        <p className="art-source-label">{source}</p>
        <h1 className="art-title">{entry.title}</h1>

        <div className="art-byline">
          {author && <span>{author}</span>}
          <time dateTime={entry.release_date}>{fmtDate(entry.release_date)}</time>
          <span>{readTime(entry.content)} de leitura</span>
        </div>

        <div className="art-rule-thin" />

        {/* ── Lede ── */}
        <p className="art-lede">{lede(entry.content)}</p>

        {/* ── Body ── */}
        {conteudo && (
          <section className="art-content">
            <MarkdownRenderer content={conteudo} moduleColor="#9a6a1f" />
          </section>
        )}

        {/* ── Source CTA ── */}
        {originalLink && (
          <div className="art-cta-block">
            <a href={originalLink} target="_blank" rel="noopener noreferrer" className="art-cta-btn">
              Ler na fonte original →
            </a>
            <span className="art-cta-source">{source}</span>
          </div>
        )}

        {/* ── Leitura adicional ── */}
        {leituraAdicional && (
          <section className="art-further">
            <h2 className="art-further-title">Leitura adicional</h2>
            <MarkdownRenderer content={leituraAdicional} moduleColor="#9a6a1f" />
          </section>
        )}

        {/* ── Tags ── */}
        {entry.tags.length > 0 && (
          <div className="art-tags">
            {entry.tags.map(tag => (
              <span key={tag} className="art-tag">{tag}</span>
            ))}
          </div>
        )}

      </article>

      <style>{`
        .art-shell {
          min-height: 100vh;
          background: #f3efe6;
          color: #15110c;
          font-family: system-ui, -apple-system, sans-serif;
        }

        /* ── Topbar ── */
        .art-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem clamp(1.25rem, 4vw, 3rem);
          border-bottom: 1px solid #d8cdbd;
          background: #f8f4ed;
          flex-wrap: wrap;
        }
        .art-brand { display: flex; text-decoration: none; }
        .art-topbar-right {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }
        .art-back {
          color: #6d6256;
          font-size: 0.84rem;
          text-decoration: none;
          font-weight: 600;
        }
        .art-back:hover { color: #9a6a1f; }
        .art-source-cta {
          padding: 0.4rem 0.9rem;
          border: 1px solid #9a6a1f;
          border-radius: 4px;
          color: #9a6a1f;
          font-size: 0.78rem;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
        }
        .art-source-cta:hover {
          background: #9a6a1f;
          color: #fff;
        }

        /* ── Article body ── */
        .art-body {
          max-width: 760px;
          margin: 0 auto;
          padding: 2rem clamp(1.25rem, 4vw, 2rem) 5rem;
        }

        /* ── Rules ── */
        .art-rule-thick {
          height: 3px;
          border-top: 1px solid #15110c;
          border-bottom: 1px solid #15110c;
          margin-bottom: 1.4rem;
        }
        .art-rule-thin {
          border: none;
          border-top: 1px solid #d8cdbd;
          margin: 1.25rem 0 1.75rem;
        }

        /* ── Header ── */
        .art-categories {
          margin: 0 0 0.3rem;
          color: #7a6d5d;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .art-source-label {
          margin: 0 0 0.65rem;
          color: #9a6a1f;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .art-title {
          margin: 0;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(2.1rem, 5vw, 3.8rem);
          font-weight: 700;
          line-height: 0.98;
          letter-spacing: -0.01em;
        }
        .art-byline {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem 1rem;
          margin-top: 1.1rem;
          color: #7a6d5d;
          font-size: 0.78rem;
        }

        /* ── Lede ── */
        .art-lede {
          margin: 0 0 1.75rem;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 1.18rem;
          line-height: 1.62;
          color: #3a3028;
          font-style: italic;
        }

        /* ── Content ── */
        .art-content {
          padding-bottom: 2rem;
          border-bottom: 1px solid #d8cdbd;
        }
        .art-content p {
          color: #24201b;
          line-height: 1.72;
          font-size: 1.05rem;
          margin: 0 0 1rem;
        }

        /* ── Source CTA block ── */
        .art-cta-block {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem 0;
          border-bottom: 1px solid #d8cdbd;
          flex-wrap: wrap;
        }
        .art-cta-btn {
          padding: 0.6rem 1.25rem;
          background: #9a6a1f;
          color: #fff;
          font-size: 0.85rem;
          font-weight: 700;
          text-decoration: none;
          border-radius: 4px;
          white-space: nowrap;
        }
        .art-cta-btn:hover { background: #7f5619; }
        .art-cta-source {
          color: #7a6d5d;
          font-size: 0.8rem;
        }

        /* ── Further reading ── */
        .art-further {
          padding: 1.5rem 0;
          border-bottom: 1px solid #d8cdbd;
        }
        .art-further-title {
          margin: 0 0 0.75rem;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #5b5147;
        }

        /* ── Tags ── */
        .art-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          padding-top: 1.25rem;
        }
        .art-tag {
          border: 1px solid #d8cdbd;
          color: #5b5147;
          padding: 0.25rem 0.55rem;
          font-size: 0.74rem;
          letter-spacing: 0.02em;
        }

        @media (max-width: 560px) {
          .art-topbar-right { gap: 0.75rem; }
        }
      `}</style>

    </main>
  )
}
