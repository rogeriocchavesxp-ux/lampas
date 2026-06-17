// Banco semente de referências cruzadas — cobertura inicial para demonstração.
// Estrutura compatível com a tabela cross_references no Supabase.
// Importação futura: TSK, Thompson Chain, bases próprias Lampas.

export type RefType =
  | 'paralelo' | 'citacao' | 'alusao' | 'tema'
  | 'tipologia' | 'cristologica' | 'redencao' | 'alianca'

export const REF_TYPE_LABELS: Record<RefType, string> = {
  paralelo:    'Paralelo Direto',
  citacao:     'Citação',
  alusao:      'Alusão',
  tema:        'Tema',
  tipologia:   'Tipologia',
  cristologica:'Cristológica',
  redencao:    'Hist. Redenção',
  alianca:     'Aliança',
}

export interface CrossRefGroup {
  concept: string
  type: RefType
  refs: string[]
}

export interface PassageSeed {
  sourceBook:       string
  sourceChapter:    number
  sourceVerseStart: number
  sourceVerseEnd:   number
  groups:           CrossRefGroup[]
}

// ── Mapeamento de abreviações → nome completo do livro ──────────────────────

export const BOOK_ABBR: Record<string, string> = {
  // Antigo Testamento
  'gn': 'Gênesis', 'gên': 'Gênesis', 'gen': 'Gênesis',
  'êx': 'Êxodo', 'ex': 'Êxodo',
  'lv': 'Levítico', 'lev': 'Levítico',
  'nm': 'Números', 'num': 'Números',
  'dt': 'Deuteronômio', 'deu': 'Deuteronômio',
  'js': 'Josué', 'jos': 'Josué',
  'jz': 'Juízes',
  'rt': 'Rute',
  '1sm': '1 Samuel', '1 sm': '1 Samuel',
  '2sm': '2 Samuel', '2 sm': '2 Samuel',
  '1rs': '1 Reis', '1 rs': '1 Reis',
  '2rs': '2 Reis', '2 rs': '2 Reis',
  '1cr': '1 Crônicas',
  '2cr': '2 Crônicas',
  'ed': 'Esdras',
  'ne': 'Neemias',
  'et': 'Ester',
  'jó': 'Jó',
  'sl': 'Salmos', 'ps': 'Salmos',
  'pv': 'Provérbios', 'pr': 'Provérbios',
  'ec': 'Eclesiastes',
  'ct': 'Cânticos',
  'is': 'Isaías',
  'jr': 'Jeremias',
  'lm': 'Lamentações',
  'ez': 'Ezequiel',
  'dn': 'Daniel',
  'os': 'Oseias',
  'jl': 'Joel',
  'am': 'Amós',
  'ob': 'Obadias',
  'jôn': 'Jonas',
  'mq': 'Miquéias',
  'na': 'Naum',
  'hc': 'Habacuque',
  'sf': 'Sofonias',
  'ag': 'Ageu',
  'zc': 'Zacarias',
  'ml': 'Malaquias',
  // Novo Testamento
  'mt': 'Mateus',
  'mc': 'Marcos',
  'lc': 'Lucas',
  'jo': 'João', 'jn': 'João',
  'at': 'Atos', 'atos': 'Atos',
  'rm': 'Romanos',
  '1co': '1 Coríntios', '1 co': '1 Coríntios',
  '2co': '2 Coríntios', '2 co': '2 Coríntios',
  'gl': 'Gálatas',
  'ef': 'Efésios',
  'fp': 'Filipenses',
  'cl': 'Colossenses',
  '1ts': '1 Tessalonicenses', '1 ts': '1 Tessalonicenses',
  '2ts': '2 Tessalonicenses', '2 ts': '2 Tessalonicenses',
  '1tm': '1 Timóteo', '1 tm': '1 Timóteo',
  '2tm': '2 Timóteo', '2 tm': '2 Timóteo',
  'tt': 'Tito',
  'fm': 'Filemon',
  'hb': 'Hebreus',
  'tg': 'Tiago',
  '1pe': '1 Pedro', '1 pe': '1 Pedro',
  '2pe': '2 Pedro', '2 pe': '2 Pedro',
  '1jo': '1 João', '1 jo': '1 João',
  '2jo': '2 João', '2 jo': '2 João',
  '3jo': '3 João', '3 jo': '3 João',
  'jd': 'Judas',
  'ap': 'Apocalipse',
}

export function parseRef(ref: string): { book: string; passageRef: string } | null {
  const trimmed = ref.trim()
  // Matches: "Dt 7.6-7", "1Pe 2.9", "Mt 25.34", "Rm 8.28-30"
  const match = trimmed.match(/^(\d?\s?[A-ZÀ-Úa-zà-ú]+)\s+(\d+[\d.,\-]*)/)
  if (!match) return null
  const abbrRaw = match[1].trim().toLowerCase()
  const passageRef = match[2].trim()
  const book = BOOK_ABBR[abbrRaw] ?? match[1].trim()
  return { book, passageRef }
}

// ── Dados semente ────────────────────────────────────────────────────────────

export const CROSS_REF_SEED: PassageSeed[] = [
  // ── Efésios 1.3 ──────────────────────────────────────────────────────────
  {
    sourceBook: 'Efésios', sourceChapter: 1, sourceVerseStart: 3, sourceVerseEnd: 3,
    groups: [
      {
        concept: 'Toda bênção espiritual',
        type: 'tema',
        refs: ['2Pe 1.3', 'Rm 8.32', 'Sl 103.2-5', 'Gn 12.2'],
      },
      {
        concept: 'Em Cristo',
        type: 'cristologica',
        refs: ['Jo 15.4-5', 'Rm 8.1', '2Co 5.17', 'Gl 3.26-28', 'Cl 2.9-10'],
      },
      {
        concept: 'Nos lugares celestiais',
        type: 'tema',
        refs: ['Ef 2.6', 'Ef 3.10', 'Ef 6.12', 'Cl 3.1-3', 'Hb 8.1'],
      },
    ],
  },

  // ── Efésios 1.4 ──────────────────────────────────────────────────────────
  {
    sourceBook: 'Efésios', sourceChapter: 1, sourceVerseStart: 4, sourceVerseEnd: 4,
    groups: [
      {
        concept: 'Escolhidos em Cristo',
        type: 'tema',
        refs: ['Dt 7.6', 'Sl 135.4', 'Is 41.8-9', 'Mt 24.31', 'Jo 10.16', 'At 13.48', 'Rm 8.29-30', '2Ts 2.13', '1Pe 2.9'],
      },
      {
        concept: 'Antes da Fundação do Mundo',
        type: 'cristologica',
        refs: ['Mt 25.34', 'Jo 17.24', 'At 15.18', '1Pe 1.20', 'Ap 13.8'],
      },
      {
        concept: 'Santos e Irrepreensíveis',
        type: 'paralelo',
        refs: ['Ef 5.27', 'Cl 1.22', '1Ts 4.7', '2Pe 3.14', 'Jd 24'],
      },
    ],
  },

  // ── Efésios 1.5 ──────────────────────────────────────────────────────────
  {
    sourceBook: 'Efésios', sourceChapter: 1, sourceVerseStart: 5, sourceVerseEnd: 5,
    groups: [
      {
        concept: 'Predestinados para adoção',
        type: 'alianca',
        refs: ['Rm 8.15', 'Rm 8.23', 'Gl 4.5', 'Jo 1.12', 'Hb 2.10-13'],
      },
      {
        concept: 'Segundo o beneplácito de sua vontade',
        type: 'tema',
        refs: ['Ef 1.9', 'Ef 1.11', 'Rm 9.11', 'Rm 9.18', 'Fp 2.13'],
      },
    ],
  },

  // ── Efésios 1.7 ──────────────────────────────────────────────────────────
  {
    sourceBook: 'Efésios', sourceChapter: 1, sourceVerseStart: 7, sourceVerseEnd: 7,
    groups: [
      {
        concept: 'Redenção pelo sangue',
        type: 'cristologica',
        refs: ['At 20.28', 'Rm 3.24-25', '1Co 1.30', 'Cl 1.14', 'Hb 9.12', '1Pe 1.18-19', 'Ap 5.9'],
      },
      {
        concept: 'Remissão das transgressões',
        type: 'paralelo',
        refs: ['Sl 130.4', 'Is 43.25', 'Jr 31.34', 'Rm 4.7-8', 'Cl 2.13', 'Hb 10.17'],
      },
    ],
  },

  // ── Efésios 1.13-14 ──────────────────────────────────────────────────────
  {
    sourceBook: 'Efésios', sourceChapter: 1, sourceVerseStart: 13, sourceVerseEnd: 14,
    groups: [
      {
        concept: 'Selados com o Espírito Santo',
        type: 'tema',
        refs: ['Ef 4.30', '2Co 1.22', '2Co 5.5', 'Rm 8.14-16', 'Jo 14.16-17', 'At 2.33'],
      },
      {
        concept: 'Penhor da herança',
        type: 'tipologia',
        refs: ['Nm 18.20', 'Dt 10.9', 'Sl 16.5', 'Rm 8.23', '2Co 1.22', '2Co 5.5'],
      },
    ],
  },

  // ── João 3.16 ────────────────────────────────────────────────────────────
  {
    sourceBook: 'João', sourceChapter: 3, sourceVerseStart: 16, sourceVerseEnd: 16,
    groups: [
      {
        concept: 'Amor de Deus pelo mundo',
        type: 'tema',
        refs: ['Rm 5.8', 'Rm 8.32', '1Jo 4.9-10', 'Tt 3.4-5', 'Gn 3.15'],
      },
      {
        concept: 'Filho unigênito entregue',
        type: 'tipologia',
        refs: ['Gn 22.2', 'Is 53.10', 'Rm 8.32', 'Hb 11.17-19'],
      },
      {
        concept: 'Vida eterna pela fé',
        type: 'paralelo',
        refs: ['Jo 3.36', 'Jo 5.24', 'Jo 6.40', 'Jo 17.3', 'Rm 6.23', '1Jo 5.11-12'],
      },
      {
        concept: 'Não pereça mas seja salvo',
        type: 'redencao',
        refs: ['Lc 15.4-7', 'Lc 19.10', 'Jo 6.39', 'Jo 10.28', '2Pe 3.9'],
      },
    ],
  },

  // ── Romanos 8.28-30 ──────────────────────────────────────────────────────
  {
    sourceBook: 'Romanos', sourceChapter: 8, sourceVerseStart: 28, sourceVerseEnd: 30,
    groups: [
      {
        concept: 'Todas as coisas cooperam para o bem',
        type: 'tema',
        refs: ['Gn 50.20', 'Sl 119.71', 'Fp 1.12', 'Fp 4.11-12', '2Co 4.17'],
      },
      {
        concept: 'Chamados segundo o propósito de Deus',
        type: 'alianca',
        refs: ['Rm 9.11', 'Ef 1.11', '2Tm 1.9', '1Pe 2.9', '2Ts 2.13'],
      },
      {
        concept: 'Cadeia da salvação (áurea)',
        type: 'redencao',
        refs: ['Ef 1.4-5', 'Jo 10.27-28', 'Jo 17.6', '1Pe 1.2', '2Ts 2.13'],
      },
      {
        concept: 'Conformados à imagem do Filho',
        type: 'cristologica',
        refs: ['Rm 8.17', '2Co 3.18', 'Fp 3.21', '1Jo 3.2', 'Ap 22.4'],
      },
    ],
  },

  // ── Salmos 23.1 ──────────────────────────────────────────────────────────
  {
    sourceBook: 'Salmos', sourceChapter: 23, sourceVerseStart: 1, sourceVerseEnd: 6,
    groups: [
      {
        concept: 'YHWH como Pastor',
        type: 'tema',
        refs: ['Gn 48.15', 'Sl 80.1', 'Is 40.11', 'Jr 31.10', 'Ez 34.11-16', 'Jo 10.11', 'Hb 13.20', '1Pe 5.4'],
      },
      {
        concept: 'Nada me faltará',
        type: 'paralelo',
        refs: ['Sl 34.9-10', 'Dt 2.7', 'Mt 6.25-34', 'Fp 4.19'],
      },
      {
        concept: 'Vale da sombra da morte',
        type: 'tipologia',
        refs: ['Sl 107.10-14', 'Is 9.2', 'Lc 1.79', 'Rm 8.35-37'],
      },
      {
        concept: 'Tabela diante dos inimigos',
        type: 'tipologia',
        refs: ['Sl 78.19', 'Is 65.13', 'Lc 22.30', 'Ap 19.9'],
      },
      {
        concept: 'Casa do SENHOR',
        type: 'cristologica',
        refs: ['Sl 27.4', 'Sl 84.1-4', 'Jo 14.2-3', 'Ap 21.3-4'],
      },
    ],
  },

  // ── Gênesis 39.2 ─────────────────────────────────────────────────────────
  {
    sourceBook: 'Gênesis', sourceChapter: 39, sourceVerseStart: 2, sourceVerseEnd: 2,
    groups: [
      {
        concept: 'O SENHOR era com José',
        type: 'tema',
        refs: ['Gn 28.15', 'Gn 39.21', 'Js 1.5', 'Is 43.2', 'Mt 28.20', 'At 7.9'],
      },
      {
        concept: 'José como tipo de Cristo',
        type: 'tipologia',
        refs: ['Mt 1.16', 'Jo 1.11', 'Fp 2.9-11', 'Gn 37.4', 'At 7.9-14'],
      },
      {
        concept: 'Prosperidade na adversidade',
        type: 'paralelo',
        refs: ['Sl 1.3', 'Sl 37.7', 'Fp 4.11', 'Rm 8.28', '2Co 4.17'],
      },
    ],
  },
]
