import React from 'react';
import { Play, RotateCcw, Copy, Clipboard, Sparkles } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface TextInputPanelProps {
  text: string;
  onChange: (value: string) => void;
  onTokenize: () => void;
  onClear: () => void;
  autoTokenize: boolean;
  onToggleAutoTokenize: (val: boolean) => void;
  charCount: number;
  wordCount: number;
  isTokenizing?: boolean;
}

const SAMPLE_TEXTS = [
  { label: 'Hello, World!', value: 'Hello, World!' },
  { label: 'AI is fascinating', value: 'Artificial Intelligence is fascinating.' },
  { label: 'Beyblade battles', value: 'Beyblade battles are legendary!' },
  { label: 'Python programming', value: 'I love learning Python programming.' },
  { label: 'Emoji & Unicode', value: 'Tokens spin with high velocity! 🌀⚡🤖' },
  { label: 'Code Snippet', value: 'def tokenize(text):\n    return text.split(" ")' },
];

export const TextInputPanel: React.FC<TextInputPanelProps> = ({
  text,
  onChange,
  onTokenize,
  onClear,
  autoTokenize,
  onToggleAutoTokenize,
  charCount,
  wordCount,
  isTokenizing
}) => {
  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      onChange(clipboardText);
      soundFx.playSpinClick();
    } catch {
      // Clipboard read fallback
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      soundFx.playSpinClick();
    } catch {
      // Fallback
    }
  };

  const handleSampleClick = (val: string) => {
    soundFx.playSpinClick();
    onChange(val);
  };

  return (
    <div className="lab-glass rounded-2xl p-5 sm:p-6 border border-[#398BFF]/20 flex flex-col justify-between space-y-4">
      {/* Header with Sample Prompts & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#9AAAC0]">
            Input Buffer
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#111C30] text-[#62C9F5] border border-white/5">
            UTF-8 String
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 text-xs text-[#9AAAC0]">
          <button
            onClick={handlePaste}
            className="p-1.5 rounded-md hover:bg-white/5 hover:text-[#F1F5FC] transition-colors flex items-center gap-1 text-[11px]"
            title="Paste from clipboard"
          >
            <Clipboard className="w-3.5 h-3.5 text-[#62C9F5]" />
            <span className="hidden sm:inline">Paste</span>
          </button>
          <button
            onClick={handleCopy}
            disabled={!text}
            className="p-1.5 rounded-md hover:bg-white/5 hover:text-[#F1F5FC] transition-colors disabled:opacity-40 flex items-center gap-1 text-[11px]"
            title="Copy input text"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Copy</span>
          </button>
          <button
            onClick={() => {
              soundFx.playSpinClick();
              onClear();
            }}
            disabled={!text}
            className="p-1.5 rounded-md hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-40 flex items-center gap-1 text-[11px]"
            title="Clear input"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Text Area */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type, paste, or select sample text to explore tokenization..."
          rows={6}
          className="w-full bg-[#080F1E]/90 border border-white/10 focus:border-[#398BFF] rounded-xl p-4 text-[#F1F5FC] font-mono text-sm sm:text-base leading-relaxed placeholder:text-[#9AAAC0]/50 resize-y focus:outline-none focus:ring-1 focus:ring-[#398BFF] transition-all shadow-inner"
        />
      </div>

      {/* Preset Pills */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] text-[#9AAAC0]">
          <Sparkles className="w-3 h-3 text-[#398BFF]" />
          <span>Quick Samples:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_TEXTS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSampleClick(sample.value)}
              className="px-2.5 py-1 rounded-md text-xs bg-[#111C30] hover:bg-[#1C2C47] text-[#9AAAC0] hover:text-[#F1F5FC] border border-white/5 hover:border-[#398BFF]/40 transition-all text-left"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Footer bar: Counters & Tokenize Button */}
      <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
        {/* Character & Word Counters */}
        <div className="flex items-center gap-4 text-xs font-mono text-[#9AAAC0]">
          <div>
            <span className="text-[#F1F5FC] font-semibold">{charCount}</span> chars
          </div>
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <div>
            <span className="text-[#F1F5FC] font-semibold">{wordCount}</span> words
          </div>
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] select-none hover:text-[#F1F5FC]">
            <input
              type="checkbox"
              checked={autoTokenize}
              onChange={(e) => onToggleAutoTokenize(e.target.checked)}
              className="rounded bg-[#080F1E] border-white/20 text-[#398BFF] focus:ring-0 w-3.5 h-3.5"
            />
            <span>Live Sync</span>
          </label>
        </div>

        {/* Tokenize Button */}
        <button
          onClick={() => {
            soundFx.playSpinClick();
            onTokenize();
          }}
          disabled={!text}
          className="px-6 py-2.5 rounded-xl bg-[#398BFF] hover:bg-[#2F7BE8] text-white font-medium text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(57,139,255,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none"
        >
          <Play className={`w-4 h-4 fill-current ${isTokenizing ? 'animate-spin' : ''}`} />
          <span className="tracking-wide font-semibold">TOKENIZE</span>
        </button>
      </div>
    </div>
  );
};
