import React from 'react';
import { TokenStatisticsData } from '../../types/tokenizer';
import { FileText, Type, Hash, Sparkles, Scale, Gauge, HardDrive } from 'lucide-react';

interface TokenStatisticsProps {
  stats: TokenStatisticsData;
}

export const TokenStatistics: React.FC<TokenStatisticsProps> = ({ stats }) => {
  const maxMetric = Math.max(stats.totalCharacters, stats.totalWords, stats.totalTokens, 1);
  const charPercent = (stats.totalCharacters / maxMetric) * 100;
  const wordPercent = (stats.totalWords / maxMetric) * 100;
  const tokenPercent = (stats.totalTokens / maxMetric) * 100;

  return (
    <div className="space-y-4">
      {/* 6 Compact Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Characters */}
        <div className="lab-glass-card rounded-xl p-3.5 border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-[#9AAAC0]">
            <span className="text-[11px] font-medium">Characters</span>
            <Type className="w-3.5 h-3.5 text-[#398BFF]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#F1F5FC]">
            {stats.totalCharacters.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#9AAAC0]">Raw length</div>
        </div>

        {/* Total Words */}
        <div className="lab-glass-card rounded-xl p-3.5 border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-[#9AAAC0]">
            <span className="text-[11px] font-medium">Words</span>
            <FileText className="w-3.5 h-3.5 text-[#62C9F5]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#F1F5FC]">
            {stats.totalWords.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#9AAAC0]">Whitespace split</div>
        </div>

        {/* Total Tokens */}
        <div className="lab-glass-card rounded-xl p-3.5 border border-[#398BFF]/30 space-y-1 bg-[#111C30]/90">
          <div className="flex items-center justify-between text-[#9AAAC0]">
            <span className="text-[11px] font-medium text-[#62C9F5]">Total Tokens</span>
            <Hash className="w-3.5 h-3.5 text-[#398BFF]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#398BFF]">
            {stats.totalTokens.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#9AAAC0]">Sequence length</div>
        </div>

        {/* Unique Tokens */}
        <div className="lab-glass-card rounded-xl p-3.5 border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-[#9AAAC0]">
            <span className="text-[11px] font-medium">Unique Tokens</span>
            <Sparkles className="w-3.5 h-3.5 text-[#62C9F5]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#F1F5FC]">
            {stats.uniqueTokens.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#9AAAC0]">Distinct IDs</div>
        </div>

        {/* Avg Chars per Token */}
        <div className="lab-glass-card rounded-xl p-3.5 border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-[#9AAAC0]">
            <span className="text-[11px] font-medium">Chars / Token</span>
            <Scale className="w-3.5 h-3.5 text-[#398BFF]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#F1F5FC]">
            {stats.averageCharsPerToken}
          </div>
          <div className="text-[10px] text-[#9AAAC0]">Compression efficiency</div>
        </div>

        {/* Token-to-Word Ratio */}
        <div className="lab-glass-card rounded-xl p-3.5 border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-[#9AAAC0]">
            <span className="text-[11px] font-medium">Tokens / Word</span>
            <Gauge className="w-3.5 h-3.5 text-[#62C9F5]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#F1F5FC]">
            {stats.tokenToWordRatio}
          </div>
          <div className="text-[10px] text-[#9AAAC0]">Subword fragmentation</div>
        </div>
      </div>

      {/* Comparison Visual Chart */}
      <div className="lab-glass rounded-xl p-4 border border-white/5">
        <div className="flex items-center justify-between text-xs text-[#9AAAC0] mb-3">
          <span className="font-mono uppercase tracking-wider text-[11px]">
            Sequence Compression Comparison
          </span>
          <span className="text-[11px] text-[#62C9F5] font-mono">
            {stats.compressionRatio > 0 ? `${stats.compressionRatio}% savings vs 1-char tokens` : 'Baseline'}
          </span>
        </div>

        <div className="space-y-2.5">
          {/* Characters Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-[#9AAAC0]">
              <span>Characters</span>
              <span className="text-[#F1F5FC]">{stats.totalCharacters}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#080F1E] overflow-hidden">
              <div
                className="h-full bg-[#9AAAC0] rounded-full transition-all duration-500"
                style={{ width: `${charPercent}%` }}
              />
            </div>
          </div>

          {/* Tokens Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-[#9AAAC0]">
              <span className="text-[#62C9F5]">Tokens (Processed)</span>
              <span className="text-[#398BFF] font-semibold">{stats.totalTokens}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#080F1E] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#398BFF] to-[#62C9F5] rounded-full shadow-[0_0_8px_#398BFF] transition-all duration-500"
                style={{ width: `${tokenPercent}%` }}
              />
            </div>
          </div>

          {/* Words Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-[#9AAAC0]">
              <span>Words</span>
              <span className="text-[#F1F5FC]">{stats.totalWords}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#080F1E] overflow-hidden">
              <div
                className="h-full bg-[#38BDF8]/60 rounded-full transition-all duration-500"
                style={{ width: `${wordPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
