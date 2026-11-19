import React, { useState } from 'react';
import { TokenSegment } from '../../types/tokenizer';
import { soundFx } from '../../utils/audio';
import { Eye, Info } from 'lucide-react';

interface TokenVisualizerProps {
  tokens: TokenSegment[];
  selectedToken: TokenSegment | null;
  onSelectToken: (token: TokenSegment) => void;
  highlightTokenId?: number | null;
}

const TINT_CLASSES = [
  'bg-[#398BFF]/15 border-[#398BFF]/35 hover:border-[#398BFF]/70 text-[#F1F5FC]',
  'bg-[#1E40AF]/20 border-[#3B82F6]/35 hover:border-[#3B82F6]/70 text-[#F1F5FC]',
  'bg-[#0284C7]/15 border-[#38BDF8]/35 hover:border-[#38BDF8]/70 text-[#F1F5FC]',
  'bg-[#0F766E]/20 border-[#2DD4BF]/35 hover:border-[#2DD4BF]/70 text-[#F1F5FC]',
  'bg-[#3730A3]/25 border-[#818CF8]/35 hover:border-[#818CF8]/70 text-[#F1F5FC]',
  'bg-[#1E293B]/70 border-[#475569]/50 hover:border-[#475569]/80 text-[#F1F5FC]',
];

export const TokenVisualizer: React.FC<TokenVisualizerProps> = ({
  tokens,
  selectedToken,
  onSelectToken,
  highlightTokenId
}) => {
  const [hoveredToken, setHoveredToken] = useState<TokenSegment | null>(null);

  const handleTokenClick = (tok: TokenSegment) => {
    soundFx.playSpinClick();
    onSelectToken(tok);
  };

  const handleTokenMouseEnter = (tok: TokenSegment) => {
    soundFx.playTokenHover();
    setHoveredToken(tok);
  };

  return (
    <div className="lab-glass rounded-2xl p-5 sm:p-6 border border-[#398BFF]/20 space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#398BFF]" />
          <span className="text-xs font-mono uppercase tracking-wider text-[#9AAAC0]">
            Segmented Token Arena
          </span>
          <span className="text-[11px] font-mono text-[#62C9F5] px-2 py-0.5 rounded-full bg-[#111C30] border border-white/5">
            {tokens.length} {tokens.length === 1 ? 'Token' : 'Tokens'}
          </span>
        </div>

        <div className="text-xs text-[#9AAAC0] flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#398BFF]" />
          <span>Click any token block to inspect byte structure</span>
        </div>
      </div>

      {/* Visual Token Stream */}
      {tokens.length === 0 ? (
        <div className="py-12 text-center text-[#9AAAC0] font-mono text-sm border border-dashed border-white/10 rounded-xl">
          Enter text above and click <span className="text-[#398BFF] font-semibold">TOKENIZE</span> to visualize tokens.
        </div>
      ) : (
        <div className="min-h-[140px] max-h-[380px] overflow-y-auto p-4 rounded-xl bg-[#080F1E]/80 border border-white/5 flex flex-wrap gap-1.5 content-start items-center">
          {tokens.map((token) => {
            const isSelected = selectedToken?.index === token.index;
            const isHighlighted = highlightTokenId !== undefined && highlightTokenId === token.id;
            const tintClass = TINT_CLASSES[token.colorIndex % TINT_CLASSES.length];

            return (
              <div
                key={`${token.index}-${token.id}`}
                className="relative group"
                onMouseEnter={() => handleTokenMouseEnter(token)}
                onMouseLeave={() => setHoveredToken(null)}
              >
                <button
                  onClick={() => handleTokenClick(token)}
                  className={`px-2 py-1 rounded-md text-xs sm:text-sm font-mono border transition-all duration-150 inline-flex items-center gap-1 cursor-pointer select-none ${tintClass} ${
                    isSelected
                      ? 'ring-2 ring-[#398BFF] bg-[#398BFF]/30 shadow-[0_0_12px_rgba(57,139,255,0.4)] scale-105 z-20'
                      : ''
                  } ${
                    isHighlighted
                      ? 'ring-2 ring-[#FF7A45] bg-[#FF7A45]/20 shadow-[0_0_10px_rgba(255,122,69,0.5)]'
                      : ''
                  }`}
                >
                  {/* Leading space indicator */}
                  {token.hasLeadingSpace && (
                    <span className="text-[10px] text-[#62C9F5]/70 -mr-0.5 select-none font-sans">
                      ·
                    </span>
                  )}

                  {/* Token text content */}
                  <span className="whitespace-pre">
                    {token.displayValue}
                  </span>

                  {/* Micro token ID tag */}
                  <span className="text-[9px] text-[#9AAAC0]/80 font-mono ml-0.5 border-l border-white/10 pl-1">
                    {token.id}
                  </span>
                </button>

                {/* Subtle Hover Tooltip */}
                {hoveredToken?.index === token.index && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-[#111C30] border border-[#398BFF]/40 text-[#F1F5FC] p-2.5 rounded-lg shadow-xl shadow-black/80 z-30 pointer-events-none text-left space-y-1">
                    <div className="flex items-center justify-between gap-3 text-[11px] font-mono border-b border-white/10 pb-1">
                      <span className="text-[#62C9F5]">Token #{token.index}</span>
                      <span className="text-[#398BFF] font-semibold">ID: {token.id}</span>
                    </div>
                    <div className="text-xs font-mono text-white truncate max-w-[200px]">
                      &quot;{token.text}&quot;
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 text-[10px] text-[#9AAAC0] font-mono">
                      <span>Length: {token.charLength} chars</span>
                      <span>Bytes: {token.byteLength} B</span>
                      <span>Range: [{token.startIndex}..{token.endIndex}]</span>
                      <span>Hex: {token.hexBytes[0] || 'N/A'}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
