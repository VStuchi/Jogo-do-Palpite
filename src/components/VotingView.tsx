import React, { useState } from 'react';
import { Clock, Search, AlertTriangle, CheckCircle, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { GameState, PublicPlayer } from '../types/game.ts';
import { soundFX } from '../utils/audio.ts';

interface VotingViewProps {
  gameState: GameState;
  myPlayerId: string | null;
  isHost: boolean;
  onSubmitVote: (targetPlayerId: string) => void;
}

export const VotingView: React.FC<VotingViewProps> = ({
  gameState,
  myPlayerId,
  isHost,
  onSubmitVote
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

  const currentQ = gameState.currentQuestion;
  const timer = gameState.timer;
  const maxTimer = gameState.settings.votingTimer;
  const progressPercent = Math.max(0, Math.min(100, (timer / maxTimer) * 100));

  const me = gameState.players.find((p) => p.id === myPlayerId);
  const hostPlays = gameState.settings.hostPlays;
  const isPlaying = me && (!me.isHost || hostPlays);

  const handleVote = (targetPlayerId: string) => {
    soundFX.playPop();
    setSelectedTargetId(targetPlayerId);
    onSubmitVote(targetPlayerId);
  };

  const eligibleTargets = gameState.players.filter((p) => p.revealedGuess !== undefined);
  const activeVoters = gameState.players.filter((p) => !p.isHost || hostPlays);
  const votedCount = activeVoters.filter((p) => p.hasVoted).length;

  const votedTargetPlayer = eligibleTargets.find((p) => p.id === selectedTargetId);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 md:py-8">
      {/* Timer & Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 font-bold text-xs flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" /> Fase de Votação do Pior Chute
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 font-mono font-black text-lg text-amber-400">
          <Clock className="w-4 h-4" />
          <span>{timer}s</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-2 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-fuchsia-500 transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Instructions Banner */}
      <div className="bg-gradient-to-r from-fuchsia-950/70 via-purple-900/60 to-slate-900 border border-fuchsia-500/40 rounded-3xl p-6 text-center shadow-xl mb-6 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" /> +1 Ponto se você acertar o pior palpiteiro!
        </div>

        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
          Quem chutou mais longe da realidade? 🤡
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-1">
          Analise os palpites de todos para a pergunta:{' '}
          <strong className="text-white">"{currentQ?.text}"</strong>. Clique no jogador que você acha que viajou na maionese!
        </p>

        {selectedTargetId && (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-fuchsia-600/30 border border-fuchsia-400 text-fuchsia-200 text-xs sm:text-sm font-bold animate-pulse">
            <CheckCircle className="w-4 h-4 text-fuchsia-400" />
            Você apostou em: {votedTargetPlayer?.name} ({votedTargetPlayer?.revealedGuess} {currentQ?.unit})!
          </div>
        )}
      </div>

      {/* Players Guesses Cards / Voting Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {eligibleTargets.map((player) => {
          const isMe = player.id === myPlayerId;
          const isSelectedByMe = selectedTargetId === player.id;
          const canVoteOnThis = isPlaying && !isMe;

          return (
            <div
              key={player.id}
              onClick={() => {
                if (canVoteOnThis) handleVote(player.id);
              }}
              className={`p-5 rounded-3xl border transition-all relative flex flex-col justify-between ${
                isSelectedByMe
                  ? 'bg-fuchsia-600/20 border-fuchsia-400 ring-4 ring-fuchsia-500/30 shadow-xl scale-[1.02]'
                  : canVoteOnThis
                  ? 'bg-slate-900/90 border-slate-700/80 hover:border-fuchsia-500/60 hover:bg-slate-800/80 cursor-pointer shadow-lg'
                  : 'bg-slate-900/50 border-slate-800 opacity-90'
              }`}
            >
              {/* Top row */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    style={{ backgroundColor: player.color }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md shrink-0"
                  >
                    {player.avatar}
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-sm text-white block truncate">
                      {player.name}
                    </span>
                    {isMe && (
                      <span className="text-[10px] font-bold text-amber-400">
                        (Seu palpite)
                      </span>
                    )}
                  </div>
                </div>

                {isSelectedByMe && (
                  <span className="px-2.5 py-1 rounded-xl bg-fuchsia-500 text-white font-bold text-xs flex items-center gap-1 shadow-md">
                    <CheckCircle className="w-3.5 h-3.5" /> Escolhido
                  </span>
                )}
              </div>

              {/* The Revealed Numerical Guess */}
              <div className="py-3 px-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center my-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Chutou:
                </span>
                <span className="font-display font-black text-2xl sm:text-3xl text-amber-400">
                  {player.revealedGuess !== null && player.revealedGuess !== undefined
                    ? player.revealedGuess.toLocaleString('pt-BR')
                    : 'Sem palpite'}
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  {currentQ?.unit}
                </span>
              </div>

              {/* Action / Tag */}
              <div className="mt-3 pt-2 text-center border-t border-slate-800/60">
                {isMe ? (
                  <span className="text-[11px] text-slate-500 font-medium">
                    Você não pode votar em si mesmo
                  </span>
                ) : isPlaying ? (
                  <span className={`text-xs font-bold transition-colors ${
                    isSelectedByMe ? 'text-fuchsia-300' : 'text-slate-400 group-hover:text-white'
                  }`}>
                    {isSelectedByMe ? '🎯 Seu voto está nele(a)' : '👉 Clique para votar nele(a)'}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500">Palpite do jogador</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Voters Status */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center max-w-md mx-auto">
        <span className="text-xs font-semibold text-slate-300 flex items-center justify-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          {votedCount} de {activeVoters.length} jogadores já votaram
        </span>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Quando todos votarem (ou o tempo zerar), veremos a resposta real e os vencedores!
        </p>
      </div>
    </div>
  );
};
