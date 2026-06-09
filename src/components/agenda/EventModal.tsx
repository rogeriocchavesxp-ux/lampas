'use client'

import { useState, useEffect } from 'react'
import type { AgendaEvent, CreateAgendaEvent, AgendaEventType, AgendaEventStatus } from '@/types/agenda'
import { ALL_EVENT_TYPES, EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from '@/types/agenda'
import { format, parseISO } from 'date-fns'

interface Props {
  eventId: string | null
  defaultDate?: Date
  onClose: () => void
  onSaved: (event: AgendaEvent) => void
  onDeleted?: (id: string) => void
}

const EMPTY_FORM: CreateAgendaEvent = {
  title:        '',
  event_type:   'pregacao',
  description:  null,
  starts_at:    '',
  ends_at:      '',
  all_day:      false,
  location:     null,
  organization: null,
  status:       'confirmado',
  project_id:   null,
  color:        null,
  meta:         {},
}

function isoToDatePart(iso: string): string {
  if (!iso) return ''
  try { return format(parseISO(iso), 'yyyy-MM-dd') } catch { return '' }
}

function isoToTimePart(iso: string): string {
  if (!iso) return ''
  try { return format(parseISO(iso), 'HH:mm') } catch { return '' }
}

function partsToISO(date: string, time: string): string {
  if (!date) return ''
  return new Date(`${date}T${time || '00:00'}`).toISOString()
}

function addOneMinute(time: string): string {
  if (!time) return '00:01'
  const [h, m] = time.split(':').map(Number)
  const total  = h * 60 + m + 1
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

const DB_ERROR_MAP: Record<string, string> = {
  ends_after_starts: 'O término deve ser posterior ao início.',
}

function mapApiError(raw: string): string {
  for (const [key, msg] of Object.entries(DB_ERROR_MAP)) {
    if (raw.includes(key)) return msg
  }
  return 'Erro ao salvar. Tente novamente.'
}

export default function EventModal({ eventId, defaultDate, onClose, onSaved, onDeleted }: Props) {
  const isCreate       = !eventId
  const [form, setForm]       = useState<CreateAgendaEvent>(EMPTY_FORM)
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [loaded, setLoaded]   = useState(isCreate)

  useEffect(() => {
    if (isCreate) {
      const base = defaultDate ?? new Date()
      const end  = new Date(base.getTime() + 60 * 60 * 1000)
      setForm({ ...EMPTY_FORM, starts_at: base.toISOString(), ends_at: end.toISOString() })
      return
    }
    fetch(`/api/agenda/events/${eventId}`)
      .then(r => r.json())
      .then(({ data }) => {
        if (data) {
          setForm({
            title:        data.title,
            event_type:   data.event_type,
            description:  data.description,
            starts_at:    data.starts_at,
            ends_at:      data.ends_at,
            all_day:      data.all_day,
            location:     data.location,
            organization: data.organization,
            status:       data.status,
            project_id:   data.project_id,
            color:        data.color,
            meta:         data.meta ?? {},
          })
          setLoaded(true)
        }
      })
  }, [eventId, isCreate, defaultDate])

  function update(patch: Partial<CreateAgendaEvent>) {
    setForm(f => ({ ...f, ...patch }))
    setError(null)
  }

  function handleStartChange(date: string, time: string) {
    const newStart  = partsToISO(date, time)
    if (!newStart) return
    const startMs   = new Date(newStart).getTime()
    const endMs     = form.ends_at ? new Date(form.ends_at).getTime() : 0
    const updates: Partial<CreateAgendaEvent> = { starts_at: newStart }
    if (endMs <= startMs) {
      updates.ends_at = new Date(startMs + 60 * 60 * 1000).toISOString()
    }
    setForm(f => ({ ...f, ...updates }))
    setError(null)
  }

  const startDate = isoToDatePart(form.starts_at)
  const startTime = isoToTimePart(form.starts_at)
  const endDate   = isoToDatePart(form.ends_at)
  const endTime   = isoToTimePart(form.ends_at)

  const dateError =
    form.starts_at && form.ends_at && new Date(form.ends_at) <= new Date(form.starts_at)
      ? 'O término deve ser posterior ao início.'
      : null

  const endTimeMin = endDate === startDate ? addOneMinute(startTime) : undefined

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (dateError) { setError(dateError); return }
    setSaving(true)
    setError(null)
    try {
      const url    = isCreate ? '/api/agenda/events' : `/api/agenda/events/${eventId}`
      const method = isCreate ? 'POST' : 'PATCH'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) { setError(mapApiError(json.error ?? '')); return }
      onSaved(json.data)
    } catch {
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!eventId || !confirm('Excluir este evento?')) return
    setDeleting(true)
    try {
      await fetch(`/api/agenda/events/${eventId}`, { method: 'DELETE' })
      onDeleted?.(eventId)
    } finally {
      setDeleting(false)
    }
  }

  const color = EVENT_TYPE_COLORS[form.event_type as AgendaEventType] ?? '#3B82F6'

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 60, padding: '1rem',
      }}
    >
      <div style={{
        background: 'var(--surface)',
        borderRadius: '14px',
        border: '1px solid var(--border)',
        width: '100%', maxWidth: '520px',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 12px 40px rgba(15,23,42,0.18)',
        animation: 'fadeIn 0.15s ease-out',
        borderTop: `3px solid ${color}`,
      }}>
        <div style={{ padding: '1.5rem 1.75rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {isCreate ? 'Novo Evento' : 'Editar Evento'}
            </h2>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1, padding: '0.1rem' }}
            >×</button>
          </div>

          {!loaded ? (
            <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              Carregando…
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                <ModalField label="Título">
                  <input
                    value={form.title}
                    onChange={e => update({ title: e.target.value })}
                    placeholder="Ex: Pregação — Efésios 2.1-10"
                    required
                    style={inputStyle}
                  />
                </ModalField>

                <ModalField label="Tipo">
                  <select
                    value={form.event_type}
                    onChange={e => update({ event_type: e.target.value as AgendaEventType })}
                    style={inputStyle}
                  >
                    {ALL_EVENT_TYPES.map(t => (
                      <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </ModalField>

                {/* Início */}
                <ModalField label="Início">
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => handleStartChange(e.target.value, startTime)}
                      required
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <input
                      type="time"
                      value={startTime}
                      onChange={e => handleStartChange(startDate, e.target.value)}
                      required
                      style={{ ...inputStyle, width: '110px', flex: 'none' }}
                    />
                  </div>
                </ModalField>

                {/* Fim */}
                <ModalField label="Fim">
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={e => update({ ends_at: partsToISO(e.target.value, endTime) })}
                      required
                      style={{ ...inputStyle, flex: 1, borderColor: dateError ? '#EF4444' : undefined }}
                    />
                    <input
                      type="time"
                      value={endTime}
                      min={endTimeMin}
                      onChange={e => update({ ends_at: partsToISO(endDate, e.target.value) })}
                      required
                      style={{ ...inputStyle, width: '110px', flex: 'none', borderColor: dateError ? '#EF4444' : undefined }}
                    />
                  </div>
                  {dateError && (
                    <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: '#EF4444' }}>
                      {dateError}
                    </p>
                  )}
                </ModalField>

                <ModalField label="Local">
                  <input
                    value={form.location ?? ''}
                    onChange={e => update({ location: e.target.value || null })}
                    placeholder="Ex: Igreja Presbiteriana Central"
                    style={inputStyle}
                  />
                </ModalField>

                <ModalField label="Organização">
                  <input
                    value={form.organization ?? ''}
                    onChange={e => update({ organization: e.target.value || null })}
                    placeholder="Ex: Conselho de Pastores"
                    style={inputStyle}
                  />
                </ModalField>

                <ModalField label="Status">
                  <select
                    value={form.status}
                    onChange={e => update({ status: e.target.value as AgendaEventStatus })}
                    style={inputStyle}
                  >
                    <option value="confirmado">Confirmado</option>
                    <option value="tentativo">Tentativo</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </ModalField>

                <ModalField label="Descrição">
                  <textarea
                    value={form.description ?? ''}
                    onChange={e => update({ description: e.target.value || null })}
                    placeholder="Notas sobre o evento…"
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </ModalField>

                {error && (
                  <div style={{
                    color: '#DC2626', background: 'rgba(220,38,38,0.06)',
                    border: '1px solid rgba(220,38,38,0.2)',
                    borderRadius: '7px', padding: '0.6rem 0.85rem',
                    fontSize: '0.84rem',
                  }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.6rem', padding: '0 0 1.5rem' }}>
                  {!isCreate && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      style={{
                        padding: '0.62rem 0.85rem',
                        background: 'transparent', border: '1px solid #EF444430',
                        color: '#EF4444', borderRadius: '8px',
                        cursor: deleting ? 'wait' : 'pointer',
                        fontFamily: 'inherit', fontSize: '0.84rem',
                      }}
                    >
                      {deleting ? '…' : 'Excluir'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      flex: 1, padding: '0.62rem',
                      background: 'transparent', border: '1px solid var(--border)',
                      color: 'var(--text-secondary)', borderRadius: '8px',
                      cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem',
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !form.title || !form.starts_at || !form.ends_at || !!dateError}
                    style={{
                      flex: 2, padding: '0.62rem',
                      background: saving || !!dateError ? 'var(--surface-3)' : color,
                      color: '#FFFFFF', border: 'none',
                      borderRadius: '8px', fontWeight: 600,
                      cursor: saving ? 'wait' : 'pointer',
                      fontFamily: 'inherit', fontSize: '0.88rem',
                      transition: 'background 0.15s',
                    }}
                  >
                    {saving ? 'Salvando…' : isCreate ? 'Criar Evento' : 'Salvar'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.85rem',
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: '7px',
  color: 'var(--text-primary)',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: '0.72rem',
        color: 'var(--text-secondary)', marginBottom: '0.3rem',
        textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600,
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}
