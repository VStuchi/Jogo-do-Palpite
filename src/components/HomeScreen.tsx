import React, { useState, useEffect } from 'react';
import { Play, PlusCircle, Users, Sparkles, Smartphone, Tv, ArrowRight, ShieldAlert, Award, HelpCircle } from 'lucide-react';
import { AVATAR_OPTIONS, COLOR_OPTIONS } from '../utils/avatars.ts';
import { soundFX } from '../utils/audio.ts';

interface HomeScreenProps {
  onCreateRoom: (
    hostName: string,
    avatar: string,
    color: string,
    hostPlays: boolean,
    settings: { totalQuestions: number; questionTimer: number; votingTimer: number }
  ) => void;
  onJoinRoom: (
    roomCode: string,
    playerName: string,
    avatar: string,
    color: string
  ) => void;
  onOpenRules: () => void;
  onOpenLocalMode?: () => void;
  onOpenServerSettings?: () => void;
  isConnected?: boolean;
  errorMessage?: string | null;
  onClearError?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onCreateRoom,
  onJoinRoom,
  onOpenRules,
  onOpenLocalMode,
  onOpenServerSettings,
  isConnected = false,
  errorMessage,
  onClearError
}) => {
  const [tab, setTab] = useState<'join' | 'create'>('join');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].hex);

  // Host settings
  const [hostPlays, setHostPlays] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [questionTimer, setQuestionTimer] = useState(30);

  // Check URL params for ?room=ABCD
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get('room');
    if (roomFromUrl) {
      setRoomCodeInput(roomFromUrl.toUpperCase());
      setTab('join');
    }
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim() || !nameInput.trim()) return;
    soundFX.playPop();
    onJoinRoom(roomCodeInput.trim().toUpperCase(), nameInput.trim(), selectedAvatar, selectedColor);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    soundFX.playPop();
    onCreateRoom(nameInput.trim(), selectedAvatar, selectedColor, hostPlays, {
      totalQuestions,
      questionTimer,
      votingTimer: 20
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-10">
      {/* Hero Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs md:text-sm font-semibold mb-4 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" /> Jogo Multiplayer no Celular estilo Kahoot!
        </div>

        <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
          Chute Certo{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-fuchsia-400 to-violet-400">
            & O Pior Palpite
          </span>
        </h1>
        <p className="mt-3 text-slate-300 max-w-xl mx-auto text-sm md:text-base">
          Responda números exatos de curiosidades malucas, ganhe pontos por aproximação e vote em quem viajou na maionese!
        </p>

        {/* Quick Scoring Pill */}
        <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 p-2 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs">
          <span className="px-2.5 py-1 rounded-xl bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
            🎯 Na mosca: +3 pts
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-emerald-400/20 text-emerald-300 font-bold border border-emerald-400/30">
            🥈 Mais perto: +2 pts
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-purple-400/20 text-purple-300 font-bold border border-purple-400/30">
            🕵️ Acertou o pior chute: +1 pt
          </span>
          <button
            onClick={onOpenRules}
            className="text-slate-400 hover:text-white underline ml-1 cursor-pointer"
          >
            Ver regras completas
          </button>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
          <span>{errorMessage}</span>
          {onClearError && (
            <button onClick={onClearError} className="text-rose-400 hover:text-white font-bold ml-2">
              ✕
            </button>
          )}
        </div>
      )}

      {/* Main Card with Tabs */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Tabs */}
        <div className="flex rounded-2xl bg-slate-800/80 p-1 mb-8 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => { setTab('join'); soundFX.playPop(); }}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'join'
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> Entrar na Sala
          </button>
          <button
            type="button"
            onClick={() => { setTab('create'); soundFX.playPop(); }}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'create'
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" /> Criar Sala (Host)
          </button>
        </div>

        {/* Form Content */}
        {tab === 'join' ? (
          <form onSubmit={handleJoin} className="space-y-6 max-w-md mx-auto">
            {/* Room Code */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Código PIN da Sala
              </label>
              <input
                type="text"
                maxLength={4}
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="Ex: ABCD"
                required
                className="w-full text-center font-display font-black text-2xl tracking-widest bg-slate-800 border-2 border-slate-700 focus:border-violet-500 rounded-2xl px-4 py-3 text-amber-400 placeholder-slate-500 uppercase focus:outline-none transition-colors"
              />
              <p className="text-[11px] text-slate-400 mt-1 text-center">
                Código de 4 letras que aparece na tela do apresentador
              </p>
            </div>

            {/* Nickname */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Seu Apelido / Nome
              </label>
              <input
                type="text"
                maxLength={18}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Como quer ser chamado?"
                required
                className="w-full bg-slate-800 border-2 border-slate-700 focus:border-violet-500 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none font-semibold transition-colors"
              />
            </div>

            {/* Avatar & Color Picker */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Escolha seu Emoji de Jogador
                </label>
                <div className="grid grid-cols-6 gap-2 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => { setSelectedAvatar(emoji); soundFX.playPop(); }}
                      className={`text-2xl p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                        selectedAvatar === emoji
                          ? 'bg-violet-600 scale-110 shadow-md ring-2 ring-violet-400'
                          : 'hover:bg-slate-700/60'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Cor de Destaque
                </label>
                <div className="flex items-center justify-between gap-2 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                  {COLOR_OPTIONS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => { setSelectedColor(col.hex); soundFX.playPop(); }}
                      style={{ backgroundColor: col.hex }}
                      className={`w-7 h-7 rounded-full transition-all cursor-pointer ${
                        selectedColor === col.hex ? 'scale-125 ring-3 ring-white shadow-lg' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 font-display font-bold text-lg text-white shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" /> Entrar no Jogo
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreate} className="space-y-6 max-w-lg mx-auto">
            {/* Host Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Nome do Anfitrião / Apresentador
              </label>
              <input
                type="text"
                maxLength={20}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ex: Anfitrião Lucas"
                required
                className="w-full bg-slate-800 border-2 border-slate-700 focus:border-violet-500 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none font-semibold transition-colors"
              />
            </div>

            {/* Avatar & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Seu Emoji
                </label>
                <div className="grid grid-cols-6 gap-1.5 bg-slate-800/60 p-2.5 rounded-2xl border border-slate-700/60">
                  {AVATAR_OPTIONS.slice(0, 12).map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => { setSelectedAvatar(emoji); soundFX.playPop(); }}
                      className={`text-xl p-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                        selectedAvatar === emoji
                          ? 'bg-violet-600 scale-110 shadow-md ring-2 ring-violet-400'
                          : 'hover:bg-slate-700/60'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Cor
                </label>
                <div className="grid grid-cols-4 gap-2 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60 items-center justify-items-center">
                  {COLOR_OPTIONS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => { setSelectedColor(col.hex); soundFX.playPop(); }}
                      style={{ backgroundColor: col.hex }}
                      className={`w-7 h-7 rounded-full transition-all cursor-pointer ${
                        selectedColor === col.hex ? 'scale-125 ring-3 ring-white shadow-lg' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Host Mode: Plays along or Telão only */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Papel do Anfitrião nesta tela:
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setHostPlays(true)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    hostPlays
                      ? 'bg-violet-600/30 border-violet-500 text-white shadow-md'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone className="w-4 h-4 text-violet-400" />
                    <span className="font-bold text-sm">Host Joga Junto</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    O host também chuta números e vota nesta mesma tela.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setHostPlays(false)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    !hostPlays
                      ? 'bg-violet-600/30 border-violet-500 text-white shadow-md'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Tv className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm">Apenas Telão / TV</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Esta tela vira o placar público e os jogadores respondem no celular.
                  </p>
                </button>
              </div>
            </div>

            {/* Game Length & Timers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Total de Perguntas
                </label>
                <select
                  value={totalQuestions}
                  onChange={(e) => setTotalQuestions(Number(e.target.value))}
                  className="w-full bg-slate-800 border-2 border-slate-700 focus:border-violet-500 rounded-xl px-3 py-2.5 text-white font-semibold focus:outline-none"
                >
                  <option value={3}>3 Perguntas (Express)</option>
                  <option value={5}>5 Perguntas (Padrão)</option>
                  <option value={8}>8 Perguntas (Completo)</option>
                  <option value={10}>10 Perguntas (Maratona)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Tempo por Pergunta
                </label>
                <select
                  value={questionTimer}
                  onChange={(e) => setQuestionTimer(Number(e.target.value))}
                  className="w-full bg-slate-800 border-2 border-slate-700 focus:border-violet-500 rounded-xl px-3 py-2.5 text-white font-semibold focus:outline-none"
                >
                  <option value={20}>20 segundos (Rápido)</option>
                  <option value={30}>30 segundos (Equilibrado)</option>
                  <option value={45}>45 segundos (Tranquilo)</option>
                  <option value={60}>60 segundos (Refletido)</option>
                </select>
              </div>
            </div>

            {/* Create Room Submit */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 font-display font-bold text-lg text-white shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-amber-300" /> Criar Sala e Gerar Código PIN
            </button>
          </form>
        )}
      </div>

        {/* Offline / Local Mode Alternative */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
          {onOpenLocalMode && (
            <button
              type="button"
              onClick={onOpenLocalMode}
              className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-amber-400/30 hover:border-amber-400/60 text-left transition-all cursor-pointer group shadow-lg"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">📱</span>
                <span className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                  Modo 1 Celular (Offline)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Estão juntos no sofá ou na mesa? Jogue passando o mesmo aparelho de mão em mão sem precisar de internet!
              </p>
            </button>
          )}

          {onOpenServerSettings && (
            <button
              type="button"
              onClick={onOpenServerSettings}
              className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-violet-500/40 text-left transition-all cursor-pointer group shadow-lg"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className="font-bold text-sm text-white group-hover:text-violet-300 transition-colors">
                  Hospedagem & GitHub
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Hospedou no GitHub Pages? Veja como conectar o servidor Node gratuito ou testar a conexão.
              </p>
            </button>
          )}
        </div>

        {/* Hosting explanation card */}
        <div className="mt-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-center max-w-xl mx-auto">
          <h3 className="font-bold text-white text-sm flex items-center justify-center gap-2 mb-1">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            Como hospedar para jogar com amigos:
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Este jogo já está hospedado e pronto na nuvem! Basta abrir o link no seu celular ou computador,
            criar a sala e passar o link ou QR Code para os seus amigos entrarem direto de onde estiverem.
          </p>
        </div>
      </div>
    );
  };
