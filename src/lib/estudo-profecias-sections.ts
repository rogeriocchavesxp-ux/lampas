import type { SectionDef } from './workspace-sections'

function card(id: string, title: string, placeholder: string, aiTrigger: string) {
  return { id, title, placeholder, aiTrigger }
}

export const ESTUDO_PROFECIAS_SECTIONS: SectionDef[] = [

  // ── Contexto Histórico-Profético ─────────────────────────────────────────
  {
    slug: 'pf_contexto',
    title: 'Contexto Histórico-Profético',
    shortTitle: 'Contexto',
    module: 'inventio',
    group: 'pf_contexto_grp',
    groupLabel: 'Contexto Histórico',
    order: 600,
    objective:
      'Situar o oráculo ou passagem profética no contexto histórico do profeta, da nação e do Antigo Oriente, identificando a situação que provocou a mensagem.',
    keyQuestions: [
      'Em que período histórico atuou este profeta (pré-exílico, exílico, pós-exílico)?',
      'Qual era a situação político-religiosa de Israel ou Judá?',
      'A quem o oráculo é dirigido — a Israel, Judá, nações pagãs?',
      'Que evento histórico concreto está por trás desta mensagem?',
    ],
    relevantAuthors: ['J.A. Motyer', 'Tremper Longman III', 'John Oswalt', 'Daniel Block', 'Paul Ferris'],
    cards: [
      card('periodo_historico', 'Período histórico',
        'Situe o profeta no período: pré-exílico (séc. VIII–VII), exílico (séc. VI) ou pós-exílico (séc. V–IV). Que reis, impérios e eventos marcam este período?',
        'Em que período histórico este profeta atuou? Quais reis, impérios e eventos políticos marcam o cenário da sua mensagem? Cite Motyer, Oswalt ou Block.'),
      card('situacao_nacao', 'Situação de Israel',
        'Qual era o estado espiritual, político e social de Israel (ou Judá) quando este oráculo foi proclamado? Que pecados específicos o profeta endereça?',
        'Qual era o estado espiritual, político e social de Israel quando este oráculo foi proclamado? Que pecados o profeta denuncia e qual é a crise em jogo?'),
      card('destinatarios', 'Destinatários',
        'A quem este oráculo é dirigido: Israel, Judá, uma nação pagã, um rei específico? Qual é a posição do profeta em relação ao(s) destinatário(s)?',
        'A quem este oráculo profético é especificamente dirigido? Qual é a relação do profeta com seus destinatários — apoio, confronto, consolo, julgamento?'),
    ],
  },

  // ── O Oráculo ────────────────────────────────────────────────────────────
  {
    slug: 'pf_oraculo',
    title: 'O Oráculo',
    shortTitle: 'O Oráculo',
    module: 'inventio',
    group: 'pf_oraculo_grp',
    groupLabel: 'O Oráculo',
    order: 601,
    objective:
      'Identificar o tipo e a estrutura do oráculo — julgamento, salvação, aliança, apocalíptico — e analisar como a mensagem está construída retoricamente.',
    keyQuestions: [
      'Que tipo de oráculo é este: julgamento, salvação, lamento, disputa?',
      'Qual é a estrutura típica do oráculo (acusação, sentença, promessa)?',
      'Qual é a mensagem central em uma frase?',
      'Como o profeta chama à atenção e cria urgência?',
    ],
    relevantAuthors: ['J.A. Motyer', 'Claus Westermann', 'John Walton', 'Tremper Longman III', 'Daniel Block'],
    cards: [
      card('tipo_oraculo', 'Tipo de oráculo',
        'Identifique o tipo: oráculo de julgamento (acusação + sentença), de salvação (promessa), de chamado ao arrependimento, disputa jurídica (rib), lamento, apocalíptico.',
        'Que tipo de oráculo profético é este? Classifique (julgamento, salvação, disputa jurídica, chamado ao arrependimento) e justifique com base na estrutura do texto.'),
      card('estrutura_oraculo', 'Estrutura do oráculo',
        'Delimite as partes do oráculo: anúncio ("assim diz o Senhor"), acusação, sentença, exortação, promessa. Como o oráculo está arquitetado?',
        'Qual é a estrutura interna deste oráculo? Identifique suas partes (introdução, acusação, sentença, exortação ou promessa) e explique como cada uma funciona.'),
      card('mensagem_central', 'Mensagem central',
        'Articule a mensagem central do oráculo em uma frase: o que Deus está dizendo e exigindo por meio deste profeta?',
        'Qual é a mensagem central deste oráculo profético em uma frase clara? O que Deus está declarando, exigindo ou prometendo por meio desta palavra?'),
    ],
  },

  // ── Símbolos e Imagens ────────────────────────────────────────────────────
  {
    slug: 'pf_simbolos',
    title: 'Símbolos e Imagens Proféticas',
    shortTitle: 'Símbolos',
    module: 'inventio',
    group: 'pf_simbolos_grp',
    groupLabel: 'Símbolos e Imagens',
    order: 602,
    objective:
      'Interpretar os símbolos, visões e imagens proféticas no contexto histórico-redentor, evitando literalismo ingênuo ou espiritualismo arbitrário.',
    keyQuestions: [
      'Que símbolos ou imagens dominam este texto?',
      'Como esses símbolos eram compreendidos pelos destinatários originais?',
      'Há visão ou ação simbólica? Como interpretá-la?',
      'Que tradições bíblicas (Êxodo, Sião, criação) são evocadas?',
    ],
    relevantAuthors: ['G.K. Beale', 'John Walton', 'Tremper Longman III', 'John Oswalt', 'Daniel Block'],
    cards: [
      card('simbolos_principais', 'Símbolos principais',
        'Liste os símbolos e imagens dominantes. Para cada um, explique como o contexto cultural e canônico ilumina seu significado original.',
        'Quais são os símbolos e imagens dominantes neste texto profético? Como o contexto cultural e o cânone bíblico iluminam seu significado para os destinatários originais?'),
      card('visoes_acoes', 'Visões e ações simbólicas',
        'Há relato de visão ou ação simbólica (como as de Ezequiel ou Zacarias)? Que princípios hermenêuticos guiam a interpretação?',
        'Este texto inclui visão ou ação simbólica? Quais princípios hermenêuticos (Beale, Longman, Block) devem guiar a interpretação cuidadosa deste gênero?'),
      card('tradicoes_evocadas', 'Tradições canônicas evocadas',
        'Que tradições bíblicas (Êxodo, Aliança, Sião, Davi, Criação) são evocadas pelas imagens? Como elas amplificam a mensagem profética?',
        'Que tradições canônicas — Êxodo, Davi, Sião, Aliança, Criação — são evocadas pelas imagens neste texto? Como elas amplificam a mensagem do profeta?'),
    ],
  },

  // ── Cumprimento Canônico ──────────────────────────────────────────────────
  {
    slug: 'pf_cumprimento',
    title: 'Cumprimento Canônico',
    shortTitle: 'Cumprimento',
    module: 'inventio',
    group: 'pf_cumprimento_grp',
    groupLabel: 'Cumprimento',
    order: 603,
    objective:
      'Rastrear o cumprimento da profecia ao longo do cânon — histórico imediato, cristológico e escatológico — sem forçar um único modelo de cumprimento.',
    keyQuestions: [
      'Há cumprimento histórico imediato (dentro do AT)?',
      'Como o NT cita ou aplica este texto?',
      'Que tipo de cumprimento é demonstrado: tipológico, direto, progressivo?',
      'O cumprimento é inteiramente passado, parcialmente presente, ainda por vir?',
    ],
    relevantAuthors: ['G.K. Beale', 'D.A. Carson', 'Graeme Goldsworthy', 'Walter Kaiser', 'E. Earle Ellis'],
    cards: [
      card('cumprimento_historico', 'Cumprimento histórico',
        'Houve cumprimento histórico no período do AT (ex.: invasão assíria, babilônica)? Descreva o evento e como ele satisfaz as condições do oráculo.',
        'Houve cumprimento histórico desta profecia dentro do período do AT? Descreva o evento e avalie em que medida ele satisfaz as condições do oráculo.'),
      card('cumprimento_cristologico', 'Cumprimento em Cristo',
        'Como o NT cita este texto? É citação direta, alusão, tipologia? O que o cumprimento em Cristo revela que o horizonte histórico original não alcançava?',
        'Como o NT cita ou aplica este texto profético? Que tipo de cumprimento é demonstrado — citação direta, tipológico, de fulfillment progressivo? Use Beale e Carson.'),
      card('horizonte_escatologico', 'Horizonte escatológico',
        'Há dimensões do cumprimento ainda por vir? Como este texto fala ao consumação do reino de Deus?',
        'Há dimensões escatológicas nesta profecia ainda não cumpridas? Como este texto ilumina a consumação do reino de Deus e a nova criação?'),
    ],
  },

  // ── Escatologia e Alianças ────────────────────────────────────────────────
  {
    slug: 'pf_escatologia',
    title: 'Escatologia e Alianças',
    shortTitle: 'Escatologia',
    module: 'inventio',
    group: 'pf_escatologia_grp',
    groupLabel: 'Escatologia e Alianças',
    order: 604,
    objective:
      'Situar a mensagem profética dentro da teologia das alianças e da progressão redentora, identificando como ela avança o plano de Deus para o seu reino.',
    keyQuestions: [
      'A qual aliança esta profecia está vinculada (Abraâmica, Mosaica, Davídica, Nova)?',
      'Como a profecia avança o plano redentor de Deus?',
      'Que imagem do reino de Deus emerge deste texto?',
      'Como esta profecia se conecta com a escatologia bíblica?',
    ],
    relevantAuthors: ['O. Palmer Robertson', 'Graeme Goldsworthy', 'Peter Gentry', 'Stephen Wellum', 'Geerhardus Vos'],
    cards: [
      card('aliancas', 'Vinculação com as alianças',
        'A qual(is) aliança(s) bíblica(s) este texto está vinculado? Como a linguagem de aliança molda o oráculo — bênção, maldição, fidelidade, renovação?',
        'A qual aliança bíblica este texto está vinculado? Como a linguagem de aliança (bênção, maldição, fidelidade, renovação) molda o oráculo? Use Robertson ou Goldsworthy.'),
      card('progressao_redentora', 'Progressão redentora',
        'Como este texto avança a narrativa redentora? Que passo do plano de Deus — julgamento, restauração, nova criação, reino — este profeta anuncia?',
        'Como esta profecia avança a narrativa redentora? Que fase do plano de Deus — julgamento, exílio, restauração, nova criação, reino — é anunciada?'),
      card('reino_de_deus', 'Reino de Deus',
        'Que visão do reino de Deus emerge deste texto? Como ela completa, tensiona ou amplia o que veio antes na narrativa bíblica?',
        'Que visão do reino de Deus emerge deste texto profético? Como ela avança, amplia ou tensiona a compreensão do reino dentro da progressão canônica?'),
    ],
  },
]
