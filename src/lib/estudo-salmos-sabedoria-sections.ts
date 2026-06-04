import type { SectionDef } from './workspace-sections'

function card(id: string, title: string, placeholder: string, aiTrigger: string) {
  return { id, title, placeholder, aiTrigger }
}

export const ESTUDO_SALMOS_SABEDORIA_SECTIONS: SectionDef[] = [

  // ── Paralelismo Poético ──────────────────────────────────────────────────
  {
    slug: 'ss_paralelismo',
    title: 'Paralelismo Poético',
    shortTitle: 'Paralelismo',
    module: 'inventio',
    group: 'ss_paralelismo_grp',
    groupLabel: 'Paralelismo Poético',
    order: 500,
    objective:
      'Identificar o tipo de paralelismo dominante — sinônimo, antitético, sintético ou quiástico — e compreender como a estrutura bimembre (A / B) comunica a mensagem.',
    keyQuestions: [
      'Qual é o tipo de paralelismo predominante neste salmo ou poema?',
      'Como os dois membros de cada linha se relacionam — ecoam, contrastam ou avançam?',
      'Existe um quiasmo maior estruturando o poema?',
      'Que efeito retórico o paralelismo produz no leitor/ouvinte?',
    ],
    relevantAuthors: ['Robert Alter', 'Tremper Longman III', 'Bruce Waltke', 'James Kugel', 'Willem VanGemeren'],
    cards: [
      card('tipo_paralelismo', 'Tipo de paralelismo',
        'Identifique os tipos de paralelismo: sinônimo (A = B), antitético (A ≠ B), sintético (B avança A), quiástico (A B Bʹ Aʹ). Dê exemplos do texto.',
        'Identifique o tipo de paralelismo dominante neste texto e exemplifique com passagens específicas. Use Robert Alter ou Tremper Longman como referência.'),
      card('estrutura_bimembre', 'Estrutura bimembre',
        'Analise a relação entre os dois (ou três) membros das linhas mais importantes. Como B ilumina, contrasta ou completa A?',
        'Como a estrutura bimembre das linhas-chave deste poema funciona? Analise como B ilumina ou tensiona A em pelo menos três versos centrais.'),
      card('quiasmo', 'Quiasmo',
        'Existe uma estrutura quiástica maior? Identifique o pivô central e como as partes externas enquadram a mensagem.',
        'Existe um quiasmo estruturando este poema como um todo? Identifique o pivô central e mapeie a estrutura. Cite Alter, Alden ou Lund se relevante.'),
    ],
  },

  // ── Estrutura do Poema ───────────────────────────────────────────────────
  {
    slug: 'ss_estrutura',
    title: 'Estrutura do Poema',
    shortTitle: 'Estrutura',
    module: 'inventio',
    group: 'ss_estrutura_grp',
    groupLabel: 'Estrutura Poética',
    order: 501,
    objective:
      'Delimitar as estrofes, identificar o movimento do poema e o clímax emocional ou teológico — compreendendo como a forma serve o conteúdo.',
    keyQuestions: [
      'Como o poema está dividido em estrofes ou unidades?',
      'Qual é o movimento emocional ou argumental do início ao fim?',
      'Onde está o clímax — o ponto de maior peso ou virada?',
      'Há refrão, inclusio ou marcadores estruturais explícitos?',
    ],
    relevantAuthors: ['Tremper Longman III', 'Willem VanGemeren', 'Derek Kidner', 'Peter Craigie', 'Alec Motyer'],
    cards: [
      card('divisao_estrofes', 'Divisão em estrofes',
        'Delimite as estrofes ou unidades do poema com versículos. Que critérios (temáticos, sintáticos, refrão) você usou para delimitar?',
        'Como este poema se divide em estrofes ou unidades? Delimite com versículos e explique os critérios usados. Use Longman ou VanGemeren.'),
      card('movimento_poetico', 'Movimento do poema',
        'Descreva o arco emocional e teológico do poema: como ele se move do início ao final? Há virada, escalada, resolução?',
        'Qual é o movimento emocional e teológico deste poema? Como ele progride do início ao clímax e à resolução? Cite estudos do Saltério reformados.'),
      card('climax_poetico', 'Clímax',
        'Identifique o versículo ou estrofe que representa o clímax — o momento de maior peso, virada ou revelação.',
        'Onde está o clímax deste poema? Que versículo ou estrofe representa o ponto culminante — de maior tensão, revelação ou resolução?'),
    ],
  },

  // ── Imagística e Metáforas ───────────────────────────────────────────────
  {
    slug: 'ss_imagistica',
    title: 'Imagística e Metáforas',
    shortTitle: 'Imagística',
    module: 'inventio',
    group: 'ss_imagistica_grp',
    groupLabel: 'Imagística e Metáforas',
    order: 502,
    objective:
      'Identificar e interpretar as imagens, metáforas, símiles e figuras de linguagem que formam o vocabulário poético do texto.',
    keyQuestions: [
      'Que imagens dominantes estruturam o poema (pastor, rei, guerra, natureza)?',
      'Como as metáforas funcionam — que verdades elas iluminam?',
      'Que campo semântico predomina (natureza, batalha, templo, jornada)?',
      'Como as imagens conectam este poema com outras partes da Escritura?',
    ],
    relevantAuthors: ['Robert Alter', 'Tremper Longman III', 'C. Hassell Bullock', 'Michael Travers'],
    cards: [
      card('imagens_centrais', 'Imagens centrais',
        'Liste as principais imagens, metáforas e símiles do poema. Para cada uma, explique o que ela ilumina sobre Deus, o homem ou a situação.',
        'Quais são as imagens e metáforas centrais deste poema? Para cada uma, explique o que ela comunica sobre Deus, o homem ou a situação descrita.'),
      card('campo_semantico', 'Campo semântico dominante',
        'Que campo semântico prevalece (militar, pastoral, real, cultual, jornada)? Como ele enquadra a leitura do poema como um todo?',
        'Qual é o campo semântico dominante neste poema? Como esse enquadramento imagético molda a interpretação da mensagem teológica?'),
      card('intertextualidade', 'Conexões canônicas',
        'As imagens deste poema ecoam outros textos bíblicos? Que tradições (Êxodo, Davi, Criação, Aliança) são evocadas pelas imagens?',
        'As imagens deste poema ecoam textos ou tradições bíblicas? Identifique conexões canônicas relevantes — Êxodo, Davi, Criação, Sião.'),
    ],
  },

  // ── Temas e Questões ─────────────────────────────────────────────────────
  {
    slug: 'ss_temas_sabedoria',
    title: 'Temas e Questões',
    shortTitle: 'Temas',
    module: 'inventio',
    group: 'ss_temas_grp',
    groupLabel: 'Temas e Questões',
    order: 503,
    objective:
      'Identificar os temas teológicos centrais e, no caso da literatura sapiencial, as questões existenciais que o texto endereça.',
    keyQuestions: [
      'Qual é o tema teológico central?',
      'Que questão existencial ou pastoral o texto endereça?',
      'Como o sofrimento, a dúvida ou o louvor são tratados?',
      'Qual a tensão principal do poema e como ela é (ou não) resolvida?',
    ],
    relevantAuthors: ['Tremper Longman III', 'Roland Murphy', 'Raymond Van Leeuwen', 'Derek Kidner', 'Duane Garrett'],
    cards: [
      card('tema_central', 'Tema teológico central',
        'Articule o tema central em uma frase. O que este poema ensina sobre Deus, sobre o homem ou sobre a vida com Deus?',
        'Qual é o tema teológico central deste poema? Articule em uma frase clara o que ele ensina sobre Deus, o homem ou a experiência da fé.'),
      card('questao_existencial', 'Questão existencial',
        'Que questão profunda este texto endereça — sofrimento, dúvida, injustiça, morte, louvor, sabedoria? Como o autor a enquadra?',
        'Que questão existencial ou pastoral central este texto endereça? Como o autor a enquadra e qual é sua resposta teológica?'),
      card('tensao_resolucao', 'Tensão e resolução',
        'Qual é a tensão principal do poema? Ela é resolvida? Como? O que fica em aberto?',
        'Qual é a tensão central deste poema e como ela é (ou não) resolvida? O que a resolução revela sobre a perspectiva teológica do autor?'),
    ],
  },

  // ── Teologia da Adoração ─────────────────────────────────────────────────
  {
    slug: 'ss_teologia_adoracao',
    title: 'Teologia da Adoração',
    shortTitle: 'Teologia',
    module: 'inventio',
    group: 'ss_teologia_grp',
    groupLabel: 'Teologia da Adoração',
    order: 504,
    objective:
      'Identificar o que o texto revela sobre Deus, sobre a relação do crente com Ele, e como isso alimenta a adoração e a vida devocional.',
    keyQuestions: [
      'O que este texto revela sobre o caráter ou os atos de Deus?',
      'Como o poeta se relaciona com Deus — com confiança, lamento, ação de graças, súplica?',
      'Que verdade sobre Deus sustenta o poema mesmo na tensão ou no sofrimento?',
      'Como este texto aponta para Cristo ou encontra seu cumprimento nEle?',
    ],
    relevantAuthors: ['Tremper Longman III', 'Willem VanGemeren', 'Geoffrey Grogan', 'Geerhardus Vos', 'Patrick Miller'],
    cards: [
      card('revelacao_de_deus', 'O que revela sobre Deus',
        'Que atributos, atos ou nomes de Deus este texto celebra, implora ou pressupõe? Seja específico — cite versículos.',
        'Que atributos ou atos de Deus este texto revela, celebra ou pressupõe? Analise versículos específicos com precisão teológica.'),
      card('relacao_crente', 'A relação do crente com Deus',
        'Como o salmista ou sábio se relaciona com Deus neste texto? Que postura de fé (confiança, lamento, louvor, arrependimento) é demonstrada?',
        'Como o autor se posiciona diante de Deus neste poema? Que postura de fé — lamento, confiança, louvor, arrependimento — é demonstrada?'),
      card('cristologia', 'Conexão com Cristo',
        'Como este texto aponta para Cristo — tipologicamente, profeticamente ou tematicamente? Como o NT cita ou aplica este poema?',
        'Como este poema aponta para Cristo? Cite usos neotestamentários e explique como o cumprimento em Cristo enriquece a interpretação.'),
    ],
  },
]
