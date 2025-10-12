import { OpenaiCvAnalysisService } from './src/services/openai-cv-analysis.service';

async function testCVAnalysis() {
  const service = new OpenaiCvAnalysisService();

  // Test with a sample S3 URL (this might not exist, but will show the error)
  const testUrl = 'https://4wk-garage-media.s3.me-central-1.amazonaws.com/cvs/test.pdf';
  const testPrompt = 'Analyze this CV for a software developer position';
  const testJob = {
    title: 'Software Developer',
    company: { name: 'Test Company' },
    skills: ['JavaScript', 'Node.js']
  };

  try {
    console.log('Testing CV analysis...');
    const result = await service.analyzeCVWithOpenAI(testUrl, testPrompt, testJob);
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testCVAnalysis();