import Link from 'next/link'
import type { Metadata } from 'next'
import { LampasLogo } from '@/components/LampasLogo'
import { createClient } from '@/lib/supabase/server'
import { BOLETIM_EDITORIAS, BOLETIM_SOCIEDADE_SUBAREAS, inferBoletimEditorias } from '@/lib/boletim-editorial'

export const metadata: Metadata = {
  title: 'Observatório Lampas — Iluminando os acontecimentos à luz da Palavra',
  description: 'Iluminando os acontecimentos à luz da Palavra, com curadoria cristã, fontes confiáveis e recursos de aprofundamento.',
}

type BoletimEntry = {
  id: string
  version: string
  release_date: string
  title: string
  content: string
  tags: string[]
}

const PRACTICAL_BLOCKS = [
  { title: 'O que aconteceu?', text: 'Síntese objetiva dos fatos principais, com distinção entre acontecimento e interpretação.' },
  { title: 'Quem publicou?', text: 'Destaque para fonte original, autor, ministério ou organização responsável.' },
  { title: 'Por que é relevante?', text: 'Contexto breve para cristãos, igrejas e famílias, sem transformar a notícia em sermão.' },
  { title: 'Onde aprofundar?', text: 'Links e referências para que o leitor pesquise nas melhores fontes disponíveis.' },
]

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

function excerpt(entry: BoletimEntry, fallback = 'Uma curadoria para entender o que aconteceu, quem publicou e onde aprofundar a pesquisa.') {
  const text = plainText(entry.content)
  return text ? `${text.slice(0, 180)}${text.length > 180 ? '...' : ''}` : fallback
}

function editoriaFor(entry: BoletimEntry) {
  return inferBoletimEditorias(entry.title, entry.tags)[0] ?? 'Igreja e Reino'
}

function ArticleTeaser({ entry, variant = 'regular' }: { entry: BoletimEntry; variant?: 'lead' | 'regular' | 'compact' }) {
  const category = editoriaFor(entry)
  return (
    <article className={`news-item news-item-${variant}`}>
      <div className="item-kicker">{category}</div>
      <h2 className="item-title">
        <Link href={`/boletim/${entry.id}`}>{entry.title}</Link>
      </h2>
      <p className="item-subtitle">{excerpt(entry)}</p>
      <div className="item-meta">
        <span>Equipe Lampas</span>
        <span>{readTime(entry.content)}</span>
      </div>
    </article>
  )
}

export default async function BoletimPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('boletim_entries')
    .select('id, version, release_date, title, content, tags')
    .eq('published', true)
    .order('release_date', { ascending: false })

  const entries: BoletimEntry[] = data ?? []
  const lead = entries[0]
  const secondary = entries.slice(1, 4)
  const edition = lead?.version ? `Edição ${lead.version}` : 'Edição inicial'
  const date = lead?.release_date ? formatDate(lead.release_date) : formatDate(new Date().toISOString().slice(0, 10))

  const entriesBySection = BOLETIM_EDITORIAS.map(section => ({
    section,
    entries: entries.filter(entry => editoriaFor(entry) === section).slice(0, 3),
  }))

  return (
    <main className="paper-shell">
      <header className="topbar">
        <Link href="/" className="brand" aria-label="Lampas — página inicial">
          <LampasLogo height={34} />
        </Link>
        <nav className="site-nav" aria-label="Navegação">
          <Link href="/#recursos">Recursos</Link>
          <Link href="/#planos">Planos</Link>
          <Link href="/auth/login">Entrar</Link>
        </nav>
      </header>

      <div className="paper">
        <nav className="edition-nav" aria-label="Editorias">
          {BOLETIM_EDITORIAS.map(item => <a key={item} href={`#${item.toLowerCase().replaceAll(' ', '-')}`}>{item}</a>)}
        </nav>

        <section className="masthead">
          <div className="masthead-rule" />
          <p>{edition} · {date}</p>
          <h1>Observatório Lampas</h1>
          <h2>Iluminando os acontecimentos à luz da Palavra</h2>
          <div className="masthead-rule" />
        </section>

        {lead ? (
          <section className="front-page">
            <ArticleTeaser entry={lead} variant="lead" />
            <div className="secondary-column">
              {secondary.map(entry => <ArticleTeaser key={entry.id} entry={entry} variant="compact" />)}
            </div>
          </section>
        ) : (
          <section className="empty-edition">
            <h2>A primeira edição está sendo preparada.</h2>
            <p>Em breve, curadorias sobre igreja, mundo, sociedade, família, profissão, educação e ministério.</p>
          </section>
        )}

        <section className="society-strip" aria-labelledby="curadoria-subareas">
          <h2 id="curadoria-subareas">Curadoria</h2>
          <div>
            {BOLETIM_SOCIEDADE_SUBAREAS.map(item => <span key={item}>{item}</span>)}
          </div>
        </section>

        <section className="practical-blocks" aria-label="Blocos especiais">
          {PRACTICAL_BLOCKS.map(block => (
            <article key={block.title}>
              <h2>{block.title}</h2>
              <p>{block.text}</p>
            </article>
          ))}
        </section>

        <section className="sections">
          {entriesBySection.map(({ section, entries: sectionEntries }) => (
            <div key={section} id={section.toLowerCase().replaceAll(' ', '-')} className="section-row">
              <div className="section-heading">
                <h2>{section}</h2>
              </div>
              <div className="section-grid">
                {(sectionEntries.length > 0 ? sectionEntries : entries.slice(0, 3)).map(entry => (
                  <ArticleTeaser key={`${section}-${entry.id}`} entry={entry} />
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>

      <footer className="paper-footer">
        <LampasLogo height={30} />
        <p>Iluminando os acontecimentos à luz da Palavra.</p>
      </footer>

      <style>{`
        .paper-shell {
          min-height: 100vh;
          background: #f3efe6;
          color: #15110c;
          font-family: inherit;
        }
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem clamp(1.25rem, 4vw, 3rem);
          border-bottom: 1px solid #d8cdbd;
          background: #f8f4ed;
        }
        .brand { display: flex; text-decoration: none; }
        .site-nav { display: flex; gap: 1.5rem; }
        .site-nav a {
          color: #6d6256;
          text-decoration: none;
          font-size: 0.84rem;
        }
        .paper {
          max-width: 1180px;
          margin: 0 auto;
          padding: 1.2rem clamp(1.1rem, 3vw, 2.4rem) 4rem;
        }
        .edition-nav {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.35rem 1rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid #d8cdbd;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .edition-nav a { color: #5b5147; text-decoration: none; }
        .masthead {
          text-align: center;
          padding: 1rem 0 1.35rem;
        }
        .masthead-rule {
          height: 3px;
          border-top: 1px solid #15110c;
          border-bottom: 1px solid #15110c;
        }
        .masthead p {
          margin: 0.8rem 0 0.35rem;
          color: #7a6d5d;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .masthead h1 {
          margin: 0;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(2.7rem, 9vw, 6.4rem);
          font-weight: 700;
          line-height: 0.95;
          letter-spacing: 0;
        }
        .masthead h2 {
          margin: 0.4rem 0 0.9rem;
          color: #5b5147;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(1rem, 2.2vw, 1.45rem);
          font-style: italic;
          font-weight: 400;
        }
        .front-page {
          display: grid;
          grid-template-columns: minmax(0, 1.55fr) minmax(280px, 0.75fr);
          gap: 1.5rem;
          padding: 1.4rem 0;
          border-bottom: 1px solid #d8cdbd;
        }
        .secondary-column {
          display: grid;
          gap: 1rem;
          align-content: start;
          border-left: 1px solid #d8cdbd;
          padding-left: 1.25rem;
        }
        .news-item { min-width: 0; }
        .item-kicker {
          color: #9a6a1f;
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.35rem;
        }
        .item-title {
          margin: 0;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 1.25rem;
          line-height: 1.16;
          letter-spacing: 0;
        }
        .item-title a { color: #15110c; text-decoration: none; }
        .item-title a:hover { color: #9a6a1f; }
        .news-item-lead .item-title {
          font-size: clamp(2rem, 5vw, 4rem);
          line-height: 1;
        }
        .news-item-compact {
          padding-bottom: 1rem;
          border-bottom: 1px solid #d8cdbd;
        }
        .news-item-compact:last-child { border-bottom: none; padding-bottom: 0; }
        .news-item-compact .item-title { font-size: 1.08rem; }
        .item-subtitle {
          margin: 0.55rem 0 0;
          color: #5b5147;
          font-size: 0.94rem;
          line-height: 1.55;
        }
        .news-item-lead .item-subtitle {
          max-width: 720px;
          font-size: 1.05rem;
        }
        .item-meta {
          display: flex;
          gap: 0.65rem;
          margin-top: 0.7rem;
          color: #7a6d5d;
          font-size: 0.76rem;
        }
        .society-strip {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 1rem;
          align-items: start;
          padding: 1.2rem 0;
          border-bottom: 1px solid #d8cdbd;
        }
        .society-strip h2,
        .section-heading h2,
        .practical-blocks h2 {
          margin: 0;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 1.18rem;
          letter-spacing: 0;
        }
        .society-strip div {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem 0.8rem;
        }
        .society-strip span {
          color: #5b5147;
          font-size: 0.84rem;
        }
        .practical-blocks {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
          padding: 1.25rem 0;
          border-bottom: 1px solid #d8cdbd;
        }
        .practical-blocks article {
          border-top: 2px solid #15110c;
          padding-top: 0.65rem;
        }
        .practical-blocks p {
          margin: 0.35rem 0 0;
          color: #5b5147;
          font-size: 0.86rem;
          line-height: 1.48;
        }
        .section-row {
          display: grid;
          grid-template-columns: 190px 1fr;
          gap: 1.25rem;
          padding: 1.4rem 0;
          border-bottom: 1px solid #d8cdbd;
        }
        .section-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.1rem;
        }
        .empty-edition {
          padding: 3rem 0;
          border-bottom: 1px solid #d8cdbd;
          text-align: center;
        }
        .empty-edition h2 {
          margin: 0 0 0.5rem;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 2rem;
        }
        .empty-edition p { margin: 0 auto; max-width: 620px; color: #5b5147; line-height: 1.6; }
        .paper-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 2rem 1.25rem;
          border-top: 1px solid #d8cdbd;
          background: #f8f4ed;
          color: #6d6256;
          text-align: center;
        }
        .paper-footer p { margin: 0; font-size: 0.84rem; }
        @media (max-width: 860px) {
          .front-page,
          .society-strip,
          .section-row {
            grid-template-columns: 1fr;
          }
          .secondary-column {
            border-left: none;
            border-top: 1px solid #d8cdbd;
            padding-left: 0;
            padding-top: 1rem;
          }
          .practical-blocks,
          .section-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 620px) {
          .site-nav { display: none; }
          .edition-nav { justify-content: flex-start; }
          .practical-blocks,
          .section-grid {
            grid-template-columns: 1fr;
          }
          .paper-footer { flex-direction: column; }
        }
      `}</style>
    </main>
  )
}
