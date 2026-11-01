import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Sparkles, Award, Target, Search, AlertTriangle, ArrowRight } from 'lucide-react';
import { GameState, PublicPlayer } from '../types/game.ts';
import { soundFX } from '../utils/audio.ts';

interface GameOverViewProps {
  gameState: GameState;
  myPlayerId: string | null;
  isHost: boolean;
  onPlayAgain: () => void;
  onLeave: () => void;
}

export const GameOverView: React.FC<GameOverViewProps> = ({
  gameState,
  myPlayerId,
  isHost,
  onPlayAgain,
  onLeave
}) => {
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
  const first = sortedPlayers[0];
  const second = sortedPlayers[1];
  const third = sortedPlayers[2];

  // Fire confetti
  useEffect(() => {
    soundFX.playSuccess();
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  // Compute fun awards
  const mostExact = [...gameState.players].sort((a, b) => b.stats.exactGuesses - a.stats.exactGuesses)[0];
  const mostClosest = [...gameState.players].sort((a, b) => b.stats.closestGuesses - a.stats.closestGuesses)[0];
  const bestDetective = [...gameState.players].sort((a, b) => b.stats.successfulVotes - a.stats.successfulVotes)[0];
  const mostFarthest = [...gameState.players].sort((a, b) => b.stats.farthestGuesses - a.stats.farthestGuesses)[0];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-10">
      {/* Top Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-black text-xs uppercase tracking-widest mb-3 animate-bounce">
          <Trophy className="w-4 h-4 text-amber-400" /> Fim de Jogo!
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
          Pódio dos Campeões
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Confira os mestres da precisão e os maiores chutadores da rodada!
        </p>
      </div>

      {/* 3D Olympic Podium */}
      <div className="flex items-end justify-center gap-2 sm:gap-4 mb-10 max-w-xl mx-auto pt-8">
        {/* 2nd Place */}
        {second && (
          <div className="flex-1 flex flex-col items-center">
            <div
              style={{ backgroundColor: second.color }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-xl mb-2 relative"
            >
              {second.avatar}
              <span className="absolute -top-3 text-lg">🥈</span>
            </div>
            <span className="font-bold text-xs sm:text-sm text-white truncate max-w-full text-center">
              {second.name}
            </span>
            <span className="font-display font-black text-base text-slate-300 mb-2">
              {second.score} pts
            </span>
            {/* Podium Block */}
            <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-slate-800 to-slate-700/80 rounded-t-2xl border-t-4 border-slate-400 flex items-center justify-center font-display font-black text-2xl text-slate-400 shadow-xl">
              2º
            </div>
          </div>
        )}

        {/* 1st Place */}
        {first && (
          <div className="flex-1 flex flex-col items-center">
            <div
              style={{ backgroundColor: first.color }}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl shadow-2xl mb-2 relative ring-4 ring-amber-400/40 scale-105"
            >
              {first.avatar}
              <span className="absolute -top-5 text-2xl animate-pulse">👑</span>
            </div>
            <span className="font-display font-black text-sm sm:text-base text-amber-400 truncate max-w-full text-center">
              {first.name}
            </span>
            <span className="font-display font-black text-xl text-amber-300 mb-2">
              {first.score} pts
            </span>
            {/* Podium Block */}
            <div className="w-full h-32 sm:h-36 bg-gradient-to-t from-amber-600/40 via-amber-500/30 to-amber-400/40 rounded-t-2xl border-t-4 border-amber-400 flex flex-col items-center justify-center shadow-2xl">
              <span className="font-display font-black text-3xl text-amber-300">1º</span>
              <span className="text-[10px] font-bold text-amber-200 uppercase tracking-widest">Campeão</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {third && (
          <div className="flex-1 flex flex-col items-center">
            <div
              style={{ backgroundColor: third.color }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-xl mb-2 relative"
            >
              {third.avatar}
              <span className="absolute -top-3 text-lg">🥉</span>
            </div>
            <span className="font-bold text-xs sm:text-sm text-white truncate max-w-full text-center">
              {third.name}
            </span>
            <span className="font-display font-black text-base text-amber-500 mb-2">
              {third.score} pts
            </span>
            {/* Podium Block */}
            <div className="w-full h-16 sm:h-20 bg-gradient-to-t from-slate-800 to-amber-900/30 rounded-t-2xl border-t-4 border-amber-700 flex items-center justify-center font-display font-black text-xl text-amber-600 shadow-xl">
              3º
            </div>
          </div>
        )}
      </div>

      {/* Special Highlights Awards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {/* Most Exact */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div className="truncate">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Mestre da Mira 🎯
            </span>
            <span className="font-bold text-sm text-white truncate block">
              {mostExact?.name || 'Ninguém'}
            </span>
            <span className="text-[11px] text-amber-400">
              {mostExact?.stats.exactGuesses || 0} acertos na mosca
            </span>
          </div>
        </div>

        {/* Most Closest */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="truncate">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Na Trave 🥈
            </span>
            <span className="font-bold text-sm text-white truncate block">
              {mostClosest?.name || 'Ninguém'}
            </span>
            <span className="text-[11px] text-emerald-400">
              {mostClosest?.stats.closestGuesses || 0} vezes mais perto
            </span>
          </div>
        </div>

        {/* Best Detective */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div className="truncate">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Detetive 🕵️
            </span>
            <span className="font-bold text-sm text-white truncate block">
              {bestDetective?.name || 'Ninguém'}
            </span>
            <span className="text-[11px] text-purple-400">
              {bestDetective?.stats.successfulVotes || 0} piores desmascarados
            </span>
          </div>
        </div>

        {/* Farthest */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-500/30 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="truncate">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Chute em Marte 🚀
            </span>
            <span className="font-bold text-sm text-white truncate block">
              {mostFarthest?.name || 'Ninguém'}
            </span>
            <span className="text-[11px] text-rose-400">
              {mostFarthest?.stats.farthestGuesses || 0} vezes o mais longe
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
        {isHost ? (
          <button
            onClick={() => { soundFX.playPop(); onPlayAgain(); }}
            className="w-full sm:flex-1 py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 font-display font-extrabold text-base text-white shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" /> Jogar Novamente
          </button>
        ) : (
          <p className="text-xs text-slate-400 text-center sm:flex-1">
            Aguardando o host iniciar uma nova partida...
          </p>
        )}

        <button
          onClick={() => { soundFX.playPop(); onLeave(); }}
          className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4" /> Menu Principal
        </button>
      </div>
    </div>
  );
};
