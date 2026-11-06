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
    data: '',
    diaSemana: '',
    semana: 0,
    unidade: 'Introdução',
    secao: 'introducao',
    historia: 'redencao',
    pergunta: {
      grupo: 'discipulo',
      numero: 1,
      texto: 'Como crescemos na fé?',
    },
    titulo: 'A Escritura é a palavra de Deus — e fala de Cristo',
    leitura: '2 Timóteo 3:10-17 · Lucas 24:13-35',
    versiculoChave: {
      referencia: '2 Timóteo 3:16-17',
      texto: 'Toda a Escritura é inspirada por Deus e útil para o ensino, para a repreensão, para a correção, para a instrução na justiça, para que o homem de Deus seja perfeito e perfeitamente instruído para toda boa obra.',
    },
    paraComecar: 'Dois textos abrem este devocional. Paulo escreve de uma prisão em Roma sabendo que vai morrer. Dois discípulos caminham para Emaús sem reconhecer que o ressurreto está ao lado deles. Os dois textos juntos respondem à mesma pergunta: por que ler a Bíblia durante um ano inteiro?',
    oTexto: 'Em 2 Timóteo 3, Paulo lembra que Timóteo aprendeu as Escrituras desde criança — e elas têm poder para torná-lo sábio "para a salvação, mediante a fé em Cristo Jesus" (v.15). Os versículos 16-17 não são uma afirmação isolada: são a conclusão de um argumento. Continue no que aprendeu, porque a fonte é Deus mesmo. Em Lucas 24, Jesus se une aos dois no caminho e começa a abrir as Escrituras: de Moisés a todos os profetas, o que nelas se refere a ele (v.27). Quando chegam à mesa e ele parte o pão, os olhos se abrem. "Não nos ardia o coração?" (v.32). A Escritura aberta produz um calor que o coração reconhece.',
    verdadeCentral: 'A Escritura é palavra de Deus — toda ela, não em parte. E por isso é útil: ensina o que é verdadeiro, repreende o que é errado, corrige quem caiu, instrui quem quer crescer. Cristo não aparece como surpresa no Novo Testamento: está em cada promessa, cada tipo, cada rei e profeta que aponta além de si mesmo. Ler a Bíblia é aprender a vê-lo onde ele sempre esteve.',
    cristoNoTexto: 'Cristo é o centro das Escrituras, não apenas um dos seus personagens. Paulo diz que elas tornam sábio "para a salvação mediante a fé em Cristo Jesus" (2Tm 3:15). Jesus confirma isso ao percorrer toda a Escritura e mostrar o que se refere a ele (Lc 24:27). Os dois textos apontam na mesma direção: a Bíblia foi dada para que você conheça a Cristo.',
    paraHoje: [
      'Leia este ano como alguém que está aprendendo algo, não como alguém que já sabe. A Escritura ainda tem poder de ensinar, repreender e corrigir.',
      'Leia qualquer texto perguntando: como isso aponta para Cristo? Pode ser tipo, cumprimento, contraste ou promessa.',
      'Eles convidaram o desconhecido a ficar. O que você precisa fazer para que a leitura deste ano seja uma prática e não só uma intenção?',
    ],
    perguntaDoDia: 'O que você espera que a Bíblia faça em você neste ano?',
    oracao: 'Senhor, tu falaste por tua Palavra, e ela fala de Cristo. Abre as Escrituras para nós como abriste no caminho de Emaús. Que o nosso coração arda ao ouvir tua voz nelas. Amém.',
    destaques: ['familia', 'coisas'],
    trilhas: {
      familia: {
        destaque: true,
        espelho: 'Os dois caminhavam juntos — não em silêncio, mas conversando e discutindo (Lc 24:14-15). Timóteo aprendeu as Escrituras da mãe e da avó (2Tm 1:5). Os dois textos mostram a mesma coisa: a fé se transmite em conversa, em presença, em caminho compartilhado. A família e o grupo que se reúne para ler juntos têm aqui o modelo.',
        consequencia: 'Quando cada um processa a fé sozinho, perde a oportunidade de ouvir o "não nos ardia o coração?" — essa confirmação de que Deus estava agindo, que só se percebe em conversa.',
        graca: 'Cristo veio ao encontro deles no caminho, não esperou que chegassem com as respostas prontas. A graça alcança no meio da crise, antes que a fé se recomponha.',
        passo: 'Esta semana, leia uma das passagens com alguém da sua casa ou do seu grupo. Não precisa ser longo: leia e pergunte "o que você viu neste texto?"',
        pergunta: 'Como a Palavra de Deus é passada de geração em geração na sua casa?',
      },
      homem: {
        destaque: false,
        texto: 'Os dois homens tinham esperado que Jesus fosse "resgatar a Israel" com poder político (Lc 24:21). Paulo sofreu e perseverou — e a Escritura guiou tudo isso. O homem que segue a Cristo precisa estar disposto a ter as próprias expectativas corrigidas e a perseverar quando a realidade decepciona.',
        pergunta: 'O que você esperava que seguir a Cristo fosse resolver na sua vida, e ainda não foi da forma que você pensava?',
      },
      mulher: {
        destaque: false,
        texto: 'São as mulheres que chegam primeiro ao túmulo (Lc 24:22-23). Lóide e Eunice colocaram a Escritura na vida de Timóteo (2Tm 1:5). Em ambos os textos, a fidelidade feminina aparece antes da masculina. A mulher que transmite a fé e que busca o ressurreto tem alcance que ela mesma não mede.',
        pergunta: 'De quem você recebeu a fé? Como pode devolver isso a alguém?',
      },
      coisas: {
        destaque: true,
        tema: 'tempo',
        espelho: 'Paulo usa seu tempo de prisão para escrever e investir em Timóteo. Os dois caminhavam — quase 11 km. Cristo usou o tempo deles de viagem. O tempo que você "não tem" para Deus pode ser o tempo que ele escolhe usar.',
        consequencia: 'A pressa que não deixa espaço para conversas longas é a pressa que perde as interpretações que mudam tudo.',
        graca: 'Cristo não exigiu um horário nem condições ideais. Foi junto no tempo que eles tinham.',
        passo: 'Reserve 15 minutos diários para esta devocional. E escolha um trajeto semanal — a pé, de carro, de ônibus — para ouvir ou ler uma passagem da Bíblia.',
        pergunta: 'Como o seu uso do tempo neste ano pode refletir o que você diz que mais importa?',
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
