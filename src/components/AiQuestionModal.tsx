import React, { useState } from 'react';
import { Sparkles, X, Loader2, Check, RefreshCw, BookOpen } from 'lucide-react';
import { QuestionItem } from '../types/game.ts';
import { soundFX } from '../utils/audio.ts';

interface AiQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyQuestions: (questions: QuestionItem[]) => void;
}

export const AiQuestionModal: React.FC<AiQuestionModalProps> = ({
  isOpen,
  onClose,
  onApplyQuestions
}) => {
  const [themeInput, setThemeInput] = useState('');
  const [count, setCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<QuestionItem[]>([]);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeInput.trim()) return;

    setIsLoading(true);
    setError(null);
    soundFX.playPop();

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: themeInput.trim(),
          count
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar perguntas com IA.');
      }

      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setGeneratedQuestions(data.questions);
        soundFX.playSuccess();
      } else {
        throw new Error('Nenhuma pergunta foi retornada pelo modelo.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao conectar com o serviço de IA.');
      soundFX.playBuzzer();
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedQuestions.length === 0) return;
    soundFX.playSuccess();
    onApplyQuestions(generatedQuestions);
    onClose();
  };

  const suggestionThemes = [
    'Futebol Brasileiro e Copas',
    'Fofocas e TV dos Anos 2000',
    'Recordes do Guinness',
    'Filmes e Cinema Clássico',
    'Comidas e Gastronomia Típica',
    'Animais Selvagens'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-amber-400 flex items-center justify-center text-2xl shadow-lg shadow-violet-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl text-white">
              Gerador de Perguntas com IA
            </h2>
            <p className="text-slate-400 text-sm">
              Crie rodadas personalizadas sobre qualquer tema com respostas numéricas precisas!
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Tema das Perguntas
            </label>
            <input
              type="text"
              value={themeInput}
              onChange={(e) => setThemeInput(e.target.value)}
              placeholder="Ex: Fofocas de Famosos, Anos 90, Cervejas, Séries da Netflix..."
              className="w-full bg-slate-800 border-2 border-slate-700 focus:border-violet-500 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none font-semibold transition-colors"
            />
          </div>

          {/* Suggestions */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Sugestões rápidas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestionThemes.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => { setThemeInput(sug); soundFX.playPop(); }}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Quantidade
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full bg-slate-800 border-2 border-slate-700 focus:border-violet-500 rounded-xl px-3 py-2.5 text-white font-semibold focus:outline-none"
              >
                <option value={3}>3 Perguntas</option>
                <option value={5}>5 Perguntas</option>
                <option value={8}>8 Perguntas</option>
              </select>
            </div>

            <div className="flex-1 pt-6">
              <button
                type="submit"
                disabled={isLoading || !themeInput.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 cursor-pointer transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" /> Criar Perguntas
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-6">
            {error}
          </div>
        )}

        {/* Generated Questions Preview */}
        {generatedQuestions.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-400" />
                Perguntas Geradas ({generatedQuestions.length}):
              </h3>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Prontas para jogar
              </span>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {generatedQuestions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">
                      {q.category || 'Personalizada'}
                    </span>
                    <p className="font-semibold text-white text-xs">{q.text}</p>
                    {q.curiosity && (
                      <p className="text-[11px] text-slate-400 italic">💡 {q.curiosity}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20">
                      {q.answer} {q.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleApply}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Check className="w-5 h-5" /> Usar este pacote nesta partida!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
