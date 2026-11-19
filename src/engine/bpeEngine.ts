import { TokenSegment, BpeStep, BpePairCount, BpeTrainingState } from '../types/tokenizer';
import { stringToUtf8Bytes, bytesToHex, stringToCodepoints, formatDisplayToken } from './textUtils';

export interface BpeTrainOptions {
  corpus: string;
  maxMerges: number;
}

export interface BpeModel {
  initialVocab: string[];
  finalVocab: string[];
  merges: { pair: [string, string]; merged: string; count: number }[];
  steps: BpeStep[];
  tokenToId: Map<string, number>;
}

export class EducationalBpeEngine {
  private model: BpeModel | null = null;

  constructor() {
    // Train with a default rich corpus so it works right out of the box
    this.train({
      corpus: "low lower lowest newer widest high higher highest spin speed power arena token tokenizer battle",
      maxMerges: 16
    });
  }

  public train(options: BpeTrainOptions): BpeTrainingState {
    const { corpus, maxMerges } = options;
    const cleanText = corpus.trim();
    if (!cleanText) {
      return {
        isTrained: false,
        corpus: '',
        initialVocab: [],
        finalVocab: [],
        merges: [],
        steps: [],
        currentStepIndex: 0
      };
    }

    // 1. Extract words and their frequencies
    const wordsRaw = cleanText.toLowerCase().match(/[a-z0-9]+|[^\s\w]/g) || [];
    const wordFreq = new Map<string, number>();
    for (const w of wordsRaw) {
      wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
    }

    // 2. Initialize words as split characters with </w>
    let words: { tokens: string[]; count: number; original: string }[] = [];
    const initialVocabSet = new Set<string>();

    for (const [w, count] of wordFreq.entries()) {
      const chars = Array.from(w);
      if (chars.length === 0) continue;
      const tokens = [...chars];
      // Mark end of word
      tokens[tokens.length - 1] = tokens[tokens.length - 1] + '</w>';
      
      for (const tok of tokens) {
        initialVocabSet.add(tok);
      }
      words.push({ tokens, count, original: w });
    }

    const initialVocab = Array.from(initialVocabSet).sort();
    const tokenToId = new Map<string, number>();
    let nextId = 100;
    for (const tok of initialVocab) {
      tokenToId.set(tok, nextId++);
    }

    const merges: { pair: [string, string]; merged: string; count: number }[] = [];
    const steps: BpeStep[] = [];

    // Step 0 snapshot (initial state before merges)
    const initialPairCounts = this.countPairs(words);
    steps.push({
      step: 0,
      winningPair: null,
      frequency: 0,
      newToken: null,
      pairCounts: initialPairCounts.slice(0, 8),
      sampleWords: words.slice(0, 6).map(w => ({ original: w.original, tokens: [...w.tokens] })),
      currentVocabSize: initialVocab.length
    });

    // 3. Merging loop
    for (let mergeIdx = 1; mergeIdx <= maxMerges; mergeIdx++) {
      const pairCounts = this.countPairs(words);
      if (pairCounts.length === 0) break;

      const topPair = pairCounts[0];
      if (topPair.count < 1) break;

      const [first, second] = topPair.pair;
      const mergedToken = first + second;

      // Update words with this merge
      words = words.map(w => {
        const newTokens: string[] = [];
        let i = 0;
        while (i < w.tokens.length) {
          if (i < w.tokens.length - 1 && w.tokens[i] === first && w.tokens[i + 1] === second) {
            newTokens.push(mergedToken);
            i += 2;
          } else {
            newTokens.push(w.tokens[i]);
            i++;
          }
        }
        return { ...w, tokens: newTokens };
      });

      tokenToId.set(mergedToken, nextId++);
      merges.push({ pair: topPair.pair, merged: mergedToken, count: topPair.count });

      // Compute pair counts for next step snapshot
      const nextPairs = this.countPairs(words);

      steps.push({
        step: mergeIdx,
        winningPair: topPair.pair,
        frequency: topPair.count,
        newToken: mergedToken,
        pairCounts: nextPairs.slice(0, 8),
        sampleWords: words.slice(0, 6).map(w => ({ original: w.original, tokens: [...w.tokens] })),
        currentVocabSize: initialVocab.length + merges.length
      });
    }

    const finalVocab = Array.from(tokenToId.keys());
    this.model = {
      initialVocab,
      finalVocab,
      merges,
      steps,
      tokenToId
    };

    return {
      isTrained: true,
      corpus: cleanText,
      initialVocab,
      finalVocab,
      merges,
      steps,
      currentStepIndex: steps.length - 1
    };
  }

  private countPairs(words: { tokens: string[]; count: number }[]): BpePairCount[] {
    const pairCounts = new Map<string, { pair: [string, string]; count: number }>();

    for (const w of words) {
      for (let i = 0; i < w.tokens.length - 1; i++) {
        const p: [string, string] = [w.tokens[i], w.tokens[i + 1]];
        const key = `${p[0]}|||${p[1]}`;
        const existing = pairCounts.get(key);
        if (existing) {
          existing.count += w.count;
        } else {
          pairCounts.set(key, { pair: p, count: w.count });
        }
      }
    }

    return Array.from(pairCounts.entries())
      .map(([key, val]) => ({
        pairKey: key,
        pair: val.pair,
        count: val.count
      }))
      .sort((a, b) => b.count - a.count);
  }

  public tokenize(text: string): TokenSegment[] {
    if (!this.model) {
      this.train({
        corpus: "low lower lowest newer widest high higher highest spin speed power arena token tokenizer battle",
        maxMerges: 16
      });
    }

    const model = this.model!;
    const segments: TokenSegment[] = [];
    if (!text) return segments;

    // Split text into words and delimiters (preserves whitespace and punctuation)
    const regex = /(\s+|[a-zA-Z0-9]+|[^\s\w])/g;
    let match: RegExpExecArray | null;
    let tokenIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      const chunk = match[0];
      const chunkStart = match.index;

      // If chunk is whitespace, treat as individual whitespace token
      if (/^\s+$/.test(chunk)) {
        const bytes = stringToUtf8Bytes(chunk);
        segments.push({
          index: tokenIndex++,
          id: 32, // space ID baseline
          text: chunk,
          displayValue: formatDisplayToken(chunk),
          startIndex: chunkStart,
          endIndex: chunkStart + chunk.length,
          byteLength: bytes.length,
          charLength: chunk.length,
          hexBytes: bytesToHex(bytes),
          codepoints: stringToCodepoints(chunk),
          colorIndex: tokenIndex % 6,
          isWhitespaceOnly: true,
          hasLeadingSpace: false,
          hasTrailingNewline: chunk.includes('\n')
        });
        continue;
      }

      // Word BPE tokenization
      const lower = chunk.toLowerCase();
      const chars = Array.from(lower);
      let tokens: string[] = [...chars];
      tokens[tokens.length - 1] = tokens[tokens.length - 1] + '</w>';

      // Apply learned merges in order
      for (const merge of model.merges) {
        const [first, second] = merge.pair;
        const newTokens: string[] = [];
        let i = 0;
        while (i < tokens.length) {
          if (i < tokens.length - 1 && tokens[i] === first && tokens[i + 1] === second) {
            newTokens.push(first + second);
            i += 2;
          } else {
            newTokens.push(tokens[i]);
            i++;
          }
        }
        tokens = newTokens;
      }

      // Map back to original chunk casing and character offsets
      let subOffset = 0;
      for (const tok of tokens) {
        const cleanTok = tok.replace('</w>', '');
        const segLen = cleanTok.length;
        const originalSlice = chunk.substring(subOffset, subOffset + segLen) || cleanTok;
        const segStart = chunkStart + subOffset;
        const segEnd = segStart + originalSlice.length;
        subOffset += segLen;

        const bytes = stringToUtf8Bytes(originalSlice);
        const tokenId = model.tokenToId.get(tok) || 9999; // Fallback ID

        segments.push({
          index: tokenIndex++,
          id: tokenId,
          text: originalSlice,
          displayValue: formatDisplayToken(originalSlice),
          startIndex: segStart,
          endIndex: segEnd,
          byteLength: bytes.length,
          charLength: originalSlice.length,
          hexBytes: bytesToHex(bytes),
          codepoints: stringToCodepoints(originalSlice),
          colorIndex: tokenIndex % 6,
          isWhitespaceOnly: false,
          hasLeadingSpace: false,
          hasTrailingNewline: false
        });
      }
    }

    return segments;
  }

  public getModel(): BpeModel | null {
    return this.model;
  }
}

export const defaultBpeEngine = new EducationalBpeEngine();
