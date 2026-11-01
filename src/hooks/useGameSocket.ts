import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, RoomSettings, QuestionItem } from '../types/game.ts';
import { soundFX } from '../utils/audio.ts';

const SESSION_ROOM_KEY = 'chute_certo_room_code';
const SESSION_PLAYER_KEY = 'chute_certo_player_id';
const SESSION_NAME_KEY = 'chute_certo_player_name';
const SESSION_AVATAR_KEY = 'chute_certo_avatar';
const SESSION_COLOR_KEY = 'chute_certo_color';
const CUSTOM_SERVER_KEY = 'chute_certo_custom_server';

// Default cloud server when hosted on GitHub Pages or static hosts
const DEFAULT_CLOUD_BACKEND = 'https://ais-pre-2spi26a7psauetdvq53kcn-447307753215.us-east1.run.app';

export function getEffectiveBackendUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const custom = localStorage.getItem(CUSTOM_SERVER_KEY);
  if (custom) return custom;
  if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL;

  const hostname = window.location.hostname;
  // If hosted on GitHub Pages, Vercel static, or Netlify, there is no local Node.js WebSocket server
  if (hostname.includes('github.io') || hostname.includes('pages.dev') || hostname.includes('surge.sh')) {
    return DEFAULT_CLOUD_BACKEND;
  }
  return undefined; // Uses window.location.origin by default
}

export function useGameSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [backendUrl, setBackendUrl] = useState<string | undefined>(getEffectiveBackendUrl);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(() => {
    return sessionStorage.getItem(SESSION_PLAYER_KEY);
  });
  const [roomCode, setRoomCode] = useState<string | null>(() => {
    return sessionStorage.getItem(SESSION_ROOM_KEY);
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const url = getEffectiveBackendUrl();
    setIsConnecting(true);

    const socket = url ? io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    }) : io({
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setIsConnecting(false);
      setErrorMessage(null);
      // Auto-reconnect if we have session info
      const savedRoom = sessionStorage.getItem(SESSION_ROOM_KEY);
      const savedPlayerId = sessionStorage.getItem(SESSION_PLAYER_KEY);
      const savedName = sessionStorage.getItem(SESSION_NAME_KEY);
      const savedAvatar = sessionStorage.getItem(SESSION_AVATAR_KEY);
      const savedColor = sessionStorage.getItem(SESSION_COLOR_KEY);

      if (savedRoom && savedName) {
        socket.emit('join_room', {
          roomCode: savedRoom,
          playerName: savedName,
          avatar: savedAvatar || '🤠',
          color: savedColor || '#3b82f6',
          existingPlayerId: savedPlayerId
        });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setIsConnecting(false);
    });

    socket.on('connect_error', (err) => {
      setIsConnecting(false);
      console.warn('Socket connection warning:', err.message);
    });

    socket.on('room_created', ({ code, playerId }: { code: string; playerId: string }) => {
      setRoomCode(code);
      setMyPlayerId(playerId);
      sessionStorage.setItem(SESSION_ROOM_KEY, code);
      sessionStorage.setItem(SESSION_PLAYER_KEY, playerId);
      soundFX.playPop();
    });

    socket.on('joined_successfully', ({ code, playerId }: { code: string; playerId: string }) => {
      setRoomCode(code);
      setMyPlayerId(playerId);
      sessionStorage.setItem(SESSION_ROOM_KEY, code);
      sessionStorage.setItem(SESSION_PLAYER_KEY, playerId);
      soundFX.playPop();
    });

    socket.on('game_state_update', (newGameState: GameState) => {
      setGameState((prev) => {
        // Sound effects based on phase transitions
        if (prev?.phase !== newGameState.phase) {
          if (newGameState.phase === 'QUESTION') {
            soundFX.playPop();
          } else if (newGameState.phase === 'VOTING') {
            soundFX.playWhoosh?.();
          } else if (newGameState.phase === 'REVEAL') {
            soundFX.playReveal();
          } else if (newGameState.phase === 'GAME_OVER') {
            soundFX.playSuccess();
          }
        }
        return newGameState;
      });
    });

    socket.on('timer_tick', ({ timer }: { timer: number }) => {
      setGameState((prev) => (prev ? { ...prev, timer } : null));
      if (timer <= 5 && timer > 0) {
        soundFX.playTick();
      }
    });

    socket.on('error_message', (msg: string) => {
      setErrorMessage(msg);
      soundFX.playBuzzer();
    });

    socket.on('kicked', () => {
      sessionStorage.removeItem(SESSION_ROOM_KEY);
      sessionStorage.removeItem(SESSION_PLAYER_KEY);
      setRoomCode(null);
      setGameState(null);
      setErrorMessage('Você foi desconectado da sala pelo anfitrião.');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = useCallback((
    hostName: string,
    avatar: string,
    color: string,
    hostPlays: boolean,
    settings: Partial<RoomSettings>,
    customQuestions?: QuestionItem[]
  ) => {
    if (!socketRef.current) return;
    sessionStorage.setItem(SESSION_NAME_KEY, hostName);
    sessionStorage.setItem(SESSION_AVATAR_KEY, avatar);
    sessionStorage.setItem(SESSION_COLOR_KEY, color);

    socketRef.current.emit('create_room', {
      hostName,
      avatar,
      color,
      hostPlays,
      settings,
      customQuestions
    });
  }, []);

  const joinRoom = useCallback((
    targetCode: string,
    playerName: string,
    avatar: string,
    color: string
  ) => {
    if (!socketRef.current) return;
    const cleanCode = targetCode.toUpperCase().trim();
    sessionStorage.setItem(SESSION_NAME_KEY, playerName);
    sessionStorage.setItem(SESSION_AVATAR_KEY, avatar);
    sessionStorage.setItem(SESSION_COLOR_KEY, color);

    socketRef.current.emit('join_room', {
      roomCode: cleanCode,
      playerName,
      avatar,
      color
    });
  }, []);

  const addBot = useCallback(() => {
    if (!socketRef.current || !roomCode) return;
    socketRef.current.emit('add_bot', { roomCode });
  }, [roomCode]);

  const removePlayer = useCallback((playerId: string) => {
    if (!socketRef.current || !roomCode) return;
    socketRef.current.emit('remove_player', { roomCode, playerId });
  }, [roomCode]);

  const updateSettings = useCallback((settings: Partial<RoomSettings>) => {
    if (!socketRef.current || !roomCode) return;
    socketRef.current.emit('update_settings', { roomCode, settings });
  }, [roomCode]);

  const startGame = useCallback((customQuestions?: QuestionItem[]) => {
    if (!socketRef.current || !roomCode) return;
    socketRef.current.emit('start_game', { roomCode, customQuestions });
  }, [roomCode]);

  const submitGuess = useCallback((guess: number) => {
    if (!socketRef.current || !roomCode) return;
    soundFX.playPop();
    socketRef.current.emit('submit_guess', { roomCode, guess });
  }, [roomCode]);

  const submitVote = useCallback((targetPlayerId: string) => {
    if (!socketRef.current || !roomCode) return;
    soundFX.playPop();
    socketRef.current.emit('submit_vote', { roomCode, targetPlayerId });
  }, [roomCode]);

  const nextRound = useCallback(() => {
    if (!socketRef.current || !roomCode) return;
    socketRef.current.emit('next_round', { roomCode });
  }, [roomCode]);

  const playAgain = useCallback(() => {
    if (!socketRef.current || !roomCode) return;
    socketRef.current.emit('play_again', { roomCode });
  }, [roomCode]);

  const leaveRoom = useCallback(() => {
    sessionStorage.removeItem(SESSION_ROOM_KEY);
    sessionStorage.removeItem(SESSION_PLAYER_KEY);
    setRoomCode(null);
    setGameState(null);
    setErrorMessage(null);
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const isHost = Boolean(
    gameState && myPlayerId && (gameState.hostId === myPlayerId || gameState.players.find(p => p.id === myPlayerId)?.isHost)
  );

  const me = gameState?.players.find((p) => p.id === myPlayerId);

  const setCustomBackendUrl = useCallback((url: string) => {
    if (!url.trim()) {
      localStorage.removeItem(CUSTOM_SERVER_KEY);
    } else {
      localStorage.setItem(CUSTOM_SERVER_KEY, url.trim());
    }
    window.location.reload();
  }, []);

  return {
    isConnected,
    isConnecting,
    backendUrl,
    setCustomBackendUrl,
    gameState,
    myPlayerId,
    roomCode,
    isHost,
    me,
    errorMessage,
    createRoom,
    joinRoom,
    addBot,
    removePlayer,
    updateSettings,
    startGame,
    submitGuess,
    submitVote,
    nextRound,
    playAgain,
    leaveRoom,
    clearError
  };
}
