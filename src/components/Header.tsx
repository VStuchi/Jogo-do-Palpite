import React, { useState } from 'react';
import { Volume2, VolumeX, LogOut, Copy, Check, Users, Sparkles, HelpCircle } from 'lucide-react';
import { soundFX } from '../utils/audio.ts';

interface HeaderProps {
  roomCode?: string | null;
  phase?: string;
  playerCount?: number;
  onLeave?: () => void;
  onOpenRules?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  roomCode,
  phase,
  playerCount = 0,
  onLeave,
  onOpenRules
}) => {
  const [muted, setMuted] = useState(!soundFX.enabled);
  const [copied, setCopied] = useState(false);

  const toggleSound = () => {
    soundFX.enabled = !soundFX.enabled;
    setMuted(!soundFX.enabled);
    if (soundFX.enabled) {
      soundFX.playPop();
    }
  };

  const copyRoomLink = () => {
    if (!roomCode) return;
    const url = `${window.location.origin}/?room=${roomCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      soundFX.playPop();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-amber-400 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <span className="text-xl">🎯</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg md:text-xl text-white tracking-tight flex items-center gap-1.5 leading-none">
              Chute Certo
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 hidden sm:inline-block">
                & O Pior Palpite
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">Jogo multiplayer estilo Kahoot</p>
          </div>
        </div>

        {/* Room badge if in room */}
        {roomCode && (
          <div className="flex items-center gap-2">
            <button
              onClick={copyRoomLink}
              title="Clique para copiar o link da sala"
              className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700/90 border border-violet-500/30 hover:border-violet-500/60 px-3 py-1.5 rounded-xl transition-all cursor-pointer group"
            >
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider leading-none">
                  Código da Sala
                </span>
                <span className="font-display font-bold text-base md:text-lg text-amber-400 tracking-wider group-hover:scale-105 transition-transform">
                  {roomCode}
                </span>
              </div>
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
              )}
            </button>

            {playerCount > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/60 px-2.5 py-1.5 rounded-xl text-xs text-slate-300">
                <Users className="w-3.5 h-3.5 text-violet-400" />
                <span className="font-semibold">{playerCount}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onOpenRules && (
            <button
              onClick={onOpenRules}
              title="Regras e Pontuação"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={toggleSound}
            title={muted ? 'Ativar som' : 'Silenciar som'}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {onLeave && roomCode && (
            <button
              onClick={onLeave}
              title="Sair da sala"
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
