// Test CORS configuration for OCR endpoint
const https = require('https');

const testCORS = () => {
  console.log('🔍 Testing CORS configuration...');
  
  const options = {
    hostname: 'financial-advisior.onrender.com',
    port: 443,
    path: '/api/ocr/test',
    method: 'GET',
    headers: {
      'Origin': 'https://financial-advisior.vercel.app',
      'User-Agent': 'CORS-Test-Script'
    }
  };

  const req = https.request(options, (res) => {
    console.log('📊 Response Status:', res.statusCode);
    console.log('📊 Response Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📊 Response Body:', data);
      
      // Check CORS headers
      const corsHeaders = {
        'Access-Control-Allow-Origin': res.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': res.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': res.headers['access-control-allow-headers'],
        'Access-Control-Allow-Credentials': res.headers['access-control-allow-credentials']
      };
      
      console.log('🔍 CORS Headers Found:', corsHeaders);
      
      if (corsHeaders['Access-Control-Allow-Origin']) {
        console.log('✅ CORS headers are present');
      } else {
        console.log('❌ CORS headers are missing');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error);
  });

  req.end();
};

// Test preflight request
const testPreflight = () => {
  console.log('🔍 Testing CORS preflight request...');
  
  const options = {
    hostname: 'financial-advisior.onrender.com',
    port: 443,
    path: '/api/ocr/upload-financial-doc',
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://financial-advisior.vercel.app',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type',
      'User-Agent': 'CORS-Test-Script'
    }
  };

  const req = https.request(options, (res) => {
    console.log('📊 Preflight Response Status:', res.statusCode);
    console.log('📊 Preflight Response Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📊 Preflight Response Body:', data);
      
      // Check CORS headers
      const corsHeaders = {
        'Access-Control-Allow-Origin': res.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': res.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': res.headers['access-control-allow-headers'],
        'Access-Control-Allow-Credentials': res.headers['access-control-allow-credentials']
      };
      
      console.log('🔍 Preflight CORS Headers Found:', corsHeaders);
      
      if (corsHeaders['Access-Control-Allow-Origin']) {
        console.log('✅ Preflight CORS headers are present');
      } else {
        console.log('❌ Preflight CORS headers are missing');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Preflight request failed:', error);
  });

  req.end();
};

// Run tests
console.log('🚀 Starting CORS tests...');
testCORS();

setTimeout(() => {
  testPreflight();
}, 2000);
