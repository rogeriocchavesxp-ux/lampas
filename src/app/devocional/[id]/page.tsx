import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { devocionais, type Devocional } from '@/data/devocionais'
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

const DESTAQUE_LABEL: Record<string, string> = {
  familia: 'Família',
  homem:   'Homem',
  mulher:  'Mulher',
  coisas:  'Coisas',
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
            <p className="dv-eyebrow">Devocional Anual 2027 · {num}ª</p>
            <h1 className="dv-title">Em preparação</h1>
            <p className="dv-body">
              O conteúdo desta devocional estará disponível em 2027. Acompanhe o lançamento.
            </p>
            <div className="dv-ctas">
              <Link href="/" className="dv-btn">← Voltar à página inicial</Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const destaqueTexto = d.destaques.length === 1
    ? `Hoje o texto fala especialmente à ${DESTAQUE_LABEL[d.destaques[0]]}`
    : `Hoje o texto fala especialmente ao ${DESTAQUE_LABEL[d.destaques[0]]} e à ${DESTAQUE_LABEL[d.destaques[1]]}`

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

          {/* Navegação */}
          <nav className="dv-nav-dias" aria-label="Navegação entre dias">
            {num > 1 && (
              <Link href={`/devocional/${num - 1}`} className="dv-nav-link">← Dia anterior</Link>
            )}
            <Link href="/devocional/2" className="dv-nav-link dv-nav-next">Próximo dia →</Link>
          </nav>

          {/* Metadados */}
          <p className="dv-eyebrow">
            {d.diaSemana.charAt(0).toUpperCase() + d.diaSemana.slice(1)}, {d.data.split('-').reverse().join('/')} · Semana {d.semana} · {d.unidade}
          </p>

          {/* Etiquetas */}
          <div className="dv-tags">
            <span className="dv-tag dv-tag-historia">Na história da salvação: <strong>{HISTORIA_LABEL[d.historia]}</strong></span>
            <span className="dv-tag dv-tag-pergunta">A pergunta de hoje: <strong>{d.pergunta.texto}</strong></span>
          </div>

          {/* Título e leitura */}
          <h1 className="dv-title">{d.titulo}</h1>
          <p className="dv-leitura">Leitura: <strong>{d.leitura}</strong></p>

          {/* Versículo-chave */}
          <blockquote className="dv-versiculo">
            <p>&ldquo;{d.versiculoChave.texto}&rdquo;</p>
            <cite>{d.versiculoChave.referencia} — ARA</cite>
          </blockquote>

          {/* Selo de destaque */}
          <div className="dv-destaque-selo">
            <span className="dv-destaque-ico" aria-hidden="true">★</span>
            {destaqueTexto}
          </div>

          {/* Para começar */}
          <section className="dv-bloco">
            <h2 className="dv-bloco-titulo">Para começar</h2>
            <p>{d.paraComecar}</p>
          </section>

          {/* O texto */}
          <section className="dv-bloco">
            <h2 className="dv-bloco-titulo">O texto</h2>
            <p>{d.oTexto}</p>
          </section>

          {/* A verdade central */}
          <section className="dv-bloco dv-bloco-destaque">
            <h2 className="dv-bloco-titulo">A verdade central</h2>
            <p>{d.verdadeCentral}</p>
          </section>

          {/* Cristo no texto */}
          <section className="dv-bloco">
            <h2 className="dv-bloco-titulo">Cristo no texto</h2>
            <p>{d.cristoNoTexto}</p>
          </section>

          {/* Para hoje */}
          <section className="dv-bloco">
            <h2 className="dv-bloco-titulo">Para hoje</h2>
            <ul className="dv-lista">
              {d.paraHoje.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Pergunta do dia */}
          <section className="dv-bloco dv-bloco-pergunta">
            <p className="dv-pergunta-label">Pergunta do dia</p>
            <p className="dv-pergunta">{d.perguntaDoDia}</p>
          </section>

          {/* Oração */}
          <section className="dv-bloco dv-bloco-oracao">
            <h2 className="dv-bloco-titulo">Oração</h2>
            <p className="dv-oracao-texto">{d.oracao}</p>
          </section>

          {/* Trilhas */}
          <section className="dv-trilhas">
            <h2 className="dv-trilhas-titulo">Ir mais fundo — escolha a sua trilha</h2>
            <div className="dv-trilha-grid">

              {/* Homem */}
              <div className={`dv-trilha-card dv-trilha-homem${d.destaques.includes('homem') ? ' dv-trilha-em-destaque' : ''}`}>
                {d.destaques.includes('homem') && <span className="dv-trilha-badge">Destaque hoje</span>}
                <h3 className="dv-trilha-nome">Homem</h3>
                {d.trilhas.homem.destaque ? (
                  <>
                    <p className="dv-trilha-secao-label">O espelho</p>
                    <p>{d.trilhas.homem.espelho}</p>
                    <p className="dv-trilha-secao-label">A consequência</p>
                    <p>{d.trilhas.homem.consequencia}</p>
                    <p className="dv-trilha-secao-label">A graça</p>
                    <p>{d.trilhas.homem.graca}</p>
                    <p className="dv-trilha-secao-label">O passo</p>
                    <p>{d.trilhas.homem.passo}</p>
                  </>
                ) : (
                  <p>{d.trilhas.homem.texto}</p>
                )}
                <p className="dv-trilha-pergunta">{d.trilhas.homem.pergunta}</p>
              </div>

              {/* Família */}
              <div className={`dv-trilha-card dv-trilha-familia${d.destaques.includes('familia') ? ' dv-trilha-em-destaque' : ''}`}>
                {d.destaques.includes('familia') && <span className="dv-trilha-badge">Destaque hoje</span>}
                <h3 className="dv-trilha-nome">Família</h3>
                {d.trilhas.familia.destaque ? (
                  <>
                    <p className="dv-trilha-secao-label">O espelho</p>
                    <p>{d.trilhas.familia.espelho}</p>
                    <p className="dv-trilha-secao-label">A consequência</p>
                    <p>{d.trilhas.familia.consequencia}</p>
                    <p className="dv-trilha-secao-label">A graça</p>
                    <p>{d.trilhas.familia.graca}</p>
                    <p className="dv-trilha-secao-label">O passo</p>
                    <p>{d.trilhas.familia.passo}</p>
                  </>
                ) : (
                  <p>{d.trilhas.familia.texto}</p>
                )}
                <p className="dv-trilha-pergunta">{d.trilhas.familia.pergunta}</p>
              </div>

              {/* Mulher */}
              <div className={`dv-trilha-card dv-trilha-mulher${d.destaques.includes('mulher') ? ' dv-trilha-em-destaque' : ''}`}>
                {d.destaques.includes('mulher') && <span className="dv-trilha-badge">Destaque hoje</span>}
                <h3 className="dv-trilha-nome">Mulher</h3>
                {d.trilhas.mulher.destaque ? (
                  <>
                    <p className="dv-trilha-secao-label">O espelho</p>
                    <p>{d.trilhas.mulher.espelho}</p>
                    <p className="dv-trilha-secao-label">A consequência</p>
                    <p>{d.trilhas.mulher.consequencia}</p>
                    <p className="dv-trilha-secao-label">A graça</p>
                    <p>{d.trilhas.mulher.graca}</p>
                    <p className="dv-trilha-secao-label">O passo</p>
                    <p>{d.trilhas.mulher.passo}</p>
                  </>
                ) : (
                  <p>{d.trilhas.mulher.texto}</p>
                )}
                <p className="dv-trilha-pergunta">{d.trilhas.mulher.pergunta}</p>
              </div>

              {/* Coisas */}
              <div className={`dv-trilha-card dv-trilha-coisas${d.destaques.includes('coisas') ? ' dv-trilha-em-destaque' : ''}`}>
                {d.destaques.includes('coisas') && <span className="dv-trilha-badge">Destaque hoje</span>}
                <h3 className="dv-trilha-nome">Coisas{'tema' in d.trilhas.coisas && d.trilhas.coisas.tema ? ` · ${d.trilhas.coisas.tema.charAt(0).toUpperCase() + d.trilhas.coisas.tema.slice(1)}` : ''}</h3>
                {d.trilhas.coisas.destaque ? (
                  <>
                    <p className="dv-trilha-secao-label">O espelho</p>
                    <p>{d.trilhas.coisas.espelho}</p>
                    <p className="dv-trilha-secao-label">A consequência</p>
                    <p>{d.trilhas.coisas.consequencia}</p>
                    <p className="dv-trilha-secao-label">A graça</p>
                    <p>{d.trilhas.coisas.graca}</p>
                    <p className="dv-trilha-secao-label">O passo</p>
                    <p>{d.trilhas.coisas.passo}</p>
                  </>
                ) : (
                  <p>{d.trilhas.coisas.texto}</p>
                )}
                <p className="dv-trilha-pergunta">{d.trilhas.coisas.pergunta}</p>
              </div>

            </div>
          </section>

          {/* Navegação inferior */}
          <nav className="dv-nav-dias dv-nav-bottom" aria-label="Próxima devocional">
            <Link href="/devocional/2" className="hp-btn hp-btn-primary dv-nav-prox">
              <span className="hp-btn-label">2ª Devocional</span>
              <span className="hp-btn-sub">Próximo dia →</span>
            </Link>
          </nav>

        </div>
      </main>
    </div>
  )
}
