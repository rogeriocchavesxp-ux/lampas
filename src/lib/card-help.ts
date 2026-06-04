// Ajuda contextual por card ID
// Três perguntas para cada campo: o que é, por que importa, como influencia a mensagem.

export interface CardHelp {
  whatIs: string
  whyMatters: string
  howInfluences: string
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

}

export function getCardHelp(cardId: string): CardHelp | undefined {
  return CARD_HELP[cardId]
}
