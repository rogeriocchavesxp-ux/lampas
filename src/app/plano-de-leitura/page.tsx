import type { Metadata } from 'next'
import Link from 'next/link'
import { semanas, BLOCOS, type Semana } from '@/data/semanas'
import './plano.css'

export const metadata: Metadata = {
  title: 'Plano de Leitura — A Grande História',
  description: 'De Gênesis a Apocalipse em 51 semanas: todas as passagens, as verdades centrais e o fio pactual que liga cada semana ao seguinte.',
}

const ORDEM_BLOCOS: Semana['bloco'][] = [
  'introducao', 'pentateuco', 'historicos', 'poeticos', 'profetas', 'nt', 'conclusao',
]

export default function PlanoPage() {
  const porBloco = ORDEM_BLOCOS.reduce<Record<string, typeof semanas>>((acc, bloco) => {
    acc[bloco] = semanas.filter(s => s.bloco === bloco)
    return acc
  }, {})

  return (
    <div className="pl-root">
      <header className="pl-topbar">
        <Link href="/" className="pl-brand">Lampas</Link>
        <nav className="pl-topnav">
          <Link href="/devocional/1">Começar</Link>
          <Link href="/auth/login">Entrar</Link>
        </nav>
      </header>

      <main className="pl-main">
        <div className="pl-wrap">

          <div className="pl-hero">
            <p className="pl-eyebrow">A Grande História</p>
            <h1 className="pl-title">Plano de leitura</h1>
            <p className="pl-subtitle">
              51 semanas, de segunda a sábado, de Gênesis a Apocalipse. O fio que liga cada semana é a aliança: Deus que promete, cumpre e habita com o seu povo em Cristo.
            </p>
          </div>

          <div className="pl-legenda">
            <p className="pl-legenda-titulo">O eixo pactual</p>
            <div className="pl-legenda-grid">
              <div className="pl-legenda-item"><strong>Pacto de obras</strong> — Adão antes da queda (CFW 7.2)</div>
              <div className="pl-legenda-item"><strong>Pacto da graça</strong> — de Gn 3:15 até a nova aliança</div>
              <div className="pl-legenda-item"><strong>Abraão</strong> — promessa, descendência, bênção às nações</div>
              <div className="pl-legenda-item"><strong>Moisés</strong> — a lei dentro da graça (CFW 7.5)</div>
              <div className="pl-legenda-item"><strong>Davi</strong> — o reino prometido e o trono eterno</div>
              <div className="pl-legenda-item"><strong>Nova aliança</strong> — cumprida e inaugurada em Cristo (Hb 8)</div>
            </div>
          </div>

          {ORDEM_BLOCOS.map(bloco => {
            const lista = porBloco[bloco]
            if (!lista?.length) return null
            return (
              <section key={bloco} className="pl-bloco">
                <h2 className="pl-bloco-titulo">{BLOCOS[bloco]}</h2>
                {lista.map(s => (
                  <div key={s.id} className="pl-semana">
                    <div className="pl-periodo">{s.periodo}</div>
                    <div className="pl-semana-corpo">
                      <div className="pl-semana-titulo">{s.unidade}</div>
                      <div className="pl-leituras">{s.leituras}</div>
                      <div className="pl-verdade">{s.verdadeCentral}</div>
                      <div className="pl-alianca">{s.alianca}</div>
                    </div>
                  </div>
                ))}
              </section>
            )
          })}

        </div>
      </main>

      <footer className="pl-footer">
        <div className="pl-wrap">
          <p className="pl-foot-copy">© A Grande História — Revisão Pactual baseada em <em>O Cristo dos Pactos</em>, de O. Palmer Robertson</p>
        </div>
      </footer>
    </div>
  )
}
