// AUTO-GERADO por scripts/gen-sections-nav.mjs — não editar manualmente
// Apenas campos de navegação + cards (id/title). Dados completos: /api/workspace/section/[slug]

export interface CardNav { id: string; title: string }

export interface SectionNav {
  slug: string
  title: string
  shortTitle: string
  phase?: 'preparar' | 'interpretar' | 'comunicar'
  communicationMode?: 'sermao' | 'estudo_biblico' | 'devocional'
  module?: 'inventio' | 'dispositio' | 'elocutio' | 'memoria' | 'pronuntiatio'
  group?: string
  groupLabel?: string
  order?: number
  cards?: CardNav[]
}

export const WORKSPACE_SECTIONS_NAV: SectionNav[] = [
  {
    "slug": "contexto_historico",
    "title": "1.1 Contexto Histórico-Cultural",
    "shortTitle": "Histórico-Cultural",
    "module": "inventio",
    "group": "contextual",
    "groupLabel": "Estudo Contextual",
    "order": 1.0,
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
    "order": 2.0,
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
    "order": 3.0,
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
    "order": 4.0,
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
    "order": 5.0,
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
    "order": 6.0,
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
    "order": 7.0,
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
    "order": 8.0,
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
    "order": 9.0
  },
  {
    "slug": "estrutura_literaria",
    "title": "2.5 Estrutura Literária",
    "shortTitle": "Estrutura Literária",
    "module": "inventio",
    "group": "textual",
    "groupLabel": "Estudo Textual",
    "order": 10.0,
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
    "order": 11.0,
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
    "order": 12.0,
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
    "order": 13.0,
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
    "order": 14.0,
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
    "order": 15.0,
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
    "order": 16.0,
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
    "order": 17.0,
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
    "order": 18.0,
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
    "order": 19.0,
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
    "order": 20.0,
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
    "order": 21.0,
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
    "order": 22.0,
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
    "order": 23.0,
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
    "order": 24.0,
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
    "order": 25.0,
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
    "order": 26.0,
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
    "order": 27.0,
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
    "order": 100.0
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
    "order": 101.0
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
    "order": 102.0
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
    "order": 103.0
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
    "order": 104.0
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
    "order": 105.0
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
    "order": 120.0
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
    "order": 121.0
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
    "order": 122.0
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
    "order": 123.0
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
    "order": 124.0
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
    "order": 140.0
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
    "order": 141.0
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
    "order": 142.0
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
    "order": 143.0
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
    "order": 144.0
  },
  {
    "slug": "_sintese_contextual",
    "title": "Síntese do Estudo Contextual",
    "shortTitle": "Síntese",
    "groupLabel": "Estudo Contextual"
  },
  {
    "slug": "preparacao_espiritual",
    "title": "1. Preparação Espiritual",
    "shortTitle": "Preparação Espiritual",
    "phase": "preparar",
    "module": "inventio",
    "group": "preparar_espiritual",
    "groupLabel": "Piedade, planejamento e oração"
  },
  {
    "slug": "preparar_leia_assimile",
    "title": "2. Leia e Assimile a Ideia do Texto",
    "shortTitle": "Leia e Assimile",
    "phase": "preparar",
    "module": "inventio",
    "group": "preparar_assimilacao",
    "groupLabel": "Contato direto com a Escritura"
  },
  {
    "slug": "preparar_primeiras_impressoes",
    "title": "3. Primeiras Impressões",
    "shortTitle": "Primeiras Impressões",
    "phase": "preparar",
    "module": "inventio",
    "group": "preparar_impressoes",
    "groupLabel": "Notas rápidas e perguntas"
  },
  {
    "slug": "preparar_visao_geral",
    "title": "4. Visão Geral da Passagem",
    "shortTitle": "Visão Geral",
    "phase": "preparar",
    "module": "inventio",
    "group": "preparar_visao_geral",
    "groupLabel": "Assimilação macro"
  }
]

export function getSectionNavBySlug(slug: string): SectionNav | undefined {
  return WORKSPACE_SECTIONS_NAV.find(s => s.slug === slug)
}

export function getSectionsByGroupNav(group: string): SectionNav[] {
  return WORKSPACE_SECTIONS_NAV.filter(s => s.group === group)
}
