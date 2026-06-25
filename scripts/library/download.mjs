#!/usr/bin/env node
/**
 * download.mjs — Download de PDFs para a Biblioteca Teológica do Lampas
 *
 * Uso:
 *   node scripts/library/download.mjs                    # baixa tudo
 *   node scripts/library/download.mjs --work matthew_henry_mhc
 *   node scripts/library/download.mjs --collection comentarios
 *   node scripts/library/download.mjs --dry-run
 *
 * Requer: Node.js 18+ (fetch nativo)
 * Destino: biblioteca/<collection>/<work_id>/vol_N.pdf
 */

import { createWriteStream, existsSync, mkdirSync, statSync } from 'fs'
import { createHash } from 'crypto'
import { pipeline } from 'stream/promises'
import { Readable } from 'stream'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, writeFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')
const BIBLIOTECA = join(ROOT, 'biblioteca')
const CATALOG_PATH = join(__dirname, 'catalog.json')
const LOG_PATH = join(__dirname, 'download-log.json')

const catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf-8'))

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const WORK_FILTER = args.find(a => a.startsWith('--work='))?.split('=')[1]
  || (args.indexOf('--work') !== -1 ? args[args.indexOf('--work') + 1] : null)
const COLL_FILTER = args.find(a => a.startsWith('--collection='))?.split('=')[1]
  || (args.indexOf('--collection') !== -1 ? args[args.indexOf('--collection') + 1] : null)

const ARCHIVE_ORG_BASE = 'https://archive.org/download'
const DELAY_MS = 2000  // respeitar rate limit do Internet Archive

// ─────────────────────────────────────────────────────────────────────────────

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

function sha256File(path) {
  const data = readFileSync(path)
  return createHash('sha256').update(data).digest('hex')
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function buildArchiveOrgUrl(sourceUrl) {
  // Converte URL de página do Archive.org para URL de download direto do PDF
  // Ex: https://archive.org/details/matthewhenryscex01henrrich
  //  → https://archive.org/download/matthewhenryscex01henrrich/matthewhenryscex01henrrich.pdf
  const match = sourceUrl.match(/archive\.org\/details\/([^/?#]+)/)
  if (!match) return null
  const id = match[1]
  return `${ARCHIVE_ORG_BASE}/${id}/${id}.pdf`
}

async function downloadFile(url, destPath, label) {
  console.log(`  ↓ ${label}`)
  console.log(`    ${url}`)

  if (DRY_RUN) {
    console.log(`    [dry-run] → ${destPath}`)
    return { skipped: true }
  }

  if (existsSync(destPath)) {
    const size = statSync(destPath).size
    if (size > 100_000) {
      console.log(`    ✓ já existe (${(size / 1024 / 1024).toFixed(1)} MB)`)
      return { skipped: true, path: destPath, hash: sha256File(destPath), size }
    }
  }

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Lampas-Library-Bot/1.0 (rogeriocchavesxp@gmail.com)' },
    redirect: 'follow'
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${url}`)
  }

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('pdf') && !contentType.includes('octet-stream')) {
    console.warn(`    ⚠ content-type inesperado: ${contentType}`)
  }

  ensureDir(dirname(destPath))
  await pipeline(Readable.fromWeb(res.body), createWriteStream(destPath))

  const size = statSync(destPath).size
  const hash = sha256File(destPath)
  console.log(`    ✓ ${(size / 1024 / 1024).toFixed(1)} MB — SHA256: ${hash.slice(0, 12)}...`)

  return { path: destPath, hash, size }
}

// ─────────────────────────────────────────────────────────────────────────────

async function processWork(work) {
  const collDir = join(BIBLIOTECA, work.collection)
  const workDir = join(collDir, work.id)
  ensureDir(workDir)

  const results = []

  for (const vol of work.volumes || []) {
    const volLabel = `Vol. ${vol.volume_number} — ${vol.title || ''}`
    const sources = vol.sources || []

    // Prioriza archive_org (PDF), depois ccel (HTML)
    const pdfSource = sources.find(s => s.type === 'archive_org' && s.format === 'pdf')
    const htmlSource = sources.find(s => s.type === 'ccel' && s.format === 'html')

    if (pdfSource) {
      const downloadUrl = buildArchiveOrgUrl(pdfSource.url)
      if (!downloadUrl) {
        console.warn(`    ⚠ Não foi possível derivar URL de download: ${pdfSource.url}`)
        continue
      }

      const fileName = `vol_${String(vol.volume_number).padStart(2, '0')}.pdf`
      const destPath = join(workDir, fileName)

      try {
        const result = await downloadFile(downloadUrl, destPath, volLabel)
        results.push({
          volume: vol.volume_number,
          type: 'pdf_original',
          source: 'archive_org',
          url: downloadUrl,
          ...result
        })
        await sleep(DELAY_MS)
      } catch (err) {
        console.error(`    ✗ Erro: ${err.message}`)
        results.push({ volume: vol.volume_number, error: err.message, url: downloadUrl })
      }

    } else if (htmlSource) {
      // Registra apenas — extração HTML é feita pelo process.mjs
      console.log(`  ℹ ${volLabel} — disponível como HTML em ${htmlSource.url}`)
      results.push({
        volume: vol.volume_number,
        type: 'html',
        source: 'ccel',
        url: htmlSource.url,
        needs_html_extraction: true
      })
    } else {
      console.warn(`  ⚠ ${volLabel} — nenhuma fonte configurada`)
    }
  }

  return results
}

// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log(' Biblioteca Teológica Lampas — Download')
  console.log(`  DRY_RUN:    ${DRY_RUN}`)
  console.log(`  Filtro obra: ${WORK_FILTER || '(todas)'}`)
  console.log(`  Filtro col.: ${COLL_FILTER || '(todas)'}`)
  console.log('═══════════════════════════════════════════════════════════')

  ensureDir(BIBLIOTECA)

  let works = catalog.works

  if (WORK_FILTER) {
    works = works.filter(w => w.id === WORK_FILTER)
    if (works.length === 0) {
      console.error(`Obra não encontrada: ${WORK_FILTER}`)
      process.exit(1)
    }
  }

  if (COLL_FILTER) {
    works = works.filter(w => w.collection === COLL_FILTER)
    if (works.length === 0) {
      console.error(`Nenhuma obra na coleção: ${COLL_FILTER}`)
      process.exit(1)
    }
  }

  const log = existsSync(LOG_PATH)
    ? JSON.parse(readFileSync(LOG_PATH, 'utf-8'))
    : {}

  for (const work of works) {
    console.log(`\n▶ ${work.title}`)
    console.log(`  Autor: ${work.author_id} | ${work.total_volumes} vol(s) | ${work.collection}`)

    const results = await processWork(work)
    log[work.id] = { title: work.title, timestamp: new Date().toISOString(), results }
  }

  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2))
  console.log(`\n✓ Log salvo em ${LOG_PATH}`)
  console.log('Concluído.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
