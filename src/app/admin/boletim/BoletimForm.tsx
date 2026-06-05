'use client'

import { useRef, useState, useTransition } from 'react'
import { createBoletimEntry, updateBoletimEntry, deleteBoletimEntry } from './actions'
import {
  BOLETIM_ARTICLE_TEMPLATE,
  BOLETIM_CRITICAL_ONLY_SOURCES,
  BOLETIM_EDITORIAS,
  BOLETIM_FACTUAL_SOURCES,
  BOLETIM_PRIMARY_SOURCES,
  BOLETIM_SUBEDITORIAS,
} from '@/lib/boletim-editorial'

type Props = {
  entry?: {
    id: string
    version: string
    release_date: string
    title: string
    content: string
    tags: string[]
    published: boolean
  }
}

function GuideList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div style={{ color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem' }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
        {items.map(item => (
          <span
            key={item}
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 4,
              color: 'var(--text-muted)',
              fontSize: '0.66rem',
              padding: '0.14rem 0.35rem',
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function BoletimForm({ entry }: Props) {
  const isEdit = !!entry
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDelete] = useTransition()
  const [selectedTags, setSelectedTags] = useState<string[]>(entry?.tags ?? [])
  const [published, setPublished] = useState(entry?.published ?? false)
  const [error, setError] = useState<string | null>(null)

  function toggleTag(tag: string) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(formRef.current!)
    fd.set('tags', selectedTags.join(','))
    fd.set('published', String(published))

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateBoletimEntry(entry.id, fd)
        } else {
          await createBoletimEntry(fd)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar.')
      }
    })
  }

  function handleDelete() {
    if (!entry) return
    if (!confirm('Excluir esta entrada permanentemente?')) return
    startDelete(async () => {
      try {
        await deleteBoletimEntry(entry.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao excluir.')
      }
    })
  }

  function applyTemplate() {
    const form = formRef.current
    if (!form) return
    const field = form.elements.namedItem('content') as HTMLTextAreaElement | null
    if (!field) return
    field.value = field.value.trim() ? `${field.value.trim()}\n\n${BOLETIM_ARTICLE_TEMPLATE}` : BOLETIM_ARTICLE_TEMPLATE
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.6rem 0.75rem',
    border: '1px solid var(--border)',
    borderRadius: 8,
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    display: 'block',
    marginBottom: '0.4rem',
    letterSpacing: '0.02em',
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div>
          <label htmlFor="version" style={labelStyle}>Edição</label>
          <input
            id="version"
            name="version"
            type="text"
            required
            placeholder="2026.06.05"
            defaultValue={entry?.version}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="release_date" style={labelStyle}>Data da publicação</label>
          <input
            id="release_date"
            name="release_date"
            type="date"
            required
            defaultValue={entry?.release_date}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label htmlFor="title" style={labelStyle}>Manchete</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Ex: Por que a família cristã precisa recuperar o culto doméstico"
          defaultValue={entry?.title}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={labelStyle}>Editorias</label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {BOLETIM_EDITORIAS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              style={{
                padding: '0.3rem 0.7rem',
                borderRadius: 6,
                border: '1px solid',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                borderColor: selectedTags.includes(tag) ? '#c9921a' : 'var(--border)',
                background: selectedTags.includes(tag) ? '#c9921a18' : 'var(--surface)',
                color: selectedTags.includes(tag) ? '#a0720f' : 'var(--text-muted)',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={labelStyle}>Subeditorias</label>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {selectedTags.flatMap(tag => BOLETIM_SUBEDITORIAS[tag] ?? []).slice(0, 28).map(sub => (
            <button
              key={sub}
              type="button"
              onClick={() => toggleTag(sub)}
              style={{
                padding: '0.22rem 0.55rem',
                borderRadius: 5,
                border: '1px solid',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
                borderColor: selectedTags.includes(sub) ? '#c9921a' : 'var(--border)',
                background: selectedTags.includes(sub) ? '#c9921a18' : 'var(--surface)',
                color: selectedTags.includes(sub) ? '#a0720f' : 'var(--text-muted)',
              }}
            >
              {sub}
            </button>
          ))}
          {selectedTags.length === 0 && (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              Selecione uma editoria para ver subáreas.
            </span>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '0.4rem' }}>
          <label htmlFor="content" style={{ ...labelStyle, marginBottom: 0 }}>
            Conteúdo editorial <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(markdown)</span>
          </label>
          <button
            type="button"
            onClick={applyTemplate}
            style={{
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: '#a0720f',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '0.32rem 0.55rem',
            }}
          >
            Inserir modelo editorial
          </button>
        </div>
        <textarea
          id="content"
          name="content"
          rows={22}
          placeholder={BOLETIM_ARTICLE_TEMPLATE}
          defaultValue={entry?.content}
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'ui-monospace, monospace', fontSize: '0.82rem', lineHeight: 1.6 }}
        />
      </div>

      <aside style={{
        border: '1px solid var(--border-subtle)',
        background: 'var(--surface-2)',
        borderRadius: 10,
        padding: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ color: '#a0720f', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Editor-Chefe Lampas
        </div>
        <p style={{ margin: '0 0 0.75rem', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.55 }}>
          Produza em tom confessional, reformado, pastoral, intelectualmente robusto e culturalmente atento. Analise sempre por Criação, Queda, Redenção e Consumação.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem' }}>
          <GuideList title="Fontes prioritárias" items={BOLETIM_PRIMARY_SOURCES.slice(0, 10)} />
          <GuideList title="Factual" items={BOLETIM_FACTUAL_SOURCES} />
          <GuideList title="Somente crítica" items={BOLETIM_CRITICAL_ONLY_SOURCES} />
        </div>
      </aside>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={published}
            onChange={e => setPublished(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: '#c9921a' }}
          />
          Publicar imediatamente
        </label>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.3rem 0 0 1.6rem' }}>
          Entradas não publicadas ficam visíveis apenas aqui no admin.
        </p>
      </div>

      {error && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 8,
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          fontSize: '0.875rem',
          marginBottom: '1.25rem',
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        {isEdit ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: 8,
              border: '1px solid #fecaca',
              background: 'transparent',
              color: '#b91c1c',
              fontSize: '0.875rem',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              opacity: isDeleting ? 0.6 : 1,
            }}
          >
            {isDeleting ? 'Excluindo…' : 'Excluir entrada'}
          </button>
        ) : (
          <span />
        )}

        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '0.55rem 1.5rem',
            borderRadius: 8,
            background: '#c9921a',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.875rem',
            border: 'none',
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar entrada'}
        </button>
      </div>

    </form>
  )
}
