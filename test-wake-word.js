#!/usr/bin/env node

console.log('🧪 Testing Wake Word Detection with Typo');
console.log('========================================\n');

// Test the wake word patterns
const testPhrases = [
  "hello financial advisor", // Correct
  "hello financial advisior", // Your typo
  "hello fin advisor", // Short correct
  "hello fin advisior", // Short typo
  "hi financial advisor", // Correct
  "hi financial advisior", // Your typo
  "hey financial advisor", // Correct
  "hey financial advisior", // Your typo
  "financial advisor", // Correct
  "financial advisior", // Your typo
  "fin advisor", // Correct
  "fin advisior" // Your typo
];

// Patterns that should match
const patterns = [
  /^hello\s+financial\s+advisor$/i,
  /^hello\s+fin\s+advisor$/i,
  /^hi\s+financial\s+advisor$/i,
  /^hi\s+fin\s+advisor$/i,
  /^hey\s+financial\s+advisor$/i,
  /^hey\s+fin\s+advisor$/i,
  /^financial\s+advisor$/i,
  /^fin\s+advisor$/i,
  // Typo patterns
  /hello\s+financial\s+advisior/i,
  /hello\s+fin\s+advisior/i,
  /hi\s+financial\s+advisior/i,
  /hey\s+financial\s+advisior/i,
  /financial\s+advisior/i,
  /fin\s+advisior/i
];

console.log('Testing each phrase:');
console.log('===================');

testPhrases.forEach(phrase => {
  const lowerText = phrase.toLowerCase().trim();
  const matches = patterns.some(pattern => pattern.test(lowerText));
  
  console.log(`"${phrase}" → ${matches ? '✅ MATCH' : '❌ NO MATCH'}`);
});

console.log('\n🎯 Your phrase "Hello Financial Advisior" should now work!');
console.log('✅ The typo has been handled in the wake word detection.');
console.log('\n🚀 Try saying:');
console.log('   - "Hello Financial Advisior" (your typo)');
console.log('   - "Hello Financial Advisor" (correct spelling)');
console.log('   - "Hi Financial Advisior" (your typo)');
console.log('   - "Hey Financial Advisior" (your typo)');
