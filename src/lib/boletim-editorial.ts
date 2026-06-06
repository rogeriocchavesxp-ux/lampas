export const BOLETIM_EDITORIAS = [
  'Igreja e Reino',
  'Mundo',
  'Sociedade',
  'Família',
  'Educação',
  'Profissão',
  'Ministério',
] as const

export const BOLETIM_SUBEDITORIAS: Record<string, string[]> = {
  'Igreja e Reino': ['Missões', 'Plantação de igrejas', 'Perseguição', 'Evangelização', 'Tradução da Bíblia'],
  Mundo: ['Geopolítica', 'Israel', 'Oriente Médio', 'China', 'Economia', 'Tecnologia', 'Política e Liberdade Religiosa'],
  Sociedade: ['Família', 'Educação', 'Cultura', 'Sexualidade', 'Bioética'],
  Família: ['Pais', 'Mães', 'Filhos', 'Casamento'],
  Profissão: ['Vocação', 'Trabalho', 'Liderança', 'Empreendedorismo'],
  Educação: ['Educação clássica', 'Homeschooling', 'Universidade'],
  Ministério: ['Pregação', 'Exegese', 'Hermenêutica', 'Aconselhamento'],
}

export const BOLETIM_SOCIEDADE_SUBAREAS = [
  'Fonte original',
  'Autor original',
  'Ministério original',
  'Organização original',
  'Contexto',
  'Leitura adicional',
]

export const BOLETIM_PRIMARY_SOURCES = [
  'Portas Abertas',
  'Voice of the Martyrs',
  'Joshua Project',
  'Lausanne Movement',
  'The Gospel Coalition',
  'Coalizão pelo Evangelho',
  'Ligonier Ministries',
  'Desiring God',
  '9Marks',
  'Acts 29',
  'Reuters',
  'Associated Press',
  'BBC',
  'The Economist',
  'Wall Street Journal',
  'First Things',
  'Public Discourse',
  'Acton Institute',
  'Colson Center',
  'Focus on the Family',
  'Family Research Council',
  'Classical Academic Press',
  'Circe Institute',
  'Association of Classical Christian Schools',
  'Founders Ministries',
  'RTS',
  'Westminster Seminary',
  'Puritan Reformed Seminary',
  'TableTalk Magazine',
  'Reformation21',
  'The Master’s Seminary',
  'Banner of Truth',
  'Monergism',
  'Confissão de Fé de Westminster',
  'Catecismo Maior de Westminster',
  'Catecismo Menor de Westminster',
  'Catecismo de Heidelberg',
  'Confissão Belga',
  'Cânones de Dort',
  'International Christian Concern',
  'Breakpoint',
  'ERLC',
]

export const BOLETIM_FACTUAL_SOURCES = ['BBC', 'Reuters', 'Associated Press', 'Wall Street Journal', 'The Economist']

export const BOLETIM_CRITICAL_ONLY_SOURCES = ['Jacobin', 'Brasil 247', 'Carta Capital', 'Revista Fórum', 'The Intercept', 'Mídia Ninja']

export const BOLETIM_ARTICLE_TEMPLATE = `## Resumo Executivo

Não escreva sem antes confirmar a fonte original, a data da publicação e o link. Se não houver publicação real, substitua por: "Nenhuma matéria relevante encontrada nesta categoria."

## Fonte original

Nome da organização ou veículo.

## Autor

Nome do autor quando disponível. Se não houver byline, use "Não informado pela fonte".

## Data da publicação

dd/mm/aaaa

## Link original

URL da publicação original.

## Resumo do conteúdo

Resumo factual, sem opinião, sermão, militância ou comentários partidários.

## Por que isso é relevante?

Contexto mínimo para cristãos, igrejas e famílias.
`

export const BOLETIM_EDITION_TEMPLATE = `# Observatório Lampas — Edição Inaugural

Antes de escrever qualquer matéria, confirme a publicação original, autor, data, link e atualidade. Não use exemplos fictícios. Se não encontrar matéria real em uma categoria, escreva exatamente: "Nenhuma matéria relevante encontrada nesta categoria."

## Manchete Principal

### Título

### Fonte original

### Autor

### Data da publicação

### Link original

### Resumo do conteúdo

### Por que isso é relevante?

### Leituras recomendadas

## Igreja e Reino

### Matéria 1

#### Título

#### Fonte original

#### Autor

#### Data da publicação

#### Link original

#### Resumo do conteúdo

#### Por que isso é relevante?

## Mundo

### Matéria 1

#### Título

#### Fonte original

#### Autor

#### Data da publicação

#### Link original

#### Resumo do conteúdo

#### Por que isso é relevante?

## Sociedade

### Matéria 1

#### Título

#### Fonte original

#### Autor

#### Data da publicação

#### Link original

#### Resumo do conteúdo

#### Por que isso é relevante?

## Família

### Matéria 1

#### Título

#### Fonte original

#### Autor

#### Data da publicação

#### Link original

#### Resumo do conteúdo

#### Por que isso é relevante?

## Educação

### Matéria 1

#### Título

#### Fonte original

#### Autor

#### Data da publicação

#### Link original

#### Resumo do conteúdo

#### Por que isso é relevante?

## Profissão

### Matéria 1

#### Título

#### Fonte original

#### Autor

#### Data da publicação

#### Link original

#### Resumo do conteúdo

#### Por que isso é relevante?

## Ministério

### Matéria 1

#### Título

#### Fonte original

#### Autor

#### Data da publicação

#### Link original

#### Resumo do conteúdo

#### Por que isso é relevante?

## Leituras Recomendadas

Liste apenas recursos reais já verificados.

## Agenda de Oração

Pedidos baseados nas matérias verificadas desta edição.
`

export function inferBoletimEditorias(title: string, tags: string[]): string[] {
  const source = `${title} ${tags.join(' ')}`.toLowerCase()
  const areas = new Set<string>()
  if (source.includes('fam') || source.includes('casamento') || source.includes('filho')) areas.add('Família')
  if (source.includes('igreja') || source.includes('miss') || source.includes('evangel') || source.includes('perseg') || source.includes('bíblia') || source.includes('biblia')) areas.add('Igreja e Reino')
  if (source.includes('mundo') || source.includes('geopol') || source.includes('israel') || source.includes('china') || source.includes('oriente') || source.includes('econom') || source.includes('tecnologia')) areas.add('Mundo')
  if (source.includes('sociedade') || source.includes('cultura') || source.includes('sexual') || source.includes('bioética') || source.includes('bioetica')) areas.add('Sociedade')
  if (source.includes('educ') || source.includes('homeschool') || source.includes('escola') || source.includes('universidade')) areas.add('Educação')
  if (source.includes('profiss') || source.includes('trabalho') || source.includes('vocação') || source.includes('empreend')) areas.add('Profissão')
  if (source.includes('minist') || source.includes('preg') || source.includes('exeg') || source.includes('hermen') || source.includes('aconselhamento')) areas.add('Ministério')
  return [...(areas.size ? areas : new Set(['Igreja e Reino']))]
}
