// AUTO-GERADO por scripts/gen-sections-nav.mjs — não editar manualmente
// Contém apenas campos de navegação. Dados completos via /api/workspace/section/[slug]

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
    "order": -40
  },
  {
    "slug": "preparar_leia_assimile",
    "title": "2. Leia e Assimile a Ideia do Texto",
    "shortTitle": "Leia e Assimile",
    "phase": "preparar",
    "module": "inventio",
    "group": "preparar_assimilacao",
    "groupLabel": "Contato direto com a Escritura",
    "order": -39
  },
  {
    "slug": "preparar_primeiras_impressoes",
    "title": "3. Primeiras Impressões",
    "shortTitle": "Primeiras Impressões",
    "phase": "preparar",
    "module": "inventio",
    "group": "preparar_impressoes",
    "groupLabel": "Notas rápidas e perguntas",
    "order": -38
  },
  {
    "slug": "preparar_visao_geral",
    "title": "4. Visão Geral da Passagem",
    "shortTitle": "Visão Geral",
    "phase": "preparar",
    "module": "inventio",
    "group": "preparar_visao_geral",
    "groupLabel": "Assimilação macro",
    "order": -37
  },
  {
    "slug": "investigar_visao_geral",
    "title": "Visão Geral Investigativa",
    "shortTitle": "Visão Geral",
    "phase": "interpretar",
    "module": "inventio",
    "group": "investigar_visao_geral",
    "groupLabel": "Compreensão refinada após investigação",
    "order": -20
  },
  {
    "slug": "pregar_visao_geral",
    "title": "Visão Geral Homilética",
    "shortTitle": "Visão Geral",
    "phase": "comunicar",
    "module": "inventio",
    "group": "pregar_visao_geral",
    "groupLabel": "Síntese final para comunicação",
    "order": 5
  },
  {
    "slug": "contexto_historico",
    "title": "1.1 Contexto Histórico-Cultural",
    "shortTitle": "Histórico-Cultural",
    "module": "inventio",
    "group": "contextual",
    "groupLabel": "Estudo Contextual",
    "order": 1
  },
  {
    "slug": "autor_destinatarios",
    "title": "1.2 Autor e Destinatários",
    "shortTitle": "Autor e Destinatários",
    "module": "inventio",
    "group": "contextual",
    "groupLabel": "Estudo Contextual",
    "order": 2
  },
  {
    "slug": "ocasiao_proposito",
    "title": "1.3 Ocasião e Propósito",
    "shortTitle": "Ocasião e Propósito",
    "module": "inventio",
    "group": "contextual",
    "groupLabel": "Estudo Contextual",
    "order": 3
  },
  {
    "slug": "genero_literario",
    "title": "1.4 Gênero Literário",
    "shortTitle": "Gênero Literário",
    "module": "inventio",
    "group": "contextual",
    "groupLabel": "Estudo Contextual",
    "order": 4
  },
  {
    "slug": "estrutura_livro",
    "title": "1.5 Estrutura do Livro",
    "shortTitle": "Estrutura do Livro",
    "module": "inventio",
    "group": "contextual",
    "groupLabel": "Estudo Contextual",
    "order": 5
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
    "order": 6
  },
  {
    "slug": "traducao_textual",
    "title": "2.2 Tradução e Crítica Textual",
    "shortTitle": "Tradução",
    "module": "inventio",
    "group": "textual",
    "groupLabel": "Estudo Textual",
    "order": 7
  },
  {
    "slug": "analise_morfossintatica",
    "title": "2.3 Análise Morfossintática",
    "shortTitle": "Morfossintaxe",
    "module": "inventio",
    "group": "textual",
    "groupLabel": "Estudo Textual",
    "order": 8
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
    "order": 10
  },
  {
    "slug": "contexto_canonico",
    "title": "3.1 Contexto Canônico",
    "shortTitle": "Contexto Canônico",
    "module": "inventio",
    "group": "teologico",
    "groupLabel": "Estudo Teológico",
    "order": 11
  },
  {
    "slug": "progressao_revelacional",
    "title": "3.2 Progressão Revelacional",
    "shortTitle": "Progressão Revelacional",
    "module": "inventio",
    "group": "teologico",
    "groupLabel": "Estudo Teológico",
    "order": 12
  },
  {
    "slug": "sintese",
    "title": "§4 Síntese Exegética",
    "shortTitle": "Síntese",
    "module": "inventio",
    "group": "teologico",
    "groupLabel": "Estudo Teológico",
    "order": 13
  },
  {
    "slug": "grande_ideia_homiletica",
    "title": "1. Grande Ideia Homilética",
    "shortTitle": "Grande Ideia",
    "module": "dispositio",
    "group": "proposicao",
    "groupLabel": "Ideia e Proposição",
    "order": 14
  },
  {
    "slug": "introducao_sermao",
    "title": "2. Introdução",
    "shortTitle": "Introdução",
    "module": "dispositio",
    "group": "estrutura",
    "groupLabel": "Estrutura do Sermão",
    "order": 15
  },
  {
    "slug": "divisoes_sermao",
    "title": "3. Divisões do Sermão",
    "shortTitle": "Divisões",
    "module": "dispositio",
    "group": "estrutura",
    "groupLabel": "Estrutura do Sermão",
    "order": 16
  },
  {
    "slug": "transicoes",
    "title": "4. Transições",
    "shortTitle": "Transições",
    "module": "dispositio",
    "group": "estrutura",
    "groupLabel": "Estrutura do Sermão",
    "order": 17
  },
  {
    "slug": "aplicacao",
    "title": "5. Aplicação",
    "shortTitle": "Aplicação",
    "module": "dispositio",
    "group": "encerramento",
    "groupLabel": "Aplicação e Conclusão",
    "order": 18
  },
  {
    "slug": "conclusao_sermao",
    "title": "6. Conclusão",
    "shortTitle": "Conclusão",
    "module": "dispositio",
    "group": "encerramento",
    "groupLabel": "Aplicação e Conclusão",
    "order": 19
  },
  {
    "slug": "vocabulario_clareza",
    "title": "1. Vocabulário e Clareza",
    "shortTitle": "Vocabulário",
    "module": "elocutio",
    "group": "vocabulario",
    "groupLabel": "Vocabulário e Clareza",
    "order": 20
  },
  {
    "slug": "figuras_linguagem",
    "title": "2. Imagens e Retórica",
    "shortTitle": "Imagens",
    "module": "elocutio",
    "group": "imagens",
    "groupLabel": "Imagens e Retórica",
    "order": 21
  },
  {
    "slug": "tom_pastoral",
    "title": "3. Tom e Voz Pastoral",
    "shortTitle": "Tom",
    "module": "elocutio",
    "group": "tom",
    "groupLabel": "Tom e Voz Pastoral",
    "order": 22
  },
  {
    "slug": "internalizacao_estrutura",
    "title": "1. Internalização da Estrutura",
    "shortTitle": "Estrutura Mental",
    "module": "memoria",
    "group": "memorizacao",
    "groupLabel": "Internalização",
    "order": 23
  },
  {
    "slug": "pratica_revisao",
    "title": "2. Prática e Pré-pregação",
    "shortTitle": "Pré-pregação",
    "module": "memoria",
    "group": "memorizacao",
    "groupLabel": "Internalização",
    "order": 24
  },
  {
    "slug": "voz_dicao",
    "title": "1. Voz e Dicção",
    "shortTitle": "Voz",
    "module": "pronuntiatio",
    "group": "entrega",
    "groupLabel": "Entrega e Comunicação",
    "order": 25
  },
  {
    "slug": "linguagem_corporal",
    "title": "2. Linguagem Corporal e Presença",
    "shortTitle": "Linguagem Corporal",
    "module": "pronuntiatio",
    "group": "entrega",
    "groupLabel": "Entrega e Comunicação",
    "order": 26
  },
  {
    "slug": "avaliacao_pregacao",
    "title": "3. Avaliação Pós-pregação",
    "shortTitle": "Avaliação",
    "module": "pronuntiatio",
    "group": "avaliacao_pregacao",
    "groupLabel": "Avaliação",
    "order": 27
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
    "order": 100
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
    "order": 101
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
    "order": 102
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
    "order": 103
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
    "order": 104
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
    "order": 105
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
    "order": 120
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
    "order": 121
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
    "order": 122
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
    "order": 123
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
    "order": 124
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
    "order": 140
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
    "order": 141
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
    "order": 142
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
    "order": 143
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
    "order": 144
  },
  {
    "slug": "eb_preparacao",
    "title": "I.1 Preparação",
    "shortTitle": "Preparação",
    "phase": "preparar",
    "module": "inventio",
    "group": "eb_preparar",
    "groupLabel": "I. Preparar",
    "order": 100
  },
  {
    "slug": "eb_objetivos",
    "title": "I.2 Objetivos",
    "shortTitle": "Objetivos",
    "phase": "preparar",
    "module": "inventio",
    "group": "eb_preparar",
    "groupLabel": "I. Preparar",
    "order": 101
  },
  {
    "slug": "eb_texto_base",
    "title": "II.1 Texto-Base",
    "shortTitle": "Texto-Base",
    "phase": "preparar",
    "module": "inventio",
    "group": "eb_compreender",
    "groupLabel": "II. Compreender",
    "order": 102
  },
  {
    "slug": "eb_temas_termos",
    "title": "II.2 Temas e Termos",
    "shortTitle": "Temas e Termos",
    "phase": "preparar",
    "module": "inventio",
    "group": "eb_compreender",
    "groupLabel": "II. Compreender",
    "order": 103
  },
  {
    "slug": "eb_introducao",
    "title": "III.1 Introdução",
    "shortTitle": "Introdução",
    "phase": "comunicar",
    "module": "dispositio",
    "group": "eb_ensinar",
    "groupLabel": "III. Ensinar",
    "order": 104
  },
  {
    "slug": "eb_desenvolvimento",
    "title": "III.2 Desenvolvimento",
    "shortTitle": "Desenvolvimento",
    "phase": "comunicar",
    "module": "dispositio",
    "group": "eb_ensinar",
    "groupLabel": "III. Ensinar",
    "order": 105
  },
  {
    "slug": "eb_perguntas",
    "title": "III.3 Perguntas",
    "shortTitle": "Perguntas",
    "phase": "comunicar",
    "module": "dispositio",
    "group": "eb_ensinar",
    "groupLabel": "III. Ensinar",
    "order": 106
  },
  {
    "slug": "eb_dinamicas",
    "title": "III.4 Dinâmicas",
    "shortTitle": "Dinâmicas",
    "phase": "comunicar",
    "module": "dispositio",
    "group": "eb_ensinar",
    "groupLabel": "III. Ensinar",
    "order": 107
  },
  {
    "slug": "eb_aplicacoes",
    "title": "IV. Aplicações",
    "shortTitle": "Aplicações",
    "phase": "comunicar",
    "module": "elocutio",
    "group": "eb_aplicar",
    "groupLabel": "IV. Aplicar",
    "order": 108
  },
  {
    "slug": "eb_material",
    "title": "V. Material",
    "shortTitle": "Material",
    "phase": "comunicar",
    "module": "memoria",
    "group": "eb_recursos",
    "groupLabel": "V. Recursos",
    "order": 109
  },
  {
    "slug": "edt_definicao",
    "title": "I. Definição",
    "shortTitle": "Definição",
    "phase": "preparar",
    "module": "inventio",
    "group": "edt_definicao_grp",
    "groupLabel": "I. Definição",
    "order": 200
  },
  {
    "slug": "edt_fundamentacao_biblica",
    "title": "II. Fundamentação Bíblica",
    "shortTitle": "Fundamentação Bíblica",
    "phase": "interpretar",
    "module": "inventio",
    "group": "edt_fundamentacao_grp",
    "groupLabel": "II. Fundamentação Bíblica",
    "order": 201
  },
  {
    "slug": "edt_historia_doutrina",
    "title": "III. História da Doutrina",
    "shortTitle": "História",
    "phase": "interpretar",
    "module": "inventio",
    "group": "edt_historia_grp",
    "groupLabel": "III. História",
    "order": 202
  },
  {
    "slug": "edt_formulacao_sistematica",
    "title": "IV. Formulação Sistemática",
    "shortTitle": "Formulação Sistemática",
    "phase": "interpretar",
    "module": "inventio",
    "group": "edt_formulacao_grp",
    "groupLabel": "IV. Formulação Sistemática",
    "order": 203
  },
  {
    "slug": "edt_controversias",
    "title": "V. Controvérsias",
    "shortTitle": "Controvérsias",
    "phase": "interpretar",
    "module": "inventio",
    "group": "edt_controversias_grp",
    "groupLabel": "V. Controvérsias",
    "order": 204
  },
  {
    "slug": "edt_confissionalidade",
    "title": "VI. Confissionalidade",
    "shortTitle": "Confissionalidade",
    "phase": "interpretar",
    "module": "inventio",
    "group": "edt_confissionalidade_grp",
    "groupLabel": "VI. Confissionalidade",
    "order": 205
  },
  {
    "slug": "edt_aplicacoes",
    "title": "VII. Aplicações",
    "shortTitle": "Aplicações",
    "phase": "interpretar",
    "module": "inventio",
    "group": "edt_aplicacoes_grp",
    "groupLabel": "VII. Aplicações",
    "order": 206
  },
  {
    "slug": "edt_bibliografia",
    "title": "VIII. Bibliografia",
    "shortTitle": "Bibliografia",
    "phase": "interpretar",
    "module": "inventio",
    "group": "edt_bibliografia_grp",
    "groupLabel": "VIII. Bibliografia",
    "order": 207
  },
  {
    "slug": "et_definicao",
    "title": "I. Definição do Tema",
    "shortTitle": "Definição",
    "module": "inventio",
    "group": "et_definicao_grp",
    "groupLabel": "I. Definição do Tema",
    "order": 500
  },
  {
    "slug": "et_at",
    "title": "II. Antigo Testamento",
    "shortTitle": "Antigo Testamento",
    "module": "inventio",
    "group": "et_at_grp",
    "groupLabel": "II. Antigo Testamento",
    "order": 501
  },
  {
    "slug": "et_nt",
    "title": "III. Novo Testamento",
    "shortTitle": "Novo Testamento",
    "module": "inventio",
    "group": "et_nt_grp",
    "groupLabel": "III. Novo Testamento",
    "order": 502
  },
  {
    "slug": "et_sintese_canonica",
    "title": "IV. Síntese Canônica",
    "shortTitle": "Síntese",
    "module": "inventio",
    "group": "et_sintese_grp",
    "groupLabel": "IV. Síntese Canônica",
    "order": 503
  },
  {
    "slug": "et_teologia_sistematica",
    "title": "V. Teologia Sistemática",
    "shortTitle": "Sistemática",
    "module": "dispositio",
    "group": "et_sistematica_grp",
    "groupLabel": "V. Teologia Sistemática",
    "order": 504
  },
  {
    "slug": "et_aplicacoes",
    "title": "VI. Aplicações",
    "shortTitle": "Aplicações",
    "module": "dispositio",
    "group": "et_aplicacoes_grp",
    "groupLabel": "VI. Aplicações",
    "order": 505
  },
  {
    "slug": "ec_ocasiao",
    "title": "Ocasião e Propósito",
    "shortTitle": "Ocasião",
    "module": "inventio",
    "group": "ec_ocasiao_grp",
    "groupLabel": "Ocasião e Propósito",
    "order": 400
  },
  {
    "slug": "ec_estrutura",
    "title": "Estrutura Retórica",
    "shortTitle": "Estrutura Retórica",
    "module": "inventio",
    "group": "ec_estrutura_grp",
    "groupLabel": "Estrutura Retórica",
    "order": 401
  },
  {
    "slug": "ec_argumento",
    "title": "Argumento Central",
    "shortTitle": "Argumento",
    "module": "inventio",
    "group": "ec_argumento_grp",
    "groupLabel": "Argumento Central",
    "order": 402
  },
  {
    "slug": "ss_paralelismo",
    "title": "Paralelismo Poético",
    "shortTitle": "Paralelismo",
    "module": "inventio",
    "group": "ss_paralelismo_grp",
    "groupLabel": "Paralelismo Poético",
    "order": 500
  },
  {
    "slug": "ss_estrutura",
    "title": "Estrutura do Poema",
    "shortTitle": "Estrutura",
    "module": "inventio",
    "group": "ss_estrutura_grp",
    "groupLabel": "Estrutura Poética",
    "order": 501
  },
  {
    "slug": "ss_imagistica",
    "title": "Imagística e Metáforas",
    "shortTitle": "Imagística",
    "module": "inventio",
    "group": "ss_imagistica_grp",
    "groupLabel": "Imagística e Metáforas",
    "order": 502
  },
  {
    "slug": "ss_temas_sabedoria",
    "title": "Temas e Questões",
    "shortTitle": "Temas",
    "module": "inventio",
    "group": "ss_temas_grp",
    "groupLabel": "Temas e Questões",
    "order": 503
  },
  {
    "slug": "ss_teologia_adoracao",
    "title": "Teologia da Adoração",
    "shortTitle": "Teologia",
    "module": "inventio",
    "group": "ss_teologia_grp",
    "groupLabel": "Teologia da Adoração",
    "order": 504
  },
  {
    "slug": "pf_contexto",
    "title": "Contexto Histórico-Profético",
    "shortTitle": "Contexto",
    "module": "inventio",
    "group": "pf_contexto_grp",
    "groupLabel": "Contexto Histórico",
    "order": 600
  },
  {
    "slug": "pf_oraculo",
    "title": "O Oráculo",
    "shortTitle": "O Oráculo",
    "module": "inventio",
    "group": "pf_oraculo_grp",
    "groupLabel": "O Oráculo",
    "order": 601
  },
  {
    "slug": "pf_simbolos",
    "title": "Símbolos e Imagens Proféticas",
    "shortTitle": "Símbolos",
    "module": "inventio",
    "group": "pf_simbolos_grp",
    "groupLabel": "Símbolos e Imagens",
    "order": 602
  },
  {
    "slug": "pf_cumprimento",
    "title": "Cumprimento Canônico",
    "shortTitle": "Cumprimento",
    "module": "inventio",
    "group": "pf_cumprimento_grp",
    "groupLabel": "Cumprimento",
    "order": 603
  },
  {
    "slug": "pf_escatologia",
    "title": "Escatologia e Alianças",
    "shortTitle": "Escatologia",
    "module": "inventio",
    "group": "pf_escatologia_grp",
    "groupLabel": "Escatologia e Alianças",
    "order": 604
  },
  {
    "slug": "pt_tema",
    "title": "I. Tema e Problema",
    "shortTitle": "Tema e Problema",
    "phase": "preparar",
    "module": "inventio",
    "group": "pt_tema_grp",
    "groupLabel": "I. Tema e Problema",
    "order": 300
  },
  {
    "slug": "pt_hipotese",
    "title": "II. Hipótese",
    "shortTitle": "Hipótese",
    "phase": "preparar",
    "module": "inventio",
    "group": "pt_hipotese_grp",
    "groupLabel": "II. Hipótese",
    "order": 301
  },
  {
    "slug": "pt_revisao_bibliografica",
    "title": "III. Revisão Bibliográfica",
    "shortTitle": "Revisão Bibliográfica",
    "phase": "preparar",
    "module": "inventio",
    "group": "pt_revisao_grp",
    "groupLabel": "III. Revisão Bibliográfica",
    "order": 302
  },
  {
    "slug": "pt_exegese",
    "title": "IV. Exegese",
    "shortTitle": "Exegese",
    "phase": "preparar",
    "module": "inventio",
    "group": "pt_exegese_grp",
    "groupLabel": "IV. Exegese",
    "order": 303
  },
  {
    "slug": "pt_teologia_biblica",
    "title": "V. Teologia Bíblica",
    "shortTitle": "Teologia Bíblica",
    "phase": "preparar",
    "module": "inventio",
    "group": "pt_tb_grp",
    "groupLabel": "V. Teologia Bíblica",
    "order": 304
  },
  {
    "slug": "pt_teologia_sistematica",
    "title": "VI. Teologia Sistemática",
    "shortTitle": "Teologia Sistemática",
    "phase": "comunicar",
    "module": "dispositio",
    "group": "pt_ts_grp",
    "groupLabel": "VI. Teologia Sistemática",
    "order": 305
  },
  {
    "slug": "pt_interacao_autores",
    "title": "VII. Interação com Autores",
    "shortTitle": "Interação com Autores",
    "phase": "comunicar",
    "module": "dispositio",
    "group": "pt_interacao_grp",
    "groupLabel": "VII. Interação com Autores",
    "order": 306
  },
  {
    "slug": "pt_conclusoes",
    "title": "VIII. Conclusões",
    "shortTitle": "Conclusões",
    "phase": "comunicar",
    "module": "dispositio",
    "group": "pt_conclusoes_grp",
    "groupLabel": "VIII. Conclusões",
    "order": 307
  },
  {
    "slug": "pt_referencias",
    "title": "IX. Referências",
    "shortTitle": "Referências",
    "phase": "comunicar",
    "module": "dispositio",
    "group": "pt_referencias_grp",
    "groupLabel": "IX. Referências",
    "order": 308
  }
]

export function getSectionNavBySlug(slug: string): SectionNav | undefined {
  return WORKSPACE_SECTIONS_NAV.find(s => s.slug === slug)
}

export function getSectionsByGroupNav(group: string): SectionNav[] {
  return WORKSPACE_SECTIONS_NAV.filter(s => s.group === group)
}
