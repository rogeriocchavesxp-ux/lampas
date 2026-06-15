import type { SectionDef } from './workspace-sections'

function card(id: string, title: string, placeholder: string, aiTrigger: string) {
  return { id, title, placeholder, aiTrigger }
}

function termsSection(
  slug: string,
  title: string,
  shortTitle: string,
  phase: SectionDef['phase'],
  group: string,
  groupLabel: string,
  order: number,
  objective: string,
  keyQuestions: string[],
  relevantAuthors: string[],
  cards: SectionDef['cards']
): SectionDef {
  return { slug, title, shortTitle, phase, module: 'inventio', group, groupLabel, order, objective, keyQuestions, relevantAuthors, cards }
}

export const ESTUDO_TERMOS_SECTIONS: SectionDef[] = [

  // ── 1. DEFINIÇÃO ────────────────────────────────────────────────────────────
  termsSection(
    'termos_definicao',
    'Definição',
    'Definição',
    'preparar',
    'termos_definicao_grp',
    'Definição',
    1225,
    'Descobrir o significado do termo — sua forma original, campo semântico, uso bíblico e formulação teológica.',
    [
      'Qual a forma original do termo e o que ela revela sobre seu significado?',
      'Quais são os limites semânticos do conceito — o que ele inclui e o que exclui?',
      'Como a Escritura usa este termo em contraposição às definições culturais ou populares?',
    ],
    ['Moisés Silva', 'James Barr', 'Louw & Nida', 'BDAG', 'HALOT', 'G. K. Beale'],
    [
      card(
        'forma_original',
        'Forma Original',
        'Hebraico, aramaico ou grego — registre a forma original do termo, sua transliteração e pronúncia aproximada.\n\nExemplo: חֶסֶד (ḥesed), παρουσία (parousia).',
        'Apresente a forma original deste termo bíblico, incluindo: língua de origem (hebraico/aramaico/grego), grafia original, transliteração e pronúncia aproximada. Comente o que a morfologia revela sobre o significado.'
      ),
      card(
        'campo_semantico',
        'Campo Semântico',
        'Mapeie o conjunto de significados possíveis do termo — sentidos primário, derivados, nuances e limites do conceito.\n\nO que este termo inclui e o que está fora do seu escopo semântico?',
        'Mapeie o campo semântico deste termo: sentido primário, significados derivados, nuances contextuais e limites semânticos. Cite dados de léxicos confiáveis (BDAG, HALOT, Louw-Nida). Evite a falácia da raiz.'
      ),
      card(
        'definicao_biblica',
        'Definição Bíblica',
        'Como a própria Escritura usa e define este termo? Identifique passagens-chave que iluminam seu significado e uso.',
        'Explique como a Escritura usa e define este termo. Quais passagens são mais determinantes para seu significado? Como o uso bíblico contrasta com definições culturais ou populares?'
      ),
      card(
        'definicao_teologica',
        'Definição Teológica',
        'Qual a formulação teológica deste conceito? Como a tradição reformada e os grandes comentaristas definem este termo em linguagem doutrinária?',
        'Apresente a definição teológica deste termo — como ele foi formulado pela tradição reformada, pelos Símbolos de fé e pelos principais teólogos. Qual a relação com a teologia sistemática?'
      ),
      card(
        'definicao_inicial',
        'Definição Inicial',
        'Síntese provisória: em uma ou duas frases, defina o termo com suas próprias palavras a partir do que já investigou.\n\nEsta definição será refinada na Síntese Final.',
        'Gere uma definição inicial e provisória deste termo, sintetizando o que foi levantado até agora. Esta definição deve ser clara, bíblica e suficiente para orientar as etapas seguintes do estudo.'
      ),
    ]
  ),

  // ── 2. COMPARAÇÃO ───────────────────────────────────────────────────────────
  termsSection(
    'termos_comparacao',
    'Comparação',
    'Comparação',
    'preparar',
    'termos_comparacao_grp',
    'Comparação',
    1226,
    'Entender o termo por contraste e aproximação — sinônimos, antônimos, conceitos relacionados e distinções importantes.',
    [
      'Quais termos bíblicos são sinônimos e em que aspectos divergem?',
      'O que este termo definitivamente não é — quais são suas fronteiras conceituais?',
      'Como as distinções entre este termo e conceitos próximos iluminam sua identidade própria?',
    ],
    ['D. A. Carson', 'Moisés Silva', 'Louw & Nida', 'TDNT', 'TDOT'],
    [
      card(
        'sinonimos_biblicos',
        'Sinônimos Bíblicos',
        'Liste os termos bíblicos sinônimos ou semanticamente próximos.\n\nExemplo para "comunhão": koinonia, fellowship, participação, partilha.',
        'Liste os principais sinônimos bíblicos deste termo, explicando em que aspectos se aproximam e em que se distinguem. Use dados lexicais e exemplos de uso na Escritura.'
      ),
      card(
        'antonimos_biblicos',
        'Antônimos Bíblicos',
        'Quais termos representam o oposto ou a negação deste conceito?\n\nExemplo para "graça": merecimento, lei, condenação.',
        'Identifique os antônimos bíblicos deste termo — conceitos que o definem por contraste. Como a Escritura usa esses opostos para delimitar o significado do termo em estudo?'
      ),
      card(
        'conceitos_relacionados',
        'Conceitos Relacionados',
        'Quais outros conceitos teológicos ou bíblicos orbitam este termo? Com que doutrina, aliança ou tema ele se conecta mais diretamente?',
        'Mapeie os conceitos teológicos e bíblicos relacionados a este termo — não sinônimos, mas conceitos que co-ocorrem ou que dependem deste para sua plena compreensão.'
      ),
      card(
        'distincoes',
        'Distinções Importantes',
        'O que este termo NÃO é? Liste distinções precisas que protegem de confusões comuns.\n\nExemplo para "comunhão": não é mera convivência social; não é apenas amizade; não é somente unidade organizacional.',
        'Liste as distinções mais importantes para este termo — o que ele definitivamente não é. Quais confusões teológicas ou populares estas distinções corrigem? Como elas protegem a interpretação bíblica correta?'
      ),
    ]
  ),

  // ── 3. RELAÇÃO ──────────────────────────────────────────────────────────────
  termsSection(
    'termos_relacao',
    'Relação',
    'Relação',
    'investigar',
    'termos_relacao_grp',
    'Relação',
    1227,
    'Compreender como o termo se conecta ao restante da revelação bíblica — Deus, Cristo, Espírito, Igreja, salvação, Reino e doutrinas associadas.',
    [
      'Como este termo revela algo sobre a natureza ou obra de Deus?',
      'Qual o papel de Cristo na definição plena deste conceito?',
      'Como este termo se conecta às grandes doutrinas da fé reformada?',
    ],
    ['Geerhardus Vos', 'Thomas Schreiner', 'D. A. Carson', 'Herman Ridderbos', 'Herman Bavinck'],
    [
      card(
        'relacao_deus',
        'Relação com Deus',
        'Como este termo reflete ou revela atributos, obras ou propósitos de Deus?\n\nO que ele ensina sobre quem Deus é?',
        'Explique como este termo se relaciona com Deus — seus atributos, sua vontade, seus propósitos na história da redenção. O que ele revela sobre a natureza e caráter divino?'
      ),
      card(
        'relacao_cristo',
        'Relação com Cristo',
        'Como Cristo cumpre, redefine ou encarna plenamente este conceito?\n\nComo ele é entendido à luz da obra e pessoa de Jesus?',
        'Mostre como este termo se relaciona com Cristo — sua pessoa, obra, ministério, morte e ressurreição. Cristo cumpre, redefine ou encarna este conceito? Explique a relação cristológica.'
      ),
      card(
        'relacao_espirito',
        'Relação com o Espírito Santo',
        'Qual o papel do Espírito Santo em relação a este conceito?\n\nEle o opera, aplica, revela ou confirma?',
        'Explique como o Espírito Santo se relaciona com este termo — sua obra de aplicação, iluminação ou testemunho. Como a pneumatologia ilumina este conceito?'
      ),
      card(
        'relacao_igreja',
        'Relação com a Igreja',
        'Como este conceito se aplica à vida, missão, identidade ou comunhão da Igreja?',
        'Explique como este termo se relaciona com a Igreja — sua vida comunitária, sacramentos, missão, governo e edificação. Quais implicações eclesiológicas emergem deste conceito?'
      ),
      card(
        'relacao_salvacao',
        'Relação com a Salvação',
        'Como este conceito se conecta à ordem da salvação — eleição, chamado, regeneração, fé, justificação, santificação, glorificação?',
        'Mapeie a relação deste termo com a salvação — como ele aparece na ordo salutis e na historia salutis. Qual sua posição na estrutura da soteriologia bíblica?'
      ),
      card(
        'relacao_reino',
        'Relação com o Reino de Deus',
        'Como este conceito se situa na estrutura do Reino — já presente, ainda não consumado?',
        'Explique como este termo se relaciona com o Reino de Deus — sua inauguração, expansão e consumação. Como a tensão "já e ainda não" modela o entendimento deste conceito?'
      ),
      card(
        'relacao_doutrinas',
        'Relação com Doutrinas Associadas',
        'Com quais doutrinas sistemáticas este termo se relaciona mais diretamente?\n\nExemplo: teologia da aliança, cristologia, soteriologia, escatologia.',
        'Identifique as doutrinas sistemáticas com as quais este termo tem relação mais direta. Como ele contribui para — ou é iluminado por — essas doutrinas? Há tensões teológicas a resolver?'
      ),
    ]
  ),

  // ── 4a. CIRCUNSTÂNCIA ───────────────────────────────────────────────────────
  termsSection(
    'termos_circunstancia',
    'Circunstância',
    'Circunstância',
    'investigar',
    'termos_circunstancia_grp',
    'Circunstância',
    1228,
    'Analisar os contextos histórico, cultural e literário em que o termo aparece, e suas principais ocorrências na Escritura.',
    [
      'Em que contexto histórico e cultural o termo emerge na Escritura?',
      'Qual o papel literário do termo no gênero em que aparece?',
      'Quais são as ocorrências mais decisivas para a compreensão correta do conceito?',
    ],
    ['Walter Kaiser', 'Bruce Waltke', 'D. A. Carson', 'Craig Keener', 'Gordon Fee'],
    [
      card(
        'contexto_historico',
        'Contexto Histórico',
        'Em que período da história bíblica o termo emerge com mais força? Qual o cenário histórico das passagens-chave?',
        'Descreva o contexto histórico em que este termo aparece com mais relevância — o período bíblico, o cenário político, cultural e religioso que moldou seu uso na Escritura.'
      ),
      card(
        'contexto_cultural',
        'Contexto Cultural',
        'Qual o ambiente cultural, social ou religioso do mundo bíblico em que o termo opera?\n\nExemplo: o significado de "senhor" no mundo greco-romano; "aliança" no contexto suzerano-vassalo.',
        'Explique o contexto cultural em que este termo funciona — costumes, práticas sociais, estruturas religiosas ou linguísticas do mundo bíblico que iluminam seu significado.'
      ),
      card(
        'contexto_literario',
        'Contexto Literário',
        'Em que gêneros literários o termo aparece? Como o gênero (narrativa, lei, profecia, sabedoria, epístola, apocalipse) molda seu significado?',
        'Analise o contexto literário deste termo — os gêneros em que aparece, as estruturas retóricas que o envolvem e como o tipo de literatura molda seu uso e sentido.'
      ),
      card(
        'principais_ocorrencias',
        'Principais Ocorrências',
        'Liste as 3 a 6 passagens mais importantes para o estudo deste termo — onde seu significado é mais claro, mais debatido ou mais determinante para a teologia bíblica.',
        'Identifique as principais ocorrências deste termo na Escritura — passagens onde ele aparece com maior clareza definitória, onde é mais debatido pelos exegetas ou onde sua teologia emerge com mais força.'
      ),
    ]
  ),

  // ── 4b. DESENVOLVIMENTO CANÔNICO (dentro de Circunstância) ──────────────────
  termsSection(
    'termos_canonico',
    'Desenvolvimento Canônico',
    'Desenv. Canônico',
    'investigar',
    'termos_circunstancia_grp',
    'Circunstância',
    1229,
    'Rastrear a progressão do conceito ao longo da história da revelação — do Pentateuco ao Apocalipse.',
    [
      'Como o conceito se desenvolve do Pentateuco aos escritos apostólicos?',
      'Há descontinuidade, continuidade ou desenvolvimento progressivo entre AT e NT?',
      'Onde o conceito encontra sua culminação no cânone?',
    ],
    ['Geerhardus Vos', 'Graeme Goldsworthy', 'Peter Gentry', 'Stephen Wellum', 'Thomas Schreiner'],
    [
      card(
        'canon_pentateuco',
        'Pentateuco',
        'Como este conceito aparece nos cinco livros de Moisés?\n\nQuais textos fundacionais estabelecem o uso do termo na lei e na narrativa primordial?',
        'Rastreie este conceito no Pentateuco — como ele aparece em Gênesis, Êxodo, Levítico, Números e Deuteronômio. Quais textos são fundacionais? Como a lei e a narrativa primordial estabelecem o uso do termo?'
      ),
      card(
        'canon_historicos',
        'Livros Históricos',
        'Como o conceito aparece nos livros históricos (Josué a Ester/Macabeus)?\n\nComo a história do povo de Deus desenvolve ou ilustra este termo?',
        'Analise este conceito nos livros históricos — como a história de Israel ilustra, aplica ou desenvolve o termo. Há exemplos positivos e negativos? O conceito se aprofunda ou se estreita?'
      ),
      card(
        'canon_sapienciais',
        'Livros Sapienciais',
        'Como o conceito aparece na literatura sapiencial (Jó, Salmos, Provérbios, Eclesiastes, Cantares)?\n\nO que a sabedoria bíblica ensina sobre este termo?',
        'Rastreie este conceito na literatura sapiencial — como Jó, Salmos, Provérbios, Eclesiastes e Cantares tratam e desenvolvem o termo. Qual a perspectiva da sabedoria sobre este conceito?'
      ),
      card(
        'canon_profetas',
        'Profetas',
        'Como os profetas (Isaías a Malaquias) usam e desenvolvem este conceito?\n\nHá promessas escatológicas vinculadas a este termo?',
        'Analise o uso deste conceito nos escritos proféticos — como os profetas maiores e menores o desenvolvem, aprofundam ou conectam às promessas messiânicas e escatológicas.'
      ),
      card(
        'canon_evangelhos',
        'Evangelhos',
        'Como Jesus usa, redefine ou cumpre este conceito nos Evangelhos?\n\nQuais ensinos ou ações de Jesus são determinantes para este termo?',
        'Rastreie este conceito nos quatro Evangelhos — como Jesus ensina, ilustra, redefine ou cumpre este termo. Quais pericopes são decisivas? Como a cristologia ilumina o conceito?'
      ),
      card(
        'canon_atos',
        'Atos',
        'Como o conceito aparece em Atos dos Apóstolos?\n\nComo a Igreja primitiva viveu ou proclamou este termo na missão apostólica?',
        'Analise este conceito no livro de Atos — como a Igreja primitiva o viveu, proclamou e aplicou na missão apostólica. O conceito se expande ou se institucionaliza com Pentecostes?'
      ),
      card(
        'canon_epistolas',
        'Epístolas',
        'Como as epístolas paulinas, gerais e hebraicas desenvolvem este conceito?\n\nQuais passagens epistolares são mais significativas para o estudo?',
        'Rastreie este conceito nas epístolas do NT — cartas de Paulo, as epístolas gerais e Hebreus. Como o ensino apostólico desenvolve, aplica e aprofunda o termo no contexto da Igreja?'
      ),
      card(
        'canon_apocalipse',
        'Apocalipse',
        'Como o conceito aparece no Apocalipse?\n\nQual sua dimensão escatológica — como ele se consumará na nova criação?',
        'Analise este conceito no Apocalipse de João — sua dimensão escatológica, sua consumação na nova criação e seu papel na visão final do Reino de Deus. Como o Apocalipse encerra o desenvolvimento canônico do termo?'
      ),
    ]
  ),

  // ── 5. TESTEMUNHO ───────────────────────────────────────────────────────────
  termsSection(
    'termos_testemunho',
    'Testemunho',
    'Testemunho',
    'investigar',
    'termos_testemunho_grp',
    'Testemunho',
    1230,
    'Reunir o testemunho bíblico sobre o termo — os textos centrais, a voz do AT, do NT, de Cristo e dos apóstolos.',
    [
      'Quais textos bíblicos definem mais claramente este termo?',
      'O que o próprio Cristo ensina sobre este conceito?',
      'Como os apóstolos aplicam e desenvolvem este conceito na Igreja?',
    ],
    ['D. A. Carson', 'Thomas Schreiner', 'Herman Ridderbos', 'John Murray', 'F. F. Bruce'],
    [
      card(
        'principais_textos',
        'Principais Textos',
        'Liste os textos bíblicos mais importantes para a compreensão deste termo — aqueles que toda pregação ou ensino sobre o conceito deve considerar.',
        'Identifique os 5 a 10 textos bíblicos mais importantes para o estudo deste termo — passagens definitórias, passagens debatidas e passagens que sintetizam o conceito. Organize-os por relevância.'
      ),
      card(
        'testemunho_at',
        'Testemunho do Antigo Testamento',
        'O que o Antigo Testamento ensina sobre este conceito?\n\nSintetize o testemunho veterotestamentário em uma narrativa coerente.',
        'Sintetize o que o Antigo Testamento ensina sobre este conceito — como ele é estabelecido, prometido, ilustrado e desenvolvido antes da vinda de Cristo. Qual a contribuição do AT para a compreensão plena do termo?'
      ),
      card(
        'testemunho_nt',
        'Testemunho do Novo Testamento',
        'O que o Novo Testamento ensina sobre este conceito?\n\nComo o NT aprofunda, cumpre ou redefine o que o AT anunciou?',
        'Sintetize o que o Novo Testamento ensina sobre este conceito — como ele é cumprido, aprofundado e aplicado à luz da obra de Cristo e da era do Espírito. Qual a novidade trazida pelo NT?'
      ),
      card(
        'testemunho_cristo',
        'Testemunho de Cristo',
        'O que Jesus especificamente ensina sobre este conceito?\n\nQuais palavras, parábolas ou ações do Senhor são mais reveladores?',
        'Reúna o que o próprio Cristo ensina sobre este conceito — seus discursos, parábolas, ações e afirmações que iluminam o termo. Cristo é o intérprete autoritativo desta realidade bíblica.'
      ),
      card(
        'testemunho_apostolico',
        'Testemunho Apostólico',
        'Como os apóstolos — Paulo, João, Pedro, Tiago, Judas, o autor de Hebreus — ensinam e aplicam este conceito?',
        'Reúna o testemunho apostólico sobre este conceito — como cada apóstolo o ensina, aplica e desenvolve no contexto das comunidades cristãs. Há ênfases distintas entre os apóstolos?'
      ),
      card(
        'sintese_biblica',
        'Síntese Bíblica',
        'Sintetize o testemunho completo da Escritura sobre este termo em um parágrafo coerente que integre AT, NT e a voz de Cristo.',
        'Gere uma síntese bíblica do testemunho da Escritura sobre este termo — integrando AT, NT, o ensino de Cristo e o ensino apostólico em uma narrativa canônica coerente.'
      ),
    ]
  ),

  // ── 6. SÍNTESE ──────────────────────────────────────────────────────────────
  termsSection(
    'termos_sintese_def',
    'Síntese',
    'Síntese',
    'comunicar',
    'termos_sintese_def_grp',
    'Síntese',
    1231,
    'Consolidar todo o estudo — definição refinada, grande ideia e implicações teológicas, eclesiásticas e pastorais.',
    [
      'Qual a definição mais fiel e precisa do termo após toda a investigação?',
      'Qual a "Grande Ideia" que resume o conceito em uma frase memorável?',
      'Quais são as implicações pastorais e eclesiásticas mais urgentes?',
    ],
    ['John Murray', 'Herman Bavinck', 'Wayne Grudem', 'J. I. Packer', 'Sinclair Ferguson'],
    [
      card(
        'definicao_final',
        'Definição Final',
        'Definição refinada do termo após todo o estudo.\n\nEsta definição integra a forma original, o campo semântico, o uso bíblico e a formulação teológica.',
        'Gere a definição final e refinada deste termo — integrando tudo o que foi investigado: lexicalidade, contexto, testemunho bíblico e formulação teológica. Esta deve ser a definição de referência para uso pastoral e acadêmico.'
      ),
      card(
        'grande_ideia',
        'Grande Ideia',
        'Em uma frase clara e memorável, qual é a "Grande Ideia" deste conceito bíblico?\n\nEsta frase deve ser suficientemente rica para orientar pregação, ensino e vida cristã.',
        'Formule a "Grande Ideia" deste conceito bíblico — uma frase central, memorável e fiel à Escritura que captura o coração do termo e pode orientar toda a comunicação pastoral sobre este conceito.'
      ),
      card(
        'implicacoes_teologicas',
        'Implicações Teológicas',
        'Quais implicações doutrinárias e teológicas nascem deste estudo?\n\nComo ele contribui para a teologia sistemática, bíblica ou histórica?',
        'Explique as principais implicações teológicas deste estudo — como ele contribui para a teologia bíblica, sistemática ou histórica. Que verdades doutrinárias são confirmadas, aprofundadas ou iluminadas?'
      ),
      card(
        'implicacoes_eclesiasticas',
        'Implicações Eclesiásticas',
        'Como este conceito molda a vida, o culto, a comunhão, os sacramentos e a missão da Igreja?',
        'Explique as implicações eclesiásticas deste conceito — como ele deve moldar a vida comunitária, o culto, os sacramentos, a comunhão fraterna e a missão da Igreja.'
      ),
      card(
        'implicacoes_pastorais',
        'Implicações Pastorais',
        'Como este conceito se aplica concretamente à pregação, ao ensino, ao aconselhamento e à vida cristã cotidiana?',
        'Aponte as implicações pastorais concretas deste conceito — para pregação, ensino, aconselhamento, discipulado e vida cristã. Como este termo deve mudar o modo como pastores e professores ministram?'
      ),
    ]
  ),
]
