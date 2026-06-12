// AUTO-GERADO por scripts/gen-sections-nav.mjs — não editar manualmente
// Contém apenas campos de navegação. Dados completos via /api/workspace/section/[slug]

export interface CardNav { id: string; title: string }

export interface SectionNav {
  slug: string
  title: string
  shortTitle: string
  phase?: 'preparar' | 'interpretar' | 'comunicar'
  communicationMode?: 'sermao' | 'estudo_biblico' | 'devocional'
  module: 'inventio' | 'dispositio' | 'elocutio' | 'memoria' | 'pronuntiatio'
  group: string
  groupLabel: string
  order: number
  cards?: CardNav[]
}

export const WORKSPACE_SECTIONS_NAV: SectionNav[] = [
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
        "title": "Leitura lenta"
      },
      {
        "id": "preparar_multiplas_leituras",
        "title": "Múltiplas leituras"
      },
      {
        "id": "preparar_comparacao_traducoes",
        "title": "Comparação de traduções"
      },
      {
        "id": "preparar_leitura_voz_alta",
        "title": "Leitura em voz alta"
      },
      {
        "id": "preparar_ideia_inicial",
        "title": "Ideia central inicial"
      },
      {
        "id": "preparar_tensoes_repeticoes",
        "title": "Tensões e repetições"
      }
    ]
  },
  {
    "slug": "preparar_primeiras_impressoes",
    "title": "3. Primeiras Impressões",
    "shortTitle": "Primeiras Impressões",
    "phase": "preparar",
    "module": "inventio",
    "group": "preparar_impressoes",
    "groupLabel": "Notas rápidas e perguntas",
    "order": -38,
    "cards": [
      {
        "id": "preparar_observacoes_livres",
        "title": "Observações livres"
      },
      {
        "id": "preparar_perguntas_dificuldades",
        "title": "Perguntas e dificuldades"
      },
      {
        "id": "preparar_conexoes_iniciais",
        "title": "Conexões iniciais"
      },
      {
        "id": "preparar_marcacoes",
        "title": "Marcações e destaques"
      },
      {
        "id": "preparar_modo_imersao",
        "title": "Modo Imersão"
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
        "id": "preparar_personagens",
        "title": "Personagens"
      },
      {
        "id": "preparar_movimento_narrativo",
        "title": "Movimento narrativo"
      },
      {
        "id": "preparar_fluxo_argumentativo",
        "title": "Fluxo argumentativo"
      },
      {
        "id": "preparar_climax",
        "title": "Clímax"
      },
      {
        "id": "preparar_palavras_repetidas",
        "title": "Palavras repetidas"
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
    "groupLabel": "Compreensão refinada após investigação",
    "order": -20,
    "cards": [
      {
        "id": "preparar_tema_provavel",
        "title": "Tema refinado"
      },
      {
        "id": "preparar_grande_ideia_inicial",
        "title": "Grande ideia refinada"
      },
      {
        "id": "preparar_estrutura_percebida",
        "title": "Estrutura refinada"
      },
      {
        "id": "preparar_personagens",
        "title": "Personagens"
      },
      {
        "id": "preparar_movimento_narrativo",
        "title": "Movimento narrativo refinado"
      },
      {
        "id": "preparar_fluxo_argumentativo",
        "title": "Fluxo argumentativo refinado"
      },
      {
        "id": "preparar_climax",
        "title": "Clímax confirmado"
      },
      {
        "id": "preparar_palavras_repetidas",
        "title": "Termos e repetições"
      }
    ]
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
    "title": "1.1 Contexto Histórico-Cultural",
    "shortTitle": "Histórico-Cultural",
    "module": "inventio",
    "group": "contextual",
    "groupLabel": "Estudo Contextual",
    "order": 1,
    "cards": [
      {
        "id": "periodo_data",
        "title": "Período e data"
      },
      {
        "id": "contexto_politico",
        "title": "Contexto político"
      },
      {
        "id": "contexto_religioso",
        "title": "Contexto religioso"
      },
      {
        "id": "cultura_costumes",
        "title": "Cultura e costumes"
      },
      {
        "id": "geografia",
        "title": "Geografia"
      },
      {
        "id": "estrutura_social",
        "title": "Estrutura social"
      }
    ]
  },
  {
    "slug": "autor_destinatarios",
    "title": "1.2 Autor e Destinatários",
    "shortTitle": "Autor e Destinatários",
    "module": "inventio",
    "group": "contextual",
    "groupLabel": "Estudo Contextual",
    "order": 2,
    "cards": [
      {
        "id": "autor",
        "title": "Autor"
      },
      {
        "id": "questoes_autoria",
        "title": "Questões de autoria"
      },
      {
        "id": "destinatarios",
        "title": "Destinatários"
      },
      {
        "id": "situacao_destinatarios",
        "title": "Situação dos destinatários"
      }
    ]
  },
  {
    "slug": "ocasiao_proposito",
    "title": "1.3 Ocasião e Propósito",
    "shortTitle": "Ocasião e Propósito",
    "module": "inventio",
    "group": "contextual",
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
    "group": "contextual",
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
    "slug": "estrutura_livro",
    "title": "1.5 Estrutura do Livro",
    "shortTitle": "Estrutura do Livro",
    "module": "inventio",
    "group": "contextual",
    "groupLabel": "Estudo Contextual",
    "order": 5,
    "cards": [
      {
        "id": "divisoes_principais",
        "title": "Divisões principais"
      },
      {
        "id": "localizacao_pericope",
        "title": "Localização da perícope"
      },
      {
        "id": "argumento_livro",
        "title": "Argumento do livro"
      }
    ]
  },
  {
    "slug": "texto_original",
    "title": "§ Texto Original",
    "shortTitle": "Texto Original",
    "module": "inventio",
    "group": "textual",
    "groupLabel": "Estudo Textual",
    "order": 5.5
  },
  {
    "slug": "delimitacao_pericope",
    "title": "2.1 Delimitação da Perícope",
    "shortTitle": "Delimitação",
    "module": "inventio",
    "group": "textual",
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
    "group": "textual",
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
    "group": "textual",
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
    "group": "textual",
    "groupLabel": "Estudo Textual",
    "order": 9
  },
  {
    "slug": "estrutura_literaria",
    "title": "2.5 Estrutura Literária",
    "shortTitle": "Estrutura Literária",
    "module": "inventio",
    "group": "textual",
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
    "slug": "contexto_canonico",
    "title": "3.1 Contexto Canônico",
    "shortTitle": "Contexto Canônico",
    "module": "inventio",
    "group": "teologico",
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
    "group": "teologico",
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
    "group": "teologico",
    "groupLabel": "Estudo Teológico",
    "order": 13,
    "cards": [
      {
        "id": "grande_ideia",
        "title": "A Grande Ideia"
      },
      {
        "id": "mensagem_texto",
        "title": "Mensagem do texto"
      },
      {
        "id": "conceito_ensina",
        "title": "Conceito que o texto ensina"
      },
      {
        "id": "conceitos_confronta",
        "title": "Conceitos que o texto confronta"
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
  {
    "slug": "edt_definicao",
    "title": "I. Definição",
    "shortTitle": "Definição",
    "phase": "preparar",
    "module": "inventio",
    "group": "edt_definicao_grp",
    "groupLabel": "I. Definição",
    "order": 200,
    "cards": [
      {
        "id": "nome_doutrina",
        "title": "Nome da doutrina"
      },
      {
        "id": "definicao_resumida",
        "title": "Definição resumida"
      },
      {
        "id": "definicao_expandida",
        "title": "Definição expandida"
      },
      {
        "id": "questao_central",
        "title": "Questão central"
      }
    ]
  },
  {
    "slug": "edt_fundamentacao_biblica",
    "title": "II. Fundamentação Bíblica",
    "shortTitle": "Fundamentação Bíblica",
    "phase": "interpretar",
    "module": "inventio",
    "group": "edt_fundamentacao_grp",
    "groupLabel": "II. Fundamentação Bíblica",
    "order": 201,
    "cards": [
      {
        "id": "passagens_principais",
        "title": "Passagens principais"
      },
      {
        "id": "desenvolvimento_at",
        "title": "Desenvolvimento no AT"
      },
      {
        "id": "desenvolvimento_nt",
        "title": "Desenvolvimento no NT"
      },
      {
        "id": "progressao_revelacional",
        "title": "Progressão revelacional"
      }
    ]
  },
  {
    "slug": "edt_historia_doutrina",
    "title": "III. História da Doutrina",
    "shortTitle": "História",
    "phase": "interpretar",
    "module": "inventio",
    "group": "edt_historia_grp",
    "groupLabel": "III. História",
    "order": 202,
    "cards": [
      {
        "id": "igreja_primitiva_patristica",
        "title": "Igreja Primitiva e Patrística"
      },
      {
        "id": "medieval",
        "title": "Período Medieval"
      },
      {
        "id": "reforma",
        "title": "Reforma"
      },
      {
        "id": "pos_reforma_atualidade",
        "title": "Pós-Reforma e atualidade"
      }
    ]
  },
  {
    "slug": "edt_formulacao_sistematica",
    "title": "IV. Formulação Sistemática",
    "shortTitle": "Formulação Sistemática",
    "phase": "interpretar",
    "module": "inventio",
    "group": "edt_formulacao_grp",
    "groupLabel": "IV. Formulação Sistemática",
    "order": 203,
    "cards": [
      {
        "id": "definicao_tecnica",
        "title": "Definição técnica"
      },
      {
        "id": "relacoes_doutrinarias",
        "title": "Relações doutrinárias"
      },
      {
        "id": "implicacoes_teologicas",
        "title": "Implicações teológicas"
      },
      {
        "id": "distincoes_necessarias",
        "title": "Distinções necessárias"
      }
    ]
  },
  {
    "slug": "edt_controversias",
    "title": "V. Controvérsias",
    "shortTitle": "Controvérsias",
    "phase": "interpretar",
    "module": "inventio",
    "group": "edt_controversias_grp",
    "groupLabel": "V. Controvérsias",
    "order": 204,
    "cards": [
      {
        "id": "erros_historicos",
        "title": "Erros históricos"
      },
      {
        "id": "heresias_relacionadas",
        "title": "Heresias relacionadas"
      },
      {
        "id": "visoes_concorrentes",
        "title": "Visões concorrentes"
      },
      {
        "id": "respostas_reformadas",
        "title": "Respostas reformadas"
      }
    ]
  },
  {
    "slug": "edt_confissionalidade",
    "title": "VI. Confissionalidade",
    "shortTitle": "Confissionalidade",
    "phase": "interpretar",
    "module": "inventio",
    "group": "edt_confissionalidade_grp",
    "groupLabel": "VI. Confissionalidade",
    "order": 205,
    "cards": [
      {
        "id": "confissao_westminster",
        "title": "Confissão de Westminster"
      },
      {
        "id": "catecismo_maior",
        "title": "Catecismo Maior"
      },
      {
        "id": "catecismo_menor",
        "title": "Catecismo Menor"
      },
      {
        "id": "outros_simbolos",
        "title": "Outros símbolos"
      }
    ]
  },
  {
    "slug": "edt_aplicacoes",
    "title": "VII. Aplicações",
    "shortTitle": "Aplicações",
    "phase": "interpretar",
    "module": "inventio",
    "group": "edt_aplicacoes_grp",
    "groupLabel": "VII. Aplicações",
    "order": 206,
    "cards": [
      {
        "id": "aplicacao_eclesial",
        "title": "Aplicação eclesial"
      },
      {
        "id": "aplicacao_familiar",
        "title": "Aplicação familiar"
      },
      {
        "id": "vida_crista",
        "title": "Vida cristã"
      },
      {
        "id": "ministerio",
        "title": "Ministério"
      }
    ]
  },
  {
    "slug": "edt_bibliografia",
    "title": "VIII. Bibliografia",
    "shortTitle": "Bibliografia",
    "phase": "interpretar",
    "module": "inventio",
    "group": "edt_bibliografia_grp",
    "groupLabel": "VIII. Bibliografia",
    "order": 207,
    "cards": [
      {
        "id": "livros_principais",
        "title": "Livros principais"
      },
      {
        "id": "artigos",
        "title": "Artigos e capítulos"
      },
      {
        "id": "fontes_primarias",
        "title": "Fontes primárias"
      }
    ]
  },
  {
    "slug": "et_definicao",
    "title": "I. Definição do Tema",
    "shortTitle": "Definição",
    "module": "inventio",
    "group": "et_definicao_grp",
    "groupLabel": "I. Definição do Tema",
    "order": 500,
    "cards": [
      {
        "id": "nome_tema",
        "title": "Nome e campo semântico"
      },
      {
        "id": "questao_orientadora",
        "title": "Questão orientadora"
      },
      {
        "id": "delimitacao",
        "title": "Delimitação e escopo"
      }
    ]
  },
  {
    "slug": "et_at",
    "title": "II. Antigo Testamento",
    "shortTitle": "Antigo Testamento",
    "module": "inventio",
    "group": "et_at_grp",
    "groupLabel": "II. Antigo Testamento",
    "order": 501,
    "cards": [
      {
        "id": "patriarcal",
        "title": "Período patriarcal e Pentateuco"
      },
      {
        "id": "mosaico",
        "title": "Livros históricos e poéticos"
      },
      {
        "id": "profetico",
        "title": "Profetas"
      }
    ]
  },
  {
    "slug": "et_nt",
    "title": "III. Novo Testamento",
    "shortTitle": "Novo Testamento",
    "module": "inventio",
    "group": "et_nt_grp",
    "groupLabel": "III. Novo Testamento",
    "order": 502,
    "cards": [
      {
        "id": "evangelhos",
        "title": "Evangelhos"
      },
      {
        "id": "cartas",
        "title": "Cartas apostólicas"
      },
      {
        "id": "apocalipse",
        "title": "Cumprimento escatológico"
      }
    ]
  },
  {
    "slug": "et_sintese_canonica",
    "title": "IV. Síntese Canônica",
    "shortTitle": "Síntese",
    "module": "inventio",
    "group": "et_sintese_grp",
    "groupLabel": "IV. Síntese Canônica",
    "order": 503,
    "cards": [
      {
        "id": "progressao",
        "title": "Progressão canônica"
      },
      {
        "id": "cumprimento",
        "title": "Cristo como centro"
      },
      {
        "id": "unidade",
        "title": "Unidade canônica"
      }
    ]
  },
  {
    "slug": "et_teologia_sistematica",
    "title": "V. Teologia Sistemática",
    "shortTitle": "Sistemática",
    "module": "dispositio",
    "group": "et_sistematica_grp",
    "groupLabel": "V. Teologia Sistemática",
    "order": 504,
    "cards": [
      {
        "id": "formulacao",
        "title": "Formulação doutrinária"
      },
      {
        "id": "implicacoes",
        "title": "Implicações para outros loci"
      }
    ]
  },
  {
    "slug": "et_aplicacoes",
    "title": "VI. Aplicações",
    "shortTitle": "Aplicações",
    "module": "dispositio",
    "group": "et_aplicacoes_grp",
    "groupLabel": "VI. Aplicações",
    "order": 505,
    "cards": [
      {
        "id": "vida_crista",
        "title": "Vida cristã"
      },
      {
        "id": "eclesial",
        "title": "Vida eclesial"
      },
      {
        "id": "missional",
        "title": "Missão"
      }
    ]
  },
  {
    "slug": "termos_definir",
    "title": "I. Definir",
    "shortTitle": "Definir",
    "phase": "preparar",
    "module": "inventio",
    "group": "termos_definir_grp",
    "groupLabel": "I. Definir",
    "order": 1225,
    "cards": [
      {
        "id": "termo_principal",
        "title": "Termo principal"
      },
      {
        "id": "idioma",
        "title": "Idioma"
      },
      {
        "id": "forma_original",
        "title": "Forma original"
      },
      {
        "id": "transliteracao",
        "title": "Transliteração"
      },
      {
        "id": "campo_semantico",
        "title": "Campo semântico"
      },
      {
        "id": "pergunta_central",
        "title": "Pergunta central"
      }
    ]
  },
  {
    "slug": "termos_analisar",
    "title": "II. Analisar",
    "shortTitle": "Analisar",
    "phase": "interpretar",
    "module": "inventio",
    "group": "termos_analisar_grp",
    "groupLabel": "II. Analisar",
    "order": 1226,
    "cards": [
      {
        "id": "definicao_lexical",
        "title": "Definição lexical"
      },
      {
        "id": "contexto_imediato",
        "title": "Uso no contexto imediato"
      },
      {
        "id": "uso_livro_biblico",
        "title": "Uso no livro bíblico"
      },
      {
        "id": "uso_antigo_testamento",
        "title": "Uso no Antigo Testamento"
      },
      {
        "id": "uso_novo_testamento",
        "title": "Uso no Novo Testamento"
      },
      {
        "id": "termos_relacionados",
        "title": "Variações e termos relacionados"
      }
    ]
  },
  {
    "slug": "termos_rastrear",
    "title": "III. Rastrear",
    "shortTitle": "Rastrear",
    "phase": "interpretar",
    "module": "dispositio",
    "group": "termos_rastrear_grp",
    "groupLabel": "III. Rastrear",
    "order": 1227,
    "cards": [
      {
        "id": "ocorrencias_principais",
        "title": "Ocorrências principais"
      },
      {
        "id": "desenvolvimento_canonico",
        "title": "Desenvolvimento canônico"
      },
      {
        "id": "relacao_aliancas",
        "title": "Relação com alianças"
      },
      {
        "id": "relacao_cristo",
        "title": "Relação com Cristo"
      },
      {
        "id": "relacao_povo_de_deus",
        "title": "Relação com o povo de Deus"
      }
    ]
  },
  {
    "slug": "termos_sintetizar",
    "title": "IV. Sintetizar",
    "shortTitle": "Sintetizar",
    "phase": "comunicar",
    "module": "elocutio",
    "group": "termos_sintetizar_grp",
    "groupLabel": "IV. Sintetizar",
    "order": 1228,
    "cards": [
      {
        "id": "sintese_biblico_teologica",
        "title": "Síntese bíblico-teológica"
      },
      {
        "id": "implicacoes_doutrinarias",
        "title": "Implicações doutrinárias"
      },
      {
        "id": "implicacoes_pastorais",
        "title": "Implicações pastorais"
      },
      {
        "id": "erros_comuns",
        "title": "Erros comuns de interpretação"
      }
    ]
  },
  {
    "slug": "termos_produzir",
    "title": "V. Produzir",
    "shortTitle": "Produzir",
    "phase": "comunicar",
    "module": "pronuntiatio",
    "group": "termos_produzir_grp",
    "groupLabel": "V. Produzir",
    "order": 1229,
    "cards": [
      {
        "id": "verbete_final",
        "title": "Verbete final"
      },
      {
        "id": "esboco_estudo",
        "title": "Esboço do estudo"
      },
      {
        "id": "perguntas_discussao",
        "title": "Perguntas para discussão"
      },
      {
        "id": "aplicacoes",
        "title": "Aplicações"
      }
    ]
  },
  {
    "slug": "ec_ocasiao",
    "title": "Ocasião e Propósito",
    "shortTitle": "Ocasião",
    "module": "inventio",
    "group": "ec_ocasiao_grp",
    "groupLabel": "Ocasião e Propósito",
    "order": 400,
    "cards": [
      {
        "id": "situacao",
        "title": "Situação dos destinatários"
      },
      {
        "id": "proposito",
        "title": "Propósito da carta"
      },
      {
        "id": "relacao_autor",
        "title": "Relação autor–destinatários"
      }
    ]
  },
  {
    "slug": "ec_estrutura",
    "title": "Estrutura Retórica",
    "shortTitle": "Estrutura Retórica",
    "module": "inventio",
    "group": "ec_estrutura_grp",
    "groupLabel": "Estrutura Retórica",
    "order": 401,
    "cards": [
      {
        "id": "divisao_epistolar",
        "title": "Divisão epistolar"
      },
      {
        "id": "tipo_retorico",
        "title": "Tipo retórico"
      },
      {
        "id": "macroargumento",
        "title": "Estrutura argumentativa"
      }
    ]
  },
  {
    "slug": "ec_argumento",
    "title": "Argumento Central",
    "shortTitle": "Argumento",
    "module": "inventio",
    "group": "ec_argumento_grp",
    "groupLabel": "Argumento Central",
    "order": 402,
    "cards": [
      {
        "id": "tese_central",
        "title": "Tese central"
      },
      {
        "id": "desenvolvimento",
        "title": "Desenvolvimento do argumento"
      },
      {
        "id": "climax",
        "title": "Clímax e resolução"
      }
    ]
  },
  {
    "slug": "ss_paralelismo",
    "title": "Paralelismo Poético",
    "shortTitle": "Paralelismo",
    "module": "inventio",
    "group": "ss_paralelismo_grp",
    "groupLabel": "Paralelismo Poético",
    "order": 500,
    "cards": [
      {
        "id": "tipo_paralelismo",
        "title": "Tipo de paralelismo"
      },
      {
        "id": "estrutura_bimembre",
        "title": "Estrutura bimembre"
      },
      {
        "id": "quiasmo",
        "title": "Quiasmo"
      }
    ]
  },
  {
    "slug": "ss_estrutura",
    "title": "Estrutura do Poema",
    "shortTitle": "Estrutura",
    "module": "inventio",
    "group": "ss_estrutura_grp",
    "groupLabel": "Estrutura Poética",
    "order": 501,
    "cards": [
      {
        "id": "divisao_estrofes",
        "title": "Divisão em estrofes"
      },
      {
        "id": "movimento_poetico",
        "title": "Movimento do poema"
      },
      {
        "id": "climax_poetico",
        "title": "Clímax"
      }
    ]
  },
  {
    "slug": "ss_imagistica",
    "title": "Imagística e Metáforas",
    "shortTitle": "Imagística",
    "module": "inventio",
    "group": "ss_imagistica_grp",
    "groupLabel": "Imagística e Metáforas",
    "order": 502,
    "cards": [
      {
        "id": "imagens_centrais",
        "title": "Imagens centrais"
      },
      {
        "id": "campo_semantico",
        "title": "Campo semântico dominante"
      },
      {
        "id": "intertextualidade",
        "title": "Conexões canônicas"
      }
    ]
  },
  {
    "slug": "ss_temas_sabedoria",
    "title": "Temas e Questões",
    "shortTitle": "Temas",
    "module": "inventio",
    "group": "ss_temas_grp",
    "groupLabel": "Temas e Questões",
    "order": 503,
    "cards": [
      {
        "id": "tema_central",
        "title": "Tema teológico central"
      },
      {
        "id": "questao_existencial",
        "title": "Questão existencial"
      },
      {
        "id": "tensao_resolucao",
        "title": "Tensão e resolução"
      }
    ]
  },
  {
    "slug": "ss_teologia_adoracao",
    "title": "Teologia da Adoração",
    "shortTitle": "Teologia",
    "module": "inventio",
    "group": "ss_teologia_grp",
    "groupLabel": "Teologia da Adoração",
    "order": 504,
    "cards": [
      {
        "id": "revelacao_de_deus",
        "title": "O que revela sobre Deus"
      },
      {
        "id": "relacao_crente",
        "title": "A relação do crente com Deus"
      },
      {
        "id": "cristologia",
        "title": "Conexão com Cristo"
      }
    ]
  },
  {
    "slug": "pf_contexto",
    "title": "Contexto Histórico-Profético",
    "shortTitle": "Contexto",
    "module": "inventio",
    "group": "pf_contexto_grp",
    "groupLabel": "Contexto Histórico",
    "order": 600,
    "cards": [
      {
        "id": "periodo_historico",
        "title": "Período histórico"
      },
      {
        "id": "situacao_nacao",
        "title": "Situação de Israel"
      },
      {
        "id": "destinatarios",
        "title": "Destinatários"
      }
    ]
  },
  {
    "slug": "pf_oraculo",
    "title": "O Oráculo",
    "shortTitle": "O Oráculo",
    "module": "inventio",
    "group": "pf_oraculo_grp",
    "groupLabel": "O Oráculo",
    "order": 601,
    "cards": [
      {
        "id": "tipo_oraculo",
        "title": "Tipo de oráculo"
      },
      {
        "id": "estrutura_oraculo",
        "title": "Estrutura do oráculo"
      },
      {
        "id": "mensagem_central",
        "title": "Mensagem central"
      }
    ]
  },
  {
    "slug": "pf_simbolos",
    "title": "Símbolos e Imagens Proféticas",
    "shortTitle": "Símbolos",
    "module": "inventio",
    "group": "pf_simbolos_grp",
    "groupLabel": "Símbolos e Imagens",
    "order": 602,
    "cards": [
      {
        "id": "simbolos_principais",
        "title": "Símbolos principais"
      },
      {
        "id": "visoes_acoes",
        "title": "Visões e ações simbólicas"
      },
      {
        "id": "tradicoes_evocadas",
        "title": "Tradições canônicas evocadas"
      }
    ]
  },
  {
    "slug": "pf_cumprimento",
    "title": "Cumprimento Canônico",
    "shortTitle": "Cumprimento",
    "module": "inventio",
    "group": "pf_cumprimento_grp",
    "groupLabel": "Cumprimento",
    "order": 603,
    "cards": [
      {
        "id": "cumprimento_historico",
        "title": "Cumprimento histórico"
      },
      {
        "id": "cumprimento_cristologico",
        "title": "Cumprimento em Cristo"
      },
      {
        "id": "horizonte_escatologico",
        "title": "Horizonte escatológico"
      }
    ]
  },
  {
    "slug": "pf_escatologia",
    "title": "Escatologia e Alianças",
    "shortTitle": "Escatologia",
    "module": "inventio",
    "group": "pf_escatologia_grp",
    "groupLabel": "Escatologia e Alianças",
    "order": 604,
    "cards": [
      {
        "id": "aliancas",
        "title": "Vinculação com as alianças"
      },
      {
        "id": "progressao_redentora",
        "title": "Progressão redentora"
      },
      {
        "id": "reino_de_deus",
        "title": "Reino de Deus"
      }
    ]
  },
  {
    "slug": "nr_personagens",
    "title": "Personagens e Caracterização",
    "shortTitle": "Personagens",
    "module": "inventio",
    "group": "nr_personagens_grp",
    "groupLabel": "Personagens e Caracterização",
    "order": 700,
    "cards": [
      {
        "id": "personagem_central",
        "title": "Personagem central"
      },
      {
        "id": "personagens_secundarios",
        "title": "Personagens secundários"
      },
      {
        "id": "desenvolvimento_personagem",
        "title": "Desenvolvimento e mudança"
      },
      {
        "id": "caracterizacao_indireta",
        "title": "Caracterização indireta"
      }
    ]
  },
  {
    "slug": "nr_enredo",
    "title": "Enredo e Tensão Narrativa",
    "shortTitle": "Enredo",
    "module": "inventio",
    "group": "nr_enredo_grp",
    "groupLabel": "Enredo e Tensão",
    "order": 701,
    "cards": [
      {
        "id": "exposicao",
        "title": "Exposição"
      },
      {
        "id": "complicacao_conflito",
        "title": "Complicação e conflito"
      },
      {
        "id": "climax_virada",
        "title": "Clímax e virada"
      },
      {
        "id": "resolucao_lacunas",
        "title": "Resolução e lacunas"
      }
    ]
  },
  {
    "slug": "nr_cenario",
    "title": "Cenário, Tempo e Espaço",
    "shortTitle": "Cenário",
    "module": "inventio",
    "group": "nr_cenario_grp",
    "groupLabel": "Cenário e Tempo",
    "order": 702,
    "cards": [
      {
        "id": "lugares",
        "title": "Lugares e simbolismo geográfico"
      },
      {
        "id": "tempo_narrativo",
        "title": "Tempo e ritmo narrativo"
      },
      {
        "id": "movimento_espacial",
        "title": "Movimento espacial"
      }
    ]
  },
  {
    "slug": "nr_narrador",
    "title": "Narrador e Ponto de Vista",
    "shortTitle": "Narrador",
    "module": "inventio",
    "group": "nr_narrador_grp",
    "groupLabel": "Narrador e Perspectiva",
    "order": 703,
    "cards": [
      {
        "id": "onisciencia",
        "title": "Onisciência e limitação"
      },
      {
        "id": "ponto_de_vista",
        "title": "Ponto de vista e julgamento"
      },
      {
        "id": "vida_interior",
        "title": "Acesso à vida interior"
      }
    ]
  },
  {
    "slug": "nr_dialogo",
    "title": "Diálogo e Discurso",
    "shortTitle": "Diálogo",
    "module": "inventio",
    "group": "nr_dialogo_grp",
    "groupLabel": "Diálogo e Discurso",
    "order": 704,
    "cards": [
      {
        "id": "funcao_dialogo",
        "title": "Função do diálogo"
      },
      {
        "id": "silencio_omissao",
        "title": "Silêncio e omissão"
      },
      {
        "id": "ironia_dramatica",
        "title": "Ironia dramática"
      }
    ]
  },
  {
    "slug": "nr_teologia",
    "title": "Teologia Narrativa",
    "shortTitle": "Teologia",
    "module": "inventio",
    "group": "nr_teologia_grp",
    "groupLabel": "Teologia Narrativa",
    "order": 705,
    "cards": [
      {
        "id": "deus_na_narrativa",
        "title": "Deus na narrativa"
      },
      {
        "id": "condicao_humana",
        "title": "A condição humana"
      },
      {
        "id": "grande_narrativa",
        "title": "Conexão com a grande narrativa"
      }
    ]
  },
  {
    "slug": "pt_tema",
    "title": "I. Tema e Problema",
    "shortTitle": "Tema e Problema",
    "phase": "preparar",
    "module": "inventio",
    "group": "pt_tema_grp",
    "groupLabel": "I. Tema e Problema",
    "order": 300,
    "cards": [
      {
        "id": "tema",
        "title": "Tema"
      },
      {
        "id": "problema_pesquisa",
        "title": "Problema da pesquisa"
      },
      {
        "id": "delimitacao",
        "title": "Delimitação"
      },
      {
        "id": "justificativa",
        "title": "Justificativa"
      }
    ]
  },
  {
    "slug": "pt_hipotese",
    "title": "II. Hipótese",
    "shortTitle": "Hipótese",
    "phase": "preparar",
    "module": "inventio",
    "group": "pt_hipotese_grp",
    "groupLabel": "II. Hipótese",
    "order": 301,
    "cards": [
      {
        "id": "questao_principal",
        "title": "Questão principal"
      },
      {
        "id": "hipoteses",
        "title": "Hipóteses"
      },
      {
        "id": "metodologia",
        "title": "Metodologia"
      }
    ]
  },
  {
    "slug": "pt_revisao_bibliografica",
    "title": "III. Revisão Bibliográfica",
    "shortTitle": "Revisão Bibliográfica",
    "phase": "preparar",
    "module": "inventio",
    "group": "pt_revisao_grp",
    "groupLabel": "III. Revisão Bibliográfica",
    "order": 302,
    "cards": [
      {
        "id": "estado_da_arte",
        "title": "Estado da arte"
      },
      {
        "id": "autores_principais",
        "title": "Autores principais"
      },
      {
        "id": "obras_centrais",
        "title": "Obras centrais"
      },
      {
        "id": "debates_academicos",
        "title": "Debates acadêmicos"
      }
    ]
  },
  {
    "slug": "pt_exegese",
    "title": "IV. Exegese",
    "shortTitle": "Exegese",
    "phase": "preparar",
    "module": "inventio",
    "group": "pt_exegese_grp",
    "groupLabel": "IV. Exegese",
    "order": 303,
    "cards": [
      {
        "id": "passagens_relevantes",
        "title": "Passagens relevantes"
      },
      {
        "id": "analise_textual",
        "title": "Análise textual"
      },
      {
        "id": "analise_morfossintatica",
        "title": "Análise morfossintática"
      }
    ]
  },
  {
    "slug": "pt_teologia_biblica",
    "title": "V. Teologia Bíblica",
    "shortTitle": "Teologia Bíblica",
    "phase": "preparar",
    "module": "inventio",
    "group": "pt_tb_grp",
    "groupLabel": "V. Teologia Bíblica",
    "order": 304,
    "cards": [
      {
        "id": "desenvolvimento_canonico",
        "title": "Desenvolvimento canônico"
      },
      {
        "id": "historia_redencao",
        "title": "História da redenção"
      },
      {
        "id": "tipologia",
        "title": "Tipologia"
      }
    ]
  },
  {
    "slug": "pt_teologia_sistematica",
    "title": "VI. Teologia Sistemática",
    "shortTitle": "Teologia Sistemática",
    "phase": "comunicar",
    "module": "dispositio",
    "group": "pt_ts_grp",
    "groupLabel": "VI. Teologia Sistemática",
    "order": 305,
    "cards": [
      {
        "id": "formulacao_doutrinaria",
        "title": "Formulação doutrinária"
      },
      {
        "id": "loci_classicos",
        "title": "Loci clássicos"
      },
      {
        "id": "implicacoes",
        "title": "Implicações sistemáticas"
      }
    ]
  },
  {
    "slug": "pt_interacao_autores",
    "title": "VII. Interação com Autores",
    "shortTitle": "Interação com Autores",
    "phase": "comunicar",
    "module": "dispositio",
    "group": "pt_interacao_grp",
    "groupLabel": "VII. Interação com Autores",
    "order": 306,
    "cards": [
      {
        "id": "concordancias",
        "title": "Concordâncias"
      },
      {
        "id": "divergencias",
        "title": "Divergências"
      },
      {
        "id": "avaliacao_critica",
        "title": "Avaliação crítica"
      }
    ]
  },
  {
    "slug": "pt_conclusoes",
    "title": "VIII. Conclusões",
    "shortTitle": "Conclusões",
    "phase": "comunicar",
    "module": "dispositio",
    "group": "pt_conclusoes_grp",
    "groupLabel": "VIII. Conclusões",
    "order": 307,
    "cards": [
      {
        "id": "respostas_questao",
        "title": "Respostas à questão"
      },
      {
        "id": "implicacoes_teologicas",
        "title": "Implicações teológicas"
      },
      {
        "id": "contribuicao_original",
        "title": "Contribuição original"
      }
    ]
  },
  {
    "slug": "pt_referencias",
    "title": "IX. Referências",
    "shortTitle": "Referências",
    "phase": "comunicar",
    "module": "dispositio",
    "group": "pt_referencias_grp",
    "groupLabel": "IX. Referências",
    "order": 308,
    "cards": [
      {
        "id": "abnt_chicago",
        "title": "ABNT / Chicago"
      },
      {
        "id": "fontes_primarias",
        "title": "Fontes primárias"
      },
      {
        "id": "fontes_secundarias",
        "title": "Fontes secundárias"
      }
    ]
  }
]

export function getSectionNavBySlug(slug: string): SectionNav | undefined {
  return WORKSPACE_SECTIONS_NAV.find(s => s.slug === slug)
}

export function getSectionsByGroupNav(group: string): SectionNav[] {
  return WORKSPACE_SECTIONS_NAV.filter(s => s.group === group)
}
