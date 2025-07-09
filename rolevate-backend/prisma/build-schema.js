#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SCHEMA_DIR = path.join(__dirname, 'schema');
const OUTPUT_FILE = path.join(__dirname, 'schema.prisma');

// Order matters - base should come first, then models in dependency order
const schemaFiles = [
  'base.prisma',
  'user.prisma', 
  'company.prisma',
  'job.prisma',
  'application.prisma'
];

function buildSchema() {
  let combinedSchema = '';
  
  console.log('🔧 Building Prisma schema from multiple files...');
  
  schemaFiles.forEach((file, index) => {
    const filePath = path.join(SCHEMA_DIR, file);
    
    if (fs.existsSync(filePath)) {
      console.log(`📄 Adding ${file}...`);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Add some spacing between files (except for the first one)
      if (index > 0) {
        combinedSchema += '\n\n';
      }
      
      combinedSchema += content;
    } else {
      console.log(`⚠️  Warning: ${file} not found, skipping...`);
    }
  });
  
  // Write the combined schema
  fs.writeFileSync(OUTPUT_FILE, combinedSchema);
  
  console.log('✅ Schema built successfully!');
  console.log(`📝 Output: ${OUTPUT_FILE}`);
}

function watchSchema() {
  console.log('👀 Watching for changes in schema files...');
  
  // Initial build
  buildSchema();
  
  // Watch for changes
  fs.watch(SCHEMA_DIR, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.prisma')) {
      console.log(`🔄 File changed: ${filename}`);
      buildSchema();
    }
  });
}

// Check command line arguments
const args = process.argv.slice(2);
const isWatch = args.includes('--watch') || args.includes('-w');

if (isWatch) {
  watchSchema();
} else {
  buildSchema();
}
