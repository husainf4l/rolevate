// Quick test to verify file upload and path resolution
const fs = require('fs');
const path = require('path');

function testFilePathResolution() {
  console.log('🧪 Testing file path resolution...');
  
  // Simulate the resumeUrl that would be generated
  const resumeUrl = 'uploads/cvs/anonymous/cv_test.pdf';
  
  // Test the path resolution logic from cv-text-extractor.ts
  const localPath = resumeUrl.startsWith('http') 
    ? resumeUrl.replace(/^https?:\/\/[^\/]+/, '') // Remove domain from URL
    : resumeUrl;
  
  const fullPath = path.isAbsolute(localPath) 
    ? localPath 
    : path.join(process.cwd(), localPath);
  
  console.log('📁 Current working directory:', process.cwd());
  console.log('📄 Resume URL:', resumeUrl);
  console.log('🔗 Local path:', localPath);
  console.log('📂 Full resolved path:', fullPath);
  console.log('📁 Directory exists:', fs.existsSync(path.dirname(fullPath)));
  
  // Check if uploads directory structure exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const cvsDir = path.join(process.cwd(), 'uploads', 'cvs');
  const anonymousDir = path.join(process.cwd(), 'uploads', 'cvs', 'anonymous');
  
  console.log('\n📂 Directory structure check:');
  console.log('uploads/', fs.existsSync(uploadsDir) ? '✅' : '❌');
  console.log('uploads/cvs/', fs.existsSync(cvsDir) ? '✅' : '❌');
  console.log('uploads/cvs/anonymous/', fs.existsSync(anonymousDir) ? '✅' : '❌');
  
  if (!fs.existsSync(anonymousDir)) {
    console.log('\n🔧 Creating missing directories...');
    fs.mkdirSync(anonymousDir, { recursive: true });
    console.log('✅ Directories created successfully!');
  }
  
  // List files in anonymous directory
  if (fs.existsSync(anonymousDir)) {
    const files = fs.readdirSync(anonymousDir);
    console.log('\n📋 Files in anonymous directory:');
    if (files.length === 0) {
      console.log('(No files found)');
    } else {
      files.forEach(file => {
        const filePath = path.join(anonymousDir, file);
        const stats = fs.statSync(filePath);
        console.log(`📄 ${file} (${stats.size} bytes, ${stats.mtime.toISOString()})`);
      });
    }
  }
}

function checkRecentUploads() {
  console.log('\n🔍 Checking for recent uploads...');
  
  const anonymousDir = path.join(process.cwd(), 'uploads', 'cvs', 'anonymous');
  
  if (!fs.existsSync(anonymousDir)) {
    console.log('❌ Anonymous directory does not exist');
    return;
  }
  
  const files = fs.readdirSync(anonymousDir);
  const recentFiles = files
    .map(file => {
      const filePath = path.join(anonymousDir, file);
      const stats = fs.statSync(filePath);
      return { file, path: filePath, mtime: stats.mtime, size: stats.size };
    })
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
    .slice(0, 5); // Get 5 most recent files
  
  console.log('📋 Recent uploads:');
  if (recentFiles.length === 0) {
    console.log('(No files found)');
  } else {
    recentFiles.forEach((file, index) => {
      const age = Date.now() - file.mtime.getTime();
      const ageMinutes = Math.floor(age / 60000);
      console.log(`${index + 1}. ${file.file}`);
      console.log(`   📂 Path: ${file.path}`);
      console.log(`   📊 Size: ${file.size} bytes`);
      console.log(`   🕒 Age: ${ageMinutes} minutes ago`);
      console.log(`   ✅ Exists: ${fs.existsSync(file.path)}`);
      console.log('');
    });
  }
}

console.log('🚀 File Path Resolution Test\n');
testFilePathResolution();
checkRecentUploads();

console.log('\n📝 Summary:');
console.log('- Resume URLs should now be: "uploads/cvs/anonymous/filename.pdf" (no leading slash)');
console.log('- Full path will be: "' + path.join(process.cwd(), 'uploads/cvs/anonymous/filename.pdf') + '"');
console.log('- CV analysis should now find the uploaded files correctly');
console.log('\n✅ Test completed!');
