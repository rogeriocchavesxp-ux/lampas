'use client'

import { useState, useRef, useCallback } from 'react'
import MarkdownRenderer from './MarkdownRenderer'

export interface AIContext {
  project: {
    id: string
    book: string
    passage_ref: string
    testament: string
    original_language: string
    study_mode?: string
  }
  phase?: string
  phaseLabel?: string
  section?: string
  sectionLabel?: string
  field?: string
  fieldLabel?: string
  userId: string
}

interface Props {
  context: AIContext
  currentContent: string
  onInsert: (html: string) => void
  onReplace: (html: string) => void
  onAppend: (html: string) => void
  onClose: () => void
}

// ── Avaliar prompt ────────────────────────────────────────────────────────────

const AVALIAR_PROMPT = `Avalie o conteúdo atual sem alterar, reescrever ou corrigir o texto. Atue como professor ou editor especializado.

Apresente a avaliação neste formato:

## NOTA GERAL
(Nota de 0–10 com avaliação sintética em uma linha)

## Pontos Fortes
(Clareza, fidelidade bíblica, consistência argumentativa, precisão teológica, aplicabilidade)

## Pontos Fracos
(Dimensões que precisam melhorar)

## Oportunidades de Aprimoramento
(Sugestões específicas e concretas considerando o contexto atual: projeto, etapa, seção e campo)

## Recomendação Final
(Próximo passo mais importante)

Após a avaliação, inclua exatamente este bloco JSON com os itens de melhoria acionáveis (entre 3 e 7 itens):

\`\`\`json
{"items":[{"title":"título curto da melhoria","problem":"descrição objetiva do problema","justification":"por que isso importa para o sermão/texto","suggestion":"sugestão prática e específica de correção"}]}
\`\`\`

Gere somente o JSON após a avaliação, sem texto adicional depois do bloco.`

// ── Action group types ────────────────────────────────────────────────────────

interface ActionGroup {
  id: string
  label: string
  color: string
  actions: { label: string; prompt: string; highlight?: boolean }[]
}

// ── Fixed groups (always shown) ───────────────────────────────────────────────

const COMPREENDER: ActionGroup = {
  id: 'compreender',
  label: 'Compreender',
  color: '#0D9488',
  actions: [
    { label: 'Explicar',             prompt: 'Explique este conteúdo de forma mais clara e acessível.' },
    { label: 'Resumir',              prompt: 'Resuma este conteúdo de forma concisa e clara.' },
    { label: 'Expandir',             prompt: 'Expanda com mais detalhes, evidências e referências.' },
    { label: 'Exemplificar',         prompt: 'Adicione exemplos concretos para ilustrar este conteúdo.' },
    { label: 'Referências Bíblicas', prompt: 'Encontre referências bíblicas relevantes para este conteúdo.' },
  ],
}

const ANALISAR: ActionGroup = {
  id: 'analisar',
  label: 'Analisar',
  color: '#D97706',
  actions: [
    { label: 'Avaliar',              prompt: AVALIAR_PROMPT, highlight: true },
    { label: 'Melhorar',             prompt: 'Melhore a qualidade, clareza e precisão deste conteúdo.' },
    { label: 'Corrigir',             prompt: 'Corrija erros e aprimore a precisão deste conteúdo.' },
    { label: 'Relacionar com Cristo', prompt: 'Relacione este conteúdo com Cristo, o evangelho e a redenção.' },
  ],
}

// ── Section-specific group builder ────────────────────────────────────────────

function buildSectionGroup(slug: string, phase: string, studyMode: string, ref: string): ActionGroup | null {
  if (!slug || slug.startsWith('ferramentas_')) return null

  // ── PREPARAR ──────────────────────────────────────────────────────────────
  if (phase === 'preparar' || slug === 'preparacao_espiritual' || slug.startsWith('preparar_')) {
    if (slug === 'preparacao_espiritual') {
      return { id: 'preparar', label: 'Preparar', color: '#0F766E', actions: [
        { label: 'Oração inicial',    prompt: `Sugira uma oração de abertura para o estudo de ${ref}.` },
        { label: 'Atitude correta',   prompt: `Que atitude espiritual e intelectual devo ter ao estudar ${ref}?` },
        { label: 'Expectativas',      prompt: `O que posso esperar ao estudar ${ref} com profundidade?` },
      ]}
    }
    if (slug.includes('leia') || slug.includes('assimile')) {
      return { id: 'preparar', label: 'Leitura & Assimilação', color: '#0F766E', actions: [
        { label: 'O que observar',    prompt: `O que observar numa primeira leitura de ${ref}?` },
        { label: 'Impressões iniciais', prompt: `Que impressões iniciais surgem ao ler ${ref}?` },
        { label: 'Perguntas iniciais', prompt: `Que perguntas surgem numa leitura inicial de ${ref}?` },
        { label: 'Comparar traduções', prompt: `Compare as principais traduções de ${ref} e suas diferenças.` },
      ]}
    }
    return { id: 'preparar', label: 'Preparar', color: '#0F766E', actions: [
      { label: 'Visão geral',        prompt: `Dê uma visão geral de ${ref}.` },
      { label: 'Tema provável',      prompt: `Qual o tema provável de ${ref}?` },
      { label: 'Perguntas abertas',  prompt: `Que perguntas surgem após a leitura de ${ref}?` },
    ]}
  }

  // ── NARRATIVAS (nr_) ──────────────────────────────────────────────────────
  if (slug.startsWith('nr_')) {
    const map: Record<string, ActionGroup> = {
      nr_ctx_historico: { id: 'nr', label: 'Contexto Histórico', color: '#163A6B', actions: [
        { label: 'Contexto histórico',  prompt: `Descreva o contexto histórico de ${ref}.` },
        { label: 'Contexto cultural',   prompt: `Quais aspectos culturais são relevantes para ${ref}?` },
        { label: 'Autor e destinatários', prompt: `Quem escreveu ${ref} e a quem se destinava?` },
        { label: 'Geografia',           prompt: `Que elementos geográficos iluminam ${ref}?` },
        { label: 'Costumes e práticas', prompt: `Que costumes e práticas culturais iluminam ${ref}?` },
      ]},
      nr_ctx_literario: { id: 'nr', label: 'Contexto Literário', color: '#163A6B', actions: [
        { label: 'Contexto literário',  prompt: `Qual o contexto literário imediato de ${ref}?` },
        { label: 'Gênero narrativo',    prompt: `Que tipo de narrativa é ${ref} e quais suas convenções?` },
        { label: 'Posição no livro',    prompt: `Qual o papel de ${ref} na estrutura do livro?` },
      ]},
      nr_ctx_canonico: { id: 'nr', label: 'Contexto Canônico', color: '#163A6B', actions: [
        { label: 'Relação canônica',    prompt: `Como ${ref} se relaciona com o restante do cânon?` },
        { label: 'Progressão redentiva', prompt: `Qual o lugar de ${ref} na história da redenção?` },
        { label: 'Padrões tipológicos', prompt: `Que padrões tipológicos aparecem em ${ref}?` },
      ]},
      nr_txt_original: { id: 'nr', label: 'Texto Original', color: '#0369A1', actions: [
        { label: 'Texto original',      prompt: `Analise o texto original (hebraico/grego) de ${ref}.` },
        { label: 'Termos-chave',        prompt: `Quais os termos-chave no original de ${ref}?` },
        { label: 'Variantes textuais',  prompt: `Há variantes textuais relevantes em ${ref}?` },
      ]},
      nr_txt_estrutura: { id: 'nr', label: 'Estrutura da Narrativa', color: '#0369A1', actions: [
        { label: 'Detectar divisões',   prompt: `Identifique as divisões estruturais naturais da narrativa de ${ref}.` },
        { label: 'Esboço mecânico',     prompt: `Produza um esboço mecânico da narrativa de ${ref}.` },
        { label: 'Personagens',         prompt: `Quem são os personagens de ${ref} e como se relacionam?` },
        { label: 'Tensão narrativa',    prompt: `Qual a tensão narrativa central em ${ref}?` },
        { label: 'Clímax',             prompt: `Onde está o clímax da narrativa de ${ref}?` },
        { label: 'Repetições',         prompt: `Quais elementos se repetem em ${ref} e por quê?` },
      ]},
      nr_txt_exegese: { id: 'nr', label: 'Exegese Narrativa', color: '#0369A1', actions: [
        { label: 'Exegese narrativa',   prompt: `Faça uma exegese narrativa de ${ref}.` },
        { label: 'Ponto de vista',      prompt: `Qual o ponto de vista narrativo e sua função em ${ref}?` },
        { label: 'Ironia e subtexto',   prompt: `Há ironia ou subtexto teológico em ${ref}?` },
        { label: 'Intenção autoral',    prompt: `Qual a intenção teológica do autor em ${ref}?` },
      ]},
      nr_txt_mensagem: { id: 'nr', label: 'Mensagem Original', color: '#0369A1', actions: [
        { label: 'Mensagem original',   prompt: `Qual a mensagem de ${ref} para seus destinatários originais?` },
        { label: 'Intenção autoral',    prompt: `Qual a intenção teológica do autor ao escrever ${ref}?` },
      ]},
      nr_personagens: { id: 'nr', label: 'Personagens', color: '#0369A1', actions: [
        { label: 'Caracterização',      prompt: `Como os personagens de ${ref} são caracterizados?` },
        { label: 'Desenvolvimento',     prompt: `Como os personagens se desenvolvem em ${ref}?` },
        { label: 'Funções narrativas',  prompt: `Que funções narrativas cada personagem cumpre em ${ref}?` },
      ]},
      nr_enredo: { id: 'nr', label: 'Enredo', color: '#0369A1', actions: [
        { label: 'Estrutura do enredo', prompt: `Analise a estrutura do enredo de ${ref}.` },
        { label: 'Complicação e resolução', prompt: `Qual a complicação e como é resolvida em ${ref}?` },
        { label: 'Tensão e clímax',     prompt: `Trace a tensão e o clímax da narrativa de ${ref}.` },
      ]},
      nr_teo_redentor: { id: 'nr', label: 'Teologia Redentora', color: '#7C3AED', actions: [
        { label: 'Elemento redentor',   prompt: `Qual o elemento redentor central de ${ref}?` },
        { label: 'Cristo na narrativa', prompt: `Como ${ref} aponta tipologicamente para Cristo?` },
        { label: 'História da Redenção', prompt: `Qual o lugar de ${ref} na história da redenção?` },
      ]},
      nr_teo_doutrinas: { id: 'nr', label: 'Teologia Sistemática', color: '#7C3AED', actions: [
        { label: 'Doutrinas implícitas', prompt: `Que doutrinas estão ensinadas em ${ref}?` },
        { label: 'Aplicação doutrinária', prompt: `Como as doutrinas de ${ref} se aplicam à vida cristã?` },
      ]},
      nr_ivg_ideia: { id: 'nr', label: 'Grande Ideia', color: '#059669', actions: [
        { label: 'Grande ideia',        prompt: `Qual a grande ideia teológica da narrativa de ${ref}?` },
        { label: 'Proposição central',  prompt: `Formule uma proposição central para ${ref}.` },
        { label: 'Refinar ideia',       prompt: `Como refinar e aprofundar a grande ideia de ${ref}?` },
      ]},
      nr_ivg_verdades: { id: 'nr', label: 'Verdades Centrais', color: '#059669', actions: [
        { label: 'Verdades centrais',   prompt: `Quais as verdades centrais que emergem de ${ref}?` },
        { label: 'Pontos de ensino',    prompt: `Quais os pontos de ensino da narrativa de ${ref}?` },
      ]},
      nr_ivg_aplic: { id: 'nr', label: 'Aplicação Pastoral', color: '#059669', actions: [
        { label: 'Aplicações pastorais', prompt: `Que aplicações pastorais concretas emergem de ${ref}?` },
        { label: 'Relevância atual',    prompt: `Como a narrativa de ${ref} é relevante para o crente hoje?` },
      ]},
    }
    return map[slug] ?? { id: 'nr', label: 'Narrativa', color: '#163A6B', actions: [
      { label: 'Análise narrativa',   prompt: `Faça uma análise narrativa de ${ref}.` },
      { label: 'Personagens',         prompt: `Quem são os personagens de ${ref}?` },
      { label: 'Tensão narrativa',    prompt: `Qual a tensão central na narrativa de ${ref}?` },
      { label: 'Mensagem teológica',  prompt: `Qual a mensagem teológica de ${ref}?` },
    ]}
  }

  // ── TERMOS (et_) ──────────────────────────────────────────────────────────
  if (slug.startsWith('et_')) {
    const map: Record<string, ActionGroup> = {
      et_definicao: { id: 'et', label: 'Definição do Termo', color: '#163A6B', actions: [
        { label: 'Definir termo',       prompt: `Defina o termo bíblico central de ${ref} com precisão lexical.` },
        { label: 'Nuances semânticas',  prompt: `Explique as nuances semânticas deste termo em ${ref}.` },
        { label: 'Uso teológico',       prompt: `Como este termo funciona teologicamente?` },
        { label: 'Usos canônicos',      prompt: `Quais são os principais usos deste termo em todo o cânon?` },
      ]},
      et_ocorrencias: { id: 'et', label: 'Ocorrências', color: '#0369A1', actions: [
        { label: 'Ocorrências AT',      prompt: `Liste as ocorrências deste termo no Antigo Testamento.` },
        { label: 'Ocorrências NT',      prompt: `Liste as ocorrências deste termo no Novo Testamento.` },
        { label: 'Padrões de uso',      prompt: `Identifique padrões no uso deste termo ao longo do cânon.` },
      ]},
      et_at: { id: 'et', label: 'Uso no AT', color: '#0369A1', actions: [
        { label: 'Uso no AT',           prompt: `Como este termo é usado no Antigo Testamento?` },
        { label: 'Contexto hebraico',   prompt: `Qual o significado do equivalente hebraico?` },
        { label: 'Progressão histórica', prompt: `Como o uso deste termo evolui ao longo do AT?` },
      ]},
      et_nt: { id: 'et', label: 'Uso no NT', color: '#0369A1', actions: [
        { label: 'Uso no NT',           prompt: `Como este termo é usado no Novo Testamento?` },
        { label: 'Contexto grego',      prompt: `Qual o significado do equivalente grego?` },
        { label: 'Relação AT-NT',       prompt: `Como o NT retoma ou desenvolve este termo do AT?` },
      ]},
      et_teologia_biblica: { id: 'et', label: 'Teologia Bíblica', color: '#7C3AED', actions: [
        { label: 'Progressão canônica', prompt: `Como este conceito se desenvolve do AT ao NT?` },
        { label: 'Relação com Cristo',  prompt: `Como este conceito aponta para a pessoa e obra de Cristo?` },
        { label: 'História da Redenção', prompt: `Qual o lugar deste conceito na história da redenção?` },
      ]},
      et_teologia_sistematica: { id: 'et', label: 'Teologia Sistemática', color: '#7C3AED', actions: [
        { label: 'Loci dogmáticos',     prompt: `Em quais loci sistemáticos este conceito aparece?` },
        { label: 'Confissões Reformadas', prompt: `Como as Confissões Reformadas tratam este conceito?` },
        { label: 'Debates históricos',  prompt: `Quais os principais debates teológicos sobre este conceito?` },
      ]},
      et_sintese_canonica: { id: 'et', label: 'Síntese Canônica', color: '#059669', actions: [
        { label: 'Síntese canônica',    prompt: `Sintetize o uso e desenvolvimento deste termo em todo o cânon.` },
        { label: 'Ideia central',       prompt: `Qual a ideia teológica central que este termo carrega?` },
      ]},
    }
    return map[slug] ?? { id: 'et', label: 'Estudo de Termos', color: '#163A6B', actions: [
      { label: 'Analisar contexto',   prompt: `Analise o contexto de uso deste termo.` },
      { label: 'Relações doutrinárias', prompt: `Que relações doutrinárias este termo estabelece?` },
      { label: 'Uso teológico',       prompt: `Como este termo funciona teologicamente?` },
    ]}
  }

  // ── SALMOS E SABEDORIA (ss_) ──────────────────────────────────────────────
  if (slug.startsWith('ss_')) {
    const map: Record<string, ActionGroup> = {
      ss_paralelismo: { id: 'ss', label: 'Paralelismo', color: '#163A6B', actions: [
        { label: 'Identificar paralelismos', prompt: `Identifique e classifique os paralelismos em ${ref}.` },
        { label: 'Tipos de paralelismo', prompt: `Que tipos de paralelismo aparecem em ${ref}?` },
        { label: 'Efeito poético',      prompt: `Qual o efeito poético dos paralelismos em ${ref}?` },
      ]},
      ss_estrutura: { id: 'ss', label: 'Estrutura Poética', color: '#0369A1', actions: [
        { label: 'Estrutura do Salmo',  prompt: `Analise a estrutura do salmo de ${ref}.` },
        { label: 'Divisão em estrofes', prompt: `Divida ${ref} em estrofes e explique a progressão.` },
        { label: 'Progressão temática', prompt: `Qual a progressão temática ao longo de ${ref}?` },
      ]},
      ss_imagistica: { id: 'ss', label: 'Imagística', color: '#0369A1', actions: [
        { label: 'Imagens e metáforas', prompt: `Identifique as principais imagens e metáforas em ${ref}.` },
        { label: 'Simbolismo',          prompt: `O que os símbolos de ${ref} comunicam?` },
        { label: 'Força expressiva',    prompt: `Como as imagens de ${ref} reforçam a mensagem?` },
      ]},
      ss_temas_sabedoria: { id: 'ss', label: 'Temas de Sabedoria', color: '#7C3AED', actions: [
        { label: 'Tema da sabedoria',   prompt: `Qual o tema central da sabedoria em ${ref}?` },
        { label: 'Temor ao SENHOR',     prompt: `Como o temor ao SENHOR aparece em ${ref}?` },
        { label: 'Sabedoria prática',   prompt: `Que princípios de sabedoria prática emergem de ${ref}?` },
      ]},
      ss_teologia_adoracao: { id: 'ss', label: 'Teologia da Adoração', color: '#7C3AED', actions: [
        { label: 'Teologia da adoração', prompt: `Que teologia da adoração emerge de ${ref}?` },
        { label: 'Uso litúrgico',       prompt: `Como ${ref} era usado no culto de Israel?` },
        { label: 'Adoração cristã',     prompt: `Como ${ref} nutre a adoração cristã hoje?` },
      ]},
    }
    return map[slug] ?? { id: 'ss', label: 'Poesia & Sabedoria', color: '#163A6B', actions: [
      { label: 'Análise poética',     prompt: `Analise os recursos poéticos de ${ref}.` },
      { label: 'Teologia do Salmo',   prompt: `Qual a teologia central de ${ref}?` },
    ]}
  }

  // ── PROFECIAS (pf_) ──────────────────────────────────────────────────────
  if (slug.startsWith('pf_')) {
    const map: Record<string, ActionGroup> = {
      pf_contexto: { id: 'pf', label: 'Contexto Profético', color: '#163A6B', actions: [
        { label: 'Contexto histórico',  prompt: `Qual o contexto histórico do oráculo de ${ref}?` },
        { label: 'Crise histórica',     prompt: `Que crise histórica motivou a profecia de ${ref}?` },
        { label: 'Profeta e audiência', prompt: `Quem era o profeta e qual sua audiência em ${ref}?` },
      ]},
      pf_oraculo: { id: 'pf', label: 'Oráculo Profético', color: '#0369A1', actions: [
        { label: 'Tipo de oráculo',     prompt: `Que tipo de oráculo profético é ${ref}?` },
        { label: 'Estrutura do oráculo', prompt: `Analise a estrutura do oráculo de ${ref}.` },
        { label: 'Mensagem imediata',   prompt: `Qual a mensagem imediata de ${ref}?` },
      ]},
      pf_cumprimento: { id: 'pf', label: 'Cumprimento', color: '#7C3AED', actions: [
        { label: 'Cumprimento histórico', prompt: `Como ${ref} foi cumprido historicamente?` },
        { label: 'Cumprimento em Cristo', prompt: `Como ${ref} aponta para Cristo?` },
        { label: 'Cumprimento escatológico', prompt: `Há dimensão de cumprimento futuro em ${ref}?` },
      ]},
      pf_escatologia: { id: 'pf', label: 'Escatologia', color: '#7C3AED', actions: [
        { label: 'Dimensão escatológica', prompt: `Qual a dimensão escatológica de ${ref}?` },
        { label: 'Esperança messiânica', prompt: `Como ${ref} expressa esperança messiânica?` },
        { label: 'Hermenêutica reformada', prompt: `Como a hermenêutica reformada interpreta ${ref}?` },
      ]},
    }
    return map[slug] ?? { id: 'pf', label: 'Profecia', color: '#163A6B', actions: [
      { label: 'Contexto profético',  prompt: `Qual o contexto histórico e literário da profecia de ${ref}?` },
      { label: 'Mensagem profética',  prompt: `Qual a mensagem central do profeta em ${ref}?` },
      { label: 'Cumprimento em Cristo', prompt: `Como ${ref} se cumpre em Cristo?` },
    ]}
  }

  // ── ESTUDO DE CARTA (ec_) ─────────────────────────────────────────────────
  if (slug.startsWith('ec_')) {
    const map: Record<string, ActionGroup> = {
      ec_ocasiao: { id: 'ec', label: 'Ocasião da Carta', color: '#163A6B', actions: [
        { label: 'Ocasião da carta',    prompt: `Qual a ocasião e motivação para a escrita da carta em ${ref}?` },
        { label: 'Destinatários',       prompt: `Quem eram os destinatários e qual sua situação?` },
        { label: 'Contexto histórico',  prompt: `Qual o contexto histórico da carta de ${ref}?` },
      ]},
      ec_estrutura: { id: 'ec', label: 'Estrutura Epistolar', color: '#0369A1', actions: [
        { label: 'Estrutura epistolar', prompt: `Analise a estrutura epistolar de ${ref}.` },
        { label: 'Argumento central',   prompt: `Qual o argumento central desenvolvido em ${ref}?` },
        { label: 'Posição na carta',    prompt: `Qual o papel desta seção na estrutura da carta?` },
      ]},
      ec_argumento: { id: 'ec', label: 'Argumento Teológico', color: '#7C3AED', actions: [
        { label: 'Lógica do argumento', prompt: `Trace a lógica do argumento em ${ref}.` },
        { label: 'Fundamento teológico', prompt: `Qual o fundamento teológico do argumento de ${ref}?` },
        { label: 'Conexões internas',   prompt: `Quais as conexões internas do argumento de ${ref}?` },
      ]},
    }
    return map[slug] ?? { id: 'ec', label: 'Carta', color: '#163A6B', actions: [
      { label: 'Contexto da carta',   prompt: `Qual o contexto histórico e ocasião de ${ref}?` },
      { label: 'Argumento',           prompt: `Qual o argumento teológico de ${ref}?` },
    ]}
  }

  // ── PESQUISA TEOLÓGICA (pt_) ──────────────────────────────────────────────
  if (slug.startsWith('pt_')) {
    const map: Record<string, ActionGroup> = {
      pt_tema: { id: 'pt', label: 'Delimitação do Tema', color: '#163A6B', actions: [
        { label: 'Delimitar tema',      prompt: `Ajude a delimitar e formular o tema de pesquisa.` },
        { label: 'Relevância teológica', prompt: `Qual a relevância teológica deste tema?` },
        { label: 'Questão central',     prompt: `Qual deve ser a questão central desta pesquisa?` },
      ]},
      pt_revisao_bibliografica: { id: 'pt', label: 'Revisão Bibliográfica', color: '#0369A1', actions: [
        { label: 'Autores relevantes',  prompt: `Quais os principais autores e obras sobre este tema?` },
        { label: 'Estado da questão',   prompt: `Qual o estado atual da questão na teologia?` },
        { label: 'Lacunas bibliográficas', prompt: `Quais as lacunas na literatura existente sobre este tema?` },
      ]},
      pt_teologia_biblica: { id: 'pt', label: 'Teologia Bíblica', color: '#7C3AED', actions: [
        { label: 'Desenvolvimento canônico', prompt: `Como este tema se desenvolve ao longo do cânon?` },
        { label: 'Teologia do AT e NT', prompt: `Como o AT e o NT tratam este tema?` },
      ]},
      pt_teologia_sistematica: { id: 'pt', label: 'Teologia Sistemática', color: '#7C3AED', actions: [
        { label: 'Loci sistemáticos',   prompt: `Em quais loci sistemáticos este tema aparece?` },
        { label: 'Confissões Reformadas', prompt: `Como as Confissões Reformadas abordam este tema?` },
      ]},
      pt_conclusoes: { id: 'pt', label: 'Conclusões', color: '#059669', actions: [
        { label: 'Sintetizar conclusões', prompt: `Ajude a sintetizar as conclusões da pesquisa.` },
        { label: 'Implicações',         prompt: `Quais as implicações teológicas e práticas desta pesquisa?` },
      ]},
    }
    return map[slug] ?? { id: 'pt', label: 'Pesquisa Teológica', color: '#163A6B', actions: [
      { label: 'Desenvolver argumento', prompt: `Ajude a desenvolver o argumento desta seção.` },
      { label: 'Verificar consistência', prompt: `Verifique a consistência teológica do argumento.` },
    ]}
  }

  // ── ESTUDO BÍBLICO (eb_) ─────────────────────────────────────────────────
  if (slug.startsWith('eb_')) {
    const map: Record<string, ActionGroup> = {
      eb_preparacao: { id: 'eb', label: 'Preparação do Estudo', color: '#0F766E', actions: [
        { label: 'Preparar estudo',     prompt: `Como preparar um estudo bíblico eficaz sobre ${ref}?` },
        { label: 'Objetivos',           prompt: `Que objetivos de aprendizado definir para ${ref}?` },
      ]},
      eb_texto_base: { id: 'eb', label: 'Observação do Texto', color: '#163A6B', actions: [
        { label: 'Observações do texto', prompt: `Faça observações do texto de ${ref}.` },
        { label: 'Perguntas de descoberta', prompt: `Sugira perguntas de descoberta para ${ref}.` },
      ]},
      eb_perguntas: { id: 'eb', label: 'Perguntas de Discussão', color: '#0369A1', actions: [
        { label: 'Perguntas abertas',   prompt: `Sugira perguntas abertas para discussão de ${ref}.` },
        { label: 'Perguntas de reflexão', prompt: `Crie perguntas de reflexão profunda para ${ref}.` },
        { label: 'Perguntas de aplicação', prompt: `Crie perguntas de aplicação para ${ref}.` },
      ]},
      eb_dinamicas: { id: 'eb', label: 'Dinâmicas de Grupo', color: '#059669', actions: [
        { label: 'Dinâmicas de grupo',  prompt: `Sugira dinâmicas de grupo para o estudo de ${ref}.` },
        { label: 'Atividades práticas', prompt: `Que atividades práticas podem enriquecer o estudo de ${ref}?` },
      ]},
    }
    return map[slug] ?? { id: 'eb', label: 'Estudo Bíblico', color: '#163A6B', actions: [
      { label: 'Preparar estudo',     prompt: `Como preparar um bom estudo bíblico sobre ${ref}?` },
      { label: 'Perguntas de discussão', prompt: `Sugira perguntas de discussão para ${ref}.` },
    ]}
  }

  // ── SEÇÕES PADRÃO (exegese convencional) ─────────────────────────────────
  const standardMap: Record<string, ActionGroup> = {
    contexto_historico: { id: 'espec', label: 'Contexto Histórico', color: '#163A6B', actions: [
      { label: 'Contexto histórico',  prompt: `Descreva o contexto histórico, político e social de ${ref}.` },
      { label: 'Contexto cultural',   prompt: `Quais aspectos culturais são fundamentais para ${ref}?` },
      { label: 'Autor e destinatários', prompt: `Quem escreveu ${ref} e a quem se destinava?` },
      { label: 'Geografia',           prompt: `Que elementos geográficos iluminam ${ref}?` },
      { label: 'Costumes e práticas', prompt: `Que costumes e práticas culturais iluminam ${ref}?` },
    ]},
    autor_destinatarios: { id: 'espec', label: 'Autor & Destinatários', color: '#163A6B', actions: [
      { label: 'Perfil do autor',     prompt: `Quem é o autor de ${ref} e qual sua perspectiva teológica?` },
      { label: 'Destinatários',       prompt: `Quem eram os destinatários de ${ref} e qual sua situação?` },
      { label: 'Propósito',           prompt: `Qual o propósito do autor ao escrever ${ref}?` },
      { label: 'Gênero literário',    prompt: `Qual o gênero literário de ${ref}?` },
    ]},
    estrutura_livro: { id: 'espec', label: 'Estrutura do Livro', color: '#163A6B', actions: [
      { label: 'Estrutura do livro',  prompt: `Qual a estrutura geral do livro onde está ${ref}?` },
      { label: 'Posição da passagem', prompt: `Qual o papel de ${ref} na estrutura do livro?` },
      { label: 'Temas centrais',      prompt: `Quais os temas centrais do livro?` },
    ]},
    texto_original: { id: 'espec', label: 'Texto Original', color: '#0369A1', actions: [
      { label: 'Análise do original', prompt: `Analise aspectos relevantes do hebraico/grego de ${ref}.` },
      { label: 'Termos-chave',        prompt: `Quais os termos-chave no original de ${ref}?` },
      { label: 'Variantes textuais',  prompt: `Há variantes textuais significativas em ${ref}?` },
      { label: 'Comparar traduções',  prompt: `Compare as principais traduções de ${ref}.` },
    ]},
    defesa_pericope: { id: 'espec', label: 'Delimitação da Perícope', color: '#0369A1', actions: [
      { label: 'Delimitar perícope',  prompt: `Justifique a delimitação da perícope de ${ref}.` },
      { label: 'Marcadores textuais', prompt: `Quais marcadores textuais delimitam ${ref}?` },
      { label: 'Relação com contexto', prompt: `Como a passagem imediata se relaciona com ${ref}?` },
    ]},
    esboco_mecanico: { id: 'espec', label: 'Esboço Mecânico', color: '#0369A1', actions: [
      { label: 'Gerar esboço mecânico', prompt: `Produza um esboço mecânico de ${ref}.` },
      { label: 'Proposição principal', prompt: `Qual a proposição principal de ${ref}?` },
      { label: 'Proposições secundárias', prompt: `Identifique as proposições secundárias de ${ref}.` },
      { label: 'Conectivos lógicos',  prompt: `Analise os conectivos lógicos e sua função em ${ref}.` },
    ]},
    estrutura_literaria: { id: 'espec', label: 'Estrutura Literária', color: '#0369A1', actions: [
      { label: 'Gerar estrutura',     prompt: `Proponha a estrutura literária de ${ref}.` },
      { label: 'Gênero literário',    prompt: `Que gênero literário é ${ref}?` },
      { label: 'Paralelismos',        prompt: `Identifique paralelismos em ${ref}.` },
      { label: 'Progressão temática', prompt: `Como o argumento progride em ${ref}?` },
      { label: 'Relações sintáticas', prompt: `Analise as relações sintáticas principais de ${ref}.` },
    ]},
    comentario_exegetico: { id: 'espec', label: 'Exegese', color: '#0369A1', actions: [
      { label: 'Comentário versículo a versículo', prompt: `Faça um comentário exegético versículo a versículo de ${ref}.` },
      { label: 'Dificuldades exegéticas', prompt: `Quais as principais dificuldades exegéticas de ${ref}?` },
      { label: 'Mensagem do autor',   prompt: `Qual a mensagem que o autor pretendia comunicar em ${ref}?` },
    ]},
    mensagem_epoca_escrita: { id: 'espec', label: 'Mensagem Original', color: '#0369A1', actions: [
      { label: 'Mensagem original',   prompt: `Qual a mensagem de ${ref} para seus destinatários originais?` },
      { label: 'Contexto de recepção', prompt: `Como os destinatários originais receberiam ${ref}?` },
      { label: 'Intenção autoral',    prompt: `Qual a intenção teológica do autor em ${ref}?` },
    ]},
    termos_chave: { id: 'espec', label: 'Termos-Chave', color: '#0369A1', actions: [
      { label: 'Termos principais',   prompt: `Quais os termos-chave de ${ref}?` },
      { label: 'Análise lexical',     prompt: `Faça uma análise lexical dos termos centrais de ${ref}.` },
      { label: 'Uso canônico',        prompt: `Como esses termos são usados em todo o cânon?` },
    ]},
    teologia_biblica: { id: 'espec', label: 'Teologia Bíblica', color: '#7C3AED', actions: [
      { label: 'Teologia bíblica',    prompt: `Qual a contribuição de ${ref} para a teologia bíblica?` },
      { label: 'Progressão revelacional', prompt: `Como ${ref} avança a história da redenção?` },
      { label: 'Relação com Cristo',  prompt: `Como ${ref} aponta para Cristo?` },
      { label: 'História da Redenção', prompt: `Qual o lugar de ${ref} na história da redenção?` },
    ]},
    teologia_sistematica: { id: 'espec', label: 'Teologia Sistemática', color: '#7C3AED', actions: [
      { label: 'Loci sistemáticos',   prompt: `Em quais loci da teologia sistemática ${ref} contribui?` },
      { label: 'Confissões Reformadas', prompt: `Como as Confissões Reformadas tratam os temas de ${ref}?` },
      { label: 'Debates históricos',  prompt: `Que debates teológicos históricos são relevantes para ${ref}?` },
    ]},
    teologia_pratica: { id: 'espec', label: 'Teologia Prática', color: '#7C3AED', actions: [
      { label: 'Implicações práticas', prompt: `Quais as implicações práticas da teologia de ${ref}?` },
      { label: 'Aplicação pastoral',  prompt: `Como aplicar pastoralmente as verdades de ${ref}?` },
      { label: 'Vida cristã',         prompt: `Como ${ref} transforma a vida cristã?` },
    ]},
    grande_ideia_homiletica: { id: 'espec', label: 'Grande Ideia', color: '#059669', actions: [
      { label: 'Grande ideia',        prompt: `Qual a grande ideia teológica de ${ref}?` },
      { label: 'Proposição central',  prompt: `Formule uma proposição central para ${ref}.` },
      { label: 'Refinar ideia',       prompt: `Como refinar e aprofundar a grande ideia de ${ref}?` },
      { label: 'Ponto de contato',    prompt: `Como conectar a grande ideia de ${ref} com a audiência?` },
    ]},
    sintese: { id: 'espec', label: 'Síntese Exegética', color: '#059669', actions: [
      { label: 'Síntese exegética',   prompt: `Sintetize as principais descobertas exegéticas de ${ref}.` },
      { label: 'Ideia central',       prompt: `Qual a ideia central e irredutível de ${ref}?` },
      { label: 'Implicações',         prompt: `Quais as implicações teológicas e práticas de ${ref}?` },
    ]},
    preparacao_espiritual: { id: 'espec', label: 'Preparação Espiritual', color: '#0F766E', actions: [
      { label: 'Preparação espiritual', prompt: `Como me preparar espiritualmente para estudar ${ref}?` },
      { label: 'Atitude correta',     prompt: `Que atitude devo ter ao me aproximar de ${ref}?` },
    ]},
    preparar_leia_assimile: { id: 'espec', label: 'Leitura', color: '#0F766E', actions: [
      { label: 'O que observar',      prompt: `O que notar numa primeira leitura de ${ref}?` },
      { label: 'Impressões iniciais', prompt: `Que impressões iniciais surgem ao ler ${ref}?` },
      { label: 'Perguntas iniciais',  prompt: `Que perguntas surgem numa leitura inicial de ${ref}?` },
    ]},
    colagens: { id: 'espec', label: 'Notas & Colagens', color: '#64748B', actions: [
      { label: 'Organizar notas',     prompt: `Organize as notas e colagens por temas em ${ref}.` },
      { label: 'Conexões com o texto', prompt: `Sugira conexões entre as notas e ${ref}.` },
      { label: 'Temas recorrentes',   prompt: `Identifique temas recorrentes nas notas sobre ${ref}.` },
    ]},
  }

  if (slug in standardMap) return standardMap[slug]

  // Sermão sections in comunicar — just Comunicar label
  if (slug.startsWith('sermao_')) {
    return { id: 'espec', label: 'Comunicar', color: '#7C3AED', actions: [
      { label: 'Avaliar estrutura',   prompt: `Avalie a estrutura e coerência para comunicação de ${ref}.` },
      { label: 'Melhorar clareza',    prompt: `Como tornar a exposição de ${ref} mais clara e impactante?` },
      { label: 'Conexão com audiência', prompt: `Como conectar ${ref} com a audiência contemporânea?` },
    ]}
  }

  return null
}

// ── Produção group builder (comunicar phase only) ─────────────────────────────

function buildProducaoGroup(studyMode: string, ref: string): ActionGroup {
  if (studyMode === 'sermao') {
    return { id: 'produzir', label: 'Produzir', color: '#059669', actions: [
      { label: 'Gerar Introdução',  prompt: `Gere uma introdução homilética impactante para ${ref}.` },
      { label: 'Gerar Transição',   prompt: `Crie transições que conectam organicamente os pontos do sermão de ${ref}.` },
      { label: 'Gerar Ilustração',  prompt: `Sugira ilustrações contemporâneas e bíblicas para ${ref}.` },
      { label: 'Gerar Aplicação',   prompt: `Transforme a teologia de ${ref} em aplicações pastorais concretas.` },
      { label: 'Gerar Conclusão',   prompt: `Escreva uma conclusão que chame à decisão a partir de ${ref}.` },
      { label: 'Gerar Esboço',      prompt: `Produza um esboço estruturado e completo do sermão sobre ${ref}.` },
      { label: 'Sermão Completo',   prompt: `Produza um sermão expositivo completo e detalhado sobre ${ref}.` },
    ]}
  }
  if (studyMode === 'estudo_biblico') {
    return { id: 'produzir', label: 'Produzir', color: '#059669', actions: [
      { label: 'Introdução ao estudo', prompt: `Escreva uma introdução envolvente para o estudo de ${ref}.` },
      { label: 'Perguntas de discussão', prompt: `Crie perguntas de discussão para o estudo de ${ref}.` },
      { label: 'Perguntas de aplicação', prompt: `Crie perguntas de aplicação para ${ref}.` },
      { label: 'Material de apoio',  prompt: `Que material de apoio pode enriquecer o estudo de ${ref}?` },
    ]}
  }
  if (studyMode === 'devocional') {
    return { id: 'produzir', label: 'Produzir', color: '#059669', actions: [
      { label: 'Reflexão devocional', prompt: `Escreva uma reflexão devocional sobre ${ref}.` },
      { label: 'Aplicação pessoal',  prompt: `Como ${ref} nutre a vida devocional do crente hoje?` },
      { label: 'Oração',             prompt: `Escreva uma oração que responde à mensagem de ${ref}.` },
    ]}
  }
  // Generic fallback for other modes in comunicar
  return { id: 'produzir', label: 'Produzir', color: '#059669', actions: [
    { label: 'Sintetizar descobertas', prompt: `Sintetize as principais descobertas desta análise de ${ref}.` },
    { label: 'Implicações teológicas', prompt: `Quais as implicações teológicas centrais de ${ref}?` },
    { label: 'Aplicação pastoral',   prompt: `Como aplicar pastoralmente as descobertas de ${ref}?` },
  ]}
}

// ── Main: derive contextual groups ───────────────────────────────────────────

function getContextualGroups(context: AIContext): ActionGroup[] {
  const phase     = context.phase ?? ''
  const slug      = context.section ?? ''
  const studyMode = context.project.study_mode ?? ''
  const ref       = `${context.project.book} ${context.project.passage_ref}`

  const groups: ActionGroup[] = [COMPREENDER, ANALISAR]

  const sectionGroup = buildSectionGroup(slug, phase, studyMode, ref)
  if (sectionGroup) groups.push(sectionGroup)

  if (phase === 'comunicar') {
    groups.push(buildProducaoGroup(studyMode, ref))
  }

  return groups
}

// ── Markdown → HTML (básico, para inserção no TipTap) ────────────────────────

function mdToHtml(text: string): string {
  const paragraphs = text.trim().split(/\n\n+/)
  return paragraphs.map(p => {
    const lines = p.trim().split('\n')
    if (lines.length > 1 && lines.every(l => /^[-•*]\s/.test(l))) {
      return `<ul>${lines.map(l => `<li>${inlineMd(l.replace(/^[-•*]\s+/, ''))}</li>`).join('')}</ul>`
    }
    if (lines.length > 1 && lines.every(l => /^\d+\.\s/.test(l))) {
      return `<ol>${lines.map(l => `<li>${inlineMd(l.replace(/^\d+\.\s+/, ''))}</li>`).join('')}</ol>`
    }
    if (/^#{1,3}\s/.test(lines[0])) {
      const level = lines[0].match(/^(#+)/)?.[1].length ?? 2
      const tag = `h${Math.min(level + 1, 4)}`
      return `<${tag}>${inlineMd(lines[0].replace(/^#+\s+/, ''))}</${tag}>${lines.slice(1).map(l => `<p>${inlineMd(l)}</p>`).join('')}`
    }
    return `<p>${lines.map(inlineMd).join('<br/>')}</p>`
  }).join('')
}

function inlineMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 600)
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AIAssistantPanel({ context, currentContent, onInsert, onReplace, onAppend, onClose }: Props) {
  const [response, setResponse]         = useState('')
  const [loading, setLoading]           = useState(false)
  const [chatInput, setChatInput]       = useState('')
  const [error, setError]               = useState('')
  const [copied, setCopied]             = useState(false)
  const [activeGroup, setActiveGroup]   = useState<string | null>(null)
  const [savedCount, setSavedCount]     = useState<number | null>(null)
  const streamBuffer                    = useRef('')
  const responseRef                     = useRef<HTMLDivElement>(null)

  const actionGroups = getContextualGroups(context)

  const buildSystemContext = useCallback(() => {
    const parts = [
      `Projeto: ${context.project.book} ${context.project.passage_ref}`,
      context.phaseLabel   ? `Etapa: ${context.phaseLabel}`   : '',
      context.sectionLabel ? `Seção: ${context.sectionLabel}` : '',
      context.fieldLabel   ? `Campo: ${context.fieldLabel}`   : '',
      currentContent.trim() ? `\n\nConteúdo atual do campo:\n${stripHtml(currentContent)}` : '',
    ].filter(Boolean)
    return parts.join('\n')
  }, [context, currentContent])

  const send = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || loading) return
    setLoading(true)
    setError('')
    setResponse('')
    streamBuffer.current = ''

    const fullMessage = `${buildSystemContext()}\n\n${userMessage}`
    const activeSlug  = context.section ?? 'investigar_visao_geral'
    const activeTitle = context.sectionLabel ?? context.phaseLabel ?? 'Assistente'

    const t0 = Date.now()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 90_000)

    const payload = {
      messages: [{ role: 'user', content: fullMessage }],
      project: context.project,
      activeSlug,
      activeTitle,
    }

    try {
      const res = await fetch('/api/claude/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        setError(err.error ?? `Erro ${res.status}. Tente novamente.`)
        return
      }

      if (!res.body) { setError('Resposta inválida do servidor.'); return }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) { setError(`Erro da IA: ${parsed.error}`); return }
            streamBuffer.current += parsed.delta?.text ?? ''
            setResponse(streamBuffer.current)
            setTimeout(() => { responseRef.current?.scrollTo({ top: responseRef.current.scrollHeight }) }, 0)
          } catch { /* ignore SSE parse errors */ }
        }
      }
      console.log('[AIAssistantPanel] stream concluído em', Date.now() - t0, 'ms')

      // Extract JSON checklist block if present (Avaliar action)
      const fullText = streamBuffer.current
      const jsonMatch = fullText.match(/```json\s*(\{[\s\S]*?\})\s*```/)
      if (jsonMatch) {
        const cleanText = fullText.replace(/```json[\s\S]*?```/g, '').trim()
        setResponse(cleanText)
        streamBuffer.current = cleanText
        try {
          const parsed = JSON.parse(jsonMatch[1]) as { items: { title: string; problem?: string; justification?: string; suggestion?: string }[] }
          if (Array.isArray(parsed.items) && parsed.items.length > 0) {
            const res = await fetch('/api/improvement', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                project_id:    context.project.id,
                section_slug:  context.section  ?? null,
                section_label: context.sectionLabel ?? context.phaseLabel ?? null,
                field_label:   context.fieldLabel ?? null,
                items:         parsed.items,
              }),
            })
            if (res.ok) {
              setSavedCount(parsed.items.length)
              window.dispatchEvent(new CustomEvent('lampas:checklist-updated'))
              setTimeout(() => setSavedCount(null), 6000)
            }
          }
        } catch { /* ignore checklist parse errors */ }
      }
    } catch (err) {
      const isTimeout = err instanceof DOMException && err.name === 'AbortError'
      setError(isTimeout
        ? 'Tempo limite excedido (90s). Tente novamente.'
        : err instanceof Error ? `Erro de conexão: ${err.message}` : 'Erro de conexão. Tente novamente.')
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }, [context, currentContent, buildSystemContext, loading])

  function handleInsert()  { if (response) { onInsert(mdToHtml(response));  setResponse('') } }
  function handleReplace() { if (response) { onReplace(mdToHtml(response)); setResponse('') } }
  function handleAppend()  { if (response) { onAppend(mdToHtml(response));  setResponse('') } }
  function handleCopy()    {
    if (!response) return
    navigator.clipboard.writeText(response).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }).catch(() => {})
  }

  const hasResponse = response.trim().length > 0

  const phaseColor = context.phase === 'preparar'
    ? '#0F766E' : context.phase === 'investigar'
    ? '#163A6B' : context.phase === 'comunicar'
    ? '#7C3AED' : '#6366F1'

  function actionBtnStyle(groupColor: string, highlight = false): React.CSSProperties {
    return {
      display: 'flex', alignItems: 'center', gap: '0.3rem',
      background: highlight ? `${groupColor}0D` : '#F8FAFC',
      border: `1px solid ${highlight ? `${groupColor}35` : '#E2E8F0'}`,
      borderRadius: '7px', padding: '0.35rem 0.6rem',
      fontSize: '0.74rem', fontWeight: highlight ? 600 : 500,
      color: highlight ? groupColor : '#475569',
      cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
      transition: 'all 0.12s', flexShrink: 0,
      opacity: loading ? 0.5 : 1,
    }
  }

  function insertBtnStyle(primary = false): React.CSSProperties {
    return {
      display: 'flex', alignItems: 'center', gap: '0.35rem',
      background: primary ? phaseColor : '#F8FAFC',
      border: `1px solid ${primary ? phaseColor : '#E2E8F0'}`,
      borderRadius: '7px', padding: '0.38rem 0.65rem',
      fontSize: '0.74rem', fontWeight: 500,
      color: primary ? '#fff' : '#475569',
      cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
      transition: 'all 0.12s', flexShrink: 0,
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0,
      width: '420px', zIndex: 5000,
      background: '#FFFFFF',
      borderLeft: '1px solid #E2E8F0',
      boxShadow: '-8px 0 32px rgba(0,0,0,0.09), -2px 0 6px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'inherit',
      animation: 'slideInRight 0.18s ease-out',
    }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        padding: '0.85rem 1rem 0.75rem',
        borderBottom: '1px solid #F1F5F9',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '1rem' }}>✨</span>
        <span style={{ flex: 1, fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
          Assistente IA
        </span>
        <button
          onClick={onClose}
          style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#94A3B8', borderRadius: '6px' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#475569' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8' }}
        >✕</button>
      </div>

      {/* ── Context pill ── */}
      <div style={{
        padding: '0.55rem 1rem',
        borderBottom: '1px solid #F1F5F9',
        background: `${phaseColor}07`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: phaseColor, letterSpacing: '-0.01em' }}>
            {context.project.book} {context.project.passage_ref}
          </span>
          {context.phaseLabel && <>
            <span style={{ fontSize: '0.7rem', color: '#CBD5E1' }}>›</span>
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{context.phaseLabel}</span>
          </>}
          {context.sectionLabel && <>
            <span style={{ fontSize: '0.7rem', color: '#CBD5E1' }}>›</span>
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{context.sectionLabel}</span>
          </>}
          {context.fieldLabel && <>
            <span style={{ fontSize: '0.7rem', color: '#CBD5E1' }}>›</span>
            <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{context.fieldLabel}</span>
          </>}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* ── Contextual action groups ── */}
        <div style={{ padding: '0.85rem 1rem 0.5rem' }}>
          {actionGroups.map((group, gIdx) => {
            const isExpanded = activeGroup === null || activeGroup === group.id
            return (
              <div key={group.id + gIdx} style={{ marginBottom: gIdx < actionGroups.length - 1 ? '1rem' : '0.4rem' }}>

                {/* Group header */}
                <button
                  type="button"
                  onClick={() => setActiveGroup(prev => prev === group.id ? null : group.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    width: '100%', background: 'none', border: 'none',
                    cursor: 'pointer', padding: '0 0 0.45rem 0',
                    marginBottom: isExpanded ? '0.45rem' : 0,
                  }}
                >
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, color: group.color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {group.label}
                  </span>
                  <div style={{ flex: 1, height: '1px', background: `${group.color}22` }} />
                  <span style={{ fontSize: '0.55rem', color: group.color, opacity: 0.6, transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s', lineHeight: 1 }}>▾</span>
                </button>

                {/* Group buttons */}
                {isExpanded && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {group.actions.map(a => (
                      <button
                        key={a.label}
                        onClick={() => send(a.prompt)}
                        disabled={loading}
                        style={actionBtnStyle(group.color, a.highlight)}
                        onMouseEnter={e => {
                          if (loading) return
                          e.currentTarget.style.borderColor = `${group.color}55`
                          e.currentTarget.style.color = group.color
                          e.currentTarget.style.background = `${group.color}0D`
                        }}
                        onMouseLeave={e => {
                          if (a.highlight) {
                            e.currentTarget.style.borderColor = `${group.color}35`
                            e.currentTarget.style.color = group.color
                            e.currentTarget.style.background = `${group.color}0D`
                          } else {
                            e.currentTarget.style.borderColor = '#E2E8F0'
                            e.currentTarget.style.color = '#475569'
                            e.currentTarget.style.background = '#F8FAFC'
                          }
                        }}
                      >
                        {a.highlight && <span style={{ fontSize: '0.7rem' }}>⭐</span>}
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Response area ── */}
        {(loading || hasResponse || error) && (
          <div style={{ margin: '0 1rem 0.75rem', border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden', background: '#FAFAFA' }}>
            <div ref={responseRef} style={{ maxHeight: '420px', overflowY: 'auto', padding: '0.75rem 0.85rem' }}>
              {error && <p style={{ fontSize: '0.78rem', color: '#EF4444', margin: 0 }}>{error}</p>}
              {loading && !response && (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '0.5rem 0' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: phaseColor, opacity: 0.4, animation: `dot-bounce 1s ease-in-out ${i * 0.15}s infinite` }} />
                  ))}
                </div>
              )}
              {response && (
                <div style={{ fontSize: '0.83rem' }}>
                  <MarkdownRenderer content={response} moduleColor={phaseColor} />
                </div>
              )}
            </div>

            {savedCount !== null && (
              <div style={{ padding: '0.5rem 0.85rem', borderTop: '1px solid #F1F5F9', background: '#F0FDF4', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 600 }}>
                  ✓ {savedCount} melhoria{savedCount !== 1 ? 's' : ''} salva{savedCount !== 1 ? 's' : ''} no checklist
                </span>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('lampas:open-checklist'))}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', color: '#16A34A', fontWeight: 700, fontFamily: 'inherit', textDecoration: 'underline', padding: 0 }}
                >
                  Ver checklist →
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{ flex: 1 }} />
      </div>

      {/* ── Action strip — visível quando há resposta ── */}
      {hasResponse && !loading && (
        <div style={{ flexShrink: 0, display: 'flex', gap: '0.35rem', flexWrap: 'wrap', padding: '0.55rem 0.85rem', borderTop: '1px solid #E2E8F0', background: '#FFFFFF', boxShadow: '0 -2px 8px rgba(0,0,0,0.05)', zIndex: 10 }}>
          <button onClick={handleInsert} style={{ ...insertBtnStyle(true) }} onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }} onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}>Inserir</button>
          <button onClick={handleReplace} style={insertBtnStyle()} onMouseEnter={e => { e.currentTarget.style.borderColor = '#94A3B8'; e.currentTarget.style.color = '#1E293B' }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569' }}>Substituir</button>
          <button onClick={handleAppend} style={insertBtnStyle()} onMouseEnter={e => { e.currentTarget.style.borderColor = '#94A3B8'; e.currentTarget.style.color = '#1E293B' }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569' }}>Adicionar abaixo</button>
          <button onClick={handleCopy} style={{ ...insertBtnStyle(), marginLeft: 'auto' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#94A3B8' }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0' }}>{copied ? '✓ Copiado' : 'Copiar'}</button>
        </div>
      )}

      {/* ── Chat input ── */}
      <div style={{ padding: '0.65rem 1rem', borderTop: '1px solid #F1F5F9', flexShrink: 0, background: '#FAFAFA' }}>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-end', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.5rem 0.65rem', transition: 'border-color 0.12s' }}>
          <textarea
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (chatInput.trim()) { send(chatInput.trim()); setChatInput('') }
              }
            }}
            placeholder="Pergunte algo sobre esta seção…"
            rows={2}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontFamily: 'inherit', fontSize: '0.82rem', color: '#1E293B', lineHeight: 1.5 }}
          />
          <button
            onClick={() => { if (chatInput.trim()) { send(chatInput.trim()); setChatInput('') } }}
            disabled={!chatInput.trim() || loading}
            style={{ flexShrink: 0, width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: chatInput.trim() && !loading ? phaseColor : '#E2E8F0', border: 'none', borderRadius: '7px', cursor: chatInput.trim() && !loading ? 'pointer' : 'default', fontSize: '0.8rem', color: chatInput.trim() && !loading ? '#fff' : '#94A3B8', transition: 'all 0.12s' }}
          >↑</button>
        </div>
        <p style={{ fontSize: '0.62rem', color: '#CBD5E1', marginTop: '0.35rem', textAlign: 'center' }}>
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
