const fetch = require('node-fetch');

async function testSMSMessage() {
    const GRAPHQL_URL = 'http://localhost:4005/api/graphql';

    const query = `
        mutation CreateCommunication($input: CreateCommunicationInput!) {
            createCommunication(input: $input) {
                id
                type
                direction
                content
                phoneNumber
                status
                sentAt
                createdAt
            }
        }
    `;

    const variables = {
        input: {
            type: "SMS",
            direction: "OUTBOUND",
            content: "Hello! This is a test SMS from RoleVate SMS integration. Testing JOSMS gateway functionality.",
            phoneNumber: "00962796026659"
        }
    };

    try {
        console.log('Sending test SMS to 00962796026659 via Communication resolver...');

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
            console.log('✅ SMS sent successfully via Communication resolver!');
            console.log('Response:', JSON.stringify(result.data, null, 2));
        } else {
            console.log('❌ Failed to send SMS via Communication resolver');
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(result, null, 2));
        }
    } catch (error) {
        console.error('❌ Error testing SMS via Communication resolver:', error.message);
    }
}

async function testSMSBalance() {
    const GRAPHQL_URL = 'http://localhost:4005/api/graphql';
    const SYSTEM_API_KEY = '31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e';

    const query = `
        query GetSMSBalance {
            getSMSBalance {
                success
                balance
                currency
                error
            }
        }
    `;

    try {
        console.log('Checking SMS account balance...');

        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': SYSTEM_API_KEY,
            },
            body: JSON.stringify({
                query
            })
        });

        const result = await response.json();

        if (response.ok && !result.errors) {
            console.log('✅ SMS balance retrieved successfully!');
            console.log('Response:', JSON.stringify(result.data, null, 2));
        } else {
            console.log('❌ Failed to get SMS balance');
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(result, null, 2));
        }
    } catch (error) {
        console.error('❌ Error checking SMS balance:', error.message);
    }
}

async function testSMSCostEstimation() {
    const GRAPHQL_URL = 'http://localhost:4005/api/graphql';
    const SYSTEM_API_KEY = '31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e';

    const query = `
        query EstimateSMSCost($message: String!, $recipientCount: Float) {
            estimateSMSCost(message: $message, recipientCount: $recipientCount) {
                parts
                totalMessages
                estimatedCost
                currency
            }
        }
    `;

    const variables = {
        message: "Hello! This is a test SMS from RoleVate SMS integration. Testing JOSMS gateway functionality.",
        recipientCount: 1.0
    };

    try {
        console.log('Estimating SMS cost...');

        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': SYSTEM_API_KEY,
            },
            body: JSON.stringify({
                query,
                variables
            })
        });

        const result = await response.json();

        if (response.ok && !result.errors) {
            console.log('✅ SMS cost estimation retrieved successfully!');
            console.log('Response:', JSON.stringify(result.data, null, 2));
        } else {
            console.log('❌ Failed to estimate SMS cost');
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(result, null, 2));
        }
    } catch (error) {
        console.error('❌ Error estimating SMS cost:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting SMS functionality tests...\n');

    console.log('Note: Balance and cost estimation tests require database migrations to be run first.');
    console.log('Skipping those tests and focusing on SMS sending via Communication resolver.\n');

    await testSMSMessage();
    console.log('\n' + '='.repeat(50) + '\n');

    console.log('✅ SMS test completed!');
}

runAllTests();