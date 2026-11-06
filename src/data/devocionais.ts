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
