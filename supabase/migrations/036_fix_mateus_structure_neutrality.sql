-- Corrige introdução de Mateus: campo 'structure' e 'main_divisions' tomavam posição sobre
-- a organização do livro. Regra editorial do Lampas: em questões de grande debate, apresentar
-- as visões sem afirmar como definitiva. O debate das estruturas já existe em interpretive_issues.
-- As correções de linguagem avaliativa (Knox audit 2026-07-01) foram aplicadas via script Python
-- diretamente no banco (Mateus issue[0].evangelical, Filipenses issue[1].pastoral).

update public.book_introductions
set
  structure = 'O Evangelho de Mateus apresenta Jesus como o Rei messiânico prometido às Escrituras hebraicas. Qualquer leitura de sua estrutura deve partir desse propósito central: mostrar que Jesus é o cumprimento de tudo que Israel esperava. Estudiosos conservadores e críticos propõem diferentes esquemas organizacionais para o livro, cada um iluminando um aspecto distinto da teologia de Mateus. O debate sobre qual esquema organiza o livro está detalhado nas Questões Interpretativas.',

  main_divisions = '[]'::jsonb

where book_key = 'Mateus';
