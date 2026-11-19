import React, { useState, useMemo } from 'react';
import { TokenSegment } from '../../types/tokenizer';
import { Search, Copy, Check, Filter, Download, ListOrdered, Sparkles } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface TokenBreakdownTableProps {
  tokens: TokenSegment[];
  onSelectToken: (token: TokenSegment) => void;
  selectedToken: TokenSegment | null;
}

export const TokenBreakdownTable: React.FC<TokenBreakdownTableProps> = ({
  tokens,
  onSelectToken,
  selectedToken
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightRepeated, setHighlightRepeated] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copyAllStatus, setCopyAllStatus] = useState<string | null>(null);

  // Identify repeated token IDs
  const repeatedIds = useMemo(() => {
    const counts = new Map<number, number>();
    tokens.forEach(t => counts.set(t.id, (counts.get(t.id) || 0) + 1));
    const set = new Set<number>();
    counts.forEach((c, id) => {
      if (c > 1) set.add(id);
    });
    return set;
  }, [tokens]);

  // Filtered tokens
  const filteredTokens = useMemo(() => {
    if (!searchTerm.trim()) return tokens;
    const term = searchTerm.toLowerCase();
    return tokens.filter(t =>
      t.text.toLowerCase().includes(term) ||
      t.id.toString().includes(term) ||
      t.index.toString() === term
    );
  }, [tokens, searchTerm]);

  const handleCopySingle = async (t: TokenSegment, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(t.text);
      soundFx.playSpinClick();
      setCopiedIndex(t.index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      // Fallback
    }
  };

  const handleCopyAllIds = async () => {
    try {
      const ids = tokens.map(t => t.id);
      await navigator.clipboard.writeText(JSON.stringify(ids));
      soundFx.playSpinClick();
      setCopyAllStatus('Copied IDs!');
      setTimeout(() => setCopyAllStatus(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyAllJson = async () => {
    try {
      const json = JSON.stringify(tokens, null, 2);
      await navigator.clipboard.writeText(json);
      soundFx.playSpinClick();
      setCopyAllStatus('Copied JSON!');
      setTimeout(() => setCopyAllStatus(null), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="lab-glass rounded-2xl p-5 sm:p-6 border border-[#398BFF]/20 space-y-4">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-[#398BFF]" />
          <h3 className="text-base sm:text-lg font-bold text-[#F1F5FC] tracking-tight">
            Token Breakdown Table
          </h3>
          <span className="text-xs font-mono text-[#62C9F5] px-2 py-0.5 rounded-full bg-[#111C30] border border-white/5">
            {filteredTokens.length} of {tokens.length}
          </span>
        </div>

        {/* Right Action Tools */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-[#9AAAC0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search token / ID..."
              className="w-full bg-[#080F1E] border border-white/10 focus:border-[#398BFF] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F1F5FC] font-mono placeholder:text-[#9AAAC0]/50 focus:outline-none"
            />
          </div>

          {/* Highlight repeated toggle */}
          <button
            onClick={() => {
              soundFx.playSpinClick();
              setHighlightRepeated(!highlightRepeated);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-colors flex items-center gap-1.5 ${
              highlightRepeated
                ? 'bg-[#FF7A45]/20 border-[#FF7A45]/40 text-[#FF7A45]'
                : 'bg-[#111C30] border-white/5 text-[#9AAAC0] hover:text-[#F1F5FC]'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Repeated</span>
          </button>

          {/* Copy All Dropdown / Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyAllIds}
              className="px-2.5 py-1.5 rounded-lg bg-[#111C30] hover:bg-white/10 border border-white/5 text-[#9AAAC0] hover:text-[#F1F5FC] text-xs font-mono transition-colors flex items-center gap-1"
              title="Copy token IDs array [9906, 11, ...]"
            >
              <Copy className="w-3 h-3 text-[#398BFF]" />
              <span>{copyAllStatus || 'Copy IDs'}</span>
            </button>
            <button
              onClick={handleCopyAllJson}
              className="px-2.5 py-1.5 rounded-lg bg-[#111C30] hover:bg-white/10 border border-white/5 text-[#9AAAC0] hover:text-[#F1F5FC] text-xs font-mono transition-colors"
              title="Export all token objects as JSON"
            >
              JSON
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#080F1E]/60 max-h-[420px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead className="bg-[#111C30]/90 text-[#9AAAC0] uppercase tracking-wider sticky top-0 z-10 border-b border-white/10">
            <tr>
              <th className="py-2.5 px-4 font-semibold w-16">Pos</th>
              <th className="py-2.5 px-4 font-semibold">Token</th>
              <th className="py-2.5 px-4 font-semibold">Token ID</th>
              <th className="py-2.5 px-4 font-semibold">Char Length</th>
              <th className="py-2.5 px-4 font-semibold">UTF-8 Bytes</th>
              <th className="py-2.5 px-4 font-semibold text-right w-20">Copy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[#F1F5FC]">
            {filteredTokens.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#9AAAC0]">
                  No matching tokens found.
                </td>
              </tr>
            ) : (
              filteredTokens.map((t) => {
                const isSelected = selectedToken?.index === t.index;
                const isRepeated = highlightRepeated && repeatedIds.has(t.id);
                return (
                  <tr
                    key={t.index}
                    onClick={() => {
                      soundFx.playSpinClick();
                      onSelectToken(t);
                    }}
                    className={`hover:bg-[#111C30] cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#398BFF]/15 border-l-2 border-[#398BFF]' : ''
                    } ${isRepeated ? 'bg-[#FF7A45]/10' : ''}`}
                  >
                    {/* Position */}
                    <td className="py-2.5 px-4 text-[#9AAAC0] font-semibold">
                      #{t.index}
                    </td>

                    {/* Token display */}
                    <td className="py-2.5 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#111C30] border border-white/10 max-w-xs truncate">
                        {t.hasLeadingSpace && (
                          <span className="text-[#62C9F5] text-[10px] select-none font-sans">
                            ·
                          </span>
                        )}
                        <span className="text-[#F1F5FC] font-semibold whitespace-pre">
                          {t.displayValue}
                        </span>
                        {isRepeated && (
                          <span className="text-[9px] px-1 rounded bg-[#FF7A45]/20 text-[#FF7A45] border border-[#FF7A45]/30">
                            duplicate
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Token ID */}
                    <td className="py-2.5 px-4 text-[#398BFF] font-bold">
                      {t.id}
                    </td>

                    {/* Character Length */}
                    <td className="py-2.5 px-4 text-[#9AAAC0]">
                      {t.charLength}
                    </td>

                    {/* UTF-8 Bytes */}
                    <td className="py-2.5 px-4 text-[#9AAAC0]">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[#62C9F5]">{t.byteLength} B</span>
                        <span className="text-[10px] text-[#9AAAC0]/60">
                          ({t.hexBytes.slice(0, 2).join(' ')}{t.hexBytes.length > 2 ? '…' : ''})
                        </span>
                      </div>
                    </td>

                    {/* Copy action */}
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={(e) => handleCopySingle(t, e)}
                        className="p-1 rounded hover:bg-white/10 text-[#9AAAC0] hover:text-[#F1F5FC] transition-colors"
                        title="Copy token string"
                      >
                        {copiedIndex === t.index ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
