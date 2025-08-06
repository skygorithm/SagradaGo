const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('\nPlease create a .env file with the following content:');
  console.log('PORT=5001');
  console.log('NODE_ENV=development');
  console.log('GEMINI_API_KEY=your_gemini_api_key_here');
  process.exit(1);
}

// Read .env file to check for API key
const envContent = fs.readFileSync(envPath, 'utf8');
if (!envContent.includes('GEMINI_API_KEY=')) {
  console.error('❌ GEMINI_API_KEY not found in .env file!');
  console.log('\nPlease add your Gemini API key to the .env file:');
  console.log('GEMINI_API_KEY=your_gemini_api_key_here');
  process.exit(1);
}

// Start the server
console.log('Starting server...');
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  shell: true
});

// Handle server process events
server.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.kill();
  process.exit(0);
}); 