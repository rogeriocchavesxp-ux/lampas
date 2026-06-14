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

// ── Avaliar prompt ────────────────────────────────────────────────────────────

const AVALIAR_PROMPT = `Avalie o conteúdo atual sem alterar, reescrever ou corrigir o texto. Atue como professor ou editor especializado.

Apresente a avaliação neste formato:

## NOTA GERAL
(Nota de 0–10 com avaliação sintética em uma linha)

## Pontos Fortes
(Clareza, fidelidade bíblica, consistência argumentativa, precisão teológica, aplicabilidade)

## Pontos Fracos
(Dimensões que precisam melhorar)

## Oportunidades de Aprimoramento
(Sugestões específicas e concretas considerando o contexto atual: projeto, etapa, seção e campo)

## Recomendação Final
(Próximo passo mais importante)

Após a avaliação, inclua exatamente este bloco JSON com os itens de melhoria acionáveis (entre 3 e 7 itens):

\`\`\`json
{"items":[{"title":"título curto da melhoria","problem":"descrição objetiva do problema","justification":"por que isso importa para o sermão/texto","suggestion":"sugestão prática e específica de correção"}]}
\`\`\`

Gere somente o JSON após a avaliação, sem texto adicional depois do bloco.`

// ── Action groups ─────────────────────────────────────────────────────────────

interface ActionGroup {
  id: string
  label: string
  color: string
  actions: { label: string; prompt: string; highlight?: boolean }[]
}

const ACTION_GROUPS: ActionGroup[] = [
  {
    id: 'compreender',
    label: 'Compreender',
    color: '#0D9488',
    actions: [
      { label: 'Explicar',             prompt: 'Explique este conteúdo de forma mais clara e acessível.' },
      { label: 'Exemplificar',         prompt: 'Adicione exemplos concretos para ilustrar este conteúdo.' },
      { label: 'Resumir',              prompt: 'Resuma este conteúdo de forma concisa e clara.' },
      { label: 'Expandir',             prompt: 'Expanda com mais detalhes, evidências e referências.' },
      { label: 'Referências Bíblicas', prompt: 'Encontre referências bíblicas relevantes para este conteúdo.' },
    ],
  },
  {
    id: 'analisar',
    label: 'Analisar',
    color: '#D97706',
    actions: [
      { label: 'Avaliar',              prompt: AVALIAR_PROMPT, highlight: true },
      { label: 'Corrigir',             prompt: 'Corrija erros e aprimore a precisão deste conteúdo.' },
      { label: 'Melhorar',             prompt: 'Melhore a qualidade, clareza e precisão deste conteúdo.' },
      { label: 'Relacionar com Cristo', prompt: 'Relacione este conteúdo com Cristo, o evangelho e a redenção.' },
    ],
  },
  {
    id: 'investigar',
    label: 'Investigar',
    color: '#163A6B',
    actions: [
      { label: 'Contexto Histórico',  prompt: 'Descreva o contexto histórico desta passagem com rigor acadêmico.' },
      { label: 'Contexto Cultural',   prompt: 'Descreva o contexto cultural e social relevante para esta passagem.' },
      { label: 'Análise do Autor',    prompt: 'Analise o autor, suas intenções e perspectiva nesta passagem.' },
      { label: 'Propósito do Livro',  prompt: 'Explique o propósito do livro e como esta passagem se encaixa.' },
      { label: 'Gerar Estrutura',     prompt: 'Proponha a estrutura literária e o esboço desta passagem.' },
      { label: 'Termos-Chave',        prompt: 'Identifique e explique os termos-chave originais desta passagem.' },
      { label: 'Paralelos Bíblicos',  prompt: 'Encontre e analise paralelos bíblicos relevantes.' },
      { label: 'Análise Teológica',   prompt: 'Analise as principais questões teológicas desta passagem.' },
    ],
  },
  {
    id: 'teologia',
    label: 'Teologia',
    color: '#7C3AED',
    actions: [
      { label: 'Teologia Bíblica',     prompt: 'Relacione com a teologia bíblica e a progressão revelacional.' },
      { label: 'Teologia Sistemática', prompt: 'Relacione com as doutrinas da teologia sistemática reformada.' },
    ],
  },
  {
    id: 'produzir',
    label: 'Produzir',
    color: '#059669',
    actions: [
      { label: 'Gerar Introdução',  prompt: 'Gere uma introdução impactante para o sermão desta passagem.' },
      { label: 'Gerar Transição',   prompt: 'Gere uma transição fluida para o próximo ponto do sermão.' },
      { label: 'Gerar Ilustração',  prompt: 'Gere uma ilustração relevante e memorável para este ponto.' },
      { label: 'Gerar Aplicação',   prompt: 'Desenvolva aplicações práticas e específicas para a congregação.' },
      { label: 'Gerar Conclusão',   prompt: 'Gere uma conclusão que convoque à ação e glorifique a Cristo.' },
      { label: 'Gerar Esboço',      prompt: 'Gere um esboço homilético completo para esta passagem.' },
      { label: 'Sermão Completo',   prompt: 'Gere um sermão completo, estruturado e cristocêntrico para esta passagem.' },
    ],
  },
]

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
  const [response, setResponse]         = useState('')
  const [loading, setLoading]           = useState(false)
  const [chatInput, setChatInput]       = useState('')
  const [error, setError]               = useState('')
  const [copied, setCopied]             = useState(false)
  const [activeGroup, setActiveGroup]   = useState<string | null>(null)
  const [savedCount, setSavedCount]     = useState<number | null>(null)
  const streamBuffer                    = useRef('')
  const responseRef                     = useRef<HTMLDivElement>(null)

  const buildSystemContext = useCallback(() => {
    const parts = [
      `Projeto: ${context.project.book} ${context.project.passage_ref}`,
      context.phaseLabel   ? `Etapa: ${context.phaseLabel}`   : '',
      context.sectionLabel ? `Seção: ${context.sectionLabel}` : '',
      context.fieldLabel   ? `Campo: ${context.fieldLabel}`   : '',
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
    const activeSlug  = context.section ?? 'investigar_visao_geral'
    const activeTitle = context.sectionLabel ?? context.phaseLabel ?? 'Assistente'

    const t0 = Date.now()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 90_000)

    const payload = {
      messages: [{ role: 'user', content: fullMessage }],
      project: context.project,
      activeSlug,
      activeTitle,
    }
    console.log('[AIAssistantPanel] enviando para /api/claude/stream', { activeSlug, activeTitle })

    try {
      const res = await fetch('/api/claude/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      console.log('[AIAssistantPanel] status:', res.status, Date.now() - t0, 'ms')

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        console.error('[AIAssistantPanel] erro HTTP:', res.status, err)
        setError(err.error ?? `Erro ${res.status}. Tente novamente.`)
        return
      }

      if (!res.body) {
        console.error('[AIAssistantPanel] res.body é null')
        setError('Resposta inválida do servidor.')
        return
      }

      const reader = res.body.getReader()
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
            const parsed = JSON.parse(data)
            if (parsed.error) {
              console.error('[AIAssistantPanel] erro no stream:', parsed.error)
              setError(`Erro da IA: ${parsed.error}`)
              return
            }
            const delta = parsed.delta?.text ?? ''
            streamBuffer.current += delta
            setResponse(streamBuffer.current)
            setTimeout(() => { responseRef.current?.scrollTo({ top: responseRef.current.scrollHeight }) }, 0)
          } catch { /* ignore SSE parse errors */ }
        }
      }
      console.log('[AIAssistantPanel] stream concluído em', Date.now() - t0, 'ms')

      // Extract JSON checklist block if present (Avaliar action)
      const fullText = streamBuffer.current
      const jsonMatch = fullText.match(/```json\s*(\{[\s\S]*?\})\s*```/)
      if (jsonMatch) {
        const cleanText = fullText.replace(/```json[\s\S]*?```/g, '').trim()
        setResponse(cleanText)
        streamBuffer.current = cleanText
        try {
          const parsed = JSON.parse(jsonMatch[1]) as { items: { title: string; problem?: string; justification?: string; suggestion?: string }[] }
          if (Array.isArray(parsed.items) && parsed.items.length > 0) {
            const res = await fetch('/api/improvement', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                project_id:    context.project.id,
                section_slug:  context.section  ?? null,
                section_label: context.sectionLabel ?? context.phaseLabel ?? null,
                field_label:   context.fieldLabel ?? null,
                items:         parsed.items,
              }),
            })
            if (res.ok) {
              setSavedCount(parsed.items.length)
              window.dispatchEvent(new CustomEvent('lampas:checklist-updated'))
              setTimeout(() => setSavedCount(null), 6000)
            }
          }
        } catch {
          console.warn('[AIAssistantPanel] Falha ao parsear JSON do checklist')
        }
      }
    } catch (err) {
      const isTimeout = err instanceof DOMException && err.name === 'AbortError'
      const msg = isTimeout
        ? 'Tempo limite excedido (90s). Tente novamente.'
        : err instanceof Error ? `Erro de conexão: ${err.message}` : 'Erro de conexão. Tente novamente.'
      console.error('[AIAssistantPanel] catch:', err, 'duração:', Date.now() - t0, 'ms')
      setError(msg)
    } finally {
      clearTimeout(timeout)
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

  const phaseColor = context.phase === 'preparar'
    ? '#0F766E' : context.phase === 'investigar'
    ? '#163A6B' : context.phase === 'comunicar'
    ? '#7C3AED' : '#6366F1'

  // ── Button style helpers ──────────────────────────────────────────────────

  function actionBtnStyle(groupColor: string, highlight = false): React.CSSProperties {
    return {
      display: 'flex', alignItems: 'center', gap: '0.3rem',
      background: highlight ? `${groupColor}0D` : '#F8FAFC',
      border: `1px solid ${highlight ? `${groupColor}35` : '#E2E8F0'}`,
      borderRadius: '7px', padding: '0.35rem 0.6rem',
      fontSize: '0.74rem', fontWeight: highlight ? 600 : 500,
      color: highlight ? groupColor : '#475569',
      cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
      transition: 'all 0.12s', flexShrink: 0,
      opacity: loading ? 0.5 : 1,
    }
  }

  function insertBtnStyle(primary = false): React.CSSProperties {
    return {
      display: 'flex', alignItems: 'center', gap: '0.35rem',
      background: primary ? phaseColor : '#F8FAFC',
      border: `1px solid ${primary ? phaseColor : '#E2E8F0'}`,
      borderRadius: '7px', padding: '0.38rem 0.65rem',
      fontSize: '0.74rem', fontWeight: 500,
      color: primary ? '#fff' : '#475569',
      cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
      transition: 'all 0.12s', flexShrink: 0,
    }
  }

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

      {/* ── Header ── */}
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

      {/* ── Context pill ── */}
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

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* ── Action groups ── */}
        <div style={{ padding: '0.85rem 1rem 0.5rem' }}>
          {ACTION_GROUPS.map((group, gIdx) => {
            const isExpanded = activeGroup === null || activeGroup === group.id
            return (
              <div key={group.id} style={{ marginBottom: gIdx < ACTION_GROUPS.length - 1 ? '1rem' : '0.4rem' }}>

                {/* Group header */}
                <button
                  type="button"
                  onClick={() => setActiveGroup(prev => prev === group.id ? null : group.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    width: '100%', background: 'none', border: 'none',
                    cursor: 'pointer', padding: '0 0 0.45rem 0',
                    marginBottom: isExpanded ? '0.45rem' : 0,
                  }}
                >
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 800,
                    color: group.color,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}>
                    {group.label}
                  </span>
                  <div style={{ flex: 1, height: '1px', background: `${group.color}22` }} />
                  <span style={{
                    fontSize: '0.55rem', color: group.color, opacity: 0.6,
                    transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform 0.15s',
                    lineHeight: 1,
                  }}>▾</span>
                </button>

                {/* Group buttons */}
                {isExpanded && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {group.actions.map(a => (
                      <button
                        key={a.label}
                        onClick={() => send(a.prompt)}
                        disabled={loading}
                        style={actionBtnStyle(group.color, a.highlight)}
                        onMouseEnter={e => {
                          if (loading) return
                          e.currentTarget.style.borderColor = `${group.color}55`
                          e.currentTarget.style.color = group.color
                          e.currentTarget.style.background = `${group.color}0D`
                        }}
                        onMouseLeave={e => {
                          if (a.highlight) {
                            e.currentTarget.style.borderColor = `${group.color}35`
                            e.currentTarget.style.color = group.color
                            e.currentTarget.style.background = `${group.color}0D`
                          } else {
                            e.currentTarget.style.borderColor = '#E2E8F0'
                            e.currentTarget.style.color = '#475569'
                            e.currentTarget.style.background = '#F8FAFC'
                          }
                        }}
                      >
                        {a.highlight && <span style={{ fontSize: '0.7rem' }}>⭐</span>}
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Response area ── */}
        {(loading || hasResponse || error) && (
          <div style={{
            margin: '0 1rem 0.75rem',
            border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden',
            background: '#FAFAFA',
          }}>
            <div
              ref={responseRef}
              style={{ maxHeight: '320px', overflowY: 'auto', padding: '0.75rem 0.85rem' }}
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

            {savedCount !== null && (
              <div style={{
                padding: '0.5rem 0.85rem',
                borderTop: '1px solid #F1F5F9',
                background: '#F0FDF4',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}>
                <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 600 }}>
                  ✓ {savedCount} melhoria{savedCount !== 1 ? 's' : ''} salva{savedCount !== 1 ? 's' : ''} no checklist
                </span>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('lampas:open-checklist'))}
                  style={{
                    marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '0.7rem', color: '#16A34A', fontWeight: 700, fontFamily: 'inherit',
                    textDecoration: 'underline', padding: 0,
                  }}
                >
                  Ver checklist →
                </button>
              </div>
            )}

            {hasResponse && !loading && (
              <div style={{
                display: 'flex', gap: '0.35rem', flexWrap: 'wrap',
                padding: '0.5rem 0.75rem',
                borderTop: '1px solid #F1F5F9',
                background: '#FFFFFF',
              }}>
                <button
                  onClick={handleInsert}
                  style={{ ...insertBtnStyle(true) }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                >
                  Inserir
                </button>
                <button onClick={handleReplace} style={insertBtnStyle()}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#94A3B8'; e.currentTarget.style.color = '#1E293B' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569' }}
                >
                  Substituir
                </button>
                <button onClick={handleAppend} style={insertBtnStyle()}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#94A3B8'; e.currentTarget.style.color = '#1E293B' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569' }}
                >
                  Adicionar abaixo
                </button>
                <button onClick={handleCopy} style={{ ...insertBtnStyle(), marginLeft: 'auto' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#94A3B8' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0' }}
                >
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{ flex: 1 }} />
      </div>

      {/* ── Chat input ── */}
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
        }}>
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
              border: 'none', borderRadius: '7px',
              cursor: chatInput.trim() && !loading ? 'pointer' : 'default',
              fontSize: '0.8rem',
              color: chatInput.trim() && !loading ? '#fff' : '#94A3B8',
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
