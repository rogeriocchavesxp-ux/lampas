'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LampasLogo } from '@/components/LampasLogo'
import { createClient } from '@/lib/supabase/client'

interface MenuAction {
  label: string
  shortcut?: string
  checked?: boolean
  disabled?: boolean
  separator?: boolean   // linha horizontal antes deste item
  soon?: boolean
  badge?: string
  header?: boolean      // título de grupo — não clicável
  onClick?: () => void
}

interface MenuDef {
  id: string
  label: string
  items: MenuAction[]
}

export interface WorkspaceMenuBarProps {
  bibleOpen: boolean
  focusMode: boolean
  sideBySide: boolean
  aiOpen: boolean
  checklistOpen: boolean
  onToggleBible: () => void
  onToggleFocus: () => void
  onToggleSideBySide: () => void
  onToggleAI: () => void
  onToggleChecklist: () => void
  onEnviarSermao: () => void
  onEnviarDevocional: () => void
  onEnviarKB: () => void
}

export default function WorkspaceMenuBar({
  bibleOpen, focusMode, sideBySide, aiOpen, checklistOpen,
  onToggleBible, onToggleFocus, onToggleSideBySide, onToggleAI, onToggleChecklist,
  onEnviarSermao, onEnviarDevocional, onEnviarKB,
}: WorkspaceMenuBarProps) {
  const router = useRouter()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const barRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null)
      if (user) {
        supabase.from('profiles').select('role').eq('id', user.id).single()
          .then(({ data }) => setIsAdmin(data?.role === 'admin'))
      }
    })
  }, [])

  useEffect(() => {
    if (showSearch) searchInputRef.current?.focus()
  }, [showSearch])

  useEffect(() => {
    if (!openMenu) return
    function onOutside(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [openMenu])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpenMenu(null); setShowSearch(false) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  async function signOut() {
    setOpenMenu(null)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  // Navega para uma seção do workspace via evento (padrão lampas:open-pilgrim)
  function sectionNav(slug: string) {
    return () => window.dispatchEvent(new CustomEvent('lampas:navigate', { detail: slug }))
  }

  const initial = (userEmail?.[0] ?? '?').toUpperCase()

  const menus: MenuDef[] = [
    // ── ARQUIVO ───────────────────────────────────────────────────────────────
    {
      id: 'arquivo',
      label: 'Arquivo',
      items: [
        { label: 'Projeto', header: true },
        { label: 'Novo Projeto',          shortcut: '⌘N', onClick: () => router.push('/dashboard?new=1') },
        { label: 'Abrir Projeto',                         onClick: () => router.push('/dashboard') },
        { label: 'Projetos Recentes',     soon: true },
        { label: 'Meus Projetos',                         onClick: () => router.push('/dashboard') },
        { label: 'Biblioteca de Projetos',                onClick: () => router.push('/dashboard') },
        { label: 'Organização', header: true, separator: true },
        { label: 'Duplicar Projeto',      soon: true },
        { label: 'Arquivar Projeto',      soon: true },
        { label: 'Excluir Projeto',       soon: true },
        { label: 'Visualização', header: true, separator: true },
        { label: 'Texto Bíblico', shortcut: '⌘B', checked: bibleOpen,   onClick: onToggleBible },
        { label: 'Modo Lado a Lado',      checked: sideBySide,           onClick: onToggleSideBySide },
        { label: 'Modo Foco',             shortcut: '⌘.', checked: focusMode, onClick: onToggleFocus },
        { label: 'Saída', header: true, separator: true },
        { label: 'Salvar',                shortcut: '⌘S', soon: true },
        { label: 'Imprimir',              shortcut: '⌘P', onClick: () => window.print() },
        { label: 'Exportar PDF',          soon: true },
        { label: 'Exportar DOCX',         soon: true },
        { label: 'Exportar Slides',       soon: true },
        { label: 'Navegação', header: true, separator: true },
        { label: 'Início',                                onClick: () => router.push('/') },
      ],
    },

    // ── BÍBLIA ────────────────────────────────────────────────────────────────
    {
      id: 'biblia',
      label: 'Bíblia',
      items: [
        { label: 'Texto', header: true },
        { label: 'Texto Bíblico', shortcut: '⌘B', checked: bibleOpen, onClick: onToggleBible },
        { label: 'Texto Original',                  onClick: sectionNav('texto_original') },
        { label: 'Interlinear',     soon: true },
        { label: 'Traduções',       soon: true },
        { label: 'Referências', header: true, separator: true },
        { label: 'Referências Cruzadas',            onClick: sectionNav('ferramentas_refs_cruzadas') },
        { label: 'Paralelos Bíblicos',  soon: true },
        { label: 'Uso no Antigo Testamento', soon: true },
        { label: 'Uso no Novo Testamento',  soon: true },
        { label: 'Léxico', header: true, separator: true },
        { label: 'Estudo de Termos',                onClick: sectionNav('termos_chave') },
        { label: 'Dicionário Bíblico',              onClick: sectionNav('ferramentas_dicionario') },
        { label: 'Concordância',    soon: true },
        { label: 'Introdução', header: true, separator: true },
        { label: 'Introdução ao AT',                onClick: sectionNav('ferramentas_introducao_at') },
        { label: 'Introdução ao NT',                onClick: sectionNav('ferramentas_introducao_nt') },
      ],
    },

    // ── INVESTIGAR ────────────────────────────────────────────────────────────
    {
      id: 'investigar',
      label: 'Investigar',
      items: [
        { label: 'Contexto', header: true },
        { label: 'Histórico',             soon: true },
        { label: 'Cultural',              soon: true },
        { label: 'Geográfico',            soon: true },
        { label: 'Arqueológico',          soon: true },
        { label: 'Literatura', header: true, separator: true },
        { label: 'Estrutura',                       onClick: sectionNav('estrutura_literaria') },
        { label: 'Fluxo Argumentativo',   soon: true },
        { label: 'Gênero Literário',      soon: true },
        { label: 'Subgênero Literário',   soon: true },
        { label: 'Teologia', header: true, separator: true },
        { label: 'Teologia Bíblica',      soon: true },
        { label: 'História da Redenção',  soon: true },
        { label: 'Cristo na Passagem',    soon: true },
        { label: 'Alianças',              soon: true },
        { label: 'Temas Teológicos',      soon: true },
        { label: 'Recursos', header: true, separator: true },
        { label: 'Pilgrim',                         onClick: () => window.dispatchEvent(new CustomEvent('lampas:open-pilgrim')) },
        { label: 'Mapas Bíblicos',        soon: true },
        { label: 'Linha do Tempo',                  onClick: () => router.push('/agenda/linha-do-tempo') },
        { label: 'Personagens',           soon: true },
        { label: 'Eventos',               soon: true },
        { label: 'Lugares',               soon: true },
      ],
    },

    // ── PRODUZIR ──────────────────────────────────────────────────────────────
    {
      id: 'produzir',
      label: 'Produzir',
      items: [
        { label: 'Produções', header: true },
        { label: 'Sermão',                          onClick: sectionNav('pregar_visao_geral') },
        { label: 'Estudo Bíblico',                  onClick: sectionNav('pregar_visao_geral') },
        { label: 'Devocional',                      onClick: sectionNav('pregar_visao_geral') },
        { label: 'Aula',                  soon: true },
        { label: 'Curso',                 soon: true },
        { label: 'Artigo',                soon: true },
        { label: 'Componentes', header: true, separator: true },
        { label: 'Introdução',            soon: true },
        { label: 'Desenvolvimento',       soon: true },
        { label: 'Ilustração',            soon: true },
        { label: 'Aplicação',             soon: true },
        { label: 'Conclusão',             soon: true },
        { label: 'Revisão', header: true, separator: true },
        { label: 'Checklist Homilético',  checked: checklistOpen, onClick: onToggleChecklist },
        { label: 'Avaliar Sermão',        soon: true },
        { label: 'Revisão Teológica',     soon: true },
        { label: 'Revisão Exegética',     soon: true },
      ],
    },

    // ── BIBLIOTECA ────────────────────────────────────────────────────────────
    {
      id: 'biblioteca',
      label: 'Biblioteca',
      items: [
        { label: 'Teologia', header: true },
        { label: 'Teologia Sistemática',            onClick: sectionNav('ferramentas_sistematica') },
        { label: 'Teologia Bíblica',      soon: true },
        { label: 'Teologia Histórica',    soon: true },
        { label: 'Documentos', header: true, separator: true },
        { label: 'Confissões de Fé',                onClick: sectionNav('ferramentas_confissoes_catecismos') },
        { label: 'Catecismos',                      onClick: sectionNav('ferramentas_confissoes_catecismos') },
        { label: 'Credos',                soon: true },
        { label: 'Conteúdo', header: true, separator: true },
        { label: 'Livros',                          onClick: sectionNav('ferramentas_livros') },
        { label: 'Artigos',               soon: true },
        { label: 'Cursos',                soon: true },
        { label: 'Colagens',                        onClick: sectionNav('colagens') },
        { label: 'Recursos', header: true, separator: true },
        { label: 'Base de Conhecimento',            onClick: () => router.push('/knowledge') },
        { label: 'Conteúdos Compartilhados', soon: true },
      ],
    },

    // ── AGENDA ────────────────────────────────────────────────────────────────
    {
      id: 'agenda',
      label: 'Agenda',
      items: [
        { label: 'Eventos', header: true },
        { label: 'Calendário',                      onClick: () => router.push('/agenda/calendario') },
        { label: 'Todos os Eventos',                onClick: () => router.push('/agenda/eventos') },
        { label: 'Pregações',                       onClick: () => router.push('/agenda/pregacoes') },
        { label: 'Cursos',                soon: true },
        { label: 'Atendimentos',                    onClick: () => router.push('/agenda/atendimentos') },
        { label: 'Convites', header: true, separator: true },
        { label: 'Convites Recebidos',    soon: true },
        { label: 'Formulário de Convite', soon: true },
        { label: 'Planejamento', header: true, separator: true },
        { label: 'Agenda Ministerial',    soon: true },
        { label: 'Cronograma',            soon: true },
      ],
    },

    // ── IA ────────────────────────────────────────────────────────────────────
    {
      id: 'ia',
      label: 'IA',
      items: [
        { label: 'Assistente', header: true },
        { label: 'Abrir Assistente', shortcut: '⌘I', checked: aiOpen, onClick: onToggleAI },
        { label: 'Exegese', header: true, separator: true },
        { label: 'Analisar Passagem',     soon: true },
        { label: 'Resumo Exegético',      soon: true },
        { label: 'Estudo de Termos',      soon: true },
        { label: 'Referências Inteligentes', soon: true },
        { label: 'Produção', header: true, separator: true },
        { label: 'Sugestões de Sermão',   soon: true },
        { label: 'Gerar Aplicações',      soon: true },
        { label: 'Gerar Ilustrações',     soon: true },
        { label: 'Gerar Slides',          soon: true },
        { label: 'Revisão', header: true, separator: true },
        { label: 'Avaliar Fidelidade Bíblica', soon: true },
        { label: 'Avaliar Clareza',       soon: true },
        { label: 'Avaliar Estrutura',     soon: true },
        { label: 'Checklist de Melhorias', checked: checklistOpen, onClick: onToggleChecklist },
        { label: 'Configurações', header: true, separator: true },
        { label: 'Configurar Modelo',     soon: true },
        { label: 'Preferências da IA',    soon: true },
      ],
    },

    // ── PUBLICAR ──────────────────────────────────────────────────────────────
    {
      id: 'publicar',
      label: 'Publicar',
      items: [
        { label: 'Compartilhar', header: true },
        { label: 'Gerar Link Compartilhável', soon: true },
        { label: 'Tornar Público',         soon: true },
        { label: 'Publicação', header: true, separator: true },
        { label: 'Enviar para Sermão',                    onClick: onEnviarSermao },
        { label: 'Enviar para Devocional',                onClick: onEnviarDevocional },
        { label: 'Enviar para Base de Conhecimento',      onClick: onEnviarKB },
        { label: 'Publicar no Lampas',     soon: true },
        { label: 'Publicar no Primeira Escola', soon: true },
        { label: 'Exportação', header: true, separator: true },
        { label: 'PDF',                    soon: true },
        { label: 'Slides',                 soon: true },
        { label: 'Impressão',                             onClick: () => window.print() },
        { label: 'Histórico', header: true, separator: true },
        { label: 'Publicações Realizadas', soon: true },
        { label: 'Agendamentos',           soon: true },
      ],
    },

    // ── AJUDA ─────────────────────────────────────────────────────────────────
    {
      id: 'ajuda',
      label: 'Ajuda',
      items: [
        { label: 'Aprender', header: true },
        { label: 'Documentação',          soon: true },
        { label: 'Tour Guiado',           soon: true },
        { label: 'Atalhos de Teclado',    soon: true },
        { label: 'Suporte', header: true, separator: true },
        { label: 'Enviar Feedback',       soon: true },
        { label: 'Suporte Técnico',       soon: true },
        { label: 'Institucional', header: true, separator: true },
        { label: 'Sobre o Lampas',        soon: true },
        { label: 'Novidades',             soon: true },
        { label: 'Changelog',             soon: true },
      ],
    },

    // ── FERRAMENTAS ───────────────────────────────────────────────────────────
    {
      id: 'ferramentas',
      label: 'Ferramentas',
      items: [
        { label: 'Texto e Léxico', header: true },
        { label: 'Texto Original',                  onClick: sectionNav('texto_original') },
        { label: 'Dicionário Bíblico',              onClick: sectionNav('ferramentas_dicionario') },
        { label: 'Referências Cruzadas',            onClick: sectionNav('ferramentas_refs_cruzadas') },
        { label: 'Colagens',                        onClick: sectionNav('colagens') },
        { label: 'Livros',                          onClick: sectionNav('ferramentas_livros') },
        { label: 'Introdução Bíblica', header: true, separator: true },
        { label: 'Introdução ao AT',                onClick: sectionNav('ferramentas_introducao_at') },
        { label: 'Introdução ao NT',                onClick: sectionNav('ferramentas_introducao_nt') },
        { label: 'Teologia', header: true, separator: true },
        { label: 'Teologia Sistemática',            onClick: sectionNav('ferramentas_sistematica') },
        { label: 'Confissões e Catecismos',         onClick: sectionNav('ferramentas_confissoes_catecismos') },
        { label: 'Teologia Bíblica',      soon: true },
      ],
    },
  ]

  function handleLabelClick(id: string) {
    setOpenMenu(prev => (prev === id ? null : id))
  }

  function handleLabelHover(id: string) {
    if (openMenu !== null && openMenu !== id) setOpenMenu(id)
  }

  function handleItemClick(item: MenuAction) {
    if (item.disabled || item.soon || item.header) return
    item.onClick?.()
    setOpenMenu(null)
  }

  return (
    <header style={{
      height: '44px',
      flexShrink: 0,
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--surface)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 0.65rem',
      position: 'relative',
      zIndex: 100,
    }}>

      {/* ── Logo ── */}
      <div style={{ flexShrink: 0, marginRight: '0.5rem', display: 'flex', alignItems: 'center' }}>
        <LampasLogo height={34} />
      </div>

      <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)', marginRight: '0.35rem', flexShrink: 0 }} />

      {/* ── Menu bar ── */}
      <div ref={barRef} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
        {menus.map(menu => (
          <div key={menu.id} style={{ position: 'relative', flexShrink: 0 }}>
            <MenuLabel
              label={menu.label}
              open={openMenu === menu.id}
              onClick={() => handleLabelClick(menu.id)}
              onHover={() => handleLabelHover(menu.id)}
            />
            {openMenu === menu.id && (
              <MenuDropdown items={menu.items} onItemClick={handleItemClick} />
            )}
          </div>
        ))}
      </div>

      {/* ── Lado direito: Pesquisar + Novo Projeto + Perfil ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>

        {/* Pesquisar */}
        {showSearch ? (
          <div style={{
            display: 'flex', alignItems: 'center',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: '7px', padding: '0 0.55rem', gap: '0.35rem',
          }}>
            <SearchIcon />
            <input
              ref={searchInputRef}
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Buscar no projeto…"
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: '0.78rem', color: 'var(--text-primary)',
                fontFamily: 'inherit', width: '160px', padding: '0.28rem 0',
              }}
            />
            <button
              onClick={() => { setShowSearch(false); setSearchVal('') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1, padding: '0' }}
            >
              ×
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            title="Pesquisar (⌘K)"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontFamily: 'inherit',
              fontSize: '0.76rem', padding: '0.25rem 0.45rem', borderRadius: '6px',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <SearchIcon />
            <span>Pesquisar</span>
          </button>
        )}

        {/* Assistente IA */}
        <button
          onClick={onToggleAI}
          title="Assistente IA (⌘I)"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.28rem',
            background: aiOpen ? 'var(--ai-subtle)' : 'none',
            border: `1px solid ${aiOpen ? 'var(--ai)' : 'var(--border-subtle)'}`,
            borderRadius: '6px', padding: '0.25rem 0.55rem',
            cursor: 'pointer', fontFamily: 'inherit',
            color: aiOpen ? 'var(--ai)' : 'var(--text-muted)',
            fontSize: '0.76rem', fontWeight: aiOpen ? 650 : 500,
            transition: 'all 0.13s', flexShrink: 0,
          }}
          onMouseEnter={e => { if (!aiOpen) { e.currentTarget.style.borderColor = 'var(--ai)'; e.currentTarget.style.color = 'var(--ai)' } }}
          onMouseLeave={e => { if (!aiOpen) { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)' } }}
        >
          <span style={{ fontSize: '0.78rem', lineHeight: 1 }}>✦</span>
          <span>IA</span>
        </button>

        {/* Novo Projeto */}
        <button
          onClick={() => router.push('/dashboard?new=1')}
          style={{
            background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '0.28rem 0.65rem',
            fontSize: '0.76rem', fontWeight: 650, fontFamily: 'inherit',
            cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: '0.22rem',
            transition: 'background 0.13s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
        >
          <span style={{ fontSize: '0.88rem', lineHeight: 1 }}>+</span>
          Novo Projeto
        </button>

        {/* Perfil do Usuário */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setOpenMenu(p => p === 'user' ? null : 'user')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              background: 'none', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '0.22rem 0.4rem',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'border-color 0.13s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onMouseLeave={e => { if (openMenu !== 'user') e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <span style={{
              width: '22px', height: '22px', borderRadius: '50%',
              background: 'var(--accent)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.67rem', fontWeight: 700, flexShrink: 0,
            }}>
              {initial}
            </span>
            <ChevronIcon open={openMenu === 'user'} />
          </button>

          {openMenu === 'user' && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', right: 0,
              background: 'var(--surface)', border: '1px solid var(--border-subtle)',
              borderRadius: '9px',
              boxShadow: '0 8px 24px rgba(15,23,42,0.1), 0 2px 6px rgba(15,23,42,0.06)',
              padding: '0.3rem', zIndex: 700, minWidth: '196px',
            }}>
              {/* User identity */}
              <div style={{ padding: '0.5rem 0.75rem 0.45rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.2rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  {initial}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userEmail}
                </div>
              </div>

              <ProfileItem label="Minha Conta" />
              <ProfileItem label="Assinatura" onClick={() => { setOpenMenu(null); router.push('/billing') }} />
              {isAdmin && <ProfileItem label="Admin" onClick={() => { setOpenMenu(null); router.push('/admin/billing') }} />}
              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.2rem 0' }} />
              <ProfileItem label="Configurações" />
              <ProfileItem label="Ajuda" />
              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.2rem 0' }} />
              <ProfileItem label="Sair" onClick={signOut} danger />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// ── Sub-componentes ─────────────────────────────────────────────────────────

function MenuLabel({ label, open, onClick, onHover }: {
  label: string; open: boolean; onClick: () => void; onHover: () => void
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      style={{
        background: open ? 'var(--surface-2)' : 'transparent',
        border: 'none',
        color: open ? 'var(--text-primary)' : 'var(--text-secondary)',
        borderRadius: '5px',
        padding: '0.2rem 0.48rem',
        fontSize: '0.76rem',
        fontWeight: open ? 600 : 400,
        cursor: 'pointer',
        fontFamily: 'inherit',
        letterSpacing: '0.01em',
        transition: 'background 0.08s, color 0.08s',
        whiteSpace: 'nowrap',
      }}
      onMouseOver={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-primary)' }}
      onMouseOut={e => { if (!open) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
    >
      {label}
    </button>
  )
}

function MenuDropdown({ items, onItemClick }: { items: MenuAction[]; onItemClick: (item: MenuAction) => void }) {
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 3px)', left: 0,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: '8px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.11), 0 2px 8px rgba(0,0,0,0.06)',
      minWidth: '240px', zIndex: 600, padding: '0.3rem 0',
      maxHeight: '80vh', overflowY: 'auto',
    }}>
      {items.map((item, i) => (
        <div key={i}>
          {item.separator && (
            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.25rem 0' }} />
          )}
          <DropdownItem item={item} onClick={() => onItemClick(item)} />
        </div>
      ))}
    </div>
  )
}

function DropdownItem({ item, onClick }: { item: MenuAction; onClick: () => void }) {
  // Cabeçalho de grupo — não clicável
  if (item.header) {
    return (
      <div style={{
        padding: '0.42rem 0.85rem 0.14rem',
        fontSize: '0.6rem', fontWeight: 700,
        color: 'var(--text-muted)',
        letterSpacing: '0.07em', textTransform: 'uppercase',
        pointerEvents: 'none', userSelect: 'none',
      }}>
        {item.label}
      </div>
    )
  }

  const inactive = !!(item.disabled || item.soon)
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        border: 'none', background: 'transparent', padding: '0.34rem 0.8rem',
        cursor: inactive ? 'default' : 'pointer',
        fontFamily: 'inherit', fontSize: '0.78rem',
        color: inactive ? 'var(--text-muted)' : 'var(--text-primary)',
        textAlign: 'left', opacity: item.disabled ? 0.45 : 1, gap: '0.5rem',
      }}
      onMouseEnter={e => { if (!inactive) e.currentTarget.style.background = 'var(--surface-2)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.42rem', minWidth: 0 }}>
        <span style={{ width: '12px', fontSize: '0.68rem', color: 'var(--accent)', flexShrink: 0 }}>
          {item.checked === true ? '✓' : ''}
        </span>
        <span style={{ fontWeight: item.checked ? 600 : 400, whiteSpace: 'nowrap' }}>{item.label}</span>
        {item.soon && (
          <span style={{
            fontSize: '0.57rem', color: 'var(--text-muted)',
            background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
            borderRadius: '3px', padding: '0.01rem 0.2rem', fontWeight: 500, flexShrink: 0,
          }}>em breve</span>
        )}
        {item.badge && (
          <span style={{
            fontSize: '0.57rem', color: 'var(--text-muted)',
            background: 'var(--surface-3)', borderRadius: '3px',
            padding: '0.01rem 0.2rem', fontWeight: 600, flexShrink: 0,
          }}>{item.badge}</span>
        )}
      </span>
      {item.shortcut && (
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '1rem' }}>
          {item.shortcut}
        </span>
      )}
    </button>
  )
}

function ProfileItem({ label, onClick, danger }: { label: string; onClick?: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', width: '100%',
        padding: '0.4rem 0.75rem', background: 'none', border: 'none',
        borderRadius: '6px', cursor: onClick ? 'pointer' : 'default', fontSize: '0.8rem',
        fontFamily: 'inherit', color: danger ? '#EF4444' : onClick ? 'var(--text-primary)' : 'var(--text-muted)',
        fontWeight: 450, textAlign: 'left',
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.06)' : 'var(--surface-2)' }}
      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
    >
      {label}
      {!onClick && !danger && (
        <span style={{ marginLeft: 'auto', fontSize: '0.58rem', color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 3, padding: '0.01rem 0.22rem', fontWeight: 500 }}>
          em breve
        </span>
      )}
    </button>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
      style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  )
}
