import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Play, Bot, Copy, Check, Sparkles, Smartphone, Settings, UserMinus, Shield } from 'lucide-react';
import { GameState, PublicPlayer, QuestionItem } from '../types/game.ts';
import { soundFX } from '../utils/audio.ts';
import { getRoomShareUrl } from '../utils/url.ts';
import { THEME_OPTIONS, filterQuestionsByTheme } from '../data/defaultQuestions.ts';
import { AiQuestionModal } from './AiQuestionModal.tsx';

interface LobbyViewProps {
  gameState: GameState;
  myPlayerId: string | null;
  isHost: boolean;
  onStartGame: (customQuestions?: QuestionItem[]) => void;
  onAddBot: () => void;
  onRemovePlayer: (playerId: string) => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  gameState,
  myPlayerId,
  isHost,
  onStartGame,
  onAddBot,
  onRemovePlayer
}) => {
  const [copied, setCopied] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('ALL_FOOTBALL');
  const [customQuestions, setCustomQuestions] = useState<QuestionItem[] | undefined>();

  const shareUrl = getRoomShareUrl(gameState.code);

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      soundFX.playPop();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSelectTheme = (themeId: string) => {
    setSelectedTheme(themeId);
    const questions = filterQuestionsByTheme(themeId);
    setCustomQuestions(questions);
    soundFX.playPop();
  };

  const handleStart = () => {
    soundFX.playSuccess();
    const finalQuestions = customQuestions || filterQuestionsByTheme(selectedTheme);
    onStartGame(finalQuestions);
  };

  const players = gameState.players;
  const humanCount = players.filter((p) => !p.isBot).length;
  const totalCount = players.length;
  const canStart = totalCount >= 2;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-8">
      {/* Top Banner with Room Code & QR Code */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-violet-950/40 border border-violet-500/30 rounded-3xl p-6 md:p-8 shadow-2xl mb-8 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Room PIN & Share Section */}
          <div className="md:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold border border-violet-500/30">
              <Smartphone className="w-3.5 h-3.5" /> Entre pelo celular na mesma rede ou 4G
            </div>

            <div>
              <p className="text-xs uppercase font-bold tracking-widest text-slate-400">
                Código PIN da Sala
              </p>
              <div className="flex items-center gap-4 mt-1">
                <span className="font-display font-black text-5xl sm:text-6xl text-amber-400 tracking-wider drop-shadow-md">
                  {gameState.code}
                </span>

                <button
                  onClick={copyLink}
                  className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" /> Link Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-300" /> Copiar Link
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
              Aponte a câmera do celular para o QR Code ao lado ou acesse{' '}
              <strong className="text-amber-300 font-mono text-xs">{shareUrl}</strong> para jogar!
            </p>

            {customQuestions && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Pacote com {customQuestions.length} perguntas de IA carregado!
              </div>
            )}
          </div>

          {/* QR Code Container */}
          <div className="md:col-span-4 flex flex-col items-center justify-center">
            <div className="p-3 bg-white rounded-2xl shadow-xl ring-4 ring-violet-500/30 group transition-transform hover:scale-105">
              <QRCodeSVG
                value={shareUrl}
                size={140}
                level="M"
                includeMargin={false}
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-2 font-medium flex items-center gap-1">
              📱 Escaneie para entrar direto
            </span>
          </div>
        </div>
      </div>

      {/* Players Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-400" />
            Jogadores na Sala ({totalCount})
          </h2>
          <p className="text-xs text-slate-400">
            {canStart ? 'Prontos para começar!' : 'Aguardando pelo menos 2 jogadores para iniciar...'}
          </p>
        </div>

        {/* Host action buttons */}
        {isHost && (
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => { onAddBot(); soundFX.playPop(); }}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Bot className="w-4 h-4 text-sky-400" /> Adicionar Bot
            </button>

            <button
              onClick={() => { setIsAiModalOpen(true); soundFX.playPop(); }}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-xs font-bold text-violet-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> Perguntas com IA
            </button>
          </div>
        )}
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mb-8">
        {players.map((player) => {
          const isMe = player.id === myPlayerId;
          return (
            <div
              key={player.id}
              className={`relative p-4 rounded-2xl bg-slate-900/90 border transition-all flex flex-col items-center text-center group ${
                isMe ? 'border-amber-400/60 ring-2 ring-amber-400/20' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Host remove button */}
              {isHost && player.id !== myPlayerId && (
                <button
                  onClick={() => onRemovePlayer(player.id)}
                  title="Remover jogador"
                  className="absolute top-2 right-2 p-1 rounded-full bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Avatar circle */}
              <div
                style={{ backgroundColor: player.color }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg mb-2 relative transform group-hover:scale-110 transition-transform"
              >
                {player.avatar}
                {player.isHost && (
                  <span
                    title="Anfitrião"
                    className="absolute -top-2 -right-2 text-base drop-shadow-md"
                  >
                    👑
                  </span>
                )}
              </div>

              {/* Player Name */}
              <span className="font-bold text-sm text-white truncate max-w-full">
                {player.name}
              </span>

              {/* Badges */}
              <div className="flex items-center gap-1 mt-1.5">
                {isMe && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                    Você
                  </span>
                )}
                {player.isBot && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Bot
                  </span>
                )}
                {player.isHost && !isMe && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Host
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Theme Selection for Host */}
      {isHost && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 mb-8 max-w-2xl mx-auto shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span>⚽ Tema da Partida:</span>
              <span className="text-amber-400 font-semibold">
                {THEME_OPTIONS.find(t => t.id === selectedTheme)?.name}
              </span>
            </h3>
            <span className="text-[11px] text-slate-400">Clique para mudar o tema</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = selectedTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400/20 border-amber-400 text-white shadow-lg ring-2 ring-amber-400/30'
                      : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xl">{theme.icon}</span>
                    <span className="font-bold text-xs truncate">{theme.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{theme.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Start Game Action / Waiting Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center max-w-xl mx-auto shadow-xl">
        {isHost ? (
          <div className="space-y-4">
            <div className="text-xs text-slate-400">
              Partida configurada para <strong className="text-white">{gameState.settings.totalQuestions} perguntas</strong> • {gameState.settings.questionTimer}s por resposta
            </div>

            <button
              onClick={handleStart}
              disabled={!canStart}
              className={`w-full py-4 rounded-2xl font-display font-extrabold text-lg text-white shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                canStart
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-violet-600 hover:from-emerald-400 hover:to-violet-500 hover:scale-[1.02] active:scale-[0.98] shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              {canStart ? 'INICIAR PARTIDA AGORA!' : 'Adicione pelo menos 1 amigo ou bot para começar'}
            </button>

            {!canStart && (
              <button
                type="button"
                onClick={() => { onAddBot(); soundFX.playPop(); }}
                className="text-xs text-sky-400 hover:text-sky-300 underline cursor-pointer"
              >
                + Adicionar um bot para testar agora mesmo
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2 py-2">
            <div className="w-10 h-10 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mx-auto text-xl animate-pulse">
              ⏳
            </div>
            <h3 className="font-bold text-white text-base">Aguardando o Anfitrião</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Fique de olho na tela do seu celular! A primeira pergunta já vai começar assim que o host der o play.
            </p>
          </div>
        )}
      </div>

      {/* AI Questions Modal */}
      <AiQuestionModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyQuestions={(qs) => {
          setCustomQuestions(qs);
        }}
      />
    </div>
  );
};
