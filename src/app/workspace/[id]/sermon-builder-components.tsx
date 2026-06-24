'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type { Project } from '@/types/database'
import type { MarkerStyle, PontoElementKey, Subponto, PontoElement, PontoPrincipal, SermonBlock } from './sermon-builder-types'
import { mkId, markerLabel, newPontoPrincipal, pontoElements, sanitizeRichHtml, richEditorHtml } from './sermon-builder-types'

// ── ContextMenu ────────────────────────────────────────────────────────────

interface CtxItem {
  label?: string
  icon?: string
  action?: () => void
  disabled?: boolean
  danger?: boolean
  divider?: boolean
}

export function ContextMenu({ items, onClose, style }: {
  items: CtxItem[]
  onClose: () => void
  style?: React.CSSProperties
}) {
  return (
    <div
      onMouseDown={e => e.stopPropagation()}
      style={{
        position: 'absolute', zIndex: 200,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: '8px', padding: '0.28rem',
        minWidth: '192px', boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
        ...style,
      }}
    >
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.22rem 0.4rem' }} />
        ) : (
          <button
            key={i}
            onClick={() => { if (!item.disabled && item.action) { item.action(); onClose() } }}
            style={{
              width: '100%', background: 'transparent', border: 'none',
              textAlign: 'left', padding: '0.42rem 0.62rem', borderRadius: '5px',
              color: item.danger ? 'var(--error)' : item.disabled ? 'var(--border)' : 'var(--text-secondary)',
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', fontSize: '0.8rem', opacity: item.disabled ? 0.4 : 1,
              display: 'flex', gap: '0.5rem', alignItems: 'center',
            }}
            onMouseEnter={e => { if (!item.disabled) e.currentTarget.style.background = 'var(--surface-3)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            {item.icon && (
              <span style={{ opacity: 0.6, minWidth: '13px', fontSize: '0.72rem', lineHeight: 1 }}>
                {item.icon}
              </span>
            )}
            {item.label}
          </button>
        )
      )}
    </div>
  )
}

// ── RichEditor ────────────────────────────────────────────────────────────

export function RichEditor({
  value,
  onChange,
  placeholder,
  rows = 3,
  autoFocus,
  style,
  toolbarColor = 'var(--ai)',
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  rows?: number
  autoFocus?: boolean
  style?: React.CSSProperties
  toolbarColor?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const editor = ref.current
    if (!editor || focused) return
    const next = richEditorHtml(value)
    if (editor.innerHTML !== next) editor.innerHTML = next
  }, [value, focused])

  useEffect(() => {
    if (autoFocus) ref.current?.focus()
  }, [autoFocus])

  function syncValue() {
    const editor = ref.current
    if (!editor) return
    const text = editor.innerText.replace(/\u00a0/g, ' ').trim()
    onChange(text ? sanitizeRichHtml(editor.innerHTML) : '')
  }

  function runCommand(command: 'bold' | 'italic' | 'insertUnorderedList') {
    const editor = ref.current
    if (!editor) return
    editor.focus()
    document.execCommand(command)
    syncValue()
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
    syncValue()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!e.metaKey && !e.ctrlKey) return
    if (e.key.toLowerCase() === 'b') {
      e.preventDefault()
      runCommand('bold')
    }
    if (e.key.toLowerCase() === 'i') {
      e.preventDefault()
      runCommand('italic')
    }
  }

  const toolButton = (label: string, title: string, onClick: () => void, fontStyle?: React.CSSProperties) => (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick() }}
      style={{
        width: '24px',
        height: '24px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: '1px solid var(--border-subtle)',
        borderRadius: '4px',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: '0.74rem',
        lineHeight: 1,
        ...fontStyle,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = toolbarColor; e.currentTarget.style.color = toolbarColor }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)' }}
    >
      {label}
    </button>
  )

  return (
    <div>
      <style>{`
        .sermon-rich-editor ul,
        .sermon-rich-editor ol {
          margin: 0.35rem 0 0.55rem 1.15rem;
          padding: 0;
        }
        .sermon-rich-editor li + li {
          margin-top: 0.22rem;
        }
        .sermon-rich-editor p {
          margin: 0 0 0.55rem;
        }
        .sermon-rich-editor p:last-child {
          margin-bottom: 0;
        }
      `}</style>
      <div style={{ display: 'flex', gap: '0.22rem', marginBottom: '0.28rem' }}>
        {toolButton('B', 'Negrito', () => runCommand('bold'), { fontWeight: 900 })}
        {toolButton('I', 'Itálico', () => runCommand('italic'), { fontStyle: 'italic', fontFamily: 'Georgia, serif' })}
        {toolButton('•', 'Marcadores', () => runCommand('insertUnorderedList'), { fontSize: '0.95rem' })}
      </div>
      <div
        ref={ref}
        className="sermon-rich-editor"
        contentEditable
        suppressContentEditableWarning
        aria-label={placeholder}
        data-placeholder={placeholder}
        onInput={syncValue}
        onBlur={() => { setFocused(false); syncValue() }}
        onFocus={() => { setFocused(true); if (ref.current && ref.current.innerHTML !== richEditorHtml(value)) ref.current.innerHTML = richEditorHtml(value) }}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        style={{
          minHeight: `${Math.max(rows, 1) * 1.7}em`,
          whiteSpace: 'pre-wrap',
          ...style,
        }}
      />
      {!value.trim() && !focused && (
        <div
          aria-hidden
          style={{
            marginTop: `-${Math.max(rows, 1) * 1.7}em`,
            minHeight: `${Math.max(rows, 1) * 1.7}em`,
            pointerEvents: 'none',
            color: 'var(--text-muted)',
            opacity: 0.62,
            fontSize: typeof style?.fontSize === 'string' ? style.fontSize : '0.85rem',
            lineHeight: style?.lineHeight ?? 1.7,
          }}
        >
          {placeholder}
        </div>
      )}
    </div>
  )
}

// ── NoteArea ───────────────────────────────────────────────────────────────

export function NoteArea({ value, onChange, onAskAI, aiPrompt, color = 'var(--ai)' }: {
  value: string
  onChange: (v: string) => void
  onAskAI: (p: string) => void
  aiPrompt: string
  color?: string
}) {
  return (
    <div style={{
      background: `${color}08`,
      borderRadius: '5px',
      padding: '0.5rem 0.62rem 0.35rem',
      marginTop: '0.25rem',
    }}>
      <RichEditor
        value={value}
        onChange={onChange}
        placeholder="Explicação, argumento, citação, referência bíblica, observação pastoral, lembrete de pregação…"
        autoFocus
        rows={3}
        toolbarColor={color}
        style={{
          width: '100%', background: 'transparent', border: 'none',
          color: 'var(--text-primary)', fontFamily: 'inherit',
          fontSize: '0.82rem', lineHeight: 1.7,
          resize: 'vertical', outline: 'none', padding: 0,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.12rem' }}>
        <button
          onClick={() => onAskAI(aiPrompt)}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color, fontFamily: 'inherit', fontSize: '0.72rem', fontWeight: 700, padding: '0.1rem 0',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          ✦ Gerar com IA
        </button>
      </div>
    </div>
  )
}

// ── DesenvolvimentoEditor ─────────────────────────────────────────────────

interface DevEditorProps {
  pontos: PontoPrincipal[]
  project: Project
  mainMarkerStyle: MarkerStyle
  subMarkerStyle: MarkerStyle
  onUpdate: (pontos: PontoPrincipal[]) => void
  onMarkerStyleChange: (data: Partial<Pick<SermonBlock, 'mainMarkerStyle' | 'subMarkerStyle'>>) => void
  onAskAI: (prompt: string) => void
}

export function DesenvolvimentoEditor({
  pontos,
  project,
  mainMarkerStyle,
  subMarkerStyle,
  onUpdate,
  onMarkerStyleChange,
  onAskAI,
}: DevEditorProps) {
  const ref = `${project.book} ${project.passage_ref}`
  const [expanded,        setExpanded]        = useState<Set<string>>(() => new Set([pontos[0]?.id].filter(Boolean)))
  const [openNotes,       setOpenNotes]       = useState<Set<string>>(new Set())
  const [hoveredSubId,    setHoveredSubId]    = useState<string | null>(null)
  const [openSubMenuId,   setOpenSubMenuId]   = useState<string | null>(null)
  const [hoveredPontoId,  setHoveredPontoId]  = useState<string | null>(null)
  const [openPontoMenuId, setOpenPontoMenuId] = useState<string | null>(null)
  const [hoveredSection,  setHoveredSection]  = useState<string | null>(null)

  useEffect(() => {
    if (!openSubMenuId && !openPontoMenuId) return
    function close() { setOpenSubMenuId(null); setOpenPontoMenuId(null) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [openSubMenuId, openPontoMenuId])

  const toggleExpand = (id: string) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const toggleNote = (key: string) =>
    setOpenNotes(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })

  // ── Pontos CRUD

  function addPonto() {
    const p = newPontoPrincipal()
    setExpanded(prev => new Set([...prev, p.id]))
    onUpdate([...pontos, p])
  }

  function patch(id: string, data: Partial<PontoPrincipal>) {
    onUpdate(pontos.map(p => p.id === id ? { ...p, ...data } : p))
  }

  function movePonto(id: string, dir: 'up' | 'down') {
    const i = pontos.findIndex(p => p.id === id)
    if (i < 0) return
    const arr = [...pontos]
    const swap = dir === 'up' ? i - 1 : i + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[i], arr[swap]] = [arr[swap], arr[i]]
    onUpdate(arr)
  }

  function deletePonto(id: string) { onUpdate(pontos.filter(p => p.id !== id)) }

  function demotePonto(id: string) {
    const i = pontos.findIndex(p => p.id === id)
    if (i <= 0) return
    const target = pontos[i]
    const arr = pontos.filter(p => p.id !== id)
    arr[i - 1] = { ...arr[i - 1], subpontos: [...arr[i - 1].subpontos, { id: mkId(), text: target.text, notes: '' }] }
    onUpdate(arr)
  }

  // ── Subpontos CRUD

  function addSubponto(pontoId: string) {
    const p = pontos.find(p => p.id === pontoId)!
    patch(pontoId, { subpontos: [...p.subpontos, { id: mkId(), text: '', notes: '' }] })
  }

  function patchSub(pontoId: string, subId: string, data: Partial<Subponto>) {
    const p = pontos.find(p => p.id === pontoId)!
    patch(pontoId, { subpontos: p.subpontos.map(s => s.id === subId ? { ...s, ...data } : s) })
  }

  function moveSub(pontoId: string, subId: string, dir: 'up' | 'down') {
    const p = pontos.find(p => p.id === pontoId)!
    const i = p.subpontos.findIndex(s => s.id === subId)
    if (i < 0) return
    const arr = [...p.subpontos]
    const swap = dir === 'up' ? i - 1 : i + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[i], arr[swap]] = [arr[swap], arr[i]]
    patch(pontoId, { subpontos: arr })
  }

  function removeSub(pontoId: string, subId: string) {
    const p = pontos.find(p => p.id === pontoId)!
    patch(pontoId, { subpontos: p.subpontos.filter(s => s.id !== subId) })
  }

  function promoteSub(pontoId: string, subId: string) {
    const i = pontos.findIndex(p => p.id === pontoId)
    const p = pontos[i]
    const sub = p.subpontos.find(s => s.id === subId)!
    const newPonto: PontoPrincipal = { ...newPontoPrincipal(), text: sub.text, notes: sub.notes ?? '', subpontos: [] }
    const arr = pontos.map(pt => pt.id === pontoId ? { ...pt, subpontos: pt.subpontos.filter(s => s.id !== subId) } : pt)
    arr.splice(i + 1, 0, newPonto)
    setExpanded(prev => new Set([...prev, newPonto.id]))
    onUpdate(arr)
  }

  // ── Elementos internos do ponto

  const AI_COLOR = 'var(--ai)'

  type ElementKey = PontoElementKey

  const elementMeta: Record<ElementKey, { singular: string; plural: string; placeholder: string; color: string }> = {
    ilustracoes: {
      singular: 'Ilustração',
      plural: 'Ilustrações',
      placeholder: 'Ilustração, analogia, exemplo histórico, citação ou caso pastoral…',
      color: AI_COLOR,
    },
    aplicacoes: {
      singular: 'Aplicação',
      plural: 'Aplicações',
      placeholder: 'Como isso confronta, consola, chama à fé, revela Cristo e deve mudar a vida do ouvinte?',
      color: '#6db8a0',
    },
    citacoes: {
      singular: 'Citação',
      plural: 'Citações',
      placeholder: 'Citação, fonte, referência bibliográfica ou frase marcante…',
      color: AI_COLOR,
    },
    observacoes: {
      singular: 'Observação',
      plural: 'Observações',
      placeholder: 'Observação pastoral, nota de organização, cuidado retórico ou detalhe para lembrar…',
      color: AI_COLOR,
    },
  }

  function getElements(p: PontoPrincipal, key: ElementKey): PontoElement[] {
    return pontoElements(p, key)
  }

  function patchElements(pontoId: string, key: ElementKey, elements: PontoElement[]) {
    const legacyPatch =
      key === 'ilustracoes'
        ? { ilustracao: elements[0]?.text ?? '', ilustracaoNotes: elements[0]?.notes ?? '' }
        : key === 'aplicacoes'
          ? { aplicacao: elements[0]?.text ?? '', aplicacaoNotes: elements[0]?.notes ?? '' }
          : {}

    patch(pontoId, { [key]: elements, ...legacyPatch } as Partial<PontoPrincipal>)
  }

  function addElement(pontoId: string, key: ElementKey) {
    const p = pontos.find(p => p.id === pontoId)!
    const meta = elementMeta[key]
    const nextIndex = getElements(p, key).length + 1
    patchElements(pontoId, key, [
      ...getElements(p, key),
      { id: mkId(), title: nextIndex > 1 ? `${meta.singular} ${nextIndex}` : meta.singular, text: '', notes: '' },
    ])
  }

  function patchElement(pontoId: string, key: ElementKey, itemId: string, data: Partial<PontoElement>) {
    const p = pontos.find(p => p.id === pontoId)!
    patchElements(pontoId, key, getElements(p, key).map(item => item.id === itemId ? { ...item, ...data } : item))
  }

  function removeElement(pontoId: string, key: ElementKey, itemId: string) {
    const p = pontos.find(p => p.id === pontoId)!
    patchElements(pontoId, key, getElements(p, key).filter(item => item.id !== itemId))
  }

  // ── AI prompts

  function aiPonto(p: PontoPrincipal) {
    const ctx = p.text.trim() ? `"${p.text}"` : 'este ponto'
    onAskAI(`Avalie e melhore o ponto principal ${ctx} do sermão de ${ref}. O ponto deve ser claro, arguir a partir do texto e ter progressão lógica. Sugira também subpontos e estrutura de desenvolvimento.`)
  }

  function aiSubpontos(p: PontoPrincipal) {
    onAskAI(`Gere subpontos para o ponto "${p.text || 'principal'}" do sermão de ${ref}. Liste argumentos e evidências textuais que desenvolvam esse ponto com clareza e fidelidade exegética.`)
  }

  function aiSubponto(p: PontoPrincipal, s: Subponto) {
    const ctx = s.text.trim() ? `"${s.text}"` : 'este subponto'
    onAskAI(`Desenvolva o subponto ${ctx} dentro do ponto "${p.text || 'principal'}" do sermão de ${ref}. Argumento textual, explicação e evidência bíblica em linguagem pastoral.`)
  }

  function aiIlustracao(p: PontoPrincipal) {
    onAskAI(`Sugira uma ilustração, analogia ou exemplo histórico para o ponto "${p.text || 'principal'}" do sermão de ${ref}. Breve, pastoral e conectada ao texto — ilumina sem dominar.`)
  }

  function aiAplicacao(p: PontoPrincipal) {
    onAskAI(`Desenvolva aplicações pastorais para o ponto "${p.text || 'principal'}" do sermão de ${ref}. Como confronta? Como consola? Como chama à fé? Como revela Cristo? Como transforma o ouvinte?`)
  }

  function aiRevisao() {
    const sumario = pontos.map((p, i) => `${i + 1}. ${p.text || '(sem título)'}`).join('; ')
    onAskAI(`Revise a coerência homilética deste desenvolvimento do sermão de ${ref}. Pontos: ${sumario}. Avalie progressão lógica, cristocentrismo, fidelidade à perícope, equilíbrio exposição/aplicação e risco de moralismo.`)
  }

  const secLabel: React.CSSProperties = {
    fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: 'var(--text-muted)',
  }

  const markerOptions: { value: MarkerStyle; label: string }[] = [
    { value: 'roman', label: 'Romanos' },
    { value: 'decimal', label: 'Números' },
    { value: 'alpha', label: 'Letras' },
    { value: 'bullet', label: 'Marcadores' },
    { value: 'none', label: 'Nenhum' },
  ]

  const markerSelect = (
    label: string,
    value: MarkerStyle,
    onChange: (style: MarkerStyle) => void,
  ) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
      <span>{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value as MarkerStyle)}
        style={{
          background: '#fff',
          border: '1px solid var(--border-subtle)',
          borderRadius: '5px',
          color: 'var(--text-secondary)',
          fontFamily: 'inherit',
          fontSize: '0.72rem',
          padding: '0.22rem 0.45rem',
          outline: 'none',
        }}
      >
        {markerOptions.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  )

  const ghostBtn = (label: string, onClick: () => void, colorHover = 'var(--ai)') => (
    <button
      onClick={onClick}
      style={{
        background: 'transparent', border: 'none', borderRadius: '3px',
        padding: '0.1rem 0.3rem', cursor: 'pointer',
        color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'inherit', lineHeight: 1,
      }}
      onMouseEnter={e => e.currentTarget.style.color = colorHover}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
    >{label}</button>
  )

  function renderElementSection(ponto: PontoPrincipal, key: ElementKey) {
    const meta = elementMeta[key]
    const items = getElements(ponto, key)
    const sectionKey = `${ponto.id}:${key}`
    const isHovered = hoveredSection === sectionKey
    const hasItems = items.length > 0

    if (!hasItems) return null

    const aiAction =
      key === 'ilustracoes'
        ? () => aiIlustracao(ponto)
        : key === 'aplicacoes'
          ? () => aiAplicacao(ponto)
          : undefined

    return (
      <div
        onMouseEnter={() => setHoveredSection(sectionKey)}
        onMouseLeave={() => setHoveredSection(null)}
        style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.58rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: isHovered ? '0.25rem' : 0, minHeight: isHovered ? '18px' : 0 }}>
          {isHovered && (
            <div style={{ display: 'flex', gap: '0.2rem' }}>
              {aiAction && ghostBtn('✦ IA', aiAction, meta.color)}
              {ghostBtn(`+ Adicionar ${meta.singular}`, () => addElement(ponto.id, key), meta.color)}
            </div>
          )}
        </div>

        {items.map((item, index) => {
          const noteKey = `${ponto.id}:${key}:${item.id}`
          const noteOpen = openNotes.has(noteKey)
          const itemHasNote = !!item.notes?.trim()
          const fallbackLabel = items.length > 1 ? `${meta.singular} ${index + 1}` : meta.singular
          const label = item.title?.trim() || fallbackLabel

          return (
            <div key={item.id} style={{ marginTop: index === 0 ? '0.15rem' : '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                <input
                  value={item.title ?? fallbackLabel}
                  onChange={e => patchElement(ponto.id, key, item.id, { title: e.target.value })}
                  aria-label={`Título de ${meta.singular.toLowerCase()}`}
                  style={{
                    flex: 1, background: 'transparent', border: 'none',
                    color: meta.color, fontFamily: 'inherit',
                    fontSize: '0.64rem', fontWeight: 700,
                    outline: 'none', padding: 0,
                  }}
                />
                {(isHovered || noteOpen || itemHasNote) && (
                  <>
                    <button
                      onClick={() => toggleNote(noteKey)}
                      title={itemHasNote ? 'Nota de apoio (preenchida)' : 'Adicionar nota'}
                      style={{
                        background: noteOpen ? `${meta.color}18` : 'transparent',
                        border: 'none', borderRadius: '3px', padding: '0.1rem 0.26rem',
                        cursor: 'pointer', color: noteOpen ? meta.color : itemHasNote ? `${meta.color}AA` : 'var(--text-muted)',
                        fontSize: '0.7rem', lineHeight: 1,
                      }}
                    >✎</button>
                    <button
                      onClick={() => removeElement(ponto.id, key, item.id)}
                      title={`Remover ${meta.singular.toLowerCase()}`}
                      style={{
                        background: 'transparent', border: 'none', borderRadius: '3px',
                        padding: '0.1rem 0.24rem', cursor: 'pointer',
                        color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1,
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >×</button>
                  </>
                )}
              </div>

              <RichEditor
                value={item.text}
                onChange={text => patchElement(ponto.id, key, item.id, { text })}
                placeholder={meta.placeholder}
                rows={key === 'citacoes' || key === 'observacoes' ? 2 : 3}
                toolbarColor={meta.color}
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  borderBottom: '1px solid transparent',
                  color: 'var(--text-primary)', fontFamily: 'inherit',
                  fontSize: '0.85rem', lineHeight: 1.7,
                  padding: '0 0 0.18rem', resize: 'vertical', outline: 'none',
                }}
              />

              {noteOpen && (
                <NoteArea
                  value={item.notes ?? ''}
                  onChange={v => patchElement(ponto.id, key, item.id, { notes: v })}
                  onAskAI={onAskAI}
                  aiPrompt={`Escreva notas de apoio para ${label.toLowerCase()} do ponto "${ponto.text || 'principal'}" do sermão de ${ref}. Ajude a desenvolver oralmente com clareza, conexão textual e aplicação pastoral.`}
                  color={meta.color}
                />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ padding: '0.5rem 0.85rem 1rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '0.55rem',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {markerSelect('Pontos principais', mainMarkerStyle, style => onMarkerStyleChange({ mainMarkerStyle: style }))}
        {markerSelect('Subpontos', subMarkerStyle, style => onMarkerStyleChange({ subMarkerStyle: style }))}
      </div>

      {pontos.map((ponto, pi) => {
        const isOpen         = expanded.has(ponto.id)
        const isFirst        = pi === 0
        const isLast         = pi === pontos.length - 1
        const hasText        = ponto.text.trim().length > 0
        const subCount       = ponto.subpontos.length
        const pontoNoteKey   = `${ponto.id}:ponto`
        const pontoNoteOpen  = openNotes.has(pontoNoteKey)
        const pontoHasNote   = !!(ponto.notes?.trim())
        const isPontoHovered = hoveredPontoId === ponto.id
        const isPontoMenu    = openPontoMenuId === ponto.id
        const showPontoActions = isPontoHovered || isPontoMenu || pontoNoteOpen

        const pontoMenuItems: CtxItem[] = [
          { icon: '✦', label: 'Gerar com IA',        action: () => aiPonto(ponto) },
          { icon: '✦', label: 'Sugerir subpontos',   action: () => aiSubpontos(ponto) },
          { divider: true },
          { icon: '↑', label: 'Mover para cima',     action: () => movePonto(ponto.id, 'up'),   disabled: isFirst },
          { icon: '↓', label: 'Mover para baixo',    action: () => movePonto(ponto.id, 'down'), disabled: isLast },
          ...(!isFirst ? [{ icon: '↙', label: 'Tornar subponto do anterior', action: () => demotePonto(ponto.id) } as CtxItem] : []),
          { divider: true },
          { label: 'Excluir', action: () => deletePonto(ponto.id), danger: true },
        ]

        return (
          <div
            key={ponto.id}
            onMouseEnter={() => setHoveredPontoId(ponto.id)}
            onMouseLeave={() => setHoveredPontoId(null)}
            style={{
              borderTop: '1px solid var(--border-subtle)',
              borderRight: '1px solid var(--border-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
              borderLeft: `4px solid ${isOpen ? AI_COLOR : `${AI_COLOR}44`}`,
              borderRadius: '8px',
              background: isOpen ? '#fff' : 'var(--surface)',
              boxShadow: isOpen ? '0 18px 38px rgba(15, 23, 42, 0.10)' : 'none',
              marginBottom: isOpen ? '0.9rem' : '0.5rem',
              overflow: 'visible',
              position: 'relative',
              transition: 'background 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease',
            }}
          >
            {/* ── Ponto header */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '0.7rem',
                padding: isOpen ? '0.82rem 0.85rem' : '0.62rem 0.75rem',
                borderBottom: isOpen ? '1px solid var(--border-subtle)' : 'none',
                background: isOpen ? `${AI_COLOR}0f` : 'transparent',
                borderRadius: isOpen ? '5px 5px 0 0' : '5px',
              }}
            >
              <button
                onClick={() => toggleExpand(ponto.id)}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', fontSize: '0.6rem', padding: 0, flexShrink: 0,
                  transition: 'transform 0.15s', transform: isOpen ? 'rotate(90deg)' : 'none', lineHeight: 1,
                }}
              >▶</button>

              {mainMarkerStyle !== 'none' && (
                <span
                  style={{
                    width: isOpen ? '38px' : '28px',
                    height: isOpen ? '38px' : '28px',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isOpen ? AI_COLOR : `${AI_COLOR}14`,
                    color: isOpen ? '#fff' : AI_COLOR,
                    fontSize: isOpen ? '0.82rem' : '0.62rem',
                    fontWeight: 900,
                    flexShrink: 0,
                    lineHeight: 1,
                    boxShadow: isOpen ? `0 8px 18px ${AI_COLOR}2a` : 'none',
                  }}
                >
                  {markerLabel(pi, mainMarkerStyle)}
                </span>
              )}

              {isOpen ? (
                <input
                  value={ponto.text}
                  onChange={e => patch(ponto.id, { text: e.target.value })}
                  placeholder={`Ponto principal ${pi + 1}…`}
                  style={{
                    flex: 1, background: 'transparent', border: 'none',
                    color: 'var(--text-primary)', fontFamily: 'inherit',
                    fontSize: '1rem', fontWeight: 900, outline: 'none', padding: 0,
                    textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.35,
                  }}
                />
              ) : (
                <span
                  onClick={() => toggleExpand(ponto.id)}
                  style={{
                    flex: 1, fontSize: '0.92rem', fontWeight: 800, cursor: 'pointer',
                    color: hasText ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontStyle: hasText ? 'normal' : 'italic',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    textTransform: hasText ? 'uppercase' : 'none',
                    letterSpacing: hasText ? '0.015em' : 0,
                  }}
                >
                  {ponto.text || `Ponto ${pi + 1}`}
                </span>
              )}

              {!isOpen && subCount > 0 && (
                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', flexShrink: 0, opacity: 0.6 }}>
                  {subCount}
                </span>
              )}

              {/* Note dot at rest */}
              {pontoHasNote && !pontoNoteOpen && !showPontoActions && (
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: AI_COLOR, flexShrink: 0, opacity: 0.5 }} />
              )}

              {/* Hover actions */}
              {showPontoActions && (
                <>
                  <button
                    onClick={() => toggleNote(pontoNoteKey)}
                    title={pontoHasNote ? 'Nota de apoio (preenchida)' : 'Adicionar nota'}
                    style={{
                      background: pontoNoteOpen ? `${AI_COLOR}18` : 'transparent',
                      border: 'none', borderRadius: '3px',
                      padding: '0.14rem 0.26rem', cursor: 'pointer',
                      color: pontoNoteOpen ? AI_COLOR : pontoHasNote ? `${AI_COLOR}80` : 'var(--text-muted)',
                      fontSize: '0.7rem', lineHeight: 1, flexShrink: 0,
                    }}
                  >✎</button>

                  <button
                    onMouseDown={e => { e.stopPropagation(); setOpenPontoMenuId(isPontoMenu ? null : ponto.id) }}
                    style={{
                      background: 'transparent', border: 'none', borderRadius: '3px',
                      padding: '0.14rem 0.22rem', cursor: 'pointer',
                      color: isPontoMenu ? 'var(--text-secondary)' : 'var(--text-muted)',
                      fontSize: '0.95rem', lineHeight: 1, flexShrink: 0,
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    onMouseLeave={e => { if (!isPontoMenu) e.currentTarget.style.color = 'var(--text-muted)' }}
                  >⋯</button>

                  {isPontoMenu && (
                    <ContextMenu
                      items={pontoMenuItems}
                      onClose={() => setOpenPontoMenuId(null)}
                      style={{ top: 'calc(100% + 4px)', right: '0.4rem' }}
                    />
                  )}
                </>
              )}
            </div>

            {/* Note — ponto principal */}
            {pontoNoteOpen && (
              <div style={{ padding: '0 0.6rem 0.5rem' }}>
                <NoteArea
                  value={ponto.notes ?? ''}
                  onChange={v => patch(ponto.id, { notes: v })}
                  onAskAI={onAskAI}
                  aiPrompt={`Escreva notas de apoio para o ponto "${ponto.text || 'principal'}" do sermão de ${ref}. Argumento teológico, evidência textual, observação exegética e lembrete pastoral.`}
                  color={AI_COLOR}
                />
              </div>
            )}

            {/* ── Ponto body */}
            {isOpen && (
              <div style={{ padding: '0.6rem 0.7rem 0.72rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>

                {/* Subpontos */}
                <div>
                  <div
                    onMouseEnter={() => setHoveredSection(`${ponto.id}:subs`)}
                    onMouseLeave={() => setHoveredSection(null)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', minHeight: '18px' }}
                  >
                    <span style={secLabel}>Subpontos</span>
                    {(hoveredSection === `${ponto.id}:subs` || isPontoHovered) && (
                      <div style={{ display: 'flex', gap: '0.2rem' }}>
                        {ghostBtn('✦ IA', () => aiSubpontos(ponto))}
                        {ghostBtn('+ Adicionar Subponto', () => addSubponto(ponto.id))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {ponto.subpontos.map((sub, si) => {
                      const subNoteKey   = `${ponto.id}:sub:${sub.id}`
                      const subNoteOpen  = openNotes.has(subNoteKey)
                      const subHasNote   = !!(sub.notes?.trim())
                      const isSubHovered = hoveredSubId === sub.id
                      const isSubMenu    = openSubMenuId === sub.id
                      const showSubActions = isSubHovered || isSubMenu || subNoteOpen

                      const subMenuItems: CtxItem[] = [
                        { icon: '✦', label: 'Gerar com IA',           action: () => aiSubponto(ponto, sub) },
                        { icon: '✎', label: 'Nota de apoio',           action: () => { if (!subNoteOpen) toggleNote(subNoteKey) } },
                        { divider: true },
                        { icon: '↑', label: 'Mover para cima',         action: () => moveSub(ponto.id, sub.id, 'up'),   disabled: si === 0 },
                        { icon: '↓', label: 'Mover para baixo',        action: () => moveSub(ponto.id, sub.id, 'down'), disabled: si === ponto.subpontos.length - 1 },
                        { icon: '↗', label: 'Promover a Ponto Principal', action: () => promoteSub(ponto.id, sub.id) },
                        { divider: true },
                        { label: 'Excluir', action: () => removeSub(ponto.id, sub.id), danger: true },
                      ]

                      return (
                        <div key={sub.id}>
                          <div
                            onMouseEnter={() => setHoveredSubId(sub.id)}
                            onMouseLeave={() => setHoveredSubId(null)}
                            style={{
                              position: 'relative',
                              display: 'flex', alignItems: 'center', gap: '0.28rem',
                              padding: '0.16rem 0.28rem',
                              borderRadius: '4px',
                              background: showSubActions ? 'rgba(255,255,255,0.025)' : 'transparent',
                              transition: 'background 0.1s',
                            }}
                          >
                            {subMarkerStyle !== 'none' && (
                              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', width: '22px', textAlign: 'right', flexShrink: 0, lineHeight: 1 }}>
                                {markerLabel(si, subMarkerStyle)}
                              </span>
                            )}

                            <input
                              value={sub.text}
                              onChange={e => patchSub(ponto.id, sub.id, { text: e.target.value })}
                              placeholder={`Subponto ${si + 1}…`}
                              style={{
                                flex: 1, background: 'transparent', border: 'none',
                                color: 'var(--text-primary)', fontFamily: 'inherit',
                                fontSize: '0.85rem', outline: 'none', padding: '0.1rem 0',
                              }}
                            />

                            {/* Note dot — only at complete rest */}
                            {subHasNote && !subNoteOpen && !showSubActions && (
                              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: AI_COLOR, flexShrink: 0, opacity: 0.55 }} />
                            )}

                            {/* Hover actions */}
                            {showSubActions && (
                              <>
                                <button
                                  onClick={() => toggleNote(subNoteKey)}
                                  title={subHasNote ? 'Nota de apoio (preenchida)' : 'Adicionar nota'}
                                  style={{
                                    background: subNoteOpen ? `${AI_COLOR}18` : 'transparent',
                                    border: 'none', borderRadius: '3px',
                                    padding: '0.12rem 0.22rem', cursor: 'pointer',
                                    color: subNoteOpen ? AI_COLOR : subHasNote ? `${AI_COLOR}80` : 'var(--text-muted)',
                                    fontSize: '0.68rem', lineHeight: 1, flexShrink: 0,
                                  }}
                                >✎</button>

                                <button
                                  onMouseDown={e => { e.stopPropagation(); setOpenSubMenuId(isSubMenu ? null : sub.id) }}
                                  style={{
                                    background: 'transparent', border: 'none', borderRadius: '3px',
                                    padding: '0.12rem 0.18rem', cursor: 'pointer',
                                    color: isSubMenu ? 'var(--text-secondary)' : 'var(--text-muted)',
                                    fontSize: '0.9rem', lineHeight: 1, flexShrink: 0,
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                                  onMouseLeave={e => { if (!isSubMenu) e.currentTarget.style.color = 'var(--text-muted)' }}
                                >⋯</button>

                                {isSubMenu && (
                                  <ContextMenu
                                    items={subMenuItems}
                                    onClose={() => setOpenSubMenuId(null)}
                                    style={{ top: 'calc(100% + 2px)', right: 0 }}
                                  />
                                )}
                              </>
                            )}
                          </div>

                          {subNoteOpen && (
                            <div style={{ marginLeft: '26px', marginRight: '4px' }}>
                              <NoteArea
                                value={sub.notes ?? ''}
                                onChange={v => patchSub(ponto.id, sub.id, { notes: v })}
                                onAskAI={onAskAI}
                                aiPrompt={`Escreva notas de apoio para o subponto "${sub.text || 'este subponto'}" dentro do ponto "${ponto.text || 'principal'}" do sermão de ${ref}. Explicação, argumento, citação e como desenvolver oralmente.`}
                                color={AI_COLOR}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {ponto.subpontos.length === 0 && (
                      <button
                        onClick={() => addSubponto(ponto.id)}
                        style={{
                          background: 'transparent', border: '1px dashed var(--border-subtle)',
                          borderRadius: '4px', color: 'var(--text-muted)', cursor: 'pointer',
                          fontFamily: 'inherit', fontSize: '0.78rem', padding: '0.26rem 0.5rem',
                          textAlign: 'left', marginTop: '0.15rem',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = AI_COLOR; e.currentTarget.style.color = AI_COLOR }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                      >
                        + Adicionar Subponto
                      </button>
                    )}
                  </div>
                </div>

                {isPontoHovered && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.35rem',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.52rem',
                    }}
                  >
                    {ghostBtn('+ Adicionar Ilustração', () => addElement(ponto.id, 'ilustracoes'))}
                    {ghostBtn('+ Adicionar Aplicação', () => addElement(ponto.id, 'aplicacoes'), '#6db8a0')}
                    {ghostBtn('+ Adicionar Citação', () => addElement(ponto.id, 'citacoes'))}
                    {ghostBtn('+ Adicionar Observação', () => addElement(ponto.id, 'observacoes'))}
                  </div>
                )}

                {renderElementSection(ponto, 'ilustracoes')}
                {renderElementSection(ponto, 'aplicacoes')}
                {renderElementSection(ponto, 'citacoes')}
                {renderElementSection(ponto, 'observacoes')}

              </div>
            )}
          </div>
        )
      })}

      {/* ── Footer */}
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.25rem', flexWrap: 'wrap' }}>
        <button
          onClick={addPonto}
          style={{
            background: 'transparent', border: '1px dashed var(--border)',
            borderRadius: '5px', color: 'var(--text-muted)',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem',
            padding: '0.3rem 0.7rem',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = AI_COLOR; e.currentTarget.style.color = AI_COLOR }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          + Ponto Principal
        </button>
        <button
          onClick={aiRevisao}
          style={{
            background: 'transparent', border: '1px solid var(--border-subtle)',
            borderRadius: '5px', color: 'var(--text-muted)',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem',
            padding: '0.3rem 0.7rem',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = AI_COLOR; e.currentTarget.style.color = AI_COLOR }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          Revisar coerência
        </button>
      </div>
    </div>
  )
}
