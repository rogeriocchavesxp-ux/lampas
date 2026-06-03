import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LampasLogo, LampasMarkIcon } from '@/components/LampasLogo'

const steps = [
  { n: '01', label: 'Observação',    text: 'O que o texto diz exatamente.' },
  { n: '02', label: 'Interpretação', text: 'O que o autor quis comunicar.' },
  { n: '03', label: 'Teologia',      text: 'A mensagem central e sua coerência.' },
  { n: '04', label: 'Comunicação',   text: 'Do texto ao sermão, estudo ou devocional.' },
] as const

const audiences = [
  { title: 'Pastores',              line: 'Preparação de sermões com método, acúmulo de pesquisa e comunicação fiel.' },
  { title: 'Professores de EBD',   line: 'Estruturação de aulas, perguntas progressivas e material para grupos.' },
  { title: 'Seminaristas',          line: 'Pesquisa, exegese e organização acadêmica em um só lugar.' },
  { title: 'Estudantes da Bíblia', line: 'Leitura atenta, interpretação fiel e aplicação para a vida.' },
] as const

const resources = [
  { title: 'Exegese Bíblica',   line: 'Texto original, contexto histórico e análise textual.' },
  { title: 'Estudos Bíblicos',  line: 'Preparação de aulas, EBD e grupos pequenos.' },
  { title: 'Sermões',            line: 'Da exegese à estrutura e entrega pastoral.' },
  { title: 'Biblioteca',         line: 'Dicionários reformados, referências e pesquisa integrada.' },
] as const

export default function HomePage() {
  return (
    <main className="lp-shell">

      {/* ── Header ── */}
      <header className="lp-header">
        <Link href="/" className="lp-brand" aria-label="Lampas">
          <LampasLogo height={46} />
        </Link>
        <nav className="lp-nav" aria-label="Navegação principal">
          <Link href="#processo">Método</Link>
          <Link href="#recursos">Recursos</Link>
          <Link href="#planos">Planos</Link>
        </nav>
        <div className="lp-header-actions">
          <Link href="/auth/login" className="lp-link-muted">Entrar</Link>
          <Link href="/auth/login" className="lp-btn-dark">Começar grátis</Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="lp-hero" id="inicio">
        <div className="lp-hero-content">
          <p className="lp-eyebrow">Plataforma bíblica para estudo, interpretação e comunicação</p>
          <h1 className="lp-h1">Iluminando a sua jornada<br />de estudo bíblico.</h1>
          <p className="lp-hero-sub">Estude. Interprete. Comunique.</p>
          <p className="lp-hero-body">
            Uma plataforma criada para pastores, professores, seminaristas e estudantes
            da Bíblia desenvolverem estudos com profundidade, método e clareza.
          </p>
          <div className="lp-hero-actions">
            <Link href="/auth/login" className="lp-btn-primary">
              Começar gratuitamente <ArrowRight size={16} />
            </Link>
            <Link href="#processo" className="lp-btn-ghost">Ver como funciona</Link>
          </div>
        </div>
        <div className="lp-hero-mockup" aria-hidden="true">
          <WorkspaceMockup />
        </div>
      </section>

      {/* ── Processo ── */}
      <section className="lp-process" id="processo">
        <div className="lp-inner">
          <p className="lp-kicker">Método</p>
          <h2 className="lp-h2">O Lampas acompanha todo o processo</h2>
          <div className="lp-steps">
            <div className="lp-steps-line" aria-hidden="true" />
            {steps.map(({ n, label, text }) => (
              <div key={n} className="lp-step">
                <div className="lp-step-dot">
                  <span className="lp-step-n">{n}</span>
                </div>
                <h3 className="lp-step-label">{label}</h3>
                <p className="lp-step-text">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Para quem ── */}
      <section className="lp-section" id="para-quem">
        <div className="lp-inner">
          <p className="lp-kicker">Vocação</p>
          <h2 className="lp-h2">Criado para quem quer entender, viver e ensinar a Palavra.</h2>
          <div className="lp-audience-grid">
            {audiences.map(({ title, line }) => (
              <article key={title} className="lp-audience-card">
                <h3>{title}</h3>
                <p>{line}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recursos ── */}
      <section className="lp-section lp-resources-section" id="recursos">
        <div className="lp-inner">
          <p className="lp-kicker">Recursos</p>
          <h2 className="lp-h2">Tudo em um só ambiente</h2>
          <div className="lp-resource-grid">
            {resources.map(({ title, line }) => (
              <article key={title} className="lp-resource-card">
                <h3>{title}</h3>
                <p>{line}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Planos ── */}
      <section className="lp-section lp-plans-section" id="planos">
        <div className="lp-inner">
          <p className="lp-kicker">Planos</p>
          <h2 className="lp-h2">Comece grátis. Cresça no seu ritmo.</h2>
          <div className="lp-plans-grid">

            <article className="lp-plan-card">
              <div className="lp-plan-header">
                <h3>Gratuito</h3>
                <div className="lp-plan-price"><span className="lp-price-val">Grátis</span></div>
              </div>
              <ul className="lp-plan-features">
                <li>1 projeto</li>
                <li>5 consultas de IA por mês</li>
                <li>Fase Preparar</li>
                <li>Devocional</li>
              </ul>
              <Link href="/auth/login" className="lp-plan-btn lp-plan-btn-ghost">Começar grátis</Link>
            </article>

            <article className="lp-plan-card">
              <div className="lp-plan-header">
                <h3>Iniciante</h3>
                <div className="lp-plan-price">
                  <span className="lp-price-val">R$ 19</span>
                  <span className="lp-price-period">/mês</span>
                </div>
              </div>
              <ul className="lp-plan-features">
                <li>3 projetos</li>
                <li>40 consultas de IA por mês</li>
                <li>Preparar + Investigar</li>
                <li>Devocional</li>
                <li>Colagens (20)</li>
              </ul>
              <Link href="/auth/login" className="lp-plan-btn lp-plan-btn-ghost">Assinar</Link>
            </article>

            <article className="lp-plan-card lp-plan-card-featured">
              <div className="lp-plan-badge">Popular</div>
              <div className="lp-plan-header">
                <h3>Intermediário</h3>
                <div className="lp-plan-price">
                  <span className="lp-price-val">R$ 49</span>
                  <span className="lp-price-period">/mês</span>
                </div>
              </div>
              <ul className="lp-plan-features">
                <li>10 projetos</li>
                <li>120 consultas de IA por mês</li>
                <li>Todas as fases</li>
                <li>Todos os modos de estudo</li>
                <li>Ferramentas de pesquisa</li>
                <li>Colagens (100)</li>
              </ul>
              <Link href="/auth/login" className="lp-plan-btn lp-plan-btn-dark">Assinar</Link>
            </article>

            <article className="lp-plan-card">
              <div className="lp-plan-header">
                <h3>Avançado</h3>
                <div className="lp-plan-price">
                  <span className="lp-price-val">R$ 89</span>
                  <span className="lp-price-period">/mês</span>
                </div>
              </div>
              <ul className="lp-plan-features">
                <li>Projetos ilimitados</li>
                <li>400 consultas de IA por mês</li>
                <li>Tudo incluído</li>
                <li>Texto original (heb/grego)</li>
                <li>Comentário expositivo</li>
                <li>Colagens ilimitadas</li>
              </ul>
              <Link href="/auth/login" className="lp-plan-btn lp-plan-btn-ghost">Assinar</Link>
            </article>

          </div>
          <p className="lp-plans-note">Planos anuais com 20% de desconto. Cancele a qualquer momento.</p>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="lp-cta">
        <LampasMarkIcon size={36} />
        <h2>Comece seu próximo estudo hoje.</h2>
        <p>Do primeiro rascunho ao resultado final — o Lampas acompanha cada etapa do seu estudo.</p>
        <Link href="/auth/login" className="lp-btn-primary">
          Criar conta gratuita <ArrowRight size={16} />
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-brand">
          <LampasLogo height={36} />
          <p>Estudo bíblico com profundidade, método e clareza.</p>
        </div>
        <nav className="lp-footer-nav" aria-label="Rodapé">
          <Link href="#recursos">Exegese</Link>
          <Link href="#recursos">Sermões</Link>
          <Link href="#recursos">Estudos</Link>
          <Link href="#planos">Planos</Link>
          <Link href="mailto:contato@lampas.com.br">Contato</Link>
        </nav>
      </footer>

      <style>{`
        /* ── Reset & shell ─────────────────────────────── */
        .lp-shell {
          min-height: 100vh;
          background: #f8fafc;
          color: #0f172a;
          font-family: inherit;
        }

        .lp-shell a { text-decoration: none; }

        .lp-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        /* ── Header ─────────────────────────────────────── */
        .lp-header {
          position: sticky;
          top: 0;
          z-index: 40;
          height: 64px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 2rem;
          max-width: 100%;
          padding: 0 2.5rem;
          background: rgba(248,250,252,0.90);
          border-bottom: 1px solid rgba(226,232,240,0.60);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .lp-brand {
          display: inline-flex;
          align-items: center;
          color: inherit;
        }

        .lp-nav {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1.75rem;
        }

        .lp-nav a {
          color: #64748b;
          font-size: 0.88rem;
          font-weight: 500;
          transition: color 0.14s;
        }

        .lp-nav a:hover { color: #0f172a; }

        .lp-header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .lp-link-muted {
          color: #64748b;
          font-size: 0.88rem;
          font-weight: 500;
          transition: color 0.14s;
        }

        .lp-link-muted:hover { color: #0f172a; }

        /* ── Buttons ─────────────────────────────────────── */
        .lp-btn-dark {
          display: inline-flex;
          align-items: center;
          height: 36px;
          padding: 0 1rem;
          background: #0f172a;
          color: #fff;
          font-size: 0.84rem;
          font-weight: 650;
          border-radius: 7px;
          transition: background 0.14s;
          white-space: nowrap;
        }

        .lp-btn-dark:hover { background: #1e293b; color: #fff; }

        .lp-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          height: 48px;
          padding: 0 1.5rem;
          background: #0f172a;
          color: #fff;
          font-size: 0.96rem;
          font-weight: 650;
          border-radius: 9px;
          transition: background 0.14s;
          white-space: nowrap;
        }

        .lp-btn-primary:hover { background: #1e293b; color: #fff; }

        .lp-btn-ghost {
          display: inline-flex;
          align-items: center;
          height: 48px;
          padding: 0 1.25rem;
          background: #fff;
          color: #0f172a;
          font-size: 0.96rem;
          font-weight: 550;
          border-radius: 9px;
          border: 1px solid #dbe3ee;
          transition: border-color 0.14s;
          white-space: nowrap;
        }

        .lp-btn-ghost:hover { border-color: #b0bfcc; color: #0f172a; }

        /* ── Typography helpers ──────────────────────────── */
        .lp-eyebrow, .lp-kicker {
          display: block;
          color: #b98214;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }

        .lp-h1 {
          margin: 0 0 1rem;
          font-size: clamp(2.8rem, 5.5vw, 4.75rem);
          font-weight: 700;
          line-height: 1.0;
          letter-spacing: -0.02em;
          color: #0b1220;
        }

        .lp-h2 {
          margin: 0 0 3rem;
          font-size: clamp(1.75rem, 3vw, 2.6rem);
          font-weight: 650;
          line-height: 1.1;
          letter-spacing: -0.015em;
          color: #0f172a;
        }

        /* ── Hero ─────────────────────────────────────────── */
        .lp-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 4rem;
          max-width: 1120px;
          margin: 0 auto;
          padding: 7rem 2rem 6rem;
          min-height: 620px;
        }

        .lp-hero-sub {
          font-size: 1.45rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 1.1rem;
        }

        .lp-hero-body {
          max-width: 520px;
          color: #475569;
          font-size: 1.05rem;
          line-height: 1.72;
          margin: 0 0 2.25rem;
        }

        .lp-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        /* ── Workspace mockup ────────────────────────────── */
        .lp-hero-mockup {
          position: relative;
        }

        .ws-frame {
          background: #fff;
          border: 1px solid rgba(15,23,42,0.1);
          border-radius: 12px;
          box-shadow:
            0 2px 4px rgba(15,23,42,0.04),
            0 12px 40px rgba(15,23,42,0.10),
            0 40px 80px rgba(15,23,42,0.08);
          overflow: hidden;
          width: 100%;
        }

        .ws-topbar {
          height: 40px;
          background: #0f172a;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0 1rem;
        }

        .ws-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }

        .ws-dot-gold { background: #c9921a; }
        .ws-dot-slate { background: rgba(255,255,255,0.18); }

        .ws-title {
          margin-left: 0.5rem;
          color: rgba(255,255,255,0.7);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .ws-body {
          display: grid;
          grid-template-columns: 160px 1fr;
          min-height: 380px;
        }

        .ws-sidebar {
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
          padding: 1.25rem 1rem;
        }

        .ws-sidebar-label {
          font-size: 0.68rem;
          font-weight: 750;
          color: #94a3b8;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
          display: block;
        }

        .ws-nav-item {
          display: block;
          height: 8px;
          border-radius: 4px;
          background: #e2e8f0;
          margin-bottom: 0.65rem;
        }

        .ws-nav-item:nth-child(2) { width: 90%; background: rgba(201,146,26,0.32); }
        .ws-nav-item:nth-child(3) { width: 72%; }
        .ws-nav-item:nth-child(4) { width: 82%; }
        .ws-nav-item:nth-child(5) { width: 60%; }
        .ws-nav-item:nth-child(6) { width: 75%; }

        .ws-main {
          padding: 1.25rem 1.5rem;
        }

        .ws-ref-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding-bottom: 1rem;
          margin-bottom: 1.25rem;
          border-bottom: 1px solid #e8edf4;
          gap: 1rem;
        }

        .ws-ref-title {
          font-size: 1.1rem;
          font-weight: 750;
          color: #0f172a;
          margin: 0 0 0.25rem;
        }

        .ws-ref-sub {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0;
        }

        .ws-badge {
          flex-shrink: 0;
          padding: 0.2rem 0.6rem;
          background: rgba(201,146,26,0.1);
          border: 1px solid rgba(201,146,26,0.22);
          color: #9a6b10;
          font-size: 0.7rem;
          font-weight: 750;
          border-radius: 999px;
          white-space: nowrap;
        }

        .ws-panels {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }

        .ws-panel {
          border: 1px solid #e8edf4;
          border-radius: 8px;
          padding: 0.9rem;
          background: #fff;
        }

        .ws-panel-title {
          font-size: 0.78rem;
          font-weight: 750;
          color: #0f172a;
          display: block;
          margin-bottom: 0.7rem;
        }

        .ws-bar {
          height: 7px;
          border-radius: 4px;
          background: #e2e8f0;
          margin-bottom: 0.5rem;
        }

        .ws-bar-gold { background: rgba(201,146,26,0.28); }
        .ws-bar-blue { background: rgba(37,99,235,0.18); }
        .ws-bar-w100 { width: 100%; }
        .ws-bar-w82  { width: 82%;  }
        .ws-bar-w65  { width: 65%;  }
        .ws-bar-w72  { width: 72%;  }
        .ws-bar-w88  { width: 88%;  }
        .ws-bar-w55  { width: 55%;  }

        /* ── Process section ─────────────────────────────── */
        .lp-process {
          padding: 8rem 0 7rem;
          background: #fff;
          border-top: 1px solid #e8edf4;
          border-bottom: 1px solid #e8edf4;
        }

        .lp-steps {
          position: relative;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          padding-top: 2rem;
        }

        .lp-steps-line {
          position: absolute;
          top: 2.15rem;
          left: calc(12.5% + 1rem);
          right: calc(12.5% + 1rem);
          height: 1px;
          background: linear-gradient(90deg, #c9921a 0%, #dbe3ee 100%);
          z-index: 0;
        }

        .lp-step {
          position: relative;
          z-index: 1;
          text-align: center;
        }

        .lp-step-dot {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #fff;
          border: 1.5px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
          position: relative;
        }

        .lp-step:first-child .lp-step-dot {
          border-color: #c9921a;
          background: rgba(201,146,26,0.06);
        }

        .lp-step-n {
          font-size: 0.7rem;
          font-weight: 800;
          color: #94a3b8;
          letter-spacing: 0.04em;
        }

        .lp-step:first-child .lp-step-n {
          color: #b98214;
        }

        .lp-step-label {
          font-size: 1.05rem;
          font-weight: 750;
          color: #0f172a;
          margin: 0 0 0.5rem;
        }

        .lp-step-text {
          color: #64748b;
          font-size: 0.9rem;
          line-height: 1.6;
          margin: 0;
          padding: 0 0.5rem;
        }

        /* ── Audience section ────────────────────────────── */
        .lp-section {
          padding: 8rem 0 0;
        }

        .lp-audience-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }

        .lp-audience-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1.75rem 1.5rem;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .lp-audience-card:hover {
          border-color: #b0bfcc;
          box-shadow: 0 4px 20px rgba(15,23,42,0.06);
        }

        .lp-audience-card h3 {
          font-size: 1.05rem;
          font-weight: 750;
          color: #0f172a;
          margin: 0 0 0.65rem;
        }

        .lp-audience-card p {
          color: #64748b;
          font-size: 0.88rem;
          line-height: 1.65;
          margin: 0;
        }

        /* ── Resources section ───────────────────────────── */
        .lp-resources-section {
          padding: 6rem 0 8rem;
        }

        .lp-resource-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }

        .lp-resource-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1.75rem 1.5rem;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .lp-resource-card:hover {
          border-color: #b0bfcc;
          box-shadow: 0 4px 20px rgba(15,23,42,0.06);
        }

        .lp-resource-card h3 {
          font-size: 1rem;
          font-weight: 750;
          color: #0f172a;
          margin: 0 0 0.5rem;
        }

        .lp-resource-card p {
          color: #64748b;
          font-size: 0.88rem;
          line-height: 1.6;
          margin: 0;
        }

        /* ── Plans section ───────────────────────────────── */
        .lp-plans-section {
          padding: 6rem 0 7rem;
          background: #fff;
          border-top: 1px solid #e8edf4;
        }

        .lp-plans-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin-bottom: 1.75rem;
        }

        .lp-plan-card {
          position: relative;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.75rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .lp-plan-card:hover {
          border-color: #b0bfcc;
          box-shadow: 0 4px 20px rgba(15,23,42,0.06);
        }

        .lp-plan-card-featured {
          border-color: #c9921a;
          box-shadow: 0 4px 24px rgba(201,146,26,0.12);
        }

        .lp-plan-card-featured:hover {
          border-color: #c9921a;
          box-shadow: 0 6px 32px rgba(201,146,26,0.18);
        }

        .lp-plan-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #c9921a;
          color: #fff;
          font-size: 0.7rem;
          font-weight: 750;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.22rem 0.65rem;
          border-radius: 999px;
          white-space: nowrap;
        }

        .lp-plan-header h3 {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.6rem;
        }

        .lp-plan-price {
          display: flex;
          align-items: baseline;
          gap: 0.2rem;
        }

        .lp-price-val {
          font-size: 1.9rem;
          font-weight: 750;
          color: #0f172a;
          line-height: 1;
        }

        .lp-price-period {
          font-size: 0.84rem;
          color: #64748b;
        }

        .lp-plan-features {
          list-style: none;
          padding: 0;
          margin: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }

        .lp-plan-features li {
          font-size: 0.87rem;
          color: #475569;
          padding-left: 1.1rem;
          position: relative;
          line-height: 1.45;
        }

        .lp-plan-features li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #c9921a;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .lp-plan-btn {
          display: block;
          text-align: center;
          padding: 0.65rem 1rem;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 650;
          transition: all 0.14s;
        }

        .lp-plan-btn-ghost {
          background: transparent;
          border: 1px solid #dbe3ee;
          color: #0f172a;
        }

        .lp-plan-btn-ghost:hover {
          border-color: #b0bfcc;
          color: #0f172a;
        }

        .lp-plan-btn-dark {
          background: #0f172a;
          border: 1px solid #0f172a;
          color: #fff;
        }

        .lp-plan-btn-dark:hover {
          background: #1e293b;
          color: #fff;
        }

        .lp-plans-note {
          text-align: center;
          color: #94a3b8;
          font-size: 0.84rem;
        }

        /* ── Final CTA ───────────────────────────────────── */
        .lp-cta {
          text-align: center;
          padding: 7rem 2rem 8rem;
          background: #fff;
          border-top: 1px solid #e8edf4;
        }

        .lp-cta h2 {
          margin: 1.25rem 0 0.75rem;
          font-size: clamp(1.75rem, 3vw, 2.4rem);
          font-weight: 650;
          letter-spacing: -0.015em;
          color: #0f172a;
        }

        .lp-cta p {
          color: #64748b;
          font-size: 1.05rem;
          line-height: 1.65;
          max-width: 480px;
          margin: 0 auto 2.25rem;
        }

        /* ── Footer ──────────────────────────────────────── */
        .lp-footer {
          max-width: 1120px;
          margin: 0 auto;
          padding: 2.25rem 2rem 3rem;
          border-top: 1px solid #e2e8f0;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 2rem;
          align-items: start;
        }

        .lp-footer-brand p {
          margin-top: 0.6rem;
          max-width: 320px;
          color: #94a3b8;
          font-size: 0.85rem;
          line-height: 1.6;
        }

        .lp-footer-nav {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 0.75rem 1.25rem;
        }

        .lp-footer-nav a {
          color: #64748b;
          font-size: 0.85rem;
          font-weight: 500;
          transition: color 0.14s;
        }

        .lp-footer-nav a:hover { color: #0f172a; }

        /* ── Responsive ──────────────────────────────────── */
        @media (max-width: 1080px) {
          .lp-hero {
            grid-template-columns: 1fr;
            padding: 5rem 2rem 4rem;
            min-height: auto;
          }

          .lp-hero-mockup {
            max-width: 560px;
            margin: 0 auto;
            width: 100%;
          }

          .lp-steps {
            grid-template-columns: repeat(2, 1fr);
          }

          .lp-steps-line {
            display: none;
          }

          .lp-audience-grid,
          .lp-resource-grid,
          .lp-plans-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 680px) {
          .lp-header {
            grid-template-columns: auto auto;
            padding: 0 1.25rem;
          }

          .lp-nav { display: none; }

          .lp-link-muted { display: none; }

          .lp-hero {
            padding: 3.5rem 1.25rem 3rem;
          }

          .lp-steps,
          .lp-audience-grid,
          .lp-resource-grid,
          .lp-plans-grid {
            grid-template-columns: 1fr;
          }

          .lp-section { padding: 5rem 0 0; }

          .lp-resources-section { padding: 4rem 0 5rem; }

          .lp-footer {
            grid-template-columns: 1fr;
            padding: 2rem 1.25rem;
          }

          .lp-footer-nav { justify-content: flex-start; }

          .ws-body { grid-template-columns: 1fr; }
          .ws-sidebar { display: none; }
        }
      `}</style>
    </main>
  )
}

function WorkspaceMockup() {
  return (
    <div className="ws-frame">
      <div className="ws-topbar">
        <span className="ws-dot ws-dot-gold" />
        <span className="ws-dot ws-dot-slate" />
        <span className="ws-dot ws-dot-slate" />
        <span className="ws-title">Lampas Workspace</span>
      </div>
      <div className="ws-body">
        <aside className="ws-sidebar">
          <span className="ws-sidebar-label">Fluxo de Estudo</span>
          <span className="ws-nav-item" />
          <span className="ws-nav-item" />
          <span className="ws-nav-item" />
          <span className="ws-nav-item" />
          <span className="ws-nav-item" />
        </aside>
        <div className="ws-main">
          <div className="ws-ref-row">
            <div>
              <p className="ws-ref-title">Romanos 8.28-39</p>
              <p className="ws-ref-sub">Texto · Observação · Interpretação · Teologia</p>
            </div>
            <span className="ws-badge">Exegese Bíblica</span>
          </div>
          <div className="ws-panels">
            <div className="ws-panel">
              <span className="ws-panel-title">Observação</span>
              <div className="ws-bar ws-bar-gold ws-bar-w88" />
              <div className="ws-bar ws-bar-w100" />
              <div className="ws-bar ws-bar-w65" />
            </div>
            <div className="ws-panel">
              <span className="ws-panel-title">Interpretação</span>
              <div className="ws-bar ws-bar-w82" />
              <div className="ws-bar ws-bar-gold ws-bar-w72" />
              <div className="ws-bar ws-bar-w55" />
            </div>
            <div className="ws-panel">
              <span className="ws-panel-title">Teologia</span>
              <div className="ws-bar ws-bar-gold ws-bar-w72" />
              <div className="ws-bar ws-bar-w88" />
              <div className="ws-bar ws-bar-blue ws-bar-w65" />
            </div>
            <div className="ws-panel">
              <span className="ws-panel-title">Comunicação</span>
              <div className="ws-bar ws-bar-w82" />
              <div className="ws-bar ws-bar-blue ws-bar-w55" />
              <div className="ws-bar ws-bar-gold ws-bar-w72" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
