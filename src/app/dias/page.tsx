import type { Metadata } from 'next'
import Link from 'next/link'
import { blocos, SECAO_LABEL, SECAO_ORDER, type Bloco } from '@/data/blocos'
import './dias.css'

export const metadata: Metadata = {
  title: 'Todos os dias — A Grande História',
  description: '312 devocionais em 52 blocos de seis dias, de Gênesis a Apocalipse.',
}

function fmt(n: number) {
  return String(n).padStart(3, '0')
}

function BlocoTabela({ bloco }: { bloco: Bloco }) {
  const isSintese = (i: number) => i === 5
  return (
    <div className="ds-bloco">
      <div className="ds-bloco-header">
        <span className="ds-bloco-num">Bloco {bloco.numero}</span>
        <span className="ds-bloco-nome">{bloco.nome}</span>
        <span className="ds-bloco-range">Dias {fmt(bloco.dias[0].dia)}–{fmt(bloco.dias[5].dia)}</span>
      </div>
      <div className="ds-dias">
        {bloco.dias.map((d, i) => (
          <Link
            key={d.dia}
            href={`/devocional/${d.dia}`}
            className={`ds-dia${isSintese(i) ? ' ds-sintese' : ''}`}
          >
            <span className="ds-dia-num">{fmt(d.dia)}</span>
            <span className="ds-dia-leitura">{d.leitura}</span>
            <span className="ds-dia-tema">{d.tema}</span>
            <span className="ds-dia-vc">{d.vc}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function DiasPage() {
  const porSecao = SECAO_ORDER.map(secao => ({
    secao,
    label: SECAO_LABEL[secao],
    blocos: blocos.filter(b => b.secao === secao),
  }))

  return (
    <div className="ds-root">
      <header className="ds-topbar">
        <Link href="/" className="ds-brand">Lampas</Link>
        <span className="ds-topbar-title">Plano de leitura</span>
        <Link href="/auth/login" className="ds-entrar">Entrar</Link>
      </header>

      <main className="ds-main">
        <div className="ds-wrap">
          <div className="ds-intro">
            <h1 className="ds-h1">Dia 001 a Dia 312</h1>
            <p className="ds-sub">52 blocos de seis dias — de Gênesis a Apocalipse</p>
          </div>

          {porSecao.map(({ secao, label, blocos: bs }) => (
            <section key={secao} className={`ds-secao ds-secao-${secao}`}>
              <h2 className="ds-secao-titulo">{label}</h2>
              <div className="ds-blocos-lista">
                {bs.map(b => <BlocoTabela key={b.numero} bloco={b} />)}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
