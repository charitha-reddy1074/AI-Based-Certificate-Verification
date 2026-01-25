#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

const isWindows = process.platform === 'win32';
const startupScript = isWindows ? 'npm.cmd' : 'npm';

console.log('🚀 Starting CertChain Application...\n');
console.log('📋 Startup Steps:');
console.log('  1. Starting PostgreSQL database via Docker...');
console.log('  2. Waiting for database to be ready...');
console.log('  3. Running TypeScript type check...');
console.log('  4. Starting Node.js development server...\n');

async function runCommand(command, args, label) {
  return new Promise((resolve, reject) => {
    console.log(`⏳ ${label}...`);
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: isWindows,
      cwd: process.cwd(),
    });

    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${label} completed\n`);
        resolve();
      } else {
        console.error(`❌ ${label} failed with code ${code}`);
        reject(new Error(`${label} failed`));
      }
    });

    proc.on('error', (err) => {
      console.error(`❌ ${label} error:`, err.message);
      reject(err);
    });
  });
}

async function start() {
  try {
    // Step 1: Start Docker database
    await runCommand(startupScript, ['run', 'db:start'], 'Starting PostgreSQL database');

    // Step 2: Wait for database
    console.log('⏳ Waiting for database to be ready (10 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    console.log('✅ Database ready\n');

    // Step 3: Type check
    await runCommand(startupScript, ['run', 'check'], 'TypeScript type check');

    // Step 4: Start dev server
    console.log('🎯 Starting development server...\n');
    await runCommand(startupScript, ['run', 'dev'], 'Development server');

  } catch (error) {
    console.error('❌ Startup failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('  • Make sure Docker is installed and running');
    console.log('  • Run: docker --version');
    console.log('  • Try: npm run db:start (to start database only)');
    console.log('  • Then: npm run dev (to start application only)');
    process.exit(1);
  }
}

start();
