#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎤 Voice Navigator Setup Script');
console.log('================================\n');

async function setupVoiceNavigator() {
  try {
    // Check if .env file exists
    const envPath = path.join(__dirname, 'server', '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      console.log('✅ Found existing .env file');
    } else {
      console.log('📝 Creating new .env file...');
    }

    // Check for Gemini API key
    if (!envContent.includes('GEMINI_API_KEY=')) {
      console.log('\n🔑 Google Gemini API Key Setup');
      console.log('==============================');
      console.log('1. Go to: https://makersuite.google.com/app/apikey');
      console.log('2. Sign in with your Google account');
      console.log('3. Click "Create API Key"');
      console.log('4. Copy the generated API key\n');
      
      const apiKey = await question('Enter your Gemini API key: ');
      
      if (apiKey && apiKey.trim()) {
        envContent += `\n# Google Gemini API\nGEMINI_API_KEY=${apiKey.trim()}\n`;
        console.log('✅ API key added to .env file');
      } else {
        console.log('⚠️  No API key provided. Voice navigator will work with fallback mode.');
      }
    } else {
      console.log('✅ Gemini API key already configured');
    }

    // Check for other required environment variables
    const requiredVars = [
      { name: 'PORT', default: '8080', description: 'Server port' },
      { name: 'JWT_SECRET', default: 'your-super-secret-jwt-key-change-this', description: 'JWT secret key' },
      { name: 'MONGO_URL', default: 'mongodb://localhost:27017/financial-advisor', description: 'MongoDB connection URL' }
    ];

    for (const variable of requiredVars) {
      if (!envContent.includes(`${variable.name}=`)) {
        console.log(`\n📝 ${variable.description}`);
        const value = await question(`${variable.name} (default: ${variable.default}): `);
        const finalValue = value.trim() || variable.default;
        envContent += `${variable.name}=${finalValue}\n`;
        console.log(`✅ ${variable.name} configured`);
      } else {
        console.log(`✅ ${variable.name} already configured`);
      }
    }

    // Write .env file
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Environment variables configured successfully!');

    // Check client .env
    const clientEnvPath = path.join(__dirname, 'client', '.env');
    if (!fs.existsSync(clientEnvPath)) {
      const clientEnvContent = `# Frontend Configuration
REACT_APP_BACKEND_URL=http://localhost:8080
`;
      fs.writeFileSync(clientEnvPath, clientEnvContent);
      console.log('✅ Client .env file created');
    }

    // Check dependencies
    console.log('\n📦 Checking dependencies...');
    
    const serverPackagePath = path.join(__dirname, 'server', 'package.json');
    const clientPackagePath = path.join(__dirname, 'client', 'package.json');
    
    if (fs.existsSync(serverPackagePath)) {
      const serverPackage = JSON.parse(fs.readFileSync(serverPackagePath, 'utf8'));
      if (serverPackage.dependencies['@google/generative-ai']) {
        console.log('✅ Google Generative AI package installed');
      } else {
        console.log('⚠️  Google Generative AI package not found. Run: cd server && npm install');
      }
    }

    if (fs.existsSync(clientPackagePath)) {
      console.log('✅ Client package.json found');
    }

    // Test script
    console.log('\n🧪 Testing Setup...');
    console.log('==================');
    
    // Test .env file
    if (fs.existsSync(envPath)) {
      const envTest = fs.readFileSync(envPath, 'utf8');
      const hasGemini = envTest.includes('GEMINI_API_KEY=');
      const hasPort = envTest.includes('PORT=');
      const hasJWT = envTest.includes('JWT_SECRET=');
      const hasMongo = envTest.includes('MONGO_URL=');
      
      console.log(`✅ .env file: ${hasGemini ? 'Gemini API ✓' : 'Gemini API ✗'}`);
      console.log(`✅ Server config: ${hasPort && hasJWT && hasMongo ? 'Complete ✓' : 'Incomplete ✗'}`);
    }

    // Final instructions
    console.log('\n🎉 Setup Complete!');
    console.log('==================');
    console.log('\n🚀 To start the application:');
    console.log('1. Start server: cd server && npm start');
    console.log('2. Start client: cd client && npm start');
    console.log('3. Open browser: http://localhost:3000');
    console.log('4. Say "Hello Financial Advisor" to activate voice navigator');
    
    console.log('\n📚 For more information, see: VOICE_NAVIGATOR_COMPLETE_GUIDE.md');
    
    console.log('\n🔧 Troubleshooting:');
    console.log('- If voice doesn\'t work, check microphone permissions');
    console.log('- If Gemini API fails, verify your API key');
    console.log('- Check browser console for detailed logs');
    
    rl.close();

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    rl.close();
    process.exit(1);
  }
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Run setup
setupVoiceNavigator();
