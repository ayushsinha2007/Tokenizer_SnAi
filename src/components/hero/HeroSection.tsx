import React from 'react';
import { ArrowRight, BookOpen, Cpu, Layers, Zap } from 'lucide-react';
import { HeroEnergyArena } from './HeroEnergyArena';
import { soundFx } from '../../utils/audio';

interface HeroSectionProps {
  onEnterLab: () => void;
  onExploreLearn: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onEnterLab, onExploreLearn }) => {
  const handleEnterLab = () => {
    soundFx.playSpinClick();
    onEnterLab();
  };

  const handleExploreLearn = () => {
    soundFx.playSpinClick();
    onExploreLearn();
  };

  return (
    <section id="hero" className="relative pt-8 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
      {/* Background subtle radial spotlight */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#398BFF]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-[#62C9F5]/05 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Heading & Copy */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            
            {/* Top Identity Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111C30] border border-[#398BFF]/30 text-xs font-mono text-[#62C9F5] shadow-[0_0_15px_rgba(57,139,255,0.15)]">
              <span className="w-2 h-2 rounded-full bg-[#398BFF] animate-ping" />
              <span>ACADEMIC AI WORKSPACE • BPE & LLM ENGINES</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#F1F5FC] leading-[1.08]">
                EVERY WORD <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#398BFF] via-[#62C9F5] to-[#F1F5FC] glow-text">
                  HAS A SPIN.
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-[#9AAAC0] max-w-2xl font-normal leading-relaxed">
              Discover how AI transforms your words into tokens. Enter the lab, experiment with tokenization, and explore how language models understand text.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={handleEnterLab}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#398BFF] to-[#2563EB] hover:from-[#4F98FF] hover:to-[#1D4ED8] text-white font-medium text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-[0_0_24px_rgba(57,139,255,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>ENTER THE LAB</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleExploreLearn}
                className="px-6 py-3.5 rounded-xl bg-[#111C30]/80 hover:bg-[#111C30] border border-white/10 hover:border-[#398BFF]/40 text-[#F1F5FC] font-medium text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02]"
              >
                <BookOpen className="w-4 h-4 text-[#62C9F5]" />
                <span>EXPLORE TOKENIZATION</span>
              </button>
            </div>

            {/* Minimal Stat Highlights */}
            <div className="pt-6 border-t border-white/5 grid grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#9AAAC0]">
                  <Cpu className="w-3.5 h-3.5 text-[#398BFF]" />
                  <span>Vocab Size</span>
                </div>
                <div className="text-sm sm:text-base font-semibold text-[#F1F5FC] font-mono">100,264+</div>
                <div className="text-[11px] text-[#9AAAC0]">cl100k & o200k</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#9AAAC0]">
                  <Zap className="w-3.5 h-3.5 text-[#62C9F5]" />
                  <span>Latency</span>
                </div>
                <div className="text-sm sm:text-base font-semibold text-[#F1F5FC] font-mono">&lt; 1 ms</div>
                <div className="text-[11px] text-[#9AAAC0]">In-browser WASM/JS</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#9AAAC0]">
                  <Layers className="w-3.5 h-3.5 text-[#398BFF]" />
                  <span>Algorithms</span>
                </div>
                <div className="text-sm sm:text-base font-semibold text-[#F1F5FC] font-mono">4 Models</div>
                <div className="text-[11px] text-[#9AAAC0]">BPE • Word • Char</div>
              </div>
            </div>

          </div>

          {/* Right Column: Abstract Geometric Energy Ring Visual */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <HeroEnergyArena />
          </div>

        </div>
      </div>
    </section>
  );
};
