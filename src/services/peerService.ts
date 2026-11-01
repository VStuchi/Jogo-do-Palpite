import { Peer, DataConnection } from 'peerjs';
import { GameState, PublicPlayer, QuestionItem, RoomSettings, RevealData } from '../types/game.ts';
import { DEFAULT_QUESTIONS } from '../data/defaultQuestions.ts';

// PeerJS room prefix to avoid collisions on free public broker
const PEER_PREFIX = 'chutecerto-sala-';

export class P2PGameHost {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private state: GameState;
  private questions: QuestionItem[] = [];
  private onStateChange: (state: GameState) => void;
  private timerInterval: NodeJS.Timeout | null = null;

  constructor(
    roomCode: string,
    hostPlayer: { name: string; avatar: string; color: string; hostPlays: boolean },
    settings: Partial<RoomSettings>,
    customQuestions: QuestionItem[] | undefined,
    onStateChange: (state: GameState) => void
  ) {
    this.onStateChange = onStateChange;

    const fullSettings: RoomSettings = {
      questionTimer: settings.questionTimer || 30,
      votingTimer: settings.votingTimer || 20,
      totalQuestions: settings.totalQuestions || 5,
      hostPlays: hostPlayer.hostPlays !== undefined ? hostPlayer.hostPlays : true,
      allowBots: true
    };

    const qPool = customQuestions && customQuestions.length > 0
      ? customQuestions
      : [...DEFAULT_QUESTIONS].sort(() => 0.5 - Math.random());
    this.questions = qPool.slice(0, fullSettings.totalQuestions);

    const initialHost: PublicPlayer = {
      id: 'host',
      name: hostPlayer.name || 'Apresentador',
      avatar: hostPlayer.avatar || '👑',
      color: hostPlayer.color || '#8b5cf6',
      score: 0,
      isHost: true,
      connected: true,
      hasGuessed: false,
      hasVoted: false,
      stats: {
        exactGuesses: 0,
        closestGuesses: 0,
        farthestGuesses: 0,
        successfulVotes: 0
      }
    };

    this.state = {
      code: roomCode,
      phase: 'LOBBY',
      players: [initialHost],
      currentQuestionIndex: 0,
      totalQuestions: this.questions.length,
      currentQuestion: null,
      revealData: null,
      timer: 0,
      hostId: 'host',
      settings: fullSettings
    };

    this.initPeer(roomCode);
  }

  private initPeer(code: string) {
    const peerId = `${PEER_PREFIX}${code.toLowerCase()}`;
    this.peer = new Peer(peerId, {
      debug: 1
    });

    this.peer.on('open', () => {
      this.broadcastState();
    });

    this.peer.on('connection', (conn) => {
      conn.on('open', () => {
        this.connections.set(conn.peer, conn);
        // Send initial state to newly joined peer
        conn.send({ type: 'STATE', payload: this.state });
      });

      conn.on('data', (data: any) => {
        this.handlePeerMessage(conn.peer, data);
      });

      conn.on('close', () => {
        this.connections.delete(conn.peer);
        const player = this.state.players.find((p) => p.id === conn.peer);
        if (player) {
          player.connected = false;
          this.broadcastState();
        }
      });
    });

    this.peer.on('error', (err) => {
      console.warn('P2P Host Error:', err);
    });
  }

  private handlePeerMessage(senderId: string, msg: { type: string; payload: any }) {
    if (!msg || !msg.type) return;

    if (msg.type === 'JOIN') {
      const existing = this.state.players.find((p) => p.id === senderId);
      if (existing) {
        existing.connected = true;
      } else {
        const newPlayer: PublicPlayer = {
          id: senderId,
          name: msg.payload.name || `Jogador ${this.state.players.length + 1}`,
          avatar: msg.payload.avatar || '🤠',
          color: msg.payload.color || '#3b82f6',
          score: 0,
          isHost: false,
          connected: true,
          hasGuessed: false,
          hasVoted: false,
          stats: { exactGuesses: 0, closestGuesses: 0, farthestGuesses: 0, successfulVotes: 0 }
        };
        this.state.players.push(newPlayer);
      }
      this.broadcastState();
    } else if (msg.type === 'GUESS') {
      const player = this.state.players.find((p) => p.id === senderId);
      if (player && this.state.phase === 'QUESTION') {
        player.revealedGuess = Number(msg.payload.guess);
        player.hasGuessed = true;
        this.broadcastState();
        this.checkAllGuessed();
      }
    } else if (msg.type === 'VOTE') {
      const player = this.state.players.find((p) => p.id === senderId);
      if (player && this.state.phase === 'VOTING') {
        player.roundStats = {
          ...(player.roundStats || {
            guess: player.revealedGuess ?? null,
            distance: null,
            isExact: false,
            isClosest: false,
            isFarthest: false,
            guessPoints: 0,
            votePoints: 0,
            totalRoundPoints: 0
          }),
          votedPlayerId: msg.payload.targetPlayerId
        };
        player.hasVoted = true;
        this.broadcastState();
        this.checkAllVoted();
      }
    }
  }

  public submitHostGuess(guess: number) {
    const host = this.state.players.find((p) => p.isHost);
    if (host && this.state.phase === 'QUESTION') {
      host.revealedGuess = guess;
      host.hasGuessed = true;
      this.broadcastState();
      this.checkAllGuessed();
    }
  }

  public submitHostVote(targetPlayerId: string) {
    const host = this.state.players.find((p) => p.isHost);
    if (host && this.state.phase === 'VOTING') {
      host.roundStats = {
        ...(host.roundStats || {
          guess: host.revealedGuess ?? null,
          distance: null,
          isExact: false,
          isClosest: false,
          isFarthest: false,
          guessPoints: 0,
          votePoints: 0,
          totalRoundPoints: 0
        }),
        votedPlayerId: targetPlayerId
      };
      host.hasVoted = true;
      this.broadcastState();
      this.checkAllVoted();
    }
  }

  public addBot() {
    const botId = `bot_${Date.now()}`;
    const botIndex = this.state.players.filter((p) => p.isBot).length;
    const botPresets = [
      { name: 'Tio do Zap 🥩', color: '#f59e0b', avatar: '👴' },
      { name: 'Robozinho 🤖', color: '#06b6d4', avatar: '🤖' },
      { name: 'Rainha do Chute 👑', color: '#ec4899', avatar: '👑' }
    ];
    const preset = botPresets[botIndex % botPresets.length];

    this.state.players.push({
      id: botId,
      name: preset.name,
      avatar: preset.avatar,
      color: preset.color,
      score: 0,
      isHost: false,
      isBot: true,
      connected: true,
      hasGuessed: false,
      hasVoted: false,
      stats: { exactGuesses: 0, closestGuesses: 0, farthestGuesses: 0, successfulVotes: 0 }
    });
    this.broadcastState();
  }

  public removePlayer(playerId: string) {
    this.state.players = this.state.players.filter((p) => p.id !== playerId);
    const conn = this.connections.get(playerId);
    if (conn) {
      conn.send({ type: 'KICKED' });
      conn.close();
      this.connections.delete(playerId);
    }
    this.broadcastState();
  }

  public startGame() {
    this.state.currentQuestionIndex = 0;
    this.state.players.forEach((p) => {
      p.score = 0;
      p.stats = { exactGuesses: 0, closestGuesses: 0, farthestGuesses: 0, successfulVotes: 0 };
    });
    this.startQuestionRound();
  }

  private startQuestionRound() {
    this.clearTimer();
    this.state.phase = 'QUESTION';
    this.state.revealData = null;

    const currentQ = this.questions[this.state.currentQuestionIndex];
    this.state.currentQuestion = {
      id: currentQ.id,
      text: currentQ.text,
      unit: currentQ.unit,
      category: currentQ.category
    };

    this.state.players.forEach((p) => {
      p.hasGuessed = false;
      p.hasVoted = false;
      p.revealedGuess = undefined;
      p.roundStats = undefined;
    });

    // Simulate bot guesses
    this.state.players.filter((p) => p.isBot).forEach((bot) => {
      const variation = Math.round(currentQ.answer * (Math.random() * 0.4 - 0.2));
      bot.revealedGuess = Math.max(1, currentQ.answer + variation);
      bot.hasGuessed = true;
    });

    this.state.timer = this.state.settings.questionTimer;
    this.broadcastState();

    this.timerInterval = setInterval(() => {
      this.state.timer--;
      if (this.state.timer <= 0) {
        this.advanceToVoting();
      } else {
        this.broadcastTimer(this.state.timer);
      }
    }, 1000);
  }

  private checkAllGuessed() {
    const active = this.state.players.filter((p) => (!p.isHost || this.state.settings.hostPlays) && !p.isBot && p.connected);
    if (active.length > 0 && active.every((p) => p.hasGuessed)) {
      this.advanceToVoting();
    }
  }

  private advanceToVoting() {
    this.clearTimer();
    this.state.phase = 'VOTING';

    // Default missing guesses to 0
    this.state.players.forEach((p) => {
      if (p.revealedGuess === undefined) {
        p.revealedGuess = 0;
        p.hasGuessed = true;
      }
    });

    // Simulate bot votes
    const eligible = this.state.players.filter((p) => p.revealedGuess !== undefined);
    this.state.players.filter((p) => p.isBot).forEach((bot) => {
      const candidates = eligible.filter((c) => c.id !== bot.id);
      if (candidates.length > 0) {
        const choice = candidates[Math.floor(Math.random() * candidates.length)];
        bot.roundStats = {
          guess: bot.revealedGuess ?? null,
          distance: null,
          isExact: false,
          isClosest: false,
          isFarthest: false,
          guessPoints: 0,
          votedPlayerId: choice.id,
          votePoints: 0,
          totalRoundPoints: 0
        };
        bot.hasVoted = true;
      }
    });

    this.state.timer = this.state.settings.votingTimer;
    this.broadcastState();

    this.timerInterval = setInterval(() => {
      this.state.timer--;
      if (this.state.timer <= 0) {
        this.advanceToReveal();
      } else {
        this.broadcastTimer(this.state.timer);
      }
    }, 1000);
  }

  private checkAllVoted() {
    const active = this.state.players.filter((p) => (!p.isHost || this.state.settings.hostPlays) && !p.isBot && p.connected);
    if (active.length > 0 && active.every((p) => p.hasVoted)) {
      this.advanceToReveal();
    }
  }

  private advanceToReveal() {
    this.clearTimer();
    this.state.phase = 'REVEAL';

    const currentQ = this.questions[this.state.currentQuestionIndex];
    const correct = currentQ.answer;

    let minDiff = Infinity;
    let maxDiff = -Infinity;
    const diffs: Record<string, number> = {};

    this.state.players.forEach((p) => {
      const guess = p.revealedGuess ?? 0;
      const diff = Math.abs(guess - correct);
      diffs[p.id] = diff;
      if (diff < minDiff) minDiff = diff;
      if (diff > maxDiff) maxDiff = diff;
    });

    const exactPlayerIds: string[] = [];
    const closestPlayerIds: string[] = [];
    const farthestPlayerIds: string[] = [];

    this.state.players.forEach((p) => {
      const diff = diffs[p.id];
      if (p.revealedGuess === correct) exactPlayerIds.push(p.id);
      if (diff === minDiff) closestPlayerIds.push(p.id);
      if (diff === maxDiff && (minDiff !== maxDiff || this.state.players.length > 1)) {
        farthestPlayerIds.push(p.id);
      }
    });

    // Apply scoring rules
    this.state.players.forEach((p) => {
      const isExact = exactPlayerIds.includes(p.id);
      const isClosest = closestPlayerIds.includes(p.id);
      const isFarthest = farthestPlayerIds.includes(p.id);

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

      let votePoints = 0;
      const votedTarget = p.roundStats?.votedPlayerId;
      if (votedTarget && farthestPlayerIds.includes(votedTarget)) {
        votePoints = 1;
        p.stats.successfulVotes++;
      }

      const totalRoundPoints = guessPoints + votePoints;
      p.score += totalRoundPoints;

      p.roundStats = {
        guess: p.revealedGuess ?? null,
        distance: diffs[p.id] ?? null,
        isExact,
        isClosest,
        isFarthest,
        guessPoints,
        votedPlayerId: votedTarget ?? null,
        votePoints,
        totalRoundPoints
      };
    });

    this.state.revealData = {
      correctAnswer: correct,
      unit: currentQ.unit,
      curiosity: currentQ.curiosity,
      exactPlayerIds,
      closestPlayerIds,
      farthestPlayerIds
    };

    this.broadcastState();
  }

  public nextRound() {
    if (this.state.phase === 'REVEAL') {
      this.state.phase = 'LEADERBOARD';
      this.broadcastState();
    } else if (this.state.phase === 'LEADERBOARD') {
      this.state.currentQuestionIndex++;
      if (this.state.currentQuestionIndex >= this.questions.length) {
        this.clearTimer();
        this.state.phase = 'GAME_OVER';
        this.broadcastState();
      } else {
        this.startQuestionRound();
      }
    }
  }

  public playAgain() {
    this.startGame();
  }

  private clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private broadcastState() {
    this.onStateChange({ ...this.state });
    const payload = { type: 'STATE', payload: this.state };
    this.connections.forEach((conn) => {
      try {
        conn.send(payload);
      } catch {}
    });
  }

  private broadcastTimer(timer: number) {
    this.onStateChange({ ...this.state, timer });
    const payload = { type: 'TIMER', payload: timer };
    this.connections.forEach((conn) => {
      try {
        conn.send(payload);
      } catch {}
    });
  }

  public destroy() {
    this.clearTimer();
    this.connections.forEach((conn) => conn.close());
    this.connections.clear();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}

// Client connecting to Host peer
export class P2PGameClient {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;
  private currentState: GameState | null = null;
  private onStateChange: (state: GameState) => void;
  private onError: (err: string) => void;
  private onJoined?: (myPeerId: string) => void;

  constructor(
    roomCode: string,
    playerName: string,
    avatar: string,
    color: string,
    onStateChange: (state: GameState) => void,
    onError: (err: string) => void,
    onJoined?: (myPeerId: string) => void
  ) {
    this.onStateChange = onStateChange;
    this.onError = onError;
    this.onJoined = onJoined;

    this.peer = new Peer();

    this.peer.on('open', (myPeerId) => {
      if (this.onJoined) {
        this.onJoined(myPeerId);
      }
      const targetHostId = `${PEER_PREFIX}${roomCode.toLowerCase().trim()}`;
      const conn = this.peer!.connect(targetHostId, {
        reliable: true
      });

      this.connection = conn;

      conn.on('open', () => {
        conn.send({
          type: 'JOIN',
          payload: { name: playerName, avatar, color }
        });
      });

      conn.on('data', (data: any) => {
        if (!data || !data.type) return;
        if (data.type === 'STATE') {
          this.currentState = data.payload;
          this.onStateChange(data.payload);
        } else if (data.type === 'TIMER') {
          if (this.currentState) {
            this.currentState = { ...this.currentState, timer: data.payload };
            this.onStateChange(this.currentState);
          }
        } else if (data.type === 'KICKED') {
          this.onError('Você foi desconectado pelo anfitrião.');
        }
      });

      conn.on('error', (err) => {
        this.onError('Erro na conexão com a sala: ' + err.message);
      });
    });

    this.peer.on('error', (err) => {
      this.onError('Não foi possível encontrar a sala no modo P2P. Verifique o código digitado.');
    });
  }

  public sendGuess(guess: number) {
    if (this.connection) {
      this.connection.send({ type: 'GUESS', payload: { guess } });
    }
  }

  public sendVote(targetPlayerId: string) {
    if (this.connection) {
      this.connection.send({ type: 'VOTE', payload: { targetPlayerId } });
    }
  }

  public destroy() {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}
