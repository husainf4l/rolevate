// Test CV file path resolution
const path = require('path');
const fs = require('fs-extra');

async function testCVPath() {
  console.log('🧪 Testing CV file path resolution...');
  
  // Simulate the URL that's causing the error
  const testUrl = '/api/uploads/cvs/cmcvvinsb0000iul6uunqgsd0/cv_89d96f20-a3d8-44ad-bfe0-ab58cf830363.pdf';
  
  console.log('📄 Original URL:', testUrl);
  
  // Apply the same logic as the fixed extractor
  let localPath = testUrl;
  
  // Remove /api prefix if present
  if (localPath.startsWith('/api/')) {
    localPath = localPath.replace('/api/', '');
  }
  
  // Remove leading slash if present (for relative paths)
  if (localPath.startsWith('/uploads/')) {
    localPath = localPath.substring(1);
  }
  
  // Construct full path from project root
  const fullPath = path.join(process.cwd(), localPath);
  
  console.log('📁 Cleaned path:', localPath);
  console.log('📁 Full path:', fullPath);
  console.log('📁 File exists:', await fs.pathExists(fullPath));
  
  // Check what files actually exist in the candidate folder
  const candidateFolderPath = path.dirname(fullPath);
  console.log('📂 Checking candidate folder:', candidateFolderPath);
  
  if (await fs.pathExists(candidateFolderPath)) {
    const files = await fs.readdir(candidateFolderPath);
    console.log('📋 Files in candidate folder:', files);
  } else {
    console.log('❌ Candidate folder does not exist');
    
    // Check parent folders
    const cvsFolder = path.join(process.cwd(), 'uploads', 'cvs');
    console.log('📂 Checking CVs folder:', cvsFolder);
    
    if (await fs.pathExists(cvsFolder)) {
      const candidateFolders = await fs.readdir(cvsFolder);
      console.log('📋 Candidate folders:', candidateFolders);
    }
  }
}

testCVPath().catch(console.error);
