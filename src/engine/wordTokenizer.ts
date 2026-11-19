import { TokenSegment } from '../types/tokenizer';
import { stringToUtf8Bytes, bytesToHex, stringToCodepoints, formatDisplayToken } from './textUtils';

/**
 * Deterministic hash for word to integer token ID
 */
function hashWordToId(word: string): number {
  let hash = 5381;
  for (let i = 0; i < word.length; i++) {
    hash = ((hash << 5) + hash) + word.charCodeAt(i);
    hash = hash & 0x7FFFFFFF; // 31-bit positive int
  }
  return 1000 + (hash % 90000);
}

export function tokenizeWordLevel(text: string): TokenSegment[] {
  if (!text) return [];

  // Match words, whitespace sequences, and individual punctuation marks
  const regex = /(\s+|[a-zA-Z0-9]+|[^\s\w])/g;
  const segments: TokenSegment[] = [];
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = regex.exec(text)) !== null) {
    const raw = match[0];
    const startIndex = match.index;
    const endIndex = startIndex + raw.length;
    const bytes = stringToUtf8Bytes(raw);

    const isWhitespaceOnly = /^\s+$/.test(raw);
    const id = isWhitespaceOnly ? (raw === ' ' ? 32 : 10) : hashWordToId(raw.toLowerCase());

    segments.push({
      index: index++,
      id,
      text: raw,
      displayValue: formatDisplayToken(raw),
      startIndex,
      endIndex,
      byteLength: bytes.length,
      charLength: raw.length,
      hexBytes: bytesToHex(bytes),
      codepoints: stringToCodepoints(raw),
      colorIndex: index % 6,
      isWhitespaceOnly,
      hasLeadingSpace: raw.startsWith(' '),
      hasTrailingNewline: raw.includes('\n')
    });
  }

  return segments;
}
