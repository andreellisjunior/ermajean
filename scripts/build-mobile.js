#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building mobile version...');

// Backup API directory to prevent static export issues
const apiDir = path.join(process.cwd(), 'app', 'api');
const apiBackup = path.join(process.cwd(), 'app', 'api.backup');

try {
  // Move API directory temporarily
  if (fs.existsSync(apiDir)) {
    console.log('📦 Backing up API directory...');
    if (fs.existsSync(apiBackup)) {
      fs.rmSync(apiBackup, { recursive: true, force: true });
    }
    fs.renameSync(apiDir, apiBackup);
  }

  // Clean out directory
  const outDir = path.join(process.cwd(), 'out');
  if (fs.existsSync(outDir)) {
    console.log('🧹 Cleaning out directory...');
    fs.rmSync(outDir, { recursive: true, force: true });
  }

  // Build with mobile config
  console.log('🔨 Building static export...');
  process.env.NEXT_CONFIG_FILE = 'next.config.mobile.js';
  execSync('next build', { stdio: 'inherit' });

  console.log('✅ Mobile build complete!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} finally {
  // Restore API directory
  if (fs.existsSync(apiBackup)) {
    console.log('🔄 Restoring API directory...');
    if (fs.existsSync(apiDir)) {
      fs.rmSync(apiDir, { recursive: true, force: true });
    }
    fs.renameSync(apiBackup, apiDir);
  }
}
