'use client'

import { useState, useRef, useCallback } from 'react'
import { addDays, subDays, addWeeks, subWeeks, startOfWeek, format, parseISO, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { AgendaEvent, CreateAgendaEvent } from '@/types/agenda'
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, ALL_EVENT_TYPES } from '@/types/agenda'

// ── Constants ─────────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7) // 07–22
const MONTH_PT: Record<string, string> = {
  January:'Janeiro', February:'Fevereiro', March:'Março', April:'Abril',
  May:'Maio', June:'Junho', July:'Julho', August:'Agosto',
  September:'Setembro', October:'Outubro', November:'Novembro', December:'Dezembro',
}

function monthName(d: Date) {
  return MONTH_PT[format(d, 'MMMM')] ?? format(d, 'MMMM')
}

function dayOfWeekPt(d: Date) {
  return format(d, 'EEEE', { locale: ptBR })
}

// mini calendar dots (Mon–Sun) for the page header
function WeekDots({ day }: { day: Date }) {
  const dow = day.getDay() // 0=Sun
  const labels = ['D','S','T','Q','Q','S','S']
  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {labels.map((l, i) => (
        <div key={i} style={{
          width: 14, height: 14, borderRadius: '50%',
          background: i === dow ? '#1a1208' : 'transparent',
          border: '1px solid #aaa',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.48rem', fontWeight: 700,
          color: i === dow ? '#fff' : '#999',
          fontFamily: 'system-ui',
        }}>{l}</div>
      ))}
    </div>
  )
}

// ── Import preview ────────────────────────────────────────────────────────────

interface ImportDraft extends CreateAgendaEvent { _key: string }

function ImportPreview({ drafts, onConfirm, onCancel }: {
  drafts: ImportDraft[]
  onConfirm: (s: ImportDraft[]) => void
  onCancel: () => void
}) {
  const [sel, setSel] = useState<Set<string>>(() => new Set(drafts.map(d => d._key)))
  const toggle = (k: string) => setSel(p => { const s = new Set(p); s.has(k) ? s.delete(k) : s.add(k); return s })
  return (
    <div style={{ position:'fixed', inset:0, zIndex:60, background:'rgba(15,23,42,0.5)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}>
      <div style={{ background:'var(--background)', borderRadius:'12px', width:'100%', maxWidth:'500px', boxShadow:'0 24px 60px rgba(0,0,0,0.2)', display:'flex', flexDirection:'column', maxHeight:'80vh' }}>
        <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border)' }}>
          <h2 style={{ fontSize:'1rem', fontWeight:700, margin:0, color:'var(--text-primary)' }}>Eventos encontrados na foto</h2>
          <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', margin:'0.2rem 0 0' }}>Selecione os que quer importar</p>
        </div>
        <div style={{ overflowY:'auto', flex:1, padding:'1rem 1.5rem', display:'flex', flexDirection:'column', gap:'0.6rem' }}>
          {drafts.length === 0 && <p style={{ color:'var(--text-muted)', textAlign:'center', padding:'2rem 0', fontSize:'0.88rem' }}>Nenhum evento identificado.</p>}
          {drafts.map(d => (
            <label key={d._key} style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem', padding:'0.75rem', background: sel.has(d._key) ? 'var(--surface)' : 'transparent', border:`1px solid ${sel.has(d._key) ? 'var(--accent)' : 'var(--border)'}`, borderRadius:'8px', cursor:'pointer' }}>
              <input type="checkbox" checked={sel.has(d._key)} onChange={() => toggle(d._key)} style={{ marginTop:'2px', accentColor:'var(--accent)' }} />
              <div>
                <div style={{ fontWeight:600, fontSize:'0.9rem', color:'var(--text-primary)' }}>{d.title}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{format(parseISO(d.starts_at), "dd/MM · HH:mm", { locale:ptBR })}{d.location ? ` · ${d.location}` : ''}</div>
                <span style={{ fontSize:'0.68rem', background: EVENT_TYPE_COLORS[d.event_type]+'22', color: EVENT_TYPE_COLORS[d.event_type], borderRadius:'4px', padding:'1px 6px', fontWeight:600 }}>{EVENT_TYPE_LABELS[d.event_type]}</span>
              </div>
            </label>
          ))}
        </div>
        <div style={{ padding:'1rem 1.5rem', borderTop:'1px solid var(--border)', display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
          <button onClick={onCancel} style={{ padding:'0.55rem 1.1rem', borderRadius:'7px', border:'1px solid var(--border)', background:'none', cursor:'pointer', fontSize:'0.85rem', color:'var(--text-secondary)' }}>Cancelar</button>
          <button onClick={() => onConfirm(drafts.filter(d => sel.has(d._key)))} disabled={sel.size===0} style={{ padding:'0.55rem 1.25rem', borderRadius:'7px', border:'none', background:'var(--accent)', color:'#fff', cursor: sel.size===0 ? 'not-allowed':'pointer', fontSize:'0.85rem', fontWeight:600, opacity: sel.size===0 ? 0.5:1 }}>
            Importar {sel.size > 0 ? `(${sel.size})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Quick add ─────────────────────────────────────────────────────────────────

function QuickAdd({ date, hour, onSave, onClose }: {
  date: Date; hour: number
  onSave: (b: CreateAgendaEvent) => Promise<void>
  onClose: () => void
}) {
  const [title, setTitle]   = useState('')
  const [type, setType]     = useState<AgendaEvent['event_type']>('outro')
  const [loc, setLoc]       = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!title.trim()) return
    setSaving(true)
    const starts = new Date(date)
    starts.setHours(hour, 0, 0, 0)
    const ends = new Date(starts.getTime() + 3_600_000)
    await onSave({ title, event_type: type, description:null, starts_at: starts.toISOString(), ends_at: ends.toISOString(), all_day: false, location: loc || null, organization:null, status:'confirmado', project_id:null, color:null, meta:{} })
    setSaving(false)
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:60, background:'rgba(15,23,42,0.45)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background:'var(--background)', borderRadius:'12px', width:'100%', maxWidth:'380px', padding:'1.5rem', boxShadow:'0 24px 60px rgba(0,0,0,0.18)' }}>
        <h2 style={{ fontSize:'0.92rem', fontWeight:700, margin:'0 0 1rem', color:'var(--text-primary)', fontFamily:'system-ui' }}>
          {String(hour).padStart(2,'0')}:00 · {format(date, "dd 'de' MMMM", { locale:ptBR })}
        </h2>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
          <input autoFocus placeholder="Título do compromisso" value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key==='Enter' && save()}
            style={{ width:'100%', padding:'0.6rem 0.8rem', border:'1.5px solid var(--border)', borderRadius:'7px', fontSize:'0.88rem', color:'var(--text-primary)', background:'var(--background)', boxSizing:'border-box' }} />
          <select value={type} onChange={e => setType(e.target.value as AgendaEvent['event_type'])}
            style={{ width:'100%', padding:'0.55rem 0.7rem', border:'1px solid var(--border)', borderRadius:'6px', fontSize:'0.85rem', background:'var(--background)', color:'var(--text-primary)', boxSizing:'border-box' }}>
            {ALL_EVENT_TYPES.map(t => <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>)}
          </select>
          <input placeholder="Local (opcional)" value={loc} onChange={e => setLoc(e.target.value)}
            style={{ width:'100%', padding:'0.6rem 0.8rem', border:'1px solid var(--border)', borderRadius:'7px', fontSize:'0.85rem', color:'var(--text-primary)', background:'var(--background)', boxSizing:'border-box' }} />
        </div>
        <div style={{ display:'flex', gap:'0.6rem', justifyContent:'flex-end', marginTop:'1.25rem' }}>
          <button onClick={onClose} style={{ padding:'0.55rem 1rem', borderRadius:'7px', border:'1px solid var(--border)', background:'none', cursor:'pointer', fontSize:'0.85rem', color:'var(--text-secondary)', fontFamily:'system-ui' }}>Cancelar</button>
          <button onClick={save} disabled={!title.trim() || saving} style={{ padding:'0.55rem 1.25rem', borderRadius:'7px', border:'none', background:'var(--accent)', color:'#fff', cursor:'pointer', fontSize:'0.85rem', fontWeight:600, opacity: !title.trim() || saving ? 0.6:1, fontFamily:'system-ui' }}>
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Diary Page ────────────────────────────────────────────────────────────────

function DiaryPage({ day, events, onSlotClick }: {
  day: Date
  events: AgendaEvent[]
  onSlotClick: (hour: number) => void
}) {
  const dayEvents = events.filter(e => isSameDay(parseISO(e.starts_at), day))
  const month = monthName(day)
  const dayNum = format(day, 'd')
  const dow = dayOfWeekPt(day)

  // map events by hour
  const byHour: Record<number, AgendaEvent[]> = {}
  dayEvents.forEach(ev => {
    const h = parseISO(ev.starts_at).getHours()
    if (!byHour[h]) byHour[h] = []
    byHour[h].push(ev)
  })

  return (
    <div style={{
      background: '#FDFAF2',
      border: '1px solid #C8B87A',
      borderRadius: '2px',
      boxShadow: '2px 3px 14px rgba(100,80,20,0.13)',
      width: '100%',
      maxWidth: '480px',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Georgia', 'Times New Roman', serif",
    }}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.85rem 1.1rem 0.55rem',
        borderBottom: '2px solid #1a1208',
      }}>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1208', letterSpacing: '-0.01em' }}>{month}</div>
          <div style={{ fontSize: '0.6rem', color: '#888', fontFamily: 'system-ui', textTransform: 'capitalize', marginTop: '1px' }}>{dow}</div>
        </div>

        <div style={{ fontSize: '3rem', fontWeight: 800, color: '#1a1208', lineHeight: 1, letterSpacing: '-0.04em' }}>
          {dayNum}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
          <WeekDots day={day} />
          <div style={{ fontSize: '0.55rem', color: '#aaa', fontFamily: 'system-ui' }}>{format(day, 'yyyy')}</div>
        </div>
      </div>

      {/* ── Hour lines ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1 }}>
        {HOURS.map(h => {
          const evs = byHour[h] ?? []
          return (
            <div
              key={h}
              onClick={() => onSlotClick(h)}
              style={{
                display: 'grid',
                gridTemplateColumns: '36px 1fr',
                borderBottom: '1px solid #D9CC9A',
                minHeight: evs.length > 0 ? 'auto' : '32px',
                cursor: 'pointer',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(180,160,60,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* hour label */}
              <div style={{
                padding: '7px 6px 0 10px',
                fontSize: '0.65rem', color: '#9A8A50',
                fontFamily: 'system-ui', fontWeight: 600,
                userSelect: 'none',
              }}>
                {String(h).padStart(2,'0')}
              </div>

              {/* content area */}
              <div style={{ padding: '4px 8px 4px 0', minHeight: '28px' }}>
                {evs.map(ev => {
                  const color = ev.color ?? EVENT_TYPE_COLORS[ev.event_type] ?? '#3B82F6'
                  return (
                    <div key={ev.id} style={{
                      display: 'flex', alignItems: 'baseline', gap: '5px',
                      padding: '1px 0',
                    }}>
                      <div style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: color, flexShrink: 0, marginTop: '2px',
                      }} />
                      <div style={{ fontSize: '0.78rem', color: '#1a1208', lineHeight: 1.3, fontWeight: 500 }}>
                        {format(parseISO(ev.starts_at), 'HH:mm')} {ev.title}
                        {ev.location && <span style={{ color: '#9A8A50', fontStyle: 'italic', fontWeight: 400 }}> · {ev.location}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Importante ──────────────────────────────────────────────────── */}
      <div style={{ borderTop: '1.5px solid #1a1208', padding: '0.5rem 1.1rem 0.8rem' }}>
        <div style={{
          fontSize: '0.58rem', fontWeight: 700, color: '#1a1208',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          fontFamily: 'system-ui', marginBottom: '0.4rem',
        }}>
          Importante <span style={{ fontWeight: 400, color: '#aaa', fontStyle: 'italic' }}>Important</span>
        </div>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} style={{ borderBottom: '1px solid #D9CC9A', height: '22px', marginBottom: '2px' }} />
        ))}
      </div>
    </div>
  )
}

// ── Weekly Spread View ────────────────────────────────────────────────────────

const SLOT_H = 52
const DAY_LABELS_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

function WeeklySpread({ weekStart, events, onSlotClick }: {
  weekStart: Date
  events: AgendaEvent[]
  onSlotClick: (date: Date, hour: number) => void
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  function topForTime(iso: string) {
    const d = parseISO(iso)
    return Math.max(0, (d.getHours() + d.getMinutes() / 60 - 7) * SLOT_H)
  }
  function heightForEvent(ev: AgendaEvent) {
    const ms = parseISO(ev.ends_at).getTime() - parseISO(ev.starts_at).getTime()
    return Math.max(20, (ms / 3_600_000) * SLOT_H)
  }

  return (
    <div style={{ background:'#FDFAF2', border:'1px solid #C8B87A', borderRadius:'2px', boxShadow:'2px 3px 14px rgba(100,80,20,0.13)', overflow:'hidden', fontFamily:"'Georgia','Times New Roman',serif" }}>
      {/* day headers */}
      <div style={{ display:'grid', gridTemplateColumns:'40px repeat(7,1fr)', borderBottom:'2px solid #1a1208', background:'#F5EFD0' }}>
        <div />
        {days.map((d,i) => {
          const ds = format(d,'yyyy-MM-dd')
          const isToday = ds === todayStr
          return (
            <div key={i} style={{ padding:'0.55rem 0.3rem', textAlign:'center', borderLeft: i===0?'none':'1px solid #D4C89A' }}>
              <div style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', color: isToday?'#8a5c1a':'#8B7A45', fontFamily:'system-ui' }}>{DAY_LABELS_SHORT[i]}</div>
              <div style={{ fontSize:'1rem', fontWeight:700, color: isToday?'#8a5c1a':'#1a1208', background: isToday?'#F5DFA0':'none', borderRadius:'50%', width:'1.8rem', height:'1.8rem', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto' }}>{format(d,'d')}</div>
            </div>
          )
        })}
      </div>
      {/* grid */}
      <div style={{ display:'grid', gridTemplateColumns:'40px repeat(7,1fr)' }}>
        {/* hour labels */}
        <div>
          {HOURS.map(h => <div key={h} style={{ height:`${SLOT_H}px`, display:'flex', alignItems:'flex-start', paddingTop:'4px', paddingRight:'5px', justifyContent:'flex-end', fontSize:'0.6rem', color:'#9A8A50', fontFamily:'system-ui', fontWeight:500, borderTop:'1px solid #E8DCBB' }}>{String(h).padStart(2,'0')}</div>)}
        </div>
        {/* day columns */}
        {days.map((d,di) => {
          const dayEvs = events.filter(e => isSameDay(parseISO(e.starts_at), d) && !e.all_day)
          return (
            <div key={di} style={{ position:'relative', borderLeft:'1px solid #D4C89A' }}>
              {HOURS.map(h => (
                <div key={h} onClick={() => onSlotClick(d, h)} style={{ height:`${SLOT_H}px`, borderTop:'1px solid #E8DCBB', cursor:'pointer' }}
                  onMouseEnter={e=>(e.currentTarget.style.background='rgba(180,160,60,0.06)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='transparent')} />
              ))}
              {dayEvs.map(ev => {
                const color = ev.color ?? EVENT_TYPE_COLORS[ev.event_type] ?? '#3B82F6'
                return (
                  <div key={ev.id} style={{ position:'absolute', top:`${topForTime(ev.starts_at)}px`, left:'2px', right:'2px', height:`${heightForEvent(ev)}px`, background: color+'DD', borderLeft:`3px solid ${color}`, borderRadius:'3px', padding:'2px 4px', overflow:'hidden', zIndex:2 }}>
                    <div style={{ fontSize:'0.62rem', fontWeight:700, color:'#fff', lineHeight:1.2, fontFamily:'system-ui' }}>{ev.title}</div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface Props {
  initialEvents: AgendaEvent[]
  initialWeekStart: string
}

export default function CadernoClient({ initialEvents, initialWeekStart }: Props) {
  const [view, setView]           = useState<'pagina' | 'semana'>('pagina')
  const [currentDay, setCurrentDay] = useState<Date>(() => {
    const today = new Date()
    const ws = parseISO(initialWeekStart)
    return today >= ws && today < addDays(ws, 7) ? today : ws
  })
  const weekStart = startOfWeek(currentDay, { weekStartsOn: 0 })
  const [events, setEvents]     = useState<AgendaEvent[]>(initialEvents)
  const [loading, setLoading]   = useState(false)

  // Import
  const [importing, setImporting]     = useState(false)
  const [importDrafts, setImportDrafts] = useState<ImportDraft[] | null>(null)
  const [importError, setImportError]   = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Quick add
  const [quickHour, setQuickHour] = useState<number | null>(null)

  // ── Day navigation ───────────────────────────────────────────────────────────

  const goToDay = useCallback(async (d: Date) => {
    setLoading(true)
    const from = new Date(d); from.setHours(0,0,0,0)
    const to   = new Date(d); to.setHours(23,59,59,999)
    const res  = await fetch(`/api/agenda/events?from=${from.toISOString()}&to=${to.toISOString()}&limit=50`)
    const json = await res.json()
    // merge into events pool (replace day's events)
    setEvents(prev => {
      const others = prev.filter(e => !isSameDay(parseISO(e.starts_at), d))
      return [...others, ...(json.data ?? [])]
    })
    setCurrentDay(d)
    setLoading(false)
  }, [])

  const prevDay  = () => goToDay(subDays(currentDay, 1))
  const nextDay  = () => goToDay(addDays(currentDay, 1))
  const prevWeek = () => goToDay(subWeeks(currentDay, 1))
  const nextWeek = () => goToDay(addWeeks(currentDay, 1))
  const goToday  = () => goToDay(new Date())

  // ── Photo import ─────────────────────────────────────────────────────────────

  const handleFile = useCallback(async (file: File) => {
    setImporting(true); setImportError(null)
    try {
      const buf  = await file.arrayBuffer()
      const b64  = btoa(String.fromCharCode(...new Uint8Array(buf)))
      const res  = await fetch('/api/agenda/import', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: b64, mediaType: file.type || 'image/jpeg', referenceDate: format(currentDay, 'yyyy-MM-dd') }),
      })
      const json = await res.json()
      if (!res.ok) { setImportError(json.error ?? 'Erro'); return }
      setImportDrafts((json.events ?? []).map((e: CreateAgendaEvent, i: number) => ({ ...e, _key: `d${i}` })))
    } catch { setImportError('Erro inesperado.') }
    finally { setImporting(false) }
  }, [currentDay])

  const confirmImport = useCallback(async (selected: ImportDraft[]) => {
    const saved: AgendaEvent[] = []
    for (const { _key, ...body } of selected) {
      void _key
      const r = await fetch('/api/agenda/events', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
      const j = await r.json()
      if (j.id) saved.push(j)
    }
    setEvents(prev => [...prev, ...saved])
    setImportDrafts(null)
  }, [])

  // ── Quick add save ───────────────────────────────────────────────────────────

  const saveQuick = useCallback(async (body: CreateAgendaEvent) => {
    const r = await fetch('/api/agenda/events', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
    const j = await r.json()
    if (j.id) setEvents(prev => [...prev, j])
    setQuickHour(null)
  }, [])

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @media print {
          .caderno-toolbar { display: none !important; }
          body { background: white !important; }
          .caderno-page-wrap { justify-content: flex-start !important; }
        }
      `}</style>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="caderno-toolbar" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>

        {/* Nav + view toggle */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap' }}>
          <button onClick={view === 'pagina' ? prevDay : prevWeek} style={btnStyle}>←</button>
          <button onClick={goToday} style={{ ...btnStyle, fontSize:'0.72rem', padding:'0.35rem 0.8rem' }}>Hoje</button>
          <button onClick={view === 'pagina' ? nextDay : nextWeek} style={btnStyle}>→</button>

          {/* view toggle */}
          <div style={{ display:'flex', borderRadius:'7px', border:'1px solid var(--border)', overflow:'hidden', marginLeft:'0.25rem' }}>
            {(['pagina','semana'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding:'0.38rem 0.8rem', border:'none', background: view===v ? 'var(--accent)' : 'var(--background)', color: view===v ? '#fff' : 'var(--text-muted)', cursor:'pointer', fontSize:'0.72rem', fontWeight: view===v ? 700 : 400, fontFamily:'system-ui' }}>
                {v === 'pagina' ? '📄 Página' : '📅 Semana'}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value='' }} />
          <button onClick={() => fileRef.current?.click()} disabled={importing} style={{ ...btnStyle, display:'flex', alignItems:'center', gap:'0.4rem', fontFamily:'system-ui', fontWeight:600 }}>
            {importing ? '⏳ Analisando…' : '📷 Importar Foto'}
          </button>
          <button onClick={() => window.print()} style={{ ...btnStyle, fontFamily:'system-ui', fontWeight:600 }}>
            🖨 Imprimir
          </button>
        </div>
      </div>

      {importError && (
        <div style={{ background:'#FEF2F2', border:'1px solid #FCA5A5', borderRadius:'8px', padding:'0.75rem 1rem', marginBottom:'1rem', fontSize:'0.82rem', color:'#991B1B', fontFamily:'system-ui' }}>
          {importError}
        </div>
      )}

      {/* ── Page / Week ──────────────────────────────────────────────────────── */}
      <div className="caderno-page-wrap" style={{ display:'flex', justifyContent:'center', opacity: loading ? 0.5 : 1, transition:'opacity 0.15s' }}>
        {view === 'pagina' ? (
          <DiaryPage
            day={currentDay}
            events={events}
            onSlotClick={setQuickHour}
          />
        ) : (
          <div style={{ width:'100%' }}>
            <WeeklySpread
              weekStart={weekStart}
              events={events}
              onSlotClick={(date, hour) => { setCurrentDay(date); setQuickHour(hour) }}
            />
          </div>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      {importDrafts !== null && (
        <ImportPreview drafts={importDrafts} onConfirm={confirmImport} onCancel={() => setImportDrafts(null)} />
      )}
      {quickHour !== null && (
        <QuickAdd date={currentDay} hour={quickHour} onSave={saveQuick} onClose={() => setQuickHour(null)} />
      )}
    </>
  )
}

const btnStyle: React.CSSProperties = {
  padding: '0.4rem 0.85rem', borderRadius: '6px',
  border: '1px solid var(--border)', background: 'var(--background)',
  cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'system-ui',
  color: 'var(--text-primary)',
}
