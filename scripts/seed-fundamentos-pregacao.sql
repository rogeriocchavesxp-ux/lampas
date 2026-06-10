-- Curso: Fundamentos da Pregação Bíblica
-- Módulos 1–2 | Aulas 1–8
-- Execute no Supabase SQL Editor (substitui content.modules integralmente)

DO $$
DECLARE
  v_course_id uuid;
  v_modules_json text;
BEGIN
  SELECT id INTO v_course_id
  FROM public.knowledge_items
  WHERE title = 'Fundamentos da Pregação Bíblica'
    AND item_type = 'course'
  LIMIT 1;

  IF v_course_id IS NULL THEN
    RAISE EXCEPTION 'Curso "Fundamentos da Pregação Bíblica" não encontrado em knowledge_items.';
  END IF;

  v_modules_json := $modules$[
    {
      "id": "mod_fpb_1",
      "name": "Módulo 1 — O Fundamento da Pregação",
      "description": "Este módulo apresenta a base teológica, espiritual e pastoral da pregação bíblica. Antes de aprender técnicas de preparação de sermões, você será conduzido a compreender por que pregamos, quem é o pregador, qual é a natureza das Escrituras e como deve se posicionar entre Deus, o autor bíblico e os ouvintes contemporâneos.",
      "order": 0,
      "lessons": [
        {
          "id": "lic_fpb_1_1",
          "title": "Aula 1 — Por Que Pregamos?",
          "professor": "",
          "description": "",
          "video_url": "",
          "material": "",
          "order": 0,
          "summary": "<p>Esta aula apresenta a centralidade da pregação no plano de Deus e mostra que a missão do pregador não é comunicar opiniões pessoais, mas proclamar fielmente a Palavra revelada. Com base em 2 Timóteo 4.1-5, Romanos 10.14-17 e Neemias 8.1-8, você compreenderá que a pregação é um dos meios ordinários pelos quais Deus chama, edifica, corrige, consola e santifica o seu povo.</p>",
          "blocks": [
            {
              "id": "blk_fpb_1_1_obj",
              "key": "objetivo",
              "label": "Objetivo da aula",
              "value": "<p>Levar você a compreender que a pregação bíblica nasce da convicção de que Deus falou nas Escrituras e continua edificando sua igreja por meio da fiel proclamação da Palavra.</p>",
              "collapsed": false,
              "order": 0
            },
            {
              "id": "blk_fpb_1_1_txt",
              "key": "texto_base",
              "label": "Texto-base",
              "value": "<p>2 Timóteo 4.1-5</p>",
              "collapsed": false,
              "order": 1
            },
            {
              "id": "blk_fpb_1_1_ideia",
              "key": "ideia_central",
              "label": "Ideia central",
              "value": "<p>Pregamos porque Deus falou, e a igreja precisa ouvir sua Palavra com fidelidade, clareza e submissão.</p>",
              "collapsed": false,
              "order": 2
            },
            {
              "id": "blk_fpb_1_1_top",
              "key": "topicos_principais",
              "label": "Tópicos principais",
              "value": "<ul><li>Deus é um Deus que fala.</li><li>A ordem apostólica: \"Prega a Palavra\".</li><li>A autoridade da pregação está nas Escrituras.</li><li>A pregação é meio de graça.</li><li>O pregador é servo da Palavra, não dono da mensagem.</li></ul>",
              "collapsed": false,
              "order": 3
            },
            {
              "id": "blk_fpb_1_1_atv",
              "key": "atividade_sugerida",
              "label": "Atividade sugerida",
              "value": "<p>Responda: \"Quando você prepara uma mensagem, sua maior preocupação é dizer algo interessante ou comunicar fielmente o que Deus disse no texto?\"</p>",
              "collapsed": false,
              "order": 4
            }
          ]
        },
        {
          "id": "lic_fpb_1_2",
          "title": "Aula 2 — O Pregador: Caráter Antes da Técnica",
          "professor": "",
          "description": "",
          "video_url": "",
          "material": "",
          "order": 1,
          "summary": "<p>Nesta aula, o aluno será confrontado com uma verdade frequentemente esquecida: Deus se importa não apenas com a mensagem pregada, mas também com a vida daquele que a proclama. Antes de desenvolver habilidades de comunicação, o pregador precisa desenvolver maturidade espiritual, integridade moral e comunhão com Deus. A partir dos exemplos de Esdras, Paulo e Timóteo, veremos que o caráter sustenta a autoridade do ministério da Palavra.</p>",
          "blocks": [
            {
              "id": "blk_fpb_1_2_obj",
              "key": "objetivo",
              "label": "Objetivo da aula",
              "value": "<p>Levar o aluno a compreender que a eficácia duradoura da pregação está mais relacionada ao caráter do pregador do que à sua capacidade técnica.</p>",
              "collapsed": false,
              "order": 0
            },
            {
              "id": "blk_fpb_1_2_txt",
              "key": "texto_base",
              "label": "Texto-base",
              "value": "<p>Esdras 7.10</p>",
              "collapsed": false,
              "order": 1
            },
            {
              "id": "blk_fpb_1_2_ideia",
              "key": "ideia_central",
              "label": "Ideia central",
              "value": "<p>Deus usa instrumentos imperfeitos, mas requer que seus servos cultivem uma vida de santidade, piedade e submissão à Palavra que pregam.</p>",
              "collapsed": false,
              "order": 2
            },
            {
              "id": "blk_fpb_1_2_top",
              "key": "topicos_principais",
              "label": "Tópicos principais",
              "value": "<ul><li>O pregador como primeiro ouvinte da Palavra.</li><li>Vida e doutrina caminham juntas.</li><li>O perigo do profissionalismo ministerial.</li><li>A importância da devoção pessoal.</li><li>O exemplo de Esdras: buscar, praticar e ensinar.</li></ul>",
              "collapsed": false,
              "order": 3
            },
            {
              "id": "blk_fpb_1_2_atv",
              "key": "atividade_sugerida",
              "label": "Atividade sugerida",
              "value": "<p>Avalie sua rotina espiritual atual e identifique quais áreas precisam ser fortalecidas para sustentar seu ministério da Palavra.</p>",
              "collapsed": false,
              "order": 4
            }
          ]
        },
        {
          "id": "lic_fpb_1_3",
          "title": "Aula 3 — Como Deus Falou?",
          "professor": "",
          "description": "",
          "video_url": "",
          "material": "",
          "order": 2,
          "summary": "<p>Toda pregação depende da resposta correta a uma pergunta fundamental: de onde vem a Bíblia? Nesta aula estudaremos a doutrina da revelação e da inspiração das Escrituras. O aluno compreenderá por que a Bíblia possui autoridade absoluta para a fé e a prática cristã e por que a pregação expositiva surge naturalmente de uma visão elevada das Escrituras.</p>",
          "blocks": [
            {
              "id": "blk_fpb_1_3_obj",
              "key": "objetivo",
              "label": "Objetivo da aula",
              "value": "<p>Desenvolver uma convicção profunda acerca da inspiração, autoridade, suficiência e confiabilidade das Escrituras.</p>",
              "collapsed": false,
              "order": 0
            },
            {
              "id": "blk_fpb_1_3_txt",
              "key": "texto_base",
              "label": "Texto-base",
              "value": "<p>2 Timóteo 3.16-17</p>",
              "collapsed": false,
              "order": 1
            },
            {
              "id": "blk_fpb_1_3_ideia",
              "key": "ideia_central",
              "label": "Ideia central",
              "value": "<p>Pregamos a Bíblia porque ela é a Palavra inspirada de Deus e constitui a autoridade suprema para a vida da igreja.</p>",
              "collapsed": false,
              "order": 2
            },
            {
              "id": "blk_fpb_1_3_top",
              "key": "topicos_principais",
              "label": "Tópicos principais",
              "value": "<ul><li>Revelação geral e especial.</li><li>Inspiração das Escrituras.</li><li>Autoridade da Palavra de Deus.</li><li>Suficiência das Escrituras.</li><li>A relação entre Bíblia e pregação.</li></ul>",
              "collapsed": false,
              "order": 3
            },
            {
              "id": "blk_fpb_1_3_atv",
              "key": "atividade_sugerida",
              "label": "Atividade sugerida",
              "value": "<p>Explique com suas próprias palavras por que a inspiração das Escrituras é indispensável para a autoridade da pregação cristã.</p>",
              "collapsed": false,
              "order": 4
            }
          ]
        },
        {
          "id": "lic_fpb_1_4",
          "title": "Aula 4 — O Pregador Entre Três Mundos",
          "professor": "",
          "description": "",
          "video_url": "",
          "material": "",
          "order": 3,
          "summary": "<p>A pregação bíblica exige que o pregador faça a ponte entre o texto antigo e os ouvintes contemporâneos. Nesta aula estudaremos os três mundos que todo pregador precisa compreender: o mundo de Deus, o mundo do autor inspirado e o mundo dos ouvintes atuais. Veremos como a pregação fiel nasce do equilíbrio entre esses três elementos.</p>",
          "blocks": [
            {
              "id": "blk_fpb_1_4_obj",
              "key": "objetivo",
              "label": "Objetivo da aula",
              "value": "<p>Capacitar o aluno a compreender a dinâmica da comunicação bíblica entre a revelação divina, o contexto original e a realidade contemporânea.</p>",
              "collapsed": false,
              "order": 0
            },
            {
              "id": "blk_fpb_1_4_txt",
              "key": "texto_base",
              "label": "Texto-base",
              "value": "<p>Neemias 8.1-8</p>",
              "collapsed": false,
              "order": 1
            },
            {
              "id": "blk_fpb_1_4_ideia",
              "key": "ideia_central",
              "label": "Ideia central",
              "value": "<p>O pregador é um mediador da mensagem divina, responsável por comunicar hoje aquilo que Deus revelou originalmente por meio dos autores inspirados.</p>",
              "collapsed": false,
              "order": 2
            },
            {
              "id": "blk_fpb_1_4_top",
              "key": "topicos_principais",
              "label": "Tópicos principais",
              "value": "<ul><li>O mundo de Deus.</li><li>O mundo do autor bíblico.</li><li>O mundo do ouvinte contemporâneo.</li><li>O perigo de ignorar um dos mundos.</li><li>O modelo bíblico de Neemias 8.</li></ul>",
              "collapsed": false,
              "order": 3
            },
            {
              "id": "blk_fpb_1_4_atv",
              "key": "atividade_sugerida",
              "label": "Atividade sugerida",
              "value": "<p>Escolha um texto bíblico e identifique elementos pertencentes ao mundo de Deus, ao mundo do autor e ao mundo do ouvinte contemporâneo.</p>",
              "collapsed": false,
              "order": 4
            }
          ]
        }
      ]
    },
    {
      "id": "mod_fpb_2",
      "name": "Módulo 2 — Compreendendo o Texto",
      "description": "Neste módulo o aluno aprenderá os fundamentos da interpretação bíblica necessários para a preparação de sermões expositivos. O foco será desenvolver a capacidade de descobrir a mensagem do texto, respeitando seu contexto, sua estrutura e sua intenção original. O objetivo é formar pregadores que não imponham suas ideias às Escrituras, mas permitam que as Escrituras governem suas ideias.",
      "order": 1,
      "lessons": [
        {
          "id": "lic_fpb_2_1",
          "title": "Aula 5 — Como Encontrar a Mensagem do Texto?",
          "professor": "",
          "description": "",
          "video_url": "",
          "material": "",
          "order": 0,
          "summary": "<p>Nesta aula o aluno aprenderá a identificar a mensagem central de uma passagem bíblica. Serão abordados os princípios da observação cuidadosa, da identificação do propósito do texto e da busca pela ideia dominante que une todos os seus elementos.</p>",
          "blocks": [
            {
              "id": "blk_fpb_2_1_obj",
              "key": "objetivo",
              "label": "Objetivo da aula",
              "value": "<p>Capacitar o aluno a descobrir a mensagem principal de uma passagem bíblica e distingui-la de observações secundárias.</p>",
              "collapsed": false,
              "order": 0
            },
            {
              "id": "blk_fpb_2_1_txt",
              "key": "texto_base",
              "label": "Texto-base",
              "value": "<p>Marcos 2.1-12</p>",
              "collapsed": false,
              "order": 1
            },
            {
              "id": "blk_fpb_2_1_ideia",
              "key": "ideia_central",
              "label": "Ideia central",
              "value": "<p>Todo texto bíblico possui uma mensagem principal que deve ser descoberta e comunicada pelo pregador.</p>",
              "collapsed": false,
              "order": 2
            },
            {
              "id": "blk_fpb_2_1_top",
              "key": "topicos_principais",
              "label": "Tópicos principais",
              "value": "<ul><li>Observação e interpretação.</li><li>A diferença entre detalhes e mensagem.</li><li>O princípio da unidade.</li><li>O propósito do texto.</li><li>A busca pela mensagem central.</li></ul>",
              "collapsed": false,
              "order": 3
            },
            {
              "id": "blk_fpb_2_1_atv",
              "key": "atividade_sugerida",
              "label": "Atividade sugerida",
              "value": "<p>Leia Marcos 2.1-12 e tente resumir a mensagem da passagem em apenas uma frase.</p>",
              "collapsed": false,
              "order": 4
            }
          ]
        },
        {
          "id": "lic_fpb_2_2",
          "title": "Aula 6 — Contexto: A Regra de Ouro da Interpretação",
          "professor": "",
          "description": "",
          "video_url": "",
          "material": "",
          "order": 1,
          "summary": "<p>O aluno estudará os diferentes níveis de contexto e aprenderá como eles influenciam a interpretação bíblica. Veremos como muitos erros surgem quando textos são retirados de seu ambiente natural.</p>",
          "blocks": [
            {
              "id": "blk_fpb_2_2_obj",
              "key": "objetivo",
              "label": "Objetivo da aula",
              "value": "<p>Desenvolver o hábito de interpretar todo texto bíblico à luz de seu contexto imediato, histórico, literário e canônico.</p>",
              "collapsed": false,
              "order": 0
            },
            {
              "id": "blk_fpb_2_2_txt",
              "key": "texto_base",
              "label": "Texto-base",
              "value": "<p>Filipenses 4.10-13</p>",
              "collapsed": false,
              "order": 1
            },
            {
              "id": "blk_fpb_2_2_ideia",
              "key": "ideia_central",
              "label": "Ideia central",
              "value": "<p>O significado correto de uma passagem só pode ser compreendido quando ela é interpretada dentro de seu contexto.</p>",
              "collapsed": false,
              "order": 2
            },
            {
              "id": "blk_fpb_2_2_top",
              "key": "topicos_principais",
              "label": "Tópicos principais",
              "value": "<ul><li>O contexto imediato.</li><li>O contexto do livro.</li><li>O contexto histórico.</li><li>O contexto canônico.</li><li>O contexto como proteção contra erros.</li></ul>",
              "collapsed": false,
              "order": 3
            },
            {
              "id": "blk_fpb_2_2_atv",
              "key": "atividade_sugerida",
              "label": "Atividade sugerida",
              "value": "<p>Analise Filipenses 4.13 dentro de seu contexto e compare sua conclusão com o uso popular desse versículo.</p>",
              "collapsed": false,
              "order": 4
            }
          ]
        },
        {
          "id": "lic_fpb_2_3",
          "title": "Aula 7 — Aprendendo a Ler os Gêneros Bíblicos",
          "professor": "",
          "description": "",
          "video_url": "",
          "material": "",
          "order": 2,
          "summary": "<p>Nesta aula o aluno compreenderá como os diferentes gêneros literários das Escrituras comunicam suas mensagens. Narrativas, epístolas, salmos, provérbios e profecias possuem características próprias que influenciam diretamente a interpretação.</p>",
          "blocks": [
            {
              "id": "blk_fpb_2_3_obj",
              "key": "objetivo",
              "label": "Objetivo da aula",
              "value": "<p>Capacitar o aluno a interpretar cada texto de acordo com seu gênero literário.</p>",
              "collapsed": false,
              "order": 0
            },
            {
              "id": "blk_fpb_2_3_txt",
              "key": "texto_base",
              "label": "Texto-base",
              "value": "<p>Lucas 15.11-32</p>",
              "collapsed": false,
              "order": 1
            },
            {
              "id": "blk_fpb_2_3_ideia",
              "key": "ideia_central",
              "label": "Ideia central",
              "value": "<p>Deus utilizou diferentes formas literárias para comunicar sua verdade, e cada uma delas exige atenção específica do intérprete.</p>",
              "collapsed": false,
              "order": 2
            },
            {
              "id": "blk_fpb_2_3_top",
              "key": "topicos_principais",
              "label": "Tópicos principais",
              "value": "<ul><li>Narrativas.</li><li>Epístolas.</li><li>Salmos.</li><li>Literatura sapiencial.</li><li>Profecias.</li><li>Literatura apocalíptica.</li></ul>",
              "collapsed": false,
              "order": 3
            },
            {
              "id": "blk_fpb_2_3_atv",
              "key": "atividade_sugerida",
              "label": "Atividade sugerida",
              "value": "<p>Escolha um salmo e identifique características que o diferenciam de uma epístola do Novo Testamento.</p>",
              "collapsed": false,
              "order": 4
            }
          ]
        },
        {
          "id": "lic_fpb_2_4",
          "title": "Aula 8 — Estrutura: Aprendendo a Seguir o Fluxo do Texto",
          "professor": "",
          "description": "",
          "video_url": "",
          "material": "",
          "order": 3,
          "summary": "<p>Nesta aula o aluno aprenderá a identificar a estrutura de uma passagem bíblica, observando seu desenvolvimento lógico, argumentativo ou narrativo. A estrutura será apresentada como o esqueleto da mensagem.</p>",
          "blocks": [
            {
              "id": "blk_fpb_2_4_obj",
              "key": "objetivo",
              "label": "Objetivo da aula",
              "value": "<p>Capacitar o aluno a reconhecer e mapear a estrutura de um texto bíblico.</p>",
              "collapsed": false,
              "order": 0
            },
            {
              "id": "blk_fpb_2_4_txt",
              "key": "texto_base",
              "label": "Texto-base",
              "value": "<p>Filipenses 1.21-26</p>",
              "collapsed": false,
              "order": 1
            },
            {
              "id": "blk_fpb_2_4_ideia",
              "key": "ideia_central",
              "label": "Ideia central",
              "value": "<p>A estrutura do texto revela o caminho percorrido pelo autor para comunicar sua mensagem.</p>",
              "collapsed": false,
              "order": 2
            },
            {
              "id": "blk_fpb_2_4_top",
              "key": "topicos_principais",
              "label": "Tópicos principais",
              "value": "<ul><li>O texto possui estrutura.</li><li>Estruturas narrativas.</li><li>Estruturas argumentativas.</li><li>Divisões naturais.</li><li>O esboço exegético.</li></ul>",
              "collapsed": false,
              "order": 3
            },
            {
              "id": "blk_fpb_2_4_atv",
              "key": "atividade_sugerida",
              "label": "Atividade sugerida",
              "value": "<p>Construa um esboço estrutural de Filipenses 1.21-26 identificando seus movimentos principais.</p>",
              "collapsed": false,
              "order": 4
            }
          ]
        }
      ]
    }
  ]$modules$;

  UPDATE public.knowledge_items
  SET
    subtitle  = 'Da Compreensão das Escrituras à Proclamação da Palavra',
    summary   = 'Curso de capacitação para líderes da igreja que já pregam ou desejam crescer no ministério da Palavra. O objetivo é conduzir você em um processo formativo, bíblico e pastoral, capacitando-o a partir do texto bíblico e chegar a uma mensagem fiel, clara, cristocêntrica e aplicável à vida da igreja.' || E'\n\n' ||
                'A formação trabalha os fundamentos da pregação bíblica, a natureza das Escrituras, o caráter do pregador, os princípios de interpretação, a construção do sermão, a aplicação pastoral, a comunicação da mensagem e a dependência do Espírito Santo.' || E'\n\n' ||
                'O curso dialoga especialmente com a tradição da pregação expositiva reformada, utilizando princípios associados a Haddon Robinson, Bryan Chapell, John Stott, Martyn Lloyd-Jones, Hernandes Dias Lopes e outros autores comprometidos com a centralidade da Palavra de Deus.',
    category  = 'Pregação Expositiva / Formação de Pregadores',
    institutions = ARRAY['Lampas'],
    content   = jsonb_set(
                  coalesce(content, '{}'::jsonb),
                  '{modules}',
                  to_jsonb(v_modules_json)
                )
  WHERE id = v_course_id;

  RAISE NOTICE 'Módulos 1–2 (Aulas 1–8) inseridos no curso: %', v_course_id;
END;
$$;
