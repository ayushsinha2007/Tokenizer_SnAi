import React, { useState, useEffect } from 'react';
import { TokenizerType, TokenSegment } from '../../types/tokenizer';
import { TextInputPanel } from './TextInputPanel';
import { ModelSelector } from './ModelSelector';
import { TokenVisualizer } from './TokenVisualizer';
import { TokenInspector } from './TokenInspector';
import { TokenStatistics } from './TokenStatistics';
import { tokenizeWithModel } from '../../engine/tokenizerRegistry';
import { calculateTokenStatistics } from '../../engine/statsEngine';
import { EducationalBpeEngine } from '../../engine/bpeEngine';
import { Terminal } from 'lucide-react';

interface TokenizerWorkspaceProps {
  bpeEngine: EducationalBpeEngine;
  sharedText: string;
  onSharedTextChange: (text: string) => void;
  selectedToken: TokenSegment | null;
  onSelectToken: (token: TokenSegment | null) => void;
}

export const TokenizerWorkspace: React.FC<TokenizerWorkspaceProps> = ({
  bpeEngine,
  sharedText,
  onSharedTextChange,
  selectedToken,
  onSelectToken,
}) => {
  const [model, setModel] = useState<TokenizerType>('gpt-4');
  const [tokens, setTokens] = useState<TokenSegment[]>([]);
  const [autoTokenize, setAutoTokenize] = useState(true);
  const [isTokenizing, setIsTokenizing] = useState(false);

  // Compute tokens
  const runTokenization = (textToProcess: string, modelToUse: TokenizerType) => {
    setIsTokenizing(true);
    try {
      const result = tokenizeWithModel(textToProcess, modelToUse, bpeEngine);
      setTokens(result);
      if (selectedToken) {
        // Refresh selected token reference or select the first token if valid
        const found = result.find(t => t.index === selectedToken.index);
        onSelectToken(found || (result.length > 0 ? result[0] : null));
      } else if (result.length > 0) {
        onSelectToken(result[0]);
      } else {
        onSelectToken(null);
      }
    } finally {
      setIsTokenizing(false);
    }
  };

  // Initial and reactive tokenization
  useEffect(() => {
    if (autoTokenize) {
      runTokenization(sharedText, model);
    }
  }, [sharedText, model, autoTokenize]);

  const handleManualTokenize = () => {
    runTokenization(sharedText, model);
  };

  const stats = calculateTokenStatistics(sharedText, tokens);

  return (
    <section id="tokenizer" className="pt-12 pb-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[#398BFF] tracking-wider uppercase">
            <Terminal className="w-4 h-4" />
            <span>Interactive Tokenizer Workspace</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F1F5FC] tracking-tight">
            Tokenizer Engine
          </h2>
          <p className="text-sm sm:text-base text-[#9AAAC0] max-w-2xl">
            Input arbitrary text to inspect how deep learning models break continuous language into discrete embedding tokens.
          </p>
        </div>

        {/* Model Selector Bar */}
        <ModelSelector
          currentModel={model}
          onSelectModel={(newModel) => setModel(newModel)}
        />

        {/* Primary 2-Column Split: Input on Left, Visualization on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Text Input Panel */}
          <div className="lg:col-span-5 space-y-6">
            <TextInputPanel
              text={sharedText}
              onChange={onSharedTextChange}
              onTokenize={handleManualTokenize}
              onClear={() => onSharedTextChange('')}
              autoTokenize={autoTokenize}
              onToggleAutoTokenize={setAutoTokenize}
              charCount={stats.totalCharacters}
              wordCount={stats.totalWords}
              isTokenizing={isTokenizing}
            />

            {/* Token Statistics Cards */}
            <TokenStatistics stats={stats} />
          </div>

          {/* Right Column: Visualizer & Token Inspector */}
          <div className="lg:col-span-7 space-y-6">
            <TokenVisualizer
              tokens={tokens}
              selectedToken={selectedToken}
              onSelectToken={(tok) => onSelectToken(tok)}
            />

            <TokenInspector
              token={selectedToken}
              totalTokens={tokens.length}
            />
          </div>
        </div>

      </div>
    </section>
  );
};
