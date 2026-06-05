export const BOLETIM_EDITORIAS = [
  'Família',
  'Igreja',
  'Educação',
  'Profissão',
  'Sociedade e Mundo',
  'Cosmovisão',
  'Espiritualidade',
  'Ministério',
] as const

export const BOLETIM_SUBEDITORIAS: Record<string, string[]> = {
  Família: ['Pai', 'Mãe', 'Filhos', 'Casamento', 'Educação dos filhos', 'Culto doméstico', 'Finanças familiares'],
  Igreja: ['Pastorado', 'Pregação', 'Discipulado', 'Liderança', 'Aconselhamento', 'Missões', 'Plantação de igrejas'],
  Educação: ['Educação clássica', 'Homeschooling', 'Escola cristã', 'Universidade', 'Pós-graduação', 'Leitura', 'Aprendizado'],
  Profissão: ['Vocação', 'Trabalho', 'Empreendedorismo', 'Gestão', 'Liderança', 'Finanças', 'Tecnologia', 'IA'],
  'Sociedade e Mundo': ['Mundo', 'Geopolítica', 'Israel', 'Oriente Médio', 'China', 'Estados Unidos', 'Europa', 'Guerras', 'Perseguição cristã', 'Sociedade', 'Família', 'Cultura', 'Sexualidade', 'Justiça', 'Bioética', 'Direitos humanos', 'Política', 'Brasil', 'Política internacional', 'Liberdade religiosa', 'Estado', 'Democracia'],
  Cosmovisão: ['Apologética', 'Ateísmo', 'Pós-modernismo', 'Marxismo', 'Secularismo', 'Pluralismo', 'Humanismo'],
  Espiritualidade: ['Oração', 'Santificação', 'Leitura bíblica', 'Discipulado', 'Vida devocional'],
  Ministério: ['Exegese', 'Hermenêutica', 'Teologia Bíblica', 'Teologia Sistemática', 'Pregação Expositiva', 'Aconselhamento Bíblico'],
}

export const BOLETIM_SOCIEDADE_SUBAREAS = [
  'Mundo',
  'Sociedade',
  'Política',
  'Cultura',
  'Ética',
  'Tecnologia',
  'Economia',
  'Geopolítica',
  'Ciência',
  'Meio Ambiente',
]

export const BOLETIM_PRIMARY_SOURCES = [
  'Ligonier Ministries',
  'TableTalk Magazine',
  'Reformation21',
  'The Gospel Coalition',
  'Desiring God',
  'Founders Ministries',
  '9Marks',
  'The Master’s Seminary',
  'Westminster Seminary',
  'Puritan Reformed Seminary',
  'RTS',
  'Banner of Truth',
  'Monergism',
  'Confissão de Fé de Westminster',
  'Catecismo Maior de Westminster',
  'Catecismo Menor de Westminster',
  'Catecismo de Heidelberg',
  'Confissão Belga',
  'Cânones de Dort',
  'Portas Abertas',
  'Voice of the Martyrs',
  'International Christian Concern',
  'First Things',
  'Public Discourse',
  'Acton Institute',
  'Breakpoint',
  'Colson Center',
  'Classical Academic Press',
  'Circe Institute',
  'Association of Classical Christian Schools',
  'Family Research Council',
  'Focus on the Family',
  'ERLC',
]

export const BOLETIM_FACTUAL_SOURCES = ['BBC', 'Reuters', 'Associated Press', 'Wall Street Journal', 'The Economist']

export const BOLETIM_CRITICAL_ONLY_SOURCES = ['Jacobin', 'Brasil 247', 'Carta Capital', 'Revista Fórum', 'The Intercept', 'Mídia Ninja']

export const BOLETIM_ARTICLE_TEMPLATE = `## Resumo Executivo

Escreva de 3 a 5 parágrafos curtos com a tese jornalística e pastoral do artigo.

## O que aconteceu?

Descreva os fatos com clareza, sem sensacionalismo e distinguindo fato de interpretação.

## Por que isso importa?

Mostre a relevância para família, igreja, educação, trabalho, cultura ou vida pública.

## Leitura Cristã

Interprete o tema a partir de Criação, Queda, Redenção e Consumação.

## Perspectiva Reformada

Relacione Escritura, confissões e catecismos. Considere Sola Scriptura, Sola Gratia, Sola Fide, Solus Christus e Soli Deo Gloria.

## Aplicações

### Para indivíduos

### Para famílias

### Para igrejas

### Para líderes

## Recursos Relacionados

- Livros:
- Sermões:
- Catecismos:
- Confissões:
- Artigos:
`

export function inferBoletimEditorias(title: string, tags: string[]): string[] {
  const source = `${title} ${tags.join(' ')}`.toLowerCase()
  const areas = new Set<string>()
  if (source.includes('fam') || source.includes('casamento') || source.includes('filho')) areas.add('Família')
  if (source.includes('igreja') || source.includes('pastor') || source.includes('presbítero') || source.includes('diácono')) areas.add('Igreja')
  if (source.includes('educ') || source.includes('homeschool') || source.includes('escola') || source.includes('universidade')) areas.add('Educação')
  if (source.includes('profiss') || source.includes('trabalho') || source.includes('vocação') || source.includes('empreend')) areas.add('Profissão')
  if (source.includes('sociedade') || source.includes('pol') || source.includes('cultura') || source.includes('tec') || source.includes('mundo') || source.includes('geopol')) areas.add('Sociedade e Mundo')
  if (source.includes('cosmov') || source.includes('apolog') || source.includes('secular') || source.includes('marx')) areas.add('Cosmovisão')
  if (source.includes('espiritual') || source.includes('oração') || source.includes('santificação') || source.includes('devocional')) areas.add('Espiritualidade')
  if (source.includes('minist') || source.includes('preg') || source.includes('exeg') || source.includes('aconselhamento')) areas.add('Ministério')
  return [...(areas.size ? areas : new Set(['Cosmovisão']))]
}
