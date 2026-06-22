'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Menu, X } from 'lucide-react'
import { LampasLogo, LampasMarkIcon } from '@/components/LampasLogo'
import { PLANS, formatPrice } from '@/lib/plans'

const steps = [
  { n: '01', label: 'Preparar',    text: 'Oração, leitura atenta e primeiras impressões antes da análise.' },
  { n: '02', label: 'Interpretar', text: 'Contexto histórico, texto original e síntese teológica.' },
  { n: '03', label: 'Comunicar',   text: 'Sermão, estudo bíblico ou devocional — do texto ao púlpito.' },
] as const

const audiences = [
  { title: 'Pastores',             line: 'Preparação de sermões com rigor exegético, método e economia de tempo.' },
  { title: 'Professores de EBD',  line: 'Estruturação de aulas, perguntas progressivas e material para grupos.' },
  { title: 'Seminaristas',         line: 'Pesquisa, exegese e organização acadêmica em um só lugar.' },
  { title: 'Estudantes da Bíblia', line: 'Leitura atenta, interpretação fiel e aplicação para a vida.' },
] as const

const resources = [
  { title: 'Exegese Bíblica',  line: 'Texto original em hebraico e grego, contexto histórico e análise textual completa.' },
  { title: 'Sermão Builder',   line: 'Da Grande Ideia à conclusão — estrutura, ilustrações e exportação em PDF.' },
  { title: 'Estudos Bíblicos', line: 'Preparação de aulas, EBD, grupos pequenos e devocional.' },
  { title: 'Ferramentas',      line: 'Dicionário Lampas, Teologia Bíblica, Sistemática e Referências Cruzadas.' },
] as const

const testimonials = [
  {
    quote: 'O Lampas reduziu meu tempo de preparação pela metade sem abrir mão da profundidade exegética. É a ferramenta que eu procurava há anos.',
    name: 'Pr. Marcos Oliveira',
    role: 'Pastor Titular · Igreja Presbiteriana',
  },
  {
    quote: 'Finalmente consigo acessar o texto em grego e hebraico com análise em português. Isso mudou completamente minha relação com o texto bíblico.',
    name: 'Pr. Lucas Ferreira',
    role: 'Pastor e Professor de Teologia',
  },
  {
    quote: 'Como professor de seminário, o Lampas virou referência para os meus alunos. O método é sólido e a IA entende de exegese reformada.',
    name: 'Dr. André Costa',
    role: 'Professor de Hermenêutica',
  },
] as const

const PLAN_ORDER = ['free', 'iniciante', 'intermediario', 'avancado'] as const

const PLAN_FOR_WHOM: Record<string, string> = {
  free:          'Para quem quer conhecer o Lampas antes de se comprometer.',
  iniciante:     'Para estudantes bíblicos e líderes de grupo que estudam regularmente.',
  intermediario: 'Para pastores e professores que preparam conteúdo toda semana.',
  avancado:      'Para pregadores e pesquisadores que vivem do estudo das Escrituras.',
}

function getInitials(name: string) {
  return name
    .replace(/^(Pr\.|Dr\.|Prof\.)\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
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
          <Link href="/auth/login" className="lp-btn-gold-sm">Começar grátis</Link>
          <button
            className="lp-hamburger"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ── Mobile nav drawer ── */}
      {menuOpen && (
        <div className="lp-mobile-nav" role="dialog" aria-label="Menu de navegação">
          <Link href="#processo" onClick={() => setMenuOpen(false)}>Método</Link>
          <Link href="#recursos" onClick={() => setMenuOpen(false)}>Recursos</Link>
          <Link href="#planos"   onClick={() => setMenuOpen(false)}>Planos</Link>
          <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="lp-mobile-nav-login">Entrar</Link>
          <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="lp-btn-gold lp-mobile-nav-cta">Começar grátis</Link>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="lp-hero" id="inicio">
        <div className="lp-hero-inner">
          <div className="lp-hero-content">
            <p className="lp-eyebrow-light">Para pastores, pregadores e seminaristas</p>
            <h1 className="lp-h1-dark">
              Todo pastor quer pregar bem.<br />
              Poucos têm tempo para estudar<br />
              como o texto merece.
            </h1>
            <p className="lp-hero-body-dark">
              O Lampas resolve isso. Uma plataforma de exegese bíblica e preparação de sermões com inteligência artificial — rigor acadêmico, em português, sem desperdiçar horas.
            </p>
            <div className="lp-hero-actions">
              <Link href="/auth/login" className="lp-btn-gold">
                Começar grátis <ArrowRight size={16} />
              </Link>
              <Link href="#demo" className="lp-btn-ghost-dark">Ver como funciona</Link>
            </div>
          </div>
          <div className="lp-hero-mockup" aria-hidden="true">
            <WorkspaceMockup />
          </div>
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

      {/* ── Depoimentos ── */}
      <section className="lp-testimonials">
        <div className="lp-inner">
          <p className="lp-kicker">Quem já usa</p>
          <h2 className="lp-h2">Pastores que estudam com o Lampas</h2>
          <div className="lp-testimonials-grid">
            {testimonials.map(({ quote, name, role }) => (
              <article key={name} className="lp-testimonial-card">
                <p className="lp-testimonial-quote">"{quote}"</p>
                <div className="lp-testimonial-author">
                  <div className="lp-testimonial-avatar" aria-hidden="true">
                    {getInitials(name)}
                  </div>
                  <div>
                    <strong>{name}</strong>
                    <span>{role}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo ── */}
      <section className="lp-demo" id="demo">
        <div className="lp-inner">
          <p className="lp-kicker">Demonstração</p>
          <h2 className="lp-h2">Veja o Lampas em ação</h2>
          <div className="lp-video-wrap">
            <iframe
              src="https://www.youtube.com/embed/GeaGIJ72qcQ"
              title="Lampas — Demonstração"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="lp-video"
            />
          </div>
        </div>
      </section>

      {/* ── Planos ── */}
      <section className="lp-section lp-plans-section" id="planos">
        <div className="lp-inner">
          <p className="lp-kicker">Planos</p>

          {/* Proposta de valor */}
          <div className="lp-plans-value">
            <h2 className="lp-h2 lp-plans-h2">
              Conheça o Lampas por completo antes de decidir.
            </h2>
            <p className="lp-plans-value-text">
              Preparar um bom sermão, estudo ou aula exige tempo, método e organização.
              O Lampas reúne tudo isso em um único ambiente — conduzindo você do texto bíblico
              até a comunicação da Palavra com profundidade e fidelidade.
            </p>
            <p className="lp-plans-value-text">
              Por isso, todo novo usuário recebe acesso completo ao plano Premium durante 7 dias,
              sem precisar informar cartão de crédito. O período começa apenas quando você
              criar seu primeiro projeto.
            </p>
          </div>

          {/* O que está incluso no teste */}
          <div className="lp-trial-features">
            {[
              'Todos os modos de estudo — Sermão, Exegético, Temático, Doutrinário',
              'IA exegética especializada em texto bíblico reformado',
              'Texto original em hebraico e grego',
              'Comentário expositivo versículo a versículo',
              'Sermão Builder com exportação em PDF',
              'Biblioteca, Dicionário Lampas e Referências Cruzadas',
            ].map(f => (
              <div key={f} className="lp-trial-feature-item">
                <span className="lp-trial-check">✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>

          {/* Planos */}
          <div className="lp-plans-grid">
            {PLAN_ORDER.map(planId => {
              const plan       = PLANS[planId]
              const isPremium  = planId === 'avancado'
              const isPopular  = plan.badge === 'Mais popular'
              const isFeatured = isPremium || isPopular
              const isFree     = planId === 'free'

              return (
                <article
                  key={planId}
                  className={`lp-plan-card${isPremium ? ' lp-plan-card-premium' : isPopular ? ' lp-plan-card-popular' : ''}`}
                >
                  {plan.badge && (
                    <div className={`lp-plan-badge${isPremium ? ' lp-plan-badge-premium' : ''}`}>
                      {plan.badge}
                    </div>
                  )}

                  <div className="lp-plan-header">
                    <h3>{plan.name}</h3>
                    <p className="lp-plan-for-whom">{PLAN_FOR_WHOM[planId]}</p>
                  </div>

                  <ul className="lp-plan-features">
                    {plan.features.map(f => (
                      <li key={f} className={isPremium ? 'lp-feature-premium' : ''}>{f}</li>
                    ))}
                  </ul>

                  <Link
                    href="/auth/login"
                    className={`lp-plan-btn ${isPremium ? 'lp-plan-btn-gold' : isFeatured ? 'lp-plan-btn-outline-gold' : 'lp-plan-btn-ghost'}`}
                  >
                    {isFree ? 'Começar gratuitamente' : 'Experimentar 7 dias grátis'}
                  </Link>

                  <p className="lp-plan-price-note">
                    {isFree
                      ? 'Sempre gratuito'
                      : `A partir de R$ ${(plan.priceMonthly / 100).toFixed(0)}/mês`}
                  </p>
                </article>
              )
            })}
          </div>

          <p className="lp-plans-note">
            Planos anuais com 20% de desconto · Cancele a qualquer momento · Nenhuma cobrança durante o teste
          </p>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="lp-cta">
        <LampasMarkIcon size={36} />
        <h2>O texto de domingo está esperando.</h2>
        <p>Do primeiro contato com a passagem ao sermão pronto — o Lampas acompanha cada etapa com método, profundidade e IA exegética.</p>
        <Link href="/auth/login" className="lp-btn-gold lp-btn-gold-lg">
          Começar grátis <ArrowRight size={16} />
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-brand">
          <LampasLogo height={36} variant="light" />
          <p>Estudo bíblico com profundidade, método e clareza.</p>
        </div>
        <nav className="lp-footer-nav" aria-label="Rodapé">
          <Link href="#recursos">Recursos</Link>
          <Link href="#processo">Método</Link>
          <Link href="#planos">Planos</Link>
          <Link href="mailto:contato@lampas.com.br">Contato</Link>
        </nav>
      </footer>

      <style>{`
        /* ── Reset & shell ─────────────────────────────── */
        .lp-shell {
          min-height: 100vh;
          background: #f5f0e8;
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
          background: rgba(245,240,232,0.92);
          border-bottom: 1px solid rgba(201,146,26,0.15);
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
        .lp-btn-gold-sm {
          display: inline-flex;
          align-items: center;
          height: 36px;
          padding: 0 1rem;
          background: #c9921a;
          color: #fff;
          font-size: 0.84rem;
          font-weight: 650;
          border-radius: 7px;
          transition: background 0.14s;
          white-space: nowrap;
        }
        .lp-btn-gold-sm:hover { background: #b07c14; color: #fff; }

        .lp-btn-gold {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          height: 48px;
          padding: 0 1.5rem;
          background: #c9921a;
          color: #fff;
          font-size: 0.96rem;
          font-weight: 650;
          border-radius: 9px;
          transition: background 0.14s;
          white-space: nowrap;
        }
        .lp-btn-gold:hover { background: #b07c14; color: #fff; }

        .lp-btn-gold-lg {
          height: 52px;
          padding: 0 2rem;
          font-size: 1rem;
        }

        .lp-btn-ghost-dark {
          display: inline-flex;
          align-items: center;
          height: 48px;
          padding: 0 1.25rem;
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.85);
          font-size: 0.96rem;
          font-weight: 550;
          border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.14);
          transition: border-color 0.14s, background 0.14s;
          white-space: nowrap;
        }
        .lp-btn-ghost-dark:hover {
          border-color: rgba(255,255,255,0.28);
          background: rgba(255,255,255,0.12);
          color: #fff;
        }

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

        .lp-eyebrow-light {
          display: block;
          color: rgba(201,146,26,0.85);
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          margin-bottom: 1.1rem;
        }

        .lp-h1-dark {
          margin: 0 0 1.25rem;
          font-size: clamp(2.4rem, 4.5vw, 3.8rem);
          font-weight: 700;
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: #f5f0e8;
          font-family: 'EB Garamond', Georgia, 'Times New Roman', serif;
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
          background: #0a0f1a;
          border-bottom: 1px solid rgba(201,146,26,0.12);
        }

        .lp-hero-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 4rem;
          max-width: 1120px;
          margin: 0 auto;
          padding: 7rem 2rem 6rem;
          min-height: 620px;
        }

        .lp-hero-body-dark {
          max-width: 520px;
          color: rgba(245,240,232,0.65);
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
          background: #0f172a;
          border: 1px solid rgba(201,146,26,0.2);
          border-radius: 12px;
          box-shadow:
            0 2px 4px rgba(0,0,0,0.2),
            0 12px 40px rgba(0,0,0,0.4),
            0 0 0 1px rgba(201,146,26,0.08);
          overflow: hidden;
          width: 100%;
        }

        .ws-topbar {
          height: 40px;
          background: rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.07);
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
        .ws-dot-slate { background: rgba(255,255,255,0.12); }

        .ws-title {
          margin-left: 0.5rem;
          color: rgba(255,255,255,0.4);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .ws-body {
          display: grid;
          grid-template-columns: 160px 1fr;
          min-height: 380px;
        }

        .ws-sidebar {
          background: rgba(255,255,255,0.02);
          border-right: 1px solid rgba(255,255,255,0.06);
          padding: 1.25rem 1rem;
        }

        .ws-sidebar-label {
          font-size: 0.68rem;
          font-weight: 750;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
          display: block;
        }

        .ws-nav-item {
          display: block;
          height: 8px;
          border-radius: 4px;
          background: rgba(255,255,255,0.07);
          margin-bottom: 0.65rem;
        }

        .ws-nav-item:nth-child(2) { width: 90%; background: rgba(201,146,26,0.35); }
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
          border-bottom: 1px solid rgba(255,255,255,0.07);
          gap: 1rem;
        }

        .ws-ref-title {
          font-size: 1.1rem;
          font-weight: 750;
          color: rgba(245,240,232,0.92);
          margin: 0 0 0.25rem;
        }

        .ws-ref-sub {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.35);
          margin: 0;
        }

        .ws-badge {
          flex-shrink: 0;
          padding: 0.2rem 0.6rem;
          background: rgba(201,146,26,0.12);
          border: 1px solid rgba(201,146,26,0.25);
          color: #c9921a;
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
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px;
          padding: 0.9rem;
          background: rgba(255,255,255,0.03);
        }

        .ws-panel-title {
          font-size: 0.78rem;
          font-weight: 750;
          color: rgba(245,240,232,0.7);
          display: block;
          margin-bottom: 0.7rem;
        }

        .ws-bar {
          height: 7px;
          border-radius: 4px;
          background: rgba(255,255,255,0.08);
          margin-bottom: 0.5rem;
        }

        .ws-bar-gold { background: rgba(201,146,26,0.4); }
        .ws-bar-blue { background: rgba(99,102,241,0.3); }
        .ws-bar-w100 { width: 100%; }
        .ws-bar-w82  { width: 82%;  }
        .ws-bar-w65  { width: 65%;  }
        .ws-bar-w72  { width: 72%;  }
        .ws-bar-w88  { width: 88%;  }
        .ws-bar-w55  { width: 55%;  }

        /* ── Testimonials ────────────────────────────────── */
        .lp-testimonials {
          padding: 7rem 0 6rem;
          background: #0a0f1a;
          border-bottom: 1px solid rgba(201,146,26,0.1);
        }

        .lp-testimonials .lp-kicker { color: rgba(201,146,26,0.8); }

        .lp-testimonials .lp-h2 {
          color: #f5f0e8;
          margin-bottom: 3rem;
        }

        .lp-testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .lp-testimonial-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(201,146,26,0.14);
          border-radius: 12px;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          transition: border-color 0.15s;
        }

        .lp-testimonial-card:hover {
          border-color: rgba(201,146,26,0.3);
        }

        .lp-testimonial-quote {
          color: rgba(245,240,232,0.75);
          font-size: 0.95rem;
          line-height: 1.72;
          font-style: italic;
          flex: 1;
          margin: 0;
          font-family: 'EB Garamond', Georgia, serif;
        }

        .lp-testimonial-author {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .lp-testimonial-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(201,146,26,0.18);
          border: 1px solid rgba(201,146,26,0.3);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 750;
          color: #c9921a;
          letter-spacing: 0.02em;
          user-select: none;
        }

        .lp-testimonial-author strong {
          display: block;
          font-size: 0.88rem;
          font-weight: 700;
          color: #f5f0e8;
        }

        .lp-testimonial-author span {
          display: block;
          font-size: 0.78rem;
          color: rgba(245,240,232,0.45);
          margin-top: 0.15rem;
        }

        /* ── Demo / Video ───────────────────────────────── */
        .lp-demo {
          padding: 7rem 0 6rem;
          background: #f5f0e8;
          border-top: 1px solid rgba(201,146,26,0.1);
        }

        .lp-video-wrap {
          position: relative;
          width: 100%;
          max-width: 860px;
          margin: 0 auto;
          aspect-ratio: 16 / 9;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 48px rgba(15,23,42,0.14);
          border: 1px solid rgba(15,23,42,0.08);
        }

        .lp-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        /* ── Process section ─────────────────────────────── */
        .lp-process {
          padding: 8rem 0 7rem;
          background: #f5f0e8;
          border-top: 1px solid rgba(201,146,26,0.12);
          border-bottom: 1px solid rgba(201,146,26,0.12);
        }

        .lp-steps {
          position: relative;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          padding-top: 2rem;
          max-width: 760px;
          margin: 0 auto;
        }

        .lp-steps-line {
          position: absolute;
          top: 2.15rem;
          left: calc(16.66% + 1rem);
          right: calc(16.66% + 1rem);
          height: 1px;
          background: linear-gradient(90deg, #c9921a 0%, rgba(201,146,26,0.2) 100%);
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
          background: #f5f0e8;
          border: 1.5px solid rgba(201,146,26,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
          position: relative;
        }

        .lp-step:first-child .lp-step-dot {
          border-color: #c9921a;
          background: rgba(201,146,26,0.08);
        }

        .lp-step-n {
          font-size: 0.7rem;
          font-weight: 800;
          color: rgba(201,146,26,0.5);
          letter-spacing: 0.04em;
        }

        .lp-step:first-child .lp-step-n { color: #b98214; }

        .lp-step-label {
          font-size: 1.05rem;
          font-weight: 750;
          color: #0f172a;
          margin: 0 0 0.5rem;
          font-family: 'EB Garamond', Georgia, serif;
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
          background: #f5f0e8;
        }

        .lp-audience-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }

        .lp-audience-card {
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(201,146,26,0.14);
          border-radius: 10px;
          padding: 1.75rem 1.5rem;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .lp-audience-card:hover {
          border-color: rgba(201,146,26,0.3);
          box-shadow: 0 4px 20px rgba(201,146,26,0.08);
        }

        .lp-audience-card h3 {
          font-size: 1.05rem;
          font-weight: 750;
          color: #0f172a;
          margin: 0 0 0.65rem;
          font-family: 'EB Garamond', Georgia, serif;
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
          background: #f5f0e8;
        }

        .lp-resource-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }

        .lp-resource-card {
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(201,146,26,0.14);
          border-radius: 10px;
          padding: 1.75rem 1.5rem;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .lp-resource-card:hover {
          border-color: rgba(201,146,26,0.3);
          box-shadow: 0 4px 20px rgba(201,146,26,0.08);
        }

        .lp-resource-card h3 {
          font-size: 1rem;
          font-weight: 750;
          color: #0f172a;
          margin: 0 0 0.5rem;
          font-family: 'EB Garamond', Georgia, serif;
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
          background: #0a0f1a;
          border-top: 1px solid rgba(201,146,26,0.1);
        }

        .lp-plans-section .lp-kicker { color: rgba(201,146,26,0.8); }
        .lp-plans-h2 { color: #f5f0e8; margin-bottom: 1.25rem; }

        .lp-plans-value {
          max-width: 680px;
          margin-bottom: 2.5rem;
        }

        .lp-plans-value-text {
          color: rgba(245,240,232,0.55);
          font-size: 1rem;
          line-height: 1.72;
          margin: 0 0 0.85rem;
        }

        .lp-trial-features {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.55rem 2rem;
          margin-bottom: 3.5rem;
          max-width: 820px;
        }

        .lp-trial-feature-item {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          font-size: 0.88rem;
          color: rgba(245,240,232,0.65);
          line-height: 1.5;
        }

        .lp-trial-check {
          color: #c9921a;
          font-weight: 750;
          flex-shrink: 0;
          margin-top: 0.05rem;
        }

        .lp-plan-for-whom {
          margin: 0.35rem 0 0;
          font-size: 0.82rem;
          color: rgba(245,240,232,0.4);
          line-height: 1.55;
        }

        .lp-plan-price-note {
          margin: 0;
          text-align: center;
          font-size: 0.78rem;
          color: rgba(245,240,232,0.3);
        }

        .lp-plans-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin-bottom: 1.75rem;
          align-items: start;
        }

        .lp-plan-card {
          position: relative;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 1.75rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          transition: border-color 0.15s;
        }

        .lp-plan-card:hover {
          border-color: rgba(201,146,26,0.2);
        }

        .lp-plan-card-popular {
          border-color: rgba(201,146,26,0.3);
        }

        .lp-plan-card-premium {
          border-color: #c9921a;
          background: rgba(201,146,26,0.05);
        }

        .lp-plan-card-premium:hover {
          border-color: #c9921a;
        }

        .lp-plan-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(201,146,26,0.15);
          border: 1px solid rgba(201,146,26,0.3);
          color: #c9921a;
          font-size: 0.68rem;
          font-weight: 750;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.22rem 0.65rem;
          border-radius: 999px;
          white-space: nowrap;
        }

        .lp-plan-badge-premium {
          background: #c9921a;
          border-color: #c9921a;
          color: #fff;
        }

        .lp-plan-header h3 {
          font-size: 1.05rem;
          font-weight: 700;
          color: #f5f0e8;
          margin: 0;
          font-family: 'EB Garamond', Georgia, serif;
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
          font-size: 0.85rem;
          color: rgba(245,240,232,0.55);
          padding-left: 1.1rem;
          position: relative;
          line-height: 1.45;
        }

        .lp-plan-features li::before {
          content: '✦';
          position: absolute;
          left: 0;
          color: rgba(201,146,26,0.45);
          font-size: 0.6rem;
          top: 0.15rem;
        }

        .lp-feature-premium {
          color: rgba(245,240,232,0.85) !important;
          font-weight: 500;
        }

        .lp-feature-premium::before {
          color: #c9921a !important;
          content: '★' !important;
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
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(245,240,232,0.6);
        }

        .lp-plan-btn-ghost:hover {
          border-color: rgba(255,255,255,0.25);
          color: #f5f0e8;
        }

        .lp-plan-btn-outline-gold {
          background: transparent;
          border: 1px solid rgba(201,146,26,0.5);
          color: #c9921a;
        }

        .lp-plan-btn-outline-gold:hover {
          background: rgba(201,146,26,0.08);
          border-color: #c9921a;
          color: #c9921a;
        }

        .lp-plan-btn-gold {
          background: #c9921a;
          border: 1px solid #c9921a;
          color: #fff;
        }

        .lp-plan-btn-gold:hover {
          background: #b07c14;
          color: #fff;
        }

        .lp-plans-note {
          text-align: center;
          color: rgba(245,240,232,0.45);
          font-size: 0.84rem;
        }

        /* ── Final CTA ───────────────────────────────────── */
        .lp-cta {
          text-align: center;
          padding: 8rem 2rem 9rem;
          background: #070b12;
          border-top: 1px solid rgba(201,146,26,0.1);
        }

        .lp-cta h2 {
          margin: 1.25rem 0 0.75rem;
          font-size: clamp(1.75rem, 3vw, 2.6rem);
          font-weight: 650;
          letter-spacing: -0.015em;
          color: #f5f0e8;
          font-family: 'EB Garamond', Georgia, serif;
        }

        .lp-cta p {
          color: rgba(245,240,232,0.5);
          font-size: 1.05rem;
          line-height: 1.65;
          max-width: 500px;
          margin: 0 auto 2.5rem;
        }

        /* ── Footer ──────────────────────────────────────── */
        .lp-footer {
          max-width: 1120px;
          margin: 0 auto;
          padding: 2.25rem 2rem 3rem;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 2rem;
          align-items: start;
          background: #070b12;
        }

        .lp-footer-brand p {
          margin-top: 0.6rem;
          max-width: 320px;
          color: rgba(245,240,232,0.45);
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
          color: rgba(245,240,232,0.35);
          font-size: 0.85rem;
          font-weight: 500;
          transition: color 0.14s;
        }

        .lp-footer-nav a:hover { color: #f5f0e8; }

        /* ── Hamburger & mobile nav ─────────────────────── */
        .lp-hamburger {
          display: none;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: transparent;
          border: 1px solid rgba(201,146,26,0.3);
          border-radius: 7px;
          color: #64748b;
          cursor: pointer;
          transition: border-color 0.14s, color 0.14s;
          flex-shrink: 0;
        }

        .lp-hamburger:hover {
          border-color: rgba(201,146,26,0.6);
          color: #0f172a;
        }

        .lp-mobile-nav {
          position: fixed;
          top: 64px;
          left: 0;
          right: 0;
          z-index: 39;
          background: rgba(245,240,232,0.97);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(201,146,26,0.2);
          display: flex;
          flex-direction: column;
          padding: 1.25rem 1.5rem 1.75rem;
          gap: 0.25rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        }

        .lp-mobile-nav a {
          display: block;
          padding: 0.75rem 0;
          color: #475569;
          font-size: 1rem;
          font-weight: 500;
          border-bottom: 1px solid rgba(201,146,26,0.1);
          transition: color 0.14s;
        }

        .lp-mobile-nav a:hover { color: #0f172a; }

        .lp-mobile-nav-login {
          border-bottom: none !important;
          margin-top: 0.25rem;
        }

        .lp-mobile-nav-cta {
          margin-top: 0.75rem;
          justify-content: center;
          border-bottom: none !important;
        }

        /* ── Responsive ──────────────────────────────────── */
        @media (max-width: 1080px) {
          .lp-hero-inner {
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
            grid-template-columns: repeat(3, 1fr);
          }

          .lp-audience-grid,
          .lp-resource-grid,
          .lp-plans-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .lp-testimonials-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 680px) {
          .lp-header {
            grid-template-columns: auto auto;
            padding: 0 1.25rem;
          }

          .lp-nav { display: none; }
          .lp-link-muted { display: none; }
          .lp-btn-gold-sm { display: none; }
          .lp-hamburger { display: inline-flex; }

          .lp-hero-inner {
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
              <p className="ws-ref-title">Romanos 8.28–39</p>
              <p className="ws-ref-sub">Preparar · Interpretar · Comunicar</p>
            </div>
            <span className="ws-badge">Exegese Bíblica</span>
          </div>
          <div className="ws-panels">
            <div className="ws-panel">
              <span className="ws-panel-title">Contexto Histórico</span>
              <div className="ws-bar ws-bar-gold ws-bar-w88" />
              <div className="ws-bar ws-bar-w100" />
              <div className="ws-bar ws-bar-w65" />
            </div>
            <div className="ws-panel">
              <span className="ws-panel-title">Texto Original</span>
              <div className="ws-bar ws-bar-w82" />
              <div className="ws-bar ws-bar-gold ws-bar-w72" />
              <div className="ws-bar ws-bar-w55" />
            </div>
            <div className="ws-panel">
              <span className="ws-panel-title">Síntese Exegética</span>
              <div className="ws-bar ws-bar-gold ws-bar-w72" />
              <div className="ws-bar ws-bar-w88" />
              <div className="ws-bar ws-bar-blue ws-bar-w65" />
            </div>
            <div className="ws-panel">
              <span className="ws-panel-title">Sermão Builder</span>
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
