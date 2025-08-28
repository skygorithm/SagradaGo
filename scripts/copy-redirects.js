const fs = require('fs');
const path = require('path');

try {
  const source = path.join(process.cwd(), 'public', '_redirects');
  const dest = path.join(process.cwd(), 'build', '_redirects');
  
  fs.copyFileSync(source, dest);
  console.log('Successfully copied _redirects file to build directory');
} catch (error) {
  console.error('Error copying _redirects file:', error);
  process.exit(1);
}