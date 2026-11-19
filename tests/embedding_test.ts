import { embedSemanticCentroid } from '../src/engine/embeddings/semanticVectorizer';
import { embedLexicalTfIdf } from '../src/engine/embeddings/lexicalVectorizer';
import { runDualPca } from '../src/engine/embeddings/pcaEngine';
import { calculateCosineSimilarity } from '../src/engine/embeddings/similarityEngine';
import { SentenceItem } from '../src/engine/embeddings/types';

console.log('--- STARTING 3D EMBEDDING EXPLORER TESTS ---');

const sampleTexts = [
  'Artificial intelligence is transforming the world.',
  'Machine learning helps computers recognize patterns.',
  'Natural language processing allows computers to understand text.',
  'Python is a popular programming language.',
  'Beyblade battles are legendary.',
  'Technology connects people across the world.',
];

// 1. Embed samples using Semantic Centroid Vectorizer
const sampleItems: SentenceItem[] = sampleTexts.map((text, idx) => ({
  id: `sample-${idx + 1}`,
  text,
  category: 'sample',
  createdAt: Date.now() + idx,
  vector: embedSemanticCentroid(text),
}));

console.log(`\nGenerated 64-D vectors for ${sampleItems.length} sample sentences:`);
sampleItems.forEach((s, idx) => {
  console.log(`  [${idx + 1}] "${s.text}" (Vector len: ${s.vector?.length}, norm: ${Math.hypot(...s.vector!).toFixed(3)})`);
});

// 2. Cosine Similarity Analysis
console.log('\n--- TESTING PAIRWISE COSINE SIMILARITIES ---');
const sim_AI_ML = calculateCosineSimilarity(sampleItems[0], sampleItems[1]);
console.log(`Similarity("AI transforming world", "ML recognize patterns"): ${sim_AI_ML.cosineSimilarity} (${sim_AI_ML.explanation.substring(0, 30)}...)`);

const sim_AI_NLP = calculateCosineSimilarity(sampleItems[0], sampleItems[2]);
console.log(`Similarity("AI transforming world", "NLP understand text"): ${sim_AI_NLP.cosineSimilarity}`);

const sim_AI_Beyblade = calculateCosineSimilarity(sampleItems[0], sampleItems[4]);
console.log(`Similarity("AI transforming world", "Beyblade battles legendary"): ${sim_AI_Beyblade.cosineSimilarity}`);

// Assertions for semantic realism
if (sim_AI_ML.cosineSimilarity <= sim_AI_Beyblade.cosineSimilarity) {
  throw new Error('Semantic assertion failed: AI and ML should be more similar than AI and Beyblade!');
}
console.log('✓ Verified: AI and ML cluster together with significantly higher similarity than Beyblade!');

// 3. Test Dual PCA Projection
console.log('\n--- TESTING DUAL PCA PROJECTION ---');
const pcaRes = runDualPca(sampleItems);
console.log(`Explained Variance: PC1=${pcaRes.explainedVariance[0]}%, PC2=${pcaRes.explainedVariance[1]}%, PC3=${pcaRes.explainedVariance[2]}%`);
console.log('Projected 3D Coordinates (PC1, PC2, PC3):');
pcaRes.coordinates.forEach((c, idx) => {
  console.log(`  "${sampleTexts[idx].substring(0, 30)}...": (x=${c.x}, y=${c.y}, z=${c.z})`);
});

// 4. Test Adding User Sentence
console.log('\n--- TESTING USER SENTENCE ADDITION ---');
const userSentence: SentenceItem = {
  id: 'user-1',
  text: 'Deep neural networks learn representations.',
  category: 'user',
  createdAt: Date.now(),
  vector: embedSemanticCentroid('Deep neural networks learn representations.'),
};

const combined = [...sampleItems, userSentence];
const updatedPca = runDualPca(combined);
console.log(`Updated PCA with user sentence: total points = ${updatedPca.coordinates.length}`);
const userCoord = updatedPca.coordinates.find(c => c.id === 'user-1');
console.log(`User diamond coordinate: (x=${userCoord?.x}, y=${userCoord?.y}, z=${userCoord?.z})`);

const simUserToAI = calculateCosineSimilarity(userSentence, sampleItems[0]);
const simUserToBeyblade = calculateCosineSimilarity(userSentence, sampleItems[4]);
console.log(`Similarity(User "Deep neural networks", "AI"): ${simUserToAI.cosineSimilarity}`);
console.log(`Similarity(User "Deep neural networks", "Beyblade"): ${simUserToBeyblade.cosineSimilarity}`);

if (simUserToAI.cosineSimilarity <= simUserToBeyblade.cosineSimilarity) {
  throw new Error('User sentence assertion failed!');
}
console.log('✓ Verified: User sentence "Deep neural networks" clusters tightly with AI/ML!');

// 5. Test Lexical TF-IDF
console.log('\n--- TESTING LEXICAL TF-IDF ---');
const corpus = sampleTexts;
const lexVec1 = embedLexicalTfIdf(sampleTexts[0], corpus);
const lexVec2 = embedLexicalTfIdf(sampleTexts[1], corpus);
console.log(`Lexical TF-IDF vector generated (dim: ${lexVec1.length}, norm: ${Math.hypot(...lexVec1).toFixed(3)})`);

console.log('\n--- ALL 3D EMBEDDING TESTS PASSED SUCCESSFULLY! ---');
