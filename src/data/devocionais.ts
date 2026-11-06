export type Trilha = {
  destaque: true
  espelho: string
  consequencia: string
  graca: string
  passo: string
  pergunta: string
} | {
  destaque: false
  texto: string
  pergunta: string
}

export type Devocional = {
  id: number
  bloco: number
  unidade: string
  secao: string
  historia: 'criacao' | 'queda' | 'redencao' | 'consumacao'
  pergunta: { grupo: 'procura' | 'religiao' | 'discipulo'; numero: number; texto: string }
  titulo: string
  leitura: string
  versiculoChave: { referencia: string; texto: string }
  paraComecar: string
  oTexto: string
  verdadeCentral: string
  cristoNoTexto: string
  paraHoje: string[]
  perguntaDoDia: string
  oracao: string
  destaques: Array<'familia' | 'homem' | 'mulher' | 'coisas'>
  trilhas: {
    familia: Trilha
    homem: Trilha
    mulher: Trilha
    coisas: Trilha & { tema?: 'tempo' | 'dinheiro' | 'trabalho' }
  }
}

export const devocionais: Record<number, Devocional> = {

  // ── Bloco 1: Introdução — As Escrituras (Dias 001–006) ──────────────────

  1: {
    id: 1,
    bloco: 1,
    unidade: 'Introdução',
    secao: 'introducao',
    historia: 'redencao',
    pergunta: { grupo: 'discipulo', numero: 1, texto: 'Como crescemos na fé?' },
    titulo: 'A Escritura nos torna sábios para a salvação',
    leitura: '2 Timóteo 3:10-15',
    versiculoChave: {
      referencia: '2 Timóteo 3:15',
      texto: 'E desde a infância sabes as sagradas letras, que podem tornar-te sábio para a salvação, mediante a fé em Cristo Jesus.',
    },
    paraComecar: 'Paulo escreve de uma prisão em Roma sabendo que vai morrer. O que deixa como legado não é uma lista de conquistas: é Timóteo, um homem que aprendeu as Escrituras desde criança. E as Escrituras têm poder — não para impressionar, mas para tornar sábio "para a salvação, mediante a fé em Cristo Jesus".',
    oTexto: 'Paulo recorda o próprio exemplo: ensino, conduta, sofrimentos, perseverança (v.10-11). Depois aponta para o que sustentou tudo isso: a Escritura que Timóteo conhece desde a infância. O argumento é pessoal antes de ser teológico — você viu isso funcionar na minha vida, e você recebeu o mesmo recurso.',
    verdadeCentral: 'A Escritura existe para nos conduzir a Cristo. Ela não é um manual de regras nem um livro de histórias edificantes: é o caminho pelo qual Deus torna as pessoas sábias para a salvação. A necessidade de tê-la não é acadêmica; é vital (CFW 1.1).',
    cristoNoTexto: 'O destino da Escritura é Cristo: ela torna sábio "para a salvação mediante a fé em Cristo Jesus" (v.15). Paulo não separou a Palavra da pessoa — toda a sua teologia converge num nome.',
    paraHoje: [
      'Leia a Bíblia neste ano como alguém que precisa ser tornado sábio, não como alguém que já sabe.',
      'Pense em quem colocou a Escritura na sua vida. A fé de Timóteo começou com Lóide e Eunice (2Tm 1:5).',
      'O objetivo não é terminar os 312 dias. É ser diferente ao final — mais próximo de Cristo.',
    ],
    perguntaDoDia: 'O que você espera que a Bíblia faça em você neste ano?',
    oracao: 'Senhor, tu deste a tua Palavra para tornar sábios para a salvação. Que eu a leia com esse fim — não para saber mais, mas para conhecer mais a Cristo. Amém.',
    destaques: ['familia', 'coisas'],
    trilhas: {
      familia: {
        destaque: true,
        espelho: 'Timóteo aprendeu as Escrituras desde a infância (v.15), da mãe Eunice e da avó Lóide (2Tm 1:5). A fé se transmite em casa, antes da escola dominical e antes do seminário. A família que lê a Bíblia junta não está apenas cumprindo um ritual — está passando o único recurso que pode tornar os filhos sábios para a salvação.',
        consequencia: 'Quando a transmissão da fé fica terceirizada — só para a igreja, só para o grupo de jovens — a geração seguinte recebe a versão pública da fé, não a doméstica. E a fé doméstica é mais duradoura.',
        graca: 'Cristo veio cumprir o que a Escritura prometia. Quando você lê a Bíblia com seus filhos ou com quem está sob seu cuidado, está apontando para o mesmo Cristo que Paulo apresentou a Timóteo.',
        passo: 'Escolha agora um tempo fixo para ler este devocional. Se há família ou grupo, combine o horário. A decisão tomada hoje sustenta os 312 dias seguintes.',
        pergunta: 'Como a Palavra de Deus é passada de geração em geração na sua casa?',
      },
      homem: {
        destaque: false,
        texto: 'Paulo apresenta a si mesmo como modelo: "seguiste de perto o meu ensino, conduta... perseverança" (v.10-11). O homem que segue a Cristo deixa uma trilha que outros podem seguir. Isso não é arrogância — é responsabilidade. A vida que você vive diante da Palavra forma ou deforma quem está observando.',
        pergunta: 'Que trilha você está deixando para quem observa a sua vida?',
      },
      mulher: {
        destaque: false,
        texto: 'Lóide e Eunice (2Tm 1:5) não são personagens secundárias na história de Timóteo — são as pessoas que colocaram a Escritura dentro dele. A fidelidade delas gerou um servo de Deus. A mulher que transmite a fé tem alcance que ela mesma não vê.',
        pergunta: 'De quem você recebeu a fé? Como pode devolver isso a alguém?',
      },
      coisas: {
        destaque: true,
        tema: 'tempo',
        espelho: 'Paulo está preso e vai morrer em breve. Mesmo assim, usa o tempo que lhe resta para escrever e investir em Timóteo. O tempo é o recurso mais revelador: o que a pessoa faz com o pouco que tem mostra o que ela de fato valoriza.',
        consequencia: 'Quando o tempo vai todo para o urgente, o importante fica para depois — e o "depois" muitas vezes não chega. A leitura da Bíblia perde para qualquer coisa que pareça mais imediata.',
        graca: 'Cristo, nas últimas horas antes da cruz, lavou os pés dos discípulos e partiu o pão. Ele não desperdiçou o tempo. A graça liberta do medo do tempo que passa: o que é feito para Deus permanece.',
        passo: 'Reserve 15 minutos diários para esta devocional e proteja esse tempo como protegeria um compromisso importante. Não é rigidez: é respeito por uma decisão que você tomou.',
        pergunta: 'Como o seu uso do tempo neste ano pode refletir o que você diz que mais importa?',
      },
    },
  },

  2: {
    id: 2,
    bloco: 1,
    unidade: 'Introdução',
    secao: 'introducao',
    historia: 'redencao',
    pergunta: { grupo: 'discipulo', numero: 2, texto: 'O que é verdadeiro?' },
    titulo: 'A Escritura é soprada por Deus',
    leitura: '2 Timóteo 3:14-16a',
    versiculoChave: {
      referencia: '2 Timóteo 3:16a',
      texto: 'Toda a Escritura é inspirada por Deus.',
    },
    paraComecar: 'De onde vem a autoridade da Bíblia? Não do papa, não da tradição, não da experiência religiosa, não da razão humana. A Escritura tem autoridade porque veio de Deus. E se veio de Deus, ela não pode ser parcialmente confiável: ou é confiável em tudo ou em nada.',
    oTexto: '"Toda a Escritura é inspirada por Deus" (v.16a) — o termo grego é theopneustos: soprada por Deus. Não é que Deus tenha aprovado textos que os homens escreveram sozinhos. É que o próprio Deus soprou. Os autores humanos escreveram de verdade, com suas personalidades e estilos, mas o que escreveram foi o que Deus quis que fosse escrito (CFW 1.4).',
    verdadeCentral: 'A autoridade da Escritura vem da sua origem. Ela não precisa de outra fonte para validá-la — nem da Igreja, nem da ciência, nem da nossa experiência. Vem de Deus e, por isso, tem a autoridade de Deus (CFW 1.4). O que ela afirma é verdadeiro; o que ela proíbe deve ser evitado; o que ela ordena deve ser obedecido.',
    cristoNoTexto: 'Cristo afirmou a autoridade da Escritura ao resistir às tentações citando-a (Mt 4:4, 7, 10), ao dizer "está escrito" como argumento final. Para ele, a Escritura tinha autoridade porque vinha do Pai — e o que o Pai disse, não pode ser anulado (Jo 10:35).',
    paraHoje: [
      'Leia a Bíblia hoje como alguém que está ouvindo Deus, não avaliando um texto antigo.',
      'Quando a Escritura contrariar sua opinião, lembre-se de quem a escreveu. O problema costuma ser a opinião, não o texto.',
      'A palavra theopneustos — soprada por Deus — é a mesma imagem de Gn 2:7, quando Deus soprou o fôlego nos narinas do homem. A Palavra que Deus soprou dá vida.',
    ],
    perguntaDoDia: 'Há alguma parte da Bíblia que você tem evitado ou relativizado? Por quê?',
    oracao: 'Senhor, a tua Palavra veio de ti. Dá-me humildade para recebê-la como recebo o pão — como algo que não produzi e de que preciso. Amém.',
    destaques: ['homem', 'coisas'],
    trilhas: {
      homem: {
        destaque: true,
        espelho: 'O homem moderno tende a ser o árbitro final da verdade — aceita o que faz sentido para ele e descarta o resto. Mas se a Escritura é soprada por Deus, então o critério não é o que faz sentido para mim. O homem que se submete à Palavra está, nesse ato, reconhecendo que há uma autoridade maior que a sua.',
        consequencia: 'Quando o homem filtra a Bíblia pelo que lhe convém, perde o poder corretivo dela. E o que não corrige de dentro será corrigido de fora — de forma mais dura e menos misericordiosa.',
        graca: 'Cristo, sendo Deus, se submeteu à Escritura: "Para que se cumprissem as Escrituras" aparece repetidamente nos relatos da paixão. A obediência à Palavra não é fraqueza — é o caminho que o próprio Filho percorreu.',
        passo: 'Leia um texto da Bíblia que você costuma evitar ou que te desafia. Não para concordar imediatamente, mas para ouvir.',
        pergunta: 'O que na Bíblia você acha mais difícil de aceitar? Você já perguntou por quê?',
      },
      familia: {
        destaque: false,
        texto: 'Se a Escritura é soprada por Deus, ela é o único texto na casa que tem autoridade sobre todos — pais incluídos. A família que lê a Bíblia juntas não está dando uma aula; está colocando a si mesma debaixo de algo maior que qualquer um de seus membros.',
        pergunta: 'Como a autoridade da Bíblia se manifesta nas decisões da sua casa?',
      },
      mulher: {
        destaque: false,
        texto: 'A mulher que sabe que a Bíblia é Palavra de Deus tem um solo que não muda quando o mundo muda. As opiniões sobre o que é certo e o que é bom para a mulher variam a cada geração; a Escritura soprada por Deus permanece.',
        pergunta: 'O que a Bíblia diz sobre você que nenhuma outra voz consegue dizer com a mesma autoridade?',
      },
      coisas: {
        destaque: true,
        tema: 'dinheiro',
        espelho: 'Se a Escritura é Palavra de Deus, então o que ela diz sobre dinheiro tem autoridade — não é conselho opcional. Mas a maioria das pessoas separa a fé das finanças, como se fossem domínios distintos. Essa separação é incompatível com theopneustos.',
        consequencia: 'Quando as decisões financeiras ignoram o que a Bíblia diz sobre generosidade, dívida e confiança, a consequência não é só prática (dificuldade financeira) — é espiritual: um coração dividido.',
        graca: 'Cristo disse que não se pode servir a Deus e ao dinheiro (Mt 6:24). Não disse que o dinheiro é mau — disse que ele compete com Deus pelo lugar de senhor. A graça é que, em Cristo, o coração pode ser liberto dessa competição.',
        passo: 'Leia um texto bíblico sobre dinheiro esta semana — Pv 3:9-10, Lc 16:10-13 ou 2Co 9:7 — e pergunte o que ele pede de você.',
        pergunta: 'Suas decisões financeiras refletem que você crê que a Bíblia é Palavra de Deus?',
      },
    },
  },

  3: {
    id: 3,
    bloco: 1,
    unidade: 'Introdução',
    secao: 'introducao',
    historia: 'redencao',
    pergunta: { grupo: 'discipulo', numero: 3, texto: 'Como crescemos na fé?' },
    titulo: 'A Escritura é suficiente para toda boa obra',
    leitura: '2 Timóteo 3:16 – 4:2',
    versiculoChave: {
      referencia: '2 Timóteo 3:16b-17',
      texto: '…útil para o ensino, para a repreensão, para a correção, para a instrução na justiça, para que o homem de Deus seja perfeito e perfeitamente instruído para toda boa obra.',
    },
    paraComecar: 'Depois de dizer que a Escritura é soprada por Deus, Paulo imediatamente passa ao para quê. Deus não soprou a Palavra para satisfazer curiosidade teológica. Soprou para que o seu povo fosse equipado — para toda boa obra, sem exceção.',
    oTexto: 'Os quatro verbos do v.16b formam um movimento completo: ensina o que está certo, repreende o que está errado, corrige quem caiu, instrui na justiça quem está em pé. É um ciclo completo de formação. E o alvo não é o crente teórico — é o "homem de Deus" que age: "perfeitamente instruído para toda boa obra" (v.17). Paulo então aplica imediatamente em 4:1-2: prega a Palavra, insiste a tempo e fora de tempo.',
    verdadeCentral: 'A Escritura é suficiente. Não precisa ser complementada por tradição, por experiência espiritual ou por filosofia para equipar o povo de Deus. Ela já contém tudo que é necessário para a fé e a prática (CFW 1.6). O que falta não está em outro livro: está na aplicação do que a Bíblia já diz.',
    cristoNoTexto: 'Cristo é o "homem de Deus" por excelência — perfeitamente instruído, perfeito em toda boa obra. E ele prometeu o Espírito para guiar os seus na verdade (Jo 16:13). A suficiência da Escritura não exclui o Espírito: o mesmo Espírito que soprou a Palavra a aplica ao coração.',
    paraHoje: [
      'Quando você sentir que precisa de algo além da Bíblia para crescer, pergunte: já apliquei o que ela já disse?',
      'Os quatro verbos — ensinar, repreender, corrigir, instruir — funcionam juntos. A Escritura que só conforta sem repreender é a metade do livro.',
      '"Prega a Palavra, insiste a tempo e fora de tempo" (4:2). O que você tem pregado — para si mesmo e para quem está ao seu redor?',
    ],
    perguntaDoDia: 'Qual dos quatro benefícios da Escritura você mais precisa agora: ensino, repreensão, correção ou instrução?',
    oracao: 'Senhor, a tua Palavra é suficiente. Liberta-me da busca por outro recurso enquanto deixo o que já tens dado sem abrir. Que eu a aplique, não só a admire. Amém.',
    destaques: ['homem', 'mulher'],
    trilhas: {
      homem: {
        destaque: true,
        espelho: 'O homem de Deus de que Paulo fala (v.17) é alguém que age — "perfeitamente instruído para toda boa obra". Não é o homem que sabe muito; é o homem que faz. A Escritura não foi dada para encher cabeça, mas para mover mãos.',
        consequencia: 'O homem que acumula conhecimento bíblico sem aplicação desenvolve uma imunidade — aprende a ouvir sem se mover. A palavra para isso, em Tiago 1:22, é "enganar a si mesmo".',
        graca: 'Cristo não só ensinou — agiu. E a mesma fé que justifica também produz obras (Ef 2:10). O homem que está em Cristo tem o Espírito que o move — não por obrigação, mas por nova natureza.',
        passo: 'Escolha uma "boa obra" concreta que você tem adiado — em casa, no trabalho, na igreja — e faça hoje. A Escritura já deu a instrução; falta o passo.',
        pergunta: 'Onde a Escritura tem te ensinado algo que você ainda não aplicou?',
      },
      familia: {
        destaque: false,
        texto: 'A família que lê a Bíblia juntas não precisa de outro manual para criar filhos, resolver conflitos ou construir um lar. Isso não significa que não há outros recursos úteis — significa que a Escritura é suficiente para o que mais importa. O resto pode ajudar; a Bíblia é indispensável.',
        pergunta: 'Há algum problema na sua casa que você tem buscado resolver sem levar à Escritura?',
      },
      mulher: {
        destaque: true,
        espelho: 'A Escritura instrui "para toda boa obra" — sem listar quais obras pertencem a quem. A mulher que está em Cristo tem o mesmo recurso que o homem: a Palavra completa de Deus, suficiente para equipá-la para o que Deus a chamou a fazer.',
        consequencia: 'Quando a mulher busca sua identidade e vocação principalmente nas redes sociais, na psicologia popular ou na cultura, está trocando o suficiente pelo insuficiente.',
        graca: 'Cristo morreu por uma Igreja sem mancha (Ef 5:25-27), que inclui cada mulher que crê nele. A graça não equipou a metade — equipou o todo.',
        passo: 'Leia um texto bíblico hoje perguntando: o que isto diz sobre quem eu sou e para o que fui feita?',
        pergunta: 'O que a Bíblia diz sobre o seu chamado que nenhum outro livro poderia dizer?',
      },
      coisas: {
        destaque: false,
        tema: 'trabalho',
        texto: '"Toda boa obra" inclui o trabalho diário. A Escritura é suficiente para equipar o crente para servir a Deus no seu ofício — não só na igreja, mas na empresa, na cozinha, na escola. A espiritualidade que fica restrita ao domingo é insuficiente para uma semana inteira.',
        pergunta: 'Como a Escritura tem te equipado para o trabalho que você faz durante a semana?',
      },
    },
  },

  4: {
    id: 4,
    bloco: 1,
    unidade: 'Introdução',
    secao: 'introducao',
    historia: 'redencao',
    pergunta: { grupo: 'discipulo', numero: 4, texto: 'Como lemos a Bíblia?' },
    titulo: 'Manejar bem a palavra da verdade',
    leitura: '2 Timóteo 2:14-19',
    versiculoChave: {
      referencia: '2 Timóteo 2:15',
      texto: 'Procura apresentar-te a Deus aprovado, como obreiro que não tem de que se envergonhar, que maneja bem a palavra da verdade.',
    },
    paraComecar: 'Há maneiras de manusear a Bíblia que a distorcem sem citar falsidades — pegando versículos fora de contexto, forçando sentidos que o autor nunca pretendeu, aplicando a um público o que foi dito para outro. Paulo chama isso de "desviar-se da verdade" (v.18). E por isso o antídoto não é mais entusiasmo, mas mais cuidado: manejar bem.',
    oTexto: 'O contraste do texto é entre "contendas de palavras" (v.14, 16) e "manejar bem a palavra da verdade" (v.15). O problema não é falar da Bíblia — é falar dela mal. Dois exemplos aparecem: Himeneu e Fileto, que disseram que a ressurreição já havia ocorrido (v.17-18). O erro não foi negar a ressurreição — foi aplicá-la mal. A forma importa tanto quanto o conteúdo.',
    verdadeCentral: 'A Escritura é clara — mas sua clareza não é automática. Ela pede um obreiro que a maneje bem: que leia no contexto, que observe o gênero literário, que deixe a Escritura interpretar a Escritura (CFW 1.7, 1.9). O sábado não é um teste de inteligência; é um chamado à diligência.',
    cristoNoTexto: 'Cristo é o exemplo de leitura correta: "estava escrito" era o seu argumento, sempre em contexto, sempre aplicado ao que o texto pretendia dizer. Quando tentado, não pegou o Salmo 91 para fazer o que queria — deixou o texto dizer o que dizia.',
    paraHoje: [
      'Quando ler um texto hoje, pergunte: quem escreveu, para quem, e por quê? O contexto é o primeiro instrumento de qualquer boa leitura.',
      'Um versículo tirado de contexto pode dizer o oposto do que o autor pretendia. Sempre leia o parágrafo inteiro, pelo menos.',
      'A Escritura interpreta a Escritura (CFW 1.9): quando um texto for difícil, procure o que o resto da Bíblia diz sobre o mesmo tema.',
    ],
    perguntaDoDia: 'Há algum texto bíblico que você costuma citar sem verificar o contexto?',
    oracao: 'Senhor, a tua Palavra merece ser bem manuseada. Dá-me paciência para ler com cuidado e humildade para deixar o texto dizer o que ele diz — não o que eu quero ouvir. Amém.',
    destaques: ['homem', 'coisas'],
    trilhas: {
      homem: {
        destaque: true,
        espelho: 'O obreiro que "não tem de que se envergonhar" é aquele que colocou esforço na leitura. A Escritura é clara, mas sua clareza responde ao leitor diligente. O homem que quer crescer na fé precisa aprender a ler — não só a ler muito, mas a ler bem.',
        consequencia: 'O homem que usa a Bíblia para defender posições que já tinha antes de lê-la está usando a autoridade de Deus para validar a sua própria. O resultado é uma fé que não muda — porque a Palavra nunca chega a corrigi-lo.',
        graca: 'Cristo veio para cumprir a Escritura, não para relativizá-la (Mt 5:17). O Espírito que ele enviou guia os seus "em toda a verdade" (Jo 16:13). A diligência humana e a iluminação do Espírito não competem — caminham juntas.',
        passo: 'Escolha um texto desta semana e leia o capítulo inteiro antes de tirar conclusões sobre um versículo específico.',
        pergunta: 'Como você distingue entre o que a Bíblia diz e o que você quer que ela diga?',
      },
      familia: {
        destaque: false,
        texto: 'A família que lê a Bíblia junta aprende a manejar a Palavra em conversa. Quando um filho pergunta "mas por que?", a resposta que diz "porque a Bíblia diz" sem explicar o contexto ensina obediência sem entendimento. A família que aprendeu a ler bem o texto forma pessoas que sabem por que creem.',
        pergunta: 'Como você explica o que lê na Bíblia para quem está na sua casa?',
      },
      mulher: {
        destaque: false,
        texto: 'Muitos textos bíblicos sobre a mulher são citados sem contexto — para restringir ou para liberar, dependendo de quem cita. A mulher que aprendeu a ler a Bíblia bem tem defesa contra as duas distorções: pode verificar o que o texto diz, não o que a cultura quer que diga.',
        pergunta: 'Há algum texto sobre a mulher que você nunca leu no contexto completo?',
      },
      coisas: {
        destaque: true,
        tema: 'trabalho',
        espelho: '"Obreiro que não tem de que se envergonhar" é a imagem do trabalhador diligente, não do improvisador. Paulo aplica a metáfora do trabalho à leitura da Bíblia — porque a qualidade do trabalho espiritual importa tanto quanto a qualidade do trabalho profissional.',
        consequencia: 'Quando o trabalhador é descuidado na leitura da Bíblia mas exigente no trabalho, está dizendo implicitamente que o trabalho importa mais que a Palavra. O standard que ele aplica ao ofício deveria ser aplicado à Escritura.',
        graca: 'O próprio Deus trabalhou: criou em seis dias e descansou no sétimo. A graça não elimina o esforço — resgata o esforço do medo e da compulsão, e o converte em serviço.',
        passo: 'Leia uma passagem desta semana como leria um documento importante de trabalho — com atenção, sem pressa, anotando o que não entendeu para buscar depois.',
        pergunta: 'O cuidado com que você lê a Bíblia é proporcional à importância que você diz que ela tem para você?',
      },
    },
  },

  5: {
    id: 5,
    bloco: 1,
    unidade: 'Introdução',
    secao: 'introducao',
    historia: 'redencao',
    pergunta: { grupo: 'discipulo', numero: 5, texto: 'Como conhecemos a Deus?' },
    titulo: 'Cristo abriu as Escrituras — e o coração ardeu',
    leitura: 'Lucas 24:13-35',
    versiculoChave: {
      referencia: 'Lucas 24:27',
      texto: 'E, começando por Moisés e por todos os profetas, explicou-lhes o que dele se achava em todas as Escrituras.',
    },
    paraComecar: 'Dois homens caminham para Emaús com os olhos abertos mas sem ver. Conheciam os fatos: a crucificação, o túmulo vazio, o relato das mulheres. O que faltava não era informação. Era interpretação. Era alguém que soubesse explicar por que tudo aquilo era necessário.',
    oTexto: 'Jesus se une a eles no caminho sem ser reconhecido. Ouve, pergunta, e então começa a abrir as Escrituras: de Moisés a todos os profetas, o que nelas se refere a ele (v.27). Quando chegam à mesa e ele parte o pão, os olhos se abrem — mas ele já tinha desaparecido. "Não nos ardia o coração?" (v.32). A Escritura aberta produz um calor que o coração reconhece. O coração que não arde provavelmente ainda não ouviu a Escritura aberta.',
    verdadeCentral: 'Cristo é o centro da Escritura, não apenas um de seus personagens. Ele não aparece como surpresa no Novo Testamento: está em cada promessa, cada tipo, cada sacrifício, cada rei e profeta que aponta além de si mesmo. Ler a Bíblia é aprender a ver onde Cristo sempre esteve (CFW 1.5).',
    cristoNoTexto: 'O próprio Jesus faz a hermenêutica: começa por Moisés e percorre toda a Escritura mostrando o que se refere a ele. Este devocional anual segue essa trilha — não como exercício intelectual, mas porque é assim que o coração arde.',
    paraHoje: [
      'Leia qualquer texto hoje perguntando: como isso aponta para Cristo? Pode ser tipo, cumprimento, contraste ou promessa.',
      'A tristeza dos dois homens não os impediu de ouvir. Leve sua tristeza ou sua dúvida ao texto — não as esconda.',
      'Eles convidaram o desconhecido a ficar. O que você precisa fazer para que esta leitura anual seja uma prática e não só uma intenção?',
    ],
    perguntaDoDia: 'Quando foi a última vez que o coração ardeu ao ouvir a Escritura? O que estava sendo lido?',
    oracao: 'Senhor Jesus, abre as Escrituras para nós como abriste naquele caminho. Que o nosso coração arda ao ouvir tua voz nelas. Amém.',
    destaques: ['familia', 'coisas'],
    trilhas: {
      familia: {
        destaque: true,
        espelho: 'Os dois caminhavam juntos — conversando e discutindo (v.14-15). A crise na fé costuma isolar. Mas eles estavam juntos, compartilhando o que tinham visto e o que não entendiam. A família e o grupo que se reúne para ler juntos têm nessa cena um modelo: não fingir que está tudo bem, mas caminhar junto.',
        consequencia: 'Quando cada um processa a fé sozinho, perde a oportunidade de ouvir o "não nos ardia o coração?" — essa confirmação de que Deus estava agindo, que só se percebe em conversa.',
        graca: 'Cristo veio ao encontro deles no caminho, não esperou que chegassem com as respostas prontas. A graça alcança no meio da crise, antes que a fé se recomponha.',
        passo: 'Esta semana, leia uma passagem com alguém da sua casa ou do seu grupo e pergunte: "O que você viu neste texto que eu não tinha visto?"',
        pergunta: 'Há alguém com quem você está "caminhando triste" e ainda não conseguiu falar sobre a fé?',
      },
      homem: {
        destaque: false,
        texto: 'Os dois homens tinham esperado que Jesus fosse "resgatar a Israel" com poder político (v.21). Suas expectativas eram legítimas mas menores que a realidade. O homem que segue a Cristo precisa estar disposto a ter as próprias expectativas corrigidas — inclusive sobre como o poder e o sucesso funcionam.',
        pergunta: 'O que você esperava que seguir a Cristo fosse resolver na sua vida, e ainda não foi da forma que você pensava?',
      },
      mulher: {
        destaque: false,
        texto: 'São as mulheres que chegam primeiro ao túmulo (v.22-23). A fé feminina naquele momento era mais corajosa que a masculina — o texto não esconde isso. Cristo, ao ressuscitar, confirma que a fidelidade delas era certa.',
        pergunta: 'O que você tem visto em relação à fé que ainda não encontrou palavras para contar?',
      },
      coisas: {
        destaque: true,
        tema: 'tempo',
        espelho: 'Os dois caminhavam — uma jornada de quase 11 km. Cristo usou esse tempo de viagem. O tempo que você "não tem" para Deus pode ser o tempo que ele escolhe usar. A Escritura não exige condições ideais: ela arde no caminho.',
        consequencia: 'A pressa que não deixa espaço para conversas longas é a pressa que perde as interpretações que mudam tudo.',
        graca: 'Cristo não exigiu um horário nem condições ideais. Foi junto no tempo que eles tinham.',
        passo: 'Escolha um trajeto semanal — a pé, de carro, de ônibus — e use-o para ouvir ou ler uma passagem da Bíblia.',
        pergunta: 'Qual parte do seu dia você poderia redirecionar para a leitura — sem adicionar tempo, só redirecionando o que já existe?',
      },
    },
  },

  6: {
    id: 6,
    bloco: 1,
    unidade: 'Introdução',
    secao: 'introducao',
    historia: 'redencao',
    pergunta: { grupo: 'discipulo', numero: 6, texto: 'O que é verdadeiro?' },
    titulo: 'Toda a Bíblia, um só centro, uma só missão',
    leitura: 'Lucas 24:36-49',
    versiculoChave: {
      referencia: 'Lucas 24:45',
      texto: 'Então lhes abriu o entendimento para compreenderem as Escrituras.',
    },
    paraComecar: 'Os dois voltaram de Emaús e encontraram os onze. Enquanto ainda contavam o que havia acontecido, Jesus apareceu no meio deles — e o problema não foi embora: "ficaram aterros e cheios de medo" (v.37). Mesmo sabendo da ressurreição, precisavam que o entendimento fosse aberto. É o que Jesus faz.',
    oTexto: 'Jesus mostra as mãos e os pés, come peixe assado (v.42-43), e então explica: "Era necessário que se cumprisse tudo o que de mim está escrito na Lei de Moisés, nos Profetas e nos Salmos" (v.44). Depois "abriu-lhes o entendimento para compreenderem as Escrituras" (v.45). O entendimento não foi conquistado — foi dado. E com ele veio a missão: arrependimento e perdão de pecados pregados em todas as nações (v.47). O contraponto (2Tm 4:3-4) aparece aqui: haverá quem não suporte a sã doutrina e busque mestres que digam o que querem ouvir. A Escritura aberta conduz à missão; a Escritura distorcida conduz ao conforto.',
    verdadeCentral: 'A Escritura toda — Lei, Profetas e Salmos — aponta para Cristo e para a missão que ele cumpriu e confiou à Igreja. Não há parte do cânon que seja decorativa. E o entendimento para enxergar isso não é produto de estudo: é dom do mesmo Senhor que abriu as Escrituras no caminho.',
    cristoNoTexto: 'Cristo é o intérprete e o conteúdo das Escrituras ao mesmo tempo. Ele abre o entendimento (v.45) e é o que o entendimento aberto vê. A jornada deste ano inteiro é uma caminhada com ele pelas Escrituras que falam dele.',
    paraHoje: [
      'O entendimento foi aberto (v.45) — peça o mesmo ao começar cada leitura. É uma oração de um versículo: "Senhor, abre o meu entendimento."',
      'A Escritura conduz à missão: "arrependimento e perdão de pecados, pregados em seu nome a todas as nações" (v.47). Leitura sem missão é a metade do caminho.',
      'Paulo avisa: haverá quem não suporte a sã doutrina (2Tm 4:3). Questione: você busca textos que confirmem o que quer ouvir, ou textos que te transformem?',
    ],
    perguntaDoDia: 'Ao terminar estes seis dias, o que mudou na forma como você pretende ler a Bíblia este ano?',
    oracao: 'Senhor, abre o nosso entendimento para compreender as Escrituras. Que neste ano encontremos a ti em cada texto, e que o que encontrarmos nos mova para o mundo. Amém.',
    destaques: ['familia', 'homem'],
    trilhas: {
      familia: {
        destaque: true,
        espelho: 'Os discípulos estavam reunidos quando Jesus apareceu (v.36). A missão de levar arrependimento e perdão a todas as nações (v.47) começou com um grupo, não com indivíduos isolados. A família e o grupo que lê junto não estão fazendo só uma devoção particular — estão se preparando para a missão.',
        consequencia: 'Quando a fé fica restrita ao privado, a missão fica restrita ao acidente — o evangelho só sai quando alguém pergunta. A família que entende a missão vai além disso.',
        graca: 'Cristo enviou os discípulos ainda com marcas de medo (v.37). A missão não esperou que estivessem preparados. A graça envia antes que a segurança chegue.',
        passo: 'Encerre estes seis dias de introdução em família ou com alguém do grupo: cada um diz uma coisa que pretende fazer diferente na leitura deste ano.',
        pergunta: 'Como a sua família ou grupo pode ser um lugar de missão — e não só de consumo — neste ano?',
      },
      homem: {
        destaque: true,
        espelho: 'Jesus apareceu, e o primeiro instinto dos discípulos foi o medo (v.37). O homem que segue a Cristo não está isento do medo — mas tem alguém que aparece no meio dele e diz "paz a vós" (v.36). A paz de Cristo não elimina os problemas; entra neles.',
        consequencia: 'O homem que espera estar sem medo antes de agir vai esperar para sempre. A missão de v.47 começa enquanto o coração ainda treme.',
        graca: 'Cristo veio ao encontro deles — não mandou um recado, não esperou que fossem ao templo. A graça que inicia a missão é a mesma que sustenta o missionário.',
        passo: 'Comece o próximo bloco com uma pergunta: o que a Bíblia vai me pedir este ano que ainda me assusta?',
        pergunta: 'Há algo que Cristo está te enviando para fazer, e você ainda está esperando estar mais preparado?',
      },
      mulher: {
        destaque: false,
        texto: 'As mulheres que foram ao túmulo foram as primeiras a receber a notícia da ressurreição (Lc 24:10). A missão de v.47 começa com quem esteve presente no momento mais importante. A mulher que busca Cristo na Escritura está no caminho certo — e tem uma história que precede a dos que duvidaram.',
        pergunta: 'O que você viveu de Deus que ainda não contou a ninguém?',
      },
      coisas: {
        destaque: false,
        tema: 'trabalho',
        texto: 'A missão de Lc 24:47 não é só dos pastores — é de toda a Igreja. O crente que trabalha é um missionário no seu ambiente de trabalho. A Escritura aberta não conduz só ao culto: conduz à presença no mundo. O trabalho é o campo, não o obstáculo.',
        pergunta: 'Como o seu trabalho pode ser um lugar de missão neste ano?',
      },
    },
  },

  // ── Bloco 2: Gênesis 1–11 (Dias 007–012) ───────────────────────────────

  7: {
    id: 7,
    bloco: 2,
    unidade: 'Gênesis 1–11',
    secao: 'pentateuco',
    historia: 'criacao',
    pergunta: {
      grupo: 'procura',
      numero: 1,
      texto: 'O que é real?',
    },
    titulo: 'No princípio, Deus criou — e era muito bom',
    leitura: 'Gênesis 1:1 – 2:3',
    versiculoChave: {
      referencia: 'Gênesis 1:27',
      texto: 'Criou Deus, pois, o homem à sua imagem, à imagem de Deus o criou; homem e mulher os criou.',
    },
    paraComecar: 'Antes de qualquer pecado, qualquer queda ou qualquer promessa de redenção — há a criação. Deus fala e as coisas existem. E ao final de cada etapa, o texto repete o mesmo veredicto: "era bom". Ao criar o ser humano, vai além: "era muito bom". A história começa com abundância, não com falta.',
    oTexto: 'Gênesis 1 não é um texto de ciência — é um texto de liturgia e teologia. O autor apresenta Deus como o único Criador de tudo, sem competidores nem matéria preexistente. Os seis dias mostram um mundo ordenado (dias 1-3: separações; dias 4-6: habitantes de cada espaço), culminando no ser humano, que é criado à imagem de Deus — o único com essa distinção. O sétimo dia consagra o descanso: Deus mesmo repousa, e esse ritmo de trabalho e descanso é escrito no tecido da realidade.',
    verdadeCentral: 'Deus é o Criador de tudo que existe, e o ser humano é a coroa da criação — feito à imagem de Deus para refletir o seu caráter e exercer seu domínio no mundo. A criação não é o pano de fundo da história: é o palco que Deus prepara para habitar com o seu povo.',
    cristoNoTexto: 'O Novo Testamento identifica Cristo como o agente da criação: "Todas as coisas foram feitas por intermédio dele" (Jo 1:3). O Filho pelo qual Deus criou o mundo é o mesmo que veio habitar nele (Jo 1:14). E o ser humano criado à imagem de Deus encontra em Cristo a "imagem do Deus invisível" (Cl 1:15) — o que Adão deveria ter sido.',
    paraHoje: [
      'Receba este dia como criação de Deus — não como acidente. Você existe porque Deus quis.',
      '"À imagem de Deus o criou." Sua dignidade não vem do que você produz, mas de quem você é.',
      'O sétimo dia foi consagrado. O descanso não é fraqueza — faz parte da ordem boa que Deus criou.',
    ],
    perguntaDoDia: 'O que significa para você ser feito à imagem de Deus — hoje, nesta semana?',
    oracao: 'Senhor, tu criaste todas as coisas, e eram muito boas. Que hoje eu viva como imagem tua — refletindo teu caráter diante de quem está ao meu redor. Amém.',
    destaques: ['familia', 'homem'],
    trilhas: {
      familia: {
        destaque: true,
        espelho: '"Homem e mulher os criou" (v.27). Antes do casamento, antes do jardim, antes da queda — a diferença entre homem e mulher é criação boa de Deus, parte do projeto original. A família começa aqui, não no capítulo 2.',
        consequencia: 'Quando a identidade de gênero se torna apenas construção cultural, perde-se a ancoragem na criação de Deus. E quando se perde essa ancoragem, o casamento perde o seu fundamento mais antigo.',
        graca: 'Cristo veio refazer o que a queda deformou. A nova criação (2Co 5:17) não é a abolição da criação original — é o seu restauro. O que Deus criou bom, Cristo redime.',
        passo: 'Olhe para alguém da sua casa hoje e lembre-se: esta pessoa foi feita à imagem de Deus. Essa lembrança muda como você a trata.',
        pergunta: 'Como a criação "muito boa" de Deus aparece — ou deveria aparecer — nas relações da sua casa?',
      },
      homem: {
        destaque: true,
        espelho: 'Deus "criou o homem à sua imagem" e deu a ele domínio sobre a criação (v.26-28). O domínio não é exploração: é serviço. O homem foi feito para cultivar e cuidar, não para usar e descartar. A imagem de Deus é o fundamento de uma masculinidade que serve.',
        consequencia: 'Quando o homem entende o domínio como posse — das pessoas, dos recursos, do ambiente — desvirtua o projeto de Gênesis 1. O resultado é destruição onde deveria haver cuidado.',
        graca: 'Cristo, o último Adão (1Co 15:45), exerceu domínio pelo serviço e pelo sacrifício. A Cruz é o ponto mais alto do domínio restaurado: aquele que poderia tudo se entregou por amor.',
        passo: 'Escolha uma área da sua responsabilidade — família, trabalho, amigos — e pergunte: como posso servir aqui, em vez de só usar?',
        pergunta: 'O "domínio" que você exerce na sua vida se parece mais com cuidado ou com controle?',
      },
      mulher: {
        destaque: false,
        texto: '"À imagem de Deus o criou; homem e mulher os criou" (v.27). A mulher foi criada à imagem de Deus da mesma forma que o homem — não como imagem diminuída, não como adjunto. A dignidade não é distribuída em proporções: foi dada a ambos, inteiramente.',
        pergunta: 'Há alguma voz — cultura, comparação, expectativa — que tem diminuído em você o que Deus colocou inteiro?',
      },
      coisas: {
        destaque: false,
        tema: 'trabalho',
        texto: 'Deus trabalhou durante seis dias e descansou no sétimo (2:2). O trabalho humano é reflexo do trabalho de Deus — não é consequência da queda, mas parte da imagem. E o descanso semanal foi consagrado antes do pecado. O trabalhador que descansa não está sendo preguiçoso: está sendo obediente.',
        pergunta: 'Como o ritmo de trabalho e descanso que Deus criou aparece — ou deveria aparecer — na sua semana?',
      },
    },
  },

  8: {
    id: 8,
    bloco: 2,
    unidade: 'Gênesis 1–11',
    secao: 'pentateuco',
    historia: 'criacao',
    pergunta: {
      grupo: 'procura',
      numero: 6,
      texto: 'Como sabemos o que é certo e o que é errado?',
    },
    titulo: 'Deus dá ao homem um lugar, uma tarefa e uma palavra',
    leitura: 'Gênesis 2:4-25',
    versiculoChave: {
      referencia: 'Gênesis 2:16-17',
      texto: 'E o Senhor Deus lhe deu esta ordem: De toda árvore do jardim comerás livremente, mas da árvore do conhecimento do bem e do mal não comerás; porque, no dia em que dela comeres, certamente morrerás.',
    },
    paraComecar: 'Todo emprego novo começa do mesmo jeito: um lugar para ficar, uma função a cumprir e algumas regras. Ninguém se ofende com isso, porque é assim que se sabe para que se está ali. Mas a pergunta mais funda continua: para que eu existo? E quem tem o direito de responder?',
    oTexto: 'Depois do panorama do capítulo 1, a câmera se aproxima de um jardim. Deus forma o homem do pó, sopra nele o fôlego da vida, planta o Éden e o coloca ali. Há fartura, uma única proibição e uma falta: "Não é bom que o homem esteja só" (v.18).',
    verdadeCentral: 'Deus cria o ser humano para viver diante dele, com ele e para ele. Dá vida, lugar, trabalho, companhia e uma palavra a obedecer. Nessa relação, que a Confissão chama de pacto de obras (CFW 7.2), a vida estava prometida à obediência, e a morte, à desobediência. O certo e o errado não nascem de nós: vêm da palavra que Deus fala.',
    cristoNoTexto: 'Adão recebeu a palavra e falhou, e por ele o pecado entrou no mundo (Rm 5:12). Cristo, o último Adão (1Co 15:45), veio obedecer onde o primeiro desobedeceu: "por meio da obediência de um só muitos se tornarão justos" (Rm 5:19). E o que Adão perdeu no jardim, Cristo devolve multiplicado (Ap 22:1-3).',
    paraHoje: [
      'Receba o seu propósito como dádiva de Deus, e não como algo que você precisa conquistar.',
      'Antes de ouvir outras vozes hoje, ouça a palavra de Deus. Foi assim no Éden: primeiro a palavra, depois a tarefa.',
      'Lembre-se de que, em Cristo, sua identidade não depende do seu desempenho, mas da obediência dele.',
    ],
    perguntaDoDia: 'A quem você tem deixado dizer quem você é?',
    oracao: 'Senhor, tu me formaste do pó e me deste fôlego. Obrigado porque o meu propósito vem de ti. Onde falhei como Adão, cobre-me com a obediência de Cristo. Amém.',
    destaques: ['homem', 'familia'],
    trilhas: {
      homem: {
        destaque: true,
        espelho: 'Adão é colocado no jardim "para o cultivar e o guardar" (v.15) e recebe a palavra de Deus antes de a mulher ser criada (v.16-17). A tarefa do homem começa com ouvir. O homem foi feito para servir, que é cultivar, e para proteger, que é guardar, sempre debaixo da palavra.',
        consequencia: 'Quando o homem não guarda a palavra, ela deixa de chegar a quem está sob o seu cuidado. No capítulo seguinte, Adão estava ao lado da mulher e ficou calado (Gn 3:6).',
        graca: 'Cristo é o homem que guardou perfeitamente o que o Pai lhe confiou: "Não perdi nenhum dos que me deste" (Jo 18:9). A força para cultivar e guardar não nasce do homem; vem de estar unido a ele (Jo 15:5).',
        passo: 'Escolha uma responsabilidade de cuidado que você vem adiando — em casa, no trabalho ou na igreja — e dê o primeiro passo hoje.',
        pergunta: 'O que Deus lhe deu para cultivar e guardar, e o que você tem deixado sem cuidado?',
      },
      familia: {
        destaque: true,
        espelho: 'O casamento não é uma invenção da cultura. É obra de Deus, antes da queda. O v.24 tem três verbos: deixar, unir-se e tornar-se uma só carne.',
        consequencia: 'Quando o casamento vira contrato de conveniência, ou quando os pais continuam ocupando o lugar do cônjuge, a união se enfraquece. Deixar vem antes de unir-se.',
        graca: 'Jesus cita este texto para defender a permanência do casamento (Mt 19:4-6), e Paulo mostra que ele aponta para Cristo e a Igreja (Ef 5:31-32).',
        passo: 'Casados: separem dez minutos hoje para conversar sem telas e agradecer a Deus pela união. Solteiros: digam uma palavra de ânimo a um casal da família ou da igreja.',
        pergunta: 'O que ainda precisa ser "deixado" para que a união na sua casa seja inteira?',
      },
      mulher: {
        destaque: false,
        texto: 'A mulher é criada como "auxiliadora que lhe seja idônea" (v.18). A palavra hebraica traduzida por auxiliadora é usada para o próprio Deus, que socorre o seu povo (Sl 121:1-2). Não indica inferioridade: indica uma ajuda que corresponde, da mesma natureza, "osso dos meus ossos" (v.23).',
        pergunta: 'A sua identidade nasce do que Deus diz de você ou do olhar dos outros?',
      },
      coisas: {
        destaque: false,
        tema: 'trabalho',
        texto: 'Antes da queda já havia trabalho: "para o cultivar e o guardar" (v.15). O trabalho não é castigo. O castigo veio depois, no cansaço e na frustração (Gn 3:17-19). Trabalhar faz parte do propósito para o qual Deus nos fez (Cl 3:23).',
        pergunta: 'Você vê o seu trabalho de hoje como serviço a Deus ou só como meio de sobreviver?',
      },
    },
  },
}
