import React from 'react';
import { ArrowUp, BookOpen, Cpu, Github, Layers, ShieldCheck } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    soundFx.playSpinClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050A14] border-t border-white/5 pt-16 pb-12 relative overflow-hidden">
      {/* Background subtle radial glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-[#398BFF]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Identity & Description */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg className="w-8 h-8 arena-ring-dashed text-[#398BFF] absolute inset-0" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
                </svg>
                <div className="w-2.5 h-2.5 rounded-full bg-[#398BFF] shadow-[0_0_8px_#398BFF]" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-base tracking-wider text-[#F1F5FC]">
                  BEYBLADE <span className="text-[#398BFF]">TOKEN LAB</span>
                </span>
                <span className="text-[10px] text-[#9AAAC0] tracking-widest uppercase">
                  Every Word Has a Spin.
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#9AAAC0] leading-relaxed max-w-md">
              Explore how artificial intelligence transforms text into tokens. Understand tokenization, experiment with different algorithms, and discover how language models process information.
            </p>

            <div className="text-[11px] font-mono text-[#62C9F5] flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#398BFF]" />
              <span>Designed as an Academic AI Assignment</span>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-[#F1F5FC] font-semibold">
              Lab Navigation
            </div>
            <ul className="space-y-2 text-xs font-mono text-[#9AAAC0]">
              <li>
                <button onClick={() => onNavigate('hero')} className="hover:text-[#62C9F5] transition-colors">
                  &rarr; Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tokenizer')} className="hover:text-[#62C9F5] transition-colors">
                  &rarr; Interactive Tokenizer
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('vocabulary-lab')} className="hover:text-[#62C9F5] transition-colors">
                  &rarr; BPE Vocabulary Lab
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('token-battle')} className="hover:text-[#62C9F5] transition-colors">
                  &rarr; Token Battle
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('token-explorer')} className="hover:text-[#62C9F5] transition-colors">
                  &rarr; Token Explorer
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('embeddings-3d')} className="hover:text-[#62C9F5] transition-colors">
                  &rarr; 3D Embeddings
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('learn')} className="hover:text-[#62C9F5] transition-colors">
                  &rarr; Learning Corner
                </button>
              </li>
            </ul>
          </div>

          {/* Supported Algorithms Info */}
          <div className="md:col-span-4 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-[#F1F5FC] font-semibold">
              Supported Architectures
            </div>
            <div className="space-y-2 text-xs font-mono text-[#9AAAC0]">
              <div className="p-2.5 rounded-lg bg-[#111C30]/60 border border-white/5 space-y-0.5">
                <div className="text-[#398BFF] font-semibold">GPT-4 (cl100k_base)</div>
                <div className="text-[11px] text-[#9AAAC0]">100,264 tokens • Production BPE</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#111C30]/60 border border-white/5 space-y-0.5">
                <div className="text-[#62C9F5] font-semibold">GPT-4o (o200k_base)</div>
                <div className="text-[11px] text-[#9AAAC0]">200,006 tokens • Omni multilingual</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#111C30]/60 border border-white/5 space-y-0.5">
                <div className="text-[#2DD4BF] font-semibold">Educational BPE Engine</div>
                <div className="text-[11px] text-[#9AAAC0]">Statistical frequency-pair fusion</div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#9AAAC0]">
          <div>
            &copy; {new Date().getFullYear()} BEYBLADE TOKEN LAB. All rights reserved.
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[#62C9F5]">Every Word Has a Spin.</span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-[#111C30] hover:bg-white/10 text-white transition-colors flex items-center gap-1 text-xs"
              title="Back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
