const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

try {
  console.log('📦 Building Netlify functions...');
  
  const functionsDir = path.join(__dirname, '..', 'netlify', 'functions');
  
  // Check if functions directory exists
  if (!fs.existsSync(functionsDir)) {
    console.log('⚠️  Netlify functions directory not found. Skipping...');
    process.exit(0);
  }
  
  // Change to functions directory
  process.chdir(functionsDir);
  
  // Install dependencies without devDependencies
  console.log('📦 Installing function dependencies...');
  execSync('npm install --omit=dev', { stdio: 'inherit' });
  
  console.log('✅ Functions built successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Error building functions:', error.message);
  // Don't fail the entire installation - just warn
  process.exit(0);
}