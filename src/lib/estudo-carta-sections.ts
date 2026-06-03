import type { SectionDef } from './workspace-sections'

export const ESTUDO_CARTA_SECTIONS: SectionDef[] = [
  {
    slug: 'ec_ocasiao',
    title: 'Ocasião e Propósito',
    shortTitle: 'Ocasião',
    module: 'inventio',
    group: 'ec_ocasiao_grp',
    groupLabel: 'Ocasião e Propósito',
    order: 400,
    objective:
      'Reconstruir a situação concreta que motivou a escrita da carta e o propósito do autor ao escrevê-la para aqueles destinatários específicos.',
    keyQuestions: [
      'Qual era a situação dos destinatários quando a carta foi escrita?',
      'Que problema, perigo ou necessidade motivou o autor a escrever?',
      'Qual é o propósito explícito ou implícito da carta?',
      'Como a relação entre autor e destinatários molda o tom e o conteúdo?',
      'Que elementos biográficos e históricos são relevantes para a interpretação?',
    ],
    relevantAuthors: ['Craig Keener', 'Ben Witherington III', 'Bruce Longenecker', 'David deSilva', 'F.F. Bruce'],
    cards: [
      {
        id: 'situacao',
        title: 'Situação dos destinatários',
        placeholder: 'Descreva a situação concreta da comunidade destinatária: problemas teológicos, conflitos internos, pressão externa, perseguição ou questões pastorais que motivaram a carta.',
        aiTrigger: 'Descreva a situação concreta dos destinatários desta carta: contexto histórico, problemas teológicos ou pastorais, pressões externas e conflitos internos. Cite Keener, Witherington ou deSilva.',
      },
      {
        id: 'proposito',
        title: 'Propósito da carta',
        placeholder: 'Qual era o propósito do autor ao escrever? É carta de instrução, correção, encorajamento, defesa ou outra finalidade? Há declarações explícitas de propósito no texto?',
        aiTrigger: 'Qual é o propósito desta carta? Identifique declarações explícitas de propósito no texto e infira o propósito implícito a partir do conteúdo. É carta de instrução, correção, encorajamento ou apologética?',
      },
      {
        id: 'relacao_autor',
        title: 'Relação autor–destinatários',
        placeholder: 'Como a relação entre o autor e os destinatários (pai espiritual, apóstolo, amigo, polêmico) molda o tom, a argumentação e as escolhas retóricas da carta?',
        aiTrigger: 'Analise a relação entre o autor e os destinatários desta carta. Como essa relação — de autoridade, amizade, preocupação pastoral ou confronto — molda o tom e a retórica? Use deSilva sobre honra/vergonha e patronato.',
      },
    ],
  },

  {
    slug: 'ec_estrutura',
    title: 'Estrutura Retórica',
    shortTitle: 'Estrutura Retórica',
    module: 'inventio',
    group: 'ec_estrutura_grp',
    groupLabel: 'Estrutura Retórica',
    order: 401,
    objective:
      'Analisar a estrutura formal e retórica da carta — divisão epistolar, tipo retórico e organização do argumento — para compreender como o autor construiu sua mensagem.',
    keyQuestions: [
      'Qual é a divisão epistolar padrão da carta (praescriptio, proem, corpus, paraenesis, postscript)?',
      'Qual é o tipo retórico: judicial, deliberativo ou epidíctico?',
      'Como a carta se divide em grandes unidades temáticas?',
      'Existem marcadores estruturais explícitos (transições, inclusio, repetições)?',
    ],
    relevantAuthors: ['Ben Witherington III', 'Richard Longenecker', 'David Black', 'George Kennedy', 'Stanley Porter'],
    cards: [
      {
        id: 'divisao_epistolar',
        title: 'Divisão epistolar',
        placeholder: 'Identifique as partes da estrutura epistolar padrão: saudação (praescriptio), ação de graças/prece (proem), corpo (corpus), seção paranética e despedida. Delimite cada parte com versículos.',
        aiTrigger: 'Identifique a estrutura epistolar desta carta: praescriptio (saudação), proem (ação de graças), corpus (corpo principal), paraenesis (seção moral) e postscript (despedida). Delimite cada parte com referências.',
      },
      {
        id: 'tipo_retorico',
        title: 'Tipo retórico',
        placeholder: 'A carta é retórica judicial (defesa/acusação), deliberativa (conselho sobre ações futuras) ou epidíctica (louvor/censura)? Justifique com base nos tópicos e na audiência.',
        aiTrigger: 'Analise o tipo retórico desta carta segundo a retórica greco-romana: judicial (defesa/acusação), deliberativa (conselho futuro) ou epidíctica (louvor/censura). Justifique com base no conteúdo e na audiência.',
      },
      {
        id: 'macroargumento',
        title: 'Estrutura argumentativa',
        placeholder: 'Como a carta está organizada argumentativamente? Quais são as grandes seções e como cada uma contribui para o argumento central?',
        aiTrigger: 'Apresente um esboço da estrutura argumentativa desta carta com suas grandes divisões. Como cada seção contribui para o propósito central? Há uma progressão lógica ou quiástica detectável?',
      },
    ],
  },

  {
    slug: 'ec_argumento',
    title: 'Argumento Central',
    shortTitle: 'Argumento',
    module: 'inventio',
    group: 'ec_argumento_grp',
    groupLabel: 'Argumento Central',
    order: 402,
    objective:
      'Identificar e articular o argumento central da carta — sua tese, desenvolvimento lógico e clímax — para compreender a mensagem como um todo coerente.',
    keyQuestions: [
      'Qual é a tese central da carta em uma frase?',
      'Como o argumento se desenvolve ao longo da carta?',
      'Qual é o clímax argumentativo?',
      'Como a carta resolve a tensão introduzida pela situação dos destinatários?',
      'Qual é o apelo central da carta ao leitor?',
    ],
    relevantAuthors: ['Richard Hays', 'N.T. Wright', 'Frank Thielman', 'Douglas Moo', 'Thomas Schreiner'],
    cards: [
      {
        id: 'tese_central',
        title: 'Tese central',
        placeholder: 'Articule a tese central da carta em uma frase clara. Qual é o argumento principal que o autor está fazendo?',
        aiTrigger: 'Articule a tese central desta carta em uma frase precisa. Qual é o argumento principal? Há um versículo ou passagem que funciona como declaração da tese? Cite comentários relevantes.',
      },
      {
        id: 'desenvolvimento',
        title: 'Desenvolvimento do argumento',
        placeholder: 'Como o argumento se desenvolve ao longo da carta? Quais são os movimentos argumentativos principais e como cada um sustenta a tese central?',
        aiTrigger: 'Descreva o desenvolvimento lógico do argumento desta carta: quais são os principais movimentos argumentativos, como cada seção sustenta a tese central, e qual é a progressão interna do raciocínio?',
      },
      {
        id: 'climax',
        title: 'Clímax e resolução',
        placeholder: 'Qual é o clímax da carta — o momento em que o argumento atinge seu ponto mais alto? Como a carta resolve a tensão inicial? Qual é o apelo final ao leitor?',
        aiTrigger: 'Identifique o clímax desta carta: onde o argumento atinge seu ponto mais alto. Como a carta resolve a tensão criada pela situação dos destinatários? Qual é o apelo final ao leitor?',
      },
    ],
  },
]
