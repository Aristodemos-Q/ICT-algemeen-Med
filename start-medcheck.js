#!/usr/bin/env node

/**
 * MedCheck+ Starter Script
 * This script is designed to start the Next.js development server
 * with all required configuration regardless of directory structure
 * 
 * Enhanced for better error handling and directory detection
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Determine project paths with error handling
const projectRoot = path.join(__dirname, 'BV-floriande-web-main', 'BV-floriande-web-main');
const srcDir = path.join(projectRoot, 'src');
const appDir = path.join(srcDir, 'app');
const envFile = path.join(projectRoot, '.env.local');

console.log('🚀 Starting MedCheck+ development server...');
console.log('📂 Project directory: ' + projectRoot);
console.log('📂 App directory: ' + appDir);

// Create .env.local if it doesn't exist
if (!fs.existsSync(envFile)) {
  console.log('⚠️ .env.local file not found, creating a template...');
  const envTemplate = `# MedCheck+ Environment Configuration
# Replace with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
`;
  try {
    fs.writeFileSync(envFile, envTemplate);
    console.log('✅ Created .env.local template. Please edit with your actual credentials.');
  } catch (err) {
    console.warn('⚠️ Could not create .env.local template:', err.message);
  }
}

// Check if app directory exists
if (!fs.existsSync(appDir)) {
  console.error('❌ App directory niet gevonden in: ' + appDir);
  console.log('🔍 Searching for app directory...');
  
  try {
    // Try to find the app directory by searching
    const possibleDirs = [
      path.join(__dirname, 'BV-floriande-web-main', 'src', 'app'),
      path.join(__dirname, 'BV-floriande-web-main', 'BV-floriande-web-main', 'src', 'app'),
      path.join(__dirname, 'BV-floriande-web-main', 'app')
    ];
    
    let foundDir = null;
    for (const dir of possibleDirs) {
      if (fs.existsSync(dir)) {
        foundDir = dir;
        console.log(`✅ Found alternative app directory: ${foundDir}`);
        break;
      }
    }
    
    if (!foundDir) {
      console.error('❌ Could not find app directory anywhere. Please check your project structure.');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Error searching for app directory:', err.message);
    process.exit(1);
  }
}

// Check if node_modules exists
if (!fs.existsSync(path.join(projectRoot, 'node_modules'))) {
  console.log('📦 node_modules niet gevonden, npm install uitvoeren...');
  
  try {
    // First, check if we need to install npm itself
    try {
      execSync('npm --version', { stdio: 'ignore' });
    } catch (e) {
      console.error('❌ npm niet geïnstalleerd. Installeer Node.js en npm eerst.');
      process.exit(1);
    }
    
    // Install dependencies
    spawn('npm', ['install'], { 
      cwd: projectRoot, 
      shell: true, 
      stdio: 'inherit' 
    }).on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ npm install mislukt met code ${code}`);
        process.exit(code);
      }
      startNextServer();
    });
  } catch (err) {
    console.error('❌ Error running npm install:', err.message);
    process.exit(1);
  }
} else {
  startNextServer();
}

// Helper function to find an open port
function findOpenPort(startPort, callback) {
  const net = require('net');
  let port = startPort;
  
  function checkPort(port, callback) {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port is in use, try next port
        console.log(`Port ${port} is already in use, trying next port...`);
        checkPort(port + 1, callback);
      } else {
        // Other error
        callback(err);
      }
    });
    
    server.once('listening', () => {
      // Port is free, close server and return port
      server.close(() => {
        callback(null, port);
      });
    });
    
    server.listen(port);
  }
  
  checkPort(port, callback);
}

function startNextServer() {
  console.log('🌐 Starting Next.js development server...');
  
  // Check if next is installed
  try {
    const nextBinPath = path.join(projectRoot, 'node_modules', '.bin', 'next');
    if (!fs.existsSync(nextBinPath) && !fs.existsSync(`${nextBinPath}.cmd`)) {
      console.log('⚠️ Next.js niet gevonden, installeren...');
      execSync('npm install next@latest react@latest react-dom@latest', {
        cwd: projectRoot,
        stdio: 'inherit'
      });
    }
  } catch (err) {
    console.warn('⚠️ Could not check/install Next.js:', err.message);
  }
  
  // Find an open port first, starting from 3000
  findOpenPort(3000, (err, port) => {
    if (err) {
      console.error(`❌ Error finding an open port: ${err.message}`);
      process.exit(1);
    }
    
    console.log(`✅ Found open port: ${port}`);
    
    // Start Next.js dev server
    const nextDev = spawn('npx', [
      'next', 
      'dev',
      '--port', port.toString()
    ], { 
      cwd: projectRoot, 
      shell: true, 
      stdio: 'inherit',
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }
    });

    nextDev.on('error', (err) => {
      console.error(`❌ Failed to start Next.js: ${err.message}`);
      process.exit(1);
    });
    
    nextDev.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ Next.js dev server stopped with code ${code}`);
        process.exit(code);
      }
    });

    // Handle signals to gracefully shut down the server
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping Next.js development server...');
      nextDev.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Stopping Next.js development server...');
      nextDev.kill('SIGTERM');
    });
  });
}
