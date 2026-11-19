import { encode as encodeGpt4, decode as decodeGpt4 } from 'gpt-tokenizer';
import { encode as encodeGpt4o, decode as decodeGpt4o } from 'gpt-tokenizer/model/gpt-4o';
import { TokenSegment } from '../types/tokenizer';
import { stringToUtf8Bytes, bytesToHex, stringToCodepoints, formatDisplayToken } from './textUtils';

export function tokenizePretrained(text: string, model: 'gpt-4' | 'gpt-4o'): TokenSegment[] {
  if (!text) return [];

  const encodeFn = model === 'gpt-4o' ? encodeGpt4o : encodeGpt4;
  const decodeFn = model === 'gpt-4o' ? decodeGpt4o : decodeGpt4;

  const tokenIds = encodeFn(text);
  const segments: TokenSegment[] = [];

  let currentOffset = 0;

  for (let i = 0; i < tokenIds.length; i++) {
    const id = tokenIds[i];
    let pieceText = '';
    
    try {
      pieceText = decodeFn([id]);
    } catch {
      pieceText = '';
    }

    // Clean any replacement characters
    if (pieceText === '\uFFFD' || pieceText === '') {
      // If this token is an incomplete multi-byte fragment (e.g. part of an emoji),
      // represent it accurately as a byte token
      pieceText = `[byte: #${id}]`;
    }

    // Calculate start & end indices in text
    let startIndex = currentOffset;
    let endIndex = currentOffset;

    if (!pieceText.startsWith('[byte: #')) {
      const matchPos = text.indexOf(pieceText, currentOffset);
      if (matchPos !== -1 && matchPos <= currentOffset + 10) {
        startIndex = matchPos;
        endIndex = matchPos + pieceText.length;
        currentOffset = endIndex;
      } else {
        startIndex = currentOffset;
        endIndex = Math.min(currentOffset + pieceText.length, text.length);
        currentOffset = endIndex;
      }
    } else {
      // Partial byte: does not advance character offset until full character completes
      endIndex = Math.min(currentOffset + 1, text.length);
    }

    const bytes = pieceText.startsWith('[byte: #') 
      ? [id % 256] 
      : stringToUtf8Bytes(pieceText);

    const isWhitespaceOnly = /^\s+$/.test(pieceText);
    const hasLeadingSpace = pieceText.startsWith(' ');
    const hasTrailingNewline = pieceText.endsWith('\n');

    segments.push({
      index: i,
      id,
      text: pieceText,
      displayValue: formatDisplayToken(pieceText),
      startIndex,
      endIndex,
      byteLength: bytes.length,
      charLength: pieceText.length,
      hexBytes: bytesToHex(bytes),
      codepoints: stringToCodepoints(pieceText),
      colorIndex: i % 6,
      isWhitespaceOnly,
      hasLeadingSpace,
      hasTrailingNewline
    });
  }

  return segments;
}
