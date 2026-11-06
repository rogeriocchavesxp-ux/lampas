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
  data: string
  diaSemana: string
  semana: number
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
  1: {
    id: 1,
    data: '2026-11-03',
    diaSemana: 'terça',
    semana: 0,
    unidade: 'Introdução',
    secao: 'introducao',
    historia: 'redencao',
    pergunta: {
      grupo: 'discipulo',
      numero: 1,
      texto: 'Como crescemos na fé?',
    },
    titulo: 'A Escritura é suficiente para equipar o servo de Deus',
    leitura: '2 Timóteo 3:10-17',
    versiculoChave: {
      referencia: '2 Timóteo 3:16-17',
      texto: 'Toda a Escritura é inspirada por Deus e útil para o ensino, para a repreensão, para a correção, para a instrução na justiça, para que o homem de Deus seja perfeito e perfeitamente instruído para toda boa obra.',
    },
    paraComecar: 'Antes de começar a ler, vale uma pergunta simples: por que ler a Bíblia durante um ano inteiro? Paulo responde antes que a pergunta seja feita. Ele escreve de uma prisão em Roma, sabendo que vai morrer. E o que deixa como legado não é uma lista de conquistas: é a confiança de que a Escritura é suficiente.',
    oTexto: 'Paulo lembra a Timóteo o que ele já sabe: Paulo sofreu e perseverou, e a Escritura guiou tudo isso. Depois retrocede ainda mais: Timóteo aprendeu as Escrituras desde criança, e elas têm poder para torná-lo sábio "para a salvação, mediante a fé em Cristo Jesus" (v.15). Os versículos 16-17 não são uma afirmação isolada sobre a Bíblia. São a conclusão de um argumento: continue no que aprendeu, porque a fonte do que você aprendeu é Deus mesmo.',
    verdadeCentral: 'A Escritura é palavra de Deus — não em parte, mas toda ela. E por isso é útil: para ensinar o que é verdadeiro, repreender o que é errado, corrigir quem caiu, instruir quem quer crescer. O objetivo final não é conhecimento, mas uma vida inteira à disposição de Deus.',
    cristoNoTexto: 'A Escritura torna sábio "para a salvação mediante a fé em Cristo Jesus" (v.15). Cristo não é apenas o tema de algumas partes da Bíblia — ele é o destino ao qual toda ela aponta. Neste ano, cada semana, cada texto, cada aliança que Deus faz com o seu povo vai convergir para ele.',
    paraHoje: [
      'Leia este ano como alguém que está aprendendo algo, não como alguém que já sabe. A Escritura ainda tem poder de ensinar, repreender e corrigir.',
      'Antes de abrir a Bíblia, lembre-se de que o que você vai ler foi "soprado por Deus". Isso muda o modo de ouvir.',
      'O objetivo não é terminar. É ser "perfeitamente instruído para toda boa obra" — uma pessoa diferente ao final.',
    ],
    perguntaDoDia: 'O que você espera que a Bíblia faça em você neste ano?',
    oracao: 'Senhor, tu falaste por tua Palavra, e ela ainda fala. Que eu a leia com ouvidos abertos para ser ensinado, corrigido e guiado. Que ao final do ano eu conheça mais a Cristo e me pareça mais com ele. Amém.',
    destaques: ['homem', 'coisas'],
    trilhas: {
      homem: {
        destaque: true,
        espelho: 'Paulo foi perseguido (v.11-12) e perseverou. Timóteo conhece a história. O homem que segue a Cristo pode esperar oposição — "todos os que querem viver piedosamente em Cristo Jesus serão perseguidos" (v.12). A Escritura não elimina o sofrimento: equipa para atravessá-lo.',
        consequencia: 'O homem que abandona a Escritura perde o único instrumento que o corrige de dentro. Sem ela, a tendência é andar em círculos — repetindo os mesmos erros, seguindo os mesmos desejos, chamando de crescimento o que é só costume.',
        graca: 'Cristo suportou tudo — tentação, sofrimento, abandono — e perseverou. A obediência dele é transferida a quem crê. O homem que lê a Escritura não a usa para ganhar mérito: usa para conhecer o Cristo cuja justiça já é sua.',
        passo: 'Marque um horário fixo para a leitura diária. Não precisa ser longo: a questão não é duração, mas regularidade. Leia com alguém da sua casa sempre que puder.',
        pergunta: 'O que costuma tirar você da Escritura — pressa, dúvida, cansaço? O que você pode fazer diferente neste ano?',
      },
      familia: {
        destaque: false,
        texto: 'Timóteo aprendeu as Escrituras "desde a infância" (v.15), da mãe e da avó (2Tm 1:5). A transmissão da fé começa em casa, antes da escola e antes da Igreja. Este devocional foi feito para ser lido em família — e começa aqui.',
        pergunta: 'Como a Palavra de Deus é passada de geração em geração na sua casa?',
      },
      mulher: {
        destaque: false,
        texto: 'Lóide e Eunice (2Tm 1:5) não são personagens secundários: são as pessoas que colocaram a Escritura na vida de Timóteo. A fidelidade delas gerou um servo de Deus. A influência da mulher que transmite a fé tem alcance que ela mesma não vê.',
        pergunta: 'De quem você recebeu a fé? Como pode devolver isso a alguém?',
      },
      coisas: {
        destaque: true,
        tema: 'tempo',
        espelho: 'Paulo está preso e vai morrer em breve. Mesmo assim, usa o pouco tempo que tem para escrever e investir em Timóteo. O uso do tempo revela o que a pessoa mais valoriza.',
        consequencia: 'Quando o tempo vai todo para o urgente, o importante fica para depois — e o "depois" muitas vezes não chega. A leitura da Bíblia perde para qualquer coisa que pareça mais imediata.',
        graca: 'Cristo, nas últimas horas antes da cruz, lavou os pés dos discípulos e partiu o pão com eles. Ele não desperdiçou o tempo. A graça liberta do medo do tempo que passa: o que é feito para Deus permanece.',
        passo: 'Reserve 15 minutos diários para esta devocional — e proteja esse tempo como protegeria um compromisso importante. Não é rigidez: é respeito por uma decisão que você tomou.',
        pergunta: 'Como o seu uso do tempo neste ano pode refletir o que você diz que mais importa?',
      },
    },
  },
  2: {
    id: 2,
    data: '2026-11-12',
    diaSemana: 'quinta',
    semana: 0,
    unidade: 'Introdução',
    secao: 'introducao',
    historia: 'redencao',
    pergunta: {
      grupo: 'discipulo',
      numero: 2,
      texto: 'Como conhecemos a Deus?',
    },
    titulo: 'Cristo abriu as Escrituras — e abriu os olhos',
    leitura: 'Lucas 24:13-35',
    versiculoChave: {
      referencia: 'Lucas 24:27',
      texto: 'E, começando por Moisés e por todos os profetas, explicou-lhes o que dele se achava em todas as Escrituras.',
    },
    paraComecar: 'Dois homens caminham para Emaús com os olhos abertos mas sem ver. Conheciam os fatos: a crucificação, o túmulo vazio, o relato das mulheres. O que faltava não era informação. Era interpretação. Era alguém que soubesse explicar por que tudo aquilo era necessário.',
    oTexto: 'Jesus se une a eles no caminho sem ser reconhecido. Ouve, pergunta, e então começa a abrir as Escrituras: de Moisés a todos os profetas, o que nelas se refere a ele (v.27). Quando chegam à mesa e ele parte o pão, os olhos se abrem — mas ele já tinha desaparecido. "Não nos ardia o coração?" (v.32). A Escritura aberta produz um calor que o coração reconhece.',
    verdadeCentral: 'Cristo é o centro das Escrituras, não apenas um dos seus personagens. Ele não aparece como surpresa no Novo Testamento: está em cada promessa, cada tipo, cada sacrifício, cada rei e profeta que aponta além de si mesmo. Ler a Bíblia é aprender a vê-lo onde ele sempre esteve.',
    cristoNoTexto: 'O próprio Jesus faz a hermenêutica: começa por Moisés e percorre toda a Escritura mostrando o que se refere a ele. Este devocional anual segue essa trilha — não como exercício intelectual, mas porque é assim que o coração arde.',
    paraHoje: [
      'Leia qualquer texto bíblico hoje perguntando: como isso aponta para Cristo? Pode ser tipo, cumprimento, contraste ou promessa.',
      'A tristeza dos dois homens não os impediu de ouvir. Leve sua tristeza ou sua dúvida ao texto, não as esconda.',
      'Eles convidaram o desconhecido a ficar. O que você precisa fazer para que a leitura deste ano seja uma prática e não só uma intenção?',
    ],
    perguntaDoDia: 'O que a Escritura lhe mostrou de Cristo que você ainda não tinha visto?',
    oracao: 'Senhor Jesus, abre as Escrituras para nós como abriste naquele caminho. Que o nosso coração arda ao ouvir tua voz nelas. Amém.',
    destaques: ['familia', 'coisas'],
    trilhas: {
      familia: {
        destaque: true,
        espelho: 'Os dois caminhavam juntos — não em silêncio, mas conversando e discutindo (v.14-15). A crise na fé costuma isolar. Mas eles estavam juntos, compartilhando o que tinham visto e o que não entendiam. A família e o grupo que se reúne para ler juntos têm nessa cena um modelo: não fingir que está tudo bem, mas caminhar junto.',
        consequencia: 'Quando cada um processa a fé sozinho, em paralelo, sem se expor ao outro, perde a oportunidade de ouvir o "não nos ardia o coração?" — essa confirmação de que Deus estava agindo, que só se percebe em conversa.',
        graca: 'Cristo veio ao encontro deles no caminho, não esperou que chegassem a algum lugar. A graça alcança no meio da crise, antes que a fé se recomponha.',
        passo: 'Esta semana, leia uma das passagens com alguém da sua casa ou do seu grupo. Não precisa ser longo: leia e pergunte "o que você viu neste texto?"',
        pergunta: 'Há alguém com quem você está "caminhando triste" e ainda não conseguiu falar sobre o que está sentindo em relação à fé?',
      },
      homem: {
        destaque: false,
        texto: 'Os dois homens tinham esperado que Jesus fosse "resgatar a Israel" com poder político (v.21). Suas expectativas eram legítimas mas menores que a realidade. O homem que segue a Cristo precisa estar disposto a ter as próprias expectativas corrigidas — inclusive sobre como o poder funciona.',
        pergunta: 'O que você esperava que seguir a Cristo fosse resolver na sua vida, e ainda não foi da forma que você pensava?',
      },
      mulher: {
        destaque: false,
        texto: 'São as mulheres que chegam primeiro ao túmulo (v.22-23) e é o relato delas que os homens não conseguem crer (Lc 24:11). Cristo, ao ressuscitar, confirma que a fidelidade delas era certa. A fé feminina naquele momento era mais corajosa que a masculina — o texto não esconde isso.',
        pergunta: 'O que você tem visto ou sentido em relação à fé que ainda não encontrou palavras para contar?',
      },
      coisas: {
        destaque: true,
        tema: 'tempo',
        espelho: 'Os dois caminhavam — uma jornada de quase 11 km. Era tempo em movimento, não tempo "para a Palavra". Cristo usou esse tempo de viagem. O tempo que você "não tem" para Deus pode ser o tempo que ele escolhe usar.',
        consequencia: 'A pressa que não deixa espaço para conversas longas é a pressa que perde as interpretações que mudam tudo. Os dois podiam ter corrido; escolheram caminhar e conversar.',
        graca: 'Cristo não exigiu um horário. Foi junto no tempo que eles tinham. A graça não espera as condições ideais: age no tempo disponível.',
        passo: 'Escolha um trajeto semanal — a pé, de carro, de ônibus — e use-o para ouvir ou ler uma passagem da Bíblia. O caminho pode ser o lugar onde o coração arde.',
        pergunta: 'Qual parte do seu dia você poderia proteger para a leitura — não adicionando tempo, mas redirecionando o que já existe?',
      },
    },
  },
  4: {
    id: 4,
    data: '2027-01-05',
    diaSemana: 'terça',
    semana: 1,
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
    verdadeCentral: 'Deus cria o ser humano para viver diante dele, com ele e para ele. Dá vida, lugar, trabalho, companhia e uma palavra a obedecer. Nessa relação, que a Confissão chama de pacto de obras (CFW 7.2), a vida estava prometida à obediência, e a morte, à desobediência. O certo e o errado não nascem de nós: vêm da palavra que Deus fala. Propósito e identidade também vêm dele.',
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
        espelho: 'Adão é colocado no jardim "para o cultivar e o guardar" (v.15) e recebe a palavra de Deus antes de a mulher ser criada (v.16-17). A tarefa do homem começa com ouvir. A cultura costuma oferecer dois modelos: o homem que se impõe pela força e o homem que se ausenta. O texto não aprova nenhum dos dois. O homem foi feito para servir, que é cultivar, e para proteger, que é guardar, sempre debaixo da palavra.',
        consequencia: 'Quando o homem não guarda a palavra, ela deixa de chegar a quem está sob o seu cuidado. No capítulo seguinte, Adão estava ao lado da mulher e ficou calado (Gn 3:6).',
        graca: 'Cristo é o homem que guardou perfeitamente o que o Pai lhe confiou: "Não perdi nenhum dos que me deste" (Jo 18:9). A força para cultivar e guardar não nasce do homem; vem de estar unido a ele (Jo 15:5).',
        passo: 'Escolha uma responsabilidade de cuidado que você vem adiando, em casa, no trabalho ou na igreja, e dê o primeiro passo hoje. Comece pela palavra: leia este texto com alguém que está sob o seu cuidado.',
        pergunta: 'O que Deus lhe deu para cultivar e guardar, e o que você tem deixado sem cuidado?',
      },
      familia: {
        destaque: true,
        espelho: 'O casamento não é uma invenção da cultura. É obra de Deus, antes da queda. Pela primeira vez Deus diz "não é bom" (v.18); então forma a mulher e a traz ao homem (v.22). O v.24 tem três verbos: deixar, unir-se e tornar-se uma só carne.',
        consequencia: 'Quando o casamento vira contrato de conveniência, ou quando os pais continuam ocupando o lugar do cônjuge, a união se enfraquece. Deixar vem antes de unir-se.',
        graca: 'Jesus cita este texto para defender a permanência do casamento (Mt 19:4-6), e Paulo mostra que ele aponta para Cristo e a Igreja (Ef 5:31-32). O amor de Cristo pela Igreja é o modelo e a fonte do amor no lar (Ef 5:25).',
        passo: 'Casados: separem dez minutos hoje para conversar sem telas e agradecer a Deus pela união. Solteiros e filhos: digam uma palavra de ânimo a um casal da família ou da igreja.',
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
