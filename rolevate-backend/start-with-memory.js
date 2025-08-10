#!/usr/bin/env node

// This wrapper ensures Node.js memory settings are applied
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting rolevate-backend with 10GB heap...');

// Start the main application with proper memory settings
const child = spawn('node', [
    '--max-old-space-size=10240',
    '--initial-old-space-size=2048',
    '--max-semi-space-size=256',
    path.join(__dirname, 'dist/src/main.js')
], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '4005',
        // Force V8 to be more aggressive with memory
        UV_THREADPOOL_SIZE: '16'
    }
});

child.on('exit', (code) => {
    console.log(`Application exited with code ${code}`);
    process.exit(code);
});

child.on('error', (err) => {
    console.error('Failed to start application:', err);
    process.exit(1);
});
