'use client'

import { useState, useRef, useCallback } from 'react'
import MarkdownRenderer from './MarkdownRenderer'

export interface AIContext {
  project: {
    id: string
    book: string
    passage_ref: string
    testament: string
    original_language: string
    study_mode?: string
  }
  phase?: string
  phaseLabel?: string
  section?: string
  sectionLabel?: string
  field?: string
  fieldLabel?: string
  userId: string
}

interface Props {
  context: AIContext
  currentContent: string
  onInsert: (html: string) => void
  onReplace: (html: string) => void
  onAppend: (html: string) => void
  onClose: () => void
}

// ── Quick actions ─────────────────────────────────────────────────────────────

const UNIVERSAL: { label: string; prompt: string }[] = [
  { label: 'Desenvolver',            prompt: 'Desenvolva este conteúdo com mais profundidade e detalhes exegéticos.' },
  { label: 'Melhorar',               prompt: 'Melhore a qualidade, clareza e precisão deste conteúdo.' },
  { label: 'Resumir',                prompt: 'Resuma este conteúdo de forma concisa e clara.' },
  { label: 'Expandir',               prompt: 'Expanda com mais detalhes, evidências e referências.' },
  { label: 'Explicar',               prompt: 'Explique este conteúdo de forma mais clara e acessível.' },
  { label: 'Corrigir',               prompt: 'Corrija erros e aprimore a precisão deste conteúdo.' },
  { label: 'Exemplificar',           prompt: 'Adicione exemplos concretos para ilustrar este conteúdo.' },
  { label: 'Aplicar',                prompt: 'Desenvolva aplicações práticas para a vida cristã contemporânea.' },
  { label: 'Referências bíblicas',   prompt: 'Encontre referências bíblicas relevantes para este conteúdo.' },
  { label: 'Relacionar com Cristo',  prompt: 'Relacione este conteúdo com Cristo, o evangelho e a redenção.' },
  { label: 'Teologia Bíblica',       prompt: 'Relacione com a teologia bíblica e a progressão revelacional.' },
  { label: 'Teologia Sistemática',   prompt: 'Relacione com as doutrinas da teologia sistemática reformada.' },
]

const PHASE_ACTIONS: Record<string, { label: string; prompt: string }[]> = {
  preparar: [
    { label: 'Gerar oração',               prompt: 'Gere uma oração pastoral para abertura deste estudo bíblico.' },
    { label: 'Perguntas iniciais',          prompt: 'Gere perguntas iniciais de observação e contemplação para esta passagem.' },
    { label: 'Gerar observações',           prompt: 'Gere observações iniciais sobre o texto desta passagem.' },
    { label: 'Primeiras impressões',        prompt: 'Descreva as primeiras impressões e impacto desta passagem.' },
  ],
  investigar: [
    { label: 'Contexto histórico',          prompt: 'Descreva o contexto histórico desta passagem com rigor acadêmico.' },
    { label: 'Contexto cultural',           prompt: 'Descreva o contexto cultural e social relevante para esta passagem.' },
    { label: 'Análise do autor',            prompt: 'Analise o autor, suas intenções e perspectiva nesta passagem.' },
    { label: 'Propósito do livro',          prompt: 'Explique o propósito do livro e como esta passagem se encaixa.' },
    { label: 'Gerar estrutura',             prompt: 'Proponha a estrutura literária e o esboço desta passagem.' },
    { label: 'Termos-chave',                prompt: 'Identifique e explique os termos-chave originais desta passagem.' },
    { label: 'Análise teológica',           prompt: 'Analise as principais questões teológicas desta passagem.' },
    { label: 'Paralelos bíblicos',          prompt: 'Encontre e analise paralelos bíblicos relevantes.' },
  ],
  comunicar: [
    { label: 'Gerar introdução',            prompt: 'Gere uma introdução impactante para o sermão desta passagem.' },
    { label: 'Gerar ilustração',            prompt: 'Gere uma ilustração relevante e memorável para este ponto.' },
    { label: 'Gerar aplicação',             prompt: 'Desenvolva aplicações práticas e específicas para a congregação.' },
    { label: 'Gerar conclusão',             prompt: 'Gere uma conclusão que convoque à ação e glorifique a Cristo.' },
    { label: 'Gerar transição',             prompt: 'Gere uma transição fluida para o próximo ponto do sermão.' },
    { label: 'Gerar esboço',               prompt: 'Gere um esboço homilético completo para esta passagem.' },
    { label: 'Sermão completo',             prompt: 'Gere um sermão completo, estruturado e cristocêntrico para esta passagem.' },
  ],
  ferramentas: [
    { label: 'Analise o termo',             prompt: 'Analise este termo em seu contexto original e bíblico.' },
    { label: 'Etimologia',                  prompt: 'Explique a etimologia e o campo semântico deste termo.' },
    { label: 'Paralelos canônicos',         prompt: 'Liste paralelos canônicos e sua progressão revelacional.' },
  ],
}

// ── Markdown → HTML (básico, para inserção no TipTap) ────────────────────────

function mdToHtml(text: string): string {
  const paragraphs = text.trim().split(/\n\n+/)
  return paragraphs.map(p => {
    const lines = p.trim().split('\n')
    if (lines.length > 1 && lines.every(l => /^[-•*]\s/.test(l))) {
      return `<ul>${lines.map(l => `<li>${inlineMd(l.replace(/^[-•*]\s+/, ''))}</li>`).join('')}</ul>`
    }
    if (lines.length > 1 && lines.every(l => /^\d+\.\s/.test(l))) {
      return `<ol>${lines.map(l => `<li>${inlineMd(l.replace(/^\d+\.\s+/, ''))}</li>`).join('')}</ol>`
    }
    if (/^#{1,3}\s/.test(lines[0])) {
      const level = lines[0].match(/^(#+)/)?.[1].length ?? 2
      const tag = `h${Math.min(level + 1, 4)}`
      return `<${tag}>${inlineMd(lines[0].replace(/^#+\s+/, ''))}</${tag}>${lines.slice(1).map(l => `<p>${inlineMd(l)}</p>`).join('')}`
    }
    return `<p>${lines.map(inlineMd).join('<br/>')}</p>`
  }).join('')
}

function inlineMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 600)
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AIAssistantPanel({ context, currentContent, onInsert, onReplace, onAppend, onClose }: Props) {
  const [response, setResponse] = useState('')
  const [loading, setLoading]   = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [error, setError]       = useState('')
  const [copied, setCopied]     = useState(false)
  const streamBuffer            = useRef('')
  const responseRef             = useRef<HTMLDivElement>(null)

  const phaseActions = PHASE_ACTIONS[context.phase ?? ''] ?? []

  const buildSystemContext = useCallback(() => {
    const parts = [
      `Projeto: ${context.project.book} ${context.project.passage_ref}`,
      context.phaseLabel ? `Etapa: ${context.phaseLabel}` : '',
      context.sectionLabel ? `Seção: ${context.sectionLabel}` : '',
      context.fieldLabel  ? `Campo: ${context.fieldLabel}` : '',
      currentContent.trim() ? `\n\nConteúdo atual do campo:\n${stripHtml(currentContent)}` : '',
    ].filter(Boolean)
    return parts.join('\n')
  }, [context, currentContent])

  const send = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || loading) return
    setLoading(true)
    setError('')
    setResponse('')
    streamBuffer.current = ''

    const fullMessage = `${buildSystemContext()}\n\n${userMessage}`

    try {
      const res = await fetch('/api/claude/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: fullMessage }],
          project: context.project,
          activeSlug: context.section ?? 'investigar_visao_geral',
          activeTitle: context.sectionLabel ?? context.phaseLabel ?? 'Assistente',
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erro na API' }))
        setError(err.error ?? 'Erro. Tente novamente.')
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') continue
          try {
            const delta = JSON.parse(data).delta?.text ?? ''
            streamBuffer.current += delta
            setResponse(streamBuffer.current)
            setTimeout(() => { responseRef.current?.scrollTo({ top: responseRef.current.scrollHeight }) }, 0)
          } catch { /* ignore */ }
        }
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [context, currentContent, buildSystemContext, loading])

  function handleInsert()  { if (response) { onInsert(mdToHtml(response));  setResponse('') } }
  function handleReplace() { if (response) { onReplace(mdToHtml(response)); setResponse('') } }
  function handleAppend()  { if (response) { onAppend(mdToHtml(response));  setResponse('') } }
  function handleCopy()    {
    if (!response) return
    navigator.clipboard.writeText(response).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }).catch(() => {})
  }

  const hasResponse = response.trim().length > 0

  const btnStyle = (active = false): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    background: active ? '#EEF2FF' : '#F8FAFC',
    border: `1px solid ${active ? '#C7D2FE' : '#E2E8F0'}`,
    borderRadius: '7px', padding: '0.38rem 0.65rem',
    fontSize: '0.74rem', fontWeight: 500, color: active ? '#4F46E5' : '#475569',
    cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
    transition: 'all 0.12s', flexShrink: 0,
  })

  const phaseColor = context.phase === 'preparar'
    ? '#0F766E' : context.phase === 'investigar'
    ? '#163A6B' : context.phase === 'comunicar'
    ? '#7C3AED' : '#6366F1'

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0,
      width: '420px', zIndex: 5000,
      background: '#FFFFFF',
      borderLeft: '1px solid #E2E8F0',
      boxShadow: '-8px 0 32px rgba(0,0,0,0.09), -2px 0 6px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'inherit',
      animation: 'slideInRight 0.18s ease-out',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        padding: '0.85rem 1rem 0.75rem',
        borderBottom: '1px solid #F1F5F9',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '1rem' }}>✨</span>
        <span style={{ flex: 1, fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
          Assistente IA
        </span>
        <button
          onClick={onClose}
          style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#94A3B8', borderRadius: '6px' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#475569' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8' }}
        >✕</button>
      </div>

      {/* Context pill */}
      <div style={{
        padding: '0.55rem 1rem',
        borderBottom: '1px solid #F1F5F9',
        background: `${phaseColor}07`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: phaseColor, letterSpacing: '-0.01em' }}>
            {context.project.book} {context.project.passage_ref}
          </span>
          {context.phaseLabel && <>
            <span style={{ fontSize: '0.7rem', color: '#CBD5E1' }}>›</span>
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{context.phaseLabel}</span>
          </>}
          {context.sectionLabel && <>
            <span style={{ fontSize: '0.7rem', color: '#CBD5E1' }}>›</span>
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{context.sectionLabel}</span>
          </>}
          {context.fieldLabel && <>
            <span style={{ fontSize: '0.7rem', color: '#CBD5E1' }}>›</span>
            <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{context.fieldLabel}</span>
          </>}
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* Quick actions — universal */}
        <div style={{ padding: '0.75rem 1rem 0.5rem' }}>
          <p style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Ações rápidas
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {UNIVERSAL.map(a => (
              <button
                key={a.label}
                onClick={() => send(a.prompt)}
                disabled={loading}
                style={{ ...btnStyle(), opacity: loading ? 0.5 : 1 }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = '#94A3B8'; e.currentTarget.style.color = '#1E293B' } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569' }}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Phase-specific actions */}
        {phaseActions.length > 0 && (
          <div style={{ padding: '0.5rem 1rem 0.75rem' }}>
            <p style={{ fontSize: '0.62rem', fontWeight: 700, color: phaseColor, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.5rem', opacity: 0.8 }}>
              {context.phaseLabel ?? 'Módulo'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {phaseActions.map(a => (
                <button
                  key={a.label}
                  onClick={() => send(a.prompt)}
                  disabled={loading}
                  style={{ ...btnStyle(), borderColor: `${phaseColor}30`, color: phaseColor, background: `${phaseColor}08`, opacity: loading ? 0.5 : 1 }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = `${phaseColor}14`; e.currentTarget.style.borderColor = `${phaseColor}50` } }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${phaseColor}08`; e.currentTarget.style.borderColor = `${phaseColor}30` }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Response area */}
        {(loading || hasResponse || error) && (
          <div style={{
            margin: '0 1rem 0.75rem',
            border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden',
            background: '#FAFAFA',
          }}>
            {/* Response content */}
            <div
              ref={responseRef}
              style={{
                maxHeight: '320px', overflowY: 'auto',
                padding: '0.75rem 0.85rem',
              }}
            >
              {error && (
                <p style={{ fontSize: '0.78rem', color: '#EF4444', margin: 0 }}>{error}</p>
              )}
              {loading && !response && (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '0.5rem 0' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: phaseColor, opacity: 0.4,
                      animation: `dot-bounce 1s ease-in-out ${i * 0.15}s infinite`,
                    }} />
                  ))}
                </div>
              )}
              {response && (
                <div style={{ fontSize: '0.83rem' }}>
                  <MarkdownRenderer content={response} moduleColor={phaseColor} />
                </div>
              )}
            </div>

            {/* Insert actions */}
            {hasResponse && !loading && (
              <div style={{
                display: 'flex', gap: '0.35rem', flexWrap: 'wrap',
                padding: '0.5rem 0.75rem',
                borderTop: '1px solid #F1F5F9',
                background: '#FFFFFF',
              }}>
                <button
                  onClick={handleInsert}
                  style={{ ...btnStyle(true), background: phaseColor, color: '#fff', borderColor: phaseColor }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                >
                  Inserir
                </button>
                <button onClick={handleReplace} style={btnStyle()}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#94A3B8'; e.currentTarget.style.color = '#1E293B' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569' }}
                >
                  Substituir
                </button>
                <button onClick={handleAppend} style={btnStyle()}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#94A3B8'; e.currentTarget.style.color = '#1E293B' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569' }}
                >
                  Adicionar abaixo
                </button>
                <button onClick={handleCopy} style={{ ...btnStyle(), marginLeft: 'auto' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#94A3B8' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0' }}
                >
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />
      </div>

      {/* Chat input */}
      <div style={{
        padding: '0.65rem 1rem',
        borderTop: '1px solid #F1F5F9',
        flexShrink: 0,
        background: '#FAFAFA',
      }}>
        <div style={{
          display: 'flex', gap: '0.4rem', alignItems: 'flex-end',
          background: '#FFFFFF', border: '1px solid #E2E8F0',
          borderRadius: '10px', padding: '0.5rem 0.65rem',
          transition: 'border-color 0.12s',
        }}
          onFocus={() => {}}
        >
          <textarea
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (chatInput.trim()) { send(chatInput.trim()); setChatInput('') }
              }
            }}
            placeholder="Pergunte algo sobre esta seção…"
            rows={2}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              resize: 'none', fontFamily: 'inherit', fontSize: '0.82rem',
              color: '#1E293B', lineHeight: 1.5,
            }}
          />
          <button
            onClick={() => { if (chatInput.trim()) { send(chatInput.trim()); setChatInput('') } }}
            disabled={!chatInput.trim() || loading}
            style={{
              flexShrink: 0, width: '30px', height: '30px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: chatInput.trim() && !loading ? phaseColor : '#E2E8F0',
              border: 'none', borderRadius: '7px', cursor: chatInput.trim() && !loading ? 'pointer' : 'default',
              fontSize: '0.8rem', color: chatInput.trim() && !loading ? '#fff' : '#94A3B8',
              transition: 'all 0.12s',
            }}
          >
            ↑
          </button>
        </div>
        <p style={{ fontSize: '0.62rem', color: '#CBD5E1', marginTop: '0.35rem', textAlign: 'center' }}>
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
