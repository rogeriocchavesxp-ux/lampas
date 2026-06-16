'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project, Section } from '@/types/database'
import type { BlockType, PrintOutlineMode, SlidePlatform, SlidePresentationType, SlideDeckSize, SlideVisualStyle, SlidePromptSettings, PontoElement, PontoPrincipal, SermonBlock, SermonBuilderContent, Props } from './sermon-builder-types'
import { mkId, markerLabel, defaultPontos, normalizePontos, pontoElements, escapeHtml, renderFormattedText, defaultSlidePromptSettings, buildSlidesPrompt, blockHasContent, dotColor, blockPrompt, BLOCK_TYPES, TYPE_COLOR, DEFAULT_BLOCKS, PRESET_GN39 } from './sermon-builder-types'
import { DesenvolvimentoEditor, RichEditor } from './sermon-builder-components'

// ── SermonBuilderWorkspace ────────────────────────────────────────────────

function buildFinalSermonDocument(blocks: SermonBlock[], project: Project, mode: PrintOutlineMode = 'complete') {
  const ref   = `${project.book} ${project.passage_ref}`
  const title = project.title || `Sermão — ${ref}`
  const esc   = escapeHtml
  const paras = renderFormattedText
  const isReduced = mode === 'reduced'
  const outlineLabel = isReduced ? 'Esboço reduzido para pregação' : 'Esboço completo'

  const pages: string[] = []
  let pontoIdx = 0
  const totalPontos = blocks.filter(b => b.type === 'desenvolvimento').flatMap(b => b.pontos ?? []).length

  pages.push(`<section class="page cover">
    <div class="cover-eyebrow">SERMÃO</div>
    <h1>${esc(title)}</h1>
    <dl class="sermon-meta">
      <div><dt>Título</dt><dd>${esc(title)}</dd></div>
      <div><dt>Texto</dt><dd>${esc(ref)}</dd></div>
      <div><dt>Formato</dt><dd>${esc(outlineLabel)}</dd></div>
    </dl>
    <div class="cover-rule"></div>
  </section>`)

  for (const block of blocks) {
    if (block.type === 'desenvolvimento' && block.pontos?.length) {
      const mainMarkerStyle = block.mainMarkerStyle ?? 'roman'
      const subMarkerStyle = block.subMarkerStyle ?? 'decimal'
      for (const ponto of block.pontos) {
        pontoIdx++
        const subs = ponto.subpontos.filter(s => s.text.trim())
        const ilustracoes = pontoElements(ponto, 'ilustracoes').filter(item => item.text.trim())
        const aplicacoes = pontoElements(ponto, 'aplicacoes').filter(item => item.text.trim())
        const citacoes = pontoElements(ponto, 'citacoes').filter(item => item.text.trim())
        const observacoes = pontoElements(ponto, 'observacoes').filter(item => item.text.trim())
        const renderSubNotes = !isReduced
        const renderItems = (items: PontoElement[], label: string, className: string) => items.map((item, index) => `
          <div class="sep"></div>
          <div class="label">${esc(item.title?.trim() || (items.length > 1 ? `${label} ${index + 1}` : label))}</div>
          <div class="${className}">${paras(item.text)}</div>`
        ).join('')
        const mainMarkerHtml = mainMarkerStyle === 'none'
          ? ''
          : `<div class="main-point-marker">${esc(markerLabel(pontoIdx - 1, mainMarkerStyle))}</div>`
        const subListClass = subMarkerStyle === 'none' ? 'subs subs-none' : 'subs'

        pages.push(`<section class="page">
          <div class="pg-header">
            <span>${esc(ref)}</span>
            <span>${pontoIdx} / ${totalPontos}</span>
          </div>
          <div class="main-point-heading">
            ${mainMarkerHtml}
            <h2>${esc(ponto.text || `Ponto ${pontoIdx}`).toUpperCase()}</h2>
          </div>
          ${!isReduced && ponto.notes?.trim() ? `<div class="label">Descrição do ponto</div><div class="prose point-notes">${paras(ponto.notes)}</div>` : ''}
          ${subs.length ? `<ol class="${subListClass}">${subs.map((s, index) =>
            `<li>${subMarkerStyle === 'none' ? '' : `<span class="sub-number">${esc(markerLabel(index, subMarkerStyle))}</span>`}<div class="sub-content"><strong>${esc(s.text)}</strong>${renderSubNotes && s.notes?.trim() ? `<div class="sub-description">${paras(s.notes)}</div>` : ''}</div></li>`
          ).join('')}</ol>` : ''}
          ${isReduced ? '' : renderItems(ilustracoes, 'Ilustração', 'ilustracao')}
          ${isReduced ? '' : renderItems(aplicacoes, 'Aplicação', 'aplicacao')}
          ${isReduced ? '' : renderItems(citacoes, 'Citação', 'ilustracao')}
          ${isReduced ? '' : renderItems(observacoes, 'Observação', 'ilustracao')}
          <div class="pg-footer">${esc(title)}</div>
        </section>`)
      }
    } else if (block.content.trim()) {
      pages.push(`<section class="page">
        <div class="pg-header"><span>${esc(ref)}</span></div>
        <h2 class="section-title">${esc(block.title)}</h2>
        <div class="prose">${paras(block.content)}</div>
        <div class="pg-footer">${esc(title)}</div>
      </section>`)
    }
  }

  const css = `
.sermon-final-document, .sermon-final-document * { box-sizing: border-box; }
.sermon-final-document {
  font-family: "Times New Roman", Times, serif;
  font-size: 13.5pt;
  color: #111827;
  line-height: 1.75;
}
.sermon-final-document .page {
  width: min(21cm, 100%);
  max-width: 21cm;
  min-height: 29.7cm;
  padding: 2.4cm 3cm 2cm;
  margin: 0 auto 1.5rem;
  background: #fff;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
  page-break-after: always;
  break-after: page;
}
.sermon-final-document .page:last-child { page-break-after: avoid; break-after: avoid; margin-bottom: 0; }
.sermon-final-document .cover {
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 0;
}
.sermon-final-document .cover-eyebrow {
  font-family: system-ui, sans-serif;
  font-size: 8pt;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 2rem;
}
.sermon-final-document .cover h1 {
  font-size: 26pt;
  font-weight: bold;
  line-height: 1.2;
  max-width: 500px;
  margin: 0 auto 2rem;
  letter-spacing: -0.01em;
}
.sermon-final-document .sermon-meta {
  width: 100%;
  max-width: 420px;
  margin: 0 auto 2.2rem;
  text-align: left;
  border-top: 0.5px solid #d1d5db;
  border-bottom: 0.5px solid #d1d5db;
  padding: 1rem 0;
}
.sermon-final-document .sermon-meta div {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 1rem;
  padding: 0.28rem 0;
}
.sermon-final-document .sermon-meta dt {
  font-family: system-ui, sans-serif;
  font-size: 7.5pt;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #9ca3af;
}
.sermon-final-document .sermon-meta dd { margin: 0; color: #111827; }
.sermon-final-document .cover-rule {
  width: 72px;
  height: 1.5px;
  background: #111827;
  margin: 0 auto;
}
.sermon-final-document .pg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: system-ui, sans-serif;
  font-size: 7.5pt;
  color: #9ca3af;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  border-bottom: 0.5px solid #d8d8d8;
  padding-bottom: 0.5rem;
  margin-bottom: 2.4rem;
}
.sermon-final-document .pg-footer {
  margin-top: auto;
  padding-top: 1.4rem;
  font-family: system-ui, sans-serif;
  font-size: 7.5pt;
  color: #c7c7c7;
  text-align: center;
  letter-spacing: 0.06em;
}
.sermon-final-document .main-point-heading {
  border-top: 1.5px solid #111827;
  border-bottom: 0.5px solid #d1d5db;
  padding: 1.1rem 0 1.2rem;
  margin: 0 0 2.1rem;
}
.sermon-final-document .main-point-marker {
  font-family: system-ui, sans-serif;
  font-size: 9pt;
  letter-spacing: 0.18em;
  color: #6b7280;
  font-weight: 800;
  margin-bottom: 0.55rem;
}
.sermon-final-document h2 {
  font-size: 18pt;
  font-weight: bold;
  line-height: 1.18;
  margin: 0;
  letter-spacing: 0.04em;
}
.sermon-final-document .section-title {
  font-size: 16pt;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: bold;
  margin-bottom: 1.8rem;
}
.sermon-final-document .subs {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.9em;
}
.sermon-final-document .subs li {
  display: flex;
  gap: 0.8em;
  align-items: baseline;
  font-size: 13.5pt;
  line-height: 1.65;
}
.sermon-final-document .subs-none li {
  gap: 0;
}
.sermon-final-document .sub-description {
  display: block;
  margin-top: 0.45rem;
  color: #374151;
  font-weight: normal;
}
.sermon-final-document .point-notes {
  margin: -0.8rem 0 1.7rem;
  color: #374151;
}
.sermon-final-document .sub-number {
  color: #6b7280;
  flex-shrink: 0;
  min-width: 1.25rem;
  text-align: right;
}
.sermon-final-document .sub-content {
  flex: 1;
}
.sermon-final-document .sep {
  border: none;
  border-top: 0.5px solid #d1d5db;
  margin: 1.8rem 0 1.2rem;
}
.sermon-final-document .label {
  font-family: system-ui, sans-serif;
  font-size: 7.5pt;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 0.8rem;
}
.sermon-final-document .ilustracao {
  font-style: italic;
  padding-left: 1.4em;
  border-left: 2px solid #d1d5db;
  margin-bottom: 0.5rem;
  line-height: 1.75;
}
.sermon-final-document .ilustracao p + p,
.sermon-final-document .aplicacao p + p,
.sermon-final-document .prose p + p {
  margin-top: 0.85em;
}
.sermon-final-document .formatted-list,
.sermon-final-document .prose ul,
.sermon-final-document .ilustracao ul,
.sermon-final-document .aplicacao ul {
  margin: 0.4rem 0 0.9rem 1.25rem;
  padding: 0;
}
.sermon-final-document .formatted-list li + li,
.sermon-final-document .prose li + li,
.sermon-final-document .ilustracao li + li,
.sermon-final-document .aplicacao li + li {
  margin-top: 0.28rem;
}
@media print {
  @page { size: A4; margin: 0; }
  body { margin: 0; background: #fff !important; }
  .sermon-final-document { font-size: 13pt; }
  .sermon-final-document .page {
    width: 21cm;
    min-height: 29.7cm;
    margin: 0;
    box-shadow: none;
  }
}`

  const body = `<main class="sermon-final-document">${pages.join('\n')}</main>`
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>${esc(title)}</title>
<style>${css}</style>
</head>
<body>${body}</body>
</html>`

  return { title, css, body, html, pages }
}

export default function SermonBuilderWorkspace({
  project, userId, existingSection, onUpdate, onAskAI, initialViewMode = 'edit', publishedReader = false,
}: Props) {
  const supabase = createClient()
  const printModeStorageKey = `lampas:sermon-builder:${project.id}:print-mode`

  const loadBlocks = useCallback((): SermonBlock[] => {
    const c = existingSection?.content as SermonBuilderContent | null
    if (c?.type === 'sermon_builder' && Array.isArray(c.blocks) && c.blocks.length > 0) {
      return c.blocks.map(b =>
        b.type === 'desenvolvimento' ? { ...b, pontos: normalizePontos(b.pontos) } : b
      )
    }
    return DEFAULT_BLOCKS
  }, [existingSection])

  const [blocks,     setBlocks]     = useState<SermonBlock[]>(loadBlocks)
  const [saving,     setSaving]     = useState(false)
  const [savedAt,    setSavedAt]    = useState<Date | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameVal,  setRenameVal]  = useState('')
  const [addOpen,    setAddOpen]    = useState(false)
  const [viewMode,   setViewMode]   = useState<'edit' | 'preview'>(initialViewMode)
  const [printMode,  setPrintMode]  = useState<PrintOutlineMode>(() => {
    if (typeof window === 'undefined') return 'complete'
    return window.localStorage.getItem(printModeStorageKey) === 'reduced' ? 'reduced' : 'complete'
  })
  const [published,  setPublished]  = useState(Boolean(project.published))
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [slidesMenuOpen, setSlidesMenuOpen] = useState(false)
  const [slidesPlatform, setSlidesPlatform] = useState<SlidePlatform | null>(null)
  const [slidesSettings, setSlidesSettings] = useState<SlidePromptSettings>(defaultSlidePromptSettings)
  const [slidesPrompt, setSlidesPrompt] = useState('')
  const [slidesCopied, setSlidesCopied] = useState(false)
  const [readerMode, setReaderMode] = useState<'continuous' | 'paged'>('continuous')
  const [readerPage, setReaderPage] = useState(0)
  const [readerFullscreen, setReaderFullscreen] = useState(false)
  const [readerTurnDirection, setReaderTurnDirection] = useState<'next' | 'prev' | null>(null)
  const [previewDocument, setPreviewDocument] = useState<{
    mode: PrintOutlineMode
    document: ReturnType<typeof buildFinalSermonDocument>
  } | null>(null)
  const [collapsedBlocks, setCollapsedBlocks] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      return new Set(JSON.parse(window.localStorage.getItem(`lampas:sermon-builder:${project.id}:collapsed`) ?? '[]'))
    } catch {
      return new Set()
    }
  })

  const blocksRef      = useRef(blocks)
  blocksRef.current    = blocks
  const sectionIdRef   = useRef(existingSection?.id)
  sectionIdRef.current = existingSection?.id
  const readerShellRef = useRef<HTMLDivElement | null>(null)
  const readerPointerRef = useRef<{ id: number; x: number; y: number } | null>(null)
  const readerTurnTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveTimer      = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!slidesMenuOpen) return
    function closeSlidesMenu() { setSlidesMenuOpen(false) }
    document.addEventListener('mousedown', closeSlidesMenu)
    return () => document.removeEventListener('mousedown', closeSlidesMenu)
  }, [slidesMenuOpen])

  useEffect(() => {
    if (!publishedReader || viewMode === 'preview') return
    setViewMode('preview')
  }, [publishedReader, viewMode])

  useEffect(() => {
    function handleFullscreenChange() {
      setReaderFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const performSave = useCallback(async (current: SermonBlock[]) => {
    setSaving(true)
    const hasContent = current.some(blockHasContent)
    const payload = {
      project_id: project.id,
      user_id:    userId,
      slug:       'sermao_dispositio',
      module:     'dispositio' as const,
      title:      'Sermão · Disposição',
      content:    { type: 'sermon_builder', blocks: current } as unknown as Record<string, unknown>,
      status:     (hasContent ? 'draft' : 'empty') as 'empty' | 'draft' | 'reviewed',
    }
    const id = sectionIdRef.current
    if (id) {
      const { data } = await supabase.from('sections').update(payload).eq('id', id).select().single()
      if (data) onUpdate(data as Section)
    } else {
      const { data } = await supabase.from('sections').insert(payload).select().single()
      if (data) { sectionIdRef.current = (data as Section).id; onUpdate(data as Section) }
    }
    setSaving(false)
    setSavedAt(new Date())
  }, [project, userId, supabase, onUpdate])

  function scheduleSave(updated: SermonBlock[]) {
    setBlocks(updated)
    blocksRef.current = updated
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => performSave(blocksRef.current), 1500)
  }

  function updateContent(id: string, content: string) {
    scheduleSave(blocksRef.current.map(b => b.id === id ? { ...b, content } : b))
  }

  function updatePontos(id: string, pontos: PontoPrincipal[]) {
    scheduleSave(blocksRef.current.map(b => b.id === id ? { ...b, pontos } : b))
  }

  function updateBlock(id: string, data: Partial<SermonBlock>) {
    scheduleSave(blocksRef.current.map(b => b.id === id ? { ...b, ...data } : b))
  }

  function toggleBlockCollapsed(id: string) {
    setCollapsedBlocks(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(`lampas:sermon-builder:${project.id}:collapsed`, JSON.stringify([...next]))
      }
      return next
    })
  }

  function addBlock(type: BlockType) {
    const label = BLOCK_TYPES.find(t => t.type === type)!.label
    const nb: SermonBlock = type === 'desenvolvimento'
      ? { id: mkId(), type, title: label, content: '', pontos: defaultPontos() }
      : { id: mkId(), type, title: label, content: '' }
    scheduleSave([...blocksRef.current, nb])
    setAddOpen(false)
  }

  function moveBlock(id: string, dir: 'up' | 'down') {
    const i = blocksRef.current.findIndex(b => b.id === id)
    if (i < 0) return
    const arr = [...blocksRef.current]
    const swap = dir === 'up' ? i - 1 : i + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[i], arr[swap]] = [arr[swap], arr[i]]
    scheduleSave(arr)
  }

  function duplicateBlock(id: string) {
    const i = blocksRef.current.findIndex(b => b.id === id)
    if (i < 0) return
    const src = blocksRef.current[i]
    const copy: SermonBlock = { ...src, id: mkId(), title: src.title + ' (cópia)' }
    const arr = [...blocksRef.current]
    arr.splice(i + 1, 0, copy)
    scheduleSave(arr)
  }

  function deleteBlock(id: string) {
    scheduleSave(blocksRef.current.filter(b => b.id !== id))
    setActiveMenu(null)
  }

  function startRename(id: string, current: string) {
    setRenamingId(id); setRenameVal(current); setActiveMenu(null)
  }

  function commitRename(id: string) {
    const t = renameVal.trim()
    if (t) scheduleSave(blocksRef.current.map(b => b.id === id ? { ...b, title: t } : b))
    setRenamingId(null)
  }

  function setActivePrintMode(mode: PrintOutlineMode) {
    const nextDocument = buildFinalSermonDocument(blocksRef.current, project, mode)
    setPrintMode(mode)
    setPreviewDocument({ mode, document: nextDocument })
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(printModeStorageKey, mode)
    }
  }

  async function saveAndPreview() {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setPreviewDocument({
      mode: printMode,
      document: buildFinalSermonDocument(blocksRef.current, project, printMode),
    })
    await performSave(blocksRef.current)
    setViewMode('preview')
    setActiveMenu(null)
    setAddOpen(false)
  }

  async function previewPrintMode(mode: PrintOutlineMode) {
    setActivePrintMode(mode)
    setPreviewDocument({
      mode,
      document: buildFinalSermonDocument(blocksRef.current, project, mode),
    })
    if (saveTimer.current) clearTimeout(saveTimer.current)
    await performSave(blocksRef.current)
    setViewMode('preview')
    setActiveMenu(null)
    setAddOpen(false)
  }

  function printFinalSermon(mode: PrintOutlineMode = printMode) {
    const { html } = buildFinalSermonDocument(blocksRef.current, project, mode)
    const win = window.open('', '_blank', 'width=960,height=760')
    if (win) {
      win.document.write(html)
      win.document.close()
      win.focus()
      setTimeout(() => win.print(), 700)
    }
  }

  async function togglePublished() {
    const next = !published
    const publishedAt = next ? new Date().toISOString() : null
    setPublishError(null)
    setPublished(next)
    setPublishing(true)
    const { error } = await supabase
      .from('projects')
      .update({ published: next, published_at: publishedAt })
      .eq('id', project.id)
      .eq('user_id', userId)
    if (error) {
      console.error('[Lampas] Falha ao atualizar publicação do projeto', error)
      setPublishError(
        error.code === '42703'
          ? 'Execute a migration 022_project_publishing.sql para habilitar publicação.'
          : 'Não foi possível atualizar a publicação agora.'
      )
      setPublished(!next)
    }
    setPublishing(false)
  }

  function generateSlidesPrompt(platform: SlidePlatform, settings = slidesSettings) {
    const mode = viewMode === 'preview' && previewDocument ? previewDocument.mode : printMode
    const prompt = buildSlidesPrompt(platform, settings, blocksRef.current, project, mode)
    setSlidesPlatform(platform)
    setSlidesPrompt(prompt)
    setSlidesCopied(false)
  }

  function openSlidesPrompt(platform: SlidePlatform) {
    setSlidesMenuOpen(false)
    generateSlidesPrompt(platform)
  }

  function updateSlidesSettings(patch: Partial<SlidePromptSettings>) {
    setSlidesSettings(current => {
      const next = { ...current, ...patch }
      if (slidesPlatform) {
        const mode = viewMode === 'preview' && previewDocument ? previewDocument.mode : printMode
        setSlidesPrompt(buildSlidesPrompt(slidesPlatform, next, blocksRef.current, project, mode))
        setSlidesCopied(false)
      }
      return next
    })
  }

  function updateSlideInclude(key: keyof SlidePromptSettings['include'], value: boolean) {
    setSlidesSettings(current => {
      const next = { ...current, include: { ...current.include, [key]: value } }
      if (slidesPlatform) {
        const mode = viewMode === 'preview' && previewDocument ? previewDocument.mode : printMode
        setSlidesPrompt(buildSlidesPrompt(slidesPlatform, next, blocksRef.current, project, mode))
        setSlidesCopied(false)
      }
      return next
    })
  }

  async function copySlidesPrompt() {
    try {
      await navigator.clipboard.writeText(slidesPrompt)
      setSlidesCopied(true)
    } catch {
      setSlidesCopied(false)
    }
  }

  const savedLabel = saving ? 'salvando…'
    : savedAt ? `salvo ${savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : ''

  const activePreviewDocument = previewDocument ?? {
    mode: printMode,
    document: buildFinalSermonDocument(blocks, project, printMode),
  }
  const printModeLabel = activePreviewDocument.mode === 'reduced' ? 'Esboço reduzido' : 'Esboço completo'
  const readerPages = activePreviewDocument.document.pages
  const readerPageCount = Math.max(1, readerPages.length)
  const readerCurrentPage = Math.min(readerPage, readerPageCount - 1)
  const readerBody = readerMode === 'paged'
    ? `<main class="sermon-final-document">${readerPages[readerCurrentPage] ?? ''}</main>`
    : activePreviewDocument.document.body

  useEffect(() => {
    setReaderPage(current => Math.min(current, Math.max(0, readerPageCount - 1)))
  }, [readerPageCount])

  const turnReaderPage = useCallback((direction: 'next' | 'prev') => {
    if (readerMode !== 'paged') return
    setReaderPage(current => {
      const next = direction === 'next'
        ? Math.min(readerPageCount - 1, current + 1)
        : Math.max(0, current - 1)
      if (next !== current) {
        setReaderTurnDirection(direction)
        if (readerTurnTimer.current) clearTimeout(readerTurnTimer.current)
        readerTurnTimer.current = setTimeout(() => setReaderTurnDirection(null), 260)
      }
      return next
    })
  }, [readerMode, readerPageCount])

  useEffect(() => () => {
    if (readerTurnTimer.current) clearTimeout(readerTurnTimer.current)
  }, [])

  useEffect(() => {
    if (viewMode !== 'preview' || readerMode !== 'paged') return
    function handleReaderKeydown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const tagName = target?.tagName?.toLowerCase()
      if (tagName === 'input' || tagName === 'textarea' || target?.isContentEditable) return
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        turnReaderPage('next')
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        turnReaderPage('prev')
      }
    }
    window.addEventListener('keydown', handleReaderKeydown)
    return () => window.removeEventListener('keydown', handleReaderKeydown)
  }, [readerMode, turnReaderPage, viewMode])

  function handleReaderPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (readerMode !== 'paged' || event.pointerType === 'mouse' && event.button !== 0) return
    readerPointerRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function handleReaderPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (readerMode !== 'paged') return
    const start = readerPointerRef.current
    if (!start || start.id !== event.pointerId) return
    readerPointerRef.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)

    const deltaX = event.clientX - start.x
    const deltaY = event.clientY - start.y
    const horizontal = Math.abs(deltaX)
    const vertical = Math.abs(deltaY)
    if (horizontal < 56 || horizontal < vertical * 1.25) return
    turnReaderPage(deltaX < 0 ? 'next' : 'prev')
  }

  function handleReaderPointerCancel() {
    readerPointerRef.current = null
  }

  async function toggleReaderFullscreen() {
    const element = readerShellRef.current
    if (!element) return
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }
    await element.requestFullscreen()
  }

  const toolbarButton: React.CSSProperties = {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: '7px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '0.78rem',
    fontWeight: 750,
    padding: '0.46rem 0.78rem',
    lineHeight: 1,
  }

  const primaryToolbarButton: React.CSSProperties = {
    ...toolbarButton,
    background: 'var(--ai)',
    borderColor: 'var(--ai)',
    color: '#fff',
    fontWeight: 850,
  }

  const renderPrintModeToggle = () => {
    const currentMode = viewMode === 'preview' ? activePreviewDocument.mode : printMode
    const isReduced = currentMode === 'reduced'
    return (
      <button
        type="button"
        role="switch"
        aria-checked={isReduced}
        onClick={() => setActivePrintMode(isReduced ? 'complete' : 'reduced')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.48rem',
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: '999px',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: '0.74rem',
        fontWeight: 800,
        padding: '0.28rem 0.48rem 0.28rem 0.72rem',
        lineHeight: 1,
      }}
    >
        <span>{isReduced ? 'Reduzido' : 'Completo'}</span>
        <span
          aria-hidden
          style={{
            width: '34px',
            height: '18px',
            borderRadius: '999px',
            background: isReduced ? 'var(--ai)' : 'var(--border)',
            padding: '2px',
            display: 'inline-flex',
            justifyContent: isReduced ? 'flex-end' : 'flex-start',
            transition: 'background 0.16s ease',
          }}
        >
          <span
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.25)',
            }}
          />
        </span>
      </button>
    )
  }

  const renderPublishToggle = () => (
    <button
      type="button"
      role="switch"
      aria-checked={published}
      disabled={publishing}
      onClick={togglePublished}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.48rem',
        background: published ? 'rgba(16, 185, 129, 0.08)' : '#fff',
        border: `1px solid ${published ? 'rgba(16, 185, 129, 0.35)' : 'var(--border)'}`,
        borderRadius: '999px',
        color: published ? '#047857' : 'var(--text-secondary)',
        cursor: publishing ? 'wait' : 'pointer',
        fontFamily: 'inherit',
        fontSize: '0.74rem',
        fontWeight: 850,
        padding: '0.28rem 0.48rem 0.28rem 0.72rem',
        lineHeight: 1,
        opacity: publishing ? 0.68 : 1,
      }}
    >
      <span>{published ? 'Publicado' : 'Publicar'}</span>
      <span
        aria-hidden
        style={{
          width: '34px',
          height: '18px',
          borderRadius: '999px',
          background: published ? '#10B981' : 'var(--border)',
          padding: '2px',
          display: 'inline-flex',
          justifyContent: published ? 'flex-end' : 'flex-start',
          transition: 'background 0.16s ease',
        }}
      >
        <span
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.25)',
          }}
        />
      </span>
    </button>
  )

  const renderSlidesMenu = () => (
    <div style={{ position: 'relative' }} onMouseDown={e => e.stopPropagation()}>
      <button
        type="button"
        onMouseDown={e => { e.stopPropagation(); setSlidesMenuOpen(open => !open); setActiveMenu(null); setAddOpen(false) }}
        style={toolbarButton}
      >
        Slides ▾
      </button>
      {slidesMenuOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 0.35rem)',
          right: 0,
          zIndex: 90,
          minWidth: '220px',
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '0.35rem',
          boxShadow: '0 16px 38px rgba(15, 23, 42, 0.16)',
        }}>
          {(['Canvas', 'Claude', 'Gemini', 'ChatGPT', 'Gamma'] as SlidePlatform[]).map(platform => (
            <button
              key={platform}
              type="button"
              onMouseDown={e => {
                e.preventDefault()
                e.stopPropagation()
                openSlidesPrompt(platform)
              }}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '0.52rem 0.6rem',
                textAlign: 'left',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              Gerar prompt para {platform}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  const selectStyle: React.CSSProperties = {
    width: '100%',
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: '7px',
    color: 'var(--text-primary)',
    fontFamily: 'inherit',
    fontSize: '0.8rem',
    padding: '0.45rem 0.55rem',
  }

  const renderSlidesPromptModal = () => slidesPlatform ? (
    <div
      onMouseDown={e => { if (e.target === e.currentTarget) setSlidesPlatform(null) }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        background: 'rgba(15, 23, 42, 0.42)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div style={{
        width: 'min(920px, 100%)',
        maxHeight: '88vh',
        overflow: 'hidden',
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        boxShadow: '0 24px 70px rgba(15, 23, 42, 0.24)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: '1rem 1.15rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--ai)', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Prompt para {slidesPlatform}
            </div>
            <div style={{ marginTop: '0.18rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Gere uma apresentação visual a partir do sermão atual.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSlidesPlatform(null)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '1rem 1.15rem', overflow: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 280px) 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.28rem', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800 }}>
                Tipo de apresentação
                <select
                  value={slidesSettings.presentationType}
                  onChange={e => updateSlidesSettings({ presentationType: e.target.value as SlidePresentationType })}
                  style={selectStyle}
                >
                  {(['Culto', 'EBD', 'Palestra', 'Aula', 'Treinamento', 'Conferência'] as SlidePresentationType[]).map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.28rem', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800 }}>
                Tamanho
                <select
                  value={slidesSettings.deckSize}
                  onChange={e => updateSlidesSettings({ deckSize: e.target.value as SlideDeckSize })}
                  style={selectStyle}
                >
                  {(['Curta — 5 a 7 slides', 'Média — 8 a 12 slides', 'Completa — 15 a 20 slides'] as SlideDeckSize[]).map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.28rem', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800 }}>
                Estilo visual
                <select
                  value={slidesSettings.visualStyle}
                  onChange={e => updateSlidesSettings({ visualStyle: e.target.value as SlideVisualStyle })}
                  style={selectStyle}
                >
                  {(['Minimalista', 'Clássico', 'Moderno', 'Editorial', 'Igreja', 'Acadêmico'] as SlideVisualStyle[]).map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 900, marginBottom: '0.45rem' }}>Incluir</div>
                <div style={{ display: 'grid', gap: '0.38rem' }}>
                  {([
                    ['bibleText', 'Texto bíblico'],
                    ['theme', 'Tema'],
                    ['proposition', 'Proposição'],
                    ['mainPoints', 'Pontos principais'],
                    ['subpoints', 'Subpontos'],
                    ['applications', 'Aplicações'],
                    ['illustrations', 'Ilustrações'],
                    ['conclusion', 'Conclusão'],
                    ['imageSuggestions', 'Sugestões de imagens'],
                    ['speakerNotes', 'Notas do apresentador'],
                  ] as Array<[keyof SlidePromptSettings['include'], string]>).map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={slidesSettings.include[key]}
                        onChange={e => updateSlideInclude(key, e.target.checked)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <textarea
                value={slidesPrompt}
                readOnly
                style={{
                  width: '100%',
                  minHeight: '480px',
                  resize: 'vertical',
                  border: '1px solid var(--border)',
                  borderRadius: '9px',
                  padding: '0.9rem',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '0.78rem',
                  lineHeight: 1.55,
                  color: 'var(--text-primary)',
                  background: '#F8FAFC',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => generateSlidesPrompt(slidesPlatform)} style={toolbarButton}>
                  Regenerar
                </button>
                <button type="button" onClick={copySlidesPrompt} style={primaryToolbarButton}>
                  {slidesCopied ? 'Copiado' : 'Copiar'}
                </button>
                <button type="button" onClick={() => setSlidesPlatform(null)} style={toolbarButton}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null

  const readerToolbarButton: React.CSSProperties = {
    ...toolbarButton,
    background: '#fff',
    fontSize: '0.76rem',
    padding: '0.42rem 0.68rem',
  }

  const renderReaderToolbar = () => (
    <div
      style={{
        position: 'sticky',
        top: '4.4rem',
        width: '100%',
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '9px',
        boxShadow: '0 10px 28px rgba(15, 23, 42, 0.10)',
        padding: '0.52rem 0.62rem',
        marginBottom: '1rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: 'var(--ai)', fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Projeto publicado
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.18rem' }}>
            {project.book} {project.passage_ref} · {printModeLabel} · modo leitura
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setReaderMode(current => current === 'continuous' ? 'paged' : 'continuous')}
            style={readerToolbarButton}
          >
            {readerMode === 'continuous' ? 'Página a página' : 'Rolagem contínua'}
          </button>

          {readerMode === 'paged' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                type="button"
                onClick={() => turnReaderPage('prev')}
                disabled={readerCurrentPage === 0}
                style={{ ...readerToolbarButton, opacity: readerCurrentPage === 0 ? 0.45 : 1, cursor: readerCurrentPage === 0 ? 'not-allowed' : 'pointer' }}
              >
                Anterior
              </button>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 750, minWidth: '4.8rem', textAlign: 'center' }}>
                {readerCurrentPage + 1} / {readerPageCount}
              </span>
              <button
                type="button"
                onClick={() => turnReaderPage('next')}
                disabled={readerCurrentPage >= readerPageCount - 1}
                style={{ ...readerToolbarButton, opacity: readerCurrentPage >= readerPageCount - 1 ? 0.45 : 1, cursor: readerCurrentPage >= readerPageCount - 1 ? 'not-allowed' : 'pointer' }}
              >
                Próxima
              </button>
            </div>
          )}

          <button type="button" onClick={toggleReaderFullscreen} style={readerToolbarButton}>
            {readerFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          </button>
        </div>
      </div>
    </div>
  )

  const renderToolbar = (variant: 'edit' | 'preview') => (
    <div
      style={{
        position: 'sticky',
        top: 0,
        width: '100%',
        zIndex: 50,
        background: variant === 'preview' ? 'rgba(255, 255, 255, 0.94)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '9px',
        boxShadow: variant === 'preview' ? '0 10px 28px rgba(15, 23, 42, 0.10)' : '0 12px 32px rgba(15, 23, 42, 0.08)',
        padding: variant === 'preview' ? '0.42rem 0.56rem' : '0.55rem 0.65rem',
        marginBottom: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: 'var(--ai)', fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Construtor Homilético
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.18rem' }}>
            {project.book} {project.passage_ref} · {printModeLabel} · {savedLabel || 'aguardando alterações'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setViewMode('edit')} style={variant === 'edit' ? primaryToolbarButton : toolbarButton}>
            Editar
          </button>
          <button
            onClick={async () => {
              if (saveTimer.current) clearTimeout(saveTimer.current)
              await performSave(blocksRef.current)
            }}
            disabled={saving}
            style={{ ...toolbarButton, opacity: saving ? 0.65 : 1, cursor: saving ? 'wait' : 'pointer' }}
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
          <button onClick={saveAndPreview} style={variant === 'preview' ? primaryToolbarButton : toolbarButton}>
            Visualizar
          </button>
          {renderPrintModeToggle()}
          {renderSlidesMenu()}
          <button
            onClick={() => variant === 'preview' ? printFinalSermon(activePreviewDocument.mode) : previewPrintMode(printMode)}
            style={variant === 'preview' ? primaryToolbarButton : toolbarButton}
          >
            Imprimir/PDF
          </button>
          {renderPublishToggle()}
        </div>
      </div>
      {publishError && (
        <div style={{ marginTop: '0.45rem', color: '#B91C1C', fontSize: '0.72rem', fontWeight: 700 }}>
          {publishError}
        </div>
      )}
    </div>
  )

  if (viewMode === 'preview') {
    return (
      <div
        ref={readerShellRef}
        style={{
          background: '#eef1f5',
          minHeight: '100vh',
          padding: publishedReader
            ? '1.25rem clamp(0.75rem, 2vw, 2rem) 3rem'
            : '0 clamp(0.75rem, 2vw, 2rem) 3rem',
          overflow: readerMode === 'paged' ? 'hidden auto' : 'visible',
        }}
      >
        <div style={{ maxWidth: '21cm', margin: '0 auto', paddingTop: publishedReader ? 0 : '1.25rem' }}>
          {publishedReader ? renderReaderToolbar() : renderToolbar('preview')}
        </div>

        <style>{activePreviewDocument.document.css}</style>
        <div
          onPointerDown={handleReaderPointerDown}
          onPointerUp={handleReaderPointerUp}
          onPointerCancel={handleReaderPointerCancel}
          style={{
            touchAction: readerMode === 'paged' ? 'pan-y' : 'auto',
            cursor: readerMode === 'paged' ? 'grab' : 'auto',
            userSelect: readerMode === 'paged' ? 'none' : 'auto',
          }}
          aria-live={readerMode === 'paged' ? 'polite' : undefined}
        >
          <div
            key={readerMode === 'paged' ? readerCurrentPage : 'continuous'}
            style={{
              transform: readerTurnDirection === 'next'
                ? 'translateX(-10px)'
                : readerTurnDirection === 'prev'
                  ? 'translateX(10px)'
                  : 'translateX(0)',
              opacity: readerTurnDirection ? 0.96 : 1,
              transition: 'transform 220ms ease, opacity 220ms ease',
              willChange: readerMode === 'paged' ? 'transform, opacity' : undefined,
            }}
            dangerouslySetInnerHTML={{ __html: readerBody }}
          />
        </div>
        {!publishedReader && renderSlidesPromptModal()}
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem clamp(1.2rem, 3vw, 2.5rem) 5rem', maxWidth: '860px', margin: '0 auto' }}>
      {renderToolbar('edit')}

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--ai)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, marginBottom: '0.3rem' }}>
          Sermão · Disposição
        </div>
        <h1 style={{ fontSize: '1.55rem', color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '0.4rem' }}>
          Construtor Homilético
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: '600px' }}>
          Organize o sermão em blocos modulares. Passe o cursor sobre qualquer elemento para ver as ações disponíveis.
        </p>
        <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {project.book} {project.passage_ref} · {savedLabel}
          </span>
          {blocks.every(b => !blockHasContent(b)) && (
            <button
              onClick={() => {
                if (window.confirm('Carregar esboço "A Presença de Deus em Todas as Circunstâncias" (Gn 39.1-23)? O conteúdo atual será substituído.')) {
                  scheduleSave(PRESET_GN39)
                }
              }}
              style={{
                background: 'transparent', border: '1px solid var(--border)', borderRadius: '5px',
                color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.72rem', padding: '0.2rem 0.6rem',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ai)'; e.currentTarget.style.color = 'var(--ai)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              ↓ Carregar esboço Gn 39
            </button>
          )}
          {blocks.some(b => blockHasContent(b)) && (
            <button
              onClick={() => previewPrintMode(printMode)}
              style={{
                background: 'transparent', border: '1px solid var(--border)', borderRadius: '5px',
                color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.72rem', padding: '0.2rem 0.6rem',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-secondary)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              ⎙ Visualizar impressão
            </button>
          )}
        </div>
      </div>

      {/* Blocks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {blocks.map((block, idx) => {
          const color    = TYPE_COLOR[block.type]
          const isFirst  = idx === 0
          const isLast   = idx === blocks.length - 1
          const menuOpen = activeMenu === block.id
          const isDev    = block.type === 'desenvolvimento'
          const isBlockActive = activeBlockId === block.id || menuOpen || renamingId === block.id
          const isCollapsed = collapsedBlocks.has(block.id)

          return (
            <div
              key={block.id}
              onMouseDownCapture={() => setActiveBlockId(block.id)}
              onFocusCapture={() => setActiveBlockId(block.id)}
              style={{
                border: isBlockActive ? '1px solid rgba(148, 163, 184, 0.38)' : '1px solid var(--border-subtle)',
                borderLeft: `3px solid ${color}`,
                borderRadius: '7px',
                background: isBlockActive ? '#fff' : 'var(--surface)',
                boxShadow: isBlockActive ? '0 18px 42px rgba(15, 23, 42, 0.10)' : 'none',
                position: 'relative',
                overflow: 'visible',
                transition: 'background 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease',
              }}
            >
              {/* Block header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: isBlockActive ? '0.78rem 0.85rem' : '0.62rem 0.75rem',
                borderBottom: isCollapsed ? 'none' : '1px solid var(--border-subtle)',
                background: isBlockActive ? `${color}0d` : 'transparent',
                borderRadius: isCollapsed ? '6px' : '6px 6px 0 0',
              }}>
                <button
                  onClick={() => toggleBlockCollapsed(block.id)}
                  title={isCollapsed ? 'Expandir bloco' : 'Recolher bloco'}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '0.65rem', padding: 0, flexShrink: 0,
                    transition: 'transform 0.15s', transform: isCollapsed ? 'none' : 'rotate(90deg)', lineHeight: 1,
                  }}
                >▶</button>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, background: dotColor(block) }} />

                {renamingId === block.id ? (
                  <input
                    autoFocus value={renameVal}
                    onChange={e => setRenameVal(e.target.value)}
                    onBlur={() => commitRename(block.id)}
                    onKeyDown={e => { if (e.key === 'Enter') commitRename(block.id); if (e.key === 'Escape') setRenamingId(null) }}
                    style={{
                      flex: 1, background: 'var(--surface-2)', border: `1px solid ${color}`,
                      borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit',
                      fontSize: '0.88rem', fontWeight: 600, padding: '0.15rem 0.45rem', outline: 'none',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      flex: 1,
                      fontSize: isBlockActive ? '1rem' : '0.92rem',
                      fontWeight: 900,
                      color: 'var(--text-primary)',
                      cursor: 'text',
                      letterSpacing: '0.01em',
                    }}
                    onDoubleClick={() => startRename(block.id, block.title)}
                  >
                    {block.title}
                  </span>
                )}

                <span style={{ fontSize: '0.6rem', color, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, opacity: 0.7, flexShrink: 0 }}>
                  {BLOCK_TYPES.find(t => t.type === block.type)?.label}
                </span>

                <button
                  onClick={() => onAskAI(blockPrompt(block, project))}
                  style={{
                    background: 'transparent', border: `1px solid ${color}`, borderRadius: '5px',
                    color, cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: '0.72rem', fontWeight: 700, padding: '0.18rem 0.6rem', flexShrink: 0,
                  }}
                >Gerar</button>

                <button
                  onMouseDown={e => { e.stopPropagation(); setActiveMenu(menuOpen ? null : block.id); setAddOpen(false) }}
                  style={{
                    width: '24px', height: '24px', background: 'transparent', border: 'none',
                    color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '4px', flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--surface-2)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
                >⋮</button>

                {menuOpen && (
                  <div
                    onMouseDown={e => e.stopPropagation()}
                    style={{
                      position: 'absolute', top: '38px', right: '0.5rem', zIndex: 100,
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                      borderRadius: '7px', padding: '0.3rem', minWidth: '170px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    }}
                  >
                    {([
                      { label: 'Renomear',         action: () => startRename(block.id, block.title) },
                      { label: 'Mover para cima',  action: () => { moveBlock(block.id, 'up'); setActiveMenu(null) }, disabled: isFirst },
                      { label: 'Mover para baixo', action: () => { moveBlock(block.id, 'down'); setActiveMenu(null) }, disabled: isLast },
                      { label: 'Duplicar',         action: () => { duplicateBlock(block.id); setActiveMenu(null) } },
                      { label: 'Excluir',          action: () => deleteBlock(block.id), danger: true },
                    ] as Array<{ label: string; action: () => void; disabled?: boolean; danger?: boolean }>).map(item => (
                      <button
                        key={item.label}
                        onClick={item.disabled ? undefined : item.action}
                        style={{
                          width: '100%', background: 'transparent', border: 'none',
                          textAlign: 'left', padding: '0.42rem 0.65rem', borderRadius: '5px',
                          color: item.danger ? 'var(--error)' : item.disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
                          cursor: item.disabled ? 'not-allowed' : 'pointer',
                          fontFamily: 'inherit', fontSize: '0.8rem', opacity: item.disabled ? 0.4 : 1,
                        }}
                        onMouseEnter={e => { if (!item.disabled) e.currentTarget.style.background = 'var(--surface-3)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Content area */}
              {!isCollapsed && (isDev ? (
                <DesenvolvimentoEditor
                  pontos={block.pontos ?? defaultPontos()}
                  project={project}
                  mainMarkerStyle={block.mainMarkerStyle ?? 'roman'}
                  subMarkerStyle={block.subMarkerStyle ?? 'decimal'}
                  onUpdate={pontos => updatePontos(block.id, pontos)}
                  onMarkerStyleChange={data => updateBlock(block.id, data)}
                  onAskAI={onAskAI}
                />
              ) : (
                <RichEditor
                  value={block.content}
                  onChange={content => updateContent(block.id, content)}
                  placeholder={`Escreva o ${block.title.toLowerCase()}…`}
                  rows={5}
                  toolbarColor={color}
                  style={{
                    width: '100%', minHeight: '110px',
                    background: 'transparent', border: 'none',
                    color: 'var(--text-primary)', fontFamily: 'inherit',
                    fontSize: '0.92rem', lineHeight: 1.75,
                    padding: '0.85rem 1rem', resize: 'vertical', outline: 'none',
                  }}
                />
              ))}
            </div>
          )
        })}
      </div>

      {/* Add section */}
      <div style={{ marginTop: '1rem', position: 'relative', display: 'inline-block' }}>
        <button
          onMouseDown={e => { e.stopPropagation(); setAddOpen(o => !o); setActiveMenu(null) }}
          style={{
            background: 'var(--surface)', border: '1px dashed var(--border)',
            borderRadius: '7px', color: 'var(--text-muted)',
            cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '0.82rem', padding: '0.5rem 1.1rem',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ai)'; e.currentTarget.style.color = 'var(--ai)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> Adicionar seção
        </button>

        {addOpen && (
          <div
            onMouseDown={e => e.stopPropagation()}
            style={{
              position: 'absolute', top: '110%', left: 0, zIndex: 100,
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: '7px', padding: '0.3rem', minWidth: '180px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            {BLOCK_TYPES.map(({ type, label }) => (
              <button
                key={type}
                onClick={() => addBlock(type)}
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  textAlign: 'left', padding: '0.42rem 0.65rem', borderRadius: '5px',
                  color: TYPE_COLOR[type], cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: TYPE_COLOR[type], flexShrink: 0 }} />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: '1.35rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.55rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setViewMode('edit')}
          style={{
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: '7px', color: 'var(--text-muted)',
            cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '0.82rem', padding: '0.5rem 1rem',
          }}
        >
          Editar
        </button>
        <button
          onClick={saveAndPreview}
          disabled={saving}
          style={{
            background: 'var(--ai)', border: '1px solid var(--ai)',
            borderRadius: '7px', color: '#fff',
            cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit',
            fontSize: '0.82rem', fontWeight: 800, padding: '0.5rem 1.1rem',
            opacity: saving ? 0.75 : 1,
          }}
        >
          {saving ? 'Salvando…' : 'Salvar e visualizar'}
        </button>
      </div>
      {renderSlidesPromptModal()}
    </div>
  )
}

