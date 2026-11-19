import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    soundFx.enabled = next;
    if (next) soundFx.playSpinClick();
  };

  const navLinks = [
    { id: 'hero', label: 'Home' },
    { id: 'tokenizer', label: 'Tokenizer' },
    { id: 'vocabulary-lab', label: 'Vocabulary Lab' },
    { id: 'token-battle', label: 'Token Battle' },
    { id: 'token-explorer', label: 'Token Explorer' },
    { id: 'embeddings-3d', label: '3D Embeddings' },
    { id: 'learn', label: 'Learn' },
  ];

  const handleLinkClick = (id: string) => {
    soundFx.playSpinClick();
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#080F1E]/90 backdrop-blur-md border-b border-[#398BFF]/20 shadow-lg shadow-black/40'
          : 'bg-[#080F1E]/60 backdrop-blur-sm border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo with abstract circular energy-ring symbol */}
        <button
          onClick={() => handleLinkClick('hero')}
          className="flex items-center space-x-3 group focus:outline-none text-left"
          aria-label="Beyblade Token Lab Home"
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            {/* Outer spinning dash ring */}
            <svg className="w-8 h-8 arena-ring-dashed text-[#398BFF] absolute inset-0" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeOpacity="0.8"
              />
            </svg>
            {/* Inner reverse dash ring */}
            <svg className="w-6 h-6 arena-ring-reverse text-[#62C9F5] absolute" viewBox="0 0 30 30">
              <circle
                cx="15"
                cy="15"
                r="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeOpacity="0.6"
              />
            </svg>
            {/* Glowing core energy node */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#398BFF] shadow-[0_0_8px_#398BFF] group-hover:scale-125 transition-transform duration-300" />
          </div>

          <div className="flex flex-col">
            <span className="font-semibold text-sm sm:text-base tracking-wider text-[#F1F5FC] group-hover:text-[#62C9F5] transition-colors flex items-center gap-1.5">
              BEYBLADE <span className="text-[#398BFF]">TOKEN LAB</span>
            </span>
            <span className="text-[10px] text-[#9AAAC0] tracking-widest uppercase -mt-0.5 hidden sm:block">
              Every Word Has a Spin
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`px-3 py-1.5 rounded-md text-xs lg:text-sm font-medium transition-all relative ${
                  isActive
                    ? 'text-[#F1F5FC] font-semibold bg-[#111C30]'
                    : 'text-[#9AAAC0] hover:text-[#F1F5FC] hover:bg-white/5'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-[#398BFF] to-[#62C9F5] rounded-full shadow-[0_0_8px_#398BFF]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="hidden sm:flex items-center space-x-3">
          {/* Audio toggle button */}
          <button
            onClick={toggleAudio}
            title={audioEnabled ? 'Mute feedback sounds' : 'Enable feedback sounds'}
            className="p-2 rounded-lg text-[#9AAAC0] hover:text-[#F1F5FC] hover:bg-[#111C30] border border-white/5 transition-colors text-xs flex items-center gap-1.5"
            aria-label="Toggle sound feedback"
          >
            {audioEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-[#398BFF]" />
                <span className="text-[11px] text-[#62C9F5]">SFX On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="text-[11px]">SFX</span>
              </>
            )}
          </button>

          {/* Quick Action Button */}
          <button
            onClick={() => handleLinkClick('tokenizer')}
            className="px-3.5 py-1.5 rounded-lg bg-[#398BFF]/15 hover:bg-[#398BFF]/25 border border-[#398BFF]/40 text-[#62C9F5] hover:text-white text-xs font-medium transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(57,139,255,0.2)]"
          >
            <span>Launch Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center sm:hidden space-x-2">
          <button
            onClick={toggleAudio}
            className="p-2 rounded-lg text-[#9AAAC0] hover:text-[#F1F5FC] border border-white/5"
            aria-label="Toggle sound"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-[#398BFF]" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#9AAAC0] hover:text-[#F1F5FC] hover:bg-[#111C30] border border-white/5"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#080F1E]/95 border-b border-[#398BFF]/20 px-4 pt-3 pb-6 space-y-2 backdrop-blur-xl">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-between ${
                  isActive
                    ? 'text-[#F1F5FC] bg-[#111C30] border-l-2 border-[#398BFF]'
                    : 'text-[#9AAAC0] hover:text-[#F1F5FC] hover:bg-white/5'
                }`}
              >
                <span>{link.label}</span>
                {isActive && <Sparkles className="w-4 h-4 text-[#398BFF]" />}
              </button>
            );
          })}
          <div className="pt-2">
            <button
              onClick={() => handleLinkClick('tokenizer')}
              className="w-full py-2.5 rounded-lg bg-[#398BFF] text-white text-sm font-medium flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(57,139,255,0.4)]"
            >
              <span>ENTER THE LAB</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
