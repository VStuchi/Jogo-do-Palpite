import React, { useState } from 'react';
import { X, Server, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Smartphone, HelpCircle } from 'lucide-react';

interface ServerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  currentBackendUrl?: string;
  onSaveBackendUrl: (url: string) => void;
}

export const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({
  isOpen,
  onClose,
  isConnected,
  isConnecting,
  currentBackendUrl,
  onSaveBackendUrl
}) => {
  const [urlInput, setUrlInput] = useState(currentBackendUrl || '');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBackendUrl(urlInput.trim());
  };

  const handleReset = () => {
    onSaveBackendUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white">Servidor & Hospedagem</h2>
            <p className="text-slate-400 text-xs">Conexão multiplayer para jogar nos celulares</p>
          </div>
        </div>

        {/* Connection Status Badge */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-emerald-400 animate-pulse' : isConnecting ? 'bg-amber-400 animate-ping' : 'bg-rose-500'
            }`} />
            <div>
              <span className="text-xs font-bold text-white block">
                {isConnected ? 'Servidor Conectado! ✅' : isConnecting ? 'Conectando ao servidor...' : 'Servidor Desconectado'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono block truncate max-w-xs">
                {currentBackendUrl || window.location.origin}
              </span>
            </div>
          </div>
        </div>

        {/* Why GitHub Pages went blank explanation */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-6 space-y-2">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> Por que a página ficou em branco no GitHub?
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>1. Caminho dos Arquivos (Resolvido!):</strong> No GitHub Pages (ex: <code>usuario.github.io/repo/</code>), o Vite por padrão busca os arquivos na raiz. Nós já configuramos o caminho relativo <code>base: './'</code> para que a tela nunca mais fique em branco.
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>2. O GitHub Pages não roda Node.js:</strong> Ele só guarda arquivos estáticos (HTML/CSS/JS). Um jogo multiplayer tipo Kahoot precisa de um servidor Node.js com WebSockets para sincronizar os celulares em tempo real.
          </p>
        </div>

        {/* Custom Server URL Form */}
        <form onSubmit={handleSave} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              URL do Servidor Backend (WebSockets)
            </label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://seu-backend.onrender.com"
              className="w-full bg-slate-800 border-2 border-slate-700 focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Deixe em branco para usar o servidor padrão da nuvem.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              Salvar e Reconectar
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              Restaurar Padrão
            </button>
          </div>
        </form>

        {/* Free Hosting Alternatives Guide */}
        <div className="border-t border-slate-800 pt-4 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Onde hospedar o backend de graça para jogar com amigos:
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <a
              href="https://render.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 flex items-center justify-between transition-colors"
            >
              <span>Render.com (Web Service)</span>
              <ExternalLink className="w-3.5 h-3.5 text-violet-400" />
            </a>
            <a
              href="https://railway.app"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 flex items-center justify-between transition-colors"
            >
              <span>Railway.app</span>
              <ExternalLink className="w-3.5 h-3.5 text-violet-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
