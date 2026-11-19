import React from 'react';
import { HelpCircle, Layers, Activity, Maximize2, X } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface PcaExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  explainedVariance: [number, number, number];
}

export const PcaExplainerModal: React.FC<PcaExplainerModalProps> = ({
  isOpen,
  onClose,
  explainedVariance,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0E1729] border border-[#398BFF]/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#398BFF]/20 text-[#62C9F5] border border-[#398BFF]/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#F1F5FC]">
                What is PCA (Principal Component Analysis)?
              </h3>
              <p className="text-xs text-[#9AAAC0]">
                Dimensionality Reduction in High-Dimensional Embedding Spaces
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playSpinClick();
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[#9AAAC0] hover:text-[#F1F5FC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs sm:text-sm text-[#9AAAC0] leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <p>
            Language models and sentence transformers generate dense vectors with hundreds of dimensions (e.g., <strong>384 dimensions</strong> in MiniLM, or <strong>1,536 dimensions</strong> in text-embedding-3). Humans cannot visually perceive 384 dimensions.
          </p>

          <div className="p-4 rounded-xl bg-[#111C30] border border-white/5 space-y-2">
            <h4 className="text-sm font-bold text-[#62C9F5] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#398BFF]" />
              <span>How PCA Projects Vectors to 3D Coordinates</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs font-mono text-[#F1F5FC]">
              <li>
                <strong className="text-[#398BFF]">Centering:</strong> Calculates the mean vector of all sentences and subtracts it to center the dataset at the origin (0, 0, 0).
              </li>
              <li>
                <strong className="text-[#398BFF]">Covariance Matrix:</strong> Computes the covariance of semantic features across the corpus.
              </li>
              <li>
                <strong className="text-[#398BFF]">Eigen-Decomposition:</strong> Finds the 3 orthogonal directions (eigenvectors) that capture the highest statistical variance:
                <ul className="list-disc list-inside pl-4 text-[#9AAAC0] mt-1 space-y-0.5">
                  <li><strong>PC1 (X-axis):</strong> Captures the largest semantic difference ({explainedVariance[0]}% variance).</li>
                  <li><strong>PC2 (Y-axis):</strong> Captures the second largest orthogonal variation ({explainedVariance[1]}% variance).</li>
                  <li><strong>PC3 (Z-axis):</strong> Captures the third largest orthogonal dimension ({explainedVariance[2]}% variance).</li>
                </ul>
              </li>
              <li>
                <strong className="text-[#398BFF]">Dot-Product Projection:</strong> Every sentence vector is projected onto PC1, PC2, and PC3 to create its exact (x, y, z) 3D coordinate.
              </li>
            </ol>
          </div>

          <p>
            Together, PC1, PC2, and PC3 account for <strong>{(explainedVariance[0] + explainedVariance[1] + explainedVariance[2]).toFixed(1)}%</strong> of the total information variance in this sentence dataset! That is why semantically similar sentences cluster together in 3D space, while conceptually distinct topics diverge to distant coordinates.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex justify-end">
          <button
            onClick={() => {
              soundFx.playSpinClick();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-[#398BFF] hover:bg-[#2F7BE8] text-white text-xs font-semibold tracking-wider transition-all"
          >
            GOT IT
          </button>
        </div>

      </div>
    </div>
  );
};
