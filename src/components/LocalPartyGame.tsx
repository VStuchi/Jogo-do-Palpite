import React, { useState } from 'react';
import { ArrowLeft, Users, Play, Send, CheckCircle2, Target, Award, AlertTriangle, Search, ChevronRight, Trophy, RotateCcw } from 'lucide-react';
import { DEFAULT_QUESTIONS, Question, THEME_OPTIONS, filterQuestionsByTheme } from '../data/defaultQuestions.ts';
import { AVATAR_OPTIONS, COLOR_OPTIONS } from '../utils/avatars.ts';
import { soundFX } from '../utils/audio.ts';
import confetti from 'canvas-confetti';

interface LocalPlayer {
  id: string;
  name: string;
  avatar: string;
  color: string;
  score: number;
  currentGuess: number | null;
  currentVote: string | null;
  roundPoints: number;
}

export const LocalPartyGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [phase, setPhase] = useState<'SETUP' | 'GUESSING' | 'VOTING' | 'REVEAL' | 'OVER'>('SETUP');
  const [players, setPlayers] = useState<LocalPlayer[]>([
    { id: '1', name: 'Jogador 1', avatar: '🤠', color: '#8b5cf6', score: 0, currentGuess: null, currentVote: null, roundPoints: 0 },
    { id: '2', name: 'Jogador 2', avatar: '🍕', color: '#3b82f6', score: 0, currentGuess: null, currentVote: null, roundPoints: 0 }
  ]);
  const [newName, setNewName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('ALL');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activePlayerTurn, setActivePlayerTurn] = useState(0);
  const [activeVoteTurn, setActiveVoteTurn] = useState(0);
  const [tempGuess, setTempGuess] = useState('');
  const [revealData, setRevealData] = useState<{
    correctAnswer: number;
    exactIds: string[];
    closestIds: string[];
    farthestIds: string[];
  } | null>(null);

  const startLocalGame = () => {
    if (players.length < 2) return;
    const pool = filterQuestionsByTheme(selectedTheme);
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 5);
    setQuestions(shuffled);
    setCurrentQIndex(0);
    setActivePlayerTurn(0);
    setActiveVoteTurn(0);
    setTempGuess('');
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0, currentGuess: null, currentVote: null, roundPoints: 0 })));
    setPhase('GUESSING');
    soundFX.playSuccess();
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || players.length >= 8) return;
    const idx = players.length;
    const newP: LocalPlayer = {
      id: Date.now().toString(),
      name: newName.trim(),
      avatar: AVATAR_OPTIONS[idx % AVATAR_OPTIONS.length],
      color: COLOR_OPTIONS[idx % COLOR_OPTIONS.length].hex,
      score: 0,
      currentGuess: null,
      currentVote: null,
      roundPoints: 0
    };
    setPlayers((prev) => [...prev, newP]);
    setNewName('');
    soundFX.playPop();
  };

  const handleRemovePlayer = (id: string) => {
    if (players.length <= 2) return;
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleConfirmGuess = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(tempGuess);
    if (isNaN(val) || tempGuess.trim() === '') return;

    soundFX.playPop();
    const updated = [...players];
    updated[activePlayerTurn].currentGuess = val;
    setPlayers(updated);
    setTempGuess('');

    if (activePlayerTurn + 1 < players.length) {
      setActivePlayerTurn((prev) => prev + 1);
    } else {
      // Everyone guessed! Advance to Voting
      setActiveVoteTurn(0);
      setPhase('VOTING');
    }
  };

  const handleConfirmVote = (targetId: string) => {
    soundFX.playPop();
    const updated = [...players];
    updated[activeVoteTurn].currentVote = targetId;
    setPlayers(updated);

    if (activeVoteTurn + 1 < players.length) {
      setActiveVoteTurn((prev) => prev + 1);
    } else {
      // Everyone voted! Compute reveal
      calculateReveal(updated);
    }
  };

  const calculateReveal = (currentPlayers: LocalPlayer[]) => {
    const currentQ = questions[currentQIndex];
    const correct = currentQ.answer;

    let minDiff = Infinity;
    let maxDiff = -Infinity;
    const diffs: Record<string, number> = {};

    currentPlayers.forEach((p) => {
      const diff = Math.abs((p.currentGuess ?? 0) - correct);
      diffs[p.id] = diff;
      if (diff < minDiff) minDiff = diff;
      if (diff > maxDiff) maxDiff = diff;
    });

    const exactIds: string[] = [];
    const closestIds: string[] = [];
    const farthestIds: string[] = [];

    currentPlayers.forEach((p) => {
      const diff = diffs[p.id];
      if (p.currentGuess === correct) exactIds.push(p.id);
      if (diff === minDiff) closestIds.push(p.id);
      if (diff === maxDiff && (minDiff !== maxDiff || currentPlayers.length > 1)) farthestIds.push(p.id);
    });

    const evaluated = currentPlayers.map((p) => {
      let pts = 0;
      if (exactIds.includes(p.id)) pts += 3;
      else if (closestIds.includes(p.id)) pts += 2;

      // Detective vote
      if (p.currentVote && farthestIds.includes(p.currentVote)) {
        pts += 1;
      }
      return {
        ...p,
        score: p.score + pts,
        roundPoints: pts
      };
    });

    setPlayers(evaluated);
    setRevealData({
      correctAnswer: correct,
      exactIds,
      closestIds,
      farthestIds
    });
    setPhase('REVEAL');
    soundFX.playReveal();
  };

  const nextRound = () => {
    if (currentQIndex + 1 >= questions.length) {
      setPhase('OVER');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      soundFX.playSuccess();
    } else {
      setCurrentQIndex((prev) => prev + 1);
      setActivePlayerTurn(0);
      setActiveVoteTurn(0);
      setTempGuess('');
      setPlayers((prev) => prev.map((p) => ({ ...p, currentGuess: null, currentVote: null, roundPoints: 0 })));
      setPhase('GUESSING');
    }
  };

  const currentQ = questions[currentQIndex];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      {/* Back button */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Menu Principal
        </button>
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-300 font-bold border border-amber-400/20">
          📱 Modo Passa o Celular (1 Aparelho)
        </span>
      </div>

      {phase === 'SETUP' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
              Modo Festa no Mesmo Aparelho
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Jogue passando o celular de mão em mão, sem precisar de internet ou servidor!
            </p>
          </div>

          {/* Player list */}
          <div className="space-y-3 mb-6">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Jogadores ({players.length}):
            </span>
            <div className="grid grid-cols-2 gap-2">
              {players.map((p) => (
                <div key={p.id} className="p-3 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{p.avatar}</span>
                    <span className="text-xs font-bold text-white truncate">{p.name}</span>
                  </div>
                  {players.length > 2 && (
                    <button
                      onClick={() => handleRemovePlayer(p.id)}
                      className="text-slate-500 hover:text-rose-400 text-xs px-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add player input */}
          {players.length < 8 && (
            <form onSubmit={handleAddPlayer} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome do próximo amigo..."
                className="flex-1 bg-slate-800 border-2 border-slate-700 focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer"
              >
                + Adicionar
              </button>
            </form>
          )}

          {/* Theme selector */}
          <div className="mb-6 space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Tema das Perguntas:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      setSelectedTheme(theme.id);
                      soundFX.playPop();
                    }}
                    className={`p-2 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                      isSelected
                        ? 'bg-violet-600/30 border-violet-400 text-white font-bold ring-1 ring-violet-400/50'
                        : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <span className="block text-sm">{theme.icon}</span>
                    <span className="block truncate mt-0.5">{theme.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={startLocalGame}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white font-display font-black text-base shadow-xl cursor-pointer hover:brightness-110 transition-transform active:scale-[0.98]"
          >
            Iniciar Jogo com {players.length} Amigos! 🚀
          </button>
        </div>
      )}

      {phase === 'GUESSING' && currentQ && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-violet-500/30 rounded-3xl p-6 text-center shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
              Pergunta {currentQIndex + 1} de {questions.length} • {currentQ.category}
            </span>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-white mt-2">
              {currentQ.text}
            </h3>
            <span className="text-xs font-semibold text-amber-400 mt-2 block">
              Medido em: {currentQ.unit}
            </span>
          </div>

          {/* Active Turn banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-xl">
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg mb-2" style={{ backgroundColor: players[activePlayerTurn].color }}>
              {players[activePlayerTurn].avatar}
            </div>
            <h4 className="font-display font-black text-xl text-white">
              Vez de {players[activePlayerTurn].name}
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Passe o celular para ele(a) digitar o palpite secreto sem os outros verem!
            </p>

            <form onSubmit={handleConfirmGuess} className="space-y-4 max-w-xs mx-auto">
              <input
                type="number"
                step="any"
                value={tempGuess}
                onChange={(e) => setTempGuess(e.target.value)}
                placeholder="Digite o número secreto..."
                autoFocus
                required
                className="w-full text-center font-display font-black text-3xl py-3 rounded-2xl bg-slate-800 border-2 border-violet-500 text-white focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-md cursor-pointer"
              >
                Salvar Chute Secreto! 🔒
              </button>
            </form>
          </div>
        </div>
      )}

      {phase === 'VOTING' && currentQ && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-fuchsia-500/30 rounded-3xl p-6 text-center shadow-xl">
            <h3 className="font-display font-bold text-xl text-white">
              Aposta no Pior Chute! 🤡
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Pergunta: "{currentQ.text}"
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-xl">
            <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-2xl shadow-lg mb-2" style={{ backgroundColor: players[activeVoteTurn].color }}>
              {players[activeVoteTurn].avatar}
            </div>
            <h4 className="font-display font-bold text-lg text-white">
              {players[activeVoteTurn].name}, quem você acha que viajou mais longe?
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Clique no jogador para apostar nele (+1 ponto se acertar!):
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {players.filter((_, idx) => idx !== activeVoteTurn).map((target) => (
                <button
                  key={target.id}
                  type="button"
                  onClick={() => handleConfirmVote(target.id)}
                  className="p-3.5 rounded-2xl bg-slate-800 hover:bg-fuchsia-600/30 border border-slate-700 hover:border-fuchsia-400 text-center transition-all cursor-pointer"
                >
                  <span className="text-2xl block mb-1">{target.avatar}</span>
                  <span className="text-xs font-bold text-white block">{target.name}</span>
                  <span className="text-sm font-black text-amber-400 block mt-1">
                    {target.currentGuess} {currentQ.unit}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === 'REVEAL' && revealData && currentQ && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-500/20 via-violet-900/30 to-slate-900 border-2 border-amber-400/60 rounded-3xl p-6 text-center shadow-2xl">
            <span className="text-xs uppercase font-bold text-amber-300 block mb-1">
              Resposta Real:
            </span>
            <h2 className="font-display font-black text-4xl text-white">
              {revealData.correctAnswer} <span className="text-amber-400 text-2xl">{currentQ.unit}</span>
            </h2>
            {currentQ.curiosity && (
              <p className="text-xs text-amber-200/90 mt-2">💡 {currentQ.curiosity}</p>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2.5">
            <h4 className="font-bold text-sm text-white mb-2">Pontuação da Rodada:</h4>
            {players.map((p) => (
              <div key={p.id} className="p-3 rounded-2xl bg-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{p.avatar}</span>
                  <div>
                    <span className="text-xs font-bold text-white block">{p.name}</span>
                    <span className="text-[11px] text-slate-400">
                      Chutou: <strong className="text-amber-400">{p.currentGuess}</strong> (distância: {Math.abs((p.currentGuess ?? 0) - revealData.correctAnswer)})
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-400 block">+{p.roundPoints} pts</span>
                  <span className="text-[10px] text-slate-400">Total: {p.score} pts</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={nextRound}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white font-display font-black text-base shadow-xl cursor-pointer"
          >
            Próxima Rodada ➡️
          </button>
        </div>
      )}

      {phase === 'OVER' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-6">
          <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
          <h2 className="font-display font-black text-3xl text-white">Fim de Jogo!</h2>
          <div className="space-y-2">
            {[...players].sort((a, b) => b.score - a.score).map((p, idx) => (
              <div key={p.id} className="p-3 rounded-2xl bg-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-amber-400">#{idx + 1}</span>
                  <span className="text-xl">{p.avatar}</span>
                  <span className="text-xs font-bold text-white">{p.name}</span>
                </div>
                <span className="font-display font-black text-base text-amber-400">{p.score} pts</span>
              </div>
            ))}
          </div>
          <button
            onClick={startLocalGame}
            className="w-full py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-md cursor-pointer"
          >
            Jogar Novamente 🔄
          </button>
        </div>
      )}
    </div>
  );
};
