import React from 'react';
import { TokenizerType } from '../../types/tokenizer';
import { AVAILABLE_MODELS } from '../../engine/tokenizerRegistry';
import { Cpu, HelpCircle } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface ModelSelectorProps {
  currentModel: TokenizerType;
  onSelectModel: (model: TokenizerType) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ currentModel, onSelectModel }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-[#9AAAC0]">
        <div className="flex items-center gap-1.5 font-medium">
          <Cpu className="w-3.5 h-3.5 text-[#398BFF]" />
          <span>Active Tokenization Engine</span>
        </div>
        <span className="text-[11px] text-[#62C9F5] font-mono">
          {AVAILABLE_MODELS.find(m => m.id === currentModel)?.vocabSize}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {AVAILABLE_MODELS.map((model) => {
          const isSelected = currentModel === model.id;
          return (
            <button
              key={model.id}
              onClick={() => {
                soundFx.playSpinClick();
                onSelectModel(model.id);
              }}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#111C30] border-[#398BFF] shadow-[0_0_16px_rgba(57,139,255,0.25)]'
                  : 'bg-[#0E1729]/70 hover:bg-[#111C30] border-white/5 hover:border-white/20'
              }`}
            >
              {/* Active subtle corner glow */}
              {isSelected && (
                <div className="absolute top-0 right-0 w-8 h-8 bg-[#398BFF]/20 rounded-bl-xl pointer-events-none" />
              )}

              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-xs font-semibold ${isSelected ? 'text-[#F1F5FC]' : 'text-[#9AAAC0]'}`}>
                    {model.name}
                  </span>
                </div>
                <div className="text-[10px] text-[#9AAAC0] font-mono mt-0.5 line-clamp-1">
                  {model.vocabSize}
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                  model.category === 'pretrained'
                    ? 'bg-[#398BFF]/20 text-[#62C9F5] border border-[#398BFF]/30'
                    : model.category === 'educational'
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                    : 'bg-white/5 text-[#9AAAC0] border border-white/10'
                }`}>
                  {model.badge}
                </span>

                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#398BFF] animate-pulse" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
