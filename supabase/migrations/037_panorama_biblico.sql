-- 037_panorama_biblico.sql
-- Panorama Bíblico: 66 livros canônicos como templates curados na Base de Conhecimento
-- Requer: migration 019_knowledge_base.sql e 026_knowledge_templates.sql já executadas

DO $$
DECLARE
  v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = 'rogeriocchavesxp@gmail.com' LIMIT 1;
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Usuário admin não encontrado. Verifique o email em rogeriocchavesxp@gmail.com';
  END IF;

  DELETE FROM public.knowledge_items
  WHERE category = 'panorama_biblico' AND is_template = true AND user_id = v_uid;

  INSERT INTO public.knowledge_items
    (user_id, item_type, title, subtitle, summary, status, category, subcategory,
     bible_references, themes, doctrines, content, tags, is_template, language, rating)
  VALUES

  -- ═══════════════════════════════════════════
  -- PENTATEUCO (5 livros)
  -- ═══════════════════════════════════════════

  (v_uid, 'personal_document', 'Gênesis', 'A origem de todas as coisas',
   'Gênesis narra a criação do universo e do ser humano, a queda no pecado e seus desdobramentos imediatos. A aliança com Noé, o chamado de Abraão e a promessa de uma descendência que abençoaria todas as nações formam o alicerce teológico das Escrituras. Os capítulos 12–50 acompanham a jornada dos patriarcas — Abraão, Isaque, Jacó e José — mostrando como Deus é fiel às suas promessas mesmo em meio à fraqueza humana.',
   'reviewed', 'panorama_biblico', 'Pentateuco',
   ARRAY['Gênesis'], ARRAY['Criação', 'Queda', 'Aliança', 'Providência'],
   ARRAY['Teologia da Criação', 'Hamartologia', 'Teologia da Aliança'],
   '{"purpose": "Mostrar que Deus é o Criador soberano que age em aliança com a humanidade apesar da queda.", "outline": "1–11: Origens primordiais (criação, queda, dilúvio, Babel); 12–25: Abraão; 25–36: Isaque e Jacó; 37–50: José no Egito.", "key_passages": "Gn 1.1; 3.15; 12.1-3; 15.6; 50.20", "historical_context": "Provavelmente editado por Moisés durante a peregrinação no deserto (séc. XV a.C.)."}'::jsonb,
   ARRAY['at', 'pentateuco', 'torah'], true, 'pt', 5),

  (v_uid, 'personal_document', 'Êxodo', 'Da escravidão à aliança no Sinai',
   'Êxodo narra a libertação de Israel do Egito sob a liderança de Moisés — as dez pragas, a Páscoa e a travessia do Mar Vermelho. No Sinai, Deus celebra aliança com Israel e dá a Lei (Dez Mandamentos e legislação civil/cerimonial). Os capítulos finais descrevem a construção do tabernáculo, sinal da presença de Deus em meio ao povo.',
   'reviewed', 'panorama_biblico', 'Pentateuco',
   ARRAY['Êxodo'], ARRAY['Redenção', 'Lei', 'Culto', 'Identidade Nacional'],
   ARRAY['Soteriologia', 'Teologia da Lei', 'Teologia da Aliança'],
   '{"purpose": "Revelar Deus como Redentor que liberta seu povo para que vivam como nação santa sob sua aliança.", "outline": "1–12: Opressão e pragas; 13–18: Travessia e peregrinação; 19–24: Aliança no Sinai; 25–40: Instruções e construção do tabernáculo.", "key_passages": "Ex 3.14; 12.13; 20.1-17; 34.6-7", "historical_context": "Êxodo histórico estimado entre 1446 a.C. (data alta) e 1290 a.C. (data baixa)."}'::jsonb,
   ARRAY['at', 'pentateuco', 'torah'], true, 'pt', 5),

  (v_uid, 'personal_document', 'Levítico', 'A santidade que separa o povo de Deus',
   'Manual do culto levítico: sacrifícios, sacerdócio, pureza cerimonial e o calendário de festas sagradas. O eixo central é "Santos sereis, porque Eu, o Senhor vosso Deus, sou santo" (19.2). Cada rito aponta tipologicamente para Cristo: o cordeiro pascal, o bode expiatório no Dia da Expiação, o sistema sacrificial — tudo cumprido na obra do Filho de Deus.',
   'reviewed', 'panorama_biblico', 'Pentateuco',
   ARRAY['Levítico'], ARRAY['Santidade', 'Sacrifício', 'Pureza', 'Acesso a Deus'],
   ARRAY['Soteriologia', 'Teologia da Expiação', 'Teologia do Culto'],
   '{"purpose": "Instruir Israel sobre como se aproximar de um Deus santo e viver em comunidade sagrada.", "outline": "1–7: Leis dos sacrifícios; 8–10: Consagração dos sacerdotes; 11–15: Leis de pureza; 16: Dia da Expiação; 17–27: Código de Santidade.", "key_passages": "Lv 16.30; 17.11; 19.2; 26.12", "historical_context": "Legislação dada no Sinai, provavelmente no mesmo período de Êxodo (séc. XV a.C.)."}'::jsonb,
   ARRAY['at', 'pentateuco', 'torah'], true, 'pt', 4),

  (v_uid, 'personal_document', 'Números', 'A geração que falhou no deserto',
   'Registra as jornadas de Israel no deserto entre o Sinai e as planícies de Moabe. Dois censos — um no início (geração do Êxodo) e outro no final (nova geração) — delimitam o livro. O episódio dos doze espias e a incredulidade de Israel resultam na sentença de quarenta anos no deserto. Apesar das rebeliões, a fidelidade e a paciência de Deus não falham.',
   'reviewed', 'panorama_biblico', 'Pentateuco',
   ARRAY['Números'], ARRAY['Fidelidade', 'Fracasso', 'Peregrinação', 'Julgamento e Graça'],
   ARRAY['Providência', 'Santidade de Deus', 'Hamartologia'],
   '{"purpose": "Mostrar as consequências da incredulidade e a fidelidade de Deus que preserva um remanescente para cumprir suas promessas.", "outline": "1–10: Preparação no Sinai (censos e ordenações); 11–25: Jornada e rebeliões; 26–36: Nova geração nas planícies de Moabe.", "key_passages": "Nm 6.24-26; 14.18; 21.8-9; 24.17", "historical_context": "Cobre 38 anos de peregrinação, de 1445 a 1406 a.C. aproximadamente."}'::jsonb,
   ARRAY['at', 'pentateuco', 'torah'], true, 'pt', 4),

  (v_uid, 'personal_document', 'Deuteronômio', 'Renovação da aliança às portas da terra prometida',
   'Série de discursos de Moisés à nova geração que entraria em Canaã, reapresentando e expandindo a Lei do Sinai. O Shema (6.4-5) sintetiza o chamado à obediência integral. O livro antecipa bênção pela fidelidade e maldição pela apostasia, preparando teologicamente os livros históricos e proféticos. Jesus citou Deuteronômio três vezes ao resistir às tentações no deserto.',
   'reviewed', 'panorama_biblico', 'Pentateuco',
   ARRAY['Deuteronômio'], ARRAY['Obediência', 'Amor a Deus', 'Aliança', 'Bênção e Maldição'],
   ARRAY['Teologia da Lei', 'Teologia da Aliança', 'Escatologia do AT'],
   '{"purpose": "Renovar a aliança com a nova geração e prepará-la para a vida na terra prometida com obediência à Lei.", "outline": "1–4: Primeiro discurso (revisão histórica); 5–26: Segundo discurso (repetição da Lei); 27–30: Bênçãos e maldições; 31–34: Sucessão e morte de Moisés.", "key_passages": "Dt 6.4-5; 8.3; 18.15; 30.6", "historical_context": "Discursos proferidos nas planícies de Moabe, pouco antes da conquista de Canaã (c. 1406 a.C.)."}'::jsonb,
   ARRAY['at', 'pentateuco', 'torah'], true, 'pt', 5),

  -- ═══════════════════════════════════════════
  -- HISTÓRICOS (12 livros)
  -- ═══════════════════════════════════════════

  (v_uid, 'personal_document', 'Josué', 'A herança prometida finalmente conquistada',
   'Narra a conquista de Canaã sob Josué após a morte de Moisés. A travessia do Jordão, a tomada de Jericó e as campanhas militares demonstram que a vitória é dom de Deus quando Israel obedece. A distribuição das doze tribos cumpre as promessas dadas a Abraão. O livro encerra com a renovação solene do pacto em Siquém.',
   'reviewed', 'panorama_biblico', 'Históricos',
   ARRAY['Josué'], ARRAY['Fidelidade de Deus', 'Obediência', 'Herança', 'Conquista'],
   ARRAY['Teologia da Terra', 'Providência', 'Teologia da Aliança'],
   '{"purpose": "Demonstrar o cumprimento das promessas de Deus sobre a terra mediante a obediência de fé.", "outline": "1–5: Preparação e travessia do Jordão; 6–12: Conquista de Canaã; 13–22: Distribuição da terra; 23–24: Discursos de despedida e renovação do pacto.", "key_passages": "Js 1.8; 2.11; 24.15", "historical_context": "Conquista estimada por volta de 1406–1380 a.C., logo após a morte de Moisés."}'::jsonb,
   ARRAY['at', 'historicos'], true, 'pt', 5),

  (v_uid, 'personal_document', 'Juízes', 'O ciclo recorrente de apostasia, juízo e libertação',
   'Após Josué, Israel entra em ciclo repetido: apostasia, opressão por inimigos, clamor a Deus, e libertação por um juiz carismático. Figuras como Débora, Gideão, Jefté e Sansão ilustram a decadência progressiva. Os dois apêndices finais (caps. 17–21) expõem o abismo moral da era sem rei. O livro revela a necessidade urgente de liderança fiel.',
   'reviewed', 'panorama_biblico', 'Históricos',
   ARRAY['Juízes'], ARRAY['Apostasia', 'Graça', 'Liderança', 'Ciclos Históricos'],
   ARRAY['Hamartologia', 'Providência', 'Cristologia'],
   '{"purpose": "Mostrar as consequências da desobediência e a paciência de Deus em levantar libertadores mesmo em meio à apostasia.", "outline": "1–3.6: Introdução (fracasso da conquista total); 3.7–16: Narrativas dos juízes; 17–21: Dois apêndices de declínio moral.", "key_passages": "Jz 2.16-19; 5.31; 21.25", "historical_context": "Período entre a morte de Josué (c. 1380 a.C.) e o estabelecimento da monarquia (c. 1050 a.C.)."}'::jsonb,
   ARRAY['at', 'historicos'], true, 'pt', 4),

  (v_uid, 'personal_document', 'Rute', 'Fidelidade e redenção no tempo dos juízes',
   'Uma moabita viúva segue sua sogra israelita de volta a Belém, onde encontra providencial amparo em Boaz, parente resgatador (goel). A história demonstra que a aliança de Deus não está limitada a Israel: a fé genuína é reconhecida além das fronteiras étnicas. O livro conclui revelando que Rute é antepassada direta do rei Davi.',
   'reviewed', 'panorama_biblico', 'Históricos',
   ARRAY['Rute'], ARRAY['Fidelidade (hesed)', 'Redenção', 'Providência', 'Inclusividade'],
   ARRAY['Cristologia', 'Teologia da Graça', 'Teologia da Aliança'],
   '{"purpose": "Revelar a providência de Deus na vida de pessoas comuns e a extensão da aliança para além de Israel.", "outline": "1: Perda e decisão de Rute; 2: Encontro com Boaz; 3: A reivindicação de Rute; 4: Redenção e linhagem davídica.", "key_passages": "Rt 1.16-17; 2.12; 4.22", "historical_context": "Ambientado no período dos juízes; escrito possivelmente no início da monarquia."}'::jsonb,
   ARRAY['at', 'historicos'], true, 'pt', 5),

  (v_uid, 'personal_document', '1 Samuel', 'Da teocracia à monarquia — Saul e Davi',
   'Cobre a transição de Israel da era dos juízes ao estabelecimento da monarquia. Samuel, último juiz e primeiro profeta-intercessor, unge Saul — o primeiro rei, que falha moralmente — e depois Davi, homem segundo o coração de Deus. As tensões crescentes entre Saul e Davi dominam a segunda metade do livro, revelando que a escolha de Deus transcende a aparência externa.',
   'reviewed', 'panorama_biblico', 'Históricos',
   ARRAY['1 Samuel'], ARRAY['Liderança', 'Obediência', 'Coração Humano', 'Soberania de Deus'],
   ARRAY['Providência', 'Hamartologia', 'Cristologia'],
   '{"purpose": "Mostrar a transição para a monarquia e o padrão de liderança que agrada a Deus — coração fiel, não aparência exterior.", "outline": "1–7: Samuel (nascimento, chamado, ministério); 8–15: Saul (estabelecimento e rejeição); 16–31: Davi e Saul em conflito.", "key_passages": "1Sm 2.2; 16.7; 17.47", "historical_context": "Cobre o período entre c. 1100 e 1010 a.C., do nascimento de Samuel à morte de Saul."}'::jsonb,
   ARRAY['at', 'historicos'], true, 'pt', 5),

  (v_uid, 'personal_document', '2 Samuel', 'O reinado de Davi e a aliança eterna',
   'Relata o pleno estabelecimento do reino unido de Davi sobre Israel. O ponto teológico mais alto é a aliança davídica (cap. 7): Deus promete a Davi um descendente eterno no trono, cumprida em Cristo. A queda de Davi com Bate-Seba e o assassinato de Urias marcam uma inflexão; as consequências internas na família real dominam a segunda metade do livro.',
   'reviewed', 'panorama_biblico', 'Históricos',
   ARRAY['2 Samuel'], ARRAY['Aliança', 'Queda', 'Graça', 'Consequência do Pecado'],
   ARRAY['Aliança Davídica', 'Hamartologia', 'Cristologia'],
   '{"purpose": "Revelar Davi como o tipo do Rei-Messias e o pacto davídico como fundamento da esperança messiânica.", "outline": "1–10: Triunfos de Davi; 11–12: Queda com Bate-Seba; 13–20: Conflitos internos; 21–24: Apêndices.", "key_passages": "2Sm 7.12-16; 12.13; 22.2-3", "historical_context": "Reinado de Davi de c. 1010 a 970 a.C."}'::jsonb,
   ARRAY['at', 'historicos'], true, 'pt', 5),

  (v_uid, 'personal_document', '1 Reis', 'Da glória de Salomão à divisão do reino',
   'Inicia com o reinado glorioso de Salomão — construção do templo, sabedoria, riqueza — e narra sua apostasia ao final. A divisão do reino em 930 a.C. inaugura duas linhas paralelas: Israel (norte) e Judá (sul). O ministério de Elias contra Acabe e Jezabel domina os capítulos finais, revelando o conflito radical entre Baal e o Senhor.',
   'reviewed', 'panorama_biblico', 'Históricos',
   ARRAY['1 Reis'], ARRAY['Sabedoria', 'Idolatria', 'Fidelidade Profética', 'Julgamento'],
   ARRAY['Teologia do Templo', 'Hamartologia', 'Teologia Profética'],
   '{"purpose": "Mostrar que a fidelidade à aliança determina o destino da nação, e que Deus sempre preserva um remanescente por seus profetas.", "outline": "1–11: Salomão (glória e queda); 12: Divisão do reino; 13–22: Reis paralelos de Israel e Judá; Ministério de Elias.", "key_passages": "1Rs 8.27-30; 18.21; 19.12", "historical_context": "Reinado de Salomão c. 970–930 a.C.; divisão do reino e início das monarquias paralelas."}'::jsonb,
   ARRAY['at', 'historicos'], true, 'pt', 4),

  (v_uid, 'personal_document', '2 Reis', 'O caminho ao exílio — julgamento de Israel e Judá',
   'Continuação das histórias paralelas de Israel e Judá. O ministério de Eliseu sucede Elias. Israel (norte) cai para a Assíria em 722 a.C.; Judá (sul) é levada à Babilônia em 586 a.C. Houve reis piedosos como Ezequias e Josias, mas a apostasia nacional acumulada não foi revertida. O livro termina com Jerusalém destruída e o povo no exílio.',
   'reviewed', 'panorama_biblico', 'Históricos',
   ARRAY['2 Reis'], ARRAY['Julgamento', 'Apostasia', 'Reforma', 'Exílio'],
   ARRAY['Teologia Profética', 'Hamartologia', 'Providência'],
   '{"purpose": "Revelar que o julgamento do exílio é consequência da apostasia persistente e do fracasso em seguir a aliança.", "outline": "1–17: Ministério de Eliseu e queda de Israel (norte); 18–25: Judá: Ezequias, Manassés, Josias e queda de Jerusalém.", "key_passages": "2Rs 17.7-8; 22.8; 25.9-10", "historical_context": "Cobre de c. 850 a 586 a.C., da queda de Israel ao exílio de Judá."}'::jsonb,
   ARRAY['at', 'historicos'], true, 'pt', 4),

  (v_uid, 'personal_document', '1 Crônicas', 'O reinado ideal de Davi — genealogia e culto',
   'Escrito após o retorno do exílio, apresenta releitura da história com ênfase no legado davídico e na continuidade do culto. As longas genealogias (caps. 1–9) conectam Adão ao povo do Retorno. A narrativa foca exclusivamente no reinado de Davi, especialmente nos preparativos para o templo. As falhas de Davi são omitidas para enfatizar o modelo do culto.',
   'reviewed', 'panorama_biblico', 'Históricos',
   ARRAY['1 Crônicas'], ARRAY['Culto', 'Genealogia', 'Herança', 'Continuidade'],
   ARRAY['Teologia do Culto', 'Aliança Davídica', 'Providência'],
   '{"purpose": "Reorientar o povo do Retorno ao legado davídico e ao culto correto como fundamento da comunidade restaurada.", "outline": "1–9: Genealogias de Adão a Saul; 10: Morte de Saul; 11–29: Reinado de Davi e preparação para o templo.", "key_passages": "1Cr 17.14; 29.11-13", "historical_context": "Escrito provavelmente por Esdras após o retorno do exílio (séc. V a.C.)."}'::jsonb,
   ARRAY['at', 'historicos'], true, 'pt', 3),

  (v_uid, 'personal_document', '2 Crônicas', 'De Salomão ao exílio — a perspectiva sacerdotal',
   'Cobre o reinado de Salomão e a história dos reis de Judá até o exílio. A ênfase está na fidelidade ao culto: reis que honram e reformam o templo prosperam; os que se afastam enfrentam julgamento. Grandes reformadores como Josafá, Ezequias e Josias recebem destaque. O livro termina com o édito de Ciro, prenúncio do Retorno.',
   'reviewed', 'panorama_biblico', 'Históricos',
   ARRAY['2 Crônicas'], ARRAY['Culto', 'Reforma', 'Julgamento', 'Esperança'],
   ARRAY['Teologia do Culto', 'Providência', 'Escatologia do AT'],
   '{"purpose": "Mostrar que a fidelidade ao culto e à aliança é o critério pelo qual Deus avalia os reis de Judá.", "outline": "1–9: Salomão; 10–36: Reis de Judá — alternando reformas e apostasias; 36.22-23: Édito de Ciro.", "key_passages": "2Cr 7.14; 20.12; 36.23", "historical_context": "Paralelo a 1–2 Reis, com foco teológico distinto; escrito após o exílio (séc. V a.C.)."}'::jsonb,
   ARRAY['at', 'historicos'], true, 'pt', 3),

  (v_uid, 'personal_document', 'Esdras', 'O retorno e a restauração do culto',
   'Narra em duas ondas o retorno de judeus da Babilônia após o édito de Ciro (538 a.C.). A primeira onda (caps. 1–6) reconstrói o templo apesar da forte oposição. A segunda (caps. 7–10) traz Esdras, escriba e sacerdote, que ensina a Lei e confronta os casamentos mistos com pagãos. A identidade do povo é preservada pela fidelidade à Palavra.',
   'reviewed', 'panorama_biblico', 'Históricos',
   ARRAY['Esdras'], ARRAY['Restauração', 'Culto', 'Reforma', 'Identidade'],
   ARRAY['Providência', 'Teologia da Aliança', 'Eclesiologia'],
   '{"purpose": "Mostrar o cumprimento da profecia de Jeremias e a providência de Deus em restaurar o culto e a identidade de Israel.", "outline": "1–2: Retorno sob Zorobabel; 3–6: Reconstrução do templo; 7–8: Retorno de Esdras; 9–10: Reforma dos casamentos mistos.", "key_passages": "Ed 1.1-4; 7.10; 9.6", "historical_context": "Retorno c. 538 a.C. (Zorobabel) e 458 a.C. (Esdras), no período persa."}'::jsonb,
   ARRAY['at', 'historicos'], true, 'pt', 4),

  (v_uid, 'personal_document', 'Neemias', 'Reconstruindo muros e o coração do povo',
   'Neemias, copeiro do rei persa, recebe permissão divina para reconstruir os muros de Jerusalém. Sua liderança combina oração profunda com ação prática, superando oposição externa (Sambalate) e interna (exploração econômica). A leitura pública da Lei por Esdras provoca renovação espiritual e reafirmação solene da aliança.',
   'reviewed', 'panorama_biblico', 'Históricos',
   ARRAY['Neemias'], ARRAY['Liderança', 'Oração', 'Reconstrução', 'Aliança'],
   ARRAY['Providência', 'Teologia da Aliança', 'Eclesiologia'],
   '{"purpose": "Demonstrar que a restauração do povo começa pelos muros físicos mas culmina na renovação espiritual pela Palavra.", "outline": "1–2: Chamado de Neemias; 3–7: Reconstrução dos muros; 8–10: Renovação espiritual; 11–13: Organização e reformas.", "key_passages": "Ne 1.6; 6.3; 8.8", "historical_context": "Ministério de Neemias c. 445 a.C., durante o reinado de Artaxerxes I."}'::jsonb,
   ARRAY['at', 'historicos'], true, 'pt', 4),

  (v_uid, 'personal_document', 'Ester', 'Providência oculta na diáspora',
   'Ambientado na corte persa, o livro narra como Ester, judia na diáspora, arrisca a vida para salvar seu povo de um genocídio orquestrado por Hamã. O nome de Deus não aparece explicitamente, mas sua providência é visível em cada virada da narrativa. O Purim celebra essa libertação improvável. A coragem de Ester ("se perecer, que pereça") é modelar.',
   'reviewed', 'panorama_biblico', 'Históricos',
   ARRAY['Ester'], ARRAY['Providência', 'Coragem', 'Identidade', 'Preservação'],
   ARRAY['Providência', 'Soberania de Deus', 'Hamartologia'],
   '{"purpose": "Revelar a providência soberana de Deus que preserva seu povo mesmo quando sua ação está oculta.", "outline": "1–2: Ester na corte; 3–4: Ameaça de genocídio; 5–7: Plano de Ester e queda de Hamã; 8–10: Libertação e Purim.", "key_passages": "Et 4.14; 4.16; 8.17", "historical_context": "Ambientado em Susã durante o reinado de Assuero (Xerxes I, c. 480 a.C.)."}'::jsonb,
   ARRAY['at', 'historicos'], true, 'pt', 5),

  -- ═══════════════════════════════════════════
  -- POÉTICOS E SAPIENCIAIS (5 livros)
  -- ═══════════════════════════════════════════

  (v_uid, 'personal_document', 'Jó', 'Por que o justo sofre? — soberania e mistério divinos',
   'Jó é um homem íntegro que perde tudo em calamidades permitidas por Deus como teste de sua fé. Os três amigos oferecem explicações simplistas baseadas na retribuição imediata. A resposta de Deus do meio do redemoinho não explica o sofrimento, mas revela a incompreensibilidade divina. Jó encontra paz não em respostas, mas na presença de Deus — e intercede pelos amigos.',
   'reviewed', 'panorama_biblico', 'Poéticos e Sapienciais',
   ARRAY['Jó'], ARRAY['Sofrimento', 'Soberania de Deus', 'Fé', 'Amizade'],
   ARRAY['Teodiceia', 'Providência', 'Escatologia'],
   '{"purpose": "Confrontar a teologia mecanicista da retribuição e revelar que o sofrimento do justo é compatível com a soberania de Deus.", "outline": "1–2: Prólogo (céu e terra); 3–37: Diálogos de Jó com os amigos e Eliú; 38–41: Deus fala do redemoinho; 42: Epílogo e restauração.", "key_passages": "Jó 1.21; 13.15; 19.25-26; 40.4", "historical_context": "Possivelmente o livro mais antigo da Bíblia; Jó é situado no período patriarcal."}'::jsonb,
   ARRAY['at', 'poeticos', 'sapienciais'], true, 'pt', 5),

  (v_uid, 'personal_document', 'Salmos', 'O hinário de Israel — 150 orações em verso',
   'Coleção de 150 poemas e hinos que cobrem toda a gama da experiência humana diante de Deus: louvor exuberante, lamentos profundos, ações de graças, petições urgentes e meditações sobre a Torah. Organizados em cinco livros (espelhando o Pentateuco), os Salmos são o coração devocional do AT e o livro mais citado no NT. Cristo usou o Salmo 22 na cruz e o Salmo 16 prediz a ressurreição.',
   'reviewed', 'panorama_biblico', 'Poéticos e Sapienciais',
   ARRAY['Salmos'], ARRAY['Louvor', 'Lamento', 'Confiança', 'Esperança Messiânica'],
   ARRAY['Cristologia', 'Teologia do Culto', 'Escatologia'],
   '{"purpose": "Oferecer expressão litúrgica e devocional para toda a experiência humana diante de Deus, apontando para Cristo.", "outline": "Livro I (1–41): Salmos davídicos; II (42–72): Ascensão ao poder; III (73–89): Crise e lamento; IV (90–106): Reinado do Senhor; V (107–150): Louvor e halel.", "key_passages": "Sl 1; 22; 23; 51; 110; 119", "historical_context": "Compilados ao longo de séculos; autores incluem Davi, Asafe, os filhos de Coré e Moisés (Sl 90)."}'::jsonb,
   ARRAY['at', 'poeticos', 'sapienciais'], true, 'pt', 5),

  (v_uid, 'personal_document', 'Provérbios', 'Sabedoria divina para a vida cotidiana',
   'Coletânea de máximas e instruções sobre como viver com sabedoria diante de Deus. O temor do Senhor é o princípio fundante (1.7). Os capítulos abordam discernimento moral, vida familiar, integridade no trabalho, controle do caráter e o perigo da necedade. A Sabedoria é personificada como mulher que chama os simples (cap. 8) — apontando para Cristo.',
   'reviewed', 'panorama_biblico', 'Poéticos e Sapienciais',
   ARRAY['Provérbios'], ARRAY['Sabedoria', 'Temor do Senhor', 'Integridade', 'Família'],
   ARRAY['Cristologia', 'Ética Cristã', 'Antropologia'],
   '{"purpose": "Ensinar a arte de viver bem — com sabedoria prática enraizada no temor do Senhor.", "outline": "1–9: Discursos de instrução (Sabedoria personificada); 10–22.16: Provérbios de Salomão; 22.17–24.34: Palavras dos sábios; 25–31: Outras coleções e mulher virtuosa.", "key_passages": "Pv 1.7; 3.5-6; 8.22-31; 31.30", "historical_context": "Compilado principalmente na época de Salomão, com adições posteriores (séc. X–VII a.C.)."}'::jsonb,
   ARRAY['at', 'poeticos', 'sapienciais'], true, 'pt', 4),

  (v_uid, 'personal_document', 'Eclesiastes', 'Vaidade das vaidades — sentido além do sol',
   'O Pregador examina riqueza, prazer, trabalho e sabedoria "debaixo do sol" e conclui que tudo é vaidade sem referência à eternidade. O livro não é pessimista, mas realista: confronta a ilusão de sentido sem Deus. A conclusão pastoral é temer a Deus e guardar seus mandamentos (12.13) — pois toda vida será julgada por ele.',
   'reviewed', 'panorama_biblico', 'Poéticos e Sapienciais',
   ARRAY['Eclesiastes'], ARRAY['Vaidade', 'Significado', 'Temor de Deus', 'Mortalidade'],
   ARRAY['Antropologia', 'Teologia da Criação', 'Ética Cristã'],
   '{"purpose": "Revelar o vazio de toda busca por sentido sem Deus e redirecionar ao temor e à obediência como fundamento da vida.", "outline": "1–2: Experimentos de sabedoria, prazer e trabalho; 3–5: Reflexões sobre o tempo, justiça e culto; 6–10: A ilusão do sucesso; 11–12: Exortação final — lembrar de Deus.", "key_passages": "Ec 1.2; 3.11; 12.1; 12.13-14", "historical_context": "Atribuído a Salomão no final de sua vida; possivelmente editado por sábios posteriores."}'::jsonb,
   ARRAY['at', 'poeticos', 'sapienciais'], true, 'pt', 4),

  (v_uid, 'personal_document', 'Cântico dos Cânticos', 'Amor conjugal e a glória do amor divino',
   'Poesia de amor entre um noivo e uma noiva, celebrando a beleza do amor e da intimidade dentro do casamento. Na tradição cristã, é também lido como metáfora do amor de Cristo pela Igreja (cf. Ef 5). O livro afirma a bondade da criação e do amor humano, e revela que o desejo redirigido à pessoa certa é um reflexo do amor divino.',
   'reviewed', 'panorama_biblico', 'Poéticos e Sapienciais',
   ARRAY['Cântico dos Cânticos'], ARRAY['Amor', 'Intimidade', 'Beleza', 'Fidelidade'],
   ARRAY['Cristologia', 'Ética do Casamento', 'Teologia da Criação'],
   '{"purpose": "Celebrar o amor conjugal como dom de Deus e tipo da relação entre Cristo e sua noiva, a Igreja.", "outline": "Estrutura dialogal entre o amado (Salomão) e a amada (Sulamita), com vozes do coro.", "key_passages": "Ct 1.2; 2.16; 6.3; 8.6-7", "historical_context": "Atribuído a Salomão; incluído no cânon após debates sobre seu caráter alegórico (Rabi Akiva, séc. I d.C.)."}'::jsonb,
   ARRAY['at', 'poeticos', 'sapienciais'], true, 'pt', 4),

  -- ═══════════════════════════════════════════
  -- PROFETAS MAIORES (5 livros)
  -- ═══════════════════════════════════════════

  (v_uid, 'personal_document', 'Isaías', 'Julgamento e salvação — o Servo que redime',
   'O livro mais citado no NT apresenta na primeira metade (caps. 1–39) oráculos de julgamento contra Israel e as nações, e na segunda (caps. 40–66) visão de consolação, nova criação e restauração messiânica. Os quatro Cânticos do Servo (42; 49; 50; 52–53) descrevem com precisão o sofrimento e a obra redentora de Jesus Cristo.',
   'reviewed', 'panorama_biblico', 'Profetas Maiores',
   ARRAY['Isaías'], ARRAY['Julgamento', 'Consolação', 'Messianismo', 'Nova Criação'],
   ARRAY['Cristologia', 'Escatologia', 'Soteriologia'],
   '{"purpose": "Anunciar o julgamento de Deus sobre a apostasia e a glória da salvação messiânica que tudo restaurará.", "outline": "1–12: Julgamento e promessas para Judá; 13–27: Oráculos contra as nações; 28–39: Contexto histórico assírio; 40–55: Consolação e Servo Sofredor; 56–66: Restauração escatológica.", "key_passages": "Is 6.1-8; 7.14; 9.6-7; 40.31; 52.13–53.12; 61.1-2", "historical_context": "Isaías profetizou c. 740–700 a.C., durante os reinados de Uzias até Ezequias."}'::jsonb,
   ARRAY['at', 'profetas', 'profetas-maiores'], true, 'pt', 5),

  (v_uid, 'personal_document', 'Jeremias', 'O profeta do juízo e da nova aliança',
   'Jeremias profetizou durante os últimos quarenta anos de Judá antes da queda de Jerusalém em 586 a.C. Suas mensagens de julgamento foram sistematicamente rejeitadas. O ponto teológico mais alto é o capítulo 31: a promessa de uma nova aliança inscrita no coração — cumprida em Cristo (Hb 8). Jeremias é chamado de "profeta choroso" por sua angústia pessoal.',
   'reviewed', 'panorama_biblico', 'Profetas Maiores',
   ARRAY['Jeremias'], ARRAY['Julgamento', 'Sofrimento Profético', 'Nova Aliança', 'Arrependimento'],
   ARRAY['Nova Aliança', 'Teologia Profética', 'Hamartologia'],
   '{"purpose": "Proclamar o julgamento iminente de Judá e a promessa da nova aliança que substituirá a aliança sinaítica quebrada.", "outline": "1–25: Oráculos de julgamento; 26–36: Narrativas de conflito e consolação; 37–45: Queda de Jerusalém; 46–51: Oráculos contra as nações; 52: Apêndice histórico.", "key_passages": "Jr 1.5; 17.9; 31.31-34; 29.11", "historical_context": "Ministério de c. 627 a 587 a.C., cobrindo desde Josias até o exílio babilônico."}'::jsonb,
   ARRAY['at', 'profetas', 'profetas-maiores'], true, 'pt', 5),

  (v_uid, 'personal_document', 'Lamentações', 'O luto pela destruição de Jerusalém',
   'Cinco poemas acrósticos que expressam o luto pela destruição de Jerusalém e do templo em 586 a.C. Longe de negar a responsabilidade, o autor reconhece que o julgamento foi justo. O versículo central (3.22-23) — "As misericórdias do Senhor não têm fim; as suas misericórdias se renovam cada manhã" — é uma declaração de fé plantada no coração da dor.',
   'reviewed', 'panorama_biblico', 'Profetas Maiores',
   ARRAY['Lamentações'], ARRAY['Luto', 'Julgamento', 'Esperança', 'Fidelidade de Deus'],
   ARRAY['Teologia do Sofrimento', 'Providência', 'Escatologia do AT'],
   '{"purpose": "Dar expressão litúrgica ao luto pela destruição de Jerusalém e afirmar a fidelidade de Deus mesmo no julgamento.", "outline": "5 poemas: 1 (Jerusalém viúva); 2 (ira do Senhor); 3 (lamento e esperança — cap. central); 4 (bênçãos perdidas); 5 (oração de restauração).", "key_passages": "Lm 1.12; 3.22-26; 3.40", "historical_context": "Escrito imediatamente após 586 a.C.; tradição atribui a Jeremias, o profeta do exílio."}'::jsonb,
   ARRAY['at', 'profetas', 'profetas-maiores'], true, 'pt', 4),

  (v_uid, 'personal_document', 'Ezequiel', 'A glória que parte e o templo que virá',
   'Profeta sacerdotal que ministrou entre os exilados na Babilônia. Suas visões são as mais elaboradas do AT: a carruagem de Deus (caps. 1; 10), o templo profanado e a glória que parte (caps. 8–11), o vale dos ossos secos (cap. 37). O livro culmina com a visão do novo templo escatológico e o retorno da glória divina (caps. 40–48).',
   'reviewed', 'panorama_biblico', 'Profetas Maiores',
   ARRAY['Ezequiel'], ARRAY['Glória de Deus', 'Julgamento', 'Restauração', 'Templo'],
   ARRAY['Pneumatologia', 'Escatologia', 'Teologia do Santuário'],
   '{"purpose": "Revelar que a glória de Deus é portátil e voltará ao templo restaurado, animado pelo Espírito que ressuscita os mortos.", "outline": "1–3: Visão e chamado; 4–24: Julgamento de Jerusalém; 25–32: Oráculos contra as nações; 33–39: Restauração de Israel; 40–48: Visão do templo escatológico.", "key_passages": "Ez 1.28; 11.23; 36.26-27; 37.14; 47.1", "historical_context": "Ministério entre os exilados em Babilônia, 593–571 a.C."}'::jsonb,
   ARRAY['at', 'profetas', 'profetas-maiores'], true, 'pt', 4),

  (v_uid, 'personal_document', 'Daniel', 'Fidelidade no exílio e soberania sobre os reinos',
   'Metade narrativa (caps. 1–6): Daniel e seus companheiros demonstram fidelidade a Deus na corte babilônica, da fornalha ardente ao covil dos leões. Metade apocalíptica (caps. 7–12): visões de impérios em conflito e o Filho do Homem que recebe domínio eterno de Deus. O livro demonstra que Deus reina soberanamente sobre todas as nações da história.',
   'reviewed', 'panorama_biblico', 'Profetas Maiores',
   ARRAY['Daniel'], ARRAY['Fidelidade', 'Soberania de Deus', 'Apocalipse', 'Exílio'],
   ARRAY['Escatologia', 'Cristologia', 'Providência'],
   '{"purpose": "Revelar que Deus controla os impérios mundiais e que a fidelidade sob pressão será vindicada no reino eterno do Filho do Homem.", "outline": "1–6: Narrativas de fidelidade (Shadraque, Mesaque, Abede-Nego; festim de Baltazar; covil dos leões); 7–12: Visões apocalípticas (4 bestas, 70 semanas, batalha espiritual).", "key_passages": "Dn 2.44; 7.13-14; 9.24-27; 12.2", "historical_context": "Daniel ministrou em Babilônia c. 605–535 a.C., cobrindo impérios babilônico e medo-persa."}'::jsonb,
   ARRAY['at', 'profetas', 'profetas-maiores'], true, 'pt', 5),

  -- ═══════════════════════════════════════════
  -- PROFETAS MENORES (12 livros)
  -- ═══════════════════════════════════════════

  (v_uid, 'personal_document', 'Oseias', 'O casamento profético que revela o amor de Deus',
   'Deus manda Oseias casar com Gomer, mulher infiel, como símbolo da relação entre o Senhor e Israel. A apostasia de Israel é descrita como adultério espiritual. Mas o amor de Deus (hesed) persiste: há chamado constante ao arrependimento e promessa de restauração. "Quero misericórdia e não sacrifício" (6.6) é citado por Jesus duas vezes nos Evangelhos.',
   'reviewed', 'panorama_biblico', 'Profetas Menores',
   ARRAY['Oseias'], ARRAY['Amor Divino', 'Apostasia', 'Arrependimento', 'Misericórdia'],
   ARRAY['Teologia da Aliança', 'Hamartologia', 'Cristologia'],
   '{"purpose": "Revelar o amor inabalável de Deus por um povo infiel, chamando-o ao arrependimento através da metáfora conjugal.", "outline": "1–3: Casamento de Oseias como símbolo profético; 4–14: Oráculos de julgamento intercalados com chamados ao retorno.", "key_passages": "Os 6.6; 11.1; 11.8; 14.4", "historical_context": "Ministério de Oseias em Israel (reino do norte), c. 750–720 a.C., antes da queda assíria."}'::jsonb,
   ARRAY['at', 'profetas', 'profetas-menores'], true, 'pt', 4),

  (v_uid, 'personal_document', 'Joel', 'O Dia do Senhor e o derramamento do Espírito',
   'Uma praga de gafanhotos serve como símbolo do iminente Dia do Senhor, chamando Israel ao arrependimento e ao jejum. A promessa central (2.28-32) anuncia o derramamento do Espírito sobre toda a carne — cumprida no Pentecostes conforme Pedro em Atos 2. O livro termina com julgamento das nações e restauração de Judá na era messiânica.',
   'reviewed', 'panorama_biblico', 'Profetas Menores',
   ARRAY['Joel'], ARRAY['Arrependimento', 'Dia do Senhor', 'Espírito Santo', 'Escatologia'],
   ARRAY['Pneumatologia', 'Escatologia', 'Hamartologia'],
   '{"purpose": "Chamar Israel ao arrependimento diante do Dia do Senhor e anunciar o derramamento escatológico do Espírito.", "outline": "1: Lamento pela praga de gafanhotos; 2.1-17: Chamado ao arrependimento; 2.18-32: Promessa do Espírito; 3: Julgamento das nações.", "key_passages": "Jl 2.12-13; 2.28-29; 2.32", "historical_context": "Datação incerta; possivelmente pré-exílico (séc. IX a.C.) ou pós-exílico."}'::jsonb,
   ARRAY['at', 'profetas', 'profetas-menores'], true, 'pt', 4),

  (v_uid, 'personal_document', 'Amós', 'Justiça que corra como um rio',
   'Pastor de Tecoa chamado a profetizar no reino do norte durante prosperidade e corrupção. Amós denuncia injustiça socioeconômica, adoração ritualística vazia e privilégio étnico infundado. O culto sem ética é abominável a Deus. "Corra, porém, o juízo como as águas" (5.24) é um dos textos proféticos mais conhecidos e influentes na história.',
   'reviewed', 'panorama_biblico', 'Profetas Menores',
   ARRAY['Amós'], ARRAY['Justiça Social', 'Culto Genuíno', 'Julgamento', 'Pobreza'],
   ARRAY['Ética Cristã', 'Hamartologia', 'Teologia do Culto'],
   '{"purpose": "Denunciar que o culto sem justiça é falso, e que Deus exige integridade social como expressão da verdadeira adoração.", "outline": "1–2: Oráculos contra as nações (incluindo Israel); 3–6: Discursos de julgamento; 7–9: Visões de julgamento e promessa de restauração.", "key_passages": "Am 3.2; 5.21-24; 9.11-12", "historical_context": "Ministério de Amós em Israel (norte), c. 760–750 a.C., durante prosperidade de Jeroboão II."}'::jsonb,
   ARRAY['at', 'profetas', 'profetas-menores'], true, 'pt', 4),

  (v_uid, 'personal_document', 'Obadias', 'O julgamento de Edom por trair Israel',
   'O menor livro do AT (21 versículos) pronuncia julgamento sobre Edom, povo de Esaú, pela traição a Jacó-Israel no dia da calamidade. A arrogância de Edom em sua posição estratégica de Petra será punida. O livro conclui com esperança para Israel: "O reino será do Senhor." Um lembrete de que Deus é fiel mesmo quando os irmãos traem.',
   'reviewed', 'panorama_biblico', 'Profetas Menores',
   ARRAY['Obadias'], ARRAY['Julgamento', 'Arrogância', 'Aliança', 'Justiça'],
   ARRAY['Providência', 'Escatologia do AT', 'Teologia da Aliança'],
   '{"purpose": "Anunciar o julgamento divino sobre Edom pela traição a Israel e confirmar a proteção de Deus sobre seu povo.", "outline": "1–9: Julgamento sobre a arrogância de Edom; 10–14: Crimes de Edom contra Israel; 15–21: Dia do Senhor e reino de Deus.", "key_passages": "Ob 3; 15; 21", "historical_context": "Possivelmente escrito após 586 a.C., quando Edom se alegrou com a queda de Jerusalém."}'::jsonb,
   ARRAY['at', 'profetas', 'profetas-menores'], true, 'pt', 3),

  (v_uid, 'personal_document', 'Jonas', 'A misericórdia universal de Deus além de Israel',
   'Jonas recusa a missão a Nínive, inimiga de Israel, e foge de Deus. Após o episódio com o grande peixe, vai a Nínive e prega minimamente — e toda a cidade se arrepende! O profeta fica irritado com a misericórdia de Deus sobre os gentios. O livro confronta o exclusivismo religioso e revela o coração de Deus para todas as nações do mundo.',
   'reviewed', 'panorama_biblico', 'Profetas Menores',
   ARRAY['Jonas'], ARRAY['Misericórdia', 'Universalidade do Evangelho', 'Arrependimento', 'Fuga'],
   ARRAY['Soberania de Deus', 'Hamartologia', 'Soteriologia'],
   '{"purpose": "Revelar que a misericórdia de Deus não se limita a Israel e confrontar o exclusivismo religioso do profeta.", "outline": "1: Fuga de Jonas; 2: Oração do ventre do peixe; 3: Pregação em Nínive e arrependimento; 4: Lição sobre a misericórdia de Deus.", "key_passages": "Jn 1.3; 2.9; 3.10; 4.11", "historical_context": "Nínive capital assíria; Jonas ministrou no séc. VIII a.C. (cf. 2Rs 14.25)."}'::jsonb,
   ARRAY['at', 'profetas', 'profetas-menores'], true, 'pt', 5),

  (v_uid, 'personal_document', 'Miquéias', 'Julgamento, esperança e o Messias de Belém',
   'Contemporâneo de Isaías, Miquéias denuncia a corrupção de líderes, sacerdotes e falsos profetas de Judá e Israel. A promessa messiânica de 5.2 — o governante que nascerá em Belém — é uma das mais claras profecias sobre o nascimento de Cristo. O texto central (6.8) resume a ética profética: "Fazer justiça, amar a misericórdia e andar humildemente com o teu Deus."',
   'reviewed', 'panorama_biblico', 'Profetas Menores',
   ARRAY['Miquéias'], ARRAY['Justiça', 'Misericórdia', 'Messianismo', 'Humildade'],
   ARRAY['Cristologia', 'Ética Cristã', 'Escatologia'],
   '{"purpose": "Denunciar a injustiça dos líderes, anunciar o julgamento iminente e proclamar a esperança no Messias que virá de Belém.", "outline": "1–3: Julgamento de Judá e Israel; 4–5: Promessas de restauração messiânica; 6–7: Lamento e esperança final.", "key_passages": "Mq 5.2; 6.8; 7.18-19", "historical_context": "Miquéias profetizou c. 737–690 a.C., contemporâneo de Isaías e Oseias."}'::jsonb,
   ARRAY['at', 'profetas', 'profetas-menores'], true, 'pt', 5),

  (v_uid, 'personal_document', 'Naum', 'A queda de Nínive — o Senhor vinga os oprimidos',
   'Cerca de 150 anos após o arrependimento de Nínive (Livro de Jonas), a cidade voltou à maldade. Naum anuncia seu fim irreversível como expressão da ira santa de Deus sobre a Assíria opressora. O livro não é cruel, mas afirma que a paciência de Deus tem limites e que há consolo real para os oprimidos quando a injustiça é finalmente punida.',
   'reviewed', 'panorama_biblico', 'Profetas Menores',
   ARRAY['Naum'], ARRAY['Julgamento', 'Ira Divina', 'Justiça', 'Soberania'],
   ARRAY['Santidade de Deus', 'Providência', 'Escatologia do AT'],
   '{"purpose": "Anunciar a queda de Nínive como expressão da justiça de Deus e consolo para os povos oprimidos pela Assíria.", "outline": "1: Natureza do Senhor (ira e bondade); 2: Visão da queda de Nínive; 3: Razões do julgamento.", "key_passages": "Na 1.7; 1.15; 3.19", "historical_context": "Profetizou a queda de Nínive (612 a.C.) possivelmente nas décadas anteriores ao evento."}'::jsonb,
   ARRAY['at', 'profetas', 'profetas-menores'], true, 'pt', 3),

  (v_uid, 'personal_document', 'Habacuque', 'Fé na soberania de Deus diante do mal',
   'Habacuque dialoga com Deus em forma de lamento: por que o mal prospera em Judá? Deus responde que usará a Babilônia — mais perversa ainda — como instrumento de julgamento, o que surpreende o profeta. A resposta final: "O justo viverá pela sua fé" (2.4), base da doutrina paulina da justificação. O capítulo 3 é um hino de confiança radical apesar das circunstâncias.',
   'reviewed', 'panorama_biblico', 'Profetas Menores',
   ARRAY['Habacuque'], ARRAY['Fé', 'Soberania de Deus', 'Teodiceia', 'Confiança'],
   ARRAY['Justificação pela Fé', 'Providência', 'Teologia do Sofrimento'],
   '{"purpose": "Mostrar que a fé genuína confia na soberania de Deus mesmo quando o mal parece triunfar.", "outline": "1.1-4: Primeiro lamento (por que tolerar o mal?); 1.5-11: Resposta divina (usará Babilônia); 1.12–2.1: Segundo lamento; 2.2-20: Resposta (o justo viverá pela fé); 3: Oração-hino.", "key_passages": "Hc 2.4; 3.17-19", "historical_context": "Ministério c. 610–605 a.C., antes da invasão babilônica de Judá."}'::jsonb,
   ARRAY['at', 'profetas', 'profetas-menores'], true, 'pt', 5),

  (v_uid, 'personal_document', 'Sofonias', 'O Dia do Senhor e o remanescente fiel',
   'Profetizou durante o reinado de Josias, antes da reforma. Anuncia o Dia do Senhor como julgamento universal — não apenas sobre Judá e as nações, mas sobre toda a criação. O livro termina com uma das promessas mais calorosas do AT: Deus se alegrará sobre seu remanescente com cânticos de júbilo (3.17) — imagem extraordinária de Deus que canta sobre seu povo.',
   'reviewed', 'panorama_biblico', 'Profetas Menores',
   ARRAY['Sofonias'], ARRAY['Dia do Senhor', 'Julgamento Universal', 'Remanescente', 'Alegria de Deus'],
   ARRAY['Escatologia', 'Soteriologia', 'Providência'],
   '{"purpose": "Anunciar julgamento universal e revelar que Deus preserva e se regozija sobre um remanescente humilde.", "outline": "1.1–3.8: Julgamento sobre Judá e as nações; 3.9-20: Restauração do remanescente e alegria de Deus.", "key_passages": "Sf 1.7; 2.3; 3.17", "historical_context": "Ministério durante o reinado de Josias, c. 640–621 a.C."}'::jsonb,
   ARRAY['at', 'profetas', 'profetas-menores'], true, 'pt', 4),

  (v_uid, 'personal_document', 'Ageu', 'Prioridades: reconstruir o templo e receber a glória',
   'Após o retorno do exílio, o povo negligenciou a reconstrução do templo para cuidar de seus próprios interesses. Ageu, com quatro mensagens breves (520 a.C.), desafia o povo a colocar Deus em primeiro lugar. A promessa de que "a glória desta última casa será maior do que a da primeira" (2.9) aponta para a presença de Cristo no templo renovado.',
   'reviewed', 'panorama_biblico', 'Profetas Menores',
   ARRAY['Ageu'], ARRAY['Prioridades', 'Culto', 'Glória de Deus', 'Fé'],
   ARRAY['Cristologia', 'Teologia do Culto', 'Providência'],
   '{"purpose": "Motivar o povo do Retorno a priorizar a casa de Deus e receber a promessa da glória messiânica que virá.", "outline": "1: Chamado a reconstruir o templo; 2.1-9: Promessa de glória futura; 2.10-19: Abençoará a partir da obediência; 2.20-23: Promessa a Zorobabel.", "key_passages": "Ag 1.8; 2.7-9; 2.23", "historical_context": "Ministério em Jerusalém em 520 a.C., junto com Zacarias, após o retorno da Babilônia."}'::jsonb,
   ARRAY['at', 'profetas', 'profetas-menores'], true, 'pt', 3),

  (v_uid, 'personal_document', 'Zacarias', 'Visões messiânicas e o Rei que vem sobre um jumento',
   'O mais extenso profeta menor, contemporâneo de Ageu. Suas oito visões noturnas abordam restauração de Israel e vinda messiânica. Os capítulos 9–14 são apocalípticos: o Rei entrando em Jerusalém sobre um jumento (9.9 — cumprido em Mt 21), o pastor ferido e as ovelhas dispersas (13.7 — citado por Jesus antes da prisão), o derramamento do Espírito sobre o transpassado (12.10).',
   'reviewed', 'panorama_biblico', 'Profetas Menores',
   ARRAY['Zacarias'], ARRAY['Messianismo', 'Restauração', 'Apocalipse', 'Esperança'],
   ARRAY['Cristologia', 'Escatologia', 'Pneumatologia'],
   '{"purpose": "Encorajar o povo do Retorno com visões da restauração e revelar detalhes da vinda messiânica e julgamento escatológico.", "outline": "1–6: Oito visões noturnas; 7–8: Questão sobre o jejum e promessa de restauração; 9–11: Primeiro ciclo apocalíptico (Messias Rei); 12–14: Segundo ciclo (batalha e restauração final).", "key_passages": "Zc 2.8; 9.9; 12.10; 13.7", "historical_context": "Ministério em Jerusalém, 520–518 a.C. (caps. 1–8) e possível continuação posterior (caps. 9–14)."}'::jsonb,
   ARRAY['at', 'profetas', 'profetas-menores'], true, 'pt', 5),

  (v_uid, 'personal_document', 'Malaquias', 'Culto corrompido e o mensageiro que preparará o caminho',
   'Último livro profético do AT, escrito após o retorno. Mediante estilo dialogal (perguntas e respostas), Malaquias denuncia sacerdotes que oferecem sacrifícios defeituosos, casamentos mistos, dízimos roubados e cinismo religioso. A promessa de "Elias" (4.5-6) é cumprida em João Batista (Mt 11.14) — o AT termina aguardando a chegada do Messias.',
   'reviewed', 'panorama_biblico', 'Profetas Menores',
   ARRAY['Malaquias'], ARRAY['Adoração Genuína', 'Fidelidade', 'Julgamento', 'Esperança Messiânica'],
   ARRAY['Teologia do Culto', 'Cristologia', 'Escatologia'],
   '{"purpose": "Confrontar a adoração corrompida do pós-exílio e apontar para o mensageiro que preparará o caminho do Senhor.", "outline": "1.1–2.16: Pecados de sacerdotes e povo; 2.17–4.3: Dia do Senhor e purificação; 4.4-6: Exortação final (Elias virá).", "key_passages": "Ml 1.11; 3.1; 3.10; 4.5-6", "historical_context": "Escrito provavelmente c. 430 a.C., contemporâneo de Esdras-Neemias ou posterior."}'::jsonb,
   ARRAY['at', 'profetas', 'profetas-menores'], true, 'pt', 4),

  -- ═══════════════════════════════════════════
  -- EVANGELHOS (4 livros)
  -- ═══════════════════════════════════════════

  (v_uid, 'personal_document', 'Mateus', 'Jesus, o Rei-Messias prometido a Israel',
   'Escrito com ênfase para audiência judaica, Mateus demonstra continuamente que Jesus cumpre as Escrituras do AT (usa "para que se cumprisse" 14 vezes). Os cinco grandes discursos (Sermão do Monte, Missão, Parábolas, Comunidade e Escatologia) estruturam o livro ao redor do ensino do Rei. O final com a Grande Comissão (28.18-20) expande o reino para todas as nações.',
   'reviewed', 'panorama_biblico', 'Evangelhos',
   ARRAY['Mateus'], ARRAY['Cumprimento Profético', 'Reino', 'Discipulado', 'Messianismo'],
   ARRAY['Cristologia', 'Soteriologia', 'Eclesiologia'],
   '{"purpose": "Demonstrar que Jesus é o Messias-Rei esperado que cumpre toda a esperança do AT e estabelece seu reino.", "outline": "1–4: Nascimento e início do ministério; 5–7: Sermão do Monte; 8–10: Milagres e missão; 11–13: Conflito e parábolas; 14–20: Caminho a Jerusalém; 21–28: Paixão e ressurreição.", "key_passages": "Mt 1.23; 5.17; 16.16-18; 28.18-20", "historical_context": "Escrito possivelmente c. 60–80 d.C., provavelmente em ambiente judaico-cristão, talvez Antioquia."}'::jsonb,
   ARRAY['nt', 'evangelhos'], true, 'pt', 5),

  (v_uid, 'personal_document', 'Marcos', 'Jesus, o Servo que age com poder imediato',
   'O Evangelho mais curto e de ritmo mais acelerado, provavelmente o primeiro a ser escrito. "Imediatamente" é seu marcador característico, enfatizando a ação de Jesus mais que seus discursos. Marcos apresenta Jesus como Filho de Deus que serve e sofre — o paradoxo do poder divino revelado na fraqueza da cruz. O "segredo messiânico" é tema teológico central.',
   'reviewed', 'panorama_biblico', 'Evangelhos',
   ARRAY['Marcos'], ARRAY['Serviço', 'Poder', 'Segredo Messiânico', 'Cruz'],
   ARRAY['Cristologia', 'Soteriologia', 'Teologia da Cruz'],
   '{"purpose": "Revelar Jesus como o Filho de Deus Servo que exerce poder divino e dá a vida em resgate de muitos.", "outline": "1: Batismo e início; 2–8: Ministério na Galileia (milagres e conflitos); 8–10: O caminho à cruz (Pedro confessa); 11–15: Paixão em Jerusalém; 16: Ressurreição.", "key_passages": "Mc 1.15; 8.29-31; 10.45; 15.39", "historical_context": "Possivelmente escrito em Roma c. 65 d.C., associado ao apóstolo Pedro segundo a tradição."}'::jsonb,
   ARRAY['nt', 'evangelhos'], true, 'pt', 5),

  (v_uid, 'personal_document', 'Lucas', 'Jesus, o Salvador universal da humanidade',
   'Escrito por um médico gentio para Teófilo, apresenta Jesus como Salvador de todas as pessoas — mulheres, pobres, pecadores, samaritanos, gentios. As parábolas únicas de Lucas (Filho Pródigo, Bom Samaritano, Rico Insensato) revelam o coração do Evangelho. Lucas–Atos forma uma obra em dois volumes sobre a missão do Espírito Santo pelo mundo.',
   'reviewed', 'panorama_biblico', 'Evangelhos',
   ARRAY['Lucas'], ARRAY['Misericórdia Universal', 'Inclusividade', 'Oração', 'Espírito Santo'],
   ARRAY['Soteriologia', 'Cristologia', 'Pneumatologia'],
   '{"purpose": "Apresentar Jesus como o Salvador universal e narrar o cumprimento do plano de Deus para toda a humanidade.", "outline": "1–2: Infância de Jesus; 3–4: Preparação para o ministério; 5–9.50: Galileia; 9.51–19.27: Caminho a Jerusalém (grande seção central); 19.28–24: Paixão e ressurreição.", "key_passages": "Lc 1.46-55; 4.18-19; 15.11-32; 19.10; 24.47", "historical_context": "Escrito c. 60–70 d.C.; Lucas era companheiro de Paulo (Cl 4.14)."}'::jsonb,
   ARRAY['nt', 'evangelhos'], true, 'pt', 5),

  (v_uid, 'personal_document', 'João', 'O Verbo eterno que se fez carne',
   'João começa na eternidade (1.1) e apresenta Jesus por sete "sinais" e sete declarações "Eu Sou". O objetivo explícito é levar à fé (20.31). Os discursos extensos (Nicodemos, samaritana, pão da vida, pastor, videira, promessa do Espírito) são sem paralelo nos Sinóticos. O prólogo cristológico (1.1-18) é o texto mais denso do NT sobre a natureza de Cristo.',
   'reviewed', 'panorama_biblico', 'Evangelhos',
   ARRAY['João'], ARRAY['Fé', 'Vida Eterna', 'Encarnação', 'Glória'],
   ARRAY['Cristologia', 'Soteriologia', 'Pneumatologia'],
   '{"purpose": "Levar o leitor a crer que Jesus é o Cristo, o Filho de Deus, e que crendo tenha vida em seu nome.", "outline": "1–12: O Livro dos Sinais (7 sinais públicos); 13–17: O Livro da Glória (discursos do aposento alto); 18–20: Paixão e ressurreição; 21: Epílogo na Galileia.", "key_passages": "Jo 1.1-14; 3.16; 11.25-26; 14.6; 17.3; 20.31", "historical_context": "Escrito c. 85–95 d.C., possivelmente em Éfeso; último dos Evangelhos canônicos."}'::jsonb,
   ARRAY['nt', 'evangelhos'], true, 'pt', 5),

  -- ═══════════════════════════════════════════
  -- HISTÓRICO NT (1 livro)
  -- ═══════════════════════════════════════════

  (v_uid, 'personal_document', 'Atos dos Apóstolos', 'O Espírito empodera a Igreja até os confins da terra',
   'Continuação do Evangelho de Lucas, narra a expansão da Igreja de Jerusalém até Roma. O Pentecostes (cap. 2), a perseguição de Estêvão (cap. 7), a conversão de Paulo (cap. 9) e as três viagens missionárias estruturam o livro. Atos demonstra que o crescimento da Igreja é obra do Espírito Santo, não estratégia humana — e que o Evangelho avança apesar de toda oposição.',
   'reviewed', 'panorama_biblico', 'Histórico NT',
   ARRAY['Atos'], ARRAY['Espírito Santo', 'Missão', 'Igreja', 'Expansão'],
   ARRAY['Pneumatologia', 'Eclesiologia', 'Missão'],
   '{"purpose": "Demonstrar como o Espírito Santo capacita a Igreja a cumprir a missão de Jesus até os confins da terra.", "outline": "1–7: Jerusalém; 8–12: Judeia e Samaria; 13–28: Até os confins da terra (viagens de Paulo até Roma).", "key_passages": "At 1.8; 2.42-47; 4.12; 9.4-5; 16.31", "historical_context": "Eventos de c. 30–62 d.C.; escrito provavelmente c. 62 d.C. em Roma durante o cativeiro de Paulo."}'::jsonb,
   ARRAY['nt', 'historico-nt'], true, 'pt', 5),

  -- ═══════════════════════════════════════════
  -- CARTAS PAULINAS (13 livros)
  -- ═══════════════════════════════════════════

  (v_uid, 'personal_document', 'Romanos', 'A doutrina sistemática do Evangelho',
   'A carta mais teologicamente densa do NT, escrita a uma igreja que Paulo ainda não visitara. Desenvolve sistematicamente: a universalidade do pecado (1–3), a justificação pela fé (3–5), santificação e vida no Espírito (6–8), o plano de Deus para Israel e os gentios (9–11), e a ética cristã prática (12–16). Fundamenta toda a teologia reformada.',
   'reviewed', 'panorama_biblico', 'Cartas Paulinas',
   ARRAY['Romanos'], ARRAY['Justificação', 'Graça', 'Eleição', 'Ética'],
   ARRAY['Justificação pela Fé', 'Eleição', 'Pneumatologia', 'Antropologia'],
   '{"purpose": "Expor o Evangelho de forma sistemática — do pecado à glória — para uma igreja que Paulo pretendia visitar.", "outline": "1–3: Universalidade do pecado; 3–5: Justificação pela fé; 6–8: Santificação e vida no Espírito; 9–11: Israel e os gentios; 12–16: Ética cristã.", "key_passages": "Rm 1.16-17; 3.23-24; 5.8; 8.1; 8.28-30; 10.9-10", "historical_context": "Escrita em Corinto c. 57 d.C., antes da visita de Paulo a Roma e à Espanha."}'::jsonb,
   ARRAY['nt', 'cartas-paulinas'], true, 'pt', 5),

  (v_uid, 'personal_document', '1 Coríntios', 'Unidade, dons espirituais e a ressurreição central',
   'Resposta a divisões e problemas éticos na Igreja de Corinto: divisões partidárias, imoralidade sexual, processos judiciais, casamento, alimentos sacrificados a ídolos, culto ordenado e dons espirituais. O capítulo 13 (hino do amor) e o capítulo 15 (a ressurreição como fundamento de toda fé cristã) são os pontos teológicos mais altos.',
   'reviewed', 'panorama_biblico', 'Cartas Paulinas',
   ARRAY['1 Coríntios'], ARRAY['Unidade', 'Dons Espirituais', 'Amor', 'Ressurreição'],
   ARRAY['Eclesiologia', 'Pneumatologia', 'Escatologia'],
   '{"purpose": "Corrigir divisões, imaturidade moral e erros doutrinários em Corinto, e fundamentar tudo na ressurreição de Cristo.", "outline": "1–4: Divisões e sabedoria; 5–7: Ética sexual e casamento; 8–11: Ídolos, culto; 12–14: Dons espirituais; 15: Ressurreição; 16: Conclusão.", "key_passages": "1Co 1.18; 2.2; 11.23-26; 13.1-3; 15.3-4; 15.58", "historical_context": "Escrita de Éfeso c. 54–55 d.C., em resposta a relatórios e uma carta da Igreja de Corinto."}'::jsonb,
   ARRAY['nt', 'cartas-paulinas'], true, 'pt', 5),

  (v_uid, 'personal_document', '2 Coríntios', 'Poder na fraqueza — o ministério apostólico autêntico',
   'A mais pessoal das cartas paulinas, defende o apostolado de Paulo contra os "super-apóstolos" que o difamavam. Paulo detalha seu sofrimento como evidência de autenticidade ministerial, não de derrota. O argumento central: o poder de Deus se aperfeiçoa na fraqueza humana (12.9). Os capítulos 8–9 tratam da generosidade e da coleta para os santos de Jerusalém.',
   'reviewed', 'panorama_biblico', 'Cartas Paulinas',
   ARRAY['2 Coríntios'], ARRAY['Sofrimento', 'Ministério', 'Generosidade', 'Fraqueza'],
   ARRAY['Soteriologia', 'Eclesiologia', 'Teologia do Sofrimento'],
   '{"purpose": "Defender a autenticidade apostólica de Paulo e revelar que o ministério genuíno é marcado pelo sofrimento, não pelo triunfalismo.", "outline": "1–7: Consolação e reconciliação; 8–9: Coleta para Jerusalém; 10–13: Defesa apostólica contra os super-apóstolos.", "key_passages": "2Co 4.7; 5.17; 5.21; 12.9-10", "historical_context": "Escrita da Macedônia c. 55–56 d.C., após uma visita dolorosa a Corinto."}'::jsonb,
   ARRAY['nt', 'cartas-paulinas'], true, 'pt', 4),

  (v_uid, 'personal_document', 'Gálatas', 'Liberdade em Cristo contra o legalismo judaizante',
   'Paulo enfrenta judaizantes que exigiam circuncisão e cumprimento da Lei mosaica para a salvação. Com urgência e até dureza, defende que a justificação é pela fé em Cristo, não pelas obras da Lei. A contraposição entre fé e obras, liberdade e escravidão, e a lista dos frutos do Espírito (5.22-23) são centrais para a teologia reformada.',
   'reviewed', 'panorama_biblico', 'Cartas Paulinas',
   ARRAY['Gálatas'], ARRAY['Justificação', 'Liberdade', 'Lei e Graça', 'Espírito Santo'],
   ARRAY['Justificação pela Fé', 'Pneumatologia', 'Teologia da Lei'],
   '{"purpose": "Defender o Evangelho da justificação pela fé contra a exigência judaizante de obras da Lei como condição de salvação.", "outline": "1–2: Defesa apostólica; 3–4: Argumento bíblico (Abraão, Lei e promessa); 5–6: Ética da liberdade no Espírito.", "key_passages": "Gl 1.6-9; 2.16; 2.20; 3.13; 3.28; 5.1; 5.22-23", "historical_context": "Escrita c. 48–49 d.C. (primeira carta paulina?) ou c. 54 d.C.; destinada às igrejas da Galácia."}'::jsonb,
   ARRAY['nt', 'cartas-paulinas'], true, 'pt', 5),

  (v_uid, 'personal_document', 'Efésios', 'Bênçãos espirituais e a Igreja como corpo de Cristo',
   'Provavelmente carta circular, apresenta a riqueza das bênçãos espirituais em Cristo (caps. 1–3) e suas implicações práticas (caps. 4–6). O plano eterno de Deus de unir judeus e gentios em um só corpo — a Igreja — é o mistério revelado. A armadura espiritual (6.10-18) encerra com metáfora militar da vida cristã no mundo hostil.',
   'reviewed', 'panorama_biblico', 'Cartas Paulinas',
   ARRAY['Efésios'], ARRAY['Eleição', 'Igreja', 'Unidade', 'Vida Prática'],
   ARRAY['Eclesiologia', 'Soteriologia', 'Pneumatologia'],
   '{"purpose": "Revelar o plano eterno de Deus de unir todas as coisas em Cristo e chamar a Igreja a viver à altura desta vocação.", "outline": "1: Bênçãos espirituais e eleição; 2: Salvação pela graça e unidade; 3: Mistério da Igreja; 4–6: Vida prática — unidade, renovação, relações, armadura.", "key_passages": "Ef 1.4-5; 2.8-9; 2.14; 3.10-11; 4.11-13; 6.11-18", "historical_context": "Escrita na prisão (Roma?) c. 60–62 d.C.; parte das 'epístolas do cativeiro'."}'::jsonb,
   ARRAY['nt', 'cartas-paulinas'], true, 'pt', 5),

  (v_uid, 'personal_document', 'Filipenses', 'Alegria e humildade em Cristo — da prisão ao céu',
   'A mais calorosa das cartas paulinas, escrita da prisão. Exorta à alegria, à unidade, à humildade e à paz que excede o entendimento. O hino cristológico (2.6-11) — a kenosis de Cristo — é o texto central: o Filho de Deus se esvaziou e foi exaltado. "Para mim o viver é Cristo e o morrer é lucro" (1.21) resume o espírito desta carta.',
   'reviewed', 'panorama_biblico', 'Cartas Paulinas',
   ARRAY['Filipenses'], ARRAY['Alegria', 'Humildade', 'Unidade', 'Contentamento'],
   ARRAY['Cristologia', 'Soteriologia', 'Ética Cristã'],
   '{"purpose": "Encorajar a igreja de Filipos a perseverar com alegria, unidade e humildade imitando o exemplo de Cristo.", "outline": "1: Gratidão e situação de Paulo; 2: Unidade e hino cristológico; 3: Advertências e meta final; 4: Contentamento e paz.", "key_passages": "Fp 1.21; 2.5-11; 3.8-10; 4.7; 4.13", "historical_context": "Escrita da prisão em Roma ou Éfeso, c. 60–62 d.C.; Filipos foi a primeira Igreja europeia de Paulo."}'::jsonb,
   ARRAY['nt', 'cartas-paulinas'], true, 'pt', 5),

  (v_uid, 'personal_document', 'Colossenses', 'A supremacia de Cristo sobre toda criação e todo poder',
   'Escrita para combater uma heresia proto-gnóstica que diminuía Cristo com mistura de filosofia, ascetismo e culto a anjos. Paulo apresenta a supremacia absoluta de Cristo: agente da criação, cabeça da Igreja, plenitude da divindade corporalmente (2.9). A segunda metade aplica essa doutrina à vida familiar e no trabalho.',
   'reviewed', 'panorama_biblico', 'Cartas Paulinas',
   ARRAY['Colossenses'], ARRAY['Supremacia de Cristo', 'Criação', 'Igreja', 'Ética Doméstica'],
   ARRAY['Cristologia', 'Soteriologia', 'Ética Cristã'],
   '{"purpose": "Defender a suficiência absoluta de Cristo contra o sincretismo filosófico-religioso que ameaçava a Igreja.", "outline": "1: Hino a Cristo e apostolado de Paulo; 2: Advertência contra a filosofia e suficiência de Cristo; 3–4: Vida nova em Cristo (família, trabalho).", "key_passages": "Cl 1.15-20; 2.9-10; 3.1-4; 3.23-24", "historical_context": "Escrita na prisão c. 60–62 d.C.; Colossos ficava no vale do Lico, Asia Menor."}'::jsonb,
   ARRAY['nt', 'cartas-paulinas'], true, 'pt', 4),

  (v_uid, 'personal_document', '1 Tessalonicenses', 'Vida cristã e esperança na vinda de Cristo',
   'Primeira carta de Paulo (c. 49 d.C.), escrita a uma jovem igreja em perseguição. Paulo encoraja, instrui sobre santificação e responde ansiedades sobre os cristãos que morreram antes da parousia. A promessa da vinda do Senhor (4.13-18) é apresentada como consolação e esperança, não como cronograma a ser calculado.',
   'reviewed', 'panorama_biblico', 'Cartas Paulinas',
   ARRAY['1 Tessalonicenses'], ARRAY['Fé Sob Perseguição', 'Santificação', 'Parousia', 'Amor Fraternal'],
   ARRAY['Escatologia', 'Santificação', 'Eclesiologia'],
   '{"purpose": "Encorajar uma jovem Igreja perseguida e esclarecer dúvidas sobre o destino dos cristãos falecidos antes da vinda de Cristo.", "outline": "1–3: Gratidão e afeto pastoral; 4: Instrução sobre santificação e parousia; 5: Vigilância e exortações finais.", "key_passages": "1Ts 4.13-18; 5.2; 5.16-18", "historical_context": "Escrita de Corinto c. 49 d.C., logo após Paulo ter que deixar Tessalônica por causa da perseguição."}'::jsonb,
   ARRAY['nt', 'cartas-paulinas'], true, 'pt', 4),

  (v_uid, 'personal_document', '2 Tessalonicenses', 'Correção sobre os sinais do fim e o chamado ao trabalho',
   'Escrita logo após a primeira, corrige a falsa ideia de que o Dia do Senhor já havia chegado, levando alguns a abandonar o trabalho. Paulo enumera eventos que devem preceder a vinda: a apostasia e a revelação do "homem da iniquidade." Insiste na norma cristã: quem não trabalha, não coma (3.10).',
   'reviewed', 'panorama_biblico', 'Cartas Paulinas',
   ARRAY['2 Tessalonicenses'], ARRAY['Escatologia', 'Trabalho', 'Apostasia', 'Julgamento'],
   ARRAY['Escatologia', 'Ética Cristã'],
   '{"purpose": "Corrigir mal-entendidos sobre a parousia e encorajar a vida responsável enquanto se aguarda a vinda de Cristo.", "outline": "1: Encorajamento na perseguição; 2: Correção escatológica (homem da iniquidade); 3: Exortação ao trabalho diligente.", "key_passages": "2Ts 2.3-4; 3.10-12", "historical_context": "Escrita de Corinto c. 49–50 d.C., poucos meses após a primeira carta."}'::jsonb,
   ARRAY['nt', 'cartas-paulinas'], true, 'pt', 3),

  (v_uid, 'personal_document', '1 Timóteo', 'Ordem na Igreja e qualificações dos líderes',
   'Paulo instrui Timóteo, seu filho na fé, sobre a administração da Igreja em Éfeso. Trata de falsas doutrinas, oração congregacional, qualificações para bispos e diáconos, o papel das mulheres no culto, e o cuidado com viúvas e anciãos. A confissão cristológica (3.16) é um dos mais antigos hinos da fé cristã.',
   'reviewed', 'panorama_biblico', 'Cartas Paulinas',
   ARRAY['1 Timóteo'], ARRAY['Liderança', 'Ordem', 'Doutrina Sã', 'Ministério'],
   ARRAY['Eclesiologia', 'Cristologia', 'Ética Cristã'],
   '{"purpose": "Instruir Timóteo na administração pastoral da Igreja em Éfeso, especialmente diante de falsas doutrinas.", "outline": "1: Falsas doutrinas e o Evangelho; 2: Oração e papel das mulheres; 3: Qualificações de bispos e diáconos; 4–6: Pastoreio de diferentes grupos.", "key_passages": "1Tm 2.5; 3.1-7; 3.16; 6.6; 6.12", "historical_context": "Escrita c. 62–64 d.C., provavelmente após a prisão de Paulo em Roma e sua libertação temporária."}'::jsonb,
   ARRAY['nt', 'cartas-paulinas'], true, 'pt', 4),

  (v_uid, 'personal_document', '2 Timóteo', 'Fidelidade ao Evangelho até o martírio',
   'Última carta de Paulo, escrita pouco antes de seu martírio. Exorta Timóteo a permanecer fiel ao Evangelho, suportar o sofrimento, pregar a Palavra em tempos oportunos e inoportunos. A afirmação da inspiração das Escrituras (3.16-17) e a antecipação da coroa da justiça (4.8) tornam esta carta o testamento espiritual do apóstolo.',
   'reviewed', 'panorama_biblico', 'Cartas Paulinas',
   ARRAY['2 Timóteo'], ARRAY['Fidelidade', 'Sofrimento', 'Pregação', 'Morte'],
   ARRAY['Bibliologia', 'Soteriologia', 'Teologia do Ministério'],
   '{"purpose": "Exortar Timóteo à fidelidade ministerial diante da perseguição, e transmitir o testamento espiritual de Paulo.", "outline": "1: Encorajamento a não se envergonhar; 2: Firmeza como bom soldado; 3: Tempos difíceis e suficiência das Escrituras; 4: Pregar a Palavra — despedida de Paulo.", "key_passages": "2Tm 1.12; 2.15; 3.16-17; 4.7-8", "historical_context": "Escrita c. 67–68 d.C., segunda prisão de Paulo em Roma; Paulo foi executado pouco depois."}'::jsonb,
   ARRAY['nt', 'cartas-paulinas'], true, 'pt', 5),

  (v_uid, 'personal_document', 'Tito', 'Vida cristã e liderança sã nas igrejas de Creta',
   'Paulo instrui Tito, deixado em Creta para organizar igrejas jovens. As qualificações de presbíteros/bispos (cap. 1), a instrução a diferentes grupos — idosos, jovens, escravos (cap. 2) — e os fundamentos teológicos da graça que transforma o comportamento (cap. 3) estruturam esta breve carta pastoral.',
   'reviewed', 'panorama_biblico', 'Cartas Paulinas',
   ARRAY['Tito'], ARRAY['Liderança', 'Sã Doutrina', 'Graça', 'Comportamento Cristão'],
   ARRAY['Eclesiologia', 'Soteriologia', 'Ética Cristã'],
   '{"purpose": "Instruir Tito na organização das igrejas de Creta e na conexão entre doutrina sã e vida transformada pela graça.", "outline": "1: Qualificações de líderes e combate às falsas doutrinas; 2: Instrução prática por grupos; 3: Fundamento teológico da renovação.", "key_passages": "Tt 1.5-9; 2.11-14; 3.5", "historical_context": "Escrita c. 62–64 d.C., durante o período pós-primeira prisão romana de Paulo."}'::jsonb,
   ARRAY['nt', 'cartas-paulinas'], true, 'pt', 3),

  (v_uid, 'personal_document', 'Filemom', 'Reconciliação cristã e irmandade além da escravidão',
   'A mais curta carta paulina (25 versículos) apela a Filemom para receber Onésimo, seu escravo fugido, como irmão em Cristo. Paulo não exige a libertação formal, mas a reconciliação cristã — que implode a lógica da escravidão com a lógica do Evangelho. A carta é base histórica para argumentos cristãos contra a escravidão.',
   'reviewed', 'panorama_biblico', 'Cartas Paulinas',
   ARRAY['Filemom'], ARRAY['Reconciliação', 'Irmandade Cristã', 'Perdão', 'Escravidão'],
   ARRAY['Ética Cristã', 'Eclesiologia', 'Soteriologia'],
   '{"purpose": "Demonstrar que o Evangelho cria uma fraternidade que supera as divisões sociais, incluindo a escravidão.", "outline": "1–7: Saudação e elogio a Filemom; 8–16: Pedido por Onésimo; 17–25: Apelo à generosidade e confiança.", "key_passages": "Fm 10; 15-16", "historical_context": "Escrita na prisão em Roma c. 60–62 d.C.; parte das cartas do cativeiro."}'::jsonb,
   ARRAY['nt', 'cartas-paulinas'], true, 'pt', 4),

  -- ═══════════════════════════════════════════
  -- CARTA AOS HEBREUS (1 livro)
  -- ═══════════════════════════════════════════

  (v_uid, 'personal_document', 'Hebreus', 'Cristo supera tudo — sacerdócio, aliança e sacrifício',
   'Escrita a cristãos judeus tentados a retornar ao judaísmo. O argumento central: Cristo é superior aos anjos, a Moisés, ao sacerdócio aarônico — pois é o sumo sacerdote eterno segundo a ordem de Melquisedeque e o sacrifício definitivo que toda a Lei tipificava. Os capítulos 11–13 exortam à perseverança pela fé dos heróis bíblicos.',
   'reviewed', 'panorama_biblico', 'Hebreus',
   ARRAY['Hebreus'], ARRAY['Supremacia de Cristo', 'Sacerdócio', 'Perseverança', 'Fé'],
   ARRAY['Cristologia', 'Soteriologia', 'Escatologia'],
   '{"purpose": "Demonstrar que Cristo é a substância de tudo que a Lei prometia e que não há retorno possível a sombras quando a realidade chegou.", "outline": "1–4: Superioridade de Cristo (sobre anjos, Moisés, Josué); 5–10: O sumo sacerdócio e o sacrifício perfeito; 11: Galeria da fé; 12–13: Exortações finais.", "key_passages": "Hb 1.1-3; 4.14-16; 7.25; 9.14; 10.10; 11.1; 13.8", "historical_context": "Autor desconhecido; escrito antes de 70 d.C. (não menciona a destruição do templo); destinatários provavelmente em Roma."}'::jsonb,
   ARRAY['nt', 'hebreus'], true, 'pt', 5),

  -- ═══════════════════════════════════════════
  -- CARTAS GERAIS (7 livros)
  -- ═══════════════════════════════════════════

  (v_uid, 'personal_document', 'Tiago', 'Fé que produz obras — piedade prática e genuína',
   'Carta prática de Tiago, irmão do Senhor, a judeus cristãos da diáspora. O tema central — "a fé sem obras está morta" — não contradiz Paulo, mas completa: uma fé salvadora necessariamente produz frutos. Aborda controle da língua, parcialidade, sabedoria piedosa, oração pelos enfermos e o clamor dos oprimidos.',
   'reviewed', 'panorama_biblico', 'Cartas Gerais',
   ARRAY['Tiago'], ARRAY['Fé e Obras', 'Controle da Língua', 'Sabedoria', 'Justiça Social'],
   ARRAY['Soteriologia', 'Ética Cristã', 'Eclesiologia'],
   '{"purpose": "Demonstrar que a fé genuína transforma o caráter e a conduta, especialmente em relação aos pobres e oprimidos.", "outline": "1: Perseverança nas tentações; 2: Fé e obras / parcialidade; 3: Controle da língua e sabedoria; 4–5: Humildade, riqueza e oração.", "key_passages": "Tg 1.2-4; 1.22; 2.17; 3.17; 5.16", "historical_context": "Escrita provavelmente antes de 50 d.C. por Tiago, irmão de Jesus, martirizado em 62 d.C."}'::jsonb,
   ARRAY['nt', 'cartas-gerais'], true, 'pt', 4),

  (v_uid, 'personal_document', '1 Pedro', 'Esperança viva em meio ao sofrimento — vida no exílio',
   'Pedro exorta cristãos dispersos pelo Império Romano a viver com esperança diante da perseguição. A ressurreição de Cristo é a base da "esperança viva" (1.3). Instrui sobre submissão às autoridades, vida familiar e o exemplo de Cristo no sofrimento. Os eleitos são "estrangeiros e peregrinos" — a identidade fundamental do povo de Deus em qualquer era.',
   'reviewed', 'panorama_biblico', 'Cartas Gerais',
   ARRAY['1 Pedro'], ARRAY['Esperança', 'Sofrimento', 'Identidade Cristã', 'Submissão'],
   ARRAY['Soteriologia', 'Escatologia', 'Ética Cristã'],
   '{"purpose": "Fortalecer cristãos perseguidos revelando sua identidade gloriosa em Cristo e o modelo do sofrimento redentor.", "outline": "1: Esperança viva e identidade; 2: Vida como estrangeiros e submissão; 3–4: Sofrimento e exemplo de Cristo; 5: Liderança pastoral e resistência ao diabo.", "key_passages": "1Pe 1.3-5; 2.9-10; 2.21-24; 3.15; 4.12-14", "historical_context": "Escrita de Roma ('Babilônia' — 5.13) c. 60–65 d.C., antes do martírio de Pedro sob Nero."}'::jsonb,
   ARRAY['nt', 'cartas-gerais'], true, 'pt', 5),

  (v_uid, 'personal_document', '2 Pedro', 'Alerta contra falsos mestres — aguardando o dia de Deus',
   'Com tom urgente, Pedro alerta sobre falsos mestres que negam o retorno de Cristo e vivem libertinamente. A defesa da inspiração profética (1.20-21) e o argumento sobre o atraso da parousia — que a demora é paciência de Deus (3.9) — são pontos centrais. Exorta a crescer na graça e no conhecimento de Cristo.',
   'reviewed', 'panorama_biblico', 'Cartas Gerais',
   ARRAY['2 Pedro'], ARRAY['Falsos Mestres', 'Parousia', 'Escrituras', 'Crescimento Espiritual'],
   ARRAY['Bibliologia', 'Escatologia', 'Hamartologia'],
   '{"purpose": "Alertar contra o perigo dos falsos mestres e confirmar a certeza da parousia de Cristo como motivação para crescimento espiritual.", "outline": "1: Crescimento em graça e confiança na Escritura; 2: Descrição e julgamento dos falsos mestres; 3: A certeza da parousia e vida santa.", "key_passages": "2Pe 1.19-21; 3.9; 3.18", "historical_context": "Escrita por Pedro provavelmente c. 65–68 d.C., pouco antes de seu martírio."}'::jsonb,
   ARRAY['nt', 'cartas-gerais'], true, 'pt', 4),

  (v_uid, 'personal_document', '1 João', 'Comunhão com Deus, amor fraternal e testes da fé genuína',
   'Escrita para refutar o proto-gnosticismo que negava a encarnação e separava fé de ética. João apresenta três testes do cristão genuíno: doutrinário (confissão da encarnação), moral (guardar os mandamentos) e relacional (amor ao próximo). "Deus é amor" (4.8,16) é uma das afirmações mais densas de toda a Escritura.',
   'reviewed', 'panorama_biblico', 'Cartas Gerais',
   ARRAY['1 João'], ARRAY['Amor', 'Comunhão', 'Teste da Fé', 'Encarnação'],
   ARRAY['Cristologia', 'Soteriologia', 'Ética Cristã'],
   '{"purpose": "Dar ao crente testes concretos para saber se tem vida eterna e refutar a heresia que separava fé de ética e negava a encarnação.", "outline": "1: Comunhão com Deus (luz e trevas); 2: Amor e mandamentos; 3: Amor fraternal como evidência; 4: Deus é amor; 5: Fé vencedora e vida eterna.", "key_passages": "1Jo 1.9; 2.6; 3.16; 4.8; 5.13", "historical_context": "Escrita por João provavelmente em Éfeso c. 85–95 d.C.; para refutar o docetismo/gnosticismo nascente."}'::jsonb,
   ARRAY['nt', 'cartas-gerais'], true, 'pt', 5),

  (v_uid, 'personal_document', '2 João', 'Amor com discernimento — cuidado com enganadores',
   'A penúltima carta mais curta do NT (13 versículos), endereçada à "senhora eleita e seus filhos" (provavelmente uma congregação). João exorta ao amor mútuo dentro dos limites da verdade doutrinária e alerta: não acolher como hóspede aqueles que negam a vinda de Cristo na carne — participar desse erro é cumplicidade.',
   'reviewed', 'panorama_biblico', 'Cartas Gerais',
   ARRAY['2 João'], ARRAY['Amor', 'Verdade', 'Falsa Doutrina', 'Hospitalidade'],
   ARRAY['Cristologia', 'Ética Cristã', 'Eclesiologia'],
   '{"purpose": "Ensinar que o amor cristão opera dentro da verdade doutrinária e que proteger a comunidade de erros é expressão de amor.", "outline": "1–3: Saudação em amor e verdade; 4–6: Caminhar na verdade e amar; 7–11: Aviso sobre enganadores; 12–13: Conclusão.", "key_passages": "2Jo 9; 10-11", "historical_context": "Escrita por João em Éfeso c. 85–95 d.C., pouco antes ou depois de 1 João."}'::jsonb,
   ARRAY['nt', 'cartas-gerais'], true, 'pt', 3),

  (v_uid, 'personal_document', '3 João', 'Hospitalidade cristã, fidelidade e liderança sadia',
   'Carta pessoal de João a Gaio, elogiando sua hospitalidade a missionários itinerantes e contrasta com Diótrefes, que rejeita a autoridade de João e expulsa irmãos da comunidade. Demétrio é citado como bom exemplo. A carta revela tensões reais de liderança e hospitalidade nas igrejas do primeiro século.',
   'reviewed', 'panorama_biblico', 'Cartas Gerais',
   ARRAY['3 João'], ARRAY['Hospitalidade', 'Liderança', 'Fidelidade', 'Comunhão'],
   ARRAY['Eclesiologia', 'Ética Cristã'],
   '{"purpose": "Encorajar a hospitalidade fiel com os servos de Deus e alertar contra a ambição eclesiástica que divide a comunidade.", "outline": "1–8: Elogio a Gaio e sua hospitalidade; 9–10: Condenação de Diótrefes; 11–12: Testemunho de Demétrio; 13–14: Conclusão.", "key_passages": "3Jo 4; 11", "historical_context": "Escrita por João em Éfeso c. 85–95 d.C.; a mais pessoal das três cartas de João."}'::jsonb,
   ARRAY['nt', 'cartas-gerais'], true, 'pt', 3),

  (v_uid, 'personal_document', 'Judas', 'Defesa ardente da fé diante das heresias',
   'Carta urgente de Judas, irmão de Tiago e do Senhor, sobre falsos mestres que infiltraram as igrejas. Evoca exemplos do AT do julgamento divino sobre a desobediência. Exorta os fiéis a "contender pela fé" e a cuidar dos que vacilam. Termina com uma das mais belas doxologias do NT (24-25).',
   'reviewed', 'panorama_biblico', 'Cartas Gerais',
   ARRAY['Judas'], ARRAY['Falsos Mestres', 'Julgamento', 'Contender pela Fé', 'Perseverança'],
   ARRAY['Hamartologia', 'Escatologia', 'Soteriologia'],
   '{"purpose": "Chamar a Igreja a defender vigorosamente a fé apostólica contra ensinamentos que corrompem a graça em libertinagem.", "outline": "1–4: Saudação e motivo urgente; 5–16: Julgamento sobre os falsos mestres (exemplos do AT); 17–23: Exortação aos fiéis; 24–25: Doxologia.", "key_passages": "Jd 3; 20-21; 24-25", "historical_context": "Escrita c. 60–80 d.C. por Judas, irmão de Tiago e de Jesus; data e destinatários incertos."}'::jsonb,
   ARRAY['nt', 'cartas-gerais'], true, 'pt', 4),

  -- ═══════════════════════════════════════════
  -- PROFECIA NT (1 livro)
  -- ═══════════════════════════════════════════

  (v_uid, 'personal_document', 'Apocalipse', 'A vitória do Cordeiro sobre o mal — nova criação',
   'Visão de João recebida na ilha de Patmos, endereçada a sete igrejas da Ásia Menor sob perseguição romana. Através de visões simbólicas ricas — os quatro seres vivos, os selos, as trombetas, a grande babilônia, a batalha final e a nova Jerusalém — o livro declara que o Cordeiro já venceu e o desfecho da história é certo. Encerra o cânone com nova criação e presença eterna de Deus com sua criação.',
   'reviewed', 'panorama_biblico', 'Profecia NT',
   ARRAY['Apocalipse'], ARRAY['Vitória de Cristo', 'Perseverança', 'Julgamento', 'Nova Criação'],
   ARRAY['Escatologia', 'Cristologia', 'Providência'],
   '{"purpose": "Revelar a Jesus Cristo glorificado e a sua vitória final, fortalecendo os perseguidos com a certeza do triunfo do Cordeiro.", "outline": "1: Visão do Cristo glorificado; 2–3: Cartas às sete igrejas; 4–5: O trono e o Cordeiro; 6–16: Selos, trombetas e taças; 17–18: Queda da Babilônia; 19–22: Retorno de Cristo, julgamento final e nova criação.", "key_passages": "Ap 1.8; 5.9-10; 12.10-11; 19.16; 21.1-5; 22.20", "historical_context": "Escrito por João durante a perseguição de Domiciano c. 95 d.C., enquanto exilado em Patmos."}'::jsonb,
   ARRAY['nt', 'profecia-nt', 'apocalipse'], true, 'pt', 5);

END $$;
