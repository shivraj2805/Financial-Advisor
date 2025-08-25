import React, { useState, useEffect } from 'react';
import VoiceNavigator from './VoiceNavigator';

const VoiceTest = () => {
  const [status, setStatus] = useState('Initializing...');
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Check if speech recognition is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setStatus('Speech recognition supported ✅');
    } else {
      setStatus('Speech recognition NOT supported ❌');
    }

    // Check if speech synthesis is supported
    if ('speechSynthesis' in window) {
      setStatus(prev => prev + ' | Speech synthesis supported ✅');
    } else {
      setStatus(prev => prev + ' | Speech synthesis NOT supported ❌');
    }
  }, []);

  const testWakeWords = () => {
    const wakeWords = [
      "Hello Financial Advisor",
      "Hi Financial Advisor", 
      "Hey Financial Advisor",
      "Hello Fin Advisor",
      "Financial Advisor"
    ];

    console.log('🎤 Testing wake words:');
    wakeWords.forEach(word => {
      console.log(`- "${word}"`);
    });
  };

  const testSpeechSynthesis = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance("Hello! I'm your Financial Advisor voice assistant. How can I help you today?");
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
      setStatus('Testing speech synthesis...');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎤 Voice Navigator Test Page</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h3>System Status:</h3>
        <p>{status}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
        <h3>✅ How to Test:</h3>
        <ol>
          <li>Look for the microphone button in the bottom-left corner</li>
          <li>You should see a <strong>green dot</strong> indicating wake word is active</li>
          <li>Say exactly: <strong>"Hello Financial Advisor"</strong></li>
          <li>Wait for the voice response</li>
          <li>Try commands like: "Go to calculator" or "Help me save money"</li>
        </ol>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
        <h3>🔧 Troubleshooting:</h3>
        <ul>
          <li><strong>No green dot?</strong> Check microphone permissions</li>
          <li><strong>Not responding?</strong> Try saying "Hello Financial Advisor" (not "advisior")</li>
          <li><strong>Browser errors?</strong> Use Chrome or Edge</li>
          <li><strong>Still not working?</strong> Check browser console (F12)</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '8px' }}>
        <h3>🧪 Test Functions:</h3>
        <button 
          onClick={testWakeWords}
          style={{ margin: '5px', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Test Wake Words (Console)
        </button>
        <button 
          onClick={testSpeechSynthesis}
          style={{ margin: '5px', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Test Speech Synthesis
        </button>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8d7da', borderRadius: '8px' }}>
        <h3>❌ Common Issues:</h3>
        <ul>
          <li><strong>Typo:</strong> "advisior" → "advisor"</li>
          <li><strong>Extra words:</strong> "Hello Financial Advisor please help" → "Hello Financial Advisor"</li>
          <li><strong>Punctuation:</strong> "Hello Financial Advisor!" → "Hello Financial Advisor"</li>
          <li><strong>Microphone:</strong> Check browser permissions</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#d4edda', borderRadius: '8px' }}>
        <h3>✅ Working Phrases:</h3>
        <ul>
          <li>"Hello Financial Advisor"</li>
          <li>"Hi Financial Advisor"</li>
          <li>"Hey Financial Advisor"</li>
          <li>"Hello Fin Advisor"</li>
          <li>"Financial Advisor"</li>
        </ul>
      </div>

      {/* Voice Navigator Component */}
      <VoiceNavigator />
    </div>
  );
};

export default VoiceTest;
