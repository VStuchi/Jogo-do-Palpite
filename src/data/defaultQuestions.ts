export interface Question {
  id: string;
  text: string;
  answer: number;
  unit: string;
  category: 'Famosos & TV' | 'Lugares & Monumentos' | 'Ciência & Natureza' | 'Brasil' | 'Cultura Pop & Geek' | 'Curiosidades Malucas';
  curiosity?: string;
}

export const DEFAULT_QUESTIONS: Question[] = [
  // Famosos & TV
  {
    id: 'f1',
    text: 'Quantos anos tem a apresentadora Ana Maria Braga? (nascida em abril de 1949)',
    answer: 77,
    unit: 'anos',
    category: 'Famosos & TV',
    curiosity: 'Ana Maria Braga nasceu em 1 de abril de 1949 em São Joaquim da Barra, SP.'
  },
  {
    id: 'f2',
    text: 'Com quantos anos o apresentador Silvio Santos faleceu em 2024?',
    answer: 93,
    unit: 'anos',
    category: 'Famosos & TV',
    curiosity: 'Senor Abravanel (Silvio Santos) nasceu em 12 de dezembro de 1930 e faleceu aos 93 anos.'
  },
  {
    id: 'f3',
    text: 'Quantos gols oficiais Pelé marcou ao longo de sua carreira profissional?',
    answer: 1283,
    unit: 'gols',
    category: 'Famosos & TV',
    curiosity: 'Pelé marcou 1.283 gols em 1.363 jogos segundo os registros históricos oficiais do Santos e CBF!'
  },
  {
    id: 'f4',
    text: 'Quantos dias durou a edição mais longa do Big Brother Brasil (BBB 21)?',
    answer: 100,
    unit: 'dias',
    category: 'Famosos & TV',
    curiosity: 'O BBB 21 teve exatos 100 dias de confinamento e coroou Juliette Freire como campeã.'
  },
  {
    id: 'f5',
    text: 'Quantos prêmios Oscar o filme "Titanic" (1997) ganhou?',
    answer: 11,
    unit: 'estatuetas',
    category: 'Famosos & TV',
    curiosity: 'Titanic empatou o recorde histórico de 11 estatuetas com Ben-Hur (1959) e O Retorno do Rei (2003).'
  },
  {
    id: 'f6',
    text: 'Quantos episódios foram ao ar no seriado Chaves ao longo de toda a história?',
    answer: 290,
    unit: 'episódios',
    category: 'Famosos & TV',
    curiosity: 'Roberto Gómez Bolaños gravou cerca de 290 episódios oficiais de Chaves entre 1973 e 1980.'
  },
  {
    id: 'f7',
    text: 'Qual a altura do apresentador Fausto Silva (Faustão) em centímetros?',
    answer: 188,
    unit: 'cm',
    category: 'Famosos & TV',
    curiosity: 'Faustão mede 1,88m de altura, um dos apresentadores mais altos da TV brasileira!'
  },
  {
    id: 'f8',
    text: 'Quantos anos tinha Michael Jackson quando faleceu em junho de 2009?',
    answer: 50,
    unit: 'anos',
    category: 'Famosos & TV',
    curiosity: 'O Rei do Pop nasceu em agosto de 1958 e morreu prestes a completar 51 anos.'
  },
  {
    id: 'f9',
    text: 'Quantas edições da Copa do Mundo de Futebol a Seleção Brasileira masculina disputou até hoje?',
    answer: 22,
    unit: 'Copas',
    category: 'Famosos & TV',
    curiosity: 'O Brasil é o único país do planeta que participou de todas as 22 edições da Copa do Mundo!'
  },
  {
    id: 'f10',
    text: 'Quantos anos tem o cantor Roberto Carlos? (nascido em abril de 1941)',
    answer: 85,
    unit: 'anos',
    category: 'Famosos & TV',
    curiosity: 'O "Rei" nasceu em 19 de abril de 1941 em Cachoeiro de Itapemirim, Espírito Santo.'
  },

  // Lugares & Monumentos
  {
    id: 'm1',
    text: 'Qual é a altura aproximada da famosa Torre de Pisa (Itália) em metros?',
    answer: 56,
    unit: 'metros',
    category: 'Lugares & Monumentos',
    curiosity: 'A Torre de Pisa tem cerca de 56,7 metros no ponto mais alto e inclina cerca de 3,97 graus.'
  },
  {
    id: 'm2',
    text: 'Qual é a altura da estátua do Cristo Redentor no Rio de Janeiro (incluindo o pedestal)?',
    answer: 38,
    unit: 'metros',
    category: 'Lugares & Monumentos',
    curiosity: 'A estátua tem 30 metros de altura e o pedestal tem mais 8 metros, totalizando 38m.'
  },
  {
    id: 'm3',
    text: 'Qual é a altura oficial do Monte Everest acima do nível do mar em metros?',
    answer: 8849,
    unit: 'metros',
    category: 'Lugares & Monumentos',
    curiosity: 'A medição conjunta de Nepal e China em 2020 fixou a altitude em 8.848,86 metros.'
  },
  {
    id: 'm4',
    text: 'Quantos degraus existem para subir até o topo da Torre Eiffel em Paris?',
    answer: 1665,
    unit: 'degraus',
    category: 'Lugares & Monumentos',
    curiosity: 'Do chão até o terceiro andar são 1.665 degraus, embora o público só possa subir até o 2º andar a pé (674 degraus).'
  },
  {
    id: 'm5',
    text: 'Quantos andares tem o Burj Khalifa em Dubai, o prédio mais alto do mundo?',
    answer: 163,
    unit: 'andares',
    category: 'Lugares & Monumentos',
    curiosity: 'O Burj Khalifa tem 828 metros de altura e 163 andares habitáveis!'
  },
  {
    id: 'm6',
    text: 'Qual é a extensão aproximada da Grande Muralha da China em milhares de quilômetros?',
    answer: 21196,
    unit: 'quilômetros',
    category: 'Lugares & Monumentos',
    curiosity: 'Pesquisas arqueológicas de 2012 mediram todas as ramificações e muralhas históricas em 21.196 km.'
  },
  {
    id: 'm7',
    text: 'Quantos quartos tem o Palácio de Versalhes na França?',
    answer: 2300,
    unit: 'quartos/salas',
    category: 'Lugares & Monumentos',
    curiosity: 'O monumental palácio tem 2.300 cômodos e ocupa uma área construída de mais de 63.000 m².'
  },
  {
    id: 'm8',
    text: 'Qual é a profundidade máxima da Fossa das Marianas (o ponto mais fundo dos oceanos) em metros?',
    answer: 10994,
    unit: 'metros',
    category: 'Lugares & Monumentos',
    curiosity: 'O Challenger Deep atinge quase 11 km de profundidade, cabe o Monte Everest inteiro dentro e ainda sobra!'
  },
  {
    id: 'm9',
    text: 'Quantas ilhas formam o arquipélago de Fernando de Noronha?',
    answer: 21,
    unit: 'ilhas',
    category: 'Lugares & Monumentos',
    curiosity: 'São 21 ilhas e ilhotas, mas apenas a ilha principal é habitada por seres humanos.'
  },
  {
    id: 'm10',
    text: 'Qual a largura da Avenida 9 de Julho em Buenos Aires (uma das mais largas do mundo) em metros?',
    answer: 140,
    unit: 'metros',
    category: 'Lugares & Monumentos',
    curiosity: 'Tem cerca de 140 metros de largura com até 16 pistas de tráfego!'
  },

  // Ciência & Natureza
  {
    id: 'c1',
    text: 'Quantos ossos tem o corpo humano adulto?',
    answer: 206,
    unit: 'ossos',
    category: 'Ciência & Natureza',
    curiosity: 'Um bebê nasce com cerca de 270 a 300 ossos moles que se fundem ao longo do crescimento!'
  },
  {
    id: 'c2',
    text: 'Qual a velocidade máxima registrada de um guepardo (chita) em km/h?',
    answer: 120,
    unit: 'km/h',
    category: 'Ciência & Natureza',
    curiosity: 'Um guepardo pode acelerar de 0 a 100 km/h em menos de 3 segundos, mais rápido que muitos carros esportivos!'
  },
  {
    id: 'c3',
    text: 'Quantos corações tem um polvo?',
    answer: 3,
    unit: 'corações',
    category: 'Ciência & Natureza',
    curiosity: 'Dois corações bombeiam sangue para as brânquias e o terceiro bombeia para o resto do corpo.'
  },
  {
    id: 'c4',
    text: 'Quantos dentes um ser humano adulto possui (incluindo os 4 sisos)?',
    answer: 32,
    unit: 'dentes',
    category: 'Ciência & Natureza',
    curiosity: 'São 8 incisivos, 4 caninos, 8 pré-molares e 12 molares (incluindo os sisos).'
  },
  {
    id: 'c5',
    text: 'Quantos dias dura aproximadamente a gestação de uma elefanta asiática?',
    answer: 660,
    unit: 'dias',
    category: 'Ciência & Natureza',
    curiosity: 'É a gestação mais longa entre os mamíferos terrestres: cerca de 22 meses (640 a 680 dias)!'
  },
  {
    id: 'c6',
    text: 'Quantos planetas existem oficialmente no nosso Sistema Solar?',
    answer: 8,
    unit: 'planetas',
    category: 'Ciência & Natureza',
    curiosity: 'Desde 2006, Plutão foi reclassificado como planeta-anão pela União Astronômica Internacional.'
  },
  {
    id: 'c7',
    text: 'Quantos minutos a luz do Sol demora para chegar até a Terra?',
    answer: 8,
    unit: 'minutos',
    category: 'Ciência & Natureza',
    curiosity: 'Aproximadamente 8 minutos e 20 segundos a 300.000 km por segundo.'
  },
  {
    id: 'c8',
    text: 'Qual é o peso médio de um coração humano adulto em gramas?',
    answer: 300,
    unit: 'gramas',
    category: 'Ciência & Natureza',
    curiosity: 'Pesa entre 250g em mulheres e 350g em homens, do tamanho aproximado de um punho fechado.'
  },
  {
    id: 'c9',
    text: 'Quantas vértebras tem o pescoço de uma girafa?',
    answer: 7,
    unit: 'vértebras',
    category: 'Ciência & Natureza',
    curiosity: 'Apesar de ter um pescoço de até 2 metros, a girafa tem exatamente 7 vértebras cervicais, o mesmo que os humanos!'
  },
  {
    id: 'c10',
    text: 'Quantas horas por dia um bicho-preguiça dorme em média na natureza?',
    answer: 10,
    unit: 'horas',
    category: 'Ciência & Natureza',
    curiosity: 'Na natureza dormem cerca de 9 a 10 horas por dia (em cativeiro podem chegar a 15-18h).'
  },

  // Brasil & Cultura
  {
    id: 'b1',
    text: 'Quantos municípios existem no Brasil segundo o IBGE?',
    answer: 5570,
    unit: 'municípios',
    category: 'Brasil',
    curiosity: 'O Brasil conta com 5.568 municípios mais o Distrito Federal e Fernando de Noronha, totalizando 5.570.'
  },
  {
    id: 'b2',
    text: 'Em que ano a capital do Brasil foi transferida do Rio de Janeiro para Brasília?',
    answer: 1960,
    unit: 'ano',
    category: 'Brasil',
    curiosity: 'Juscelino Kubitschek inaugurou Brasília oficialmente no dia 21 de abril de 1960.'
  },
  {
    id: 'b3',
    text: 'Quantas vezes o Brasil foi campeão mundial de Fórmula 1 com Emerson, Piquet e Senna somados?',
    answer: 8,
    unit: 'títulos',
    category: 'Brasil',
    curiosity: 'Emerson Fittipaldi (2), Nelson Piquet (3) e Ayrton Senna (3) somam 8 campeonatos mundiais!'
  },
  {
    id: 'b4',
    text: 'Quantos Estados compõem a República Federativa do Brasil (sem contar o Distrito Federal)?',
    answer: 26,
    unit: 'estados',
    category: 'Brasil',
    curiosity: 'São 26 estados mais 1 Distrito Federal, totalizando 27 unidades federativas.'
  },
  {
    id: 'b5',
    text: 'Em que ano foi proclamada a Independência do Brasil por Dom Pedro I?',
    answer: 1822,
    unit: 'ano',
    category: 'Brasil',
    curiosity: 'O Grito do Ipiranga aconteceu em 7 de setembro de 1822.'
  },
  {
    id: 'b6',
    text: 'Qual a extensão do litoral brasileiro em quilômetros (segundo o IBGE)?',
    answer: 7491,
    unit: 'km',
    category: 'Brasil',
    curiosity: 'Considerando reentrâncias e baías marítimas, o litoral chega a quase 8.000 km!'
  },
  {
    id: 'b7',
    text: 'Quantos quilos de comida um brasileiro come em média de feijão por ano?',
    answer: 14,
    unit: 'kg',
    category: 'Brasil',
    curiosity: 'O consumo médio anual per capita no Brasil varia entre 12 e 15 kg de feijão.'
  },
  {
    id: 'b8',
    text: 'Em que ano a seleção brasileira de futebol masculino conquistou o seu primeiro título mundial (Copa na Suécia)?',
    answer: 1958,
    unit: 'ano',
    category: 'Brasil',
    curiosity: 'Pelé tinha apenas 17 anos na Copa de 1958!'
  },
  {
    id: 'b9',
    text: 'Quantos deputados federais compõem a Câmara dos Deputados em Brasília?',
    answer: 513,
    unit: 'deputados',
    category: 'Brasil',
    curiosity: 'São 513 deputados federais eleitos proporcionalmente à população de cada estado.'
  },
  {
    id: 'b10',
    text: 'Em que ano o plano Real começou a circular no Brasil substituindo o Cruzeiro Real?',
    answer: 1994,
    unit: 'ano',
    category: 'Brasil',
    curiosity: 'As moedas e cédulas do Real entraram em vigor em 1º de julho de 1994.'
  },

  // Curiosidades Malucas & Recordes
  {
    id: 'u1',
    text: 'Quantos furos tem uma bolinha de golfe padrão?',
    answer: 336,
    unit: 'furinhos',
    category: 'Curiosidades Malucas',
    curiosity: 'A maioria das bolas de golfe tem entre 300 e 500 alvéolos; 336 é o número mais comum para aerodinâmica!'
  },
  {
    id: 'u2',
    text: 'Quantas calorias tem uma coxinha de frango tradicional de padaria em média?',
    answer: 380,
    unit: 'kcal',
    category: 'Curiosidades Malucas',
    curiosity: 'Uma coxinha frita média de 100g tem cerca de 350 a 400 calorias, mas vale cada mordida!'
  },
  {
    id: 'u3',
    text: 'Quantas peças tem um jogo completo de dominó tradicional?',
    answer: 28,
    unit: 'peças',
    category: 'Curiosidades Malucas',
    curiosity: 'O jogo duplo-6 tem combinações do 0-0 até o 6-6, totalizando 28 peças.'
  },
  {
    id: 'u4',
    text: 'Quantas cartas tem um baralho tradicional (sem contar os coringas)?',
    answer: 52,
    unit: 'cartas',
    category: 'Curiosidades Malucas',
    curiosity: 'São 4 naipes de 13 cartas cada um: 4 x 13 = 52 cartas.'
  },
  {
    id: 'u5',
    text: 'Quantos litros de saliva uma pessoa humana produz em média por dia?',
    answer: 1,
    unit: 'litro',
    category: 'Curiosidades Malucas',
    curiosity: 'Produzimos entre 1 e 1,5 litro de saliva diariamente, o suficiente para encher duas piscinas ao longo da vida!'
  },
  {
    id: 'u6',
    text: 'Quantos segundos dura a clássica música "Faroeste Caboclo" da banda Legião Urbana?',
    answer: 543,
    unit: 'segundos (9min03s)',
    category: 'Curiosidades Malucas',
    curiosity: 'A faixa do álbum Que País É Este (1987) tem exatos 9 minutos e 3 segundos e 168 versos sem refrão.'
  },
  {
    id: 'u7',
    text: 'Quantos países independentes existem oficialmente no mundo reconhecidos pela ONU?',
    answer: 195,
    unit: 'países',
    category: 'Curiosidades Malucas',
    curiosity: 'São 193 países membros da ONU mais 2 Estados observadores permanentes (Vaticano e Palestina).'
  },
  {
    id: 'u8',
    text: 'Quantos quadrados tem um tabuleiro de xadrez padrão?',
    answer: 64,
    unit: 'casas',
    category: 'Curiosidades Malucas',
    curiosity: 'São 8 colunas por 8 fileiras: 32 casas claras e 32 casas escuras.'
  },
  {
    id: 'u9',
    text: 'Quantos dias tem um ano bissexto no calendário gregoriano?',
    answer: 366,
    unit: 'dias',
    category: 'Curiosidades Malucas',
    curiosity: 'Acrescenta-se o dia 29 de fevereiro para compensar as 5h48min extras do movimento de translação da Terra.'
  },
  {
    id: 'u10',
    text: 'Quantos graus Celsius mede o ponto de ebulição da água ao nível do mar?',
    answer: 100,
    unit: '°C',
    category: 'Curiosidades Malucas',
    curiosity: 'A 1 atmosfera de pressão, a água ferve a exatos 100°C.'
  },

  // Cultura Pop & Geek
  {
    id: 'p1',
    text: 'Quantos Pokémon existiam na primeira geração original (Kanto/Red & Blue)?',
    answer: 151,
    unit: 'pokémons',
    category: 'Cultura Pop & Geek',
    curiosity: 'Do Bulbasaur (#001) ao mítico Mew (#151)!'
  },
  {
    id: 'p2',
    text: 'Quantos filmes compõem a saga principal do bruxo Harry Potter nos cinemas?',
    answer: 8,
    unit: 'filmes',
    category: 'Cultura Pop & Geek',
    curiosity: 'Os 7 livros foram adaptados em 8 filmes, já que As Relíquias da Morte foi dividido em duas partes.'
  },
  {
    id: 'p3',
    text: 'Quantos episódios tem a série completa de "Friends" ao longo de suas 10 temporadas?',
    answer: 236,
    unit: 'episódios',
    category: 'Cultura Pop & Geek',
    curiosity: 'Foram 236 episódios exibidos entre 1994 e 2004.'
  },
  {
    id: 'p4',
    text: 'Quantos personagens jogáveis compunham o elenco original do primeiro jogo Street Fighter II (1991)?',
    answer: 8,
    unit: 'lutadores',
    category: 'Cultura Pop & Geek',
    curiosity: 'Ryu, Ken, Chun-Li, Guile, Blanka, Dhalsim, E. Honda e Zangief (os 4 chefes não eram jogáveis).'
  },
  {
    id: 'p5',
    text: 'Em que ano foi lançado o primeiro filme da franquia Star Wars (Episódio IV: Uma Nova Esperança)?',
    answer: 1977,
    unit: 'ano',
    category: 'Cultura Pop & Geek',
    curiosity: 'George Lucas estreou o filme histórico em maio de 1977 nos Estados Unidos.'
  },
  {
    id: 'p6',
    text: 'Quantas joias do infinito existem no Universo Cinematográfico da Marvel (MCU)?',
    answer: 6,
    unit: 'joias',
    category: 'Cultura Pop & Geek',
    curiosity: 'Espaço, Mente, Realidade, Poder, Tempo e Alma!'
  },
  {
    id: 'p7',
    text: 'Quantos anos tinha o ator Daniel Radcliffe quando gravou o primeiro Harry Potter (Pedra Filosofal)?',
    answer: 11,
    unit: 'anos',
    category: 'Cultura Pop & Geek',
    curiosity: 'Ele foi escalado aos 11 anos em 2000 para interpretar o bruxinho.'
  },
  {
    id: 'p8',
    text: 'Em que ano foi fundado o YouTube?',
    answer: 2005,
    unit: 'ano',
    category: 'Cultura Pop & Geek',
    curiosity: 'Criado em fevereiro de 2005 por ex-funcionários do PayPal e comprado pelo Google em 2006.'
  },
  {
    id: 'p9',
    text: 'Quantos blocos de altura mede o personagem Steve no jogo Minecraft?',
    answer: 2,
    unit: 'blocos (1,8m)',
    category: 'Cultura Pop & Geek',
    curiosity: 'No universo de blocos do Minecraft, 1 bloco = 1 metro e Steve tem cerca de 1,8 a 2 blocos de altura.'
  },
  {
    id: 'p10',
    text: 'Quantos botões tinha o controle clássico do Super Nintendo (incluindo o D-pad como 1)?',
    answer: 8,
    unit: 'botões',
    category: 'Cultura Pop & Geek',
    curiosity: 'D-Pad, A, B, X, Y, L, R, Start e Select (se contarmos o direcional como 4 direções, são 12 inputs).'
  }
];
