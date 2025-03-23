const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Install dependencies
console.log('Installing dependencies...');
execSync('npm run install-all', { stdio: 'inherit' });

// Build client
console.log('Building client...');
execSync('cd client && npm run build', { stdio: 'inherit' });

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'client', 'dist');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Build completed successfully!');