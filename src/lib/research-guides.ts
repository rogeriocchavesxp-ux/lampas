// Guias metodológicos de pesquisa por seção
// Cada guia orienta o usuário: o que investigar, onde e em que ordem.

export interface ResearchSource {
  category: string
  items: string[]
}

export interface SectionResearchGuide {
  steps: string[]
  sources?: ResearchSource[]
  prerequisites?: string[]      // checklist — exibido quando existe
  aiPrompt: string              // prompt para botão "Como pesquisar esta etapa?"
}

export const RESEARCH_GUIDES: Record<string, SectionResearchGuide> = {

  // ── CONTEXTUAL ─────────────────────────────────────────────────────────────

  contexto_historico: {
    steps: [
      'Leia o livro completo de uma vez para ter visão geral',
      'Consulte uma introdução ao NT (Carson & Moo ou Guthrie)',
      'Leia a introdução do livro em dois comentários exegéticos',
      'Verifique referências históricas em uma Bíblia de estudo',
      'Use dicionários bíblicos para complementar detalhes específicos',
      'Confirme com a IA Lampas depois de formular sua hipótese',
    ],
    sources: [
      {
        category: 'Introduções ao NT',
        items: ['Carson & Moo — Introdução ao NT', 'D. A. Carson', 'Guthrie', 'Köstenberger', 'Hendriksen'],
      },
      {
        category: 'Bíblias de estudo',
        items: ['Bíblia de Estudo de Genebra', 'Bíblia de Estudo Reformada', 'Bíblia Thompson', 'Bíblia NAA de Estudo'],
      },
      {
        category: 'Comentários',
        items: ['NICNT', 'Comentário Bíblico Expositivo', 'Hendriksen', 'Moo', 'NIGTC'],
      },
    ],
    aiPrompt: 'Explica como pesquisar o contexto histórico desta passagem. Qual o objetivo desta etapa, quais fontes consultar, em que ordem, o que observar e os erros mais comuns.',
  },

  autor_destinatarios: {
    steps: [
      'Leia o texto bíblico observando referências ao autor e aos leitores',
      'Identifique referências internas na própria carta',
      'Consulte a introdução do livro em um comentário exegético',
      'Leia o artigo sobre o livro em um dicionário bíblico',
      'Verifique a introdução em duas traduções diferentes',
    ],
    sources: [
      {
        category: 'Fontes principais',
        items: ['Introdução ao NT — Carson & Moo', 'Comentários exegéticos', 'Dicionário Bíblico'],
      },
    ],
    aiPrompt: 'Explica como pesquisar autor e destinatários desta passagem. Qual o objetivo, quais fontes, em que ordem e o que observar.',
  },

  ocasiao_proposito: {
    steps: [
      'Leia toda a carta buscando pistas sobre a situação dos destinatários',
      'Identifique problemas, perguntas ou comportamentos abordados pelo autor',
      'Consulte Atos dos Apóstolos (para cartas paulinas)',
      'Leia as introduções do livro em dois comentários',
      'Compare a análise com um dicionário bíblico',
    ],
    sources: [
      {
        category: 'Para cartas paulinas',
        items: ['Atos dos Apóstolos', 'Introdução ao NT', 'Comentários exegéticos', 'DPL — Dictionary of Paul and His Letters'],
      },
    ],
    aiPrompt: 'Explica como pesquisar a ocasião e o propósito desta carta. Qual o objetivo, quais fontes, em que ordem e o que buscar no texto.',
  },

  genero_literario: {
    steps: [
      'Leia o texto observando forma, tom, vocabulário e estrutura',
      'Identifique marcadores de gênero: verbos imperativos, fórmulas epistolares, poesia',
      'Consulte as categorias de gênero em uma introdução ao NT',
      'Verifique como o comentarista classifica o gênero',
      'Considere subgêneros dentro do texto (parábola, hino, credal)',
    ],
    sources: [
      {
        category: 'Fontes',
        items: ['Gordon Fee & Douglas Stuart — Como Ler a Bíblia', 'Introdução ao NT', 'Comentários exegéticos'],
      },
    ],
    aiPrompt: 'Explica como identificar o gênero literário desta passagem. Quais marcadores procurar, quais fontes consultar e o que implica o gênero para a interpretação.',
  },

  estrutura_livro: {
    steps: [
      'Leia o livro completo de uma vez marcando transições temáticas',
      'Consulte o esboço proposto em dois comentários exegéticos diferentes',
      'Observe palavras-chave repetidas que marcam divisões',
      'Identifique inclusões e quiasmos no nível macro',
      'Compare as estruturas propostas pelos comentaristas',
    ],
    sources: [
      {
        category: 'Fontes',
        items: ['Comentários exegéticos (NICNT, NIGTC)', 'Introdução ao NT', 'Análise retórica do livro'],
      },
    ],
    aiPrompt: 'Explica como analisar a estrutura do livro em que esta passagem se encontra. Qual o objetivo, quais divisões buscar e como os comentaristas abordam isso.',
  },

  // ── TEXTUAL ────────────────────────────────────────────────────────────────

  delimitacao_pericope: {
    steps: [
      'Leia o texto buscando mudanças de: personagem, cena, tema, vocabulário',
      'Observe marcadores de abertura e fechamento (inclusio)',
      'Compare divisões em duas ou três traduções diferentes',
      'Consulte dois comentários exegéticos para ver onde eles delimitam',
      'Verifique se há consenso ou divergência entre os comentaristas',
    ],
    sources: [
      {
        category: 'Fontes',
        items: ['Texto bíblico (múltiplas traduções)', 'Comentários exegéticos', 'NA28 / BHS (aparato crítico)'],
      },
    ],
    aiPrompt: 'Explica como delimitar a perícope desta passagem. Quais critérios usar, quais marcadores textuais observar e como os comentaristas abordam a delimitação.',
  },

  texto_original: {
    steps: [
      'Leia o texto grego/hebraico em voz alta para familiarização',
      'Identifique o vocabulário central e termos técnicos',
      'Verifique variantes textuais relevantes no aparato crítico (NA28/BHS)',
      'Compare com a Septuaginta (para textos do AT)',
      'Use o interlinear Lampas para suporte imediato',
    ],
    sources: [
      {
        category: 'Textos críticos',
        items: ['NA28 (NT grego)', 'BHS (AT hebraico)', 'Septuaginta (LXX)'],
      },
      {
        category: 'Ferramentas digitais',
        items: ['Logos / Accordance', 'BibleHub (interlinear)', 'Interlinear Lampas'],
      },
    ],
    aiPrompt: 'Explica como trabalhar com o texto original desta passagem. Quais ferramentas usar, o que observar no grego/hebraico e como avaliar variantes textuais.',
  },

  traducao_textual: {
    steps: [
      'Leia o texto original palavra por palavra com ajuda do léxico',
      'Faça uma tradução literal inicial sem preocupação estilística',
      'Compare com 3 a 4 traduções em português',
      'Identifique diferenças significativas entre as traduções',
      'Revise a tradução à luz dos dados morfossintáticos',
    ],
    sources: [
      {
        category: 'Léxicos',
        items: ['BDAG (NT grego)', 'HALOT (AT hebraico)', 'Louw & Nida', 'Léxico Strong'],
      },
      {
        category: 'Traduções',
        items: ['ACF', 'NVI', 'NAA', 'ARA', 'NTLH — para comparação'],
      },
    ],
    aiPrompt: 'Explica como fazer uma tradução exegética desta passagem. Quais ferramentas usar, como comparar traduções e o que uma tradução pessoal agrega à exegese.',
  },

  analise_morfossintatica: {
    steps: [
      'Identifique o verbo principal de cada oração',
      'Classifique tempos, modos e vozes verbais relevantes',
      'Mapeie as relações entre orações (coordenação e subordinação)',
      'Analise construções gramaticais incomuns ou teologicamente carregadas',
      'Consulte gramáticas para construções específicas',
    ],
    sources: [
      {
        category: 'Gramáticas NT (grego)',
        items: ['Wallace — Greek Grammar Beyond the Basics', 'Mounce — Basics of Biblical Greek', 'BDF (Blass-DeBrunner-Funk)'],
      },
      {
        category: 'Gramáticas AT (hebraico)',
        items: ['Waltke & O\'Connor', 'Joüon-Muraoka', 'GKC (Gesenius)'],
      },
    ],
    aiPrompt: 'Explica como fazer análise morfossintática desta passagem. Quais aspectos gramaticais priorizar, quais ferramentas usar e o que a gramática revela sobre o significado.',
  },

  termos_chave: {
    steps: [
      'Identifique as palavras com maior carga semântica na passagem',
      'Pesquise o uso da palavra no restante do mesmo livro',
      'Verifique o uso no cânon completo (concordância)',
      'Consulte o verbete no léxico (BDAG para NT, HALOT para AT)',
      'Leia o verbete em um dicionário teológico (NIDNTTE, TWOT)',
      'Verifique como comentaristas reformados tratam o termo',
    ],
    sources: [
      {
        category: 'Léxicos técnicos',
        items: ['BDAG', 'HALOT', 'Thayer', 'Louw & Nida'],
      },
      {
        category: 'Dicionários teológicos',
        items: ['NIDNTTE (NT)', 'TWOT / NIDOTTE (AT)', 'TDNT (Kittel)', 'DPL', 'DJG'],
      },
      {
        category: 'Concordâncias',
        items: ['Concordância Strong', 'BibleHub', 'Logos — Bible Word Study'],
      },
    ],
    aiPrompt: 'Explica como pesquisar os termos-chave desta passagem. Como identificá-los, quais ferramentas lexicais usar, em que ordem e o que um bom estudo lexical deve revelar.',
  },

  estrutura_literaria: {
    steps: [
      'Leia o texto várias vezes buscando padrões e repetições',
      'Marque palavras ou frases que se repetem (inclusio, anáfora)',
      'Identifique contrastes e paralelismos',
      'Procure estrutura quiástica: A-B-C-B\'-A\'',
      'Verifique se a estrutura proposta é confirmada por pelo menos um comentarista',
      'Esboce a estrutura em formato visual',
    ],
    sources: [
      {
        category: 'Metodologia',
        items: ['Leland Ryken — Words of Delight', 'Bullinger — Figures of Speech', 'Comentários exegéticos técnicos'],
      },
    ],
    aiPrompt: 'Explica como analisar a estrutura literária desta passagem. Quais dispositivos buscar, como identificar quiasmos e paralelismos, e o que a estrutura revela sobre a mensagem.',
  },

  // ── TEOLÓGICO ──────────────────────────────────────────────────────────────

  contexto_canonico: {
    steps: [
      'Identifique alusões ou citações de outros textos bíblicos',
      'Rastreie o tema central em progressão pelo AT e NT',
      'Consulte um dicionário de teologia bíblica',
      'Verifique como o texto se encaixa no desenvolvimento redentor-histórico',
      'Use uma teologia bíblica reformada como referência (Vos, Goldsworthy)',
    ],
    sources: [
      {
        category: 'Teologia bíblica',
        items: ['Geerhardus Vos — Teologia Bíblica', 'Graeme Goldsworthy — According to Plan', 'NDBT — New Dictionary of Biblical Theology', 'G. K. Beale — Handbook on the NT Use of the OT'],
      },
    ],
    aiPrompt: 'Explica como situar esta passagem no contexto canônico. Quais conexões buscar, como rastrear o tema ao longo das Escrituras e quais fontes de teologia bíblica consultar.',
  },

  progressao_revelacional: {
    steps: [
      'Identifique a época da história redenção em que o texto está situado',
      'Rastreie tipologias que o texto aponta ou cumpre',
      'Verifique como o NT cita ou alude a esta passagem (se for AT)',
      'Analise como Cristo é central na mensagem desta passagem',
      'Consulte Goldsworthy ou Greidanus para a aplicação cristocêntrica',
    ],
    sources: [
      {
        category: 'Progressão e tipologia',
        items: ['Graeme Goldsworthy', 'Sidney Greidanus — Preaching Christ from the OT', 'Edmund Clowney', 'G. K. Beale'],
      },
    ],
    aiPrompt: 'Explica como analisar a progressão revelacional e a tipologia cristológica desta passagem. Como encontrar Cristo no texto e como a teologia bíblica reformada aborda isso.',
  },

  sintese: {
    prerequisites: [
      'Estudo Contextual (contexto histórico, autor, ocasião)',
      'Estudo Textual (delimitação, tradução, morfossintaxe, termos-chave, estrutura)',
      'Estudo Teológico (contexto canônico, progressão revelacional)',
    ],
    steps: [
      'Revise todos os achados dos estudos anteriores',
      'Formule o sujeito da Grande Ideia: "Este texto fala sobre..."',
      'Formule o complemento: "... dizendo que..."',
      'Verifique se a GIE emerge do texto, não é imposta a ele',
      'Teste a Grande Ideia contra os principais comentaristas',
    ],
    aiPrompt: 'Explica como formular a Grande Ideia Exegética após os estudos contextual, textual e teológico. Qual é a diferença entre sujeito e complemento, e como verificar se a GIE é fiel ao texto.',
  },

  grande_ideia_homiletica: {
    prerequisites: [
      'Grande Ideia Exegética completa',
      'Propósito homilético definido (informar, persuadir ou motivar)',
    ],
    steps: [
      'Parta da Grande Ideia Exegética já formulada',
      'Identifique o propósito do sermão: informar, persuadir ou motivar?',
      'Reformule a ideia em linguagem contemporânea sem perder o conteúdo',
      'Verifique se a proposição responde à necessidade do ouvinte',
      'Teste com: "Se eu ouvir esta mensagem, o que devo saber, crer ou fazer?"',
    ],
    sources: [
      {
        category: 'Homilética',
        items: ['Haddon Robinson — Biblical Preaching', 'Bryan Chapell — Christ-Centered Preaching', 'Steven Mathewson — The Art of Preaching OT Narrative'],
      },
    ],
    aiPrompt: 'Explica como formular a Grande Ideia Homilética a partir da Exegética. Qual a diferença entre as duas, como adaptar a linguagem ao ouvinte e como o propósito homilético a molda.',
  },

  // ── CARTA ESPECÍFICO ───────────────────────────────────────────────────────

  ec_ocasiao: {
    steps: [
      'Leia toda a carta de uma vez buscando problemas ou situações abordadas',
      'Observe o tom do autor: defesa, encorajamento, correção, louvor',
      'Consulte Atos para o contexto histórico da comunidade (se paulino)',
      'Leia a introdução do livro em dois comentários diferentes',
      'Verifique referências internas à situação dos destinatários',
    ],
    sources: [
      {
        category: 'Para cartas paulinas',
        items: ['Atos dos Apóstolos', 'DPL — Dictionary of Paul and His Letters', 'Introdução ao NT (Carson & Moo)', 'Comentários exegéticos'],
      },
    ],
    aiPrompt: 'Explica como identificar a ocasião desta carta. Quais pistas internas buscar, o papel dos Atos dos Apóstolos e como os comentaristas reconstroem o contexto histórico.',
  },

  ec_estrutura: {
    steps: [
      'Leia a carta completa identificando grandes divisões temáticas',
      'Observe a retórica epistolar: saudação, ação de graças, corpo, parênese, conclusão',
      'Consulte as divisões propostas em dois comentários exegéticos',
      'Identifique a progressão do argumento principal da carta',
      'Analise o tipo retórico: judicial (defesa), deliberativo (conselho) ou epidíctico',
    ],
    sources: [
      {
        category: 'Retórica e estrutura',
        items: ['Ben Witherington — comentários com análise retórica', 'DPL', 'NIGTC', 'NICNT'],
      },
    ],
    aiPrompt: 'Explica como analisar a estrutura retórica desta carta. Quais divisões identificar, como classificar o tipo retórico e o que a estrutura revela sobre o argumento do autor.',
  },

  ec_argumento: {
    steps: [
      'Identifique a proposição central da carta (o que o autor quer provar ou ensinar)',
      'Mapeie como cada seção contribui para o argumento central',
      'Observe conectivos argumentativos: "porque", "portanto", "mas", "a fim de que"',
      'Consulte como os comentaristas descrevem o fluxo argumentativo',
      'Relacione o argumento ao contexto e à ocasião já estudados',
    ],
    sources: [
      {
        category: 'Análise argumentativa',
        items: ['Witherington — retórica', 'Thomas Schreiner', 'Douglas Moo', 'NIGTC'],
      },
    ],
    aiPrompt: 'Explica como analisar o argumento central desta carta. Como identificar a proposição, mapear as subseções argumentativas e conectar o argumento ao contexto e à ocasião.',
  },

  // ── SERMÃO / COMUNICAÇÃO ───────────────────────────────────────────────────

  introducao_sermao: {
    steps: [
      'Identifique a necessidade humana que o texto endereça',
      'Elabore uma situação real que ilustre essa tensão',
      'Formule a pergunta que o sermão responderá',
      'Anuncie a proposição sem ainda resolvê-la',
      'Verifique se a introdução convida o ouvinte a ouvir',
    ],
    sources: [
      {
        category: 'Homilética',
        items: ['Haddon Robinson — Biblical Preaching', 'Bryan Chapell — Christ-Centered Preaching', 'John Stott — Between Two Worlds'],
      },
    ],
    aiPrompt: 'Explica como construir uma introdução eficaz para este sermão. Como identificar a tensão que o texto endereça e estruturar a abertura para capturar a atenção do ouvinte.',
  },

  divisoes_sermao: {
    steps: [
      'Derive as divisões diretamente do texto, não imponha estrutura externa',
      'Cada divisão deve avançar o argumento da Grande Ideia',
      'Verifique se as divisões são equilibradas em peso e extensão',
      'Teste: "Cada ponto torna a ideia mais clara ou mais próxima?"',
      'Consulte como os comentaristas estruturam a passagem',
    ],
    sources: [
      {
        category: 'Estrutura homilética',
        items: ['Robinson — Biblical Preaching (cap. 5)', 'Chapell — Christ-Centered Preaching', 'Mathewson — Art of Preaching OT Narrative'],
      },
    ],
    aiPrompt: 'Explica como derivar as divisões do sermão a partir do texto. Como garantir que os pontos principais sejam textuais, não impostos, e como equilibrá-los.',
  },

  aplicacao: {
    steps: [
      'Identifique o princípio atemporal que o texto ensina',
      'Mapeie as implicações para: fé, caráter, comportamento, relações, missão',
      'Diferencie aplicações individuais, familiares e eclesiásticas',
      'Verifique se a aplicação flui da exegese (não é moralismo)',
      'Seja específico: aplicação genérica não transforma',
    ],
    sources: [
      {
        category: 'Aplicação pastoral',
        items: ['Chapell — Christ-Centered Preaching', 'Tim Keller — Preaching', 'Daniel Akin'],
      },
    ],
    aiPrompt: 'Explica como desenvolver aplicações pastorais que fluam genuinamente desta passagem. Como evitar o moralismo, garantir especificidade e conectar à Grande Ideia.',
  },

}

export function getResearchGuide(slug: string): SectionResearchGuide | undefined {
  return RESEARCH_GUIDES[slug]
}
