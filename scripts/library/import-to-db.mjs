#!/usr/bin/env node
/**
 * import-to-db.mjs — Importa metadados e entradas da Biblioteca Teológica para o Supabase
 *
 * Uso:
 *   node scripts/library/import-to-db.mjs --seed-catalog     # insere autores, obras e volumes do catalog.json
 *   node scripts/library/import-to-db.mjs --work matthew_henry_mhc  # processa entradas de uma obra
 *   node scripts/library/import-to-db.mjs --status           # mostra status da importação
 *
 * Requer:
 *   SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente (ou .env.local)
 */

import { readFileSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')
const CATALOG_PATH = join(__dirname, 'catalog.json')

// ─── Env ──────────────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = join(ROOT, '.env.local')
  if (existsSync(envPath)) {
    readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
      const [k, ...v] = line.trim().split('=')
      if (k && !k.startsWith('#')) process.env[k] = v.join('=').replace(/^["']|["']$/g, '')
    })
  }
}

loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
const catalog  = JSON.parse(readFileSync(CATALOG_PATH, 'utf-8'))

const args     = process.argv.slice(2)
const SEED     = args.includes('--seed-catalog')
const STATUS   = args.includes('--status')
const WORK_ID  = args.find(a => a.startsWith('--work='))?.split('=')[1]
  || (args.indexOf('--work') !== -1 ? args[args.indexOf('--work') + 1] : null)

// ─── Seed catálogo ────────────────────────────────────────────────────────────

async function seedCatalog() {
  console.log('\n▶ Inserindo autores...')

  for (const author of catalog.authors) {
    const { error } = await supabase
      .from('lib_authors')
      .insert({
        name:        author.name,
        birth_year:  author.birth_year || null,
        death_year:  author.death_year || null,
        tradition:   author.tradition || null,
        nationality: author.nationality || null
      })

    if (error && !error.message.includes('duplicate')) {
      console.error(`  ✗ ${author.name}: ${error.message}`)
    } else {
      console.log(`  ✓ ${author.name}`)
    }
  }

  // Busca IDs de autores inseridos
  const { data: authorsDb } = await supabase
    .from('lib_authors')
    .select('id, name')

  const authorMap = Object.fromEntries(authorsDb.map(a => [
    catalog.authors.find(ca => ca.name === a.name)?.id,
    a.id
  ]))

  // Busca IDs de coleções
  const { data: collectionsDb } = await supabase
    .from('lib_collections')
    .select('id, slug')

  const collectionMap = Object.fromEntries(collectionsDb.map(c => [c.slug, c.id]))

  console.log('\n▶ Inserindo obras...')

  for (const work of catalog.works) {
    const authorDbId = authorMap[work.author_id] || null
    const collDbId   = collectionMap[work.collection] || null

    const { data: workDb, error: workErr } = await supabase
      .from('lib_works')
      .insert({
        title:                 work.title,
        subtitle:              work.subtitle || null,
        author_id:             authorDbId,
        year_published:        work.year_published || null,
        language:              work.language || 'en',
        collection_id:         collDbId,
        work_type:             work.work_type,
        testament:             work.testament || null,
        tradition:             work.tradition || null,
        period:                work.period || null,
        keywords:              work.keywords || [],
        public_domain:         work.public_domain !== false,
        public_domain_status:  work.public_domain_status || 'confirmed',
        public_domain_source:  work.public_domain_source || null,
        source_url:            work.source_url || null,
        license:               work.license || 'Public Domain',
        notes:                 work.notes || null,
        total_volumes:         work.total_volumes || 1
      })
      .select('id')
      .single()

    if (workErr) {
      console.error(`  ✗ ${work.title}: ${workErr.message}`)
      continue
    }

    console.log(`  ✓ ${work.title} (${(work.volumes || []).length} vol)`)

    // Inserir volumes
    for (const vol of work.volumes || []) {
      const pdfSource  = (vol.sources || []).find(s => s.type === 'archive_org')
      const htmlSource = (vol.sources || []).find(s => s.type === 'ccel')
      const sourceUrl  = pdfSource?.url || htmlSource?.url || null

      const { data: volDb, error: volErr } = await supabase
        .from('lib_volumes')
        .insert({
          work_id:          workDb.id,
          volume_number:    vol.volume_number,
          title:            vol.title || null,
          bible_book_start: vol.bible_book_start || null,
          bible_book_end:   vol.bible_book_end || null,
          chapter_start:    vol.chapter_start || null,
          chapter_end:      vol.chapter_end || null,
          source_url:       sourceUrl
        })
        .select('id')
        .single()

      if (volErr) {
        console.error(`    ✗ Vol ${vol.volume_number}: ${volErr.message}`)
        continue
      }

      // Registrar arquivo se tiver fonte PDF
      if (pdfSource) {
        await supabase
          .from('lib_files')
          .insert({
            volume_id:     volDb.id,
            file_type:     'pdf_original',
            original_url:  pdfSource.url,
            import_status: 'pending'
          })
      }
    }
  }

  console.log('\n✓ Catálogo inserido.')
}

// ─── Status ───────────────────────────────────────────────────────────────────

async function showStatus() {
  const { data: works }   = await supabase.from('lib_works').select('id, title, total_volumes, work_type')
  const { data: volumes } = await supabase.from('lib_volumes').select('id, work_id')
  const { data: files }   = await supabase.from('lib_files').select('id, import_status')
  const { data: entries } = await supabase.from('lib_entries').select('id, volume_id', { count: 'exact', head: true })

  const { count: entryCount } = await supabase
    .from('lib_entries')
    .select('*', { count: 'exact', head: true })

  console.log('\n════ Status da Biblioteca ════')
  console.log(`Obras:    ${works?.length || 0}`)
  console.log(`Volumes:  ${volumes?.length || 0}`)
  console.log(`Arquivos: ${files?.length || 0}`)
  console.log(`Entradas: ${entryCount || 0}`)

  if (files?.length) {
    const byStatus = {}
    files.forEach(f => { byStatus[f.import_status] = (byStatus[f.import_status] || 0) + 1 })
    console.log('\nArquivos por status:')
    Object.entries(byStatus).forEach(([s, n]) => console.log(`  ${s}: ${n}`))
  }

  console.log('\nObras por tipo:')
  const byType = {}
  works?.forEach(w => { byType[w.work_type] = (byType[w.work_type] || 0) + 1 })
  Object.entries(byType).forEach(([t, n]) => console.log(`  ${t}: ${n}`))
}

// ─── Importar entradas de texto extraído ──────────────────────────────────────
// Este bloco processa arquivos de texto já extraídos (output do process.mjs)
// e insere como lib_entries com referências bíblicas.

async function importWorkEntries(workId) {
  const textDir = join(ROOT, 'biblioteca', '_processed', workId)

  if (!existsSync(textDir)) {
    console.error(`Diretório de texto processado não encontrado: ${textDir}`)
    process.exit(1)
  }

  // Busca o título no catalog.json para mapear para o DB
  const catalogWork = catalog.works.find(w => w.id === workId)
  if (!catalogWork) {
    console.error(`Work ID "${workId}" não encontrado no catalog.json`)
    process.exit(1)
  }

  const { data: workDb } = await supabase
    .from('lib_works')
    .select('id, title, work_type')
    .ilike('title', `%${catalogWork.title}%`)
    .limit(1)
    .single()

  if (!workDb) {
    console.error(`Obra "${catalogWork.title}" não encontrada no banco. Execute --seed-catalog primeiro.`)
    process.exit(1)
  }

  console.log(`\n▶ ${workDb.title} (${workDb.work_type})`)

  const { data: volumes } = await supabase
    .from('lib_volumes')
    .select('id, volume_number, bible_book_start')
    .eq('work_id', workDb.id)
    .order('volume_number')

  // Monta lista de volumes processados disponíveis
  const processedFiles = readdirSync(textDir)
    .filter(f => f.match(/^vol_\d+\.json$/))
    .sort()

  if (processedFiles.length === 0) {
    console.error('  ⚠ Nenhum arquivo processado encontrado')
    return
  }

  for (const vol of volumes) {
    const jsonFile = join(textDir, `vol_${String(vol.volume_number).padStart(2, '0')}.json`)
    // Se não há arquivo exato para este volume, tenta usar vol_01 (arquivo único)
    const actualFile = existsSync(jsonFile) ? jsonFile
      : processedFiles.length === 1 ? join(textDir, processedFiles[0])
      : null

    if (!actualFile) {
      console.log(`  ⚠ Vol ${vol.volume_number}: arquivo ausente`)
      continue
    }

    // Pula se vol_01 já foi importado neste loop (evita reimportar o mesmo arquivo único)
    if (!existsSync(jsonFile) && vol.volume_number > 1) {
      console.log(`  ⚠ Vol ${vol.volume_number}: sem arquivo específico, pulando`)
      continue
    }

    const entries = JSON.parse(readFileSync(actualFile, 'utf-8'))
    console.log(`\n  Vol ${vol.volume_number} — ${entries.length} entradas (${actualFile.split('/').pop()})`)

    // Log de importação
    const { data: importLog } = await supabase
      .from('lib_import_log')
      .insert({
        work_id:       workDb.id,
        volume_id:     vol.id,
        status:        'running',
        total_entries: entries.length
      })
      .select('id')
      .single()

    let imported = 0
    let errors = 0
    const BATCH = 100

    for (let i = 0; i < entries.length; i += BATCH) {
      const batch = entries.slice(i, i + BATCH).map((entry, idx) => ({
        volume_id:         vol.id,
        entry_type:        workDb.work_type === 'commentary' ? 'commentary'
                          : workDb.work_type === 'dictionary' ? 'definition'
                          : workDb.work_type === 'lexicon'    ? 'lexicon_entry'
                          : 'article',
        heading:           entry.heading || null,
        content:           entry.content,
        page_start:        entry.page_start || null,
        page_end:          entry.page_end || null,
        sequence:          i + idx,
        bible_book:        entry.bible_book || null,
        bible_chapter:     entry.bible_chapter || null,
        bible_verse_start: entry.bible_verse_start || null,
        bible_verse_end:   entry.bible_verse_end || null,
        bible_ref:         entry.bible_ref || null
      }))

      const { error } = await supabase.from('lib_entries').insert(batch)
      if (error) {
        console.error(`  ✗ Batch ${i}-${i + BATCH}: ${error.message}`)
        errors += batch.length
      } else {
        imported += batch.length
        process.stdout.write(`\r  ${imported}/${entries.length} entradas...`)
      }
    }

    // Atualiza log
    await supabase
      .from('lib_import_log')
      .update({
        completed_at:    new Date().toISOString(),
        status:          errors > 0 ? 'error' : 'done',
        imported_entries: imported,
        error_count:     errors
      })
      .eq('id', importLog.id)

    console.log(`\n  ✓ ${imported} importadas, ${errors} erros`)

    // Atualiza status do arquivo
    await supabase
      .from('lib_files')
      .update({ import_status: 'done', imported_at: new Date().toISOString() })
      .eq('volume_id', vol.id)
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log(' Biblioteca Teológica Lampas — Import to DB')
  console.log('═══════════════════════════════════════════════════════════')

  if (SEED) {
    await seedCatalog()
  } else if (STATUS) {
    await showStatus()
  } else if (WORK_ID) {
    await importWorkEntries(WORK_ID)
  } else {
    console.log(`
Uso:
  node scripts/library/import-to-db.mjs --seed-catalog
      Insere autores, coleções, obras e volumes do catalog.json no banco.

  node scripts/library/import-to-db.mjs --work <work_id>
      Importa entradas de texto processado para o banco.
      Requer que process.mjs já tenha extraído o texto.

  node scripts/library/import-to-db.mjs --status
      Mostra contagens de obras, volumes, arquivos e entradas.
    `)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
