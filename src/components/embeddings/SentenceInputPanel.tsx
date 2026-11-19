import React, { useState } from 'react';
import { Plus, Sparkles, AlertCircle } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface SentenceInputPanelProps {
  onAddSentence: (text: string) => boolean | string;
  isProcessing?: boolean;
}

const QUICK_INSPIRATIONS = [
  'Deep neural networks learn representations.',
  'Spinning tops generate angular momentum.',
  'Transformers revolutionize modern translation.',
  'Robotics combines software and mechanical engineering.'
];

export const SentenceInputPanel: React.FC<SentenceInputPanelProps> = ({
  onAddSentence,
  isProcessing = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmed = inputText.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a word or sentence before adding to the plot.');
      return;
    }

    const result = onAddSentence(trimmed);
    if (typeof result === 'string') {
      setErrorMsg(result);
    } else if (result === true) {
      soundFx.playSpinClick();
      setInputText('');
    }
  };

  const handleInspirationClick = (text: string) => {
    soundFx.playSpinClick();
    setInputText(text);
    setErrorMsg(null);
  };

  return (
    <div className="lab-glass rounded-2xl p-5 sm:p-6 border border-[#398BFF]/25 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#F1F5FC] tracking-tight">
            TRY A WORD OR SENTENCE
          </h3>
          <p className="text-xs text-[#9AAAC0] mt-0.5">
            Embed your custom text and observe its 3D coordinates relative to existing semantic clusters.
          </p>
        </div>

        <span className="text-[11px] font-mono text-[#FF7A45] px-2.5 py-0.5 rounded-full bg-[#FF7A45]/15 border border-[#FF7A45]/30">
          ◆ Diamond Point
        </span>
      </div>

      {/* Form Input */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="Type a new sentence (e.g. 'Language models generate text')..."
            className="flex-1 bg-[#080F1E] border border-white/10 focus:border-[#398BFF] rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-[#F1F5FC] placeholder:text-[#9AAAC0]/50 focus:outline-none focus:ring-1 focus:ring-[#398BFF] transition-all"
          />

          <button
            type="submit"
            disabled={isProcessing}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF7A45] to-[#EA580C] hover:from-[#FF8C5A] hover:to-[#D9480F] text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_18px_rgba(255,122,69,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
            <span>ADD TO PLOT</span>
          </button>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </form>

      {/* Quick inspirations */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center gap-1.5 text-[11px] text-[#9AAAC0]">
          <Sparkles className="w-3 h-3 text-[#398BFF]" />
          <span>Quick Inspiration Ideas:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_INSPIRATIONS.map((insp, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleInspirationClick(insp)}
              className="px-2.5 py-1 rounded-lg text-xs bg-[#111C30] hover:bg-[#1C2C47] text-[#9AAAC0] hover:text-[#F1F5FC] border border-white/5 hover:border-[#398BFF]/40 transition-all text-left"
            >
              &quot;{insp}&quot;
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
