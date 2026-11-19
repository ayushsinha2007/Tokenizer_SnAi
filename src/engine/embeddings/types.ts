export type EmbeddingModelType = 'semantic-centroid' | 'transformers-minilm' | 'lexical-tfidf';

export interface SentenceItem {
  id: string;
  text: string;
  category: 'sample' | 'user';
  createdAt: number;
  vector?: number[]; // Raw high-dimensional embedding
  coords3D?: {
    x: number; // PC1
    y: number; // PC2
    z: number; // PC3
  };
}

export interface PcaResult {
  coordinates: { id: string; x: number; y: number; z: number }[];
  explainedVariance: [number, number, number]; // Percentage of variance explained by PC1, PC2, PC3
  eigenvalues: [number, number, number];
}

export interface SimilarityResult {
  sentenceA: SentenceItem;
  sentenceB: SentenceItem;
  cosineSimilarity: number; // -1.0 to 1.0 (or normalized 0 to 100%)
  explanation: string;
  isHighDimensional: boolean;
  dimensionCount: number;
}

export interface ModelLoadingState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  progress?: number;
  message?: string;
  modelName: string;
  dimensions: number;
}
