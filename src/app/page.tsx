import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Devocional Anual 2027 — De Gênesis a Apocalipse',
  description: '313 devocionais, de segunda a sábado, para conhecer o Deus que salva e viver essa salvação em casa, na igreja e no trabalho.',
}

const TIMELINE = [
  { period: 'Janeiro a março',              name: 'Pentateuco',               sub: '1ª Devocional · No princípio, Deus criou' },
  { period: 'Março a junho',                name: 'Livros históricos',         sub: '67ª Devocional · A terra prometida' },
  { period: 'Junho e julho',                name: 'Poéticos e sapienciais',    sub: '157ª Devocional · Bem-aventurado o homem' },
  { period: 'Julho a setembro',             name: 'Profetas',                  sub: '183ª Devocional · A voz que clama no deserto' },
  { period: 'Transição',                    name: 'Entre os Testamentos',      sub: 'A espera do cumprimento das promessas' },
  { period: 'Setembro e outubro',           name: 'Evangelhos e Atos',         sub: '229ª Devocional · No princípio era o Verbo' },
  { period: 'Outubro a dezembro',           name: 'Cartas',                    sub: '267ª Devocional · Justificados pela fé' },
  { period: 'Dezembro · terminando no Natal', name: 'Apocalipse',             sub: '309ª Devocional · A vitória do Cordeiro' },
]

export default function HomePage() {
  return (
    <div className={styles.root}>

      {/* 1. Abertura */}
      <header className={styles.heroSection}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>Discipulado bíblico para cristãos e famílias</p>
          <h1 className={styles.heroTitle}>Devocional Anual 2027</h1>
          <p className={styles.heroSubtitle}>De Gênesis a Apocalipse, um dia de cada vez</p>
          <p className={styles.heroSupport}>
            313 devocionais, de segunda a sábado, para conhecer o Deus que salva e viver essa salvação em casa, na igreja e no trabalho.
          </p>
          <div className={styles.ctas}>
            <Link href="/devocional/1" className={`${styles.btn} ${styles.btnPrimary}`}>
              <span className={styles.btnLabel}>1ª Devocional</span>
              <span className={styles.btnSub}>No princípio, Deus criou</span>
            </Link>
            <Link href="#plano" className={`${styles.btn} ${styles.btnGhost}`}>
              <span className={styles.btnLabel}>Ver o plano de leitura</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. O que é */}
      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>O projeto</p>
          <h2 className={styles.sectionTitle}>O que é</h2>
          <p className={styles.bodyText}>
            O Devocional Anual 2027 é um programa de discipulado bíblico para cristãos e famílias. Ao longo de 2027, de segunda a sábado, a jornada percorre a Bíblia inteira, de Gênesis a Apocalipse, para que você conheça a grande história que Deus está contando: criação, queda, redenção e consumação.
          </p>
        </div>
      </section>

      {/* 3. O fio da história */}
      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>O fio da história</p>
          <h2 className={styles.sectionTitle}>A aliança</h2>
          <p className={styles.bodyText}>
            O fio que une a Bíblia é a aliança. De Adão a Noé, de Abraão a Moisés e a Davi, Deus faz promessas e as cumpre, até que elas se realizam em Jesus Cristo. Cada devocional mostra como o texto do dia aponta para ele.
          </p>
          <blockquote className={styles.blockquote}>
            <p>"Eis o tabernáculo de Deus com os homens. Deus habitará com eles. Eles serão povos de Deus, e Deus mesmo estará com eles."</p>
            <cite>Apocalipse 21:3 — Almeida Revista e Atualizada</cite>
          </blockquote>
        </div>
      </section>

      {/* 4. Três perguntas */}
      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>O que percorre o ano</p>
          <h2 className={styles.sectionTitle}>Três perguntas para o ano</h2>
          <div className={styles.qGrid}>
            <div className={styles.qCard}>
              <div className={styles.qLabel}>Propósito</div>
              <p>"Para que Deus me fez?"</p>
            </div>
            <div className={styles.qCard}>
              <div className={styles.qLabel}>Identidade</div>
              <p>"Quem sou diante dele: o que o pecado deformou e o que Cristo restaura?"</p>
            </div>
            <div className={styles.qCard}>
              <div className={styles.qLabel}>Relações</div>
              <p>"Como vivo com Deus, com o próximo e com o que ele me confiou?"</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Como funciona */}
      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>A estrutura diária</p>
          <h2 className={styles.sectionTitle}>Como funciona</h2>
          <p className={styles.howIntro}>
            Todo dia há uma página geral, com a leitura, o versículo-chave, o contexto, a verdade central, a ligação com Cristo, uma aplicação e uma oração. A partir dela, você pode seguir para quatro trilhas que aplicam o mesmo texto à sua vida.
          </p>

          <div className={styles.trailGrid}>
            <div className={`${styles.trailCard} ${styles.familia}`}>
              <svg className={styles.trailIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 10.5L12 3L21 10.5V21H15V15H9V21H3V10.5Z" />
              </svg>
              <h3 className={styles.cardTitle}>Família</h3>
              <p>Casamento, pais e filhos, a casa como lugar de fé.</p>
            </div>

            <div className={`${styles.trailCard} ${styles.homem}`}>
              <svg className={styles.trailIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx={12} cy={6} r={3} />
                <line x1={12} y1={9} x2={12} y2={21} />
                <path d="M6 15C6 18.5 18 18.5 18 15" />
                <line x1={8} y1={9} x2={16} y2={9} />
              </svg>
              <h3 className={styles.cardTitle}>Homem</h3>
              <p>O homem diante de Deus: o pecado que o texto revela, suas consequências, a graça de Cristo e um passo concreto.</p>
            </div>

            <div className={`${styles.trailCard} ${styles.mulher}`}>
              <svg className={styles.trailIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22C12 22 4 16 4 9C4 4.5 7.5 2 12 5.5C16.5 2 20 4.5 20 9C20 16 12 22 12 22Z" />
                <line x1={12} y1={22} x2={12} y2={11} />
              </svg>
              <h3 className={styles.cardTitle}>Mulher</h3>
              <p>A mulher diante de Deus: o pecado que o texto revela, suas consequências, a graça de Cristo e um passo concreto.</p>
            </div>

            <div className={`${styles.trailCard} ${styles.coisas}`}>
              <svg className={styles.trailIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1={12} y1={2} x2={12} y2={21} />
                <line x1={6} y1={6} x2={18} y2={6} />
                <path d="M6 6C5 8 4 10.5 6 12.5S9 12.5 6 6Z" />
                <path d="M18 6C19 8 20 10.5 18 12.5S15 12.5 18 6Z" />
                <line x1={9} y1={21} x2={15} y2={21} />
              </svg>
              <h3 className={styles.cardTitle}>Coisas</h3>
              <p>Tempo, dinheiro e trabalho à luz da Palavra.</p>
            </div>
          </div>

          <p className={styles.trailNote}>
            Quem decide a ênfase é o próprio texto bíblico. Em alguns dias, ele fala mais à família; em outros, ao homem, à mulher ou ao uso das coisas. A página de cada dia mostra onde está o destaque.
          </p>
        </div>
      </section>

      {/* 6. A jornada do ano */}
      <section className={styles.section} id="plano">
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>O percurso</p>
          <h2 className={styles.sectionTitle}>A jornada do ano</h2>
          <div className={styles.tl}>
            {TIMELINE.map(({ period, name, sub }) => (
              <div key={name} className={styles.tlRow}>
                <div className={styles.tlDot} aria-hidden="true" />
                <div className={styles.tlBody}>
                  <div className={styles.tlPeriod}>{period}</div>
                  <div className={styles.tlName}><a href="#">{name}</a></div>
                  <div className={styles.tlSub}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Em que cremos */}
      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>Base e identidade</p>
          <h2 className={styles.sectionTitle}>Em que cremos</h2>
          <p className={styles.bodyText}>
            O projeto é cristão, protestante, reformado e presbiteriano. Lê a Bíblia em seu contexto histórico e literário, tem a Confissão de Fé de Westminster como referência e entende que a obediência nasce da graça de Deus, e não da culpa nem do esforço próprio.
          </p>
          <a href="#" className={styles.crencaLink}>Saiba mais sobre o projeto →</a>
        </div>
      </section>

      {/* 8. Chamada final */}
      <section className={styles.ctaSection} id="comecar">
        <div className={styles.wrap}>
          <p className={styles.ctaBig}>Uma página por dia. Um ano inteiro. Toda a Bíblia apontando para Cristo.</p>
          <div className={`${styles.ctas} ${styles.ctasCenter}`}>
            <Link href="/devocional/1" className={`${styles.btn} ${styles.btnPrimary}`}>
              <span className={styles.btnLabel}>1ª Devocional</span>
              <span className={styles.btnSub}>No princípio, Deus criou</span>
            </Link>
          </div>
          <div className={styles.emailPh}>
            <p>✉ Receber a devocional por e-mail</p>
            <p>Formulário de inscrição em breve.</p>
          </div>
        </div>
      </section>

      {/* 9. Rodapé */}
      <footer className={styles.footer}>
        <div className={styles.wrap}>
          <nav className={styles.footNav} aria-label="Links do rodapé">
            <a href="#">Plano de leitura</a>
            <a href="#">Introduções às seções</a>
            <a href="#">Sobre o projeto</a>
            <a href="#">Contato</a>
          </nav>
          <p className={styles.footCopy}>© 2027 Devocional Anual — Citações bíblicas conforme a Almeida Revista e Atualizada</p>
        </div>
      </footer>

    </div>
  )
}
