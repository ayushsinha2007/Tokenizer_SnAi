import React, { useState, useMemo } from 'react';
import { TokenSegment } from '../../types/tokenizer';
import { Search, BarChart3, Binary, Repeat, Hash, Layers, Sparkles } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface TokenExplorerSectionProps {
  tokens: TokenSegment[];
  inputText: string;
  onSelectToken: (token: TokenSegment) => void;
  selectedToken: TokenSegment | null;
}

export const TokenExplorerSection: React.FC<TokenExplorerSectionProps> = ({
  tokens,
  inputText,
  onSelectToken,
  selectedToken
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeHighlightToken, setActiveHighlightToken] = useState<string | null>(null);

  // Frequency map for tokens
  const frequencyMap = useMemo(() => {
    const map = new Map<string, { count: number; id: number; positions: number[]; segment: TokenSegment }>();
    tokens.forEach((t) => {
      const key = t.text;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        existing.positions.push(t.index);
      } else {
        map.set(key, { count: 1, id: t.id, positions: [t.index], segment: t });
      }
    });

    return Array.from(map.entries())
      .map(([text, data]) => ({
        text,
        count: data.count,
        id: data.id,
        positions: data.positions,
        segment: data.segment,
        percentage: tokens.length > 0 ? ((data.count / tokens.length) * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.count - a.count);
  }, [tokens]);

  // Repeated bigrams / n-grams detector
  const repeatedPatterns = useMemo(() => {
    if (tokens.length < 4) return [];
    const bigramCounts = new Map<string, { pair: [string, string]; count: number }>();
    for (let i = 0; i < tokens.length - 1; i++) {
      const key = `${tokens[i].text} + ${tokens[i + 1].text}`;
      const existing = bigramCounts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        bigramCounts.set(key, { pair: [tokens[i].text, tokens[i + 1].text], count: 1 });
      }
    }
    return Array.from(bigramCounts.values())
      .filter(b => b.count > 1)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [tokens]);

  // Filter frequency list by search
  const filteredFrequencies = useMemo(() => {
    if (!searchQuery.trim()) return frequencyMap;
    const q = searchQuery.toLowerCase();
    return frequencyMap.filter(f =>
      f.text.toLowerCase().includes(q) ||
      f.id.toString().includes(q)
    );
  }, [frequencyMap, searchQuery]);

  const maxFreq = frequencyMap[0]?.count || 1;

  // Render input text with highlight for activeHighlightToken
  const highlightedTokens = activeHighlightToken || selectedToken?.text || null;

  return (
    <section id="token-explorer" className="pt-16 pb-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[#62C9F5] tracking-wider uppercase">
            <Layers className="w-4 h-4" />
            <span>Deep Inspection & Patterns</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F1F5FC] tracking-tight">
            EXPLORE YOUR TOKENS
          </h2>
          <p className="text-sm sm:text-base text-[#9AAAC0] max-w-2xl">
            Analyze token occurrence distribution, search substrings, observe text highlights, and detect recurring n-gram patterns in your tokenized sequences.
          </p>
        </div>

        {/* 2-Column Split: Frequency Chart & Search on Left, Occurrences & Patterns on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Search & Frequency Distribution Chart */}
          <div className="lg:col-span-6 space-y-6">
            <div className="lab-glass rounded-2xl p-5 sm:p-6 border border-[#398BFF]/20 space-y-4">
              
              {/* Header & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#398BFF]" />
                  <span className="text-xs font-mono uppercase tracking-wider text-[#9AAAC0]">
                    Token Frequency Distribution
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#9AAAC0] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search token..."
                    className="w-full sm:w-40 bg-[#080F1E] border border-white/10 rounded-lg pl-8 pr-2.5 py-1 text-xs font-mono text-[#F1F5FC] focus:outline-none focus:border-[#398BFF]"
                  />
                </div>
              </div>

              {/* Frequency Bar Chart */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredFrequencies.length === 0 ? (
                  <div className="py-8 text-center text-xs font-mono text-[#9AAAC0]">
                    No tokens found matching &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  filteredFrequencies.map((item, idx) => {
                    const isSelected = selectedToken?.text === item.text || activeHighlightToken === item.text;
                    const barWidth = Math.max((item.count / maxFreq) * 100, 6);

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          soundFx.playSpinClick();
                          setActiveHighlightToken(item.text);
                          onSelectToken(item.segment);
                        }}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#398BFF]/20 border-[#398BFF] shadow-[0_0_12px_rgba(57,139,255,0.25)]'
                            : 'bg-[#080F1E]/80 border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#F1F5FC] bg-[#111C30] px-2 py-0.5 rounded border border-white/5">
                              &quot;{item.text}&quot;
                            </span>
                            <span className="text-[10px] text-[#398BFF]">ID: {item.id}</span>
                          </div>
                          <div className="text-[11px] text-[#9AAAC0]">
                            <span className="text-[#62C9F5] font-bold">{item.count}</span> ({item.percentage}%)
                          </div>
                        </div>

                        {/* Relative Frequency Bar */}
                        <div className="w-full h-2 rounded-full bg-[#111C30] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isSelected
                                ? 'bg-gradient-to-r from-[#398BFF] to-[#62C9F5]'
                                : 'bg-[#398BFF]/60'
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          </div>

          {/* Right Column: Occurrence Heatmap in Text & Repeated N-Grams */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Occurrence Highlighter in Context */}
            <div className="lab-glass rounded-2xl p-5 sm:p-6 border border-[#398BFF]/20 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#62C9F5]" />
                  <span className="text-xs font-mono uppercase tracking-wider text-[#9AAAC0]">
                    Occurrence Highlighter in Source Text
                  </span>
                </div>
                {highlightedTokens && (
                  <button
                    onClick={() => setActiveHighlightToken(null)}
                    className="text-[10px] font-mono text-[#9AAAC0] hover:text-white"
                  >
                    Clear Highlight
                  </button>
                )}
              </div>

              {highlightedTokens ? (
                <div className="text-xs font-mono text-[#9AAAC0]">
                  Highlighting all occurrences of{' '}
                  <span className="text-[#398BFF] font-bold">&quot;{highlightedTokens}&quot;</span>:
                </div>
              ) : (
                <div className="text-xs font-mono text-[#9AAAC0]">
                  Click any token from the frequency list to highlight all its positions in the stream:
                </div>
              )}

              {/* Text Render with Highlighting */}
              <div className="p-4 rounded-xl bg-[#080F1E] border border-white/10 font-mono text-sm leading-relaxed max-h-52 overflow-y-auto whitespace-pre-wrap">
                {tokens.map((t, idx) => {
                  const isMatch = highlightedTokens !== null && t.text === highlightedTokens;
                  return (
                    <span
                      key={idx}
                      onClick={() => {
                        soundFx.playSpinClick();
                        setActiveHighlightToken(t.text);
                        onSelectToken(t);
                      }}
                      className={`inline cursor-pointer transition-all rounded px-0.5 ${
                        isMatch
                          ? 'bg-[#398BFF] text-white font-bold shadow-[0_0_8px_#398BFF]'
                          : 'hover:bg-white/10 text-[#F1F5FC]'
                      }`}
                    >
                      {t.text}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Recurring Token N-Grams / Bigrams */}
            <div className="lab-glass rounded-2xl p-5 sm:p-6 border border-white/5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <Repeat className="w-4 h-4 text-[#2DD4BF]" />
                <span className="text-xs font-mono uppercase tracking-wider text-[#9AAAC0]">
                  Repeated Token Patterns (N-Grams)
                </span>
              </div>

              {repeatedPatterns.length === 0 ? (
                <div className="py-6 text-center text-xs font-mono text-[#9AAAC0]">
                  No repeated token bigrams detected in current input. Type longer text with repeating phrases.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {repeatedPatterns.map((rp, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#080F1E] border border-white/5 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                        <span className="px-1.5 py-0.5 rounded bg-[#111C30] text-[#62C9F5] border border-white/5">
                          {rp.pair[0]}
                        </span>
                        <span className="text-[#9AAAC0]">+</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#111C30] text-[#62C9F5] border border-white/5">
                          {rp.pair[1]}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#2DD4BF]">
                        {rp.count}x
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
