/**
 * Lexical TF-IDF Vectorizer
 * 
 * Computes frequency-based sparse vectors over word and character 3-gram tokens.
 * Clearly designated as a Lexical Similarity Visualization.
 */

const LEXICAL_DIMENSIONS = 64;

export function embedLexicalTfIdf(sentence: string, allCorpusSentences: string[]): number[] {
  const clean = sentence.toLowerCase().trim();
  if (!clean) return new Array(LEXICAL_DIMENSIONS).fill(0);

  // 1. Extract terms: words + character 3-grams
  const words = clean.split(/\s+/).filter(Boolean);
  const ngrams: string[] = [];
  const bounded = `<${clean.replace(/\s+/g, '_')}>`;
  for (let i = 0; i <= bounded.length - 3; i++) {
    ngrams.push(bounded.substring(i, i + 3));
  }

  const terms = [...words, ...ngrams];
  const termCounts = new Map<string, number>();
  for (const t of terms) {
    termCounts.set(t, (termCounts.get(t) || 0) + 1);
  }

  // 2. Compute Term Frequency * Inverse Document Frequency
  const vector = new Array(LEXICAL_DIMENSIONS).fill(0);
  const corpusSize = Math.max(allCorpusSentences.length, 1);

  termCounts.forEach((count, term) => {
    // Term Frequency (sublinear scaling)
    const tf = 1 + Math.log(count);

    // Document Frequency across corpus
    let df = 0;
    for (const doc of allCorpusSentences) {
      if (doc.toLowerCase().includes(term)) df++;
    }
    const idf = Math.log(1 + (corpusSize / (df + 1)));
    const tfidf = tf * idf;

    // Feature hashing to LEXICAL_DIMENSIONS
    let hash = 5381;
    for (let i = 0; i < term.length; i++) {
      hash = ((hash << 5) + hash) + term.charCodeAt(i);
      hash = hash & 0x7FFFFFFF;
    }
    const index = hash % LEXICAL_DIMENSIONS;
    const sign = (hash >> 16) % 2 === 0 ? 1 : -1;

    vector[index] += sign * tfidf;
  });

  // L2-normalize
  const norm = Math.hypot(...vector) || 1;
  return vector.map(v => v / norm);
}
