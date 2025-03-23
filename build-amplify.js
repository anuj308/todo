const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Log the current directory and Node.js version
console.log('Current directory:', process.cwd());
console.log('Node.js version:', process.version);
console.log('NPM version:', execSync('npm --version').toString().trim());

try {
  // Install dependencies in the root project
  console.log('\n=== Installing root dependencies ===');
  execSync('npm install', { stdio: 'inherit' });

  // Install client dependencies with explicit Vite installation
  console.log('\n=== Installing client dependencies ===');
  execSync('cd client && npm install vite@6.2.0 @vitejs/plugin-react --save-dev && npm install', { stdio: 'inherit' });

  // Build client
  console.log('\n=== Building client application ===');
  execSync('cd client && npx vite build', { stdio: 'inherit' });

  // Check if build was created
  const distPath = path.join(process.cwd(), 'client', 'dist');
  if (fs.existsSync(distPath)) {
    console.log('\n=== Client build successful ===');
    console.log('Files in the dist directory:');
    const files = fs.readdirSync(distPath);
    console.log(files);
  } else {
    console.error('Error: Build directory not found!');
    process.exit(1);
  }

  console.log('\n=== Build process completed successfully ===');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}