export type GamePhase = 'LOBBY' | 'QUESTION' | 'VOTING' | 'REVEAL' | 'LEADERBOARD' | 'GAME_OVER';

export interface PlayerRoundStats {
  guess: number | null;
  distance: number | null;
  isExact: boolean;
  isClosest: boolean;
  isFarthest: boolean;
  guessPoints: number;
  votedPlayerId: string | null;
  votePoints: number;
  totalRoundPoints: number;
}

export interface PlayerStats {
  exactGuesses: number;
  closestGuesses: number;
  farthestGuesses: number;
  successfulVotes: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
  score: number;
  isHost: boolean;
  isBot?: boolean;
  connected: boolean;
  currentGuess: number | null;
  currentVote: string | null;
  roundStats?: PlayerRoundStats;
  stats: PlayerStats;
}

export interface QuestionItem {
  id: string;
  text: string;
  answer: number;
  unit: string;
  category: string;
  curiosity?: string;
}

export interface RoomSettings {
  questionTimer: number; // in seconds
  votingTimer: number; // in seconds
  totalQuestions: number;
  hostPlays: boolean;
  allowBots: boolean;
}

export interface RevealData {
  correctAnswer: number;
  unit: string;
  curiosity?: string;
  farthestPlayerIds: string[];
  closestPlayerIds: string[];
  exactPlayerIds: string[];
}

export interface PublicPlayer {
  id: string;
  name: string;
  avatar: string;
  color: string;
  score: number;
  isHost: boolean;
  isBot?: boolean;
  connected: boolean;
  hasGuessed: boolean;
  hasVoted: boolean;
  // During voting & reveal, the guess becomes visible
  revealedGuess?: number | null;
  roundStats?: PlayerRoundStats;
  stats: PlayerStats;
}

export interface GameState {
  code: string;
  phase: GamePhase;
  players: PublicPlayer[];
  currentQuestionIndex: number;
  totalQuestions: number;
  currentQuestion?: {
    id: string;
    text: string;
    unit: string;
    category: string;
  } | null;
  revealData?: RevealData | null;
  timer: number;
  hostId: string;
  settings: RoomSettings;
}
