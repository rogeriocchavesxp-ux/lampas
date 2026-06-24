import type { SectionNav } from './workspace-sections-nav-types'

export const NAV_BASE: SectionNav[] = [
  {
    "slug": "preparacao_espiritual",
    "title": "1. Preparação Espiritual",
    "shortTitle": "Preparação Espiritual",
    "phase": "preparar",
    "module": "inventio",
    "group": "preparar_espiritual",
    "groupLabel": "Piedade, planejamento e oração",
    "order": -40,
    "cards": [
      {
        "id": "preparar_oracao",
        "title": "Oração"
      },
      {
        "id": "preparar_objetivo_estudo",
        "title": "Objetivo do estudo"
      },
      {
        "id": "preparar_ocasiiao_publico",
        "title": "Ocasião e público"
      }
    ]
  },
  {
    "slug": "preparar_leia_assimile",
    "title": "2. Leia e Assimile a Ideia do Texto",
    "shortTitle": "Leia e Assimile",
    "phase": "preparar",
    "module": "inventio",
    "group": "preparar_assimilacao",
    "groupLabel": "Contato direto com a Escritura",
    "order": -39,
    "cards": [
      {
        "id": "preparar_leitura_lenta",
        "title": "Leitura"
      },
      {
        "id": "preparar_comparacao_traducoes",
        "title": "Comparação"
      },
      {
        "id": "preparar_ideia_inicial",
        "title": "Ideia Central"
      },
      {
        "id": "preparar_tensoes_repeticoes",
        "title": "Tensões"
      }
    ]
  },
  {
    "slug": "preparar_visao_geral",
    "title": "4. Visão Geral da Passagem",
    "shortTitle": "Visão Geral",
    "phase": "preparar",
    "module": "inventio",
    "group": "preparar_visao_geral",
    "groupLabel": "Assimilação macro",
    "order": -37,
    "cards": [
      {
        "id": "preparar_tema_provavel",
        "title": "Tema provável"
      },
      {
        "id": "preparar_grande_ideia_inicial",
        "title": "Grande ideia inicial"
      },
      {
        "id": "preparar_estrutura_percebida",
        "title": "Estrutura percebida"
      },
      {
        "id": "preparar_vg_perguntas",
        "title": "Perguntas iniciais"
      },
      {
        "id": "preparar_vg_dificuldades",
        "title": "Dificuldades percebidas"
      }
    ]
  },
  {
    "slug": "investigar_visao_geral",
    "title": "Visão Geral Investigativa",
    "shortTitle": "Visão Geral",
    "phase": "interpretar",
    "module": "inventio",
    "group": "investigar_visao_geral",
    "groupLabel": "Descoberta exegética",
    "order": -20,
    "cards": [
      {
        "id": "preparar_grande_ideia_inicial",
        "title": "Grande ideia"
      },
      {
        "id": "preparar_tema_provavel",
        "title": "Tema refinado"
      },
      {
        "id": "investigar_vg_temas_teol",
        "title": "Verdades centrais"
      },
      {
        "id": "investigar_vg_conexoes",
        "title": "Aplicações e conexões"
      }
    ]
  },
  {
    "slug": "ferramentas_visao_geral",
    "title": "Visão Geral das Ferramentas",
    "shortTitle": "Visão Geral",
    "phase": "ferramentas",
    "module": "inventio",
    "group": "ferramentas_visao_geral",
    "groupLabel": "Mapa das ferramentas disponíveis",
    "order": 100
  },
  {
    "slug": "pregar_visao_geral",
    "title": "Visão Geral Homilética",
    "shortTitle": "Visão Geral",
    "phase": "comunicar",
    "module": "inventio",
    "group": "pregar_visao_geral",
    "groupLabel": "Síntese final para comunicação",
    "order": 5,
    "cards": [
      {
        "id": "preparar_tema_provavel",
        "title": "Tema da comunicação"
      },
      {
        "id": "preparar_grande_ideia_inicial",
        "title": "Grande ideia homilética"
      },
      {
        "id": "preparar_estrutura_percebida",
        "title": "Estrutura da comunicação"
      },
      {
        "id": "preparar_personagens",
        "title": "Pontos de identificação"
      },
      {
        "id": "preparar_movimento_narrativo",
        "title": "Movimento da mensagem"
      },
      {
        "id": "preparar_fluxo_argumentativo",
        "title": "Fluxo do argumento"
      },
      {
        "id": "preparar_climax",
        "title": "Clímax da comunicação"
      },
      {
        "id": "preparar_palavras_repetidas",
        "title": "Termos e imagens centrais"
      }
    ]
  },
  {
    "slug": "contexto_historico",
    "title": "1.1 Contexto Histórico",
    "shortTitle": "Contexto Histórico",
    "module": "inventio",
    "group": "contextual",
    "groupLabel": "Estudo Contextual",
    "order": 1,
    "cards": [
      {
        "id": "contexto_historico_geral",
        "title": "Contexto Histórico"
      }
    ]
  },
  {
    "slug": "autor_destinatarios",
    "title": "1.2 Contexto Literário",
    "shortTitle": "Contexto Literário",
    "module": "inventio",
    "group": "contextual",
    "groupLabel": "Estudo Contextual",
    "order": 2,
    "cards": [
      {
        "id": "contexto_literario_geral",
        "title": "Contexto Literário"
      }
    ]
  },
  {
    "slug": "estrutura_livro",
    "title": "1.3 Contexto Canônico",
    "shortTitle": "Contexto Canônico",
    "module": "inventio",
    "group": "contextual",
    "groupLabel": "Estudo Contextual",
    "order": 3,
    "cards": [
      {
        "id": "contexto_canonico_geral",
        "title": "Contexto Canônico"
      }
    ]
  },
  {
    "slug": "ocasiao_proposito",
    "title": "1.3 Ocasião e Propósito",
    "shortTitle": "Ocasião e Propósito",
    "module": "inventio",
    "group": "contextual_legado",
    "groupLabel": "Estudo Contextual",
    "order": 3,
    "cards": [
      {
        "id": "ocasiao",
        "title": "Ocasião"
      },
      {
        "id": "proposito_declarado",
        "title": "Propósito declarado"
      },
      {
        "id": "proposito_implicito",
        "title": "Propósito implícito"
      }
    ]
  },
  {
    "slug": "genero_literario",
    "title": "1.4 Gênero Literário",
    "shortTitle": "Gênero Literário",
    "module": "inventio",
    "group": "contextual_legado",
    "groupLabel": "Estudo Contextual",
    "order": 4,
    "cards": [
      {
        "id": "genero_livro",
        "title": "Gênero do livro"
      },
      {
        "id": "genero_pericope",
        "title": "Gênero da perícope"
      },
      {
        "id": "implicacoes_hermeneuticas",
        "title": "Implicações hermenêuticas"
      }
    ]
  },
  {
    "slug": "texto_original",
    "title": "2.1 Texto Original",
    "shortTitle": "Texto Original",
    "module": "inventio",
    "group": "textual",
    "groupLabel": "Estudo Textual",
    "order": 5.5
  },
  {
    "slug": "defesa_pericope",
    "title": "2.3 Observações Exegéticas",
    "shortTitle": "Observações Exegéticas",
    "module": "inventio",
    "group": "textual",
    "groupLabel": "Estudo Textual",
    "order": 7,
    "cards": [
      {
        "id": "defesa_pericope",
        "title": "Observações Exegéticas"
      }
    ]
  },
  {
    "slug": "traducao_propria",
    "title": "2.3 Tradução Própria",
    "shortTitle": "Tradução Própria",
    "module": "inventio",
    "group": "textual_legado",
    "groupLabel": "Estudo Textual",
    "order": 7,
    "cards": [
      {
        "id": "traducao_propria",
        "title": "Tradução Própria"
      }
    ]
  },
  {
    "slug": "observacoes_gramaticais",
    "title": "2.4 Observações Gramaticais e Sintáticas",
    "shortTitle": "Gram. e Sintaxe",
    "module": "inventio",
    "group": "textual_legado",
    "groupLabel": "Estudo Textual",
    "order": 8,
    "cards": [
      {
        "id": "obs_gramaticais",
        "title": "Observações Gramaticais e Sintáticas"
      }
    ]
  },
  {
    "slug": "esboco_mecanico",
    "title": "2.2 Estrutura do Texto",
    "shortTitle": "Estrutura do Texto",
    "module": "inventio",
    "group": "textual",
    "groupLabel": "Estudo Textual",
    "order": 6,
    "cards": [
      {
        "id": "esboco_mecanico",
        "title": "Estrutura do Texto"
      }
    ]
  },
  {
    "slug": "genero_subgenero_textual",
    "title": "2.6 Definição de Gênero e Subgênero Literário",
    "shortTitle": "Gênero e Subgênero",
    "module": "inventio",
    "group": "textual_legado",
    "groupLabel": "Estudo Textual",
    "order": 9,
    "cards": [
      {
        "id": "genero_subgenero",
        "title": "Definição de Gênero e Subgênero Literário"
      }
    ]
  },
  {
    "slug": "comentario_exegetico",
    "title": "2.4 Comentário Exegético",
    "shortTitle": "Comentário Exegético",
    "module": "inventio",
    "group": "textual",
    "groupLabel": "Estudo Textual",
    "order": 8,
    "cards": [
      {
        "id": "comentario_exegetico",
        "title": "Comentário Exegético"
      }
    ]
  },
  {
    "slug": "mensagem_epoca_escrita",
    "title": "2.5 Mensagem para os Primeiros Ouvintes",
    "shortTitle": "Mensagem aos Primeiros Ouvintes",
    "module": "inventio",
    "group": "textual",
    "groupLabel": "Estudo Textual",
    "order": 9,
    "cards": [
      {
        "id": "mensagem_epoca",
        "title": "Mensagem para a Época da Escrita"
      }
    ]
  },
  {
    "slug": "delimitacao_pericope",
    "title": "2.1 Delimitação da Perícope",
    "shortTitle": "Delimitação",
    "module": "inventio",
    "group": "textual_legado",
    "groupLabel": "Estudo Textual",
    "order": 6,
    "cards": [
      {
        "id": "limites_pericope",
        "title": "Limites da perícope"
      },
      {
        "id": "marcadores_delimitacao",
        "title": "Marcadores de delimitação"
      },
      {
        "id": "conexao_contexto",
        "title": "Conexão com o contexto"
      }
    ]
  },
  {
    "slug": "traducao_textual",
    "title": "2.2 Tradução e Crítica Textual",
    "shortTitle": "Tradução",
    "module": "inventio",
    "group": "textual_legado",
    "groupLabel": "Estudo Textual",
    "order": 7,
    "cards": [
      {
        "id": "minha_traducao",
        "title": "Minha tradução"
      },
      {
        "id": "variantes_textuais",
        "title": "Variantes textuais"
      },
      {
        "id": "comparacao_versoes",
        "title": "Comparação de versões"
      }
    ]
  },
  {
    "slug": "analise_morfossintatica",
    "title": "2.3 Análise Morfossintática",
    "shortTitle": "Morfossintaxe",
    "module": "inventio",
    "group": "textual_legado",
    "groupLabel": "Estudo Textual",
    "order": 8,
    "cards": [
      {
        "id": "verbos_principais",
        "title": "Verbos principais"
      },
      {
        "id": "substantivos_casos",
        "title": "Substantivos e casos"
      },
      {
        "id": "estrutura_sintatica",
        "title": "Estrutura sintática"
      },
      {
        "id": "particulas_conectivos",
        "title": "Partículas e conectivos"
      }
    ]
  },
  {
    "slug": "termos_chave",
    "title": "2.4 Termos-Chave",
    "shortTitle": "Termos-Chave",
    "module": "inventio",
    "group": "textual_legado",
    "groupLabel": "Estudo Textual",
    "order": 9
  },
  {
    "slug": "estrutura_literaria",
    "title": "2.5 Estrutura Literária",
    "shortTitle": "Estrutura Literária",
    "module": "inventio",
    "group": "textual_legado",
    "groupLabel": "Estudo Textual",
    "order": 10,
    "cards": [
      {
        "id": "esboço_narrativo",
        "title": "Esboço narrativo"
      },
      {
        "id": "personagens_narrativos",
        "title": "Personagens"
      },
      {
        "id": "cenario_tempo",
        "title": "Cenário e tempo"
      },
      {
        "id": "enredo_tensao",
        "title": "Enredo e tensão dramática"
      },
      {
        "id": "climax_resolucao",
        "title": "Clímax e resolução"
      },
      {
        "id": "dispositivos_narrativos",
        "title": "Dispositivos literários"
      },
      {
        "id": "tese_argumento",
        "title": "Tese e argumento central"
      },
      {
        "id": "fluxo_argumentativo",
        "title": "Fluxo argumentativo"
      },
      {
        "id": "premissas_conclusoes",
        "title": "Premissas e fundamentação"
      },
      {
        "id": "exortacoes_aplicacao",
        "title": "Exortações e aplicação"
      },
      {
        "id": "dispositivos_retoricos",
        "title": "Dispositivos retóricos"
      },
      {
        "id": "tipo_paralelismo",
        "title": "Paralelismo"
      },
      {
        "id": "estrutura_estrofica",
        "title": "Estrutura estrófica"
      },
      {
        "id": "imagens_metaforas",
        "title": "Imagens e metáforas"
      },
      {
        "id": "quiasmo_inclusio_poetico",
        "title": "Quiasmo e inclusio"
      },
      {
        "id": "campos_semanticos",
        "title": "Campos semânticos"
      },
      {
        "id": "tipo_oraculo",
        "title": "Tipo de oráculo"
      },
      {
        "id": "estrutura_profetica",
        "title": "Estrutura profética"
      },
      {
        "id": "acusacoes_pecados",
        "title": "Acusações e denúncia"
      },
      {
        "id": "promessas_salvacao",
        "title": "Promessas e salvação"
      },
      {
        "id": "cumprimento_progressivo",
        "title": "Cumprimento progressivo"
      },
      {
        "id": "visoes_simbolos",
        "title": "Visões e símbolos"
      },
      {
        "id": "estrutura_ciclos",
        "title": "Estrutura e ciclos"
      },
      {
        "id": "imagens_cosmicas",
        "title": "Imagens cósmicas"
      },
      {
        "id": "escatologia",
        "title": "Dimensão escatológica"
      },
      {
        "id": "forma_sapiencial",
        "title": "Forma sapiencial"
      },
      {
        "id": "paralelos_contraste",
        "title": "Paralelos e contraste"
      },
      {
        "id": "aplicacao_sapiencial",
        "title": "Aplicação prática"
      },
      {
        "id": "base_teologica_sap",
        "title": "Base teológica"
      },
      {
        "id": "tipo_lei",
        "title": "Tipo de lei"
      },
      {
        "id": "contexto_aliancal",
        "title": "Contexto alianção"
      },
      {
        "id": "principio_etico",
        "title": "Princípio ético"
      },
      {
        "id": "hermeneutica_crista",
        "title": "Hermenêutica cristã"
      }
    ]
  },
  {
    "slug": "teologia_biblica",
    "title": "3.1 Relação com a História da Redenção",
    "shortTitle": "História da Redenção",
    "module": "inventio",
    "group": "teologico",
    "groupLabel": "Estudo Teológico",
    "order": 11,
    "cards": [
      {
        "id": "implicacoes_tb",
        "title": "Relação com a História da Redenção"
      }
    ]
  },
  {
    "slug": "teologia_sistematica",
    "title": "3.2 Doutrinas Ensinadas",
    "shortTitle": "Doutrinas Ensinadas",
    "module": "inventio",
    "group": "teologico",
    "groupLabel": "Estudo Teológico",
    "order": 12,
    "cards": [
      {
        "id": "implicacoes_ts",
        "title": "Doutrinas Ensinadas"
      }
    ]
  },
  {
    "slug": "teologia_pratica",
    "title": "3.3 Implicações para a Vida",
    "shortTitle": "Implicações para a Vida",
    "module": "inventio",
    "group": "teologico",
    "groupLabel": "Estudo Teológico",
    "order": 13,
    "cards": [
      {
        "id": "implicacoes_tp",
        "title": "Implicações para a Vida"
      }
    ]
  },
  {
    "slug": "contexto_canonico",
    "title": "3.1 Contexto Canônico",
    "shortTitle": "Contexto Canônico",
    "module": "inventio",
    "group": "teologico_legado",
    "groupLabel": "Estudo Teológico",
    "order": 11,
    "cards": [
      {
        "id": "contexto_intralivro",
        "title": "Contexto intralivro"
      },
      {
        "id": "citacoes_alusoes_at",
        "title": "Citações e alusões ao AT"
      },
      {
        "id": "ecos_nt",
        "title": "Ecos no NT"
      }
    ]
  },
  {
    "slug": "progressao_revelacional",
    "title": "3.2 Progressão Revelacional",
    "shortTitle": "Progressão Revelacional",
    "module": "inventio",
    "group": "teologico_legado",
    "groupLabel": "Estudo Teológico",
    "order": 12,
    "cards": [
      {
        "id": "posicao_historia_redencao",
        "title": "Posição na história da redenção"
      },
      {
        "id": "tipologia",
        "title": "Tipologia"
      },
      {
        "id": "promessa_cumprimento",
        "title": "Promessa e cumprimento"
      }
    ]
  },
  {
    "slug": "sintese",
    "title": "§4 Síntese Exegética",
    "shortTitle": "Síntese",
    "module": "inventio",
    "group": "sintese_exegetica",
    "groupLabel": "Síntese Exegética",
    "order": 13,
    "cards": [
      {
        "id": "grande_ideia",
        "title": "A Grande Ideia"
      },
      {
        "id": "mensagem_texto",
        "title": "Verdades Centrais"
      },
      {
        "id": "conceitos_confronta",
        "title": "Aplicações Principais"
      }
    ]
  },
  {
    "slug": "grande_ideia_homiletica",
    "title": "1. Grande Ideia Homilética",
    "shortTitle": "Grande Ideia",
    "module": "dispositio",
    "group": "proposicao",
    "groupLabel": "Ideia e Proposição",
    "order": 14,
    "cards": [
      {
        "id": "sujeito_homilet",
        "title": "Sujeito do sermão"
      },
      {
        "id": "complemento_homilet",
        "title": "Complemento do sermão"
      },
      {
        "id": "grande_ideia_homilet",
        "title": "Grande Ideia Homilética"
      },
      {
        "id": "proposicao",
        "title": "Proposição do sermão"
      }
    ]
  },
  {
    "slug": "introducao_sermao",
    "title": "2. Introdução",
    "shortTitle": "Introdução",
    "module": "dispositio",
    "group": "estrutura",
    "groupLabel": "Estrutura do Sermão",
    "order": 15,
    "cards": [
      {
        "id": "gancho",
        "title": "Gancho (abertura)"
      },
      {
        "id": "necessidade",
        "title": "Necessidade do ouvinte"
      },
      {
        "id": "assunto_intro",
        "title": "Apresentação do assunto"
      },
      {
        "id": "leitura_texto",
        "title": "Leitura e apresentação do texto"
      }
    ]
  },
  {
    "slug": "divisoes_sermao",
    "title": "3. Divisões do Sermão",
    "shortTitle": "Divisões",
    "module": "dispositio",
    "group": "estrutura",
    "groupLabel": "Estrutura do Sermão",
    "order": 16,
    "cards": [
      {
        "id": "ponto1",
        "title": "Ponto 1"
      },
      {
        "id": "ponto2",
        "title": "Ponto 2"
      },
      {
        "id": "ponto3",
        "title": "Ponto 3 (se houver)"
      },
      {
        "id": "avaliacao_estrutura",
        "title": "Avaliação da estrutura"
      }
    ]
  },
  {
    "slug": "transicoes",
    "title": "4. Transições",
    "shortTitle": "Transições",
    "module": "dispositio",
    "group": "estrutura",
    "groupLabel": "Estrutura do Sermão",
    "order": 17,
    "cards": [
      {
        "id": "transicao_intro_p1",
        "title": "Introdução → Ponto 1"
      },
      {
        "id": "transicao_1_2",
        "title": "Ponto 1 → Ponto 2"
      },
      {
        "id": "transicao_2_3",
        "title": "Ponto 2 → Ponto 3 (se houver)"
      }
    ]
  },
  {
    "slug": "aplicacao",
    "title": "5. Aplicação",
    "shortTitle": "Aplicação",
    "module": "dispositio",
    "group": "encerramento",
    "groupLabel": "Aplicação e Conclusão",
    "order": 18,
    "cards": [
      {
        "id": "aplicacao_crenca",
        "title": "O que crer"
      },
      {
        "id": "aplicacao_pratica",
        "title": "O que fazer"
      },
      {
        "id": "aplicacao_cristologica",
        "title": "Cristo como centro e motivação"
      },
      {
        "id": "ilustracoes",
        "title": "Ilustrações"
      }
    ]
  },
  {
    "slug": "conclusao_sermao",
    "title": "6. Conclusão",
    "shortTitle": "Conclusão",
    "module": "dispositio",
    "group": "encerramento",
    "groupLabel": "Aplicação e Conclusão",
    "order": 19,
    "cards": [
      {
        "id": "sintese_final",
        "title": "Síntese do sermão"
      },
      {
        "id": "apelo",
        "title": "Apelo à resposta"
      },
      {
        "id": "encerramento",
        "title": "Frase de encerramento"
      }
    ]
  },
  {
    "slug": "vocabulario_clareza",
    "title": "1. Vocabulário e Clareza",
    "shortTitle": "Vocabulário",
    "module": "elocutio",
    "group": "vocabulario",
    "groupLabel": "Vocabulário e Clareza",
    "order": 20,
    "cards": [
      {
        "id": "nivel_linguagem",
        "title": "Nível de linguagem"
      },
      {
        "id": "jargao_teologico",
        "title": "Termos técnicos e jargão"
      },
      {
        "id": "clareza_frases",
        "title": "Clareza e concisão"
      }
    ]
  },
  {
    "slug": "figuras_linguagem",
    "title": "2. Imagens e Retórica",
    "shortTitle": "Imagens",
    "module": "elocutio",
    "group": "imagens",
    "groupLabel": "Imagens e Retórica",
    "order": 21,
    "cards": [
      {
        "id": "metaforas_analogias",
        "title": "Metáforas e analogias"
      },
      {
        "id": "imagens_concretas",
        "title": "Imagens do cotidiano"
      },
      {
        "id": "recursos_retoricos",
        "title": "Recursos retóricos"
      }
    ]
  },
  {
    "slug": "tom_pastoral",
    "title": "3. Tom e Voz Pastoral",
    "shortTitle": "Tom",
    "module": "elocutio",
    "group": "tom",
    "groupLabel": "Tom e Voz Pastoral",
    "order": 22,
    "cards": [
      {
        "id": "tom_geral",
        "title": "Tom geral do sermão"
      },
      {
        "id": "variacao_tonal",
        "title": "Variações de tom"
      },
      {
        "id": "voz_pregador",
        "title": "Voz e autoridade pastoral"
      }
    ]
  },
  {
    "slug": "internalizacao_estrutura",
    "title": "1. Internalização da Estrutura",
    "shortTitle": "Estrutura Mental",
    "module": "memoria",
    "group": "memorizacao",
    "groupLabel": "Internalização",
    "order": 23,
    "cards": [
      {
        "id": "esboço_pulpito",
        "title": "Esboço de púlpito"
      },
      {
        "id": "palavras_ancora",
        "title": "Palavras-âncora"
      },
      {
        "id": "logica_fluxo",
        "title": "Lógica e fluxo"
      }
    ]
  },
  {
    "slug": "pratica_revisao",
    "title": "2. Prática e Pré-pregação",
    "shortTitle": "Pré-pregação",
    "module": "memoria",
    "group": "memorizacao",
    "groupLabel": "Internalização",
    "order": 24,
    "cards": [
      {
        "id": "plano_pratica",
        "title": "Plano de prática"
      },
      {
        "id": "pontos_vulneraveis",
        "title": "Pontos vulneráveis"
      },
      {
        "id": "preparacao_espiritual",
        "title": "Preparação espiritual"
      }
    ]
  },
  {
    "slug": "voz_dicao",
    "title": "1. Voz e Dicção",
    "shortTitle": "Voz",
    "module": "pronuntiatio",
    "group": "entrega",
    "groupLabel": "Entrega e Comunicação",
    "order": 25,
    "cards": [
      {
        "id": "projecao_articulacao",
        "title": "Projeção e articulação"
      },
      {
        "id": "variacao_ritmo",
        "title": "Variação e ritmo"
      },
      {
        "id": "enfase_pausas",
        "title": "Ênfase e pausas"
      }
    ]
  },
  {
    "slug": "linguagem_corporal",
    "title": "2. Linguagem Corporal e Presença",
    "shortTitle": "Linguagem Corporal",
    "module": "pronuntiatio",
    "group": "entrega",
    "groupLabel": "Entrega e Comunicação",
    "order": 26,
    "cards": [
      {
        "id": "postura_presenca",
        "title": "Postura e presença"
      },
      {
        "id": "gestos",
        "title": "Gestos intencionais"
      },
      {
        "id": "contato_visual",
        "title": "Contato visual"
      }
    ]
  },
  {
    "slug": "avaliacao_pregacao",
    "title": "3. Avaliação Pós-pregação",
    "shortTitle": "Avaliação",
    "module": "pronuntiatio",
    "group": "avaliacao_pregacao",
    "groupLabel": "Avaliação",
    "order": 27,
    "cards": [
      {
        "id": "auto_avaliacao",
        "title": "Autoavaliação"
      },
      {
        "id": "feedback_recebido",
        "title": "Feedback recebido"
      },
      {
        "id": "crescimento_continuo",
        "title": "Crescimento contínuo"
      }
    ]
  },
]
