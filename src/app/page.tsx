import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Lampas — Devocional Anual 2027',
  description: 'De Gênesis ao Apocalipse em um ano. Devocionais diários enraizados na Escritura.',
}

const C = {
  gold:          '#c9921a',
  parchment:     '#f0ead6',
  parchmentDim:  'rgba(240, 234, 214, 0.6)',
  parchmentFaint:'rgba(240, 234, 214, 0.18)',
  parchmentGhost:'rgba(240, 234, 214, 0.07)',
  dark:          '#0a0d14',
  dark2:         '#0f1420',
  serif:         'var(--font-garamond, "EB Garamond", Georgia, serif)',
  sans:          'var(--font-inter, "Inter", system-ui, sans-serif)',
}

export default function HomePage() {
  return (
    <div style={{ background: C.dark, color: C.parchment, fontFamily: C.serif }}>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 clamp(16px, 5vw, 48px)',
        height: '56px',
        background: 'rgba(10, 13, 20, 0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.parchmentGhost}`,
      }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 500, letterSpacing: '0.05em', color: C.gold }}>
          Lampas
        </span>
        <Link href="/auth/login" style={{
          fontFamily: C.sans,
          fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase',
          color: C.parchment, textDecoration: 'none',
          border: `1px solid ${C.parchmentFaint}`,
          padding: '7px 20px', borderRadius: '2px',
        }}>
          Entrar
        </Link>
      </header>

      {/* Hero */}
      <section style={{
        minHeight: 'calc(100vh - 56px)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: 'clamp(48px, 10vh, 120px) clamp(16px, 5vw, 48px)',
        textAlign: 'center',
        background: `radial-gradient(ellipse 100% 80% at 50% 0%, rgba(26, 20, 48, 0.95) 0%, ${C.dark} 70%)`,
      }}>
        <p style={{
          fontFamily: C.sans,
          fontSize: '0.68rem', letterSpacing: '0.35em', textTransform: 'uppercase',
          color: C.gold, marginBottom: '40px',
        }}>
          Devocional Anual · 2027
        </p>

        <h1 style={{
          fontSize: 'clamp(2rem, 5.5vw, 5rem)',
          lineHeight: 1.2, fontWeight: 400,
          fontStyle: 'italic',
          maxWidth: '900px', margin: '0 0 20px',
          color: C.parchment,
        }}>
          "Lâmpada para os meus pés é a Tua Palavra, e luz para o meu caminho."
        </h1>

        <p style={{
          fontFamily: C.sans,
          fontSize: '0.82rem', letterSpacing: '0.22em',
          color: C.parchmentDim, marginBottom: '64px',
        }}>
          Salmo 119:105
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/devocional" style={{
            fontFamily: C.sans,
            display: 'inline-block',
            background: C.gold, color: C.dark,
            textDecoration: 'none', padding: '13px 32px',
            fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            Ler o devocional de hoje
          </Link>
          <Link href="/auth/login" style={{
            fontFamily: C.sans,
            display: 'inline-block',
            background: 'transparent', color: C.parchment,
            textDecoration: 'none', padding: '13px 32px',
            fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase',
            border: `1px solid ${C.parchmentFaint}`,
          }}>
            Criar conta
          </Link>
        </div>
      </section>

      {/* 2 Tim 3:14-17 */}
      <section style={{ padding: 'clamp(72px, 12vh, 120px) clamp(16px, 5vw, 48px)', background: C.dark2 }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <p style={{
            fontFamily: C.sans,
            fontSize: '0.68rem', letterSpacing: '0.35em', textTransform: 'uppercase',
            color: C.gold, marginBottom: '40px', textAlign: 'center',
          }}>
            Fundamento · 2 Timóteo 3:14–17
          </p>
          <blockquote style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.7rem)',
            lineHeight: 1.8, fontStyle: 'italic',
            color: C.parchment,
            margin: '0 0 40px',
            padding: '0 0 0 28px',
            borderLeft: `3px solid rgba(201, 146, 26, 0.45)`,
          }}>
            "Toda a Escritura é divinamente inspirada e proveitosa para ensinar, para repreender, para corrigir, para instruir em justiça; para que o homem de Deus seja perfeito, e perfeitamente instruído para toda boa obra."
          </blockquote>
          <p style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
            lineHeight: 1.8, color: C.parchmentDim,
          }}>
            O Devocional Anual 2027 nasceu desta convicção: a Escritura, inteira e inspirada, é capaz de tornar o cristão sábio para a salvação e equipado para toda boa obra. Cada dia é uma janela para o Cristo que atravessa os dois Testamentos — do Gênesis ao Apocalipse, pelo fio das alianças.
          </p>
        </div>
      </section>

      {/* Content model: frente + verso */}
      <section style={{ padding: 'clamp(72px, 12vh, 120px) clamp(16px, 5vw, 48px)' }}>
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>
          <p style={{
            fontFamily: C.sans,
            fontSize: '0.68rem', letterSpacing: '0.35em', textTransform: 'uppercase',
            color: C.gold, marginBottom: '24px', textAlign: 'center',
          }}>
            O que você encontra
          </p>
          <h2 style={{
            fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', fontWeight: 400,
            textAlign: 'center', margin: '0 0 56px', lineHeight: 1.3, fontStyle: 'italic',
          }}>
            Uma folha por dia — frente e verso
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2px' }}>

            {/* Free */}
            <div style={{ background: C.dark2, padding: '40px 36px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <span style={{
                  fontFamily: C.sans, fontSize: '0.63rem',
                  letterSpacing: '0.3em', textTransform: 'uppercase', color: C.gold,
                }}>Gratuito</span>
                <span style={{
                  fontFamily: C.sans, fontSize: '0.63rem', letterSpacing: '0.15em',
                  border: `1px solid ${C.parchmentGhost}`, padding: '3px 9px',
                  color: C.parchmentDim, textTransform: 'uppercase',
                }}>Frente</span>
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 400, marginBottom: '28px', fontStyle: 'italic' }}>
                Devocional geral
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px' }}>
                {[
                  'Leitura e versículo-chave',
                  'Para começar',
                  'O texto — exposição do trecho',
                  'A verdade central',
                  'Cristo no texto',
                  'Para hoje',
                  'Oração',
                ].map(item => (
                  <li key={item} style={{
                    padding: '9px 0',
                    borderBottom: `1px solid ${C.parchmentGhost}`,
                    fontFamily: C.sans, fontSize: '0.88rem',
                    color: C.parchmentDim,
                    display: 'flex', alignItems: 'center', gap: '12px',
                  }}>
                    <span style={{ color: C.gold, fontSize: '0.65rem', flexShrink: 0 }}>—</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/devocional" style={{
                fontFamily: C.sans,
                display: 'inline-block',
                fontSize: '0.73rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                color: C.parchment, textDecoration: 'none',
                border: `1px solid ${C.parchmentFaint}`,
                padding: '10px 24px',
              }}>
                Ler agora
              </Link>
            </div>

            {/* Login */}
            <div style={{
              background: 'rgba(201, 146, 26, 0.05)', padding: '40px 36px',
              border: `1px solid rgba(201, 146, 26, 0.14)`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <span style={{
                  fontFamily: C.sans, fontSize: '0.63rem',
                  letterSpacing: '0.3em', textTransform: 'uppercase', color: C.gold,
                }}>Conta gratuita</span>
                <span style={{
                  fontFamily: C.sans, fontSize: '0.63rem', letterSpacing: '0.15em',
                  border: `1px solid rgba(201, 146, 26, 0.3)`, padding: '3px 9px',
                  color: C.gold, textTransform: 'uppercase',
                }}>Verso</span>
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 400, marginBottom: '28px', fontStyle: 'italic' }}>
                Aplicações
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
                {['Para o Homem', 'Para a Mulher', 'Para a Família', 'Para os Filhos'].map(label => (
                  <li key={label} style={{
                    padding: '9px 0',
                    borderBottom: `1px solid ${C.parchmentGhost}`,
                    fontFamily: C.sans, fontSize: '0.88rem',
                    color: C.parchmentDim,
                    display: 'flex', alignItems: 'center', gap: '12px',
                  }}>
                    <span style={{ color: C.gold, fontSize: '0.65rem', flexShrink: 0 }}>★</span>
                    {label}
                  </li>
                ))}
              </ul>
              <p style={{
                fontFamily: C.sans, fontSize: '0.82rem',
                color: C.parchmentDim, marginBottom: '32px', lineHeight: 1.65,
              }}>
                Cada aplicação percorre o texto com O espelho, A consequência, A graça e O passo — um caminho concreto enraizado em Cristo.
              </p>
              <Link href="/auth/login" style={{
                fontFamily: C.sans,
                display: 'inline-block',
                fontSize: '0.73rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                color: C.dark, textDecoration: 'none',
                background: C.gold,
                padding: '10px 24px',
              }}>
                Criar conta gratuita
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: 'clamp(72px, 12vh, 120px) clamp(16px, 5vw, 48px)', background: C.dark2 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 3.5rem)', fontWeight: 400,
            fontStyle: 'italic', marginBottom: '14px', lineHeight: 1.2,
          }}>
            313 dias. Gênesis ao Apocalipse.
          </h2>
          <p style={{
            fontFamily: C.sans, fontSize: '0.88rem',
            color: C.parchmentDim, marginBottom: '64px', letterSpacing: '0.05em',
          }}>
            Segunda a Sábado — o fio das alianças de Adão ao Cristo ressurreto.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2px' }}>
            {[
              { n: '313', label: 'Devocionais' },
              { n: '66',  label: 'Livros da Bíblia' },
              { n: '52',  label: 'Semanas' },
              { n: '4',   label: 'Aplicações por dia' },
            ].map(({ n, label }) => (
              <div key={n} style={{ background: C.dark, padding: '36px 24px' }}>
                <div style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: C.gold, fontWeight: 400, lineHeight: 1, marginBottom: '10px' }}>
                  {n}
                </div>
                <div style={{
                  fontFamily: C.sans, fontSize: '0.72rem',
                  color: C.parchmentDim, letterSpacing: '0.12em', textTransform: 'uppercase',
                }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: 'clamp(80px, 15vh, 140px) clamp(16px, 5vw, 48px)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', fontWeight: 400,
            fontStyle: 'italic', marginBottom: '20px', lineHeight: 1.3,
          }}>
            Você tem sede pela Palavra?
          </h2>
          <p style={{
            fontFamily: C.sans, fontSize: '0.95rem',
            color: C.parchmentDim, marginBottom: '48px', lineHeight: 1.75,
          }}>
            O Devocional Anual 2027 foi construído para quem quer percorrer a Bíblia inteira, com profundidade, de forma consistente — enraizado na fé reformada.
          </p>
          <Link href="/auth/login" style={{
            fontFamily: C.sans,
            display: 'inline-block',
            background: C.gold, color: C.dark,
            textDecoration: 'none', padding: '14px 40px',
            fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase',
          }}>
            Começar a jornada
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '28px clamp(16px, 5vw, 48px)',
        borderTop: `1px solid ${C.parchmentGhost}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <span style={{
          fontFamily: C.sans,
          fontSize: '0.78rem', color: 'rgba(240, 234, 214, 0.22)',
          letterSpacing: '0.08em',
        }}>
          © 2027 Lampas
        </span>
        <Link href="/cronologia" style={{
          fontFamily: C.sans,
          fontSize: '0.78rem', color: 'rgba(240, 234, 214, 0.32)',
          textDecoration: 'none', letterSpacing: '0.08em',
        }}>
          Cronologia Bíblica
        </Link>
      </footer>

    </div>
  )
}
