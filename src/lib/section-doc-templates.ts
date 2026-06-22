// Templates HTML ricos para o editor Rich Text (docMode).
// Exibidos apenas quando a seção não tem conteúdo salvo.
// Cada template serve como roteiro metodológico — o usuário escreve
// abaixo dos títulos, substitui ou remove o que não precisar.

function h2(text: string) { return `<h2>${text}</h2>` }
function guide(text: string) { return `<blockquote><p>${text}</p></blockquote>` }
function p() { return `<p></p>` }
const hr = `<hr>`

function section(heading: string, question: string): string {
  return h2(heading) + guide(question) + p() + hr
}

function sectionList(heading: string, question: string, items: string[]): string {
  const list = `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`
  return h2(heading) + guide(question) + list + p() + hr
}

// ─── Preparar ─────────────────────────────────────────────────────────────────

const preparacao_espiritual = [
  h2('Oração'),
  guide('Escreva uma oração honesta antes de estudar. Inclua dependência de Deus, adoração, confissão e disposição para ouvir a Palavra.'),
  p(), hr,
  h2('Objetivo do Estudo'),
  guide('Por que você está estudando esta passagem agora? Que fruto pastoral espera desse processo?'),
  p(), hr,
  h2('Ocasião e Público'),
  guide('Descreva o contexto de comunicação, o perfil dos ouvintes e o ambiente ministerial.'),
  p(),
].join('')

const preparar_leia_assimile = [
  h2('Primeira leitura'),
  guide('Registre o que chamou atenção no primeiro contato com o texto. Palavras, imagens, emoções.'),
  p(), hr,
  h2('Comparação de traduções'),
  guide('Compare diferentes versões e registre diferenças relevantes sem resolver tudo tecnicamente ainda.'),
  p(), hr,
  h2('Ideia central provisória'),
  guide('Escreva em linguagem provisória qual parece ser a ideia central desta passagem.'),
  p(), hr,
  h2('Tensões e repetições'),
  guide('Liste tensões, contrastes, palavras repetidas, emoções dominantes e movimentos do texto.'),
  p(),
].join('')

// ─── Investigar — Contextual ──────────────────────────────────────────────────

const contexto_historico = [
  section('Autor', 'Quem escreveu este texto?'),
  section('Data', 'Quando foi escrito? Em que período histórico?'),
  section('Destinatários', 'Quem recebeu originalmente este texto? Qual era sua situação?'),
  section('Situação Histórica', 'Qual circunstância motivou a escrita? Qual o problema ou necessidade que o texto responde?'),
  sectionList('Aspectos culturais relevantes', 'O que o leitor moderno normalmente desconhece sobre esse contexto?', [
    'Estrutura social (honra-vergonha, patronato, família)',
    'Práticas religiosas do período',
    'Contexto político e econômico',
    'Costumes e usos da época',
  ]),
  h2('Impacto para os primeiros ouvintes'),
  guide('Como esse contexto histórico influencia a interpretação do texto?'),
  p(),
].join('')

const autor_destinatarios = [
  section('Autor', 'Quem escreveu? Há questões de autoria relevantes?'),
  section('Destinatários', 'Quem são os destinatários? Qual era sua situação específica?'),
  section('Ocasião da escrita', 'O que motivou a composição deste texto? Qual crise, pedido ou necessidade?'),
  section('Propósito declarado', 'O autor declara explicitamente seu objetivo? Onde no texto?'),
  section('Propósito implícito', 'Há um propósito subjacente além do declarado?'),
  sectionList('Gênero literário', 'Em que gênero literário este texto se enquadra? Quais são as implicações hermenêuticas?', [
    'Gênero do livro',
    'Gênero da perícope',
    'Implicações para a interpretação',
  ]),
  h2('Resposta esperada do autor'),
  guide('Que resposta o autor esperava de seus leitores após ler este texto?'),
  p(),
].join('')

const estrutura_livro = [
  section('Esboço estrutural do livro', 'Quais são as grandes divisões do livro?'),
  section('Localização da perícope', 'Em qual seção do livro esta perícope se encontra? Como ela avança o argumento?'),
  section('Argumento central do livro', 'Qual é a tese ou argumento central que o autor desenvolve?'),
  section('Conexão com o contexto imediato', 'Como esta passagem se conecta com o que vem antes e depois?'),
  section('Relações canônicas', 'Como esta perícope se relaciona com o restante da Escritura? Há paralelos, antecipações ou cumprimentos?'),
  h2('Contribuição para o argumento'),
  guide('Qual é a contribuição específica desta perícope para o argumento maior do livro?'),
  p(),
].join('')

// ─── Investigar — Textual ─────────────────────────────────────────────────────

const texto_original = [
  h2('Texto Hebraico / Grego'),
  guide('Insira ou analise o texto original da perícope.'),
  p(), hr,
  h2('Tradução Literal'),
  guide('Produza uma tradução o mais próxima possível do texto original, priorizando precisão sobre fluência.'),
  p(), hr,
  sectionList('Observações Gramaticais', 'Destaque os elementos gramaticais mais relevantes para a interpretação.', [
    'Verbos principais — tempo, voz, modo',
    'Conectivos e partículas',
    'Particípios e suas relações',
    'Estruturas condicionais',
    'Paralelismos e quiasmos',
    'Sintaxe e ordem das palavras',
  ]),
  section('Palavras relevantes', 'Quais termos merecem investigação posterior no léxico ou na teologia bíblica?'),
  h2('Primeiras conclusões'),
  guide('Que aspectos do texto original chamam mais atenção? O que o original revela que as traduções podem ocultar?'),
  p(),
].join('')

const defesa_pericope = [
  section('Limites da perícope', 'Onde começa e termina esta unidade literária? Justifique com evidências textuais.'),
  sectionList('Marcadores de delimitação', 'Quais elementos textuais confirmam os limites propostos?', [
    'Conectivos (δέ, γάρ, οὖν, וְ, כִּי)',
    'Mudança de sujeito ou cenário',
    'Vocabulário específico',
    'Partículas de transição',
    'Inclusio ou simetria estrutural',
  ]),
  section('Tradução própria', 'Registre sua tradução e as principais decisões tomadas.'),
  sectionList('Observações gramaticais e sintáticas', 'Destaque os elementos gramaticais que sustentam a leitura proposta.', [
    'Verbos e sua relevância',
    'Estruturas sintáticas importantes',
    'Ambiguidades e como resolvê-las',
  ]),
  h2('Conclusão exegética'),
  guide('O que essas observações estabelecem para a interpretação desta perícope?'),
  p(),
].join('')

const comentario_exegetico = [
  h2('Estrutura do argumento'),
  guide('Qual é a progressão argumentativa ou narrativa desta perícope? Identifique os blocos principais.'),
  p(), hr,
  h2('Comentário versículo por versículo'),
  guide('Explique o texto em sequência, destacando gramática, vocabulário, estrutura e ênfases.'),
  p(), hr,
  section('Relações internas', 'Como as partes do texto se relacionam entre si? Há paralelismo, contraste, progressão?'),
  section('Tensões presentes', 'Que tensões ou paradoxos o texto contém? Como devem ser interpretados?'),
  section('Questões interpretativas', 'Que questões exegéticas precisam ser resolvidas? Qual é a posição mais defensável?'),
  h2('Conclusão exegética'),
  guide('Qual é a ideia central que emerge da análise detalhada deste texto?'),
  p(),
].join('')

const mensagem_epoca_escrita = [
  section('Mensagem original', 'O que Deus estava comunicando aos primeiros destinatários?'),
  section('Problema sendo tratado', 'Qual necessidade, erro ou situação o texto responde?'),
  section('Verdade sendo ensinada', 'Qual verdade teológica o autor quer que seus leitores compreendam?'),
  section('Como os primeiros ouvintes entenderiam', 'Como o contexto histórico-cultural moldava a recepção desta mensagem?'),
  h2('Formulação da mensagem original'),
  guide('Formule em uma ou duas sentenças a mensagem que Deus comunicou aos primeiros destinatários.'),
  p(),
].join('')

const estrutura_literaria = [
  section('Gênero e subgênero', 'Em que gênero literário este texto se enquadra? Quais são suas convenções?'),
  section('Estrutura interna', 'Como o texto está organizado? Esboce a estrutura visualmente.'),
  sectionList('Recursos literários', 'Que recursos literários o autor utiliza?', [
    'Paralelismo (sinônimo, antitético, sintético)',
    'Quiasmo',
    'Inclusio',
    'Repetição e palavras-gancho',
    'Ironia ou paradoxo',
    'Metáfora e símile',
    'Progressão narrativa',
  ]),
  section('Clímax e ênfase', 'Onde está o ponto de maior tensão ou ênfase? O que recebe destaque estrutural?'),
  h2('Implicações para a pregação'),
  guide('Como a estrutura literária informa a forma que o sermão ou comunicação deve assumir?'),
  p(),
].join('')

// ─── Investigar — Teológico ───────────────────────────────────────────────────

const teologia_biblica = [
  section('Tema teológico central', 'Qual tema ou verdade teológica esta passagem desenvolve?'),
  sectionList('Progressão canônica', 'Como esse tema se desenvolve ao longo da história da redenção?', [
    'Antigo Testamento — promessa, tipo, sombra',
    'Ministério de Cristo — cumprimento',
    'Epístolas apostólicas — aplicação',
    'Escatologia — consumação',
  ]),
  section('Lugar na história da redenção', 'Em que ponto da história da redenção esta passagem está situada?'),
  section('Conexão com Cristo', 'Como esta passagem aponta para ou é cumprida em Jesus Cristo?'),
  h2('Síntese teológica'),
  guide('Que verdade bíblico-teológica esta passagem contribui para o quadro geral da revelação?'),
  p(),
].join('')

const teologia_sistematica = [
  section('Loci teológicos relevantes', 'A quais doutrinas sistemáticas esta passagem contribui?'),
  section('Formulação doutrinária', 'Como esta passagem sustenta ou enriquece a formulação de uma doutrina específica?'),
  section('Fontes da tradição', 'Como os reformados e confessões históricas interpretaram esta passagem?'),
  section('Tensões e debates', 'Há debates teológicos em torno desta passagem? Qual a posição mais fiel ao texto?'),
  h2('Implicações para a doutrina'),
  guide('Que contribuição esta passagem traz para a teologia sistemática da comunidade?'),
  p(),
].join('')

const teologia_pratica = [
  section('Aplicações pessoais', 'Como esta verdade transforma o coração, a mente e a vida do crente?'),
  section('Aplicações comunitárias', 'Como esta verdade deve moldar a vida da comunidade de fé?'),
  section('Aplicações pastorais', 'Que orientação pastoral emerge desta passagem?'),
  section('Desafios e resistências', 'Que obstáculos à aplicação o pregador deve antecipar?'),
  h2('A exigência do texto'),
  guide('O que este texto exige do ouvinte? Qual a transformação que ele produz quando recebido com fé?'),
  p(),
].join('')

const contexto_canonico = [
  section('Lugar no cânone', 'Em que parte do cânone esta passagem está? Qual o seu papel na Escritura como um todo?'),
  section('Relações intertextuais', 'Quais outros textos da Escritura iluminam ou são iluminados por esta passagem?'),
  section('Citações e alusões', 'Esta passagem cita ou alude a outras partes da Escritura? Qual o efeito interpretativo?'),
  section('Cumprimento e antecipação', 'Esta passagem cumpre algo anterior ou antecipa algo posterior na história redentora?'),
  h2('Contribuição canônica'),
  guide('Qual é a contribuição única desta passagem para o conjunto do testemunho canônico?'),
  p(),
].join('')

const progressao_revelacional = [
  sectionList('Promessa — Antigo Testamento', 'Como o Antigo Testamento prepara para esta verdade?', [
    'Tipos e sombras',
    'Promessas explícitas',
    'Antecipações implícitas',
  ]),
  section('Cumprimento — Cristo', 'Como Jesus cumpre, aprofunda ou transforma esta verdade em seu ministério?'),
  section('Aplicação — Epístolas', 'Como os apóstolos aplicam esta verdade à vida da Igreja?'),
  section('Consumação — Escatologia', 'Como esta verdade será completamente realizada na nova criação?'),
  h2('Arco redentor'),
  guide('Descreva o arco completo desta verdade desde a criação até a nova criação.'),
  p(),
].join('')

const sintese = [
  section('Propósito do texto', 'O que Deus queria comunicar aos primeiros destinatários por meio desta passagem?'),
  section('Ideia central', 'Formule a ideia central da passagem em uma sentença precisa.'),
  section('Estrutura do argumento', 'Como o texto desenvolve e defende essa ideia central?'),
  section('Implicações teológicas', 'Que verdades sobre Deus, o homem, a salvação ou a vida cristã emergem?'),
  section('Ponte para hoje', 'Como a mensagem original alcança o ouvinte contemporâneo?'),
  h2('Declaração final da mensagem'),
  guide('Escreva a declaração da mensagem que levará do texto para o sermão ou comunicação.'),
  p(),
].join('')

// ─── Pregar ───────────────────────────────────────────────────────────────────

const grande_ideia_homiletica = [
  section('Grande Ideia Exegética', 'O que o texto diz em termos exegéticos? (sujeito + complemento)'),
  section('Grande Ideia Homilética', 'O que o sermão dirá em termos contemporâneos? (sujeito + complemento)'),
  section('Propósito do sermão', 'O que você quer que os ouvintes saibam, acreditem ou façam após o sermão?'),
  sectionList('Validação', 'A Grande Ideia Homilética...', [
    'Reflete fielmente o que o texto afirma?',
    'É enunciada em linguagem contemporânea?',
    'Pode ser sustentada completamente pelo texto?',
    'Orienta toda a estrutura do sermão?',
  ]),
  h2('Formulação final'),
  guide('Escreva a forma definitiva da Grande Ideia Homilética do sermão.'),
  p(),
].join('')

const introducao_sermao = [
  section('Gancho de abertura', 'Como capturar a atenção imediatamente? (história, pergunta, estatística, citação, imagem)'),
  section('Identificação da necessidade', 'Que necessidade, tensão ou problema a introdução revela no ouvinte?'),
  section('Transição para o texto', 'Como passar naturalmente da introdução para o texto bíblico?'),
  section('Anúncio do tema', 'Como apresentar a Grande Ideia sem revelar toda a estrutura prematuramente?'),
  h2('Texto e rascunho'),
  guide('Escreva o texto completo da introdução.'),
  p(),
].join('')

const divisoes_sermao = [
  h2('Estrutura geral'),
  guide('Defina a estrutura principal do sermão. Quantas divisões principais? Qual o movimento lógico?'),
  p(), hr,
  h2('Divisão I'),
  guide('Ideia principal — exposição do texto — aplicação parcial'),
  p(), hr,
  h2('Divisão II'),
  guide('Ideia principal — exposição do texto — aplicação parcial'),
  p(), hr,
  h2('Divisão III'),
  guide('Ideia principal — exposição do texto — aplicação parcial'),
  p(), hr,
  h2('Avaliação da estrutura'),
  guide('A estrutura reflete o movimento do texto? Cada divisão avança a Grande Ideia?'),
  p(),
].join('')

const aplicacao = [
  section('Princípio atemporal', 'Que princípio universal emerge do contexto histórico original?'),
  sectionList('Destinatários da aplicação', 'Quais grupos específicos de ouvintes são alcançados por esta verdade?', [
    'Crentes maduros',
    'Crentes iniciantes',
    'Pessoas em crise',
    'Não crentes / buscadores',
    'Família e relacionamentos',
    'Comunidade eclesial',
  ]),
  section('Aplicações pessoais', 'Como esta verdade transforma o interior — coração, mente, desejos?'),
  section('Aplicações práticas', 'Que ações concretas esta verdade exige?'),
  section('Resistências anticipadas', 'Que objeções ou obstáculos o pregador deve enfrentar?'),
  h2('Apelo final'),
  guide('Como convidar o ouvinte a responder a esta verdade com fé e obediência?'),
  p(),
].join('')

const conclusao_sermao = [
  section('Resumo da mensagem', 'Como recapitular a Grande Ideia sem repetir o sermão inteiro?'),
  section('Apelo central', 'Qual é o apelo definitivo do sermão? O que você está pedindo ao ouvinte?'),
  section('Imagem de fechamento', 'Que ilustração, história ou imagem sela a mensagem na memória?'),
  section('Conexão com Cristo', 'Como a conclusão aponta para a graça e a obra de Jesus?'),
  h2('Texto completo da conclusão'),
  guide('Escreva a conclusão completa, incluindo a oração final se houver.'),
  p(),
].join('')

// ─── Estudo Temático ──────────────────────────────────────────────────────────

const et_definicao = [
  section('Nome e campo semântico', 'Qual o nome técnico do tema? Como os termos bíblicos hebraico/grego o expressam?'),
  section('Definição preliminar', 'Formule uma definição inicial baseada nos termos bíblicos, antes de examinar o cânone completo.'),
  section('Importância', 'Por que este tema importa para a fé, a vida cristã e a saúde da Igreja?'),
  section('Delimitação e escopo', 'Quais aspectos do tema serão investigados? O que está fora do escopo desta pesquisa?'),
  h2('Pergunta orientadora'),
  guide('Formule a pergunta central que este estudo temático busca responder.'),
  p(),
].join('')

const et_at = [
  sectionList('Período patriarcal e Pentateuco', 'Como o Antigo Testamento introduz este tema nos primeiros livros?', [
    'Gênesis — origem e fundamento',
    'Êxodo e legislação mosaica',
    'Textos-chave e sua relevância',
  ]),
  sectionList('Livros históricos e poéticos', 'Como o tema se desenvolve na história de Israel e na poesia?', [
    'Livros históricos — casos e exemplos',
    'Salmos e literatura sapiencial',
    'Contribuição específica',
  ]),
  sectionList('Profetas', 'Como os profetas desenvolvem, aprofundam ou problematizam este tema?', [
    'Profetas maiores',
    'Profetas menores',
    'Horizonte escatológico',
  ]),
  h2('Síntese do Antigo Testamento'),
  guide('Como o Antigo Testamento como um todo apresenta, desenvolve e aponta para este tema?'),
  p(),
].join('')

const et_nt = [
  sectionList('Evangelhos', 'Como Jesus aborda ou cumpre este tema em seu ministério?', [
    'Ensinos diretos',
    'Ações e milagres',
    'Cumprimento de promessas',
  ]),
  sectionList('Cartas apostólicas', 'Como Paulo e os outros apóstolos desenvolvem este tema para a Igreja?', [
    'Cartas paulinas',
    'Cartas gerais (Tiago, Pedro, João, Hebreus)',
    'Aplicações práticas',
  ]),
  section('Cumprimento escatológico', 'Como o tema encontra seu cumprimento definitivo na consumação do reino?'),
  h2('Síntese do Novo Testamento'),
  guide('Como o Novo Testamento aprofunda, cumpre e aplica este tema para a vida da Igreja?'),
  p(),
].join('')

const et_sintese_canonica = [
  section('Progressão canônica', 'Como este tema se desenvolve da criação à nova criação?'),
  section('Cristo como centro', 'Como toda a progressão temática converge em Jesus Cristo?'),
  section('Unidade canônica', 'Como os dois Testamentos se relacionam em torno deste tema?'),
  h2('Formulação sintética'),
  guide('Escreva uma formulação sintética que capture o arco canônico completo deste tema.'),
  p(),
].join('')

const et_teologia_sistematica = [
  section('Relação com outros loci', 'A quais outras doutrinas este tema se conecta? Como se relacionam?'),
  section('Formulação doutrinária', 'Como as confissões e os teólogos reformados formularam esta doutrina?'),
  section('Debates históricos', 'Que controvérsias existiram em torno deste tema? Quais as posições principais?'),
  h2('Formulação própria'),
  guide('Formule sua própria declaração doutrinária sobre este tema a partir do estudo realizado.'),
  p(),
].join('')

const et_aplicacoes = [
  section('Implicações para a vida cristã', 'Como este tema deve transformar a vida individual do crente?'),
  section('Implicações para a vida eclesial', 'Como este tema molda a adoração, a comunhão e o discipulado da Igreja?'),
  section('Implicações missionais', 'Como este tema informa e energiza a missão da Igreja no mundo?'),
  h2('Conclusão aplicada'),
  guide('Qual é a exigência prática central que este estudo temático coloca sobre a comunidade de fé?'),
  p(),
].join('')

// ─── Estudo Doutrinário ───────────────────────────────────────────────────────

const doutr_conceito = [
  section('Nome e terminologia', 'Qual é o nome técnico desta doutrina? Como a tradição reformada a denomina?'),
  section('Definição preliminar', 'Formule uma definição inicial precisa desta doutrina em uma sentença.'),
  section('Importância', 'Por que esta doutrina é essencial para a fé, a vida cristã e a saúde da Igreja?'),
  section('Pergunta orientadora', 'Qual é a questão central que este estudo doutrinário busca responder?'),
  h2('Escopo do estudo'),
  guide('Delimite o que será investigado e o que está fora do escopo desta pesquisa.'),
  p(),
].join('')

const doutr_fundbiblica = [
  section('Textos primários', 'Quais textos bíblicos sustentam diretamente esta doutrina?'),
  section('Textos secundários', 'Quais textos apoiam ou iluminam indiretamente esta doutrina?'),
  sectionList('Análise exegética dos principais textos', 'Examine os textos mais relevantes:', [
    'Texto 1 — exegese e contribuição doutrinária',
    'Texto 2 — exegese e contribuição doutrinária',
    'Texto 3 — exegese e contribuição doutrinária',
  ]),
  section('Progressão canônica', 'Como esta doutrina se revela progressivamente ao longo de toda a Escritura?'),
  h2('Síntese bíblica'),
  guide('O que a Escritura como um todo ensina sobre esta doutrina?'),
  p(),
].join('')

const doutr_desenvolvredentivo = [
  section('Antigo Testamento — promessa e tipo', 'Como a doutrina aparece em forma de promessa, tipo ou sombra no AT?'),
  section('Ministério de Cristo — cumprimento', 'Como Jesus cumpre, aprofunda ou revela definitivamente esta doutrina?'),
  section('Epístolas apostólicas — formulação', 'Como os apóstolos formulam e aplicam esta doutrina para a Igreja?'),
  section('Escatologia — consumação', 'Como esta doutrina será plenamente realizada na nova criação?'),
  h2('Arco redentor'),
  guide('Descreva o desenvolvimento desta doutrina desde a criação até a consumação.'),
  p(),
].join('')

const doutr_relacoes = [
  section('Relação com a doutrina de Deus', 'Como esta doutrina depende ou expressa os atributos e obras de Deus?'),
  section('Relação com a cristologia', 'Como esta doutrina se conecta com a pessoa e obra de Cristo?'),
  section('Relação com a soteriologia', 'Como esta doutrina se relaciona com a salvação?'),
  section('Relação com a eclesiologia', 'Que implicações esta doutrina tem para a vida e missão da Igreja?'),
  h2('Coerência sistemática'),
  guide('Como esta doutrina se encaixa harmoniosamente no sistema teológico reformado?'),
  p(),
].join('')

const doutr_historia = [
  section('Formulação patrística', 'Como os Pais da Igreja compreenderam e debateram esta doutrina?'),
  section('Desenvolvimento medieval', 'Como a Escolástica desenvolveu ou distorceu esta doutrina?'),
  section('Contribuição da Reforma', 'Como os Reformadores reafirmaram e clarificaram esta doutrina?'),
  section('Formulação confessional', 'Como as confissões reformadas (Westminster, Belga, Heidelberg) a formulam?'),
  h2('Desenvolvimentos modernos'),
  guide('Como a teologia moderna tratou esta doutrina? Que desafios contemporâneos ela enfrenta?'),
  p(),
].join('')

const doutr_controversias = [
  section('Principais controvérsias históricas', 'Que debates históricos existiram em torno desta doutrina?'),
  section('Posições divergentes', 'Quais posições alternativas existem? Quais são seus argumentos?'),
  section('Avaliação crítica', 'Por que as posições alternativas são insuficientes ou incorretas?'),
  section('Definição dos limites', 'Quais posições estão dentro e quais estão fora da ortodoxia reformada?'),
  h2('Defesa da posição'),
  guide('Apresente a defesa positiva da posição confessional reformada diante das controvérsias.'),
  p(),
].join('')

const doutr_sintese = [
  section('Formulação doutrinária final', 'Enuncie esta doutrina em linguagem clara, precisa e fiel às confissões.'),
  section('Fundamento bíblico sintético', 'Quais textos-chave sustentam esta formulação?'),
  section('Coerência com a tradição', 'Como esta formulação se alinha com a tradição reformada?'),
  h2('Declaração confessional própria'),
  guide('Escreva sua declaração doutrinária pessoal sobre este tema, em linguagem confessional.'),
  p(),
].join('')

const doutr_implicacoes = [
  section('Implicações para a adoração', 'Como esta doutrina deve moldar a forma como adoramos?'),
  section('Implicações para o discipulado', 'Como esta doutrina deve transformar a vida e o caráter do crente?'),
  section('Implicações pastorais', 'Como esta doutrina orienta o cuidado pastoral e o aconselhamento?'),
  section('Implicações missionais', 'Como esta doutrina informa e motiva a missão da Igreja no mundo?'),
  h2('Apelo prático'),
  guide('Qual é a exigência prática central que esta doutrina coloca sobre a comunidade de fé?'),
  p(),
].join('')

// ─── Mapa de slug → template ──────────────────────────────────────────────────

export const SECTION_DOC_TEMPLATES: Record<string, string> = {
  // Preparar
  preparacao_espiritual,
  preparar_leia_assimile,

  // Investigar — Contextual
  contexto_historico,
  autor_destinatarios,
  estrutura_livro,

  // Investigar — Textual
  texto_original,
  defesa_pericope,
  comentario_exegetico,
  mensagem_epoca_escrita,
  estrutura_literaria,

  // Investigar — Teológico
  teologia_biblica,
  teologia_sistematica,
  teologia_pratica,
  contexto_canonico,
  progressao_revelacional,
  sintese,

  // Pregar
  grande_ideia_homiletica,
  introducao_sermao,
  divisoes_sermao,
  aplicacao,
  conclusao_sermao,

  // Estudo Temático
  et_definicao,
  et_at,
  et_nt,
  et_sintese_canonica,
  et_teologia_sistematica,
  et_aplicacoes,

  // Estudo Doutrinário
  doutr_conceito,
  doutr_fundbiblica,
  doutr_desenvolvredentivo,
  doutr_relacoes,
  doutr_historia,
  doutr_controversias,
  doutr_sintese,
  doutr_implicacoes,
}
