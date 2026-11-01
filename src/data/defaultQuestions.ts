export interface Question {
  id: string;
  text: string;
  answer: number;
  unit: string;
  category: 'Copas do Mundo' | 'Futebol Brasileiro' | 'Futebol Mundial & Champions' | 'Famosos & TV' | 'Lugares & Monumentos' | 'Ciência & Natureza' | 'Curiosidades Malucas';
  curiosity?: string;
}

export const FOOTBALL_CATEGORIES = [
  'Copas do Mundo',
  'Futebol Brasileiro',
  'Futebol Mundial & Champions'
] as const;

export const THEME_OPTIONS = [
  { id: 'ALL_FOOTBALL', name: 'Futebol Geral', desc: 'Copas, Brasil e Europa', icon: '⚽' },
  { id: 'WORLD_CUP', name: 'Copas do Mundo', desc: 'História, finais e artilheiros', icon: '🏆' },
  { id: 'BRAZIL_FOOTBALL', name: 'Futebol Brasileiro', desc: 'Brasileirão e Libertadores', icon: '🇧🇷' },
  { id: 'WORLD_FOOTBALL', name: 'Futebol Europeu', desc: 'Champions e Ligas Europeias', icon: '🌍' },
  { id: 'GENERAL', name: 'Curiosidades & TV', desc: 'Torre de Pisa, Famosos e etc.', icon: '⭐' },
  { id: 'ALL', name: 'Misto / Todos', desc: 'Todas as perguntas misturadas', icon: '🎲' }
] as const;

export function filterQuestionsByTheme(theme: string): Question[] {
  if (theme === 'WORLD_CUP') {
    return DEFAULT_QUESTIONS.filter(q => q.category === 'Copas do Mundo');
  }
  if (theme === 'BRAZIL_FOOTBALL') {
    return DEFAULT_QUESTIONS.filter(q => q.category === 'Futebol Brasileiro');
  }
  if (theme === 'WORLD_FOOTBALL') {
    return DEFAULT_QUESTIONS.filter(q => q.category === 'Futebol Mundial & Champions');
  }
  if (theme === 'ALL_FOOTBALL') {
    return DEFAULT_QUESTIONS.filter(q =>
      q.category === 'Copas do Mundo' ||
      q.category === 'Futebol Brasileiro' ||
      q.category === 'Futebol Mundial & Champions'
    );
  }
  if (theme === 'GENERAL') {
    return DEFAULT_QUESTIONS.filter(q =>
      q.category !== 'Copas do Mundo' &&
      q.category !== 'Futebol Brasileiro' &&
      q.category !== 'Futebol Mundial & Champions'
    );
  }
  return DEFAULT_QUESTIONS;
}

export const DEFAULT_QUESTIONS: Question[] = [
  // ==========================================
  // TEMA 1: COPAS DO MUNDO
  // ==========================================
  {
    id: 'wc1',
    text: 'Quantas seleções disputaram a primeira Copa do Mundo da história em 1930 no Uruguai?',
    answer: 13,
    unit: 'seleções',
    category: 'Copas do Mundo',
    curiosity: 'Foram 7 equipes da América do Sul, 4 da Europa e 2 da América do Norte. O Uruguai foi o primeiro campeão!'
  },
  {
    id: 'wc2',
    text: 'Quantos gols o alemão Miroslav Klose marcou em Copas do Mundo para ser o maior artilheiro da história do torneio?',
    answer: 16,
    unit: 'gols',
    category: 'Copas do Mundo',
    curiosity: 'Klose superou Ronaldo Fenômeno (15 gols) justamente na semifinal de 2014 contra o Brasil.'
  },
  {
    id: 'wc3',
    text: 'Em que ano a Seleção Brasileira masculina conquistou o seu histórico Pentacampeonato mundial?',
    answer: 2002,
    unit: 'ano',
    category: 'Copas do Mundo',
    curiosity: 'Comandado por Felipão e com o trio Ronaldo, Rivaldo e Ronaldinho Gaúcho, o Brasil bateu a Alemanha por 2 a 0 na final em Yokohama.'
  },
  {
    id: 'wc4',
    text: 'Quantos gols Pelé marcou somando todas as suas 4 participações em Copas do Mundo (1958 a 1970)?',
    answer: 12,
    unit: 'gols',
    category: 'Copas do Mundo',
    curiosity: 'O Rei do Futebol marcou 6 gols em 1958, 1 em 1962, 1 em 1966 e 4 gols em 1970!'
  },
  {
    id: 'wc5',
    text: 'Quantos pênaltis foram batidos no total na disputa final da Copa de 1994 entre Brasil e Itália?',
    answer: 9,
    unit: 'pênaltis',
    category: 'Copas do Mundo',
    curiosity: 'Foram 5 cobranças da Itália (Baresi, Massaro e Baggio perderam) e 4 do Brasil (apenas Márcio Santos errou).'
  },
  {
    id: 'wc6',
    text: 'Quantos gols Ronaldo Fenômeno marcou na Copa do Mundo de 2002, sendo o artilheiro isolado da competição?',
    answer: 8,
    unit: 'gols',
    category: 'Copas do Mundo',
    curiosity: 'Ronaldo balançou as redes em quase todos os jogos, incluindo os dois gols históricos da grande final contra Oliver Kahn.'
  },
  {
    id: 'wc7',
    text: 'Quantos países sediarão juntos a Copa do Mundo de 2026 pela primeira vez na história?',
    answer: 3,
    unit: 'países (EUA, México e Canadá)',
    category: 'Copas do Mundo',
    curiosity: 'A Copa de 2026 terá 48 seleções e jogos divididos entre Estados Unidos, México e Canadá.'
  },
  {
    id: 'wc8',
    text: 'Em que ano foi realizada a primeira Copa do Mundo Feminina oficial da FIFA na China?',
    answer: 1991,
    unit: 'ano',
    category: 'Copas do Mundo',
    curiosity: 'Os Estados Unidos venceram a primeira edição batendo a Noruega na final por 2 a 1.'
  },
  {
    id: 'wc9',
    text: 'Quantos gols a fantástica Seleção Brasileira de 1970 marcou ao longo da campanha do Tri no México?',
    answer: 19,
    unit: 'gols em 6 jogos',
    category: 'Copas do Mundo',
    curiosity: 'Uma média impressionante de mais de 3 gols por jogo com Pelé, Tostão, Jairzinho, Gérson e Rivellino!'
  },
  {
    id: 'wc10',
    text: 'Em que minuto da prorrogação Mario Götze marcou o gol do título da Alemanha contra a Argentina na final de 2014?',
    answer: 113,
    unit: 'minutos',
    category: 'Copas do Mundo',
    curiosity: 'Götze dominou no peito e chutou de primeira no Maracanã aos 113 minutos (segundo tempo da prorrogação).'
  },

  // ==========================================
  // TEMA 2: FUTEBOL BRASILEIRO & LIBERTADORES
  // ==========================================
  {
    id: 'br1',
    text: 'Quantos títulos de Campeonato Brasileiro (Série A) o Palmeiras possui oficialmente segundo a CBF?',
    answer: 12,
    unit: 'títulos',
    category: 'Futebol Brasileiro',
    curiosity: 'O Palmeiras é o maior campeão brasileiro isolado com 12 conquistas reconhecidas pela CBF.'
  },
  {
    id: 'br2',
    text: 'Quantos gols oficiais o goleiro Rogério Ceni marcou em sua carreira profissional pelo São Paulo?',
    answer: 131,
    unit: 'gols',
    category: 'Futebol Brasileiro',
    curiosity: 'Rogério Ceni marcou 69 gols de pênalti, 61 de falta e 1 com bola rolando, sendo o maior goleiro artilheiro de todos os tempos.'
  },
  {
    id: 'br3',
    text: 'Quantos pontos o Flamengo fez no Brasileirão de 2019, o recorde histórico dos pontos corridos com 20 clubes?',
    answer: 90,
    unit: 'pontos',
    category: 'Futebol Brasileiro',
    curiosity: 'Sob o comando de Jorge Jesus, o time rubro-negro fez 90 pontos em 38 rodadas (28 vitórias, 6 empates e apenas 4 derrotas).'
  },
  {
    id: 'br4',
    text: 'Em que ano o Corinthians conquistou o seu primeiro e histórico título da Copa Libertadores da América?',
    answer: 2012,
    unit: 'ano',
    category: 'Futebol Brasileiro',
    curiosity: 'O Corinthians venceu a Libertadores invicto contra o Boca Juniors com dois gols inesquecíveis de Emerson Sheik no Pacaembu.'
  },
  {
    id: 'br5',
    text: 'Quantos clubes disputam a Série A do Campeonato Brasileiro em cada temporada?',
    answer: 20,
    unit: 'clubes',
    category: 'Futebol Brasileiro',
    curiosity: 'O formato de 20 equipes em turno e returno por pontos corridos foi adotado em 2006.'
  },
  {
    id: 'br6',
    text: 'Quantos gols Roberto Dinamite marcou pelo Vasco da Gama para se tornar o maior artilheiro da história do Brasileirão?',
    answer: 190,
    unit: 'gols',
    category: 'Futebol Brasileiro',
    curiosity: 'Roberto Dinamite é o recordista absoluto do Brasileirão com 190 gols marcados entre 1971 e 1992.'
  },
  {
    id: 'br7',
    text: 'Quantos gols Gabigol marcou na campanha inteira do título do Flamengo na Copa Libertadores de 2019?',
    answer: 9,
    unit: 'gols',
    category: 'Futebol Brasileiro',
    curiosity: 'Dois desses 9 gols foram na virada épica sobre o River Plate nos acréscimos da final em Lima!'
  },
  {
    id: 'br8',
    text: 'Quantas edições da Copa Libertadores da América o Santos de Pelé e Neymar conquistou até hoje?',
    answer: 3,
    unit: 'títulos (1962, 1963 e 2011)',
    category: 'Futebol Brasileiro',
    curiosity: 'O Santos foi bicampeão com Pelé em 1962/63 e voltou a vencer em 2011 com o jovem Neymar e Ganso.'
  },
  {
    id: 'br9',
    text: 'Em que ano o Grêmio conquistou a sua primeira Taça Libertadores da América sobre o Peñarol?',
    answer: 1983,
    unit: 'ano',
    category: 'Futebol Brasileiro',
    curiosity: 'Comandado por Valdir Espinosa e com Renato Gaúcho brilhando, o tricolor gaúcho sagrou-se campeão no Olímpico.'
  },
  {
    id: 'br10',
    text: 'Quantos clubes diferentes já foram campeões da Copa do Brasil desde 1989?',
    answer: 17,
    unit: 'clubes',
    category: 'Futebol Brasileiro',
    curiosity: 'Clubes tradicionais e surpresas como Criciúma (1991), Juventude (1999), Santo André (2004) e Paulista de Jundiaí (2005) já ergueram a taça!'
  },

  // ==========================================
  // TEMA 3: FUTEBOL MUNDIAL & CHAMPIONS LEAGUE
  // ==========================================
  {
    id: 'eu1',
    text: 'Quantos títulos da UEFA Champions League o Real Madrid conquistou na história?',
    answer: 15,
    unit: 'títulos de Champions',
    category: 'Futebol Mundial & Champions',
    curiosity: 'O Real Madrid é o clube mais dominante da Europa com mais do que o dobro de títulos do segundo colocado (Milan, 7).'
  },
  {
    id: 'eu2',
    text: 'Quantos gols Cristiano Ronaldo marcou na Champions League, sendo o maior artilheiro isolado de todos os tempos?',
    answer: 140,
    unit: 'gols',
    category: 'Futebol Mundial & Champions',
    curiosity: 'CR7 marcou 140 gols em 183 jogos divididos por Manchester United, Real Madrid e Juventus.'
  },
  {
    id: 'eu3',
    text: 'Quantos gols oficiais Lionel Messi marcou no ano de 2012 pelo Barcelona e Argentina, recorde mundial do Guinness?',
    answer: 91,
    unit: 'gols em um ano civil',
    category: 'Futebol Mundial & Champions',
    curiosity: 'Messi superou a marca histórica do alemão Gerd Müller (85 gols em 1972) ao marcar impressionantes 91 gols em 69 partidas.'
  },
  {
    id: 'eu4',
    text: 'Quantos gols Erling Haaland marcou em sua temporada de estreia na Premier League (2022/2023) pelo Manchester City?',
    answer: 36,
    unit: 'gols',
    category: 'Futebol Mundial & Champions',
    curiosity: 'Haaland pulverizou o recorde histórico de Alan Shearer e Andy Cole (que era de 34 gols em 42 jogos) jogando apenas 35 partidas.'
  },
  {
    id: 'eu5',
    text: 'Quantos jogos consecutivos o Arsenal de Thierry Henry e Arsène Wenger ficou invicto na Inglaterra entre 2003 e 2004?',
    answer: 49,
    unit: 'jogos invicto',
    category: 'Futebol Mundial & Champions',
    curiosity: 'Os "Invencíveis" conquistaram a Premier League 2003/04 sem sofrer uma única derrota em 38 rodadas!'
  },
  {
    id: 'eu6',
    text: 'Em que ano o Chelsea conquistou o seu primeiro título da UEFA Champions League em cima do Bayern em Munique?',
    answer: 2012,
    unit: 'ano',
    category: 'Futebol Mundial & Champions',
    curiosity: 'Com gol heróico de Drogba aos 88 minutos e decisão nos pênaltis dentro da Allianz Arena!'
  },
  {
    id: 'eu7',
    text: 'Quantos clubes disputam a divisão de elite da Premier League inglesa em cada temporada?',
    answer: 20,
    unit: 'clubes',
    category: 'Futebol Mundial & Champions',
    curiosity: '20 clubes se enfrentam em 38 rodadas, com os 3 piores sendo rebaixados para a Championship.'
  },
  {
    id: 'eu8',
    text: 'Quantas Bolas de Ouro (Ballon d\'Or) da France Football Lionel Messi já conquistou ao longo da carreira?',
    answer: 8,
    unit: 'Bolas de Ouro',
    category: 'Futebol Mundial & Champions',
    curiosity: 'Messi venceu em 2009, 2010, 2011, 2012, 2015, 2019, 2021 e 2023, o maior vencedor da história.'
  },
  {
    id: 'eu9',
    text: 'Quantas vezes o AC Milan da Itália conquistou a UEFA Champions League?',
    answer: 7,
    unit: 'títulos',
    category: 'Futebol Mundial & Champions',
    curiosity: 'O Milan é o segundo clube com mais títulos europeus, atrás apenas do Real Madrid.'
  },
  {
    id: 'eu10',
    text: 'Em que minuto Sergi Roberto marcou o 6º gol da histórica virada do Barcelona por 6 a 1 sobre o PSG em 2017?',
    answer: 95,
    unit: 'minutos (94m39s)',
    category: 'Futebol Mundial & Champions',
    curiosity: 'O Barcelona precisava de 3 gols a partir dos 88 minutos e conseguiu a maior virada da história da Champions League!'
  },

  // ==========================================
  // TEMA 4: GERAIS, TV & MONUMENTOS
  // ==========================================
  {
    id: 'f1',
    text: 'Quantos anos tem a apresentadora Ana Maria Braga? (nascida em abril de 1949)',
    answer: 77,
    unit: 'anos',
    category: 'Famosos & TV',
    curiosity: 'Ana Maria Braga nasceu em 1 de abril de 1949 em São Joaquim da Barra, SP.'
  },
  {
    id: 'm1',
    text: 'Qual é a altura aproximada da famosa Torre de Pisa (Itália) em metros?',
    answer: 56,
    unit: 'metros',
    category: 'Lugares & Monumentos',
    curiosity: 'A Torre de Pisa tem cerca de 56,7 metros no ponto mais alto e inclina cerca de 3,97 graus.'
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
    id: 'c1',
    text: 'Quantos ossos tem o corpo humano adulto?',
    answer: 206,
    unit: 'ossos',
    category: 'Ciência & Natureza',
    curiosity: 'Um bebê nasce com cerca de 270 a 300 ossos moles que se fundem ao longo do crescimento!'
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
    id: 'c2',
    text: 'Qual a velocidade máxima registrada de um guepardo (chita) em km/h?',
    answer: 120,
    unit: 'km/h',
    category: 'Ciência & Natureza',
    curiosity: 'Um guepardo pode acelerar de 0 a 100 km/h em menos de 3 segundos, mais rápido que muitos carros esportivos!'
  },
  {
    id: 'u7',
    text: 'Quantos países independentes existem oficialmente no mundo reconhecidos pela ONU?',
    answer: 195,
    unit: 'países',
    category: 'Curiosidades Malucas',
    curiosity: 'São 193 países membros da ONU mais 2 Estados observadores permanentes (Vaticano e Palestina).'
  }
];
