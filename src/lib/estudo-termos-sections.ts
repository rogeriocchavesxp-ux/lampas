import type { SectionDef } from './workspace-sections'

function card(id: string, title: string, placeholder: string, aiTrigger: string) {
  return { id, title, placeholder, aiTrigger }
}

function termsSection(
  slug: string,
  title: string,
  shortTitle: string,
  phase: SectionDef['phase'],
  module: SectionDef['module'],
  group: string,
  groupLabel: string,
  order: number,
  objective: string,
  cards: SectionDef['cards']
): SectionDef {
  return {
    slug,
    title,
    shortTitle,
    phase,
    module,
    group,
    groupLabel,
    order,
    objective,
    keyQuestions: [
      'Qual é o termo investigado e por que ele importa para a interpretação bíblica?',
      'Como o termo é usado no contexto imediato e no desenvolvimento canônico?',
      'Que implicações doutrinárias e pastorais nascem deste estudo lexical?',
    ],
    relevantAuthors: ['Moises Silva', 'D. A. Carson', 'G. K. Beale', 'Gerhard Kittel', 'Louw-Nida'],
    cards,
  }
}

export const ESTUDO_TERMOS_SECTIONS: SectionDef[] = [
  termsSection(
    'termos_definir',
    'I. Definir',
    'Definir',
    'preparar',
    'inventio',
    'termos_definir_grp',
    'I. Definir',
    1225,
    'Delimitar o termo principal, seu idioma, forma original, transliteração, campo semântico e pergunta orientadora.',
    [
      card('termo_principal', 'Termo principal', 'Informe o termo bíblico ou teológico que será investigado.', 'Defina o termo principal deste estudo lexical e explique por que ele merece investigação.'),
      card('idioma', 'Idioma', 'Identifique se o termo será estudado em português, grego, hebraico, aramaico ou latim teológico.', 'Identifique o idioma do termo e explique sua relevância para a análise lexical.'),
      card('forma_original', 'Forma original', 'Registre a forma original do termo quando aplicável, como παρουσία ou חֶסֶד.', 'Apresente a forma original do termo e explique sua morfologia básica quando aplicável.'),
      card('transliteracao', 'Transliteração', 'Registre a transliteração e pronúncia aproximada.', 'Forneça a transliteração do termo original e explique como ela deve ser lida.'),
      card('campo_semantico', 'Campo semântico', 'Mapeie o conjunto de sentidos, palavras próximas e ideias relacionadas.', 'Mapeie o campo semântico do termo, incluindo sentidos próximos, contrastes e limites de uso.'),
      card('pergunta_central', 'Pergunta central', 'Formule a pergunta que guiará o estudo do termo.', 'Formule uma pergunta central clara para orientar o estudo lexical, bíblico-teológico e doutrinário deste termo.'),
    ]
  ),

  termsSection(
    'termos_analisar',
    'II. Analisar',
    'Analisar',
    'interpretar',
    'inventio',
    'termos_analisar_grp',
    'II. Analisar',
    1226,
    'Investigar definição lexical, uso imediato, uso no livro bíblico, uso nos Testamentos e termos relacionados.',
    [
      card('definicao_lexical', 'Definição lexical', 'Sintetize os sentidos principais em léxicos e dicionários bíblicos confiáveis.', 'Gere uma definição lexical rigorosa do termo, distinguindo sentido básico, usos derivados e limites semânticos.'),
      card('contexto_imediato', 'Uso no contexto imediato', 'Analise como o termo funciona na passagem ou no argumento imediato.', 'Analise o uso do termo em seu contexto imediato, evitando falácia da raiz e importação indevida de sentidos.'),
      card('uso_livro_biblico', 'Uso no livro bíblico', 'Observe como o termo aparece e se desenvolve no livro bíblico estudado.', 'Explique como este termo é usado no livro bíblico em questão e que papel exerce no argumento ou narrativa.'),
      card('uso_antigo_testamento', 'Uso no Antigo Testamento', 'Mapeie usos relevantes no Antigo Testamento, quando aplicável.', 'Rastreie usos relevantes do termo ou de seu conceito no Antigo Testamento, destacando continuidade e desenvolvimento.'),
      card('uso_novo_testamento', 'Uso no Novo Testamento', 'Mapeie usos relevantes no Novo Testamento, quando aplicável.', 'Rastreie usos relevantes do termo ou de seu conceito no Novo Testamento, destacando cumprimento e desenvolvimento cristológico.'),
      card('termos_relacionados', 'Variações e termos relacionados', 'Liste termos cognatos, sinônimos, antônimos e expressões paralelas.', 'Identifique variações, cognatos, sinônimos, antônimos e termos relacionados que ajudam a delimitar o sentido.'),
    ]
  ),

  termsSection(
    'termos_rastrear',
    'III. Rastrear',
    'Rastrear',
    'interpretar',
    'dispositio',
    'termos_rastrear_grp',
    'III. Rastrear',
    1227,
    'Rastrear ocorrências principais, desenvolvimento canônico, alianças, Cristo e o povo de Deus.',
    [
      card('ocorrencias_principais', 'Ocorrências principais', 'Liste as ocorrências mais importantes e explique por que são decisivas.', 'Liste e explique as ocorrências principais deste termo na Escritura, priorizando as mais relevantes para o tema.'),
      card('desenvolvimento_canonico', 'Desenvolvimento canônico', 'Mostre como o sentido se desenvolve ao longo da história redentiva.', 'Rastreie o desenvolvimento canônico do termo, mostrando progressão, continuidade e culminação bíblica.'),
      card('relacao_aliancas', 'Relação com alianças', 'Explique como o termo se relaciona com as alianças bíblicas.', 'Explique como o termo se relaciona com as alianças bíblicas e com a estrutura da história da redenção.'),
      card('relacao_cristo', 'Relação com Cristo', 'Mostre como Cristo cumpre, revela ou redefine o termo.', 'Demonstre a relação do termo com Cristo, seu cumprimento, mediação, senhorio ou obra redentora.'),
      card('relacao_povo_de_deus', 'Relação com o povo de Deus', 'Explique implicações para Israel, igreja e povo de Deus.', 'Explique como o termo se relaciona com o povo de Deus no Antigo e no Novo Testamento.'),
    ]
  ),

  termsSection(
    'termos_sintetizar',
    'IV. Sintetizar',
    'Sintetizar',
    'comunicar',
    'elocutio',
    'termos_sintetizar_grp',
    'IV. Sintetizar',
    1228,
    'Produzir síntese bíblico-teológica, implicações doutrinárias, implicações pastorais e alertas interpretativos.',
    [
      card('sintese_biblico_teologica', 'Síntese bíblico-teológica', 'Sintetize o ensino bíblico do termo em linguagem clara e fiel ao cânone.', 'Gere uma síntese bíblico-teológica do termo, integrando lexicalidade, contexto e desenvolvimento canônico.'),
      card('implicacoes_doutrinarias', 'Implicações doutrinárias', 'Explique como o termo contribui para doutrinas bíblicas e sistemáticas.', 'Explique as principais implicações doutrinárias deste termo para a teologia bíblica e sistemática.'),
      card('implicacoes_pastorais', 'Implicações pastorais', 'Aponte aplicações para pregação, ensino, aconselhamento e vida cristã.', 'Aponte implicações pastorais concretas do termo para pregação, ensino, aconselhamento e vida cristã.'),
      card('erros_comuns', 'Erros comuns de interpretação', 'Liste riscos, abusos, falácias lexicais e leituras populares equivocadas.', 'Liste erros comuns na interpretação deste termo, incluindo falácia da raiz, anacronismo e leitura fora de contexto.'),
    ]
  ),

  termsSection(
    'termos_produzir',
    'V. Produzir',
    'Produzir',
    'comunicar',
    'pronuntiatio',
    'termos_produzir_grp',
    'V. Produzir',
    1229,
    'Transformar a pesquisa em verbete, esboço, perguntas para discussão e aplicações.',
    [
      card('verbete_final', 'Verbete final', 'Redija um verbete claro, preciso e reutilizável sobre o termo.', 'Redija um verbete final sobre o termo com definição, contexto bíblico, síntese teológica e uso pastoral.'),
      card('esboco_estudo', 'Esboço do estudo', 'Organize o conteúdo em um esboço ensinável.', 'Crie um esboço de estudo ensinável a partir da pesquisa lexical e bíblico-teológica deste termo.'),
      card('perguntas_discussao', 'Perguntas para discussão', 'Crie perguntas para grupo, aula, discipulado ou estudo pessoal.', 'Gere perguntas de discussão que ajudem alunos ou grupo a compreender e aplicar este termo.'),
      card('aplicacoes', 'Aplicações', 'Liste aplicações pessoais, eclesiásticas, doutrinárias e pastorais.', 'Gere aplicações fiéis ao texto e ao desenvolvimento bíblico-teológico do termo.'),
    ]
  ),
]
