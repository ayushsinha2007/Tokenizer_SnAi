import { SentenceItem, SimilarityResult } from './types';

export function calculateCosineSimilarity(
  sentenceA: SentenceItem,
  sentenceB: SentenceItem
): SimilarityResult {
  const vecA = sentenceA.vector;
  const vecB = sentenceB.vector;

  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) {
    return {
      sentenceA,
      sentenceB,
      cosineSimilarity: 0,
      explanation: 'Vectors not available for one or both sentences.',
      isHighDimensional: true,
      dimensionCount: 0,
    };
  }

  const d = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < d; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  const rawCos = (normA > 0 && normB > 0) ? dotProduct / (normA * normB) : 0;
  // Clamp between -1.0 and 1.0 to guard against floating-point edge cases
  const cosine = Math.max(-1.0, Math.min(1.0, Number(rawCos.toFixed(4))));

  // Generate beginner-friendly educational explanation
  let explanation = '';
  if (cosine >= 0.75) {
    explanation = 'Strong Semantic Alignment: These two sentences share heavy conceptual themes (such as artificial intelligence, learning, and neural processing). Their embedding vectors point in nearly the same multidimensional direction.';
  } else if (cosine >= 0.45) {
    explanation = 'Moderate Thematic Overlap: These sentences share related domains (e.g., programming and computing systems), but focus on different specific subtopics.';
  } else if (cosine >= 0.20) {
    explanation = 'Slight Conceptual Association: Mild connection through general technological or worldly vocabulary, but largely separate intent and vocabulary.';
  } else {
    explanation = 'Orthogonal / Divergent Topics: These sentences occupy completely distinct semantic domains (e.g., spinning arena battles vs. artificial intelligence algorithms). In vector space, their angle approaches 90 degrees.';
  }

  return {
    sentenceA,
    sentenceB,
    cosineSimilarity: cosine,
    explanation,
    isHighDimensional: true,
    dimensionCount: d,
  };
}
