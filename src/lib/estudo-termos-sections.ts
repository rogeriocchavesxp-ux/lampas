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
    'preparar',
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
    'preparar',
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

  // ── 4b. DESENVOLVIMENTO CANÔNICO ─────────────────────────────────────────────
  termsSection(
    'termos_canonico',
    'Desenvolvimento Canônico',
    'Desenv. Canônico',
    'interpretar',
    'termos_canonico_grp',
    'Desenvolvimento Canônico',
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
    'preparar',
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

  // ── 6. SÍNTESE INICIAL ───────────────────────────────────────────────────────
  termsSection(
    'termos_sint_inicial',
    'Síntese Inicial',
    'Síntese Inicial',
    'preparar',
    'termos_sint_inicial_grp',
    'Síntese Inicial',
    1231,
    'Formular uma síntese provisória dos 5 tópicos — uma compreensão inicial do termo antes da investigação bíblica.',
    [
      'Qual a melhor definição provisória após os 5 tópicos?',
      'Qual a questão central que orienta a investigação?',
      'Qual a hipótese inicial sobre o significado teológico do termo?',
    ],
    ['Moisés Silva', 'James Barr', 'Louw & Nida', 'G. K. Beale'],
    [
      card(
        'sintese_conceitual',
        'Síntese Conceitual',
        'Com base nos 5 tópicos (Definição, Comparação, Relação, Circunstância, Testemunho), formule uma síntese provisória do que este termo significa.\n\nEsta síntese será refinada após a investigação bíblica.',
        'Com base nos 5 tópicos da análise conceitual, gere uma síntese provisória do significado deste termo bíblico. Integre os elementos de definição, comparação, relação teológica, circunstância e testemunho em um parágrafo coerente.'
      ),
      card(
        'questao_central',
        'Questão Central',
        'Qual a questão mais importante que ainda precisa ser respondida pela investigação bíblica?\n\nEsta questão orientará toda a fase de investigação.',
        'Com base na análise inicial, identifique a questão central que este estudo de termos deve responder. Que aspecto do significado do termo ainda é incerto ou precisa de confirmação pela investigação bíblica?'
      ),
      card(
        'hipotese_inicial',
        'Hipótese Inicial',
        'Qual é sua hipótese inicial sobre o significado teológico pleno deste termo?\n\nEsta hipótese será testada e refinada durante a investigação.',
        'Formule a hipótese inicial sobre o significado teológico deste termo — o que você espera encontrar na investigação bíblica, com base no que foi analisado até aqui. Seja claro sobre o que precisa ser confirmado ou corrigido.'
      ),
    ]
  ),

  // ── FASE II — INVESTIGAR ─────────────────────────────────────────────────────

  // ── 7. USO BÍBLICO ────────────────────────────────────────────────────────────
  termsSection(
    'termos_uso_biblico',
    'Uso Bíblico',
    'Uso Bíblico',
    'interpretar',
    'termos_uso_biblico_grp',
    'Uso Bíblico',
    1232,
    'Mapear a presença e o uso do termo no conjunto das Escrituras — quantidade, distribuição e padrão de uso.',
    [
      'Em quantas passagens este termo aparece na Escritura?',
      'Em qual contexto ele é usado com mais frequência?',
      'Qual o texto mais importante para a compreensão do termo?',
    ],
    ['BDAG', 'HALOT', 'Louw & Nida', 'Moisés Silva', 'TWOT', 'NIDNTTE'],
    [
      card(
        'ocorrencias_totais',
        'Ocorrências Totais',
        'Quantas vezes este termo aparece na Escritura?\n\nListe o número de ocorrências no AT (hebraico/aramaico) e no NT (grego).',
        'Pesquise o número total de ocorrências deste termo na Escritura. Separe AT e NT, e identifique os livros com maior concentração de uso.'
      ),
      card(
        'uso_predominante',
        'Uso Predominante',
        'Em qual gênero literário ou contexto teológico este termo aparece com mais frequência?\n\nPoético, legal, profético, narrativo, epistolar?',
        'Identifique o uso predominante deste termo nas Escrituras. Em qual contexto literário, teológico ou situacional ele aparece com maior frequência e intensidade?'
      ),
      card(
        'texto_central_biblico',
        'Texto Central',
        'Qual o texto bíblico mais importante para a compreensão deste termo?\n\nEste texto deve ser o ponto de referência para toda a investigação.',
        'Identifique o texto bíblico central para a compreensão deste termo — aquele que melhor revela seu significado pleno, uso intencionado e peso teológico.'
      ),
      card(
        'distribuicao_canonica',
        'Distribuição Canônica',
        'Como o uso deste termo está distribuído ao longo do cânon?\n\nEle aparece mais no AT ou no NT? Em determinado período ou autor?',
        'Analise a distribuição canônica deste termo — como seu uso se distribui entre AT e NT, entre diferentes autores, períodos e gêneros literários. Há concentração em alguma seção do cânon?'
      ),
    ]
  ),

  // ── 8. USO NO LIVRO / PERÍCOPE ───────────────────────────────────────────────
  termsSection(
    'termos_uso_pericope',
    'Uso no Livro / Perícope',
    'Uso na Perícope',
    'interpretar',
    'termos_uso_pericope_grp',
    'Uso no Livro / Perícope',
    1234,
    'Examinar como o termo é usado especificamente no livro e na perícope em estudo.',
    [
      'Como o autor do livro usa este termo em seu argumento?',
      'Qual o papel do termo na perícope específica em estudo?',
      'O autor usa o termo de forma técnica, poética ou ordinária?',
    ],
    ['D. A. Carson', 'Thomas Schreiner', 'Douglas Moo', 'Gordon Fee', 'I. Howard Marshall'],
    [
      card(
        'uso_no_livro',
        'Uso no Livro',
        'Como o autor deste livro utiliza este termo? Quantas vezes aparece? Qual o papel no argumento geral?\n\nEle é um termo-chave do livro ou uso incidental?',
        'Analise como o autor usa este termo no livro em estudo. Identifique todas as ocorrências no livro, o padrão de uso e a função no argumento teológico do autor.'
      ),
      card(
        'uso_na_pericope',
        'Uso na Perícope',
        'Como o termo aparece e funciona na perícope específica?\n\nQual o papel gramatical, retórico e teológico do termo nesta unidade literária?',
        'Examine o uso do termo na perícope em estudo. Qual o papel gramatical do termo? Como ele contribui para a argumentação ou narrativa desta unidade? Que ênfase o autor quer comunicar?'
      ),
      card(
        'funcao_no_argumento',
        'Função no Argumento',
        'Como este termo sustenta ou avança o argumento teológico do autor neste contexto?\n\nEle é central para a tese ou elemento de suporte?',
        'Explique a função deste termo no argumento teológico do autor. Ele é central para a tese da perícope? Serve como fundamento, ilustração, qualificação ou conclusão do argumento?'
      ),
      card(
        'contribuicao_tematica',
        'Contribuição Temática',
        'Como o uso do termo neste contexto contribui para o tema geral do livro e da perícope?',
        'Avalie como o uso deste termo neste contexto contribui para o(s) tema(s) central(is) do livro e da perícope. Que aspecto do tema o termo ilumina ou aprofunda?'
      ),
    ]
  ),

  // ── 9. CAMPO SEMÂNTICO ────────────────────────────────────────────────────────
  termsSection(
    'termos_campo_sem',
    'Campo Semântico',
    'Campo Semântico',
    'interpretar',
    'termos_campo_sem_grp',
    'Campo Semântico',
    1235,
    'Explorar o campo semântico expandido do termo — seus vizinhos lexicais, uso metafórico e evolução semântica.',
    [
      'Quais termos compõem o campo semântico mais amplo deste conceito?',
      'Como o significado do termo evoluiu ao longo da história bíblica?',
      'O termo é usado metaforicamente? Com que finalidade?',
    ],
    ['Moisés Silva', 'James Barr', 'Louw & Nida', 'BDAG', 'HALOT'],
    [
      card(
        'nucleo_semantico',
        'Núcleo Semântico',
        'Qual o significado nuclear do termo — o elemento invariável presente em todos os usos?\n\nEste é o sentido mínimo garantido em qualquer contexto.',
        'Identifique o núcleo semântico deste termo — o elemento de significado que se mantém constante em todas as suas ocorrências bíblicas, independente de contexto ou autor.'
      ),
      card(
        'periferia_sem',
        'Periferia Semântica',
        'Quais significados secundários ou periféricos o termo assume em certos contextos?\n\nListe os usos especializados, metafóricos ou menos comuns.',
        'Mapeie a periferia semântica deste termo — os significados secundários, especializados ou contextuais que ele assume em usos menos frequentes. Como esses usos enriquecem a compreensão do conceito?'
      ),
      card(
        'evolucao_semantica',
        'Evolução do Significado',
        'O significado do termo mudou ao longo da revelação?\n\nComo ele é usado no AT em comparação com o NT?',
        'Analise se houve evolução semântica deste termo ao longo da revelação bíblica. O significado foi aprofundado, ampliado ou reorientado pelo NT em relação ao AT? Há desenvolvimento cristológico no significado?'
      ),
      card(
        'uso_metaforico',
        'Uso Metafórico',
        'O termo é usado metaforicamente na Escritura?\n\nQue imagens ou metáforas são associadas a ele? Com que intenção teológica?',
        'Examine o uso metafórico deste termo na Escritura. Que imagens, metáforas ou figuras de linguagem são associadas a ele? Como o uso metafórico contribui para o significado teológico?'
      ),
    ]
  ),

  // ── 10. RELAÇÕES TEOLÓGICAS ──────────────────────────────────────────────────
  termsSection(
    'termos_rel_teol',
    'Relações Teológicas',
    'Rel. Teológicas',
    'interpretar',
    'termos_rel_teol_grp',
    'Relações Teológicas',
    1236,
    'Investigar como o termo se conecta às grandes doutrinas da teologia bíblica e sistemática.',
    [
      'Como este termo está relacionado à teologia da aliança?',
      'Qual o papel do termo na soteriologia bíblica?',
      'Como o termo contribui para a cristologia e escatologia?',
    ],
    ['Geerhardus Vos', 'Herman Bavinck', 'John Murray', 'Thomas Schreiner', 'D. A. Carson'],
    [
      card(
        'rel_alianca',
        'Aliança',
        'Como este termo está inserido na teologia da aliança?\n\nEle pertence à aliança das obras, da graça, abraâmica, mosaica, davídica ou nova aliança?',
        'Analise a relação deste termo com a teologia da aliança. Em qual(is) aliança(s) ele ocupa papel central? Como a estrutura da aliança ilumina seu significado?'
      ),
      card(
        'rel_soteriologia',
        'Soteriologia',
        'Qual o papel deste termo no ensino bíblico sobre a salvação?\n\nEle está relacionado à justificação, santificação, adoção, glorificação?',
        'Explique a relação deste termo com a soteriologia bíblica. Como ele contribui para a compreensão da salvação? A qual aspecto da aplicação da redenção ele está mais diretamente ligado?'
      ),
      card(
        'rel_cristologia',
        'Cristologia',
        'Como este termo aponta para Cristo ou é plenamente compreendido à luz de Cristo?\n\nHá tipologia, promessa ou cumprimento cristológico?',
        'Examine a relação deste termo com a cristologia. Como Cristo é o cumprimento ou a encarnação deste conceito? Há tipologia, promessa messiânica ou aplicação cristológica direta?'
      ),
      card(
        'rel_escatologia',
        'Escatologia',
        'Como este termo se projeta escatologicamente?\n\nEle aponta para a consumação do reino, a nova criação ou o estado final?',
        'Analise a dimensão escatológica deste termo. Como ele aponta para a esperança futura, a consumação do reino ou o estado final? Há tensão entre "já e ainda não" neste conceito?'
      ),
      card(
        'rel_ecclesiologia',
        'Eclesiologia',
        'Como este termo molda a compreensão da Igreja — seu ser, missão, culto e comunhão?',
        'Examine como este termo contribui para a eclesiologia. O que ele ensina sobre a natureza, missão, culto ou comunhão da Igreja?'
      ),
    ]
  ),

  // ── 11. CONCEITOS ASSOCIADOS ─────────────────────────────────────────────────
  termsSection(
    'termos_conceitos',
    'Conceitos Associados',
    'Conceitos',
    'interpretar',
    'termos_conceitos_grp',
    'Conceitos Associados',
    1237,
    'Mapear os conceitos, termos e clusters temáticos que orbitam este termo e enriquecem sua compreensão.',
    [
      'Quais outros termos bíblicos estão intimamente ligados a este?',
      'Quais conceitos se opõem ou contrastam com este termo?',
      'Que "constelação lexical" emerge em torno deste conceito?',
    ],
    ['Louw & Nida', 'Moisés Silva', 'BDAG', 'NIDNTTE', 'TWOT', 'NIDOTTE'],
    [
      card(
        'sinonimos_tematicos',
        'Sinônimos Temáticos',
        'Quais termos bíblicos são mais próximos em significado a este?\n\nComo cada um se distingue por nuance, ênfase ou contexto de uso?',
        'Liste os sinônimos temáticos mais próximos deste termo nas Escrituras. Como cada um se distingue por nuance, ênfase ou uso contextual? O que eles revelam sobre o campo semântico do conceito?'
      ),
      card(
        'antonimos_tematicos',
        'Antônimos Temáticos',
        'Quais termos se opõem ou contrastam diretamente com este conceito nas Escrituras?\n\nO contraste ilumina o significado positivo do termo.',
        'Identifique os antônimos temáticos — termos que se opõem ou contrastam diretamente com este conceito nas Escrituras. Como esses contrastes iluminam e definem o significado positivo do termo?'
      ),
      card(
        'clusters_tematicos',
        'Clusters Temáticos',
        'Quais grupos ou clusters de conceitos aparecem junto a este termo?\n\nHá um campo léxico-temático recorrente associado a ele?',
        'Identifique os clusters temáticos — grupos de conceitos que frequentemente aparecem junto a este termo nas Escrituras. Que campo léxico-temático recorrente está associado a ele?'
      ),
      card(
        'constelacao_lexical',
        'Constelação Lexical',
        'Qual é a "constelação lexical" deste termo — todos os conceitos que orbitam ao seu redor na Escritura?\n\nEsta constelação define o espaço semântico do termo.',
        'Mapeie a constelação lexical deste termo — o conjunto de conceitos que orbitam ao seu redor e que juntos definem seu espaço semântico na Escritura. Como eles se inter-relacionam?'
      ),
    ]
  ),

  // ── 12. SÍNTESE INVESTIGATIVA ────────────────────────────────────────────────
  termsSection(
    'termos_sint_invest',
    'Síntese Investigativa',
    'Síntese Invest.',
    'interpretar',
    'termos_sint_invest_grp',
    'Síntese Investigativa',
    1238,
    'Consolidar os achados da investigação bíblica em uma tese clara e articulada.',
    [
      'Quais são os achados mais importantes da investigação?',
      'Qual a tese bíblica que emerge deste estudo?',
      'Como a hipótese inicial foi confirmada, corrigida ou aprofundada?',
    ],
    ['D. A. Carson', 'Herman Bavinck', 'Moisés Silva', 'Geerhardus Vos'],
    [
      card(
        'achados_principais',
        'Achados Principais',
        'Quais são os 3 a 5 achados mais importantes da investigação bíblica?\n\nListar em ordem de importância teológica.',
        'Resuma os 3 a 5 achados mais importantes da investigação bíblica sobre este termo. Organize-os em ordem de relevância teológica e explicite como cada um contribui para a compreensão do conceito.'
      ),
      card(
        'tese_biblica',
        'Tese Bíblica',
        'Em uma ou duas frases, qual a tese bíblica que emerge desta investigação?\n\nEsta tese deve sintetizar o que a Escritura ensina sobre este termo.',
        'Formule a tese bíblica que emerge desta investigação — uma ou duas frases que sintetizam o que a Escritura ensina sobre este termo, com base nos achados da investigação bíblica e teológica.'
      ),
      card(
        'padrao_global',
        'Padrão Global',
        'Qual o padrão global de uso e significado que emerge de toda a investigação?\n\nComo os diferentes aspectos se integram em uma compreensão coerente?',
        'Identifique o padrão global de uso e significado que emerge de toda a investigação. Como os diferentes aspectos — semântico, canônico, teológico e contextual — se integram em uma compreensão coerente e unificada?'
      ),
    ]
  ),

  // ── FASE III — PRODUZIR ──────────────────────────────────────────────────────

  // ── 13. DEFINIÇÃO FINAL (herda termos_sintese_def) ───────────────────────────
  termsSection(
    'termos_sintese_def',
    'Definição Final',
    'Def. Final',
    'comunicar',
    'termos_sintese_def_grp',
    'Definição Final',
    1239,
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

  // ── 14. APLICAÇÕES ────────────────────────────────────────────────────────────
  termsSection(
    'termos_aplicacoes',
    'Aplicações',
    'Aplicações',
    'comunicar',
    'termos_aplicacoes_grp',
    'Aplicações',
    1240,
    'Traduzir o estudo do termo em aplicações concretas para a vida cristã, a pregação, o ensino e a missão.',
    [
      'Como este conceito muda a vida cristã cotidiana?',
      'Como ele deve ser comunicado na pregação e no ensino?',
      'Quais aplicações missionais emergem deste estudo?',
    ],
    ['Tim Keller', 'J. I. Packer', 'Sinclair Ferguson', 'Bryan Chapell'],
    [
      card(
        'aplicacao_vida_crista',
        'Vida Cristã',
        'Como este conceito deve mudar a vida cotidiana do cristão?\n\nQue atitudes, hábitos ou convicções são formadas a partir deste estudo?',
        'Aplique este conceito bíblico à vida cristã cotidiana. Que mudanças concretas de atitude, hábito ou convicção este estudo deve produzir no crente?'
      ),
      card(
        'aplicacao_pregacao',
        'Pregação e Ensino',
        'Como comunicar este conceito com clareza e poder na pregação e no ensino?\n\nQue ilustrações, analogias ou conexões tornam o conceito vivo para a congregação?',
        'Como comunicar este conceito bíblico com clareza e poder na pregação e no ensino? Que abordagens, ilustrações ou conexões tornam este termo vivo e aplicável para a congregação?'
      ),
      card(
        'aplicacao_pastoral',
        'Cuidado Pastoral',
        'Como este conceito se aplica ao aconselhamento e ao cuidado pastoral?\n\nEm que situações de vida este termo oferece luz, consolo ou correção?',
        'Aplique este conceito ao cuidado pastoral e ao aconselhamento. Em que situações pastorais este termo oferece luz, consolo, orientação ou correção bíblica?'
      ),
      card(
        'aplicacao_missao',
        'Missão',
        'Como este conceito informa e motiva a missão da Igreja?\n\nO que ele ensina sobre o chamado missionário e a proclamação do evangelho?',
        'Explique as implicações missionais deste conceito. Como ele informa e motiva a missão da Igreja — a proclamação do evangelho, o discipulado de nações e o engajamento cultural?'
      ),
    ]
  ),

  // ── 15. SÍNTESE FINAL ─────────────────────────────────────────────────────────
  termsSection(
    'termos_sint_final',
    'Síntese Final',
    'Síntese Final',
    'comunicar',
    'termos_sint_final_grp',
    'Síntese Final',
    1241,
    'Redigir a síntese final do estudo — um documento de referência que integra todo o trabalho realizado.',
    [
      'Como integrar tudo em um texto coerente e usável?',
      'Qual o produto final deste estudo?',
      'Que legado este estudo deixa para pregação e ensino futuros?',
    ],
    ['John Murray', 'Herman Bavinck', 'Geerhardus Vos', 'D. A. Carson'],
    [
      card(
        'sintese_completa',
        'Síntese Completa',
        'Redija uma síntese completa do estudo — um texto que integra definição, investigação bíblica, relações teológicas e implicações em uma exposição coerente.\n\nEste é o documento de referência para uso futuro.',
        'Redija a síntese completa deste estudo de termos — um texto integrado que une definição, investigação bíblica, relações teológicas, conceitos associados e implicações em uma exposição coerente e usável para pregação e ensino.'
      ),
      card(
        'produto_final',
        'Produto Final',
        'Qual o produto concreto deste estudo?\n\nUm verbete? Uma entrada de dicionário? Um texto de pregação? Uma aula?\n\nDescreva o formato e o uso pretendido.',
        'Defina o produto final deste estudo de termos — o formato, o público-alvo e o uso pretendido. Como este trabalho será usado na prática ministerial?'
      ),
    ]
  ),
]
