import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';

async function testGraphQLUploadBase64() {
  console.log('🧪 Testing GraphQL File Upload (Base64 Method)...\n');

  try {
    // Create a test file
    const testContent = 'This is a test CV file.\nName: John Doe\nSkills: JavaScript, TypeScript, Node.js, React';
    const testFilePath = path.join(__dirname, 'test-cv.txt');
    fs.writeFileSync(testFilePath, testContent);

    // Read file and convert to base64
    const fileBuffer = fs.readFileSync(testFilePath);
    const base64File = fileBuffer.toString('base64');

    console.log('1️⃣ Testing uploadCVToS3 with base64...');
    
    // Test uploadCV
    const mutation1 = {
      query: `
        mutation UploadCV($base64File: String!, $filename: String!, $candidateId: String) {
          uploadCVToS3(base64File: $base64File, filename: $filename, candidateId: $candidateId) {
            url
            key
            bucket
          }
        }
      `,
      variables: {
        base64File: base64File,
        filename: 'john-doe-cv.txt',
        candidateId: 'candidate-456'
      }
    };

    const response1 = await fetch('http://localhost:4005/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mutation1),
    });

    const result1 = await response1.json();
    
    if (result1.errors) {
      console.error('❌ GraphQL Errors:', JSON.stringify(result1.errors, null, 2));
      console.log('\n💡 Note: The current GraphQL setup expects base64 encoded files.');
      console.log('   Update the resolver to accept base64File as String parameter.');
    } else {
      console.log('✅ Upload successful:', result1.data.uploadCVToS3);
    }
    
    console.log();

    // Cleanup
    fs.unlinkSync(testFilePath);

    console.log('📋 Summary:');
    console.log('The GraphQL mutations need to be updated to accept base64 strings.');
    console.log('\nCurrent approach requires:');
    console.log('- multipart/form-data with graphql-upload');
    console.log('- mercurius-upload for Fastify');
    console.log('- Or base64 encoding for simpler implementation');

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testGraphQLUploadBase64();
