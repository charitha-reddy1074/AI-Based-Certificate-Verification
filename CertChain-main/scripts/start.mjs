#!/usr/bin/env node

import { spawn } from 'child_process';

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('🚀 CertChain - Full Application Startup\n');
console.log('📋 Steps:');
console.log('  1. Installing dependencies...');
console.log('  2. Type checking...');
console.log('  3. Starting development server...\n');

async function runCommand(cmd, args, label) {
  return new Promise((resolve, reject) => {
    console.log(`⏳ ${label}...`);
    const proc = spawn(cmd, args, {
      stdio: 'inherit',
      shell: isWindows,
      cwd: process.cwd(),
    });

    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${label}\n`);
        resolve();
      } else {
        console.error(`❌ ${label} failed\n`);
        reject(new Error(`${label} failed`));
      }
    });

    proc.on('error', (err) => {
      console.error(`❌ Error: ${err.message}`);
      reject(err);
    });
  });
}

async function main() {
  try {
    // Check and install dependencies
    await runCommand(npmCmd, ['install'], 'Installing dependencies');

    // Type check
    await runCommand(npmCmd, ['run', 'check'], 'Running TypeScript check');

    // Initialize database tables
    await runCommand(npmCmd, ['run', 'init-db'], 'Initializing database');

    // Start development server
    console.log('🎯 Starting development server on http://127.0.0.1:5000\n');
    console.log('📌 The application is now running!');
    console.log('💡 Tip: Open http://127.0.0.1:5000 in your browser\n');

    // Run dev server with inherited stdio
    const devProc = spawn(npmCmd, ['run', 'dev'], {
      stdio: 'inherit',
      shell: isWindows,
      cwd: process.cwd(),
    });

    devProc.on('close', (code) => {
      if (code !== 0) {
        console.error(`Application exited with code ${code}`);
        process.exit(code);
      }
    });

    // Handle Ctrl+C gracefully
    process.on('SIGINT', () => {
      console.log('\n\n👋 Shutting down application...');
      devProc.kill();
      process.exit(0);
    });

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n💡 Manual startup:');
    console.log('  1. npm install');
    console.log('  2. npm run check');
    console.log('  3. npm run dev');
    process.exit(1);
  }
}

main();
