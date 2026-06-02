'use client'

// Sincronização das classificações do Texto Bíblico com o lampas_dictionary.
// Usa os campos existentes da tabela sem precisar de alteração de schema:
//   title        → selectedText
//   category     → ClassType mapeado para categoria do dicionário
//   occurrences  → JSON com posição exata (verse, offset, note, createdAt)
//   tags         → [classType, 'project_{projectId}'] para filtrar por projeto
//   sources      → ['classificacao'] para distinguir de verbetes normais
//   definition, etymology, theological_biblical, applications,
//   transliteration, bibliography → campos extendidos do estudo

import { createClient } from '@/lib/supabase/client'

// ── Tipo mínimo de classificação ─────────────────────────────────────────────

export interface Classification {
  id: string
  type: string
  selectedText: string
  startVerse: number
  endVerse: number
  startOffset: number
  endOffset: number
  note: string
  createdAt: string
  // Campos extendidos (estudo)
  definition?: string
  explanation?: string
  lexical_study?: string
  original_term?: string
  transliteration?: string
  meaning?: string
  occurrences_note?: string
  theological_biblical?: string
  narrative_function?: string
  applications?: string
  personal_notes?: string
}

// ── Mapeamento de categorias ──────────────────────────────────────────────────

const TYPE_TO_CAT: Record<string, string> = {
  personagem: 'personagem', cargo: 'personagem',
  lugar: 'lugar',
  tema: 'tema',
  termo_chave: 'termo_biblico', repeticao: 'termo_biblico',
  teologia: 'doutrina',
  tempo: 'conceito_historico', instituicao: 'conceito_historico',
  conflito: 'conceito_historico', objetivo: 'conceito_historico',
  comentario: 'conceito_historico', insight: 'conceito_historico',
  observacao: 'conceito_historico',
}

function encodePos(c: Classification): string {
  return JSON.stringify({
    sv: c.startVerse, ev: c.endVerse,
    so: c.startOffset, eo: c.endOffset,
    note: c.note, createdAt: c.createdAt,
  })
}

function decodePos(raw: string | null): Partial<Classification> {
  try {
    const d = JSON.parse(raw ?? '{}')
    return {
      startVerse: d.sv ?? 1, endVerse: d.ev ?? d.sv ?? 1,
      startOffset: d.so ?? 0, endOffset: d.eo ?? 0,
      note: d.note ?? '', createdAt: d.createdAt ?? new Date().toISOString(),
    }
  } catch {
    return { startVerse: 1, endVerse: 1, startOffset: 0, endOffset: 0, note: '', createdAt: new Date().toISOString() }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToCls(row: any): Classification {
  const typeTag = (row.tags as string[])?.find(t => !t.startsWith('project_')) ?? 'termo_chave'
  const pos = decodePos(row.occurrences)
  return {
    id: row.id,
    type: typeTag,
    selectedText: row.title,
    startVerse: pos.startVerse!,
    endVerse: pos.endVerse!,
    startOffset: pos.startOffset!,
    endOffset: pos.endOffset!,
    note: pos.note!,
    createdAt: pos.createdAt!,
    definition:          row.definition          ?? undefined,
    explanation:         row.etymology           ?? undefined,  // etymology reutilizado
    lexical_study:       row.theological_systematic ?? undefined, // reutilizado
    original_term:       row.lang_hebrew         ?? undefined,
    transliteration:     row.transliteration     ?? undefined,
    meaning:             row.pronunciation       ?? undefined,  // reutilizado
    occurrences_note:    row.main_texts          ?? undefined,
    theological_biblical: row.theological_biblical ?? undefined,
    narrative_function:  row.applications        ?? undefined,  // reutilizado
    applications:        row.cross_references?.join('\n') ?? undefined,
    personal_notes:      row.bibliography        ?? undefined,
  }
}

// ── API pública ───────────────────────────────────────────────────────────────

export async function loadClassificationsFromDB(projectId: string): Promise<Classification[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('lampas_dictionary')
      .select('*')
      .contains('tags', [`project_${projectId}`])
      .contains('sources', ['classificacao'])
      .order('created_at', { ascending: true })
    if (error || !data) return []
    return data.map(rowToCls)
  } catch { return [] }
}

export async function saveClassificationToDB(
  cls: Classification, projectId: string, userId: string,
): Promise<boolean> {
  try {
    const supabase = createClient()
    const payload = {
      id:                   cls.id,
      user_id:              userId,
      title:                cls.selectedText,
      category:             TYPE_TO_CAT[cls.type] ?? 'termo_biblico',
      trust_level:          1,
      occurrences:          encodePos(cls),
      definition:           cls.definition           ?? null,
      etymology:            cls.explanation          ?? null,
      theological_systematic: cls.lexical_study      ?? null,
      lang_hebrew:          cls.original_term        ?? null,
      transliteration:      cls.transliteration      ?? null,
      pronunciation:        cls.meaning              ?? null,
      main_texts:           cls.occurrences_note     ?? null,
      theological_biblical: cls.theological_biblical ?? null,
      applications:         cls.narrative_function   ?? null,
      bibliography:         cls.personal_notes       ?? null,
      cross_references:     cls.applications ? cls.applications.split('\n').filter(Boolean) : [],
      related_terms:        [],
      tags:                 [cls.type, `project_${projectId}`],
      sources:              ['classificacao'],
    }
    const { error } = await supabase
      .from('lampas_dictionary')
      .upsert(payload, { onConflict: 'id' })
    return !error
  } catch { return false }
}

export async function deleteClassificationFromDB(id: string): Promise<void> {
  try {
    const supabase = createClient()
    await supabase.from('lampas_dictionary').delete().eq('id', id)
  } catch { /* silent */ }
}

export async function updateClassificationInDB(
  id: string, fields: Partial<Classification>,
): Promise<void> {
  try {
    const supabase = createClient()
    const payload: Record<string, unknown> = {}
    if (fields.definition           !== undefined) payload.definition           = fields.definition
    if (fields.explanation          !== undefined) payload.etymology             = fields.explanation
    if (fields.lexical_study        !== undefined) payload.theological_systematic = fields.lexical_study
    if (fields.original_term        !== undefined) payload.lang_hebrew           = fields.original_term
    if (fields.transliteration      !== undefined) payload.transliteration       = fields.transliteration
    if (fields.meaning              !== undefined) payload.pronunciation          = fields.meaning
    if (fields.occurrences_note     !== undefined) payload.main_texts             = fields.occurrences_note
    if (fields.theological_biblical !== undefined) payload.theological_biblical   = fields.theological_biblical
    if (fields.narrative_function   !== undefined) payload.applications           = fields.narrative_function
    if (fields.personal_notes       !== undefined) payload.bibliography           = fields.personal_notes
    if (fields.applications         !== undefined) payload.cross_references       = fields.applications.split('\n').filter(Boolean)
    if (Object.keys(payload).length > 0) {
      await supabase.from('lampas_dictionary').update(payload).eq('id', id)
    }
  } catch { /* silent */ }
}
