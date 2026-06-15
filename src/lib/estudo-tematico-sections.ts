import type { SectionDef } from './workspace-sections'

export const ESTUDO_TEMATICO_SECTIONS: SectionDef[] = [
  {
    slug: 'et_definicao',
    title: 'I. Definição do Tema',
    shortTitle: 'Definição',
    module: 'inventio',
    group: 'et_definicao_grp',
    groupLabel: 'I. Definição do Tema',
    order: 500,
    objective:
      'Delimitar com precisão o tema teológico investigado — seu nome, campo semântico, questão orientadora e escopo canônico.',
    keyQuestions: [
      'Qual o campo semântico deste tema? Quais são seus termos-chave em hebraico e grego?',
      'Qual questão central o tema responde ao longo do cânone?',
      'Quais temas adjacentes devem ser distinguidos deste?',
      'Qual é a delimitação canônica do estudo — AT, NT, ou o cânone completo?',
    ],
    relevantAuthors: ['Geerhardus Vos', 'Graeme Goldsworthy', 'Thomas Schreiner', 'D.A. Carson', 'Brian Rosner'],
    cards: [
      {
        id: 'nome_tema',
        title: 'Nome e campo semântico',
        placeholder: 'Identifique o tema, seus termos hebraicos e gregos principais, e o campo semântico completo. Ex: "aliança" — ‏בְּרִית‎ (berit), διαθήκη (diathēkē).',
        aiTrigger: 'Identifique o campo semântico completo deste tema: termos hebraicos principais (com transliteração), termos gregos principais e sinônimos relevantes. Como o vocabulário molda a compreensão do tema?',
      },
      {
        id: 'questao_orientadora',
        title: 'Questão orientadora',
        placeholder: 'Formule a questão teológica central que este estudo busca responder. Deve ser precisa e orientar toda a investigação canônica.',
        aiTrigger: 'Formule a questão teológica central que orienta o estudo deste tema no cânone. A questão deve ser precisa, abrangente e conectada ao debate histórico-canônico.',
      },
      {
        id: 'delimitacao',
        title: 'Delimitação e escopo',
        placeholder: 'Qual é o escopo do estudo? Quais subtemas serão incluídos ou excluídos? Por quê?',
        aiTrigger: 'Delimite o escopo deste estudo temático: quais aspectos do tema serão investigados, quais serão excluídos e por quê. Identifique temas adjacentes que devem ser distinguidos.',
      },
    ],
  },

  {
    slug: 'et_at',
    title: 'II. Antigo Testamento',
    shortTitle: 'Antigo Testamento',
    module: 'inventio',
    group: 'et_at_grp',
    groupLabel: 'II. Antigo Testamento',
    order: 501,
    objective:
      'Rastrear o desenvolvimento do tema ao longo do AT por períodos histórico-canônicos, identificando a progressão da revelação.',
    keyQuestions: [
      'Como o tema emerge no Pentateuco e na narrativa do Criação-Queda-Redenção?',
      'Como os livros históricos desenvolvem o tema?',
      'Qual é a contribuição dos Profetas (maiores e menores)?',
      'Como a literatura sapiencial e os Salmos tratam o tema?',
      'Quais tipos e sombras apontam para o cumprimento neotestamentário?',
    ],
    relevantAuthors: ['Geerhardus Vos', 'Walter Kaiser', 'Willem VanGemeren', 'Christopher Wright', 'Bruce Waltke'],
    cards: [
      {
        id: 'patriarcal',
        title: 'Período patriarcal e Pentateuco',
        placeholder: 'Como o tema aparece em Gênesis, Êxodo, Levítico, Números e Deuteronômio? Quais eventos e textos são determinantes?',
        aiTrigger: 'Rastreie o desenvolvimento deste tema no Pentateuco: de Gênesis ao Deuteronômio. Quais passagens são decisivas? Como o tema se conecta à criação, queda, alianças e Lei mosaica?',
      },
      {
        id: 'mosaico',
        title: 'Livros históricos e poéticos',
        placeholder: 'Desenvolvimento do tema nos livros históricos (Josué ao Ester) e na literatura poética e sapiencial (Salmos, Provérbios, Jó, Eclesiastes, Cantares).',
        aiTrigger: 'Como este tema se desenvolve nos livros históricos (Josué ao Ester) e na literatura sapiencial e poética (Salmos, Provérbios, Jó)? Quais textos são mais relevantes?',
      },
      {
        id: 'profetico',
        title: 'Profetas',
        placeholder: 'Contribuição dos Profetas Maiores (Isaías, Jeremias, Ezequiel) e Menores (Os Doze) para o desenvolvimento do tema. Qual é o horizonte escatológico profético?',
        aiTrigger: 'Analise o desenvolvimento deste tema nos Profetas Maiores (Isaías, Jeremias, Ezequiel, Daniel) e Menores. Como os profetas projetam o tema escatologicamente? Quais promessas ainda aguardam cumprimento?',
      },
    ],
  },

  {
    slug: 'et_nt',
    title: 'III. Novo Testamento',
    shortTitle: 'Novo Testamento',
    module: 'inventio',
    group: 'et_nt_grp',
    groupLabel: 'III. Novo Testamento',
    order: 502,
    objective:
      'Analisar como o NT recebe, cumpre e expande o tema veterotestamentário à luz de Cristo, do Espírito e da escatologia realizada.',
    keyQuestions: [
      'Como os Evangelhos mostram Cristo como cumprimento do tema?',
      'Qual é a contribuição da teologia paulina para o tema?',
      'Como Hebreus, João e as cartas gerais desenvolvem o tema?',
      'Qual é a dimensão escatológica final (Apocalipse) do tema?',
    ],
    relevantAuthors: ['Herman Ridderbos', 'D.A. Carson', 'Thomas Schreiner', 'Frank Thielman', 'G.K. Beale'],
    cards: [
      {
        id: 'evangelhos',
        title: 'Evangelhos',
        placeholder: 'Como Jesus trata este tema nos Evangelhos? Há ensinamentos, parábolas, milagres ou eventos que são decisivos para o desenvolvimento do tema?',
        aiTrigger: 'Como os Evangelhos desenvolvem este tema? Quais ensinamentos de Jesus, parábolas ou eventos são determinantes? Como os quatro evangelistas abordam o tema com suas ênfases teológicas próprias?',
      },
      {
        id: 'cartas',
        title: 'Cartas apostólicas',
        placeholder: 'Desenvolvimento do tema na teologia paulina, nas cartas de Pedro, João, Tiago, Judas e na carta aos Hebreus.',
        aiTrigger: 'Analise o desenvolvimento deste tema na teologia paulina (usando Ridderbos), na carta aos Hebreus (usando Schreiner ou Lane), e nas demais cartas apostólicas. Quais passagens são loci classici?',
      },
      {
        id: 'apocalipse',
        title: 'Cumprimento escatológico',
        placeholder: 'Como o Apocalipse e a escatologia neotestamentária representam o horizonte final e o cumprimento pleno do tema?',
        aiTrigger: 'Como o Apocalipse e a escatologia neotestamentária representam o cumprimento final deste tema? Use Beale para Apocalipse. Como o tema se conecta à nova criação, ao reino consumado e à nova Jerusalém?',
      },
    ],
  },

  {
    slug: 'et_sintese_canonica',
    title: 'IV. Síntese Canônica',
    shortTitle: 'Síntese',
    module: 'inventio',
    group: 'et_sintese_grp',
    groupLabel: 'IV. Síntese Canônica',
    order: 503,
    objective:
      'Sintetizar o desenvolvimento canônico do tema, identificando a progressão da sombra ao cumprimento e o papel de Cristo como centro.',
    keyQuestions: [
      'Qual é o fio condutor do tema ao longo de todo o cânone?',
      'Como Cristo é o centro e cumprimento do tema?',
      'Qual é a estrutura da progressão revelacional: promessa → cumprimento?',
      'Quais tipos veterotestamentários encontram seu antítipo em Cristo?',
      'Como o tema se relaciona com o projeto redentor de Deus?',
    ],
    relevantAuthors: ['Graeme Goldsworthy', 'Geerhardus Vos', 'Edmund Clowney', 'Bryan Chapell', 'Sidney Greidanus'],
    cards: [
      {
        id: 'progressao',
        title: 'Progressão canônica',
        placeholder: 'Descreva o arco narrativo do tema: início (criação/queda), desenvolvimento (AT), clímax (encarnação/redenção), realização (Igreja) e consumação (nova criação).',
        aiTrigger: 'Descreva a progressão canônica completa deste tema: da criação ao novo criação, passando pela queda, as alianças, a encarnação e a consumação. Use a metodologia de Vos e Goldsworthy.',
      },
      {
        id: 'cumprimento',
        title: 'Cristo como centro',
        placeholder: 'Como Jesus Cristo é o centro e cumprimento deste tema? Quais dimensões do tema ele realiza: em sua pessoa (encarnação), obra (vida, morte, ressurreição) e reinado (glorificação)?',
        aiTrigger: 'Mostre como Jesus Cristo é o centro e cumprimento deste tema em sua pessoa e obra. Analise cada dimensão: encarnação, ministério, paixão, ressurreição e parousia.',
      },
      {
        id: 'unidade',
        title: 'Unidade canônica',
        placeholder: 'Qual é a unidade temática que perpassa todo o cânone? Como o AT e o NT se iluminam mutuamente neste tema?',
        aiTrigger: 'Demonstre a unidade canônica deste tema: como AT e NT se relacionam, como o NT ilumina o AT e como o AT prepara o NT. Cite Goldsworthy ou Clowney.',
      },
    ],
  },

  {
    slug: 'et_teologia_sistematica',
    title: 'V. Teologia Sistemática',
    shortTitle: 'Sistemática',
    module: 'dispositio',
    group: 'et_sistematica_grp',
    groupLabel: 'V. Teologia Sistemática',
    order: 504,
    objective:
      'Formular a doutrina a partir dos resultados da investigação canônica, situando-a no sistema da teologia reformada.',
    keyQuestions: [
      'Qual formulação sistemática emerge do estudo canônico?',
      'Em qual lócus da teologia sistemática este tema se encaixa?',
      'Quais implicações para outros loci da teologia sistemática?',
    ],
    relevantAuthors: ['Herman Bavinck', 'Louis Berkhof', 'Wayne Grudem', 'Michael Horton', 'John Frame'],
    cards: [
      {
        id: 'formulacao',
        title: 'Formulação doutrinária',
        placeholder: 'Qual formulação sistemática emerge do estudo canônico? Articule a doutrina com precisão teológica.',
        aiTrigger: 'Com base no estudo canônico, formule a doutrina sistematicamente. Situe-a no sistema da teologia reformada. Use Bavinck, Berkhof ou Horton.',
      },
      {
        id: 'implicacoes',
        title: 'Implicações para outros loci',
        placeholder: 'Quais são as implicações deste tema para outros loci da teologia: Deus, criação, antropologia, cristologia, soteriologia, eclesiologia, escatologia?',
        aiTrigger: 'Quais são as implicações deste tema para os demais loci da teologia sistemática? Como ele ilumina ou é iluminado por outros tópicos teológicos centrais?',
      },
    ],
  },

  {
    slug: 'et_aplicacoes',
    title: 'VI. Aplicações',
    shortTitle: 'Aplicações',
    module: 'dispositio',
    group: 'et_aplicacoes_grp',
    groupLabel: 'VI. Aplicações',
    order: 505,
    objective:
      'Derivar da investigação temática implicações pastorais, devocionais e missionais para a vida cristã, eclesiástica e ministerial.',
    keyQuestions: [
      'Como este tema alimenta a vida de oração e adoração?',
      'Quais implicações para a vida da Igreja e do ministério?',
      'Como este tema se relaciona com a missão e o evangelismo?',
    ],
    relevantAuthors: ['John Owen', 'Jonathan Edwards', 'Jerry Bridges', 'J.I. Packer', 'Timothy Keller'],
    cards: [
      {
        id: 'vida_crista',
        title: 'Vida cristã',
        placeholder: 'Como este tema alimenta a piedade pessoal, a oração e o crescimento na graça?',
        aiTrigger: 'Quais são as implicações deste tema para a vida cristã pessoal: oração, adoração, mortificação, vivificação e crescimento na graça?',
      },
      {
        id: 'eclesial',
        title: 'Vida eclesial',
        placeholder: 'Implicações para a vida da Igreja: culto, pregação, sacramentos, comunhão e disciplina.',
        aiTrigger: 'Como este tema molda a vida eclesial? Quais implicações para o culto, a pregação, os sacramentos e a comunhão fraterna?',
      },
      {
        id: 'missional',
        title: 'Missão',
        placeholder: 'Como este tema se conecta com a missão da Igreja, o evangelismo e a expansão do reino?',
        aiTrigger: 'Como este tema teológico impacta a missão da Igreja? Que implicações tem para o evangelismo, a missão cross-cultural e a expansão do reino de Deus?',
      },
    ],
  },

  // ── Seções do novo schema (Phase II — Investigar) ────────────────────────

  {
    slug: 'et_ocorrencias',
    title: 'Ocorrências Bíblicas',
    shortTitle: 'Ocorrências',
    module: 'inventio',
    group: 'et_ocorrencias_grp',
    groupLabel: 'Ocorrências Bíblicas',
    order: 506,
    objective:
      'Mapear as ocorrências do tema em todo o cânone, identificando sua distribuição nos Testamentos e as passagens centrais para a investigação.',
    keyQuestions: [
      'Em quantos livros e com que frequência o tema aparece no AT?',
      'Quais passagens do NT são decisivas para compreender o tema?',
      'Quais são os loci classici — textos que mais concentram o ensino sobre este tema?',
      'Há distribuição desigual que revele ênfase em algum período ou gênero literário?',
    ],
    relevantAuthors: ['Geerhardus Vos', 'Walter Kaiser', 'Thomas Schreiner', 'D.A. Carson', 'Graeme Goldsworthy'],
    cards: [
      {
        id: 'ocorrencias_at',
        title: 'Ocorrências no AT',
        placeholder: 'Liste as ocorrências principais do tema no Antigo Testamento, organizadas por livro ou período. Quais textos são mais relevantes?',
        aiTrigger: 'Liste as principais ocorrências deste tema no Antigo Testamento, organizando por livro ou período histórico-canônico. Destaque os textos mais relevantes para a compreensão do tema.',
      },
      {
        id: 'ocorrencias_nt',
        title: 'Ocorrências no NT',
        placeholder: 'Liste as ocorrências principais do tema no Novo Testamento. Como o NT desenvolve e cumpre o ensino do AT sobre este tema?',
        aiTrigger: 'Liste as principais ocorrências deste tema no Novo Testamento, por autor e livro. Como o NT assume, transforma e cumpre o desenvolvimento veterotestamentário do tema?',
      },
      {
        id: 'passagens_centrais',
        title: 'Passagens centrais',
        placeholder: 'Identifique os textos que mais concentram o ensino sobre o tema — os loci classici que qualquer investigação séria deve abordar.',
        aiTrigger: 'Identifique os loci classici — as 5 a 8 passagens bíblicas que mais concentram o ensino sobre este tema e que são incontornáveis para qualquer investigação séria. Justifique cada escolha.',
      },
      {
        id: 'frequencia',
        title: 'Frequência e distribuição',
        placeholder: 'Analise a distribuição do tema: está concentrado em algum período, gênero literário ou autor bíblico? O que isso revela sobre a progressão da revelação?',
        aiTrigger: 'Analise a frequência e distribuição deste tema ao longo do cânone: está concentrado em algum período, livro, gênero ou autor? O que essa distribuição revela sobre a progressão da revelação divina?',
      },
    ],
  },

  {
    slug: 'et_desenvolvimento',
    title: 'Desenvolvimento Progressivo',
    shortTitle: 'Desenvolvimento',
    module: 'inventio',
    group: 'et_desenvolvimento_grp',
    groupLabel: 'Desenvolvimento Progressivo',
    order: 507,
    objective:
      'Rastrear o desenvolvimento do tema ao longo do cânone, do Pentateuco ao Apocalipse, identificando a progressão da revelação em cada período.',
    keyQuestions: [
      'Como o tema emerge no Pentateuco e na narrativa criação-queda-redenção?',
      'Qual é a contribuição dos livros históricos e proféticos?',
      'Como os Evangelhos apresentam Cristo como cumprimento do tema?',
      'Como as epístolas desenvolvem e aplicam o tema na Igreja?',
      'Qual o horizonte escatológico do tema no Apocalipse?',
    ],
    relevantAuthors: ['Geerhardus Vos', 'Bruce Waltke', 'Christopher Wright', 'Herman Ridderbos', 'G.K. Beale'],
    cards: [
      {
        id: 'pentateuco',
        title: 'Pentateuco e fundação',
        placeholder: 'Como o tema aparece no Pentateuco? Quais eventos e textos de Gênesis ao Deuteronômio são determinantes para o seu desenvolvimento?',
        aiTrigger: 'Rastreie o desenvolvimento deste tema no Pentateuco: de Gênesis ao Deuteronômio. Quais passagens são decisivas? Como o tema se conecta à criação, queda, alianças e Lei mosaica?',
      },
      {
        id: 'historicos_profetas',
        title: 'Históricos e Profetas',
        placeholder: 'Como o tema se desenvolve nos livros históricos (Josué ao Ester) e nos Profetas Maiores e Menores?',
        aiTrigger: 'Rastreie o desenvolvimento deste tema nos livros históricos (Josué ao Ester) e nos Profetas Maiores (Isaías, Jeremias, Ezequiel) e Menores. Como os profetas projetam o tema escatologicamente?',
      },
      {
        id: 'sabedoria',
        title: 'Sabedoria e poesia',
        placeholder: 'Qual é a contribuição da literatura sapiencial e poética (Salmos, Provérbios, Jó, Eclesiastes) para o tema?',
        aiTrigger: 'Qual é a contribuição da literatura sapiencial e poética (Salmos, Provérbios, Jó, Eclesiastes, Cantares) para o desenvolvimento deste tema? Como esses livros enriquecem a compreensão?',
      },
      {
        id: 'evangelhos',
        title: 'Evangelhos',
        placeholder: 'Como os Evangelhos apresentam Jesus como cumprimento ou desenvolvimento do tema? Quais ensinamentos, parábolas ou eventos são decisivos?',
        aiTrigger: 'Como os quatro Evangelhos desenvolvem este tema? Como Jesus cumpre, redefine ou aprofunda o ensino do AT sobre este tema? Quais pericopes são determinantes?',
      },
      {
        id: 'epistolas',
        title: 'Epístolas apostólicas',
        placeholder: 'Como as cartas paulinas, Pedro, João, Tiago, Judas e Hebreus desenvolvem o tema para a Igreja?',
        aiTrigger: 'Analise o desenvolvimento deste tema na teologia paulina, em Hebreus e nas epístolas gerais. Quais passagens são loci classici? Use Ridderbos para Paulo e Schreiner para Hebreus.',
      },
      {
        id: 'cumprimento',
        title: 'Cumprimento escatológico',
        placeholder: 'Como o Apocalipse e a escatologia neotestamentária representam o horizonte final e o cumprimento pleno do tema?',
        aiTrigger: 'Como o Apocalipse representa o cumprimento final e consumação deste tema? Use Beale para Apocalipse. Como o tema aponta para a nova criação, o reino consumado e a nova Jerusalém?',
      },
    ],
  },

  {
    slug: 'et_teologia_biblica',
    title: 'Teologia Bíblica do Tema',
    shortTitle: 'Teologia Bíblica',
    module: 'inventio',
    group: 'et_teologia_biblica_grp',
    groupLabel: 'Teologia Bíblica do Tema',
    order: 508,
    objective:
      'Sintetizar o fio condutor do tema ao longo de toda a Escritura, identificando a progressão da revelação, o centro cristológico e a unidade dos dois Testamentos.',
    keyQuestions: [
      'Qual é o fio condutor que perpassa o tema do Gênesis ao Apocalipse?',
      'Como a revelação progressiva aprofunda a compreensão do tema?',
      'Como Cristo é o centro e cumprimento do tema?',
      'Como AT e NT se iluminam mutuamente neste tema?',
    ],
    relevantAuthors: ['Geerhardus Vos', 'Graeme Goldsworthy', 'Edmund Clowney', 'G.K. Beale', 'Brian Rosner'],
    cards: [
      {
        id: 'fio_condutor',
        title: 'Fio condutor canônico',
        placeholder: 'Qual é o fio narrativo e teológico que une as ocorrências do tema ao longo de todo o cânone? Como ele se mantém coerente da criação à consumação?',
        aiTrigger: 'Identifique o fio condutor canônico deste tema: a linha narrativa e teológica que o une do Gênesis ao Apocalipse. Use a metodologia de Vos e Goldsworthy para a teologia bíblica.',
      },
      {
        id: 'progressao_revelacao',
        title: 'Progressão da revelação',
        placeholder: 'Como a revelação progressiva de Deus aprofunda, clarifica e expande a compreensão do tema ao longo dos séculos?',
        aiTrigger: 'Mostre como a revelação progressiva aprofunda e expande a compreensão deste tema. Como cada etapa da revelação (patriarcal, mosaica, profética, apostólica) enriquece o ensino sobre o tema?',
      },
      {
        id: 'centro_cristologico',
        title: 'Centro cristológico',
        placeholder: 'Como Jesus Cristo é o centro e cumprimento do tema? Em que dimensões de sua pessoa e obra o tema encontra seu ápice?',
        aiTrigger: 'Demonstre como Jesus Cristo é o centro e cumprimento deste tema bíblico. Analise cada dimensão: encarnação, ministério, paixão, ressurreição e parousia. Use Clowney ou Goldsworthy.',
      },
      {
        id: 'unidade_testamentos',
        title: 'Unidade dos Testamentos',
        placeholder: 'Como AT e NT formam uma unidade no tratamento deste tema? Como o NT ilumina o AT e como o AT prepara o NT?',
        aiTrigger: 'Demonstre a unidade canônica entre AT e NT no tratamento deste tema: como o NT ilumina o AT e o AT prepara o NT. Evite tanto o supressivismo quanto a divisão rígida entre os Testamentos.',
      },
    ],
  },

  {
    slug: 'et_relacao_cristo',
    title: 'Relação com Cristo',
    shortTitle: 'Relação com Cristo',
    module: 'inventio',
    group: 'et_relacao_cristo_grp',
    groupLabel: 'Relação com Cristo',
    order: 509,
    objective:
      'Analisar como o tema se relaciona com Cristo por meio de tipologia, prefigurações e cumprimento redentor-histórico, situando-o na história da redenção.',
    keyQuestions: [
      'Quais tipos ou prefigurações veterotestamentárias apontam para Cristo?',
      'Como Cristo cumpre, realiza ou supera o tema em sua pessoa e obra?',
      'Qual a aplicação redentor-histórica do tema para a Igreja hoje?',
    ],
    relevantAuthors: ['Edmund Clowney', 'Bryan Chapell', 'Sidney Greidanus', 'Graeme Goldsworthy', 'G.K. Beale'],
    cards: [
      {
        id: 'tipologia',
        title: 'Tipologia e prefigurações',
        placeholder: 'Quais tipos, sombras e prefigurações veterotestamentárias apontam para Cristo no desenvolvimento deste tema? Como funcionam como antecipações?',
        aiTrigger: 'Identifique os tipos e prefigurações veterotestamentárias relacionados a este tema. Como funcionam como sombras que apontam para Cristo? Use Beale ou Clowney para fundamentar a tipologia.',
      },
      {
        id: 'cumprimento_cristologico',
        title: 'Cumprimento em Cristo',
        placeholder: 'Como Jesus Cristo cumpre este tema em sua pessoa (encarnação), obra (vida, morte, ressurreição) e reinado (glorificação e parousia)?',
        aiTrigger: 'Demonstre como Jesus cumpre este tema em cada dimensão de sua pessoa e obra: encarnação, ministério público, paixão e morte, ressurreição, ascensão e parousia. Cite Ridderbos ou Carson.',
      },
      {
        id: 'aplicacao_redentor',
        title: 'Aplicação redentor-histórica',
        placeholder: 'Como o cumprimento do tema em Cristo se aplica à Igreja — o povo do novo pacto que vive entre a primeira e a segunda vinda?',
        aiTrigger: 'Como o cumprimento deste tema em Cristo se aplica à Igreja na era do Espírito Santo, entre as duas vindas? Quais implicações para a vida da comunidade cristã em seu contexto histórico?',
      },
    ],
  },

  {
    slug: 'et_implicacoes',
    title: 'Implicações Teológicas',
    shortTitle: 'Implicações',
    module: 'inventio',
    group: 'et_implicacoes_grp',
    groupLabel: 'Implicações Teológicas',
    order: 510,
    objective:
      'Derivar as principais implicações doutrinárias, éticas e missionais do tema para a reflexão teológica e a prática cristã.',
    keyQuestions: [
      'Quais doutrinas sistemáticas são iluminadas ou fundamentadas por este tema?',
      'Que imperativas éticas nascem do indicativo teológico do tema?',
      'Como o tema informa a missão da Igreja no mundo?',
    ],
    relevantAuthors: ['Herman Bavinck', 'John Frame', 'Christopher Wright', 'Michael Horton', 'Wayne Grudem'],
    cards: [
      {
        id: 'doutrina_relacionada',
        title: 'Doutrina relacionada',
        placeholder: 'Quais doutrinas da teologia sistemática são iluminadas, fundamentadas ou implicadas por este tema bíblico?',
        aiTrigger: 'Identifique as doutrinas sistemáticas que são iluminadas ou fundamentadas por este tema bíblico. Em qual lócus da teologia ele se encaixa? Use Bavinck ou Berkhof para articulação sistemática.',
      },
      {
        id: 'etica_crista',
        title: 'Ética cristã',
        placeholder: 'Que imperativos éticos nascem do indicativo teológico deste tema? Como a verdade revelada neste tema transforma a conduta cristã?',
        aiTrigger: 'Quais imperativos éticos derivam do indicativo teológico deste tema? Como a verdade bíblica sobre ele transforma a conduta cristã pessoal, familiar, eclesial e social?',
      },
      {
        id: 'missao',
        title: 'Missão e evangelismo',
        placeholder: 'Como este tema fundamenta, motiva ou orienta a missão da Igreja no mundo — o evangelismo, o discipulado e a expansão do reino?',
        aiTrigger: 'Como este tema bíblico fundamenta e motiva a missão da Igreja? Que implicações para o evangelismo, o discipulado, a missão cross-cultural e o papel da Igreja no mundo?',
      },
    ],
  },
]
