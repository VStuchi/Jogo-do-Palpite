import React from 'react';
import { Award, Target, AlertTriangle, Search, ChevronRight, Sparkles, HelpCircle, Check, X } from 'lucide-react';
import { GameState, PublicPlayer } from '../types/game.ts';
import { soundFX } from '../utils/audio.ts';

interface RevealViewProps {
  gameState: GameState;
  myPlayerId: string | null;
  isHost: boolean;
  onNextRound: () => void;
}

export const RevealView: React.FC<RevealViewProps> = ({
  gameState,
  myPlayerId,
  isHost,
  onNextRound
}) => {
  const reveal = gameState.revealData;
  const currentQ = gameState.currentQuestion;
  const players = gameState.players;

  const correctAnswer = reveal?.correctAnswer ?? 0;
  const unit = reveal?.unit || '';
  const curiosity = reveal?.curiosity;

  const exactPlayers = players.filter((p) => reveal?.exactPlayerIds.includes(p.id));
  const closestPlayers = players.filter((p) => reveal?.closestPlayerIds.includes(p.id) && !reveal?.exactPlayerIds.includes(p.id));
  const farthestPlayers = players.filter((p) => reveal?.farthestPlayerIds.includes(p.id));

  // Find detectives who voted for any of the farthest players
  const successfulVoters = players.filter((p) => {
    return p.roundStats && p.roundStats.votePoints > 0;
  });

  const me = players.find((p) => p.id === myPlayerId);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 md:py-8">
      {/* Top Banner: The Real Answer */}
      <div className="bg-gradient-to-br from-amber-500/20 via-violet-900/30 to-slate-900 border-2 border-amber-400/60 rounded-3xl p-6 sm:p-8 text-center shadow-2xl mb-8 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> A Resposta Correta É
        </div>

        <h2 className="font-display font-black text-4xl sm:text-6xl text-white tracking-tight drop-shadow-lg">
          {correctAnswer.toLocaleString('pt-BR')}{' '}
          <span className="text-amber-400 text-2xl sm:text-3xl font-bold">{unit}</span>
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg mx-auto">
          Pergunta: <strong className="text-white">"{currentQ?.text}"</strong>
        </p>

        {curiosity && (
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-amber-200/90 max-w-xl mx-auto">
            💡 <strong className="text-white">Curiosidade:</strong> {curiosity}
          </div>
        )}
      </div>

      {/* Round Highlights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Exact or Closest */}
        <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm mb-3">
              <Target className="w-5 h-5 text-emerald-400" />
              {exactPlayers.length > 0 ? 'Na Mosca! (+3 pts)' : 'Mais Perto! (+2 pts)'}
            </div>

            {exactPlayers.length > 0 ? (
              <div className="space-y-2">
                {exactPlayers.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 bg-emerald-950/40 p-2 rounded-xl">
                    <span className="text-xl">{p.avatar}</span>
                    <div className="truncate">
                      <span className="font-bold text-white text-xs block truncate">{p.name}</span>
                      <span className="text-[10px] text-emerald-300 font-black">Acertou em cheio! 🎯</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : closestPlayers.length > 0 ? (
              <div className="space-y-2">
                {closestPlayers.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 bg-emerald-950/40 p-2 rounded-xl">
                    <span className="text-xl">{p.avatar}</span>
                    <div className="truncate">
                      <span className="font-bold text-white text-xs block truncate">{p.name}</span>
                      <span className="text-[10px] text-emerald-300 font-semibold">
                        Chutou {p.revealedGuess} (dif: {p.roundStats?.distance} {unit})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Nenhum palpite nesta categoria</p>
            )}
          </div>
          <span className="text-[11px] text-emerald-400/80 font-medium mt-3 block">
            {exactPlayers.length > 0 ? 'Pontuação máxima de chute!' : 'Menor distância da verdade!'}
          </span>
        </div>

        {/* Farthest (Pior Chute) */}
        <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm mb-3">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Pior Chute da Rodada 🤡
            </div>

            {farthestPlayers.length > 0 ? (
              <div className="space-y-2">
                {farthestPlayers.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 bg-rose-950/40 p-2 rounded-xl">
                    <span className="text-xl">{p.avatar}</span>
                    <div className="truncate">
                      <span className="font-bold text-white text-xs block truncate">{p.name}</span>
                      <span className="text-[10px] text-rose-300 font-semibold">
                        Chutou {p.revealedGuess} (dif: {p.roundStats?.distance} {unit})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Ninguém ficou isolado no pior palpite</p>
            )}
          </div>
          <span className="text-[11px] text-rose-400/80 font-medium mt-3 block">
            Chutou na estratosfera (0 pts no palpite)!
          </span>
        </div>

        {/* Successful Detectives (Voto no Pior) */}
        <div className="p-5 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-purple-300 font-bold text-sm mb-3">
              <Search className="w-5 h-5 text-purple-400" />
              Faro de Detetive (+1 pt)
            </div>

            {successfulVoters.length > 0 ? (
              <div className="space-y-2">
                {successfulVoters.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 bg-purple-950/40 p-2 rounded-xl">
                    <span className="text-xl">{p.avatar}</span>
                    <div className="truncate">
                      <span className="font-bold text-white text-xs block truncate">{p.name}</span>
                      <span className="text-[10px] text-purple-300 font-semibold">
                        Apostou certo no pior chute! 🕵️
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Ninguém conseguiu adivinhar o pior palpite!</p>
            )}
          </div>
          <span className="text-[11px] text-purple-400/80 font-medium mt-3 block">
            Acertou quem daria a pior viajada!
          </span>
        </div>
      </div>

      {/* Complete Round Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 mb-8 shadow-xl">
        <h3 className="font-bold text-white text-base mb-4 flex items-center justify-between">
          <span>Detalhamento dos Pontos desta Rodada</span>
          <span className="text-xs text-slate-400 font-normal hidden sm:inline">
            Chute (até +3) + Aposta no Pior (+1)
          </span>
        </h3>

        <div className="space-y-2.5">
          {players.map((p) => {
            const stats = p.roundStats;
            const isMe = p.id === myPlayerId;
            const votedForPlayer = players.find((target) => target.id === stats?.votedPlayerId);

            return (
              <div
                key={p.id}
                className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isMe
                    ? 'bg-amber-400/10 border-amber-400/40 ring-1 ring-amber-400/20'
                    : 'bg-slate-850/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    style={{ backgroundColor: p.color }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md shrink-0"
                  >
                    {p.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white">{p.name}</span>
                      {isMe && (
                        <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-1 rounded">
                          Você
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                      <span>
                        Chutou: <strong className="text-amber-400">{stats?.guess ?? 'Nenhum'}</strong> {unit}
                      </span>
                      {stats?.distance !== null && stats?.distance !== undefined && (
                        <span className="text-slate-500">
                          (distância: {stats.distance.toLocaleString('pt-BR')} {unit})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score breakdown tags */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {/* Guess badge */}
                  {stats?.isExact ? (
                    <span className="px-2 py-1 rounded-xl bg-amber-400/20 text-amber-300 font-bold text-xs border border-amber-400/30">
                      🎯 Exato (+3)
                    </span>
                  ) : stats?.isClosest ? (
                    <span className="px-2 py-1 rounded-xl bg-emerald-400/20 text-emerald-300 font-bold text-xs border border-emerald-400/30">
                      🥈 Perto (+2)
                    </span>
                  ) : stats?.isFarthest ? (
                    <span className="px-2 py-1 rounded-xl bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/30">
                      🤡 Mais Longe (0)
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-xl bg-slate-800 text-slate-400 font-medium text-xs">
                      Chute (0)
                    </span>
                  )}

                  {/* Vote badge */}
                  {stats?.votePoints && stats.votePoints > 0 ? (
                    <span className="px-2 py-1 rounded-xl bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30" title={`Apostou em ${votedForPlayer?.name}`}>
                      🕵️ Acertou Pior (+1)
                    </span>
                  ) : votedForPlayer ? (
                    <span className="px-2 py-1 rounded-xl bg-slate-800 text-slate-500 text-xs" title={`Votou em ${votedForPlayer.name}`}>
                      Errou aposta (0)
                    </span>
                  ) : null}

                  {/* Total Round Earned */}
                  <div className="px-3 py-1 rounded-xl bg-violet-600 text-white font-display font-black text-sm shadow-md ml-1">
                    +{stats?.totalRoundPoints ?? 0} pts
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Host Controls */}
      <div className="text-center">
        {isHost ? (
          <button
            onClick={() => { soundFX.playPop(); onNextRound(); }}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 font-display font-extrabold text-lg text-white shadow-xl shadow-violet-600/30 inline-flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Ver Classificação Geral</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <p className="text-xs text-slate-400 animate-pulse">
            Aguardando o anfitrião avançar para a classificação geral...
          </p>
        )}
      </div>
    </div>
  );
};
