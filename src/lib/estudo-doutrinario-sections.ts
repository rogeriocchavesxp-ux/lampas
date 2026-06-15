import type { SectionDef } from './workspace-sections'

function card(id: string, title: string, placeholder: string, aiTrigger: string) {
  return { id, title, placeholder, aiTrigger }
}

function doutrSection(
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

export const ESTUDO_DOUTRINARIO_SECTIONS: SectionDef[] = [

  // ── I. FUNDAMENTAÇÃO ────────────────────────────────────────────────────────

  doutrSection(
    'doutr_conceito',
    'Conceito',
    'Conceito',
    'preparar',
    'doutr_conceito_grp',
    'Conceito',
    200,
    'Estabelecer o nome, a definição preliminar, a importância e a pergunta orientadora da doutrina.',
    [
      'Qual o nome técnico desta doutrina e como a tradição a denomina?',
      'Como a doutrina pode ser definida em uma sentença precisa?',
      'Por que esta doutrina importa para a fé, a vida cristã e a saúde da Igreja?',
    ],
    ['Louis Berkhof', 'Herman Bavinck', 'Wayne Grudem', 'John Murray', 'R. C. Sproul', 'Michael Horton'],
    [
      card(
        'nome_doutrina',
        'Nome da Doutrina',
        'Qual o nome técnico desta doutrina? Há termos latinos, gregos ou alternativos que a tradição utiliza?\n\nExemplo: justificação → iustificatio; eleição → electio.',
        'Qual o nome técnico desta doutrina e quais denominações alternativas a tradição usa? Inclua termos latinos ou gregos relevantes e explique a etimologia ou origem histórica do termo principal.'
      ),
      card(
        'definicao_preliminar',
        'Definição Preliminar',
        'Em uma ou duas frases, defina provisoriamente a doutrina.\n\nEsta definição será refinada na Síntese Doutrinária.',
        'Formule uma definição preliminar e precisa desta doutrina — clara o suficiente para orientar o estudo, mas aberta ao refinamento conforme a investigação avança.'
      ),
      card(
        'importancia',
        'Importância da Doutrina',
        'Por que esta doutrina é importante?\n\nO que está em jogo se ela for mal compreendida, negada ou distorcida?',
        'Explique a importância desta doutrina para a fé cristã — o que ela protege, o que ela garante e o que está em jogo quando ela é negada, distorcida ou negligenciada.'
      ),
      card(
        'pergunta_orientadora',
        'Pergunta Orientadora',
        'Qual a pergunta central que este estudo doutrinário se propõe a responder?\n\nExemplo: "O que significa ser justificado diante de Deus?"',
        'Formule a pergunta orientadora central deste estudo doutrinário — a questão que sintetiza o problema teológico e orienta toda a investigação.'
      ),
    ]
  ),

  doutrSection(
    'doutr_fundbiblica',
    'Fundamentação Bíblica',
    'Fund. Bíblica',
    'preparar',
    'doutr_fundbiblica_grp',
    'Fundamentação Bíblica',
    201,
    'Reunir o ensino bíblico que fundamenta a doutrina — os principais textos, o testemunho do AT e NT, o ensino de Cristo e o ensino apostólico.',
    [
      'Quais textos bíblicos são fundamentais para o ensino desta doutrina?',
      'Como o AT prepara e o NT cumpre o ensino desta doutrina?',
      'O que o próprio Cristo ensina sobre esta realidade?',
    ],
    ['John Murray', 'D. A. Carson', 'Thomas Schreiner', 'Herman Ridderbos', 'F. F. Bruce'],
    [
      card(
        'principais_textos',
        'Principais Textos',
        'Liste os textos bíblicos mais importantes para o ensino desta doutrina — aqueles que qualquer formulação teológica deve considerar.',
        'Identifique os 6 a 10 textos bíblicos mais importantes para esta doutrina. Organize-os por relevância e explique brevemente por que cada um é decisivo.'
      ),
      card(
        'antigo_testamento',
        'Antigo Testamento',
        'O que o Antigo Testamento ensina sobre esta doutrina?\n\nComo ela é prometida, prefigurada ou estabelecida no AT?',
        'Sintetize o que o Antigo Testamento ensina sobre esta doutrina — como ela é prometida, prefigurada, tipologizada ou estabelecida antes de Cristo. Qual a contribuição do AT?'
      ),
      card(
        'novo_testamento',
        'Novo Testamento',
        'O que o Novo Testamento ensina sobre esta doutrina?\n\nComo o NT aprofunda, cumpre ou desenvolve o ensino veterotestamentário?',
        'Sintetize o que o Novo Testamento ensina sobre esta doutrina — como ela é cumprida, aprofundada e estabelecida à luz de Cristo e do Espírito. Qual a novidade do NT?'
      ),
      card(
        'ensino_cristo',
        'Ensino de Cristo',
        'O que Jesus especificamente ensina sobre esta doutrina?\n\nQuais palavras, parábolas ou ações do Senhor são mais determinantes?',
        'Reúna o que o próprio Cristo ensina sobre esta doutrina — seus discursos, parábolas e declarações que iluminam e definem esta realidade teológica.'
      ),
      card(
        'ensino_apostolico',
        'Ensino Apostólico',
        'Como os apóstolos — Paulo, João, Pedro, Tiago, o autor de Hebreus — desenvolvem e aplicam esta doutrina?',
        'Reúna o testemunho apostólico sobre esta doutrina — como cada apóstolo a ensina, fundamenta e aplica às comunidades cristãs. Há ênfases distintas entre os apóstolos?'
      ),
    ]
  ),

  doutrSection(
    'doutr_desenvolvredentivo',
    'Desenvolvimento Redentivo',
    'Desenv. Redentivo',
    'preparar',
    'doutr_desenvolvredentivo_grp',
    'Desenvolvimento Redentivo',
    202,
    'Mostrar como a doutrina se desenvolve ao longo da história da revelação — promessa, desenvolvimento, cumprimento em Cristo e aplicação à Igreja.',
    [
      'Como esta doutrina é prometida no começo da revelação?',
      'Como ela se desenvolve progressivamente ao longo do cânone?',
      'Onde encontra seu cumprimento em Cristo e sua aplicação na era da Igreja?',
    ],
    ['Geerhardus Vos', 'Graeme Goldsworthy', 'Peter Gentry', 'Stephen Wellum', 'Edmund Clowney'],
    [
      card(
        'promessa',
        'Promessa',
        'Como esta doutrina é prometida ou antecipada nos primeiros estágios da revelação bíblica?\n\nExemplo: a justificação prometida em Abraão (Gn 15:6).',
        'Identifique como esta doutrina é prometida, antecipada ou estabelecida nos estágios iniciais da revelação — na criação, na queda, nos patriarcas ou na lei de Moisés.'
      ),
      card(
        'desenvolvimento',
        'Desenvolvimento',
        'Como a doutrina se desenvolve progressivamente ao longo do AT — nos Profetas, nos Salmos, nas alianças e no avanço da revelação?',
        'Rastreie o desenvolvimento progressivo desta doutrina ao longo do AT — como ela se aprofunda, expande e clarifica através das alianças, dos profetas e dos textos sapienciais.'
      ),
      card(
        'cumprimento_cristo',
        'Cumprimento em Cristo',
        'Como esta doutrina encontra seu cumprimento pleno na pessoa e obra de Jesus Cristo?\n\nComo a encarnação, morte, ressurreição e ascensão iluminam esta doutrina?',
        'Explique como esta doutrina encontra seu cumprimento pleno em Cristo — como sua encarnação, vida perfeita, morte expiatória, ressurreição e exaltação definem e cumprem o ensino bíblico.'
      ),
      card(
        'aplicacao_igreja',
        'Aplicação à Igreja',
        'Como esta doutrina é aplicada à Igreja pela obra do Espírito Santo na era do novo pacto?',
        'Explique como esta doutrina é aplicada à Igreja — pelo Espírito Santo, pelos sacramentos, pela pregação da Palavra e pela vida comunitária do povo de Deus na era do novo pacto.'
      ),
    ]
  ),

  // ── II. SISTEMATIZAÇÃO ──────────────────────────────────────────────────────

  doutrSection(
    'doutr_relacoes',
    'Relações Doutrinárias',
    'Relações',
    'interpretar',
    'doutr_relacoes_grp',
    'Relações Doutrinárias',
    203,
    'Mapear as dependências e conexões entre esta doutrina e o restante da teologia sistemática.',
    [
      'Com quais outras doutrinas esta tem dependência lógica?',
      'O que acontece com a teologia sistemática se esta doutrina for negada?',
      'Como ela se conecta à soteriologia, cristologia, eclesiologia e escatologia?',
    ],
    ['Herman Bavinck', 'Louis Berkhof', 'Francis Turretin', 'John Murray', 'Joel Beeke'],
    [
      card(
        'doutrinas_relacionadas',
        'Doutrinas Relacionadas',
        'Liste as doutrinas mais diretamente relacionadas a esta.\n\nExemplo (justificação): União com Cristo, Fé, Regeneração, Santificação, Perseverança.',
        'Identifique as doutrinas sistemáticas mais diretamente relacionadas a esta — aquelas que co-dependem, pressupõem ou são iluminadas por ela. Organize-as por grau de proximidade.'
      ),
      card(
        'dependencias_teologicas',
        'Dependências Teológicas',
        'Que verdades teológicas esta doutrina pressupõe?\n\nO que é logicamente necessário para que esta doutrina faça sentido?',
        'Explique as dependências teológicas desta doutrina — quais outras doutrinas ela pressupõe como verdadeiras, e quais doutrinas dependem dela para sustentação lógica.'
      ),
      card(
        'conexoes_doutrinas',
        'Conexões Doutrinárias',
        'Como esta doutrina se conecta à cristologia, à soteriologia, à eclesiologia, à pneumatologia e à escatologia?',
        'Mapeie as conexões desta doutrina com os grandes loci da teologia sistemática — cristologia, soteriologia, pneumatologia, eclesiologia e escatologia. Onde as conexões são mais determinantes?'
      ),
    ]
  ),

  doutrSection(
    'doutr_historia',
    'História da Doutrina',
    'História',
    'interpretar',
    'doutr_historia_grp',
    'História da Doutrina',
    204,
    'Rastrear como esta doutrina foi compreendida, debatida e formulada ao longo da história da Igreja.',
    [
      'Como os Pais da Igreja compreenderam e transmitiram esta doutrina?',
      'Como a Reforma Protestante reformulou ou recuperou este ensino?',
      'Quais são os debates contemporâneos mais relevantes?',
    ],
    ['Richard Muller', 'Herman Bavinck', 'Francis Turretin', 'Joel Beeke', 'Philip Schaff'],
    [
      card(
        'igreja_antiga',
        'Igreja Antiga',
        'Como os Pais da Igreja (séculos I–V) compreenderam e ensinaram esta doutrina?\n\nHá concílios ou credos que a definiram ou defenderam?',
        'Rastreie como os Pais da Igreja compreenderam esta doutrina — Ireneu, Atanásio, Agostinho, Crisóstomo e outros. Há concílios ou credos que a definiram ou corrigiram?'
      ),
      card(
        'idade_media',
        'Idade Média',
        'Como a doutrina foi ensinada na Idade Média?\n\nHá desenvolvimentos escolásticos, distorções ou sínteses relevantes (Anselmo, Tomás, Duns Scotus)?',
        'Rastreie o ensino desta doutrina na Idade Média — os desenvolvimentos escolásticos (Anselmo, Pedro Lombardo, Tomás de Aquino), as sínteses e as possíveis distorções que a Reforma mais tarde corrigiria.'
      ),
      card(
        'reforma',
        'Reforma',
        'Como Lutero, Calvino, Zuínglio, Bucer e os reformadores ensinaram esta doutrina?\n\nO que foi recuperado, reformulado ou clarificado?',
        'Explique como a Reforma Protestante compreendeu esta doutrina — o que Lutero, Calvino e os outros reformadores ensinaram, recuperaram ou clarificaram em contraste com Roma.'
      ),
      card(
        'pos_reforma',
        'Pós-Reforma',
        'Como os teólogos da ortodoxia reformada (Turretin, Owen, Voetius, Witsius) desenvolveram e sistematizaram esta doutrina?',
        'Rastreie o desenvolvimento desta doutrina na ortodoxia reformada pós-Reforma — Turretin, Owen, Voetius, Witsius, os Símbolos confessionais. O que foi aprofundado, precisado ou consolidado?'
      ),
      card(
        'debates_contemporaneos',
        'Debates Contemporâneos',
        'Quais são os debates mais relevantes sobre esta doutrina nos séculos XX e XXI?\n\nHá revisões, ataques ou reformulações que o estudante deve conhecer?',
        'Identifique os debates contemporâneos mais relevantes sobre esta doutrina — revisões modernas, ataques liberais ou progressivos, a NPP (Nova Perspectiva sobre Paulo) se aplicável, e as respostas confessionais.'
      ),
    ]
  ),

  doutrSection(
    'doutr_controversias',
    'Controvérsias e Erros',
    'Controvérsias',
    'interpretar',
    'doutr_controversias_grp',
    'Controvérsias e Erros',
    205,
    'Identificar heresias históricas, interpretações equivocadas e debates atuais que ameaçam ou distorcem esta doutrina.',
    [
      'Quais heresias históricas negaram ou distorceram esta doutrina?',
      'Como erros contemporâneos se manifestam em relação a ela?',
      'Qual a avaliação bíblica e confessional de cada posição?',
    ],
    ['Francis Turretin', 'Herman Bavinck', 'R. C. Sproul', 'John Murray', 'Joel Beeke'],
    [
      card(
        'heresias_historicas',
        'Heresias Históricas',
        'Quais heresias ou erros históricos negaram, distorceram ou comprometeram esta doutrina?\n\nExemplo (justificação): pelagianismo, semi-pelagianismo, a posição tridentina.',
        'Identifique as principais heresias e erros históricos que negaram ou distorceram esta doutrina. Nomeie os movimentos, explique a posição e mostre o que está errado biblicamente.'
      ),
      card(
        'interpretacoes_equivocadas',
        'Interpretações Equivocadas',
        'Quais interpretações equivocadas — mesmo sem heresia formal — existem sobre esta doutrina?\n\nErros populares, confusões pastorais, mal-entendidos comuns.',
        'Liste interpretações equivocadas sobre esta doutrina que não chegam a heresia formal mas comprometem o entendimento correto — erros populares, confusões pastorais ou leituras superficiais.'
      ),
      card(
        'debates_atuais',
        'Debates Atuais',
        'Quais são os debates vivos na teologia contemporânea sobre esta doutrina?\n\nHá revisões dentro do próprio evangelicalismo que precisam ser avaliadas?',
        'Identifique os debates teológicos ativos sobre esta doutrina — dentro do evangelicalismo, no ecumenismo e na academia. O que está sendo revisto ou redefinido? Quais são os riscos?'
      ),
      card(
        'avaliacao_biblica',
        'Avaliação Bíblica',
        'Como a Escritura responde às heresias, erros e debates identificados?\n\nQual o critério escriturístico para avaliar essas posições?',
        'Ofereça uma avaliação bíblica e confessional das heresias, erros e debates identificados — mostrando como a Escritura e os Símbolos reformados respondem a cada posição.'
      ),
    ]
  ),

  doutrSection(
    'doutr_sintese',
    'Síntese Doutrinária',
    'Síntese',
    'interpretar',
    'doutr_sintese_grp',
    'Síntese Doutrinária',
    206,
    'Produzir uma formulação doutrinária clara, organizada e fiel à Escritura e à tradição reformada.',
    [
      'Qual a definição mais precisa e fiel desta doutrina após toda a investigação?',
      'Qual a grande afirmação doutrinária que resume o ensino bíblico?',
      'Quais os pontos essenciais que não podem ser comprometidos?',
    ],
    ['Louis Berkhof', 'Herman Bavinck', 'Francis Turretin', 'John Murray', 'Joel Beeke'],
    [
      card(
        'definicao_final',
        'Definição Final',
        'Definição refinada e definitiva da doutrina após toda a investigação bíblica, histórica e sistemática.',
        'Gere a definição final e refinada desta doutrina — integrando o fundamento bíblico, a precisão histórica e a formulação sistemática. Esta deve ser a definição de referência para uso pastoral e acadêmico.'
      ),
      card(
        'grande_afirmacao',
        'Grande Afirmação Doutrinária',
        'Em uma frase poderosa e memorável, qual a grande afirmação desta doutrina?\n\nExemplo: "O pecador é declarado justo diante de Deus somente pela graça, mediante a fé somente, com base somente na obra de Cristo."',
        'Formule a grande afirmação doutrinária desta doutrina — uma declaração clara, completa e memorável que captura o coração do ensino bíblico. Deve ser suficientemente rica para orientar pregação, ensino e defesa da fé.'
      ),
      card(
        'pontos_essenciais',
        'Pontos Essenciais',
        'Quais são os pontos essenciais e inegociáveis desta doutrina — aqueles cuja negação compromete a ortodoxia?',
        'Liste os pontos essenciais desta doutrina — os aspectos que constituem o núcleo inegociável do ensino bíblico e cuja negação representa afastamento da ortodoxia.'
      ),
      card(
        'pontos_secundarios',
        'Pontos Secundários',
        'Quais são os pontos secundários ou debates internos à tradição reformada sobre esta doutrina — onde há espaço para diferentes posições sem comprometer a ortodoxia?',
        'Identifique os pontos secundários desta doutrina — questões sobre as quais a tradição reformada tem diferentes posições sem comprometer a essência do ensino bíblico.'
      ),
      card(
        'resumo_executivo',
        'Resumo Executivo',
        'Em um parágrafo, sintetize toda a doutrina de modo claro, pastoral e acadêmico — integrando definição, fundamento bíblico, história e implicações.',
        'Gere um resumo executivo desta doutrina — um parágrafo denso e preciso que integra definição, fundamento bíblico, formulação histórica e implicações práticas. Deve ser utilizável em um dicionário teológico ou introdução pastoral.'
      ),
    ]
  ),

  // ── III. IMPLICAÇÕES ────────────────────────────────────────────────────────

  doutrSection(
    'doutr_implicacoes',
    'Implicações',
    'Implicações',
    'comunicar',
    'doutr_implicacoes_grp',
    'Implicações',
    207,
    'Aplicar a doutrina à vida, à Igreja, ao ministério e à missão — respondendo à pergunta: o que essa doutrina muda?',
    [
      'O que esta doutrina muda na compreensão de Deus, do homem e da salvação?',
      'Como ela deve moldar a vida e a prática da Igreja?',
      'Quais são as implicações pastorais e missionais mais urgentes?',
    ],
    ['John Murray', 'Herman Bavinck', 'J. I. Packer', 'Sinclair Ferguson', 'Joel Beeke'],
    [
      card(
        'impl_teologicas',
        'Implicações Teológicas',
        'Quais são as implicações desta doutrina para a compreensão de Deus, do homem, do pecado, da salvação e da criação?',
        'Explique as implicações teológicas desta doutrina — como ela ilumina e é iluminada pela teologia própria, pela antropologia, pela hamartiologia e pela soteriologia.'
      ),
      card(
        'impl_eclesiasticas',
        'Implicações Eclesiásticas',
        'Como esta doutrina deve moldar a vida, o culto, os sacramentos, o governo e a comunhão da Igreja?',
        'Explique as implicações eclesiásticas desta doutrina — como ela deve moldar o culto, a pregação, os sacramentos, o governo da Igreja, a disciplina e a vida comunitária do povo de Deus.'
      ),
      card(
        'impl_pastorais',
        'Implicações Pastorais',
        'Como esta doutrina deve ser ensinada, proclamada e aplicada na pregação, no aconselhamento e no discipulado?',
        'Aponte as implicações pastorais desta doutrina — como ela deve informar a pregação, o aconselhamento, o discipulado e o cuidado de almas. Como um pastor aplica esta verdade ao seu rebanho?'
      ),
      card(
        'impl_devocionais',
        'Implicações Devocionais',
        'Como esta doutrina alimenta a oração, a adoração, a gratidão e a vida devocional do crente?',
        'Explique como esta doutrina alimenta e transforma a vida devocional — a oração, a adoração, a gratidão, a confiança em Deus e a vida interior do crente reformado.'
      ),
      card(
        'impl_missionais',
        'Implicações Missionais',
        'Como esta doutrina molda a proclamação do Evangelho, a evangelização e o engajamento da Igreja com o mundo?',
        'Explique as implicações missionais desta doutrina — como ela molda a proclamação do Evangelho, a evangelização, o engajamento cultural e a missão integral da Igreja no mundo.'
      ),
    ]
  ),
]
