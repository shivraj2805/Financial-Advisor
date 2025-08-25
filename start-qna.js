const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting QnA Session System...\n');

// Start backend server
console.log('📡 Starting Backend Server...');
const backend = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

// Wait a bit for backend to start, then start frontend
setTimeout(() => {
  console.log('\n🌐 Starting Frontend Server...');
  const frontend = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit',
    shell: true
  });

  frontend.on('error', (error) => {
    console.error('❌ Frontend Error:', error);
  });
}, 3000);

backend.on('error', (error) => {
  console.error('❌ Backend Error:', error);
});

console.log('\n✅ QnA System Starting...');
console.log('📱 Frontend will be available at: http://localhost:3000');
console.log('🔗 QnA Page will be at: http://localhost:3000/qna');
console.log('📡 Backend API will be at: http://localhost:8080');
console.log('\n💡 Make sure you have MongoDB running and environment variables set up!');