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
            <p className="dv-meta">Dia {String(num).padStart(3, '0')}</p>
            <h1 className="dv-title">Em preparação</h1>
            <p style={{ color: 'var(--dv-muted)', fontSize: '0.95rem' }}>
              O conteúdo desta devocional estará disponível em breve.
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
            {num > 1
              ? <Link href={`/devocional/${num - 1}`} className="dv-nav-link">← Anterior</Link>
              : <Link href="/" className="dv-nav-link">← Início</Link>
            }
            <Link href={`/devocional/${num + 1}`} className="dv-nav-link">Próximo →</Link>
          </nav>

          {/* Metadados */}
          <p className="dv-meta">
            Dia {String(num).padStart(3, '0')}
            {d.bloco > 1 ? ` · Bloco ${d.bloco} · ${d.unidade}` : ` · ${d.unidade}`}
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
            <p>{d.paraComecar}</p>

            <p>{d.oTexto}</p>

            <div className="dv-verdade">
              <p style={{ margin: 0 }}>{d.verdadeCentral}</p>
            </div>

            <p>{d.cristoNoTexto}</p>

            <ul className="dv-lista">
              {d.paraHoje.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>

          {/* Pergunta do dia */}
          <div className="dv-pergunta-bloco">
            <p className="dv-pergunta">{d.perguntaDoDia}</p>
          </div>

          {/* Oração */}
          <div className="dv-oracao-bloco">
            <p className="dv-oracao-texto">{d.oracao}</p>
          </div>

          {/* Trilhas — abas interativas */}
          <DevocionalTrilhas d={d} />

          {/* Navegação inferior */}
          <div className="dv-nav-bottom">
            <Link href={`/devocional/${num + 1}`} className="hp-btn hp-btn-primary">
              <span className="hp-btn-label">Dia {String(num + 1).padStart(3, '0')}</span>
              <span className="hp-btn-sub">Próximo dia →</span>
            </Link>
          </div>

        </div>
      </main>
    </div>
  )
}
