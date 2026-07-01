-- Corrige introdução de Mateus: campo 'structure' tomava posição sobre a organização do livro.
-- Regra editorial do Lampas: em questões de grande debate, apresentar as visões e indicar
-- a mais aceita pelos conservadores — sem afirmar como definitiva.
-- A estrutura de Mateus é movida para 'interpretive_issues' com as posições.

update public.book_introductions
set
  structure = 'O Evangelho de Mateus apresenta Jesus como o Rei messiânico prometido às Escrituras hebraicas. Qualquer leitura de sua estrutura deve partir desse propósito central: mostrar que Jesus é o cumprimento de tudo que Israel esperava. Estudiosos conservadores e críticos propõem diferentes esquemas organizacionais para o livro, cada um iluminando um aspecto distinto da teologia de Mateus.',

  main_divisions = '[]'::jsonb,

  interpretive_issues = jsonb_build_array(
    jsonb_build_object(
      'question', 'Qual é a estrutura literária do Evangelho de Mateus?',
      'positions', jsonb_build_object(
        'traditional',
          'A tradição reformada e conservadora majoritária (seguindo B. W. Bacon, 1930, amplamente adotado por comentaristas como D. A. Carson e R. T. France) identifica cinco grandes discursos alternados com seções narrativas, cada um encerrado pela fórmula "quando Jesus terminou de dizer estas palavras" (7:28; 11:1; 13:53; 19:1; 26:1). Essa estrutura pentateucal evoca o Pentateuco de Moisés e apresenta Jesus como o novo Moisés que entrega a Lei definitiva do Reino.',
        'critical',
          'Alguns estudiosos de abordagem histórico-crítica questionam que a estrutura seja intencionalmente pentateucal, preferindo divisões baseadas em marcadores geográficos ou temáticos, sem necessariamente ver paralelismo deliberado com Moisés. Outros propõem uma estrutura tripartida: Galileia (caps. 1–13), transição e viagem (caps. 14–20), Jerusalém (caps. 21–28).',
        'evangelical',
          'A maioria dos comentaristas evangélicos adota a estrutura dos cinco discursos como o esquema organizacional mais coerente com a teologia do livro, reconhecendo que Mateus não exclui outros padrões organizacionais — narrativa e discurso se interpenetram. O debate não é sobre o propósito do livro (apresentar Jesus como Rei messiânico), mas sobre qual chave literária organiza o material.',
        'pastoral',
          'Para a pregação e o ensino, a estrutura dos cinco discursos é uma ferramenta útil sem ser dogma literário. O pregador pode organizar séries sobre os grandes discursos (Sermão do Monte, Missão, Parábolas, Comunidade, Escatologia) sem afirmar que essa é a única leitura válida. O que importa pastoralmente é o propósito unitário: Jesus é o Rei que cumpre as Escrituras e convoca discípulos.'
      )
    )
  ) || interpretive_issues

where book_key = 'Mateus';
