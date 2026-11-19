import { tokenizePretrained } from '../src/engine/pretrainedTokenizer';
import { EducationalBpeEngine } from '../src/engine/bpeEngine';
import { tokenizeWordLevel } from '../src/engine/wordTokenizer';
import { tokenizeCharLevel } from '../src/engine/charTokenizer';
import { calculateTokenStatistics } from '../src/engine/statsEngine';
import { runBattleComparison, tokenizeWithModel } from '../src/engine/tokenizerRegistry';

console.log('--- STARTING COMPREHENSIVE TOKENIZER SUITE TESTS ---');

// Test 1: Sample Prompts Tokenization
const samples = [
  'Hello, World!',
  'Artificial Intelligence is fascinating.',
  'Beyblade battles are legendary!',
  'I love learning Python programming.',
  'Tokens spin with high velocity! 🌀⚡🤖'
];

for (const sample of samples) {
  console.log(`\nTesting sample: "${sample}"`);
  
  // GPT-4
  const gpt4Toks = tokenizePretrained(sample, 'gpt-4');
  console.log(`  GPT-4 (cl100k): ${gpt4Toks.length} tokens -> IDs: [${gpt4Toks.map(t => t.id).join(', ')}]`);
  
  // Verify token reconstruction
  const reconstructed = gpt4Toks.map(t => t.text).join('');
  if (reconstructed !== sample) {
    console.warn(`  Warning: Reconstruction difference! original="${sample}" reconstructed="${reconstructed}"`);
  } else {
    console.log(`  ✓ Perfect character slice reconstruction.`);
  }

  // Check stats
  const stats = calculateTokenStatistics(sample, gpt4Toks);
  console.log(`  Stats: chars=${stats.totalCharacters}, words=${stats.totalWords}, tokens=${stats.totalTokens}, chars/token=${stats.averageCharsPerToken}`);
}

// Test 2: Educational BPE Engine
console.log('\n--- TESTING EDUCATIONAL BPE ENGINE ---');
const bpe = new EducationalBpeEngine();
const trainRes = bpe.train({
  corpus: 'low lower lowest newer widest wide wider spin power arena battle',
  maxMerges: 8
});

console.log(`Initial vocab size: ${trainRes.initialVocab.length}`);
console.log(`Initial vocab: [${trainRes.initialVocab.slice(0, 10).join(', ')}...]`);
console.log(`Completed merges: ${trainRes.merges.length}`);
trainRes.merges.forEach((m, i) => {
  console.log(`  Merge ${i + 1}: (${m.pair[0]}, ${m.pair[1]}) -> "${m.merged}" (count: ${m.count})`);
});
console.log(`Final vocab size: ${trainRes.finalVocab.length}`);

// Test inference on new string
const bpeTestInput = 'lowest wide arena';
const bpeTokens = bpe.tokenize(bpeTestInput);
console.log(`BPE Tokenize("${bpeTestInput}"):`, bpeTokens.map(t => `${t.text} (#${t.id})`));

// Test 3: Token Battle
console.log('\n--- TESTING TOKEN BATTLE COMPARISON ---');
const battleInput = 'Beyblade battles are legendary!';
const battleResults = runBattleComparison(battleInput, bpe);
battleResults.forEach(r => {
  console.log(`  [${r.category}] ${r.name}: ${r.tokenCount} tokens, ${r.charsPerToken} chars/tok, ${r.efficiencyRating}`);
});

console.log('\n--- ALL TEST SUITES COMPLETED SUCCESSFULLY ---');
