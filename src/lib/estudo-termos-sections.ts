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

  // ── Seções do novo schema (Phase II — Investigar) ────────────────────────

  termsSection(
    'termos_ocorrencias',
    'Ocorrências',
    'Ocorrências',
    'interpretar',
    'inventio',
    'termos_ocorrencias_grp',
    'Ocorrências',
    1230,
    'Mapear o total de ocorrências do termo na Escritura, sua distribuição por livro e identificar as ocorrências mais relevantes para o estudo.',
    [
      card('total_ocorrencias', 'Total de ocorrências', 'Quantas vezes o termo aparece na Escritura? Use concordâncias ou léxicos para o total em hebraico/aramaico e grego.', 'Qual o número total de ocorrências deste termo na Bíblia Hebraica (ou Septuaginta) e no Novo Testamento grego? Forneça dados de concordância.'),
      card('distribuicao', 'Distribuição por livro', 'Liste a distribuição do termo pelos livros bíblicos. Há concentração em algum livro, gênero ou período?', 'Liste a distribuição do termo pelos livros bíblicos, ordenando por frequência. Que padrão de uso emerge? Há concentração em algum gênero literário (narrativa, profecia, epístola)?'),
      card('ocorrencias_chave', 'Ocorrências-chave', 'Identifique as 3 a 5 ocorrências mais importantes para a compreensão do termo — aquelas onde o sentido é mais claro ou mais debatido.', 'Identifique as ocorrências mais importantes deste termo na Escritura — passagens onde o sentido é determinante, debatido pelos exegetas ou decisivo para a teologia bíblica do termo.'),
    ]
  ),

  termsSection(
    'termos_lexico',
    'Léxico',
    'Léxico',
    'interpretar',
    'inventio',
    'termos_lexico_grp',
    'Léxico',
    1231,
    'Investigar a definição lexical do termo, sua etimologia, os glossos (equivalentes em outras línguas) e seus padrões de uso linguístico.',
    [
      card('definicao_basica', 'Definição básica', 'Sintetize os sentidos principais do termo segundo léxicos e dicionários bíblicos — BDAG, HALOT, TWOT ou Louw-Nida.', 'Forneça a definição lexical rigorosa deste termo a partir de BDAG, HALOT, TWOT ou Louw-Nida. Distinga sentido básico, usos derivados, nuances e limites semânticos.'),
      card('etimologia', 'Etimologia', 'Qual a origem histórica do termo? A etimologia oferece alguma luz — ou deve ser tratada com cautela para evitar a falácia da raiz?', 'Qual a etimologia deste termo? Apresente a origem histórica e discuta se ela contribui para o sentido atual ou se deve ser tratada com cautela (falácia da raiz). Cite D.A. Carson ou Moises Silva.'),
      card('glossos', 'Glossos e equivalentes', 'Como o termo é traduzido nas principais versões bíblicas (LXX, Vulgata, versões modernas)? Há variação significativa de tradução?', 'Como este termo é traduzido nas principais versões bíblicas (LXX, Vulgata, ARA, NVI, ESV, NIV)? Que variações de tradução existem e o que revelam sobre o debate interpretativo?'),
      card('uso_linguistico', 'Uso linguístico', 'Como o termo funciona gramaticalmente no contexto? É substantivo, verbo, adjetivo? Há construções fixas ou idiomáticas relevantes?', 'Explique o funcionamento linguístico do termo: classe gramatical, construções típicas, idiomas relevantes, e como o contexto sintático influencia o sentido. Use Wallace ou Waltke-O\'Connor.'),
    ]
  ),

  termsSection(
    'termos_campo_semantico',
    'Campo Semântico',
    'Campo Semântico',
    'interpretar',
    'inventio',
    'termos_campo_semantico_grp',
    'Campo Semântico',
    1232,
    'Mapear o campo semântico do termo: sinônimos, antônimos, termos relacionados e família lexical — delimitando fronteiras de sentido.',
    [
      card('sinonimos', 'Sinônimos', 'Quais termos compartilham domínio semântico similar? Há sobreposição de sentido com outros vocábulos bíblicos relevantes?', 'Identifique os principais sinônimos deste termo no hebraico/aramaico ou grego bíblico. Onde há sobreposição de sentido e onde os termos se distinguem? Use Louw-Nida para mapeamento de domínios semânticos.'),
      card('antonimos', 'Antônimos', 'Quais termos contrastam diretamente com este? O contraste é explícito no texto ou emerge do campo semântico?', 'Quais termos bíblicos contrastam diretamente com este? O contraste é explícito no texto ou implícito no campo semântico? Como o antônimo ajuda a delimitar o sentido do termo estudado?'),
      card('termos_relacionados', 'Termos relacionados', 'Quais outros vocábulos bíblicos pertencem ao mesmo campo temático sem serem sinônimos diretos?', 'Identifique termos bíblicos relacionados que pertencem ao mesmo campo temático mas se distinguem em matiz ou ênfase. Como eles iluminam o sentido do termo estudado sem serem idênticos a ele?'),
      card('familia_lexical', 'Família lexical', 'Quais palavras derivam da mesma raiz ou base? Como a família lexical ilumina (sem determinar) o sentido do termo?', 'Mapeie a família lexical deste termo: raiz, derivados, cognatos e formas relacionadas. Com que cautela devemos usar a família lexical para interpretar o sentido? Cite Moises Silva ou D.A. Carson.'),
    ]
  ),

  termsSection(
    'termos_uso_at',
    'Uso no Antigo Testamento',
    'Uso no AT',
    'interpretar',
    'inventio',
    'termos_uso_at_grp',
    'Uso no Antigo Testamento',
    1233,
    'Rastrear o uso do termo nos principais corpora do Antigo Testamento: Pentateuco, livros históricos, profetas e literatura sapiencial.',
    [
      card('uso_pentateuco', 'Pentateuco', 'Como o termo aparece no Pentateuco (Gênesis a Deuteronômio)? Quais contextos são mais relevantes para o sentido fundamental do termo?', 'Rastreie o uso deste termo no Pentateuco. Em que contextos aparece? Como seu uso em Gênesis a Deuteronômio estabelece fundamentos semânticos para o restante do AT?'),
      card('uso_historicos', 'Históricos', 'Como o termo aparece nos livros históricos (Josué ao Ester)? Há desenvolvimento ou usos especializados?', 'Rastreie o uso deste termo nos livros históricos (Josué, Juízes, Samuel, Reis, Crônicas, Esdras, Neemias, Ester). Há desenvolvimento do sentido ou usos especializados no contexto monárquico ou pós-exílico?'),
      card('uso_profetas', 'Profetas', 'Como os Profetas Maiores e Menores usam o termo? Há usos escatológicos ou promessas específicas?', 'Rastreie o uso deste termo nos Profetas Maiores (Isaías, Jeremias, Ezequiel, Daniel) e nos Profetas Menores. Há usos escatológicos, promessas de cumprimento ou reinterpretações significativas do sentido?'),
      card('uso_sabedoria', 'Sabedoria', 'Como os livros sapienciais (Jó, Salmos, Provérbios, Eclesiastes, Cantares) usam o termo? Que dimensão poética ou reflexiva ele adquire?', 'Rastreie o uso deste termo na literatura sapiencial e poética (Jó, Salmos, Provérbios, Eclesiastes, Cantares). Que dimensão reflexiva, adorativa ou contemplativa o termo adquire nesse contexto literário?'),
    ]
  ),

  termsSection(
    'termos_uso_nt',
    'Uso no Novo Testamento',
    'Uso no NT',
    'interpretar',
    'inventio',
    'termos_uso_nt_grp',
    'Uso no Novo Testamento',
    1234,
    'Rastrear o uso do termo nos Evangelhos, Atos, Epístolas e Apocalipse — identificando continuidade, desenvolvimento e cumprimento cristológico.',
    [
      card('uso_evangelhos', 'Evangelhos', 'Como Jesus e os evangelistas usam o termo? Há momentos decisivos em que o sentido é redefinido ou aprofundado?', 'Como os Evangelhos usam este termo? Jesus o usa de forma especial? Há momentos em que o sentido é redefinido, aprofundado ou cumprido em sua pessoa e ministério? Analise cada evangelista com suas ênfases próprias.'),
      card('uso_atos', 'Atos', 'Como o livro de Atos usa o termo no contexto da expansão da Igreja primitiva?', 'Como o livro de Atos usa este termo? Há usos significativos nos discursos apostólicos ou na narrativa da expansão missionária? Como Lucas aplica o termo à comunidade do Espírito?'),
      card('uso_epistolas', 'Epístolas', 'Como as cartas apostólicas (Paulo, Hebreus, Pedro, João, Tiago) desenvolvem o uso do termo para a Igreja?', 'Rastreie o uso do termo nas epístolas apostólicas: Paulo (organizando por carta), Hebreus, Pedro, João, Tiago, Judas. Há desenvolvimento doutrinário significativo? Quais passagens são loci classici?'),
      card('uso_apocalipse', 'Apocalipse', 'Como o Apocalipse usa o termo no horizonte escatológico? Há dimensão simbólica ou profética relevante?', 'Como o Apocalipse usa este termo em seu horizonte escatológico e simbólico? Use Beale para fundamentar a análise. O que o uso apocalíptico revela sobre o cumprimento final e a consumação do tema?'),
    ]
  ),

  termsSection(
    'termos_desenv_canonico',
    'Desenvolvimento Canônico',
    'Desenv. Canônico',
    'interpretar',
    'inventio',
    'termos_desenv_canonico_grp',
    'Desenvolvimento Canônico',
    1235,
    'Sintetizar a progressão do sentido do termo ao longo da história redentiva, do AT ao NT, culminando em Cristo e no desenvolvimento epistolar.',
    [
      card('progressao_at', 'Progressão no AT', 'Como o sentido do termo se desenvolve ao longo do AT? Há aprofundamento, especialização ou expansão semântica de período em período?', 'Descreva a progressão do sentido deste termo ao longo do AT, de período em período: patriarcal, mosaico, monárquico, profético. Há aprofundamento, especialização ou expansão semântica detectável?'),
      card('transicao_nt', 'Transição para o NT', 'Como o NT recebe e reinterpreta o termo à luz de Cristo e do Espírito? Há continuidade, cumprimento ou ruptura em relação ao uso veterotestamentário?', 'Como o NT recebe e reinterpreta este termo à luz de Cristo e do Espírito? Há continuidade com o AT, cumprimento de expectativas proféticas, ou reinterpretação cristológica significativa? Cite Moises Silva.'),
      card('cumprimento_cristo', 'Cumprimento em Cristo', 'Como Cristo é o cumprimento definitivo do sentido pleno do termo? Em que dimensões de sua pessoa e obra o termo encontra seu ápice?', 'Demonstre como Jesus Cristo representa o cumprimento definitivo e o ápice do sentido deste termo. Em que dimensões de sua pessoa e obra — encarnação, ministério, paixão, ressurreição — o termo se realiza plenamente?'),
      card('desenv_epistolar', 'Desenvolvimento epistolar', 'Como as epístolas apostólicas desenvolvem e aplicam o sentido do termo para as comunidades cristãs?', 'Como as epístolas apostólicas desenvolvem, sistematizam e aplicam o sentido deste termo para as comunidades cristãs? Há formulações doutrinárias explícitas ou aplicações pastorais características?'),
    ]
  ),

  termsSection(
    'termos_relacao_cristo',
    'Relação com Cristo',
    'Relação com Cristo',
    'interpretar',
    'inventio',
    'termos_relacao_cristo_grp',
    'Relação com Cristo',
    1236,
    'Analisar como o termo se relaciona com Cristo por meio de prefiguração, tipologia, cumprimento e aplicação redentor-histórica.',
    [
      card('prefiguracao', 'Prefiguração e tipologia', 'Há prefigurações ou tipos veterotestamentários ligados ao termo que apontam para Cristo? Como funcionam como antecipações?', 'Identifique prefigurações e tipos veterotestamentários ligados a este termo. Como funcionam como antecipações de Cristo? Use Beale ou Clowney para embasar a tipologia e evitar alegorismo arbitrário.'),
      card('cumprimento', 'Cumprimento em Cristo', 'Como Cristo cumpre, realiza e dá sentido definitivo ao termo em sua pessoa e obra redentora?', 'Demonstre como Jesus Cristo cumpre e dá sentido definitivo a este termo. Como ele se manifesta na pessoa de Cristo (divindade, humanidade, ofícios) e em sua obra (vida, morte, ressurreição, ascensão)?'),
      card('aplicacao', 'Aplicação redentor-histórica', 'Como o sentido do termo, cumprido em Cristo, se aplica à Igreja e ao crente na era do Espírito?', 'Como o sentido cumprido deste termo em Cristo se aplica à Igreja e ao crente individual na era do Espírito? Que implicações redentor-históricas decorrem do fato de vivermos entre as duas vindas de Cristo?'),
    ]
  ),

  termsSection(
    'termos_implicacoes',
    'Implicações Teológicas',
    'Implicações',
    'interpretar',
    'inventio',
    'termos_implicacoes_grp',
    'Implicações Teológicas',
    1237,
    'Derivar as implicações doutrinárias, pastorais e hermenêuticas do estudo lexical e canônico do termo.',
    [
      card('doutrina', 'Doutrina relacionada', 'Quais doutrinas sistemáticas são iluminadas, fundamentadas ou corrigidas pelo estudo lexical e canônico deste termo?', 'Identifique as doutrinas sistemáticas que são iluminadas ou corrigidas pelo estudo rigoroso deste termo. Em qual lócus da teologia ele melhor se encaixa? Use Bavinck, Berkhof ou Frame.'),
      card('aplicacao_pastoral', 'Aplicação pastoral', 'Que implicações pastorais concretas nascem deste estudo lexical — para pregação, ensino, aconselhamento e formação espiritual?', 'Aponte implicações pastorais concretas do estudo deste termo para a pregação expositiva, o ensino, o aconselhamento bíblico e a formação espiritual. Como o estudo rigoroso enriquece o ministério prático?'),
      card('erros_interpretacao', 'Erros de interpretação comuns', 'Quais erros ou distorções no uso deste termo são comuns? Há falácias lexicais, anacronisvos ou leituras populares equivocadas a alertar?', 'Liste os principais erros de interpretação associados a este termo: falácia da raiz, anacronismo, uso superficial de concordâncias, leituras populares equivocadas. Como o estudo rigoroso corrige essas distorções? Cite D.A. Carson.'),
    ]
  ),
]
