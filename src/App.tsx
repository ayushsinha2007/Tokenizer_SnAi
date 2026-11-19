import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/layout/Navbar';
import { HeroSection } from './components/hero/HeroSection';
import { TokenizerWorkspace } from './components/tokenizer/TokenizerWorkspace';
import { TokenBreakdownTable } from './components/breakdown/TokenBreakdownTable';
import { BpeLabSection } from './components/bpeLab/BpeLabSection';
import { TokenBattleSection } from './components/battle/TokenBattleSection';
import { TokenExplorerSection } from './components/explorer/TokenExplorerSection';
import { LearningCornerSection } from './components/learn/LearningCornerSection';
import { Footer } from './components/layout/Footer';
import { defaultBpeEngine } from './engine/bpeEngine';
import { tokenizeWithModel } from './engine/tokenizerRegistry';
import { TokenSegment } from './types/tokenizer';

export function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [sharedText, setSharedText] = useState('Beyblade battles are legendary!');
  const [selectedToken, setSelectedToken] = useState<TokenSegment | null>(null);
  const [bpeEngineVersion, setBpeEngineVersion] = useState(0);

  // Compute active tokens from the default/current tokenizer for the breakdown table & explorer
  const activeTokens = useMemo(() => {
    return tokenizeWithModel(sharedText, 'gpt-4', defaultBpeEngine);
  }, [sharedText, bpeEngineVersion]);

  // Keep selectedToken in sync with activeTokens
  useEffect(() => {
    if (activeTokens.length > 0 && !selectedToken) {
      setSelectedToken(activeTokens[0]);
    }
  }, [activeTokens, selectedToken]);

  // Smooth scroll handler
  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // IntersectionObserver to track active section while scrolling
  useEffect(() => {
    const sectionIds = ['hero', 'tokenizer', 'vocabulary-lab', 'token-battle', 'token-explorer', 'learn'];
    const handleScroll = () => {
      const scrollY = window.scrollY + 200;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#080F1E] text-[#F1F5FC] selection:bg-[#398BFF]/30 selection:text-[#62C9F5] flex flex-col font-sans">
      {/* Navigation */}
      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Main Content */}
      <main className="flex-1 space-y-4">
        {/* Hero Section */}
        <HeroSection
          onEnterLab={() => handleNavigate('tokenizer')}
          onExploreLearn={() => handleNavigate('learn')}
        />

        {/* Main Feature: Tokenizer Workspace */}
        <TokenizerWorkspace
          bpeEngine={defaultBpeEngine}
          sharedText={sharedText}
          onSharedTextChange={setSharedText}
          selectedToken={selectedToken}
          onSelectToken={setSelectedToken}
        />

        {/* Token Breakdown Table Section */}
        <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TokenBreakdownTable
            tokens={activeTokens}
            onSelectToken={setSelectedToken}
            selectedToken={selectedToken}
          />
        </section>

        {/* Vocabulary Lab — BPE Builder */}
        <BpeLabSection
          bpeEngine={defaultBpeEngine}
          onVocabUpdated={() => setBpeEngineVersion(v => v + 1)}
        />

        {/* Token Battle — Compare Tokenizers */}
        <TokenBattleSection bpeEngine={defaultBpeEngine} />

        {/* Token Explorer */}
        <TokenExplorerSection
          tokens={activeTokens}
          inputText={sharedText}
          onSelectToken={setSelectedToken}
          selectedToken={selectedToken}
        />

        {/* Learning Corner */}
        <LearningCornerSection />
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
