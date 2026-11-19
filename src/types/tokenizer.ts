export type TokenizerType = 'gpt-4' | 'gpt-4o' | 'custom-bpe' | 'word' | 'char';

export interface TokenSegment {
  index: number;
  id: number;
  text: string;
  displayValue: string;
  startIndex: number;
  endIndex: number;
  byteLength: number;
  charLength: number;
  hexBytes: string[];
  codepoints: string[];
  colorIndex: number;
  isWhitespaceOnly: boolean;
  hasLeadingSpace: boolean;
  hasTrailingNewline: boolean;
}

export interface TokenizerModelInfo {
  id: TokenizerType;
  name: string;
  category: 'pretrained' | 'educational' | 'baseline';
  algorithm: string;
  vocabSize: string;
  description: string;
  badge: string;
  subtleColor: string;
}

export interface TokenStatisticsData {
  totalCharacters: number;
  totalWords: number;
  totalTokens: number;
  uniqueTokens: number;
  averageCharsPerToken: number;
  tokenToWordRatio: number;
  totalBytes: number;
  compressionRatio: number;
}

export interface BpePairCount {
  pair: [string, string];
  pairKey: string;
  count: number;
}

export interface BpeStep {
  step: number;
  winningPair: [string, string] | null;
  frequency: number;
  newToken: string | null;
  pairCounts: BpePairCount[];
  sampleWords: { original: string; tokens: string[] }[];
  currentVocabSize: number;
}

export interface BpeTrainingState {
  isTrained: boolean;
  corpus: string;
  initialVocab: string[];
  finalVocab: string[];
  merges: { pair: [string, string]; merged: string; count: number }[];
  steps: BpeStep[];
  currentStepIndex: number;
}

export interface BattleResult {
  type: TokenizerType;
  name: string;
  subtitle: string;
  category: 'Pretrained LLM' | 'Educational BPE' | 'Word-Level Baseline' | 'Character-Level Baseline';
  tokens: TokenSegment[];
  tokenCount: number;
  charsPerToken: number;
  tokensPerWord: number;
  vocabSizeDesc: string;
  efficiencyRating: 'Ultra High' | 'High' | 'Moderate' | 'Low';
  description: string;
  keyFeature: string;
}

export interface TokenFrequencyItem {
  token: string;
  id: number;
  count: number;
  percentage: number;
  positions: number[];
}
