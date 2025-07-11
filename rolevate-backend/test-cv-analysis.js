// Test script to debug CV analysis
require('dotenv').config();
const { extractTextFromCV } = require('./dist/src/utils/cv-text-extractor');
const { OpenaiCvAnalysisService } = require('./dist/src/services/openai-cv-analysis.service');

// Test CV analysis with actual CV file
async function testCVAnalysis() {
  console.log('🧪 Starting CV Analysis Test...');
  
  // Create service instance
  const cvAnalysisService = new OpenaiCvAnalysisService();
  
  // Sample CV URL from uploads folder - using local file path
  const testCVUrl = './uploads/cvs/cmcvvinsb0000iul6uunqgsd0/cv_364b0ac0-ea06-4609-8694-22d5a63c5343.pdf';
  
  // Sample job data
  const testJob = {
    title: 'Sales Representative',
    department: 'Sales',
    company: { name: 'Test Company' },
    location: 'Amman, Jordan',
    skills: ['Sales', 'Communication', 'Negotiation', 'Customer Relations'],
    experience: '2-5 years',
    education: 'Bachelor degree',
    jobLevel: 'MID',
    workType: 'ONSITE',
    description: 'We are looking for a dynamic Sales Representative to join our team.',
    requirements: 'Strong communication skills, sales experience, customer-focused mindset',
    responsibilities: 'Generate leads, manage client relationships, achieve sales targets'
  };
  
  // Test analysis prompt
  const analysisPrompt = `Analyze this candidate's CV for a Sales Representative position. 
  Focus on:
  1. Sales experience and achievements
  2. Communication and interpersonal skills
  3. Customer relationship management experience
  4. Education and training background
  5. Overall fit for the sales role
  
  Provide specific examples from the CV content.`;
  
  try {
    console.log('📄 Testing CV text extraction...');
    const cvText = await extractTextFromCV(testCVUrl);
    console.log('✅ CV text extracted successfully, length:', cvText.length);
    console.log('📄 CV preview:', cvText.substring(0, 300) + '...');
    
    console.log('\n🤖 Testing OpenAI CV analysis...');
    const analysis = await cvAnalysisService.analyzeCVWithOpenAI(testCVUrl, analysisPrompt, testJob);
    
    console.log('✅ Analysis completed:');
    console.log(JSON.stringify(analysis, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testCVAnalysis();