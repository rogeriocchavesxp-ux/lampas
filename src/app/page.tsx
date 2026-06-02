'use client'

import Link from 'next/link'
import { LampasLogo, LampasMarkIcon } from '@/components/LampasLogo'

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--text-primary)' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 40,
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '0 2rem',
        height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: '1100px', margin: '0 auto', width: '100%',
      }}>
        <LampasLogo height={36} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a href="#metodologia" style={{
            color: 'var(--text-secondary)', fontSize: '0.88rem',
            fontWeight: '500', textDecoration: 'none', transition: 'color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Metodologia
          </a>
          <a href="#modulos" style={{
            color: 'var(--text-secondary)', fontSize: '0.88rem',
            fontWeight: '500', textDecoration: 'none', transition: 'color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Módulos
          </a>
          <Link href="/auth/login" style={{
            background: 'var(--text-primary)', color: '#FFFFFF',
            padding: '0.45rem 1.1rem', borderRadius: '8px',
            fontSize: '0.88rem', fontWeight: '600', textDecoration: 'none',
            transition: 'opacity 0.15s',
          }}>
            Entrar
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(59,130,246,0.07) 0%, #FFFFFF 65%)',
        padding: '6rem 2rem 7rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <LampasMarkIcon size={56} />
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(59,130,246,0.07)',
            border: '1px solid rgba(59,130,246,0.18)',
            borderRadius: '100px',
            padding: '0.3rem 1rem',
            fontSize: '0.78rem', letterSpacing: '0.04em',
            color: 'var(--accent)', fontWeight: '600',
            marginBottom: '2rem',
          }}>
            <span style={{ opacity: 0.7 }}>κῆρυξ</span>
            <span style={{ width: '1px', height: '10px', background: 'rgba(59,130,246,0.3)' }} />
            <span>o arauto da Palavra</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.6rem, 5.5vw, 4rem)',
            fontWeight: '700',
            lineHeight: '1.1',
            letterSpacing: '-0.035em',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)',
          }}>
            Do texto ao púlpito,<br />
            <span style={{ color: 'var(--accent)' }}>com rigor e clareza.</span>
          </h1>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.1rem',
            lineHeight: '1.7',
            maxWidth: '560px',
            margin: '0 auto 2.5rem',
            fontWeight: '400',
          }}>
            Sistema guiado de exegese reformada e produção homilética com IA.
            Para pastores e seminaristas que levam a sério o trabalho com o texto.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/login" style={{
              background: 'var(--accent)', color: '#FFFFFF',
              padding: '0.75rem 2rem', borderRadius: '10px',
              fontSize: '0.95rem', fontWeight: '600', textDecoration: 'none',
              letterSpacing: '-0.01em', transition: 'background 0.15s',
              boxShadow: '0 1px 2px rgba(59,130,246,0.3), 0 4px 12px rgba(59,130,246,0.2)',
            }}>
              Começar gratuitamente
            </Link>
            <a href="#metodologia" style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              padding: '0.75rem 2rem', borderRadius: '10px',
              fontSize: '0.95rem', fontWeight: '500', textDecoration: 'none',
              transition: 'border-color 0.15s, color 0.15s',
            }}>
              Ver metodologia
            </a>
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <div style={{
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--surface)',
        padding: '1rem 2rem',
        textAlign: 'center',
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', letterSpacing: '0.02em' }}>
          Exegese reformada · Retórica clássica · IA treinada na tradição expositiva
        </p>
      </div>

      {/* Methodology */}
      <section id="metodologia" style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '6rem 2rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{
            fontSize: '0.72rem', letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--accent)',
            marginBottom: '0.75rem', fontWeight: '700',
          }}>
            Metodologia
          </div>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
            Exegese em três etapas
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '480px', margin: '0 auto', lineHeight: '1.65' }}>
            Cada projeto percorre um caminho estruturado — do contexto histórico ao significado teológico.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {[
            {
              num: '01',
              title: 'Estudo Contextual',
              desc: 'Histórico, literário e canônico',
              items: ['Contexto histórico-cultural', 'Autor e destinatários', 'Ocasião e propósito', 'Gênero literário', 'Estrutura do livro'],
              color: '#3B82F6',
            },
            {
              num: '02',
              title: 'Estudo Textual',
              desc: 'Texto original e estrutura',
              items: ['Delimitação da perícope', 'Análise morfossintática', 'Termos-chave (BDAG/HALOT)', 'Estrutura literária', 'Comparação de versões'],
              color: '#8B5CF6',
            },
            {
              num: '03',
              title: 'Estudo Teológico',
              desc: 'Mensagem e implicações',
              items: ['Contexto canônico', 'Progressão revelacional', 'Síntese — Grande Ideia', 'Mensagem do texto', 'Conceito central + confrontado'],
              color: '#10B981',
            },
          ].map(({ num, title, desc, items, color }) => (
            <div key={num} style={{
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: 'var(--shadow-sm)',
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: `${color}12`,
                border: `1px solid ${color}25`,
                borderRadius: '8px',
                padding: '0.25rem 0.6rem',
                fontSize: '0.7rem', fontWeight: '800',
                color, letterSpacing: '0.06em',
                marginBottom: '1rem',
              }}>
                {num}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.2rem', letterSpacing: '-0.01em' }}>
                {title}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>{desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {items.map(item => (
                  <li key={item} style={{
                    fontSize: '0.84rem', color: 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', gap: '0.55rem',
                  }}>
                    <span style={{
                      width: '5px', height: '5px', borderRadius: '50%',
                      background: color, flexShrink: 0, opacity: 0.6,
                    }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section id="modulos" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '6rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{
              fontSize: '0.72rem', letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'var(--accent)',
              marginBottom: '0.75rem', fontWeight: '700',
            }}>
              5 Cânones da Retórica Clássica
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
              Do texto ao púlpito
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '460px', margin: '0 auto', lineHeight: '1.65' }}>
              Cada módulo corresponde a uma etapa da produção homilética, guiada pela retórica clássica.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { canon: 'I · Inventio',      name: 'Exegese',         desc: 'Análise contextual, textual e teológica. Morfossintaxe, termos-chave, estrutura literária e síntese.', color: '#3B82F6' },
              { canon: 'II · Dispositio',   name: 'Homilética',      desc: 'Estruturação do sermão: tese, introdução, pontos, transições e conclusão. Com avaliação de coerência.', color: '#8B5CF6' },
              { canon: 'III · Elocutio',    name: 'Estilo',          desc: 'Refinamento da linguagem: clareza, concisão, registro pastoral. Reescrita inteligente com IA.', color: '#6366F1' },
              { canon: 'IV · Memoria',      name: 'Internalização',  desc: 'Mapas visuais, cartões de revisão, quizzes. Domine o texto antes de subir ao púlpito.', color: '#10B981' },
              { canon: 'V · Pronuntiatio',  name: 'Proclamação',     desc: 'Notas de púlpito, blocos visuais, avaliação de áudio em PT-BR.', color: '#F43F5E' },
            ].map(({ canon, name, desc, color }) => (
              <div key={canon} style={{
                background: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                display: 'flex', alignItems: 'flex-start', gap: '1.5rem',
                transition: 'box-shadow 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{
                  minWidth: '100px',
                  fontSize: '0.68rem', fontWeight: '700', color,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  paddingTop: '0.15rem', flexShrink: 0,
                }}>
                  {canon}
                </div>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                    {name}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.55' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: '680px', margin: '0 auto', padding: '7rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', letterSpacing: '-0.025em', marginBottom: '1rem' }}>
          Pronto para estudar com rigor?
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: '1.65' }}>
          Crie sua conta e comece sua primeira exegese agora mesmo. É gratuito.
        </p>
        <Link href="/auth/login" style={{
          display: 'inline-block',
          background: 'var(--accent)', color: '#FFFFFF',
          padding: '0.85rem 2.5rem', borderRadius: '10px',
          fontSize: '1rem', fontWeight: '600', textDecoration: 'none',
          letterSpacing: '-0.01em',
          boxShadow: '0 1px 2px rgba(59,130,246,0.3), 0 4px 12px rgba(59,130,246,0.2)',
          transition: 'background 0.15s',
        }}>
          Criar conta gratuita
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        background: 'var(--surface)',
      }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <LampasLogo height={28} />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.6' }}>
          Sistema de exegese e homilética reformada · Para pastores e seminaristas
        </p>
      </footer>
    </div>
  )
}
