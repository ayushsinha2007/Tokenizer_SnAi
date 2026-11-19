import React from 'react';
import { TokenSegment } from '../../types/tokenizer';
import { Binary, Copy, Hash, Layers, ShieldCheck } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface TokenInspectorProps {
  token: TokenSegment | null;
  totalTokens: number;
}

export const TokenInspector: React.FC<TokenInspectorProps> = ({ token, totalTokens }) => {
  if (!token) {
    return (
      <div className="lab-glass rounded-2xl p-5 border border-white/5 flex flex-col items-center justify-center text-center min-h-[220px] text-[#9AAAC0]">
        <Layers className="w-8 h-8 text-[#398BFF]/40 mb-2" />
        <span className="text-sm font-medium text-[#F1F5FC]">No Token Selected</span>
        <span className="text-xs text-[#9AAAC0] max-w-xs mt-1">
          Click any token chip in the stream above to inspect its byte sequence, codepoints, and embedding index.
        </span>
      </div>
    );
  }

  const handleCopy = async (val: string) => {
    try {
      await navigator.clipboard.writeText(val);
      soundFx.playSpinClick();
    } catch {
      // Fallback
    }
  };

  return (
    <div className="lab-glass rounded-2xl p-5 sm:p-6 border border-[#398BFF]/30 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#398BFF] shadow-[0_0_8px_#398BFF]" />
          <span className="text-xs font-mono uppercase tracking-wider text-[#9AAAC0]">
            Token Inspector
          </span>
          <span className="text-xs font-mono text-[#62C9F5] px-2 py-0.5 rounded-md bg-[#111C30] border border-white/5">
            Index #{token.index} of {totalTokens}
          </span>
        </div>

        <button
          onClick={() => handleCopy(token.text)}
          className="text-xs text-[#9AAAC0] hover:text-[#F1F5FC] flex items-center gap-1 p-1 rounded hover:bg-white/5 transition-colors"
          title="Copy token string"
        >
          <Copy className="w-3.5 h-3.5 text-[#398BFF]" />
          <span>Copy Token</span>
        </button>
      </div>

      {/* Main Token Display Box */}
      <div className="p-4 rounded-xl bg-[#080F1E] border border-white/10 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-[11px] text-[#9AAAC0] font-mono">TOKEN STRING</div>
          <div className="text-xl sm:text-2xl font-mono text-[#F1F5FC] font-semibold break-all">
            &quot;{token.text}&quot;
          </div>
        </div>
        <div className="text-right space-y-1">
          <div className="text-[11px] text-[#9AAAC0] font-mono">TOKEN ID</div>
          <div className="text-xl sm:text-2xl font-mono text-[#398BFF] font-bold">
            {token.id}
          </div>
        </div>
      </div>

      {/* Grid of properties */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 rounded-lg bg-[#111C30]/80 border border-white/5 space-y-1">
          <span className="text-[10px] text-[#9AAAC0] block">POSITION</span>
          <span className="text-[#F1F5FC] font-semibold">
            [{token.startIndex} .. {token.endIndex}]
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[#111C30]/80 border border-white/5 space-y-1">
          <span className="text-[10px] text-[#9AAAC0] block">CHAR LENGTH</span>
          <span className="text-[#F1F5FC] font-semibold">{token.charLength} chars</span>
        </div>

        <div className="p-3 rounded-lg bg-[#111C30]/80 border border-white/5 space-y-1">
          <span className="text-[10px] text-[#9AAAC0] block">UTF-8 BYTES</span>
          <span className="text-[#F1F5FC] font-semibold">{token.byteLength} Bytes</span>
        </div>

        <div className="p-3 rounded-lg bg-[#111C30]/80 border border-white/5 space-y-1">
          <span className="text-[10px] text-[#9AAAC0] block">WHITESPACE</span>
          <span className="text-[#62C9F5] font-semibold">
            {token.isWhitespaceOnly ? 'Whitespace' : token.hasLeadingSpace ? 'Leading Space' : 'Standard'}
          </span>
        </div>
      </div>

      {/* Hex Bytes & Unicode Codepoints */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* Hex Bytes */}
        <div className="p-3 rounded-lg bg-[#111C30]/80 border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-[#9AAAC0] font-mono">
            <span className="flex items-center gap-1">
              <Binary className="w-3.5 h-3.5 text-[#398BFF]" />
              HEX BYTES
            </span>
            <button
              onClick={() => handleCopy(token.hexBytes.join(' '))}
              className="hover:text-white"
              title="Copy hex values"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {token.hexBytes.map((h, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-[#080F1E] border border-[#398BFF]/20 text-[#62C9F5] font-mono text-xs"
              >
                {h}
              </span>
            ))}
          </div>
        </div>

        {/* Codepoints */}
        <div className="p-3 rounded-lg bg-[#111C30]/80 border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-[#9AAAC0] font-mono">
            <span className="flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-[#62C9F5]" />
              CODEPOINTS
            </span>
            <button
              onClick={() => handleCopy(token.codepoints.join(' '))}
              className="hover:text-white"
              title="Copy codepoints"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {token.codepoints.map((cp, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-[#080F1E] border border-white/10 text-[#F1F5FC] font-mono text-xs"
              >
                {cp}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
