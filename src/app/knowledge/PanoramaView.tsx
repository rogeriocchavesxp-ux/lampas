'use client'

import { useMemo, useState } from 'react'
import type { KnowledgeItem } from './knowledge-internals'

interface Props {
  items: KnowledgeItem[]
  onSelect: (item: KnowledgeItem) => void
}

type Testament = 'AT' | 'NT'

const AT_SECTIONS = [
  'Pentateuco',
  'Históricos',
  'Poéticos e Sapienciais',
  'Profetas Maiores',
  'Profetas Menores',
] as const

const NT_SECTIONS = [
  'Evangelhos',
  'Histórico NT',
  'Cartas Paulinas',
  'Hebreus',
  'Cartas Gerais',
  'Profecia NT',
] as const

const SECTION_COUNTS: Record<string, number> = {
  'Pentateuco': 5,
  'Históricos': 12,
  'Poéticos e Sapienciais': 5,
  'Profetas Maiores': 5,
  'Profetas Menores': 12,
  'Evangelhos': 4,
  'Histórico NT': 1,
  'Cartas Paulinas': 13,
  'Hebreus': 1,
  'Cartas Gerais': 7,
  'Profecia NT': 1,
}

const SECTION_COLORS: Record<string, { accent: string; bg: string; border: string }> = {
  'Pentateuco':            { accent: '#7C2D12', bg: '#FFF7ED', border: '#FED7AA' },
  'Históricos':            { accent: '#1E3A5F', bg: '#EFF6FF', border: '#BFDBFE' },
  'Poéticos e Sapienciais':{ accent: '#713F12', bg: '#FFFBEB', border: '#FDE68A' },
  'Profetas Maiores':      { accent: '#3730A3', bg: '#EEF2FF', border: '#C7D2FE' },
  'Profetas Menores':      { accent: '#164E63', bg: '#ECFEFF', border: '#A5F3FC' },
  'Evangelhos':            { accent: '#14532D', bg: '#F0FDF4', border: '#BBF7D0' },
  'Histórico NT':          { accent: '#1C4532', bg: '#F0FDF4', border: '#86EFAC' },
  'Cartas Paulinas':       { accent: '#4C1D95', bg: '#F5F3FF', border: '#DDD6FE' },
  'Hebreus':               { accent: '#7C2D12', bg: '#FFF7ED', border: '#FDBA74' },
  'Cartas Gerais':         { accent: '#831843', bg: '#FDF2F8', border: '#F9A8D4' },
  'Profecia NT':           { accent: '#450A0A', bg: '#FFF1F2', border: '#FECDD3' },
}

const ORDER_IN_SECTION: Record<string, string[]> = {
  'Pentateuco': ['Gênesis', 'Êxodo', 'Levítico', 'Números', 'Deuteronômio'],
  'Históricos': ['Josué', 'Juízes', 'Rute', '1 Samuel', '2 Samuel', '1 Reis', '2 Reis', '1 Crônicas', '2 Crônicas', 'Esdras', 'Neemias', 'Ester'],
  'Poéticos e Sapienciais': ['Jó', 'Salmos', 'Provérbios', 'Eclesiastes', 'Cântico dos Cânticos'],
  'Profetas Maiores': ['Isaías', 'Jeremias', 'Lamentações', 'Ezequiel', 'Daniel'],
  'Profetas Menores': ['Oseias', 'Joel', 'Amós', 'Obadias', 'Jonas', 'Miquéias', 'Naum', 'Habacuque', 'Sofonias', 'Ageu', 'Zacarias', 'Malaquias'],
  'Evangelhos': ['Mateus', 'Marcos', 'Lucas', 'João'],
  'Histórico NT': ['Atos dos Apóstolos'],
  'Cartas Paulinas': ['Romanos', '1 Coríntios', '2 Coríntios', 'Gálatas', 'Efésios', 'Filipenses', 'Colossenses', '1 Tessalonicenses', '2 Tessalonicenses', '1 Timóteo', '2 Timóteo', 'Tito', 'Filemom'],
  'Hebreus': ['Hebreus'],
  'Cartas Gerais': ['Tiago', '1 Pedro', '2 Pedro', '1 João', '2 João', '3 João', 'Judas'],
  'Profecia NT': ['Apocalipse'],
}

function sortByCanonicalOrder(items: KnowledgeItem[], section: string): KnowledgeItem[] {
  const order = ORDER_IN_SECTION[section] ?? []
  return [...items].sort((a, b) => {
    const ai = order.indexOf(a.title)
    const bi = order.indexOf(b.title)
    if (ai === -1 && bi === -1) return a.title.localeCompare(b.title, 'pt')
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
}

export default function PanoramaView({ items, onSelect }: Props) {
  const [testament, setTestament] = useState<Testament>('AT')
  const [section, setSection] = useState<string>('Pentateuco')

  const panoramaItems = useMemo(
    () => items.filter(i => i.category === 'panorama_biblico'),
    [items]
  )

  const sections = testament === 'AT' ? AT_SECTIONS : NT_SECTIONS

  const sectionItems = useMemo(() => {
    const raw = panoramaItems.filter(i => i.subcategory === section)
    return sortByCanonicalOrder(raw, section)
  }, [panoramaItems, section])

  const atCount  = useMemo(() => panoramaItems.filter(i => AT_SECTIONS.includes(i.subcategory as typeof AT_SECTIONS[number])).length, [panoramaItems])
  const ntCount  = useMemo(() => panoramaItems.filter(i => NT_SECTIONS.includes(i.subcategory as typeof NT_SECTIONS[number])).length, [panoramaItems])
  const color    = SECTION_COLORS[section] ?? { accent: '#334155', bg: '#F8FAFC', border: '#E2E8F0' }

  function switchTestament(t: Testament) {
    setTestament(t)
    setSection(t === 'AT' ? 'Pentateuco' : 'Evangelhos')
  }

  if (panoramaItems.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', color: '#94A3B8', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📖</div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>Panorama Bíblico não encontrado</div>
        <div style={{ fontSize: '0.82rem', maxWidth: '380px', lineHeight: 1.65 }}>
          Execute a migration <code style={{ background: '#F1F5F9', padding: '0.1rem 0.3rem', borderRadius: '4px', fontSize: '0.78rem' }}>037_panorama_biblico.sql</code> no Supabase SQL Editor para carregar os 66 livros.
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>

      {/* Cabeçalho */}
      <div style={{ padding: '1rem 1.5rem 0', borderBottom: '1px solid #E2E8F0', background: '#FFFFFF', flexShrink: 0 }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.15rem' }}>
            Panorama Bíblico · {panoramaItems.length} livros
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
            Visão geral dos 66 livros canônicos organizados por seção
          </div>
        </div>

        {/* Testamento tabs */}
        <div style={{ display: 'flex', gap: '0' }}>
          {(['AT', 'NT'] as Testament[]).map(t => (
            <button
              key={t}
              onClick={() => switchTestament(t)}
              style={{
                padding: '0.5rem 1.25rem',
                border: 'none',
                borderBottom: testament === t ? `2px solid ${color.accent}` : '2px solid transparent',
                background: 'transparent',
                color: testament === t ? color.accent : '#94A3B8',
                fontWeight: testament === t ? 800 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.12s',
              }}
            >
              {t === 'AT' ? `Antigo Testamento (${atCount})` : `Novo Testamento (${ntCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Seções */}
      <div style={{ display: 'flex', gap: '0.35rem', padding: '0.65rem 1.5rem', borderBottom: '1px solid #F1F5F9', background: '#FAFAFA', overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0 }}>
        {sections.map(sec => {
          const c = SECTION_COLORS[sec]
          const active = section === sec
          const count = panoramaItems.filter(i => i.subcategory === sec).length
          return (
            <button
              key={sec}
              onClick={() => setSection(sec)}
              style={{
                flexShrink: 0,
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                border: `1.5px solid ${active ? c.accent : c.border}`,
                background: active ? c.bg : '#FFFFFF',
                color: active ? c.accent : '#64748B',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: active ? 800 : 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.12s',
              }}
            >
              {sec}
              {count > 0 && (
                <span style={{
                  fontSize: '0.62rem', fontWeight: 800,
                  background: active ? c.accent : c.border,
                  color: active ? '#FFFFFF' : '#64748B',
                  borderRadius: '999px',
                  padding: '0 0.35rem', lineHeight: '1.5',
                }}>
                  {count}/{SECTION_COUNTS[sec] ?? '?'}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Grid de livros */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
        {sectionItems.length === 0 ? (
          <div style={{ color: '#94A3B8', fontSize: '0.82rem', textAlign: 'center', padding: '2rem' }}>
            Nenhum livro encontrado para esta seção.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem' }}>
            {sectionItems.map(item => (
              <BookCard key={item.id} item={item} color={color} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BookCard({ item, color, onSelect }: { item: KnowledgeItem; color: { accent: string; bg: string; border: string }; onSelect: (item: KnowledgeItem) => void }) {
  const [hovered, setHovered] = useState(false)

  const purpose = (item.content as Record<string, string>)?.purpose ?? ''
  const keyPassages = (item.content as Record<string, string>)?.key_passages ?? ''

  return (
    <button
      onClick={() => onSelect(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '0.5rem',
        padding: '1rem 1.1rem',
        border: `1.5px solid ${hovered ? color.accent + 'AA' : color.border}`,
        background: hovered ? color.bg : '#FFFFFF',
        borderRadius: '10px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
        transition: 'all 0.13s',
        boxShadow: hovered ? `0 4px 14px ${color.accent}15` : 'none',
      }}
    >
      {/* Título */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: color.accent, letterSpacing: '-0.01em' }}>
          {item.title}
        </span>
        {item.rating && (
          <span style={{ fontSize: '0.62rem', color: '#D97706', flexShrink: 0 }}>
            {'★'.repeat(item.rating)}
          </span>
        )}
      </div>

      {/* Subtítulo */}
      {item.subtitle && (
        <div style={{ fontSize: '0.72rem', color: '#64748B', fontStyle: 'italic', lineHeight: 1.4 }}>
          {item.subtitle}
        </div>
      )}

      {/* Propósito */}
      {purpose && (
        <div style={{ fontSize: '0.75rem', color: '#334155', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
          {purpose}
        </div>
      )}

      {/* Temas */}
      {item.themes.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.15rem' }}>
          {item.themes.slice(0, 3).map(t => (
            <span
              key={t}
              style={{ fontSize: '0.62rem', fontWeight: 700, background: color.bg, color: color.accent, border: `1px solid ${color.border}`, borderRadius: '4px', padding: '0.1rem 0.4rem' }}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Passagens-chave */}
      {keyPassages && (
        <div style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '0.1rem', borderTop: `1px solid ${color.border}`, paddingTop: '0.45rem', width: '100%' }}>
          <span style={{ fontWeight: 700, color: color.accent + 'BB' }}>Passagens: </span>{keyPassages}
        </div>
      )}
    </button>
  )
}
