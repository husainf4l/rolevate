/**
 * Test GraphQL File Upload using Base64 Encoding
 * 
 * BEST PRACTICE FOR APOLLO SERVER 5 + FASTIFY + NEST JS
 * 
 * Why base64?
 * - Apollo Server 4+ removed built-in file upload support
 * - Base64 encoding is simpler, more reliable, and works everywhere
 * - No multipart complexity or compatibility issues
 * - Industry standard for modern GraphQL APIs (GitHub, Shopify, etc.)
 * 
 * Usage:
 *   npm run start:dev
 *   npx ts-node test-graphql-upload-base64.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const GRAPHQL_ENDPOINT = 'http://localhost:4005/graphql';

// Create a test file if it doesn't exist
const testFilePath = path.join(__dirname, 'test-upload.txt');
if (!fs.existsSync(testFilePath)) {
  fs.writeFileSync(testFilePath, 'This is a test file for GraphQL upload via base64 encoding!');
}

/**
 * Convert file to base64
 */
function fileToBase64(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer.toString('base64');
}

/**
 * Test uploading a file to S3 using base64 encoding
 */
async function testUploadFileToS3() {
  console.log('\n📤 Testing uploadFileToS3 (base64 encoding)...\n');

  const base64File = fileToBase64(testFilePath);
  const filename = 'test-upload.txt';
  const mimetype = 'text/plain';
  const folder = 'test-uploads';

  const mutation = `
    mutation UploadFile($base64File: String!, $filename: String!, $mimetype: String!, $folder: String) {
      uploadFileToS3(
        base64File: $base64File
        filename: $filename
        mimetype: $mimetype
        folder: $folder
      ) {
        url
        key
        bucket
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          base64File,
          filename,
          mimetype,
          folder,
        },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error('❌ Error:', result.errors);
      return;
    }

    console.log('✅ File uploaded successfully!');
    console.log('📎 URL:', result.data.uploadFileToS3.url);
    console.log('🔑 Key:', result.data.uploadFileToS3.key);
    console.log('🪣 Bucket:', result.data.uploadFileToS3.bucket);
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
  }
}

/**
 * Test uploading a CV to S3 using base64 encoding
 */
async function testUploadCVToS3() {
  console.log('\n📄 Testing uploadCVToS3 (base64 encoding)...\n');

  const base64File = fileToBase64(testFilePath);
  const filename = 'resume-john-doe.pdf';
  const mimetype = 'application/pdf';
  const candidateId = 'candidate-123';

  const mutation = `
    mutation UploadCV($base64File: String!, $filename: String!, $mimetype: String!, $candidateId: String) {
      uploadCVToS3(
        base64File: $base64File
        filename: $filename
        mimetype: $mimetype
        candidateId: $candidateId
      ) {
        url
        key
        bucket
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          base64File,
          filename,
          mimetype,
          candidateId,
        },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error('❌ Error:', result.errors);
      return;
    }

    console.log('✅ CV uploaded successfully!');
    console.log('📎 URL:', result.data.uploadCVToS3.url);
    console.log('🔑 Key:', result.data.uploadCVToS3.key);
    console.log('🪣 Bucket:', result.data.uploadCVToS3.bucket);
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
  }
}

/**
 * Test generating presigned URL
 */
async function testGeneratePresignedUrl(s3Url: string) {
  console.log('\n🔗 Testing generateS3PresignedUrl...\n');

  const mutation = `
    mutation GeneratePresignedUrl($input: GeneratePresignedUrlInput!) {
      generateS3PresignedUrl(input: $input) {
        url
        expiresIn
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            s3Url,
            expiresIn: 3600,
          },
        },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error('❌ Error:', result.errors);
      return;
    }

    console.log('✅ Presigned URL generated successfully!');
    console.log('🔗 URL:', result.data.generateS3PresignedUrl.url);
    console.log('⏱️  Expires in:', result.data.generateS3PresignedUrl.expiresIn, 'seconds');
  } catch (error) {
    console.error('❌ Presigned URL generation failed:', error.message);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting GraphQL File Upload Tests (Base64 Encoding)');
  console.log('====================================================');
  console.log('💡 Using industry-standard base64 encoding');
  console.log('✨ Compatible with Apollo Server 5 + Fastify + NestJS');
  console.log('====================================================\n');

  await testUploadFileToS3();
  await testUploadCVToS3();
  
  // Optionally test presigned URL with a real S3 URL from previous upload
  // await testGeneratePresignedUrl('https://your-bucket.s3.region.amazonaws.com/path/to/file');

  console.log('\n✅ All tests completed!\n');
}

runTests().catch((error) => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
