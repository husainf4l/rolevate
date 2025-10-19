const axios = require('axios');
const fs = require('fs');

// GraphQL endpoint
const GRAPHQL_URL = 'http://localhost:4005/api/graphql';

// Test CV file path
const TEST_CV_PATH = '/Users/husain/Desktop/rolevate/rolevate-backendgql/AlHussein_Resume_2 (1).pdf';
const TEST_FILENAME = 'AlHussein_Resume_2 (1).pdf';
const TEST_MIMETYPE = 'application/pdf';

// Test job ID (you'll need to replace this with an actual job ID from your database)
const TEST_JOB_ID = '3d0e9b53-5e4d-4001-ad4d-52f92e158603'; // From the logs

async function testCVAnalysis() {
  try {
    console.log('🚀 Starting CV Analysis Test...');

    // Load and encode CV file
    console.log('📁 Loading CV file...');
    const cvBuffer = fs.readFileSync(TEST_CV_PATH);
    const TEST_CV_BASE64 = cvBuffer.toString('base64');
    console.log('✅ CV file loaded and encoded to base64');

    // Step 1: Upload CV to S3
    console.log('📤 Step 1: Uploading CV to S3...');

    const uploadQuery = `
      mutation UploadCV($base64File: String!, $filename: String!, $mimetype: String!) {
        uploadCVToS3(
          base64File: $base64File
          filename: $filename
          mimetype: $mimetype
        ) {
          url
          key
          bucket
        }
      }
    `;

    const uploadResponse = await axios.post(GRAPHQL_URL, {
      query: uploadQuery,
      variables: {
        base64File: TEST_CV_BASE64,
        filename: TEST_FILENAME,
        mimetype: TEST_MIMETYPE
      }
    });

    if (uploadResponse.data.errors) {
      console.error('❌ Upload failed:', uploadResponse.data.errors);
      return;
    }

    const resumeUrl = uploadResponse.data.data.uploadCVToS3.url;
    console.log('✅ CV uploaded successfully!');
    console.log('📄 Resume URL:', resumeUrl);

    // Step 2: Create anonymous application
    console.log('📝 Step 2: Creating anonymous application...');

    const applicationQuery = `
      mutation CreateApplication($input: CreateApplicationInput!) {
        createApplication(input: $input) {
          application {
            id
            status
            cvAnalysisScore
            cvAnalysisResults
            analyzedAt
            aiCvRecommendations
            aiInterviewRecommendations
            createdAt
            job {
              id
              title
            }
            candidate {
              id
              name
              email
            }
          }
          candidateCredentials {
            email
            password
            token
          }
          message
        }
      }
    `;

    const applicationResponse = await axios.post(GRAPHQL_URL, {
      query: applicationQuery,
      variables: {
        input: {
          jobId: TEST_JOB_ID,
          resumeUrl: resumeUrl,
          email: `test${Date.now()}@example.com`,
          firstName: 'Test',
          lastName: 'Candidate',
          phone: '+1234567890'
        }
      }
    });

    if (applicationResponse.data.errors) {
      console.error('❌ Application creation failed:', applicationResponse.data.errors);
      return;
    }

    const result = applicationResponse.data.data.createApplication;
    console.log('✅ Application created successfully!');
    console.log('📊 Application ID:', result.application.id);
    console.log('👤 Candidate ID:', result.application.candidateId);
    console.log('📈 CV Analysis Score:', result.application.cvAnalysisScore);
    console.log('📅 Analyzed At:', result.application.analyzedAt);
    console.log('🤖 AI Recommendations:', result.application.aiCvRecommendations ? 'Present' : 'None yet');

    if (result.candidateCredentials) {
      console.log('🔐 New candidate credentials created');
      console.log('📧 Email:', result.candidateCredentials.email);
      console.log('🔑 Password:', result.candidateCredentials.password);
    }

    // Step 3: Wait a bit and check if analysis completed
    console.log('⏳ Waiting 10 seconds for CV analysis to complete...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Step 4: Query the application again to check analysis results
    console.log('🔍 Step 3: Checking final analysis results...');

    const checkQuery = `
      query GetApplication($id: ID!) {
        application(id: $id) {
          id
          cvAnalysisScore
          cvAnalysisResults
          analyzedAt
          aiCvRecommendations
          aiInterviewRecommendations
        }
      }
    `;

    const checkResponse = await axios.post(GRAPHQL_URL, {
      query: checkQuery,
      variables: {
        id: result.application.id
      }
    });

    if (checkResponse.data.errors) {
      console.error('❌ Check failed:', checkResponse.data.errors);
      return;
    }

    const finalApp = checkResponse.data.data.application;
    console.log('📊 Final CV Analysis Score:', finalApp.cvAnalysisScore);
    console.log('📅 Final Analyzed At:', finalApp.analyzedAt);

    if (finalApp.cvAnalysisResults) {
      console.log('📋 Analysis Results Summary:', finalApp.cvAnalysisResults.summary);
      console.log('💪 Strengths:', finalApp.cvAnalysisResults.strengths?.join(', '));
      console.log('⚠️ Weaknesses:', finalApp.cvAnalysisResults.weaknesses?.join(', '));
    }

    if (finalApp.aiCvRecommendations) {
      console.log('🤖 CV Recommendations:', finalApp.aiCvRecommendations.substring(0, 200) + '...');
    }

    console.log('🎉 CV Analysis Test Completed Successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testCVAnalysis();