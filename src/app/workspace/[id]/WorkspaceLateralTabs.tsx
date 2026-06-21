'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Project } from '@/types/database'
import {
  BookOpen, BookMarked, Paperclip, Library, BookText, BookCopy,
  ChevronRight, ChevronLeft, X,
  type LucideIcon,
} from 'lucide-react'
import DicionarioWorkspace from './DicionarioWorkspace'
import CrossReferencesWorkspace from './CrossReferencesWorkspace'
import RecortesWorkspace from './RecortesWorkspace'
import BibleFloatingWindow from './BibleFloatingWindow'
import IntroducaoWorkspace from './IntroducaoWorkspace'
import { TOOL_AREAS, type ToolArea } from '@/lib/tools-content'

type LeftTab  = 'dicionario' | 'referencias' | 'recortes'
type RightTab = 'biblia' | 'introducoes' | 'teologias'

interface Props {
  project: Project
  userId: string
  onAskAI: (prompt: string) => void
}

interface TabConfig<T extends string> {
  id: T
  label: string
  Icon: LucideIcon
  color: string
  bg: string
}

const LEFT_TABS: TabConfig<LeftTab>[] = [
  { id: 'dicionario',  label: 'Dicionário',          Icon: BookMarked, color: '#92632A', bg: '#FEF3C7' },
  { id: 'referencias', label: 'Referências Cruzadas', Icon: BookCopy,   color: '#3B4F8E', bg: '#EEF2FF' },
  { id: 'recortes',    label: 'Recortes',             Icon: Paperclip,  color: '#0F766E', bg: '#F0FDF9' },
]

const RIGHT_TABS: TabConfig<RightTab>[] = [
  { id: 'biblia',      label: 'Texto Bíblico', Icon: BookOpen,  color: '#1D4ED8', bg: '#EFF6FF' },
  { id: 'introducoes', label: 'Introduções',   Icon: Library,   color: '#B45309', bg: '#FFFBEB' },
  { id: 'teologias',   label: 'Teologias',     Icon: BookText,  color: '#9B2C2C', bg: '#FFF5F5' },
]

const TAB_W   = 38
const PANEL_W = 390
const TOP     = 132  // NavHeight(52) + MenuBar(44) + Breadcrumb(36)
const BOTTOM  = 60

function TeologiaPainel({ area, project, onAskAI }: { area: ToolArea; project: Project; onAskAI: (prompt: string) => void }) {
  const [query, setQuery] = useState('')
  const passageLabel = `${project.book ?? ''} ${project.passage_ref ?? ''}`.trim()

  function ask(prompt: string) {
    onAskAI([
      `Ferramenta: ${area.title}`,
      `Papel da IA: ${area.aiRole}`,
      `Projeto atual: ${passageLabel} (${project.original_language})`,
      query.trim() ? `Pesquisa: ${query.trim()}` : '',
      '',
      prompt,
      '',
      'Responda em português do Brasil, com rigor reformado, referências bíblicas e aplicação pastoral quando apropriado.',
    ].filter(Boolean).join('\n'))
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        {area.objective}
      </p>

      <div style={{ display: 'flex', gap: '0.45rem' }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && query.trim()) ask(`Pesquise e explique: ${query.trim()}`) }}
          placeholder={`Pesquisar em ${area.shortTitle}...`}
          style={{
            flex: 1, minWidth: 0,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: '6px', color: 'var(--text-primary)',
            fontFamily: 'inherit', fontSize: '0.82rem', padding: '0.5rem 0.65rem', outline: 'none',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = area.color }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
        />
        <button
          onClick={() => ask(`Pesquise e explique: ${query.trim() || area.title}`)}
          style={{
            background: area.bgActive, border: `1px solid ${area.color}`,
            borderRadius: '6px', color: area.color,
            cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '0.75rem', fontWeight: 800, padding: '0 0.65rem', whiteSpace: 'nowrap',
          }}
        >
          Perguntar à IA
        </button>
      </div>

      <div>
        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.45rem' }}>
          Subáreas
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {area.sections.map(section => (
            <button
              key={section}
              onClick={() => {
                setQuery(section)
                ask(`Explique "${section}" em ${area.title}, relacionando com ${passageLabel} quando pertinente.`)
              }}
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
                borderRadius: '5px', color: 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.74rem', padding: '0.28rem 0.5rem',
              }}
            >
              {section}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.45rem' }}>
          Ações
        </div>
        <div style={{ display: 'grid', gap: '0.35rem' }}>
          {area.actions.map(action => (
            <button
              key={action.label}
              onClick={() => ask(action.prompt)}
              style={{
                background: 'transparent', border: `1px solid ${area.color}`,
                borderRadius: '6px', color: area.color,
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.76rem', fontWeight: 800, padding: '0.5rem 0.65rem', textAlign: 'left',
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.45rem' }}>
          Capacidades
        </div>
        <div style={{ display: 'grid', gap: '0.3rem' }}>
          {area.capabilities.map(item => (
            <div key={item} style={{ display: 'flex', gap: '0.4rem', alignItems: 'baseline', color: 'var(--text-secondary)', fontSize: '0.76rem', lineHeight: 1.4 }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: area.color, flexShrink: 0, marginTop: '5px' }} />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function WorkspaceLateralTabs({ project, userId, onAskAI }: Props) {
  const [leftTab,  setLeftTab]  = useState<LeftTab | null>(null)
  const [rightTab, setRightTab] = useState<RightTab | null>(null)
  const [teoSub,   setTeoSub]   = useState<'ferramentas_biblica' | 'ferramentas_sistematica'>('ferramentas_biblica')

  // Painéis laterais sempre iniciam fechados — só abrem por ação explícita do usuário

  const toggleLeft = useCallback((id: LeftTab) => {
    setLeftTab(prev => prev === id ? null : id)
  }, [])

  const toggleRight = useCallback((id: RightTab) => {
    setRightTab(prev => prev === id ? null : id)
  }, [])

  return (
    <>
      {/* ── LEFT TAB STRIP ────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', top: TOP, left: 0, bottom: BOTTOM, width: TAB_W,
        zIndex: 200, display: 'flex', flexDirection: 'column',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border-subtle)',
      }}>
        {LEFT_TABS.map(tab => {
          const active = leftTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => toggleLeft(tab.id)}
              title={tab.label}
              style={{
                flex: 1, border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '7px', padding: '0.5rem 0',
                background: active ? tab.bg : 'transparent',
                borderRight: active ? `2px solid ${tab.color}` : '2px solid transparent',
                color: active ? tab.color : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.04)'
                  e.currentTarget.style.color = tab.color
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-muted)'
                }
              }}
            >
              <tab.Icon size={14} strokeWidth={1.75} />
              <span style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                fontSize: '0.55rem', fontWeight: active ? 700 : 600,
                letterSpacing: '0.07em', textTransform: 'uppercase',
                lineHeight: 1, whiteSpace: 'nowrap',
              }}>
                {tab.label}
              </span>
              {active && <ChevronRight size={9} strokeWidth={2.5} />}
            </button>
          )
        })}
      </div>

      {/* ── LEFT PANEL ────────────────────────────────────────────────── */}
      {leftTab && (() => {
        const tab = LEFT_TABS.find(t => t.id === leftTab)!
        return (
          <div style={{
            position: 'fixed', top: TOP, left: TAB_W, bottom: BOTTOM, width: PANEL_W,
            zIndex: 199, background: 'var(--surface)',
            borderRight: '1px solid var(--border-subtle)',
            boxShadow: '4px 0 20px rgba(0,0,0,0.07)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.45rem',
              padding: '0.45rem 0.7rem', flexShrink: 0,
              background: tab.bg,
              borderBottom: `1px solid ${tab.color}22`,
            }}>
              <tab.Icon size={13} strokeWidth={2} color={tab.color} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: tab.color, flex: 1 }}>
                {tab.label}
              </span>
              <button
                onClick={() => setLeftTab(null)}
                title="Fechar"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: tab.color, opacity: 0.6, padding: '0.1rem',
                  borderRadius: '3px', display: 'flex',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0.6' }}
              >
                <X size={12} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {leftTab === 'dicionario' && (
                <DicionarioWorkspace project={project} userId={userId} onAskAI={onAskAI} />
              )}
              {leftTab === 'referencias' && (
                <CrossReferencesWorkspace project={project} onAskAI={onAskAI} />
              )}
              {leftTab === 'recortes' && (
                <RecortesWorkspace project={project} userId={userId} onAskAI={onAskAI} />
              )}
            </div>
          </div>
        )
      })()}

      {/* ── RIGHT TAB STRIP ───────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', top: TOP, right: 0, bottom: BOTTOM, width: TAB_W,
        zIndex: 200, display: 'flex', flexDirection: 'column',
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border-subtle)',
      }}>
        {RIGHT_TABS.map(tab => {
          const active = rightTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => toggleRight(tab.id)}
              title={tab.label}
              style={{
                flex: 1, border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '7px', padding: '0.5rem 0',
                background: active ? tab.bg : 'transparent',
                borderLeft: active ? `2px solid ${tab.color}` : '2px solid transparent',
                color: active ? tab.color : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.04)'
                  e.currentTarget.style.color = tab.color
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-muted)'
                }
              }}
            >
              {active && <ChevronLeft size={9} strokeWidth={2.5} />}
              <tab.Icon size={14} strokeWidth={1.75} />
              <span style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                fontSize: '0.55rem', fontWeight: active ? 700 : 600,
                letterSpacing: '0.07em', textTransform: 'uppercase',
                lineHeight: 1, whiteSpace: 'nowrap',
              }}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── RIGHT PANEL ───────────────────────────────────────────────── */}
      {rightTab && (() => {
        const tab = RIGHT_TABS.find(t => t.id === rightTab)!
        return (
          <div style={{
            position: 'fixed', top: TOP, right: TAB_W, bottom: BOTTOM, width: PANEL_W,
            zIndex: 199, background: 'var(--surface)',
            borderLeft: '1px solid var(--border-subtle)',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.07)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.45rem',
              padding: '0.45rem 0.7rem', flexShrink: 0,
              background: tab.bg,
              borderBottom: `1px solid ${tab.color}22`,
            }}>
              <button
                onClick={() => setRightTab(null)}
                title="Fechar"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: tab.color, opacity: 0.6, padding: '0.1rem',
                  borderRadius: '3px', display: 'flex',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0.6' }}
              >
                <X size={12} />
              </button>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: tab.color, flex: 1, textAlign: 'right' }}>
                {tab.label}
              </span>
              <tab.Icon size={13} strokeWidth={2} color={tab.color} />
            </div>

            {rightTab === 'teologias' && (
              <div style={{
                display: 'flex', flexShrink: 0,
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--surface)',
              }}>
                {(['ferramentas_biblica', 'ferramentas_sistematica'] as const).map(slug => {
                  const label    = slug === 'ferramentas_biblica' ? 'Teologia Bíblica' : 'Sistemática'
                  const isActive = teoSub === slug
                  return (
                    <button
                      key={slug}
                      onClick={() => setTeoSub(slug)}
                      style={{
                        flex: 1, padding: '0.38rem 0.4rem',
                        border: 'none', borderBottom: isActive ? `2px solid ${tab.color}` : '2px solid transparent',
                        cursor: 'pointer', fontFamily: 'inherit',
                        fontSize: '0.72rem', fontWeight: isActive ? 700 : 400,
                        color: isActive ? tab.color : 'var(--text-muted)',
                        background: 'transparent', transition: 'all 0.15s',
                      }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            )}

            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {rightTab === 'biblia' && (
                <BibleFloatingWindow
                  book={project.book}
                  passageRef={project.passage_ref}
                  testament={project.testament}
                  projectId={project.id}
                  userId={userId}
                  onClose={() => setRightTab(null)}
                  sidebarMode
                  studyMode={project.study_mode ?? undefined}
                />
              )}
              {rightTab === 'introducoes' && (
                <IntroducaoWorkspace
                  testament={project.testament}
                  project={project}
                  onAskAI={onAskAI}
                />
              )}
              {rightTab === 'teologias' && (() => {
                const area = TOOL_AREAS.find(a => a.slug === teoSub) ?? TOOL_AREAS[0]
                return <TeologiaPainel key={teoSub} area={area} project={project} onAskAI={onAskAI} />
              })()}
            </div>
          </div>
        )
      })()}
    </>
  )
}
