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

  // ── Preparar — Visão Geral (específico para Narrativas) ─────────────────
  {
    slug: 'nr_preparar_visao_geral',
    title: 'Visão Geral da Narrativa',
    shortTitle: 'Visão Geral',
    phase: 'preparar',
    module: 'inventio',
    group: 'nr_visao_geral_grp',
    groupLabel: 'Mapa inicial da narrativa',
    order: -37,
    objective:
      'Registrar a percepção inicial da narrativa antes de qualquer análise técnica — tema, estrutura, personagens e movimento do texto.',
    keyQuestions: [
      'Qual é o tema provável antes de consultar qualquer comentário?',
      'Que estrutura ou divisões naturais você percebe no texto?',
      'Quem são os personagens e como o narrador os apresenta?',
      'Como o texto se move — há clímax, repetições, contrastes, tensão?',
    ],
    relevantAuthors: ['Robert Alter', 'Shimon Bar-Efrat', 'Adele Berlin', 'Sidney Greidanus'],
    cards: [
      card('nr_vg_tema', 'Tema provável',
        'Nomeie o tema provável da narrativa em uma frase simples e provisória. O que esta história parece ser "sobre"?',
        'Ajude-me a formular um tema provável para esta narrativa, mantendo caráter provisório e observacional.'),
      card('nr_vg_estrutura', 'Estrutura percebida',
        'Esboce as partes da narrativa como você as percebe neste momento inicial. Há introdução, desenvolvimento, virada, resolução?',
        'Ajude-me a perceber uma estrutura inicial da narrativa com base nos movimentos visíveis do texto.'),
      card('nr_vg_personagens', 'Personagens',
        'Quem são os personagens da narrativa? Como o narrador os apresenta? Que papel cada um parece desempenhar?',
        'Ajude-me a identificar e descrever os personagens desta narrativa com base no primeiro contato com o texto.'),
      card('nr_vg_movimento', 'Movimento do texto',
        'Descreva como o texto se move. Orientações para observação:\n→ Há um clímax identificável?\n→ Existem repetições ou palavras-chave recorrentes?\n→ Há contrastes entre personagens ou situações?\n→ O texto apresenta progressão ou escalada?\n→ Existe uma mudança de direção ou virada?\n→ Há tensão sendo construída — e como ela se resolve?',
        'Ajude-me a descrever o movimento desta narrativa: clímax, repetições, contrastes, progressão e tensão.'),
    ],
  },

  // ── Investigar: Estudo Contextual ────────────────────────────────────────

  {
    slug: 'nr_ctx_historico',
    title: 'Contexto Histórico',
    shortTitle: 'Contexto Histórico',
    module: 'inventio',
    group: 'nr_contextual_grp',
    groupLabel: 'Estudo Contextual',
    order: 710,
    objective:
      'Descrever o ambiente histórico e cultural da narrativa — período, cenário geopolítico, costumes e tensões que moldam os personagens e eventos.',
    keyQuestions: [
      'Que período? Data aproximada dos eventos?',
      'Qual o cenário geopolítico — que nações, reis ou conflitos são relevantes?',
      'Que costumes, valores ou instituições são refletidos no texto?',
      'Como o contexto ilumina escolhas, reações ou conflitos dos personagens?',
    ],
    relevantAuthors: ['John Walton', 'Victor Matthews', 'Bruce Waltke', 'K.A. Kitchen'],
    cards: [
      card('nr_ctx_hist_main', 'Contexto Histórico',
        'Descreva o contexto histórico-cultural da narrativa.\n\nOrientações:\n→ Que período? Data aproximada dos eventos?\n→ Qual o cenário geopolítico — que nações, reis, conflitos são relevantes?\n→ Que costumes, valores ou instituições são refletidos no texto?\n→ Que tensões históricas moldam a situação dos personagens?\n→ Como esse contexto ilumina escolhas, reações ou conflitos na narrativa?',
        'Descreva o contexto histórico-cultural desta narrativa: período, cenário geopolítico, costumes relevantes e como esse ambiente molda os personagens e eventos.'),
    ],
  },

  {
    slug: 'nr_ctx_literario',
    title: 'Contexto Literário',
    shortTitle: 'Contexto Literário',
    module: 'inventio',
    group: 'nr_contextual_grp',
    groupLabel: 'Estudo Contextual',
    order: 711,
    objective:
      'Situar a narrativa dentro do livro e do cânone — sua posição, conexões com textos vizinhos e papel na estrutura maior do livro.',
    keyQuestions: [
      'Onde esta perícope está no livro — início, meio, clímax, conclusão?',
      'Que narrativas a precedem e sucedem? Como se conectam?',
      'Que temas ou motivos do livro maior aparecem aqui?',
      'Há paralelismos ou contrastes com outras perícopes do mesmo livro?',
    ],
    relevantAuthors: ['Robert Alter', 'Jan Fokkelman', 'David Howard Jr.', 'V. Philips Long'],
    cards: [
      card('nr_ctx_lit_main', 'Contexto Literário',
        'Situe a narrativa dentro do livro e do cânone.\n\nOrientações:\n→ Onde esta perícope está no livro — início, meio, clímax, conclusão?\n→ Que narrativas a precedem e sucedem? Como se conectam?\n→ Que temas ou motivos do livro maior aparecem aqui?\n→ Como este episódio avança a narrativa do livro como um todo?\n→ Que paralelismos ou contrastes há com outras perícopes do mesmo livro?',
        'Situe esta narrativa dentro do livro: onde aparece na estrutura maior, como se conecta às perícopes vizinhas e que temas do livro ela desenvolve.'),
    ],
  },

  {
    slug: 'nr_ctx_canonico',
    title: 'Contexto Canônico',
    shortTitle: 'Contexto Canônico',
    module: 'inventio',
    group: 'nr_contextual_grp',
    groupLabel: 'Estudo Contextual',
    order: 712,
    objective:
      'Descrever as conexões desta narrativa com o restante do cânone — ecos, tipologias, promessas da aliança e posição na história da redenção.',
    keyQuestions: [
      'Que textos do AT ou NT iluminam esta história?',
      'Há paralelos, ecos ou tipologias com outras narrativas?',
      'Que promessas da aliança aparecem ou são avançadas?',
      'Como esta história aponta para a redenção e para Cristo?',
    ],
    relevantAuthors: ['Graeme Goldsworthy', 'T.D. Alexander', 'Sidney Greidanus', 'Geerhardus Vos'],
    cards: [
      card('nr_ctx_can_main', 'Contexto Canônico',
        'Descreva as conexões desta narrativa com o restante do cânone.\n\nOrientações:\n→ Que textos do AT ou NT iluminam esta história?\n→ Há paralelos, ecos ou tipologias com outras narrativas?\n→ Que promessas da aliança aparecem ou são avançadas?\n→ Como esta história aponta para a redenção e para Cristo?\n→ Que lugar esta perícope ocupa no arco da história da redenção?',
        'Descreva as conexões canônicas desta narrativa: textos que a iluminam, ecos e tipologias, promessas da aliança e como ela se encaixa na história da redenção.'),
    ],
  },

  // ── Investigar: Estudo Textual ─────────────────────────────────────────────

  {
    slug: 'nr_txt_original',
    title: 'Texto Original',
    shortTitle: 'Texto Original',
    module: 'inventio',
    group: 'nr_textual_grp',
    groupLabel: 'Estudo Textual',
    order: 720,
    objective:
      'Delimitar a perícope, registrar o texto em hebraico ou grego e a tradução de trabalho.',
    keyQuestions: [
      'Onde começa e termina a unidade literária? Justifique os limites.',
      'Há variantes textuais relevantes?',
      'Que tradução(ões) serão usadas como base?',
    ],
    relevantAuthors: ['Emanuel Tov', 'Bruce Metzger', 'Gordon Fee', 'Douglas Stuart'],
    cards: [
      card('nr_txt_orig_main', 'Texto Original',
        'Cole o texto em hebraico ou grego e sua tradução, e delimite a perícope.\n\nOrientações:\n→ Onde começa e termina a unidade literária? Justifique os limites.\n→ Que divisão textual você utiliza (BHS, NA28, LXX)?\n→ Há variantes textuais relevantes?\n→ Que tradução(ões) você usará como base para o trabalho?',
        'Delimite a perícope justificando os limites, apresente o texto original e a tradução de trabalho, e note variantes textuais relevantes.'),
    ],
  },

  {
    slug: 'nr_txt_estrutura',
    title: 'Estrutura do Texto',
    shortTitle: 'Estrutura do Texto',
    module: 'inventio',
    group: 'nr_textual_grp',
    groupLabel: 'Estudo Textual',
    order: 721,
    objective:
      'Esboçar a estrutura da narrativa e descrever seu movimento interno — cenas, padrões literários e progressão da tensão.',
    keyQuestions: [
      'Quais são as cenas ou episódios identificáveis?',
      'Há padrões literários — inclusio, quiasmo, paralelismo, repetição?',
      'Como o texto se move: exposição → complicação → clímax → resolução?',
      'O movimento apoia o significado teológico?',
    ],
    relevantAuthors: ['Robert Alter', 'Shimon Bar-Efrat', 'Jan Fokkelman', 'Meir Sternberg'],
    cards: [
      card('nr_txt_struct_main', 'Estrutura do Texto',
        'Esboce a estrutura da narrativa e descreva seu movimento interno.\n\nOrientações:\n→ Quais são as cenas ou episódios identificáveis?\n→ Há padrões literários — inclusio, quiasmo, paralelismo, repetição?\n→ Como o texto se move: exposição → complicação → clímax → resolução?\n→ Onde está o ponto de maior tensão ou virada?\n→ O movimento estrutural apoia o significado teológico?',
        'Esboce a estrutura da narrativa, identifique as cenas, descreva o movimento da tensão e note padrões literários como inclusio, quiasmo ou repetição.'),
    ],
  },

  {
    slug: 'nr_txt_exegese',
    title: 'Observações Exegéticas',
    shortTitle: 'Exegese',
    module: 'inventio',
    group: 'nr_textual_grp',
    groupLabel: 'Estudo Textual',
    order: 722,
    objective:
      'Registrar as observações exegéticas mais significativas — personagens, narrador, diálogos, silêncios, repetições e recursos literários.',
    keyQuestions: [
      'Que personagens, lugares, tempos ou objetos merecem atenção especial?',
      'Como o narrador usa onisciência, ponto de vista e distância narrativa?',
      'Que diálogos ou discursos revelam caráter, conflito ou teologia?',
      'Que silêncios ou omissões são significativos?',
      'Que palavras ou imagens se repetem e o que essa repetição sugere?',
    ],
    relevantAuthors: ['Robert Alter', 'Meir Sternberg', 'Adele Berlin', 'Shimon Bar-Efrat', 'Jan Fokkelman'],
    cards: [
      card('nr_txt_exeg_main', 'Observações Exegéticas',
        'Registre as observações exegéticas mais significativas do texto.\n\nOrientações:\n→ Que personagens, lugares, tempos ou objetos merecem atenção?\n→ Como o narrador usa onisciência, ponto de vista e distância narrativa?\n→ Que diálogos ou discursos revelam caráter, conflito ou teologia?\n→ Que silêncios ou omissões são significativos?\n→ Que palavras ou imagens se repetem — e o que essa repetição sugere?',
        'Registre as principais observações exegéticas: uso do narrador, personagens, diálogos, silêncios e repetições — o que cada detalhe contribui para o significado.'),
    ],
  },

  {
    slug: 'nr_txt_mensagem',
    title: 'Mensagem para os Primeiros Ouvintes',
    shortTitle: 'Mensagem Original',
    module: 'inventio',
    group: 'nr_textual_grp',
    groupLabel: 'Estudo Textual',
    order: 723,
    objective:
      'Identificar a mensagem desta narrativa para seus primeiros ouvintes — situação pastoral, resposta convocada e adequação da forma narrativa.',
    keyQuestions: [
      'Que situação pastoral ou histórica de Israel esta história endereçava?',
      'Que resposta o autor buscava provocar — fé, arrependimento, esperança, obediência?',
      'Que verdades sobre Deus, o homem ou a aliança eram cruciais para aquele contexto?',
      'Como a forma narrativa era especialmente adequada para essa mensagem?',
    ],
    relevantAuthors: ['Sidney Greidanus', 'Gordon Fee', 'Douglas Stuart', 'Tremper Longman III'],
    cards: [
      card('nr_txt_msg_main', 'Mensagem para os Primeiros Ouvintes',
        'Qual foi a mensagem desta narrativa para seus primeiros ouvintes?\n\nOrientações:\n→ Que situação pastoral ou histórica de Israel/da comunidade esta história endereçava?\n→ Que resposta o autor buscava provocar — fé, arrependimento, esperança, obediência, identidade?\n→ Que verdades sobre Deus, o homem ou a aliança eram cruciais para aquele contexto?\n→ Como a forma narrativa (em vez de lei ou profecia) era especialmente adequada para essa mensagem?',
        'Qual foi a mensagem desta narrativa para seus primeiros ouvintes? Que situação ela endereçava, que resposta convocava e por que a forma narrativa era o meio ideal?'),
    ],
  },

  // ── Investigar: Estudo Teológico ──────────────────────────────────────────

  {
    slug: 'nr_teo_redentor',
    title: 'Relação com a História da Redenção',
    shortTitle: 'História da Redenção',
    module: 'inventio',
    group: 'nr_teologico_grp',
    groupLabel: 'Estudo Teológico',
    order: 730,
    objective:
      'Situar a narrativa na história da redenção — época, ação de Deus, tipologias e avanço da aliança rumo a Cristo.',
    keyQuestions: [
      'Que época da história redentora (patriarcas, êxodo, monarquia, exílio, retorno)?',
      'Como Deus age aqui — promessa, cumprimento, julgamento, graça, providência?',
      'Há tipologia — pessoas, eventos ou instituições que apontam para Cristo?',
      'Como esta história avança o fio da aliança desde Gênesis 3.15?',
    ],
    relevantAuthors: ['Graeme Goldsworthy', 'Geerhardus Vos', 'T.D. Alexander', 'Bryan Chapell'],
    cards: [
      card('nr_teo_redentor_main', 'Relação com a História da Redenção',
        'Como esta narrativa se encaixa e avança a história da redenção?\n\nOrientações:\n→ Que época da história redentora (criação, queda, patriarcas, êxodo, monarquia, exílio, retorno)?\n→ Como Deus age aqui — promessa, cumprimento, julgamento, graça, providência?\n→ Há tipologia explícita ou implícita — pessoas, eventos ou instituições que apontam para Cristo?\n→ Como esta história avança o fio da aliança desde Gênesis 3.15?\n→ Que elos canônicos (Hebreus, NT, Salmos) iluminam a tipologia?',
        'Como esta narrativa se encaixa na história da redenção? Que época representa, como Deus age, que tipologias aponta para Cristo e como avança a aliança?'),
    ],
  },

  {
    slug: 'nr_teo_doutrinas',
    title: 'Doutrinas Ensinadas',
    shortTitle: 'Doutrinas',
    module: 'inventio',
    group: 'nr_teologico_grp',
    groupLabel: 'Estudo Teológico',
    order: 731,
    objective:
      'Identificar as doutrinas que emergem da narrativa — ensinadas explicitamente ou pela forma da história — e os erros que ela corrige.',
    keyQuestions: [
      'O que o texto ensina sobre Deus, o homem, a salvação, a aliança, a lei, a graça?',
      'Essas verdades são ensinadas explicitamente ou pela forma da história?',
      'Como a experiência dos personagens ilustra ou problematiza essas doutrinas?',
      'Que erros doutrinários esta narrativa corrige ou previne?',
    ],
    relevantAuthors: ['John Frame', 'Herman Ridderbos', 'Thomas Schreiner', 'Wayne Grudem'],
    cards: [
      card('nr_teo_doc_main', 'Doutrinas Ensinadas',
        'Que doutrinas teológicas emergem desta narrativa?\n\nOrientações:\n→ O que o texto ensina sobre Deus, o homem, a salvação, a aliança, a lei, a graça?\n→ Essas verdades são ensinadas explicitamente (declarações) ou implicitamente (pela forma da história)?\n→ Como a experiência dos personagens ilustra, exemplifica ou problematiza essas doutrinas?\n→ Que erros doutrinários esta narrativa corrige ou previne?',
        'Que doutrinas emergem desta narrativa — ensinadas explicitamente ou pela forma da história? Como os personagens as ilustram, e que erros teológicos a narrativa corrige?'),
    ],
  },

  {
    slug: 'nr_teo_implicacoes',
    title: 'Implicações para a Vida',
    shortTitle: 'Implicações',
    module: 'inventio',
    group: 'nr_teologico_grp',
    groupLabel: 'Estudo Teológico',
    order: 732,
    objective:
      'Identificar as implicações desta narrativa para a vida cristã — chamado à fé, ao arrependimento, padrões de vida e verdades que confortam ou desafiam.',
    keyQuestions: [
      'Como ela chama à fé, ao arrependimento, à obediência ou à esperança?',
      'Que padrões de vida ela afirma ou condena?',
      'Que verdades sobre Deus confortam, desafiam ou reorientam o povo de Deus hoje?',
      'Como a tipologia cristológica molda a aplicação para o povo do novo pacto?',
    ],
    relevantAuthors: ['Bryan Chapell', 'Sidney Greidanus', 'Richard Pratt', 'Graeme Goldsworthy'],
    cards: [
      card('nr_teo_impl_main', 'Implicações para a Vida',
        'Quais são as implicações desta narrativa para a vida cristã?\n\nOrientações:\n→ Como ela chama à fé, ao arrependimento, à obediência ou à esperança?\n→ Que padrões de vida ela afirma ou condena?\n→ Que verdades sobre Deus confortam, desafiam ou reorientam o povo de Deus hoje?\n→ Como a tipologia cristológica molda a aplicação para o povo do novo pacto?\n→ Que perigo aplicacional (moralismo, exemplarismo) esta narrativa exige evitar?',
        'Quais são as implicações desta narrativa para a vida cristã? Que chamado ela convoca, que padrões afirma ou condena, e como a tipologia cristológica molda a aplicação?'),
    ],
  },

  // ── Investigar: Visão Geral ────────────────────────────────────────────────

  {
    slug: 'nr_ivg_ideia',
    title: 'Grande Ideia',
    shortTitle: 'Grande Ideia',
    module: 'inventio',
    group: 'nr_ivg_grp',
    groupLabel: 'Visão Geral da Investigação',
    order: 740,
    objective:
      'Formular a grande ideia da narrativa — o que o texto ensina (sujeito) e o que afirma sobre isso (predicado).',
    keyQuestions: [
      'Do que a narrativa fala? (sujeito)',
      'O que a narrativa afirma sobre esse sujeito? (predicado)',
      'A grande ideia emerge da narrativa — não foi imposta sobre ela?',
    ],
    relevantAuthors: ['Haddon Robinson', 'Sidney Greidanus', 'Bryan Chapell'],
    cards: [
      card('nr_ivg_ideia_main', 'Grande Ideia',
        'Formule a grande ideia desta narrativa.\n\nA grande ideia tem dois componentes:\n→ Sujeito: do que a narrativa fala?\n→ Predicado: o que a narrativa afirma sobre esse sujeito?\n\nCritérios:\n→ Emerge da narrativa — não imposta sobre ela\n→ Integra a mensagem histórica e a verdade atemporal\n→ É formulada como afirmação (não como pergunta)\n→ Pode guiar tanto a exposição quanto a pregação',
        'Formule a grande ideia desta narrativa: sujeito (do que fala) + predicado (o que afirma). Deve emergir do texto e integrar mensagem histórica e verdade atemporal.'),
    ],
  },

  {
    slug: 'nr_ivg_verdades',
    title: 'Verdades Centrais',
    shortTitle: 'Verdades',
    module: 'inventio',
    group: 'nr_ivg_grp',
    groupLabel: 'Visão Geral da Investigação',
    order: 741,
    objective:
      'Listar as 2-3 verdades centrais que a narrativa ensina — derivadas do texto, ensinadas pela forma narrativa e confirmadas pelo cânone.',
    keyQuestions: [
      'Que verdades são derivadas diretamente do texto, não de paralelos externos?',
      'São ensinadas pela forma narrativa — não apenas por declarações do narrador?',
      'São atemporais mas articuladas historicamente?',
    ],
    relevantAuthors: ['Haddon Robinson', 'Bryan Chapell', 'Graeme Goldsworthy', 'Sidney Greidanus'],
    cards: [
      card('nr_ivg_verd_main', 'Verdades Centrais',
        'Liste as 2-3 verdades centrais que a narrativa ensina.\n\nCritérios para cada verdade:\n→ Derivada diretamente do texto, não de paralelos externos\n→ Ensinada pela forma narrativa (não apenas por declarações do narrador)\n→ Atemporal, mas articulada historicamente\n→ Confirmada por paralelos canônicos\n→ Distinta — não repetição da grande ideia em outras palavras',
        'Liste as 2-3 verdades centrais desta narrativa: cada uma deve emergir do texto, ser ensinada pela forma narrativa, ser atemporal e ser confirmada pelo cânone.'),
    ],
  },

  {
    slug: 'nr_ivg_aplic',
    title: 'Aplicações Principais',
    shortTitle: 'Aplicações',
    module: 'inventio',
    group: 'nr_ivg_grp',
    groupLabel: 'Visão Geral da Investigação',
    order: 742,
    objective:
      'Desenvolver as aplicações pastorais principais — derivadas das verdades centrais, não de moralismos da história.',
    keyQuestions: [
      'Que chamado à ação, à fé ou à reflexão o texto convoca?',
      'As aplicações fluem das verdades identificadas (não de moralismos)?',
      'Como a tipologia cristológica molda a aplicação para o povo do novo pacto?',
    ],
    relevantAuthors: ['Bryan Chapell', 'Sidney Greidanus', 'Bryan Chapell'],
    cards: [
      card('nr_ivg_aplic_main', 'Aplicações Principais',
        'Desenvolva as aplicações pastorais principais desta narrativa.\n\nOrientações:\n→ Que chamado à ação, à fé ou à reflexão o texto convoca?\n→ Como as aplicações fluem das verdades identificadas (não de moralismos da história)?\n→ Que grupos de ouvintes são especialmente endereçados?\n→ Como a tipologia cristológica molda a aplicação para o povo do novo pacto?\n→ Que perigo aplicacional (moralismo, exemplarismo) esta narrativa exige evitar?',
        'Desenvolva as principais aplicações pastorais: devem fluir das verdades centrais, não de moralismos da história, e ser moldadas pela tipologia cristológica.'),
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
