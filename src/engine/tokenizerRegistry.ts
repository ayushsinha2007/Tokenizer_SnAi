import { TokenizerModelInfo, TokenizerType, TokenSegment, BattleResult } from '../types/tokenizer';
import { tokenizePretrained } from './pretrainedTokenizer';
import { tokenizeWordLevel } from './wordTokenizer';
import { tokenizeCharLevel } from './charTokenizer';
import { EducationalBpeEngine, defaultBpeEngine } from './bpeEngine';

export const AVAILABLE_MODELS: TokenizerModelInfo[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4 / GPT-3.5',
    category: 'pretrained',
    algorithm: 'Byte-Pair Encoding (cl100k_base)',
    vocabSize: '100,264 tokens',
    description: 'Industry-standard production LLM tokenizer. Handles arbitrary text and code with byte-level fallback for unseen UTF-8 bytes.',
    badge: 'Pretrained cl100k',
    subtleColor: 'text-[#398BFF]'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o (Omni)',
    category: 'pretrained',
    algorithm: 'Byte-Pair Encoding (o200k_base)',
    vocabSize: '200,006 tokens',
    description: 'Next-generation expanded vocabulary tokenizer. Drastically improves compression for non-English scripts, code, and math.',
    badge: 'Pretrained o200k',
    subtleColor: 'text-[#62C9F5]'
  },
  {
    id: 'custom-bpe',
    name: 'Custom BPE Lab',
    category: 'educational',
    algorithm: 'Byte-Pair Encoding (Trained in Lab)',
    vocabSize: 'Dynamic (15 - 150 tokens)',
    description: 'Real Byte-Pair Encoding trained directly in the Vocabulary Lab on your chosen corpus. Shows exact merge operations and rules.',
    badge: 'Interactive BPE',
    subtleColor: 'text-[#2DD4BF]'
  },
  {
    id: 'word',
    name: 'Word-Level Baseline',
    category: 'baseline',
    algorithm: 'Whitespace & Punctuation Splitting',
    vocabSize: 'Unbounded / OOV prone',
    description: 'Splits on spaces and punctuation. Fast and intuitive, but suffers from severe out-of-vocabulary (OOV) and morphology blindness.',
    badge: 'Baseline Word',
    subtleColor: 'text-[#9AAAC0]'
  },
  {
    id: 'char',
    name: 'Character-Level Baseline',
    category: 'baseline',
    algorithm: 'Direct Unicode Codepoint Mapping',
    vocabSize: '~1,000 - 149k Unicode chars',
    description: 'Treats each character as a discrete token. Zero out-of-vocabulary errors, but results in massive sequence lengths and quadratic compute.',
    badge: 'Baseline Char',
    subtleColor: 'text-[#FF7A45]'
  }
];

export function tokenizeWithModel(
  text: string, 
  model: TokenizerType, 
  bpeEngine: EducationalBpeEngine = defaultBpeEngine
): TokenSegment[] {
  switch (model) {
    case 'gpt-4':
      return tokenizePretrained(text, 'gpt-4');
    case 'gpt-4o':
      return tokenizePretrained(text, 'gpt-4o');
    case 'custom-bpe':
      return bpeEngine.tokenize(text);
    case 'word':
      return tokenizeWordLevel(text);
    case 'char':
      return tokenizeCharLevel(text);
    default:
      return tokenizePretrained(text, 'gpt-4');
  }
}

export function runBattleComparison(
  text: string,
  bpeEngine: EducationalBpeEngine = defaultBpeEngine
): BattleResult[] {
  const gpt4Tokens = tokenizePretrained(text, 'gpt-4');
  const bpeTokens = bpeEngine.tokenize(text);
  const wordTokens = tokenizeWordLevel(text);
  const charTokens = tokenizeCharLevel(text);

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = text.length;

  const calcCharsPerToken = (tokens: TokenSegment[]) => 
    tokens.length > 0 ? Number((charCount / tokens.length).toFixed(2)) : 0;
  const calcTokensPerWord = (tokens: TokenSegment[]) => 
    wordCount > 0 ? Number((tokens.length / wordCount).toFixed(2)) : 0;

  return [
    {
      type: 'gpt-4',
      name: 'GPT-4 (cl100k_base)',
      subtitle: 'Production Pretrained Subword BPE',
      category: 'Pretrained LLM',
      tokens: gpt4Tokens,
      tokenCount: gpt4Tokens.length,
      charsPerToken: calcCharsPerToken(gpt4Tokens),
      tokensPerWord: calcTokensPerWord(gpt4Tokens),
      vocabSizeDesc: '100,264 tokens',
      efficiencyRating: 'Ultra High',
      description: 'Optimal balance of vocabulary size and sequence length. High compression ratio on natural language and code.',
      keyFeature: 'Byte-level fallback ensures zero OOV failures'
    },
    {
      type: 'custom-bpe',
      name: 'Educational BPE',
      subtitle: 'Corpus-Trained Pair Merge Model',
      category: 'Educational BPE',
      tokens: bpeTokens,
      tokenCount: bpeTokens.length,
      charsPerToken: calcCharsPerToken(bpeTokens),
      tokensPerWord: calcTokensPerWord(bpeTokens),
      vocabSizeDesc: `${bpeEngine.getModel()?.finalVocab.length || 30} tokens`,
      efficiencyRating: 'High',
      description: 'Learns subwords directly from corpus statistics. Shows exact step-by-step fusion mechanics.',
      keyFeature: 'Adapts to frequent roots, suffixes, and patterns'
    },
    {
      type: 'word',
      name: 'Word-Level Tokenizer',
      subtitle: 'Whitespace & Delimiter Tokenizer',
      category: 'Word-Level Baseline',
      tokens: wordTokens,
      tokenCount: wordTokens.length,
      charsPerToken: calcCharsPerToken(wordTokens),
      tokensPerWord: calcTokensPerWord(wordTokens),
      vocabSizeDesc: 'Unbounded (>500,000 words)',
      efficiencyRating: 'Moderate',
      description: 'Very short sequence lengths, but dictionary memory explodes and cannot generalize to typos or new words.',
      keyFeature: 'High risk of Out-Of-Vocabulary (OOV) tokens'
    },
    {
      type: 'char',
      name: 'Character-Level Tokenizer',
      subtitle: 'Pure Codepoint Representation',
      category: 'Character-Level Baseline',
      tokens: charTokens,
      tokenCount: charTokens.length,
      charsPerToken: calcCharsPerToken(charTokens),
      tokensPerWord: calcTokensPerWord(charTokens),
      vocabSizeDesc: '~256 - 1,000 characters',
      efficiencyRating: 'Low',
      description: 'Zero out-of-vocabulary issues, but sequence length multiplies 4x - 6x, blowing up quadratic transformer attention.',
      keyFeature: 'Extreme sequence overhead degrades LLM context'
    }
  ];
}
