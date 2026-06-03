import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  FileText,
  Library,
  MessageSquareText,
  PenLine,
  Search,
  Sparkles,
  Users,
} from 'lucide-react'
import { LampasLogo, LampasMarkIcon } from '@/components/LampasLogo'

const navItems = [
  ['Início', '#inicio'],
  ['Recursos', '#recursos'],
  ['Estudos', '#estudos'],
  ['Devocionais', '#devocionais'],
  ['Sermões', '#sermoes'],
  ['Planos', '/billing'],
] as const

const resources = [
  {
    title: 'Exegese Bíblica',
    icon: Search,
    items: ['texto original', 'análise textual', 'contexto histórico'],
  },
  {
    title: 'Estudos Bíblicos',
    icon: BookOpen,
    items: ['preparação de aulas', 'EBD', 'grupos pequenos'],
  },
  {
    title: 'Sermões',
    icon: MessageSquareText,
    items: ['estruturação', 'aplicações', 'ilustrações'],
  },
  {
    title: 'Devocionais',
    icon: Sparkles,
    items: ['produção rápida', 'reflexão pessoal', 'discipulado'],
  },
  {
    title: 'Comentários',
    icon: FileText,
    items: ['comentários organizados', 'referências cruzadas', 'notas por passagem'],
  },
  {
    title: 'Biblioteca',
    icon: Library,
    items: ['materiais de apoio', 'pesquisa integrada', 'fontes reformadas'],
  },
]

const devotionals = [
  {
    title: 'Quando a providência parece escondida',
    text: 'Uma breve meditação sobre fidelidade, espera e presença de Deus no ordinário.',
    date: '03 jun',
    author: 'Equipe Lampas',
  },
  {
    title: 'O Deus que sustenta no caminho',
    text: 'Reflexão para transformar leitura bíblica em oração, confiança e obediência.',
    date: '02 jun',
    author: 'Equipe Lampas',
  },
  {
    title: 'Graça suficiente para hoje',
    text: 'Um devocional pastoral para dias de cansaço, dúvida e recomeço.',
    date: '01 jun',
    author: 'Equipe Lampas',
  },
]

const studies = [
  { title: 'José na casa de Potifar', book: 'Gênesis 39.1-23', category: 'Exegese Bíblica', date: '03 jun' },
  { title: 'O justo viverá pela fé', book: 'Romanos 1.16-17', category: 'Estudo Doutrinário', date: '02 jun' },
  { title: 'O Bom Pastor e seu povo', book: 'João 10.1-18', category: 'Sermão', date: '31 mai' },
]

const articles = [
  {
    title: 'Como delimitar uma perícope',
    summary: 'Critérios literários, contextuais e teológicos para começar bem uma investigação bíblica.',
    category: 'Método',
  },
  {
    title: 'Da observação à grande ideia',
    summary: 'Um caminho simples para evitar saltos interpretativos e respeitar o fluxo do texto.',
    category: 'Exegese',
  },
  {
    title: 'Pregação expositiva com clareza',
    summary: 'Como organizar material abundante sem perder unidade, progressão e aplicação pastoral.',
    category: 'Homilética',
  },
]

const audiences = [
  ['Pastores', 'Preparação de sermões com método, acúmulo de pesquisa e comunicação fiel.'],
  ['Professores de EBD', 'Estruturação de aulas, perguntas progressivas e material para grupos.'],
  ['Seminaristas', 'Pesquisa, exegese, referências e organização acadêmica em um só ambiente.'],
  ['Estudantes da Bíblia', 'Crescimento pessoal com leitura atenta, interpretação e aplicação.'],
] as const

const showcase = [
  ['Dashboard', 'Estudos organizados por modo e progresso.'],
  ['Exegese', 'Observação, interpretação e teologia no mesmo fluxo.'],
  ['Sermão', 'Do argumento do texto à comunicação pastoral.'],
  ['Devocional', 'Reflexões bíblicas rápidas, reverentes e editáveis.'],
  ['Biblioteca', 'Fontes, dicionário e pesquisa integrada.'],
] as const

export default function HomePage() {
  return (
    <main className="home-shell">
      <header className="site-header">
        <Link href="/" className="brand" aria-label="Lampas">
          <LampasLogo height={34} />
        </Link>
        <nav className="site-nav" aria-label="Navegação principal">
          {navItems.map(([label, href]) => (
            <Link key={label} href={href}>{label}</Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/auth/login" className="login-link">Entrar</Link>
          <Link href="/auth/login" className="primary-link">Começar grátis</Link>
        </div>
      </header>

      <section id="inicio" className="hero-section">
        <div className="hero-visual" aria-hidden="true">
          <ProductScene />
        </div>
        <div className="hero-content">
          <p className="eyebrow">Plataforma bíblica para estudo, interpretação e comunicação</p>
          <h1>Iluminando a sua jornada de estudo bíblico.</h1>
          <p className="hero-line">Estude. Interprete. Comunique.</p>
          <p className="hero-copy">
            Uma plataforma criada para pastores, professores, seminaristas e estudantes da Bíblia
            investigarem as Escrituras com método, profundidade e clareza.
          </p>
          <div className="hero-actions">
            <Link href="/auth/login" className="hero-primary">
              Começar gratuitamente <ArrowRight size={18} />
            </Link>
            <Link href="#demonstracao" className="hero-secondary">Ver demonstração</Link>
          </div>
        </div>
      </section>

      <section id="recursos" className="section">
        <div className="section-heading">
          <p className="section-kicker">Recursos</p>
          <h2>Tudo o que você precisa para estudar a Bíblia</h2>
        </div>
        <div className="resource-grid">
          {resources.map(({ title, icon: Icon, items }) => (
            <article key={title} className="resource-card">
              <div className="resource-icon"><Icon size={20} /></div>
              <h3>{title}</h3>
              <ul>
                {items.map(item => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="estudos" className="section content-section">
        <div className="section-heading">
          <p className="section-kicker">Conteúdos</p>
          <h2>Estudos, devocionais e artigos em um só ambiente</h2>
        </div>
        <div className="content-columns">
          <ContentColumn title="Últimos Devocionais" items={devotionals} type="devotional" />
          <ContentColumn title="Últimos Estudos" items={studies} type="study" />
          <ContentColumn title="Últimos Artigos" items={articles} type="article" />
        </div>
      </section>

      <section id="sermoes" className="leaders-section">
        <div className="section-heading">
          <p className="section-kicker">Vocação</p>
          <h2>Criado para quem ensina a Palavra</h2>
        </div>
        <div className="audience-grid">
          {audiences.map(([title, text]) => (
            <article key={title} className="audience-card">
              <Users size={18} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="demonstracao" className="section showcase-section">
        <div className="section-heading">
          <p className="section-kicker">Demonstração</p>
          <h2>Veja como o estudo ganha forma dentro do Lampas</h2>
        </div>
        <div className="showcase-grid">
          {showcase.map(([title, text], index) => (
            <article key={title} className="showcase-card">
              <div className="showcase-screen">
                <div className="screen-header">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="screen-body">
                  <div className="screen-sidebar">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="screen-panel">
                    <strong>{title}</strong>
                    <span className={`screen-line screen-line-${index + 1}`} />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <LampasMarkIcon size={42} />
        <h2>Comece seu próximo estudo hoje.</h2>
        <p>
          Do primeiro rascunho até a comunicação final, o Lampas ajuda você em cada etapa.
        </p>
        <Link href="/auth/login" className="hero-primary">
          Criar conta gratuita <ArrowRight size={18} />
        </Link>
      </section>

      <footer className="site-footer">
        <div>
          <LampasLogo height={32} />
          <p>Estudo bíblico profundo para servir a Palavra com clareza.</p>
        </div>
        <nav aria-label="Rodapé">
          <Link href="#recursos">Exegese Bíblica</Link>
          <Link href="#sermoes">Sermões</Link>
          <Link href="#devocionais">Devocionais</Link>
          <Link href="#estudos">Estudos</Link>
          <span>Termos</span>
          <span>Privacidade</span>
          <Link href="mailto:contato@lampas.com.br">Contato</Link>
        </nav>
      </footer>

      <style>{`
        .home-shell {
          min-height: 100vh;
          background: #fbfcfe;
          color: #0f172a;
        }

        .site-header {
          position: sticky;
          top: 0;
          z-index: 20;
          height: 72px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 2rem;
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 1.5rem;
          background: rgba(251,252,254,0.92);
          border-bottom: 1px solid rgba(226,232,240,0.72);
          backdrop-filter: blur(12px);
        }

        .brand {
          display: inline-flex;
          align-items: center;
          color: inherit;
        }

        .site-nav {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1.35rem;
        }

        .site-nav a,
        .login-link,
        .site-footer a,
        .site-footer span {
          color: #475569;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .site-nav a:hover,
        .login-link:hover,
        .site-footer a:hover {
          color: #0f172a;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .primary-link,
        .hero-primary,
        .hero-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 40px;
          border-radius: 8px;
          padding: 0 1rem;
          font-size: 0.92rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .primary-link,
        .hero-primary {
          color: #ffffff;
          background: #0f172a;
          border: 1px solid #0f172a;
        }

        .primary-link:hover,
        .hero-primary:hover {
          color: #ffffff;
          background: #1e293b;
        }

        .hero-section {
          position: relative;
          min-height: 680px;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .hero-visual {
          position: absolute;
          inset: 0;
          opacity: 1;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 1180px;
          width: 100%;
          margin: 0 auto;
          padding: 6rem 1.5rem 5.25rem;
        }

        .hero-content h1 {
          max-width: 690px;
          margin: 0;
          font-family: var(--font-serif);
          font-size: 4rem;
          font-weight: 600;
          letter-spacing: 0;
          line-height: 1;
          color: #0b1220;
        }

        .eyebrow,
        .section-kicker {
          color: #b98214;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .hero-line {
          margin-top: 1rem;
          font-size: 1.55rem;
          font-weight: 700;
          color: #1e293b;
        }

        .hero-copy {
          max-width: 610px;
          margin-top: 1rem;
          color: #475569;
          font-size: 1.08rem;
          line-height: 1.7;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 2rem;
        }

        .hero-primary {
          gap: 0.5rem;
          min-height: 46px;
          padding: 0 1.18rem;
        }

        .hero-secondary {
          color: #0f172a;
          background: #ffffff;
          border: 1px solid #dbe3ee;
        }

        .hero-secondary:hover {
          color: #0f172a;
          border-color: #cbd5e1;
        }

        .product-scene {
          position: absolute;
          right: max(1.5rem, calc((100vw - 1180px) / 2));
          top: 112px;
          width: min(560px, 47vw);
          border: 1px solid rgba(15,23,42,0.12);
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 28px 80px rgba(15,23,42,0.14);
          overflow: hidden;
        }

        .product-topbar {
          height: 44px;
          display: flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0 1rem;
          background: #0f172a;
          color: #ffffff;
          font-size: 0.78rem;
          font-weight: 700;
        }

        .product-topbar span:first-child {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #c9921a;
        }

        .product-layout {
          display: grid;
          grid-template-columns: 150px 1fr;
          min-height: 410px;
        }

        .product-sidebar {
          padding: 1rem;
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
        }

        .product-sidebar strong {
          display: block;
          margin-bottom: 0.75rem;
          color: #0f172a;
          font-size: 0.76rem;
        }

        .product-sidebar span,
        .product-line,
        .showcase-screen span {
          display: block;
          border-radius: 999px;
          background: #e2e8f0;
        }

        .product-sidebar span {
          height: 9px;
          margin-bottom: 0.72rem;
        }

        .product-sidebar span:nth-child(2) { width: 88%; background: rgba(201,146,26,0.28); }
        .product-sidebar span:nth-child(3) { width: 70%; }
        .product-sidebar span:nth-child(4) { width: 78%; }
        .product-sidebar span:nth-child(5) { width: 58%; }

        .product-main {
          padding: 1.1rem;
        }

        .product-reference {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid #edf1f6;
        }

        .product-reference h2 {
          margin: 0;
          font-size: 1.05rem;
          letter-spacing: 0;
        }

        .product-reference p {
          color: #64748b;
          font-size: 0.8rem;
        }

        .product-pill {
          align-self: start;
          border: 1px solid rgba(201,146,26,0.22);
          background: rgba(201,146,26,0.08);
          color: #9a6b10;
          border-radius: 999px;
          padding: 0.16rem 0.55rem;
          font-size: 0.72rem;
          font-weight: 700;
        }

        .product-canvas {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .product-panel {
          min-height: 112px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.82rem;
          background: #ffffff;
        }

        .product-panel strong {
          display: block;
          margin-bottom: 0.65rem;
          color: #0f172a;
          font-size: 0.82rem;
        }

        .product-line {
          height: 8px;
          margin-bottom: 0.52rem;
        }

        .product-line.short { width: 58%; }
        .product-line.medium { width: 76%; }
        .product-line.gold { background: rgba(201,146,26,0.26); width: 68%; }

        .section,
        .leaders-section {
          max-width: 1180px;
          margin: 0 auto;
          padding: 5.25rem 1.5rem 0;
        }

        .section-heading {
          max-width: 720px;
          margin-bottom: 2rem;
        }

        .section-heading h2,
        .final-cta h2 {
          margin-top: 0.35rem;
          font-family: var(--font-serif);
          font-size: 2.45rem;
          font-weight: 600;
          letter-spacing: 0;
          line-height: 1.08;
          color: #0f172a;
        }

        .resource-grid,
        .audience-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.85rem;
        }

        .resource-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .resource-card,
        .content-card,
        .audience-card,
        .showcase-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
        }

        .resource-card {
          padding: 1.1rem;
        }

        .resource-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          color: #b98214;
          background: rgba(201,146,26,0.08);
          border: 1px solid rgba(201,146,26,0.18);
          border-radius: 8px;
          margin-bottom: 0.95rem;
        }

        .resource-card h3,
        .audience-card h3,
        .showcase-card h3 {
          font-size: 1rem;
          font-weight: 750;
          letter-spacing: 0;
          color: #0f172a;
        }

        .resource-card ul {
          list-style: none;
          margin-top: 0.65rem;
        }

        .resource-card li {
          color: #64748b;
          font-size: 0.9rem;
          line-height: 1.65;
        }

        .content-section {
          padding-top: 5.5rem;
        }

        .content-columns {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }

        .content-column h3 {
          margin-bottom: 0.75rem;
          color: #0f172a;
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: 0;
        }

        .content-stack {
          display: grid;
          gap: 0.7rem;
        }

        .content-card {
          padding: 1rem;
        }

        .content-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          margin-bottom: 0.55rem;
          color: #94a3b8;
          font-size: 0.73rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0;
        }

        .content-card h4 {
          color: #0f172a;
          font-size: 0.98rem;
          font-weight: 760;
          line-height: 1.3;
          text-transform: none;
          letter-spacing: 0;
        }

        .content-card p {
          margin-top: 0.45rem;
          color: #64748b;
          font-size: 0.88rem;
          line-height: 1.58;
        }

        .leaders-section {
          padding-top: 5.5rem;
        }

        .audience-card {
          padding: 1.1rem;
        }

        .audience-card svg {
          color: #1d4ed8;
          margin-bottom: 0.8rem;
        }

        .audience-card p,
        .showcase-card p {
          margin-top: 0.45rem;
          color: #64748b;
          font-size: 0.9rem;
          line-height: 1.62;
        }

        .showcase-section {
          padding-bottom: 2rem;
        }

        .showcase-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 0.85rem;
        }

        .showcase-card {
          padding: 0.75rem;
        }

        .showcase-screen {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
          margin-bottom: 0.9rem;
        }

        .screen-header {
          display: flex;
          gap: 0.25rem;
          padding: 0.45rem;
          background: #0f172a;
        }

        .screen-header span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c9921a;
        }

        .screen-body {
          display: grid;
          grid-template-columns: 34px 1fr;
          min-height: 112px;
        }

        .screen-sidebar {
          padding: 0.55rem 0.42rem;
          border-right: 1px solid #e2e8f0;
        }

        .screen-sidebar span {
          height: 6px;
          margin-bottom: 0.42rem;
        }

        .screen-panel {
          padding: 0.65rem;
        }

        .screen-panel strong {
          display: block;
          color: #0f172a;
          font-size: 0.74rem;
          margin-bottom: 0.55rem;
        }

        .screen-panel span {
          height: 6px;
          margin-bottom: 0.42rem;
        }

        .screen-line-1 { width: 82%; background: rgba(201,146,26,0.32); }
        .screen-line-2 { width: 72%; background: rgba(124,58,237,0.22); }
        .screen-line-3 { width: 78%; background: rgba(37,99,235,0.22); }
        .screen-line-4 { width: 62%; background: rgba(190,52,85,0.22); }
        .screen-line-5 { width: 76%; background: rgba(71,85,105,0.22); }

        .final-cta {
          max-width: 900px;
          margin: 4rem auto 0;
          padding: 3.5rem 1.5rem;
          text-align: center;
        }

        .final-cta h2 {
          margin-top: 1rem;
        }

        .final-cta p {
          max-width: 560px;
          margin: 0.8rem auto 1.6rem;
          color: #64748b;
        }

        .site-footer {
          max-width: 1180px;
          margin: 0 auto;
          padding: 2rem 1.5rem 2.5rem;
          border-top: 1px solid #e2e8f0;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 2rem;
          align-items: start;
        }

        .site-footer p {
          margin-top: 0.65rem;
          max-width: 330px;
          color: #64748b;
          font-size: 0.9rem;
        }

        .site-footer nav {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 0.85rem 1.15rem;
          max-width: 520px;
        }

        @media (max-width: 1020px) {
          .site-header {
            grid-template-columns: auto auto;
          }

          .site-nav {
            display: none;
          }

          .product-scene {
            right: 1rem;
            width: 50vw;
            opacity: 0.5;
          }

          .resource-grid,
          .content-columns,
          .audience-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .showcase-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .site-header {
            height: auto;
            padding: 0.85rem 1rem;
            gap: 0.8rem;
          }

          .header-actions {
            justify-content: flex-end;
          }

          .login-link {
            display: none;
          }

          .hero-section {
            min-height: auto;
          }

          .hero-content {
            padding: 4.2rem 1rem 4rem;
          }

          .hero-content h1 {
            font-size: 2.65rem;
          }

          .hero-line {
            font-size: 1.18rem;
          }

          .product-scene {
            position: relative;
            inset: auto;
            width: calc(100% - 2rem);
            margin: 0 1rem 2rem;
            opacity: 1;
          }

          .hero-section {
            display: block;
          }

          .hero-visual {
            position: static;
          }

          .resource-grid,
          .content-columns,
          .audience-grid,
          .showcase-grid {
            grid-template-columns: 1fr;
          }

          .section,
          .leaders-section {
            padding: 4rem 1rem 0;
          }

          .section-heading h2,
          .final-cta h2 {
            font-size: 2rem;
          }

          .site-footer {
            grid-template-columns: 1fr;
            padding: 2rem 1rem;
          }

          .site-footer nav {
            justify-content: flex-start;
          }
        }
      `}</style>
    </main>
  )
}

function ProductScene() {
  return (
    <div className="product-scene">
      <div className="product-topbar">
        <span />
        <span>Lampas Workspace</span>
      </div>
      <div className="product-layout">
        <aside className="product-sidebar">
          <strong>Fluxo de Estudo</strong>
          <span />
          <span />
          <span />
          <span />
        </aside>
        <div className="product-main">
          <div className="product-reference">
            <div>
              <h2>Romanos 8.28-39</h2>
              <p>Texto → Observação → Interpretação → Teologia → Comunicação</p>
            </div>
            <span className="product-pill">Exegese</span>
          </div>
          <div className="product-canvas">
            <div className="product-panel">
              <strong>Observação</strong>
              <span className="product-line gold" />
              <span className="product-line medium" />
              <span className="product-line short" />
            </div>
            <div className="product-panel">
              <strong>Interpretação</strong>
              <span className="product-line medium" />
              <span className="product-line gold" />
              <span className="product-line short" />
            </div>
            <div className="product-panel">
              <strong>Teologia</strong>
              <span className="product-line gold" />
              <span className="product-line medium" />
              <span className="product-line short" />
            </div>
            <div className="product-panel">
              <strong>Comunicação</strong>
              <span className="product-line medium" />
              <span className="product-line short" />
              <span className="product-line gold" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type ContentItem =
  | { title: string; text: string; date: string; author: string }
  | { title: string; book: string; category: string; date: string }
  | { title: string; summary: string; category: string }

function ContentColumn({
  title,
  items,
  type,
}: {
  title: string
  items: ContentItem[]
  type: 'devotional' | 'study' | 'article'
}) {
  return (
    <div id={type === 'devotional' ? 'devocionais' : undefined} className="content-column">
      <h3>{title}</h3>
      <div className="content-stack">
        {items.map(item => (
          <article key={item.title} className="content-card">
            <div className="content-meta">
              {'date' in item && <span>{item.date}</span>}
              {'author' in item && <span>{item.author}</span>}
              {'category' in item && <span>{item.category}</span>}
            </div>
            <h4>{item.title}</h4>
            {'text' in item && <p>{item.text}</p>}
            {'book' in item && <p>{item.book}</p>}
            {'summary' in item && <p>{item.summary}</p>}
          </article>
        ))}
      </div>
    </div>
  )
}
