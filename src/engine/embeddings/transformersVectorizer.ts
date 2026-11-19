import { ModelLoadingState } from './types';

// Singleton instance for in-browser MiniLM pipeline
let extractorPromise: Promise<unknown> | null = null;
let currentExtractor: unknown = null;

export async function getTransformersExtractor(
  onProgress?: (state: ModelLoadingState) => void
): Promise<unknown> {
  if (currentExtractor) return currentExtractor;
  if (extractorPromise) return extractorPromise;

  extractorPromise = (async () => {
    try {
      if (onProgress) {
        onProgress({
          status: 'loading',
          progress: 10,
          message: 'Initializing Transformers.js runtime...',
          modelName: 'Xenova/all-MiniLM-L6-v2',
          dimensions: 384,
        });
      }

      // Dynamic import to avoid bundling weight runtime upfront
      const { pipeline, env } = await import('@xenova/transformers');

      // Configure runtime for browser safety
      env.allowLocalModels = false;
      env.useBrowserCache = true;

      const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        progress_callback: (info: { progress?: number; status?: string }) => {
          if (onProgress && info.progress !== undefined) {
            onProgress({
              status: 'loading',
              progress: Math.round(info.progress),
              message: `Downloading model weights (${Math.round(info.progress)}%)...`,
              modelName: 'Xenova/all-MiniLM-L6-v2',
              dimensions: 384,
            });
          }
        },
      });

      currentExtractor = extractor;

      if (onProgress) {
        onProgress({
          status: 'ready',
          progress: 100,
          message: 'MiniLM Neural Embedding Model Ready (384-D)',
          modelName: 'Xenova/all-MiniLM-L6-v2',
          dimensions: 384,
        });
      }

      return extractor;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      if (onProgress) {
        onProgress({
          status: 'error',
          message: `Could not load Transformers.js: ${errMsg}. Using Semantic Centroid fallback.`,
          modelName: 'Xenova/all-MiniLM-L6-v2',
          dimensions: 384,
        });
      }
      extractorPromise = null;
      throw err;
    }
  })();

  return extractorPromise;
}

export async function embedWithMiniLM(sentence: string, extractor: unknown): Promise<number[]> {
  if (!extractor) throw new Error('Extractor not ready');
  // @xenova/transformers feature-extraction output with mean pooling and normalization
  const output = await (extractor as (s: string, opts: { pooling: string; normalize: boolean }) => Promise<{ data: Float32Array }>)(sentence, {
    pooling: 'mean',
    normalize: true,
  });
  return Array.from(output.data);
}
