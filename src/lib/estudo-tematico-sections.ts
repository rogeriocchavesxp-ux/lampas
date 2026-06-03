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
]
