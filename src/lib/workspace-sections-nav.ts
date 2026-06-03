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
      { "id": "oracao", "title": "Oração" },
      { "id": "publico_alvo", "title": "Público-alvo" },
      { "id": "faixa_etaria", "title": "Faixa etária" },
      { "id": "tempo_disponivel", "title": "Tempo disponível" }
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
      { "id": "objetivos_aula", "title": "Objetivos da aula" },
      { "id": "resultados_esperados", "title": "Resultados esperados" }
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
      { "id": "leitura_texto", "title": "Leitura do texto" },
      { "id": "estrutura", "title": "Estrutura" },
      { "id": "personagens", "title": "Personagens" },
      { "id": "lugares", "title": "Lugares" }
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
      { "id": "temas_principais", "title": "Temas principais" },
      { "id": "termos_chave", "title": "Termos-chave" },
      { "id": "grande_ideia", "title": "Grande Ideia" }
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
      { "id": "gancho", "title": "Gancho" },
      { "id": "quebra_gelo", "title": "Quebra-gelo" },
      { "id": "conexao_vida", "title": "Conexão com a vida" }
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
      { "id": "ponto_1", "title": "Ponto 1" },
      { "id": "ponto_2", "title": "Ponto 2" },
      { "id": "ponto_3", "title": "Ponto 3" },
      { "id": "transicoes", "title": "Transições" }
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
      { "id": "perguntas_observacao", "title": "Perguntas de observação" },
      { "id": "perguntas_interpretacao", "title": "Perguntas de interpretação" },
      { "id": "perguntas_aplicacao", "title": "Perguntas de aplicação" }
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
      { "id": "exercicios", "title": "Exercícios" },
      { "id": "discussao_grupo", "title": "Discussão em grupo" },
      { "id": "sintese", "title": "Síntese" }
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
      { "id": "aplicacoes_individuais", "title": "Aplicações individuais" },
      { "id": "aplicacoes_familiares", "title": "Aplicações familiares" },
      { "id": "aplicacoes_eclesiasticas", "title": "Aplicações eclesiásticas" },
      { "id": "aplicacoes_missionais", "title": "Aplicações missionais" }
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
      { "id": "material_professor", "title": "Material do professor" },
      { "id": "material_aluno", "title": "Material do aluno" },
      { "id": "slides_handout", "title": "Slides / Handout" }
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
      { "id": "nome_doutrina", "title": "Nome da doutrina" },
      { "id": "definicao_resumida", "title": "Definição resumida" },
      { "id": "definicao_expandida", "title": "Definição expandida" },
      { "id": "questao_central", "title": "Questão central" }
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
      { "id": "passagens_principais", "title": "Passagens principais" },
      { "id": "desenvolvimento_at", "title": "Desenvolvimento no AT" },
      { "id": "desenvolvimento_nt", "title": "Desenvolvimento no NT" },
      { "id": "progressao_revelacional", "title": "Progressão revelacional" }
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
      { "id": "igreja_primitiva_patristica", "title": "Igreja Primitiva e Patrística" },
      { "id": "medieval", "title": "Período Medieval" },
      { "id": "reforma", "title": "Reforma" },
      { "id": "pos_reforma_atualidade", "title": "Pós-Reforma e atualidade" }
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
      { "id": "definicao_tecnica", "title": "Definição técnica" },
      { "id": "relacoes_doutrinarias", "title": "Relações doutrinárias" },
      { "id": "implicacoes_teologicas", "title": "Implicações teológicas" },
      { "id": "distincoes_necessarias", "title": "Distinções necessárias" }
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
      { "id": "erros_historicos", "title": "Erros históricos" },
      { "id": "heresias_relacionadas", "title": "Heresias relacionadas" },
      { "id": "visoes_concorrentes", "title": "Visões concorrentes" },
      { "id": "respostas_reformadas", "title": "Respostas reformadas" }
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
      { "id": "confissao_westminster", "title": "Confissão de Westminster" },
      { "id": "catecismo_maior", "title": "Catecismo Maior" },
      { "id": "catecismo_menor", "title": "Catecismo Menor" },
      { "id": "outros_simbolos", "title": "Outros símbolos" }
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
      { "id": "aplicacao_eclesial", "title": "Aplicação eclesial" },
      { "id": "aplicacao_familiar", "title": "Aplicação familiar" },
      { "id": "vida_crista", "title": "Vida cristã" },
      { "id": "ministerio", "title": "Ministério" }
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
      { "id": "livros_principais", "title": "Livros principais" },
      { "id": "artigos", "title": "Artigos e capítulos" },
      { "id": "fontes_primarias", "title": "Fontes primárias" }
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
      { "id": "tema", "title": "Tema" },
      { "id": "problema_pesquisa", "title": "Problema da pesquisa" },
      { "id": "delimitacao", "title": "Delimitação" },
      { "id": "justificativa", "title": "Justificativa" }
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
      { "id": "questao_principal", "title": "Questão principal" },
      { "id": "hipoteses", "title": "Hipóteses" },
      { "id": "metodologia", "title": "Metodologia" }
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
      { "id": "estado_da_arte", "title": "Estado da arte" },
      { "id": "autores_principais", "title": "Autores principais" },
      { "id": "obras_centrais", "title": "Obras centrais" },
      { "id": "debates_academicos", "title": "Debates acadêmicos" }
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
      { "id": "passagens_relevantes", "title": "Passagens relevantes" },
      { "id": "analise_textual", "title": "Análise textual" },
      { "id": "analise_morfossintatica", "title": "Análise morfossintática" }
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
      { "id": "desenvolvimento_canonico", "title": "Desenvolvimento canônico" },
      { "id": "historia_redencao", "title": "História da redenção" },
      { "id": "tipologia", "title": "Tipologia" }
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
      { "id": "formulacao_doutrinaria", "title": "Formulação doutrinária" },
      { "id": "loci_classicos", "title": "Loci clássicos" },
      { "id": "implicacoes", "title": "Implicações sistemáticas" }
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
      { "id": "concordancias", "title": "Concordâncias" },
      { "id": "divergencias", "title": "Divergências" },
      { "id": "avaliacao_critica", "title": "Avaliação crítica" }
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
      { "id": "respostas_questao", "title": "Respostas à questão" },
      { "id": "implicacoes_teologicas", "title": "Implicações teológicas" },
      { "id": "contribuicao_original", "title": "Contribuição original" }
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
      { "id": "abnt_chicago", "title": "ABNT / Chicago" },
      { "id": "fontes_primarias", "title": "Fontes primárias" },
      { "id": "fontes_secundarias", "title": "Fontes secundárias" }
    ]
  },

  // ── Estudo de Carta ──────────────────────────────────────────────────────
  {
    "slug": "ec_ocasiao",
    "title": "Ocasião e Propósito",
    "shortTitle": "Ocasião",
    "phase": "interpretar",
    "module": "inventio",
    "group": "ec_ocasiao_grp",
    "groupLabel": "Ocasião e Propósito",
    "order": 400,
    "cards": [
      { "id": "situacao", "title": "Situação dos destinatários" },
      { "id": "proposito", "title": "Propósito da carta" },
      { "id": "relacao_autor", "title": "Relação autor–destinatários" }
    ]
  },
  {
    "slug": "ec_estrutura",
    "title": "Estrutura Retórica",
    "shortTitle": "Estrutura Retórica",
    "phase": "interpretar",
    "module": "inventio",
    "group": "ec_estrutura_grp",
    "groupLabel": "Estrutura Retórica",
    "order": 401,
    "cards": [
      { "id": "divisao_epistolar", "title": "Divisão epistolar" },
      { "id": "tipo_retorico", "title": "Tipo retórico" },
      { "id": "macroargumento", "title": "Macroargumento" }
    ]
  },
  {
    "slug": "ec_argumento",
    "title": "Argumento Central",
    "shortTitle": "Argumento",
    "phase": "interpretar",
    "module": "inventio",
    "group": "ec_argumento_grp",
    "groupLabel": "Argumento Central",
    "order": 402,
    "cards": [
      { "id": "tese_central", "title": "Tese central da carta" },
      { "id": "desenvolvimento", "title": "Desenvolvimento do argumento" },
      { "id": "climax", "title": "Clímax e resolução" }
    ]
  },

  // ── Estudo Temático ──────────────────────────────────────────────────────
  {
    "slug": "et_definicao",
    "title": "I. Definição do Tema",
    "shortTitle": "Definição",
    "phase": "preparar",
    "module": "inventio",
    "group": "et_definicao_grp",
    "groupLabel": "I. Definição do Tema",
    "order": 500,
    "cards": [
      { "id": "nome_tema", "title": "Nome e campo semântico" },
      { "id": "questao_orientadora", "title": "Questão orientadora" },
      { "id": "delimitacao", "title": "Delimitação do tema" }
    ]
  },
  {
    "slug": "et_at",
    "title": "II. Antigo Testamento",
    "shortTitle": "AT",
    "phase": "interpretar",
    "module": "inventio",
    "group": "et_at_grp",
    "groupLabel": "II. Antigo Testamento",
    "order": 501,
    "cards": [
      { "id": "patriarcal", "title": "Período patriarcal" },
      { "id": "mosaico", "title": "Período mosaico" },
      { "id": "profetico", "title": "Período profético" }
    ]
  },
  {
    "slug": "et_nt",
    "title": "III. Novo Testamento",
    "shortTitle": "NT",
    "phase": "interpretar",
    "module": "inventio",
    "group": "et_nt_grp",
    "groupLabel": "III. Novo Testamento",
    "order": 502,
    "cards": [
      { "id": "evangelhos", "title": "Evangelhos" },
      { "id": "cartas", "title": "Cartas apostólicas" },
      { "id": "apocalipse", "title": "Apocalipse" }
    ]
  },
  {
    "slug": "et_sintese_canonica",
    "title": "IV. Síntese Canônica",
    "shortTitle": "Síntese",
    "phase": "interpretar",
    "module": "inventio",
    "group": "et_sintese_grp",
    "groupLabel": "IV. Síntese Canônica",
    "order": 503,
    "cards": [
      { "id": "progressao", "title": "Progressão canônica" },
      { "id": "cumprimento", "title": "Cumprimento e tipologia" },
      { "id": "unidade", "title": "Unidade e diversidade" }
    ]
  },
  {
    "slug": "et_teologia_sistematica",
    "title": "V. Teologia Sistemática",
    "shortTitle": "Sistemática",
    "phase": "comunicar",
    "module": "dispositio",
    "group": "et_sistematica_grp",
    "groupLabel": "V. Teologia Sistemática",
    "order": 504,
    "cards": [
      { "id": "formulacao", "title": "Formulação doutrinária" },
      { "id": "implicacoes", "title": "Implicações práticas" }
    ]
  },
  {
    "slug": "et_aplicacoes",
    "title": "VI. Aplicações",
    "shortTitle": "Aplicações",
    "phase": "comunicar",
    "module": "dispositio",
    "group": "et_aplicacoes_grp",
    "groupLabel": "VI. Aplicações",
    "order": 505,
    "cards": [
      { "id": "vida_crista", "title": "Vida cristã" },
      { "id": "eclesial", "title": "Vida eclesial" },
      { "id": "missional", "title": "Missão" }
    ]
  }
]

export function getSectionNavBySlug(slug: string): SectionNav | undefined {
  return WORKSPACE_SECTIONS_NAV.find(s => s.slug === slug)
}

export function getSectionsByGroupNav(group: string): SectionNav[] {
  return WORKSPACE_SECTIONS_NAV.filter(s => s.group === group)
}
