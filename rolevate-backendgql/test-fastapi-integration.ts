import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ApplicationService } from './src/application/application.service';
import { Job } from './src/job/job.entity';
import axios from 'axios';

async function testFastApiIntegration() {
  console.log('🧪 Testing FastAPI CV Analysis Integration...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const applicationService = app.get(ApplicationService);

  try {
    // Get the latest application with all relations
    console.log('📋 Fetching latest application...');
    const applications = await applicationService.findAll();

    if (!applications || applications.length === 0) {
      console.log('❌ No applications found in database');
      return;
    }

    const application = applications[0]; // Already sorted by createdAt DESC
    console.log(`✅ Found application: ${application.id}`);
    console.log(`👤 Candidate: ${application.candidate?.name || 'N/A'}`);
    console.log(`� LinkedIn: ${application.candidate?.candidateProfile?.linkedinUrl || 'N/A'}`);
    console.log(`�💼 Job: ${application.job?.title || 'N/A'}`);
    console.log(`📄 CV URL: ${application.resumeUrl || 'N/A'}\n`);

    // Check if we have the required data
    if (!application.resumeUrl || !application.job) {
      console.log('❌ Application missing resumeUrl or job data');
      return;
    }

    // Prepare the payload for FastAPI (matching FastAPI field names)
    const payload = {
      application_id: application.id,
      candidateid: application.candidateId,
      jobid: application.jobId,
      cv_link: application.resumeUrl,
      callbackUrl: process.env.GRAPHQL_API_URL || 'http://localhost:4005/api/graphql',
      systemApiKey: process.env.SYSTEM_API_KEY || '',
    };

    console.log('📤 Payload to send to FastAPI:');
    console.log(JSON.stringify(payload, null, 2));
    console.log();

    // Send to FastAPI
    const fastApiUrl = process.env.CV_ANALYSIS_API_URL || 'http://localhost:8000';

    console.log(`🚀 Sending to FastAPI: POST ${fastApiUrl}/cv-analysis`);
    console.log('⏳ Waiting for response...\n');

    const startTime = Date.now();

    try {
      const response = await axios.post(`${fastApiUrl}/cv-analysis`, payload, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ FastAPI Response (${duration}ms):`);
      console.log(`Status: ${response.status}`);
      console.log('Response:', JSON.stringify(response.data, null, 2));

    } catch (error: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`❌ FastAPI Error (${duration}ms):`);
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
      } else if (error.code === 'ECONNREFUSED') {
        console.log('❌ Connection refused - FastAPI service not running');
        console.log('💡 Make sure your FastAPI service is running on port 8000');
      } else {
        console.log('Error:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Error in test script:', error);
  } finally {
    await app.close();
  }
}

// Run the test
testFastApiIntegration().catch(console.error);