import React, { useState } from 'react';
import { EducationalBpeEngine } from '../../engine/bpeEngine';
import { runBattleComparison } from '../../engine/tokenizerRegistry';
import { Swords, Sparkles, AlertCircle, CheckCircle, Zap, Shield, ArrowRight } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface TokenBattleSectionProps {
  bpeEngine: EducationalBpeEngine;
}

const PRESET_BATTLES = [
  'Beyblade battles are legendary and high-powered!',
  'Unbelievable tokenization transformations in transformers.',
  'Supercalifragilisticexpialidocious AI tokenizer.',
  '127.0.0.1:8080/api/v1/stream?query=hello_world'
];

export const TokenBattleSection: React.FC<TokenBattleSectionProps> = ({ bpeEngine }) => {
  const [battleSentence, setBattleSentence] = useState(PRESET_BATTLES[0]);

  const battleResults = runBattleComparison(battleSentence, bpeEngine);

  const handlePresetClick = (sentence: string) => {
    soundFx.playSpinClick();
    setBattleSentence(sentence);
  };

  return (
    <section id="token-battle" className="pt-16 pb-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[#398BFF] tracking-wider uppercase">
            <Swords className="w-4 h-4" />
            <span>Multi-Algorithm Showdown</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F1F5FC] tracking-tight">
            TOKEN BATTLE — COMPARE TOKENIZERS
          </h2>
          <p className="text-sm sm:text-base text-[#9AAAC0] max-w-2xl">
            Pit four distinct tokenization strategies against the same input sentence. Analyze compression, sequence length explosion, and subword segmentation side by side.
          </p>
        </div>

        {/* Input Sentence & Presets */}
        <div className="lab-glass rounded-2xl p-5 sm:p-6 border border-[#398BFF]/20 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <label className="text-xs font-mono text-[#9AAAC0] uppercase tracking-wider">
              Battle Input Sentence
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_BATTLES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetClick(preset)}
                  className="px-2.5 py-1 rounded-md text-xs font-mono bg-[#111C30] hover:bg-white/10 text-[#9AAAC0] hover:text-[#F1F5FC] border border-white/5 transition-colors"
                >
                  Preset {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              value={battleSentence}
              onChange={(e) => setBattleSentence(e.target.value)}
              placeholder="Enter any sentence to compare tokenizers..."
              className="w-full bg-[#080F1E] border border-white/10 focus:border-[#398BFF] rounded-xl px-4 py-3 text-sm sm:text-base font-mono text-[#F1F5FC] focus:outline-none"
            />
          </div>
        </div>

        {/* 4 Side-by-Side Comparison Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {battleResults.map((result) => {
            const isPretrained = result.category === 'Pretrained LLM';
            const isEducational = result.category === 'Educational BPE';

            return (
              <div
                key={result.type}
                className={`lab-glass rounded-2xl p-5 border flex flex-col justify-between space-y-4 relative overflow-hidden transition-all duration-200 hover:-translate-y-1 ${
                  isPretrained
                    ? 'border-[#398BFF]/50 shadow-[0_0_20px_rgba(57,139,255,0.15)] bg-[#111C30]/90'
                    : isEducational
                    ? 'border-[#2DD4BF]/40 bg-[#111C30]/80'
                    : 'border-white/10 bg-[#0E1729]/70'
                }`}
              >
                {/* Top Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      isPretrained
                        ? 'bg-[#398BFF]/20 text-[#62C9F5] border-[#398BFF]/40'
                        : isEducational
                        ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border-[#2DD4BF]/40'
                        : 'bg-white/5 text-[#9AAAC0] border-white/10'
                    }`}>
                      {result.category}
                    </span>

                    <span className="text-xs font-mono font-bold text-[#F1F5FC]">
                      {result.efficiencyRating}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#F1F5FC]">
                    {result.name}
                  </h3>
                  <div className="text-[11px] text-[#9AAAC0] font-mono">
                    Vocab: {result.vocabSizeDesc}
                  </div>
                </div>

                {/* Metrics Callout */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#080F1E] border border-white/5 font-mono text-center">
                  <div>
                    <span className="text-[10px] text-[#9AAAC0] block">TOKENS</span>
                    <span className={`text-xl font-bold ${
                      isPretrained ? 'text-[#398BFF]' : isEducational ? 'text-[#2DD4BF]' : 'text-[#F1F5FC]'
                    }`}>
                      {result.tokenCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#9AAAC0] block">CHARS / TOK</span>
                    <span className="text-xl font-bold text-[#F1F5FC]">
                      {result.charsPerToken}
                    </span>
                  </div>
                </div>

                {/* Token Chips Preview */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-[#9AAAC0] uppercase">
                    Segmented Tokens Stream:
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#080F1E]/90 border border-white/5 flex flex-wrap gap-1 max-h-36 overflow-y-auto content-start">
                    {result.tokens.map((t, i) => (
                      <span
                        key={i}
                        className={`px-1.5 py-0.5 rounded text-[11px] font-mono border ${
                          isPretrained
                            ? 'bg-[#398BFF]/15 border-[#398BFF]/30 text-[#F1F5FC]'
                            : isEducational
                            ? 'bg-[#2DD4BF]/15 border-[#2DD4BF]/30 text-[#F1F5FC]'
                            : 'bg-white/5 border-white/10 text-[#9AAAC0]'
                        }`}
                      >
                        {t.displayValue}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Architectural Trade-off Summary */}
                <div className="pt-3 border-t border-white/5 space-y-2 text-xs">
                  <p className="text-[#9AAAC0] text-[11px] leading-relaxed">
                    {result.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#62C9F5]">
                    <Zap className="w-3 h-3 text-[#398BFF] shrink-0" />
                    <span>{result.keyFeature}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Takeaway Insight Banner */}
        <div className="lab-glass rounded-xl p-4 sm:p-5 border border-[#398BFF]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono text-[#398BFF] font-semibold uppercase tracking-wider">
              Academic Takeaway: The Tokenization Dilemma
            </div>
            <p className="text-xs sm:text-sm text-[#9AAAC0] max-w-3xl">
              Character tokenizers require tiny vocabularies (~256) but generate extreme sequence lengths, overwhelming transformer attention $O(N^2)$ memory. Word tokenizers have short sequences but suffer massive dictionaries (&gt;500k words) and fail on out-of-vocabulary terms. <strong>Subword BPE provides the goldilocks zone</strong> used by modern LLMs.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
