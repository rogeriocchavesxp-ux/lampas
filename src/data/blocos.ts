export type DiaBloco = {
  dia: number
  leitura: string
  vc: string   // versículo-chave
  tema: string
}

export type Bloco = {
  numero: number
  nome: string
  secao: 'introducao' | 'pentateuco' | 'historicos' | 'poeticos' | 'profetas' | 'evangelhos' | 'cartas' | 'apocalipse' | 'conclusao'
  dias: DiaBloco[]
}

export const SECAO_LABEL: Record<Bloco['secao'], string> = {
  introducao: 'Introdução',
  pentateuco: 'Pentateuco',
  historicos: 'Livros históricos',
  poeticos: 'Poéticos e sapienciais',
  profetas: 'Profetas',
  evangelhos: 'Evangelhos e Atos',
  cartas: 'Cartas',
  apocalipse: 'Apocalipse',
  conclusao: 'Conclusão',
}

export const SECAO_ORDER: Bloco['secao'][] = [
  'introducao', 'pentateuco', 'historicos', 'poeticos',
  'profetas', 'evangelhos', 'cartas', 'apocalipse', 'conclusao',
]

export const blocos: Bloco[] = [
  {
    numero: 1, nome: 'As Escrituras', secao: 'introducao',
    dias: [
      { dia: 1,   leitura: '2Tm 3:10-15',       vc: '2Tm 3:15',      tema: 'A necessidade das Escrituras' },
      { dia: 2,   leitura: '2Tm 3:14-16',        vc: '2Tm 3:16',      tema: 'A origem: soprada por Deus' },
      { dia: 3,   leitura: '2Tm 3:16 – 4:2',     vc: '2Tm 3:16-17',   tema: 'Os benefícios e a suficiência' },
      { dia: 4,   leitura: '2Tm 2:14-19',         vc: '2Tm 2:15',      tema: 'Como ler: manejar bem a palavra' },
      { dia: 5,   leitura: 'Lc 24:13-35',         vc: 'Lc 24:27, 32',  tema: 'O centro e o coração que arde' },
      { dia: 6,   leitura: 'Lc 24:36-49',         vc: 'Lc 24:45',      tema: 'Síntese: a jornada do ano' },
    ],
  },
  {
    numero: 2, nome: 'Gênesis 1–11', secao: 'pentateuco',
    dias: [
      { dia: 7,   leitura: 'Gn 1:1 – 2:3',       vc: 'Gn 1:27',       tema: 'A criação e a imagem de Deus' },
      { dia: 8,   leitura: 'Gn 2:4-25',           vc: 'Gn 2:16-17',    tema: 'O homem no jardim: lugar, tarefa e palavra' },
      { dia: 9,   leitura: 'Gn 3:1-24',           vc: 'Gn 3:15',       tema: 'A queda e a primeira promessa' },
      { dia: 10,  leitura: 'Gn 4:1-26',           vc: 'Gn 4:26',       tema: 'Caim, Abel e a linhagem de Sete' },
      { dia: 11,  leitura: 'Gn 6:5-22; 9:8-17',  vc: 'Gn 9:11',       tema: 'A aliança com Noé' },
      { dia: 12,  leitura: 'Gn 11:1-9, 27-32',   vc: 'Gn 11:4',       tema: 'Babel; síntese' },
    ],
  },
  {
    numero: 3, nome: 'Abraão I', secao: 'pentateuco',
    dias: [
      { dia: 13,  leitura: 'Gn 12:1-9',           vc: 'Gn 12:2-3',     tema: 'O chamado e as promessas' },
      { dia: 14,  leitura: 'Gn 14:17-24',         vc: 'Gn 14:18-20',   tema: 'Melquisedeque' },
      { dia: 15,  leitura: 'Gn 15:1-6',           vc: 'Gn 15:6',       tema: 'Abrão creu' },
      { dia: 16,  leitura: 'Gn 15:7-21',          vc: 'Gn 15:18',      tema: 'O rito da aliança' },
      { dia: 17,  leitura: 'Gn 16:1-16',          vc: 'Gn 16:13',      tema: 'Agar e o Deus que vê' },
      { dia: 18,  leitura: 'Gn 17:1-14',          vc: 'Gn 17:7',       tema: '"Serei o teu Deus"; síntese' },
    ],
  },
  {
    numero: 4, nome: 'Abraão II', secao: 'pentateuco',
    dias: [
      { dia: 19,  leitura: 'Gn 18:1-15',          vc: 'Gn 18:14',      tema: 'Há algo difícil demais para Deus?' },
      { dia: 20,  leitura: 'Gn 18:16-33',         vc: 'Gn 18:25',      tema: 'A intercessão por Sodoma' },
      { dia: 21,  leitura: 'Gn 21:1-21',          vc: 'Gn 21:1-2',     tema: 'Isaque, o filho da promessa' },
      { dia: 22,  leitura: 'Gn 22:1-8',           vc: 'Gn 22:8',       tema: 'A prova' },
      { dia: 23,  leitura: 'Gn 22:9-14',          vc: 'Gn 22:14',      tema: '"O Senhor proverá"' },
      { dia: 24,  leitura: 'Gn 22:15-19',         vc: 'Gn 22:17-18',   tema: 'O juramento; síntese' },
    ],
  },
  {
    numero: 5, nome: 'Isaque e Jacó', secao: 'pentateuco',
    dias: [
      { dia: 25,  leitura: 'Gn 24:1-27',          vc: 'Gn 24:27',      tema: 'A providência no casamento de Isaque' },
      { dia: 26,  leitura: 'Gn 25:19-34',         vc: 'Gn 25:23',      tema: 'A eleição de Jacó' },
      { dia: 27,  leitura: 'Gn 26:1-6, 23-25',   vc: 'Gn 26:3-4',     tema: 'A promessa confirmada a Isaque' },
      { dia: 28,  leitura: 'Gn 28:10-22',         vc: 'Gn 28:15',      tema: 'A escada de Betel' },
      { dia: 29,  leitura: 'Gn 32:9-12, 22-32',  vc: 'Gn 32:28',      tema: 'A luta e o novo nome' },
      { dia: 30,  leitura: 'Gn 35:1-15',          vc: 'Gn 35:11-12',   tema: 'A aliança renovada; síntese' },
    ],
  },
  {
    numero: 6, nome: 'José', secao: 'pentateuco',
    dias: [
      { dia: 31,  leitura: 'Gn 37:1-11',          vc: 'Gn 37:5',       tema: 'Os sonhos' },
      { dia: 32,  leitura: 'Gn 39:1-23',          vc: 'Gn 39:2',       tema: '"O Senhor era com José"' },
      { dia: 33,  leitura: 'Gn 41:1-16, 37-41',  vc: 'Gn 41:16',      tema: 'Deus dá a resposta' },
      { dia: 34,  leitura: 'Gn 45:1-15',          vc: 'Gn 45:5',       tema: 'José se revela aos irmãos' },
      { dia: 35,  leitura: 'Gn 49:1-12',          vc: 'Gn 49:10',      tema: 'O cetro de Judá' },
      { dia: 36,  leitura: 'Gn 50:15-26',         vc: 'Gn 50:20',      tema: '"Deus o tornou em bem"; síntese' },
    ],
  },
  {
    numero: 7, nome: 'Êxodo 1–13', secao: 'pentateuco',
    dias: [
      { dia: 37,  leitura: 'Êx 1:1 – 2:25',       vc: 'Êx 2:24',       tema: 'Deus se lembra da aliança' },
      { dia: 38,  leitura: 'Êx 3:1-15; 6:2-8',   vc: 'Êx 3:14',       tema: 'O nome de Deus' },
      { dia: 39,  leitura: 'Êx 7:14 – 8:19',      vc: 'Êx 8:19',       tema: 'O primeiro ciclo das pragas' },
      { dia: 40,  leitura: 'Êx 8:20 – 9:12',      vc: 'Êx 8:22-23',    tema: 'O segundo ciclo' },
      { dia: 41,  leitura: 'Êx 9:13 – 10:29',     vc: 'Êx 9:16',       tema: 'O terceiro ciclo' },
      { dia: 42,  leitura: 'Êx 12:1-14, 29-32',  vc: 'Êx 12:13',      tema: 'A Páscoa; síntese' },
    ],
  },
  {
    numero: 8, nome: 'Êxodo 14–24', secao: 'pentateuco',
    dias: [
      { dia: 43,  leitura: 'Êx 14:10-31',         vc: 'Êx 14:13-14',   tema: 'O Mar Vermelho' },
      { dia: 44,  leitura: 'Êx 15:1-18',          vc: 'Êx 15:2',       tema: 'O cântico de Moisés' },
      { dia: 45,  leitura: 'Êx 16:1-21',          vc: 'Êx 16:4',       tema: 'O maná' },
      { dia: 46,  leitura: 'Êx 17:1-16',          vc: 'Êx 17:6',       tema: 'A água da rocha' },
      { dia: 47,  leitura: 'Êx 19:1-6; 20:1-17', vc: 'Êx 19:5-6',     tema: 'A aliança no Sinai e a lei' },
      { dia: 48,  leitura: 'Êx 24:1-11',          vc: 'Êx 24:8',       tema: 'O sangue da aliança; síntese' },
    ],
  },
  {
    numero: 9, nome: 'Êxodo 25–40', secao: 'pentateuco',
    dias: [
      { dia: 49,  leitura: 'Êx 25:1-22',          vc: 'Êx 25:8',       tema: 'O santuário' },
      { dia: 50,  leitura: 'Êx 28:1-30',          vc: 'Êx 28:29',      tema: 'O sumo sacerdote' },
      { dia: 51,  leitura: 'Êx 32:1-14',          vc: 'Êx 32:4',       tema: 'O bezerro de ouro' },
      { dia: 52,  leitura: 'Êx 32:15-35',         vc: 'Êx 32:32',      tema: 'A intercessão de Moisés' },
      { dia: 53,  leitura: 'Êx 33:12 – 34:10',    vc: 'Êx 34:6-7',     tema: '"Faze-me ver a tua glória"' },
      { dia: 54,  leitura: 'Êx 40:16-38',         vc: 'Êx 40:34',      tema: 'A glória enche o tabernáculo; síntese' },
    ],
  },
  {
    numero: 10, nome: 'Levítico', secao: 'pentateuco',
    dias: [
      { dia: 55,  leitura: 'Lv 1:1-17',           vc: 'Lv 1:4',        tema: 'As ofertas' },
      { dia: 56,  leitura: 'Lv 10:1-11',          vc: 'Lv 10:3',       tema: 'Nadabe e Abiú' },
      { dia: 57,  leitura: 'Lv 11:41-47',         vc: 'Lv 11:45',      tema: '"Sede santos"' },
      { dia: 58,  leitura: 'Lv 16:1-22, 29-34',  vc: 'Lv 16:30',      tema: 'O Dia da Expiação' },
      { dia: 59,  leitura: 'Lv 19:1-18',          vc: 'Lv 19:18',      tema: 'A santidade no dia a dia' },
      { dia: 60,  leitura: 'Lv 26:1-13',          vc: 'Lv 26:12',      tema: 'A promessa da presença; síntese' },
    ],
  },
  {
    numero: 11, nome: 'Números', secao: 'pentateuco',
    dias: [
      { dia: 61,  leitura: 'Nm 9:15-23',          vc: 'Nm 9:18',       tema: 'A nuvem que guia' },
      { dia: 62,  leitura: 'Nm 13:25 – 14:10',    vc: 'Nm 14:8-9',     tema: 'Os espias' },
      { dia: 63,  leitura: 'Nm 14:11-25',         vc: 'Nm 14:22-24',   tema: 'Cades: a incredulidade' },
      { dia: 64,  leitura: 'Nm 21:4-9',           vc: 'Nm 21:8-9',     tema: 'A serpente de bronze' },
      { dia: 65,  leitura: 'Nm 23:13-24; 24:15-19', vc: 'Nm 23:19',   tema: 'Balaão e a estrela de Jacó' },
      { dia: 66,  leitura: 'Nm 27:12-23',         vc: 'Nm 27:17',      tema: 'Um pastor para o povo; síntese' },
    ],
  },
  {
    numero: 12, nome: 'Deuteronômio', secao: 'pentateuco',
    dias: [
      { dia: 67,  leitura: 'Dt 4:25-40',          vc: 'Dt 4:31',       tema: 'Deus não esquece a aliança' },
      { dia: 68,  leitura: 'Dt 6:1-25',           vc: 'Dt 6:4-5',      tema: 'O Shemá' },
      { dia: 69,  leitura: 'Dt 7:6-11',           vc: 'Dt 7:7-8',      tema: 'Escolhidos por amor' },
      { dia: 70,  leitura: 'Dt 8:1-20',           vc: 'Dt 8:3',        tema: '"Não só de pão"' },
      { dia: 71,  leitura: 'Dt 30:1-20',          vc: 'Dt 30:6',       tema: 'A circuncisão do coração' },
      { dia: 72,  leitura: 'Dt 18:15-19; 34:1-12', vc: 'Dt 34:10',    tema: 'O profeta maior; síntese' },
    ],
  },
  {
    numero: 13, nome: 'Josué', secao: 'historicos',
    dias: [
      { dia: 73,  leitura: 'Js 1:1-9',            vc: 'Js 1:9',        tema: '"Sê forte e corajoso"' },
      { dia: 74,  leitura: 'Js 2:1-24',           vc: 'Js 2:11',       tema: 'Raabe' },
      { dia: 75,  leitura: 'Js 3:1-17',           vc: 'Js 3:11',       tema: 'A arca da aliança no Jordão' },
      { dia: 76,  leitura: 'Js 6:1-27',           vc: 'Js 6:20',       tema: 'Jericó' },
      { dia: 77,  leitura: 'Js 7:1-26',           vc: 'Js 7:11',       tema: 'Acã e a aliança violada' },
      { dia: 78,  leitura: 'Js 21:43-45; 24:14-28', vc: 'Js 24:15',   tema: '"Eu e a minha casa"; síntese' },
    ],
  },
  {
    numero: 14, nome: 'Juízes', secao: 'historicos',
    dias: [
      { dia: 79,  leitura: 'Jz 2:1-23',           vc: 'Jz 2:16',       tema: 'O ciclo' },
      { dia: 80,  leitura: 'Jz 4:1-24',           vc: 'Jz 4:14',       tema: 'Débora e Baraque' },
      { dia: 81,  leitura: 'Jz 7:1-25',           vc: 'Jz 7:2',        tema: 'Gideão' },
      { dia: 82,  leitura: 'Jz 10:6-18; 11:29',  vc: 'Jz 10:16',      tema: 'A compaixão de Deus e Jefté' },
      { dia: 83,  leitura: 'Jz 16:23-31',         vc: 'Jz 16:28',      tema: 'Sansão' },
      { dia: 84,  leitura: 'Jz 21:16-25',         vc: 'Jz 21:25',      tema: '"Não havia rei"; síntese' },
    ],
  },
  {
    numero: 15, nome: 'Rute', secao: 'historicos',
    dias: [
      { dia: 85,  leitura: 'Rt 1:1-18',           vc: 'Rt 1:16',       tema: '"O teu Deus será o meu Deus"' },
      { dia: 86,  leitura: 'Rt 1:19-22',          vc: 'Rt 1:20-21',    tema: 'A amargura de Noemi' },
      { dia: 87,  leitura: 'Rt 2:1-23',           vc: 'Rt 2:12',       tema: 'Sob as asas do Senhor' },
      { dia: 88,  leitura: 'Rt 3:1-18',           vc: 'Rt 3:9',        tema: 'O resgatador' },
      { dia: 89,  leitura: 'Rt 4:1-12',           vc: 'Rt 4:9-10',     tema: 'Boaz resgata' },
      { dia: 90,  leitura: 'Rt 4:13-22',          vc: 'Rt 4:17',       tema: 'A genealogia de Davi; síntese' },
    ],
  },
  {
    numero: 16, nome: 'Ana e Samuel', secao: 'historicos',
    dias: [
      { dia: 91,  leitura: '1Sm 1:1-28',          vc: '1Sm 1:27',      tema: 'A oração de Ana' },
      { dia: 92,  leitura: '1Sm 2:1-10',          vc: '1Sm 2:10',      tema: 'O cântico e o ungido' },
      { dia: 93,  leitura: '1Sm 2:12-36',         vc: '1Sm 2:35',      tema: 'O sacerdote fiel' },
      { dia: 94,  leitura: '1Sm 3:1-21',          vc: '1Sm 3:10',      tema: '"Fala, porque o teu servo ouve"' },
      { dia: 95,  leitura: '1Sm 4:1-22',          vc: '1Sm 4:21',      tema: 'Icabode' },
      { dia: 96,  leitura: '1Sm 7:3-17',          vc: '1Sm 7:12',      tema: 'Ebenézer; síntese' },
    ],
  },
  {
    numero: 17, nome: 'Saul', secao: 'historicos',
    dias: [
      { dia: 97,  leitura: '1Sm 8:1-22',          vc: '1Sm 8:7',       tema: '"Dá-nos um rei"' },
      { dia: 98,  leitura: '1Sm 9:15-27',         vc: '1Sm 9:16',      tema: 'Deus ouve o clamor' },
      { dia: 99,  leitura: '1Sm 10:17-27',        vc: '1Sm 10:24',     tema: 'Saul aclamado' },
      { dia: 100, leitura: '1Sm 12:1-25',         vc: '1Sm 12:22',     tema: 'A esperança no nome de Deus' },
      { dia: 101, leitura: '1Sm 13:5-14',         vc: '1Sm 13:14',     tema: 'O homem segundo o coração de Deus' },
      { dia: 102, leitura: '1Sm 15:10-35',        vc: '1Sm 15:22',     tema: '"Obedecer é melhor"; síntese' },
    ],
  },
  {
    numero: 18, nome: 'Davi ungido', secao: 'historicos',
    dias: [
      { dia: 103, leitura: '1Sm 16:1-13',         vc: '1Sm 16:7',      tema: 'Deus olha o coração' },
      { dia: 104, leitura: '1Sm 17:32-51',        vc: '1Sm 17:45',     tema: 'Davi e Golias' },
      { dia: 105, leitura: '1Sm 18:1-16',         vc: '1Sm 18:3',      tema: 'A aliança com Jônatas' },
      { dia: 106, leitura: '1Sm 24:1-22',         vc: '1Sm 24:6',      tema: 'O ungido do Senhor' },
      { dia: 107, leitura: '1Sm 30:1-20',         vc: '1Sm 30:6',      tema: 'Força no Senhor' },
      { dia: 108, leitura: '1Sm 31:1-6; 2Sm 2:1-7', vc: '2Sm 2:4',   tema: 'O fim de Saul e o reinado de Davi; síntese' },
    ],
  },
  {
    numero: 19, nome: 'Davi rei', secao: 'historicos',
    dias: [
      { dia: 109, leitura: '2Sm 5:1-12',          vc: '2Sm 5:3',       tema: 'Rei sobre Israel' },
      { dia: 110, leitura: '2Sm 6:1-23',          vc: '2Sm 6:14',      tema: 'A arca em Jerusalém' },
      { dia: 111, leitura: '2Sm 7:1-17',          vc: '2Sm 7:12-13',   tema: 'A aliança com Davi' },
      { dia: 112, leitura: '2Sm 9:1-13',          vc: '2Sm 9:7',       tema: 'Mefibosete' },
      { dia: 113, leitura: '2Sm 12:1-15',         vc: '2Sm 12:13',     tema: 'Natã e a confissão' },
      { dia: 114, leitura: '2Sm 23:1-7',          vc: '2Sm 23:5',      tema: 'A aliança eterna; síntese' },
    ],
  },
  {
    numero: 20, nome: 'Salomão', secao: 'historicos',
    dias: [
      { dia: 115, leitura: '1Rs 3:3-15',          vc: '1Rs 3:9',       tema: 'O pedido de sabedoria' },
      { dia: 116, leitura: '1Rs 4:20-34',         vc: '1Rs 4:20',      tema: 'A promessa a Abraão cumprida' },
      { dia: 117, leitura: '1Rs 6:1-14',          vc: '1Rs 6:12-13',   tema: 'O templo e a condição' },
      { dia: 118, leitura: '1Rs 8:22-30, 54-61', vc: '1Rs 8:27',      tema: 'A oração de dedicação' },
      { dia: 119, leitura: '1Rs 10:1-13',         vc: '1Rs 10:9',      tema: 'A rainha de Sabá' },
      { dia: 120, leitura: '1Rs 11:1-13',         vc: '1Rs 11:13',     tema: 'O coração desviado; síntese' },
    ],
  },
  {
    numero: 21, nome: 'Elias e Eliseu', secao: 'historicos',
    dias: [
      { dia: 121, leitura: '1Rs 17:1-24',         vc: '1Rs 17:1',      tema: 'Elias e a viúva' },
      { dia: 122, leitura: '1Rs 18:20-39',        vc: '1Rs 18:21',     tema: 'O Carmelo' },
      { dia: 123, leitura: '1Rs 19:1-18',         vc: '1Rs 19:18',     tema: 'A voz mansa e os sete mil' },
      { dia: 124, leitura: '2Rs 2:1-15',          vc: '2Rs 2:9',       tema: 'A porção dobrada' },
      { dia: 125, leitura: '2Rs 5:1-19',          vc: '2Rs 5:15',      tema: 'Naamã' },
      { dia: 126, leitura: '2Rs 6:8-23; 13:22-23', vc: '2Rs 6:16',    tema: '"Mais são os que estão conosco"; síntese' },
    ],
  },
  {
    numero: 22, nome: 'Do reino dividido ao exílio', secao: 'historicos',
    dias: [
      { dia: 127, leitura: '1Rs 12:1-20',         vc: '1Rs 12:16',     tema: 'A divisão do reino' },
      { dia: 128, leitura: '1Rs 12:25-33',        vc: '1Rs 12:28',     tema: 'Os bezerros de Jeroboão' },
      { dia: 129, leitura: '2Rs 17:6-23',         vc: '2Rs 17:15',     tema: 'A queda de Samaria' },
      { dia: 130, leitura: '2Rs 18:1-8; 19:14-19', vc: '2Rs 18:5',    tema: 'Ezequias' },
      { dia: 131, leitura: '2Rs 23:1-3, 21-27',  vc: '2Rs 23:3',      tema: 'Josias renova a aliança' },
      { dia: 132, leitura: '2Rs 25:1-12, 27-30', vc: '2Rs 25:27',     tema: 'O exílio e a esperança; síntese' },
    ],
  },
  {
    numero: 23, nome: 'Esdras e Neemias', secao: 'historicos',
    dias: [
      { dia: 133, leitura: '2Cr 36:22-23; Ed 1:1-11', vc: 'Ed 1:1',  tema: 'O decreto de Ciro' },
      { dia: 134, leitura: 'Ed 3:8-13; 6:14-16',  vc: 'Ed 3:11',      tema: 'O templo reconstruído' },
      { dia: 135, leitura: 'Ed 7:1-10',           vc: 'Ed 7:10',       tema: 'Esdras e a Palavra' },
      { dia: 136, leitura: 'Ne 2:1-20',           vc: 'Ne 2:20',       tema: 'Os muros' },
      { dia: 137, leitura: 'Ne 8:1-12',           vc: 'Ne 8:10',       tema: '"A alegria do Senhor é a vossa força"' },
      { dia: 138, leitura: 'Ne 9:6-38',           vc: 'Ne 9:38',       tema: 'A aliança renovada; síntese' },
    ],
  },
  {
    numero: 24, nome: 'Ester', secao: 'historicos',
    dias: [
      { dia: 139, leitura: 'Et 1:1-22',           vc: 'Et 1:19',       tema: 'O império e Vasti' },
      { dia: 140, leitura: 'Et 2:1-23',           vc: 'Et 2:17',       tema: 'Ester rainha' },
      { dia: 141, leitura: 'Et 3:1-15',           vc: 'Et 3:6',        tema: 'O plano de Hamã' },
      { dia: 142, leitura: 'Et 4:1-14',           vc: 'Et 4:14',       tema: '"Para tal tempo como este"' },
      { dia: 143, leitura: 'Et 4:15 – 5:8',       vc: 'Et 4:16',       tema: '"Se perecer, pereci"' },
      { dia: 144, leitura: 'Et 6:1-14; 9:1, 20-22', vc: 'Et 9:1',    tema: 'A grande inversão; síntese' },
    ],
  },
  {
    numero: 25, nome: 'Jó', secao: 'poeticos',
    dias: [
      { dia: 145, leitura: 'Jó 1:1-12',           vc: 'Jó 1:8',        tema: 'Jó íntegro' },
      { dia: 146, leitura: 'Jó 1:13-22',          vc: 'Jó 1:21',       tema: '"O Senhor o deu, o Senhor o tomou"' },
      { dia: 147, leitura: 'Jó 4:1-11',           vc: 'Jó 4:7',        tema: 'A lógica dos amigos' },
      { dia: 148, leitura: 'Jó 19:13-27',         vc: 'Jó 19:25',      tema: '"O meu Redentor vive"' },
      { dia: 149, leitura: 'Jó 38:1-18',          vc: 'Jó 38:4',       tema: 'Deus fala do redemoinho' },
      { dia: 150, leitura: 'Jó 42:1-17',          vc: 'Jó 42:5',       tema: '"Agora os meus olhos te veem"; síntese' },
    ],
  },
  {
    numero: 26, nome: 'Salmos I', secao: 'poeticos',
    dias: [
      { dia: 151, leitura: 'Sl 1',                vc: 'Sl 1:2',        tema: 'Os dois caminhos' },
      { dia: 152, leitura: 'Sl 2',                vc: 'Sl 2:7',        tema: 'O Rei ungido' },
      { dia: 153, leitura: 'Sl 19',               vc: 'Sl 19:7',       tema: 'A criação e a Lei' },
      { dia: 154, leitura: 'Sl 22',               vc: 'Sl 22:1',       tema: 'O justo desamparado' },
      { dia: 155, leitura: 'Sl 23',               vc: 'Sl 23:1',       tema: 'O Pastor' },
      { dia: 156, leitura: 'Sl 51',               vc: 'Sl 51:10',      tema: 'O arrependimento; síntese' },
    ],
  },
  {
    numero: 27, nome: 'Salmos II', secao: 'poeticos',
    dias: [
      { dia: 157, leitura: 'Sl 73',               vc: 'Sl 73:17',      tema: 'A crise da fé' },
      { dia: 158, leitura: 'Sl 89',               vc: 'Sl 89:3-4',     tema: 'A aliança com Davi em crise' },
      { dia: 159, leitura: 'Sl 90',               vc: 'Sl 90:1-2',     tema: 'O Deus eterno' },
      { dia: 160, leitura: 'Sl 103',              vc: 'Sl 103:17-18',  tema: 'A misericórdia da aliança' },
      { dia: 161, leitura: 'Sl 110',              vc: 'Sl 110:4',      tema: 'Rei e Sacerdote' },
      { dia: 162, leitura: 'Sl 150',              vc: 'Sl 150:6',      tema: 'O louvor final; síntese' },
    ],
  },
  {
    numero: 28, nome: 'Provérbios', secao: 'poeticos',
    dias: [
      { dia: 163, leitura: 'Pv 1:1-19',           vc: 'Pv 1:7',        tema: 'O temor do Senhor' },
      { dia: 164, leitura: 'Pv 4:10-27',          vc: 'Pv 4:18',       tema: 'Os dois caminhos' },
      { dia: 165, leitura: 'Pv 6:6-11',           vc: 'Pv 6:6',        tema: 'O trabalho' },
      { dia: 166, leitura: 'Pv 8:22-36',          vc: 'Pv 8:30',       tema: 'A Sabedoria na criação' },
      { dia: 167, leitura: 'Pv 18:1-24',          vc: 'Pv 18:21',      tema: 'A língua' },
      { dia: 168, leitura: 'Pv 31:10-31',         vc: 'Pv 31:30',      tema: 'A mulher que teme ao Senhor; síntese' },
    ],
  },
  {
    numero: 29, nome: 'Eclesiastes e Cantares', secao: 'poeticos',
    dias: [
      { dia: 169, leitura: 'Ec 1:1-11',           vc: 'Ec 1:2',        tema: '"Vaidade de vaidades"' },
      { dia: 170, leitura: 'Ec 3:1-15',           vc: 'Ec 3:11',       tema: 'Tudo tem o seu tempo' },
      { dia: 171, leitura: 'Ec 12:1-14',          vc: 'Ec 12:13',      tema: 'A conclusão de tudo' },
      { dia: 172, leitura: 'Ct 2:1-17',           vc: 'Ct 2:4',        tema: 'O amor como dádiva' },
      { dia: 173, leitura: 'Ct 8:5-7',            vc: 'Ct 8:6-7',      tema: '"Forte como a morte"' },
      { dia: 174, leitura: 'Gn 2:18-25; Ef 5:22-33', vc: 'Ef 5:32',  tema: 'Cristo e a Igreja; síntese' },
    ],
  },
  {
    numero: 30, nome: 'Isaías 1–39', secao: 'profetas',
    dias: [
      { dia: 175, leitura: 'Is 1:1-20',           vc: 'Is 1:18',       tema: 'O processo de Deus' },
      { dia: 176, leitura: 'Is 6:1-13',           vc: 'Is 6:8',        tema: 'A visão do trono' },
      { dia: 177, leitura: 'Is 7:1-17',           vc: 'Is 7:14',       tema: 'O Emanuel' },
      { dia: 178, leitura: 'Is 9:1-7',            vc: 'Is 9:6',        tema: '"Um menino nos nasceu"' },
      { dia: 179, leitura: 'Is 11:1-10',          vc: 'Is 11:1-2',     tema: 'O Renovo de Jessé' },
      { dia: 180, leitura: 'Is 37:14-38',         vc: 'Is 37:20',      tema: 'Ezequias e o livramento; síntese' },
    ],
  },
  {
    numero: 31, nome: 'Isaías 40–66', secao: 'profetas',
    dias: [
      { dia: 181, leitura: 'Is 40:1-11',          vc: 'Is 40:1',       tema: '"Consolai o meu povo"' },
      { dia: 182, leitura: 'Is 42:1-9',           vc: 'Is 42:6',       tema: 'O Servo, aliança do povo' },
      { dia: 183, leitura: 'Is 43:1-13',          vc: 'Is 43:1',       tema: '"Não temas"' },
      { dia: 184, leitura: 'Is 52:13 – 53:12',    vc: 'Is 53:5',       tema: 'O Servo Sofredor' },
      { dia: 185, leitura: 'Is 55:1-13',          vc: 'Is 55:3',       tema: '"Vinde"' },
      { dia: 186, leitura: 'Is 65:17-25',         vc: 'Is 65:17',      tema: 'Novos céus e nova terra; síntese' },
    ],
  },
  {
    numero: 32, nome: 'Jeremias 1–20', secao: 'profetas',
    dias: [
      { dia: 187, leitura: 'Jr 1:1-8',            vc: 'Jr 1:5',        tema: 'O chamado de Jeremias' },
      { dia: 188, leitura: 'Jr 1:9-19',           vc: 'Jr 1:9-10',     tema: 'Arrancar e plantar' },
      { dia: 189, leitura: 'Jr 7:1-15',           vc: 'Jr 7:4',        tema: 'O sermão do templo' },
      { dia: 190, leitura: 'Jr 15:15-21',         vc: 'Jr 15:16',      tema: 'A alegria da Palavra' },
      { dia: 191, leitura: 'Jr 18:1-12',          vc: 'Jr 18:6',       tema: 'O oleiro' },
      { dia: 192, leitura: 'Jr 20:7-13',          vc: 'Jr 20:9',       tema: 'Fogo nos ossos; síntese' },
    ],
  },
  {
    numero: 33, nome: 'Jeremias 23–52 e Lamentações', secao: 'profetas',
    dias: [
      { dia: 193, leitura: 'Jr 23:1-8',           vc: 'Jr 23:5-6',     tema: 'O Renovo justo' },
      { dia: 194, leitura: 'Jr 29:1-14',          vc: 'Jr 29:7',       tema: 'A carta aos exilados' },
      { dia: 195, leitura: 'Jr 31:31-34',         vc: 'Jr 31:33',      tema: 'A nova aliança' },
      { dia: 196, leitura: 'Jr 32:6-17, 36-41',  vc: 'Jr 32:17',      tema: 'A compra do campo' },
      { dia: 197, leitura: 'Jr 52:1-16',          vc: 'Jr 52:13',      tema: 'A queda de Jerusalém' },
      { dia: 198, leitura: 'Lm 3:1-33',           vc: 'Lm 3:22-23',   tema: 'As misericórdias renovadas; síntese' },
    ],
  },
  {
    numero: 34, nome: 'Ezequiel', secao: 'profetas',
    dias: [
      { dia: 199, leitura: 'Ez 1:1-28',           vc: 'Ez 1:28',       tema: 'A visão da glória' },
      { dia: 200, leitura: 'Ez 3:16-21',          vc: 'Ez 3:17',       tema: 'O atalaia' },
      { dia: 201, leitura: 'Ez 10:18-22; 11:19-23', vc: 'Ez 10:18',   tema: 'A glória deixa o templo' },
      { dia: 202, leitura: 'Ez 34:1-16, 23-31',  vc: 'Ez 34:23',      tema: 'O Bom Pastor' },
      { dia: 203, leitura: 'Ez 36:22-32',         vc: 'Ez 36:26',      tema: 'O coração novo' },
      { dia: 204, leitura: 'Ez 37:1-14, 24-28',  vc: 'Ez 37:27',      tema: 'Os ossos secos; síntese' },
    ],
  },
  {
    numero: 35, nome: 'Daniel', secao: 'profetas',
    dias: [
      { dia: 205, leitura: 'Dn 1:1-21',           vc: 'Dn 1:8',        tema: 'Não se contaminar' },
      { dia: 206, leitura: 'Dn 2:31-47',          vc: 'Dn 2:44',       tema: 'A pedra e o Reino' },
      { dia: 207, leitura: 'Dn 3:8-30',           vc: 'Dn 3:17-18',    tema: 'A fornalha' },
      { dia: 208, leitura: 'Dn 6:1-28',           vc: 'Dn 6:22',       tema: 'A cova dos leões' },
      { dia: 209, leitura: 'Dn 7:1-14',           vc: 'Dn 7:13-14',    tema: 'O Filho do Homem' },
      { dia: 210, leitura: 'Dn 12:1-13',          vc: 'Dn 12:2-3',     tema: 'A ressurreição; síntese' },
    ],
  },
  {
    numero: 36, nome: 'Profetas menores I', secao: 'profetas',
    dias: [
      { dia: 211, leitura: 'Os 11:1-11',          vc: 'Os 11:8',       tema: 'Oseias: o amor que não desiste' },
      { dia: 212, leitura: 'Jl 2:12-32',          vc: 'Jl 2:28',       tema: 'Joel: o Espírito derramado' },
      { dia: 213, leitura: 'Am 9:7-15',           vc: 'Am 9:11',       tema: 'Amós: o tabernáculo de Davi' },
      { dia: 214, leitura: 'Ob 15-21',            vc: 'Ob 21',         tema: 'Obadias: o reino do Senhor' },
      { dia: 215, leitura: 'Jn 2:1-10',           vc: 'Jn 2:9',        tema: 'Jonas: a salvação é do Senhor' },
      { dia: 216, leitura: 'Mq 5:1-5; 7:18-20',  vc: 'Mq 5:2',       tema: 'Miqueias: Belém e o perdão; síntese' },
    ],
  },
  {
    numero: 37, nome: 'Profetas menores II', secao: 'profetas',
    dias: [
      { dia: 217, leitura: 'Na 1:1-8',            vc: 'Na 1:7',        tema: 'Naum: o refúgio' },
      { dia: 218, leitura: 'Hc 2:1-4; 3:17-19',  vc: 'Hc 2:4',       tema: 'Habacuque: o justo viverá pela fé' },
      { dia: 219, leitura: 'Sf 3:14-20',          vc: 'Sf 3:17',       tema: 'Sofonias: Deus se alegra no seu povo' },
      { dia: 220, leitura: 'Ag 2:1-9',            vc: 'Ag 2:5',        tema: 'Ageu: a glória da casa' },
      { dia: 221, leitura: 'Zc 9:9-17',           vc: 'Zc 9:9',        tema: 'Zacarias: o Rei humilde' },
      { dia: 222, leitura: 'Ml 3:1-6; 4:1-6',    vc: 'Ml 3:1',        tema: 'Malaquias: o Anjo da aliança; síntese' },
    ],
  },
  {
    numero: 38, nome: 'Mateus', secao: 'evangelhos',
    dias: [
      { dia: 223, leitura: 'Mt 1:1-25',           vc: 'Mt 1:23',       tema: 'O Filho de Davi, o Emanuel' },
      { dia: 224, leitura: 'Mt 5:1-20',           vc: 'Mt 5:17',       tema: 'Jesus cumpre a Lei' },
      { dia: 225, leitura: 'Mt 13:31-46',         vc: 'Mt 13:44',      tema: 'O tesouro do Reino' },
      { dia: 226, leitura: 'Mt 16:13-28',         vc: 'Mt 16:16',      tema: '"Tu és o Cristo"' },
      { dia: 227, leitura: 'Mt 26:26-29; 27:27-44', vc: 'Mt 26:28',  tema: 'O sangue da aliança e o Rei na cruz' },
      { dia: 228, leitura: 'Mt 28:1-20',          vc: 'Mt 28:18-19',   tema: 'A Grande Comissão; síntese' },
    ],
  },
  {
    numero: 39, nome: 'Marcos', secao: 'evangelhos',
    dias: [
      { dia: 229, leitura: 'Mc 1:1-15',           vc: 'Mc 1:11',       tema: 'O Filho amado' },
      { dia: 230, leitura: 'Mc 4:35-41',          vc: 'Mc 4:41',       tema: '"Quem é este?"' },
      { dia: 231, leitura: 'Mc 8:27-38',          vc: 'Mc 8:29',       tema: 'A confissão e a cruz' },
      { dia: 232, leitura: 'Mc 10:32-45',         vc: 'Mc 10:45',      tema: 'Veio para servir' },
      { dia: 233, leitura: 'Mc 15:21-37',         vc: 'Mc 15:34',      tema: 'O abandono' },
      { dia: 234, leitura: 'Mc 15:38 – 16:8',     vc: 'Mc 15:39',      tema: 'O centurião e o túmulo vazio; síntese' },
    ],
  },
  {
    numero: 40, nome: 'Lucas', secao: 'evangelhos',
    dias: [
      { dia: 235, leitura: 'Lc 1:67-79',          vc: 'Lc 1:72-73',    tema: 'A aliança lembrada' },
      { dia: 236, leitura: 'Lc 2:1-20',           vc: 'Lc 2:11',       tema: '"Hoje vos nasceu o Salvador"' },
      { dia: 237, leitura: 'Lc 4:14-30',          vc: 'Lc 4:18',       tema: 'O sermão em Nazaré' },
      { dia: 238, leitura: 'Lc 19:1-10',          vc: 'Lc 19:10',      tema: 'Zaqueu' },
      { dia: 239, leitura: 'Lc 22:14-23',         vc: 'Lc 22:20',      tema: 'A nova aliança no sangue' },
      { dia: 240, leitura: 'Lc 24:50-53',         vc: 'Lc 24:52-53',   tema: 'A ascensão e a bênção; síntese' },
    ],
  },
  {
    numero: 41, nome: 'João', secao: 'evangelhos',
    dias: [
      { dia: 241, leitura: 'Jo 1:1-18',           vc: 'Jo 1:14',       tema: 'O Verbo se fez carne' },
      { dia: 242, leitura: 'Jo 2:1-11',           vc: 'Jo 2:11',       tema: 'O primeiro sinal' },
      { dia: 243, leitura: 'Jo 3:1-21',           vc: 'Jo 3:16',       tema: 'O novo nascimento' },
      { dia: 244, leitura: 'Jo 8:48-59',          vc: 'Jo 8:58',       tema: '"Antes que Abraão existisse, Eu Sou"' },
      { dia: 245, leitura: 'Jo 19:16-30',         vc: 'Jo 19:30',      tema: '"Está consumado"' },
      { dia: 246, leitura: 'Jo 20:19-31',         vc: 'Jo 20:31',      tema: 'Tomé e o propósito do livro; síntese' },
    ],
  },
  {
    numero: 42, nome: 'Atos', secao: 'evangelhos',
    dias: [
      { dia: 247, leitura: 'At 1:1-11',           vc: 'At 1:8',        tema: 'A promessa e a missão' },
      { dia: 248, leitura: 'At 2:22-41',          vc: 'At 2:39',       tema: 'O Pentecostes' },
      { dia: 249, leitura: 'At 7:2-8, 51-60',    vc: 'At 7:56',       tema: 'Estêvão' },
      { dia: 250, leitura: 'At 9:1-19',           vc: 'At 9:15',       tema: 'A conversão de Saulo' },
      { dia: 251, leitura: 'At 10:34-48; 15:12-18', vc: 'At 10:34-35', tema: 'O evangelho aos gentios' },
      { dia: 252, leitura: 'At 28:16-31',         vc: 'At 28:31',      tema: 'Paulo em Roma; síntese' },
    ],
  },
  {
    numero: 43, nome: 'Romanos I', secao: 'cartas',
    dias: [
      { dia: 253, leitura: 'Rm 1:1-17',           vc: 'Rm 1:16-17',    tema: 'O evangelho, poder de Deus' },
      { dia: 254, leitura: 'Rm 1:18-32',          vc: 'Rm 1:20',       tema: 'O que se pode conhecer de Deus' },
      { dia: 255, leitura: 'Rm 3:9-20',           vc: 'Rm 3:10',       tema: 'Todos pecaram' },
      { dia: 256, leitura: 'Rm 3:21-31',          vc: 'Rm 3:24',       tema: 'Justificados gratuitamente' },
      { dia: 257, leitura: 'Rm 4:1-25',           vc: 'Rm 4:16',       tema: 'Abraão, pai dos que creem' },
      { dia: 258, leitura: 'Rm 5:1-21',           vc: 'Rm 5:19',       tema: 'Adão e Cristo; síntese' },
    ],
  },
  {
    numero: 44, nome: 'Romanos II', secao: 'cartas',
    dias: [
      { dia: 259, leitura: 'Rm 6:1-14',           vc: 'Rm 6:4',        tema: 'Unidos a Cristo' },
      { dia: 260, leitura: 'Rm 8:1-17',           vc: 'Rm 8:1',        tema: 'Nenhuma condenação' },
      { dia: 261, leitura: 'Rm 8:28-39',          vc: 'Rm 8:38-39',    tema: 'Nada nos separará' },
      { dia: 262, leitura: 'Rm 9:1-5; 11:25-36', vc: 'Rm 9:4-5',     tema: 'Israel e as alianças' },
      { dia: 263, leitura: 'Rm 12:1-21',          vc: 'Rm 12:1-2',     tema: 'O culto racional' },
      { dia: 264, leitura: 'Rm 15:1-13',          vc: 'Rm 15:8-9',     tema: 'Cristo confirma as promessas; síntese' },
    ],
  },
  {
    numero: 45, nome: '1–2 Coríntios e Gálatas', secao: 'cartas',
    dias: [
      { dia: 265, leitura: '1Co 1:18-31',         vc: '1Co 1:18',      tema: 'A palavra da cruz' },
      { dia: 266, leitura: '1Co 15:1-28',         vc: '1Co 15:22',     tema: 'A ressurreição' },
      { dia: 267, leitura: '2Co 3:1-18',          vc: '2Co 3:6',       tema: 'Ministros da nova aliança' },
      { dia: 268, leitura: '2Co 5:11-21',         vc: '2Co 5:17',      tema: 'Nova criação' },
      { dia: 269, leitura: 'Gl 3:6-29',           vc: 'Gl 3:29',       tema: 'Herdeiros da promessa' },
      { dia: 270, leitura: 'Gl 4:1-7',            vc: 'Gl 4:4-5',      tema: 'De escravos a filhos; síntese' },
    ],
  },
  {
    numero: 46, nome: 'Efésios a Tessalonicenses', secao: 'cartas',
    dias: [
      { dia: 271, leitura: 'Ef 2:11-22',          vc: 'Ef 2:13',       tema: 'Os que estavam longe' },
      { dia: 272, leitura: 'Ef 4:1-16',           vc: 'Ef 4:15-16',    tema: 'Um só corpo' },
      { dia: 273, leitura: 'Fp 2:1-11',           vc: 'Fp 2:8',        tema: 'A humilhação e a exaltação' },
      { dia: 274, leitura: 'Cl 1:15-20; 2:16-17', vc: 'Cl 1:18',      tema: 'A supremacia de Cristo' },
      { dia: 275, leitura: '1Ts 4:13-18',         vc: '1Ts 4:17',      tema: 'A vinda do Senhor' },
      { dia: 276, leitura: '2Ts 2:13-17',         vc: '2Ts 2:13-14',   tema: 'Escolhidos para a glória; síntese' },
    ],
  },
  {
    numero: 47, nome: 'Pastorais, Filemom e Tiago', secao: 'cartas',
    dias: [
      { dia: 277, leitura: '1Tm 1:12-17',         vc: '1Tm 1:15',      tema: 'Cristo veio salvar pecadores' },
      { dia: 278, leitura: '1Tm 2:1-7',           vc: '1Tm 2:5',       tema: 'O único Mediador' },
      { dia: 279, leitura: '2Tm 2:1-13',          vc: '2Tm 2:8',       tema: 'Lembra-te de Jesus Cristo' },
      { dia: 280, leitura: 'Tt 2:11-14',          vc: 'Tt 2:14',       tema: 'A graça que educa' },
      { dia: 281, leitura: 'Fm 1-25',             vc: 'Fm 16',         tema: 'Mais que escravo, irmão' },
      { dia: 282, leitura: 'Tg 2:14-26',          vc: 'Tg 2:17',       tema: 'A fé viva; síntese' },
    ],
  },
  {
    numero: 48, nome: 'Hebreus', secao: 'cartas',
    dias: [
      { dia: 283, leitura: 'Hb 1:1-14',           vc: 'Hb 1:1-2',      tema: 'Deus falou pelo Filho' },
      { dia: 284, leitura: 'Hb 2:10-18; 4:14-16', vc: 'Hb 2:17',      tema: 'O sumo sacerdote misericordioso' },
      { dia: 285, leitura: 'Hb 7:18-28',          vc: 'Hb 7:22',       tema: 'O fiador de superior aliança' },
      { dia: 286, leitura: 'Hb 8:1-13',           vc: 'Hb 8:6',        tema: 'A nova aliança' },
      { dia: 287, leitura: 'Hb 11:1-16, 39-40',  vc: 'Hb 11:39-40',  tema: 'A fé dos antigos' },
      { dia: 288, leitura: 'Hb 12:1-2, 18-29',   vc: 'Hb 12:24',      tema: 'O sangue que fala melhor; síntese' },
    ],
  },
  {
    numero: 49, nome: 'Pedro, João e Judas', secao: 'cartas',
    dias: [
      { dia: 289, leitura: '1Pe 1:13-25',         vc: '1Pe 1:18-19',   tema: 'Resgatados pelo sangue' },
      { dia: 290, leitura: '1Pe 2:1-10',          vc: '1Pe 2:9',       tema: 'O povo de Deus' },
      { dia: 291, leitura: '2Pe 3:1-18',          vc: '2Pe 3:13',      tema: 'Novos céus e nova terra' },
      { dia: 292, leitura: '1Jo 4:7-21',          vc: '1Jo 4:10',      tema: 'Deus nos amou primeiro' },
      { dia: 293, leitura: '2Jo 1-6; 3Jo 1-8',   vc: '3Jo 4',         tema: 'Andar na verdade' },
      { dia: 294, leitura: 'Jd 17-25',            vc: 'Jd 24-25',      tema: 'Aquele que nos guarda; síntese' },
    ],
  },
  {
    numero: 50, nome: 'Apocalipse I', secao: 'apocalipse',
    dias: [
      { dia: 295, leitura: 'Ap 1:1-8',            vc: 'Ap 1:5-6',      tema: 'Reino e sacerdotes' },
      { dia: 296, leitura: 'Ap 1:9-20',           vc: 'Ap 1:17-18',    tema: 'Cristo no meio das igrejas' },
      { dia: 297, leitura: 'Ap 2:8-11',           vc: 'Ap 2:10',       tema: 'Fiel até a morte' },
      { dia: 298, leitura: 'Ap 4:1-11',           vc: 'Ap 4:11',       tema: 'O trono' },
      { dia: 299, leitura: 'Ap 5:1-14',           vc: 'Ap 5:9',        tema: 'O Cordeiro digno' },
      { dia: 300, leitura: 'Ap 11:15-19',         vc: 'Ap 11:15',      tema: 'O Reino e a arca da aliança; síntese' },
    ],
  },
  {
    numero: 51, nome: 'Apocalipse II', secao: 'apocalipse',
    dias: [
      { dia: 301, leitura: 'Ap 12:7-12',          vc: 'Ap 12:11',      tema: 'Como os santos vencem' },
      { dia: 302, leitura: 'Ap 14:6-13',          vc: 'Ap 14:12',      tema: 'A perseverança' },
      { dia: 303, leitura: 'Ap 19:1-10',          vc: 'Ap 19:7',       tema: 'As bodas do Cordeiro' },
      { dia: 304, leitura: 'Ap 19:11-16',         vc: 'Ap 19:16',      tema: 'O Cavaleiro Fiel' },
      { dia: 305, leitura: 'Ap 20:11-15',         vc: 'Ap 20:12',      tema: 'O juízo final' },
      { dia: 306, leitura: 'Ap 21:1-7; 22:16-21', vc: 'Ap 21:3',      tema: 'Deus habita com o seu povo; síntese' },
    ],
  },
  {
    numero: 52, nome: 'Conclusão', secao: 'conclusao',
    dias: [
      { dia: 307, leitura: 'Ef 1:3-14',           vc: 'Ef 1:10',       tema: 'Tudo converge em Cristo' },
      { dia: 308, leitura: '2Co 1:18-22',         vc: '2Co 1:20',      tema: 'O "sim" de todas as promessas' },
      { dia: 309, leitura: 'Hb 13:7-8, 20-21',   vc: 'Hb 13:20',      tema: 'A eterna aliança' },
      { dia: 310, leitura: 'Hb 6:13-20; 1Pe 1:3-5', vc: 'Hb 6:19',   tema: 'A âncora da alma' },
      { dia: 311, leitura: 'Rm 15:13; Fp 3:12-14', vc: 'Rm 15:13',    tema: 'O Deus da esperança' },
      { dia: 312, leitura: 'Nm 6:22-27; 2Co 13:13', vc: 'Nm 6:24-26', tema: 'A bênção para a nova jornada; síntese' },
    ],
  },
]
