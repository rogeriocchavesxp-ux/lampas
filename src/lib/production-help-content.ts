import type { HelpEntry } from './help-content'

type ProductionCategory = 'planejamento' | 'estrutura' | 'redacao' | 'apoio' | 'publicacao'

interface ProductionSeed {
  id: string
  titulo: string
  categoria: ProductionCategory
  foco: string
  exemplo: string
}

function categoryForModule(module: string): ProductionCategory {
  if (module === 'inventio') return 'planejamento'
  if (module === 'dispositio') return 'estrutura'
  if (module === 'elocutio') return 'redacao'
  if (module === 'memoria') return 'apoio'
  return 'publicacao'
}

function stepsFor(seed: ProductionSeed): string[] {
  if (seed.categoria === 'planejamento') {
    return [
      `Defina com precisão ${seed.foco} antes de avançar para qualquer outra etapa.`,
      'Escreva em uma frase direta, sem ambiguidade, algo que você consiga checar depois se foi cumprido.',
      'Confira se essa decisão é compatível com o tempo, o público e os recursos reais disponíveis.',
      'Use essa definição como critério para aceitar ou descartar conteúdo nas próximas etapas.',
    ]
  }
  if (seed.categoria === 'estrutura') {
    return [
      `Organize ${seed.foco} em uma sequência lógica, com começo, meio e fim claros.`,
      'Verifique se cada parte avança a partir da anterior, sem saltos nem repetição desnecessária.',
      'Teste a estrutura perguntando se alguém de fora entenderia o caminho só pelos títulos.',
      'Ajuste a ordem até que ela sirva ao objetivo definido na etapa de planejamento.',
    ]
  }
  if (seed.categoria === 'redacao') {
    return [
      `Escreva ${seed.foco} em linguagem clara, concreta e adequada ao público definido.`,
      'Releia em voz alta e corte qualquer frase que exija um segundo esforço para ser entendida.',
      'Garanta que o conteúdo está fiel ao texto bíblico e ao propósito já definidos nas etapas anteriores.',
      'Marque o que ainda precisa de exemplo, dado ou ilustração antes da versão final.',
    ]
  }
  if (seed.categoria === 'apoio') {
    return [
      `Prepare ${seed.foco} como suporte prático para quem vai usar ou receber o material.`,
      'Mantenha o material simples o suficiente para ser usado sem explicação adicional.',
      'Confira se o material é consistente com o conteúdo principal já produzido.',
      'Teste o material com uma pessoa real antes de considerá-lo pronto.',
    ]
  }
  return [
    `Revise ${seed.foco} com olhar de quem vai publicar ou apresentar o material a outras pessoas.`,
    'Confira clareza, correção e fidelidade bíblica antes de considerar concluído.',
    'Garanta que o formato final está pronto para o canal onde será publicado ou entregue.',
    'Peça uma segunda leitura de alguém de confiança antes da publicação definitiva.',
  ]
}

function questionsFor(seed: ProductionSeed): string[] {
  return [
    `O que precisa estar resolvido em "${seed.titulo}" para que as próximas etapas não fiquem travadas?`,
    'Isso está claro o suficiente para alguém que não acompanhou todo o processo de produção?',
    'Esse conteúdo está fiel ao texto bíblico e ao propósito pastoral do material?',
    'O que falta para que esta parte esteja realmente pronta, e não apenas esboçada?',
  ]
}

function errorsFor(seed: ProductionSeed): string[] {
  const byCategory: Record<ProductionCategory, string[]> = {
    planejamento: [
      'Avançar para a produção sem ter definido isso com clareza, "decidindo no caminho".',
      'Copiar uma definição genérica em vez de pensar no público e na ocasião reais.',
      'Confundir uma boa intenção com um objetivo verificável.',
    ],
    estrutura: [
      'Empilhar conteúdo sem pensar em progressão ou em transição entre as partes.',
      'Criar uma estrutura elaborada que não serve ao objetivo definido na etapa anterior.',
      'Deixar partes desconectadas, que poderiam ser lidas em qualquer ordem sem perda.',
    ],
    redacao: [
      'Escrever de forma abstrata ou acadêmica demais para o público definido.',
      'Perder a conexão com o texto bíblico ao se concentrar só na forma.',
      'Deixar a redação inacabada, sem revisão de clareza antes de seguir adiante.',
    ],
    apoio: [
      'Produzir material de apoio desconectado do conteúdo principal.',
      'Tornar o material mais complexo do que o necessário para cumprir sua função.',
      'Esquecer de revisar o material de apoio com o mesmo cuidado dado ao conteúdo principal.',
    ],
    publicacao: [
      'Publicar sem uma revisão final de clareza, coerência e fidelidade bíblica.',
      'Ignorar o formato exigido pelo canal de publicação ou apresentação.',
      'Pular a revisão por outra pessoa por pressa de finalizar.',
    ],
  }
  return byCategory[seed.categoria]
}

function tipsFor(seed: ProductionSeed): string[] {
  return [
    `Releia "${seed.titulo}" depois de concluir as etapas seguintes, para checar se ainda faz sentido com o resultado final.`,
    'Compare com um material semelhante de outro autor para calibrar nível de profundidade e extensão.',
    'Guarde uma versão anterior antes de revisar, para não perder decisões já tomadas com cuidado.',
  ]
}

function createProductionHelpEntry(seed: ProductionSeed): HelpEntry {
  return {
    id: seed.id,
    titulo: seed.titulo,
    descricao: `${seed.titulo} é o campo em que você define ${seed.foco}. Ele existe para que essa decisão fique registrada com clareza antes de seguir para as próximas etapas da produção.`,
    objetivo: `O objetivo é transformar ${seed.foco} em algo concreto, verificável e útil para concluir o material com qualidade.`,
    comoFazer: stepsFor(seed),
    perguntas: questionsFor(seed),
    erros: errorsFor(seed),
    exemplo: seed.exemplo,
    ajudaIA: `A IA pode sugerir uma primeira versão para "${seed.titulo.toLowerCase()}", organizar ideias dispersas ou comparar com exemplos semelhantes. Revise sempre a sugestão quanto à fidelidade bíblica, ao público-alvo e ao tom do material.`,
    dicasAvancadas: tipsFor(seed),
  }
}

const PRODUCTION_SEEDS: ProductionSeed[] = [
  // ── AULA ──────────────────────────────────────────────────────────────
  { id: 'objetivo_aula', titulo: 'Objetivo da aula', categoria: 'planejamento', foco: 'o resultado de aprendizagem que a aula deve alcançar ao final do encontro', exemplo: 'Em uma aula sobre Êxodo 20, o objetivo pode ser: "Ao final, o aluno deve saber explicar por que os Dez Mandamentos começam com graça (libertação) antes de exigir obediência."' },
  { id: 'publico_alvo', titulo: 'Público-alvo', categoria: 'planejamento', foco: 'quem vai receber o material — faixa etária, maturidade espiritual, conhecimento prévio e contexto da turma', exemplo: 'Jovens de 15 a 18 anos, a maioria já batizada, com pouco vocabulário teológico técnico e familiaridade básica com as histórias do Antigo Testamento.' },
  { id: 'tempo_disponivel', titulo: 'Tempo disponível', categoria: 'planejamento', foco: 'a duração real do encontro, incluindo abertura, ensino e tempo para perguntas', exemplo: '45 minutos: 5 de abertura, 25 de ensino, 10 de discussão em grupo e 5 de encerramento.' },
  { id: 'conhecimento_previo', titulo: 'Conhecimento prévio dos alunos', categoria: 'planejamento', foco: 'o que a turma já sabe sobre o assunto, para não repetir nem pressupor demais', exemplo: 'A turma já estudou o Êxodo da escravidão no Egito, mas nunca discutiu a estrutura da aliança no Sinai.' },
  { id: 'texto_tema_base', titulo: 'Texto ou tema base', categoria: 'planejamento', foco: 'a passagem bíblica ou o tema teológico que vai sustentar todo o conteúdo da aula', exemplo: 'Êxodo 20.1-17, com foco no prólogo histórico ("Eu sou o Senhor, que te tirei da terra do Egito") como chave de leitura dos mandamentos.' },
  { id: 'conteudo_central', titulo: 'Conteúdo central', categoria: 'planejamento', foco: 'a ideia teológica principal que a aula precisa comunicar, resumida em poucas frases', exemplo: 'A lei de Deus não é condição para a graça, mas resposta a uma graça já recebida — por isso a aliança no Sinai começa com libertação, não com exigência.' },
  { id: 'conceitos_principais', titulo: 'Conceitos principais', categoria: 'planejamento', foco: 'os termos ou ideias teológicas que os alunos precisam compreender para acompanhar a aula', exemplo: 'Aliança, graça anterior à lei, soberania de Deus como fundamento da obediência.' },
  { id: 'pontos_dificuldade', titulo: 'Pontos de dificuldade', categoria: 'planejamento', foco: 'onde os alunos normalmente travam ou interpretam mal o assunto', exemplo: 'Alunos tendem a ler os Dez Mandamentos como lista de regras desconectada da identidade de povo libertado — é preciso corrigir essa leitura moralista.' },
  { id: 'termos_importantes', titulo: 'Termos importantes', categoria: 'planejamento', foco: 'palavras-chave do texto ou do tema que merecem explicação cuidadosa em sala', exemplo: '"Aliança" (compromisso entre Deus e seu povo) e "mandamento" (orientação de vida, não imposição arbitrária).' },
  { id: 'relacao_escritura', titulo: 'Relação com a Escritura', categoria: 'planejamento', foco: 'como o conteúdo da aula se conecta com o restante da Bíblia, evitando ensino isolado do texto', exemplo: 'Os Dez Mandamentos antecipam o chamado à santidade que Jesus aprofunda no Sermão do Monte (Mateus 5-7).' },
  { id: 'introducao_didatica', titulo: 'Introdução didática', categoria: 'estrutura', foco: 'a abertura que desperta interesse e conecta os alunos ao tema antes da explicação principal', exemplo: 'Perguntar à turma: "Vocês seguiriam uma regra só porque alguém ordenou, ou porque essa pessoa já provou que se importa com vocês?" — e então introduzir o contexto da libertação do Egito.' },
  { id: 'desenvolvimento_aula', titulo: 'Desenvolvimento da aula', categoria: 'estrutura', foco: 'a sequência de passos pelos quais o conteúdo será apresentado do início ao fim', exemplo: '1) Contexto da libertação; 2) leitura do prólogo da aliança; 3) explicação dos mandamentos em blocos (Deus, próximo); 4) síntese teológica.' },
  { id: 'explicacoes_principais', titulo: 'Explicações principais', categoria: 'estrutura', foco: 'os pontos de ensino que precisam ser explicados com mais cuidado para evitar mal-entendidos', exemplo: 'Explicar por que "não terás outros deuses" vem antes de qualquer mandamento sobre comportamento social — a prioridade é a relação com Deus.' },
  { id: 'perguntas_interacao', titulo: 'Perguntas para interação', categoria: 'estrutura', foco: 'perguntas que envolvem a turma e verificam compreensão durante a aula', exemplo: '"Qual mandamento vocês acham mais difícil de obedecer hoje, e por quê?"' },
  { id: 'dinamicas_atividades', titulo: 'Dinâmicas ou atividades', categoria: 'estrutura', foco: 'exercícios práticos que ajudam a fixar o conteúdo de forma ativa, não apenas expositiva', exemplo: 'Dividir a turma em duplas para reescrever um dos mandamentos em linguagem própria, conectando-o à graça recebida em Cristo.' },
  { id: 'aplicacoes_pedagogicas', titulo: 'Aplicações pedagógicas', categoria: 'estrutura', foco: 'como a verdade ensinada deve mudar a forma como o aluno pensa, sente ou age', exemplo: 'Os alunos devem sair entendendo que obedecer a Deus é resposta de gratidão, não tentativa de merecer o que já foi dado de graça.' },
  { id: 'roteiro_professor', titulo: 'Roteiro do professor', categoria: 'apoio', foco: 'o guia passo a passo que orienta quem vai ministrar a aula, incluindo tempo e transições', exemplo: 'Roteiro de uma página com horário ao lado de cada bloco: 0-5min abertura, 5-30min ensino, 30-40min dinâmica, 40-45min encerramento.' },
  { id: 'material_aluno', titulo: 'Material do aluno', categoria: 'apoio', foco: 'o material entregue ou disponibilizado para o aluno acompanhar e registrar a aula', exemplo: 'Uma folha com o texto de Êxodo 20 impresso, espaço para anotações e as perguntas de interação já escritas.' },
  { id: 'slides_handout', titulo: 'Slides ou handout', categoria: 'apoio', foco: 'o apoio visual usado durante a apresentação da aula', exemplo: 'Slides com o texto bíblico em destaque, uma linha do tempo simples do Êxodo e os termos-chave definidos em linguagem simples.' },
  { id: 'tarefa_complementar', titulo: 'Tarefa ou atividade complementar', categoria: 'apoio', foco: 'uma atividade para depois da aula que reforça ou aprofunda o conteúdo estudado', exemplo: 'Pedir que cada aluno escreva, durante a semana, uma situação em que obedeceu por gratidão e não por medo.' },

  // ── ARTIGO ────────────────────────────────────────────────────────────
  { id: 'tema', titulo: 'Tema', categoria: 'planejamento', foco: 'o assunto central que o artigo vai tratar, delimitado o suficiente para ser coberto com profundidade', exemplo: 'Por que a oração de lamento (Salmos) é necessária na vida cristã contemporânea.' },
  { id: 'problema', titulo: 'Problema', categoria: 'planejamento', foco: 'a pergunta, tensão ou erro que motiva a escrita do artigo', exemplo: 'Cristãos evangélicos tendem a evitar o lamento, tratando tristeza diante de Deus como falta de fé.' },
  { id: 'tese', titulo: 'Tese', categoria: 'planejamento', foco: 'a afirmação central que o artigo defenderá do início ao fim', exemplo: 'O lamento bíblico não é falta de fé, mas a forma mais honesta de fé em meio ao sofrimento real.' },
  { id: 'objetivo_artigo', titulo: 'Objetivo do artigo', categoria: 'planejamento', foco: 'o que o leitor deve compreender, sentir ou fazer depois de ler o artigo', exemplo: 'O leitor deve sentir-se liberado para lamentar diante de Deus e saber localizar pelo menos três salmos de lamento para orar.' },
  { id: 'fontes_biblicas', titulo: 'Fontes bíblicas', categoria: 'planejamento', foco: 'os textos bíblicos que sustentam diretamente a tese do artigo', exemplo: 'Salmos 13, 22 e 88, além de Lamentações 3 como exemplo de lamento sustentado.' },
  { id: 'fontes_teologicas', titulo: 'Fontes teológicas', categoria: 'planejamento', foco: 'autores, comentários ou obras teológicas que aprofundam ou confirmam a tese', exemplo: 'Comentário de Derek Kidner sobre Salmos e o livro "Dark Clouds, Deep Mercy" de Mark Vroegop.' },
  { id: 'fontes_historicas', titulo: 'Fontes históricas', categoria: 'planejamento', foco: 'dados de contexto histórico que ajudam a sustentar ou ilustrar o argumento', exemplo: 'A prática de lamento público em Israel, incluindo jejum e vestes de luto, como pano de fundo dos salmos de lamento.' },
  { id: 'citacoes_importantes', titulo: 'Citações importantes', categoria: 'planejamento', foco: 'frases de autores ou do próprio texto bíblico que reforçam pontos-chave do artigo', exemplo: '"Até quando, Senhor?" (Salmo 13.1) como citação de abertura que nomeia a tensão do artigo.' },
  { id: 'objecoes_relevantes', titulo: 'Objeções relevantes', categoria: 'planejamento', foco: 'os principais contra-argumentos ou dúvidas que um leitor cético levantaria contra a tese', exemplo: '"Lamentar não seria falta de confiança em Deus?" — objeção que o artigo precisa responder diretamente.' },
  { id: 'introducao', titulo: 'Introdução', categoria: 'estrutura', foco: 'o parágrafo de abertura que apresenta o problema e conduz à tese', exemplo: 'Abrir com a pergunta "O que fazer quando orar parece mentira?" antes de apresentar o lamento bíblico como resposta.' },
  { id: 'desenvolvimento_tese', titulo: 'Desenvolvimento da tese', categoria: 'estrutura', foco: 'como a tese será desdobrada em partes lógicas ao longo do artigo', exemplo: '1) o problema do silêncio sobre o lamento; 2) o lamento na Bíblia; 3) o lamento como fé, não dúvida; 4) implicações práticas.' },
  { id: 'argumento_1', titulo: 'Argumento 1', categoria: 'estrutura', foco: 'a primeira razão ou evidência que sustenta a tese do artigo', exemplo: 'Um terço dos Salmos são lamentos — isso mostra que Deus autorizou e até ensinou seu povo a lamentar.' },
  { id: 'argumento_2', titulo: 'Argumento 2', categoria: 'estrutura', foco: 'a segunda razão ou evidência que aprofunda ou amplia o primeiro argumento', exemplo: 'Os salmos de lamento terminam, quase sempre, em confiança renovada — lamento e fé não se opõem.' },
  { id: 'argumento_3', titulo: 'Argumento 3', categoria: 'estrutura', foco: 'uma terceira razão, usada apenas se for realmente necessária para sustentar a tese', exemplo: 'O próprio Jesus lamenta no Getsêmani e na cruz, validando o lamento como expressão legítima de fé.' },
  { id: 'contra_argumentos', titulo: 'Contra-argumentos', categoria: 'estrutura', foco: 'a apresentação honesta das objeções antes de respondê-las', exemplo: 'Alguns dirão que lamento é falta de gratidão — essa visão ignora que gratidão e lamento convivem nos próprios salmos.' },
  { id: 'resposta_contra_argumentos', titulo: 'Resposta aos contra-argumentos', categoria: 'estrutura', foco: 'a resposta direta e bíblica às objeções apresentadas', exemplo: 'Gratidão e lamento não competem: o salmista lamenta exatamente porque confia que Deus ouve e responde.' },
  { id: 'titulo', titulo: 'Título', categoria: 'redacao', foco: 'o nome final do material, que precisa ser claro e despertar interesse real no leitor', exemplo: '"Por que está tudo bem lamentar diante de Deus".' },
  { id: 'subtitulo', titulo: 'Subtítulo', categoria: 'redacao', foco: 'a linha de apoio que complementa o título e situa melhor o leitor sobre o conteúdo', exemplo: 'Como os Salmos ensinam que a dor também pode ser oração.' },
  { id: 'introducao_final', titulo: 'Introdução final', categoria: 'redacao', foco: 'a versão revisada e definitiva do parágrafo de abertura, já ajustada ao tom do artigo', exemplo: 'Versão polida da introdução, com a pergunta de abertura reformulada para maior impacto editorial.' },
  { id: 'corpo_artigo', titulo: 'Corpo do artigo', categoria: 'redacao', foco: 'o texto completo e revisado dos argumentos, já em linguagem final de publicação', exemplo: 'Texto corrido unindo os três argumentos com transições claras e exemplos bíblicos detalhados.' },
  { id: 'conclusao', titulo: 'Conclusão', categoria: 'redacao', foco: 'o fechamento que retoma a tese e aponta um caminho prático para o leitor', exemplo: 'Concluir convidando o leitor a orar um salmo de lamento esta semana, em vez de evitar a dor diante de Deus.' },
  { id: 'chamada_final', titulo: 'Chamada final', categoria: 'redacao', foco: 'o convite direto de ação que encerra o artigo', exemplo: '"Escolha um dos salmos citados e ore-o em voz alta hoje, exatamente como está escrito."' },
  { id: 'clareza', titulo: 'Clareza', categoria: 'publicacao', foco: 'a revisão de frases confusas, longas ou ambíguas que dificultam a leitura', exemplo: 'Trocar "a soteriologia implícita no lamento davídico" por "o que o lamento de Davi ensina sobre ser salvo por graça".' },
  { id: 'coerencia', titulo: 'Coerência', categoria: 'publicacao', foco: 'a checagem de que todas as partes do artigo realmente sustentam a mesma tese', exemplo: 'Confirmar que o argumento 2 não contradiz o argumento 1 ao tratar da relação entre lamento e confiança.' },
  { id: 'fidelidade_biblica', titulo: 'Fidelidade bíblica', categoria: 'publicacao', foco: 'a confirmação de que nenhuma citação ou argumento distorce o sentido do texto bíblico usado', exemplo: 'Confirmar que Salmo 13 não está sendo lido como manual de autoajuda, mas como oração dirigida a Deus.' },
  { id: 'forca_argumentativa', titulo: 'Força argumentativa', categoria: 'publicacao', foco: 'a avaliação de se os argumentos realmente convencem ou se ainda precisam de mais evidência', exemplo: 'Perguntar: o argumento sobre Jesus no Getsêmani está desenvolvido o suficiente ou parece apenas citado de passagem?' },
  { id: 'tom', titulo: 'Tom pastoral ou acadêmico', categoria: 'publicacao', foco: 'o ajuste do nível de linguagem e postura do texto ao público e ao veículo de publicação', exemplo: 'Para um blog de igreja, suavizar termos técnicos como "teodiceia" e manter tom pastoral acolhedor.' },
  // ── E-BOOK ────────────────────────────────────────────────────────────
  { id: 'promessa_central', titulo: 'Promessa central', categoria: 'planejamento', foco: 'o benefício concreto que o leitor recebe ao terminar de ler o e-book', exemplo: 'Ao final, o leitor terá um plano simples de 7 dias para orar os Salmos em momentos de ansiedade.' },
  { id: 'objetivo_material', titulo: 'Objetivo do material', categoria: 'planejamento', foco: 'o que o material pretende ensinar ou mudar na vida do leitor', exemplo: 'Ajudar cristãos ansiosos a substituir a preocupação por oração bíblica concreta, usando os Salmos como guia.' },
  { id: 'problema_resolvido', titulo: 'Problema que o e-book resolve', categoria: 'planejamento', foco: 'a dificuldade real e específica que motiva alguém a baixar e ler este material', exemplo: 'Cristãos sabem que deveriam orar em vez de se preocupar, mas não sabem como fazer isso na prática.' },
  { id: 'sumario', titulo: 'Sumário', categoria: 'estrutura', foco: 'a lista ordenada dos capítulos, mostrando a progressão lógica do material', exemplo: '1. Por que nos preocupamos; 2. O que os Salmos ensinam sobre ansiedade; 3. Um plano de oração de 7 dias; 4. Perguntas frequentes.' },
  { id: 'capitulos', titulo: 'Capítulos', categoria: 'estrutura', foco: 'a divisão do conteúdo em unidades menores, cada uma com um propósito claro', exemplo: 'Capítulo 2 trata exclusivamente do Salmo 23 como antídoto bíblico à ansiedade, sem misturar outros temas.' },
  { id: 'progressao_logica', titulo: 'Progressão lógica', categoria: 'estrutura', foco: 'a forma como um capítulo prepara o próximo, sem repetição nem saltos', exemplo: 'Do diagnóstico do problema (capítulo 1) para a base bíblica (capítulo 2) e só então para o plano prático (capítulo 3).' },
  { id: 'capitulo_1', titulo: 'Capítulo 1', categoria: 'redacao', foco: 'o texto completo e revisado do primeiro capítulo, já em linguagem final', exemplo: 'Capítulo 1 redigido com uma história real (sem identificar a pessoa) de alguém que viveu ansiedade extrema antes de aprender a orar os Salmos.' },
  { id: 'capitulo_2', titulo: 'Capítulo 2', categoria: 'redacao', foco: 'o texto completo e revisado do segundo capítulo, já em linguagem final', exemplo: 'Capítulo 2 redigido explicando o Salmo 23 versículo a versículo, sempre voltando à pergunta "o que isso diz sobre minha ansiedade hoje?".' },
  { id: 'capitulo_3', titulo: 'Capítulo 3', categoria: 'redacao', foco: 'o texto completo e revisado do terceiro capítulo, já em linguagem final', exemplo: 'Capítulo 3 redigido como guia prático dia a dia, com uma oração breve baseada em Salmos para cada um dos 7 dias.' },
  { id: 'capitulos_adicionais', titulo: 'Capítulos adicionais', categoria: 'redacao', foco: 'qualquer capítulo extra necessário para completar o argumento do material', exemplo: 'Um capítulo extra de perguntas frequentes, respondendo dúvidas como "e se eu não sentir alívio imediato?".' },
  { id: 'chamadas_praticas', titulo: 'Chamadas práticas', categoria: 'redacao', foco: 'os convites de ação que aparecem ao final de cada capítulo, levando o leitor a agir', exemplo: '"Antes de seguir para o próximo capítulo, escreva uma preocupação atual e reescreva-a como um pedido de oração."' },
  { id: 'citacoes', titulo: 'Citações', categoria: 'apoio', foco: 'frases de autores ou do texto bíblico usadas para reforçar ou ilustrar pontos do material', exemplo: '"A ansiedade olha em volta, a preocupação olha para baixo, a fé olha para cima." — citação usada para abrir o capítulo 2.' },
  { id: 'quadros_explicativos', titulo: 'Quadros explicativos', categoria: 'apoio', foco: 'caixas de texto que resumem ou destacam um conceito importante fora do fluxo principal', exemplo: 'Um quadro lateral explicando rapidamente o que é um "salmo de confiança", para quem nunca ouviu esse termo.' },
  { id: 'perguntas_reflexao', titulo: 'Perguntas de reflexão', categoria: 'apoio', foco: 'perguntas ao final de cada capítulo que ajudam o leitor a aplicar o conteúdo à própria vida', exemplo: '"Qual preocupação desta semana você ainda não transformou em oração?"' },
  { id: 'exercicios', titulo: 'Exercícios', categoria: 'apoio', foco: 'atividades práticas que o leitor realiza para fixar ou aplicar o conteúdo do capítulo', exemplo: 'Um exercício de escrever, em uma linha, a versão "ansiedade" e a versão "oração" da mesma preocupação.' },
  { id: 'recursos_extras', titulo: 'Recursos extras', categoria: 'apoio', foco: 'materiais complementares que enriquecem o e-book sem fazer parte do texto principal', exemplo: 'Uma lista de 10 salmos recomendados para momentos específicos de ansiedade, anexada ao final do material.' },
  { id: 'texto_apresentacao', titulo: 'Texto de apresentação', categoria: 'publicacao', foco: 'o texto curto que apresenta o material ao leitor antes mesmo de ele abrir o primeiro capítulo', exemplo: '"Um guia bíblico simples para quem está cansado de se preocupar e quer aprender a orar de verdade."' },
  { id: 'descricao_comercial', titulo: 'Descrição comercial', categoria: 'publicacao', foco: 'o texto usado para divulgar e vender ou promover o material em uma página ou loja', exemplo: 'Descrição de 3 parágrafos destacando o problema, a promessa e o que está incluído no e-book.' },
  { id: 'capa', titulo: 'Capa', categoria: 'publicacao', foco: 'a definição visual da capa — título, imagem e identidade visual do material', exemplo: 'Capa simples com o título em destaque, uma imagem de céu aberto e a referência discreta a "baseado nos Salmos".' },
  { id: 'formato_exportacao', titulo: 'Formato de exportação', categoria: 'publicacao', foco: 'o formato de arquivo final em que o material será entregue ou publicado', exemplo: 'PDF formatado para leitura em celular, com fontes legíveis e sem quebras de página no meio de uma ideia.' },
  { id: 'versao_final', titulo: 'Versão final', categoria: 'publicacao', foco: 'a confirmação de que todas as etapas anteriores foram revisadas e o material está pronto para publicação', exemplo: 'Checklist concluído: texto revisado, capa pronta, PDF exportado e testado em três dispositivos diferentes.' },

  // ── LIVRO ─────────────────────────────────────────────────────────────
  { id: 'tema_central', titulo: 'Tema central', categoria: 'planejamento', foco: 'o assunto único que organiza todo o livro, do início ao fim', exemplo: 'A suficiência de Cristo para a vida cristã, em contraste com soluções terapêuticas seculares.' },
  { id: 'problema_principal', titulo: 'Problema principal', categoria: 'planejamento', foco: 'a questão real e urgente que justifica a existência do livro', exemplo: 'Cristãos buscam autoajuda secular para problemas que a Bíblia já trata com profundidade maior.' },
  { id: 'tese_livro', titulo: 'Tese do livro', categoria: 'planejamento', foco: 'a afirmação central que o livro inteiro vai defender e desenvolver', exemplo: 'Cristo é suficiente não apenas para a salvação, mas para a vida prática diária — incluindo ansiedade, relacionamentos e identidade.' },
  { id: 'publico_alvo', titulo: 'Público-alvo', categoria: 'planejamento', foco: 'quem vai ler o livro — maturidade, contexto e necessidade real desse leitor', exemplo: 'Cristãos adultos, já convertidos, que sentem a vida cristã insuficiente diante de problemas práticos do dia a dia.' },
  { id: 'justificativa_obra', titulo: 'Justificativa da obra', categoria: 'planejamento', foco: 'por que este livro precisa existir, e o que ele oferece que outros materiais não oferecem', exemplo: 'Diferente de livros de autoajuda cristã, este livro recusa soluções rápidas e ancora tudo na suficiência bíblica de Cristo.' },
  { id: 'contribuicao_especifica', titulo: 'Contribuição específica', categoria: 'planejamento', foco: 'o ângulo único que este livro traz para um assunto que talvez já tenha sido tratado por outros', exemplo: 'Tratar ansiedade não como problema clínico isolado, mas como questão de adoração e confiança em Deus.' },
  { id: 'sumario_macro', titulo: 'Sumário macro', categoria: 'estrutura', foco: 'a divisão do livro em grandes partes, antes de detalhar os capítulos', exemplo: 'Parte 1: O problema da insuficiência percebida. Parte 2: A suficiência de Cristo na Escritura. Parte 3: Suficiência de Cristo na prática.' },
  { id: 'partes_livro', titulo: 'Partes do livro', categoria: 'estrutura', foco: 'o conteúdo e o papel de cada grande parte dentro da progressão geral do livro', exemplo: 'A Parte 2 existe para estabelecer o fundamento bíblico antes que a Parte 3 trate de aplicações práticas.' },
  { id: 'progressao_argumentativa', titulo: 'Progressão argumentativa', categoria: 'estrutura', foco: 'como o argumento do livro avança de capítulo em capítulo sem se repetir', exemplo: 'Do diagnóstico (Parte 1) para o fundamento bíblico (Parte 2) e só então para a aplicação (Parte 3) — nunca pular essa ordem.' },
  { id: 'conclusao_geral', titulo: 'Conclusão geral', categoria: 'estrutura', foco: 'o fechamento que une as partes do livro em uma só mensagem final', exemplo: 'Encerrar mostrando que toda a jornada do livro aponta para uma vida marcada por confiança, não por ansiedade gerenciada.' },
  { id: 'introducao_geral', titulo: 'Introdução geral', categoria: 'redacao', foco: 'o texto completo e revisado que abre o livro e situa o leitor no problema e na tese', exemplo: 'Introdução com uma cena cotidiana de ansiedade antes de apresentar a suficiência de Cristo como resposta do livro.' },
  { id: 'parte_1', titulo: 'Parte 1', categoria: 'redacao', foco: 'o texto completo e revisado da primeira grande parte do livro', exemplo: 'Parte 1 redigida descrevendo, com exemplos reais, como cristãos hoje buscam suficiência fora de Cristo.' },
  { id: 'parte_2', titulo: 'Parte 2', categoria: 'redacao', foco: 'o texto completo e revisado da segunda grande parte do livro', exemplo: 'Parte 2 redigida percorrendo Colossenses e Hebreus para mostrar a suficiência de Cristo declarada na Escritura.' },
  { id: 'parte_3', titulo: 'Parte 3', categoria: 'redacao', foco: 'o texto completo e revisado da terceira grande parte do livro', exemplo: 'Parte 3 redigida com aplicações concretas: ansiedade, decisões e identidade à luz da suficiência de Cristo.' },
  { id: 'transicoes_capitulos', titulo: 'Transições entre capítulos', categoria: 'redacao', foco: 'as frases de ligação que evitam que o livro pareça uma coleção de textos avulsos', exemplo: '"Se Cristo é suficiente para perdoar o passado, como vimos no capítulo 4, ele também é suficiente para a ansiedade do presente — é o que veremos agora."' },
  { id: 'conclusoes_parciais', titulo: 'Conclusões parciais', categoria: 'redacao', foco: 'pequenos fechamentos ao final de cada capítulo que resumem o que foi estabelecido', exemplo: 'Encerrar o capítulo 5 resumindo em duas frases por que a ansiedade é, no fundo, uma questão de confiança em Deus.' },
  { id: 'referencias_biblicas', titulo: 'Referências bíblicas', categoria: 'apoio', foco: 'o conjunto de textos bíblicos usados ao longo do livro, organizados para consulta', exemplo: 'Lista de todas as passagens citadas, agrupadas por capítulo, para facilitar revisão teológica antes da publicação.' },
  { id: 'referencias_teologicas', titulo: 'Referências teológicas', categoria: 'apoio', foco: 'as obras e autores teológicos consultados que sustentam o conteúdo do livro', exemplo: 'Obras de John Owen sobre a pessoa de Cristo e de David Powlison sobre ansiedade e cuidado da alma.' },
  { id: 'referencias_historicas', titulo: 'Referências históricas', categoria: 'apoio', foco: 'dados de contexto histórico usados para sustentar ou ilustrar argumentos do livro', exemplo: 'Contexto da carta aos Colossenses, escrita contra filosofias que ofereciam "complementos" a Cristo.' },
  { id: 'autores_fundamentais', titulo: 'Autores fundamentais', categoria: 'apoio', foco: 'os pensadores cuja obra mais influenciou a perspectiva teológica do livro', exemplo: 'John Calvino sobre a união com Cristo e Sinclair Ferguson sobre a vida cristã centrada no evangelho.' },
  { id: 'notas', titulo: 'Notas', categoria: 'apoio', foco: 'anotações de rodapé ou de fim de capítulo que dão crédito a fontes ou aprofundam um ponto', exemplo: 'Nota explicando brevemente o pano de fundo histórico de Colossenses 2.9-10, sem interromper o fluxo do texto principal.' },
  { id: 'coerencia_tese', titulo: 'Coerência da tese', categoria: 'publicacao', foco: 'a checagem de que todos os capítulos realmente sustentam a mesma tese do livro', exemplo: 'Confirmar que a Parte 3 nunca trata suficiência como técnica de autoajuda, preservando o fundamento estabelecido na Parte 2.' },
  { id: 'clareza_capitulos', titulo: 'Clareza dos capítulos', categoria: 'publicacao', foco: 'a revisão de cada capítulo quanto à facilidade de leitura e compreensão', exemplo: 'Reescrever parágrafos do capítulo 6 que dependiam de termos técnicos sem explicação prévia.' },
  { id: 'unidade_argumento', titulo: 'Unidade do argumento', categoria: 'publicacao', foco: 'a confirmação de que o livro se lê como uma obra única, não como textos avulsos reunidos', exemplo: 'Revisar se as transições entre partes realmente conectam os capítulos ou se parecem início de assuntos novos.' },
  { id: 'estilo', titulo: 'Estilo', categoria: 'publicacao', foco: 'o ajuste de voz, ritmo e tom para que o livro tenha uma identidade consistente do início ao fim', exemplo: 'Padronizar o uso de histórias pessoais como recurso de abertura em todos os capítulos, não só em alguns.' },
  { id: 'revisao_teologica', titulo: 'Revisão teológica', categoria: 'publicacao', foco: 'a checagem final de fidelidade bíblica e doutrinária de todo o conteúdo do livro', exemplo: 'Confirmar que nenhuma aplicação prática da Parte 3 contradiz a cristologia estabelecida na Parte 2.' },
  { id: 'revisao_final', titulo: 'Revisão final', categoria: 'publicacao', foco: 'a última checagem completa antes de considerar o livro pronto para publicação', exemplo: 'Leitura integral do livro do início ao fim, sem pausas, simulando a experiência real do leitor.' },
  { id: 'sinopse', titulo: 'Sinopse', categoria: 'publicacao', foco: 'o resumo curto que apresenta o livro a um leitor que ainda não o conhece', exemplo: 'Sinopse de um parágrafo apresentando o problema da insuficiência percebida e a promessa do livro.' },
  { id: 'contracapa', titulo: 'Texto de contracapa', categoria: 'publicacao', foco: 'o texto de venda que aparece na contracapa física ou digital do livro', exemplo: 'Texto de contracapa com uma pergunta provocativa seguida de três frases sobre o que o leitor vai encontrar.' },
  { id: 'apresentacao', titulo: 'Apresentação', categoria: 'publicacao', foco: 'o texto de abertura, geralmente escrito por outra pessoa, que recomenda o livro ao leitor', exemplo: 'Apresentação escrita por um pastor amigo, destacando a relevância pastoral do tema do livro.' },
  { id: 'prefacio', titulo: 'Prefácio', categoria: 'publicacao', foco: 'o texto do próprio autor que explica a motivação e o contexto de escrita do livro', exemplo: 'Prefácio contando a história pessoal que levou o autor a escrever sobre suficiência de Cristo e ansiedade.' },
  { id: 'exportacao', titulo: 'Exportação', categoria: 'publicacao', foco: 'a preparação do arquivo final no formato exigido para impressão ou publicação digital', exemplo: 'Exportar em PDF para impressão e em EPUB para venda digital, revisando quebras de página em ambos.' },
  // ── PALESTRA ──────────────────────────────────────────────────────────
  { id: 'evento_contexto', titulo: 'Evento e contexto', categoria: 'planejamento', foco: 'a ocasião específica em que a palestra será apresentada e o que ela exige', exemplo: 'Retiro de jovens de fim de semana, ambiente informal, auditório com 80 pessoas, logo após o jantar.' },
  { id: 'publico_alvo', titulo: 'Público-alvo', categoria: 'planejamento', foco: 'quem vai assistir — idade, contexto espiritual e expectativa real diante do tema', exemplo: 'Jovens universitários, muitos enfrentando ansiedade sobre o futuro profissional e familiar.' },
  { id: 'tempo_disponivel', titulo: 'Tempo disponível', categoria: 'planejamento', foco: 'a duração exata da palestra, já contando perguntas se houver', exemplo: '30 minutos de palestra, mais 10 minutos de perguntas ao final.' },
  { id: 'objetivo_palestra', titulo: 'Objetivo da palestra', categoria: 'planejamento', foco: 'o que o público deve compreender ou decidir ao final da apresentação', exemplo: 'O público deve sair entendendo que ansiedade sobre o futuro pode se tornar oração específica, não apenas preocupação repetida.' },
  { id: 'tese_central', titulo: 'Tese central', categoria: 'planejamento', foco: 'a afirmação única que organiza toda a palestra', exemplo: 'Confiar no futuro de Deus começa por entregar a Ele as perguntas concretas do presente.' },
  { id: 'abertura', titulo: 'Abertura', categoria: 'estrutura', foco: 'os primeiros minutos que capturam a atenção e introduzem o tema', exemplo: 'Abrir perguntando quantas pessoas já passaram a noite em claro pensando no futuro — e construir a partir dessa resposta.' },
  { id: 'ponto_1', titulo: 'Ponto 1', categoria: 'estrutura', foco: 'o primeiro movimento de conteúdo que desenvolve a tese da palestra', exemplo: 'Ponto 1: por que a ansiedade sobre o futuro é tão comum entre jovens hoje.' },
  { id: 'ponto_2', titulo: 'Ponto 2', categoria: 'estrutura', foco: 'o segundo movimento de conteúdo, que avança ou aprofunda o primeiro', exemplo: 'Ponto 2: o que a Bíblia ensina sobre o cuidado de Deus com o futuro (Mateus 6.25-34).' },
  { id: 'ponto_3', titulo: 'Ponto 3', categoria: 'estrutura', foco: 'um terceiro movimento, usado apenas se for realmente necessário para completar a tese', exemplo: 'Ponto 3: como transformar uma preocupação concreta em um pedido de oração esta semana.' },
  { id: 'transicoes', titulo: 'Transições', categoria: 'estrutura', foco: 'as frases que conectam um ponto ao próximo sem perder o fio da tese', exemplo: '"Se Deus cuida até dos pássaros, como vimos agora, o que isso muda na forma como você encara o vestibular?"' },
  { id: 'fechamento', titulo: 'Fechamento', categoria: 'estrutura', foco: 'os minutos finais que retomam a tese e conduzem a uma resposta concreta', exemplo: 'Fechar pedindo que cada um escreva, no celular, uma preocupação específica para transformar em oração ainda naquela noite.' },
  { id: 'linguagem', titulo: 'Linguagem', categoria: 'redacao', foco: 'o ajuste de vocabulário e construção de frases ao público real que vai ouvir', exemplo: 'Trocar "providência divina" por "Deus cuidando do que você não controla", mantendo o conceito sem o jargão.' },
  { id: 'historias', titulo: 'Histórias', categoria: 'redacao', foco: 'narrativas reais ou ilustrativas que tornam o conteúdo mais concreto e memorável', exemplo: 'Contar, sem identificar nomes, a história de um jovem que trocou a ansiedade pré-vestibular por um hábito diário de oração.' },
  { id: 'exemplos', titulo: 'Exemplos', categoria: 'redacao', foco: 'situações concretas do cotidiano do público que ilustram a verdade ensinada', exemplo: 'O exemplo de checar o celular repetidamente esperando uma resposta, como imagem da ansiedade que busca controle.' },
  { id: 'aplicacoes', titulo: 'Aplicações', categoria: 'redacao', foco: 'a tradução prática da tese em algo que o público pode fazer imediatamente', exemplo: 'Escrever uma preocupação específica e orar por ela em voz alta com outra pessoa antes de sair do auditório.' },
  { id: 'ritmo_oral', titulo: 'Ritmo oral', categoria: 'redacao', foco: 'a marcação de onde acelerar, pausar ou enfatizar durante a fala', exemplo: 'Pausa de dois segundos depois de "Deus já sabe o que você precisa" para deixar a frase assentar antes de continuar.' },
  { id: 'slides', titulo: 'Slides', categoria: 'apoio', foco: 'o apoio visual projetado durante a apresentação', exemplo: 'Slides com poucas palavras por tela, uma imagem por ponto principal e a referência bíblica sempre visível.' },
  { id: 'handout', titulo: 'Handout', categoria: 'apoio', foco: 'o material impresso ou digital entregue ao público para acompanhar ou levar para casa', exemplo: 'Cartão pequeno com Mateus 6.25-34 impresso e um espaço para anotar a preocupação transformada em oração.' },
  { id: 'perguntas', titulo: 'Perguntas', categoria: 'apoio', foco: 'as perguntas previstas para a sessão de interação após a palestra', exemplo: '"O que fazer quando oro sobre algo e a ansiedade não passa imediatamente?"' },
  { id: 'recursos_apoio', titulo: 'Recursos de apoio', categoria: 'apoio', foco: 'materiais extras que reforçam o conteúdo após a palestra', exemplo: 'Um link para uma playlist de louvores sobre confiança em Deus, compartilhado ao final.' },
  { id: 'controle_tempo', titulo: 'Controle de tempo', categoria: 'publicacao', foco: 'a checagem de que a palestra cabe exatamente no tempo disponível, com folga para imprevistos', exemplo: 'Ensaiar cronometrado e confirmar que a versão completa cabe em 28 minutos, deixando 2 de margem.' },
  { id: 'enfases', titulo: 'Ênfases', categoria: 'publicacao', foco: 'os dois ou três momentos que precisam ficar claramente marcados na entrega', exemplo: 'Marcar no roteiro que a frase "Deus já sabe o que você precisa" deve ser dita mais devagar e com mais peso.' },
  { id: 'conclusao_oral', titulo: 'Conclusão oral', categoria: 'publicacao', foco: 'a versão final, já ensaiada, das últimas frases da palestra', exemplo: 'Conclusão ensaiada palavra por palavra para garantir que o convite final seja claro e não pareça improvisado.' },
  { id: 'pontos_memoria', titulo: 'Pontos de memória', categoria: 'publicacao', foco: 'palavras ou frases-âncora que ajudam o palestrante a lembrar a sequência sem precisar do texto completo', exemplo: 'Âncoras: "por que se preocupa" → "Deus cuida" → "transforme em oração".' },

  // ── CURSO ─────────────────────────────────────────────────────────────
  { id: 'publico_alvo', titulo: 'Público-alvo', categoria: 'planejamento', foco: 'quem vai fazer o curso — maturidade espiritual, disponibilidade de tempo e motivação', exemplo: 'Líderes de pequenos grupos, com pouca formação teológica formal, disponíveis 1h por semana.' },
  { id: 'objetivos_aprendizagem', titulo: 'Objetivos de aprendizagem', categoria: 'planejamento', foco: 'o que o aluno deve ser capaz de fazer ou entender ao concluir o curso inteiro', exemplo: 'Ao final, o aluno deve conseguir preparar um estudo bíblico simples para seu pequeno grupo sem depender de material pronto.' },
  { id: 'carga_horaria', titulo: 'Carga horária', categoria: 'planejamento', foco: 'a duração total do curso e de cada módulo ou aula', exemplo: '8 semanas, uma aula de 40 minutos por semana, totalizando 5h20 de conteúdo.' },
  { id: 'pre_requisitos', titulo: 'Pré-requisitos', categoria: 'planejamento', foco: 'o que o aluno precisa saber ou ter antes de começar o curso', exemplo: 'Já ter participado de um pequeno grupo por ao menos seis meses; não é necessário conhecimento técnico prévio.' },
  { id: 'resultados_esperados', titulo: 'Resultados esperados', categoria: 'planejamento', foco: 'a mudança concreta e observável esperada na vida ou na prática do aluno', exemplo: 'O aluno conduz, sem ajuda externa, ao menos um estudo bíblico completo até o final do curso.' },
  { id: 'modulos', titulo: 'Módulos', categoria: 'estrutura', foco: 'os grandes blocos temáticos em que o curso se divide', exemplo: 'Módulo 1: Como ler um texto bíblico. Módulo 2: Como fazer perguntas certas. Módulo 3: Como conduzir a discussão em grupo.' },
  { id: 'aulas', titulo: 'Aulas', categoria: 'estrutura', foco: 'a divisão de cada módulo em aulas individuais com foco específico', exemplo: 'O Módulo 1 se divide em duas aulas: "Observação do texto" e "Perguntas de contexto".' },
  { id: 'trilha_aprendizagem', titulo: 'Trilha de aprendizagem', categoria: 'estrutura', foco: 'a sequência lógica que leva o aluno do início ao domínio final da habilidade ensinada', exemplo: 'Observar → interpretar → aplicar → conduzir — cada módulo treina uma dessas etapas antes de somar a próxima.' },
  { id: 'avaliacoes', titulo: 'Avaliações', categoria: 'estrutura', foco: 'como o curso verifica se o aluno realmente aprendeu o que foi ensinado', exemplo: 'Ao final de cada módulo, o aluno entrega um estudo bíblico de uma página preparado por ele mesmo.' },
  { id: 'progressao_didatica', titulo: 'Progressão didática', categoria: 'estrutura', foco: 'a forma como a dificuldade e a exigência aumentam ao longo do curso', exemplo: 'Os primeiros módulos usam textos narrativos simples; os últimos já trabalham com textos doutrinários mais densos.' },
  { id: 'roteiros_aulas', titulo: 'Roteiros das aulas', categoria: 'redacao', foco: 'o guia detalhado de cada aula, já pronto para ser ministrado', exemplo: 'Roteiro da aula 1 com tempo estimado por bloco, perguntas de abertura e exemplo de texto a ser observado em conjunto.' },
  { id: 'conteudos_centrais', titulo: 'Conteúdos centrais', categoria: 'redacao', foco: 'o conteúdo teórico essencial de cada módulo, já redigido em linguagem final', exemplo: 'Texto explicando, em linguagem simples, a diferença entre observação e interpretação de um texto bíblico.' },
  { id: 'atividades', titulo: 'Atividades', categoria: 'redacao', foco: 'os exercícios práticos que cada aula propõe para fixar o conteúdo', exemplo: 'Atividade: observar Marcos 4.35-41 por 5 minutos e listar apenas o que está explicitamente escrito no texto.' },
  { id: 'aplicacao_aula', titulo: 'Aplicação de cada aula', categoria: 'redacao', foco: 'a tarefa prática que conecta o conteúdo da aula à vida real do aluno antes da próxima semana', exemplo: 'Aplicar a técnica de observação em um texto à escolha própria antes do próximo encontro do curso.' },
  { id: 'apostila', titulo: 'Apostila', categoria: 'apoio', foco: 'o material escrito de apoio que acompanha o curso do início ao fim', exemplo: 'Apostila com um capítulo por módulo, espaço para anotações e os exercícios já impressos.' },
  { id: 'leituras', titulo: 'Leituras', categoria: 'apoio', foco: 'textos complementares recomendados para aprofundar o conteúdo de cada módulo', exemplo: 'Capítulo indicado do livro "Entendes o que Lês?" de Gordon Fee e Douglas Stuart, ligado ao Módulo 1.' },
  { id: 'recursos_complementares', titulo: 'Recursos complementares', categoria: 'apoio', foco: 'materiais extras — vídeos, áudios, planilhas — que apoiam o aprendizado fora da aula', exemplo: 'Uma planilha simples de perguntas-guia que o aluno pode usar em qualquer texto bíblico depois do curso.' },
  { id: 'descricao_curso', titulo: 'Descrição do curso', categoria: 'publicacao', foco: 'o texto que apresenta o curso a um possível aluno antes da inscrição', exemplo: 'Descrição de um parágrafo destacando que o curso ensina, na prática, a preparar estudos bíblicos sem depender de material pronto.' },
  { id: 'ementa', titulo: 'Ementa', categoria: 'publicacao', foco: 'o resumo formal do conteúdo, módulo por módulo, usado para divulgação ou registro', exemplo: 'Ementa listando os 3 módulos, a carga horária de cada um e os objetivos específicos correspondentes.' },
  { id: 'certificado', titulo: 'Certificado', categoria: 'publicacao', foco: 'a definição de como e se o curso emite certificado de conclusão ao aluno', exemplo: 'Certificado simples em PDF, emitido automaticamente quando o aluno entrega as três avaliações dos módulos.' },
  { id: 'divulgacao', titulo: 'Divulgação', categoria: 'publicacao', foco: 'os textos e materiais usados para anunciar o curso e atrair inscrições', exemplo: 'Texto curto para redes sociais: "Você prepara um estudo bíblico em uma hora — sem saber se está fazendo certo? Esse curso é para você."' },
  // ── SÉRIE DE MENSAGENS ────────────────────────────────────────────────
  { id: 'tema_serie', titulo: 'Tema da série', categoria: 'planejamento', foco: 'o assunto único que vai unir todas as mensagens da série', exemplo: 'Identidade cristã em tempos de comparação constante nas redes sociais.' },
  { id: 'necessidade_pastoral', titulo: 'Necessidade pastoral', categoria: 'planejamento', foco: 'a situação real da congregação que justifica pregar essa série agora', exemplo: 'Aumento perceptível de ansiedade e comparação entre os membros mais jovens da igreja, ligado ao uso de redes sociais.' },
  { id: 'objetivo_serie', titulo: 'Objetivo da série', categoria: 'planejamento', foco: 'o que a congregação deve compreender ou viver diferente ao final de toda a série', exemplo: 'A congregação deve sair entendendo sua identidade como dada por Deus, não construída por comparação ou aprovação social.' },
  { id: 'texto_eixo_biblico', titulo: 'Texto ou eixo bíblico', categoria: 'planejamento', foco: 'o livro, bloco de textos ou linha temática bíblica que sustenta toda a série', exemplo: 'Efésios 1-3, com foco na identidade "em Cristo" repetida ao longo da carta.' },
  { id: 'duracao', titulo: 'Duração', categoria: 'estrutura', foco: 'o número de semanas ou mensagens que a série terá', exemplo: '5 domingos consecutivos, uma mensagem por semana.' },
  { id: 'calendario', titulo: 'Calendário', categoria: 'estrutura', foco: 'as datas específicas em que cada mensagem será pregada', exemplo: 'Início no primeiro domingo de março, com uma semana de intervalo reservada para a Semana Santa.' },
  { id: 'ordem_mensagens', titulo: 'Ordem das mensagens', categoria: 'estrutura', foco: 'a sequência lógica em que os temas de cada mensagem serão apresentados', exemplo: '1) Identidade dada, não construída; 2) Adotados em Cristo; 3) Comparação e o evangelho; 4) Identidade na comunidade; 5) Vivendo a identidade nova.' },
  { id: 'progressao_serie', titulo: 'Progressão da série', categoria: 'estrutura', foco: 'como cada mensagem prepara a próxima, evitando repetição ou desconexão', exemplo: 'A mensagem 3 só faz sentido depois que a mensagem 2 estabelece a adoção em Cristo como base da identidade.' },
  { id: 'titulos_mensagens', titulo: 'Títulos das mensagens', categoria: 'estrutura', foco: 'o nome de cada mensagem dentro da série, claro e conectado ao tema geral', exemplo: '"Mais que minhas conquistas" (mensagem 1), "Adotado, não aprovado" (mensagem 2).' },
  { id: 'resumo_mensagem_1', titulo: 'Resumo da mensagem 1', categoria: 'redacao', foco: 'a síntese do conteúdo, texto bíblico e objetivo específico da primeira mensagem', exemplo: 'Efésios 1.3-6 — a identidade do cristão começa na escolha de Deus, não no desempenho pessoal.' },
  { id: 'resumo_mensagem_2', titulo: 'Resumo da mensagem 2', categoria: 'redacao', foco: 'a síntese do conteúdo, texto bíblico e objetivo específico da segunda mensagem', exemplo: 'Efésios 1.5 e Romanos 8.15-17 — ser adotado por Deus muda a base emocional da identidade cristã.' },
  { id: 'resumos_adicionais', titulo: 'Resumos adicionais', categoria: 'redacao', foco: 'a síntese das demais mensagens da série, seguindo o mesmo padrão das anteriores', exemplo: 'Resumo das mensagens 3, 4 e 5, cada uma com texto bíblico e a pergunta central que ela responde.' },
  { id: 'textos_biblicos', titulo: 'Textos bíblicos', categoria: 'redacao', foco: 'a lista completa das passagens usadas em cada mensagem da série', exemplo: 'Efésios 1.3-6; Efésios 1.5 e Romanos 8.15-17; 2 Coríntios 10.12; Efésios 2.19-22; Efésios 4.1-3.' },
  { id: 'grandes_ideias', titulo: 'Grandes ideias', categoria: 'redacao', foco: 'a frase central de cada mensagem, já formulada para pregação', exemplo: '"Identidade cristã não é conquistada, é recebida de Deus em Cristo" (Grande Ideia da mensagem 1).' },
  { id: 'conexoes_entre_mensagens', titulo: 'Conexões entre mensagens', categoria: 'redacao', foco: 'as frases de ligação usadas no início de cada mensagem para retomar a anterior', exemplo: '"Na semana passada vimos que fomos escolhidos por Deus. Hoje vamos ver o que essa escolha significa na prática: a adoção."' },
  { id: 'identidade_serie', titulo: 'Identidade da série', categoria: 'apoio', foco: 'o nome, cor e estilo visual que vão identificar a série em todos os materiais', exemplo: 'Nome da série: "Mais que Aprovação". Identidade visual em tons neutros, sem elementos que pareçam campanha de marketing.' },
  { id: 'descricao_publica', titulo: 'Descrição pública', categoria: 'apoio', foco: 'o texto curto usado para anunciar a série aos membros antes do início', exemplo: '"Cinco domingos para descobrir uma identidade que não depende de curtidas, conquistas ou aprovação."' },
  { id: 'chamadas', titulo: 'Chamadas', categoria: 'apoio', foco: 'os convites de divulgação usados para engajar a congregação a participar da série inteira', exemplo: 'Anúncio no boletim e nas redes da igreja, convidando a não faltar a nenhum dos cinco domingos.' },
  { id: 'materiais_apoio', titulo: 'Materiais de apoio', categoria: 'apoio', foco: 'recursos complementares oferecidos à congregação durante a série, como guias de estudo', exemplo: 'Guia de discipulado em pequenos grupos com uma pergunta por mensagem, distribuído junto com a série.' },
  { id: 'pagina_serie', titulo: 'Página da série', categoria: 'publicacao', foco: 'a página no site ou aplicativo da igreja onde a série fica disponível para consulta', exemplo: 'Página com as cinco mensagens em áudio e vídeo, organizadas em ordem, com o texto bíblico de cada uma.' },
  { id: 'descricao_final', titulo: 'Descrição final', categoria: 'publicacao', foco: 'o texto definitivo e revisado que descreve a série depois de concluída', exemplo: 'Descrição final ajustada para incluir, depois da pregação, os principais aprendizados que a congregação relatou.' },
  { id: 'calendario_publico', titulo: 'Calendário público', categoria: 'publicacao', foco: 'a versão final do calendário, já confirmada e divulgada à congregação', exemplo: 'Calendário publicado no boletim com datas, títulos e o pregador responsável por cada mensagem.' },
  { id: 'arquivo_serie', titulo: 'Arquivo da série', categoria: 'publicacao', foco: 'a organização e preservação de todo o material da série depois de pregada, para uso futuro', exemplo: 'Pasta arquivada com os 5 esboços, áudios e o guia de discipulado, disponível para reaproveitar em outra congregação.' },
]

export const PRODUCTION_HELP_CONTENT: Record<string, HelpEntry> = PRODUCTION_SEEDS.reduce<Record<string, HelpEntry>>((content, seed) => {
  content[seed.id] = createProductionHelpEntry(seed)
  return content
}, {})
