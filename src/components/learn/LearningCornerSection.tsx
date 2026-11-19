import React, { useState } from 'react';
import { 
  GraduationCap, ChevronDown, ChevronUp, Sparkles, Binary, 
  Cpu, Layers, DollarSign, Calculator, Smile, HelpCircle, ArrowRight
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { tokenizePretrained } from '../../engine/pretrainedTokenizer';

interface LearnTopic {
  id: string;
  title: string;
  summary: string;
  icon: React.ReactNode;
  content: string;
  interactiveWidget?: 'emoji' | 'contextCalculator';
}

export const LearningCornerSection: React.FC = () => {
  const [openTopicId, setOpenTopicId] = useState<string>('topic-1');
  
  // Interactive widget states
  const [testEmoji, setTestEmoji] = useState('👨‍👩‍👧‍👦');
  const [promptTokens, setPromptTokens] = useState(2000);
  const [completionTokens, setCompletionTokens] = useState(500);

  const emojiTokens = tokenizePretrained(testEmoji, 'gpt-4');

  const topics: LearnTopic[] = [
    {
      id: 'topic-1',
      title: '1. What is Tokenization?',
      summary: 'The fundamental translation layer between human language and neural networks.',
      icon: <Layers className="w-5 h-5 text-[#398BFF]" />,
      content: `At its core, a neural network is a mathematical function that performs tensor multiplications over matrices of floating-point numbers. It has no biological understanding of English words, letters, punctuation, or grammar.

Tokenization is the discrete preprocessing step that decomposes continuous, unstructured human text into discrete, categorical atomic units called "tokens". Each token maps directly to an integer index in a fixed vocabulary matrix (the model's embedding table). Without tokenization, deep learning language models cannot ingest or process written words.`
    },
    {
      id: 'topic-2',
      title: '2. Why Do LLMs Use Tokens Instead of Characters or Words?',
      summary: 'The optimal sweet-spot balancing vocabulary size against transformer attention quadratic memory.',
      icon: <Cpu className="w-5 h-5 text-[#62C9F5]" />,
      content: `If we tokenize at the **Word level**, every distinct word needs a unique slot in the vocabulary. English alone has over 500,000 words; adding medical terms, typos, code, and other languages blows up the vocabulary into millions. Large vocabularies create massive parameter overhead in the final softmax projection layer and fail completely on typos or out-of-vocabulary (OOV) words.

If we tokenize at the **Character level**, the vocabulary is tiny (~256 ASCII bytes or ~1,000 common characters). However, sequence lengths explode by 4x to 6x. Since standard transformer self-attention scales quadratically (O(N²)) with sequence length, character-level models consume 16x to 36x more compute and memory for the exact same sentence.

**Subword Tokenization (BPE)** solves this dilemma: common words remain single tokens ("the", "learn"), while rare or complex words seamlessly break into meaningful morphological subwords ("token", "ization").`
    },
    {
      id: 'topic-3',
      title: '3. What Are Token IDs & Embedding Tables?',
      summary: 'The discrete integer lookup indices that retrieve dense semantic vector representations.',
      icon: <Binary className="w-5 h-5 text-[#398BFF]" />,
      content: `A Token ID is a simple, non-negative integer (e.g., 9906 for "Hello" in GPT-4). 

Inside the language model, the very first layer is the **Embedding Matrix** (denoted W_embed of dimensions V x D, where V is vocabulary size like 100,264, and D is embedding dimension like 4,096 in Llama-3 or 12,288 in GPT-4).

When the tokenizer sends ID 9906 to the GPU, the model simply extracts row 9906 from this matrix. That row is a 4,096-dimensional continuous floating-point vector that captures semantic attributes like gender, syntax, sentiment, and context.`
    },
    {
      id: 'topic-4',
      title: '4. How Does Byte Pair Encoding (BPE) Work?',
      summary: 'A greedy, statistical data-compression algorithm adapted for subword neural vocabularies.',
      icon: <Sparkles className="w-5 h-5 text-[#2DD4BF]" />,
      content: `Originally invented by Philip Gage in 1994 for generic data compression, Byte Pair Encoding was adapted for neural NLP by Sennrich et al. in 2016.

The algorithm runs as follows:
1. Initialize the vocabulary with all single characters / base bytes in the training corpus plus an end-of-word marker.
2. Segment every word in the training corpus into individual characters.
3. Count the frequencies of all adjacent pairs of tokens (e.g., 't' + 'h', 'e' + 'r').
4. Identify the single pair with the highest frequency across the entire corpus.
5. Merge that winning pair into a new composite token ('th') and add it to the vocabulary.
6. Repeat steps 3–5 for a predefined number of merges (e.g. 50,000 or 100,000 iterations).

Modern LLMs (like GPT-4 and Llama 3) use **Byte-Level BPE (BBPE)**, running over raw UTF-8 bytes rather than Unicode characters so that no character is ever truly unknown.`
    },
    {
      id: 'topic-5',
      title: '5. What is Vocabulary Size & Why Does It Matter?',
      summary: 'How 32k vs 100k vs 256k vocabularies dictate multilingual efficiency and memory bandwidth.',
      icon: <Layers className="w-5 h-5 text-[#62C9F5]" />,
      content: `The vocabulary size (V) defines the total count of distinct tokens the model understands:
- GPT-2: 50,257 tokens
- Llama 2: 32,000 tokens
- GPT-4 (cl100k): 100,264 tokens
- GPT-4o (o200k): 200,006 tokens
- Llama 3: 128,256 tokens
- Gemma 2: 256,000 tokens

**The Trade-off:**
A larger vocabulary allows longer words, multilingual scripts (Arabic, Hindi, Chinese), and code constructs to fit into single tokens, dramatically reducing sequence length and inference latency. However, every additional 50k tokens adds hundreds of millions of parameters to the model's weight matrices and requires more GPU memory bandwidth during decoding.`
    },
    {
      id: 'topic-6',
      title: '6. How Are Emojis & Special Characters Tokenized?',
      summary: 'UTF-8 multibyte encoding, Zero-Width Joiners (ZWJ), and why emojis consume multiple tokens.',
      icon: <Smile className="w-5 h-5 text-[#FF7A45]" />,
      interactiveWidget: 'emoji',
      content: `Standard English letters (A-Z) require exactly 1 byte in UTF-8. In contrast, complex emojis, accents, and non-Latin scripts require 2, 3, or even 4 bytes each.

Furthermore, composite emojis (such as family emojis or profession emojis with skin tone modifiers) are composed of multiple separate unicode codepoints glued together using invisible **Zero-Width Joiner (ZWJ, U+200D)** characters!

Because modern tokenizers fall back to byte-level representations for unfamiliar combinations, a single visual emoji can cost anywhere between 2 and 7 discrete tokens.`
    },
    {
      id: 'topic-7',
      title: '7. How Does Tokenization Affect Context Windows & API Costs?',
      summary: 'Token limits, billable usage calculations, and prompt engineering economy.',
      icon: <DollarSign className="w-5 h-5 text-[#2DD4BF]" />,
      interactiveWidget: 'contextCalculator',
      content: `LLM context limits (e.g., 8k, 32k, 128k, or 1M tokens) are strictly measured in tokens, **not** characters or words. Similarly, API pricing from OpenAI, Anthropic, and Google is billed per million tokens processed.

Because languages other than English often suffer lower token compression (consuming 2x to 3x more tokens for the same semantic content), users in non-English languages consume their context windows faster and incur higher per-task costs. Understanding tokenization helps engineers optimize prompts, minify code, and save computational budget.`
    }
  ];

  const toggleTopic = (id: string) => {
    soundFx.playSpinClick();
    setOpenTopicId(prev => prev === id ? '' : id);
  };

  return (
    <section id="learn" className="pt-16 pb-24 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#398BFF] tracking-wider uppercase">
            <GraduationCap className="w-4 h-4" />
            <span>Foundational AI Knowledge</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F1F5FC] tracking-tight">
            LEARNING CORNER
          </h2>
          <p className="text-sm sm:text-base text-[#9AAAC0] max-w-2xl">
            Everything you need to know about how artificial intelligence tokenizes language, calculates embedding indices, and manages sequence memory.
          </p>
        </div>

        {/* Expandable Topic Cards */}
        <div className="space-y-3">
          {topics.map((t) => {
            const isOpen = openTopicId === t.id;
            return (
              <div
                key={t.id}
                className={`lab-glass rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-[#398BFF]/40 bg-[#111C30]/90 shadow-[0_0_20px_rgba(57,139,255,0.15)]'
                    : 'border-white/5 hover:border-white/15 bg-[#0E1729]/70'
                }`}
              >
                {/* Header Button */}
                <button
                  onClick={() => toggleTopic(t.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-start sm:items-center justify-between gap-4 focus:outline-none"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-[#080F1E] border border-white/5 shrink-0">
                      {t.icon}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-[#F1F5FC]">
                        {t.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#9AAAC0] mt-0.5">
                        {t.summary}
                      </p>
                    </div>
                  </div>

                  <div className="p-1 rounded-lg bg-[#080F1E] text-[#9AAAC0] shrink-0 mt-1 sm:mt-0">
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[#398BFF]" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Expanded Content Drawer */}
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-white/5 space-y-4">
                    <div className="text-xs sm:text-sm text-[#9AAAC0] font-sans leading-relaxed whitespace-pre-line">
                      {t.content}
                    </div>

                    {/* Interactive Widget 1: Emoji Byte Inspector */}
                    {t.interactiveWidget === 'emoji' && (
                      <div className="p-4 rounded-xl bg-[#080F1E] border border-[#FF7A45]/30 space-y-3 mt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono uppercase tracking-wider text-[#FF7A45] font-semibold">
                            Interactive Emoji Token Cost Tester
                          </span>
                          <span className="text-xs font-mono text-[#F1F5FC]">
                            Total Tokens: <span className="text-[#FF7A45] font-bold">{emojiTokens.length}</span>
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 items-center">
                          {['👨‍👩‍👧‍👦', '🚀', '❤️‍🔥', '🤖', '🌍', '🏳️‍🌈'].map((em, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                soundFx.playSpinClick();
                                setTestEmoji(em);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-lg border transition-all ${
                                testEmoji === em
                                  ? 'bg-[#FF7A45]/20 border-[#FF7A45]'
                                  : 'bg-[#111C30] border-white/10 hover:border-white/20'
                              }`}
                            >
                              {em}
                            </button>
                          ))}
                          <input
                            type="text"
                            value={testEmoji}
                            onChange={(e) => setTestEmoji(e.target.value)}
                            className="bg-[#111C30] border border-white/10 rounded-lg px-3 py-1 text-sm font-mono text-white w-28 focus:outline-none"
                            placeholder="Type emoji..."
                          />
                        </div>

                        {/* Resulting Token Pieces */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-[#9AAAC0] block">
                            Byte-Level Token Split (GPT-4 cl100k):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {emojiTokens.map((et, i) => (
                              <div
                                key={i}
                                className="px-2 py-1 rounded bg-[#111C30] border border-white/10 text-xs font-mono text-white flex items-center gap-1.5"
                              >
                                <span className="text-[#FF7A45]">#{et.id}</span>
                                <span className="text-[10px] text-[#9AAAC0]">
                                  ({et.hexBytes.join(' ')})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Interactive Widget 2: Context Window & Cost Estimator */}
                    {t.interactiveWidget === 'contextCalculator' && (
                      <div className="p-4 rounded-xl bg-[#080F1E] border border-[#2DD4BF]/30 space-y-4 mt-3">
                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#2DD4BF] font-semibold">
                          <Calculator className="w-4 h-4" />
                          <span>Interactive Token Usage & Cost Estimator</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1 text-xs font-mono">
                            <label className="text-[#9AAAC0] block">
                              Input Prompt Tokens: <span className="text-[#F1F5FC] font-bold">{promptTokens}</span>
                            </label>
                            <input
                              type="range"
                              min="100"
                              max="128000"
                              step="500"
                              value={promptTokens}
                              onChange={(e) => setPromptTokens(Number(e.target.value))}
                              className="w-full accent-[#2DD4BF]"
                            />
                          </div>

                          <div className="space-y-1 text-xs font-mono">
                            <label className="text-[#9AAAC0] block">
                              Output Completion Tokens: <span className="text-[#F1F5FC] font-bold">{completionTokens}</span>
                            </label>
                            <input
                              type="range"
                              min="50"
                              max="16000"
                              step="100"
                              value={completionTokens}
                              onChange={(e) => setCompletionTokens(Number(e.target.value))}
                              className="w-full accent-[#398BFF]"
                            />
                          </div>
                        </div>

                        {/* Estimated Pricing Metric Cards */}
                        <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
                          <div className="p-2.5 rounded-lg bg-[#111C30] border border-white/5">
                            <span className="text-[10px] text-[#9AAAC0] block">TOTAL TOKENS</span>
                            <span className="text-sm font-bold text-[#F1F5FC]">
                              {(promptTokens + completionTokens).toLocaleString()}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-[#111C30] border border-white/5">
                            <span className="text-[10px] text-[#9AAAC0] block">128K CONTEXT %</span>
                            <span className="text-sm font-bold text-[#62C9F5]">
                              {(((promptTokens + completionTokens) / 128000) * 100).toFixed(1)}%
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-[#111C30] border border-white/5">
                            <span className="text-[10px] text-[#9AAAC0] block">EST. GPT-4o COST</span>
                            <span className="text-sm font-bold text-[#2DD4BF]">
                              ${((promptTokens * 0.0000025) + (completionTokens * 0.000010)).toFixed(4)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
