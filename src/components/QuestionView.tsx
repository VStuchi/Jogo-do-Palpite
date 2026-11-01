import React, { useState, useEffect } from 'react';
import { Clock, Send, CheckCircle2, Sparkles, HelpCircle, AlertCircle, Edit3 } from 'lucide-react';
import { GameState, PublicPlayer } from '../types/game.ts';
import { soundFX } from '../utils/audio.ts';

interface QuestionViewProps {
  gameState: GameState;
  myPlayerId: string | null;
  isHost: boolean;
  onSubmitGuess: (guess: number) => void;
}

export const QuestionView: React.FC<QuestionViewProps> = ({
  gameState,
  myPlayerId,
  isHost,
  onSubmitGuess
}) => {
  const [guessInput, setGuessInput] = useState<string>('');
  const [hasSubmittedLocally, setHasSubmittedLocally] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const currentQ = gameState.currentQuestion;
  const timer = gameState.timer;
  const maxTimer = gameState.settings.questionTimer;
  const progressPercent = Math.max(0, Math.min(100, (timer / maxTimer) * 100));

  const me = gameState.players.find((p) => p.id === myPlayerId);
  const hostPlays = gameState.settings.hostPlays;
  // Players on phone are always playing; host plays if hostPlays is enabled
  const isPlaying = !isHost || hostPlays;
  const alreadySubmitted = (me?.hasGuessed || hasSubmittedLocally) && !isEditing;

  // Reset local submission state when question changes
  useEffect(() => {
    setGuessInput('');
    setHasSubmittedLocally(false);
    setIsEditing(false);
  }, [gameState.currentQuestionIndex]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = Number(guessInput);
    if (isNaN(val) || guessInput.trim() === '') return;

    soundFX.playPop();
    onSubmitGuess(val);
    setHasSubmittedLocally(true);
    setIsEditing(false);
  };

  const handleQuickAdd = (amount: number) => {
    const current = Number(guessInput) || 0;
    const next = Math.max(0, current + amount);
    setGuessInput(next.toString());
    soundFX.playPop();
  };

  const handleKeypadPress = (digit: string) => {
    soundFX.playPop();
    if (digit === 'C') {
      setGuessInput('');
    } else if (digit === 'DEL') {
      setGuessInput((prev) => prev.slice(0, -1));
    } else {
      setGuessInput((prev) => (prev.length < 8 ? prev + digit : prev));
    }
  };

  const activeGuessingPlayers = gameState.players.filter((p) => !p.isHost || hostPlays);
  const answeredCount = activeGuessingPlayers.filter((p) => p.hasGuessed).length;

  // Timer color
  let timerColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
  if (timer <= 10 && timer > 5) {
    timerColor = 'text-amber-400 border-amber-500/40 bg-amber-500/10 animate-pulse';
  } else if (timer <= 5) {
    timerColor = 'text-rose-400 border-rose-500/40 bg-rose-500/20 animate-bounce';
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 md:py-8">
      {/* Round & Timer Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 font-bold text-xs">
            Pergunta {gameState.currentQuestionIndex + 1} de {gameState.totalQuestions}
          </span>
          {currentQ?.category && (
            <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs hidden sm:inline-block">
              {currentQ.category}
            </span>
          )}
        </div>

        {/* Countdown Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border font-mono font-black text-lg ${timerColor}`}>
          <Clock className="w-4 h-4" />
          <span>{timer}s</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-2 rounded-full mb-6 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            timer <= 5 ? 'bg-rose-500' : timer <= 10 ? 'bg-amber-400' : 'bg-emerald-400'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* The Question Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950/40 border border-violet-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl mb-8 relative">
        <span className="text-3xl mb-2 block">🎯</span>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-white tracking-tight leading-snug">
          {currentQ?.text || 'Carregando pergunta...'}
        </h2>
        {currentQ?.unit && (
          <p className="text-xs sm:text-sm font-semibold text-amber-400 uppercase tracking-widest mt-3">
            Resposta medida em: <span className="underline font-bold">{currentQ.unit}</span>
          </p>
        )}
      </div>

      {/* Player Input Section (If current user is a participating player) */}
      {isPlaying && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl max-w-xl mx-auto mb-8">
          {alreadySubmitted ? (
            /* Submitted confirmation state */
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">
                  Seu Chute Registrado
                </span>
                <p className="font-display font-black text-4xl text-amber-400 mt-1">
                  {guessInput} <span className="text-lg font-semibold text-slate-300">{currentQ?.unit}</span>
                </p>
              </div>

              <p className="text-xs text-slate-400 animate-pulse">
                Aguardando os outros jogadores chutarem para abrir a votação...
              </p>

              <button
                type="button"
                onClick={() => { setIsEditing(true); soundFX.playPop(); }}
                className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 underline font-semibold cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Mudar meu chute antes do tempo acabar
              </button>
            </div>
          ) : (
            /* Active Guessing input form */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center">
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-300 mb-2">
                  Qual é o seu palpite numérico?
                </label>

                {/* Main Number Display / Input */}
                <div className="relative max-w-xs mx-auto">
                  <input
                    type="number"
                    step="any"
                    value={guessInput}
                    onChange={(e) => setGuessInput(e.target.value)}
                    placeholder="Digite seu chute..."
                    autoFocus
                    required
                    className="w-full text-center font-display font-black text-3xl sm:text-4xl py-3 px-4 rounded-2xl bg-slate-800 border-2 border-violet-500 focus:border-amber-400 focus:ring-4 focus:ring-violet-500/20 text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                  {currentQ?.unit && (
                    <span className="block text-xs font-semibold text-slate-400 mt-1">
                      em {currentQ.unit}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Adjustment Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickAdd(-10)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                >
                  -10
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(-1)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(1)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(10)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                >
                  +10
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(100)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                >
                  +100
                </button>
              </div>

              {/* Submit Guess Button */}
              <button
                type="submit"
                disabled={!guessInput.trim()}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 disabled:opacity-50 font-display font-black text-lg text-white shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Send className="w-5 h-5" /> CONFIRMAR MEU PALPITE!
              </button>
            </form>
          )}
        </div>
      )}

      {/* Players Progress Grid (Answers are HIDDEN until voting phase) */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <span>Status dos Jogadores</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
              {answeredCount} de {activeGuessingPlayers.length} chutaram
            </span>
          </h3>
          <span className="text-[11px] text-slate-400 italic">
            🔒 Os valores só serão revelados na hora da votação!
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {activeGuessingPlayers.map((player) => {
            const hasGuessed = player.hasGuessed;
            const isMe = player.id === myPlayerId;

            return (
              <div
                key={player.id}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                  hasGuessed
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-800/40 border-slate-700/50'
                }`}
              >
                <div
                  style={{ backgroundColor: player.color }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md shrink-0"
                >
                  {player.avatar}
                </div>

                <div className="truncate flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-white truncate">
                      {player.name}
                    </span>
                    {isMe && (
                      <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-1 rounded">
                        Você
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] font-semibold flex items-center gap-1 mt-0.5">
                    {hasGuessed ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Chutou!
                      </span>
                    ) : (
                      <span className="text-slate-400 animate-pulse">
                        Pensando... 🤔
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
