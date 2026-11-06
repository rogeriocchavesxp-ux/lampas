import type { Metadata } from 'next'
import Link from 'next/link'
import './homepage.css'

export const metadata: Metadata = {
  title: 'Devocional Anual 2027 — De Gênesis a Apocalipse',
  description: '312 devocionais em 52 blocos de seis dias, para conhecer o Deus que salva e viver essa salvação em casa, na igreja e no trabalho.',
}

const TIMELINE = [
  { period: 'Janeiro a março',    name: 'Pentateuco',             sub: 'Dia 007 · No princípio, Deus criou' },
  { period: 'Março a junho',      name: 'Livros históricos',      sub: 'Dia 073 · A terra prometida' },
  { period: 'Junho e julho',      name: 'Poéticos e sapienciais', sub: 'Dia 145 · Bem-aventurado o homem' },
  { period: 'Julho a setembro',   name: 'Profetas',               sub: 'Dia 175 · A voz que clama no deserto' },
  { period: 'Setembro e outubro', name: 'Evangelhos e Atos',      sub: 'Dia 223 · No princípio era o Verbo' },
  { period: 'Outubro a dezembro', name: 'Cartas',                 sub: 'Dia 253 · Justificados pela fé' },
  { period: 'Dezembro',           name: 'Apocalipse',             sub: 'Dia 295 · A vitória do Cordeiro' },
]

export default function HomePage() {
  return (
    <div className="hp-root">

      {/* 1. Abertura */}
      <header className="hp-hero">
        <div className="hp-wrap">
          <p className="hp-eyebrow">Discipulado bíblico para cristãos e famílias</p>
          <h1 className="hp-hero-title">Devocional Anual 2027</h1>
          <p className="hp-hero-sub">De Gênesis a Apocalipse, um dia de cada vez</p>
          <p className="hp-hero-support">
            312 devocionais em 52 blocos de seis dias, para conhecer o Deus que salva e viver essa salvação em casa, na igreja e no trabalho.
          </p>
          <div className="hp-ctas">
            <Link href="/devocional/1" className="hp-btn hp-btn-primary">
              <span className="hp-btn-label">Dia 001</span>
              <span className="hp-btn-sub">A Escritura fala de Cristo</span>
            </Link>
            <Link href="#plano" className="hp-btn hp-btn-ghost">
              <span className="hp-btn-label">Ver o plano de leitura</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. O que é */}
      <section className="hp-section">
        <div className="hp-wrap">
          <p className="hp-eyebrow">O projeto</p>
          <h2 className="hp-section-title">O que é</h2>
          <p className="hp-body">
            O Devocional Anual 2027 é um programa de discipulado bíblico para cristãos e famílias. Ao longo de 2027, de segunda a sábado, a jornada percorre a Bíblia inteira, de Gênesis a Apocalipse, para que você conheça a grande história que Deus está contando: criação, queda, redenção e consumação.
          </p>
        </div>
      </section>

      {/* 3. Como ler */}
      <section className="hp-section">
        <div className="hp-wrap">
          <p className="hp-eyebrow">O ponto de partida</p>
          <h2 className="hp-section-title">Ler e interpretar</h2>
          <p className="hp-body">
            A Bíblia é o livro mais lido e traduzido da história — e também um dos mais mal interpretados. Dois erros são recorrentes. O primeiro lê o texto de forma mística e alegórica, como se ele fosse um repositório de sinais ocultos ou palavras de consolo para o momento. O segundo o lê com os óculos da modernidade: uma razão que estranha a violência, o sofrimento e os costumes do mundo antigo, e rejeita o que não se encaixa nos valores de hoje.
          </p>
          <p className="hp-body">
            A Bíblia não é nenhum dos dois. Ela é a Palavra de Deus expressa em linguagem humana — com autoria divino-humana, escrita em contextos históricos precisos, com gêneros literários definidos e com uma lógica interna que atravessa os dois Testamentos. Portanto, não basta saber ler: é preciso saber interpretar. Ler o texto dentro do seu contexto histórico e literário é o único caminho para compreender o que Deus quis comunicar aos seres humanos.
          </p>
        </div>
      </section>

      {/* 4. O fio da história */}
      <section className="hp-section">
        <div className="hp-wrap">
          <p className="hp-eyebrow">O fio da história</p>
          <h2 className="hp-section-title">A aliança</h2>
          <p className="hp-body">
            O fio que une a Bíblia é a aliança. De Adão a Noé, de Abraão a Moisés e a Davi, Deus faz promessas e as cumpre, até que elas se realizam em Jesus Cristo. Cada devocional mostra como o texto do dia aponta para ele.
          </p>
          <blockquote className="hp-blockquote">
            <p>&ldquo;Eis o tabernáculo de Deus com os homens. Deus habitará com eles. Eles serão povos de Deus, e Deus mesmo estará com eles.&rdquo;</p>
            <cite>Apocalipse 21:3 — Almeida Revista e Atualizada</cite>
          </blockquote>
        </div>
      </section>

      {/* 4. As perguntas da vida */}
      <section className="hp-section">
        <div className="hp-wrap">
          <p className="hp-eyebrow">As perguntas da vida</p>
          <h2 className="hp-section-title">Respondidas ao longo da história</h2>
          <p className="hp-body">
            Toda pessoa faz perguntas sobre a vida, mesmo sem perceber: o que é real? Quem sou eu? Como sei o que é certo? O que acontece quando morremos? Para onde vai a história? Ao longo do ano, a própria Bíblia responde a essas perguntas, no ponto da história em que cada texto está. O fio continua sendo a história da salvação: as perguntas são respondidas dentro dela, e não fora dela.
          </p>

          <div className="hp-q-grid">
            <div className="hp-q-card">
              <div className="hp-q-label">Para quem procura</div>
              <p>As perguntas de quem ainda não crê ou começou agora. O que é real? O que é o ser humano? Existe certo e errado?</p>
            </div>
            <div className="hp-q-card">
              <div className="hp-q-label">Para quem pratica a religião</div>
              <p>As perguntas que os religiosos faziam a Jesus. O que preciso fazer para ser aceito? Quem tem autoridade? A tradição basta?</p>
            </div>
            <div className="hp-q-card">
              <div className="hp-q-label">Para quem segue Jesus</div>
              <p>As perguntas dos próprios discípulos. Como orar? Como perdoar? Para quem iremos?</p>
            </div>
          </div>

          <p className="hp-trail-note">
            Cada devocional traz duas etiquetas: em que ponto da história da salvação o texto está e qual pergunta ele responde naquele dia. Quem escolhe a pergunta é o próprio texto.
          </p>

          <blockquote className="hp-blockquote hp-blockquote-sm">
            <p>&ldquo;Respondeu-lhe Jesus: Eu sou o caminho, e a verdade, e a vida.&rdquo;</p>
            <cite>João 14:6 — Almeida Revista e Atualizada</cite>
          </blockquote>
        </div>
      </section>

      {/* 5. Três perguntas para o ano */}
      <section className="hp-section">
        <div className="hp-wrap">
          <p className="hp-eyebrow">O que percorre o ano</p>
          <h2 className="hp-section-title">Três perguntas para o ano</h2>
          <div className="hp-q-grid">
            <div className="hp-q-card">
              <div className="hp-q-label">Propósito</div>
              <p>&ldquo;Para que Deus me fez?&rdquo;</p>
            </div>
            <div className="hp-q-card">
              <div className="hp-q-label">Identidade</div>
              <p>&ldquo;Quem sou diante dele: o que o pecado deformou e o que Cristo restaura?&rdquo;</p>
            </div>
            <div className="hp-q-card">
              <div className="hp-q-label">Relações</div>
              <p>&ldquo;Como vivo com Deus, com o próximo e com o que ele me confiou?&rdquo;</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Como funciona */}
      <section className="hp-section">
        <div className="hp-wrap">
          <p className="hp-eyebrow">A estrutura diária</p>
          <h2 className="hp-section-title">Como funciona</h2>
          <p className="hp-how-intro">
            Todo dia há uma página geral, com a leitura, o versículo-chave, o contexto, a verdade central, a ligação com Cristo, uma aplicação e uma oração. Abaixo do título de cada dia, duas etiquetas mostram em que ponto da história da salvação o texto está e qual pergunta da vida ele responde. A partir da página geral, você pode seguir para quatro trilhas que aplicam o mesmo texto à sua vida.
          </p>

          <div className="hp-trail-grid">
            <div className="hp-trail-card hp-trail-familia">
              <svg className="hp-trail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 10.5L12 3L21 10.5V21H15V15H9V21H3V10.5Z" />
              </svg>
              <h3 className="hp-card-title">Família</h3>
              <p>Casamento, pais e filhos, a casa como lugar de fé.</p>
            </div>

            <div className="hp-trail-card hp-trail-homem">
              <svg className="hp-trail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx={12} cy={6} r={3} />
                <line x1={12} y1={9} x2={12} y2={21} />
                <path d="M6 15C6 18.5 18 18.5 18 15" />
                <line x1={8} y1={9} x2={16} y2={9} />
              </svg>
              <h3 className="hp-card-title">Homem</h3>
              <p>O homem diante de Deus: o pecado que o texto revela, suas consequências, a graça de Cristo e um passo concreto.</p>
            </div>

            <div className="hp-trail-card hp-trail-mulher">
              <svg className="hp-trail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22C12 22 4 16 4 9C4 4.5 7.5 2 12 5.5C16.5 2 20 4.5 20 9C20 16 12 22 12 22Z" />
                <line x1={12} y1={22} x2={12} y2={11} />
              </svg>
              <h3 className="hp-card-title">Mulher</h3>
              <p>A mulher diante de Deus: o pecado que o texto revela, suas consequências, a graça de Cristo e um passo concreto.</p>
            </div>

            <div className="hp-trail-card hp-trail-coisas">
              <svg className="hp-trail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1={12} y1={2} x2={12} y2={21} />
                <line x1={6} y1={6} x2={18} y2={6} />
                <path d="M6 6C5 8 4 10.5 6 12.5S9 12.5 6 6Z" />
                <path d="M18 6C19 8 20 10.5 18 12.5S15 12.5 18 6Z" />
                <line x1={9} y1={21} x2={15} y2={21} />
              </svg>
              <h3 className="hp-card-title">Coisas</h3>
              <p>Tempo, dinheiro e trabalho à luz da Palavra.</p>
            </div>
          </div>

          <p className="hp-trail-note">
            Quem decide a ênfase é o próprio texto bíblico. Em alguns dias, ele fala mais à família; em outros, ao homem, à mulher ou ao uso das coisas. A página de cada dia mostra onde está o destaque.
          </p>
        </div>
      </section>

      {/* 7. A jornada do ano */}
      <section className="hp-section" id="plano">
        <div className="hp-wrap">
          <p className="hp-eyebrow">O percurso</p>
          <h2 className="hp-section-title">A jornada do ano</h2>
          <div className="hp-tl">
            {TIMELINE.map(({ period, name, sub }) => (
              <div key={name} className="hp-tl-row">
                <div className="hp-tl-dot" aria-hidden="true" />
                <div className="hp-tl-body">
                  <div className="hp-tl-period">{period}</div>
                  <div className="hp-tl-name">{name}</div>
                  <div className="hp-tl-sub">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Em que cremos */}
      <section className="hp-section">
        <div className="hp-wrap">
          <p className="hp-eyebrow">Base e identidade</p>
          <h2 className="hp-section-title">Em que cremos</h2>
          <p className="hp-body">
            O projeto é cristão, protestante, reformado e presbiteriano. Lê a Bíblia em seu contexto histórico e literário, tem a Confissão de Fé de Westminster como referência e entende que a obediência nasce da graça de Deus, e não da culpa nem do esforço próprio.
          </p>
          <a href="#" className="hp-crenca-link">Saiba mais sobre o projeto →</a>
        </div>
      </section>

      {/* 9. Chamada final */}
      <section className="hp-cta-section" id="comecar">
        <div className="hp-wrap">
          <p className="hp-cta-big">Uma página por dia. Um ano inteiro. Toda a Bíblia apontando para Cristo.</p>
          <div className="hp-ctas hp-ctas-center">
            <Link href="/devocional/1" className="hp-btn hp-btn-primary">
              <span className="hp-btn-label">Dia 001</span>
              <span className="hp-btn-sub">A Escritura fala de Cristo</span>
            </Link>
          </div>
          <div className="hp-email-ph">
            <p>✉ Receber a devocional por e-mail</p>
            <p>Formulário de inscrição em breve.</p>
          </div>
        </div>
      </section>

      {/* 10. Rodapé */}
      <footer className="hp-footer">
        <div className="hp-wrap">
          <nav className="hp-foot-nav" aria-label="Links do rodapé">
            <Link href="/dias">Todos os dias</Link>
            <Link href="/plano-de-leitura">Plano de leitura</Link>
            <a href="#">Introduções às seções</a>
            <a href="#">Perguntas</a>
            <a href="#">Calendário</a>
            <a href="#">Sobre o projeto</a>
            <a href="#">Contato</a>
          </nav>
          <p className="hp-foot-copy">© 2027 Devocional Anual — Citações bíblicas conforme a Almeida Revista e Atualizada</p>
        </div>
      </footer>

    </div>
  )
}
