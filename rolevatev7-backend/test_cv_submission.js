const fetch = require('node-fetch');

async function testCVSubmissionWithSMS() {
    const GRAPHQL_URL = 'http://localhost:4005/api/graphql';

    const query = `
        mutation CreateApplication($input: CreateApplicationInput!) {
            createApplication(input: $input) {
                application {
                    id
                    status
                    candidate {
                        id
                        name
                        email
                        phone
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

    const variables = {
        input: {
            jobId: "test-job-id-123", // Mock job ID for testing
            firstName: "Test",
            lastName: "Candidate",
            email: "test@example.com",
            phone: "00962796026659", // The phone number you want to test
            resumeUrl: "https://example.com/test-cv.pdf", // Optional: add a real CV URL if available
            coverLetter: "I am very interested in this position."
        }
    };

    try {
        console.log('📄 Testing CV submission with SMS notification...');
        console.log('📱 Phone number for SMS:', variables.input.phone);

        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables
            })
        });

        const result = await response.json();

        if (response.ok && !result.errors) {
            console.log('✅ CV submission successful!');
            console.log('📧 Email:', result.data.createAnonymousApplication.candidateCredentials.email);
            console.log('🔑 Password:', result.data.createAnonymousApplication.candidateCredentials.password);
            console.log('📱 SMS should have been sent to:', variables.input.phone);
            console.log('📝 Message:', result.data.createAnonymousApplication.message);
        } else {
            console.log('❌ CV submission failed');
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(result, null, 2));
        }
    } catch (error) {
        console.error('❌ Error testing CV submission:', error.message);
    }
}

testCVSubmissionWithSMS();