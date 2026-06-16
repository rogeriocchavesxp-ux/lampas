import type { SectionNav } from './workspace-sections-nav-types'

export const NAV_MODES: SectionNav[] = [
  {
    "slug": "sermao_inventio",
    "title": "Sermão · Invenção",
    "shortTitle": "Descoberta da mensagem",
    "phase": "comunicar",
    "communicationMode": "sermao",
    "module": "inventio",
    "group": "sermao_inventio",
    "groupLabel": "Invenção · Inventio",
    "order": 100,
    "cards": [
      {
        "id": "sermao_ideia_central",
        "title": "Ideia Central"
      },
      {
        "id": "sermao_tema",
        "title": "Tema"
      },
      {
        "id": "sermao_proposicao",
        "title": "Proposição"
      },
      {
        "id": "sermao_objetivo",
        "title": "Objetivo do Sermão"
      },
      {
        "id": "sermao_problema_texto",
        "title": "Problema do Texto"
      },
      {
        "id": "sermao_problema_ouvinte",
        "title": "Problema do Ouvinte"
      },
      {
        "id": "sermao_foco_cristocentrico",
        "title": "Foco Cristocêntrico"
      },
      {
        "id": "sermao_argumento_principal",
        "title": "Argumento principal"
      }
    ]
  },
  {
    "slug": "sermao_dispositio",
    "title": "Sermão · Disposição",
    "shortTitle": "Organização homilética",
    "phase": "comunicar",
    "communicationMode": "sermao",
    "module": "dispositio",
    "group": "sermao_dispositio",
    "groupLabel": "Disposição · Dispositio",
    "order": 101,
    "cards": [
      {
        "id": "sermao_estrutura",
        "title": "Estrutura do Sermão"
      },
      {
        "id": "sermao_divisoes",
        "title": "Divisões"
      },
      {
        "id": "sermao_progressao_logica",
        "title": "Progressão lógica"
      },
      {
        "id": "sermao_introducao",
        "title": "Introdução"
      },
      {
        "id": "sermao_transicoes",
        "title": "Transições"
      },
      {
        "id": "sermao_climax",
        "title": "Clímax"
      },
      {
        "id": "sermao_conclusao",
        "title": "Conclusão"
      },
      {
        "id": "sermao_aplicacoes",
        "title": "Aplicações"
      }
    ]
  },
  {
    "slug": "sermao_elocutio",
    "title": "Sermão · Elocução",
    "shortTitle": "Forma de comunicação",
    "phase": "comunicar",
    "communicationMode": "sermao",
    "module": "elocutio",
    "group": "sermao_elocutio",
    "groupLabel": "Elocução · Elocutio",
    "order": 102,
    "cards": [
      {
        "id": "sermao_clareza",
        "title": "Clareza"
      },
      {
        "id": "sermao_linguagem_pastoral",
        "title": "Linguagem pastoral"
      },
      {
        "id": "sermao_ilustracoes",
        "title": "Ilustrações"
      },
      {
        "id": "sermao_analogias",
        "title": "Analogias"
      },
      {
        "id": "sermao_retorica",
        "title": "Retórica"
      },
      {
        "id": "sermao_enfases",
        "title": "Ênfases"
      },
      {
        "id": "sermao_tom",
        "title": "Tom"
      },
      {
        "id": "sermao_imagens_verbais",
        "title": "Imagens verbais"
      },
      {
        "id": "sermao_frases_impacto",
        "title": "Frases de impacto"
      }
    ]
  },
  {
    "slug": "sermao_memoria",
    "title": "Sermão · Memória",
    "shortTitle": "Internalização",
    "phase": "comunicar",
    "communicationMode": "sermao",
    "module": "memoria",
    "group": "sermao_memoria",
    "groupLabel": "Memória · Memoria",
    "order": 103,
    "cards": [
      {
        "id": "sermao_revisao",
        "title": "Revisão"
      },
      {
        "id": "sermao_fixacao",
        "title": "Fixação"
      },
      {
        "id": "sermao_estrutura_mental",
        "title": "Estrutura mental"
      },
      {
        "id": "sermao_memorabilidade",
        "title": "Memorabilidade"
      },
      {
        "id": "sermao_frases_chave",
        "title": "Frases-chave"
      },
      {
        "id": "sermao_fluxo_mental",
        "title": "Fluxo mental"
      }
    ]
  },
  {
    "slug": "sermao_pronuntiatio",
    "title": "Sermão · Entrega",
    "shortTitle": "Execução da pregação",
    "phase": "comunicar",
    "communicationMode": "sermao",
    "module": "pronuntiatio",
    "group": "sermao_pronuntiatio",
    "groupLabel": "Entrega · Pronuntiatio",
    "order": 104,
    "cards": [
      {
        "id": "sermao_entonacao",
        "title": "Entonação"
      },
      {
        "id": "sermao_ritmo",
        "title": "Ritmo"
      },
      {
        "id": "sermao_pausas",
        "title": "Pausas"
      },
      {
        "id": "sermao_gestos",
        "title": "Gestos"
      },
      {
        "id": "sermao_comunicacao_pastoral",
        "title": "Comunicação pastoral"
      },
      {
        "id": "sermao_intensidade",
        "title": "Intensidade"
      },
      {
        "id": "sermao_enfase_vocal",
        "title": "Ênfase vocal"
      }
    ]
  },
  {
    "slug": "sermao_avaliacao",
    "title": "Sermão · Avaliação",
    "shortTitle": "Pós-sermão",
    "phase": "comunicar",
    "communicationMode": "sermao",
    "module": "pronuntiatio",
    "group": "sermao_avaliacao",
    "groupLabel": "Avaliação",
    "order": 105,
    "cards": [
      {
        "id": "sermao_fidelidade_biblica",
        "title": "Fidelidade bíblica"
      },
      {
        "id": "sermao_avaliacao_clareza",
        "title": "Clareza"
      },
      {
        "id": "sermao_avaliacao_aplicacao",
        "title": "Aplicação"
      },
      {
        "id": "sermao_tempo",
        "title": "Tempo"
      },
      {
        "id": "sermao_feedback",
        "title": "Feedback"
      },
      {
        "id": "sermao_melhorias_futuras",
        "title": "Melhorias futuras"
      }
    ]
  },
  {
    "slug": "estudo_inventio",
    "title": "Estudo Bíblico · Invenção",
    "shortTitle": "Objetivo didático",
    "phase": "comunicar",
    "communicationMode": "estudo_biblico",
    "module": "inventio",
    "group": "estudo_inventio",
    "groupLabel": "Invenção · Inventio",
    "order": 120,
    "cards": [
      {
        "id": "estudo_objetivo",
        "title": "Objetivo do Estudo"
      },
      {
        "id": "estudo_tema",
        "title": "Tema"
      },
      {
        "id": "estudo_problema_central",
        "title": "Problema central"
      },
      {
        "id": "estudo_contexto_necessario",
        "title": "Contexto necessário"
      },
      {
        "id": "estudo_conhecimentos_previos",
        "title": "Conhecimentos prévios"
      }
    ]
  },
  {
    "slug": "estudo_dispositio",
    "title": "Estudo Bíblico · Disposição",
    "shortTitle": "Estrutura pedagógica",
    "phase": "comunicar",
    "communicationMode": "estudo_biblico",
    "module": "dispositio",
    "group": "estudo_dispositio",
    "groupLabel": "Disposição · Dispositio",
    "order": 121,
    "cards": [
      {
        "id": "estudo_estrutura_pedagogica",
        "title": "Estrutura pedagógica"
      },
      {
        "id": "estudo_sequencia_topicos",
        "title": "Sequência de tópicos"
      },
      {
        "id": "estudo_organizacao_didatica",
        "title": "Organização didática"
      },
      {
        "id": "estudo_perguntas",
        "title": "Perguntas"
      },
      {
        "id": "estudo_progressao_ensino",
        "title": "Progressão do ensino"
      },
      {
        "id": "estudo_exercicios",
        "title": "Exercícios"
      },
      {
        "id": "estudo_participacao",
        "title": "Participação"
      }
    ]
  },
  {
    "slug": "estudo_elocutio",
    "title": "Estudo Bíblico · Elocução",
    "shortTitle": "Clareza didática",
    "phase": "comunicar",
    "communicationMode": "estudo_biblico",
    "module": "elocutio",
    "group": "estudo_elocutio",
    "groupLabel": "Elocução · Elocutio",
    "order": 122,
    "cards": [
      {
        "id": "estudo_clareza_didatica",
        "title": "Clareza didática"
      },
      {
        "id": "estudo_exemplos",
        "title": "Exemplos"
      },
      {
        "id": "estudo_analogias",
        "title": "Analogias"
      },
      {
        "id": "estudo_simplificacao",
        "title": "Simplificação"
      },
      {
        "id": "estudo_linguagem_acessivel",
        "title": "Linguagem acessível"
      },
      {
        "id": "estudo_explicacoes_progressivas",
        "title": "Explicações progressivas"
      }
    ]
  },
  {
    "slug": "estudo_memoria",
    "title": "Estudo Bíblico · Memória",
    "shortTitle": "Fixação",
    "phase": "comunicar",
    "communicationMode": "estudo_biblico",
    "module": "memoria",
    "group": "estudo_memoria",
    "groupLabel": "Memória · Memoria",
    "order": 123,
    "cards": [
      {
        "id": "estudo_revisao",
        "title": "Revisão"
      },
      {
        "id": "estudo_sintese",
        "title": "Síntese"
      },
      {
        "id": "estudo_pontos_chave",
        "title": "Pontos-chave"
      },
      {
        "id": "estudo_fixacao",
        "title": "Fixação"
      },
      {
        "id": "estudo_repeticao_pedagogica",
        "title": "Repetição pedagógica"
      }
    ]
  },
  {
    "slug": "estudo_pronuntiatio",
    "title": "Estudo Bíblico · Entrega",
    "shortTitle": "Condução do grupo",
    "phase": "comunicar",
    "communicationMode": "estudo_biblico",
    "module": "pronuntiatio",
    "group": "estudo_pronuntiatio",
    "groupLabel": "Entrega · Pronuntiatio",
    "order": 124,
    "cards": [
      {
        "id": "estudo_interacao",
        "title": "Interação"
      },
      {
        "id": "estudo_participacao_entrega",
        "title": "Participação"
      },
      {
        "id": "estudo_dinamica",
        "title": "Dinâmica"
      },
      {
        "id": "estudo_ritmo_ensino",
        "title": "Ritmo de ensino"
      },
      {
        "id": "estudo_perguntas_grupo",
        "title": "Perguntas ao grupo"
      }
    ]
  },
  {
    "slug": "devocional_inventio",
    "title": "Devocional · Invenção",
    "shortTitle": "Verdade e consolo",
    "phase": "comunicar",
    "communicationMode": "devocional",
    "module": "inventio",
    "group": "devocional_inventio",
    "groupLabel": "Invenção · Inventio",
    "order": 140,
    "cards": [
      {
        "id": "devocional_verdade_central",
        "title": "Verdade central"
      },
      {
        "id": "devocional_esperanca",
        "title": "Esperança"
      },
      {
        "id": "devocional_consolo",
        "title": "Consolo"
      },
      {
        "id": "devocional_exortacao",
        "title": "Exortação"
      },
      {
        "id": "devocional_chamado_espiritual",
        "title": "Chamado espiritual"
      }
    ]
  },
  {
    "slug": "devocional_dispositio",
    "title": "Devocional · Disposição",
    "shortTitle": "Fluxo meditativo",
    "phase": "comunicar",
    "communicationMode": "devocional",
    "module": "dispositio",
    "group": "devocional_dispositio",
    "groupLabel": "Disposição · Dispositio",
    "order": 141,
    "cards": [
      {
        "id": "devocional_fluxo_meditativo",
        "title": "Fluxo meditativo"
      },
      {
        "id": "devocional_progressao_espiritual",
        "title": "Progressão espiritual"
      },
      {
        "id": "devocional_aplicacao_pessoal",
        "title": "Aplicação pessoal"
      },
      {
        "id": "devocional_jornada_emocional",
        "title": "Jornada emocional"
      }
    ]
  },
  {
    "slug": "devocional_elocutio",
    "title": "Devocional · Elocução",
    "shortTitle": "Linguagem contemplativa",
    "phase": "comunicar",
    "communicationMode": "devocional",
    "module": "elocutio",
    "group": "devocional_elocutio",
    "groupLabel": "Elocução · Elocutio",
    "order": 142,
    "cards": [
      {
        "id": "devocional_linguagem_pastoral",
        "title": "Linguagem pastoral"
      },
      {
        "id": "devocional_sensibilidade",
        "title": "Sensibilidade"
      },
      {
        "id": "devocional_simplicidade",
        "title": "Simplicidade"
      },
      {
        "id": "devocional_beleza_textual",
        "title": "Beleza textual"
      },
      {
        "id": "devocional_tom",
        "title": "Tom devocional"
      }
    ]
  },
  {
    "slug": "devocional_memoria",
    "title": "Devocional · Memória",
    "shortTitle": "Internalização espiritual",
    "phase": "comunicar",
    "communicationMode": "devocional",
    "module": "memoria",
    "group": "devocional_memoria",
    "groupLabel": "Memória · Memoria",
    "order": 143,
    "cards": [
      {
        "id": "devocional_internalizacao",
        "title": "Internalização"
      },
      {
        "id": "devocional_reflexao",
        "title": "Reflexão"
      },
      {
        "id": "devocional_oracao",
        "title": "Oração"
      },
      {
        "id": "devocional_meditacao",
        "title": "Meditação"
      }
    ]
  },
  {
    "slug": "devocional_pronuntiatio",
    "title": "Devocional · Entrega",
    "shortTitle": "Leitura contemplativa",
    "phase": "comunicar",
    "communicationMode": "devocional",
    "module": "pronuntiatio",
    "group": "devocional_pronuntiatio",
    "groupLabel": "Entrega · Pronuntiatio",
    "order": 144,
    "cards": [
      {
        "id": "devocional_leitura",
        "title": "Leitura"
      },
      {
        "id": "devocional_pausas",
        "title": "Pausas"
      },
      {
        "id": "devocional_meditacao_guiada",
        "title": "Meditação guiada"
      },
      {
        "id": "devocional_ritmo_contemplativo",
        "title": "Ritmo contemplativo"
      }
    ]
  },
  {
    "slug": "eb_preparacao",
    "title": "I.1 Preparação",
    "shortTitle": "Preparação",
    "phase": "preparar",
    "module": "inventio",
    "group": "eb_preparar",
    "groupLabel": "I. Preparar",
    "order": 100,
    "cards": [
      {
        "id": "oracao",
        "title": "Oração"
      },
      {
        "id": "publico_alvo",
        "title": "Público-alvo"
      },
      {
        "id": "faixa_etaria",
        "title": "Faixa etária"
      },
      {
        "id": "tempo_disponivel",
        "title": "Tempo disponível"
      }
    ]
  },
  {
    "slug": "eb_objetivos",
    "title": "I.2 Objetivos",
    "shortTitle": "Objetivos",
    "phase": "preparar",
    "module": "inventio",
    "group": "eb_preparar",
    "groupLabel": "I. Preparar",
    "order": 101,
    "cards": [
      {
        "id": "objetivos_aula",
        "title": "Objetivos da aula"
      },
      {
        "id": "resultados_esperados",
        "title": "Resultados esperados"
      }
    ]
  },
  {
    "slug": "eb_texto_base",
    "title": "II.1 Texto-Base",
    "shortTitle": "Texto-Base",
    "phase": "preparar",
    "module": "inventio",
    "group": "eb_compreender",
    "groupLabel": "II. Compreender",
    "order": 102,
    "cards": [
      {
        "id": "leitura_texto",
        "title": "Leitura do texto"
      },
      {
        "id": "estrutura",
        "title": "Estrutura"
      },
      {
        "id": "personagens",
        "title": "Personagens"
      },
      {
        "id": "lugares",
        "title": "Lugares"
      }
    ]
  },
  {
    "slug": "eb_temas_termos",
    "title": "II.2 Temas e Termos",
    "shortTitle": "Temas e Termos",
    "phase": "preparar",
    "module": "inventio",
    "group": "eb_compreender",
    "groupLabel": "II. Compreender",
    "order": 103,
    "cards": [
      {
        "id": "temas_principais",
        "title": "Temas principais"
      },
      {
        "id": "termos_chave",
        "title": "Termos-chave"
      },
      {
        "id": "grande_ideia",
        "title": "Grande Ideia"
      }
    ]
  },
  {
    "slug": "eb_introducao",
    "title": "III.1 Introdução",
    "shortTitle": "Introdução",
    "phase": "comunicar",
    "module": "dispositio",
    "group": "eb_ensinar",
    "groupLabel": "III. Ensinar",
    "order": 104,
    "cards": [
      {
        "id": "gancho",
        "title": "Gancho"
      },
      {
        "id": "quebra_gelo",
        "title": "Quebra-gelo"
      },
      {
        "id": "conexao_vida",
        "title": "Conexão com a vida"
      }
    ]
  },
  {
    "slug": "eb_desenvolvimento",
    "title": "III.2 Desenvolvimento",
    "shortTitle": "Desenvolvimento",
    "phase": "comunicar",
    "module": "dispositio",
    "group": "eb_ensinar",
    "groupLabel": "III. Ensinar",
    "order": 105,
    "cards": [
      {
        "id": "ponto_1",
        "title": "Ponto 1"
      },
      {
        "id": "ponto_2",
        "title": "Ponto 2"
      },
      {
        "id": "ponto_3",
        "title": "Ponto 3"
      },
      {
        "id": "transicoes",
        "title": "Transições"
      }
    ]
  },
  {
    "slug": "eb_perguntas",
    "title": "III.3 Perguntas",
    "shortTitle": "Perguntas",
    "phase": "comunicar",
    "module": "dispositio",
    "group": "eb_ensinar",
    "groupLabel": "III. Ensinar",
    "order": 106,
    "cards": [
      {
        "id": "perguntas_observacao",
        "title": "Perguntas de observação"
      },
      {
        "id": "perguntas_interpretacao",
        "title": "Perguntas de interpretação"
      },
      {
        "id": "perguntas_aplicacao",
        "title": "Perguntas de aplicação"
      }
    ]
  },
  {
    "slug": "eb_dinamicas",
    "title": "III.4 Dinâmicas",
    "shortTitle": "Dinâmicas",
    "phase": "comunicar",
    "module": "dispositio",
    "group": "eb_ensinar",
    "groupLabel": "III. Ensinar",
    "order": 107,
    "cards": [
      {
        "id": "exercicios",
        "title": "Exercícios"
      },
      {
        "id": "discussao_grupo",
        "title": "Discussão em grupo"
      },
      {
        "id": "sintese",
        "title": "Síntese"
      }
    ]
  },
  {
    "slug": "eb_aplicacoes",
    "title": "IV. Aplicações",
    "shortTitle": "Aplicações",
    "phase": "comunicar",
    "module": "elocutio",
    "group": "eb_aplicar",
    "groupLabel": "IV. Aplicar",
    "order": 108,
    "cards": [
      {
        "id": "aplicacoes_individuais",
        "title": "Aplicações individuais"
      },
      {
        "id": "aplicacoes_familiares",
        "title": "Aplicações familiares"
      },
      {
        "id": "aplicacoes_eclesiasticas",
        "title": "Aplicações eclesiásticas"
      },
      {
        "id": "aplicacoes_missionais",
        "title": "Aplicações missionais"
      }
    ]
  },
  {
    "slug": "eb_material",
    "title": "V. Material",
    "shortTitle": "Material",
    "phase": "comunicar",
    "module": "memoria",
    "group": "eb_recursos",
    "groupLabel": "V. Recursos",
    "order": 109,
    "cards": [
      {
        "id": "material_professor",
        "title": "Material do professor"
      },
      {
        "id": "material_aluno",
        "title": "Material do aluno"
      },
      {
        "id": "slides_handout",
        "title": "Slides / Handout"
      }
    ]
  },
  {
    "slug": "aula_preparar",
    "title": "I. Preparar",
    "shortTitle": "I. Preparar",
    "phase": "preparar",
    "module": "inventio",
    "group": "aula_preparar_grp",
    "groupLabel": "I. Preparar",
    "order": 900,
    "cards": [
      {
        "id": "objetivo_aula",
        "title": "Objetivo da aula"
      },
      {
        "id": "publico_alvo",
        "title": "Público-alvo"
      },
      {
        "id": "tempo_disponivel",
        "title": "Tempo disponível"
      },
      {
        "id": "conhecimento_previo",
        "title": "Conhecimento prévio dos alunos"
      },
      {
        "id": "texto_tema_base",
        "title": "Texto ou tema base"
      }
    ]
  },
  {
    "slug": "aula_compreender",
    "title": "II. Compreender",
    "shortTitle": "II. Compreender",
    "phase": "interpretar",
    "module": "inventio",
    "group": "aula_compreender_grp",
    "groupLabel": "II. Compreender",
    "order": 901,
    "cards": [
      {
        "id": "conteudo_central",
        "title": "Conteúdo central"
      },
      {
        "id": "conceitos_principais",
        "title": "Conceitos principais"
      },
      {
        "id": "pontos_dificuldade",
        "title": "Pontos de dificuldade"
      },
      {
        "id": "termos_importantes",
        "title": "Termos importantes"
      },
      {
        "id": "relacao_escritura",
        "title": "Relação com a Escritura"
      }
    ]
  },
  {
    "slug": "aula_ensinar",
    "title": "III. Ensinar",
    "shortTitle": "III. Ensinar",
    "phase": "comunicar",
    "module": "dispositio",
    "group": "aula_ensinar_grp",
    "groupLabel": "III. Ensinar",
    "order": 902,
    "cards": [
      {
        "id": "introducao_didatica",
        "title": "Introdução didática"
      },
      {
        "id": "desenvolvimento_aula",
        "title": "Desenvolvimento da aula"
      },
      {
        "id": "explicacoes_principais",
        "title": "Explicações principais"
      },
      {
        "id": "perguntas_interacao",
        "title": "Perguntas para interação"
      },
      {
        "id": "dinamicas_atividades",
        "title": "Dinâmicas ou atividades"
      },
      {
        "id": "aplicacoes_pedagogicas",
        "title": "Aplicações pedagógicas"
      }
    ]
  },
  {
    "slug": "aula_material",
    "title": "IV. Material",
    "shortTitle": "IV. Material",
    "phase": "comunicar",
    "module": "memoria",
    "group": "aula_material_grp",
    "groupLabel": "IV. Material",
    "order": 903,
    "cards": [
      {
        "id": "roteiro_professor",
        "title": "Roteiro do professor"
      },
      {
        "id": "material_aluno",
        "title": "Material do aluno"
      },
      {
        "id": "slides_handout",
        "title": "Slides ou handout"
      },
      {
        "id": "tarefa_complementar",
        "title": "Tarefa ou atividade complementar"
      }
    ]
  },
  {
    "slug": "artigo_planejar",
    "title": "I. Planejar",
    "shortTitle": "I. Planejar",
    "phase": "preparar",
    "module": "inventio",
    "group": "artigo_planejar_grp",
    "groupLabel": "I. Planejar",
    "order": 930,
    "cards": [
      {
        "id": "tema",
        "title": "Tema"
      },
      {
        "id": "problema",
        "title": "Problema"
      },
      {
        "id": "tese",
        "title": "Tese"
      },
      {
        "id": "publico_alvo",
        "title": "Público-alvo"
      },
      {
        "id": "objetivo_artigo",
        "title": "Objetivo do artigo"
      }
    ]
  },
  {
    "slug": "artigo_pesquisar",
    "title": "II. Pesquisar",
    "shortTitle": "II. Pesquisar",
    "phase": "interpretar",
    "module": "inventio",
    "group": "artigo_pesquisar_grp",
    "groupLabel": "II. Pesquisar",
    "order": 931,
    "cards": [
      {
        "id": "fontes_biblicas",
        "title": "Fontes bíblicas"
      },
      {
        "id": "fontes_teologicas",
        "title": "Fontes teológicas"
      },
      {
        "id": "fontes_historicas",
        "title": "Fontes históricas"
      },
      {
        "id": "citacoes_importantes",
        "title": "Citações importantes"
      },
      {
        "id": "objecoes_relevantes",
        "title": "Objeções relevantes"
      }
    ]
  },
  {
    "slug": "artigo_argumentar",
    "title": "III. Argumentar",
    "shortTitle": "III. Argumentar",
    "phase": "comunicar",
    "module": "dispositio",
    "group": "artigo_argumentar_grp",
    "groupLabel": "III. Argumentar",
    "order": 932,
    "cards": [
      {
        "id": "introducao",
        "title": "Introdução"
      },
      {
        "id": "desenvolvimento_tese",
        "title": "Desenvolvimento da tese"
      },
      {
        "id": "argumento_1",
        "title": "Argumento 1"
      },
      {
        "id": "argumento_2",
        "title": "Argumento 2"
      },
      {
        "id": "argumento_3",
        "title": "Argumento 3"
      },
      {
        "id": "contra_argumentos",
        "title": "Contra-argumentos"
      },
      {
        "id": "resposta_contra_argumentos",
        "title": "Resposta aos contra-argumentos"
      }
    ]
  },
  {
    "slug": "artigo_redigir",
    "title": "IV. Redigir",
    "shortTitle": "IV. Redigir",
    "phase": "comunicar",
    "module": "elocutio",
    "group": "artigo_redigir_grp",
    "groupLabel": "IV. Redigir",
    "order": 933,
    "cards": [
      {
        "id": "titulo",
        "title": "Título"
      },
      {
        "id": "subtitulo",
        "title": "Subtítulo"
      },
      {
        "id": "introducao_final",
        "title": "Introdução final"
      },
      {
        "id": "corpo_artigo",
        "title": "Corpo do artigo"
      },
      {
        "id": "conclusao",
        "title": "Conclusão"
      },
      {
        "id": "chamada_final",
        "title": "Chamada final"
      }
    ]
  },
  {
    "slug": "artigo_revisar",
    "title": "V. Revisar",
    "shortTitle": "V. Revisar",
    "phase": "comunicar",
    "module": "pronuntiatio",
    "group": "artigo_revisar_grp",
    "groupLabel": "V. Revisar",
    "order": 934,
    "cards": [
      {
        "id": "clareza",
        "title": "Clareza"
      },
      {
        "id": "coerencia",
        "title": "Coerência"
      },
      {
        "id": "fidelidade_biblica",
        "title": "Fidelidade bíblica"
      },
      {
        "id": "forca_argumentativa",
        "title": "Força argumentativa"
      },
      {
        "id": "tom",
        "title": "Tom pastoral ou acadêmico"
      }
    ]
  },
  {
    "slug": "ebook_conceber",
    "title": "I. Conceber",
    "shortTitle": "I. Conceber",
    "phase": "preparar",
    "module": "inventio",
    "group": "ebook_conceber_grp",
    "groupLabel": "I. Conceber",
    "order": 970,
    "cards": [
      {
        "id": "tema",
        "title": "Tema do e-book"
      },
      {
        "id": "publico_alvo",
        "title": "Público-alvo"
      },
      {
        "id": "promessa_central",
        "title": "Promessa central"
      },
      {
        "id": "objetivo_material",
        "title": "Objetivo do material"
      },
      {
        "id": "problema_resolvido",
        "title": "Problema que o e-book resolve"
      }
    ]
  },
  {
    "slug": "ebook_estruturar",
    "title": "II. Estruturar",
    "shortTitle": "II. Estruturar",
    "phase": "interpretar",
    "module": "dispositio",
    "group": "ebook_estruturar_grp",
    "groupLabel": "II. Estruturar",
    "order": 971,
    "cards": [
      {
        "id": "titulo",
        "title": "Título"
      },
      {
        "id": "subtitulo",
        "title": "Subtítulo"
      },
      {
        "id": "sumario",
        "title": "Sumário"
      },
      {
        "id": "capitulos",
        "title": "Capítulos"
      },
      {
        "id": "progressao_logica",
        "title": "Progressão lógica"
      },
      {
        "id": "conclusao",
        "title": "Conclusão"
      }
    ]
  },
  {
    "slug": "ebook_escrever",
    "title": "III. Escrever",
    "shortTitle": "III. Escrever",
    "phase": "comunicar",
    "module": "elocutio",
    "group": "ebook_escrever_grp",
    "groupLabel": "III. Escrever",
    "order": 972,
    "cards": [
      {
        "id": "introducao",
        "title": "Introdução"
      },
      {
        "id": "capitulo_1",
        "title": "Capítulo 1"
      },
      {
        "id": "capitulo_2",
        "title": "Capítulo 2"
      },
      {
        "id": "capitulo_3",
        "title": "Capítulo 3"
      },
      {
        "id": "capitulos_adicionais",
        "title": "Capítulos adicionais"
      },
      {
        "id": "conclusao",
        "title": "Conclusão"
      },
      {
        "id": "chamadas_praticas",
        "title": "Chamadas práticas"
      }
    ]
  },
  {
    "slug": "ebook_enriquecer",
    "title": "IV. Enriquecer",
    "shortTitle": "IV. Enriquecer",
    "phase": "comunicar",
    "module": "memoria",
    "group": "ebook_enriquecer_grp",
    "groupLabel": "IV. Enriquecer",
    "order": 973,
    "cards": [
      {
        "id": "citacoes",
        "title": "Citações"
      },
      {
        "id": "quadros_explicativos",
        "title": "Quadros explicativos"
      },
      {
        "id": "perguntas_reflexao",
        "title": "Perguntas de reflexão"
      },
      {
        "id": "exercicios",
        "title": "Exercícios"
      },
      {
        "id": "recursos_extras",
        "title": "Recursos extras"
      }
    ]
  },
  {
    "slug": "ebook_publicar",
    "title": "V. Publicar",
    "shortTitle": "V. Publicar",
    "phase": "comunicar",
    "module": "pronuntiatio",
    "group": "ebook_publicar_grp",
    "groupLabel": "V. Publicar",
    "order": 974,
    "cards": [
      {
        "id": "texto_apresentacao",
        "title": "Texto de apresentação"
      },
      {
        "id": "descricao_comercial",
        "title": "Descrição comercial"
      },
      {
        "id": "capa",
        "title": "Capa"
      },
      {
        "id": "formato_exportacao",
        "title": "Formato de exportação"
      },
      {
        "id": "versao_final",
        "title": "Versão final"
      }
    ]
  },
  {
    "slug": "livro_conceito",
    "title": "I. Conceito",
    "shortTitle": "I. Conceito",
    "phase": "preparar",
    "module": "inventio",
    "group": "livro_conceito_grp",
    "groupLabel": "I. Conceito",
    "order": 1020,
    "cards": [
      {
        "id": "tema_central",
        "title": "Tema central"
      },
      {
        "id": "problema_principal",
        "title": "Problema principal"
      },
      {
        "id": "tese_livro",
        "title": "Tese do livro"
      },
      {
        "id": "publico_alvo",
        "title": "Público-alvo"
      },
      {
        "id": "justificativa_obra",
        "title": "Justificativa da obra"
      },
      {
        "id": "contribuicao_especifica",
        "title": "Contribuição específica"
      }
    ]
  },
  {
    "slug": "livro_arquitetura",
    "title": "II. Arquitetura",
    "shortTitle": "II. Arquitetura",
    "phase": "interpretar",
    "module": "dispositio",
    "group": "livro_arquitetura_grp",
    "groupLabel": "II. Arquitetura",
    "order": 1021,
    "cards": [
      {
        "id": "titulo",
        "title": "Título"
      },
      {
        "id": "subtitulo",
        "title": "Subtítulo"
      },
      {
        "id": "sumario_macro",
        "title": "Sumário macro"
      },
      {
        "id": "partes_livro",
        "title": "Partes do livro"
      },
      {
        "id": "capitulos",
        "title": "Capítulos"
      },
      {
        "id": "progressao_argumentativa",
        "title": "Progressão argumentativa"
      },
      {
        "id": "conclusao_geral",
        "title": "Conclusão geral"
      }
    ]
  },
  {
    "slug": "livro_desenvolvimento",
    "title": "III. Desenvolvimento",
    "shortTitle": "III. Desenvolvimento",
    "phase": "comunicar",
    "module": "elocutio",
    "group": "livro_desenvolvimento_grp",
    "groupLabel": "III. Desenvolvimento",
    "order": 1022,
    "cards": [
      {
        "id": "introducao_geral",
        "title": "Introdução geral"
      },
      {
        "id": "parte_1",
        "title": "Parte 1"
      },
      {
        "id": "parte_2",
        "title": "Parte 2"
      },
      {
        "id": "parte_3",
        "title": "Parte 3"
      },
      {
        "id": "capitulos",
        "title": "Capítulos"
      },
      {
        "id": "transicoes_capitulos",
        "title": "Transições entre capítulos"
      },
      {
        "id": "conclusoes_parciais",
        "title": "Conclusões parciais"
      }
    ]
  },
  {
    "slug": "livro_pesquisa",
    "title": "IV. Pesquisa",
    "shortTitle": "IV. Pesquisa",
    "phase": "comunicar",
    "module": "memoria",
    "group": "livro_pesquisa_grp",
    "groupLabel": "IV. Pesquisa",
    "order": 1023,
    "cards": [
      {
        "id": "referencias_biblicas",
        "title": "Referências bíblicas"
      },
      {
        "id": "referencias_teologicas",
        "title": "Referências teológicas"
      },
      {
        "id": "referencias_historicas",
        "title": "Referências históricas"
      },
      {
        "id": "autores_fundamentais",
        "title": "Autores fundamentais"
      },
      {
        "id": "citacoes",
        "title": "Citações"
      },
      {
        "id": "notas",
        "title": "Notas"
      }
    ]
  },
  {
    "slug": "livro_revisao",
    "title": "V. Revisão",
    "shortTitle": "V. Revisão",
    "phase": "comunicar",
    "module": "pronuntiatio",
    "group": "livro_revisao_grp",
    "groupLabel": "V. Revisão",
    "order": 1024,
    "cards": [
      {
        "id": "coerencia_tese",
        "title": "Coerência da tese"
      },
      {
        "id": "clareza_capitulos",
        "title": "Clareza dos capítulos"
      },
      {
        "id": "unidade_argumento",
        "title": "Unidade do argumento"
      },
      {
        "id": "estilo",
        "title": "Estilo"
      },
      {
        "id": "revisao_teologica",
        "title": "Revisão teológica"
      },
      {
        "id": "revisao_final",
        "title": "Revisão final"
      }
    ]
  },
  {
    "slug": "livro_publicacao",
    "title": "VI. Publicação",
    "shortTitle": "VI. Publicação",
    "phase": "comunicar",
    "module": "pronuntiatio",
    "group": "livro_publicacao_grp",
    "groupLabel": "VI. Publicação",
    "order": 1025,
    "cards": [
      {
        "id": "sinopse",
        "title": "Sinopse"
      },
      {
        "id": "contracapa",
        "title": "Texto de contracapa"
      },
      {
        "id": "apresentacao",
        "title": "Apresentação"
      },
      {
        "id": "prefacio",
        "title": "Prefácio"
      },
      {
        "id": "capa",
        "title": "Capa"
      },
      {
        "id": "exportacao",
        "title": "Exportação"
      }
    ]
  },
  {
    "slug": "palestra_preparar",
    "title": "I. Preparar",
    "shortTitle": "I. Preparar",
    "phase": "preparar",
    "module": "inventio",
    "group": "palestra_preparar_grp",
    "groupLabel": "I. Preparar",
    "order": 1080,
    "cards": [
      {
        "id": "evento_contexto",
        "title": "Evento e contexto"
      },
      {
        "id": "publico_alvo",
        "title": "Público-alvo"
      },
      {
        "id": "tempo_disponivel",
        "title": "Tempo disponível"
      },
      {
        "id": "objetivo_palestra",
        "title": "Objetivo da palestra"
      },
      {
        "id": "tese_central",
        "title": "Tese central"
      }
    ]
  },
  {
    "slug": "palestra_construir",
    "title": "II. Construir",
    "shortTitle": "II. Construir",
    "phase": "interpretar",
    "module": "dispositio",
    "group": "palestra_construir_grp",
    "groupLabel": "II. Construir",
    "order": 1081,
    "cards": [
      {
        "id": "abertura",
        "title": "Abertura"
      },
      {
        "id": "ponto_1",
        "title": "Ponto 1"
      },
      {
        "id": "ponto_2",
        "title": "Ponto 2"
      },
      {
        "id": "ponto_3",
        "title": "Ponto 3"
      },
      {
        "id": "transicoes",
        "title": "Transições"
      },
      {
        "id": "fechamento",
        "title": "Fechamento"
      }
    ]
  },
  {
    "slug": "palestra_comunicar",
    "title": "III. Comunicar",
    "shortTitle": "III. Comunicar",
    "phase": "comunicar",
    "module": "elocutio",
    "group": "palestra_comunicar_grp",
    "groupLabel": "III. Comunicar",
    "order": 1082,
    "cards": [
      {
        "id": "linguagem",
        "title": "Linguagem"
      },
      {
        "id": "historias",
        "title": "Histórias"
      },
      {
        "id": "exemplos",
        "title": "Exemplos"
      },
      {
        "id": "aplicacoes",
        "title": "Aplicações"
      },
      {
        "id": "ritmo_oral",
        "title": "Ritmo oral"
      }
    ]
  },
  {
    "slug": "palestra_apoiar",
    "title": "IV. Apoiar",
    "shortTitle": "IV. Apoiar",
    "phase": "comunicar",
    "module": "memoria",
    "group": "palestra_apoiar_grp",
    "groupLabel": "IV. Apoiar",
    "order": 1083,
    "cards": [
      {
        "id": "slides",
        "title": "Slides"
      },
      {
        "id": "handout",
        "title": "Handout"
      },
      {
        "id": "perguntas",
        "title": "Perguntas"
      },
      {
        "id": "recursos_apoio",
        "title": "Recursos de apoio"
      }
    ]
  },
  {
    "slug": "palestra_ensaiar",
    "title": "V. Ensaiar",
    "shortTitle": "V. Ensaiar",
    "phase": "comunicar",
    "module": "pronuntiatio",
    "group": "palestra_ensaiar_grp",
    "groupLabel": "V. Ensaiar",
    "order": 1084,
    "cards": [
      {
        "id": "controle_tempo",
        "title": "Controle de tempo"
      },
      {
        "id": "enfases",
        "title": "Ênfases"
      },
      {
        "id": "conclusao_oral",
        "title": "Conclusão oral"
      },
      {
        "id": "pontos_memoria",
        "title": "Pontos de memória"
      }
    ]
  },
  {
    "slug": "curso_planejar",
    "title": "I. Planejar",
    "shortTitle": "I. Planejar",
    "phase": "preparar",
    "module": "inventio",
    "group": "curso_planejar_grp",
    "groupLabel": "I. Planejar",
    "order": 1130,
    "cards": [
      {
        "id": "publico_alvo",
        "title": "Público-alvo"
      },
      {
        "id": "objetivos_aprendizagem",
        "title": "Objetivos de aprendizagem"
      },
      {
        "id": "carga_horaria",
        "title": "Carga horária"
      },
      {
        "id": "pre_requisitos",
        "title": "Pré-requisitos"
      },
      {
        "id": "resultados_esperados",
        "title": "Resultados esperados"
      }
    ]
  },
  {
    "slug": "curso_estruturar",
    "title": "II. Estruturar",
    "shortTitle": "II. Estruturar",
    "phase": "interpretar",
    "module": "dispositio",
    "group": "curso_estruturar_grp",
    "groupLabel": "II. Estruturar",
    "order": 1131,
    "cards": [
      {
        "id": "modulos",
        "title": "Módulos"
      },
      {
        "id": "aulas",
        "title": "Aulas"
      },
      {
        "id": "trilha_aprendizagem",
        "title": "Trilha de aprendizagem"
      },
      {
        "id": "avaliacoes",
        "title": "Avaliações"
      },
      {
        "id": "progressao_didatica",
        "title": "Progressão didática"
      }
    ]
  },
  {
    "slug": "curso_produzir_aulas",
    "title": "III. Produzir Aulas",
    "shortTitle": "III. Produzir Aulas",
    "phase": "comunicar",
    "module": "elocutio",
    "group": "curso_produzir_aulas_grp",
    "groupLabel": "III. Produzir Aulas",
    "order": 1132,
    "cards": [
      {
        "id": "roteiros_aulas",
        "title": "Roteiros das aulas"
      },
      {
        "id": "conteudos_centrais",
        "title": "Conteúdos centrais"
      },
      {
        "id": "exemplos",
        "title": "Exemplos"
      },
      {
        "id": "atividades",
        "title": "Atividades"
      },
      {
        "id": "aplicacao_aula",
        "title": "Aplicação de cada aula"
      }
    ]
  },
  {
    "slug": "curso_materiais",
    "title": "IV. Materiais",
    "shortTitle": "IV. Materiais",
    "phase": "comunicar",
    "module": "memoria",
    "group": "curso_materiais_grp",
    "groupLabel": "IV. Materiais",
    "order": 1133,
    "cards": [
      {
        "id": "apostila",
        "title": "Apostila"
      },
      {
        "id": "slides",
        "title": "Slides"
      },
      {
        "id": "leituras",
        "title": "Leituras"
      },
      {
        "id": "exercicios",
        "title": "Exercícios"
      },
      {
        "id": "recursos_complementares",
        "title": "Recursos complementares"
      }
    ]
  },
  {
    "slug": "curso_publicar",
    "title": "V. Publicar",
    "shortTitle": "V. Publicar",
    "phase": "comunicar",
    "module": "pronuntiatio",
    "group": "curso_publicar_grp",
    "groupLabel": "V. Publicar",
    "order": 1134,
    "cards": [
      {
        "id": "descricao_curso",
        "title": "Descrição do curso"
      },
      {
        "id": "ementa",
        "title": "Ementa"
      },
      {
        "id": "certificado",
        "title": "Certificado"
      },
      {
        "id": "divulgacao",
        "title": "Divulgação"
      },
      {
        "id": "versao_final",
        "title": "Versão final"
      }
    ]
  },
  {
    "slug": "serie_conceber",
    "title": "I. Conceber",
    "shortTitle": "I. Conceber",
    "phase": "preparar",
    "module": "inventio",
    "group": "serie_conceber_grp",
    "groupLabel": "I. Conceber",
    "order": 1180,
    "cards": [
      {
        "id": "tema_serie",
        "title": "Tema da série"
      },
      {
        "id": "necessidade_pastoral",
        "title": "Necessidade pastoral"
      },
      {
        "id": "publico_alvo",
        "title": "Público-alvo"
      },
      {
        "id": "objetivo_serie",
        "title": "Objetivo da série"
      },
      {
        "id": "texto_eixo_biblico",
        "title": "Texto ou eixo bíblico"
      }
    ]
  },
  {
    "slug": "serie_planejar",
    "title": "II. Planejar",
    "shortTitle": "II. Planejar",
    "phase": "interpretar",
    "module": "dispositio",
    "group": "serie_planejar_grp",
    "groupLabel": "II. Planejar",
    "order": 1181,
    "cards": [
      {
        "id": "duracao",
        "title": "Duração"
      },
      {
        "id": "calendario",
        "title": "Calendário"
      },
      {
        "id": "ordem_mensagens",
        "title": "Ordem das mensagens"
      },
      {
        "id": "progressao_serie",
        "title": "Progressão da série"
      },
      {
        "id": "titulos_mensagens",
        "title": "Títulos das mensagens"
      }
    ]
  },
  {
    "slug": "serie_desenvolver",
    "title": "III. Desenvolver",
    "shortTitle": "III. Desenvolver",
    "phase": "comunicar",
    "module": "elocutio",
    "group": "serie_desenvolver_grp",
    "groupLabel": "III. Desenvolver",
    "order": 1182,
    "cards": [
      {
        "id": "resumo_mensagem_1",
        "title": "Resumo da mensagem 1"
      },
      {
        "id": "resumo_mensagem_2",
        "title": "Resumo da mensagem 2"
      },
      {
        "id": "resumos_adicionais",
        "title": "Resumos adicionais"
      },
      {
        "id": "textos_biblicos",
        "title": "Textos bíblicos"
      },
      {
        "id": "grandes_ideias",
        "title": "Grandes ideias"
      },
      {
        "id": "aplicacoes",
        "title": "Aplicações"
      },
      {
        "id": "conexoes_entre_mensagens",
        "title": "Conexões entre mensagens"
      }
    ]
  },
  {
    "slug": "serie_comunicar",
    "title": "IV. Comunicar",
    "shortTitle": "IV. Comunicar",
    "phase": "comunicar",
    "module": "memoria",
    "group": "serie_comunicar_grp",
    "groupLabel": "IV. Comunicar",
    "order": 1183,
    "cards": [
      {
        "id": "identidade_serie",
        "title": "Identidade da série"
      },
      {
        "id": "descricao_publica",
        "title": "Descrição pública"
      },
      {
        "id": "chamadas",
        "title": "Chamadas"
      },
      {
        "id": "materiais_apoio",
        "title": "Materiais de apoio"
      },
      {
        "id": "slides",
        "title": "Slides"
      }
    ]
  },
  {
    "slug": "serie_publicar",
    "title": "V. Publicar",
    "shortTitle": "V. Publicar",
    "phase": "comunicar",
    "module": "pronuntiatio",
    "group": "serie_publicar_grp",
    "groupLabel": "V. Publicar",
    "order": 1184,
    "cards": [
      {
        "id": "pagina_serie",
        "title": "Página da série"
      },
      {
        "id": "descricao_final",
        "title": "Descrição final"
      },
      {
        "id": "calendario_publico",
        "title": "Calendário público"
      },
      {
        "id": "arquivo_serie",
        "title": "Arquivo da série"
      }
    ]
  },
]
