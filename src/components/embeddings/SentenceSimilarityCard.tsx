import React from 'react';
import { SentenceItem, SimilarityResult } from '../../engine/embeddings/types';
import { calculateCosineSimilarity } from '../../engine/embeddings/similarityEngine';
import { Compass, Sparkles, Scale, Info, CheckCircle2 } from 'lucide-react';

interface SentenceSimilarityCardProps {
  sentenceA: SentenceItem | null;
  sentenceB: SentenceItem | null;
  allSentences: SentenceItem[];
  onSelectA: (s: SentenceItem) => void;
  onSelectB: (s: SentenceItem) => void;
}

export const SentenceSimilarityCard: React.FC<SentenceSimilarityCardProps> = ({
  sentenceA,
  sentenceB,
  allSentences,
  onSelectA,
  onSelectB,
}) => {
  // If either sentence is null, pick first two available
  const activeA = sentenceA || allSentences[0] || null;
  const activeB = sentenceB || (allSentences.length > 1 ? allSentences[1] : allSentences[0]) || null;

  const similarity: SimilarityResult | null = (activeA && activeB) 
    ? calculateCosineSimilarity(activeA, activeB) 
    : null;

  const scorePercent = similarity 
    ? Math.max(0, Math.min(100, Math.round(((similarity.cosineSimilarity + 1) / 2) * 100))) 
    : 0;

  return (
    <div className="lab-glass rounded-2xl p-5 sm:p-6 border border-[#2DD4BF]/30 space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#F1F5FC] tracking-tight">
              SENTENCE SIMILARITY COMPARATOR
            </h3>
            <p className="text-xs text-[#9AAAC0]">
              Calculated via Cosine Similarity in the full high-dimensional embedding space.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-[#2DD4BF] px-2.5 py-0.5 rounded-full bg-[#111C30] border border-[#2DD4BF]/40">
          Raw {similarity?.dimensionCount || 64}-D Vector Dot Product
        </span>
      </div>

      {/* Selectors for Sentence A and Sentence B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Sentence A Picker */}
        <div className="space-y-2 p-3.5 rounded-xl bg-[#080F1E] border border-[#398BFF]/30">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#398BFF] font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#398BFF]" />
              SENTENCE A
            </span>
            <span className="text-[10px] text-[#9AAAC0]">
              {activeA?.category === 'sample' ? 'Sample' : 'User'}
            </span>
          </div>

          <select
            value={activeA?.id || ''}
            onChange={(e) => {
              const found = allSentences.find(s => s.id === e.target.value);
              if (found) onSelectA(found);
            }}
            className="w-full bg-[#111C30] border border-white/10 rounded-lg p-2 text-xs font-mono text-[#F1F5FC] focus:outline-none focus:border-[#398BFF]"
          >
            {allSentences.map(s => (
              <option key={s.id} value={s.id}>
                {s.text}
              </option>
            ))}
          </select>
        </div>

        {/* Sentence B Picker */}
        <div className="space-y-2 p-3.5 rounded-xl bg-[#080F1E] border border-[#62C9F5]/30">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#62C9F5] font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#62C9F5]" />
              SENTENCE B
            </span>
            <span className="text-[10px] text-[#9AAAC0]">
              {activeB?.category === 'sample' ? 'Sample' : 'User'}
            </span>
          </div>

          <select
            value={activeB?.id || ''}
            onChange={(e) => {
              const found = allSentences.find(s => s.id === e.target.value);
              if (found) onSelectB(found);
            }}
            className="w-full bg-[#111C30] border border-white/10 rounded-lg p-2 text-xs font-mono text-[#F1F5FC] focus:outline-none focus:border-[#62C9F5]"
          >
            {allSentences.map(s => (
              <option key={s.id} value={s.id}>
                {s.text}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Similarity Score Card */}
      {similarity && (
        <div className="p-4 rounded-xl bg-[#111C30] border border-white/10 space-y-4">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono text-[#9AAAC0] uppercase tracking-wider">
                COSINE SIMILARITY SCORE
              </div>
              <div className="text-3xl font-extrabold font-mono text-[#2DD4BF] flex items-baseline gap-2">
                <span>{similarity.cosineSimilarity}</span>
                <span className="text-sm text-[#9AAAC0] font-normal">
                  ({scorePercent}% normalized)
                </span>
              </div>
            </div>

            {/* Formula Reference */}
            <div className="text-right text-[11px] font-mono text-[#9AAAC0] bg-[#080F1E] px-3 py-1.5 rounded-lg border border-white/5">
              <div>cos(&theta;) = (u &middot; v) / (||u|| &times; ||v||)</div>
              <div className="text-[10px] text-[#62C9F5]">Preserved true high-D angle</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 rounded-full bg-[#080F1E] overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#398BFF] via-[#62C9F5] to-[#2DD4BF] transition-all duration-500 shadow-[0_0_10px_#2DD4BF]"
              style={{ width: `${scorePercent}%` }}
            />
          </div>

          {/* Educational Explanation Box */}
          <div className="p-3 rounded-lg bg-[#080F1E] border border-white/5 text-xs text-[#F1F5FC] leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#62C9F5] text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>Semantic Analysis:</span>
            </div>
            <p className="text-[#9AAAC0] text-xs">
              {similarity.explanation}
            </p>
          </div>

        </div>
      )}

    </div>
  );
};
