import React from 'react';
import { X, Target, Award, AlertTriangle, Search, Smartphone, Tv, Sparkles } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-2xl shadow-lg">
            📜
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl text-white">Como Funciona o Jogo</h2>
            <p className="text-slate-400 text-sm">Regras oficiais de chutes, trairagem e pontuação</p>
          </div>
        </div>

        {/* Scoring System */}
        <div className="space-y-4 mb-6">
          <h3 className="text-xs uppercase font-bold tracking-wider text-violet-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Sistema de Pontuação
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-base">Na Mosca!</h4>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950">+3 pts</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Se você acertar o número exato da resposta da pergunta.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-base">Mais Perto</h4>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-400 text-slate-950">+2 pts</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Quem não acertou exato, mas teve a menor distância da resposta real.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-base">Faro de Detetive</h4>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-purple-400 text-slate-950">+1 pt</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Ao ver os chutes de todos, quem votar e acertar o jogador mais distante fatura 1 ponto!
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-base">Chute na Lua</h4>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-500/40 text-rose-200">0 pts</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  O jogador que chutar mais longe não ganha nada no palpite (e dá pontos pra quem apostou nele!).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How to play with friends */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 mb-6">
          <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-violet-400" />
            Como Jogar com os Amigos nos Celulares (Estilo Kahoot):
          </h3>
          <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
            <li>
              <strong className="text-white">Crie a sala</strong> no seu computador, tablet ou TV.
            </li>
            <li>
              Peça para os amigos <strong className="text-white">escanearem o QR Code</strong> com a câmera do celular ou acessarem o link com o <strong className="text-white">código de 4 letras</strong>.
            </li>
            <li>
              Cada um escolhe seu apelido e emoji. Todo mundo responde e vota no seu próprio aparelho!
            </li>
          </ol>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 font-bold text-white shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
        >
          Entendido, vamos jogar! 🚀
        </button>
      </div>
    </div>
  );
};
