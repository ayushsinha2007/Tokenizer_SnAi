import { TokenSegment } from '../types/tokenizer';
import { stringToUtf8Bytes, bytesToHex, stringToCodepoints, formatDisplayToken } from './textUtils';

export function tokenizeCharLevel(text: string): TokenSegment[] {
  if (!text) return [];

  const segments: TokenSegment[] = [];
  const chars = Array.from(text);
  let charOffset = 0;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const startIndex = charOffset;
    const endIndex = startIndex + ch.length;
    charOffset = endIndex;

    const codePoint = ch.codePointAt(0) || 0;
    const bytes = stringToUtf8Bytes(ch);
    const isWhitespaceOnly = /^\s+$/.test(ch);

    segments.push({
      index: i,
      id: codePoint,
      text: ch,
      displayValue: formatDisplayToken(ch),
      startIndex,
      endIndex,
      byteLength: bytes.length,
      charLength: ch.length,
      hexBytes: bytesToHex(bytes),
      codepoints: stringToCodepoints(ch),
      colorIndex: i % 6,
      isWhitespaceOnly,
      hasLeadingSpace: ch === ' ',
      hasTrailingNewline: ch === '\n'
    });
  }

  return segments;
}
