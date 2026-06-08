// Ajuda contextual por card ID
// Três perguntas para cada campo: o que é, por que importa, como influencia a mensagem.

export interface CardHelp {
  whatIs: string
  whyMatters: string
  howInfluences: string
  questions?: string[]
  example?: string
}

export const CARD_HELP: Record<string, CardHelp> = {

  // ── CONTEXTO HISTÓRICO ────────────────────────────────────────────────────

  periodo_data: {
    whatIs: 'O momento histórico em que o texto foi escrito — séc. I d.C., período do exílio, reinado de um rei específico etc.',
    whyMatters: 'Textos escritos em diferentes épocas refletem situações, pressões e expectativas distintas. A data ajuda a contextualizar o que estava em jogo.',
    howInfluences: 'Evita projetar realidades modernas sobre o texto e permite entender por que certas palavras tinham peso específico naquele momento.',
  },

  contexto_politico: {
    whatIs: 'A situação de poder existente quando o texto foi escrito — governos, impérios, dominação romana, conflitos entre reis etc.',
    whyMatters: 'Ajuda a compreender pressões, medos, esperanças e conflitos que moldaram as perguntas e respostas dos autores e destinatários.',
    howInfluences: 'Permite entender passagens sobre autoridade, liberdade, sofrimento e esperança com mais profundidade e evita interpretações ingênuas.',
  },

  contexto_religioso: {
    whatIs: 'O cenário espiritual da época — judaísmo, paganismo, cultos, heresias, práticas religiosas populares que cercavam os destinatários.',
    whyMatters: 'Muito do NT responde diretamente a práticas religiosas específicas. Ignorar esse contexto torna a interpretação superficial.',
    howInfluences: 'Explica por que certas doutrinas são afirmadas com tanta ênfase — elas respondiam a desvios reais no contexto dos leitores originais.',
  },

  cultura_costumes: {
    whatIs: 'Hábitos, valores, práticas sociais e normas culturais do mundo bíblico — honra e vergonha, hospitalidade, família, gênero etc.',
    whyMatters: 'A Bíblia foi escrita dentro de culturas específicas. Entender os costumes evita mal-entendidos e leituras anacrônicas.',
    howInfluences: 'Permite distinguir o princípio eterno do texto da sua expressão cultural original — fundamental para aplicação responsável.',
  },

  geografia: {
    whatIs: 'Os lugares mencionados no texto e sua relevância — distâncias, fronteiras, significado simbólico de regiões, rotas comerciais.',
    whyMatters: 'A geografia bíblica não é neutra. Jericó, Jerusalém, Babilônia, Roma — cada lugar carrega conotações teológicas e históricas.',
    howInfluences: 'Movimentos geográficos (subir a Jerusalém, descer ao Egito, atravessar o Jordão) frequentemente carregam sentido teológico intencional.',
  },

  estrutura_social: {
    whatIs: 'Como a sociedade era organizada — classes, escravidão, relações de patrono e cliente, estrutura familiar, posição da mulher.',
    whyMatters: 'Ajuda a entender a quem o texto se dirigia, que tensões sociais existiam e como as comunidades cristãs eram percebidas.',
    howInfluences: 'Passagens sobre liberdade, igualdade, servidão e família ganham profundidade quando o pano de fundo social é compreendido.',
  },

  // ── AUTOR E DESTINATÁRIOS ─────────────────────────────────────────────────

  autor: {
    whatIs: 'Quem escreveu o texto — identidade, formação, experiência pastoral, relação com os destinatários e propósito ao escrever.',
    whyMatters: 'O mesmo texto vem carregado do caráter e das intenções de quem o escreveu. Paulo não escreve como João. Moisés não escreve como Jeremias.',
    howInfluences: 'Conhecer o autor ajuda a interpretar o tom, a ênfase e as escolhas vocabulares — e a perceber o que ele considerava mais urgente comunicar.',
  },

  questoes_autoria: {
    whatIs: 'Debates sobre quem realmente escreveu o livro — autoria paulina das Pastorais, Deutero-Isaías, pseudepigrafia etc.',
    whyMatters: 'Afeta como datamos o texto e entendemos seu propósito original. Não é um debate meramente acadêmico — tem implicações hermenêuticas.',
    howInfluences: 'Determina o contexto histórico correto e evita aplicar um texto a uma situação diferente da que foi originalmente endereçada.',
  },

  destinatarios: {
    whatIs: 'Quem recebeu o texto originalmente — uma comunidade específica, um indivíduo, uma região, ou uma audiência mais ampla.',
    whyMatters: 'A carta foi escrita para eles, não para nós diretamente. Entender quem eram os destinatários é o primeiro passo para entender a mensagem.',
    howInfluences: 'Permite fazer a ponte correta: "o que isso significou para eles?" antes de perguntar "o que isso significa para mim?".',
  },

  situacao_destinatarios: {
    whatIs: 'Os problemas, conflitos, dúvidas, sofrimentos ou necessidades específicas que os destinatários enfrentavam ao receber o texto.',
    whyMatters: 'A Bíblia é uma palavra de Deus direcionada a situações reais. Compreender a situação revela por que certas coisas são ditas com aquela ênfase.',
    howInfluences: 'Evita generalizar desnecessariamente e permite identificar com precisão a aplicação atemporal dentro de uma situação historicamente particular.',
  },

  // ── OCASIÃO E PROPÓSITO ───────────────────────────────────────────────────

  ocasiao: {
    whatIs: 'O evento ou circunstância específica que motivou a escrita do texto — uma crise, uma pergunta, um conflito, uma necessidade pastoral.',
    whyMatters: 'Documentos são escritos por razões. Identificar a ocasião explica por que certas coisas são ditas, com que urgência e em que tom.',
    howInfluences: 'Permite distinguir o que é resposta a uma situação pontual do que é princípio universal — essencial para aplicação responsável.',
  },

  proposito_declarado: {
    whatIs: 'O objetivo que o próprio autor declara explicitamente no texto — "escrevi isto para que..." ou "meu propósito é...".',
    whyMatters: 'Quando o autor declara seu propósito, temos a chave interpretativa mais confiável de toda a obra.',
    howInfluences: 'Cada seção do texto deve ser lida à luz desse propósito declarado. O que serve ao objetivo? O que é incidental?',
  },

  proposito_implicito: {
    whatIs: 'O objetivo que o autor não declara abertamente mas que emerge das ênfases, escolhas e argumentos do texto.',
    whyMatters: 'Nem todo propósito é declarado. Às vezes o autor corrige sem criticar explicitamente, ou encoraja sem listar os problemas.',
    howInfluences: 'Revela camadas da mensagem que uma leitura superficial perderia — especialmente em textos com agendas teológicas implícitas.',
  },

  // ── GÊNERO LITERÁRIO ──────────────────────────────────────────────────────

  genero_livro: {
    whatIs: 'O tipo geral de literatura do livro: narrativa histórica, epístola, profecia, sabedoria, salmo, evangelho, apocalipse.',
    whyMatters: 'Cada gênero comunica de maneira diferente e exige regras interpretativas próprias. Narrativa não é profecia. Poesia não é instrução legal.',
    howInfluences: 'Define como lemos e aplicamos o texto. Interpretar poesia como prosa literal ou profecia como história já cumprida são erros de gênero.',
  },

  genero_pericope: {
    whatIs: 'O tipo específico de texto dentro do livro maior — parábola dentro de um evangelho, hino dentro de uma carta, visão dentro de uma profecia.',
    whyMatters: 'Um livro pode conter múltiplos subgêneros. A forma literária local afeta como a passagem específica deve ser lida.',
    howInfluences: 'Evita, por exemplo, interpretar uma parábola como relato factual, ou um hino como argumento teológico sistemático.',
  },

  implicacoes_hermeneuticas: {
    whatIs: 'As implicações práticas do gênero para como interpretamos o texto — quais princípios aplicar, que perguntas fazer, o que evitar.',
    whyMatters: 'Saber o gênero sem aplicar as implicações hermenêuticas corretas é saber o mapa mas não saber ler.',
    howInfluences: 'Orienta diretamente o método exegético: sabendo que é apocalíptica, não busco datas literais; sabendo que é sabedoria, entendo proverbialidade.',
  },

  // ── ESTRUTURA DO LIVRO ────────────────────────────────────────────────────

  divisoes_principais: {
    whatIs: 'As grandes divisões do livro — os blocos principais que organizam o argumento ou a narrativa no nível macro.',
    whyMatters: 'Nenhuma passagem existe isolada. Ela é parte de uma estrutura maior que lhe dá contexto e significado.',
    howInfluences: 'Ajuda a entender a função da passagem estudada dentro do todo — é clímax? introdução? conclusão? transição?',
  },

  localizacao_pericope: {
    whatIs: 'Onde exatamente a passagem se encaixa dentro da estrutura do livro — antes de quê, depois de quê, em que bloco temático.',
    whyMatters: 'A localização afeta o significado. Uma promessa no meio de uma narrativa de queda tem peso diferente de uma promessa no início do livro.',
    howInfluences: 'Previne interpretações isoladas e permite entender o que o autor queria que o leitor já soubesse antes de chegar nesta passagem.',
  },

  argumento_livro: {
    whatIs: 'A linha de raciocínio central do livro — o que o autor está provando, ensinando ou narrando do início ao fim.',
    whyMatters: 'Passagens funcionam dentro de argumentos maiores. Entender o argumento do livro é entender para onde a passagem está apontando.',
    howInfluences: 'Permite formular a Grande Ideia com fidelidade: a mensagem da passagem serve ao argumento do livro, não contradiz nem ignora.',
  },

  // ── DELIMITAÇÃO DA PERÍCOPE ───────────────────────────────────────────────

  limites_pericope: {
    whatIs: 'Onde começa e onde termina a passagem que você está estudando — identificar a unidade literária completa e autossuficiente.',
    whyMatters: 'Estudar um versículo isolado sem ver a unidade completa é como analisar uma frase sem ler o parágrafo. O contexto muda o sentido.',
    howInfluences: 'Define o território da sua exegese. Tudo que você concluir precisa ser justificado dentro dos limites corretos da perícope.',
  },

  marcadores_delimitacao: {
    whatIs: 'Os sinais textuais que indicam início e fim de uma unidade: mudança de personagem, tema, tempo verbal, local, inclusio.',
    whyMatters: 'A delimitação não é arbitrária — o texto oferece pistas. Aprender a ler esses marcadores é aprender a ouvir a estrutura do texto.',
    howInfluences: 'Uma delimitação incorreta pode incluir ou excluir informações que mudam completamente a interpretação da passagem.',
  },

  conexao_contexto: {
    whatIs: 'Como a passagem se conecta com o que vem antes e o que vem depois — o fluxo narrativo ou argumentativo do contexto imediato.',
    whyMatters: 'O contexto imediato é o mais forte determinante do significado. Uma palavra ou ideia carrega o peso do que acabou de ser dito.',
    howInfluences: 'Frequentemente resolve ambiguidades de interpretação sem precisar de recurso a ferramentas externas — o próprio texto se interpreta.',
  },

  // ── TEXTO ORIGINAL ────────────────────────────────────────────────────────

  minha_traducao: {
    whatIs: 'Uma tradução pessoal palavra por palavra do texto grego ou hebraico — não para publicação, mas para internalização.',
    whyMatters: 'Traduzir o próprio texto força o exegeta a tomar decisões interpretativas que leitura passiva não exige.',
    howInfluences: 'Revela onde estão as ambiguidades, os termos mais carregados e as escolhas que as traduções publicadas tiveram de fazer.',
  },

  variantes_textuais: {
    whatIs: 'Diferenças entre manuscritos antigos do texto bíblico — palavras, frases ou versículos que aparecem de forma diferente em distintas cópias.',
    whyMatters: 'A maioria das variantes é insignificante, mas algumas afetam a interpretação. Precisamos saber com qual texto estamos trabalhando.',
    howInfluences: 'Em passagens teologicamente importantes, a variante correta pode confirmar ou modificar uma doutrina. É parte da integridade exegética.',
  },

  comparacao_versoes: {
    whatIs: 'A análise de como diferentes traduções em português (ACF, NAA, NVI, NTH) rendem um mesmo trecho do original.',
    whyMatters: 'Diferenças entre traduções frequentemente revelam ambiguidades do original ou escolhas teológicas dos tradutores.',
    howInfluences: 'Amplia a percepção do leque de sentidos possíveis e ajuda a identificar qual tradução serve melhor ao argumento da passagem.',
  },

  // ── MORFOSSINTAXE ─────────────────────────────────────────────────────────

  verbos_principais: {
    whatIs: 'Os verbos centrais da passagem — tempo, modo, voz e aspecto verbal no grego ou hebraico original.',
    whyMatters: 'Os verbos carregam a ação e a intenção do texto. O aspecto verbal grego (puntual vs. contínuo) frequentemente carrega peso teológico.',
    howInfluences: 'Um imperativo presente grego pode significar "continue fazendo" enquanto um aoristo pode significar "comece a fazer" — a diferença importa.',
  },

  substantivos_casos: {
    whatIs: 'Os substantivos e suas funções gramaticais no grego (nominativo, genitivo, dativo, acusativo) ou no hebraico.',
    whyMatters: 'Os casos gregos determinam a relação entre as palavras — quem age, quem recebe, a quem pertence, em favor de quem.',
    howInfluences: 'O famoso "fé de Cristo" (Gl 2.16) — genitivo subjetivo ou objetivo? — muda completamente a teologia da passagem.',
  },

  estrutura_sintatica: {
    whatIs: 'Como as orações se relacionam entre si — quais são principais, quais são subordinadas, o que explica o quê.',
    whyMatters: 'O argumento do texto se move através da sintaxe. A estrutura das frases revela o que o autor considera central e o que é complementar.',
    howInfluences: 'Identificar a oração principal e as subordinadas ajuda a derivar a Grande Ideia do texto com precisão gramatical.',
  },

  particulas_conectivos: {
    whatIs: 'As pequenas palavras que ligam orações: "porque", "portanto", "mas", "para que", "assim que", "embora" — em grego e hebraico.',
    whyMatters: 'Conectivos revelam a lógica do argumento. "Portanto" (oun) indica conclusão. "Para que" (hina) indica propósito. Não são decoração.',
    howInfluences: 'Romanos 12.1 começa com "Portanto" — os versículos anteriores são a base teológica para a ética que se segue. O conectivo define a lógica.',
  },

  // ── ESTRUTURA LITERÁRIA ───────────────────────────────────────────────────

  esboço_narrativo: {
    whatIs: 'O mapa da narrativa em cenas: exposição, conflito, desenvolvimento, clímax, resolução — a estrutura dramática da história.',
    whyMatters: 'Narrativas bíblicas são arte literária sofisticada, não apenas registros factuais. A estrutura dramática revela a mensagem teológica.',
    howInfluences: 'Identificar onde está o clímax revela onde está o peso teológico. A resolução frequentemente expressa o ponto principal da história.',
  },

  personagens_narrativos: {
    whatIs: 'Os personagens da narrativa, suas características, motivações, contrastes e desenvolvimento ao longo da história.',
    whyMatters: 'Personagens bíblicos frequentemente funcionam como "tipos" que ensinam princípios teológicos através de seus padrões de fé ou falha.',
    howInfluences: 'O contraste entre personagens frequentemente carrega a mensagem central: o fariseu e o publicano, o filho pródigo e o filho mais velho.',
  },

  cenario_tempo: {
    whatIs: 'O local e o momento em que a narrativa acontece — montanha, templo, deserto, noite, dia de repouso, época de colheita.',
    whyMatters: 'No mundo bíblico, o cenário raramente é neutro. Lugares e tempos têm conotações teológicas específicas.',
    howInfluences: 'Jesus encontra Nicodemos à noite — o cenário reforça o tema da iluminação. Elias na montanha de Deus — o cenário conecta com Moisés.',
  },

  enredo_tensao: {
    whatIs: 'O conflito central que move a narrativa — a tensão dramática que faz o leitor querer saber o que acontece a seguir.',
    whyMatters: 'A tensão narrativa revela o problema que a história endereça. Onde está a tensão, está a questão teológica central.',
    howInfluences: 'Identificar a tensão ajuda a formular a Grande Ideia: a mensagem é a resposta de Deus à tensão apresentada na narrativa.',
  },

  climax_resolucao: {
    whatIs: 'O momento de maior tensão e o ponto de virada da narrativa, seguido de como o conflito é resolvido.',
    whyMatters: 'O clímax é onde o peso teológico é maior. A resolução frequentemente expressa a resposta de Deus à situação humana.',
    howInfluences: 'Em muitas narrativas bíblicas, o clímax é uma teofania, uma palavra de Deus ou uma ação salvífica — a mensagem está ali.',
  },

  dispositivos_narrativos: {
    whatIs: 'Recursos literários usados pelo narrador: ironia, repetição, contrastes, inclusio, quiasmo, alusões intertextuais.',
    whyMatters: 'Autores bíblicos eram mestres literários. Os dispositivos não são ornamento — comunicam significado de forma intencionalmente densa.',
    howInfluences: 'A repetição de uma palavra três vezes é ênfase intencional. Uma ironia narrativa frequentemente inverte a expectativa do leitor para revelar verdade teológica.',
  },

  // ── ESTRUTURA ARGUMENTATIVA (EPÍSTOLAS) ──────────────────────────────────

  tese_argumento: {
    whatIs: 'A afirmação central que o autor quer provar ou ensinar — a proposição principal do argumento da carta ou da passagem.',
    whyMatters: 'Epístolas são argumentos. Identificar a tese principal é como encontrar o coração de tudo que o autor diz antes e depois.',
    howInfluences: 'Permite avaliar cada seção perguntando: como isso serve ao argumento central? É premissa, prova, ilustração ou conclusão?',
  },

  fluxo_argumentativo: {
    whatIs: 'A sequência lógica do raciocínio do autor — como um pensamento leva ao próximo, como premissas constroem a conclusão.',
    whyMatters: 'Desconectar versículos do seu fluxo argumentativo é o principal gerador de mal-interpretações epistolares.',
    howInfluences: 'Romanos 3-8 é um argumento encadeado. Romanos 8.28 fora desse contexto perde metade do seu significado e conforto.',
  },

  premissas_conclusoes: {
    whatIs: 'As afirmações que o autor usa como base (premissas) e as conclusões que tira a partir delas.',
    whyMatters: 'Toda conclusão depende de suas premissas. Entender o que o autor assume como verdade ajuda a entender o que ele conclui.',
    howInfluences: 'Frequentemente a aplicação pastoral de uma conclusão depende de aceitar a premissa teológica — que é onde a pregação precisa ir.',
  },

  exortacoes_aplicacao: {
    whatIs: 'Os imperativos, exortações e apelos diretos à ação que o autor faz aos destinatários dentro da passagem.',
    whyMatters: 'Muitas cartas têm uma estrutura indicativo-imperativo: primeiro o que Deus fez, depois o que você deve fazer. A ordem importa.',
    howInfluences: 'Pregar o imperativo sem o indicativo é moralismo. O evangelho é sempre premissa, não consequência da obediência.',
  },

  // ── CONTEXTO CANÔNICO ─────────────────────────────────────────────────────

  contexto_intralivro: {
    whatIs: 'Como o tema ou vocabulário desta passagem aparece e se desenvolve em outras partes do mesmo livro.',
    whyMatters: 'O mesmo autor frequentemente retoma temas, explicita o que estava implícito ou desenvolve o que foi introduzido anteriormente.',
    howInfluences: 'João 3.16 e João 10.10 iluminam-se mutuamente. Seguir um tema dentro do mesmo livro é o contexto imediato mais confiável.',
  },

  citacoes_alusoes_at: {
    whatIs: 'Lugares onde o texto do NT cita ou alude ao AT — explicitamente ou por eco verbal, temático ou tipológico.',
    whyMatters: 'O NT é saturado de AT. Os autores do NT escrevem com a Bíblia hebraica na mente e esperam que os leitores a conheçam.',
    howInfluences: 'Entender a alusão frequentemente dobra ou triplica o significado do texto. Hebreus 1 faz sentido pleno apenas para quem conhece os Salmos.',
  },

  ecos_nt: {
    whatIs: 'Como o tema ou vocabulário desta passagem ressoa em outras partes do NT — padrões comuns entre os autores.',
    whyMatters: 'O NT é uma biblioteca com vozes diferentes mas tema unificado. Acompanhar os ecos ajuda a ver o padrão teológico maior.',
    howInfluences: 'Permite situar a passagem na teologia do NT como um todo — o que o texto contribui para o quadro completo da revelação.',
  },

  // ── PROGRESSÃO REVELACIONAL ───────────────────────────────────────────────

  posicao_historia_redencao: {
    whatIs: 'Onde o texto se localiza na linha do tempo da história da redenção — criação, queda, promessa, lei, profecia, encarnação, cruz, ressurreição, consumação.',
    whyMatters: 'A revelação é progressiva. Uma promessa no Gênesis tem peso diferente de uma promessa depois de Pentecostes.',
    howInfluences: 'Determina como lemos, o que esperamos que ainda esteja por vir no texto e como Cristo cumpre ou antecipa o que está dito.',
  },

  tipologia: {
    whatIs: 'Correspondências históricas entre eventos, pessoas ou instituições do AT e seu cumprimento ou antitipos no NT.',
    whyMatters: 'Deus trabalha com padrões na história. A tipologia revela a unidade da Escritura e aponta para Cristo como fulfillment de tudo.',
    howInfluences: 'Adão é tipo de Cristo (Rm 5). O Êxodo é tipo da redenção. A leitura tipológica cristocêntrica não é alegorização — é exegese canônica.',
  },

  promessa_cumprimento: {
    whatIs: 'Como o texto se relaciona com promessas divinas anteriores (que cumpre) ou anuncia promessas futuras (que serão cumpridas).',
    whyMatters: 'O enredo da Bíblia é fundamentalmente promessa-cumprimento. Todo texto está em algum lugar nessa trajetória.',
    howInfluences: 'Localizar o texto nessa trajetória revela o que ele nos diz sobre a fidelidade de Deus e a certeza de esperanças ainda não vistas.',
  },

  // ── GRANDE IDEIA ──────────────────────────────────────────────────────────

  grande_ideia: {
    whatIs: 'A afirmação única, completa e unificadora que sintetiza o que toda a passagem diz — sujeito mais complemento.',
    whyMatters: 'Todo texto bíblico tem uma mensagem principal. A Grande Ideia Exegética é a ferramenta para identificá-la com precisão.',
    howInfluences: 'É o coração de qualquer pregação ou estudo fiel. Tudo no sermão deve servir à Grande Ideia — não o contrário.',
  },

  mensagem_texto: {
    whatIs: 'A mensagem central do texto em linguagem contemporânea — o que Deus está dizendo através desta passagem para pessoas de hoje.',
    whyMatters: 'Exegese sem aplicação é arqueologia. A mensagem conecta a intenção original do autor com a vida do ouvinte contemporâneo.',
    howInfluences: 'Define o ponto focal de qualquer comunicação derivada deste texto — sermão, estudo bíblico, devocional ou comentário.',
  },

  conceito_ensina: {
    whatIs: 'O princípio teológico ou verdade que o texto ensina — o conteúdo doutrinário que emerge da exegese.',
    whyMatters: 'Pregação fiel transmite o que o texto ensina, não apenas o que o pregador acha interessante ou relevante.',
    howInfluences: 'É o conteúdo informativo do sermão: o que o ouvinte deve saber ao final. A clareza aqui evita ambiguidade na aplicação.',
  },

  conceitos_confronta: {
    whatIs: 'Crenças, atitudes ou comportamentos que o texto desafia, corrige ou confronta — onde ele vai contra o fluxo cultural ou religioso.',
    whyMatters: 'Toda pregação fiel tem um elemento profético — confronta o que está errado à luz do que Deus revela.',
    howInfluences: 'Sem identificar o que o texto confronta, o sermão pode ser agradável mas ineficaz. A Palavra transforma o que é corretamente nomeado.',
  },

  // ── GRANDE IDEIA HOMILÉTICA ───────────────────────────────────────────────

  sujeito_homilet: {
    whatIs: 'O "sobre o quê" do sermão — a pergunta implícita que o sermão responde, formulada do ponto de vista do ouvinte.',
    whyMatters: 'Todo sermão precisa de foco. O sujeito define o território: de que estamos falando? O ouvinte precisa saber.',
    howInfluences: 'Um sujeito difuso gera sermões que tentam dizer tudo e acabam dizendo nada. A clareza do sujeito é a clareza do sermão.',
  },

  complemento_homilet: {
    whatIs: 'O "o que dizemos sobre o sujeito" — a resposta completa que o sermão dá à pergunta implícita.',
    whyMatters: 'Juntos, sujeito e complemento formam a Grande Ideia Homilética: a frase que, se o ouvinte lembrar, ele terá retido o sermão.',
    howInfluences: 'Define o que o sermão precisa provar, ilustrar e aplicar. Tudo que não serve ao complemento é desvio.',
  },

  grande_ideia_homilet: {
    whatIs: 'A frase única que resume o sermão inteiro — a Grande Ideia Exegética traduzida em linguagem contemporânea e pregável.',
    whyMatters: 'É a âncora do sermão. Sem ela, o pregador perde o fio; com ela, o ouvinte pode responder "em uma frase, o sermão disse...".',
    howInfluences: 'Define a estrutura, as ilustrações, a aplicação e o apelo. Tudo serve a esta frase. Ela serve ao texto.',
  },

  proposicao: {
    whatIs: 'A declaração central do sermão — a Grande Ideia formulada como afirmação que o sermão demonstrará ser verdadeira.',
    whyMatters: 'A proposição é o compromisso do pregador com o ouvinte. Ela define o que será provado e o que o ouvinte deve crer ao final.',
    howInfluences: 'Torna o sermão verificável: ao final, o ouvinte pode perguntar "o pregador cumpriu o que prometeu?". Isso é integridade homilética.',
  },

  // ── INTRODUÇÃO DO SERMÃO ─────────────────────────────────────────────────

  gancho: {
    whatIs: 'O elemento de abertura que captura a atenção — uma pergunta, uma história, um paradoxo, uma situação de tensão.',
    whyMatters: 'O ouvinte decide nos primeiros 30 segundos se vai ouvir ou desligar internamente. O gancho influencia essa decisão.',
    howInfluences: 'O gancho eficaz cria uma pergunta na mente do ouvinte que só o texto responde — gerando motivação para ouvir.',
  },

  necessidade: {
    whatIs: 'A necessidade humana que a passagem endereça — o problema, dor, dúvida ou tensão que o texto veio responder.',
    whyMatters: 'Sem percepção de necessidade, o ouvinte não sente relevância. A necessidade cria a ponte entre o texto e a vida real.',
    howInfluences: 'Quando o ouvinte reconhece sua necessidade na introdução, ele passa a ouvir o texto como resposta — não como informação distante.',
  },

  // ── APLICAÇÃO ────────────────────────────────────────────────────────────

  aplicacao_crenca: {
    whatIs: 'O que o texto nos chama a crer — verdades sobre Deus, Cristo, o ser humano ou a salvação que o texto afirma.',
    whyMatters: 'Crença transforma antes de comportamento. O que alguém acredita sobre Deus determina como vive.',
    howInfluences: 'Aplicações de crença são as mais duradouras: mudam a cosmovisão, não apenas o comportamento imediato.',
  },

  aplicacao_pratica: {
    whatIs: 'O que o texto nos chama a fazer — ações concretas e específicas que decorrem da verdade proclamada.',
    whyMatters: 'Fé sem obras é morta. Pregação que não leva à ação concreta falha em seu propósito transformador.',
    howInfluences: 'Deve ser específica o suficiente para que o ouvinte saiba o que fazer segunda-feira — não apenas "seja mais amoroso".',
  },

  aplicacao_cristologica: {
    whatIs: 'Como Cristo é o centro e a motivação da resposta — não "faça mais", mas "Cristo fez; portanto você pode e deve".',
    whyMatters: 'Sem Cristo como motivação, aplicação vira moralismo. Com Cristo, é evangelho respondido em obediência grata.',
    howInfluences: 'Transforma o imperativo em resposta ao indicativo. O ouvinte obedece não para merecer algo, mas porque recebeu tudo.',
  },

  // ── ESTUDO TEMÁTICO — DEFINIÇÃO ──────────────────────────────────────────

  nome_tema: {
    whatIs: 'O nome preciso do tema investigado e o campo semântico — conjunto de termos hebraicos e gregos associados a essa realidade teológica.',
    whyMatters: 'O campo semântico revela como a Bíblia "fala" sobre o tema. Sem identificar os termos originais, a pesquisa canônica ficará incompleta e imprecisa.',
    howInfluences: 'Define os termos de busca para todo o rastreamento no AT e NT, evitando tanto a amplidão vaga quanto a estreiteza arbitrária.',
    questions: [
      'Qual é a palavra hebraica ou grega mais central para este tema?',
      'Quais são os sinônimos, termos relacionados e imagens associadas?',
      'Que palavras devem ser excluídas para não ampliar demais o escopo?',
      'Como o campo semântico muda entre AT e NT?',
    ],
    example: 'Tema: Graça\n\nNome: χάρις (charis) — grego; חֵן (chen) — hebraico\n\nCampo semântico: misericórdia (ἔλεος / חֶסֶד), favor imerecido, benevolência, dádiva, perdão, bondade amorosa.',
  },

  questao_orientadora: {
    whatIs: 'A pergunta principal que guiará toda a investigação canônica do tema — o eixo em torno do qual o estudo inteiro gira.',
    whyMatters: 'Sem uma questão clara, o estudo vira uma coleção de versículos sem direção. A questão define o que é relevante e o que é tangencial.',
    howInfluences: 'Toda passagem rastreada será avaliada à luz desta pergunta. Ela evita desvios e mantém a coerência do argumento final.',
    questions: [
      'O que desejo descobrir ao final deste estudo?',
      'Qual aspecto do tema é mais urgente para a congregação?',
      'A pergunta é específica o suficiente para ser respondida?',
      'Ela está conectada ao debate histórico-canônico do tema?',
    ],
    example: 'Tema: O Poder como Senhor\n\nQuestão orientadora: "Como o poder exerce domínio sobre o coração humano, e de que forma o senhorio de Cristo confronta e redime essa tendência idolátrica?"',
  },

  delimitacao: {
    whatIs: 'A definição clara do escopo do estudo — o que será investigado, o que será excluído e por quê.',
    whyMatters: 'Um tema sem delimitação cresce indefinidamente. A delimitação mantém o estudo manejável sem sacrificar profundidade.',
    howInfluences: 'Evita que o pesquisador se perca em temas adjacentes e garante que o resultado final responda à questão orientadora com foco.',
    questions: [
      'O estudo cobrirá AT e NT, ou apenas um deles?',
      'Quais subtemas serão explicitamente excluídos?',
      'Existem temas que parecem relacionados mas precisam ser distinguidos?',
      'A delimitação é coerente com a questão orientadora?',
    ],
    example: 'Tema: O Poder como Senhor\n\nEscopo: Rastrear a tendência humana de idolatrar o poder e o confronto divino com ela — da queda (Gn 3) aos impérios (Daniel) ao senhorio de Cristo (Fp 2).\n\nExcluído: teologia política, ética de governança civil.',
  },

  // ── ESTUDO TEMÁTICO — ANTIGO TESTAMENTO ──────────────────────────────────

  patriarcal: {
    whatIs: 'O desenvolvimento do tema no Pentateuco — Gênesis ao Deuteronômio — cobrindo criação, queda, alianças patriarcais e Lei mosaica.',
    whyMatters: 'O Pentateuco estabelece os fundamentos canônicos de quase todo tema teológico. Ignorar essa base fragiliza qualquer construção posterior.',
    howInfluences: 'Define a "genoma" do tema: como ele emerge, que perguntas levanta e que promessas são feitas. Tudo que vem depois se relaciona com esse fundamento.',
    questions: [
      'Como o tema aparece na criação e na queda (Gênesis 1-3)?',
      'Qual é a contribuição das alianças — Noé, Abraão, Moisés?',
      'Existem tipos ou padrões no Pentateuco que serão cumpridos no NT?',
      'A Lei mosaica regula, reflete ou aprofunda o tema?',
    ],
    example: 'Tema: O Poder como Senhor\n\nGn 3.1-7 — a sedução do poder igual a Deus.\nGn 11 — Babel como afirmação de poder humano contra Deus.\nÊx 1-14 — o poder do Faraó confrontado pelo poder de Javé.\nDt 8.17-18 — o perigo de atribuir ao próprio esforço o poder para produzir riqueza.',
  },

  mosaico: {
    whatIs: 'O desenvolvimento do tema nos livros históricos (Josué a Ester) e na literatura poética e sapiencial (Salmos, Provérbios, Jó, Eclesiastes).',
    whyMatters: 'Os livros históricos mostram como o tema se desdobra na experiência concreta do povo. A sabedoria e os Salmos revelam como o tema toca a vida interior e a adoração.',
    howInfluences: 'Oferece exemplos narrativos concretos e textos devocionais que equilibram a análise teológica com a experiência pastoral do tema.',
    questions: [
      'Como reis e juízes ilustram o tema nos livros históricos?',
      'Quais Salmos tratam o tema de forma direta ou indireta?',
      'Como Provérbios enquadra o tema na sabedoria cotidiana?',
      'Jó ou Eclesiastes contribuem para o tema de forma especial?',
    ],
    example: 'Tema: O Poder como Senhor\n\n1 Rs 21 — Acabe e Nabot, o poder que oprime o fraco.\n2 Sm 11 — Davi e o poder que corrompe.\nSl 52 — "O poderoso se gloria na maldade".\nEcl 4.1 — o poder dos opressores e a solidão das vítimas.',
  },

  profetico: {
    whatIs: 'A contribuição dos profetas maiores (Isaías, Jeremias, Ezequiel, Daniel) e menores para o desenvolvimento do tema, incluindo o horizonte escatológico.',
    whyMatters: 'Os profetas confrontam o uso corrupto do poder em Israel e nas nações, e apontam para o reino de Deus como alternativa.',
    howInfluences: 'Levanta a questão do poder em escala imperial (Assíria, Babilônia, Pérsia), conecta o tema ao sofrimento do servo e projeta o tema para a consumação do reino.',
    questions: [
      'Como os profetas denunciam o abuso de poder em Israel e nas nações?',
      'Qual é a perspectiva dos profetas sobre os impérios?',
      'O tema do servo sofredor em Isaías ilumina o tema?',
      'Como Daniel trata o poder dos impérios em relação ao reino de Deus?',
    ],
    example: 'Tema: O Poder como Senhor\n\nIs 14.12-15 — a arrogância do poder na queda do rei da Babilônia.\nDn 2 e 7 — os reinos humanos e o reino eterno de Deus.\nMq 6.8 — a justiça como antídoto ao poder opressivo.\nIs 52-53 — o servo que derrota o poder pelo sofrimento.',
  },

  // ── ESTUDO TEMÁTICO — NOVO TESTAMENTO ────────────────────────────────────

  evangelhos: {
    whatIs: 'O desenvolvimento do tema nos quatro Evangelhos — como Jesus trata o tema em seus ensinamentos, parábolas, milagres e própria vida.',
    whyMatters: 'Jesus é o cumprimento e o intérprete definitivo de todo tema bíblico. Os Evangelhos revelam como o tema é encarnado e redefinido por Cristo.',
    howInfluences: 'Estabelece o padrão cristológico que orienta como o tema deve ser vivido e ensinado na Igreja.',
    questions: [
      'Jesus ensina sobre o tema de forma direta ou por parábolas?',
      'Como os quatro evangelistas abordam o tema com suas ênfases próprias?',
      'O comportamento de Jesus encarna o tema de forma que contraria as expectativas?',
      'Há um evento na vida de Jesus que é o ápice do tema nos Evangelhos?',
    ],
    example: 'Tema: O Poder como Senhor\n\nMc 10.35-45 — Jesus redefine poder como serviço.\nLc 4.1-13 — a tentação do poder mundano recusada por Jesus.\nMt 28.18 — "Toda autoridade me foi dada" — o poder restituído ao Filho.\nJo 19.10-11 — Jesus ao diálogo com Pilatos sobre a origem de toda autoridade.',
  },

  cartas: {
    whatIs: 'O desenvolvimento do tema nas cartas apostólicas — Paulo, Pedro, João, Tiago, Judas e Hebreus.',
    whyMatters: 'As cartas aplicam o tema à vida da Igreja nascente em contextos específicos. Aqui o tema ganha contornos pastorais, éticos e doutrinários precisos.',
    howInfluences: 'Conecta o tema à experiência cotidiana da congregação e fornece os argumentos teológicos mais desenvolvidos do NT.',
    questions: [
      'Como Paulo desenvolve o tema em suas cartas principais?',
      'Hebreus contribui de forma única para o tema?',
      'As cartas gerais (Pedro, João, Tiago) acrescentam perspectivas diferentes?',
      'Quais são os loci classici do tema nas cartas?',
    ],
    example: 'Tema: O Poder como Senhor\n\nFp 2.5-11 — a kenosis de Cristo como padrão de poder invertido.\n1 Co 1.18-25 — a loucura da cruz como poder de Deus.\n2 Co 12.9-10 — o poder de Deus que se aperfeiçoa na fraqueza.\nRm 13.1 — toda autoridade vem de Deus.',
  },

  apocalipse: {
    whatIs: 'O cumprimento escatológico do tema no Apocalipse e na esperança do NT — o horizonte final do tema na nova criação.',
    whyMatters: 'O Apocalipse revela o desfecho de toda realidade caída, incluindo o tema investigado. O que o AT prometeu e o NT anunciou encontra aqui sua consumação.',
    howInfluences: 'Oferece perspectiva escatológica que impede que o tema seja reduzido a questões presentes e ancora a esperança cristã.',
    questions: [
      'Como o Apocalipse representa o tema em seu cumprimento final?',
      'Quais imagens do Apocalipse pertencem ao campo semântico do tema?',
      'O tema é confrontado, transformado ou consumado na nova criação?',
      'Como a esperança escatológica do tema orienta a vida da Igreja hoje?',
    ],
    example: 'Tema: O Poder como Senhor\n\nAp 13 — as bestas como expressão máxima do poder idolátrico.\nAp 19.6 — "O Senhor Deus Onipotente reina".\nAp 21-22 — a nova criação sem mais opressão, morte ou poder corrompido.\nAp 5 — o Cordeiro que foi morto recebe todo o poder.',
  },

  // ── ESTUDO TEMÁTICO — SÍNTESE CANÔNICA ───────────────────────────────────

  progressao: {
    whatIs: 'O arco canônico completo do tema — como ele se desenvolve da criação à nova criação, passando pelas alianças, encarnação e consumação.',
    whyMatters: 'A progressão canônica revela a coerência da revelação de Deus. O tema não é estático; ele se aprofunda, se amplifica e se cumpre progressivamente.',
    howInfluences: 'Permite apresentar o tema com narrativa bíblica completa — não apenas como doutrina abstrata, mas como história com começo, desenvolvimento e clímax.',
    questions: [
      'Como o tema emerge no contexto da criação e queda?',
      'Quais alianças avançam o tema de forma decisiva?',
      'Qual é o clímax do tema na encarnação, morte e ressurreição de Cristo?',
      'Como o tema será consumado na nova criação?',
    ],
    example: 'Tema: O Poder como Senhor\n\nCriação: poder dado ao homem sob a soberania de Deus (Gn 1.28)\nQueda: poder usurpado como independência de Deus (Gn 3)\nAlianças: Deus recupera e redireciona o poder (Davi, promessa messiânica)\nCristo: poder redefinido como serviço e entregue ao Cordeiro crucificado\nConsumação: poder purificado sob o Rei dos reis (Ap 19-22)',
  },

  cumprimento: {
    whatIs: 'A afirmação de como Jesus Cristo é o centro e o cumprimento do tema — na sua pessoa (encarnação) e na sua obra (vida, morte, ressurreição, reinado).',
    whyMatters: 'Todo tema bíblico converge para Cristo. Sem essa centralidade, o estudo temático pode se tornar teologia natural ou ética desconectada do evangelho.',
    howInfluences: 'Garante que o estudo resulte em proclamação cristocêntrica, não em mera instrução moral ou histórica.',
    questions: [
      'Como a pessoa de Cristo encarna e cumpre o tema de forma única?',
      'De que forma a morte de Cristo é o ápice do tema?',
      'A ressurreição e o reinado de Cristo transformam o tema?',
      'Qual dimensão do tema ainda aguarda cumprimento na parousia?',
    ],
    example: 'Tema: O Poder como Senhor\n\nEncarnação: o Filho abandona poder para assumir fraqueza (Fp 2.6-8)\nCruz: o poder de Deus se manifesta na impotência aparente (1 Co 1.18)\nRessurreição: o poder da vida vence o poder da morte (Rm 1.4)\nReinado: toda autoridade nos céus e na terra (Mt 28.18)\nParousia: consumação do reino eterno (1 Co 15.24-28)',
  },

  unidade: {
    whatIs: 'A demonstração da unidade canônica do tema — como AT e NT se iluminam mutuamente, e como o tema é coerente da Gênesis ao Apocalipse.',
    whyMatters: 'A unidade canônica prova que a Bíblia é uma obra com um único Autor divino e uma única mensagem central — o evangelho de Cristo.',
    howInfluences: 'Fortalece a confiança nas Escrituras e impede interpretações que opõem AT e NT como revelações contraditórias.',
    questions: [
      'Qual é o fio condutor do tema do início ao fim do cânone?',
      'Como textos do AT são esclarecidos por passagens do NT no contexto deste tema?',
      'Como o NT pressupõe e cumpre promessas do AT relacionadas ao tema?',
      'Que imagem ou metáfora melhor representa a unidade canônica do tema?',
    ],
    example: 'Tema: O Poder como Senhor\n\nAT: Javé é o único Senhor do poder — Israel não deve ter outro senhor (Dt 6.4)\nNT: Jesus recebe o nome acima de todo nome (Fp 2.9-11)\nUnidade: o poder sempre pertenceu a Deus; Cristo revela como Deus usa esse poder — pelo amor sacrificial, não pela dominação.',
  },

  // ── ESTUDO TEMÁTICO — TEOLOGIA SISTEMÁTICA ───────────────────────────────

  formulacao: {
    whatIs: 'A formulação doutrinária sistemática que emerge do estudo canônico — a articulação precisa da doutrina em linguagem teológica.',
    whyMatters: 'O estudo canônico sem sistematização produz impressões dispersas. A formulação transforma a pesquisa em doutrina ensinável e confessável.',
    howInfluences: 'Permite que o tema seja transmitido com clareza, debatido academicamente e confrontado com erros históricos da Igreja.',
    questions: [
      'Em qual lócus da teologia sistemática este tema se encaixa?',
      'Como os teólogos reformados (Bavinck, Berkhof, Horton) formulam este tema?',
      'A formulação é fiel ao que o estudo canônico revelou?',
      'Quais termos técnicos são necessários e como devem ser explicados?',
    ],
    example: 'Tema: O Poder como Senhor\n\nFormulação: Deus é o único detentor de poder soberano (omnipotentia). O poder humano é delegado, contingente e moralmente responsável. A queda corrompeu o uso do poder, que se tornou idolatria. Cristo restaura o poder ao seu propósito original — servir ao reino de Deus em amor.',
  },

  implicacoes: {
    whatIs: 'As implicações do tema para outros loci da teologia sistemática — como o tema ilumina ou é iluminado por outros tópicos centrais.',
    whyMatters: 'A teologia é um sistema. Um tema nunca existe isolado; ele se conecta e tensiona com doutrinas adjacentes que precisam ser consideradas.',
    howInfluences: 'Evita formulações unilaterais e mostra a riqueza orgânica da revelação — como uma doutrina serve de luz para outra.',
    questions: [
      'Como este tema afeta a doutrina de Deus (teologia própria)?',
      'Que implicações tem para a antropologia (natureza humana)?',
      'Como se relaciona com soteriologia, cristologia e escatologia?',
      'Que tensões o tema cria com outros loci que precisam ser resolvidas?',
    ],
    example: 'Tema: O Poder como Senhor\n\nTeologia: a soberania de Deus é a norma de todo poder.\nAntropologia: o homem como imagem de Deus exerce poder delegado responsavelmente.\nSoteriologia: a redenção inclui libertação do poder do pecado e da morte.\nEscatologia: o poder final pertence ao Cordeiro — julgamento e nova criação.',
  },

  // ── ESTUDO TEMÁTICO — APLICAÇÕES ─────────────────────────────────────────

  vida_crista: {
    whatIs: 'As implicações do tema para a vida cristã pessoal — oração, piedade, mortificação, vivificação e crescimento na graça.',
    whyMatters: 'Teologia sem aplicação à vida pessoal fica no nível da informação. O Espírito usa a Palavra para transformar o coração, não apenas informar a mente.',
    howInfluences: 'Transforma o estudo em alimento espiritual e em desafio concreto para a santificação do crente no cotidiano.',
    questions: [
      'Como este tema desafia minha vida de oração e adoração?',
      'Que pecado específico o tema confronta na vida pessoal?',
      'Como o tema alimenta a esperança nos momentos de fraqueza?',
      'Que disciplina espiritual é especialmente relevante à luz do tema?',
    ],
    example: 'Tema: O Poder como Senhor\n\nOração: reconhecer a soberania de Deus antes de buscar poder pessoal.\nMortificação: identificar onde o coração busca poder para controlar ou impressionar.\nVivificação: confiar no poder de Deus que opera na fraqueza (2 Co 12.9).\nCrescimento: exercer influência como servo, não como senhor.',
  },

  eclesial: {
    whatIs: 'As implicações do tema para a vida da Igreja — culto, pregação, sacramentos, comunhão fraterna e disciplina eclesiástica.',
    whyMatters: 'O tema bíblico não é propriedade privada — ele molda como a congregação vive junta, adora, decide e serve.',
    howInfluences: 'Forma uma comunidade que encarna o tema, não apenas o ensina — transformando a Igreja em testemunho vivo da revelação.',
    questions: [
      'Como o tema deve moldar a forma como a Igreja toma decisões?',
      'Que implicações há para a pregação e o ensino regular?',
      'O tema afeta como nos relacionamos uns com os outros na comunhão?',
      'Que práticas eclesiásticas são desafiadas ou confirmadas pelo tema?',
    ],
    example: 'Tema: O Poder como Senhor\n\nCulto: proclamar a soberania de Deus sobre toda autoridade humana.\nLiderança: líderes servem, não dominam (1 Pe 5.2-3).\nComunhão: relações sem hierarquia opressiva — irmãos em Cristo.\nDisciplina: exercida com humildade e restauração, não com poder punitivo.',
  },

  missional: {
    whatIs: 'As implicações do tema para a missão da Igreja — evangelismo, missão transcultural e expansão do reino de Deus no mundo.',
    whyMatters: 'Todo tema bíblico tem dimensão missionária. A Igreja existe para ser instrumento do reino, e o tema ilumina como esse reino avança.',
    howInfluences: 'Conecta o estudo teológico ao mandato missionário, mostrando que a teologia não é fim em si mesma, mas serve à gloria de Deus entre as nações.',
    questions: [
      'Como o tema ilumina o coração do evangelismo?',
      'De que forma o tema é relevante em diferentes contextos culturais?',
      'Que distorções do tema precisam ser confrontadas no campo missionário?',
      'Como a esperança escatológica do tema motiva a missão?',
    ],
    example: 'Tema: O Poder como Senhor\n\nEvangelismo: o evangelho liberta de toda escravidão ao poder — dinheiro, status, política.\nMissão: a Igreja vai às nações não com poder imperial, mas com a fraqueza do evangelho.\nContextualização: cada cultura tem sua forma de idolatria do poder — o tema é universalmente relevante.\nEsperança: pregamos o Rei que já venceu e voltará para consumar seu reino.',
  },

  // ── ESTUDO DOUTRINÁRIO — CAMPOS PRINCIPAIS ───────────────────────────────

  nome_doutrina: {
    whatIs: 'O nome técnico e preciso da doutrina que será estudada, situando-a no sistema da teologia cristã reformada.',
    whyMatters: 'O nome correto situa a doutrina no mapa teológico e evita confusões com temas adjacentes ou com distorções históricas do mesmo termo.',
    howInfluences: 'Orienta toda a pesquisa e garante que o interlocutor saiba exatamente qual doutrina está sendo examinada.',
    questions: [
      'Qual é o nome técnico desta doutrina na tradição reformada?',
      'Existem nomes alternativos usados por diferentes tradições?',
      'Em qual lócus da teologia sistemática ela se encaixa?',
    ],
    example: 'Doutrina: Justificação pela Fé Somente\n\nNome técnico: Sola Fide — justificação forense pela fé, sem obras.\nLócus: Soteriologia.\nNomes relacionados: imputação da justiça de Cristo, declaração de justo, reconciliação.',
  },

  questao_central: {
    whatIs: 'A pergunta teológica central que a doutrina responde — o problema humano ou divino que ela endereça.',
    whyMatters: 'Toda doutrina nasce de uma pergunta. Sem identificar a questão, a doutrina se torna uma resposta sem pergunta — sem poder pastoral.',
    howInfluences: 'Define a relevância e a urgência da doutrina para a vida da Igreja e para cada ouvinte.',
    questions: [
      'Qual problema humano fundamental esta doutrina responde?',
      'O que estaria perdido se esta doutrina fosse negada?',
      'Qual a pergunta que a congregação traz que esta doutrina responde?',
    ],
    example: 'Doutrina: Justificação\n\nQuestão central: "Como pode um pecador ser declarado justo diante de um Deus santo?" (Jó 9.2; Rm 3.23).',
  },

  tese_central: {
    whatIs: 'A afirmação doutrinária central — a proposta que o estudo argumentará e demonstrará a partir das Escrituras e da tradição reformada.',
    whyMatters: 'A tese organiza todo o argumento. Sem ela, o estudo é uma coleção de informações sem direção ou poder persuasivo.',
    howInfluences: 'Cada seção do estudo deve servir à tese — explicar, provar ou aplicar o que a tese afirma.',
    questions: [
      'A tese é clara e específica o suficiente para ser provada?',
      'Ela nasce do estudo bíblico ou foi imposta de fora?',
      'Pode ser contestada? Se não, não é uma tese, é um truísmo.',
      'A tese está alinhada com a questão central?',
    ],
    example: 'Doutrina: Justificação\n\nTese: "A justificação é um ato forense de Deus pelo qual o pecador é declarado justo com base na imputação da justiça de Cristo, recebida somente pela fé."',
  },

  erros_historicos: {
    whatIs: 'Os principais erros históricos e heresias que distorceram a doutrina ao longo da história da Igreja.',
    whyMatters: 'Conhecer os erros históricos protege a Igreja de repeti-los e aguça a percepção para distorções contemporâneas com roupagem nova.',
    howInfluences: 'Permite apresentar a doutrina ortodoxa em contraste claro com suas negações, fortalecendo a clareza e a convicção.',
    questions: [
      'Quais são as heresias clássicas relacionadas a esta doutrina?',
      'Como os Concílios e Confissões responderam a esses erros?',
      'Existem versões contemporâneas desses erros antigos?',
      'Quais erros são mais prevalentes no contexto atual?',
    ],
    example: 'Doutrina: Justificação\n\nPelagianismo: a justificação depende das obras humanas.\nSemipelagianismo: cooperação entre graça e mérito humano.\nAntinomismo: a justificação elimina toda obrigação moral.\nNPP (Nova Perspectiva): redução da justificação a questão étnica.',
  },

  visoes_concorrentes: {
    whatIs: 'As principais posições teológicas que divergem da formulação reformada sobre esta doutrina, com suas argumentações.',
    whyMatters: 'Entender posições opostas fortalece a própria convicção e habilita o teólogo a dialogar com fidelidade e respeito.',
    howInfluences: 'Evita o erro de combater espantalhos teológicos e garante que a defesa da doutrina seja honesta e robusta.',
    questions: [
      'Como a Igreja Católica Romana formula esta doutrina diferentemente?',
      'Que visões evangélicas alternativas existem dentro do protestantismo?',
      'Qual é o argumento mais forte das posições opostas?',
      'Como a posição reformada responde a esse argumento mais forte?',
    ],
    example: 'Doutrina: Justificação\n\nRoma: justificação é infusão de graça + cooperação humana — processo contínuo.\nArminianismo: justificação condicionada à fé prevista.\nNPP: justificação como inclusão no povo do pacto.\nResposta reformada: Rm 3.28; Gl 2.16 — "não pelas obras da lei".',
  },

  relacoes_doutrinarias: {
    whatIs: 'Como esta doutrina se relaciona com outras doutrinas do sistema teológico — dependências, implicações e tensões.',
    whyMatters: 'A teologia é orgânica. Isolar uma doutrina do sistema produz desequilíbrio. Ela precisa ser lida em conjunto com as doutrinas que a sustentam e as que ela sustenta.',
    howInfluences: 'Mostra a coerência interna do sistema teológico reformado e previne que um tema seja enfatizado de forma que distorça outros.',
    questions: [
      'Esta doutrina pressupõe quais outras doutrinas?',
      'Que doutrinas dependem desta para manter seu sentido?',
      'Existe tensão com alguma doutrina que precisa ser equilibrada?',
      'Como esta doutrina fortalece o sistema como um todo?',
    ],
    example: 'Doutrina: Justificação\n\nPressupõe: eleição soberana, depravação total, expiação substitutiva.\nSustenta: santificação (o justificado é transformado), assurance (certeza da salvação), perseverança dos santos.\nEquilíbrio: justificação não elimina santificação — fé que justifica também santifica.',
  },

  // ── ESTUDO DE CARTA ───────────────────────────────────────────────────────

  divisao_epistolar: {
    whatIs: 'A estrutura interna da carta — como o autor a organiza em seções, blocos e movimentos argumentativos.',
    whyMatters: 'Cartas bíblicas têm estrutura retórica deliberada. Entender a divisão revela a lógica do autor e evita interpretações que isolam versículos do argumento.',
    howInfluences: 'Permite ver onde a passagem se encaixa no argumento maior e o que o autor já disse antes que informa o que está sendo dito agora.',
    questions: [
      'Quais são as grandes divisões da carta e seus marcadores textuais?',
      'Existe uma estrutura indicativo-imperativo clara?',
      'Como a saudação e o encerramento se relacionam com o corpo da carta?',
      'Onde exatamente a perícope estudada se encaixa nesta estrutura?',
    ],
    example: 'Carta: Efésios\n\nDivisão: 1-3 (indicativo — bênçãos espirituais, graça, mistério) | 4-6 (imperativo — viver de forma digna do chamado).\nConexão: o "portanto" de 4.1 liga toda a ética ao fundamento teológico dos capítulos anteriores.',
  },

  macroargumento: {
    whatIs: 'O argumento principal da carta inteira — a tese central que o autor desenvolve do início ao fim.',
    whyMatters: 'Nenhuma passagem existe isolada. O macroargumento é o contexto mais amplo que dá sentido a cada seção e verso.',
    howInfluences: 'Permite interpretar passagens ambíguas à luz do propósito declarado do autor e evita leituras que contradizem o argumento maior.',
    questions: [
      'O que o autor quer provar ou comunicar ao longo de toda a carta?',
      'Existe uma tese explícita ou ela precisa ser inferida?',
      'Como cada seção principal contribui para o argumento central?',
      'A perícope estudada é premissa, desenvolvimento ou conclusão do macroargumento?',
    ],
    example: 'Carta: Romanos\n\nMacroargumento: "O evangelho é o poder de Deus para a salvação de todo aquele que crê — judeu e grego — porque nele a justiça de Deus é revelada" (Rm 1.16-17). Toda a carta expande e defende esta proposição.',
  },

  situacao: {
    whatIs: 'A situação concreta dos destinatários — seus problemas, conflitos, perguntas e necessidades pastorais que motivaram a carta.',
    whyMatters: 'Cartas são respostas a situações reais. Sem entender a situação, a carta parece uma coleção de ideias abstratas em vez de palavra pastoral precisa.',
    howInfluences: 'Explica por que o autor enfatiza certas coisas, usa certo tom e aborda certos temas — tudo faz sentido à luz da situação.',
    questions: [
      'Que crise, pergunta ou confusão os destinatários enfrentavam?',
      'Existem evidências internas da situação na própria carta?',
      'Como a situação moldou o tom — apologético, pastoral, polêmico?',
      'Que parte da situação é permanente e qual é específica àquela comunidade?',
    ],
    example: 'Carta: Gálatas\n\nSituação: judaizantes exigindo circuncisão dos convertidos. Paulo confronta a distorção do evangelho (Gl 1.6-9). O tom é urgente e polêmico porque o que está em jogo é o próprio evangelho.',
  },

  relacao_autor: {
    whatIs: 'A relação do autor com os destinatários — pastoral, apostólica, afetiva, polêmica — e como essa relação molda o conteúdo e o tom.',
    whyMatters: 'Cartas bíblicas são comunicação pessoal com história. A relação entre autor e destinatário carrega autoridade, afeto, tensão ou urgência que afeta a interpretação.',
    howInfluences: 'Explica mudanças de tom dentro da carta, a intensidade emocional de certas passagens e a autoridade com que o autor fala.',
    questions: [
      'Qual é a história da relação do autor com essa comunidade?',
      'O autor está satisfeito, preocupado, magoado ou confiante com os destinatários?',
      'A relação dá ou limita a autoridade do autor?',
      'Como a relação afeta a interpretação de passagens específicas?',
    ],
    example: 'Carta: Filipenses\n\nRelação: Paulo e a Igreja de Filipos têm laço de parceria e afeto profundo. A carta é a mais pessoal e calorosa de Paulo — não há nenhuma correção doutrinária séria, apenas encorajamento e gratidão.',
  },

}

export function getCardHelp(cardId: string): CardHelp | undefined {
  return CARD_HELP[cardId]
}
