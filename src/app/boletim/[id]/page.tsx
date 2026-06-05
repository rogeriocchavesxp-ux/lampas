import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { LampasLogo } from '@/components/LampasLogo'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { createClient } from '@/lib/supabase/server'
import { inferBoletimEditorias } from '@/lib/boletim-editorial'

type Props = {
  params: Promise<{ id: string }>
}

type BoletimEntry = {
  id: string
  version: string
  release_date: string
  title: string
  content: string
  tags: string[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function plainText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#*_>`~\[\]()-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function readTime(markdown: string) {
  const words = plainText(markdown).split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.ceil(words / 220))} min`
}

function summary(markdown: string) {
  const text = plainText(markdown)
  if (!text) return 'Um artigo do Boletim Lampas para interpretar a vida à luz da Escritura, com cosmovisão cristã reformada.'
  return `${text.slice(0, 260)}${text.length > 260 ? '...' : ''}`
}

function editorias(entry: BoletimEntry) {
  return inferBoletimEditorias(entry.title, entry.tags)
}

async function loadEntry(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('boletim_entries')
    .select('id, version, release_date, title, content, tags')
    .eq('id', id)
    .eq('published', true)
    .maybeSingle()

  return data as BoletimEntry | null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const entry = await loadEntry(id)
  if (!entry) return { title: 'Artigo não encontrado — Boletim Lampas' }
  return {
    title: `${entry.title} — Boletim Lampas`,
    description: summary(entry.content),
  }
}

export default async function BoletimArticlePage({ params }: Props) {
  const { id } = await params
  const entry = await loadEntry(id)
  if (!entry) notFound()

  const areas = editorias(entry)

  return (
    <main className="article-shell">
      <header className="article-topbar">
        <Link href="/" className="brand" aria-label="Lampas — página inicial">
          <LampasLogo height={34} />
        </Link>
        <Link href="/boletim" className="back-link">Boletim Lampas</Link>
      </header>

      <article className="article">
        <div className="article-rule" />
        <p className="kicker">{areas.join(' · ')}</p>
        <h1>{entry.title}</h1>
        <p className="subtitle">{summary(entry.content)}</p>

        <div className="byline">
          <span>Equipe Lampas</span>
          <time dateTime={entry.release_date}>{formatDate(entry.release_date)}</time>
          <span>{readTime(entry.content)} de leitura</span>
        </div>
        <div className="article-rule thin" />

        <section className="executive">
          <h2>Resumo executivo</h2>
          <p>{summary(entry.content)}</p>
        </section>

        <section className="worldview">
          {['Criação', 'Queda', 'Redenção', 'Consumação'].map(stage => (
            <div key={stage}>
              <h2>{stage}</h2>
              <p>{stage === 'Criação'
                ? 'O tema deve ser lido a partir do propósito bom de Deus para a vida humana.'
                : stage === 'Queda'
                  ? 'A análise considera como o pecado distorce desejos, instituições e cultura.'
                  : stage === 'Redenção'
                    ? 'A esperança cristã passa por Cristo, sua obra e a formação de um povo santo.'
                    : 'A leitura aponta para o reino consumado, justiça final e restauração plena.'}</p>
            </div>
          ))}
        </section>

        <section className="body">
          <h2>Texto completo</h2>
          <MarkdownRenderer content={entry.content} moduleColor="#9a6a1f" />
        </section>

        <section className="applications">
          <h2>Aplicações</h2>
          <div>
            <article>
              <h3>Para o indivíduo</h3>
              <p>Examine desejos, hábitos e decisões diante da Escritura, buscando obediência concreta e arrependimento real.</p>
            </article>
            <article>
              <h3>Para a família</h3>
              <p>Transforme o tema em conversa doméstica, oração e práticas simples de discipulado no lar.</p>
            </article>
            <article>
              <h3>Para a igreja</h3>
              <p>Use o conteúdo para formar discernimento comunitário, cuidado pastoral e maturidade doutrinária.</p>
            </article>
            <article>
              <h3>Para a sociedade</h3>
              <p>Leia a vida pública com fidelidade bíblica, prudência cristã e amor ao próximo.</p>
            </article>
          </div>
        </section>

        <section className="resources">
          <h2>Recursos relacionados</h2>
          <div>
            {areas.map(area => <span key={area}>{area}</span>)}
            {entry.tags.map(tag => <span key={tag}>{tag}</span>)}
          </div>
        </section>
      </article>

      <style>{`
        .article-shell {
          min-height: 100vh;
          background: #f3efe6;
          color: #15110c;
          font-family: inherit;
        }
        .article-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem clamp(1.25rem, 4vw, 3rem);
          border-bottom: 1px solid #d8cdbd;
          background: #f8f4ed;
        }
        .brand { display: flex; text-decoration: none; }
        .back-link {
          color: #6d6256;
          text-decoration: none;
          font-size: 0.86rem;
          font-weight: 650;
        }
        .article {
          max-width: 850px;
          margin: 0 auto;
          padding: 2rem clamp(1.25rem, 4vw, 2rem) 4rem;
        }
        .article-rule {
          height: 3px;
          border-top: 1px solid #15110c;
          border-bottom: 1px solid #15110c;
          margin-bottom: 1.25rem;
        }
        .article-rule.thin {
          height: 1px;
          border-top: 1px solid #d8cdbd;
          border-bottom: none;
          margin: 1.2rem 0 1.5rem;
        }
        .kicker {
          margin: 0 0 0.65rem;
          color: #9a6a1f;
          font-size: 0.75rem;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        h1 {
          margin: 0;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(2.25rem, 6vw, 4.6rem);
          line-height: 0.98;
          letter-spacing: 0;
        }
        .subtitle {
          margin: 0.9rem 0 0;
          max-width: 760px;
          color: #5b5147;
          font-size: 1.08rem;
          line-height: 1.58;
        }
        .byline {
          display: flex;
          flex-wrap: wrap;
          gap: 0.55rem 0.9rem;
          margin-top: 1rem;
          color: #7a6d5d;
          font-size: 0.8rem;
        }
        .executive,
        .body,
        .applications,
        .resources {
          padding: 1.3rem 0;
          border-bottom: 1px solid #d8cdbd;
        }
        .executive h2,
        .body h2,
        .applications h2,
        .resources h2,
        .worldview h2 {
          margin: 0 0 0.55rem;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 1.22rem;
          letter-spacing: 0;
        }
        .executive p,
        .worldview p,
        .applications p {
          margin: 0;
          color: #5b5147;
          line-height: 1.62;
        }
        .worldview {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
          padding: 1.25rem 0;
          border-bottom: 1px solid #d8cdbd;
        }
        .worldview div,
        .applications article {
          border-top: 2px solid #15110c;
          padding-top: 0.65rem;
        }
        .body :global(p) {
          color: #24201b;
          line-height: 1.72;
        }
        .applications > div {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }
        .applications h3 {
          margin: 0 0 0.35rem;
          font-size: 0.95rem;
        }
        .resources div {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
        }
        .resources span {
          border: 1px solid #d8cdbd;
          color: #5b5147;
          padding: 0.28rem 0.5rem;
          font-size: 0.76rem;
        }
        @media (max-width: 760px) {
          .worldview,
          .applications > div {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  )
}
