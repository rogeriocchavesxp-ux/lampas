-- Curso: Fundamentos da Pregação Bíblica
-- Módulos 1–2 | Aulas 1–8
-- Execute no Supabase SQL Editor (substitui content.modules integralmente)

DO $$
DECLARE
  v_course_id uuid;
  v_modules_json text;
  v_resultados_json text;
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
    },
    {
      "id": "mod_fpb_3",
      "name": "Módulo 3 — Construindo o Sermão",
      "description": "Após aprender a interpretar corretamente as Escrituras, o aluno será conduzido ao processo de transformar exegese em proclamação. Neste módulo estudaremos como identificar a Grande Ideia do texto, compreender a necessidade humana abordada pela passagem, construir um esboço expositivo e organizar uma mensagem fiel ao texto e relevante para a igreja. O objetivo é capacitar o pregador a sair do estudo bíblico e chegar a um sermão claro, organizado e centrado em Cristo.",
      "order": 2,
      "lessons": [
        {
          "id": "lic_fpb_3_1",
          "title": "Aula 9 — A Grande Ideia",
          "professor": "",
          "description": "",
          "video_url": "",
          "material": "",
          "order": 0,
          "summary": "<p>Nesta aula o aluno estudará o conceito central da pregação expositiva desenvolvido por Haddon Robinson. Aprenderá a identificar a verdade dominante de uma passagem e a construir sermões marcados pela unidade, clareza e direção. Serão trabalhados os conceitos de assunto, complemento, ideia exegética e ideia homilética.</p>",
          "blocks": [
            {
              "id": "blk_fpb_3_1_obj",
              "key": "objetivo",
              "label": "Objetivo da aula",
              "value": "<p>Capacitar o aluno a identificar e formular a Grande Ideia de um texto bíblico e utilizá-la como eixo de toda a mensagem.</p>",
              "collapsed": false,
              "order": 0
            },
            {
              "id": "blk_fpb_3_1_txt",
              "key": "texto_base",
              "label": "Texto-base",
              "value": "<p>Marcos 2.1-12</p>",
              "collapsed": false,
              "order": 1
            },
            {
              "id": "blk_fpb_3_1_ideia",
              "key": "ideia_central",
              "label": "Ideia central",
              "value": "<p>Todo texto bíblico possui uma verdade dominante, e todo sermão expositivo deve ser construído em torno dessa verdade.</p>",
              "collapsed": false,
              "order": 2
            },
            {
              "id": "blk_fpb_3_1_top",
              "key": "topicos_principais",
              "label": "Tópicos principais",
              "value": "<ul><li>O princípio da unidade.</li><li>O que é a Grande Ideia.</li><li>Assunto e complemento.</li><li>Ideia exegética.</li><li>Ideia homilética.</li><li>A Grande Ideia como centro do sermão.</li></ul>",
              "collapsed": false,
              "order": 3
            },
            {
              "id": "blk_fpb_3_1_atv",
              "key": "atividade_sugerida",
              "label": "Atividade sugerida",
              "value": "<p>Formule a Grande Ideia de Marcos 2.1-12 utilizando uma única frase completa.</p>",
              "collapsed": false,
              "order": 4
            }
          ]
        },
        {
          "id": "lic_fpb_3_2",
          "title": "Aula 10 — O Problema e a Graça do Texto",
          "professor": "",
          "description": "",
          "video_url": "",
          "material": "",
          "order": 1,
          "summary": "<p>Nesta aula o aluno aprenderá a identificar a Condição Humana Caída presente em uma passagem bíblica e a compreender como a graça de Deus responde às necessidades humanas reveladas no texto. Veremos como essa abordagem conduz naturalmente à centralidade de Cristo e evita o moralismo.</p>",
          "blocks": [
            {
              "id": "blk_fpb_3_2_obj",
              "key": "objetivo",
              "label": "Objetivo da aula",
              "value": "<p>Capacitar o aluno a reconhecer o problema humano abordado pelo texto e a apresentar a resposta redentora oferecida por Deus.</p>",
              "collapsed": false,
              "order": 0
            },
            {
              "id": "blk_fpb_3_2_txt",
              "key": "texto_base",
              "label": "Texto-base",
              "value": "<p>1 Samuel 17</p>",
              "collapsed": false,
              "order": 1
            },
            {
              "id": "blk_fpb_3_2_ideia",
              "key": "ideia_central",
              "label": "Ideia central",
              "value": "<p>Toda passagem bíblica confronta alguma dimensão da condição humana caída e aponta para a graça redentora de Deus.</p>",
              "collapsed": false,
              "order": 2
            },
            {
              "id": "blk_fpb_3_2_top",
              "key": "topicos_principais",
              "label": "Tópicos principais",
              "value": "<ul><li>A Condição Humana Caída.</li><li>A necessidade da graça.</li><li>O perigo do moralismo.</li><li>O movimento da redenção.</li><li>Cristo como resposta.</li><li>Aplicação redentiva.</li></ul>",
              "collapsed": false,
              "order": 3
            },
            {
              "id": "blk_fpb_3_2_atv",
              "key": "atividade_sugerida",
              "label": "Atividade sugerida",
              "value": "<p>Identifique a Condição Humana Caída em 1 Samuel 17 e explique como a narrativa aponta para Cristo.</p>",
              "collapsed": false,
              "order": 4
            }
          ]
        },
        {
          "id": "lic_fpb_3_3",
          "title": "Aula 11 — Da Exegese ao Sermão",
          "professor": "",
          "description": "",
          "video_url": "",
          "material": "",
          "order": 2,
          "summary": "<p>O aluno aprenderá a transformar suas descobertas exegéticas em um esboço homilético. Serão estudados os princípios de construção de divisões, subdivisões e transições, sempre respeitando o fluxo natural da passagem bíblica.</p>",
          "blocks": [
            {
              "id": "blk_fpb_3_3_obj",
              "key": "objetivo",
              "label": "Objetivo da aula",
              "value": "<p>Capacitar o aluno a construir esboços expositivos que reflitam fielmente a estrutura do texto.</p>",
              "collapsed": false,
              "order": 0
            },
            {
              "id": "blk_fpb_3_3_txt",
              "key": "texto_base",
              "label": "Texto-base",
              "value": "<p>Filipenses 1.21-26</p>",
              "collapsed": false,
              "order": 1
            },
            {
              "id": "blk_fpb_3_3_ideia",
              "key": "ideia_central",
              "label": "Ideia central",
              "value": "<p>A estrutura do sermão deve nascer da estrutura do texto bíblico.</p>",
              "collapsed": false,
              "order": 2
            },
            {
              "id": "blk_fpb_3_3_top",
              "key": "topicos_principais",
              "label": "Tópicos principais",
              "value": "<ul><li>Exegese e homilética.</li><li>O esboço homilético.</li><li>Divisões principais.</li><li>Subdivisões.</li><li>Transições.</li><li>O sermão como jornada.</li></ul>",
              "collapsed": false,
              "order": 3
            },
            {
              "id": "blk_fpb_3_3_atv",
              "key": "atividade_sugerida",
              "label": "Atividade sugerida",
              "value": "<p>Transforme o esboço exegético de Filipenses 1.21-26 em um esboço homilético completo.</p>",
              "collapsed": false,
              "order": 4
            }
          ]
        },
        {
          "id": "lic_fpb_3_4",
          "title": "Aula 12 — Introduções e Conclusões",
          "professor": "",
          "description": "",
          "video_url": "",
          "material": "",
          "order": 3,
          "summary": "<p>Nesta aula estudaremos como abrir e encerrar uma mensagem de forma eficaz. O aluno aprenderá a despertar interesse, criar necessidade, conduzir os ouvintes ao texto e finalizar a mensagem conduzindo-os à resposta apropriada diante de Deus.</p>",
          "blocks": [
            {
              "id": "blk_fpb_3_4_obj",
              "key": "objetivo",
              "label": "Objetivo da aula",
              "value": "<p>Capacitar o aluno a elaborar introduções e conclusões que sirvam à mensagem e fortaleçam sua comunicação.</p>",
              "collapsed": false,
              "order": 0
            },
            {
              "id": "blk_fpb_3_4_txt",
              "key": "texto_base",
              "label": "Texto-base",
              "value": "<p>Mateus 7.24-27</p>",
              "collapsed": false,
              "order": 1
            },
            {
              "id": "blk_fpb_3_4_ideia",
              "key": "ideia_central",
              "label": "Ideia central",
              "value": "<p>Introduções e conclusões eficazes ajudam os ouvintes a entrar na mensagem e a responder à verdade proclamada.</p>",
              "collapsed": false,
              "order": 2
            },
            {
              "id": "blk_fpb_3_4_top",
              "key": "topicos_principais",
              "label": "Tópicos principais",
              "value": "<ul><li>O propósito da introdução.</li><li>Como despertar interesse.</li><li>O propósito da conclusão.</li><li>Chamando à resposta.</li><li>Erros comuns.</li><li>Unidade entre introdução e conclusão.</li></ul>",
              "collapsed": false,
              "order": 3
            },
            {
              "id": "blk_fpb_3_4_atv",
              "key": "atividade_sugerida",
              "label": "Atividade sugerida",
              "value": "<p>Desenvolva uma introdução e uma conclusão para um sermão baseado em Mateus 7.24-27.</p>",
              "collapsed": false,
              "order": 4
            }
          ]
        }
      ]
    },
    {
      "id": "mod_fpb_4",
      "name": "Módulo 4 — Aplicação e Comunicação da Palavra",
      "description": "Neste módulo o aluno aprenderá a levar a verdade bíblica ao coração dos ouvintes. O foco estará na aplicação pastoral, no uso adequado de ilustrações e nos princípios da comunicação eficaz. O objetivo é capacitar o pregador a proclamar a Palavra com clareza, relevância e fidelidade, alcançando não apenas a mente, mas também o coração e a vontade dos ouvintes.",
      "order": 3,
      "lessons": [
        {
          "id": "lic_fpb_4_1",
          "title": "Aula 13 — Aplicação: Levando a Palavra ao Coração",
          "professor": "",
          "description": "",
          "video_url": "",
          "material": "",
          "order": 0,
          "summary": "<p>A aula mostrará como construir aplicações bíblicas que nasçam do texto e conduzam os ouvintes à transformação. Serão trabalhadas aplicações direcionadas à mente, ao coração e à vontade, sempre conectadas à graça do Evangelho.</p>",
          "blocks": [
            {
              "id": "blk_fpb_4_1_obj",
              "key": "objetivo",
              "label": "Objetivo da aula",
              "value": "<p>Capacitar o aluno a desenvolver aplicações bíblicas, pastorais e cristocêntricas.</p>",
              "collapsed": false,
              "order": 0
            },
            {
              "id": "blk_fpb_4_1_txt",
              "key": "texto_base",
              "label": "Texto-base",
              "value": "<p>Tiago 1.22-25</p>",
              "collapsed": false,
              "order": 1
            },
            {
              "id": "blk_fpb_4_1_ideia",
              "key": "ideia_central",
              "label": "Ideia central",
              "value": "<p>A verdadeira exposição bíblica conduz os ouvintes da compreensão da verdade à prática da verdade.</p>",
              "collapsed": false,
              "order": 2
            },
            {
              "id": "blk_fpb_4_1_top",
              "key": "topicos_principais",
              "label": "Tópicos principais",
              "value": "<ul><li>Explicação e aplicação.</li><li>Aplicação à mente.</li><li>Aplicação ao coração.</li><li>Aplicação à vontade.</li><li>Aplicação cristocêntrica.</li><li>O objetivo transformador da pregação.</li></ul>",
              "collapsed": false,
              "order": 3
            },
            {
              "id": "blk_fpb_4_1_atv",
              "key": "atividade_sugerida",
              "label": "Atividade sugerida",
              "value": "<p>Desenvolva três aplicações distintas para Tiago 1.22-25, direcionadas à mente, ao coração e à vontade.</p>",
              "collapsed": false,
              "order": 4
            }
          ]
        },
        {
          "id": "lic_fpb_4_2",
          "title": "Aula 14 — Ilustrações: Janelas que Deixam a Luz Entrar",
          "professor": "",
          "description": "",
          "video_url": "",
          "material": "",
          "order": 1,
          "summary": "<p>Nesta aula estudaremos o papel das ilustrações na comunicação da verdade bíblica. O aluno aprenderá a utilizar histórias, imagens e exemplos para esclarecer o texto sem competir com ele.</p>",
          "blocks": [
            {
              "id": "blk_fpb_4_2_obj",
              "key": "objetivo",
              "label": "Objetivo da aula",
              "value": "<p>Capacitar o aluno a utilizar ilustrações de forma bíblica, equilibrada e eficaz.</p>",
              "collapsed": false,
              "order": 0
            },
            {
              "id": "blk_fpb_4_2_txt",
              "key": "texto_base",
              "label": "Texto-base",
              "value": "<p>Lucas 15.11-32</p>",
              "collapsed": false,
              "order": 1
            },
            {
              "id": "blk_fpb_4_2_ideia",
              "key": "ideia_central",
              "label": "Ideia central",
              "value": "<p>Boas ilustrações não substituem a verdade; elas ajudam os ouvintes a enxergá-la com maior clareza.</p>",
              "collapsed": false,
              "order": 2
            },
            {
              "id": "blk_fpb_4_2_top",
              "key": "topicos_principais",
              "label": "Tópicos principais",
              "value": "<ul><li>O modelo de Jesus.</li><li>O propósito das ilustrações.</li><li>Fontes de ilustrações.</li><li>O perigo do entretenimento.</li><li>O equilíbrio na comunicação.</li><li>Ilustrações e aplicação.</li></ul>",
              "collapsed": false,
              "order": 3
            },
            {
              "id": "blk_fpb_4_2_atv",
              "key": "atividade_sugerida",
              "label": "Atividade sugerida",
              "value": "<p>Escolha uma doutrina bíblica e desenvolva uma ilustração que ajude a esclarecê-la para novos convertidos.</p>",
              "collapsed": false,
              "order": 4
            }
          ]
        },
        {
          "id": "lic_fpb_4_3",
          "title": "Aula 15 — A Comunicação da Palavra",
          "professor": "",
          "description": "",
          "video_url": "",
          "material": "",
          "order": 2,
          "summary": "<p>O aluno estudará princípios fundamentais da comunicação pública da Palavra de Deus. Serão abordados aspectos relacionados à clareza, simplicidade, linguagem, ritmo, voz, postura e convicção espiritual.</p>",
          "blocks": [
            {
              "id": "blk_fpb_4_3_obj",
              "key": "objetivo",
              "label": "Objetivo da aula",
              "value": "<p>Capacitar o aluno a comunicar a mensagem bíblica de forma clara, compreensível e pastoral.</p>",
              "collapsed": false,
              "order": 0
            },
            {
              "id": "blk_fpb_4_3_txt",
              "key": "texto_base",
              "label": "Texto-base",
              "value": "<p>Neemias 8.8</p>",
              "collapsed": false,
              "order": 1
            },
            {
              "id": "blk_fpb_4_3_ideia",
              "key": "ideia_central",
              "label": "Ideia central",
              "value": "<p>A verdade de Deus deve ser comunicada com clareza para que possa ser compreendida e obedecida.</p>",
              "collapsed": false,
              "order": 2
            },
            {
              "id": "blk_fpb_4_3_top",
              "key": "topicos_principais",
              "label": "Tópicos principais",
              "value": "<ul><li>Clareza e simplicidade.</li><li>Linguagem pastoral.</li><li>Uso da voz.</li><li>Ritmo e progressão.</li><li>Comunicação não verbal.</li><li>Convicção e autoridade espiritual.</li></ul>",
              "collapsed": false,
              "order": 3
            },
            {
              "id": "blk_fpb_4_3_atv",
              "key": "atividade_sugerida",
              "label": "Atividade sugerida",
              "value": "<p>Grave uma exposição de cinco minutos e avalie sua clareza, ritmo e comunicação não verbal.</p>",
              "collapsed": false,
              "order": 4
            }
          ]
        }
      ]
    },
    {
      "id": "mod_fpb_5",
      "name": "Módulo 5 — O Coração do Pregador e o Método do Pregador Expositivo",
      "description": "O módulo final conduz o aluno à dimensão mais profunda do ministério da Palavra: a dependência do Espírito Santo, a vigilância sobre a própria vida e a consolidação de um método completo de preparação de sermões. O objetivo não é apenas formar comunicadores mais eficientes, mas servos mais fiéis, capazes de unir conhecimento bíblico, maturidade espiritual e compromisso pastoral. Ao concluir este módulo, o aluno possuirá um processo completo para preparar e proclamar sermões expositivos ao longo de toda a sua vida ministerial.",
      "order": 4,
      "lessons": [
        {
          "id": "lic_fpb_5_1",
          "title": "Aula 16 — O Pregador e o Espírito Santo",
          "professor": "",
          "description": "",
          "video_url": "",
          "material": "",
          "order": 0,
          "summary": "<p>Nesta aula estudaremos a relação entre o ministério da Palavra e a atuação do Espírito Santo. O aluno compreenderá que nenhuma técnica, conhecimento ou experiência pode substituir a ação divina na preparação e proclamação da mensagem. Serão abordados temas como iluminação, dependência espiritual, oração, unção e poder na pregação.</p>",
          "blocks": [
            {
              "id": "blk_fpb_5_1_obj",
              "key": "objetivo",
              "label": "Objetivo da aula",
              "value": "<p>Levar o aluno a desenvolver uma profunda dependência do Espírito Santo durante toda a preparação e proclamação da Palavra.</p>",
              "collapsed": false,
              "order": 0
            },
            {
              "id": "blk_fpb_5_1_txt",
              "key": "texto_base",
              "label": "Texto-base",
              "value": "<p>1 Coríntios 2.1-5</p>",
              "collapsed": false,
              "order": 1
            },
            {
              "id": "blk_fpb_5_1_ideia",
              "key": "ideia_central",
              "label": "Ideia central",
              "value": "<p>A preparação diligente é indispensável, mas somente o Espírito Santo pode aplicar eficazmente a Palavra ao coração dos ouvintes.</p>",
              "collapsed": false,
              "order": 2
            },
            {
              "id": "blk_fpb_5_1_top",
              "key": "topicos_principais",
              "label": "Tópicos principais",
              "value": "<ul><li>A pregação como obra sobrenatural.</li><li>O Espírito Santo e a iluminação das Escrituras.</li><li>O pregador de joelhos.</li><li>Dependência na preparação.</li><li>Dependência na proclamação.</li><li>A diferença entre habilidade e poder espiritual.</li></ul>",
              "collapsed": false,
              "order": 3
            },
            {
              "id": "blk_fpb_5_1_atv",
              "key": "atividade_sugerida",
              "label": "Atividade sugerida",
              "value": "<p>Avalie sua preparação de sermões e identifique de que forma a oração e a dependência do Espírito Santo estão presentes em seu processo atual.</p>",
              "collapsed": false,
              "order": 4
            }
          ]
        },
        {
          "id": "lic_fpb_5_2",
          "title": "Aula 17 — Os Pecados e Erros Mais Comuns dos Pregadores",
          "professor": "",
          "description": "",
          "video_url": "",
          "material": "",
          "order": 1,
          "summary": "<p>Nesta aula o aluno será levado a examinar perigos que frequentemente ameaçam o ministério da Palavra. Serão estudados erros técnicos, teológicos e espirituais que podem comprometer a fidelidade da pregação e a integridade do pregador.</p>",
          "blocks": [
            {
              "id": "blk_fpb_5_2_obj",
              "key": "objetivo",
              "label": "Objetivo da aula",
              "value": "<p>Desenvolver discernimento para reconhecer e evitar erros que enfraquecem a pregação bíblica e prejudicam a saúde espiritual do ministério.</p>",
              "collapsed": false,
              "order": 0
            },
            {
              "id": "blk_fpb_5_2_txt",
              "key": "texto_base",
              "label": "Texto-base",
              "value": "<p>1 Timóteo 4.16</p>",
              "collapsed": false,
              "order": 1
            },
            {
              "id": "blk_fpb_5_2_ideia",
              "key": "ideia_central",
              "label": "Ideia central",
              "value": "<p>O pregador precisa vigiar constantemente sua vida e sua doutrina para permanecer fiel ao chamado recebido de Deus.</p>",
              "collapsed": false,
              "order": 2
            },
            {
              "id": "blk_fpb_5_2_top",
              "key": "topicos_principais",
              "label": "Tópicos principais",
              "value": "<ul><li>Pregar a si mesmo.</li><li>Buscar aprovação humana.</li><li>Moralismo.</li><li>Alegorização indevida.</li><li>Sermões sem Cristo.</li><li>Sermões sem aplicação.</li><li>Excesso de informação.</li><li>Dependência excessiva de recursos.</li><li>Falta de preparo.</li><li>Vaidade ministerial.</li><li>Familiaridade sem temor.</li></ul>",
              "collapsed": false,
              "order": 3
            },
            {
              "id": "blk_fpb_5_2_atv",
              "key": "atividade_sugerida",
              "label": "Atividade sugerida",
              "value": "<p>Faça uma autoavaliação ministerial identificando quais dos perigos estudados representam maior risco para sua vida e ministério.</p>",
              "collapsed": false,
              "order": 4
            }
          ]
        },
        {
          "id": "lic_fpb_5_3",
          "title": "Aula 18 — O Método do Pregador Expositivo",
          "professor": "",
          "description": "",
          "video_url": "",
          "material": "",
          "order": 2,
          "summary": "<p>A aula final integra todo o conteúdo estudado ao longo do curso em um processo único de preparação de sermões. O aluno revisará cada etapa do caminho que conduz do texto ao púlpito e aprenderá a utilizar um método completo, organizado e reproduzível para a preparação de mensagens expositivas.</p>",
          "blocks": [
            {
              "id": "blk_fpb_5_3_obj",
              "key": "objetivo",
              "label": "Objetivo da aula",
              "value": "<p>Capacitar o aluno a utilizar um processo consistente de preparação expositiva que possa ser aplicado durante toda a sua vida ministerial.</p>",
              "collapsed": false,
              "order": 0
            },
            {
              "id": "blk_fpb_5_3_txt",
              "key": "texto_base",
              "label": "Texto-base",
              "value": "<p>2 Timóteo 4.1-5</p>",
              "collapsed": false,
              "order": 1
            },
            {
              "id": "blk_fpb_5_3_ideia",
              "key": "ideia_central",
              "label": "Ideia central",
              "value": "<p>A pregação expositiva floresce quando o pregador segue um processo que une fidelidade ao texto, dependência do Espírito Santo e amor pelo povo de Deus.</p>",
              "collapsed": false,
              "order": 2
            },
            {
              "id": "blk_fpb_5_3_top",
              "key": "topicos_principais",
              "label": "Tópicos principais",
              "value": "<ul><li>Oração.</li><li>Leitura do texto.</li><li>Observação.</li><li>Contexto.</li><li>Estrutura.</li><li>Grande Ideia.</li><li>Condição Humana Caída.</li><li>Graça e Cristo.</li><li>Esboço.</li><li>Aplicação.</li><li>Introdução e conclusão.</li><li>Proclamação.</li></ul>",
              "collapsed": false,
              "order": 3
            },
            {
              "id": "blk_fpb_5_3_atv",
              "key": "atividade_sugerida",
              "label": "Atividade sugerida",
              "value": "<p>Escolha uma passagem bíblica e desenvolva um esboço completo utilizando todas as etapas estudadas ao longo do curso.</p>",
              "collapsed": false,
              "order": 4
            }
          ]
        },
        {
          "id": "lic_fpb_5_4",
          "title": "Aula de Conclusão — Prega a Palavra",
          "professor": "",
          "description": "",
          "video_url": "",
          "material": "",
          "order": 3,
          "summary": "<p>Esta aula final servirá como revisão, encorajamento e comissionamento dos alunos. Serão retomados os principais princípios estudados ao longo da formação e reforçada a vocação do pregador como servo da Palavra, servo de Cristo e servo da igreja.</p>",
          "blocks": [
            {
              "id": "blk_fpb_5_4_obj",
              "key": "objetivo",
              "label": "Objetivo da aula",
              "value": "<p>Conduzir o aluno a assumir o compromisso de dedicar sua vida ao estudo, à prática e à proclamação fiel das Escrituras.</p>",
              "collapsed": false,
              "order": 0
            },
            {
              "id": "blk_fpb_5_4_txt",
              "key": "texto_base",
              "label": "Texto-base",
              "value": "<p>2 Timóteo 4.1-5</p>",
              "collapsed": false,
              "order": 1
            },
            {
              "id": "blk_fpb_5_4_ideia",
              "key": "ideia_central",
              "label": "Ideia central",
              "value": "<p>A maior responsabilidade do pregador não é ser original, eloquente ou popular, mas ser fiel à Palavra de Deus.</p>",
              "collapsed": false,
              "order": 2
            },
            {
              "id": "blk_fpb_5_4_top",
              "key": "topicos_principais",
              "label": "Tópicos principais",
              "value": "<ul><li>O amor às Escrituras.</li><li>O amor ao Deus das Escrituras.</li><li>O amor ao povo de Deus.</li><li>A fidelidade acima do sucesso.</li><li>O chamado permanente para pregar a Palavra.</li></ul>",
              "collapsed": false,
              "order": 3
            },
            {
              "id": "blk_fpb_5_4_atv",
              "key": "atividade_sugerida",
              "label": "Atividade sugerida",
              "value": "<p>Escreva uma declaração pessoal de compromisso ministerial descrevendo como pretende aplicar os princípios aprendidos neste curso em seu ministério de pregação.</p>",
              "collapsed": false,
              "order": 4
            }
          ]
        }
      ]
    }
  ]$modules$;

  v_resultados_json := $res$<ul><li>Compreender a natureza e a missão da pregação bíblica.</li><li>Interpretar corretamente diferentes textos das Escrituras.</li><li>Identificar contexto, estrutura e mensagem principal de uma passagem.</li><li>Formular a Grande Ideia de um texto bíblico.</li><li>Reconhecer a Condição Humana Caída e a resposta da graça.</li><li>Construir esboços expositivos claros e fiéis ao texto.</li><li>Desenvolver aplicações bíblicas, pastorais e cristocêntricas.</li><li>Utilizar ilustrações de maneira adequada.</li><li>Comunicar a Palavra com clareza e convicção.</li><li>Preparar sermões em dependência do Espírito Santo.</li><li>Desenvolver um método consistente de preparação expositiva.</li><li>Proclamar Cristo com fidelidade para a edificação da igreja e a glória de Deus.</li></ul>$res$;

  UPDATE public.knowledge_items
  SET
    subtitle  = 'Da Compreensão das Escrituras à Proclamação da Palavra',
    summary   = 'Curso de capacitação para líderes da igreja que já pregam ou desejam crescer no ministério da Palavra. O objetivo é conduzir você em um processo formativo, bíblico e pastoral, capacitando-o a partir do texto bíblico e chegar a uma mensagem fiel, clara, cristocêntrica e aplicável à vida da igreja.' || E'\n\n' ||
                'A formação trabalha os fundamentos da pregação bíblica, a natureza das Escrituras, o caráter do pregador, os princípios de interpretação, a construção do sermão, a aplicação pastoral, a comunicação da mensagem e a dependência do Espírito Santo.' || E'\n\n' ||
                'O curso dialoga especialmente com a tradição da pregação expositiva reformada, utilizando princípios associados a Haddon Robinson, Bryan Chapell, John Stott, Martyn Lloyd-Jones, Hernandes Dias Lopes e outros autores comprometidos com a centralidade da Palavra de Deus.',
    category  = 'Pregação Expositiva / Formação de Pregadores',
    institutions = ARRAY['Lampas'],
    content   = jsonb_set(
                  jsonb_set(
                    coalesce(content, '{}'::jsonb),
                    '{modules}',
                    to_jsonb(v_modules_json)
                  ),
                  '{resultados_esperados}',
                  to_jsonb(v_resultados_json)
                )
  WHERE id = v_course_id;

  RAISE NOTICE 'Módulos 1–5 (Aulas 1–18 + Conclusão) inseridos no curso: %', v_course_id;
END;
$$;
