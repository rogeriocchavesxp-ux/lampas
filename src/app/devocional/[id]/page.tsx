import type { Metadata } from 'next'
import Link from 'next/link'
import { devocionais, type Devocional } from '@/data/devocionais'
import { DevocionalTrilhas } from './DevocionalTrilhas'
import '../../homepage.css'
import './devocional.css'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const d = devocionais[parseInt(id, 10)]
  if (!d) return { title: 'Devocional — Lampas' }
  return {
    title: `${d.titulo} — Lampas`,
    description: d.paraComecar,
  }
}

const HISTORIA_LABEL: Record<Devocional['historia'], string> = {
  criacao:    'Criação',
  queda:      'Queda',
  redencao:   'Redenção',
  consumacao: 'Consumação',
}

export default async function DevocionalPage({ params }: Props) {
  const { id } = await params
  const num = parseInt(id, 10)
  const d = devocionais[num]

  if (!d) {
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
            <p className="dv-meta">Devocional {num}</p>
            <h1 className="dv-title">Em preparação</h1>
            <p style={{ color: 'var(--dv-muted)', fontSize: '0.95rem' }}>
              O conteúdo desta devocional estará disponível em 2027.
            </p>
            <div style={{ marginTop: '1.5rem' }}>
              <Link href="/" className="dv-nav-link">← Voltar ao início</Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

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

          {/* Navegação superior */}
          <nav className="dv-nav" aria-label="Navegação entre dias">
            {num > 1 ? (
              <Link href={`/devocional/${num - 1}`} className="dv-nav-link">← Anterior</Link>
            ) : (
              <span />
            )}
            <Link href={`/devocional/${num + 1}`} className="dv-nav-link">Próximo →</Link>
          </nav>

          {/* Metadados */}
          <p className="dv-meta">
            {d.diaSemana.charAt(0).toUpperCase() + d.diaSemana.slice(1)}, {d.data.split('-').reverse().join('/')}
            {d.semana > 0 && ` · Semana ${d.semana} · ${d.unidade}`}
          </p>

          {/* Tags */}
          <div className="dv-tags">
            <span className="dv-tag dv-tag-historia">{HISTORIA_LABEL[d.historia]}</span>
            <span className="dv-tag dv-tag-pergunta">{d.pergunta.texto}</span>
          </div>

          {/* Título */}
          <h1 className="dv-title">{d.titulo}</h1>
          <p className="dv-leitura">{d.leitura}</p>

          {/* Versículo-chave */}
          <blockquote className="dv-versiculo">
            <p>&ldquo;{d.versiculoChave.texto}&rdquo;</p>
            <cite>{d.versiculoChave.referencia} — ARA</cite>
          </blockquote>

          {/* Corpo — texto corrido */}
          <div className="dv-corpo">
            <p className="dv-secao-label">Para começar</p>
            <p>{d.paraComecar}</p>

            <p className="dv-secao-label">O texto</p>
            <p>{d.oTexto}</p>

            <p className="dv-secao-label">A verdade central</p>
            <div className="dv-verdade">
              <p style={{ margin: 0 }}>{d.verdadeCentral}</p>
            </div>

            <p className="dv-secao-label">Cristo no texto</p>
            <p>{d.cristoNoTexto}</p>

            <p className="dv-secao-label">Para hoje</p>
            <ul className="dv-lista">
              {d.paraHoje.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>

          {/* Pergunta do dia */}
          <div className="dv-pergunta-bloco">
            <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dv-accent)', marginBottom: '0.4rem' }}>Pergunta do dia</p>
            <p className="dv-pergunta">{d.perguntaDoDia}</p>
          </div>

          {/* Oração */}
          <p className="dv-secao-label">Oração</p>
          <div className="dv-oracao-bloco">
            <p className="dv-oracao-texto">{d.oracao}</p>
          </div>

          {/* Trilhas — abas interativas */}
          <DevocionalTrilhas d={d} />

          {/* Navegação inferior */}
          <div className="dv-nav-bottom">
            <Link href={`/devocional/${num + 1}`} className="hp-btn hp-btn-primary">
              <span className="hp-btn-label">{num + 1}ª Devocional</span>
              <span className="hp-btn-sub">Próximo dia →</span>
            </Link>
          </div>

        </div>
      </main>
    </div>
  )
}
