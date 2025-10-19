/**
 * Test updateApplicationAnalysis with Real Application
 * Tests the complete flow with actual application data
 */

import axios from 'axios';

const realApplicationData = {
  application_id: "4e31ad4c-7e5e-4e6f-a028-244170a7892c",
  candidateid: "ea55df49-a950-459d-b7cd-f64a7ffd397f",
  jobid: "3d0e9b53-5e4d-4001-ad4d-52f92e158603",
  cv_link: "https://4wk-garage-media.s3.me-central-1.amazonaws.com/cvs/anonymous/1e604193-8a7d-454d-89af-6a7bf115cb60-AlHussein_Resume_21.pdf",
  callbackUrl: "http://localhost:4005/api/graphql",
  systemApiKey: "31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e"
};

const mutation = `
  mutation UpdateApplicationAnalysis($input: UpdateApplicationAnalysisInput!) {
    updateApplicationAnalysis(input: $input) {
      id
      cvAnalysisScore
      analyzedAt
      candidate {
        id
        email
        name
        candidateProfile {
          firstName
          lastName
          phone
          location
          bio
          skills
        }
      }
    }
  }
`;

async function testRealApplication() {
  console.log('🧪 Testing updateApplicationAnalysis with real application data...');
  console.log('📋 Application ID:', realApplicationData.application_id);
  console.log('👤 Candidate ID:', realApplicationData.candidateid);
  console.log('💼 Job ID:', realApplicationData.jobid);
  console.log('');
  
  // Simulate what FastAPI would send after analyzing the CV
  const candidateInfo = {
    firstName: "Al-Hussein Q.",
    lastName: "Abdullah",
    name: "Al-Hussein Q. Abdullah",
    email: "al-hussein@papayatrading.com",
    phone: "+962796026659",
    location: "Amman/Jordan",
    bio: "Results-driven entrepreneur and technology leader with expertise in strategic thinking, business development, and operations management.",
    skills: [
      "Strategic thinking",
      "Business development",
      "Operations management",
      "Financial analysis",
      "Leadership",
      "Problem solving",
      "Communication",
      "Team management"
    ],
    experience: "Founder & CEO of Papaya Trading (2021-Present), Co-Founder of 4WK (2024-Present), Managing Partner at Garage (2023-Present)",
    education: "BBA in Business Administration from German Jordanian University (2017-2021)"
  };

  try {
    console.log('📤 Sending CV analysis results to NestJS GraphQL...');
    const response = await axios.post(
      realApplicationData.callbackUrl,
      {
        query: mutation,
        variables: {
          input: {
            applicationId: realApplicationData.application_id,
            cvAnalysisScore: 87,
            cvAnalysisResults: JSON.stringify({
              match_score: 87,
              skills_matched: ["Strategic thinking", "Business development", "Leadership"],
              experience_level: "Senior",
              education_match: "High"
            }),
            aiCvRecommendations: "Strong candidate with excellent entrepreneurial background and leadership experience. Shows strategic thinking and business development capabilities.",
            aiInterviewRecommendations: "Focus on: 1) Leadership style and team management approach, 2) How they handle scaling operations, 3) Experience with financial planning and analysis",
            candidateInfo: candidateInfo
          }
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': realApplicationData.systemApiKey
        },
        timeout: 10000
      }
    );

    if (response.data.errors) {
      console.error('❌ GraphQL errors:', JSON.stringify(response.data.errors, null, 2));
      return;
    }

    console.log('✅ SUCCESS! Application updated successfully');
    console.log('');
    console.log('📊 Updated Application:');
    console.log('  - ID:', response.data.data.updateApplicationAnalysis.id);
    console.log('  - CV Analysis Score:', response.data.data.updateApplicationAnalysis.cvAnalysisScore);
    console.log('  - Analyzed At:', response.data.data.updateApplicationAnalysis.analyzedAt);
    console.log('');
    console.log('👤 Updated Candidate:');
    const candidate = response.data.data.updateApplicationAnalysis.candidate;
    console.log('  - ID:', candidate.id);
    console.log('  - Email:', candidate.email);
    console.log('  - Name:', candidate.name);
    console.log('');
    console.log('👤 Candidate Profile:');
    const profile = candidate.candidateProfile;
    console.log('  - First Name:', profile.firstName);
    console.log('  - Last Name:', profile.lastName);
    console.log('  - Phone:', profile.phone);
    console.log('  - Location:', profile.location);
    console.log('  - Bio:', profile.bio?.substring(0, 80) + '...');
    console.log('  - Skills:', profile.skills.join(', '));
    console.log('');
    console.log('🎉 The placeholder candidate has been updated with real CV data!');
    
  } catch (error: any) {
    if (error.response) {
      console.error('❌ HTTP Error:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused - is the NestJS server running on port 4005?');
      console.error('Start it with: npm run start:dev');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testRealApplication();
