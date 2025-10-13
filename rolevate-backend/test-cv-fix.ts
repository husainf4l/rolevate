import { CvParsingService } from './src/services/cv-parsing.service';
import { AwsS3Service } from './src/services/aws-s3.service';

async function testCVAnalysis() {
  console.log('🧪 Testing CV Analysis with S3 Presigned URLs...');

  try {
    // Test S3 service initialization
    const s3Service = new AwsS3Service();
    console.log('✅ S3 Service initialized');

    // Test presigned URL generation (using a dummy S3 URL)
    const testS3Url = 'https://your-bucket.s3.amazonaws.com/test-cv.pdf';
    const presignedUrl = await s3Service.generatePresignedUrl(testS3Url, 300);
    console.log('✅ Presigned URL generated:', presignedUrl.substring(0, 100) + '...');

    // Test CV parsing service
    const cvService = new CvParsingService();
    console.log('✅ CV Parsing Service initialized');

    console.log('🎉 All services initialized successfully!');
    console.log('📝 Note: Full CV analysis test requires actual S3 file and OpenAI API key');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCVAnalysis();
