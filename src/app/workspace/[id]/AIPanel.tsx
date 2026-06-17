'use client'

import { useState, useRef, useEffect } from 'react'
import type { Project } from '@/types/database'
import type { SectionDef } from '@/lib/workspace-sections'
import { getToolAreaBySlug } from '@/lib/tools-content'
import MarkdownRenderer from '@/components/MarkdownRenderer'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  project: Project
  activeSlug: string
  activeTitle: string
  context: string
  onClearContext: () => void
  sectionDef?: SectionDef | null
}

// ── Action types ──────────────────────────────────────────────────────────────
type Action = { label: string; prompt: string }

function getGlobalActions(sectionTitle: string, ref: string): Action[] {
  return [
    { label: 'Avaliar', prompt: `Avalie criticamente o que escrevi em "${sectionTitle}" para ${ref}.` },
    { label: 'Melhorar', prompt: `Melhore o texto que escrevi em "${sectionTitle}" para ${ref}.` },
    { label: 'Corrigir', prompt: `Corrija erros e imprecisões no que escrevi em "${sectionTitle}" para ${ref}.` },
  ]
}

function getPhaseActions(sectionDef: SectionDef | null | undefined, ref: string, studyMode: string): Action[] {
  if (sectionDef?.phase !== 'comunicar') return []

  if (studyMode === 'sermao') {
    return [
      { label: 'Introdução', prompt: `Escreva uma introdução homilética impactante para ${ref}.` },
      { label: 'Transição', prompt: `Crie transições que conectam organicamente os pontos do sermão de ${ref}.` },
      { label: 'Ilustração', prompt: `Sugira ilustrações contemporâneas e bíblicas que clarificam a mensagem de ${ref}.` },
      { label: 'Aplicação', prompt: `Transforme a teologia de ${ref} em aplicações pastorais concretas.` },
      { label: 'Conclusão', prompt: `Escreva uma conclusão que chame à decisão a partir de ${ref}.` },
      { label: 'Esboço', prompt: `Produza um esboço estruturado e completo do sermão sobre ${ref}.` },
      { label: 'Sermão completo', prompt: `Produza um sermão expositivo completo e detalhado sobre ${ref}.` },
    ]
  }
  if (studyMode === 'estudo_biblico') {
    return [
      { label: 'Introdução ao estudo', prompt: `Escreva uma introdução envolvente para o estudo de ${ref}.` },
      { label: 'Perguntas de discussão', prompt: `Crie perguntas de discussão para o estudo de ${ref}.` },
      { label: 'Aplicação', prompt: `Crie perguntas de aplicação para ${ref}.` },
      { label: 'Material de apoio', prompt: `Que material de apoio pode enriquecer o estudo de ${ref}?` },
    ]
  }
  if (studyMode === 'devocional') {
    return [
      { label: 'Reflexão devocional', prompt: `Escreva uma reflexão devocional sobre ${ref}.` },
      { label: 'Aplicação pessoal', prompt: `Como ${ref} nutre a vida devocional do crente hoje?` },
      { label: 'Oração', prompt: `Escreva uma oração que responde à mensagem de ${ref}.` },
    ]
  }
  if (studyMode === 'comentario_exegetico') {
    return [
      { label: 'Síntese exegética', prompt: `Sintetize as principais descobertas exegéticas de ${ref} para o comentário.` },
      { label: 'Comentário versículo a versículo', prompt: `Desenvolva um comentário expositivo versículo a versículo de ${ref}.` },
      { label: 'Implicações doutrinárias', prompt: `Quais as implicações doutrinárias a destacar no comentário de ${ref}?` },
    ]
  }
  if (studyMode === 'estudo_de_carta') {
    return [
      { label: 'Síntese epistolar', prompt: `Sintetize o argumento epistolar de ${ref} para comunicação.` },
      { label: 'Implicações para a comunidade', prompt: `Quais as implicações de ${ref} para a comunidade cristã hoje?` },
    ]
  }
  // Todos os outros modos (exegese, narrativas, termos, doutrinário, temático, profecias, salmos):
  // síntese teológica genérica, nunca ações homiléticas
  return [
    { label: 'Sintetizar descobertas', prompt: `Sintetize as principais descobertas desta análise de ${ref}.` },
    { label: 'Implicações teológicas', prompt: `Quais as implicações teológicas centrais de ${ref}?` },
  ]
}

function getSectionActions(slug: string, ref: string, sectionDef?: SectionDef | null, studyMode = ''): Action[] {
  const toolArea = getToolAreaBySlug(slug)
  if (toolArea) {
    return toolArea.actions.slice(0, 5).map(a => ({ label: a.label ?? a.prompt.slice(0, 35), prompt: a.prompt }))
  }

  if (slug.startsWith('et_')) {
    const map: Record<string, Action[]> = {
      et_definicao: [
        { label: 'Definir termo', prompt: `Defina o termo bíblico central de ${ref} com precisão lexical e etimológica.` },
        { label: 'Usos canônicos', prompt: `Quais são os principais usos deste termo no Antigo e Novo Testamento?` },
        { label: 'Nuances semânticas', prompt: `Explique as nuances semânticas deste termo em ${ref}.` },
        { label: 'Uso teológico', prompt: `Como este termo funciona teologicamente na história da redenção?` },
      ],
      et_ocorrencias: [
        { label: 'Ocorrências AT', prompt: `Liste as ocorrências deste termo no Antigo Testamento com contexto.` },
        { label: 'Ocorrências NT', prompt: `Liste as ocorrências deste termo no Novo Testamento com contexto.` },
        { label: 'Padrões de uso', prompt: `Identifique padrões e variações no uso deste termo ao longo do cânon.` },
      ],
      et_at: [
        { label: 'Uso no AT', prompt: `Como este termo é usado no Antigo Testamento em ${ref}?` },
        { label: 'Contexto hebraico', prompt: `Qual o significado do equivalente hebraico neste contexto?` },
        { label: 'Progressão histórica', prompt: `Como o uso deste termo evolui ao longo do AT?` },
      ],
      et_nt: [
        { label: 'Uso no NT', prompt: `Como este termo é usado no Novo Testamento?` },
        { label: 'Contexto grego', prompt: `Qual o significado do equivalente grego neste contexto?` },
        { label: 'Relação AT-NT', prompt: `Como o NT retoma ou desenvolve este termo do AT?` },
      ],
      et_teologia_biblica: [
        { label: 'Progressão canônica', prompt: `Como este conceito se desenvolve teologicamente do AT ao NT?` },
        { label: 'Relação com Cristo', prompt: `Como este conceito aponta para a pessoa e obra de Cristo?` },
        { label: 'História da Redenção', prompt: `Qual o lugar deste conceito na história da redenção?` },
      ],
      et_teologia_sistematica: [
        { label: 'Loci dogmáticos', prompt: `Em quais loci da teologia sistemática este conceito aparece e como?` },
        { label: 'Confissões Reformadas', prompt: `Como as Confissões Reformadas (Westminster, Belga, Heidelberg) tratam este conceito?` },
        { label: 'Debates históricos', prompt: `Quais foram os principais debates teológicos históricos sobre este conceito?` },
      ],
      et_relacao_cristo: [
        { label: 'Tipologia', prompt: `Como este conceito tipifica a pessoa e obra de Cristo?` },
        { label: 'Cumprimento em Cristo', prompt: `Como este conceito encontra seu cumprimento em Cristo?` },
        { label: 'Implicações redentivas', prompt: `Que implicações redentivas este conceito tem para o crente?` },
      ],
      et_sintese_canonica: [
        { label: 'Síntese canônica', prompt: `Sintetize o uso e desenvolvimento deste termo em todo o cânon.` },
        { label: 'Ideia central', prompt: `Qual a ideia teológica central que este termo carrega?` },
      ],
      et_implicacoes: [
        { label: 'Implicações doutrinárias', prompt: `Quais as implicações doutrinárias deste conceito?` },
        { label: 'Relevância atual', prompt: `Como este conceito bíblico é relevante para a vida cristã atual?` },
      ],
      et_aplicacoes: [
        { label: 'Refinar definição', prompt: `Como posso refinar e aprimorar a definição deste termo?` },
        { label: 'Aplicação prática', prompt: `Quais as aplicações práticas deste conceito para a vida cristã?` },
        { label: 'Consolidar estudo', prompt: `Consolide o estudo deste termo sintetizando as principais descobertas.` },
      ],
      et_desenvolvimento: [
        { label: 'Desenvolver conceito', prompt: `Ajude a desenvolver este conceito com profundidade teológica.` },
        { label: 'Pontos centrais', prompt: `Quais os pontos centrais a destacar nesta seção?` },
      ],
    }
    return map[slug] ?? [
      { label: 'Analisar contexto', prompt: `Analise o contexto de uso deste termo em ${ref}.` },
      { label: 'Relações doutrinárias', prompt: `Que relações doutrinárias este termo estabelece em ${ref}?` },
      { label: 'Uso teológico', prompt: `Como este termo funciona teologicamente nesta seção?` },
      { label: 'Consolidar estudo', prompt: `Consolide as descobertas sobre este termo.` },
    ]
  }

  if (slug.startsWith('nr_')) {
    const map: Record<string, Action[]> = {
      nr_ctx_historico: [
        { label: 'Contexto histórico', prompt: `Descreva o contexto histórico de ${ref}.` },
        { label: 'Contexto cultural', prompt: `Quais aspectos culturais são relevantes para ${ref}?` },
        { label: 'Autor e destinatários', prompt: `Quem escreveu ${ref} e a quem se destinava?` },
        { label: 'Geografia', prompt: `Quais os elementos geográficos relevantes para ${ref}?` },
        { label: 'Costumes e práticas', prompt: `Que costumes e práticas culturais iluminam ${ref}?` },
      ],
      nr_ctx_literario: [
        { label: 'Contexto literário', prompt: `Qual o contexto literário imediato de ${ref}?` },
        { label: 'Gênero narrativo', prompt: `Que tipo de narrativa é ${ref} e quais suas convenções literárias?` },
        { label: 'Posição no livro', prompt: `Qual o papel desta passagem na estrutura do livro?` },
      ],
      nr_ctx_canonico: [
        { label: 'Relação canônica', prompt: `Como ${ref} se relaciona com o restante do cânon?` },
        { label: 'Progressão redentiva', prompt: `Qual o lugar de ${ref} na história da redenção?` },
        { label: 'Padrões tipológicos', prompt: `Que padrões tipológicos aparecem em ${ref}?` },
      ],
      nr_txt_original: [
        { label: 'Texto original', prompt: `Analise aspectos relevantes do texto original hebraico/grego de ${ref}.` },
        { label: 'Termos-chave', prompt: `Quais os termos-chave no original de ${ref}?` },
      ],
      nr_txt_estrutura: [
        { label: 'Detectar divisões', prompt: `Identifique as divisões estruturais naturais da narrativa de ${ref}.` },
        { label: 'Esboço mecânico', prompt: `Produza um esboço mecânico da narrativa de ${ref}.` },
        { label: 'Personagens', prompt: `Quem são os personagens de ${ref} e como se relacionam?` },
        { label: 'Tensão narrativa', prompt: `Qual a tensão narrativa central em ${ref}?` },
        { label: 'Clímax', prompt: `Onde está o clímax da narrativa de ${ref}?` },
        { label: 'Repetições', prompt: `Quais elementos ou palavras se repetem em ${ref} e por quê?` },
      ],
      nr_txt_exegese: [
        { label: 'Exegese narrativa', prompt: `Faça uma exegese narrativa de ${ref}.` },
        { label: 'Ponto de vista', prompt: `Qual o ponto de vista narrativo e sua função em ${ref}?` },
        { label: 'Ironia e subtexto', prompt: `Há ironia ou subtexto teológico em ${ref}?` },
      ],
      nr_txt_mensagem: [
        { label: 'Mensagem original', prompt: `Qual a mensagem de ${ref} para seus destinatários originais?` },
        { label: 'Intenção autoral', prompt: `Qual a intenção teológica do autor ao escrever ${ref}?` },
      ],
      nr_personagens: [
        { label: 'Caracterização', prompt: `Como os personagens de ${ref} são caracterizados pelo narrador?` },
        { label: 'Desenvolvimento', prompt: `Como os personagens se desenvolvem ao longo de ${ref}?` },
        { label: 'Funções narrativas', prompt: `Quais funções narrativas cada personagem cumpre em ${ref}?` },
      ],
      nr_enredo: [
        { label: 'Estrutura do enredo', prompt: `Analise a estrutura do enredo de ${ref}.` },
        { label: 'Complicação e resolução', prompt: `Qual a complicação e como ela é resolvida em ${ref}?` },
        { label: 'Tensão e clímax', prompt: `Trace a tensão e o clímax da narrativa de ${ref}.` },
      ],
      nr_cenario: [
        { label: 'Cenário narrativo', prompt: `Analise o cenário e o ambiente da narrativa de ${ref}.` },
        { label: 'Função do cenário', prompt: `Como o cenário contribui para a mensagem de ${ref}?` },
      ],
      nr_narrador: [
        { label: 'Ponto de vista', prompt: `Que ponto de vista narrativo é usado em ${ref}?` },
        { label: 'Recursos do narrador', prompt: `Que recursos narrativos o autor usa em ${ref}?` },
      ],
      nr_dialogo: [
        { label: 'Função dos diálogos', prompt: `Qual a função dos diálogos na narrativa de ${ref}?` },
        { label: 'Revelar caráter', prompt: `O que os diálogos revelam sobre os personagens de ${ref}?` },
      ],
      nr_teo_redentor: [
        { label: 'Elemento redentor', prompt: `Qual o elemento redentor central de ${ref}?` },
        { label: 'Cristo na narrativa', prompt: `Como ${ref} aponta para Cristo tipologicamente?` },
        { label: 'História da redenção', prompt: `Qual o lugar de ${ref} na história da redenção?` },
      ],
      nr_teo_doutrinas: [
        { label: 'Doutrinas implícitas', prompt: `Que doutrinas estão implícitas ou ensinadas em ${ref}?` },
        { label: 'Aplicação doutrinária', prompt: `Como as doutrinas de ${ref} se aplicam à vida cristã?` },
      ],
      nr_teo_implicacoes: [
        { label: 'Implicações teológicas', prompt: `Quais as implicações teológicas de ${ref}?` },
        { label: 'Aplicação pastoral', prompt: `Que aplicações pastorais emergem de ${ref}?` },
      ],
      nr_ivg_ideia: [
        { label: 'Grande ideia', prompt: `Qual a grande ideia teológica da narrativa de ${ref}?` },
        { label: 'Proposição central', prompt: `Formule uma proposição central para ${ref}.` },
      ],
      nr_ivg_verdades: [
        { label: 'Verdades centrais', prompt: `Quais as verdades centrais que emergem de ${ref}?` },
        { label: 'Pontos de ensino', prompt: `Quais os pontos de ensino da narrativa de ${ref}?` },
      ],
      nr_ivg_aplic: [
        { label: 'Aplicações pastorais', prompt: `Que aplicações pastorais concretas emergem de ${ref}?` },
        { label: 'Relevância atual', prompt: `Como a narrativa de ${ref} é relevante para o crente hoje?` },
      ],
      nr_teologia: [
        { label: 'Teologia bíblica', prompt: `Qual a contribuição de ${ref} para a teologia bíblica?` },
        { label: 'Teologia sistemática', prompt: `Que tópicos sistemáticos são iluminados por ${ref}?` },
        { label: 'Relação com Cristo', prompt: `Como ${ref} aponta para Cristo?` },
      ],
      nr_preparar_visao_geral: [
        { label: 'Visão geral', prompt: `Dê uma visão geral da narrativa de ${ref}.` },
        { label: 'Primeiras impressões', prompt: `Quais suas primeiras impressões sobre ${ref}?` },
      ],
      nr_preparar_primeiras_impressoes: [
        { label: 'Primeiras impressões', prompt: `Quais suas primeiras impressões sobre ${ref}?` },
        { label: 'Perguntas iniciais', prompt: `Que perguntas surgem numa primeira leitura de ${ref}?` },
      ],
    }
    return map[slug] ?? [
      { label: 'Análise narrativa', prompt: `Faça uma análise narrativa de ${ref}.` },
      { label: 'Personagens', prompt: `Quem são os personagens de ${ref} e quais suas funções?` },
      { label: 'Tensão narrativa', prompt: `Qual a tensão central na narrativa de ${ref}?` },
      { label: 'Mensagem teológica', prompt: `Qual a mensagem teológica de ${ref}?` },
    ]
  }

  if (slug.startsWith('ss_')) {
    const map: Record<string, Action[]> = {
      ss_paralelismo: [
        { label: 'Identificar paralelismos', prompt: `Identifique e classifique os paralelismos em ${ref}.` },
        { label: 'Tipos de paralelismo', prompt: `Que tipos de paralelismo aparecem em ${ref}?` },
        { label: 'Efeito poético', prompt: `Qual o efeito poético dos paralelismos em ${ref}?` },
      ],
      ss_estrutura: [
        { label: 'Estrutura do Salmo', prompt: `Analise a estrutura do salmo em ${ref}.` },
        { label: 'Divisão em estrofes', prompt: `Divida ${ref} em estrofes e explique a progressão.` },
        { label: 'Progressão temática', prompt: `Qual a progressão temática ao longo de ${ref}?` },
      ],
      ss_imagistica: [
        { label: 'Imagens e metáforas', prompt: `Identifique as principais imagens e metáforas em ${ref}.` },
        { label: 'Simbolismo', prompt: `O que os símbolos de ${ref} comunicam ao leitor?` },
        { label: 'Força expressiva', prompt: `Como as imagens de ${ref} reforçam a mensagem?` },
      ],
      ss_temas_sabedoria: [
        { label: 'Tema da sabedoria', prompt: `Qual o tema central da sabedoria em ${ref}?` },
        { label: 'Temor ao SENHOR', prompt: `Como o temor ao SENHOR aparece em ${ref}?` },
        { label: 'Sabedoria prática', prompt: `Que princípios de sabedoria prática emergem de ${ref}?` },
      ],
      ss_teologia_adoracao: [
        { label: 'Teologia da adoração', prompt: `Que teologia da adoração emerge de ${ref}?` },
        { label: 'Uso litúrgico', prompt: `Como ${ref} era usado no culto de Israel?` },
        { label: 'Adoração cristã', prompt: `Como ${ref} nutre a adoração cristã hoje?` },
      ],
    }
    return map[slug] ?? [
      { label: 'Análise poética', prompt: `Analise os recursos poéticos de ${ref}.` },
      { label: 'Teologia do Salmo', prompt: `Qual a teologia central de ${ref}?` },
      { label: 'Aplicação devocional', prompt: `Como ${ref} nutre a vida devocional do crente?` },
    ]
  }

  if (slug.startsWith('pf_')) {
    const map: Record<string, Action[]> = {
      pf_contexto: [
        { label: 'Contexto histórico', prompt: `Qual o contexto histórico do oráculo em ${ref}?` },
        { label: 'Crise histórica', prompt: `Que crise histórica motivou a profecia de ${ref}?` },
        { label: 'Profeta e audiência', prompt: `Quem era o profeta e qual sua audiência em ${ref}?` },
      ],
      pf_oraculo: [
        { label: 'Tipo de oráculo', prompt: `Que tipo de oráculo profético é ${ref}?` },
        { label: 'Estrutura do oráculo', prompt: `Analise a estrutura do oráculo em ${ref}.` },
        { label: 'Mensagem imediata', prompt: `Qual a mensagem imediata de ${ref} para seus destinatários?` },
      ],
      pf_simbolos: [
        { label: 'Simbolismo profético', prompt: `Identifique e interprete os símbolos proféticos em ${ref}.` },
        { label: 'Imagens apocalípticas', prompt: `Quais imagens apocalípticas aparecem em ${ref} e o que significam?` },
      ],
      pf_cumprimento: [
        { label: 'Cumprimento histórico', prompt: `Como ${ref} foi cumprido historicamente?` },
        { label: 'Cumprimento em Cristo', prompt: `Como ${ref} aponta para o cumprimento em Cristo?` },
        { label: 'Cumprimento escatológico', prompt: `Há dimensão de cumprimento futuro em ${ref}?` },
      ],
      pf_escatologia: [
        { label: 'Dimensão escatológica', prompt: `Qual a dimensão escatológica de ${ref}?` },
        { label: 'Esperança messiânica', prompt: `Como ${ref} expressa esperança messiânica?` },
        { label: 'Escatologia reformada', prompt: `Como a hermenêutica reformada interpreta ${ref}?` },
      ],
    }
    return map[slug] ?? [
      { label: 'Contexto profético', prompt: `Qual o contexto histórico e literário da profecia em ${ref}?` },
      { label: 'Mensagem profética', prompt: `Qual a mensagem central do profeta em ${ref}?` },
      { label: 'Cumprimento em Cristo', prompt: `Como ${ref} se cumpre em Cristo?` },
    ]
  }

  if (slug.startsWith('ec_')) {
    const map: Record<string, Action[]> = {
      ec_ocasiao: [
        { label: 'Ocasião da carta', prompt: `Qual a ocasião e motivação para a escrita desta carta em ${ref}?` },
        { label: 'Destinatários', prompt: `Quem eram os destinatários e qual sua situação em ${ref}?` },
        { label: 'Contexto histórico', prompt: `Qual o contexto histórico da carta em ${ref}?` },
      ],
      ec_estrutura: [
        { label: 'Estrutura epistolar', prompt: `Analise a estrutura da carta em ${ref}.` },
        { label: 'Argumento central', prompt: `Qual o argumento central desenvolvido em ${ref}?` },
        { label: 'Posição no livro', prompt: `Qual o papel desta seção na estrutura geral da carta?` },
      ],
      ec_argumento: [
        { label: 'Lógica do argumento', prompt: `Trace a lógica do argumento em ${ref}.` },
        { label: 'Conexões internas', prompt: `Quais as conexões internas do argumento em ${ref}?` },
        { label: 'Fundamento teológico', prompt: `Qual o fundamento teológico do argumento em ${ref}?` },
      ],
    }
    return map[slug] ?? [
      { label: 'Contexto da carta', prompt: `Qual o contexto histórico e ocasião de ${ref}?` },
      { label: 'Argumento', prompt: `Qual o argumento teológico de ${ref}?` },
    ]
  }

  if (slug.startsWith('pt_')) {
    const map: Record<string, Action[]> = {
      pt_tema: [
        { label: 'Delimitar tema', prompt: `Ajude a delimitar e formular o tema de pesquisa.` },
        { label: 'Relevância teológica', prompt: `Qual a relevância teológica deste tema de pesquisa?` },
        { label: 'Questão central', prompt: `Qual deve ser a questão central desta pesquisa?` },
      ],
      pt_hipotese: [
        { label: 'Formular hipótese', prompt: `Ajude a formular uma hipótese de pesquisa clara e testável.` },
        { label: 'Argumentos prévios', prompt: `Que argumentos já existem sobre esta hipótese na literatura teológica?` },
      ],
      pt_revisao_bibliografica: [
        { label: 'Autores relevantes', prompt: `Quais os principais autores e obras sobre este tema?` },
        { label: 'Estado da questão', prompt: `Qual o estado atual da questão na teologia?` },
        { label: 'Lacunas bibliográficas', prompt: `Quais as lacunas na literatura existente sobre este tema?` },
      ],
      pt_exegese: [
        { label: 'Passagens-chave', prompt: `Quais as passagens-chave para este tema em ${ref}?` },
        { label: 'Análise exegética', prompt: `Faça uma análise exegética das passagens centrais.` },
      ],
      pt_teologia_biblica: [
        { label: 'Desenvolvimento canônico', prompt: `Como este tema se desenvolve ao longo do cânon?` },
        { label: 'Teologia do AT e NT', prompt: `Como o AT e o NT tratam este tema?` },
      ],
      pt_teologia_sistematica: [
        { label: 'Loci sistemáticos', prompt: `Em quais loci sistemáticos este tema aparece?` },
        { label: 'Confissões Reformadas', prompt: `Como as Confissões Reformadas abordam este tema?` },
      ],
      pt_interacao_autores: [
        { label: 'Posições divergentes', prompt: `Quais as principais posições divergentes sobre este tema?` },
        { label: 'Avaliar argumentos', prompt: `Ajude a avaliar os argumentos dos autores sobre este tema.` },
      ],
      pt_conclusoes: [
        { label: 'Sintetizar conclusões', prompt: `Ajude a sintetizar as conclusões da pesquisa.` },
        { label: 'Implicações', prompt: `Quais as implicações teológicas e práticas desta pesquisa?` },
      ],
      pt_referencias: [
        { label: 'Formatar referências', prompt: `Ajude a organizar as referências bibliográficas.` },
        { label: 'Verificar consistência', prompt: `Verifique a consistência das referências.` },
      ],
    }
    return map[slug] ?? [
      { label: 'Desenvolver argumento', prompt: `Ajude a desenvolver o argumento desta seção da pesquisa.` },
      { label: 'Verificar consistência', prompt: `Verifique a consistência teológica do argumento.` },
    ]
  }

  if (slug.startsWith('eb_')) {
    const map: Record<string, Action[]> = {
      eb_preparacao: [
        { label: 'Preparar estudo', prompt: `Como preparar um estudo bíblico eficaz sobre ${ref}?` },
        { label: 'Objetivos', prompt: `Quais objetivos de aprendizado definir para o estudo de ${ref}?` },
      ],
      eb_texto_base: [
        { label: 'Observações do texto', prompt: `Faça observações do texto de ${ref}.` },
        { label: 'Perguntas de descoberta', prompt: `Sugira perguntas de descoberta para ${ref}.` },
      ],
      eb_temas_termos: [
        { label: 'Termos-chave', prompt: `Quais os termos-chave de ${ref} para explorar no estudo?` },
        { label: 'Temas centrais', prompt: `Quais os temas centrais de ${ref}?` },
      ],
      eb_objetivos: [
        { label: 'Objetivos do estudo', prompt: `Formule objetivos de aprendizado claros para o estudo de ${ref}.` },
        { label: 'Resultados esperados', prompt: `Que resultados esperar após o estudo de ${ref}?` },
      ],
      eb_perguntas: [
        { label: 'Perguntas abertas', prompt: `Sugira perguntas abertas para discussão de ${ref}.` },
        { label: 'Perguntas de reflexão', prompt: `Crie perguntas de reflexão profunda para ${ref}.` },
      ],
      eb_dinamicas: [
        { label: 'Dinâmicas de grupo', prompt: `Sugira dinâmicas de grupo para o estudo de ${ref}.` },
        { label: 'Atividades práticas', prompt: `Que atividades práticas podem enriquecer o estudo de ${ref}?` },
      ],
      eb_material: [
        { label: 'Material de apoio', prompt: `Que material de apoio pode enriquecer o estudo de ${ref}?` },
        { label: 'Recursos visuais', prompt: `Que recursos visuais usar para ${ref}?` },
      ],
    }
    return map[slug] ?? [
      { label: 'Preparar estudo', prompt: `Como preparar um bom estudo bíblico sobre ${ref}?` },
      { label: 'Perguntas de discussão', prompt: `Sugira perguntas de discussão para ${ref}.` },
    ]
  }

  const bySlug: Record<string, Action[]> = {
    contexto_historico: [
      { label: 'Contexto histórico', prompt: `Descreva o contexto histórico de ${ref}.` },
      { label: 'Contexto cultural', prompt: `Quais os aspectos culturais relevantes para ${ref}?` },
      { label: 'Autor e destinatários', prompt: `Quem escreveu ${ref} e a quem se destinava?` },
      { label: 'Costumes e práticas', prompt: `Que costumes e práticas culturais iluminam ${ref}?` },
    ],
    autor_destinatarios: [
      { label: 'Perfil do autor', prompt: `Quem é o autor de ${ref} e qual seu contexto de vida?` },
      { label: 'Destinatários', prompt: `Quem eram os destinatários e qual sua situação em ${ref}?` },
      { label: 'Propósito', prompt: `Qual o propósito do autor ao escrever ${ref}?` },
    ],
    estrutura_livro: [
      { label: 'Estrutura do livro', prompt: `Qual a estrutura geral do livro onde se encontra ${ref}?` },
      { label: 'Posição da passagem', prompt: `Qual o papel de ${ref} na estrutura do livro?` },
      { label: 'Temas do livro', prompt: `Quais os temas centrais do livro?` },
    ],
    texto_original: [
      { label: 'Texto original', prompt: `Analise aspectos do texto original (hebraico/grego) de ${ref}.` },
      { label: 'Variantes textuais', prompt: `Há variantes textuais significativas em ${ref}?` },
      { label: 'Comparar traduções', prompt: `Compare as principais traduções de ${ref}.` },
    ],
    defesa_pericope: [
      { label: 'Delimitar perícope', prompt: `Justifique a delimitação da perícope de ${ref}.` },
      { label: 'Marcadores textuais', prompt: `Quais marcadores textuais delimitam ${ref}?` },
    ],
    esboco_mecanico: [
      { label: 'Esboço mecânico', prompt: `Produza um esboço mecânico de ${ref}.` },
      { label: 'Estrutura gramatical', prompt: `Trace a estrutura gramatical e lógica de ${ref}.` },
      { label: 'Proposição principal', prompt: `Qual a proposição principal de ${ref}?` },
    ],
    comentario_exegetico: [
      { label: 'Comentário exegético', prompt: `Faça um comentário exegético versículo por versículo de ${ref}.` },
      { label: 'Dificuldades exegéticas', prompt: `Quais as principais dificuldades exegéticas de ${ref}?` },
      { label: 'Mensagem do autor', prompt: `Qual a mensagem que o autor pretendia comunicar em ${ref}?` },
    ],
    mensagem_epoca_escrita: [
      { label: 'Mensagem original', prompt: `Qual a mensagem de ${ref} para seus destinatários originais?` },
      { label: 'Contexto de recepção', prompt: `Como os destinatários originais receberiam ${ref}?` },
    ],
    teologia_biblica: [
      { label: 'Teologia Bíblica', prompt: `Qual a contribuição de ${ref} para a teologia bíblica?` },
      { label: 'Progressão revelacional', prompt: `Como ${ref} avança a história da redenção?` },
      { label: 'Relação com Cristo', prompt: `Como ${ref} aponta para a pessoa e obra de Cristo?` },
    ],
    teologia_sistematica: [
      { label: 'Teologia Sistemática', prompt: `Que tópicos sistemáticos são iluminados por ${ref}?` },
      { label: 'Confissões Reformadas', prompt: `Como as Confissões Reformadas tratam os temas de ${ref}?` },
      { label: 'Loci teológicos', prompt: `Em quais loci sistemáticos ${ref} contribui?` },
    ],
    teologia_pratica: [
      { label: 'Implicações práticas', prompt: `Quais as implicações práticas da teologia de ${ref}?` },
      { label: 'Aplicação pastoral', prompt: `Como aplicar pastoralmente as verdades de ${ref}?` },
      { label: 'História da Redenção', prompt: `Como ${ref} se situa na história da redenção?` },
    ],
    sintese: [
      { label: 'Síntese exegética', prompt: `Sintetize as principais descobertas exegéticas de ${ref}.` },
      { label: 'Ideia central', prompt: `Qual a ideia central e irredutível de ${ref}?` },
      { label: 'Implicações', prompt: `Quais as implicações teológicas e práticas de ${ref}?` },
    ],
    grande_ideia_homiletica: studyMode === 'sermao' ? [
      { label: 'Grande ideia', prompt: `Formule a grande ideia homilética de ${ref}.` },
      { label: 'Proposição', prompt: `Escreva a proposição central do sermão de ${ref}.` },
      { label: 'Ponto de contato', prompt: `Como conectar a grande ideia de ${ref} com a audiência contemporânea?` },
    ] : [
      { label: 'Ideia central', prompt: `Qual a ideia central e irredutível de ${ref}?` },
      { label: 'Síntese', prompt: `Sintetize as principais descobertas de ${ref}.` },
    ],
    sermao_inventio: studyMode === 'sermao' ? [
      { label: 'Grande ideia', prompt: `Formule a grande ideia homilética de ${ref}.` },
      { label: 'Proposição central', prompt: `Escreva a proposição central do sermão de ${ref}.` },
      { label: 'Aplicações', prompt: `Identifique aplicações pastorais de ${ref}.` },
    ] : [
      { label: 'Ideia central', prompt: `Qual a ideia central de ${ref}?` },
      { label: 'Aplicações', prompt: `Que aplicações emergem de ${ref}?` },
    ],
    sermao_dispositio: studyMode === 'sermao' ? [
      { label: 'Divisões homiléticas', prompt: `Sugira divisões homiléticas para ${ref} a partir da exegese.` },
      { label: 'Estrutura do sermão', prompt: `Avalie se a estrutura do sermão progride organicamente da exegese.` },
      { label: 'Transições', prompt: `Crie transições que conectam os pontos do sermão de ${ref}.` },
      { label: 'Esboço completo', prompt: `Produza um esboço completo e estruturado do sermão sobre ${ref}.` },
    ] : [
      { label: 'Estrutura do conteúdo', prompt: `Avalie a estrutura e progressão do conteúdo de ${ref}.` },
      { label: 'Pontos centrais', prompt: `Quais os pontos centrais de ${ref}?` },
    ],
    sermao_elocutio: studyMode === 'sermao' ? [
      { label: 'Linguagem e estilo', prompt: `Como usar linguagem clara e impactante no sermão de ${ref}?` },
      { label: 'Ilustrações', prompt: `Sugira ilustrações eficazes para ${ref}.` },
      { label: 'Aplicações', prompt: `Escreva aplicações pastorais concretas para ${ref}.` },
    ] : [
      { label: 'Clareza da linguagem', prompt: `Como tornar a exposição de ${ref} mais clara e precisa?` },
      { label: 'Aplicações', prompt: `Escreva aplicações concretas para ${ref}.` },
    ],
    sermao_avaliacao: studyMode === 'sermao' ? [
      { label: 'Avaliar sermão', prompt: `Avalie a qualidade e fidelidade exegética do sermão de ${ref}.` },
      { label: 'Pontos de melhoria', prompt: `Que melhorias o sermão de ${ref} precisa?` },
    ] : [
      { label: 'Avaliar análise', prompt: `Avalie a qualidade e fidelidade exegética desta análise de ${ref}.` },
      { label: 'Pontos de melhoria', prompt: `Que melhorias esta análise de ${ref} precisa?` },
    ],
    preparacao_espiritual: [
      { label: 'Preparação espiritual', prompt: `Como me preparar espiritualmente para estudar ${ref}?` },
      { label: 'Atitude correta', prompt: `Que atitude devo ter ao me aproximar de ${ref}?` },
    ],
    preparar_leia_assimile: [
      { label: 'Primeiras leituras', prompt: `O que notar numa primeira leitura de ${ref}?` },
      { label: 'Impressões iniciais', prompt: `Quais suas primeiras impressões sobre ${ref}?` },
      { label: 'Perguntas iniciais', prompt: `Que perguntas surgem numa leitura inicial de ${ref}?` },
    ],
    preparar_primeiras_impressoes: [
      { label: 'Primeiras impressões', prompt: `Quais suas primeiras impressões sobre ${ref}?` },
      { label: 'O que surpreende', prompt: `O que surpreende ou intriga em ${ref}?` },
    ],
    preparar_visao_geral: [
      { label: 'Visão geral', prompt: `Dê uma visão geral de ${ref}.` },
      { label: 'Estrutura do texto', prompt: `Qual a estrutura geral de ${ref}?` },
    ],
    colagens: [
      { label: 'Organizar colagens', prompt: `Organize as colagens por temas e conexões com ${ref}.` },
      { label: 'Conexões com o texto', prompt: `Sugira conexões entre as colagens e ${ref}.` },
      { label: 'Temas recorrentes', prompt: `Identifique temas recorrentes nas notas sobre ${ref}.` },
    ],
  }

  if (slug in bySlug) return bySlug[slug]

  const group = sectionDef?.group
  if (group === 'contextual' || group === 'contextual_legado') {
    return [
      { label: 'Contexto histórico', prompt: `Descreva o contexto histórico de ${ref}.` },
      { label: 'Contexto cultural', prompt: `Quais os aspectos culturais relevantes para ${ref}?` },
    ]
  }
  if (group === 'textual' || group === 'textual_legado') {
    return [
      { label: 'Análise textual', prompt: `Analise o texto de ${ref}.` },
      { label: 'Estrutura', prompt: `Qual a estrutura interna de ${ref}?` },
    ]
  }
  if (group === 'teologico' || group === 'teologico_legado') {
    return [
      { label: 'Teologia Bíblica', prompt: `Qual a contribuição de ${ref} para a teologia bíblica?` },
      { label: 'Teologia Sistemática', prompt: `Que tópicos sistemáticos são iluminados por ${ref}?` },
      { label: 'Relação com Cristo', prompt: `Como ${ref} aponta para Cristo?` },
      { label: 'Confissões Reformadas', prompt: `Como as Confissões Reformadas abordam os temas de ${ref}?` },
    ]
  }

  if (sectionDef && sectionDef.keyQuestions.length > 0) {
    return sectionDef.keyQuestions.slice(0, 4).map(q => ({ label: q.slice(0, 40), prompt: q }))
  }

  return [
    { label: `Analisar ${ref}`, prompt: `Analise ${ref} no contexto de seus temas principais.` },
    { label: 'Pontos centrais', prompt: `Quais os pontos exegéticos centrais desta seção?` },
  ]
}

export default function AIPanel({ project, activeSlug, activeTitle, context, onClearContext, sectionDef }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const streamBufferRef = useRef('')

  const onClearContextRef = useRef(onClearContext)
  onClearContextRef.current = onClearContext

  useEffect(() => {
    if (!context) return
    queueMicrotask(() => {
      setInput(context)
      onClearContextRef.current()
    })
  }, [context])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const ref = `${project.book} ${project.passage_ref}`
  const studyMode = project.study_mode ?? ''
  const globalActions = getGlobalActions(activeTitle, ref)
  const phaseActions = getPhaseActions(sectionDef, ref, studyMode)
  const sectionActions = getSectionActions(activeSlug, ref, sectionDef, studyMode)

  async function send(text?: string) {
    const userText = (text ?? input).trim()
    if (!userText || loading) return

    const userMsg: Message = { role: 'user', content: userText }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages(m => [...m, assistantMsg])

    const t0 = Date.now()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 90_000) // 90s timeout

    const payload = {
      messages: nextMessages,
      project: {
        id: project.id,
        book: project.book,
        passage_ref: project.passage_ref,
        testament: project.testament,
        original_language: project.original_language,
        study_mode: project.study_mode,
      },
      activeSlug,
      activeTitle,
    }
    console.log('[AIPanel] enviando para /api/claude/stream', { activeSlug, activeTitle, msgCount: nextMessages.length })

    try {
      const res = await fetch('/api/claude/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      console.log('[AIPanel] status da resposta:', res.status, Date.now() - t0, 'ms')

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        console.error('[AIPanel] erro HTTP:', res.status, err)
        setMessages(m => {
          const next = [...m]
          next[next.length - 1] = { role: 'assistant', content: `Erro ${res.status}: ${err.error || 'Tente novamente.'}` }
          return next
        })
        return
      }

      if (!res.body) {
        console.error('[AIPanel] res.body é null')
        throw new Error('Resposta sem corpo (body null)')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      streamBufferRef.current = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.error) {
                console.error('[AIPanel] erro no stream SSE:', parsed.error)
                streamBufferRef.current += `\n\n⚠️ Erro: ${parsed.error}`
              }
              const delta = parsed.delta?.text ?? ''
              streamBufferRef.current += delta
              const full = streamBufferRef.current
              setMessages(m => {
                const next = [...m]
                next[next.length - 1] = { role: 'assistant', content: full }
                return next
              })
            } catch {
              // ignore parse errors on individual SSE lines
            }
          }
        }
      }
      console.log('[AIPanel] stream concluído em', Date.now() - t0, 'ms')
    } catch (err) {
      const isTimeout = err instanceof DOMException && err.name === 'AbortError'
      const msg = isTimeout
        ? 'Tempo limite excedido (90s). A IA demorou mais do que o esperado.'
        : err instanceof Error
        ? `Erro de conexão: ${err.message}`
        : 'Erro de conexão. Tente novamente.'
      console.error('[AIPanel] catch:', err, 'duração:', Date.now() - t0, 'ms')
      setMessages(m => {
        const next = [...m]
        next[next.length - 1] = { role: 'assistant', content: msg }
        return next
      })
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <div style={{
        padding: '0.85rem 1rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexShrink: 0,
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--ai)', display: 'inline-block' }} />
        <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--ai)' }}>Lampas IA</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {activeTitle.split(' ').slice(0, 3).join(' ')}
        </span>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer',
              fontSize: '0.75rem', fontFamily: 'inherit',
              padding: '0.1rem 0.3rem',
            }}
            title="Limpar conversa"
          >
            ✕
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {messages.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.83rem', lineHeight: '1.65', padding: '0.5rem 0' }}>
            <p style={{ marginBottom: '1rem' }}>
              Pergunte sobre <strong style={{ color: 'var(--text-secondary)' }}>{activeTitle}</strong> para {project.book} {project.passage_ref}.
            </p>

            {/* Level 3: Section-specific prompts */}
            {sectionActions.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
                {sectionActions.slice(0, 5).map(action => (
                  <button
                    key={action.label}
                    onClick={() => send(action.prompt)}
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '0.45rem 0.75rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      fontFamily: 'inherit',
                      lineHeight: '1.4',
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Level 2: Phase-specific prompts (comunicar only) */}
            {phaseActions.length > 0 && (
              <>
                <div style={{
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  marginBottom: '0.4rem',
                  marginTop: '0.25rem',
                }}>
                  Produzir
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  {phaseActions.map(action => (
                    <button
                      key={action.label}
                      onClick={() => send(action.prompt)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        borderRadius: '5px',
                        padding: '0.3rem 0.6rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'inherit',
                      }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Level 1: Global actions */}
            <div style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: '0.4rem',
            }}>
              Global
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {globalActions.map(action => (
                <button
                  key={action.label}
                  onClick={() => send(action.prompt)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--ai)',
                    borderRadius: '5px',
                    padding: '0.3rem 0.6rem',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    color: 'var(--ai)',
                    fontFamily: 'inherit',
                    opacity: 0.75,
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isStreaming = loading && i === messages.length - 1 && msg.role === 'assistant'
            return (
              <div key={i} style={{ marginBottom: '1.25rem' }}>
                <div style={{
                  fontSize: '0.7rem',
                  color: msg.role === 'user' ? 'var(--text-muted)' : 'var(--ai)',
                  marginBottom: '0.35rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: '600',
                }}>
                  {msg.role === 'user' ? 'Você' : 'Lampas'}
                </div>
                {msg.role === 'assistant' ? (
                  isStreaming ? (
                    <div style={{
                      fontSize: '0.87rem',
                      lineHeight: '1.72',
                      color: 'var(--text-primary)',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'var(--font-serif)',
                    }}>
                      {msg.content || <span className="ai-cursor" />}
                    </div>
                  ) : (
                    <MarkdownRenderer content={msg.content} moduleColor="var(--ai)" />
                  )
                ) : (
                  <div style={{
                    fontSize: '0.87rem',
                    lineHeight: '1.7',
                    color: 'var(--text-primary)',
                  }}>
                    {msg.content}
                  </div>
                )}
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '0.75rem',
        flexShrink: 0,
      }}>
        {/* Level 1 global actions — visible when conversation is active */}
        {messages.length > 0 && (
          <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            {globalActions.map(action => (
              <button
                key={action.label}
                onClick={() => send(action.prompt)}
                disabled={loading}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--ai)',
                  borderRadius: '5px',
                  padding: '0.2rem 0.55rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.72rem',
                  color: 'var(--ai)',
                  fontFamily: 'inherit',
                  opacity: loading ? 0.4 : 0.75,
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="Pergunte sobre o texto..."
            rows={3}
            style={{
              flex: 1,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: '7px',
              padding: '0.55rem 0.75rem',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: '1.5',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--ai)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{
              background: loading || !input.trim() ? 'var(--surface-3)' : 'var(--ai)',
              border: 'none',
              borderRadius: '7px',
              padding: '0 0.75rem',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              color: loading || !input.trim() ? 'var(--text-muted)' : '#fff',
              fontSize: '1.1rem',
              flexShrink: 0,
            }}
          >
            {loading ? '…' : '↑'}
          </button>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
          Enter para enviar · Shift+Enter para nova linha
        </div>
      </div>
    </div>
  )
}

