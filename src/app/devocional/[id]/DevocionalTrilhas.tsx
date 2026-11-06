'use client'

import { useState } from 'react'
import type { Devocional, Trilha } from '@/data/devocionais'

type Aba = 'familia' | 'homem' | 'mulher' | 'coisas'

const ABA_LABEL: Record<Aba, string> = {
  familia: 'Família',
  homem: 'Homem',
  mulher: 'Mulher',
  coisas: 'Coisas',
}

function TrilhaConteudo({ trilha }: { trilha: Trilha }) {
  if (trilha.destaque) {
    return (
      <>
        <p className="dv-trilha-secao">O espelho</p>
        <p>{trilha.espelho}</p>
        <p className="dv-trilha-secao">A consequência</p>
        <p>{trilha.consequencia}</p>
        <p className="dv-trilha-secao">A graça</p>
        <p>{trilha.graca}</p>
        <p className="dv-trilha-secao">O passo</p>
        <p>{trilha.passo}</p>
        <p className="dv-trilha-pergunta">{trilha.pergunta}</p>
      </>
    )
  }
  return (
    <>
      <p>{trilha.texto}</p>
      <p className="dv-trilha-pergunta">{trilha.pergunta}</p>
    </>
  )
}

export function DevocionalTrilhas({ d }: { d: Devocional }) {
  const abas: Aba[] = ['familia', 'homem', 'mulher', 'coisas']
  const inicial: Aba = d.destaques[0] ?? 'familia'
  const [ativa, setAtiva] = useState<Aba>(inicial)

  const trilha = d.trilhas[ativa]

  return (
    <section className="dv-trilhas">
      <h2 className="dv-trilhas-titulo">Ir mais fundo</h2>
      <div className="dv-abas" role="tablist" aria-label="Escolha a trilha">
        {abas.map(a => (
          <button
            key={a}
            role="tab"
            aria-selected={ativa === a}
            onClick={() => setAtiva(a)}
            className={`dv-aba dv-aba-${a}${ativa === a ? ' dv-aba-ativa' : ''}${d.destaques.includes(a) ? ' dv-aba-destaque' : ''}`}
          >
            {ABA_LABEL[a]}
            {d.destaques.includes(a) && <span className="dv-aba-dot" aria-hidden="true" />}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        className={`dv-trilha-painel dv-trilha-${ativa}`}
      >
        {d.destaques.includes(ativa) && (
          <p className="dv-aba-badge">Destaque hoje</p>
        )}
        {'tema' in d.trilhas.coisas && d.trilhas.coisas.tema && ativa === 'coisas' && (
          <p className="dv-trilha-tema">{d.trilhas.coisas.tema.charAt(0).toUpperCase() + d.trilhas.coisas.tema.slice(1)}</p>
        )}
        <TrilhaConteudo trilha={trilha} />
      </div>
    </section>
  )
}
