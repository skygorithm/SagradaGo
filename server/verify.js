const fs = require('fs');
const path = require('path');
const http = require('http');

// Check .env file
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('Please create a .env file with:');
  console.log('PORT=5001');
  console.log('GEMINI_API_KEY=your_gemini_api_key_here');
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const hasApiKey = envContent.includes('GEMINI_API_KEY=');
if (!hasApiKey) {
  console.error('❌ GEMINI_API_KEY not found in .env file');
  process.exit(1);
}

// Check if port 5001 is available
const testServer = http.createServer();
testServer.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error('❌ Port 5001 is already in use');
    console.log('Please stop any running servers and try again');
    process.exit(1);
  }
});

testServer.listen(5001, () => {
  testServer.close(() => {
    console.log('✅ Port 5001 is available');
    console.log('✅ .env file exists and contains API key');
    console.log('\nStarting server...');
    require('./server.js');
  });
}); 