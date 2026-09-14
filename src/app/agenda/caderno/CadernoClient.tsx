'use client'

import { useState, useRef, useCallback } from 'react'
import { addDays, addWeeks, subWeeks, format, parseISO, startOfWeek, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { AgendaEvent, CreateAgendaEvent } from '@/types/agenda'
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, ALL_EVENT_TYPES } from '@/types/agenda'

// ── Constants ─────────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7) // 07–21
const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const SLOT_H = 56 // px per hour

// ── Helpers ───────────────────────────────────────────────────────────────────

function topForTime(iso: string): number {
  const d = parseISO(iso)
  const h = d.getHours() + d.getMinutes() / 60
  return Math.max(0, (h - 7) * SLOT_H)
}

function heightForEvent(ev: AgendaEvent): number {
  const start = parseISO(ev.starts_at)
  const end   = parseISO(ev.ends_at)
  const dur   = (end.getTime() - start.getTime()) / 3_600_000
  return Math.max(22, dur * SLOT_H)
}

function fmtTime(iso: string) {
  return format(parseISO(iso), 'HH:mm')
}

// ── Quick Event Form ──────────────────────────────────────────────────────────

interface QuickForm {
  date: string
  hour: number
  title: string
  event_type: AgendaEvent['event_type']
  location: string
}

const EMPTY_QUICK: QuickForm = { date: '', hour: 9, title: '', event_type: 'outro', location: '' }

// ── ImportPreview ─────────────────────────────────────────────────────────────

interface ImportDraft extends CreateAgendaEvent { _key: string }

function ImportPreview({
  drafts,
  onConfirm,
  onCancel,
}: {
  drafts: ImportDraft[]
  onConfirm: (selected: ImportDraft[]) => void
  onCancel: () => void
}) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(drafts.map(d => d._key)))

  const toggle = (key: string) => setSelected(prev => {
    const s = new Set(prev)
    s.has(key) ? s.delete(key) : s.add(key)
    return s
  })

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: 'rgba(15,23,42,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem',
    }}>
      <div style={{
        background: 'var(--background)', borderRadius: '12px',
        width: '100%', maxWidth: '520px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column', maxHeight: '80vh',
      }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Eventos encontrados na foto
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
            Selecione os que quer importar para a agenda
          </p>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {drafts.length === 0 && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0', fontSize: '0.88rem' }}>
              Nenhum evento identificado na imagem.
            </p>
          )}
          {drafts.map(d => (
            <label key={d._key} style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
              padding: '0.75rem 0.875rem',
              background: selected.has(d._key) ? 'var(--surface)' : 'transparent',
              border: `1px solid ${selected.has(d._key) ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '8px', cursor: 'pointer', transition: 'all 0.12s',
            }}>
              <input
                type="checkbox"
                checked={selected.has(d._key)}
                onChange={() => toggle(d._key)}
                style={{ marginTop: '2px', accentColor: 'var(--accent)', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
                  {d.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {format(parseISO(d.starts_at), "dd/MM · HH:mm", { locale: ptBR })}
                  {d.location ? ` · ${d.location}` : ''}
                </div>
                <div style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>
                  <span style={{
                    background: EVENT_TYPE_COLORS[d.event_type] + '22',
                    color: EVENT_TYPE_COLORS[d.event_type],
                    borderRadius: '4px', padding: '1px 6px', fontWeight: 600,
                  }}>
                    {EVENT_TYPE_LABELS[d.event_type]}
                  </span>
                </div>
              </div>
            </label>
          ))}
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '0.55rem 1.1rem', borderRadius: '7px', border: '1px solid var(--border)',
            background: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)',
          }}>
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(drafts.filter(d => selected.has(d._key)))}
            disabled={selected.size === 0}
            style={{
              padding: '0.55rem 1.25rem', borderRadius: '7px', border: 'none',
              background: 'var(--accent)', color: '#fff', cursor: selected.size === 0 ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem', fontWeight: 600, opacity: selected.size === 0 ? 0.5 : 1,
            }}
          >
            Importar {selected.size > 0 ? `(${selected.size})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Quick Add Form ────────────────────────────────────────────────────────────

function QuickAddPanel({
  form,
  onChange,
  onSave,
  onClose,
  saving,
}: {
  form: QuickForm
  onChange: (f: QuickForm) => void
  onSave: () => void
  onClose: () => void
  saving: boolean
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: 'rgba(15,23,42,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--background)', borderRadius: '12px',
        width: '100%', maxWidth: '400px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
        padding: '1.5rem',
      }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-primary)' }}>
          Novo evento — {format(parseISO(form.date), "dd 'de' MMMM", { locale: ptBR })}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input
            autoFocus
            placeholder="Título"
            value={form.title}
            onChange={e => onChange({ ...form, title: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && onSave()}
            style={{
              width: '100%', padding: '0.6rem 0.8rem',
              border: '1.5px solid var(--border)', borderRadius: '7px',
              fontSize: '0.88rem', color: 'var(--text-primary)',
              background: 'var(--background)', boxSizing: 'border-box',
              outline: 'none',
            }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Horário</label>
              <input
                type="time"
                value={`${String(form.hour).padStart(2,'0')}:00`}
                onChange={e => onChange({ ...form, hour: parseInt(e.target.value) })}
                style={{ width: '100%', padding: '0.55rem 0.7rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.85rem', background: 'var(--background)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Tipo</label>
              <select
                value={form.event_type}
                onChange={e => onChange({ ...form, event_type: e.target.value as AgendaEvent['event_type'] })}
                style={{ width: '100%', padding: '0.55rem 0.7rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.85rem', background: 'var(--background)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
              >
                {ALL_EVENT_TYPES.map(t => (
                  <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
          </div>

          <input
            placeholder="Local (opcional)"
            value={form.location}
            onChange={e => onChange({ ...form, location: e.target.value })}
            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid var(--border)', borderRadius: '7px', fontSize: '0.85rem', color: 'var(--text-primary)', background: 'var(--background)', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <button onClick={onClose} style={{ padding: '0.55rem 1rem', borderRadius: '7px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={!form.title.trim() || saving}
            style={{ padding: '0.55rem 1.25rem', borderRadius: '7px', border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, opacity: !form.title.trim() || saving ? 0.6 : 1 }}
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface Props {
  initialEvents: AgendaEvent[]
  initialWeekStart: string
}

export default function CadernoClient({ initialEvents, initialWeekStart }: Props) {
  const [weekStart, setWeekStart]     = useState<Date>(parseISO(initialWeekStart))
  const [events, setEvents]           = useState<AgendaEvent[]>(initialEvents)
  const [loadingWeek, setLoadingWeek] = useState(false)

  // Import state
  const [importing, setImporting]   = useState(false)
  const [importDrafts, setImportDrafts] = useState<ImportDraft[] | null>(null)
  const [importError, setImportError]   = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Quick-add state
  const [quickForm, setQuickForm] = useState<QuickForm | null>(null)
  const [saving, setSaving]       = useState(false)

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // ── Week navigation ──────────────────────────────────────────────────────────

  const loadWeek = useCallback(async (start: Date) => {
    setLoadingWeek(true)
    const from = start.toISOString()
    const to   = addDays(start, 7).toISOString()
    const res  = await fetch(`/api/agenda/events?from=${from}&to=${to}&limit=200`)
    const { data } = await res.json()
    setEvents(data ?? [])
    setWeekStart(start)
    setLoadingWeek(false)
  }, [])

  // ── Photo import ─────────────────────────────────────────────────────────────

  const handleFile = useCallback(async (file: File) => {
    setImporting(true)
    setImportError(null)
    try {
      const buf    = await file.arrayBuffer()
      const bytes  = new Uint8Array(buf)
      let binary   = ''
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
      const base64 = btoa(binary)
      const mt     = file.type || 'image/jpeg'

      const res  = await fetch('/api/agenda/import', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          image: base64, mediaType: mt,
          referenceDate: format(weekStart, 'yyyy-MM-dd'),
        }),
      })
      const json = await res.json()
      if (!res.ok) { setImportError(json.error ?? 'Erro ao processar imagem'); return }

      const drafts: ImportDraft[] = (json.events ?? []).map((e: CreateAgendaEvent, i: number) => ({
        ...e, _key: `draft-${i}`,
      }))
      setImportDrafts(drafts)
    } catch (err) {
      setImportError('Erro inesperado ao processar a imagem.')
      console.error(err)
    } finally {
      setImporting(false)
    }
  }, [weekStart])

  const handleImportConfirm = useCallback(async (selected: ImportDraft[]) => {
    const saved: AgendaEvent[] = []
    for (const draft of selected) {
      const { _key, ...body } = draft
      void _key
      const res  = await fetch('/api/agenda/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = await res.json()
      if (json.id) saved.push(json)
    }
    setEvents(prev => [...prev, ...saved])
    setImportDrafts(null)
  }, [])

  // ── Quick add ────────────────────────────────────────────────────────────────

  const openQuickAdd = (date: Date, hour = 9) => {
    setQuickForm({ ...EMPTY_QUICK, date: format(date, 'yyyy-MM-dd'), hour })
  }

  const saveQuick = async () => {
    if (!quickForm || !quickForm.title.trim()) return
    setSaving(true)
    const starts = new Date(`${quickForm.date}T${String(quickForm.hour).padStart(2,'0')}:00:00`)
    const ends   = new Date(starts.getTime() + 3_600_000)
    const body: CreateAgendaEvent = {
      title:        quickForm.title,
      event_type:   quickForm.event_type,
      description:  null,
      starts_at:    starts.toISOString(),
      ends_at:      ends.toISOString(),
      all_day:      false,
      location:     quickForm.location || null,
      organization: null,
      status:       'confirmado',
      project_id:   null,
      color:        null,
      meta:         {},
    }
    const res  = await fetch('/api/agenda/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const json = await res.json()
    if (json.id) setEvents(prev => [...prev, json])
    setSaving(false)
    setQuickForm(null)
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const monthLabel = format(weekStart, 'MMMM yyyy', { locale: ptBR })
  const todayStr   = format(new Date(), 'yyyy-MM-dd')

  return (
    <>
      {/* ── Print styles ───────────────────────────────────────────────────────── */}
      <style>{`
        @media print {
          .caderno-toolbar, .caderno-fab { display: none !important; }
          .caderno-shell { padding: 0 !important; overflow: visible !important; }
          .caderno-paper {
            box-shadow: none !important;
            border: none !important;
            page-break-inside: avoid;
          }
          body { background: white !important; }
        }
        .caderno-slot:hover { background: rgba(30,77,140,0.05) !important; cursor: crosshair; }
        .caderno-event-pill { transition: opacity 0.1s, box-shadow 0.1s; }
        .caderno-event-pill:hover { opacity: 0.9; box-shadow: 0 4px 12px rgba(0,0,0,0.18); }
      `}</style>

      <div className="caderno-shell" style={{ fontFamily: "'Georgia', serif", color: '#1a1208', userSelect: 'none' }}>

        {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
        <div className="caderno-toolbar" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={() => loadWeek(subWeeks(weekStart, 1))}
              style={navBtn}
            >←</button>
            <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', textTransform: 'capitalize', minWidth: '180px', textAlign: 'center', color: 'var(--text-primary)' }}>
              {monthLabel}
            </span>
            <button
              onClick={() => loadWeek(addWeeks(weekStart, 1))}
              style={navBtn}
            >→</button>
            <button
              onClick={() => loadWeek(startOfWeek(new Date(), { weekStartsOn: 0 }))}
              style={{ ...navBtn, fontSize: '0.72rem', padding: '0.35rem 0.75rem', fontFamily: 'system-ui' }}
            >Hoje</button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {/* Import photo button */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 1rem', borderRadius: '7px',
                border: '1.5px solid var(--border)',
                background: 'var(--background)', cursor: importing ? 'wait' : 'pointer',
                fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)',
                fontFamily: 'system-ui',
              }}
            >
              {importing ? '⏳ Analisando…' : '📷 Importar Foto'}
            </button>

            {/* Print button */}
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 1rem', borderRadius: '7px',
                border: '1.5px solid var(--border)',
                background: 'var(--background)', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)',
                fontFamily: 'system-ui',
              }}
            >
              🖨 Imprimir Semana
            </button>
          </div>
        </div>

        {importError && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#991B1B', fontFamily: 'system-ui' }}>
            {importError}
          </div>
        )}

        {loadingWeek && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontFamily: 'system-ui', fontSize: '0.84rem' }}>
            Carregando semana…
          </div>
        )}

        {/* ── Paper caderno ────────────────────────────────────────────────────── */}
        <div className="caderno-paper" style={{
          background: '#FFFDF5',
          border: '1px solid #D4C89A',
          borderRadius: '4px',
          boxShadow: '2px 3px 12px rgba(100,80,20,0.12), 0 0 0 1px rgba(180,160,80,0.15)',
          overflow: 'hidden',
        }}>
          {/* ── Header row (day labels) ─────────────────────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '48px repeat(7, 1fr)',
            borderBottom: '2px solid #B8A96A',
            background: '#F5EFD0',
          }}>
            <div /> {/* time gutter */}
            {days.map((d, i) => {
              const ds  = format(d, 'yyyy-MM-dd')
              const isToday = ds === todayStr
              return (
                <div
                  key={i}
                  style={{
                    padding: '0.6rem 0.4rem',
                    textAlign: 'center',
                    borderLeft: i === 0 ? 'none' : '1px solid #D4C89A',
                  }}
                >
                  <div style={{
                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: isToday ? '#8a5c1a' : '#8B7A45',
                    fontFamily: 'system-ui',
                  }}>
                    {DAY_LABELS[i]}
                  </div>
                  <div style={{
                    fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.1,
                    color: isToday ? '#8a5c1a' : '#3D2C0E',
                    background: isToday ? '#F5DFA0' : 'none',
                    borderRadius: '50%',
                    width: '2rem', height: '2rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto',
                  }}>
                    {format(d, 'd')}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Time grid ───────────────────────────────────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '48px repeat(7, 1fr)',
            position: 'relative',
          }}>
            {/* Time labels column */}
            <div>
              {HOURS.map(h => (
                <div key={h} style={{
                  height: `${SLOT_H}px`,
                  display: 'flex', alignItems: 'flex-start',
                  paddingTop: '4px', paddingRight: '6px',
                  justifyContent: 'flex-end',
                  fontSize: '0.65rem', color: '#8B7A45',
                  fontFamily: 'system-ui', fontWeight: 500,
                  borderTop: '1px solid #E8DCBB',
                }}>
                  {h < 10 ? `0${h}` : h}h
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((d, di) => {
              const ds = format(d, 'yyyy-MM-dd')
              const dayEvents = events.filter(e => isSameDay(parseISO(e.starts_at), d) && !e.all_day)

              return (
                <div
                  key={di}
                  style={{
                    position: 'relative',
                    borderLeft: '1px solid #D4C89A',
                  }}
                >
                  {/* Hour slots (clickable) */}
                  {HOURS.map(h => (
                    <div
                      key={h}
                      className="caderno-slot"
                      onClick={() => openQuickAdd(d, h)}
                      style={{
                        height: `${SLOT_H}px`,
                        borderTop: '1px solid #E8DCBB',
                        background: h % 2 === 0 ? 'transparent' : 'rgba(180,160,80,0.025)',
                      }}
                    />
                  ))}

                  {/* Events */}
                  {dayEvents.map(ev => {
                    const color = ev.color ?? EVENT_TYPE_COLORS[ev.event_type] ?? '#3B82F6'
                    const top   = topForTime(ev.starts_at)
                    const ht    = heightForEvent(ev)
                    return (
                      <div
                        key={ev.id}
                        className="caderno-event-pill"
                        title={`${ev.title}\n${fmtTime(ev.starts_at)}–${fmtTime(ev.ends_at)}${ev.location ? '\n' + ev.location : ''}`}
                        style={{
                          position: 'absolute',
                          top: `${top}px`,
                          left: '2px', right: '2px',
                          height: `${ht}px`,
                          background: color + 'DD',
                          borderLeft: `3px solid ${color}`,
                          borderRadius: '3px',
                          padding: '2px 5px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          zIndex: 2,
                        }}
                      >
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#fff', lineHeight: 1.2, fontFamily: 'system-ui' }}>
                          {ev.title}
                        </div>
                        {ht > 36 && (
                          <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.85)', fontFamily: 'system-ui' }}>
                            {fmtTime(ev.starts_at)}
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* All-day events bar at top of column */}
                  {events.filter(e => e.all_day && isSameDay(parseISO(e.starts_at), d)).map(ev => {
                    const color = ev.color ?? EVENT_TYPE_COLORS[ev.event_type] ?? '#3B82F6'
                    return (
                      <div
                        key={ev.id}
                        style={{
                          position: 'absolute',
                          top: 2, left: 2, right: 2,
                          background: color + 'CC',
                          borderRadius: '3px',
                          padding: '2px 5px',
                          zIndex: 3,
                          fontSize: '0.65rem', color: '#fff', fontWeight: 700,
                          fontFamily: 'system-ui',
                        }}
                      >
                        {ev.title}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* ── Weekly notes footer ─────────────────────────────────────────── */}
          <div style={{
            borderTop: '2px solid #B8A96A',
            padding: '0.75rem 1rem',
            background: '#F5EFD0',
            display: 'grid',
            gridTemplateColumns: '60px 1fr',
            gap: '0.5rem',
            alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#8B7A45', letterSpacing: '0.06em', textTransform: 'uppercase', paddingTop: '0.2rem', fontFamily: 'system-ui' }}>
              Notas
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} style={{ borderBottom: '1px solid #D4C89A', height: '22px' }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Stats row ────────────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: '1rem', marginTop: '1rem',
          fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'system-ui',
        }}>
          <span>{events.length} evento{events.length !== 1 ? 's' : ''} esta semana</span>
          <span>·</span>
          <span>Clique em qualquer horário para adicionar</span>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────────── */}
      {importDrafts !== null && (
        <ImportPreview
          drafts={importDrafts}
          onConfirm={handleImportConfirm}
          onCancel={() => setImportDrafts(null)}
        />
      )}

      {quickForm !== null && (
        <QuickAddPanel
          form={quickForm}
          onChange={setQuickForm}
          onSave={saveQuick}
          onClose={() => setQuickForm(null)}
          saving={saving}
        />
      )}
    </>
  )
}

const navBtn: React.CSSProperties = {
  padding: '0.35rem 0.7rem', borderRadius: '6px',
  border: '1px solid var(--border)', background: 'var(--background)',
  cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'system-ui',
  color: 'var(--text-primary)',
}
