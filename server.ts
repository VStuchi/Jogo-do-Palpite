import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { DEFAULT_QUESTIONS, Question } from './src/data/defaultQuestions.ts';
import {
  GamePhase,
  Player,
  RoomSettings,
  GameState,
  PublicPlayer,
  RevealData,
  QuestionItem
} from './src/types/game.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(express.json());

// Bot names and avatar presets
const BOT_PRESETS = [
  { name: 'Tio do Zap', avatar: '👴', color: '#f59e0b' },
  { name: 'Robozinho', avatar: '🤖', color: '#3b82f6' },
  { name: 'Rainha do Palpite', avatar: '👑', color: '#ec4899' },
  { name: 'Chutador Nato', avatar: '⚽', color: '#10b981' },
  { name: 'Capivara Esperta', avatar: '🦫', color: '#8b5cf6' }
];

interface InternalRoom {
  code: string;
  hostId: string;
  phase: GamePhase;
  players: Record<string, Player>;
  currentQuestionIndex: number;
  questions: QuestionItem[];
  settings: RoomSettings;
  timer: number;
  timerInterval: NodeJS.Timeout | null;
  revealData: RevealData | null;
}

const rooms: Record<string, InternalRoom> = {};

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms[code] ? generateRoomCode() : code;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getPublicGameState(room: InternalRoom): GameState {
  const currentQ = room.questions[room.currentQuestionIndex];
  const isGuessRevealedPhase = room.phase === 'VOTING' || room.phase === 'REVEAL' || room.phase === 'LEADERBOARD' || room.phase === 'GAME_OVER';

  const playersList: PublicPlayer[] = Object.values(room.players).map((p) => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    color: p.color,
    score: p.score,
    isHost: p.isHost,
    isBot: p.isBot,
    connected: p.connected,
    hasGuessed: p.currentGuess !== null,
    hasVoted: p.currentVote !== null,
    revealedGuess: isGuessRevealedPhase ? p.currentGuess : undefined,
    roundStats: room.phase === 'REVEAL' || room.phase === 'LEADERBOARD' || room.phase === 'GAME_OVER' ? p.roundStats : undefined,
    stats: p.stats
  }));

  return {
    code: room.code,
    phase: room.phase,
    players: playersList,
    currentQuestionIndex: room.currentQuestionIndex,
    totalQuestions: room.questions.length,
    currentQuestion: currentQ ? {
      id: currentQ.id,
      text: currentQ.text,
      unit: currentQ.unit,
      category: currentQ.category
    } : null,
    revealData: room.revealData,
    timer: room.timer,
    hostId: room.hostId,
    settings: room.settings
  };
}

function broadcastRoomState(room: InternalRoom) {
  const publicState = getPublicGameState(room);
  io.to(room.code).emit('game_state_update', publicState);
}

function clearRoomTimer(room: InternalRoom) {
  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = null;
  }
}

function getActiveGuessingPlayers(room: InternalRoom): Player[] {
  return Object.values(room.players).filter((p) => {
    if (!p.connected && !p.isBot) return false;
    if (p.isHost && !room.settings.hostPlays) return false;
    return true;
  });
}

function simulateBotGuesses(room: InternalRoom, correctAnswer: number) {
  const activeBots = Object.values(room.players).filter((p) => p.isBot);
  activeBots.forEach((bot) => {
    // Variety in bot accuracy: some close, some wildly off!
    const personality = Math.random();
    let botGuess: number;

    if (personality < 0.25) {
      // Very close or exact (+- 5%)
      const variation = Math.round(correctAnswer * (Math.random() * 0.1 - 0.05));
      botGuess = Math.max(1, correctAnswer + variation);
    } else if (personality < 0.65) {
      // Reasonable guess (+- 25%)
      const variation = Math.round(correctAnswer * (Math.random() * 0.5 - 0.25));
      botGuess = Math.max(1, correctAnswer + variation);
    } else {
      // Wildly far guess! (2x to 5x off or 1/5th)
      const multiplier = Math.random() > 0.5 ? (1.8 + Math.random() * 3) : (0.1 + Math.random() * 0.3);
      botGuess = Math.max(1, Math.round(correctAnswer * multiplier));
    }
    bot.currentGuess = botGuess;
  });
}

function simulateBotVotes(room: InternalRoom) {
  const activeBots = Object.values(room.players).filter((p) => p.isBot);
  const eligibleTargets = Object.values(room.players).filter((p) => p.currentGuess !== null);

  activeBots.forEach((bot) => {
    const targetsExceptSelf = eligibleTargets.filter((t) => t.id !== bot.id);
    if (targetsExceptSelf.length > 0) {
      const randomTarget = targetsExceptSelf[Math.floor(Math.random() * targetsExceptSelf.length)];
      bot.currentVote = randomTarget.id;
    }
  });
}

function advanceToVoting(room: InternalRoom) {
  clearRoomTimer(room);
  room.phase = 'VOTING';

  // Fill null guesses for players who didn't submit in time with extreme fallback or 0
  const activePlayers = getActiveGuessingPlayers(room);
  activePlayers.forEach((p) => {
    if (p.currentGuess === null) {
      // Default missing guess so they can still participate in voting
      p.currentGuess = 0;
    }
  });

  // Bots vote
  simulateBotVotes(room);

  room.timer = room.settings.votingTimer;
  broadcastRoomState(room);

  room.timerInterval = setInterval(() => {
    room.timer--;
    if (room.timer <= 0) {
      advanceToReveal(room);
    } else {
      io.to(room.code).emit('timer_tick', { timer: room.timer });
    }
  }, 1000);
}

function advanceToReveal(room: InternalRoom) {
  clearRoomTimer(room);
  room.phase = 'REVEAL';

  const currentQ = room.questions[room.currentQuestionIndex];
  const correctAnswer = currentQ.answer;

  const guessingPlayers = getActiveGuessingPlayers(room).filter((p) => p.currentGuess !== null);

  let minDistance = Infinity;
  let maxDistance = -Infinity;

  const playerDistances: Record<string, number> = {};

  guessingPlayers.forEach((p) => {
    const dist = Math.abs(p.currentGuess! - correctAnswer);
    playerDistances[p.id] = dist;
    if (dist < minDistance) minDistance = dist;
    if (dist > maxDistance) maxDistance = dist;
  });

  const exactPlayerIds: string[] = [];
  const closestPlayerIds: string[] = [];
  const farthestPlayerIds: string[] = [];

  guessingPlayers.forEach((p) => {
    const dist = playerDistances[p.id];
    if (p.currentGuess === correctAnswer) {
      exactPlayerIds.push(p.id);
    }
    if (dist === minDistance) {
      closestPlayerIds.push(p.id);
    }
    // Only designate as farthest if there is a real distinction or at least 2 distinct guesses
    if (dist === maxDistance && (minDistance !== maxDistance || guessingPlayers.length > 1)) {
      farthestPlayerIds.push(p.id);
    }
  });

  // Calculate scores and record round stats
  Object.values(room.players).forEach((p) => {
    const hasGuess = p.currentGuess !== null && playerDistances[p.id] !== undefined;
    const distance = hasGuess ? playerDistances[p.id] : null;
    const isExact = exactPlayerIds.includes(p.id);
    const isClosest = closestPlayerIds.includes(p.id);
    const isFarthest = farthestPlayerIds.includes(p.id);

    // Rule:
    // Exact match: 3 points
    // Closest match (if not exact): 2 points
    // Farthest match: 0 points for guess
    let guessPoints = 0;
    if (isExact) {
      guessPoints = 3;
      p.stats.exactGuesses++;
    } else if (isClosest) {
      guessPoints = 2;
      p.stats.closestGuesses++;
    }

    if (isFarthest) {
      p.stats.farthestGuesses++;
    }

    // Rule for voting:
    // "todos os jogadores teriam que votar em um jogador que ficaria mais longe,
    // e se esse jogador realmente ficasse mais longe da resposta quem apostou nele recebe 1 ponto
    // e o que mais ficou longe é quem errou o palpite do pior jogador não ganham nada de pontos"
    let votePoints = 0;
    if (p.currentVote && farthestPlayerIds.includes(p.currentVote)) {
      votePoints = 1;
      p.stats.successfulVotes++;
    }

    const totalRoundPoints = guessPoints + votePoints;
    p.score += totalRoundPoints;

    p.roundStats = {
      guess: p.currentGuess,
      distance,
      isExact,
      isClosest,
      isFarthest,
      guessPoints,
      votedPlayerId: p.currentVote,
      votePoints,
      totalRoundPoints
    };
  });

  room.revealData = {
    correctAnswer,
    unit: currentQ.unit,
    curiosity: currentQ.curiosity,
    farthestPlayerIds,
    closestPlayerIds,
    exactPlayerIds
  };

  broadcastRoomState(room);
}

function startQuestionRound(room: InternalRoom) {
  clearRoomTimer(room);
  room.phase = 'QUESTION';
  room.revealData = null;

  // Reset player round inputs
  Object.values(room.players).forEach((p) => {
    p.currentGuess = null;
    p.currentVote = null;
    p.roundStats = undefined;
  });

  const currentQ = room.questions[room.currentQuestionIndex];
  simulateBotGuesses(room, currentQ.answer);

  room.timer = room.settings.questionTimer;
  broadcastRoomState(room);

  room.timerInterval = setInterval(() => {
    room.timer--;
    if (room.timer <= 0) {
      advanceToVoting(room);
    } else {
      io.to(room.code).emit('timer_tick', { timer: room.timer });
    }
  }, 1000);
}

// Socket.io handlers
io.on('connection', (socket: Socket) => {
  let joinedRoomCode: string | null = null;
  let currentPlayerId: string | null = null;

  socket.on('create_room', ({ hostName, avatar, color, hostPlays, settings, customQuestions }) => {
    const code = generateRoomCode();
    joinedRoomCode = code;
    currentPlayerId = socket.id;

    const chosenSettings: RoomSettings = {
      questionTimer: settings?.questionTimer || 30,
      votingTimer: settings?.votingTimer || 20,
      totalQuestions: settings?.totalQuestions || 5,
      hostPlays: hostPlays !== undefined ? hostPlays : true,
      allowBots: true
    };

    let questionsPool: QuestionItem[] = customQuestions && customQuestions.length > 0
      ? customQuestions
      : shuffleArray(DEFAULT_QUESTIONS);

    const questions = questionsPool.slice(0, chosenSettings.totalQuestions);

    const hostPlayer: Player = {
      id: socket.id,
      name: hostName || 'Apresentador',
      avatar: avatar || '👑',
      color: color || '#8b5cf6',
      score: 0,
      isHost: true,
      connected: true,
      currentGuess: null,
      currentVote: null,
      stats: {
        exactGuesses: 0,
        closestGuesses: 0,
        farthestGuesses: 0,
        successfulVotes: 0
      }
    };

    const newRoom: InternalRoom = {
      code,
      hostId: socket.id,
      phase: 'LOBBY',
      players: { [socket.id]: hostPlayer },
      currentQuestionIndex: 0,
      questions,
      settings: chosenSettings,
      timer: 0,
      timerInterval: null,
      revealData: null
    };

    rooms[code] = newRoom;
    socket.join(code);
    socket.emit('room_created', { code, playerId: socket.id });
    broadcastRoomState(newRoom);
  });

  socket.on('join_room', ({ roomCode, playerName, avatar, color, existingPlayerId }) => {
    const code = roomCode?.toUpperCase().trim();
    const room = rooms[code];

    if (!room) {
      socket.emit('error_message', 'Sala não encontrada! Verifique o código digitado.');
      return;
    }

    // Reconnection handling: check if player already exists in room
    let targetPlayerId = socket.id;
    if (existingPlayerId && room.players[existingPlayerId]) {
      const existing = room.players[existingPlayerId];
      // update socket connection
      delete room.players[existingPlayerId];
      existing.id = socket.id;
      existing.connected = true;
      if (existing.isHost) {
        room.hostId = socket.id;
      }
      room.players[socket.id] = existing;
      targetPlayerId = socket.id;
    } else {
      // New player
      const newPlayer: Player = {
        id: socket.id,
        name: playerName?.trim() || `Jogador ${Object.keys(room.players).length + 1}`,
        avatar: avatar || '🤠',
        color: color || '#3b82f6',
        score: 0,
        isHost: false,
        connected: true,
        currentGuess: null,
        currentVote: null,
        stats: {
          exactGuesses: 0,
          closestGuesses: 0,
          farthestGuesses: 0,
          successfulVotes: 0
        }
      };
      room.players[socket.id] = newPlayer;
    }

    joinedRoomCode = code;
    currentPlayerId = targetPlayerId;
    socket.join(code);

    socket.emit('joined_successfully', { code, playerId: targetPlayerId });
    broadcastRoomState(room);
  });

  socket.on('add_bot', ({ roomCode }) => {
    const code = roomCode?.toUpperCase().trim();
    const room = rooms[code];
    if (!room || room.hostId !== socket.id) return;

    const botCount = Object.values(room.players).filter((p) => p.isBot).length;
    const preset = BOT_PRESETS[botCount % BOT_PRESETS.length];
    const botId = `bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const botPlayer: Player = {
      id: botId,
      name: `${preset.name}`,
      avatar: preset.avatar,
      color: preset.color,
      score: 0,
      isHost: false,
      isBot: true,
      connected: true,
      currentGuess: null,
      currentVote: null,
      stats: {
        exactGuesses: 0,
        closestGuesses: 0,
        farthestGuesses: 0,
        successfulVotes: 0
      }
    };

    room.players[botId] = botPlayer;
    broadcastRoomState(room);
  });

  socket.on('remove_player', ({ roomCode, playerId }) => {
    const code = roomCode?.toUpperCase().trim();
    const room = rooms[code];
    if (!room || room.hostId !== socket.id) return;
    if (playerId === room.hostId) return;

    delete room.players[playerId];
    io.to(playerId).emit('kicked');
    broadcastRoomState(room);
  });

  socket.on('update_settings', ({ roomCode, settings }) => {
    const code = roomCode?.toUpperCase().trim();
    const room = rooms[code];
    if (!room || room.hostId !== socket.id) return;

    room.settings = { ...room.settings, ...settings };
    broadcastRoomState(room);
  });

  socket.on('start_game', ({ roomCode, customQuestions }) => {
    const code = roomCode?.toUpperCase().trim();
    const room = rooms[code];
    if (!room || room.hostId !== socket.id) return;

    if (customQuestions && customQuestions.length > 0) {
      room.questions = customQuestions.slice(0, room.settings.totalQuestions);
    } else {
      room.questions = shuffleArray(DEFAULT_QUESTIONS).slice(0, room.settings.totalQuestions);
    }

    room.currentQuestionIndex = 0;
    // Reset all scores
    Object.values(room.players).forEach((p) => {
      p.score = 0;
      p.stats = {
        exactGuesses: 0,
        closestGuesses: 0,
        farthestGuesses: 0,
        successfulVotes: 0
      };
    });

    startQuestionRound(room);
  });

  socket.on('submit_guess', ({ roomCode, guess }) => {
    const code = roomCode?.toUpperCase().trim();
    const room = rooms[code];
    if (!room || room.phase !== 'QUESTION') return;

    const player = room.players[socket.id];
    if (!player) return;

    const numGuess = Number(guess);
    if (!isNaN(numGuess)) {
      player.currentGuess = numGuess;
    }

    broadcastRoomState(room);

    // If all active guessing human players have submitted, fast-forward to voting!
    const activeHumanPlayers = getActiveGuessingPlayers(room).filter((p) => !p.isBot);
    const allAnswered = activeHumanPlayers.length > 0 && activeHumanPlayers.every((p) => p.currentGuess !== null);

    if (allAnswered) {
      advanceToVoting(room);
    }
  });

  socket.on('submit_vote', ({ roomCode, targetPlayerId }) => {
    const code = roomCode?.toUpperCase().trim();
    const room = rooms[code];
    if (!room || room.phase !== 'VOTING') return;

    const player = room.players[socket.id];
    if (!player) return;

    // A player can vote on anyone who submitted a guess
    if (room.players[targetPlayerId] && room.players[targetPlayerId].currentGuess !== null) {
      player.currentVote = targetPlayerId;
    }

    broadcastRoomState(room);

    // If all active guessing human players have voted, fast-forward to reveal!
    const activeHumanPlayers = getActiveGuessingPlayers(room).filter((p) => !p.isBot);
    const allVoted = activeHumanPlayers.length > 0 && activeHumanPlayers.every((p) => p.currentVote !== null);

    if (allVoted) {
      advanceToReveal(room);
    }
  });

  socket.on('next_round', ({ roomCode }) => {
    const code = roomCode?.toUpperCase().trim();
    const room = rooms[code];
    if (!room || room.hostId !== socket.id) return;

    if (room.phase === 'REVEAL') {
      // Move to Leaderboard first
      room.phase = 'LEADERBOARD';
      broadcastRoomState(room);
      return;
    }

    if (room.phase === 'LEADERBOARD') {
      room.currentQuestionIndex++;
      if (room.currentQuestionIndex >= room.questions.length) {
        // Game Over!
        clearRoomTimer(room);
        room.phase = 'GAME_OVER';
        broadcastRoomState(room);
      } else {
        startQuestionRound(room);
      }
    }
  });

  socket.on('play_again', ({ roomCode }) => {
    const code = roomCode?.toUpperCase().trim();
    const room = rooms[code];
    if (!room || room.hostId !== socket.id) return;

    room.phase = 'LOBBY';
    room.currentQuestionIndex = 0;
    room.revealData = null;
    clearRoomTimer(room);

    // Shuffle questions again
    room.questions = shuffleArray(DEFAULT_QUESTIONS).slice(0, room.settings.totalQuestions);

    Object.values(room.players).forEach((p) => {
      p.score = 0;
      p.currentGuess = null;
      p.currentVote = null;
      p.roundStats = undefined;
      p.stats = {
        exactGuesses: 0,
        closestGuesses: 0,
        farthestGuesses: 0,
        successfulVotes: 0
      };
    });

    broadcastRoomState(room);
  });

  socket.on('disconnect', () => {
    if (joinedRoomCode && rooms[joinedRoomCode]) {
      const room = rooms[joinedRoomCode];
      if (room.players[socket.id]) {
        room.players[socket.id].connected = false;
        // If room is empty or host disconnected in lobby, keep for a bit or cleanup
        const connectedCount = Object.values(room.players).filter((p) => p.connected).length;
        if (connectedCount === 0) {
          clearRoomTimer(room);
          delete rooms[joinedRoomCode];
        } else {
          broadcastRoomState(room);
        }
      }
    }
  });
});

// Endpoint to generate custom questions using Gemini AI
app.post('/api/generate-questions', async (req, res) => {
  try {
    const { theme, count = 5 } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: 'Chave GEMINI_API_KEY não configurada. Usando perguntas do catálogo padrão.'
      });
    }

    const ai = new GoogleGenAI();
    const prompt = `Gere exatamente ${count} perguntas de curiosidades com respostas ESTRITAMENTE NUMÉRICAS para um jogo descontraído entre amigos tipo Kahoot.
Tema desejado: "${theme || 'Curiosidades Gerais e Famosos do Brasil'}".
As perguntas devem ser divertidas, instigantes e ter respostas numéricas objetivas (anos, metros, quantidades, idades, km/h, etc.).
Exemplos do estilo do jogo:
- "Qual a altura da Torre de Pisa em metros?" (56)
- "Quantos anos tem Ana Maria Braga?" (77)
- "Quantos ossos tem o corpo humano?" (206)

Retorne EXCLUSIVAMENTE um array JSON no seguinte formato:
[
  {
    "id": "gen1",
    "text": "Texto da pergunta?",
    "answer": 123,
    "unit": "unidade (ex: metros, anos, km/h, etc)",
    "category": "Tema ou Categoria",
    "curiosity": "Curiosidade rápida explicando a resposta"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '[]';
    const parsed = JSON.parse(text);
    return res.json({ questions: parsed });
  } catch (error) {
    console.error('Erro ao gerar perguntas com Gemini:', error);
    return res.status(500).json({
      error: 'Não foi possível gerar perguntas com IA no momento. Usando catálogo padrão.'
    });
  }
});

// Setup Vite in Dev or Static files in Prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || 3000;

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: Number(port)
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server rodando em http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
