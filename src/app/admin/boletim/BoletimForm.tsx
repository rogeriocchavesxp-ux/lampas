'use client'

import { useRef, useState, useTransition } from 'react'
import { createBoletimEntry, updateBoletimEntry, deleteBoletimEntry } from './actions'

const ALL_TAGS = ['feat', 'fix', 'design', 'performance', 'conteúdo'] as const

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
          <label htmlFor="version" style={labelStyle}>Versão</label>
          <input
            id="version"
            name="version"
            type="text"
            required
            placeholder="0.2.1"
            defaultValue={entry?.version}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="release_date" style={labelStyle}>Data de lançamento</label>
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
        <label htmlFor="title" style={labelStyle}>Título</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Ex: Novo modo de Estudo Doutrinário"
          defaultValue={entry?.title}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={labelStyle}>Tags</label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {ALL_TAGS.map(tag => (
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
        <label htmlFor="content" style={labelStyle}>
          Conteúdo{' '}
          <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(markdown)</span>
        </label>
        <textarea
          id="content"
          name="content"
          rows={14}
          placeholder={'## Novidades\n\n- Descrição do que foi adicionado\n- Outra melhoria\n\n## Correções\n\n- Bug corrigido'}
          defaultValue={entry?.content}
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'ui-monospace, monospace', fontSize: '0.82rem', lineHeight: 1.6 }}
        />
      </div>

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
