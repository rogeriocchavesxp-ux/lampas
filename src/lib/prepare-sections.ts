import type { SectionDef } from './workspace-sections'

function card(id: string, title: string, placeholder: string, aiTrigger: string) {
  return { id, title, placeholder, aiTrigger }
}

export const PREPARE_SECTIONS: SectionDef[] = [
  {
    slug: 'preparacao_espiritual',
    title: '1. Preparação Espiritual',
    shortTitle: 'Preparação Espiritual',
    phase: 'preparar',
    module: 'inventio',
    group: 'preparar_espiritual',
    groupLabel: 'Piedade, planejamento e oração',
    order: -40,
    objective:
      'Iniciar o estudo de modo reverente e pastoral, permitindo que o texto forme o coração do intérprete antes que ele comece a analisá-lo tecnicamente.',
    keyQuestions: [
      'Como este texto chama você à dependência e adoração?',
      'Por que você está estudando esta passagem agora?',
      'Que necessidade pastoral está diante de você e da congregação?',
      'Qual é o contexto de comunicação e o perfil do público?',
    ],
    relevantAuthors: ['João Calvino', 'John Owen', 'Martyn Lloyd-Jones', 'John Stott', 'Sinclair Ferguson'],
    cards: [
      card('preparar_oracao', 'Oração', 'Escreva uma oração honesta diante de Deus antes de estudar. Inclua: dependência de Deus, adoração, confissão, pedidos específicos, temor santo e disposição para ouvir a Palavra.', 'Conduza-me em uma oração pastoral e reverente antes de estudar esta passagem, sem tecnicismo, com foco em dependência, adoração, confissão e temor de Deus.'),
      card('preparar_objetivo_estudo', 'Objetivo do estudo', 'Por que você está estudando esta passagem agora? (Sermão / Aula / Devocional / Aconselhamento / Crescimento pessoal / Outro). Que fruto pastoral espera desse processo?', 'Ajude-me a formular um objetivo claro e pastoral para o estudo desta passagem, considerando a ocasião e o fruto esperado.'),
      card('preparar_ocasiiao_publico', 'Ocasião e público', 'Descreva o contexto de comunicação, o perfil dos ouvintes e o ambiente ministerial: série, culto, grupo, contexto, necessidade dominante.', 'Ajude-me a descrever a ocasião, o perfil do público e o ambiente ministerial relacionados a esta passagem.'),
    ],
  },
  {
    slug: 'preparar_leia_assimile',
    title: '2. Leia e Assimile a Ideia do Texto',
    shortTitle: 'Leia e Assimile',
    phase: 'preparar',
    module: 'inventio',
    group: 'preparar_assimilacao',
    groupLabel: 'Contato direto com a Escritura',
    order: -39,
    objective:
      'Absorver o texto antes da análise formal, por meio de leitura lenta, repetida, em voz alta e comparada, buscando ouvir a passagem como Escritura viva.',
    keyQuestions: [
      'O que mais chamou sua atenção na primeira leitura?',
      'Qual parece ser a ideia central antes de qualquer comentário técnico?',
      'Que repetições, tensões, emoções ou movimentos aparecem?',
      'O que o autor parece querer produzir no leitor ou ouvinte?',
    ],
    relevantAuthors: ['Eugene Peterson', 'John Stott', 'Gordon Fee', 'Douglas Stuart'],
    cards: [
      card('preparar_leitura_lenta', 'Leitura', 'Registre o que percebeu no primeiro contato com o texto. O que ficou mais evidente? Que palavras, emoções ou imagens chamaram atenção?', 'Guie-me em uma leitura lenta e reverente desta passagem, priorizando observação simples antes de qualquer análise técnica.'),
      card('preparar_comparacao_traducoes', 'Comparação', 'Compare traduções em português e registre diferenças que chamam atenção, sem ainda resolver tecnicamente todos os detalhes.', 'Ajude-me a comparar traduções desta passagem em nível inicial, observando diferenças relevantes sem aprofundar gramática ainda.'),
      card('preparar_ideia_inicial', 'Ideia Central', 'Escreva, em linguagem provisória, qual parece ser a ideia central da passagem neste primeiro contato.', 'Ajude-me a formular uma ideia central inicial e provisória para esta passagem, sem fechar a exegese cedo demais.'),
      card('preparar_tensoes_repeticoes', 'Tensões', 'Liste tensões, contrastes, palavras repetidas, emoções dominantes e movimentos aparentes do texto.', 'Faça perguntas de observação inicial sobre tensões, repetições, emoções e movimentos desta passagem.'),
    ],
  },
  {
    slug: 'preparar_visao_geral',
    title: '4. Visão Geral da Passagem',
    shortTitle: 'Visão Geral',
    phase: 'preparar',
    module: 'inventio',
    group: 'preparar_visao_geral',
    groupLabel: 'Assimilação macro',
    order: -37,
    objective:
      'Registrar a percepção inicial da passagem antes de qualquer análise técnica — tema provável, grande ideia provisória, estrutura percebida e as perguntas e dificuldades que surgem no primeiro contato.',
    keyQuestions: [
      'Qual é o tema provável da passagem antes de consultar qualquer comentário?',
      'Que grande ideia você percebe neste primeiro contato?',
      'Que estrutura ou divisões naturais você percebe no texto?',
      'Que perguntas e dificuldades surgiram neste primeiro contato?',
    ],
    relevantAuthors: ['Grant Osborne', 'Gordon Fee', 'Douglas Stuart', 'Sidney Greidanus'],
    cards: [
      card('preparar_tema_provavel', 'Tema provável', 'Nomeie o tema provável da passagem em uma frase simples e provisória.', 'Ajude-me a formular um tema provável para esta passagem, mantendo caráter provisório e observacional.'),
      card('preparar_grande_ideia_inicial', 'Grande ideia inicial', 'Escreva uma primeira hipótese da grande ideia do texto, antes da exegese formal.', 'Ajude-me a formular uma grande ideia inicial da passagem, deixando claro o que ainda precisa ser confirmado.'),
      card('preparar_estrutura_percebida', 'Estrutura percebida', 'Esboce as partes da passagem como você as percebe neste momento inicial, sem análise técnica.', 'Ajude-me a perceber uma estrutura inicial da passagem com base em movimentos visíveis do texto.'),
      card('preparar_vg_perguntas', 'Perguntas iniciais', 'Liste as perguntas que surgiram no primeiro contato. O que você ainda não entende? O que precisa de investigação?', 'Ajude-me a formular perguntas produtivas a partir do primeiro contato com esta passagem — perguntas que vão guiar a investigação.'),
      card('preparar_vg_dificuldades', 'Dificuldades percebidas', 'Registre termos obscuros, tensões não resolvidas, passagens difíceis e pontos que exigirão atenção especial.', 'Identifique as principais dificuldades interpretativas desta passagem que precisarão ser investigadas na próxima etapa.'),
    ],
  },
  {
    slug: 'investigar_visao_geral',
    title: 'Visão Geral Investigativa',
    shortTitle: 'Visão Geral',
    phase: 'interpretar',
    module: 'inventio',
    group: 'investigar_visao_geral',
    groupLabel: 'Descoberta exegética',
    order: -20,
    objective:
      'Registrar os achados da investigação contextual, textual e teológica — personagens, lugares, termos-chave, estrutura literária, movimento, clímax, temas teológicos e conexões canônicas.',
    keyQuestions: [
      'Que personagens, lugares e termos-chave a investigação revelou?',
      'Como a estrutura literária e o movimento do texto ficaram mais claros?',
      'Qual é o clímax confirmado após a análise?',
      'Que temas teológicos e conexões canônicas emergiram da investigação?',
    ],
    relevantAuthors: ['Grant Osborne', 'Gordon Fee', 'Douglas Stuart', 'D.A. Carson'],
    cards: [
      card('grande_ideia', 'Grande ideia', 'Formule a ideia central da passagem em uma frase completa, com sujeito e complemento.', 'Ajude-me a formular a grande ideia da passagem após a investigação exegética.'),
      card('verdades_centrais', 'Verdades centrais', 'Liste as principais verdades bíblicas e teológicas que emergem da investigação.', 'Identifique as verdades teológicas centrais desta passagem e explique como cada uma se desenvolve no texto.'),
      card('aplicacoes_principais', 'Aplicações principais', 'Registre aplicações principais que nascem diretamente do significado do texto.', 'Identifique as aplicações práticas e as conexões canônicas desta passagem — citações, alusões, paralelos e seu lugar na progressão da revelação bíblica.'),
    ],
  },
  {
    slug: 'ferramentas_visao_geral',
    title: 'Visão Geral das Ferramentas',
    shortTitle: 'Visão Geral',
    phase: 'ferramentas',
    module: 'inventio',
    group: 'ferramentas_visao_geral',
    groupLabel: 'Mapa das ferramentas disponíveis',
    order: 100,
    objective:
      'Ter uma visão panorâmica das ferramentas disponíveis e acessar rapidamente cada recurso: dicionário, texto original, teologia, colagens e pesquisa.',
    keyQuestions: [
      'Qual ferramenta é mais necessária neste momento do estudo?',
      'Que recurso complementa o que já foi investigado?',
    ],
    relevantAuthors: [],
    cards: [],
  },
  {
    slug: 'pregar_visao_geral',
    title: 'Visão Geral Homilética',
    shortTitle: 'Visão Geral',
    phase: 'comunicar',
    module: 'inventio',
    group: 'pregar_visao_geral',
    groupLabel: 'Síntese final para comunicação',
    order: 5,
    objective:
      'Consolidar a compreensão final do texto voltada para a comunicação — sintetizando a exegese em uma visão clara que orienta o sermão, estudo ou comentário.',
    keyQuestions: [
      'Qual é a mensagem central que você quer comunicar?',
      'Como a estrutura do texto sustenta essa mensagem?',
      'Que elementos da exegese são essenciais para a comunicação fiel?',
      'Como este texto aponta para Cristo e transforma os ouvintes?',
    ],
    relevantAuthors: ['Haddon Robinson', 'Bryan Chapell', 'Sidney Greidanus', 'Timothy Keller'],
    cards: [
      card('preparar_tema_provavel', 'Tema da comunicação', 'Formule o tema central da sua comunicação — a ideia que organizará o sermão ou estudo.', 'Ajude-me a formular o tema central para a comunicação com base em toda a investigação.'),
      card('preparar_grande_ideia_inicial', 'Grande ideia homilética', 'Escreva a grande ideia do texto voltada para a pregação: sujeito + complemento.', 'Ajude-me a formular a grande ideia homilética — sujeito e complemento — para a comunicação.'),
      card('preparar_estrutura_percebida', 'Estrutura da comunicação', 'Esboce como a estrutura do texto se traduz nos movimentos da sua comunicação.', 'Ajude-me a transformar a estrutura exegética em estrutura comunicativa.'),
      card('preparar_personagens', 'Pontos de identificação', 'Identifique personagens, situações ou conflitos que o ouvinte reconhece em sua própria vida.', 'Ajude-me a identificar pontos de identificação entre o texto e a vida dos ouvintes.'),
      card('preparar_movimento_narrativo', 'Movimento da mensagem', 'Descreva como sua comunicação se moverá do início ao fim.', 'Ajude-me a planejar o movimento da mensagem do início ao clímax.'),
      card('preparar_fluxo_argumentativo', 'Fluxo do argumento', 'Descreva como o argumento central se desenvolverá na comunicação.', 'Ajude-me a desenvolver o fluxo argumentativo da mensagem.'),
      card('preparar_climax', 'Clímax da comunicação', 'Identifique o momento de maior peso ou virada da sua comunicação.', 'Ajude-me a identificar o clímax da comunicação e como chegá-lo com força.'),
      card('preparar_palavras_repetidas', 'Termos e imagens centrais', 'Liste as palavras, imagens e termos que estruturarão a comunicação.', 'Ajude-me a selecionar os termos e imagens centrais para a comunicação fiel do texto.'),
    ],
  },
]
