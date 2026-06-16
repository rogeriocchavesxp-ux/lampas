import type { Project, Section } from '@/types/database'

// ── Types ──────────────────────────────────────────────────────────────────

export type BlockType = 'introducao' | 'proposicao' | 'contextualizacao' | 'desenvolvimento' | 'transicao' | 'aplicacao' | 'conclusao'
export type MarkerStyle = 'roman' | 'decimal' | 'alpha' | 'bullet' | 'none'
export type PrintOutlineMode = 'reduced' | 'complete'
export type SlidePlatform = 'Canvas' | 'Claude' | 'Gemini' | 'ChatGPT' | 'Gamma'
export type SlidePresentationType = 'Culto' | 'EBD' | 'Palestra' | 'Aula' | 'Treinamento' | 'Conferência'
export type SlideDeckSize = 'Curta — 5 a 7 slides' | 'Média — 8 a 12 slides' | 'Completa — 15 a 20 slides'
export type SlideVisualStyle = 'Minimalista' | 'Clássico' | 'Moderno' | 'Editorial' | 'Igreja' | 'Acadêmico'

export interface SlidePromptSettings {
  presentationType: SlidePresentationType
  deckSize: SlideDeckSize
  visualStyle: SlideVisualStyle
  include: {
    bibleText: boolean
    theme: boolean
    proposition: boolean
    mainPoints: boolean
    subpoints: boolean
    applications: boolean
    illustrations: boolean
    conclusion: boolean
    imageSuggestions: boolean
    speakerNotes: boolean
  }
}

export interface Subponto {
  id: string
  text: string
  notes?: string
}

export interface PontoElement {
  id: string
  title?: string
  text: string
  notes?: string
}

export type PontoElementKey = 'ilustracoes' | 'aplicacoes' | 'citacoes' | 'observacoes'

export interface PontoPrincipal {
  id: string
  text: string
  notes?: string
  subpontos: Subponto[]
  ilustracao: string
  ilustracaoNotes?: string
  ilustracoes?: PontoElement[]
  aplicacao: string
  aplicacaoNotes?: string
  aplicacoes?: PontoElement[]
  citacoes?: PontoElement[]
  observacoes?: PontoElement[]
}

export interface SermonBlock {
  id: string
  type: BlockType
  title: string
  content: string
  pontos?: PontoPrincipal[]
  mainMarkerStyle?: MarkerStyle
  subMarkerStyle?: MarkerStyle
}

export interface SermonBuilderContent {
  type: 'sermon_builder'
  blocks: SermonBlock[]
}

export interface Props {
  project: Project
  userId: string
  existingSection: Section | undefined
  onUpdate: (section: Section) => void
  onAskAI: (prompt: string) => void
  initialViewMode?: 'edit' | 'preview'
  publishedReader?: boolean
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function mkId() { return Math.random().toString(36).slice(2, 10) }

export function toRoman(n: number): string {
  const map: [number, string][] = [
    [1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],
    [50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I'],
  ]
  let r = '', v = n
  for (const [val, sym] of map) { while (v >= val) { r += sym; v -= val } }
  return r
}

export function toAlpha(n: number): string {
  let value = n
  let result = ''
  while (value > 0) {
    value--
    result = String.fromCharCode(65 + (value % 26)) + result
    value = Math.floor(value / 26)
  }
  return result
}

export function markerLabel(index: number, style: MarkerStyle): string {
  const n = index + 1
  if (style === 'none') return ''
  if (style === 'roman') return `${toRoman(n)}.`
  if (style === 'alpha') return `${toAlpha(n)}.`
  if (style === 'bullet') return '•'
  return `${n}.`
}

export function newPontoPrincipal(): PontoPrincipal {
  return {
    id: mkId(),
    text: '',
    notes: '',
    subpontos: [{ id: mkId(), text: '', notes: '' }],
    ilustracao: '',
    ilustracaoNotes: '',
    ilustracoes: [],
    aplicacao: '',
    aplicacaoNotes: '',
    aplicacoes: [],
    citacoes: [],
    observacoes: [],
  }
}

export function defaultPontos(): PontoPrincipal[] {
  return [newPontoPrincipal()]
}

export function normalizePontos(raw: unknown): PontoPrincipal[] {
  if (!Array.isArray(raw) || raw.length === 0) return defaultPontos()
  return raw.map(item => {
    const ponto = item as Partial<PontoPrincipal>
    const normalizeElement = (element: unknown): PontoElement => {
      const value = element as Partial<PontoElement>
      return {
        id: typeof value.id === 'string' ? value.id : mkId(),
        title: typeof value.title === 'string' ? value.title : undefined,
        text: typeof value.text === 'string' ? value.text : '',
        notes: typeof value.notes === 'string' ? value.notes : '',
      }
    }

    return {
      id: typeof ponto.id === 'string' ? ponto.id : mkId(),
      text: typeof ponto.text === 'string' ? ponto.text : '',
      notes: typeof ponto.notes === 'string' ? ponto.notes : '',
      subpontos: Array.isArray(ponto.subpontos)
        ? ponto.subpontos.map(sub => ({
            id: typeof sub.id === 'string' ? sub.id : mkId(),
            text: typeof sub.text === 'string' ? sub.text : '',
            notes: typeof sub.notes === 'string' ? sub.notes : '',
          }))
        : [],
      ilustracao: typeof ponto.ilustracao === 'string' ? ponto.ilustracao : '',
      ilustracaoNotes: typeof ponto.ilustracaoNotes === 'string' ? ponto.ilustracaoNotes : '',
      ilustracoes: Array.isArray(ponto.ilustracoes) ? ponto.ilustracoes.map(normalizeElement) : [],
      aplicacao: typeof ponto.aplicacao === 'string' ? ponto.aplicacao : '',
      aplicacaoNotes: typeof ponto.aplicacaoNotes === 'string' ? ponto.aplicacaoNotes : '',
      aplicacoes: Array.isArray(ponto.aplicacoes) ? ponto.aplicacoes.map(normalizeElement) : [],
      citacoes: Array.isArray(ponto.citacoes) ? ponto.citacoes.map(normalizeElement) : [],
      observacoes: Array.isArray(ponto.observacoes) ? ponto.observacoes.map(normalizeElement) : [],
    }
  })
}

export function pontoElements(p: PontoPrincipal, key: PontoElementKey): PontoElement[] {
  if (Array.isArray(p[key])) return p[key] ?? []
  if (key === 'ilustracoes' && (p.ilustracao?.trim() || p.ilustracaoNotes?.trim())) {
    return [{ id: 'legacy-ilustracao', title: 'Ilustração', text: p.ilustracao ?? '', notes: p.ilustracaoNotes ?? '' }]
  }
  if (key === 'aplicacoes' && (p.aplicacao?.trim() || p.aplicacaoNotes?.trim())) {
    return [{ id: 'legacy-aplicacao', title: 'Aplicação', text: p.aplicacao ?? '', notes: p.aplicacaoNotes ?? '' }]
  }
  return []
}

export function escapeHtml(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

export function renderInlineFormatting(s: string) {
  return escapeHtml(s)
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
}

export function sanitizeRichHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<\s*(\/?)\s*(strong|b|em|i|ul|ol|li|br|p|div)\b[^>]*>/gi, (_, close: string, tag: string) => `<${close}${tag.toLowerCase()}>`)
    .replace(/<(?!\/?(strong|b|em|i|ul|ol|li|br|p|div)\b)[^>]+>/gi, '')
}

export function renderFormattedText(s: string) {
  if (/<\/?(strong|b|em|i|ul|ol|li|br|p|div)\b/i.test(s)) {
    return sanitizeRichHtml(s)
  }

  const blocks = s.trim().split(/\n{2,}/).filter(Boolean)

  return blocks.map(block => {
    const lines = block.split('\n')
    const isList = lines.every(line => /^\s*(-|\*|•)\s+/.test(line) || line.trim() === '')

    if (isList) {
      return `<ul class="formatted-list">${lines
        .filter(line => line.trim())
        .map(line => `<li>${renderInlineFormatting(line.replace(/^\s*(-|\*|•)\s+/, ''))}</li>`)
        .join('')}</ul>`
    }

    return `<p>${lines.map(renderInlineFormatting).join('<br>')}</p>`
  }).join('')
}

export function richEditorHtml(s: string) {
  if (!s.trim()) return ''
  return renderFormattedText(s)
}

export function plainTextFromHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function defaultSlidePromptSettings(): SlidePromptSettings {
  return {
    presentationType: 'Culto',
    deckSize: 'Média — 8 a 12 slides',
    visualStyle: 'Editorial',
    include: {
      bibleText: true,
      theme: true,
      proposition: true,
      mainPoints: true,
      subpoints: true,
      applications: true,
      illustrations: true,
      conclusion: true,
      imageSuggestions: true,
      speakerNotes: true,
    },
  }
}

export function platformFocus(platform: SlidePlatform): string {
  const map: Record<SlidePlatform, string> = {
    Canvas: 'Dê prioridade à criação visual de slides: layout, hierarquia, paleta sóbria, imagens discretas, composição, contraste e equilíbrio entre texto e espaço em branco.',
    Claude: 'Dê prioridade à estruturação, refinamento e expansão da apresentação: conteúdo, narrativa, clareza textual, organização didática e progressão lógica.',
    Gemini: 'Dê prioridade à apresentação visual, ensino e exposição: síntese clara, sugestões visuais, adaptação multimodal e conexão entre texto, imagem e aplicação.',
    ChatGPT: 'Dê prioridade à criação completa da apresentação slide a slide: títulos, bullets enxutos, notas do apresentador e sugestões objetivas de design.',
    Gamma: 'Dê prioridade à geração automática de uma apresentação profissional: seções bem delimitadas, títulos curtos, layout moderno e prompts visuais para cada slide.',
  }
  return map[platform]
}

export function blockText(block: SermonBlock | undefined): string {
  return block?.content?.trim() ? plainTextFromHtml(block.content) : ''
}

export function blockTexts(blocks: SermonBlock[], type: BlockType): string[] {
  return blocks
    .filter(block => block.type === type && block.content?.trim())
    .map(block => `${block.title}:\n${plainTextFromHtml(block.content ?? '')}`)
}

export function buildSlidesPrompt(
  platform: SlidePlatform,
  settings: SlidePromptSettings,
  blocks: SermonBlock[],
  project: Project,
  outlineMode: PrintOutlineMode,
): string {
  const ref = `${project.book} ${project.passage_ref}`
  const title = project.title || `Sermão — ${ref}`
  const intro = blocks.find(b => b.type === 'introducao')
  const proposition = blocks.find(b => b.type === 'proposicao')
  const contextualization = blocks.find(b => b.type === 'contextualizacao')
  const conclusion = blocks.find(b => b.type === 'conclusao')
  const transitions = blockTexts(blocks, 'transicao')
  const applications = blockTexts(blocks, 'aplicacao')
  const otherBlocks = blocks
    .filter(block => !['introducao', 'proposicao', 'contextualizacao', 'desenvolvimento', 'transicao', 'aplicacao', 'conclusao'].includes(block.type) && block.content?.trim())
    .map(block => `${block.title}:\n${plainTextFromHtml(block.content ?? '')}`)
  const development = blocks.filter(b => b.type === 'desenvolvimento').flatMap(b => b.pontos ?? [])
  const isReduced = outlineMode === 'reduced'

  const theme = title
  const propositionText = blockText(proposition)
  const introText = blockText(intro)
  const contextualizationText = blockText(contextualization)
  const conclusionText = blockText(conclusion)

  const lines: string[] = [
    `Crie uma apresentação de slides para ${settings.presentationType.toLowerCase()} a partir do sermão abaixo.`,
    '',
    `Ferramenta de destino: ${platform}.`,
    platformFocus(platform),
    `Formato atual do sermão no Lampas: ${isReduced ? 'esboço reduzido para pregação' : 'esboço completo para estudo, arquivo e revisão'}.`,
    '',
    'Diretrizes obrigatórias:',
    '- Clareza, reverência, sobriedade e foco bíblico.',
    '- Pouco texto por slide.',
    '- Títulos fortes e progressão lógica.',
    '- Aplicações práticas e tom pastoral.',
    '- Visual limpo, sem imagens caricatas, sem estética infantilizada e sem excesso de elementos.',
    '- Use exclusivamente o conteúdo fornecido abaixo. Não invente ilustrações, aplicações, citações, argumentos ou referências.',
    '- Se algum campo estiver ausente, apenas omita esse elemento da apresentação.',
    `- Tamanho desejado: ${settings.deckSize}.`,
    `- Estilo visual: ${settings.visualStyle}.`,
    '',
    `Título do sermão:\n${title}`,
  ]

  if (settings.include.bibleText) lines.push('', `Texto bíblico:\n${ref}`)
  if (settings.include.theme) lines.push('', `Tema:\n${theme}`)
  if (settings.include.proposition && propositionText) lines.push('', `Proposição:\n${propositionText}`)
  if (introText) lines.push('', `Introdução:\n${introText}`)
  if (!isReduced && contextualizationText) lines.push('', `Contextualização:\n${contextualizationText}`)
  if (!isReduced && transitions.length) lines.push('', `Transições:\n${transitions.join('\n\n')}`)

  if (settings.include.mainPoints && development.length) {
    lines.push('', 'Estrutura do desenvolvimento:')
    development.forEach((point, index) => {
      lines.push(`${index + 1}. ${point.text || `Ponto ${index + 1}`}`)
      if (!isReduced && point.notes?.trim()) lines.push(`   Descrição do ponto: ${plainTextFromHtml(point.notes)}`)
      if (settings.include.subpoints) {
        const subpoints = point.subpontos ?? []
        subpoints.filter(sub => sub.text.trim()).forEach((sub, subIndex) => {
          lines.push(`   ${subIndex + 1}. ${sub.text}`)
          if (!isReduced && sub.notes?.trim()) lines.push(`      Descrição: ${plainTextFromHtml(sub.notes)}`)
        })
      }
      if (!isReduced && settings.include.illustrations) {
        const illustrations = pontoElements(point, 'ilustracoes').filter(item => item.text.trim())
        illustrations.forEach(item => {
          lines.push(`   ${item.title?.trim() || 'Ilustração'}: ${plainTextFromHtml(item.text)}`)
          if (item.notes?.trim()) lines.push(`      Nota: ${plainTextFromHtml(item.notes)}`)
        })
      }
      if (settings.include.applications) {
        const pointApplications = pontoElements(point, 'aplicacoes').filter(item => item.text.trim())
        pointApplications.forEach(item => {
          lines.push(`   ${item.title?.trim() || 'Aplicação'}: ${plainTextFromHtml(item.text)}`)
          if (!isReduced && item.notes?.trim()) lines.push(`      Nota: ${plainTextFromHtml(item.notes)}`)
        })
      }
      if (!isReduced) {
        const citations = pontoElements(point, 'citacoes').filter(item => item.text.trim())
        const observations = pontoElements(point, 'observacoes').filter(item => item.text.trim())
        citations.forEach(item => lines.push(`   ${item.title?.trim() || 'Citação'}: ${plainTextFromHtml(item.text)}`))
        observations.forEach(item => lines.push(`   ${item.title?.trim() || 'Observação'}: ${plainTextFromHtml(item.text)}`))
      }
    })
  }

  if (settings.include.applications && applications.length) {
    lines.push('', 'Aplicações gerais:')
    applications.forEach(text => lines.push(text))
  }

  if (!isReduced && otherBlocks.length) {
    lines.push('', `Demais elementos do construtor:\n${otherBlocks.join('\n\n')}`)
  }

  if (settings.include.conclusion && conclusionText) {
    lines.push('', `Conclusão:\n${conclusionText}`)
  }

  lines.push('', 'Entregue a resposta com:')
  lines.push('- Lista slide a slide.')
  lines.push('- Título de cada slide.')
  lines.push('- Texto curto sugerido para cada slide.')
  lines.push('- Indicação clara de qual conteúdo do sermão fundamenta cada slide.')
  if (settings.include.speakerNotes) lines.push('- Notas do apresentador para cada slide.')
  if (settings.include.imageSuggestions) lines.push('- Sugestões de imagens discretas, reverentes e não caricatas para cada slide.')
  lines.push('- Indicação de transições lógicas entre as partes.')

  return lines.join('\n')
}

// ── Constants ──────────────────────────────────────────────────────────────

export const BLOCK_TYPES: { type: BlockType; label: string }[] = [
  { type: 'introducao',      label: 'Introdução' },
  { type: 'proposicao',      label: 'Proposição' },
  { type: 'contextualizacao', label: 'Contextualização' },
  { type: 'desenvolvimento', label: 'Desenvolvimento' },
  { type: 'transicao',      label: 'Transição' },
  { type: 'aplicacao',      label: 'Aplicação' },
  { type: 'conclusao',      label: 'Conclusão' },
]

export const TYPE_COLOR: Record<BlockType, string> = {
  introducao:      'var(--accent)',
  proposicao:      '#8B5CF6',
  contextualizacao: '#c89b3c',
  desenvolvimento: 'var(--ai)',
  transicao:       'var(--text-muted)',
  aplicacao:       '#6db8a0',
  conclusao:       '#c47c5a',
}

export const DEFAULT_BLOCKS: SermonBlock[] = [
  { id: 'b1', type: 'introducao',      title: 'Introdução',      content: '' },
  { id: 'b2', type: 'proposicao',      title: 'Proposição',      content: '' },
  { id: 'b3', type: 'contextualizacao', title: 'Contextualização', content: '' },
  { id: 'b4', type: 'desenvolvimento', title: 'Desenvolvimento', content: '', pontos: defaultPontos() },
  { id: 'b5', type: 'conclusao',       title: 'Conclusão',       content: '' },
]

// ── Preset: A Presença de Deus em Todas as Circunstâncias — Gn 39.1-23 ────

export const PRESET_GN39: SermonBlock[] = [
  {
    id: mkId(), type: 'introducao', title: 'Introdução',
    content: `ABERTURA: O tema central do capítulo 39 é a presença de Deus.
A expressão "Deus estava com..." aparece 4x (vv. 2, 3, 21, 23)

A PERCEPÇÃO EQUIVOCADA DA PRESENÇA DE DEUS GERA CONSEQUÊNCIAS:
• Instabilidade emocional: medo, culpa ou vergonha
• Coragem para praticar o erro
• Autossuficiência: casamento, educação dos filhos e no trabalho

TRANSIÇÃO: Deus está presente em todas as circunstâncias`,
  },
  {
    id: mkId(), type: 'contextualizacao', title: 'Contextualização',
    content: `O texto começa dizendo que José foi LEVADO para o Egito.

Personagens:
• José — jovem sonhador, amado do pai
• Potifar — oficial de Faraó, comandante da guarda, egípcio (v. 1)

Ambiente: Egito — centro do poder econômico mundial; distante da família

Enredo:
• José traído pelos irmãos → poço → escravo dos ismaelitas
• Agora escravo de Potifar, desce ao Egito

PROPOSIÇÃO: A presença de Deus não depende das circunstâncias. Deus as governa.`,
  },
  {
    id: mkId(), type: 'desenvolvimento', title: 'Desenvolvimento', content: '',
    pontos: [
      {
        id: mkId(),
        text: 'DEUS ESTÁ PRESENTE NA PROSPERIDADE (v. 1-6a)',
        notes: '',
        subpontos: [
          {
            id: mkId(),
            text: 'Na Bíblia, prosperidade não é ausência de sofrimento — é o sucesso na missão de Deus',
            notes: 'Não é status. Não é riqueza. Derek Kidner: "é a palavra usada para o êxito da missão de Eliézer em 24:21,40, e para o sofrimento do Servo em Isaías 53:10; ela fala de realização e cumprimento, e não de status."',
          },
          {
            id: mkId(),
            text: 'Padrão quíntuplo (cf. Gn 12): Presença → Prosperidade → Testemunho externo → Favor → Bênção ao entorno (vv. 2-5)',
            notes: 'v.2a Presença: "O SENHOR estava com José"\nv.2b Prosperidade: tsalach — Hifil causativo, o SENHOR é o agente, não José\nv.3 Testemunho externo: "seu senhor viu que o SENHOR era com ele"\nv.4 Favor/Promoção: "José achou graça... o constituiu sobre a sua casa"\nv.5 Bênção ao entorno: "o SENHOR abençoou a casa do egípcio por causa de José"',
          },
          {
            id: mkId(),
            text: 'Sidney Greidanus: "Aqui o nome Yahweh aparece no mais incerto momento da vida de José. Está mesmo sozinho?"',
            notes: '',
          },
        ],
        ilustracao: 'O crente é como árvore frutífera. O justo que medita na lei do Senhor "é como árvore plantada junto a uma corrente de águas, que, no devido tempo, dá o seu fruto, e cuja folhagem não murcha; e tudo o que ele faz será bem-sucedido." (Sl 1.3). Assim como a árvore é alimentada pela corrente de águas, o crente é alimentado por Deus.',
        ilustracaoNotes: 'tsalach em Sl 1.3 = mesmo termo de Gn 39.2,3,23. José é o Salmo 1 em carne e osso.',
        aplicacao: 'Assim como Deus fez com José, Ele nos faz mordomos: do conhecimento, da família, dos filhos, do trabalho, da empresa. Tudo pertence ao Senhor. São ferramentas para o avanço do Reino, para a proclamação do Evangelho, para que os outros possam ver que Deus está conosco.',
        aplicacaoNotes: '',
      },
      {
        id: mkId(),
        text: 'DEUS ESTÁ PRESENTE NA FALSIDADE (v. 6b-18)',
        notes: 'O QUE É FALSIDADE? Falsidade é a distorção da verdade — fabricar evidências, construir aparências, fazer o inocente parecer culpado. Toda falsidade é uma tentativa de substituir a verdade de Deus por uma narrativa humana. Origem: Éden, a serpente distorcendo a verdade.',
        subpontos: [
          {
            id: mkId(),
            text: 'A esposa de Potifar cometeu falsidade: assediou insistentemente (vv. 7,10), fabricou evidências, construiu narrativa com prova falsa (vv. 13-18)',
            notes: 'Pseudomarturia: testemunho forjado com evidência física. A roupa de José transformada em "prova". A virtude dele (a fuga) invertida em evidência do crime que não cometeu.',
          },
          {
            id: mkId(),
            text: 'José sofreu as consequências: era inocente, fugiu do pecado, mas foi condenado à prisão — a falsidade destrói reputações, confiança, relacionamentos',
            notes: 'Paralelo tipológico: Mt 26.59-60 — Jesus condenado pelo mesmo padrão de pseudomarturia. O inocente condenado pela forma do testemunho, não pela substância da verdade.',
          },
          {
            id: mkId(),
            text: 'Deus presente na resposta de José: lealdade, gratidão, temor ao Senhor — "Como pecaria contra Deus?" (v. 9b)',
            notes: 'Não foi para não perder posição. Não foi para sustentar reputação. Não foi para manter privilégios. A única razão foi o amor a Deus.\nBruce Waltke & Cathi Fredericks, Gênesis, p. 645.',
          },
        ],
        ilustracao: '',
        ilustracaoNotes: '',
        aplicacao: `FALSIDADE SOFRIDA — É fácil conectar-se com José:
• Uma demissão injusta; uma traição sofrida
• Não temos como controlar a falsidade do outro — José não controlou
• Não precisamos provar o contrário a todo custo — a verdade não depende da nossa defesa
• Confie no justo Juiz: "A mim me pertence a vingança; eu recompensarei, diz o Senhor" (Rm 12.19)
• Deus estava presente com José na falsidade — está presente conosco também

FALSIDADE COMETIDA — Difícil é perceber nossa falsidade:
• Agimos falsamente quando julgamos pela aparência — construindo histórias a partir do que desejamos
• Agimos falsamente quando produzimos provas — literais ou abstratas — para fazer o inocente parecer culpado
• A falsidade nasce da inveja, da cobiça e da obsessão — desejos contrariados que se tornam destruição (Tg 1.15)
• Princípio: provas devem ser evidências, não construções`,
        aplicacaoNotes: '',
      },
      {
        id: mkId(),
        text: 'DEUS ESTÁ PRESENTE NA ADVERSIDADE (v. 19-23)',
        notes: '',
        subpontos: [
          {
            id: mkId(),
            text: 'As adversidades são inevitáveis — do latim adversus: "virado contra você" — pessoas, circunstâncias, sistemas, acusações (cf. Catecismo, pergunta 20)',
            notes: 'adversitas = ad + vertere = virado contra. Problema, luta, doença, desemprego, injustiça, prisão. O adversário é o que está posicionado de frente para impedir o avanço.',
          },
          {
            id: mkId(),
            text: 'O mesmo padrão quíntuplo se repete na prisão: Presença → Hesed → Favor → Promoção → tsalach (vv. 21-23)',
            notes: 'v.21a Presença: "O SENHOR era com José"\nv.21b Hesed: "lhe mostrou misericórdia" = estendeu hesed — fidelidade aliancial dentro da prisão\nv.21c Favor do carcereiro\nv.22 Promoção: todos os presos confiados a José\nv.23 tsalach: "Tudo o que ele fazia, o SENHOR prosperava"',
          },
          {
            id: mkId(),
            text: 'As adversidades revelam o nosso Deus — José foi íntegro na casa de Potifar e na CASA da prisão (beit hassohar)',
            notes: 'beit hassohar = casa da prisão. Não um buraco — uma estrutura. E dentro dessa casa o SENHOR estava: transformando a casa da prisão em casa da presença.',
          },
        ],
        ilustracao: '',
        ilustracaoNotes: '',
        aplicacao: 'Deus exaltou José da prisão ao palácio — e esse padrão encontra seu cumprimento em Cristo, exaltado da cruz ao trono.',
        aplicacaoNotes: '',
      },
    ],
  },
  {
    id: mkId(), type: 'conclusao', title: 'Conclusão',
    content: `Conexão cristológica: José acusado injustamente, preso sendo inocente, eventualmente exaltado — aponta para Cristo. O mais inocente foi o mais condenado. A presença de Deus não o livrou da cruz — o sustentou através dela e o exaltou.

Aquele que esteve com José na escravidão, na falsidade e na prisão — veio Ele mesmo ao cativeiro, sofreu Ele mesmo a falsidade, desceu Ele mesmo à morte — para que sua presença conosco fosse eterna.

"Emanuel — Deus conosco." (Mt 1.23)`,
  },
]

export function blockHasContent(block: SermonBlock): boolean {
  if (block.type === 'desenvolvimento') {
    return (block.pontos ?? []).some(p =>
      p.text.trim() ||
      p.subpontos.some(s => s.text.trim()) ||
      p.ilustracao.trim() ||
      p.aplicacao.trim() ||
      pontoElements(p, 'ilustracoes').some(item => item.text.trim()) ||
      pontoElements(p, 'aplicacoes').some(item => item.text.trim()) ||
      pontoElements(p, 'citacoes').some(item => item.text.trim()) ||
      pontoElements(p, 'observacoes').some(item => item.text.trim())
    )
  }
  return block.content.trim().length > 0
}

export function dotColor(block: SermonBlock): string {
  if (!blockHasContent(block)) return 'var(--border)'
  if (block.type === 'desenvolvimento') {
    const allFilled = (block.pontos ?? []).every(p => p.text.trim() && p.subpontos.some(s => s.text.trim()))
    return allFilled ? 'var(--success)' : 'var(--accent)'
  }
  return block.content.trim().length < 80 ? 'var(--accent)' : 'var(--success)'
}

export function blockPrompt(block: SermonBlock, project: Project): string {
  const ref = `${project.book} ${project.passage_ref}`
  const map: Record<BlockType, string> = {
    introducao:      `Redija uma introdução pastoral para o sermão de ${ref}. Capture atenção, revele a necessidade humana e conduza naturalmente ao texto.`,
    proposicao:      `Redija a proposição homilética do sermão de ${ref}. Expresse a ideia central em uma frase clara, fiel ao texto, memorável e pregável.`,
    contextualizacao: `Redija uma contextualização bíblica e histórica para o sermão de ${ref}. Situe a perícope no livro, no enredo, no contexto imediato e no movimento teológico do texto, preparando o ouvinte para a exposição.`,
    desenvolvimento: `Sugira pontos principais para o sermão de ${ref}. Cada ponto deve ser claro, teológico, progressivo e derivado do texto.`,
    transicao:       `Crie uma transição natural entre os movimentos do sermão de ${ref}. Resuma o que foi dito e abra o próximo ponto.`,
    aplicacao:       `Desenvolva aplicações concretas para "${block.title}" a partir de ${ref}. Específicas, evangélicas e pastorais.`,
    conclusao:       `Redija a conclusão do sermão de ${ref}. Sintetize a ideia central e conduza o ouvinte a uma resposta bíblica em Cristo.`,
  }
  return map[block.type]
}
