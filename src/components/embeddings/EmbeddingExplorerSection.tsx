import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SentenceItem, EmbeddingModelType, ModelLoadingState, PcaResult } from '../../engine/embeddings/types';
import { embedSemanticCentroid } from '../../engine/embeddings/semanticVectorizer';
import { embedLexicalTfIdf } from '../../engine/embeddings/lexicalVectorizer';
import { getTransformersExtractor, embedWithMiniLM } from '../../engine/embeddings/transformersVectorizer';
import { runDualPca } from '../../engine/embeddings/pcaEngine';
import { Embedding3DCanvas } from './Embedding3DCanvas';
import { SentenceInputPanel } from './SentenceInputPanel';
import { SampleSentenceEditor } from './SampleSentenceEditor';
import { SentenceSimilarityCard } from './SentenceSimilarityCard';
import { PcaExplainerModal } from './PcaExplainerModal';
import { Box, Cpu, HelpCircle, Layers, RefreshCw, Sparkles, Zap } from 'lucide-react';
import { soundFx } from '../../utils/audio';

const DEFAULT_SAMPLE_TEXTS = [
  'Artificial intelligence is transforming the world.',
  'Machine learning helps computers recognize patterns.',
  'Natural language processing allows computers to understand text.',
  'Python is a popular programming language.',
  'Beyblade battles are legendary.',
  'Technology connects people across the world.',
];

export const EmbeddingExplorerSection: React.FC = () => {
  // Sample Sentences
  const [sampleSentences, setSampleSentences] = useState<SentenceItem[]>(() => {
    return DEFAULT_SAMPLE_TEXTS.map((text, idx) => ({
      id: `sample-${idx + 1}`,
      text,
      category: 'sample',
      createdAt: Date.now() + idx,
    }));
  });

  // User Added Sentences
  const [userSentences, setUserSentences] = useState<SentenceItem[]>([]);

  // Selected Points for Similarity Inspection
  const [selectedSentenceA, setSelectedSentenceA] = useState<SentenceItem | null>(null);
  const [selectedSentenceB, setSelectedSentenceB] = useState<SentenceItem | null>(null);

  // Model Selection
  const [modelType, setModelType] = useState<EmbeddingModelType>('semantic-centroid');
  const [modelState, setModelState] = useState<ModelLoadingState>({
    status: 'ready',
    modelName: 'Semantic Centroid Vectors',
    dimensions: 64,
  });

  // PCA state
  const [pcaState, setPcaState] = useState<PcaResult>({
    coordinates: [],
    explainedVariance: [48.5, 29.2, 14.8],
    eigenvalues: [10, 6, 3],
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [showPcaModal, setShowPcaModal] = useState(false);

  // Combine samples and user sentences
  const allSentences = useMemo(() => {
    return [...sampleSentences, ...userSentences];
  }, [sampleSentences, userSentences]);

  // Compute embeddings and update 3D PCA coordinates
  const computeEmbeddingsAndPca = useCallback(async (
    currentList: SentenceItem[],
    currentModel: EmbeddingModelType
  ) => {
    if (currentList.length === 0) return;
    setIsProcessing(true);

    try {
      let updatedItems: SentenceItem[] = [];

      if (currentModel === 'transformers-minilm') {
        let extractor: unknown = null;
        try {
          extractor = await getTransformersExtractor(setModelState);
        } catch {
          // Graceful fallback to semantic centroid on failure
          setModelType('semantic-centroid');
          computeEmbeddingsAndPca(currentList, 'semantic-centroid');
          return;
        }

        const embeddedList: SentenceItem[] = [];
        for (const item of currentList) {
          const vec = await embedWithMiniLM(item.text, extractor);
          embeddedList.push({ ...item, vector: vec });
        }
        updatedItems = embeddedList;
      } else if (currentModel === 'lexical-tfidf') {
        const corpus = currentList.map(s => s.text);
        updatedItems = currentList.map(item => ({
          ...item,
          vector: embedLexicalTfIdf(item.text, corpus),
        }));
      } else {
        // 'semantic-centroid' (default high-dimensional dense space)
        updatedItems = currentList.map(item => ({
          ...item,
          vector: embedSemanticCentroid(item.text),
        }));
      }

      // Run Dual PCA
      const pca = runDualPca(updatedItems);
      setPcaState(pca);

      // Map 3D coordinates back into items
      const coordMap = new Map<string, { x: number; y: number; z: number }>();
      pca.coordinates.forEach(c => coordMap.set(c.id, { x: c.x, y: c.y, z: c.z }));

      const finalItems = updatedItems.map(item => ({
        ...item,
        coords3D: coordMap.get(item.id) || { x: 0, y: 0, z: 0 },
      }));

      // Split back into sample & user lists
      setSampleSentences(finalItems.filter(s => s.category === 'sample'));
      setUserSentences(finalItems.filter(s => s.category === 'user'));

      // Keep selected items synchronized
      if (selectedSentenceA) {
        const refreshedA = finalItems.find(s => s.id === selectedSentenceA.id);
        if (refreshedA) setSelectedSentenceA(refreshedA);
      } else if (finalItems.length > 0) {
        setSelectedSentenceA(finalItems[0]);
      }

      if (selectedSentenceB) {
        const refreshedB = finalItems.find(s => s.id === selectedSentenceB.id);
        if (refreshedB) setSelectedSentenceB(refreshedB);
      } else if (finalItems.length > 1) {
        setSelectedSentenceB(finalItems[1]);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [selectedSentenceA, selectedSentenceB]);

  // Initial calculation and model switch trigger
  useEffect(() => {
    computeEmbeddingsAndPca(allSentences, modelType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelType]);

  // Add User Sentence Handler
  const handleAddUserSentence = (text: string): boolean | string => {
    const trimmed = text.trim();
    if (!trimmed) return 'Sentence cannot be empty.';

    // Check for exact duplicate
    const exists = allSentences.some(s => s.text.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      return 'This exact sentence already exists on the plot.';
    }

    const newItem: SentenceItem = {
      id: `user-${Date.now()}`,
      text: trimmed,
      category: 'user',
      createdAt: Date.now(),
    };

    const nextList = [...allSentences, newItem];
    setUserSentences(prev => [...prev, newItem]);
    computeEmbeddingsAndPca(nextList, modelType);
    setSelectedSentenceB(newItem);
    return true;
  };

  // Sample sentence CRUD handlers
  const handleAddSample = (text: string) => {
    const newItem: SentenceItem = {
      id: `sample-${Date.now()}`,
      text,
      category: 'sample',
      createdAt: Date.now(),
    };
    const nextList = [...allSentences, newItem];
    setSampleSentences(prev => [...prev, newItem]);
    computeEmbeddingsAndPca(nextList, modelType);
  };

  const handleEditSample = (id: string, newText: string) => {
    const nextList = allSentences.map(s => s.id === id ? { ...s, text: newText } : s);
    setSampleSentences(prev => prev.map(s => s.id === id ? { ...s, text: newText } : s));
    computeEmbeddingsAndPca(nextList, modelType);
  };

  const handleDeleteSample = (id: string) => {
    const nextList = allSentences.filter(s => s.id !== id);
    setSampleSentences(prev => prev.filter(s => s.id !== id));
    computeEmbeddingsAndPca(nextList, modelType);
  };

  const handleResetDefaults = () => {
    const defaults: SentenceItem[] = DEFAULT_SAMPLE_TEXTS.map((text, idx) => ({
      id: `sample-${idx + 1}`,
      text,
      category: 'sample',
      createdAt: Date.now() + idx,
    }));
    const nextList = [...defaults, ...userSentences];
    setSampleSentences(defaults);
    computeEmbeddingsAndPca(nextList, modelType);
  };

  // Interactive Point Selection from 3D Canvas
  const handleSelectFromCanvas = (clickedSentence: SentenceItem) => {
    if (!selectedSentenceA || selectedSentenceA.id === clickedSentence.id) {
      setSelectedSentenceA(clickedSentence);
    } else {
      setSelectedSentenceB(clickedSentence);
    }
  };

  return (
    <section id="embeddings-3d" className="pt-16 pb-20 relative">
      
      {/* Background radial spotlight */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#398BFF]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#398BFF] tracking-wider uppercase">
              <Box className="w-4 h-4" />
              <span>Vector Space Representation & PCA</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F1F5FC] tracking-tight">
              3D EMBEDDINGS
            </h2>
            <p className="text-sm sm:text-base text-[#9AAAC0] max-w-2xl">
              Explore how sentences are represented in a vector space and discover similarities between different texts.
            </p>
          </div>

          {/* Educational PCA info button */}
          <button
            onClick={() => {
              soundFx.playSpinClick();
              setShowPcaModal(true);
            }}
            className="self-start md:self-auto px-3.5 py-2 rounded-xl bg-[#111C30] hover:bg-[#1C2C47] border border-[#398BFF]/30 text-[#62C9F5] text-xs font-mono transition-all flex items-center gap-2 shadow-[0_0_12px_rgba(57,139,255,0.15)]"
          >
            <HelpCircle className="w-4 h-4 text-[#398BFF]" />
            <span>How Does PCA Work?</span>
          </button>
        </div>

        {/* Vectorization Engine Selector Tabs */}
        <div className="lab-glass rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#9AAAC0]">
            <Cpu className="w-4 h-4 text-[#398BFF]" />
            <span>Embedding Pipeline:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Semantic Centroids */}
            <button
              onClick={() => {
                soundFx.playSpinClick();
                setModelType('semantic-centroid');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                modelType === 'semantic-centroid'
                  ? 'bg-[#398BFF]/20 border-[#398BFF] text-[#F1F5FC] shadow-[0_0_12px_rgba(57,139,255,0.3)]'
                  : 'bg-[#080F1E] border-white/5 text-[#9AAAC0] hover:text-[#F1F5FC]'
              }`}
            >
              Dense Semantic Centroid (64-D)
            </button>

            {/* Neural MiniLM */}
            <button
              onClick={() => {
                soundFx.playSpinClick();
                setModelType('transformers-minilm');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono border transition-all flex items-center gap-1.5 ${
                modelType === 'transformers-minilm'
                  ? 'bg-[#2DD4BF]/20 border-[#2DD4BF] text-[#2DD4BF] shadow-[0_0_12px_rgba(45,212,191,0.3)]'
                  : 'bg-[#080F1E] border-white/5 text-[#9AAAC0] hover:text-[#F1F5FC]'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#2DD4BF]" />
              <span>Transformers.js MiniLM (384-D)</span>
            </button>

            {/* Lexical TF-IDF */}
            <button
              onClick={() => {
                soundFx.playSpinClick();
                setModelType('lexical-tfidf');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                modelType === 'lexical-tfidf'
                  ? 'bg-[#FF7A45]/20 border-[#FF7A45] text-[#FF7A45] shadow-[0_0_12px_rgba(255,122,69,0.3)]'
                  : 'bg-[#080F1E] border-white/5 text-[#9AAAC0] hover:text-[#F1F5FC]'
              }`}
            >
              Lexical TF-IDF Frequency (64-D)
            </button>
          </div>
        </div>

        {/* Model Loading / Status Indicator if active */}
        {modelType === 'transformers-minilm' && modelState.status === 'loading' && (
          <div className="p-3.5 rounded-xl bg-[#111C30] border border-[#2DD4BF]/30 flex items-center justify-between text-xs font-mono text-[#2DD4BF]">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#2DD4BF]" />
              <span>{modelState.message}</span>
            </div>
            <span>{modelState.progress}%</span>
          </div>
        )}

        {/* 3D Interactive Scatter Plot */}
        <div className="space-y-2">
          <Embedding3DCanvas
            sentences={allSentences}
            selectedSentenceA={selectedSentenceA}
            selectedSentenceB={selectedSentenceB}
            onSelectSentence={handleSelectFromCanvas}
            explainedVariance={pcaState.explainedVariance}
          />
        </div>

        {/* Two-Column Utility Area: Add Sentence & Cosine Similarity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Try a Word or Sentence Input */}
          <div className="lg:col-span-6 space-y-6">
            <SentenceInputPanel
              onAddSentence={handleAddUserSentence}
              isProcessing={isProcessing}
            />

            {/* Expandable Sample Sentence Editor */}
            <SampleSentenceEditor
              sampleSentences={sampleSentences}
              onAddSample={handleAddSample}
              onEditSample={handleEditSample}
              onDeleteSample={handleDeleteSample}
              onResetDefaults={handleResetDefaults}
            />
          </div>

          {/* Right Column: Cosine Similarity Comparator */}
          <div className="lg:col-span-6 space-y-6">
            <SentenceSimilarityCard
              sentenceA={selectedSentenceA}
              sentenceB={selectedSentenceB}
              allSentences={allSentences}
              onSelectA={setSelectedSentenceA}
              onSelectB={setSelectedSentenceB}
            />
          </div>

        </div>

      </div>

      {/* PCA Explainer Modal */}
      <PcaExplainerModal
        isOpen={showPcaModal}
        onClose={() => setShowPcaModal(false)}
        explainedVariance={pcaState.explainedVariance}
      />
    </section>
  );
};
