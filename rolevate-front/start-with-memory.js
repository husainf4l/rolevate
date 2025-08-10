const { spawn } = require('child_process');

// Force Node.js to use the specified memory allocation
const child = spawn('node', [
    '--max-old-space-size=2048',  // 2GB heap
    '--initial-old-space-size=512', // 512MB initial heap
    '--max-semi-space-size=64',    // 64MB for new generation
    '--optimize-for-size',         // Optimize for memory usage
    'node_modules/.bin/next',
    'start'
], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: 3005,
        NODE_OPTIONS: '--max-old-space-size=2048'
    }
});

child.on('error', (error) => {
    console.error(`Error starting frontend: ${error.message}`);
    process.exit(1);
});

child.on('close', (code) => {
    console.log(`Frontend process exited with code ${code}`);
    process.exit(code);
});
