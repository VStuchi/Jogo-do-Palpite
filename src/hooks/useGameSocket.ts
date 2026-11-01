import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, RoomSettings, QuestionItem } from '../types/game.ts';
import { soundFX } from '../utils/audio.ts';
import { P2PGameHost, P2PGameClient } from '../services/peerService.ts';

const SESSION_ROOM_KEY = 'chute_certo_room_code';
const SESSION_PLAYER_KEY = 'chute_certo_player_id';
const SESSION_NAME_KEY = 'chute_certo_player_name';
const SESSION_AVATAR_KEY = 'chute_certo_avatar';
const SESSION_COLOR_KEY = 'chute_certo_color';
const CUSTOM_SERVER_KEY = 'chute_certo_custom_server';
const USE_P2P_KEY = 'chute_certo_use_p2p';

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
  const p2pHostRef = useRef<P2PGameHost | null>(null);
  const p2pClientRef = useRef<P2PGameClient | null>(null);

  const [isP2P, setIsP2P] = useState<boolean>(() => {
    return localStorage.getItem(USE_P2P_KEY) === 'true';
  });
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
    sessionStorage.setItem(SESSION_NAME_KEY, hostName);
    sessionStorage.setItem(SESSION_AVATAR_KEY, avatar);
    sessionStorage.setItem(SESSION_COLOR_KEY, color);

    if (isP2P || !isConnected) {
      // P2P WebRTC Host mode: The notebook browser IS the server!
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));

      p2pHostRef.current = new P2PGameHost(
        code,
        { name: hostName, avatar, color, hostPlays },
        settings,
        customQuestions,
        (newState) => {
          setGameState(newState);
        }
      );

      setRoomCode(code);
      setMyPlayerId('host');
      sessionStorage.setItem(SESSION_ROOM_KEY, code);
      sessionStorage.setItem(SESSION_PLAYER_KEY, 'host');
      soundFX.playPop();
      return;
    }

    if (!socketRef.current) return;
    socketRef.current.emit('create_room', {
      hostName,
      avatar,
      color,
      hostPlays,
      settings,
      customQuestions
    });
  }, [isP2P, isConnected]);

  const joinRoom = useCallback((
    targetCode: string,
    playerName: string,
    avatar: string,
    color: string
  ) => {
    const cleanCode = targetCode.toUpperCase().trim();
    sessionStorage.setItem(SESSION_NAME_KEY, playerName);
    sessionStorage.setItem(SESSION_AVATAR_KEY, avatar);
    sessionStorage.setItem(SESSION_COLOR_KEY, color);

    if (isP2P || !isConnected) {
      // P2P WebRTC Client mode: Phone connects directly to the notebook host!
      p2pClientRef.current = new P2PGameClient(
        cleanCode,
        playerName,
        avatar,
        color,
        (newState) => {
          setGameState(newState);
        },
        (err) => {
          setErrorMessage(err);
          soundFX.playBuzzer();
        },
        (myId) => {
          setMyPlayerId(myId);
          sessionStorage.setItem(SESSION_PLAYER_KEY, myId);
        }
      );

      setRoomCode(cleanCode);
      sessionStorage.setItem(SESSION_ROOM_KEY, cleanCode);
      soundFX.playPop();
      return;
    }

    if (!socketRef.current) return;
    socketRef.current.emit('join_room', {
      roomCode: cleanCode,
      playerName,
      avatar,
      color
    });
  }, [isP2P, isConnected]);

  const addBot = useCallback(() => {
    if (p2pHostRef.current) {
      p2pHostRef.current.addBot();
      soundFX.playPop();
      return;
    }
    if (!socketRef.current || !roomCode) return;
    socketRef.current.emit('add_bot', { roomCode });
  }, [roomCode]);

  const removePlayer = useCallback((playerId: string) => {
    if (p2pHostRef.current) {
      p2pHostRef.current.removePlayer(playerId);
      return;
    }
    if (!socketRef.current || !roomCode) return;
    socketRef.current.emit('remove_player', { roomCode, playerId });
  }, [roomCode]);

  const updateSettings = useCallback((settings: Partial<RoomSettings>) => {
    if (!socketRef.current || !roomCode) return;
    socketRef.current.emit('update_settings', { roomCode, settings });
  }, [roomCode]);

  const startGame = useCallback((customQuestions?: QuestionItem[]) => {
    if (p2pHostRef.current) {
      p2pHostRef.current.startGame();
      soundFX.playSuccess();
      return;
    }
    if (!socketRef.current || !roomCode) return;
    socketRef.current.emit('start_game', { roomCode, customQuestions });
  }, [roomCode]);

  const submitGuess = useCallback((guess: number) => {
    soundFX.playPop();
    if (p2pHostRef.current) {
      p2pHostRef.current.submitHostGuess(guess);
      return;
    }
    if (p2pClientRef.current) {
      p2pClientRef.current.sendGuess(guess);
      return;
    }
    if (!socketRef.current || !roomCode) return;
    socketRef.current.emit('submit_guess', { roomCode, guess });
  }, [roomCode]);

  const submitVote = useCallback((targetPlayerId: string) => {
    soundFX.playPop();
    if (p2pHostRef.current) {
      p2pHostRef.current.submitHostVote(targetPlayerId);
      return;
    }
    if (p2pClientRef.current) {
      p2pClientRef.current.sendVote(targetPlayerId);
      return;
    }
    if (!socketRef.current || !roomCode) return;
    socketRef.current.emit('submit_vote', { roomCode, targetPlayerId });
  }, [roomCode]);

  const nextRound = useCallback(() => {
    if (p2pHostRef.current) {
      p2pHostRef.current.nextRound();
      soundFX.playPop();
      return;
    }
    if (!socketRef.current || !roomCode) return;
    socketRef.current.emit('next_round', { roomCode });
  }, [roomCode]);

  const playAgain = useCallback(() => {
    if (p2pHostRef.current) {
      p2pHostRef.current.playAgain();
      return;
    }
    if (!socketRef.current || !roomCode) return;
    socketRef.current.emit('play_again', { roomCode });
  }, [roomCode]);

  const leaveRoom = useCallback(() => {
    if (p2pHostRef.current) {
      p2pHostRef.current.destroy();
      p2pHostRef.current = null;
    }
    if (p2pClientRef.current) {
      p2pClientRef.current.destroy();
      p2pClientRef.current = null;
    }
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

  const toggleP2P = useCallback(() => {
    const next = !isP2P;
    setIsP2P(next);
    localStorage.setItem(USE_P2P_KEY, String(next));
  }, [isP2P]);

  return {
    isConnected,
    isConnecting,
    isP2P,
    toggleP2P,
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
