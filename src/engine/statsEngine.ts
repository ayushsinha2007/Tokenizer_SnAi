import { TokenSegment, TokenStatisticsData } from '../types/tokenizer';

export function calculateTokenStatistics(text: string, tokens: TokenSegment[]): TokenStatisticsData {
  const totalCharacters = text.length;

  // Words count (standard whitespace separated words)
  const trimmed = text.trim();
  const totalWords = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).filter(Boolean).length;

  const totalTokens = tokens.length;
  const uniqueTokensSet = new Set(tokens.map(t => t.id));
  const uniqueTokens = uniqueTokensSet.size;

  const averageCharsPerToken = totalTokens > 0 
    ? Number((totalCharacters / totalTokens).toFixed(2)) 
    : 0;

  const tokenToWordRatio = totalWords > 0 
    ? Number((totalTokens / totalWords).toFixed(2)) 
    : 0;

  const totalBytes = tokens.reduce((acc, t) => acc + t.byteLength, 0);

  // Compression factor: how much shorter sequence length is compared to character-level (1 char = 1 token)
  const compressionRatio = totalCharacters > 0 && totalTokens > 0
    ? Number((((totalCharacters - totalTokens) / totalCharacters) * 100).toFixed(1))
    : 0;

  return {
    totalCharacters,
    totalWords,
    totalTokens,
    uniqueTokens,
    averageCharsPerToken,
    tokenToWordRatio,
    totalBytes,
    compressionRatio
  };
}
