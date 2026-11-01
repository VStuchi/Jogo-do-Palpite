import React from 'react';
import { Trophy, ChevronRight, Sparkles, Award } from 'lucide-react';
import { GameState, PublicPlayer } from '../types/game.ts';
import { soundFX } from '../utils/audio.ts';

interface LeaderboardViewProps {
  gameState: GameState;
  myPlayerId: string | null;
  isHost: boolean;
  onNextRound: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  gameState,
  myPlayerId,
  isHost,
  onNextRound
}) => {
  // Sort players by score descending
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
  const maxScore = Math.max(1, sortedPlayers[0]?.score || 1);

  const isLastQuestion = gameState.currentQuestionIndex + 1 >= gameState.totalQuestions;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-10">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 font-bold text-xs uppercase tracking-wider mb-2">
          <Trophy className="w-4 h-4 text-amber-400" /> Placar da Rodada {gameState.currentQuestionIndex + 1} de {gameState.totalQuestions}
        </div>
        <h2 className="font-display font-black text-3xl sm:text-4xl text-white">
          Classificação Geral
        </h2>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3 mb-8">
        {sortedPlayers.map((player, index) => {
          const isMe = player.id === myPlayerId;
          const scorePercent = Math.max(8, (player.score / maxScore) * 100);

          let medalEmoji = `${index + 1}º`;
          let medalBg = 'bg-slate-800 text-slate-300';
          if (index === 0) {
            medalEmoji = '🥇 1º';
            medalBg = 'bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-400/20';
          } else if (index === 1) {
            medalEmoji = '🥈 2º';
            medalBg = 'bg-slate-300 text-slate-900 font-black';
          } else if (index === 2) {
            medalEmoji = '🥉 3º';
            medalBg = 'bg-amber-700/60 text-amber-200 font-black';
          }

          return (
            <div
              key={player.id}
              className={`p-4 rounded-3xl border transition-all ${
                isMe
                  ? 'bg-gradient-to-r from-violet-900/40 to-slate-900 border-violet-500/60 shadow-lg ring-1 ring-violet-500/30'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  {/* Rank badge */}
                  <span className={`px-2.5 py-1 rounded-xl text-xs ${medalBg}`}>
                    {medalEmoji}
                  </span>

                  {/* Avatar */}
                  <div
                    style={{ backgroundColor: player.color }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md shrink-0"
                  >
                    {player.avatar}
                  </div>

                  {/* Name */}
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm sm:text-base text-white truncate">
                        {player.name}
                      </span>
                      {isMe && (
                        <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded">
                          Você
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-2">
                  {player.roundStats && player.roundStats.totalRoundPoints > 0 && (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 animate-bounce">
                      +{player.roundStats.totalRoundPoints}
                    </span>
                  )}
                  <span className="font-display font-black text-xl sm:text-2xl text-amber-400">
                    {player.score} <span className="text-xs text-slate-400 font-sans font-normal">pts</span>
                  </span>
                </div>
              </div>

              {/* Score bar */}
              <div className="w-full bg-slate-950/60 h-2.5 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    index === 0
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                      : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                  }`}
                  style={{ width: `${scorePercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Host Action */}
      <div className="text-center">
        {isHost ? (
          <button
            onClick={() => { soundFX.playPop(); onNextRound(); }}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 font-display font-extrabold text-lg text-white shadow-xl shadow-violet-600/30 inline-flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            {isLastQuestion ? (
              <>
                <span>VER O GRANDE VENCEDOR!</span>
                <Trophy className="w-5 h-5 text-amber-300" />
              </>
            ) : (
              <>
                <span>PRÓXIMA PERGUNTA</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        ) : (
          <p className="text-xs text-slate-400 animate-pulse">
            Aguardando o anfitrião iniciar a próxima pergunta...
          </p>
        )}
      </div>
    </div>
  );
};
