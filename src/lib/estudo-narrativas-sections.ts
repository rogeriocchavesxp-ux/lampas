import type { SectionDef } from './workspace-sections'

function card(id: string, title: string, placeholder: string, aiTrigger: string) {
  return { id, title, placeholder, aiTrigger }
}

export const ESTUDO_NARRATIVAS_SECTIONS: SectionDef[] = [

  // ── Personagens e Caracterização ─────────────────────────────────────────
  {
    slug: 'nr_personagens',
    title: 'Personagens e Caracterização',
    shortTitle: 'Personagens',
    module: 'inventio',
    group: 'nr_personagens_grp',
    groupLabel: 'Personagens e Caracterização',
    order: 700,
    objective:
      'Identificar os personagens centrais e secundários, analisar como o narrador os caracteriza — direta e indiretamente — e compreender seu papel na trama.',
    keyQuestions: [
      'Quem são os personagens centrais e como são apresentados?',
      'Que traços de caráter o narrador revela explicitamente? E implicitamente (ações, diálogos, reações)?',
      'Há contraste entre personagens? Que função tem esse contraste?',
      'Como os personagens mudam (ou resistem à mudança) ao longo da narrativa?',
      'O personagem é "tipo" ou "indivíduo" complexo?',
    ],
    relevantAuthors: ['Robert Alter', 'Adele Berlin', 'Shimon Bar-Efrat', 'Tremper Longman III', 'Richard Pratt'],
    cards: [
      card('personagem_central', 'Personagem central',
        'Descreva o personagem central: nome, posição social, traços apresentados pelo narrador (direta ou indiretamente). Como o narrador o introduz?',
        'Analise o personagem central desta narrativa: como é introduzido, que traços são revelados direta e indiretamente pelo narrador. Use Alter, Berlin ou Bar-Efrat.'),
      card('personagens_secundarios', 'Personagens secundários',
        'Liste os personagens secundários e a função de cada um na trama. Há contraste ou paralelo entre eles e o personagem central?',
        'Analise os personagens secundários desta narrativa e sua função dramática. Há contraste, paralelo ou espelho com o personagem principal?'),
      card('desenvolvimento_personagem', 'Desenvolvimento e mudança',
        'Os personagens mudam ao longo da narrativa? Como? Que evento provoca a transformação? Ou resistem à mudança — e o que isso revela?',
        'Os personagens desta narrativa passam por desenvolvimento ou transformação? Que evento ou revelação catalisa a mudança? O que a resistência ou a mudança revela sobre eles?'),
      card('caracterizacao_indireta', 'Caracterização indireta',
        'Como o narrador revela o caráter dos personagens por meio de ações, diálogos, reações e silêncios — sem descrever diretamente?',
        'Que técnicas de caracterização indireta o narrador usa nesta passagem? Analise o que ações, falas, silêncios e reações revelam sobre os personagens.'),
    ],
  },

  // ── Enredo e Tensão ──────────────────────────────────────────────────────
  {
    slug: 'nr_enredo',
    title: 'Enredo e Tensão Narrativa',
    shortTitle: 'Enredo',
    module: 'inventio',
    group: 'nr_enredo_grp',
    groupLabel: 'Enredo e Tensão',
    order: 701,
    objective:
      'Mapear o enredo da narrativa — sua exposição, complicação, clímax, virada e resolução — identificando a tensão central que move a história.',
    keyQuestions: [
      'Qual é a situação inicial (exposição)?',
      'Que problema, conflito ou complicação move a narrativa?',
      'Onde está o clímax — o momento de maior tensão ou virada?',
      'Como a tensão é resolvida (ou deliberadamente não resolvida)?',
      'Que lacunas narrativas (gaps) o texto deixa intencionalmente?',
    ],
    relevantAuthors: ['Robert Alter', 'Shimon Bar-Efrat', 'Meir Sternberg', 'Sidney Greidanus', 'V. Philips Long'],
    cards: [
      card('exposicao', 'Exposição',
        'Descreva a situação inicial: quem, onde, quando, que condição ou problema está em jogo no início da narrativa.',
        'Qual é a exposição desta narrativa — a situação inicial de personagens, lugar e problema que estabelece o ponto de partida da história?'),
      card('complicacao_conflito', 'Complicação e conflito',
        'Que problema, conflito ou tensão é introduzido? É conflito entre personagens, com Deus, interno, ou com circunstâncias externas?',
        'Que complicação ou conflito central move esta narrativa? É conflito entre personagens, com Deus, interno ao personagem ou com forças externas?'),
      card('climax_virada', 'Clímax e virada',
        'Identifique o clímax — o momento de maior tensão, revelação ou ponto sem retorno. Como a virada transforma a situação?',
        'Onde está o clímax desta narrativa? Que evento, fala ou revelação representa a virada — o ponto de maior tensão ou a mudança irreversível da situação?'),
      card('resolucao_lacunas', 'Resolução e lacunas',
        'Como a tensão é resolvida? Há resolução plena, parcial ou deliberadamente aberta? Que lacunas o narrador deixa — e por quê?',
        'Como esta narrativa resolve sua tensão central? A resolução é plena, parcial ou intencionalmente aberta? Que lacunas narrativas o texto deixa e que efeito produzem?'),
    ],
  },

  // ── Cenário e Tempo ───────────────────────────────────────────────────────
  {
    slug: 'nr_cenario',
    title: 'Cenário, Tempo e Espaço',
    shortTitle: 'Cenário',
    module: 'inventio',
    group: 'nr_cenario_grp',
    groupLabel: 'Cenário e Tempo',
    order: 702,
    objective:
      'Analisar como o cenário geográfico, o tempo e o espaço funcionam na narrativa — como elementos ativos de significado, não apenas decoração de fundo.',
    keyQuestions: [
      'Que lugares são mencionados e que significado carregam?',
      'Como o tempo é usado — aceleração, desaceleração, elipse?',
      'O cenário cria contraste, tensão ou ironia?',
      'Há um movimento espacial significativo (subida/descida, centro/periferia, dentro/fora)?',
    ],
    relevantAuthors: ['Robert Alter', 'Shimon Bar-Efrat', 'Yairah Amit', 'Richard Pratt'],
    cards: [
      card('lugares', 'Lugares e simbolismo geográfico',
        'Que lugares são mencionados? Como funcionam — como pano de fundo neutro, como símbolo ou como elemento ativo de significado?',
        'Que lugares aparecem nesta narrativa e como funcionam? Há simbolismo geográfico (montanha, vale, deserto, cidade, templo)? Como o lugar molda o significado?'),
      card('tempo_narrativo', 'Tempo e ritmo narrativo',
        'Como o narrador usa o tempo? Há cenas detalhadas (câmera lenta), resumos rápidos ou elipses? Como o ritmo afeta o foco e a ênfase?',
        'Como o narrador manipula o tempo nesta passagem? Identifique cenas (ritmo lento), sumários (ritmo rápido) e elipses. Como o ritmo guia a atenção do leitor?'),
      card('movimento_espacial', 'Movimento espacial',
        'Há um movimento significativo no espaço — subida/descida, aproximação/afastamento, centro/margem? Como esse movimento reflete a jornada interior dos personagens?',
        'Existe um movimento espacial significativo nesta narrativa? Como o movimento geográfico reflete a situação espiritual, moral ou emocional dos personagens?'),
    ],
  },

  // ── Narrador e Ponto de Vista ─────────────────────────────────────────────
  {
    slug: 'nr_narrador',
    title: 'Narrador e Ponto de Vista',
    shortTitle: 'Narrador',
    module: 'inventio',
    group: 'nr_narrador_grp',
    groupLabel: 'Narrador e Perspectiva',
    order: 703,
    objective:
      'Analisar a voz e perspectiva do narrador — sua onisciência, confiabilidade, distância e posicionamento em relação aos personagens e ao leitor.',
    keyQuestions: [
      'O narrador é onisciente? O que ele escolhe revelar e o que omite?',
      'Há julgamento implícito do narrador sobre os personagens?',
      'O narrador dá acesso à vida interior dos personagens? De quais?',
      'Como o narrador posiciona o leitor em relação à história?',
    ],
    relevantAuthors: ['Meir Sternberg', 'Robert Alter', 'Adele Berlin', 'Shimon Bar-Efrat', 'Jan Fokkelman'],
    cards: [
      card('onisciencia', 'Onisciência e limitação',
        'O narrador é onisciente? O que ele conhece e revela sobre personagens, eventos e motivações? O que omite deliberadamente?',
        'Qual é o grau de onisciência do narrador? O que ele revela e o que omite? Como as omissões criam suspense, ironia ou convite à interpretação?'),
      card('ponto_de_vista', 'Ponto de vista e julgamento',
        'O narrador emite julgamento explícito sobre personagens ou eventos? Como sua perspectiva molda a leitura — há ironia, simpatia, distância?',
        'O narrador desta passagem emite julgamento explícito ou implícito sobre os personagens? Como sua perspectiva — simpatia, ironia, distância — molda a leitura?'),
      card('vida_interior', 'Acesso à vida interior',
        'O narrador dá acesso aos pensamentos e sentimentos dos personagens? De quais? Por que de uns e não de outros?',
        'A quais personagens o narrador dá acesso interior — pensamentos, sentimentos, motivações? Por que essa seletividade? O que ela revela sobre o ponto de vista narrativo?'),
    ],
  },

  // ── Diálogo e Discurso ────────────────────────────────────────────────────
  {
    slug: 'nr_dialogo',
    title: 'Diálogo e Discurso',
    shortTitle: 'Diálogo',
    module: 'inventio',
    group: 'nr_dialogo_grp',
    groupLabel: 'Diálogo e Discurso',
    order: 704,
    objective:
      'Analisar o diálogo como principal ferramenta de revelação narrativa — como falas, silêncios e discursos indiretos revelam caráter, conflito e teologia.',
    keyQuestions: [
      'Que função o diálogo cumpre nesta cena — revelar, confrontar, revelar caráter?',
      'O que os personagens NÃO dizem é tão importante quanto o que dizem?',
      'Há ironia dramática — o leitor sabe algo que o personagem não sabe?',
      'Como os verbos de locução (disse, respondeu, gritou) contribuem para o sentido?',
    ],
    relevantAuthors: ['Robert Alter', 'Meir Sternberg', 'Shimon Bar-Efrat', 'Jan Fokkelman'],
    cards: [
      card('funcao_dialogo', 'Função do diálogo',
        'Qual é a função das falas nesta cena? Revelam caráter, avançam o enredo, estabelecem conflito, expressam teologia ou fazem os três simultaneamente?',
        'Qual é a função dramática e teológica do diálogo nesta passagem? Como as falas revelam caráter, avançam o enredo ou expressam o ponto de vista teológico da narrativa?'),
      card('silencio_omissao', 'Silêncio e omissão',
        'Há silêncios significativos? Personagens que não respondem, perguntas sem resposta, eventos narrados sem explicação? O que esses silêncios comunicam?',
        'Há silêncios ou omissões significativos nesta narrativa? Personagens que calam, perguntas sem resposta, eventos não explicados. O que esses silencios comunicam ao leitor atento?'),
      card('ironia_dramatica', 'Ironia dramática',
        'Há ironia dramática — situações em que o leitor sabe mais que o personagem, ou palavras que ganham significado que o falante não percebe?',
        'Existe ironia dramática nesta narrativa — momentos em que o leitor conhece algo que o personagem ignora? Como essa ironia cria tensão ou revela o ponto de vista do narrador?'),
    ],
  },

  // ── Teologia Narrativa ────────────────────────────────────────────────────
  {
    slug: 'nr_teologia',
    title: 'Teologia Narrativa',
    shortTitle: 'Teologia',
    module: 'inventio',
    group: 'nr_teologia_grp',
    groupLabel: 'Teologia Narrativa',
    order: 705,
    objective:
      'Identificar a mensagem teológica que emerge da forma narrativa — não como proposição abstrata, mas encarnada em personagens, eventos e resolução da história.',
    keyQuestions: [
      'O que esta narrativa revela sobre Deus — seus atos, caráter, fidelidade?',
      'Como a história humana retratada ilumina a condição humana diante de Deus?',
      'Que verdades teológicas são ensinadas pela forma da história (não apenas por declarações)?',
      'Como esta narrativa se conecta com a grande narrativa bíblica e aponta para Cristo?',
    ],
    relevantAuthors: ['Graeme Goldsworthy', 'Sidney Greidanus', 'Richard Pratt', 'V. Philips Long', 'Geerhardus Vos'],
    cards: [
      card('deus_na_narrativa', 'Deus na narrativa',
        'Como Deus aparece nesta história — diretamente, indiretamente, através de providência? Que atributos são revelados por meio dos eventos?',
        'Como Deus age ou se revela nesta narrativa — diretamente, por providência, por contraste com os personagens humanos? Que atributos divinos são iluminados pela história?'),
      card('condicao_humana', 'A condição humana',
        'O que a experiência dos personagens revela sobre a condição humana — fé, desobediência, esperança, fracasso, dependência de Deus?',
        'O que a experiência dos personagens revela sobre a condição humana diante de Deus? Quais padrões de fé, falha, arrependimento ou obstinação são retratados?'),
      card('grande_narrativa', 'Conexão com a grande narrativa',
        'Como esta história se encaixa na narrativa bíblica maior? Que tipologias aponta? Como ela ilumina, antecipa ou reflete Cristo e a redenção?',
        'Como esta narrativa se encaixa na grande narrativa bíblica? Que tipologias ela contém? Como aponta para Cristo ou encontra seu cumprimento nele? Use Goldsworthy ou Greidanus.'),
    ],
  },
]
