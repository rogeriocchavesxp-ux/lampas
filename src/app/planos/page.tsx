'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown, Menu, X, Check } from 'lucide-react'
import { LampasLogo, LampasMarkIcon } from '@/components/LampasLogo'
import { PLANS } from '@/lib/plans'

// ── Dados ─────────────────────────────────────────────────────────────────────

const PLAN_ORDER = ['free', 'iniciante', 'intermediario', 'avancado'] as const

const PLAN_PROFILES: Record<string, { profile: string; tagline: string; description: string }> = {
  free: {
    profile: 'Conhecendo o Lampas',
    tagline: 'Para quem está começando.',
    description: 'Experimente o ambiente, conheça o método e entenda como o Lampas pode transformar sua forma de estudar as Escrituras.',
  },
  iniciante: {
    profile: 'Crescendo no estudo',
    tagline: 'Para líderes e estudantes ativos.',
    description: 'Você estuda com regularidade, prepara materiais para pequenos grupos ou aulas, e precisa de um lugar organizado para guardar tudo isso.',
  },
  intermediario: {
    profile: 'Ensinando com frequência',
    tagline: 'Para pastores e professores.',
    description: 'Você prega toda semana, ensina com frequência e quer um ambiente que acompanhe a intensidade do seu ministério sem te fazer perder tempo.',
  },
  avancado: {
    profile: 'Lampas Completo',
    tagline: 'Para ministérios sérios.',
    description: 'Você quer centralizar todo o seu trabalho bíblico em um único lugar — da exegese ao texto original, do sermão à publicação.',
  },
}

type FVal = boolean | string
interface FRow { label: string; free: FVal; iniciante: FVal; intermediario: FVal; avancado: FVal }

const FEATURES: FRow[] = [
  { label: 'Projetos ativos',                    free: '1',       iniciante: '3',        intermediario: '10',       avancado: 'Ilimitado'   },
  { label: 'Consultas de IA por mês',            free: '10',      iniciante: '60',       intermediario: '200',      avancado: 'Ilimitado'   },
  { label: 'Fase Preparar completa',             free: true,      iniciante: true,       intermediario: true,       avancado: true          },
  { label: 'Estudo Contextual',                  free: true,      iniciante: true,       intermediario: true,       avancado: true          },
  { label: 'Sermão expositivo',                  free: false,     iniciante: true,       intermediario: true,       avancado: true          },
  { label: 'Estudo Bíblico e EBD',              free: false,     iniciante: true,       intermediario: true,       avancado: true          },
  { label: 'Estudo Temático',                    free: false,     iniciante: false,      intermediario: true,       avancado: true          },
  { label: 'Estudo Doutrinário',                 free: false,     iniciante: false,      intermediario: true,       avancado: true          },
  { label: 'Texto original (hebraico e grego)',  free: false,     iniciante: false,      intermediario: false,      avancado: true          },
  { label: 'Comentário expositivo',              free: false,     iniciante: false,      intermediario: false,      avancado: true          },
  { label: 'Sermão Builder + exportação PDF',    free: false,     iniciante: false,      intermediario: false,      avancado: true          },
  { label: 'Teologia Bíblica',                   free: false,     iniciante: false,      intermediario: true,       avancado: true          },
  { label: 'Teologia Sistemática',               free: false,     iniciante: false,      intermediario: true,       avancado: true          },
  { label: 'Referências Cruzadas',               free: false,     iniciante: false,      intermediario: false,      avancado: true          },
  { label: 'Dicionário Lampas',                  free: 'Básico',  iniciante: 'Completo', intermediario: 'Completo', avancado: 'Completo'    },
  { label: 'Colagens',                           free: false,     iniciante: '30',       intermediario: '100',      avancado: 'Ilimitado'   },
  { label: 'Exportação dos estudos',             free: false,     iniciante: true,       intermediario: true,       avancado: true          },
  { label: 'Síntese automática por seção',       free: false,     iniciante: false,      intermediario: true,       avancado: true          },
  { label: 'Acesso antecipado a novos recursos', free: false,     iniciante: false,      intermediario: false,      avancado: true          },
  { label: 'Suporte prioritário',                free: false,     iniciante: false,      intermediario: false,      avancado: true          },
]

const FAQS = [
  {
    q: 'O que acontece depois dos 7 dias gratuitos?',
    a: 'Sua conta retorna automaticamente ao plano gratuito. Todos os seus projetos e estudos ficam integralmente preservados — nenhum dado é perdido. Você escolhe se e quando deseja assinar, no seu tempo, sem pressão.',
  },
  {
    q: 'Preciso de cartão de crédito para experimentar?',
    a: 'Não. O teste gratuito de 7 dias não exige cartão de crédito nem nenhuma forma de pagamento. Você cria sua conta, inicia seu primeiro projeto e começa a usar imediatamente.',
  },
  {
    q: 'Posso cancelar a qualquer momento?',
    a: 'Sim. Não existe fidelidade nem multa por cancelamento. Se decidir cancelar, basta acessar as configurações da conta. Seus estudos permanecem salvos independentemente do plano.',
  },
  {
    q: 'O Lampas funciona para diferentes denominações?',
    a: 'Sim. O Lampas foi construído sobre princípios hermenêuticos sólidos e aplica-se a pastores, professores e estudantes de diferentes tradições. A plataforma respeita sua teologia e sua forma de estudar a Palavra.',
  },
  {
    q: 'A IA entende de teologia bíblica reformada?',
    a: 'Sim. A IA do Lampas foi desenvolvida com foco em exegese bíblica, hermenêutica histórico-gramatical e tradição teológica reformada. Ela conhece os autores, os métodos e os conceitos que você já utiliza.',
  },
  {
    q: 'Os planos anuais têm desconto?',
    a: 'Sim. Assinando anualmente, você tem 20% de desconto em relação ao valor mensal. O desconto é aplicado automaticamente ao escolher o ciclo anual na tela de assinatura.',
  },
]

function CellVal({ v, isPremium }: { v: FVal; isPremium?: boolean }) {
  if (v === true)  return <Check size={14} strokeWidth={2.5} style={{ color: isPremium ? '#c9921a' : '#64748b', display: 'block', margin: '0 auto' }} />
  if (v === false) return <span style={{ color: '#cbd5e1', display: 'block', textAlign: 'center', fontSize: '1rem', lineHeight: 1 }}>—</span>
  return <span style={{ fontSize: '0.78rem', color: isPremium ? '#c9921a' : '#475569', display: 'block', textAlign: 'center', fontWeight: 550 }}>{v}</span>
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function PlanosPage() {
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [tableOpen, setTableOpen] = useState(false)
  const [openFaq,   setOpenFaq]   = useState<number | null>(null)

  return (
    <main className="pl-shell">

      {/* ── Header ── */}
      <header className="pl-header">
        <Link href="/" className="pl-brand" aria-label="Lampas">
          <LampasLogo height={44} />
        </Link>
        <nav className="pl-nav" aria-label="Navegação">
          <Link href="/#processo">Método</Link>
          <Link href="/#recursos">Recursos</Link>
          <Link href="/planos" aria-current="page">Planos</Link>
        </nav>
        <div className="pl-header-actions">
          <Link href="/auth/login" className="pl-link-muted">Entrar</Link>
          <Link href="/auth/login" className="pl-btn-gold-sm">Experimentar grátis</Link>
          <button
            className="pl-hamburger"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="pl-mobile-nav" role="dialog">
          <Link href="/#processo"  onClick={() => setMenuOpen(false)}>Método</Link>
          <Link href="/#recursos"  onClick={() => setMenuOpen(false)}>Recursos</Link>
          <Link href="/planos"     onClick={() => setMenuOpen(false)}>Planos</Link>
          <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="pl-mobile-login">Entrar</Link>
          <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="pl-btn-gold pl-mobile-cta">Experimentar grátis</Link>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          SEÇÃO 1 — HERO
      ══════════════════════════════════════════════════════ */}
      <section className="pl-hero">
        <div className="pl-inner pl-hero-inner">
          <p className="pl-eyebrow">Para pastores, pregadores e seminaristas</p>
          <h1 className="pl-h1">
            Você estuda para domingo.<br />
            O Lampas cuida disso<br />
            por toda a vida.
          </h1>
          <p className="pl-hero-sub">
            O Lampas é o lugar onde seu conhecimento bíblico cresce, se organiza e permanece —
            da primeira leitura do texto até a publicação, durante toda a sua caminhada ministerial.
          </p>
          <div className="pl-hero-cta">
            <Link href="/auth/login" className="pl-btn-gold pl-btn-lg">
              Experimentar gratuitamente por 7 dias <ArrowRight size={16} />
            </Link>
            <ul className="pl-hero-guarantees">
              <li>Sem cartão de crédito</li>
              <li>Sem cobrança automática</li>
              <li>Acesso completo ao Premium</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SEÇÃO 2 — O PROBLEMA
      ══════════════════════════════════════════════════════ */}
      <section className="pl-section pl-light" id="problema">
        <div className="pl-inner">
          <p className="pl-kicker">O problema</p>
          <h2 className="pl-h2">O que acontece com anos de estudo?</h2>
          <p className="pl-section-sub">
            A maioria dos ministros que conheço dedica horas profundas ao estudo da Palavra.
            Mas ao cabo de alguns anos, onde está tudo isso?
          </p>
          <div className="pl-problem-grid">
            {[
              { n: '01', pain: 'Sermões espalhados em Word, Google Docs, Pages e PDFs sem ordem nenhuma.' },
              { n: '02', pain: 'Pesquisas excelentes feitas uma vez e nunca mais encontradas.' },
              { n: '03', pain: 'Anotações em cadernos físicos que ficam no fundo da gaveta.' },
              { n: '04', pain: 'Horas procurando algo que você sabe que estudou — mas onde está?' },
              { n: '05', pain: 'Estudos profundos que nunca são reaproveitados porque não há organização.' },
              { n: '06', pain: 'Cada novo sermão começa do zero, mesmo que você já tenha trabalhado na passagem.' },
            ].map(({ n, pain }) => (
              <div key={n} className="pl-problem-card">
                <span className="pl-problem-n">{n}</span>
                <p className="pl-problem-text">{pain}</p>
              </div>
            ))}
          </div>
          <p className="pl-problem-close">
            Não é falta de disciplina. É falta de um ambiente feito para isso.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SEÇÃO 3 — A SOLUÇÃO
      ══════════════════════════════════════════════════════ */}
      <section className="pl-section pl-dark" id="solucao">
        <div className="pl-inner">
          <p className="pl-kicker pl-kicker-light">A solução</p>
          <h2 className="pl-h2 pl-h2-light">Um método. Um ambiente. Uma vida toda de estudo.</h2>
          <p className="pl-section-sub pl-sub-light">
            O Lampas conduz você por todo o processo — do primeiro contato com o texto até a preservação
            permanente de tudo o que foi aprendido.
          </p>
          <div className="pl-flow">
            {[
              { n: '01', label: 'Texto Bíblico',  desc: 'Leitura atenta, primeiras impressões e perguntas iniciais antes da análise.' },
              { n: '02', label: 'Investigação',   desc: 'Contexto histórico, texto original em hebraico e grego, gramática e análise exegética.' },
              { n: '03', label: 'Organização',    desc: 'Síntese teológica, estrutura do argumento e grande ideia do texto — tudo reunido.' },
              { n: '04', label: 'Produção',       desc: 'Sermão, aula, devocional, artigo ou livro — construídos a partir da mesma base exegética.' },
              { n: '05', label: 'Publicação',     desc: 'Compartilhe o resultado com sua comunidade quando estiver pronto.' },
              { n: '06', label: 'Biblioteca',     desc: 'Cada estudo fica preservado, pesquisável e disponível para o resto da sua vida ministerial.' },
            ].map(({ n, label, desc }, i, arr) => (
              <div key={n} className="pl-flow-item">
                <div className="pl-flow-step">
                  <div className="pl-flow-dot">
                    <span className="pl-flow-n">{n}</span>
                  </div>
                  {i < arr.length - 1 && <div className="pl-flow-line" aria-hidden="true" />}
                </div>
                <div className="pl-flow-content">
                  <h3 className="pl-flow-label">{label}</h3>
                  <p className="pl-flow-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SEÇÃO 4 — O DIFERENCIAL
      ══════════════════════════════════════════════════════ */}
      <section className="pl-section pl-light" id="diferencial">
        <div className="pl-inner">
          <p className="pl-kicker">O diferencial</p>
          <h2 className="pl-h2">Um estudo. Dezenas de frutos.</h2>
          <p className="pl-section-sub">
            No Lampas, um único estudo exegético pode gerar múltiplos conteúdos — todos compartilhando
            a mesma base bíblica rigorosa. Você não duplica trabalho. Você multiplica frutos.
          </p>
          <div className="pl-diff-layout">
            <div className="pl-diff-root">
              <div className="pl-diff-root-box">
                <span className="pl-diff-root-label">Base Exegética</span>
                <span className="pl-diff-root-sub">Romanos 8.1–11</span>
              </div>
            </div>
            <div className="pl-diff-arrow" aria-hidden="true" />
            <div className="pl-diff-outputs">
              {['Sermão expositivo', 'Aula de EBD', 'Devocional', 'Artigo teológico', 'Série de mensagens', 'Curso bíblico', 'Capítulo de livro', 'Material de discipulado'].map(out => (
                <div key={out} className="pl-diff-output">
                  {out}
                </div>
              ))}
            </div>
          </div>
          <p className="pl-diff-note">
            A exegese é feita uma vez. Os frutos duram anos.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SEÇÃO 5 — O PATRIMÔNIO
      ══════════════════════════════════════════════════════ */}
      <section className="pl-section pl-patrimonio">
        <div className="pl-inner">
          <p className="pl-kicker pl-kicker-light">O patrimônio ministerial</p>
          <h2 className="pl-h2 pl-h2-light">Você não está preparando apenas<br />o próximo sermão.</h2>
          <div className="pl-patrimonio-body">
            <p>
              Está construindo um patrimônio de conhecimento bíblico que crescerá durante toda a sua vida.
            </p>
            <p>
              Cada sermão que você prepara, cada estudo que você aprofunda, cada anotação que você registra —
              tudo isso é parte de um conhecimento que pertence ao seu ministério.
            </p>
            <p>
              Com o Lampas, nenhum estudo fica perdido. Nenhuma pesquisa fica esquecida.
              Nenhuma descoberta fica limitada a um único domingo ou a uma única turma.
            </p>
            <p>
              O que você aprende hoje serve ao seu ministério por décadas.
            </p>
          </div>
          <div className="pl-patrimonio-stats">
            {[
              { num: '5 anos',  label: 'de sermões preservados e pesquisáveis' },
              { num: '1 lugar', label: 'para toda a sua pesquisa bíblica' },
              { num: 'Sempre',  label: 'disponível, organizado e reutilizável' },
            ].map(({ num, label }) => (
              <div key={num} className="pl-stat">
                <span className="pl-stat-num">{num}</span>
                <span className="pl-stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SEÇÃO 6 — ANTES E DEPOIS
      ══════════════════════════════════════════════════════ */}
      <section className="pl-section pl-light" id="antes-depois">
        <div className="pl-inner">
          <p className="pl-kicker">A diferença</p>
          <h2 className="pl-h2">Antes e depois do Lampas</h2>
          <div className="pl-compare">
            <div className="pl-compare-col pl-compare-before">
              <h3 className="pl-compare-title">Antes</h3>
              <ul className="pl-compare-list">
                {['Sermões em Word, Google Docs e Pages', 'Notas em cadernos físicos esquecidos', 'Pesquisas em PDFs nunca encontrados', 'Anotações em aplicativos diferentes', 'Horas procurando algo que você estudou', 'Cada sermão começa do zero'].map(item => (
                  <li key={item} className="pl-compare-item pl-compare-bad">
                    <X size={14} strokeWidth={2} className="pl-x-icon" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pl-compare-divider" aria-hidden="true" />
            <div className="pl-compare-col pl-compare-after">
              <h3 className="pl-compare-title pl-compare-title-gold">Depois</h3>
              <ul className="pl-compare-list">
                {['Tudo em um único ambiente organizado', 'Busca instantânea em todos os estudos', 'Base exegética pesquisável e reutilizável', 'Cada estudo conectado ao anterior', 'Anos de conhecimento sempre à mão', 'Um estudo, múltiplos frutos'].map(item => (
                  <li key={item} className="pl-compare-item pl-compare-good">
                    <Check size={14} strokeWidth={2.5} className="pl-check-icon" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SEÇÃO 7 — ECOSSISTEMA
      ══════════════════════════════════════════════════════ */}
      <section className="pl-section pl-dark" id="ecossistema">
        <div className="pl-inner">
          <p className="pl-kicker pl-kicker-light">O ecossistema</p>
          <h2 className="pl-h2 pl-h2-light">Muito mais do que um preparador de sermões.</h2>
          <p className="pl-section-sub pl-sub-light">
            O Lampas é um ecossistema completo para quem leva o estudo das Escrituras a sério.
          </p>
          <div className="pl-eco-grid">
            {[
              {
                label: 'Estudar',
                items: ['Exegese Bíblica', 'Estudo Temático', 'Estudo Doutrinário', 'Estudo Bíblico', 'Devocional'],
              },
              {
                label: 'Produzir',
                items: ['Sermão Builder', 'Aulas e Cursos', 'Artigos e Livros', 'Séries de Mensagens', 'Material de Discipulado'],
              },
              {
                label: 'Pesquisar',
                items: ['Dicionário Lampas', 'Teologia Bíblica', 'Teologia Sistemática', 'Refs Cruzadas', 'Comentário Expositivo'],
              },
              {
                label: 'Preservar',
                items: ['Biblioteca Pessoal', 'Base de Conhecimento', 'Projetos Publicados', 'Histórico de Estudos'],
              },
            ].map(({ label, items }) => (
              <div key={label} className="pl-eco-group">
                <h3 className="pl-eco-group-label">{label}</h3>
                <ul className="pl-eco-items">
                  {items.map(item => (
                    <li key={item} className="pl-eco-item">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="pl-eco-note">Tudo conectado. Tudo pesquisável. Tudo seu.</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SEÇÃO 8 — PLANOS (por perfil)
      ══════════════════════════════════════════════════════ */}
      <section className="pl-section pl-plans-section" id="planos">
        <div className="pl-inner">
          <p className="pl-kicker pl-kicker-light">Planos</p>
          <h2 className="pl-h2 pl-h2-light">Encontre o seu lugar no Lampas.</h2>
          <p className="pl-section-sub pl-sub-light">
            Não importa onde você está na sua jornada — há um plano feito para você.
          </p>
          <div className="pl-plans-grid">
            {PLAN_ORDER.map((planId, i) => {
              const plan        = PLANS[planId]
              const prof        = PLAN_PROFILES[planId]
              const isPremium   = planId === 'avancado'
              const isPopular   = planId === 'intermediario'
              const isFree      = planId === 'free'

              return (
                <article
                  key={planId}
                  className={`pl-plan-card${isPremium ? ' pl-plan-premium' : isPopular ? ' pl-plan-popular' : ''}`}
                >
                  {isPopular && <div className="pl-plan-badge">Mais escolhido</div>}
                  {isPremium && <div className="pl-plan-badge pl-plan-badge-gold">Premium</div>}

                  <div className="pl-plan-body">
                    <div>
                      <p className="pl-plan-number">0{i + 1}</p>
                      <h3 className="pl-plan-name">{prof.profile}</h3>
                      <p className="pl-plan-tagline">{prof.tagline}</p>
                      <p className="pl-plan-description">{prof.description}</p>
                    </div>

                    <div className="pl-plan-price-row">
                      {isFree ? (
                        <span className="pl-plan-price-free">Sempre gratuito</span>
                      ) : (
                        <span className="pl-plan-price-note">
                          A partir de <strong>R$ {(plan.priceMonthly / 100).toFixed(0)}/mês</strong>
                        </span>
                      )}
                    </div>

                    <Link
                      href="/auth/login"
                      className={`pl-plan-btn${isPremium ? ' pl-plan-btn-gold' : isPopular ? ' pl-plan-btn-outline-gold' : ' pl-plan-btn-ghost'}`}
                    >
                      {isFree ? 'Começar gratuitamente' : 'Experimentar 7 dias grátis'}
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
          <p className="pl-plans-note">
            Planos anuais com 20% de desconto · Cancele a qualquer momento · Os 7 dias começam no seu primeiro projeto
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SEÇÃO 9 — COMPARATIVO TÉCNICO (recolhido)
      ══════════════════════════════════════════════════════ */}
      <section className="pl-section pl-light pl-table-section">
        <div className="pl-inner">
          <button
            className="pl-table-toggle"
            onClick={() => setTableOpen(o => !o)}
            aria-expanded={tableOpen}
          >
            <span>{tableOpen ? 'Fechar comparativo de recursos' : 'Ver comparativo detalhado de recursos'}</span>
            <ChevronDown size={18} className={`pl-chevron${tableOpen ? ' pl-chevron-open' : ''}`} />
          </button>

          {tableOpen && (
            <div className="pl-table-wrap">
              <table className="pl-table">
                <thead>
                  <tr>
                    <th className="pl-th pl-th-feature">Recurso</th>
                    {PLAN_ORDER.map(planId => (
                      <th key={planId} className={`pl-th pl-th-plan${planId === 'avancado' ? ' pl-th-premium' : ''}`}>
                        {PLAN_PROFILES[planId].profile}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURES.map((row, i) => (
                    <tr key={row.label} className={i % 2 === 0 ? 'pl-tr-even' : ''}>
                      <td className="pl-td pl-td-feature">{row.label}</td>
                      <td className="pl-td"><CellVal v={row.free} /></td>
                      <td className="pl-td"><CellVal v={row.iniciante} /></td>
                      <td className="pl-td"><CellVal v={row.intermediario} /></td>
                      <td className="pl-td pl-td-premium"><CellVal v={row.avancado} isPremium /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SEÇÃO 10 — SEM RISCO
      ══════════════════════════════════════════════════════ */}
      <section className="pl-section pl-norisk" id="teste">
        <div className="pl-inner pl-norisk-inner">
          <div className="pl-norisk-text">
            <p className="pl-kicker">Experimente sem compromisso</p>
            <h2 className="pl-h2">7 dias. Acesso completo. Sem cartão.</h2>
            <p className="pl-norisk-sub">
              Acreditamos tanto no Lampas que permitimos que você o experimente completamente
              antes de tomar qualquer decisão.
            </p>
            <ul className="pl-norisk-list">
              {[
                'Acesso integral ao plano Premium durante 7 dias',
                'Os 7 dias começam apenas quando você criar seu primeiro projeto',
                'Nenhum cartão de crédito solicitado',
                'Nenhuma cobrança automática ao final do período',
                'Todos os seus projetos ficam salvos se você não assinar',
                'Sem pressão, sem surpresas, sem pegadinhas',
              ].map(item => (
                <li key={item} className="pl-norisk-item">
                  <Check size={15} strokeWidth={2.5} className="pl-norisk-check" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="pl-norisk-cta">
            <Link href="/auth/login" className="pl-btn-gold pl-btn-lg">
              Criar minha conta gratuitamente
              <ArrowRight size={16} />
            </Link>
            <p className="pl-norisk-cta-note">Sem cartão de crédito · Sem cobrança automática</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SEÇÃO 11 — FAQ
      ══════════════════════════════════════════════════════ */}
      <section className="pl-section pl-light" id="faq">
        <div className="pl-inner pl-faq-inner">
          <p className="pl-kicker">Perguntas frequentes</p>
          <h2 className="pl-h2 pl-faq-h2">Dúvidas comuns</h2>
          <div className="pl-faq-list">
            {FAQS.map(({ q, a }, i) => (
              <div key={i} className="pl-faq-item">
                <button
                  className="pl-faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{q}</span>
                  <ChevronDown size={16} className={`pl-chevron${openFaq === i ? ' pl-chevron-open' : ''}`} />
                </button>
                {openFaq === i && (
                  <p className="pl-faq-a">{a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SEÇÃO FINAL — INSPIRAÇÃO
      ══════════════════════════════════════════════════════ */}
      <section className="pl-final">
        <div className="pl-inner pl-final-inner">
          <LampasMarkIcon size={40} />
          <h2 className="pl-final-h2">
            O Lampas não foi criado para preparar o próximo sermão.
          </h2>
          <p className="pl-final-body">
            Foi criado para acompanhar toda a sua caminhada nas Escrituras.
          </p>
          <p className="pl-final-body">
            Para que cada estudo realizado hoje produza frutos ao longo de muitos anos.
            Para que o conhecimento acumulado durante uma vida de ministério nunca se perca.
          </p>
          <p className="pl-final-body pl-final-emphasis">
            Mais do que organizar arquivos, o Lampas ajuda você a construir um legado de conhecimento bíblico.
          </p>
          <Link href="/auth/login" className="pl-btn-gold pl-btn-xl">
            Começar gratuitamente
          </Link>
          <p className="pl-final-note">
            Simplicidade. Praticidade. Fidelidade.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="pl-footer">
        <div className="pl-footer-inner pl-inner">
          <div className="pl-footer-brand">
            <LampasLogo height={34} variant="light" />
            <p>Estudo bíblico com profundidade, método e clareza.</p>
          </div>
          <nav className="pl-footer-nav" aria-label="Rodapé">
            <Link href="/#recursos">Recursos</Link>
            <Link href="/#processo">Método</Link>
            <Link href="/planos">Planos</Link>
            <Link href="mailto:contato@lampas.com.br">Contato</Link>
          </nav>
        </div>
      </footer>

      {/* ── CSS ── */}
      <style>{`

        /* ── Reset & shell ─────────────────────────── */
        .pl-shell {
          min-height: 100vh;
          background: #f5f0e8;
          color: #0f172a;
          font-family: inherit;
        }
        .pl-shell a { text-decoration: none; }
        .pl-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        /* ── Header ────────────────────────────────── */
        .pl-header {
          position: sticky; top: 0; z-index: 40;
          height: 64px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 2rem;
          padding: 0 2.5rem;
          background: rgba(245,240,232,0.92);
          border-bottom: 1px solid rgba(201,146,26,0.15);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .pl-brand { display: inline-flex; align-items: center; color: inherit; }
        .pl-nav {
          display: flex; justify-content: center; align-items: center; gap: 1.75rem;
        }
        .pl-nav a {
          color: #64748b; font-size: 0.88rem; font-weight: 500; transition: color 0.14s;
        }
        .pl-nav a:hover { color: #0f172a; }
        .pl-nav a[aria-current="page"] { color: #c9921a; font-weight: 650; }
        .pl-header-actions { display: flex; align-items: center; gap: 0.75rem; }
        .pl-link-muted {
          color: #64748b; font-size: 0.88rem; font-weight: 500; transition: color 0.14s;
        }
        .pl-link-muted:hover { color: #0f172a; }
        .pl-hamburger {
          display: none; align-items: center; justify-content: center;
          width: 36px; height: 36px;
          background: transparent; border: none; cursor: pointer; color: #64748b;
          border-radius: 6px;
        }
        .pl-hamburger:hover { background: rgba(0,0,0,0.05); }
        .pl-mobile-nav {
          position: fixed; inset: 64px 0 0 0; z-index: 39;
          background: #f5f0e8; border-top: 1px solid rgba(201,146,26,0.12);
          padding: 1.5rem 2rem;
          display: flex; flex-direction: column; gap: 0.75rem;
        }
        .pl-mobile-nav a {
          color: #0f172a; font-size: 1rem; font-weight: 500;
          padding: 0.5rem 0; border-bottom: 1px solid rgba(201,146,26,0.08);
        }
        .pl-mobile-login { color: #64748b !important; }
        .pl-mobile-cta { margin-top: 0.5rem; text-align: center; border-bottom: none !important; }

        /* ── Buttons ───────────────────────────────── */
        .pl-btn-gold-sm {
          display: inline-flex; align-items: center;
          height: 36px; padding: 0 1rem;
          background: #c9921a; color: #fff;
          font-size: 0.84rem; font-weight: 650; border-radius: 7px;
          transition: background 0.14s; white-space: nowrap;
        }
        .pl-btn-gold-sm:hover { background: #b07c14; color: #fff; }
        .pl-btn-gold {
          display: inline-flex; align-items: center; gap: 0.45rem;
          height: 48px; padding: 0 1.5rem;
          background: #c9921a; color: #fff;
          font-size: 0.96rem; font-weight: 650; border-radius: 9px;
          transition: background 0.14s; white-space: nowrap;
        }
        .pl-btn-gold:hover { background: #b07c14; color: #fff; }
        .pl-btn-lg { height: 54px; padding: 0 2rem; font-size: 1rem; }
        .pl-btn-xl { height: 58px; padding: 0 2.5rem; font-size: 1.05rem; border-radius: 10px; }

        /* ── Typography ────────────────────────────── */
        .pl-eyebrow {
          display: block;
          color: rgba(201,146,26,0.85); font-size: 0.72rem; font-weight: 800;
          letter-spacing: 0.09em; text-transform: uppercase; margin-bottom: 1rem;
        }
        .pl-kicker {
          display: block;
          color: #b98214; font-size: 0.72rem; font-weight: 800;
          letter-spacing: 0.09em; text-transform: uppercase; margin-bottom: 1rem;
        }
        .pl-kicker-light { color: rgba(201,146,26,0.75); }

        .pl-h1 {
          margin: 0 0 1.5rem;
          font-size: clamp(2.4rem, 4.5vw, 3.8rem);
          font-weight: 700; line-height: 1.06; letter-spacing: -0.02em;
          color: #f5f0e8;
          font-family: 'EB Garamond', Georgia, 'Times New Roman', serif;
        }
        .pl-h2 {
          margin: 0 0 1.5rem;
          font-size: clamp(1.75rem, 2.8vw, 2.5rem);
          font-weight: 650; line-height: 1.1; letter-spacing: -0.015em;
          color: #0f172a;
          font-family: 'EB Garamond', Georgia, serif;
        }
        .pl-h2-light { color: #f5f0e8; }
        .pl-section-sub {
          font-size: 1.05rem; color: #475569; line-height: 1.72;
          max-width: 620px; margin: 0 0 3.5rem;
        }
        .pl-sub-light { color: rgba(245,240,232,0.55); }

        /* ── Sections ──────────────────────────────── */
        .pl-section { padding: 7rem 0; }
        .pl-light   { background: #f5f0e8; }
        .pl-dark    { background: #0a0f1a; border-top: 1px solid rgba(201,146,26,0.1); border-bottom: 1px solid rgba(201,146,26,0.1); }

        /* ── Hero ──────────────────────────────────── */
        .pl-hero {
          background: #0a0f1a;
          border-bottom: 1px solid rgba(201,146,26,0.12);
          padding: 8rem 0 7rem;
        }
        .pl-hero-inner { max-width: 760px; }
        .pl-hero-sub {
          font-size: 1.1rem; color: rgba(245,240,232,0.6); line-height: 1.75;
          margin: 0 0 2.75rem; max-width: 620px;
        }
        .pl-hero-cta { display: flex; flex-direction: column; gap: 1.25rem; align-items: flex-start; }
        .pl-hero-guarantees {
          list-style: none; padding: 0; margin: 0;
          display: flex; flex-wrap: wrap; gap: 0.35rem 1.5rem;
        }
        .pl-hero-guarantees li {
          font-size: 0.82rem; color: rgba(245,240,232,0.35); font-weight: 500;
          display: flex; align-items: center; gap: 0.4rem;
        }
        .pl-hero-guarantees li::before {
          content: '·'; color: rgba(201,146,26,0.4);
        }

        /* ── Problem ───────────────────────────────── */
        .pl-problem-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
          margin-bottom: 3rem;
        }
        .pl-problem-card {
          background: rgba(255,255,255,0.6);
          border: 1px solid rgba(201,146,26,0.1);
          border-radius: 10px;
          padding: 1.75rem 1.5rem;
          transition: border-color 0.14s, box-shadow 0.14s;
        }
        .pl-problem-card:hover {
          border-color: rgba(201,146,26,0.22);
          box-shadow: 0 4px 18px rgba(15,23,42,0.06);
        }
        .pl-problem-n {
          display: block;
          font-size: 0.68rem; font-weight: 800; color: rgba(201,146,26,0.5);
          letter-spacing: 0.06em; margin-bottom: 0.75rem;
        }
        .pl-problem-text {
          margin: 0; font-size: 0.92rem; color: #475569; line-height: 1.6;
        }
        .pl-problem-close {
          text-align: center; font-size: 1.05rem; color: #64748b;
          font-style: italic; margin: 0;
          font-family: 'EB Garamond', Georgia, serif;
        }

        /* ── Flow ──────────────────────────────────── */
        .pl-flow {
          display: flex; flex-direction: column; gap: 0;
          max-width: 680px;
        }
        .pl-flow-item {
          display: grid;
          grid-template-columns: 52px 1fr;
          gap: 0 1.5rem;
          position: relative;
        }
        .pl-flow-step {
          display: flex; flex-direction: column; align-items: center;
        }
        .pl-flow-dot {
          width: 44px; height: 44px; border-radius: 50%;
          background: rgba(201,146,26,0.1);
          border: 1.5px solid rgba(201,146,26,0.35);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          position: relative; z-index: 1;
        }
        .pl-flow-n {
          font-size: 0.68rem; font-weight: 800; color: rgba(201,146,26,0.7);
          letter-spacing: 0.04em;
        }
        .pl-flow-line {
          flex: 1; width: 1.5px; background: rgba(201,146,26,0.2);
          margin: 0 auto;
          min-height: 2.5rem;
        }
        .pl-flow-content { padding: 0.5rem 0 2.5rem; }
        .pl-flow-label {
          font-size: 1.1rem; font-weight: 700;
          color: #f5f0e8; margin: 0 0 0.4rem;
          font-family: 'EB Garamond', Georgia, serif;
        }
        .pl-flow-desc {
          font-size: 0.9rem; color: rgba(245,240,232,0.5); line-height: 1.65; margin: 0;
        }

        /* ── Differential ──────────────────────────── */
        .pl-diff-layout {
          display: flex; flex-direction: column; align-items: center; gap: 2rem;
          margin-bottom: 2rem;
        }
        .pl-diff-root-box {
          background: rgba(255,255,255,0.8);
          border: 1.5px solid rgba(201,146,26,0.3);
          border-radius: 10px;
          padding: 1.25rem 2.5rem;
          text-align: center;
          box-shadow: 0 4px 20px rgba(201,146,26,0.08);
        }
        .pl-diff-root-label {
          display: block; font-size: 0.85rem; font-weight: 700; color: #0f172a;
          font-family: 'EB Garamond', Georgia, serif;
        }
        .pl-diff-root-sub {
          display: block; font-size: 0.78rem; color: #94a3b8; margin-top: 0.25rem;
        }
        .pl-diff-arrow {
          width: 1.5px; height: 36px; background: rgba(201,146,26,0.3);
          position: relative;
        }
        .pl-diff-arrow::after {
          content: ''; position: absolute; bottom: -6px; left: 50%;
          transform: translateX(-50%);
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 7px solid rgba(201,146,26,0.4);
        }
        .pl-diff-outputs {
          display: flex; flex-wrap: wrap; justify-content: center; gap: 0.6rem;
          max-width: 680px;
        }
        .pl-diff-output {
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(201,146,26,0.15);
          border-radius: 999px;
          padding: 0.4rem 1.1rem;
          font-size: 0.83rem; color: #475569; font-weight: 500;
          transition: border-color 0.14s;
        }
        .pl-diff-output:hover { border-color: rgba(201,146,26,0.35); color: #0f172a; }
        .pl-diff-note {
          text-align: center; font-size: 1rem; color: #94a3b8;
          font-style: italic; margin: 0;
          font-family: 'EB Garamond', Georgia, serif;
        }

        /* ── Patrimônio ────────────────────────────── */
        .pl-patrimonio {
          padding: 7rem 0;
          background: linear-gradient(135deg, #0a0f1a 0%, #0f172a 100%);
          border-top: 1px solid rgba(201,146,26,0.1);
          border-bottom: 1px solid rgba(201,146,26,0.1);
        }
        .pl-patrimonio-body {
          max-width: 640px;
          margin-bottom: 4rem;
        }
        .pl-patrimonio-body p {
          font-size: 1.08rem; color: rgba(245,240,232,0.6);
          line-height: 1.8; margin: 0 0 1.25rem;
          font-family: 'EB Garamond', Georgia, serif;
        }
        .pl-patrimonio-body p:last-child { margin-bottom: 0; }
        .pl-patrimonio-stats {
          display: flex; gap: 3rem; flex-wrap: wrap;
          padding-top: 3rem;
          border-top: 1px solid rgba(201,146,26,0.12);
        }
        .pl-stat {}
        .pl-stat-num {
          display: block;
          font-size: 2rem; font-weight: 700; color: #c9921a;
          font-family: 'EB Garamond', Georgia, serif;
          margin-bottom: 0.35rem;
        }
        .pl-stat-label {
          display: block;
          font-size: 0.88rem; color: rgba(245,240,232,0.4); line-height: 1.5;
        }

        /* ── Before / After ────────────────────────── */
        .pl-compare {
          display: grid;
          grid-template-columns: 1fr 1px 1fr;
          gap: 0 3rem;
        }
        .pl-compare-divider { background: rgba(201,146,26,0.15); }
        .pl-compare-title {
          font-size: 0.95rem; font-weight: 750; color: #94a3b8;
          margin: 0 0 1.5rem;
          font-family: 'EB Garamond', Georgia, serif;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          font-size: 0.75rem;
        }
        .pl-compare-title-gold { color: #c9921a; }
        .pl-compare-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.9rem; }
        .pl-compare-item {
          display: flex; align-items: flex-start; gap: 0.7rem;
          font-size: 0.92rem; line-height: 1.55;
        }
        .pl-compare-bad  { color: #94a3b8; }
        .pl-compare-good { color: #0f172a; font-weight: 500; }
        .pl-x-icon     { color: #cbd5e1; flex-shrink: 0; margin-top: 0.15rem; }
        .pl-check-icon { color: #c9921a; flex-shrink: 0; margin-top: 0.15rem; }

        /* ── Ecosystem ─────────────────────────────── */
        .pl-eco-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          margin-bottom: 3rem;
        }
        .pl-eco-group {}
        .pl-eco-group-label {
          font-size: 0.72rem; font-weight: 800;
          letter-spacing: 0.07em; text-transform: uppercase;
          color: rgba(201,146,26,0.7);
          margin: 0 0 1rem;
        }
        .pl-eco-items { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.55rem; }
        .pl-eco-item {
          font-size: 0.88rem; color: rgba(245,240,232,0.55);
          padding: 0.45rem 0.75rem;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 6px;
          background: rgba(255,255,255,0.02);
          transition: background 0.12s, border-color 0.12s, color 0.12s;
        }
        .pl-eco-item:hover {
          background: rgba(201,146,26,0.06);
          border-color: rgba(201,146,26,0.2);
          color: rgba(245,240,232,0.85);
        }
        .pl-eco-note {
          text-align: center;
          font-size: 0.95rem; color: rgba(245,240,232,0.3);
          font-style: italic; margin: 0;
          font-family: 'EB Garamond', Georgia, serif;
        }

        /* ── Plans section ─────────────────────────── */
        .pl-plans-section {
          background: #0c1220;
          border-top: 1px solid rgba(201,146,26,0.1);
        }
        .pl-plans-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin-bottom: 1.75rem;
          align-items: stretch;
        }
        .pl-plan-card {
          position: relative;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 2rem 1.75rem;
          display: flex; flex-direction: column;
          transition: border-color 0.15s;
        }
        .pl-plan-card:hover { border-color: rgba(201,146,26,0.2); }
        .pl-plan-popular { border-color: rgba(201,146,26,0.25); }
        .pl-plan-premium { border-color: #c9921a; background: rgba(201,146,26,0.04); }
        .pl-plan-premium:hover { border-color: #c9921a; }
        .pl-plan-badge {
          position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
          background: rgba(201,146,26,0.14);
          border: 1px solid rgba(201,146,26,0.28);
          color: #c9921a;
          font-size: 0.66rem; font-weight: 800; letter-spacing: 0.07em;
          text-transform: uppercase;
          padding: 0.22rem 0.7rem; border-radius: 999px; white-space: nowrap;
        }
        .pl-plan-badge-gold { background: #c9921a; border-color: #c9921a; color: #fff; }
        .pl-plan-body { display: flex; flex-direction: column; gap: 1.5rem; flex: 1; }
        .pl-plan-number {
          font-size: 0.65rem; font-weight: 800; color: rgba(201,146,26,0.35);
          letter-spacing: 0.07em; margin: 0 0 0.6rem;
        }
        .pl-plan-name {
          font-size: 1.2rem; font-weight: 700; color: #f5f0e8;
          margin: 0 0 0.35rem;
          font-family: 'EB Garamond', Georgia, serif;
        }
        .pl-plan-tagline {
          font-size: 0.8rem; color: rgba(245,240,232,0.45); margin: 0;
          font-style: italic;
        }
        .pl-plan-description {
          font-size: 0.87rem; color: rgba(245,240,232,0.5); line-height: 1.65; margin: 0;
        }
        .pl-plan-price-row { margin-top: auto; }
        .pl-plan-price-free {
          display: block; font-size: 0.8rem; color: rgba(245,240,232,0.3);
          text-align: center; margin-bottom: 0.75rem;
        }
        .pl-plan-price-note {
          display: block; font-size: 0.8rem; color: rgba(245,240,232,0.3);
          text-align: center; margin-bottom: 0.75rem;
        }
        .pl-plan-price-note strong { color: rgba(245,240,232,0.5); }
        .pl-plan-btn {
          display: block; text-align: center;
          padding: 0.72rem 1rem;
          border-radius: 8px; font-size: 0.86rem; font-weight: 650;
          transition: all 0.14s; white-space: nowrap;
        }
        .pl-plan-btn-ghost {
          background: transparent; border: 1px solid rgba(255,255,255,0.1);
          color: rgba(245,240,232,0.55);
        }
        .pl-plan-btn-ghost:hover { border-color: rgba(255,255,255,0.22); color: #f5f0e8; }
        .pl-plan-btn-outline-gold {
          background: transparent; border: 1px solid rgba(201,146,26,0.45); color: #c9921a;
        }
        .pl-plan-btn-outline-gold:hover { background: rgba(201,146,26,0.07); border-color: #c9921a; }
        .pl-plan-btn-gold { background: #c9921a; border: 1px solid #c9921a; color: #fff; }
        .pl-plan-btn-gold:hover { background: #b07c14; color: #fff; }
        .pl-plans-note {
          text-align: center; font-size: 0.82rem; color: rgba(245,240,232,0.28);
        }

        /* ── Comparison table ──────────────────────── */
        .pl-table-section { padding: 4rem 0; }
        .pl-table-toggle {
          display: flex; align-items: center; gap: 0.6rem; justify-content: center;
          width: 100%;
          background: transparent; border: 1px solid rgba(201,146,26,0.18);
          border-radius: 9px; padding: 0.9rem 1.5rem;
          font-size: 0.88rem; font-weight: 600; color: #c9921a;
          cursor: pointer; font-family: inherit;
          transition: background 0.14s, border-color 0.14s;
          margin-bottom: 2rem;
        }
        .pl-table-toggle:hover { background: rgba(201,146,26,0.05); border-color: rgba(201,146,26,0.35); }
        .pl-chevron { transition: transform 0.2s; flex-shrink: 0; }
        .pl-chevron-open { transform: rotate(180deg); }
        .pl-table-wrap { overflow-x: auto; border-radius: 10px; border: 1px solid rgba(15,23,42,0.08); }
        .pl-table {
          width: 100%; border-collapse: collapse;
          font-size: 0.85rem;
        }
        .pl-th {
          padding: 0.9rem 1rem; text-align: center;
          background: #f8f5f0; font-size: 0.78rem; font-weight: 700;
          color: #64748b; border-bottom: 1.5px solid rgba(201,146,26,0.12);
          white-space: nowrap;
        }
        .pl-th-feature { text-align: left; width: 36%; }
        .pl-th-premium { color: #c9921a; background: rgba(201,146,26,0.05); }
        .pl-td { padding: 0.7rem 1rem; border-bottom: 1px solid rgba(15,23,42,0.05); vertical-align: middle; }
        .pl-td-feature { color: #334155; font-weight: 500; }
        .pl-td-premium { background: rgba(201,146,26,0.03); }
        .pl-tr-even td { background: rgba(15,23,42,0.02); }
        .pl-tr-even .pl-td-premium { background: rgba(201,146,26,0.04); }

        /* ── No-risk ───────────────────────────────── */
        .pl-norisk {
          background: #f5f0e8;
          padding: 7rem 0;
        }
        .pl-norisk-inner {
          display: grid; grid-template-columns: 1fr auto; gap: 4rem; align-items: center;
        }
        .pl-norisk-sub {
          font-size: 1rem; color: #64748b; line-height: 1.7; margin: 0 0 2rem;
        }
        .pl-norisk-list {
          list-style: none; padding: 0; margin: 0;
          display: flex; flex-direction: column; gap: 0.65rem;
        }
        .pl-norisk-item {
          display: flex; align-items: flex-start; gap: 0.65rem;
          font-size: 0.9rem; color: #475569; line-height: 1.5;
        }
        .pl-norisk-check { color: #c9921a; flex-shrink: 0; margin-top: 0.12rem; }
        .pl-norisk-cta {
          display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
          flex-shrink: 0;
        }
        .pl-norisk-cta-note {
          font-size: 0.78rem; color: #94a3b8; margin: 0; text-align: center;
        }

        /* ── FAQ ───────────────────────────────────── */
        .pl-faq-inner { max-width: 720px; }
        .pl-faq-h2 { margin-bottom: 2.5rem; }
        .pl-faq-list { display: flex; flex-direction: column; }
        .pl-faq-item { border-bottom: 1px solid rgba(201,146,26,0.1); }
        .pl-faq-q {
          display: flex; align-items: center; justify-content: space-between; gap: 1rem;
          width: 100%; background: transparent; border: none;
          padding: 1.2rem 0; cursor: pointer; font-family: inherit;
          text-align: left;
          font-size: 0.95rem; font-weight: 600; color: #0f172a;
          transition: color 0.14s;
        }
        .pl-faq-q:hover { color: #c9921a; }
        .pl-faq-a {
          font-size: 0.9rem; color: #64748b; line-height: 1.7;
          padding: 0 0 1.25rem; margin: 0;
        }

        /* ── Final CTA ─────────────────────────────── */
        .pl-final {
          padding: 9rem 2rem 10rem;
          background: #070b12;
          border-top: 1px solid rgba(201,146,26,0.1);
          text-align: center;
        }
        .pl-final-inner {
          max-width: 640px;
          display: flex; flex-direction: column; align-items: center; gap: 1.5rem;
        }
        .pl-final-h2 {
          font-size: clamp(1.75rem, 2.8vw, 2.4rem);
          font-weight: 650; line-height: 1.15; letter-spacing: -0.015em;
          color: #f5f0e8;
          font-family: 'EB Garamond', Georgia, serif;
          margin: 0;
        }
        .pl-final-body {
          font-size: 1rem; color: rgba(245,240,232,0.45); line-height: 1.75; margin: 0;
          font-family: 'EB Garamond', Georgia, serif;
        }
        .pl-final-emphasis {
          color: rgba(245,240,232,0.65);
          font-size: 1.08rem;
        }
        .pl-final-note {
          font-size: 0.78rem; color: rgba(245,240,232,0.2);
          letter-spacing: 0.06em; margin: 0;
          text-transform: uppercase; font-weight: 600;
        }

        /* ── Footer ────────────────────────────────── */
        .pl-footer { background: #070b12; border-top: 1px solid rgba(255,255,255,0.06); }
        .pl-footer-inner {
          display: grid; grid-template-columns: 1fr auto; gap: 2rem;
          align-items: start; padding-top: 2.25rem; padding-bottom: 3rem;
        }
        .pl-footer-brand p {
          margin-top: 0.6rem; max-width: 300px;
          color: rgba(245,240,232,0.35); font-size: 0.84rem; line-height: 1.6;
        }
        .pl-footer-nav { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.75rem 1.25rem; }
        .pl-footer-nav a {
          color: rgba(245,240,232,0.3); font-size: 0.85rem; font-weight: 500; transition: color 0.14s;
        }
        .pl-footer-nav a:hover { color: #f5f0e8; }

        /* ── Responsive ────────────────────────────── */
        @media (max-width: 900px) {
          .pl-problem-grid { grid-template-columns: repeat(2, 1fr); }
          .pl-plans-grid   { grid-template-columns: repeat(2, 1fr); }
          .pl-eco-grid     { grid-template-columns: repeat(2, 1fr); }
          .pl-norisk-inner { grid-template-columns: 1fr; }
          .pl-norisk-cta   { align-items: flex-start; }
        }
        @media (max-width: 680px) {
          .pl-header { padding: 0 1.25rem; gap: 1rem; }
          .pl-nav    { display: none; }
          .pl-hamburger { display: flex; }
          .pl-hero   { padding: 5rem 0 4rem; }
          .pl-section{ padding: 5rem 0; }
          .pl-problem-grid { grid-template-columns: 1fr; }
          .pl-plans-grid   { grid-template-columns: 1fr; }
          .pl-eco-grid     { grid-template-columns: 1fr; }
          .pl-compare      { grid-template-columns: 1fr; gap: 2rem; }
          .pl-compare-divider { display: none; }
          .pl-patrimonio-stats { gap: 2rem; }
          .pl-footer-inner { grid-template-columns: 1fr; }
          .pl-footer-nav   { justify-content: flex-start; }
        }

      `}</style>
    </main>
  )
}
