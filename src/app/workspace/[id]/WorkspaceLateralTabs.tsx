'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Project } from '@/types/database'
import {
  BookOpen, BookMarked, Paperclip, Library, BookText, BookCopy,
  ChevronRight, ChevronLeft, X,
  type LucideIcon,
} from 'lucide-react'
import DicionarioWorkspace from './DicionarioWorkspace'
import ToolsWorkspace from './ToolsWorkspace'
import BibleFloatingWindow from './BibleFloatingWindow'
import IntroducaoWorkspace from './IntroducaoWorkspace'

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

export default function WorkspaceLateralTabs({ project, userId, onAskAI }: Props) {
  const [leftTab,  setLeftTab]  = useState<LeftTab | null>(null)
  const [rightTab, setRightTab] = useState<RightTab | null>(null)
  const [teoSub,   setTeoSub]   = useState<'ferramentas_biblica' | 'ferramentas_sistematica'>('ferramentas_biblica')
  const [recortes, setRecortes] = useState('')

  useEffect(() => {
    try {
      const lt = localStorage.getItem('lampas_lateral_left')
      const rt = localStorage.getItem('lampas_lateral_right')
      const rc = localStorage.getItem(`lampas_recortes_${project.id}`)
      if (lt && (['dicionario', 'referencias', 'recortes'] as string[]).includes(lt)) setLeftTab(lt as LeftTab)
      if (rt && (['biblia', 'introducoes', 'teologias'] as string[]).includes(rt)) setRightTab(rt as RightTab)
      if (rc) setRecortes(rc)
    } catch {}
  }, [project.id])

  const toggleLeft = useCallback((id: LeftTab) => {
    setLeftTab(prev => {
      const next = prev === id ? null : id
      try { localStorage.setItem('lampas_lateral_left', next ?? '') } catch {}
      return next
    })
  }, [])

  const toggleRight = useCallback((id: RightTab) => {
    setRightTab(prev => {
      const next = prev === id ? null : id
      try { localStorage.setItem('lampas_lateral_right', next ?? '') } catch {}
      return next
    })
  }, [])

  function saveRecortes(val: string) {
    setRecortes(val)
    try { localStorage.setItem(`lampas_recortes_${project.id}`, val) } catch {}
  }

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
                <ToolsWorkspace
                  project={project}
                  activeSlug="ferramentas_refs_cruzadas"
                  onNavigate={() => {}}
                  onAskAI={onAskAI}
                />
              )}
              {leftTab === 'recortes' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0.65rem' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                    Citações, trechos e anotações rápidas de pesquisa.
                  </p>
                  <textarea
                    value={recortes}
                    onChange={e => saveRecortes(e.target.value)}
                    placeholder="Cole trechos, referências ou observações..."
                    style={{
                      flex: 1, resize: 'none',
                      border: '1px solid var(--border)', borderRadius: '6px',
                      padding: '0.55rem 0.65rem',
                      fontFamily: 'inherit', fontSize: '0.83rem', lineHeight: 1.65,
                      color: 'var(--text-primary)', background: 'var(--background)', outline: 'none',
                    }}
                    onFocus={e => { e.target.style.borderColor = tab.color }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
                  />
                </div>
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
              {rightTab === 'teologias' && (
                <ToolsWorkspace
                  key={teoSub}
                  project={project}
                  activeSlug={teoSub}
                  onNavigate={() => {}}
                  onAskAI={onAskAI}
                />
              )}
            </div>
          </div>
        )
      })()}
    </>
  )
}
