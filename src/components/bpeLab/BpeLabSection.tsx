import React, { useState, useEffect } from 'react';
import { EducationalBpeEngine } from '../../engine/bpeEngine';
import { BpeTrainingState } from '../../types/tokenizer';
import { 
  Play, Pause, SkipForward, RotateCcw, Sparkles, BookOpen, 
  ArrowRight, Layers, Sliders, CheckCircle2, ChevronRight, Zap
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface BpeLabSectionProps {
  bpeEngine: EducationalBpeEngine;
  onVocabUpdated?: () => void;
}

const CORPUS_PRESETS = [
  {
    name: 'Classic NLP Toy Corpus',
    text: 'low lower lowest newer widest wide wider'
  },
  {
    name: 'Transformers & AI',
    text: 'large language models use transformers for token generation and attention'
  },
  {
    name: 'Beyblade Energy Lore',
    text: 'spin power velocity arena collision burst finish momentum energy'
  }
];

export const BpeLabSection: React.FC<BpeLabSectionProps> = ({ bpeEngine, onVocabUpdated }) => {
  const [corpus, setCorpus] = useState(CORPUS_PRESETS[0].text);
  const [maxMerges, setMaxMerges] = useState(10);
  const [trainingState, setTrainingState] = useState<BpeTrainingState>(() => {
    return bpeEngine.train({
      corpus: CORPUS_PRESETS[0].text,
      maxMerges: 10
    });
  });

  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [testInput, setTestInput] = useState('low lowest');

  // Trigger training
  const handleTrain = (newCorpus: string = corpus, merges: number = maxMerges) => {
    soundFx.playSpinClick();
    const result = bpeEngine.train({ corpus: newCorpus, maxMerges: merges });
    setTrainingState(result);
    setActiveStep(result.steps.length - 1);
    setIsPlaying(false);
    if (onVocabUpdated) onVocabUpdated();
  };

  // Step play loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStep(prev => {
          if (prev >= trainingState.steps.length - 1) {
            setIsPlaying(false);
            soundFx.playMergeSuccess();
            return prev;
          }
          soundFx.playTokenHover();
          return prev + 1;
        });
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, trainingState.steps.length]);

  const currentStepData = trainingState.steps[activeStep] || trainingState.steps[0];

  // Test tokenization on current BPE model
  const testTokens = bpeEngine.tokenize(testInput);

  return (
    <section id="vocabulary-lab" className="pt-16 pb-20 relative">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#398BFF]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Section Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[#2DD4BF] tracking-wider uppercase">
            <Zap className="w-4 h-4" />
            <span>Interactive Byte Pair Encoding</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F1F5FC] tracking-tight">
            BUILD YOUR OWN VOCABULARY
          </h2>
          <p className="text-sm sm:text-base text-[#9AAAC0] max-w-2xl">
            Train an authentic Byte Pair Encoding (BPE) subword tokenizer from scratch. Watch adjacent high-frequency character pairs collide and fuse into new vocabulary tokens.
          </p>
        </div>

        {/* Training Setup Controls */}
        <div className="lab-glass rounded-2xl p-6 border border-[#2DD4BF]/20 space-y-5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Presets */}
            <div className="space-y-1.5 flex-1">
              <label className="text-xs font-mono text-[#9AAAC0] uppercase tracking-wider block">
                Training Corpus
              </label>
              <div className="flex flex-wrap gap-2">
                {CORPUS_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCorpus(p.text);
                      handleTrain(p.text, maxMerges);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors border ${
                      corpus === p.text
                        ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border-[#2DD4BF]/40'
                        : 'bg-[#111C30] text-[#9AAAC0] hover:text-[#F1F5FC] border-white/5'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Merge Count Slider */}
            <div className="space-y-1.5 w-full md:w-64">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#9AAAC0]">Target Merges:</span>
                <span className="text-[#2DD4BF] font-bold">{maxMerges}</span>
              </div>
              <input
                type="range"
                min="2"
                max="25"
                value={maxMerges}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMaxMerges(val);
                  handleTrain(corpus, val);
                }}
                className="w-full accent-[#2DD4BF] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#9AAAC0] font-mono">
                <span>2 merges</span>
                <span>25 merges</span>
              </div>
            </div>

            {/* Retrain Button */}
            <div className="flex items-end">
              <button
                onClick={() => handleTrain(corpus, maxMerges)}
                className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#0D9488] text-[#080F1E] font-bold text-xs uppercase tracking-wider shadow-[0_0_16px_rgba(45,212,191,0.3)] hover:scale-105 active:scale-95 transition-all"
              >
                Re-Build Vocab
              </button>
            </div>
          </div>

          {/* Editable Corpus Input */}
          <div>
            <textarea
              value={corpus}
              onChange={(e) => setCorpus(e.target.value)}
              rows={2}
              className="w-full bg-[#080F1E] border border-white/10 focus:border-[#2DD4BF] rounded-xl p-3 text-xs sm:text-sm font-mono text-[#F1F5FC] resize-none focus:outline-none"
              placeholder="Enter custom training sentences..."
            />
          </div>
        </div>

        {/* Step-by-Step Merge Player Dashboard */}
        <div className="lab-glass rounded-2xl p-6 border border-[#398BFF]/20 space-y-6">
          
          {/* Player controls bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#9AAAC0]">
                Merge Step Timeline
              </span>
              <span className="text-xs font-mono text-[#398BFF] font-bold px-2 py-0.5 rounded-md bg-[#111C30] border border-[#398BFF]/30">
                Step {activeStep} of {trainingState.steps.length - 1}
              </span>
              <span className="text-xs font-mono text-[#62C9F5]">
                Vocab Size: {currentStepData?.currentVocabSize}
              </span>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundFx.playSpinClick();
                  setActiveStep(0);
                  setIsPlaying(false);
                }}
                className="p-2 rounded-lg bg-[#111C30] hover:bg-white/10 text-[#9AAAC0] hover:text-[#F1F5FC] text-xs transition-colors"
                title="Reset to Step 0 (Base characters)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  soundFx.playSpinClick();
                  setIsPlaying(!isPlaying);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#398BFF]/20 hover:bg-[#398BFF]/30 text-[#62C9F5] hover:text-white border border-[#398BFF]/40 text-xs font-mono transition-colors flex items-center gap-1.5"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
              </button>

              <button
                onClick={() => {
                  if (activeStep < trainingState.steps.length - 1) {
                    soundFx.playSpinClick();
                    setActiveStep(prev => prev + 1);
                  }
                }}
                disabled={activeStep >= trainingState.steps.length - 1}
                className="px-3 py-1.5 rounded-lg bg-[#111C30] hover:bg-white/10 text-[#F1F5FC] disabled:opacity-40 text-xs font-mono transition-colors flex items-center gap-1 border border-white/5"
              >
                <span>Step Next</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Active Merge Animation Card */}
          <div className="p-6 rounded-xl bg-[#080F1E] border border-white/10 text-center space-y-4">
            {currentStepData?.winningPair ? (
              <div className="space-y-4">
                <div className="text-xs font-mono text-[#9AAAC0] uppercase tracking-wider">
                  PAIR FUSION IN PROGRESS (Frequency: {currentStepData.frequency} occurrences)
                </div>

                {/* Animated Collision Fusion Badges */}
                <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
                  {/* Left Token */}
                  <div className="px-4 py-2 rounded-xl bg-[#398BFF]/20 border border-[#398BFF] text-[#F1F5FC] font-mono text-base sm:text-lg font-bold shadow-[0_0_15px_rgba(57,139,255,0.3)] animate-pulse">
                    &quot;{currentStepData.winningPair[0]}&quot;
                  </div>

                  <span className="text-lg font-bold text-[#62C9F5]">+</span>

                  {/* Right Token */}
                  <div className="px-4 py-2 rounded-xl bg-[#398BFF]/20 border border-[#398BFF] text-[#F1F5FC] font-mono text-base sm:text-lg font-bold shadow-[0_0_15px_rgba(57,139,255,0.3)] animate-pulse">
                    &quot;{currentStepData.winningPair[1]}&quot;
                  </div>

                  <ArrowRight className="w-5 h-5 text-[#2DD4BF]" />

                  {/* Resulting Merged Token */}
                  <div className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2DD4BF]/30 to-[#398BFF]/30 border-2 border-[#2DD4BF] text-white font-mono text-lg sm:text-xl font-extrabold shadow-[0_0_20px_rgba(45,212,191,0.5)]">
                    &quot;{currentStepData.newToken}&quot;
                  </div>
                </div>

                <p className="text-xs font-mono text-[#9AAAC0] max-w-md mx-auto">
                  Byte Pair Encoding greedily merges this top pair into a single compound token, updating all word token arrays.
                </p>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                <div className="text-xs font-mono text-[#62C9F5] uppercase tracking-wider">
                  Initial Vocabulary State (Step 0)
                </div>
                <div className="text-sm font-mono text-[#F1F5FC]">
                  All words start decomposed into single characters with end-of-word markers (`&lt;/w&gt;`).
                </div>
              </div>
            )}

            {/* Current Words Sample State */}
            <div className="pt-4 border-t border-white/5 space-y-2 text-left">
              <span className="text-[11px] font-mono text-[#9AAAC0] uppercase block">
                Corpus Token State at Step {activeStep}:
              </span>
              <div className="flex flex-wrap gap-2">
                {currentStepData?.sampleWords.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-[#111C30] border border-white/5 text-xs font-mono flex items-center gap-1.5"
                  >
                    <span className="text-[#9AAAC0] font-semibold">{w.original}:</span>
                    <div className="flex gap-1 flex-wrap">
                      {w.tokens.map((t, ti) => {
                        const isNew = t === currentStepData.newToken;
                        return (
                          <span
                            key={ti}
                            className={`px-1.5 py-0.5 rounded ${
                              isNew
                                ? 'bg-[#2DD4BF]/30 border border-[#2DD4BF] text-white font-bold'
                                : 'bg-[#080F1E] text-[#62C9F5] border border-white/10'
                            }`}
                          >
                            {t}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2-Column Tables: Top Candidates vs Learned Merges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Top Pair Candidates for this Step */}
            <div className="lab-glass-card rounded-xl p-4 border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-[#9AAAC0]">
                <span className="uppercase tracking-wider">Top Pair Candidates at Step {activeStep}</span>
                <span>Count</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {currentStepData?.pairCounts.map((p, idx) => {
                  const isWinner = idx === 0 && currentStepData.winningPair !== null;
                  return (
                    <div
                      key={p.pairKey}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs font-mono border ${
                        isWinner
                          ? 'bg-[#2DD4BF]/15 border-[#2DD4BF]/40 text-white font-bold'
                          : 'bg-[#080F1E] border-white/5 text-[#9AAAC0]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#9AAAC0]">#{idx + 1}</span>
                        <span>({p.pair[0]}, {p.pair[1]})</span>
                        {isWinner && (
                          <span className="text-[9px] px-1 rounded bg-[#2DD4BF]/30 text-[#2DD4BF]">
                            Winner
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-[#F1F5FC]">{p.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Merges History List */}
            <div className="lab-glass-card rounded-xl p-4 border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-[#9AAAC0]">
                <span className="uppercase tracking-wider">Learned Merge Operations ({trainingState.merges.length})</span>
                <span>Result</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {trainingState.merges.length === 0 ? (
                  <div className="text-center py-6 text-xs text-[#9AAAC0]">No merges applied yet.</div>
                ) : (
                  trainingState.merges.map((m, idx) => {
                    const isStepActive = idx + 1 === activeStep;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          soundFx.playSpinClick();
                          setActiveStep(idx + 1);
                        }}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs font-mono border cursor-pointer transition-colors ${
                          isStepActive
                            ? 'bg-[#398BFF]/20 border-[#398BFF] text-white'
                            : 'bg-[#080F1E] border-white/5 text-[#9AAAC0] hover:text-[#F1F5FC]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[#398BFF] font-bold">M{idx + 1}</span>
                          <span>{m.pair[0]} + {m.pair[1]}</span>
                        </div>
                        <span className="font-bold text-[#62C9F5]">&rarr; &quot;{m.merged}&quot;</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* Interactive BPE Test Playground */}
          <div className="p-4 rounded-xl bg-[#111C30] border border-[#2DD4BF]/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-[#2DD4BF] uppercase tracking-wider font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Test Learned Vocabulary on Arbitrary Text</span>
              </div>
              <span className="text-[11px] font-mono text-[#9AAAC0]">
                Trained Vocab Size: {trainingState.finalVocab.length} tokens
              </span>
            </div>

            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Type any word to test subword splitting..."
              className="w-full bg-[#080F1E] border border-white/10 focus:border-[#2DD4BF] rounded-lg p-2.5 text-xs sm:text-sm font-mono text-[#F1F5FC] focus:outline-none"
            />

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#9AAAC0] uppercase block">
                Resulting BPE Subword Segments:
              </span>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-[#080F1E] border border-white/5 min-h-[44px] items-center">
                {testTokens.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-xs font-mono bg-[#2DD4BF]/15 border border-[#2DD4BF]/40 text-[#F1F5FC] flex items-center gap-1.5"
                  >
                    <span>{t.displayValue}</span>
                    <span className="text-[10px] text-[#2DD4BF] font-mono font-bold">
                      #{t.id}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
