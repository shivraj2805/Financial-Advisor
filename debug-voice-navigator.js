#!/usr/bin/env node

// Debug script to test wake word detection
console.log('🔍 Voice Navigator Debug Tool');
console.log('============================\n');

// Wake word patterns from VoiceNavigator.jsx
const WAKE_WORDS = [
  /^hello\s+fin\s+advisor$/i,
  /^hello\s+financial\s+advisor$/i,
  /^hi\s+fin\s+advisor$/i,
  /^hi\s+financial\s+advisor$/i,
  /^hey\s+fin\s+advisor$/i,
  /^hey\s+financial\s+advisor$/i,
  /^fin\s+advisor$/i,
  /^financial\s+advisor$/i
];

// Test phrases
const testPhrases = [
  "hello financial advisor",
  "hello fin advisor", 
  "hi financial advisor",
  "hi fin advisor",
  "hey financial advisor",
  "hey fin advisor",
  "financial advisor",
  "fin advisor",
  "hello financial advisior", // Your typo
  "hello fin advisior", // Your typo
  "hello financial advisor please help", // Extra words
  "can you help me hello financial advisor", // Extra words
  "hello financial advisor how are you", // Extra words
  "hello financial advisor!", // With punctuation
  "Hello Financial Advisor", // Capital letters
  "HELLO FINANCIAL ADVISOR", // All caps
];

console.log('🧪 Testing Wake Word Detection:');
console.log('================================');

testPhrases.forEach(phrase => {
  const lowerText = phrase.toLowerCase().trim();
  const matches = WAKE_WORDS.some(pattern => pattern.test(lowerText));
  
  console.log(`"${phrase}" → ${matches ? '✅ MATCH' : '❌ NO MATCH'}`);
});

console.log('\n🔧 Issues Found:');
console.log('================');

// Check for common issues
const issues = [];

// Issue 1: Typo in "advisior" vs "advisor"
if (testPhrases.some(p => p.includes('advisior'))) {
  issues.push('❌ You have a typo: "advisior" should be "advisor"');
}

// Issue 2: Extra words
const extraWordsPhrases = testPhrases.filter(p => 
  p.toLowerCase().includes('hello financial advisor') && 
  p.toLowerCase() !== 'hello financial advisor'
);
if (extraWordsPhrases.length > 0) {
  issues.push('❌ Extra words detected. Try saying exactly: "Hello Financial Advisor"');
}

// Issue 3: Punctuation
const punctuationPhrases = testPhrases.filter(p => 
  p.includes('!') || p.includes('.') || p.includes(',')
);
if (punctuationPhrases.length > 0) {
  issues.push('❌ Avoid punctuation. Say: "Hello Financial Advisor" (no ! or .)');
}

issues.forEach(issue => console.log(issue));

console.log('\n💡 Solutions:');
console.log('=============');
console.log('1. Say exactly: "Hello Financial Advisor" (not "advisior")');
console.log('2. Don\'t add extra words like "please" or "help"');
console.log('3. Don\'t add punctuation like "!" or "."');
console.log('4. Speak clearly and at normal volume');
console.log('5. Make sure microphone permissions are allowed');

console.log('\n🎯 Try these exact phrases:');
console.log('==========================');
console.log('✅ "Hello Financial Advisor"');
console.log('✅ "Hi Financial Advisor"');
console.log('✅ "Hey Financial Advisor"');
console.log('✅ "Hello Fin Advisor"');
console.log('✅ "Financial Advisor"');

console.log('\n🔧 If still not working:');
console.log('=======================');
console.log('1. Check browser console for errors');
console.log('2. Verify microphone permissions');
console.log('3. Try refreshing the page');
console.log('4. Use Chrome or Edge browser');
console.log('5. Check if the green dot is visible (wake word active)');
