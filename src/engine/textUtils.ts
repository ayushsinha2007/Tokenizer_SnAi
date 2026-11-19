/**
 * Utility functions for text, unicode, and byte inspection
 */

export function stringToUtf8Bytes(str: string): number[] {
  const encoder = new TextEncoder();
  return Array.from(encoder.encode(str));
}

export function bytesToHex(bytes: number[]): string[] {
  return bytes.map(b => '0x' + b.toString(16).toUpperCase().padStart(2, '0'));
}

export function stringToCodepoints(str: string): string[] {
  const codepoints: string[] = [];
  for (const ch of str) {
    const code = ch.codePointAt(0);
    if (code !== undefined) {
      codepoints.push('U+' + code.toString(16).toUpperCase().padStart(4, '0'));
    }
  }
  return codepoints;
}

/**
 * Creates visual representation for special characters like spaces, newlines, tabs
 */
export function formatDisplayToken(raw: string): string {
  if (raw === ' ') return '␣';
  if (raw === '\n') return '↵';
  if (raw === '\t') return '⇥';
  if (raw === '\r') return '␍';

  // Replace whitespace inside or at edges with subtle symbols
  let formatted = raw
    .replace(/ /g, '·')
    .replace(/\n/g, '↵')
    .replace(/\t/g, '⇥');

  return formatted;
}
