import { COMMUNICATION_SECTIONS } from './communication-sections'
import { PRODUCTION_HELP_CONTENT } from './production-help-content'

export interface HelpEntry {
  id: string
  titulo: string
  descricao: string
  objetivo: string
  comoFazer: string[]
  perguntas: string[]
  erros: string[]
  exemplo: string
  ajudaIA: string
  dicasAvancadas?: string[]
}

type HelpCategory = 'contextual' | 'textual' | 'teologico' | 'homiletica' | 'estilo' | 'memoria' | 'entrega'

interface HelpSeed {
  id: string
  titulo: string
  categoria: HelpCategory
  foco: string
  exemplo: string
}

const HELP_SEEDS: HelpSeed[] = [
  { id: 'periodo_data', titulo: 'Período e data de composição do livro', categoria: 'contextual', foco: 'a data provável, o período histórico e as evidências internas e externas que sustentam essa localização', exemplo: 'Em Gálatas 1.6-9, a urgência contra outro evangelho ajuda a discutir se a carta se relaciona ao período anterior ou posterior ao concílio de Jerusalém.' },
  { id: 'contexto_politico', titulo: 'Contexto político do texto', categoria: 'contextual', foco: 'os poderes, conflitos, governos e pressões públicas que formam o pano de fundo do texto', exemplo: 'Em Lucas 2.1-7, o decreto de César Augusto mostra que o nascimento de Cristo ocorre sob a ordem imperial romana, mas a narrativa afirma a soberania de Deus sobre esse cenário.' },
  { id: 'contexto_religioso', titulo: 'Ambiente religioso pressuposto pelo texto', categoria: 'contextual', foco: 'o ambiente religioso, suas crenças concorrentes e as práticas que o autor pressupõe ou confronta', exemplo: 'Em 1 Coríntios 8.1-13, o conhecimento sobre ídolos e refeições em templos precisa ser lido contra o paganismo urbano de Corinto.' },
  { id: 'cultura_costumes', titulo: 'Cultura e costumes do mundo bíblico', categoria: 'contextual', foco: 'costumes, instituições e hábitos cotidianos que eram conhecidos pelos primeiros ouvintes', exemplo: 'Em João 13.1-17, o lava-pés ganha força quando entendido como serviço humilde normalmente reservado a servos.' },
  { id: 'geografia', titulo: 'Elementos geográficos relevantes', categoria: 'contextual', foco: 'lugares, distâncias, rotas, fronteiras e características físicas que influenciam a leitura do texto', exemplo: 'Em João 4.3-10, a passagem por Samaria não é mero detalhe geográfico; ela carrega tensão étnica e missão redentora.' },
  { id: 'estrutura_social', titulo: 'Estruturas sociais, patronato, honra e vergonha', categoria: 'contextual', foco: 'hierarquias, relações de patronato, honra-vergonha, escravidão, família e cidadania presentes no texto', exemplo: 'Em Filemom 8-20, a relação entre Paulo, Filemom e Onésimo deve ser lida à luz da escravidão antiga e das relações de honra.' },
  { id: 'autor', titulo: 'Identidade e perfil do autor', categoria: 'contextual', foco: 'quem escreve, sua autoridade, formação, vocação e relação pastoral com os destinatários', exemplo: 'Em Romanos 1.1-7, Paulo se apresenta como servo, apóstolo e separado para o evangelho, moldando a autoridade da carta.' },
  { id: 'questoes_autoria', titulo: 'Debates acadêmicos sobre autoria', categoria: 'contextual', foco: 'as principais discussões sobre autoria, pseudonímia, secretários, tradição e evidências textuais', exemplo: 'Em 2 Pedro 1.1 e 3.1-2, as declarações internas devem ser consideradas ao avaliar debates modernos sobre autoria petrina.' },
  { id: 'destinatarios', titulo: 'Quem são os destinatários', categoria: 'contextual', foco: 'a comunidade receptora, sua localização, composição religiosa, condição social e relação com o autor', exemplo: 'Em 1 Pedro 1.1, os destinatários são peregrinos dispersos em regiões específicas, o que informa o tema de identidade no exílio.' },
  { id: 'situacao_destinatarios', titulo: 'Situação concreta dos destinatários', categoria: 'contextual', foco: 'crises, sofrimentos, confusões doutrinárias, tentações e necessidades pastorais dos primeiros leitores', exemplo: 'Em Hebreus 10.32-39, a fadiga diante da perseguição ajuda a explicar os avisos e encorajamentos do livro.' },
  { id: 'ocasiao', titulo: 'Ocasião que motivou a escrita', categoria: 'contextual', foco: 'o evento, problema ou necessidade pastoral que parece ter motivado a composição do texto', exemplo: 'Em Judas 3-4, a presença de falsos mestres explica por que a carta exorta a batalhar pela fé entregue aos santos.' },
  { id: 'proposito_declarado', titulo: 'Propósito explicitamente declarado', categoria: 'contextual', foco: 'declarações explícitas do autor sobre por que escreveu e que resposta desejava produzir', exemplo: 'Em João 20.30-31, o autor declara que escreveu para que os leitores creiam que Jesus é o Cristo e tenham vida em seu nome.' },
  { id: 'proposito_implicito', titulo: 'Objetivos implícitos do texto', categoria: 'contextual', foco: 'intenções pastorais, apologéticas, polêmicas ou doxológicas que aparecem pela organização do argumento', exemplo: 'Em Filipenses 2.1-11, mesmo sem uma frase de propósito formal, Paulo busca formar humildade comunitária a partir do padrão de Cristo.' },
  { id: 'genero_livro', titulo: 'Gênero literário do livro', categoria: 'contextual', foco: 'o gênero predominante do livro e as convenções que orientam sua leitura', exemplo: 'Em Salmos 23.1-6, reconhecer poesia impede transformar imagens pastorais em descrições literais e empobrecedoras.' },
  { id: 'genero_pericope', titulo: 'Gênero específico da perícope', categoria: 'contextual', foco: 'a forma literária específica da unidade estudada dentro do livro maior', exemplo: 'Em Lucas 15.11-32, identificar a parábola orienta a buscar a força narrativa principal, não correspondências alegóricas em cada detalhe.' },
  { id: 'implicacoes_hermeneuticas', titulo: 'Regras hermenêuticas do gênero', categoria: 'contextual', foco: 'como o gênero permite, limita e direciona as decisões interpretativas', exemplo: 'Em Apocalipse 12.1-6, o gênero apocalíptico exige atenção a símbolos canônicos antes de leituras jornalísticas do texto.' },
  { id: 'divisoes_principais', titulo: 'Estrutura macro do livro', categoria: 'contextual', foco: 'as divisões principais do livro, seus marcadores e sua progressão literária', exemplo: 'Em Efésios, a transição de 1-3 para 4-6 mostra a passagem da indicativa graça de Deus para a vida digna do chamado.' },
  { id: 'localizacao_pericope', titulo: 'Onde a perícope se situa no livro', categoria: 'contextual', foco: 'a localização da passagem na estrutura maior e sua relação com o que vem antes e depois', exemplo: 'Em Romanos 12.1-2, a perícope se apoia nas misericórdias expostas em Romanos 1-11 e inaugura a seção ética da carta.' },
  { id: 'argumento_livro', titulo: 'Tese central do livro', categoria: 'contextual', foco: 'a tese ou movimento central do livro e a contribuição da perícope para esse todo', exemplo: 'Em Marcos 10.45, o serviço e o resgate oferecidos pelo Filho do Homem condensam a cristologia e o caminho do discipulado em Marcos.' },
  { id: 'limites_pericope', titulo: 'Versículo inicial e final', categoria: 'textual', foco: 'o começo e o fim da unidade literária que será interpretada', exemplo: 'Em Romanos 3.21-26, a expressão "mas agora" marca uma nova unidade argumentativa depois da universalidade do pecado.' },
  { id: 'marcadores_delimitacao', titulo: 'Partículas e conectivos que delimitam', categoria: 'textual', foco: 'marcadores textuais que sinalizam transição, continuidade, contraste ou fechamento', exemplo: 'Em Efésios 2.11, o "portanto" liga a nova seção à salvação pela graça em 2.1-10 e introduz a reconciliação dos gentios.' },
  { id: 'conexao_contexto', titulo: 'Ligação com o contexto imediato', categoria: 'textual', foco: 'a relação da perícope com a unidade anterior e posterior', exemplo: 'Em Mateus 6.19-24, tesouros, olhos e senhores se conectam ao ensino maior sobre piedade diante do Pai.' },
  { id: 'minha_traducao', titulo: 'Tradução própria do original', categoria: 'textual', foco: 'sua tradução de trabalho a partir do hebraico ou grego, com decisões justificadas', exemplo: 'Em Efésios 5.18, traduzir o imperativo "enchei-vos do Espírito" exige preservar a ideia de ação contínua e comunitária.' },
  { id: 'variantes_textuais', titulo: 'Variantes manuscritas relevantes', categoria: 'textual', foco: 'leituras variantes que podem afetar tradução, interpretação ou ênfase', exemplo: 'Em Marcos 16.9-20, a questão do final longo ilustra como crítica textual afeta a delimitação e a pregação responsável.' },
  { id: 'comparacao_versoes', titulo: 'Diferenças entre versões modernas', categoria: 'textual', foco: 'como traduções modernas resolvem dificuldades lexicais, sintáticas ou textuais', exemplo: 'Em Romanos 3.25, comparar "propiciação" e "sacrifício de expiação" mostra decisões teológicas e lexicais importantes.' },
  { id: 'verbos_principais', titulo: 'Verbos principais com análise morfológica', categoria: 'textual', foco: 'os verbos que carregam a ação, ordem, promessa ou argumento do texto', exemplo: 'Em Mateus 28.19-20, o imperativo central "fazei discípulos" governa os particípios de ir, batizar e ensinar.' },
  { id: 'substantivos_casos', titulo: 'Substantivos e seus casos gramaticais', categoria: 'textual', foco: 'substantivos decisivos, seus casos, artigos e relações sintáticas', exemplo: 'Em Efésios 2.8, "graça" e "fé" precisam ser examinadas em sua construção para evitar leituras simplistas do dom de Deus.' },
  { id: 'estrutura_sintatica', titulo: 'Diagrama da estrutura da frase', categoria: 'textual', foco: 'a organização sintática de sujeito, predicado, modificadores e orações subordinadas', exemplo: 'Em Colossenses 1.15-20, mapear a sintaxe do hino ajuda a enxergar a supremacia de Cristo na criação e na redenção.' },
  { id: 'particulas_conectivos', titulo: 'Partículas e conectivos no original', categoria: 'textual', foco: 'partículas como γάρ, δέ, οὖν, כִּי e conectores que organizam a lógica do texto', exemplo: 'Em Romanos 5.1, o "portanto" apresenta a consequência da justificação pela fé desenvolvida nos capítulos anteriores.' },
  { id: 'termo_1', titulo: 'Análise do 1º termo-chave', categoria: 'textual', foco: 'o primeiro termo lexicalmente decisivo da perícope, analisado por definição, uso, contexto e testemunho', exemplo: 'Em Romanos 3.24, "justificados" exige análise lexical e teológica cuidadosa para distinguir declaração forense de transformação moral.' },
  { id: 'termo_2', titulo: 'Análise do 2º termo-chave', categoria: 'textual', foco: 'o segundo termo-chave, especialmente sua contribuição para o argumento local', exemplo: 'Em João 3.16, "mundo" deve ser interpretado no uso joanino e no contexto da missão salvadora de Deus.' },
  { id: 'termo_3', titulo: 'Análise do 3º termo-chave', categoria: 'textual', foco: 'o terceiro termo-chave, com atenção ao campo semântico e ao limite imposto pelo contexto', exemplo: 'Em Gálatas 5.16, "carne" precisa ser lido como esfera de oposição a Deus, não apenas corpo físico.' },
  { id: 'esboço_estrutural', titulo: 'Esboço interno da perícope', categoria: 'textual', foco: 'as subdivisões internas e a progressão da unidade estudada', exemplo: 'Em Salmo 1.1-6, o contraste entre justo e ímpio organiza o esboço e culmina nos dois caminhos diante do Senhor.' },
  { id: 'dispositivos_literarios', titulo: 'Quiasmo, inclusio, paralelismo e outros dispositivos', categoria: 'textual', foco: 'recursos literários que dão ênfase, beleza e estrutura ao texto', exemplo: 'Em Filipenses 2.6-11, o movimento de humilhação e exaltação estrutura a cristologia do hino.' },
  { id: 'analise_narrativa', titulo: 'Narrador, enredo e personagens', categoria: 'textual', foco: 'elementos narrativos como cenário, tensão, personagens, clímax e resolução', exemplo: 'Em Marcos 4.35-41, a tempestade, o medo dos discípulos e a autoridade de Jesus conduzem à pergunta: "Quem é este?".' },
  { id: 'argumento_epistola', titulo: 'Lógica argumentativa da epístola', categoria: 'textual', foco: 'premissas, inferências, exortações e conclusões no argumento epistolar', exemplo: 'Em Romanos 6.1-14, Paulo responde a uma objeção e argumenta que a união com Cristo torna incoerente viver no pecado.' },
  { id: 'contexto_intralivro', titulo: 'Relação com outras passagens do livro', categoria: 'teologico', foco: 'como temas, termos e argumentos reaparecem no mesmo livro', exemplo: 'Em João 15.1-8, a videira deve ser lida junto às imagens de vida, permanência e fruto ao longo do evangelho.' },
  { id: 'citacoes_alusoes_at', titulo: 'Uso do Antigo Testamento pelo autor', categoria: 'teologico', foco: 'citações, alusões e ecos do Antigo Testamento presentes na perícope', exemplo: 'Em Mateus 2.15, Oseias 11.1 é usado para apresentar Jesus como o Filho que recapitula e cumpre a história de Israel.' },
  { id: 'ecos_nt', titulo: 'Paralelos e ecos no Novo Testamento', categoria: 'teologico', foco: 'relações da passagem com outros textos neotestamentários', exemplo: 'Em 1 Pedro 2.9-10, ecos de Êxodo 19 e Oséias se unem a temas que reaparecem em Apocalipse 1.6.' },
  { id: 'posicao_historia_redencao', titulo: 'Lugar na história da redenção', categoria: 'teologico', foco: 'o estágio da revelação redentora em que a passagem se encontra', exemplo: 'Em Êxodo 12.1-14, a Páscoa pertence ao êxodo histórico e também prepara a compreensão cristológica de Cristo como Cordeiro.' },
  { id: 'tipologia', titulo: 'Tipos e antítipos', categoria: 'teologico', foco: 'pessoas, eventos e instituições que apontam organicamente para cumprimento redentor', exemplo: 'Em Números 21.4-9, a serpente levantada é interpretada por Jesus em João 3.14-15 como tipo de sua própria elevação.' },
  { id: 'promessa_cumprimento', titulo: 'Padrão promessa-cumprimento', categoria: 'teologico', foco: 'promessas, antecipações e cumprimentos na progressão canônica', exemplo: 'Em 2 Samuel 7.12-16, a promessa davídica prepara a esperança messiânica cumprida em Cristo, o Filho de Davi.' },
  { id: 'grande_ideia', titulo: 'Grande Ideia exegética', categoria: 'teologico', foco: 'a sentença que une sujeito e complemento para resumir a afirmação central do texto', exemplo: 'Em Romanos 3.21-26, a Grande Ideia pode afirmar que Deus revela sua justiça salvando pecadores pela redenção em Cristo.' },
  { id: 'mensagem_texto', titulo: 'Mensagem central do texto', categoria: 'teologico', foco: 'o que Deus comunica por meio do texto aos destinatários originais e à igreja', exemplo: 'Em Efésios 2.8-10, a mensagem central une graça soberana, fé e boas obras preparadas por Deus.' },
  { id: 'conceito_ensina', titulo: 'Verdade que o texto afirma positivamente', categoria: 'teologico', foco: 'a doutrina, virtude ou realidade que o texto estabelece ou aprofunda', exemplo: 'Em João 10.27-30, o texto ensina a segurança das ovelhas nas mãos do Filho e do Pai.' },
  { id: 'conceitos_confronta', titulo: 'Erros que o texto corrige', categoria: 'teologico', foco: 'falsas crenças, pecados ou distorções que a passagem confronta', exemplo: 'Em Tiago 2.14-26, o texto confronta uma profissão de fé sem fruto obediente.' },
  { id: 'sujeito_homilet', titulo: 'Sujeito do sermão', categoria: 'homiletica', foco: 'a pergunta temática que o sermão inteiro responderá', exemplo: 'Em Salmo 23, o sujeito pode ser: "Como o Senhor pastoreia o seu povo em cada estação da vida?".' },
  { id: 'complemento_homilet', titulo: 'Complemento do sermão', categoria: 'homiletica', foco: 'a resposta completa que o sermão dá ao sujeito', exemplo: 'Para Salmo 23, o complemento pode mostrar que o Senhor guia, sustenta, corrige e recebe seu povo em comunhão segura.' },
  { id: 'grande_ideia_homilet', titulo: 'Grande Ideia Homilética completa', categoria: 'homiletica', foco: 'a formulação pregável, clara e memorável da verdade central', exemplo: 'Em Efésios 2.1-10, uma Grande Ideia Homilética pode ser: "A graça de Deus ressuscita mortos para uma vida de boas obras".' },
  { id: 'proposicao', titulo: 'Proposição proclamatória do sermão', categoria: 'homiletica', foco: 'a afirmação que anuncia o caminho do sermão ao ouvinte', exemplo: 'Em Romanos 8.1-4, a proposição pode declarar: "Este texto nos chama a descansar na condenação removida por Cristo".' },
  { id: 'gancho', titulo: 'Abertura que captura atenção', categoria: 'homiletica', foco: 'a primeira ponte entre a vida do ouvinte e a tensão do texto', exemplo: 'Em Mateus 11.28-30, o gancho pode partir do cansaço moderno para conduzir ao convite de Cristo ao descanso.' },
  { id: 'necessidade', titulo: 'Necessidade concreta do ouvinte', categoria: 'homiletica', foco: 'a dor, dúvida, pecado ou anseio que o texto trata pastoralmente', exemplo: 'Em 1 Pedro 5.6-11, a necessidade pode ser ansiedade sob sofrimento e resistência fiel ao adversário.' },
  { id: 'assunto_intro', titulo: 'Apresentação do assunto antes do texto', categoria: 'homiletica', foco: 'a ponte que nomeia o tema e prepara a leitura bíblica', exemplo: 'Em Lucas 19.1-10, a introdução pode apresentar o tema da graça que busca quem todos desprezam.' },
  { id: 'leitura_texto', titulo: 'Como introduzir a leitura bíblica', categoria: 'homiletica', foco: 'a contextualização mínima e reverente antes da leitura pública', exemplo: 'Antes de ler Neemias 8.1-12, vale situar o povo retornado do exílio e a centralidade da Palavra na renovação da aliança.' },
  { id: 'ponto1', titulo: 'Primeiro ponto principal do sermão', categoria: 'homiletica', foco: 'a primeira divisão textual que inicia o desenvolvimento da Grande Ideia', exemplo: 'Em João 15.1-8, o primeiro ponto pode ancorar-se em Cristo como a videira verdadeira.' },
  { id: 'ponto2', titulo: 'Segundo ponto principal do sermão', categoria: 'homiletica', foco: 'a segunda divisão textual que avança, contrasta ou aprofunda o argumento', exemplo: 'Em João 15.1-8, o segundo ponto pode desenvolver a necessidade de permanecer em Cristo para frutificar.' },
  { id: 'ponto3', titulo: 'Terceiro ponto do sermão', categoria: 'homiletica', foco: 'uma terceira divisão usada somente se o texto realmente a sustenta', exemplo: 'Em João 15.1-8, um terceiro ponto pode tratar da glória do Pai no fruto dos discípulos.' },
  { id: 'avaliacao_estrutura', titulo: 'Avaliação crítica da estrutura', categoria: 'homiletica', foco: 'a revisão da coerência, paralelismo e fidelidade textual dos pontos', exemplo: 'Em Romanos 12.1-2, a estrutura deve mostrar a lógica de consagração, não transformar o texto em três conselhos desconectados.' },
  { id: 'transicao_intro_p1', titulo: 'Transição da introdução para o ponto 1', categoria: 'homiletica', foco: 'a frase ou parágrafo que leva o ouvinte da necessidade inicial ao primeiro movimento do texto', exemplo: 'Em Marcos 2.1-12, a transição pode sair da necessidade de perdão para a autoridade de Jesus revelada no milagre.' },
  { id: 'transicao_1_2', titulo: 'Transição do ponto 1 para o ponto 2', categoria: 'homiletica', foco: 'a conexão lógica que resume o primeiro ponto e abre o segundo', exemplo: 'Em Filipenses 2.5-11, a transição pode mover da humilhação voluntária de Cristo para sua exaltação pelo Pai.' },
  { id: 'transicao_2_3', titulo: 'Transição do ponto 2 para o ponto 3', categoria: 'homiletica', foco: 'a passagem fluida para o terceiro movimento quando ele é necessário', exemplo: 'Em Habacuque 3.17-19, a transição pode mover da perda concreta para a alegria confiante no Deus da salvação.' },
  { id: 'aplicacao_crenca', titulo: 'O que o ouvinte deve crer', categoria: 'homiletica', foco: 'a mudança de convicção exigida pelo texto', exemplo: 'Em Romanos 8.31-39, o ouvinte deve crer que nenhuma acusação ou sofrimento separa os eleitos do amor de Deus em Cristo.' },
  { id: 'aplicacao_pratica', titulo: 'O que o ouvinte deve fazer', categoria: 'homiletica', foco: 'a resposta obediente, concreta e específica à verdade pregada', exemplo: 'Em Tiago 1.19-27, a aplicação prática inclui ouvir com mansidão e praticar a Palavra em ações verificáveis.' },
  { id: 'aplicacao_cristologica', titulo: 'Cristo como centro e motivação', categoria: 'homiletica', foco: 'como a pessoa e obra de Cristo fundamentam a obediência', exemplo: 'Em Efésios 4.32, perdoar é motivado pelo perdão recebido em Cristo, não por mera cordialidade moral.' },
  { id: 'ilustracoes', titulo: 'Histórias e analogias ilustrativas', categoria: 'homiletica', foco: 'imagens, histórias e comparações que tornam a verdade visível sem tomar o lugar do texto', exemplo: 'Em Lucas 15.20, uma ilustração sobre reconciliação familiar pode ajudar, desde que sirva à compaixão do pai na parábola.' },
  { id: 'sintese_final', titulo: 'Síntese do argumento completo', categoria: 'homiletica', foco: 'a retomada breve da Grande Ideia e dos movimentos principais', exemplo: 'Em 1 Coríntios 15.50-58, a síntese deve ligar ressurreição futura, vitória de Cristo e firmeza presente no trabalho do Senhor.' },
  { id: 'apelo', titulo: 'Apelo final à resposta', categoria: 'homiletica', foco: 'o chamado pastoral, bíblico e específico para responder ao texto', exemplo: 'Em Isaías 55.1-7, o apelo deve chamar a vir, ouvir e buscar o Senhor enquanto se pode achar.' },
  { id: 'encerramento', titulo: 'Frase memorável de encerramento', categoria: 'homiletica', foco: 'a última sentença que fixa a verdade central na memória da congregação', exemplo: 'Em Judas 24-25, o encerramento pode deixar o ouvinte com a certeza de que Deus é poderoso para guardar seu povo de tropeçar.' },
  { id: 'nivel_linguagem', titulo: 'Nível de linguagem para o auditório', categoria: 'estilo', foco: 'o registro de linguagem adequado à congregação real que ouvirá o sermão', exemplo: 'Em Romanos 5.1, "justificação" pode ser explicado como o veredito gracioso de Deus que declara o pecador aceito em Cristo.' },
  { id: 'jargao_teologico', titulo: 'Como tratar termos técnicos', categoria: 'estilo', foco: 'termos teológicos indispensáveis e sua explicação clara', exemplo: 'Em 1 João 2.2, "propiciação" pode ser explicado sem diluir a ideia de ira santa satisfeita pela obra de Cristo.' },
  { id: 'clareza_frases', titulo: 'Revisão de clareza e concisão', categoria: 'estilo', foco: 'frases longas, ambíguas ou abstratas que precisam ser reescritas', exemplo: 'Em vez de dizer "a realidade soteriológica paulina se manifesta", em Efésios 2.8 diga: "Deus nos salva pela graça, não pelo mérito".' },
  { id: 'metaforas_analogias', titulo: 'Metáforas que iluminam a verdade', categoria: 'estilo', foco: 'analogias fiéis que ajudam o ouvinte a enxergar o ensino bíblico', exemplo: 'Em Hebreus 6.19, a própria imagem da âncora pode organizar uma metáfora pastoral sobre esperança firme em Cristo.' },
  { id: 'imagens_concretas', titulo: 'Imagens do cotidiano', categoria: 'estilo', foco: 'cenas e objetos familiares que tornam ideias abstratas mais tangíveis', exemplo: 'Em João 10.27-30, a imagem de mãos que guardam comunica segurança sem precisar abandonar a linguagem do texto.' },
  { id: 'recursos_retoricos', titulo: 'Anáfora, antítese, clímax e outros recursos', categoria: 'estilo', foco: 'recursos de linguagem que reforçam a progressão e a persuasão do sermão', exemplo: 'Em Romanos 8.38-39, a repetição de pares opostos inspira uma cadência retórica sobre a inseparabilidade do amor de Deus.' },
  { id: 'tom_geral', titulo: 'Tom predominante do sermão', categoria: 'estilo', foco: 'a atmosfera pastoral dominante exigida pelo texto', exemplo: 'Em Lamentações 3.21-24, o tom deve carregar dor real e esperança perseverante nas misericórdias do Senhor.' },
  { id: 'variacao_tonal', titulo: 'Onde o tom muda', categoria: 'estilo', foco: 'mudanças planejadas entre confronto, consolo, celebração, advertência e convite', exemplo: 'Em 2 Samuel 12.1-13, o tom passa da narrativa indireta ao confronto profético e depois à gravidade do arrependimento.' },
  { id: 'voz_pregador', titulo: 'Equilíbrio entre autoridade e ternura pastoral', categoria: 'estilo', foco: 'a postura verbal do pregador diante do texto e da congregação', exemplo: 'Em Gálatas 6.1-2, a voz precisa corrigir o pecado com mansidão e convocar a comunidade a carregar fardos.' },
  { id: 'esboço_pulpito', titulo: 'Esboço simplificado para o púlpito', categoria: 'memoria', foco: 'uma versão enxuta do sermão para orientar a pregação sem prender o pregador ao manuscrito', exemplo: 'Em Mateus 6.25-34, o esboço de púlpito pode caber em três âncoras: Pai, reino e hoje.' },
  { id: 'palavras_ancora', titulo: 'Palavra-âncora por ponto', categoria: 'memoria', foco: 'palavras ou imagens que acionam a memória de cada movimento do sermão', exemplo: 'Em Salmo 46, âncoras como refúgio, rio e quietude podem lembrar a lógica do salmo.' },
  { id: 'logica_fluxo', titulo: 'Fluxo narrativo do sermão', categoria: 'memoria', foco: 'a história interna do argumento em linguagem simples e memorizável', exemplo: 'Em Lucas 24.13-35, o fluxo pode seguir de esperança frustrada para Escrituras abertas e coração aquecido.' },
  { id: 'plano_pratica', titulo: 'Quando e como praticar', categoria: 'memoria', foco: 'um plano de prática em voz alta, revisão e ajuste antes da pregação', exemplo: 'Para pregar Romanos 8.28-30, pratique especialmente a cadência da cadeia dourada para comunicar segurança sem pressa.' },
  { id: 'pontos_vulneraveis', titulo: 'Onde pode travar', categoria: 'memoria', foco: 'trechos, transições ou argumentos que podem falhar durante a entrega', exemplo: 'Em Hebreus 7.1-10, a explicação de Melquisedeque pode travar se não houver uma frase-ponte clara para a superioridade de Cristo.' },
  { id: 'preparacao_espiritual', titulo: 'Oração e preparo espiritual', categoria: 'memoria', foco: 'o preparo do coração do pregador diante de Deus e da congregação', exemplo: 'Antes de pregar 2 Coríntios 4.7-18, ore para crer na suficiência do poder de Deus em vasos frágeis.' },
  { id: 'projecao_articulacao', titulo: 'Projeção vocal e dicção', categoria: 'entrega', foco: 'volume, clareza, pronúncia e articulação das palavras-chave', exemplo: 'Em Efésios 1.3-14, a longa bênção exige articulação cuidadosa para que a congregação acompanhe a riqueza do período.' },
  { id: 'variacao_ritmo', titulo: 'Aceleração e desaceleração', categoria: 'entrega', foco: 'ritmo vocal que acompanha a tensão, o descanso e o peso do texto', exemplo: 'Em Marcos 5.21-43, o ritmo pode acelerar na urgência de Jairo e desacelerar no encontro com a mulher enferma.' },
  { id: 'enfase_pausas', titulo: 'Pausas dramáticas intencionais', categoria: 'entrega', foco: 'silêncios, repetições e ênfases que ajudam a verdade a assentar', exemplo: 'Em Romanos 8.1, uma pausa após "nenhuma condenação" permite que o peso pastoral da afirmação seja sentido.' },
  { id: 'postura_presenca', titulo: 'Postura no púlpito', categoria: 'entrega', foco: 'presença física, estabilidade e movimento a serviço da mensagem', exemplo: 'Em Neemias 8.1-8, a postura pública diante da Palavra pode comunicar reverência sem teatralidade.' },
  { id: 'gestos', titulo: 'Gestos intencionais e tiques', categoria: 'entrega', foco: 'gestos que reforçam ideias e maneirismos que distraem', exemplo: 'Em 1 Coríntios 13.1-7, gestos abertos podem acompanhar a descrição paciente do amor, evitando movimentos repetitivos que roubem atenção.' },
  { id: 'contato_visual', titulo: 'Distribuição do olhar', categoria: 'entrega', foco: 'contato visual que inclui a congregação e mantém conexão pastoral', exemplo: 'Em Isaías 40.1-11, alternar olhar direto nos imperativos de consolo ajuda a congregação a receber a palavra pastoral.' },
  { id: 'auto_avaliacao', titulo: 'Reflexão pós-pregação', categoria: 'entrega', foco: 'avaliação honesta da fidelidade textual, clareza, aplicação e entrega', exemplo: 'Depois de pregar Atos 2.37-41, avalie se o chamado ao arrependimento foi claro e fundamentado no texto.' },
  { id: 'feedback_recebido', titulo: 'Feedback da congregação', categoria: 'entrega', foco: 'comentários de ouvintes e mentores que revelam como o sermão foi recebido', exemplo: 'Após pregar Filipenses 4.4-9, pergunte se a congregação entendeu a relação entre oração, paz e disciplina da mente.' },
  { id: 'crescimento_continuo', titulo: 'Área de desenvolvimento', categoria: 'entrega', foco: 'uma habilidade específica a ser cultivada nas próximas pregações', exemplo: 'Depois de pregar Provérbios 3.5-6, talvez a área de crescimento seja tornar aplicações sapienciais mais concretas e menos genéricas.' },

  // ── NARRATIVAS BÍBLICAS ───────────────────────────────────────────────────
  { id: 'personagem_central', titulo: 'Personagem central', categoria: 'textual', foco: 'quem é o protagonista da narrativa e como o narrador o apresenta — nome, posição, traços diretos e indiretos', exemplo: 'Em Gênesis 37, José é apresentado como o filho favorito, jovem, sonhador — traços que já preparam o conflito com os irmãos.' },
  { id: 'personagens_secundarios', titulo: 'Personagens secundários', categoria: 'textual', foco: 'os demais personagens e a função dramática de cada um na trama', exemplo: 'Em Gênesis 37, os irmãos funcionam como antagonistas coletivos, e Rúben e Judá se destacam como vozes que moderam a violência do grupo.' },
  { id: 'desenvolvimento_personagem', titulo: 'Desenvolvimento e mudança', categoria: 'textual', foco: 'se e como os personagens mudam ao longo da narrativa, e o que provoca essa transformação', exemplo: 'Judá muda de quem propôs vender o irmão (Gênesis 37) para quem se oferece como fiador de Benjamim (Gênesis 44) — uma transformação de caráter que o texto acompanha de perto.' },
  { id: 'caracterizacao_indireta', titulo: 'Caracterização indireta', categoria: 'textual', foco: 'o que ações, diálogos, reações e silêncios revelam sobre os personagens sem o narrador afirmar diretamente', exemplo: 'O choro repetido de José diante dos irmãos (Gênesis 42-45) revela, sem narração explícita, a profundidade do perdão que ele está processando.' },
  { id: 'exposicao', titulo: 'Exposição', categoria: 'textual', foco: 'a situação inicial — quem, onde, quando e que condição ou tensão já está presente no início', exemplo: 'Gênesis 37.1-4 estabelece a família, o favoritismo de Jacó e o ódio dos irmãos antes mesmo do primeiro sonho ser contado.' },
  { id: 'complicacao_conflito', titulo: 'Complicação e conflito', categoria: 'textual', foco: 'o problema ou tensão que move a narrativa para frente — entre personagens, com Deus, interno ou circunstancial', exemplo: 'O conflito em Gênesis 37 é o ciúme dos irmãos pelos sonhos de José, que escala até a venda como escravo.' },
  { id: 'climax_virada', titulo: 'Clímax e virada', categoria: 'textual', foco: 'o momento de maior tensão ou o ponto sem retorno que transforma a situação', exemplo: 'Em Gênesis 45.3-4, "Eu sou José, vosso irmão" é a virada que transforma toda a narrativa de vingança potencial em reconciliação.' },
  { id: 'resolucao_lacunas', titulo: 'Resolução e lacunas', categoria: 'textual', foco: 'como a tensão é resolvida, e que lacunas o narrador deixa deliberadamente em aberto', exemplo: 'Gênesis 50.15-21 resolve o medo dos irmãos, mas deixa em aberto detalhes emocionais do processo de perdão — uma lacuna que convida reflexão, não preenchimento especulativo.' },
  { id: 'lugares', titulo: 'Lugares e simbolismo geográfico', categoria: 'textual', foco: 'os lugares mencionados e seu peso simbólico ou teológico dentro da narrativa', exemplo: 'A descida de José ao Egito (Gênesis 37.28) antecipa, em miniatura, a futura descida e libertação de todo o povo de Israel.' },
  { id: 'tempo_narrativo', titulo: 'Tempo e ritmo narrativo', categoria: 'textual', foco: 'onde o narrador acelera o tempo (resumo) e onde desacelera (cena detalhada), e por quê', exemplo: 'Treze anos de escravidão de José são resumidos em poucos versículos (Gênesis 39-40), mas o encontro com os irmãos (Gênesis 42-45) se estende em cena detalhada — o narrador desacelera onde quer que o leitor sinta o peso emocional.' },
  { id: 'movimento_espacial', titulo: 'Movimento espacial', categoria: 'textual', foco: 'os deslocamentos dos personagens entre lugares e o que cada movimento sinaliza na trama', exemplo: 'A ida e volta dos irmãos entre Canaã e o Egito (Gênesis 42-44) estrutura toda a segunda metade da narrativa de José.' },
  { id: 'onisciencia', titulo: 'Onisciência e limitação', categoria: 'textual', foco: 'o que o narrador revela ao leitor que os personagens da história não sabem, e o efeito disso', exemplo: 'O leitor sabe que José reconheceu os irmãos (Gênesis 42.7-8) antes que eles saibam quem ele é — essa diferença de conhecimento cria a tensão dramática de toda a cena.' },
  { id: 'ponto_de_vista', titulo: 'Ponto de vista e julgamento', categoria: 'textual', foco: 'de que ângulo a história é contada, e que avaliação implícita o narrador faz dos personagens e eventos', exemplo: 'O narrador de Gênesis nunca condena explicitamente os irmãos, mas a estrutura da narrativa — culpa, sofrimento, confissão — já comunica julgamento moral sem precisar declará-lo.' },
  { id: 'vida_interior', titulo: 'Acesso à vida interior', categoria: 'textual', foco: 'os raros momentos em que o narrador revela pensamentos ou emoções internas de um personagem', exemplo: 'Gênesis 43.30 revela diretamente que José "se enterneceu" por seu irmão e teve de se retirar para chorar — um raro acesso à sua vida interior.' },
  { id: 'funcao_dialogo', titulo: 'Função do diálogo', categoria: 'textual', foco: 'o que as falas dos personagens revelam ou fazem avançar na trama, além de transmitir informação', exemplo: 'O discurso de Judá em Gênesis 44.18-34 não é só informativo — é o que finalmente convence José a se revelar, sendo o ponto de virada emocional da cena.' },
  { id: 'silencio_omissao', titulo: 'Silêncio e omissão', categoria: 'textual', foco: 'o que o narrador escolhe não contar, e o efeito interpretativo dessa omissão', exemplo: 'O texto nunca narra os sentimentos de Jacó ao saber que José "morreu" — o silêncio aumenta o peso do luto sem precisar descrevê-lo.' },
  { id: 'ironia_dramatica', titulo: 'Ironia dramática', categoria: 'textual', foco: 'situações em que o leitor sabe algo que os personagens da cena não sabem, criando tensão ou significado adicional', exemplo: 'Os irmãos se inclinam diante do "egípcio" sem saber que estão diante do próprio José — cumprindo, sem saber, os sonhos que tanto odiaram (Gênesis 42.6).' },
  { id: 'nr_vg_tema', titulo: 'Tema provável', categoria: 'teologico', foco: 'a síntese provisória do que a narrativa parece tratar, antes da investigação completa confirmar ou ajustar essa impressão', exemplo: 'Em uma primeira leitura de Gênesis 37-50, o tema provável pode ser "a providência de Deus operando através do sofrimento e da traição humana".' },
  { id: 'nr_vg_estrutura', titulo: 'Estrutura percebida', categoria: 'textual', foco: 'a divisão inicial da narrativa em cenas ou blocos, percebida antes da análise detalhada', exemplo: 'Uma primeira leitura de Gênesis 37-50 pode perceber três blocos: a queda de José, sua ascensão no Egito, e o reencontro com a família.' },
  { id: 'nr_vg_personagens', titulo: 'Personagens', categoria: 'textual', foco: 'a lista inicial de quem participa da narrativa, antes da análise detalhada de caracterização', exemplo: 'José, Jacó, os dez irmãos mais velhos, Benjamim e Potifar aparecem como os personagens centrais de Gênesis 37-50.' },
  { id: 'nr_vg_movimento', titulo: 'Movimento do texto', categoria: 'teologico', foco: 'a direção geral para onde a narrativa parece caminhar — de que situação para que situação', exemplo: 'Gênesis 37-50 se move de uma família fragmentada pelo ciúme para uma família reconciliada pela providência de Deus e o perdão de José.' },
  { id: 'nr_ctx_hist_main', titulo: 'Contexto Histórico', categoria: 'contextual', foco: 'o período, a cultura e as circunstâncias históricas em que a narrativa se passa', exemplo: 'A venda de José como escravo (Gênesis 37.28) reflete práticas comerciais reais do Bronze Médio entre Canaã e o Egito, o que ajuda a situar a história em seu mundo histórico real, não em um cenário genérico.' },
  { id: 'nr_ctx_lit_main', titulo: 'Contexto Literário', categoria: 'contextual', foco: 'como a narrativa se conecta com o que vem antes e depois dela dentro do livro', exemplo: 'A história de José conclui o livro de Gênesis e explica como a família da promessa (Abraão, Isaque, Jacó) termina morando no Egito — preparando o cenário para o Êxodo.' },
  { id: 'nr_ctx_can_main', titulo: 'Contexto Canônico', categoria: 'contextual', foco: 'como a narrativa se relaciona com o restante da Bíblia e com o plano redentivo mais amplo', exemplo: 'A frase de José "Deus a tornou em bem" (Gênesis 50.20) ecoa em Romanos 8.28 e prepara teologicamente a compreensão cristã da providência divina sobre o mal.' },
  { id: 'nr_txt_orig_main', titulo: 'Texto Original', categoria: 'textual', foco: 'observações sobre o hebraico ou grego original que afetam a leitura da narrativa', exemplo: 'O verbo hebraico usado quando José "se enterneceu" (Gênesis 43.30) carrega a ideia de comoção física profunda, mais intensa do que "ficou emocionado" sugere em português.' },
  { id: 'nr_txt_struct_main', titulo: 'Estrutura do Texto', categoria: 'textual', foco: 'a organização interna da unidade narrativa estudada — cenas, blocos e progressão', exemplo: 'Gênesis 42-45 se estrutura em três visitas dos irmãos ao Egito, cada uma elevando a tensão até a revelação final.' },
  { id: 'nr_txt_exeg_main', titulo: 'Observações Exegéticas', categoria: 'textual', foco: 'detalhes textuais específicos que sustentam ou esclarecem a interpretação da cena', exemplo: 'O detalhe de José se retirar para chorar sozinho, mais de uma vez (Gênesis 43.30; 45.2), mostra um padrão emocional que merece atenção exegética, não é só um detalhe incidental.' },
  { id: 'nr_txt_msg_main', titulo: 'Mensagem para os Primeiros Ouvintes', categoria: 'contextual', foco: 'o que esta narrativa comunicava a Israel quando foi originalmente recebida como Escritura', exemplo: 'Para Israel no deserto ou no exílio, a história de José comunicava que Deus permanece fiel à família da promessa mesmo em meio à traição e ao exílio no Egito.' },
  { id: 'nr_teo_redentor_main', titulo: 'Relação com a História da Redenção', categoria: 'teologico', foco: 'em que ponto da história da redenção a narrativa se situa e como ela avança o plano de Deus', exemplo: 'A providência sobre José prepara a descida de Israel ao Egito, palco necessário para o futuro Êxodo e a formação do povo da aliança.' },
  { id: 'nr_teo_doc_main', titulo: 'Doutrinas Ensinadas', categoria: 'teologico', foco: 'as verdades doutrinárias que a narrativa afirma ou ilustra, sem forçar lições alheias ao texto', exemplo: 'Gênesis 37-50 ensina a providência soberana de Deus sobre o mal humano, sem nunca minimizar a realidade real do pecado dos irmãos.' },
  { id: 'nr_teo_impl_main', titulo: 'Implicações para a Vida', categoria: 'teologico', foco: 'o que a verdade teológica da narrativa implica para a fé e a prática do leitor hoje', exemplo: 'Se Deus estava no controle mesmo na cova e na prisão de José, o cristão pode confiar na providência de Deus em situações de injustiça e sofrimento aparente sem sentido.' },
  { id: 'nr_ivg_ideia_main', titulo: 'Grande Ideia', categoria: 'teologico', foco: 'a frase única que resume a afirmação central da narrativa para fins de pregação ou ensino', exemplo: 'Em Gênesis 37-50, a Grande Ideia pode ser: "Deus governa soberanamente até a traição e o sofrimento humanos para cumprir seus propósitos redentores."' },
  { id: 'nr_ivg_verd_main', titulo: 'Verdades Centrais', categoria: 'teologico', foco: 'as duas ou três verdades que sustentam e desenvolvem a Grande Ideia', exemplo: 'Deus permanece soberano mesmo quando parece ausente; o sofrimento não é sinal de abandono divino; o perdão genuíno reflete o caráter de Deus.' },
  { id: 'nr_ivg_aplic_main', titulo: 'Aplicações Principais', categoria: 'homiletica', foco: 'as respostas concretas que a Grande Ideia exige de quem ouve ou lê a narrativa', exemplo: 'Confiar na providência de Deus em circunstâncias injustas; buscar reconciliação genuína, como José, em vez de vingança.' },
  { id: 'deus_na_narrativa', titulo: 'Deus na narrativa', categoria: 'teologico', foco: 'como Deus age, fala ou se revela dentro da história — diretamente ou por trás dos eventos', exemplo: 'Deus nunca fala diretamente em Gênesis 37-45, mas José o reconhece como agente por trás de cada reviravolta (Gênesis 45.5-8) — Deus age na narrativa mesmo quando não aparece em cena.' },
  { id: 'condicao_humana', titulo: 'A condição humana', categoria: 'teologico', foco: 'o que a narrativa revela sobre o pecado, a fraqueza ou a dignidade humana através dos personagens', exemplo: 'O ciúme dos irmãos, a soberba inicial de José e a culpa que os atormenta por anos expõem com realismo a condição humana caída e a necessidade de graça.' },
  { id: 'grande_narrativa', titulo: 'Conexão com a grande narrativa', categoria: 'teologico', foco: 'como esta história específica se encaixa na metanarrativa bíblica de criação, queda, redenção e consumação', exemplo: 'A descida de José ao Egito antecipa, em escala familiar, o padrão maior de exílio e libertação que culmina na obra redentora de Cristo.' },
  { id: 'preparar_observacoes_livres', titulo: 'Observações livres', categoria: 'textual', foco: 'o registro espontâneo do que mais chama atenção numa primeira leitura, antes de qualquer análise estruturada', exemplo: 'Numa primeira leitura de Gênesis 37, pode chamar atenção o quanto o ódio dos irmãos escala rápido — de incômodo a planejar um assassinato em poucos versículos.' },
  { id: 'preparar_perguntas_dificuldades', titulo: 'Perguntas e dificuldades', categoria: 'textual', foco: 'as dúvidas, tensões ou pontos obscuros que a primeira leitura já revela e que precisarão de investigação', exemplo: 'Por que Jacó nunca pareceu investigar a história suspeita da túnica ensanguentada (Gênesis 37.31-35)? É uma pergunta que merece investigação mais adiante.' },
  { id: 'preparar_conexoes_iniciais', titulo: 'Conexões iniciais', categoria: 'teologico', foco: 'os primeiros vínculos percebidos com outras partes da Bíblia, antes de uma análise canônica completa', exemplo: 'A cova em que José é lançado (Gênesis 37.24) já evoca, numa primeira leitura, outros poços e covas bíblicos ligados a morte e ressurreição simbólica.' },

  // ── CAMPOS GENÉRICOS COMPARTILHADOS ENTRE MODOS ──────────────────────────
  { id: 'contexto_historico_geral', titulo: 'Contexto Histórico', categoria: 'contextual', foco: 'o período, a cultura e as circunstâncias históricas em que o texto foi escrito', exemplo: 'Em Amós 1-2, o contexto histórico de prosperidade e segurança militar em Israel ajuda a explicar por que as advertências do profeta soaram tão chocantes.' },
  { id: 'contexto_literario_geral', titulo: 'Contexto Literário', categoria: 'contextual', foco: 'como a passagem se conecta com o que vem antes e depois dela dentro do livro', exemplo: 'O Salmo 23 segue o lamento do Salmo 22 — a confiança pastoral do Salmo 23 ganha mais peso quando lido depois do clamor de abandono que o precede.' },
  { id: 'contexto_canonico_geral', titulo: 'Contexto Canônico', categoria: 'contextual', foco: 'como a passagem se relaciona com o restante da Bíblia e com o plano redentivo mais amplo', exemplo: 'A imagem do Senhor como pastor (Salmo 23) reaparece em Ezequiel 34 e culmina em Jesus se identificando como o Bom Pastor (João 10.11).' },
  { id: 'defesa_pericope', titulo: 'Observações Exegéticas', categoria: 'textual', foco: 'os detalhes textuais específicos que sustentam a delimitação e a leitura da unidade escolhida', exemplo: 'Em Êxodo 20.1-17, o prólogo histórico ("que te tirei da terra do Egito") antes dos mandamentos é uma observação exegética chave para entender a lógica de toda a lei.' },
  { id: 'traducao_propria', titulo: 'Tradução Própria', categoria: 'textual', foco: 'sua tradução de trabalho do hebraico ou grego, com decisões justificadas diante de alternativas', exemplo: 'Em Amós 5.24, traduzir o verbo hebraico como "role a justiça como as águas" (em vez de apenas "corra") preserva a força da imagem de algo abundante e incontrolável.' },
  { id: 'obs_gramaticais', titulo: 'Observações Gramaticais e Sintáticas', categoria: 'textual', foco: 'aspectos gramaticais do original que afetam o sentido ou a ênfase da passagem', exemplo: 'O imperativo repetido em Êxodo 20.3-17 marca cada mandamento como ordem direta de um soberano, não sugestão ou conselho.' },
  { id: 'esboco_mecanico', titulo: 'Estrutura do Texto', categoria: 'textual', foco: 'a organização interna da passagem — divisões, progressão e blocos de pensamento', exemplo: 'Os Dez Mandamentos se dividem em dois blocos: deveres para com Deus (20.3-11) e deveres para com o próximo (20.12-17).' },
  { id: 'genero_subgenero', titulo: 'Definição de Gênero e Subgênero Literário', categoria: 'textual', foco: 'o gênero e subgênero específico da passagem, e as convenções de leitura que esse gênero exige', exemplo: 'Amós 1-2 usa o subgênero "oráculo contra as nações" — reconhecer isso evita ler os capítulos como lista solta de acusações desconectadas.' },
  { id: 'comentario_exegetico', titulo: 'Comentário Exegético', categoria: 'textual', foco: 'a síntese exegética que une observações textuais, gramaticais e estruturais em uma leitura coerente da passagem', exemplo: 'O comentário exegético de Salmo 23 une a imagem pastoral, a estrutura de confiança-provisão-presença e o vocabulário hebraico de descanso em uma leitura unificada.' },
  { id: 'mensagem_epoca', titulo: 'Mensagem para a Época da Escrita', categoria: 'contextual', foco: 'o que o texto comunicava aos primeiros ouvintes ou leitores, antes de qualquer aplicação posterior', exemplo: 'Para Israel próspero do século VIII a.C., Amós comunicava que prosperidade sem justiça social provocaria o juízo de Deus, não sua aprovação.' },
  { id: 'dispositivos_retoricos', titulo: 'Dispositivos retóricos', categoria: 'textual', foco: 'recursos de linguagem — repetição, exagero retórico, pergunta retórica — que reforçam a mensagem do texto', exemplo: 'A pergunta retórica "Pode andar dois juntos, se não houver acordo entre eles?" (Amós 3.3) prepara o leitor para a inevitabilidade do juízo anunciado.' },
  { id: 'tipo_paralelismo', titulo: 'Paralelismo', categoria: 'textual', foco: 'o tipo de paralelismo poético usado — sinônimo, antitético ou sintético — e o efeito que produz', exemplo: 'Salmo 23.1 usa paralelismo sinônimo: "o Senhor é o meu pastor" e "nada me faltará" reforçam-se mutuamente, não acrescentam ideias novas.' },
  { id: 'estrutura_estrofica', titulo: 'Estrutura estrófica', categoria: 'textual', foco: 'a divisão do poema em estrofes ou unidades de pensamento, e a progressão entre elas', exemplo: 'Salmo 23 se organiza em três movimentos: o pastor no campo (v.1-3), o vale (v.4) e a mesa do banquete (v.5-6).' },
  { id: 'imagens_metaforas', titulo: 'Imagens e metáforas', categoria: 'textual', foco: 'as imagens poéticas centrais e o que cada uma comunica sobre o tema do poema', exemplo: 'O "vale de sombra de morte" (Salmo 23.4) não é só lugar perigoso — é metáfora para qualquer experiência de medo extremo atravessada com Deus presente.' },
  { id: 'quiasmo_inclusio_poetico', titulo: 'Quiasmo e inclusio', categoria: 'textual', foco: 'estruturas espelhadas ou repetições de abertura/fechamento que organizam o poema', exemplo: 'A presença de Deus emoldura o Salmo 23 do início ("o Senhor é meu pastor") ao fim ("habitarei na casa do Senhor"), funcionando como inclusio temático.' },
  { id: 'campos_semanticos', titulo: 'Campos semânticos', categoria: 'textual', foco: 'os grupos de palavras relacionadas que o poema usa para construir um campo de sentido coerente', exemplo: 'Salmo 23 usa vocabulário pastoral — pastagens, águas tranquilas, vara, cajado — formando um campo semântico único de cuidado e provisão.' },
  { id: 'tipo_oraculo', titulo: 'Tipo de oráculo', categoria: 'textual', foco: 'a forma profética específica da passagem — juízo, salvação, ai, disputa — e o que essa forma sinaliza', exemplo: 'Amós 5.18-20 é um "oráculo de ai" — forma que anuncia juízo justamente sobre quem esperava bênção (o "Dia do Senhor").' },
  { id: 'estrutura_profetica', titulo: 'Estrutura profética', categoria: 'textual', foco: 'a organização interna do oráculo — acusação, sentença, motivo — típica da literatura profética', exemplo: 'Amós 2.6-16 segue o padrão acusação (injustiça social) seguida de sentença (juízo) seguida de motivo (a aliança quebrada).' },
  { id: 'acusacoes_pecados', titulo: 'Acusações e denúncia', categoria: 'teologico', foco: 'os pecados específicos que o profeta denuncia, nomeados com precisão, não generalizados', exemplo: 'Amós denuncia especificamente a opressão do pobre, a corrupção judicial e o luxo construído sobre injustiça (Amós 2.6-8) — não "pecado" em abstrato.' },
  { id: 'promessas_salvacao', titulo: 'Promessas e salvação', categoria: 'teologico', foco: 'as promessas de restauração ou salvação que acompanham ou seguem o anúncio de juízo', exemplo: 'Depois de capítulos de juízo, Amós 9.11-15 promete a restauração da "tenda caída de Davi" — o juízo nunca é a última palavra de Deus.' },
  { id: 'cumprimento_progressivo', titulo: 'Cumprimento progressivo', categoria: 'teologico', foco: 'como a promessa ou profecia se desenvolve e se cumpre em etapas ao longo da história da redenção', exemplo: 'A promessa da "tenda caída de Davi" restaurada (Amós 9.11) é citada em Atos 15.16-17 como cumprida no acesso dos gentios pela igreja de Cristo.' },
  { id: 'visoes_simbolos', titulo: 'Visões e símbolos', categoria: 'textual', foco: 'as imagens visionárias e simbólicas do texto, e o que cada símbolo representava para os primeiros ouvintes', exemplo: 'O cesto de frutas de verão na visão de Amós 8.1-2 é um trocadilho em hebraico entre "verão" e "fim" — o símbolo anuncia que o fim chegou.' },
  { id: 'estrutura_ciclos', titulo: 'Estrutura e ciclos', categoria: 'textual', foco: 'padrões repetidos ou ciclos de juízo-restauração que organizam um livro profético maior', exemplo: 'Amós estrutura seus oráculos contra as nações em ciclo crescente (Amós 1-2), terminando em Israel — o ouvinte só percebe que é o alvo final ao chegar lá.' },
  { id: 'imagens_cosmicas', titulo: 'Imagens cósmicas', categoria: 'textual', foco: 'linguagem de abalo da criação — sol, terra, céus — usada para comunicar a magnitude do juízo ou da salvação de Deus', exemplo: 'Amós 8.9 anuncia que o sol se porá ao meio-dia — linguagem cósmica que comunica a gravidade do juízo, não necessariamente um evento astronômico literal.' },
  { id: 'escatologia', titulo: 'Dimensão escatológica', categoria: 'teologico', foco: 'como a passagem aponta para o julgamento final ou a consumação completa do plano de Deus', exemplo: 'O "Dia do Senhor" em Amós 5.18-20 antecipa o juízo final que o Novo Testamento liga ao retorno de Cristo (2 Pedro 3.10).' },
  { id: 'forma_sapiencial', titulo: 'Forma sapiencial', categoria: 'textual', foco: 'o tipo de literatura sapiencial da passagem — provérbio, instrução paterna, reflexão — e suas convenções próprias', exemplo: 'Provérbios 3.5-6 usa a forma de instrução paterna direta ("Confia... e não te estribes"), comum em toda a primeira parte do livro.' },
  { id: 'paralelos_contraste', titulo: 'Paralelos e contraste', categoria: 'textual', foco: 'comparações entre o sábio e o tolo, ou entre dois caminhos, típicas da literatura sapiencial', exemplo: 'Provérbios 1-9 contrasta repetidamente o caminho da sabedoria com o caminho da insensatez, personificados como duas mulheres que convidam o jovem leitor.' },
  { id: 'aplicacao_sapiencial', titulo: 'Aplicação prática', categoria: 'homiletica', foco: 'a tradução da observação sapiencial em conduta concreta para a vida cotidiana', exemplo: 'Confiar no Senhor "de todo o coração" (Provérbios 3.5) se aplica concretamente a decisões financeiras, profissionais e de relacionamento que hoje tentamos resolver só com cálculo próprio.' },
  { id: 'base_teologica_sap', titulo: 'Base teológica', categoria: 'teologico', foco: 'o fundamento doutrinário que sustenta o conselho sapiencial — por que esse caminho é sábio diante de Deus', exemplo: 'Provérbios 3.5-6 não ensina apenas pragmatismo — ensina que a ordem confiável do mundo reflete a sabedoria do próprio Criador.' },
  { id: 'tipo_lei', titulo: 'Tipo de lei', categoria: 'contextual', foco: 'a categoria da lei estudada — moral, civil ou cerimonial — que orienta como ela se aplica hoje', exemplo: 'O mandamento "não furtarás" (Êxodo 20.15) é lei moral, permanente, diferente das leis cerimoniais cumpridas em Cristo (Hebreus 10.1).' },
  { id: 'contexto_aliancal', titulo: 'Contexto alianção', categoria: 'contextual', foco: 'como a lei se insere na aliança entre Deus e seu povo, e não como regra isolada', exemplo: 'Os Dez Mandamentos são dados depois da libertação do Egito (Êxodo 20.2) — a obediência responde à graça da aliança, não a precede.' },
  { id: 'principio_etico', titulo: 'Princípio ético', categoria: 'teologico', foco: 'o princípio moral permanente por trás do mandamento específico, aplicável além do contexto original', exemplo: 'Por trás de "não cobiçarás" (Êxodo 20.17) está o princípio permanente de que o coração descontente é a raiz de muitos outros pecados.' },
  { id: 'hermeneutica_crista', titulo: 'Hermenêutica cristã', categoria: 'teologico', foco: 'como ler e aplicar a lei do Antigo Testamento à luz do cumprimento de Cristo', exemplo: 'Cristo cumpre a lei (Mateus 5.17) — isso significa que o cristão obedece à lei moral por amor e gratidão, não para se justificar diante de Deus.' },
  { id: 'implicacoes_tb', titulo: 'Relação com a História da Redenção', categoria: 'teologico', foco: 'como o tema ou texto se conecta com o desenvolvimento progressivo do plano redentivo de Deus', exemplo: 'A aliança do Sinai (Êxodo 20) se conecta às alianças anteriores com Abraão e Noé, e antecipa a nova aliança selada por Cristo (Jeremias 31.31-34; Lucas 22.20).' },
  { id: 'implicacoes_ts', titulo: 'Doutrinas Ensinadas', categoria: 'teologico', foco: 'as doutrinas sistemáticas que o texto afirma, conectadas ao todo da fé cristã', exemplo: 'Êxodo 20 ensina a santidade de Deus, a natureza moral de sua lei e a necessidade de um mediador entre Deus santo e povo pecador.' },
  { id: 'implicacoes_tp', titulo: 'Implicações para a Vida', categoria: 'teologico', foco: 'como a verdade teológica do texto deve moldar a fé e a prática concretas do leitor hoje', exemplo: 'Se a lei revela o caráter de Deus, obedecer aos mandamentos hoje é um ato de adoração e gratidão, não um esforço para merecer salvação.' },

  // ── PREPARAR / VISÃO GERAL (campos genéricos de início de estudo) ────────
  { id: 'preparar_oracao', titulo: 'Oração', categoria: 'memoria', foco: 'o pedido específico de iluminação e dependência de Deus antes de começar a estudar o texto', exemplo: 'Antes de estudar Filipenses 2.5-11, orar pedindo que o Espírito revele a humildade de Cristo de forma que confronte o orgulho do próprio coração, não só o intelecto.' },
  { id: 'preparar_objetivo_estudo', titulo: 'Objetivo do estudo', categoria: 'homiletica', foco: 'o que você pretende alcançar com este estudo específico — para si mesmo ou para quem vai ensinar', exemplo: 'O objetivo ao estudar Filipenses 2.5-11 pode ser entender a lógica da humilhação e exaltação de Cristo para fundamentar um chamado à humildade na igreja.' },
  { id: 'preparar_ocasiiao_publico', titulo: 'Ocasião e público', categoria: 'contextual', foco: 'quem vai receber este estudo e em que contexto, o que molda o nível e a ênfase da preparação', exemplo: 'Um estudo de Filipenses 2.5-11 para líderes de pequeno grupo pode enfatizar mais a aplicação prática de humildade do que a análise do hino cristológico em si.' },
  { id: 'preparar_leitura_lenta', titulo: 'Leitura', categoria: 'textual', foco: 'a leitura cuidadosa e repetida do texto antes de qualquer ferramenta ou comentário', exemplo: 'Ler Filipenses 2.5-11 em voz alta três vezes, prestando atenção ao movimento de descida (humilhação) e subida (exaltação) antes de consultar qualquer comentário.' },
  { id: 'preparar_comparacao_traducoes', titulo: 'Comparação', categoria: 'textual', foco: 'a comparação entre diferentes traduções para notar onde elas divergem e por quê', exemplo: 'Comparar como ACF, NVI e NAA traduzem "não reteve" ou "esvaziou-se" em Filipenses 2.7 revela decisões interpretativas importantes sobre a humilhação de Cristo.' },
  { id: 'preparar_ideia_inicial', titulo: 'Ideia Central', categoria: 'teologico', foco: 'a primeira impressão sobre o que o texto afirma, antes da investigação detalhada confirmar ou ajustar essa leitura', exemplo: 'Uma primeira impressão de Filipenses 2.5-11 pode ser: "Cristo é o modelo supremo de humildade que devemos imitar".' },
  { id: 'preparar_tensoes_repeticoes', titulo: 'Tensões', categoria: 'textual', foco: 'contradições aparentes, palavras repetidas ou tensões que a leitura inicial já revela', exemplo: 'A tensão entre "não reteve" e "Deus o exaltou" em Filipenses 2.6-9 já chama atenção numa primeira leitura — humilhação e exaltação parecem opostos, mas o texto os une.' },
  { id: 'preparar_marcacoes', titulo: 'Marcações e destaques', categoria: 'textual', foco: 'palavras, conectivos ou repetições marcadas fisicamente no texto para orientar a análise posterior', exemplo: 'Marcar os verbos de movimento ("esvaziou-se", "humilhou-se", "exaltou") em Filipenses 2.6-9 evidencia visualmente a estrutura de descida e subida do hino.' },
  { id: 'preparar_modo_imersao', titulo: 'Modo Imersão', categoria: 'textual', foco: 'um modo de leitura mais lento e contemplativo, sem pressa de produzir conclusões', exemplo: 'Ler Filipenses 2.5-11 em modo imersão pode significar passar 15 minutos só observando, sem ainda escrever nenhuma conclusão interpretativa.' },
  { id: 'preparar_tema_provavel', titulo: 'Tema provável', categoria: 'teologico', foco: 'a hipótese inicial sobre o assunto central do texto, sujeita a confirmação na investigação', exemplo: 'O tema provável de Filipenses 2.5-11 pode ser "a mente de Cristo como padrão de humildade cristã".' },
  { id: 'preparar_grande_ideia_inicial', titulo: 'Grande ideia inicial', categoria: 'teologico', foco: 'um primeiro rascunho da Grande Ideia do texto, a ser refinado depois da investigação completa', exemplo: 'Rascunho inicial: "Porque Cristo se humilhou e foi exaltado, os cristãos devem ter a mesma disposição de humildade entre si."' },
  { id: 'preparar_estrutura_percebida', titulo: 'Estrutura percebida', categoria: 'textual', foco: 'a divisão inicial do texto em partes, percebida antes da análise estrutural detalhada', exemplo: 'Uma primeira leitura de Filipenses 2.5-11 percebe dois movimentos: a humilhação de Cristo (v.6-8) e sua exaltação por Deus (v.9-11).' },
  { id: 'preparar_vg_impressoes', titulo: 'Primeiras impressões', categoria: 'textual', foco: 'o registro espontâneo do que mais impacta numa primeira leitura do texto', exemplo: 'A primeira impressão de Filipenses 2.5-11 costuma ser o contraste chocante entre a posição divina de Cristo e sua disposição de se tornar servo.' },
  { id: 'preparar_vg_perguntas', titulo: 'Perguntas iniciais', categoria: 'textual', foco: 'as perguntas que surgem espontaneamente na primeira leitura e que guiarão a investigação', exemplo: '"O que significa exatamente Cristo não ter retido a forma de Deus?" é uma pergunta inicial legítima sobre Filipenses 2.6 que merece investigação.' },
  { id: 'preparar_vg_dificuldades', titulo: 'Dificuldades percebidas', categoria: 'textual', foco: 'os pontos do texto que parecem obscuros, difíceis ou teologicamente delicados já na primeira leitura', exemplo: '"Esvaziou-se a si mesmo" (Filipenses 2.7) é uma frase que historicamente gerou debate teológico sobre o que exatamente Cristo "esvaziou" — uma dificuldade real a investigar.' },
  { id: 'preparar_vg_observacoes', titulo: 'Observações pessoais', categoria: 'textual', foco: 'anotações livres e pessoais sobre o texto, sem compromisso ainda com uma interpretação final', exemplo: 'Observação pessoal: o hino de Filipenses 2.5-11 parece estruturado como poesia, mesmo dentro de uma carta em prosa — isso já sinaliza algo sobre sua função retórica.' },
  { id: 'preparar_personagens', titulo: 'Personagens', categoria: 'textual', foco: 'as pessoas ou figuras presentes no texto e o papel inicial percebido de cada uma', exemplo: 'Em Filipenses 2.5-11, os personagens são Cristo (sujeito da ação) e Deus Pai (quem exalta) — poucos, mas teologicamente centrais.' },
  { id: 'investigar_vg_lugares', titulo: 'Lugares', categoria: 'textual', foco: 'os lugares mencionados ou implícitos no texto e sua relevância para a interpretação', exemplo: 'Filipenses 2.5-11 não menciona lugares geográficos, mas a "forma de Deus" e a "terra" funcionam como espaços teológicos — céu e terra — que estruturam o movimento do hino.' },
  { id: 'investigar_vg_termos_chave', titulo: 'Termos-chave', categoria: 'textual', foco: 'as palavras decisivas do texto que precisam de análise lexical e teológica cuidadosa', exemplo: '"Forma" (μορφή) e "esvaziou-se" (ἐκένωσεν) são termos-chave de Filipenses 2.6-7 que exigem investigação lexical cuidadosa antes de qualquer conclusão doutrinária.' },
  { id: 'investigar_vg_estrutura_lit', titulo: 'Estrutura literária', categoria: 'textual', foco: 'a forma literária do texto e como essa forma organiza o sentido', exemplo: 'Filipenses 2.6-11 é amplamente reconhecido como um hino cristológico primitivo, com estrutura de descida (humilhação) e subida (exaltação).' },
  { id: 'preparar_movimento_narrativo', titulo: 'Movimento narrativo', categoria: 'textual', foco: 'a direção geral do enredo, perceptível já numa primeira leitura de um texto narrativo', exemplo: 'Em Marcos 4.35-41, o movimento narrativo vai da calmaria inicial para a tempestade, e desta para a calma restaurada por Jesus.' },
  { id: 'preparar_fluxo_argumentativo', titulo: 'Fluxo argumentativo', categoria: 'textual', foco: 'a sequência lógica do argumento, perceptível já numa primeira leitura de um texto epistolar', exemplo: 'O fluxo de Filipenses 2.5-11 vai de uma exortação à humildade (v.5) para o exemplo de Cristo (v.6-8) e sua vindicação por Deus (v.9-11).' },
  { id: 'preparar_climax', titulo: 'Clímax', categoria: 'textual', foco: 'o ponto de maior intensidade ou virada percebido numa primeira leitura do texto', exemplo: 'O clímax perceptível em Filipenses 2.5-11 é a confissão universal de que "Jesus Cristo é Senhor" (v.11), ápice de todo o movimento do hino.' },
  { id: 'investigar_vg_temas_teol', titulo: 'Temas teológicos', categoria: 'teologico', foco: 'os grandes temas doutrinários que o texto toca, identificados após a primeira investigação', exemplo: 'Filipenses 2.5-11 toca os temas de cristologia (natureza de Cristo), humildade, encarnação e senhorio universal de Cristo.' },
  { id: 'investigar_vg_conexoes', titulo: 'Conexões canônicas', categoria: 'teologico', foco: 'os vínculos do texto com outras passagens da Bíblia, identificados após a primeira investigação', exemplo: 'Filipenses 2.10-11 ecoa Isaías 45.23 ("todo joelho se dobrará"), aplicando a Cristo uma afirmação que Isaías fazia sobre o próprio Deus de Israel.' },
  { id: 'preparar_palavras_repetidas', titulo: 'Termos e imagens centrais', categoria: 'textual', foco: 'palavras ou imagens que se repetem no texto e sinalizam o que o autor quer enfatizar', exemplo: 'A repetição de verbos de humilhação seguidos de verbos de exaltação em Filipenses 2.6-9 sinaliza que o padrão humilhação-exaltação é o centro da ênfase do autor.' },

  // ── PESQUISA TEOLÓGICA ────────────────────────────────────────────────────
  { id: 'problema_pesquisa', titulo: 'Problema da pesquisa', categoria: 'contextual', foco: 'a tensão, lacuna ou pergunta sem resposta clara que justifica a pesquisa', exemplo: 'O problema pode ser: "Como Tiago 2.24 e Romanos 3.28 afirmam aparentemente posições opostas sobre fé e obras, sem se contradizer?"' },
  { id: 'justificativa', titulo: 'Justificativa', categoria: 'contextual', foco: 'por que essa pesquisa importa — pastoral, acadêmica ou teologicamente', exemplo: 'A justificativa pode ser que confusão sobre fé e obras gera tanto legalismo quanto antinomianismo prático nas igrejas hoje.' },
  { id: 'questao_principal', titulo: 'Questão principal', categoria: 'contextual', foco: 'a pergunta única e precisa que toda a pesquisa vai responder', exemplo: '"Tiago e Paulo ensinam doutrinas diferentes sobre justificação, ou usam o termo de formas distintas dentro da mesma teologia?"' },
  { id: 'hipoteses', titulo: 'Hipóteses', categoria: 'contextual', foco: 'a resposta provisória que orienta a pesquisa, sujeita a confirmação ou revisão', exemplo: 'Hipótese: Tiago usa "justificar" no sentido de vindicação pública diante dos homens, enquanto Paulo o usa no sentido forense diante de Deus.' },
  { id: 'metodologia', titulo: 'Metodologia', categoria: 'contextual', foco: 'o método e os passos que a pesquisa vai seguir para responder à questão principal', exemplo: 'Metodologia: exegese comparativa de Tiago 2.14-26 e Romanos 3.21-4.25, seguida de revisão da literatura teológica histórica sobre o tema.' },
  { id: 'estado_da_arte', titulo: 'Estado da arte', categoria: 'contextual', foco: 'o que já foi escrito sobre o tema, mapeando consensos e lacunas na literatura existente', exemplo: 'A maior parte dos comentaristas reformados já harmoniza Tiago e Paulo lexicalmente, mas poucos tratam da aplicação pastoral dessa harmonização.' },
  { id: 'autores_principais', titulo: 'Autores principais', categoria: 'contextual', foco: 'os autores cuja obra é referência obrigatória para o tema pesquisado', exemplo: 'Douglas Moo e D.A. Carson sobre Tiago, e John Murray e Michael Horton sobre justificação paulina.' },
  { id: 'obras_centrais', titulo: 'Obras centrais', categoria: 'contextual', foco: 'os livros ou artigos específicos que sustentam diretamente a pesquisa', exemplo: 'O comentário de Tiago de Douglas Moo (Pillar) e "Justification" de N.T. Wright e a resposta de John Piper.' },
  { id: 'debates_academicos', titulo: 'Debates acadêmicos', categoria: 'contextual', foco: 'as principais controvérsias teológicas relacionadas ao tema que a pesquisa precisa situar', exemplo: 'O debate entre a leitura reformada tradicional e a "New Perspective on Paul" sobre o sentido de "justificação" é central para esta pesquisa.' },
  { id: 'passagens_relevantes', titulo: 'Passagens relevantes', categoria: 'textual', foco: 'os textos bíblicos que precisam ser exegeticamente examinados para responder à questão', exemplo: 'Tiago 2.14-26, Romanos 3.21-4.25 e Gálatas 2.15-21 são as passagens centrais para esta pesquisa.' },
  { id: 'analise_textual', titulo: 'Análise textual', categoria: 'textual', foco: 'o exame detalhado de cada passagem relevante, isoladamente, antes de qualquer síntese', exemplo: 'Análise de Tiago 2.21-24: o contexto imediato trata de fé sem obras sendo morta, não da base da justificação diante de Deus.' },
  { id: 'analise_morfossintatica', titulo: 'Análise morfossintática', categoria: 'textual', foco: 'a análise gramatical detalhada de termos ou construções decisivas para o argumento', exemplo: 'O verbo "dikaiōthē" em Tiago 2.24 e em Romanos 3.28 precisa ser examinado morfológica e sintaticamente nos dois contextos antes de comparar sentidos.' },
  { id: 'desenvolvimento_canonico', titulo: 'Desenvolvimento canônico', categoria: 'teologico', foco: 'como o tema se desenvolve ao longo do cânon, do Antigo ao Novo Testamento', exemplo: 'A fé de Abraão (Gênesis 15.6) é citada tanto por Paulo (Romanos 4) quanto por Tiago (Tiago 2.23) — rastrear esse desenvolvimento é central para a pesquisa.' },
  { id: 'historia_redencao', titulo: 'História da redenção', categoria: 'teologico', foco: 'como o tema se conecta com o desenvolvimento progressivo do plano redentivo de Deus', exemplo: 'A justificação pela fé se conecta à aliança abraâmica e encontra cumprimento pleno na obra de Cristo, base de toda a discussão entre Tiago e Paulo.' },
  { id: 'formulacao_doutrinaria', titulo: 'Formulação doutrinária', categoria: 'teologico', foco: 'como tradições confessionais históricas formularam a doutrina relacionada ao tema', exemplo: 'A Confissão de Westminster (cap. 11) formula a justificação como ato forense de Deus, distinta da santificação — formulação relevante para harmonizar Tiago e Paulo.' },
  { id: 'loci_classicos', titulo: 'Loci clássicos', categoria: 'teologico', foco: 'os textos teológicos clássicos que tradicionalmente fundamentam a doutrina em questão', exemplo: 'As Institutas de Calvino (Livro III) sobre justificação pela fé são um loci clássico indispensável para esta pesquisa.' },
  { id: 'concordancias', titulo: 'Concordâncias', categoria: 'teologico', foco: 'os pontos em que diferentes textos ou autores realmente concordam, depois de análise cuidadosa', exemplo: 'Tiago e Paulo concordam que fé verdadeira sempre produz obras — a concordância de fundo é maior do que a diferença lexical sugere.' },
  { id: 'divergencias', titulo: 'Divergências', categoria: 'teologico', foco: 'os pontos em que os textos ou autores realmente divergem, sem forçar harmonização artificial', exemplo: 'Tiago e Paulo usam "justificar" com referentes diferentes — diante dos homens (Tiago) e diante de Deus (Paulo) — uma diferença real de uso, não de doutrina.' },
  { id: 'avaliacao_critica', titulo: 'Avaliação crítica', categoria: 'teologico', foco: 'o julgamento ponderado sobre qual posição ou leitura é mais fiel ao texto e à teologia bíblica', exemplo: 'A leitura que distingue os referentes de "justificar" em Tiago e Paulo é mais fiel ao contexto imediato de cada carta do que tentar igualar os dois usos.' },
  { id: 'respostas_questao', titulo: 'Respostas à questão', categoria: 'teologico', foco: 'a resposta direta e fundamentada à questão principal da pesquisa', exemplo: 'Resposta: Tiago e Paulo não se contradizem — tratam de aspectos complementares da mesma fé viva, com vocabulário ajustado a interlocutores diferentes.' },
  { id: 'implicacoes_teologicas', titulo: 'Implicações teológicas', categoria: 'teologico', foco: 'o que a conclusão da pesquisa implica para outras áreas da teologia ou da prática cristã', exemplo: 'Se fé viva sempre produz obras, a pregação não deve opor graça e obediência, mas mostrar a obediência como fruto necessário da fé genuína.' },
  { id: 'contribuicao_original', titulo: 'Contribuição original', categoria: 'teologico', foco: 'o que esta pesquisa específica acrescenta ao que já existia sobre o tema', exemplo: 'A contribuição original pode ser mostrar como a distinção de referentes em Tiago e Paulo resolve o impasse sem recorrer a categorias importadas de fora do texto.' },
  { id: 'abnt_chicago', titulo: 'ABNT / Chicago', categoria: 'estilo', foco: 'a formatação correta de citações e referências conforme a norma exigida pela instituição ou publicação', exemplo: 'Revisar se todas as citações de Calvino e Moo seguem consistentemente o padrão Chicago (ou ABNT) escolhido para o trabalho, sem mistura de estilos.' },
  { id: 'fontes_primarias', titulo: 'Fontes primárias', categoria: 'contextual', foco: 'os textos originais — bíblicos ou de autores históricos — usados diretamente como objeto de estudo', exemplo: 'O texto grego de Tiago 2 e Romanos 3-4, e as Institutas de Calvino no original ou em tradução crítica, são fontes primárias desta pesquisa.' },
  { id: 'fontes_secundarias', titulo: 'Fontes secundárias', categoria: 'contextual', foco: 'comentários, artigos e obras que interpretam ou discutem as fontes primárias', exemplo: 'Comentários de Moo, Carson e Schreiner sobre Tiago e Romanos funcionam como fontes secundárias que dialogam com o texto primário.' },

  // ── ESTUDO BÍBLICO (pequeno grupo) ────────────────────────────────────────
  { id: 'oracao', titulo: 'Oração', categoria: 'memoria', foco: 'o pedido específico de direção do Espírito antes de preparar ou conduzir o estudo', exemplo: 'Antes de preparar um estudo sobre João 4.1-26, orar para que o grupo reconheça suas próprias "samaritanas" — áreas de vida que evitam trazer à luz diante de Deus.' },
  { id: 'faixa_etaria', titulo: 'Faixa etária', categoria: 'contextual', foco: 'a idade e maturidade do grupo, que molda vocabulário, exemplos e profundidade do estudo', exemplo: 'Um estudo de João 4 para adolescentes pode enfatizar mais a aceitação que Jesus oferece à mulher marginalizada do que os detalhes da disputa samaritano-judaica.' },
  { id: 'objetivos_aula', titulo: 'Objetivos da aula', categoria: 'homiletica', foco: 'o que o grupo deve compreender ou viver de diferente ao final do encontro', exemplo: 'Ao final do estudo de João 4, o grupo deve entender que Jesus oferece água viva a quem a sociedade já descartou — e reconhecer isso em suas próprias vidas.' },
  { id: 'estrutura', titulo: 'Estrutura', categoria: 'textual', foco: 'a divisão do texto em partes que organizarão a condução do estudo', exemplo: 'João 4.1-26 se divide em: o encontro (v.1-9), o diálogo sobre água viva (v.10-15) e a revelação da identidade de Jesus (v.16-26).' },
  { id: 'personagens', titulo: 'Personagens', categoria: 'textual', foco: 'quem participa da cena estudada e o papel de cada um na interação', exemplo: 'Em João 4, os personagens são Jesus e a mulher samaritana — um diálogo a dois que carrega tensão étnica, religiosa e moral.' },
  { id: 'temas_principais', titulo: 'Temas principais', categoria: 'teologico', foco: 'os dois ou três grandes temas teológicos que o texto desenvolve', exemplo: 'João 4 desenvolve os temas de adoração verdadeira, identidade messiânica de Jesus e graça que atravessa barreiras sociais.' },
  { id: 'termos_chave', titulo: 'Termos-chave', categoria: 'textual', foco: 'as palavras decisivas do texto que merecem explicação cuidadosa ao grupo', exemplo: '"Água viva" (João 4.10) precisa ser explicada tanto em seu sentido físico imediato quanto em sua carga simbólica de vida espiritual.' },
  { id: 'quebra_gelo', titulo: 'Quebra-gelo', categoria: 'homiletica', foco: 'uma pergunta ou atividade inicial que engaja o grupo e prepara emocionalmente para o tema', exemplo: '"Qual foi a última vez que alguém te julgou antes de te conhecer?" prepara o grupo para a experiência da mulher samaritana em João 4.' },
  { id: 'conexao_vida', titulo: 'Conexão com a vida', categoria: 'homiletica', foco: 'a ponte entre a situação do texto e a experiência real do grupo hoje', exemplo: 'Assim como a samaritana evitava o poço no horário de movimento, todos temos áreas que preferimos esconder — o texto convida a trazê-las à luz diante de Jesus.' },
  { id: 'perguntas_observacao', titulo: 'Perguntas de observação', categoria: 'textual', foco: 'perguntas que ajudam o grupo a notar o que o texto realmente diz, antes de interpretar', exemplo: 'O que Jesus pede à mulher logo no início do diálogo (v.7)? Por que isso seria surpreendente para ela?' },
  { id: 'perguntas_interpretacao', titulo: 'Perguntas de interpretação', categoria: 'teologico', foco: 'perguntas que conduzem o grupo a entender o sentido teológico do que foi observado', exemplo: 'Por que Jesus chama a atenção para o passado conjugal da mulher (v.16-18) antes de revelar quem ele é?' },
  { id: 'perguntas_aplicacao', titulo: 'Perguntas de aplicação', categoria: 'homiletica', foco: 'perguntas que levam o grupo a responder pessoalmente à verdade interpretada', exemplo: 'Que "água viva" você tem buscado em lugares que nunca vão satisfazer de verdade?' },
  { id: 'discussao_grupo', titulo: 'Discussão em grupo', categoria: 'homiletica', foco: 'o roteiro de como conduzir a conversa coletiva sem perder o foco no texto', exemplo: 'Dividir o grupo em duplas para discutir a pergunta de aplicação antes de compartilhar em voz alta evita que só os mais falantes dominem a conversa.' },
  { id: 'sintese', titulo: 'Síntese', categoria: 'teologico', foco: 'o resumo final que une observação, interpretação e aplicação em uma frase memorável', exemplo: 'Síntese de João 4: "Jesus oferece água viva a quem ninguém mais buscaria — inclusive a você."' },
  { id: 'aplicacoes_individuais', titulo: 'Aplicações individuais', categoria: 'homiletica', foco: 'a resposta pessoal que cada participante deve considerar diante de Deus', exemplo: 'Identificar, em silêncio, uma área de vida que você evita trazer à luz diante de Jesus, como a samaritana evitava o poço no horário de movimento.' },
  { id: 'aplicacoes_familiares', titulo: 'Aplicações familiares', categoria: 'homiletica', foco: 'como a verdade do texto deve moldar relações dentro da família', exemplo: 'Assim como Jesus trata a mulher com dignidade apesar de seu passado, pais podem tratar erros dos filhos com correção e dignidade, não com vergonha pública.' },
  { id: 'aplicacoes_eclesiasticas', titulo: 'Aplicações eclesiásticas', categoria: 'homiletica', foco: 'como a verdade do texto deve moldar a vida e a cultura da igreja local', exemplo: 'Se Jesus acolhe quem a sociedade rejeita, a igreja precisa examinar quem ela, sem perceber, mantém à distância do poço.' },
  { id: 'aplicacoes_missionais', titulo: 'Aplicações missionais', categoria: 'homiletica', foco: 'como a verdade do texto deve moldar o testemunho e o envio da igreja ao mundo', exemplo: 'A mulher samaritana se torna a primeira evangelista em João 4.28-30 — qualquer pessoa transformada pelo encontro com Cristo já tem o que precisa para testemunhar.' },
  { id: 'material_professor', titulo: 'Material do professor', categoria: 'memoria', foco: 'o roteiro de apoio que orienta quem vai conduzir o estudo, com tempo e transições previstas', exemplo: 'Roteiro de uma página com tempo estimado por bloco: 5min quebra-gelo, 20min texto e perguntas, 10min aplicação e oração final.' },

  // ── ESTUDO TEMÁTICO ────────────────────────────────────────────────────────
  { id: 'ocorrencias_at', titulo: 'Ocorrências no AT', categoria: 'textual', foco: 'todas as passagens do Antigo Testamento em que o tema aparece, mapeadas sistematicamente', exemplo: 'O tema da aliança aparece em Gênesis 9, 15, 17, Êxodo 19-24, 2 Samuel 7 e Jeremias 31 — um mapeamento que precisa ser completo antes da síntese.' },
  { id: 'ocorrencias_nt', titulo: 'Ocorrências no NT', categoria: 'textual', foco: 'todas as passagens do Novo Testamento em que o tema aparece, mapeadas sistematicamente', exemplo: 'O tema da aliança no NT aparece centralmente em Lucas 22.20, 2 Coríntios 3 e Hebreus 8-9, onde a nova aliança é explicitamente discutida.' },
  { id: 'passagens_centrais', titulo: 'Passagens centrais', categoria: 'textual', foco: 'as 3 ou 4 passagens mais decisivas para entender o tema, selecionadas entre todas as ocorrências', exemplo: 'Para o tema da aliança, Gênesis 15, 2 Samuel 7, Jeremias 31.31-34 e Hebreus 8 são as passagens mais decisivas para a síntese.' },
  { id: 'frequencia', titulo: 'Frequência e distribuição', categoria: 'textual', foco: 'em que livros ou seções da Bíblia o tema é mais ou menos frequente, e o que isso indica', exemplo: 'O tema da aliança é mais denso no Pentateuco e nos Profetas do que na literatura sapiencial — distribuição que já sinaliza sua função estruturante na narrativa bíblica.' },
  { id: 'pentateuco', titulo: 'Pentateuco e fundação', categoria: 'teologico', foco: 'como o tema é estabelecido ou fundamentado nos primeiros cinco livros da Bíblia', exemplo: 'No Pentateuco, a aliança é fundada com Noé (preservação), Abraão (promessa) e Israel no Sinai (lei) — três camadas que o tema precisa distinguir.' },
  { id: 'historicos_profetas', titulo: 'Históricos e Profetas', categoria: 'teologico', foco: 'como o tema se desenvolve nos livros históricos e proféticos do Antigo Testamento', exemplo: 'Nos livros históricos, a aliança davídica (2 Samuel 7) se torna o eixo; nos profetas, a quebra da aliança e a promessa de uma aliança nova dominam o tema.' },
  { id: 'sabedoria', titulo: 'Sabedoria e poesia', categoria: 'teologico', foco: 'como o tema aparece, se aparece, na literatura poética e sapiencial', exemplo: 'A aliança aparece pouco diretamente em Provérbios, mas os Salmos (especialmente 89 e 132) refletem extensamente sobre suas promessas e tensões.' },
  { id: 'epistolas', titulo: 'Epístolas apostólicas', categoria: 'teologico', foco: 'como o tema é interpretado e aplicado pelos apóstolos nas cartas do Novo Testamento', exemplo: 'Paulo em Gálatas 3-4 e o autor de Hebreus em capítulos 8-9 interpretam a aliança antiga à luz do cumprimento em Cristo.' },
  { id: 'fio_condutor', titulo: 'Fio condutor canônico', categoria: 'teologico', foco: 'a linha de continuidade que conecta todas as ocorrências do tema ao longo da Bíblia', exemplo: 'O fio condutor do tema da aliança é a fórmula repetida "eu serei o seu Deus, e vocês serão o meu povo", do Sinai até Apocalipse 21.3.' },
  { id: 'progressao_revelacao', titulo: 'Progressão da revelação', categoria: 'teologico', foco: 'como a compreensão do tema se aprofunda e se esclarece ao longo da história da revelação', exemplo: 'A aliança progride de promessa geral (Noé) para promessa específica (Abraão) para lei detalhada (Sinai) para cumprimento pessoal (Cristo).' },
  { id: 'centro_cristologico', titulo: 'Centro cristológico', categoria: 'teologico', foco: 'como o tema encontra seu sentido pleno e definitivo em Cristo', exemplo: 'Toda aliança bíblica encontra seu "sim" definitivo em Cristo (2 Coríntios 1.20), que é o mediador da nova aliança (Hebreus 9.15).' },
  { id: 'unidade_testamentos', titulo: 'Unidade dos Testamentos', categoria: 'teologico', foco: 'como o tema demonstra a continuidade entre Antigo e Novo Testamento, sem descontinuidade artificial', exemplo: 'A nova aliança (Jeremias 31; Lucas 22.20) não substitui a antiga por contradição, mas a cumpre e aperfeiçoa — evidência da unidade do plano de Deus.' },
  { id: 'aplicacao_redentor', titulo: 'Aplicação redentor-histórica', categoria: 'homiletica', foco: 'como aplicar o tema preservando sua posição correta dentro da história da redenção, sem atemporalizar', exemplo: 'Pregar sobre aliança hoje significa situar o ouvinte como beneficiário da nova aliança selada pelo sangue de Cristo, não repetir exigências da aliança do Sinai como se ainda vigessem do mesmo modo.' },
  { id: 'doutrina_relacionada', titulo: 'Doutrina relacionada', categoria: 'teologico', foco: 'as outras doutrinas sistemáticas que se conectam diretamente ao tema estudado', exemplo: 'O tema da aliança se conecta diretamente às doutrinas da eleição, da igreja como povo de Deus e dos sacramentos como sinais da aliança.' },
  { id: 'etica_crista', titulo: 'Ética cristã', categoria: 'homiletica', foco: 'as implicações morais e práticas que o tema gera para a conduta cristã', exemplo: 'Pertencer à aliança gera obrigação ética de fidelidade — assim como Israel respondia à aliança do Sinai com obediência, a igreja responde à graça da nova aliança com vida transformada.' },
  { id: 'missao', titulo: 'Missão e evangelismo', categoria: 'homiletica', foco: 'como o tema fundamenta ou impulsiona a missão da igreja ao mundo', exemplo: 'A promessa a Abraão de que "todas as famílias da terra serão benditas" (Gênesis 12.3) já contém o impulso missionário que a igreja cumpre hoje.' },

  // ── PROFECIAS ─────────────────────────────────────────────────────────────
  { id: 'periodo_historico', titulo: 'Período histórico', categoria: 'contextual', foco: 'o momento histórico exato em que o oráculo profético foi proferido', exemplo: 'Isaías 9.1-7 é proferido durante a crise siro-efraimita, quando Judá enfrentava ameaça militar e a tentação de buscar segurança em alianças humanas, não em Deus.' },
  { id: 'situacao_nacao', titulo: 'Situação de Israel', categoria: 'contextual', foco: 'a condição espiritual, política e social do povo no momento em que a profecia foi dada', exemplo: 'Em Isaías 9, Judá vivia sob ameaça da aliança síro-efraimita e tentada a confiar em alianças políticas com a Assíria em vez de confiar no Senhor.' },
  { id: 'estrutura_oraculo', titulo: 'Estrutura do oráculo', categoria: 'textual', foco: 'a organização interna da profecia — introdução, anúncio, descrição, conclusão', exemplo: 'Isaías 9.1-7 se estrutura em trevas e luz (v.1-2), motivos de alegria (v.3-5) e a descrição do governante prometido (v.6-7).' },
  { id: 'mensagem_central', titulo: 'Mensagem central', categoria: 'teologico', foco: 'a afirmação teológica única que resume o que Deus está comunicando através do oráculo', exemplo: 'A mensagem central de Isaías 9.1-7 é que Deus enviará um governante davídico cuja luz e governo trarão fim definitivo às trevas e à opressão.' },
  { id: 'simbolos_principais', titulo: 'Símbolos principais', categoria: 'textual', foco: 'as imagens simbólicas centrais do oráculo e o que cada uma comunicava aos primeiros ouvintes', exemplo: '"Trevas" e "grande luz" (Isaías 9.2) simbolizam respectivamente opressão/julgamento e a chegada de salvação e esperança.' },
  { id: 'visoes_acoes', titulo: 'Visões e ações simbólicas', categoria: 'textual', foco: 'visões ou atos simbólicos presentes no texto e seu significado dentro do oráculo', exemplo: 'O nascimento de uma criança como sinal de esperança em meio à crise (Isaías 9.6) funciona como ato simbólico que aponta para intervenção divina iminente.' },
  { id: 'tradicoes_evocadas', titulo: 'Tradições canônicas evocadas', categoria: 'contextual', foco: 'tradições, alianças ou eventos bíblicos anteriores que o oráculo pressupõe ou retoma', exemplo: 'Isaías 9.6-7 evoca diretamente a promessa davídica de 2 Samuel 7 — o "trono de Davi" é a tradição canônica pressuposta por toda a profecia.' },
  { id: 'cumprimento_historico', titulo: 'Cumprimento histórico', categoria: 'teologico', foco: 'se e como a profecia se cumpriu, total ou parcialmente, dentro da história de Israel', exemplo: 'A libertação da ameaça assíria nos dias de Isaías ofereceu um cumprimento parcial e imediato, mas não esgotou a grandeza da promessa de Isaías 9.6-7.' },
  { id: 'cumprimento_cristologico', titulo: 'Cumprimento em Cristo', categoria: 'teologico', foco: 'como a profecia encontra seu cumprimento pleno e definitivo na pessoa e obra de Cristo', exemplo: 'Mateus 4.14-16 cita Isaías 9.1-2 explicitamente sobre o ministério de Jesus na Galileia — o cumprimento cristológico é direto e declarado pelo Novo Testamento.' },
  { id: 'horizonte_escatologico', titulo: 'Horizonte escatológico', categoria: 'teologico', foco: 'como a profecia aponta para a consumação final do reino de Deus, além do cumprimento histórico imediato', exemplo: 'O governo "sem fim" sobre o trono de Davi (Isaías 9.7) só se cumpre plenamente no reinado eterno de Cristo na consumação final.' },
  { id: 'aliancas', titulo: 'Vinculação com as alianças', categoria: 'teologico', foco: 'como a profecia se conecta às alianças bíblicas anteriores — abraâmica, davídica, ou a nova aliança', exemplo: 'Isaías 9.6-7 depende diretamente da aliança davídica (2 Samuel 7) e a leva à sua expressão mais plena no governo eterno do Messias.' },
  { id: 'progressao_redentora', titulo: 'Progressão redentora', categoria: 'teologico', foco: 'como a profecia avança o desenvolvimento do plano redentivo de Deus em relação ao que veio antes', exemplo: 'Isaías 9 avança a expectativa messiânica além da promessa geral a Davi, detalhando títulos divinos ("Deus Forte", "Príncipe da Paz") nunca antes atribuídos a um rei humano.' },
  { id: 'reino_de_deus', titulo: 'Reino de Deus', categoria: 'teologico', foco: 'como a profecia descreve ou antecipa o reinado de Deus sobre seu povo e sobre o mundo', exemplo: 'O "governo e a paz" sem fim de Isaías 9.7 descrevem o reino de Deus chegando através do reinado do Filho davídico prometido.' },

  // ── SALMOS E SABEDORIA ──────────────────────────────────────────────────────
  { id: 'estrutura_bimembre', titulo: 'Estrutura bimembre', categoria: 'textual', foco: 'a organização do versículo poético em dois (ou mais) membros paralelos', exemplo: 'Salmo 73.1 se organiza em dois membros: "Na verdade, Deus é bom para Israel" / "para os limpos de coração" — afirmação geral seguida de especificação.' },
  { id: 'quiasmo', titulo: 'Quiasmo', categoria: 'textual', foco: 'estruturas espelhadas (A-B-B-A) que organizam blocos do poema', exemplo: 'Salmo 73 pode ser lido em estrutura quiástica: problema (v.1-3) → crise (v.13-14) → virada (v.17) → resolução espelhando o problema inicial (v.21-28).' },
  { id: 'divisao_estrofes', titulo: 'Divisão em estrofes', categoria: 'textual', foco: 'a divisão do salmo ou poema em unidades de pensamento maiores que o versículo', exemplo: 'Salmo 73 se divide em três estrofes: a crise de fé (v.1-14), a virada no santuário (v.15-20) e a confissão de confiança renovada (v.21-28).' },
  { id: 'movimento_poetico', titulo: 'Movimento do poema', categoria: 'textual', foco: 'a direção emocional e teológica geral por onde o poema caminha do início ao fim', exemplo: 'Salmo 73 se move de inveja amarga (v.2-3) para confusão (v.13-14) para adoração restaurada (v.25-26) — um movimento de queixa a confiança.' },
  { id: 'climax_poetico', titulo: 'Clímax', categoria: 'textual', foco: 'o ponto de maior intensidade emocional ou teológica do poema', exemplo: 'O clímax de Salmo 73 está no v.25: "fora de ti nada desejo na terra" — a confissão de que Deus, e não circunstância alguma, é o verdadeiro bem.' },
  { id: 'imagens_centrais', titulo: 'Imagens centrais', categoria: 'textual', foco: 'as imagens poéticas principais e o que cada uma comunica sobre a experiência descrita', exemplo: '"Meus pés resvalaram" (Salmo 73.2) é imagem física de instabilidade que comunica a crise de fé do salmista diante da prosperidade dos ímpios.' },
  { id: 'campo_semantico', titulo: 'Campo semântico dominante', categoria: 'textual', foco: 'o grupo de palavras relacionadas que dá unidade temática ao vocabulário do poema', exemplo: 'Salmo 73 usa vocabulário de proximidade e distância de Deus — "perto", "santuário", "longe" — formando um campo semântico de presença divina.' },
  { id: 'intertextualidade', titulo: 'Conexões canônicas', categoria: 'teologico', foco: 'ecos, citações ou paralelos do poema com outras passagens bíblicas', exemplo: 'A crise de Salmo 73 sobre a prosperidade dos ímpios ecoa o livro de Jó e antecipa o ensino de Jesus em Lucas 16 sobre riqueza e destino eterno.' },
  { id: 'questao_existencial', titulo: 'Questão existencial', categoria: 'teologico', foco: 'o problema real e humano de fé que o poema enfrenta honestamente', exemplo: 'Salmo 73 enfrenta a pergunta: "Por que os ímpios prosperam enquanto os fiéis sofrem?" — sem fingir uma resposta fácil antes da hora.' },
  { id: 'tensao_resolucao', titulo: 'Tensão e resolução', categoria: 'teologico', foco: 'como o poema desenvolve sua tensão central e a resolve, total ou parcialmente', exemplo: 'A tensão de Salmo 73 só se resolve quando o salmista entra "no santuário de Deus" (v.17) e ganha perspectiva eterna sobre o destino dos ímpios.' },
  { id: 'revelacao_de_deus', titulo: 'O que revela sobre Deus', categoria: 'teologico', foco: 'o que o poema ensina sobre o caráter, a fidelidade ou os propósitos de Deus', exemplo: 'Salmo 73 revela um Deus que é "a rocha do meu coração" (v.26) mesmo quando as circunstâncias parecem contradizer sua bondade.' },
  { id: 'relacao_crente', titulo: 'A relação do crente com Deus', categoria: 'teologico', foco: 'como o poema descreve ou molda a relação pessoal entre quem ora e Deus', exemplo: 'Salmo 73 modela uma relação de honestidade radical com Deus — o salmista não esconde sua quase-queda (v.2), mas a traz diretamente à presença divina.' },
  { id: 'cristologia', titulo: 'Conexão com Cristo', categoria: 'teologico', foco: 'como o poema se conecta, direta ou tipologicamente, com a pessoa e obra de Cristo', exemplo: 'A confiança final de Salmo 73 — "Deus é a porção da minha herança para sempre" (v.26) — encontra sua garantia plena na obra de Cristo, que assegura essa herança eterna aos seus.' },

  // ── ESTUDO DE CARTA ─────────────────────────────────────────────────────────
  { id: 'proposito', titulo: 'Propósito da carta', categoria: 'contextual', foco: 'a razão específica pela qual o autor escreveu a carta a essa igreja ou pessoa', exemplo: 'Paulo escreve Gálatas para corrigir a confusão de gentios que estavam sendo levados a buscar justificação pela lei além da fé em Cristo.' },
  { id: 'tipo_retorico', titulo: 'Tipo retórico', categoria: 'textual', foco: 'o gênero retórico da carta — apologética, deliberativa, repreensiva — que orienta como ler seu argumento', exemplo: 'Gálatas é amplamente reconhecida como retórica apologética/repreensiva — Paulo defende o evangelho da graça contra uma distorção real entre os gálatas.' },
  { id: 'desenvolvimento', titulo: 'Desenvolvimento do argumento', categoria: 'textual', foco: 'como o argumento da carta avança de seção em seção, sem saltos nem repetição', exemplo: 'Gálatas avança de defesa pessoal do apostolado de Paulo (cap. 1-2) para argumento teológico sobre justificação pela fé (cap. 3-4) para aplicação ética em liberdade (cap. 5-6).' },
  { id: 'climax', titulo: 'Clímax e resolução', categoria: 'textual', foco: 'o ponto culminante do argumento da carta e como ele se resolve na conclusão', exemplo: '"Para a liberdade Cristo nos libertou" (Gálatas 5.1) é o clímax que resolve toda a tensão entre lei e graça desenvolvida nos capítulos anteriores.' },
]

function stepsFor(seed: HelpSeed): string[] {
  const sharedLast = 'Registre a conclusão em linguagem precisa, indicando como ela servirá à interpretação ou à pregação.'

  if (seed.categoria === 'contextual') {
    return [
      `Defina exatamente que informação contextual você precisa levantar sobre ${seed.foco}.`,
      'Procure evidências internas no próprio livro antes de recorrer a reconstruções históricas externas.',
      'Compare a leitura com comentários, introduções bíblicas e fontes históricas confiáveis.',
      'Explique como esse dado muda, confirma ou limita a interpretação da perícope.',
      sharedLast,
    ]
  }

  if (seed.categoria === 'textual') {
    return [
      `Observe o texto bíblico de perto e marque tudo que contribui para ${seed.foco}.`,
      'Trabalhe a partir do original sempre que possível, distinguindo observação, inferência e conclusão.',
      'Compare sua análise com traduções, gramáticas, léxicos ou comentários técnicos.',
      'Mostre como o detalhe textual sustenta a ideia central da perícope.',
      sharedLast,
    ]
  }

  if (seed.categoria === 'teologico') {
    return [
      `Identifique a contribuição de ${seed.titulo.toLowerCase()} para a mensagem teológica da passagem.`,
      'Conecte a perícope ao livro, ao cânone e à história da redenção sem saltos artificiais.',
      'Distinga doutrina explicitamente ensinada, implicação legítima e aplicação posterior.',
      'Formule a conclusão em termos cristocêntricos e reformados, preservando a intenção do autor bíblico.',
      sharedLast,
    ]
  }

  if (seed.categoria === 'homiletica') {
    return [
      `Comece pela Grande Ideia do texto e pergunte como ${seed.foco} deve servir a essa ideia.`,
      'Escreva uma primeira versão em linguagem falada, clara e direta.',
      'Cheque se a formulação nasce do texto e não de uma preferência temática do pregador.',
      'Inclua explicação, aplicação e orientação pastoral quando o campo exigir desenvolvimento.',
      'Revise para que a congregação saiba o que crer, sentir ou fazer diante de Deus.',
    ]
  }

  if (seed.categoria === 'estilo') {
    return [
      `Leia o trecho do sermão em voz alta e avalie como ${seed.foco} afeta a compreensão.`,
      'Substitua abstrações desnecessárias por palavras concretas e teologicamente fiéis.',
      'Preserve termos doutrinários essenciais, mas explique-os com frases simples.',
      'Ajuste ritmo, imagens e tom à natureza do texto e à condição da congregação.',
      'Corte qualquer frase bonita que não sirva à clareza da verdade bíblica.',
    ]
  }

  if (seed.categoria === 'memoria') {
    return [
      `Reduza o sermão ao seu fluxo essencial, destacando ${seed.foco}.`,
      'Pratique em voz alta sem depender integralmente do manuscrito.',
      'Use âncoras verbais ou visuais para recuperar a sequência dos movimentos.',
      'Teste as transições, pois é nelas que a memória costuma falhar.',
      'Ore o sermão até que ele seja verdade recebida antes de ser mensagem entregue.',
    ]
  }

  return [
    `Observe como ${seed.foco} pode tornar a entrega mais clara, reverente e pastoral.`,
    'Pratique o trecho em voz alta, preferencialmente gravando uma tentativa curta.',
    'Avalie se corpo, voz e ritmo servem ao texto ou chamam atenção para o pregador.',
    'Ajuste um elemento de cada vez para evitar artificialidade.',
    'Após a pregação, registre uma observação concreta para crescimento futuro.',
  ]
}

function questionsFor(seed: HelpSeed): string[] {
  return [
    `O que o texto exige que eu observe antes de concluir algo sobre ${seed.foco}?`,
    'Que evidência bíblica específica sustenta minha resposta?',
    'Como isso ajuda a congregação a entender melhor Cristo, o evangelho e a obediência da fé?',
    'Minha conclusão é clara o suficiente para orientar o próximo passo do estudo ou do sermão?',
  ]
}

function errorsFor(seed: HelpSeed): string[] {
  const byCategory: Record<HelpCategory, string[]> = {
    contextual: [
      'Usar pano de fundo histórico como enfeite, sem mostrar sua relevância para o sentido do texto.',
      'Preferir reconstruções especulativas a evidências internas claras.',
      'Anacronizar o texto, lendo categorias modernas diretamente no mundo bíblico.',
    ],
    textual: [
      'Fazer análise técnica sem conectar o detalhe à mensagem da perícope.',
      'Escolher uma tradução ou variante apenas porque favorece uma ideia prévia.',
      'Confundir possibilidade lexical com sentido contextual provável.',
    ],
    teologico: [
      'Pular direto para doutrina sistemática sem respeitar o argumento da passagem.',
      'Forçar conexões cristológicas sem mediação canônica responsável.',
      'Transformar síntese teológica em frase genérica que poderia servir para qualquer texto.',
    ],
    homiletica: [
      'Criar uma estrutura elegante que não nasce da lógica do texto.',
      'Aplicar por moralismo, sem mostrar Cristo como fundamento e motivação.',
      'Falar de necessidades humanas sem deixar que o texto as defina e cure.',
    ],
    estilo: [
      'Confundir profundidade com linguagem obscura ou jargão não explicado.',
      'Usar imagens fortes que desviam a atenção da verdade bíblica.',
      'Manter um tom incompatível com o próprio movimento pastoral do texto.',
    ],
    memoria: [
      'Tentar decorar palavras exatas sem dominar a lógica do sermão.',
      'Praticar apenas mentalmente, sem testar voz, tempo e transições.',
      'Separar preparação espiritual de preparação técnica.',
    ],
    entrega: [
      'Usar voz, gestos ou pausas como performance desconectada da mensagem.',
      'Ignorar sinais da congregação durante a pregação.',
      'Avaliar a entrega apenas por sensação pessoal, sem feedback específico.',
    ],
  }

  return byCategory[seed.categoria]
}

function advancedTipsFor(seed: HelpSeed): string[] {
  return [
    'Compare sua conclusão com dois comentários de tradições diferentes e registre por que concorda ou discorda.',
    'Separe no seu registro o que é dado textual, inferência provável e aplicação pastoral.',
    `Revise ${seed.titulo.toLowerCase()} depois de formular a Grande Ideia para verificar se tudo converge para a tese do texto.`,
  ]
}

function createHelpEntry(seed: HelpSeed): HelpEntry {
  return {
    id: seed.id,
    titulo: seed.titulo,
    descricao: `${seed.titulo} é o campo em que você registra ${seed.foco}. Ele ajuda a impedir leituras apressadas, mantendo a exegese enraizada no texto, no contexto e na finalidade pastoral da pregação.`,
    objetivo: `O objetivo é transformar ${seed.foco} em uma conclusão útil para interpretar fielmente a passagem e pregá-la com clareza reformada.`,
    comoFazer: stepsFor(seed),
    perguntas: questionsFor(seed),
    erros: errorsFor(seed),
    exemplo: seed.exemplo,
    ajudaIA: `A IA pode sugerir caminhos de pesquisa, organizar evidências e propor uma primeira formulação para ${seed.titulo.toLowerCase()}. Use a resposta como assistente de estudo: confira as referências, refine a linguagem e submeta tudo ao texto bíblico.`,
    dicasAvancadas: advancedTipsFor(seed),
  }
}

function communicationCategory(module: string): HelpCategory {
  if (module === 'inventio' || module === 'dispositio') return 'homiletica'
  if (module === 'elocutio') return 'estilo'
  if (module === 'memoria') return 'memoria'
  return 'entrega'
}

function communicationModeLabel(mode: string | undefined): string {
  if (mode === 'sermao') return 'sermão'
  if (mode === 'estudo_biblico') return 'estudo bíblico'
  if (mode === 'devocional') return 'devocional'
  return 'produção ministerial'
}

function createCommunicationHelpEntry(sectionTitle: string, mode: string | undefined, module: string, cardSeed: { id: string; title: string; placeholder: string }): HelpEntry {
  const modeLabel = communicationModeLabel(mode)
  const seed: HelpSeed = {
    id: cardSeed.id,
    titulo: cardSeed.title,
    categoria: communicationCategory(module),
    foco: `${cardSeed.title.toLowerCase()} dentro do fluxo de ${modeLabel}, considerando a seção ${sectionTitle}`,
    exemplo: `Em Romanos 8.1, esse campo deve ajudar a comunicar a ausência de condenação em Cristo de modo adequado ao formato de ${modeLabel}, seja por proclamação, ensino participativo ou meditação pastoral.`,
  }

  return {
    ...createHelpEntry(seed),
    descricao: `${cardSeed.title} é o campo em que você transforma a exegese em uma decisão concreta para ${modeLabel}. Ele organiza ${cardSeed.placeholder.toLowerCase()} sem perder a conexão com o texto bíblico e com a finalidade pastoral da comunicação.`,
    ajudaIA: `A IA pode agir como mentora de ${modeLabel}, sugerindo formulações, perguntas, exemplos e ajustes de tom para ${cardSeed.title.toLowerCase()}. Revise a resposta para garantir fidelidade ao texto, linguagem natural e coerência com a exegese já construída.`,
  }
}

export const HELP_CONTENT: Record<string, HelpEntry> = HELP_SEEDS.reduce<Record<string, HelpEntry>>((content, seed) => {
  content[seed.id] = createHelpEntry(seed)
  return content
}, {})

COMMUNICATION_SECTIONS.forEach(section => {
  section.cards.forEach(cardSeed => {
    HELP_CONTENT[cardSeed.id] = createCommunicationHelpEntry(section.title, section.communicationMode, section.module, cardSeed)
  })
})

Object.assign(HELP_CONTENT, PRODUCTION_HELP_CONTENT)
