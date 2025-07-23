const axios = require('axios');

async function testInterviewEndpoints() {
  const API_BASE = 'http://localhost:4005/api';
  
  try {
    console.log('🎤 Testing Interview Endpoints...\n');

    // Test data
    const testInterview = {
      jobId: 'your-job-id', // Replace with actual job ID
      candidateId: 'your-candidate-id', // Replace with actual candidate ID  
      companyId: 'your-company-id', // Replace with actual company ID
      title: 'Technical Interview - Software Engineer',
      description: 'First round technical interview focusing on JavaScript and React',
      type: 'TECHNICAL',
      status: 'SCHEDULED',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      roomId: 'interview_room_12345',
      videoLink: 'https://meet.example.com/interview-room-12345',
    };

    console.log('1. 📅 Creating new interview...');
    const createResponse = await axios.post(`${API_BASE}/interviews`, testInterview, {
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN', // Replace with actual token
        'Content-Type': 'application/json',
      },
    });
    
    const interviewId = createResponse.data.id;
    console.log('✅ Interview created with ID:', interviewId);
    console.log('Interview Details:', JSON.stringify(createResponse.data, null, 2));

    console.log('\n2. 🔍 Getting interview by ID...');
    const getResponse = await axios.get(`${API_BASE}/interviews/${interviewId}`);
    console.log('✅ Interview retrieved:', getResponse.data.title);

    console.log('\n3. ▶️ Starting interview by room ID...');
    const startResponse = await axios.post(`${API_BASE}/interviews/room/${testInterview.roomId}/start`);
    console.log('✅ Interview started, status:', startResponse.data.status);

    console.log('\n4. 📝 Adding transcripts...');
    const transcripts = [
      {
        speakerType: 'INTERVIEWER',
        speakerName: 'John Smith',
        speakerId: 'interviewer_123',
        content: 'Hello! Welcome to our technical interview. How are you feeling today?',
        confidence: 0.95,
        language: 'en',
        startTime: 0.0,
        endTime: 4.2,
        duration: 4.2,
        sentiment: 'POSITIVE',
        keywords: ['welcome', 'interview', 'technical'],
        importance: 3,
        sequenceNumber: 1,
      },
      {
        speakerType: 'CANDIDATE',
        speakerName: 'Jane Doe',
        speakerId: 'candidate_456',
        content: 'Thank you! I\'m feeling great and excited about this opportunity.',
        confidence: 0.92,
        language: 'en',
        startTime: 4.5,
        endTime: 8.1,
        duration: 3.6,
        sentiment: 'POSITIVE',
        keywords: ['excited', 'opportunity', 'great'],
        importance: 2,
        sequenceNumber: 2,
      },
      {
        speakerType: 'INTERVIEWER',
        speakerName: 'John Smith',
        speakerId: 'interviewer_123',
        content: 'Excellent! Let\'s start with a technical question. Can you explain the difference between var, let, and const in JavaScript?',
        confidence: 0.98,
        language: 'en',
        startTime: 8.5,
        endTime: 15.2,
        duration: 6.7,
        sentiment: 'NEUTRAL',
        keywords: ['technical', 'javascript', 'var', 'let', 'const'],
        importance: 5,
        sequenceNumber: 3,
      },
    ];

    const bulkTranscriptResponse = await axios.post(`${API_BASE}/interviews/transcripts/bulk`, {
      interviewId: interviewId,
      transcripts: transcripts,
    });
    
    console.log('✅ Bulk transcripts created:', bulkTranscriptResponse.data.length);

    console.log('\n5. 📋 Getting all transcripts for interview...');
    const transcriptsResponse = await axios.get(`${API_BASE}/interviews/${interviewId}/transcripts`);
    console.log('✅ Retrieved transcripts:', transcriptsResponse.data.length);
    console.log('First transcript:', transcriptsResponse.data[0]?.content.substring(0, 50) + '...');

    console.log('\n6. ⏹️ Ending interview...');
    const endResponse = await axios.post(`${API_BASE}/interviews/room/${testInterview.roomId}/end`, {
      recordingUrl: 'https://recordings.example.com/interview_12345.mp4',
      duration: 30, // 30 minutes
    });
    console.log('✅ Interview ended, status:', endResponse.data.status);
    console.log('Recording URL:', endResponse.data.recordingUrl);

    console.log('\n7. 📊 Getting final interview details...');
    const finalResponse = await axios.get(`${API_BASE}/interviews/${interviewId}`);
    console.log('✅ Final interview details:');
    console.log('- Status:', finalResponse.data.status);
    console.log('- Duration:', finalResponse.data.duration, 'minutes');
    console.log('- Transcript count:', finalResponse.data.transcripts?.length || 0);
    console.log('- Started at:', finalResponse.data.startedAt);
    console.log('- Ended at:', finalResponse.data.endedAt);

    console.log('\n🎉 All interview endpoints tested successfully!');

  } catch (error) {
    console.error('❌ Error testing interview endpoints:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

// Alternative simple test without authentication
async function testSimpleEndpoints() {
  const API_BASE = 'http://localhost:4005/api';
  
  try {
    console.log('🔍 Testing simple interview endpoints...\n');

    // Test getting interviews by job (no auth required)
    console.log('1. 📋 Testing get interviews by job...');
    try {
      const jobInterviewsResponse = await axios.get(`${API_BASE}/interviews/job/test-job-id`);
      console.log('✅ Interviews for job retrieved:', jobInterviewsResponse.data.totalCount);
    } catch (error) {
      console.log('ℹ️ No interviews found for test job (expected)');
    }

    // Test getting interviews by candidate
    console.log('\n2. 👤 Testing get interviews by candidate...');
    try {
      const candidateInterviewsResponse = await axios.get(`${API_BASE}/interviews/candidate/test-candidate-id`);
      console.log('✅ Interviews for candidate retrieved:', candidateInterviewsResponse.data.totalCount);
    } catch (error) {
      console.log('ℹ️ No interviews found for test candidate (expected)');
    }

    console.log('\n✅ Simple endpoint tests completed!');

  } catch (error) {
    console.error('❌ Error in simple tests:', error.message);
  }
}

console.log('Choose test type:');
console.log('1. Full test (requires authentication) - Run: node test-interview-endpoints.js full');
console.log('2. Simple test (no auth) - Run: node test-interview-endpoints.js simple');

const testType = process.argv[2];

if (testType === 'full') {
  testInterviewEndpoints();
} else if (testType === 'simple') {
  testSimpleEndpoints();
} else {
  console.log('Please specify test type: full or simple');
}
