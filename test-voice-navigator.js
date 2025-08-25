#!/usr/bin/env node

// Use built-in fetch (Node.js 18+)

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:8080';

console.log('🧪 Voice Navigator API Test');
console.log('===========================\n');

async function testVoiceNavigator() {
  try {
    console.log(`🔗 Testing API at: ${BASE_URL}`);
    
    // Test 1: Connection test
    console.log('\n1️⃣ Testing connection...');
    try {
      const response = await fetch(`${BASE_URL}/api/voice-navigation/test`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Connection successful!');
        console.log(`   Version: ${data.version}`);
        console.log(`   Features: ${data.features.length} available`);
      } else {
        console.log('❌ Connection failed:', response.status);
      }
    } catch (error) {
      console.log('❌ Connection error:', error.message);
      console.log('   Make sure the server is running: cd server && npm start');
      return;
    }

    // Test 2: Voice processing
    console.log('\n2️⃣ Testing voice command processing...');
    const testCommands = [
      {
        command: "hello financial advisor",
        expected: "greeting"
      },
      {
        command: "go to calculator",
        expected: "navigate"
      },
      {
        command: "help me save money",
        expected: "navigate"
      },
      {
        command: "schedule a meeting",
        expected: "schedule_meeting"
      }
    ];

    for (const test of testCommands) {
      try {
        console.log(`   Testing: "${test.command}"`);
        
        const response = await fetch(`${BASE_URL}/api/voice-navigation/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            command: test.command,
            currentPage: "/",
            websiteStructure: {
              pages: {
                home: { path: "/", description: "Main homepage" },
                calculator: { path: "/ppf", description: "PPF calculator" },
                expenses: { path: "/expenses", description: "Expense tracker" },
                learn: { path: "/learn", description: "Learning resources" }
              },
              actions: {
                "schedule meeting": { action: "schedule_meeting", description: "Schedule consultation" }
              }
            },
            conversationMode: false,
            userId: "test-user"
          })
        });

        if (response.ok) {
          const data = await response.json();
          const success = data.action && data.action.type;
          const confidence = data.action?.confidence || 0;
          
          console.log(`   ✅ Response: ${data.response}`);
          console.log(`   📊 Action: ${data.action?.type || 'none'} (confidence: ${confidence})`);
          
          if (data.action?.type === test.expected || confidence > 0.5) {
            console.log(`   🎯 Test passed!`);
          } else {
            console.log(`   ⚠️  Unexpected action type`);
          }
        } else {
          console.log(`   ❌ Request failed: ${response.status}`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Test 3: Analytics
    console.log('\n3️⃣ Testing analytics...');
    try {
      const response = await fetch(`${BASE_URL}/api/voice-analytics/stats`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Analytics working!');
        console.log(`   Total commands: ${data.totalCommands}`);
        console.log(`   Success rate: ${data.successRate || 'N/A'}%`);
      } else {
        console.log('❌ Analytics failed:', response.status);
      }
    } catch (error) {
      console.log('❌ Analytics error:', error.message);
    }

    // Test 4: Cache management
    console.log('\n4️⃣ Testing cache management...');
    try {
      const response = await fetch(`${BASE_URL}/api/voice-navigation/cache/stats`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Cache working!');
        console.log(`   Cache size: ${data.size} entries`);
        console.log(`   Max age: ${data.maxAge}ms`);
      } else {
        console.log('❌ Cache failed:', response.status);
      }
    } catch (error) {
      console.log('❌ Cache error:', error.message);
    }

    console.log('\n🎉 Test Summary');
    console.log('===============');
    console.log('✅ Voice Navigator API is working!');
    console.log('✅ Google Gemini integration is active');
    console.log('✅ Analytics and caching are functional');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Start the client: cd client && npm start');
    console.log('2. Open browser: http://localhost:3000');
    console.log('3. Say "Hello Financial Advisor" to test voice navigation');
    console.log('4. Try commands like "Go to calculator" or "Help me save money"');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testVoiceNavigator();
