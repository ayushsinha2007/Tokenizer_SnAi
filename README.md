# BEYBLADE TOKEN LAB — Interactive AI Tokenizer

> **"Every Word Has a Spin."**  
> *An academic exploration of how artificial intelligence decomposes human language into mathematical tokens.*

---

## 🌪️ Project Overview

**BEYBLADE TOKEN LAB** is an interactive, academic-grade AI text tokenization suite and educational workbench. It demonstrates how modern Large Language Models (LLMs) like GPT-4, GPT-4o, and Llama transform continuous written text into discrete token IDs that feed into transformer embedding layers.

The project identity incorporates a subtle, futuristic **Beyblade-inspired design language** — utilizing concentric circular arena energy tracks, minimal orbital particles, and spin/velocity metrics — while maintaining a disciplined developer-dashboard aesthetic with **zero cartoon illustrations or anime graphics**.

---

## 🚀 Key Features

### 1. Interactive Tokenizer Workspace
- **Model Engine Switching**:
  - **GPT-4 / GPT-3.5**: Production Byte-Pair Encoding (`cl100k_base` vocabulary with 100,264 tokens).
  - **GPT-4o (Omni)**: Expanded next-generation vocabulary (`o200k_base` with 200,006 tokens).
  - **Custom BPE Lab**: Dynamic subword vocabulary trained directly in the Vocabulary Lab.
  - **Word-Level Baseline**: Whitespace and punctuation splitting baseline.
  - **Character-Level Baseline**: Direct Unicode codepoint mapping baseline.
- **Rich Text Editor**: Character counter, word counter, paste from clipboard, clear buffer, and instant **Live Sync** or manual **TOKENIZE** execution.
- **Sample Presets**:
  - `Hello, World!`
  - `Artificial Intelligence is fascinating.`
  - `Beyblade battles are legendary!`
  - `I love learning Python programming.`
  - `Tokens spin with high velocity! 🌀⚡🤖`
  - Code snippets and multilingual text.
- **Token Stream Visualization**: Visually separated token chips in a restrained blue/cyan/indigo palette, featuring explicit whitespace indicators (`·` for leading spaces, `↵` for linebreaks).
- **Token Inspector**: Deep inspection of any clicked token:
  - Raw string and character length.
  - Token ID (discrete embedding table index).
  - Sequence span `[start .. end]`.
  - UTF-8 byte sequence in hexadecimal (`0x48 0x65...`).
  - Unicode Codepoints (`U+0048...`).
  - Whitespace / newline status.
- **Dynamic Token Statistics**: Total characters, words, tokens, unique tokens, characters per token, and token-to-word ratio, plus a sequence compression bar chart.

### 2. Token Breakdown Table
- Filterable and responsive data table with `Position`, `Token`, `Token ID`, `Character Length`, and `UTF-8 Bytes`.
- **Search Query**: Real-time filtering by token substring or token ID.
- **Duplicate Highlighter**: Highlights recurring token IDs.
- **Export Capabilities**: One-click copying of individual tokens, JSON export, and Token ID array export (`[9906, 11, ...]`).

### 3. Vocabulary Lab — BPE Builder
- **Educational Byte Pair Encoding Engine**:
  - Train from scratch on any custom corpus or presets (*Classic NLP Toy Corpus*, *Transformers & AI*, *Beyblade Energy Lore*).
  - Configurable target merges / vocabulary size slider.
  - Step-by-step interactive timeline with **Auto Play**, **Step Next**, and **Reset**.
  - **Pair Fusion Animation**: Visualizes two adjacent character badges colliding and fusing into a compound subword token.
  - Top candidate pair frequency table for each step.
  - History of learned merges.
  - **Arbitrary Text Playground**: Test your newly trained BPE vocabulary on any new sentence in real-time.

### 4. Token Battle — Multi-Tokenizer Showdown
- Compare how 4 distinct tokenization algorithms process the exact same sentence side-by-side:
  1. **Word-Level Tokenizer** (unbounded vocabulary, high out-of-vocabulary risk).
  2. **Character-Level Tokenizer** (tiny vocabulary, extreme quadratic attention sequence length explosion).
  3. **Educational BPE Tokenizer** (corpus-adapted frequency merges).
  4. **GPT-4 Pretrained Tokenizer** (production subword BPE with byte-level fallback).
- Metrics per method: token count, sequence length compression, efficiency rating, and pros/cons.

### 5. Token Explorer
- **Frequency Distribution**: Interactive bar chart displaying the most frequent tokens and their percentage share.
- **In-Context Occurrence Highlighter**: Clicking any token highlights all of its positions directly within the source text.
- **Recurring Pattern Detector**: Automatically identifies repeated bigrams / n-grams in the token stream.

### 6. 3D Embedding Explorer
- **Hardware-Accelerated Three.js 3D Scatter Plot**:
  - Three axes: **PC1**, **PC2**, and **PC3** with grid planes, tick marks, and variance metrics.
  - **Sample Sentences**: Rendered as glowing circular points (spheres).
  - **User-Added Sentences**: Rendered as distinct glowing diamond points (octahedrons).
  - Dark visualization panel adhering to the Midnight Navy theme with subtle arena bounding cage.
  - Interactive Legend explaining both categories.
- **Dimensionality Reduction Pipeline**:
  - Dual PCA (Principal Component Analysis) projecting high-dimensional vectors to 3D.
  - Displays Explained Variance for PC1, PC2, and PC3 (typically 80%+ of total variance).
  - Multi-engine toggle: Dense Semantic Centroids (64-D), Pretrained Transformers.js MiniLM (384-D), and Lexical TF-IDF (64-D).
- **Interactive Controls**:
  - Drag to orbit/rotate in 3D.
  - Scroll or dedicated zoom buttons (+ / -).
  - Reset camera view button.
  - Rotate left / Rotate right buttons.
  - Auto-spin toggle for cinematic arena rotation.
  - Hover tooltip displaying sentence text, category, and 3D coordinates.
  - Floating 3D billboard labels toggle.
- **"TRY A WORD OR SENTENCE" Input**:
  - Add arbitrary words or sentences to the plot dynamically.
  - Instant vectorization and re-projection into the 3D space with diamond markers.
  - Validation with error handling for empty or duplicate inputs.
- **"EDIT SAMPLE SENTENCES" Expandable Editor**:
  - Full CRUD: add, edit inline, remove, or reset default baseline sentences.
- **High-Dimensional Cosine Similarity Comparator**:
  - Select any two points (via canvas click or dropdown selectors).
  - Calculates true Cosine Similarity $\cos(\theta) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\|_2 \|\mathbf{v}\|_2}$ directly on the raw high-dimensional vectors (NOT on 3D coordinates).
  - Beginner-friendly educational breakdown of semantic clustering.
- **Educational PCA Explainer Panel**:
  - Modal breakdown detailing the math of mean centering, covariance, and orthogonal eigenvectors.

### 7. Learning Corner
- 7 comprehensive educational modules:
  1. *What is Tokenization?*
  2. *Why Do LLMs Use Tokens Instead of Characters or Words?*
  3. *What Are Token IDs & Embedding Tables?*
  4. *How Does Byte Pair Encoding (BPE) Work?*
  5. *What is Vocabulary Size & Why Does It Matter?*
  6. *How Are Emojis & Special Characters Tokenized?* (Includes interactive emoji byte inspector)
  7. *How Does Tokenization Affect Context Windows & API Costs?* (Includes interactive pricing estimator)

---

## 🎨 Design System & Palette

- **Primary Background**: Midnight Navy (`#080F1E`)
- **Secondary Background**: Dark Blue-Grey (`#111C30`)
- **Card Background**: Deep Slate (`#142137`)
- **Primary Accent**: Electric Blue (`#398BFF`)
- **Secondary Accent**: Muted Cyan (`#62C9F5`)
- **Tertiary Accent / Fusions**: Emerald Cyan (`#2DD4BF`)
- **Warning / Highlight**: Muted Coral (`#FF7A45`)
- **Text**: Off-White (`#F1F5FC`), Cool Grey (`#9AAAC0`)
- **Aesthetic**: Glassmorphism (`backdrop-blur-md`), subtle arena energy rings, clean borders, minimal motion trails.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Dev Server**: Vite 6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Motion & Animations**: Framer Motion & CSS Canvas
- **3D Visualization**: Three.js (WebGL Hardware-Accelerated 3D Scatter Plot)
- **Neural & Semantic Embeddings**: `@xenova/transformers` (`Xenova/all-MiniLM-L6-v2`) & Semantic Centroid Engine
- **Pretrained Tokenization**: `gpt-tokenizer` (`cl100k_base` and `o200k_base`)
- **Audio Feedback**: Web Audio API (subtle synthetic futuristic sound effects)

---

## 💻 Running the Application

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
# Clone or navigate to the directory
cd Tokenizer_SnAi

# Install dependencies
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🧪 Testing

A comprehensive automated test suite is included in `tests/test_suite.ts`. It verifies:
- Tokenization correctness across all sample inputs.
- Token ID accuracy matching OpenAI standard `cl100k_base`.
- Subword BPE pair frequency counting and greedy merge order.
- Multi-byte UTF-8 emoji token splitting.
- Character slice reconstruction fidelity.

Run the test suite with:
```bash
npx esbuild tests/test_suite.ts --bundle --platform=node --outfile=dist/test_bundle.cjs && node dist/test_bundle.cjs
```

---

## 📄 Academic Attribution
Created for the Academic AI / NLP Assignment on **Interactive Text Tokenization and Language Model Preprocessing Architectures**.
All code and visualizations are original implementations.
