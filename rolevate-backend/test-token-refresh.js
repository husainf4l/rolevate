// Test token refresh and check expiration
async function testTokenRefresh() {
    console.log('🧪 Testing Token Refresh\n');
    
    // Your current room details
    const refreshData = {
        roomName: "interview_cmd9hrag1001c3ssw6k20uuh1_1752883802865",
        candidateId: "cmd9hraf5001a3sswnvm2ey88"
    };
    
    console.log('Request Data:', JSON.stringify(refreshData, null, 2));
    
    // First, let's decode your current token to see when it expires
    const currentToken = "eyJhbGciOiJIUzI1NiJ9.eyJ2aWRlbyI6eyJyb29tIjoiaW50ZXJ2aWV3X2NtZDlocmFnMTAwMWMzc3N3NmsyMHV1aDFfMTc1Mjg4MzgwMjg2NSIsInJvb21Kb2luIjp0cnVlfSwiaXNzIjoiQVBJWUJkOFlINTNmYVdYIiwiZXhwIjoxNzUyODg3NTc2LCJuYmYiOjAsInN1YiI6ImQgZCJ9.-3mmD5DYU0w7Wa-W3VYUrvQbj42mCcutzp9K40qzFCE";
    
    // Decode the JWT payload (base64)
    const payloadPart = currentToken.split('.')[1];
    const decodedPayload = JSON.parse(atob(payloadPart));
    
    console.log('🔍 Current Token Info:');
    console.log('- Issued by:', decodedPayload.iss);
    console.log('- Expires at (timestamp):', decodedPayload.exp);
    console.log('- Expires at (human):', new Date(decodedPayload.exp * 1000).toISOString());
    console.log('- Current time:', new Date().toISOString());
    
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = decodedPayload.exp - now;
    console.log('- Time left:', timeLeft > 0 ? `${Math.floor(timeLeft / 60)} minutes` : 'EXPIRED');
    
    if (timeLeft <= 0) {
        console.log('❌ Token has EXPIRED - that explains the disconnect!');
    } else {
        console.log('✅ Token is still valid');
    }
    
    console.log('\n🔄 Refreshing token...');
    
    try {
        const response = await fetch('http://localhost:4005/api/room/refresh-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(refreshData)
        });
        
        console.log('Response Status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Token Refreshed Successfully!');
            console.log('- New Token (first 50 chars):', result.token.substring(0, 50) + '...');
            console.log('- Expires At:', result.expiresAt);
            console.log('- Duration:', result.durationSeconds, 'seconds (', Math.floor(result.durationSeconds / 3600), 'hours)');
            console.log('- Message:', result.message);
            
            // Decode the new token to verify
            const newPayloadPart = result.token.split('.')[1];
            const newDecodedPayload = JSON.parse(atob(newPayloadPart));
            const newTimeLeft = newDecodedPayload.exp - Math.floor(Date.now() / 1000);
            console.log('- New token valid for:', Math.floor(newTimeLeft / 3600), 'hours', Math.floor((newTimeLeft % 3600) / 60), 'minutes');
            
        } else {
            const errorText = await response.text();
            console.log('❌ Error Response:', errorText);
        }
        
    } catch (error) {
        console.error('❌ Network Error:', error.message);
    }
}

// Helper function for base64 decoding (Node.js compatible)
function atob(str) {
    return Buffer.from(str, 'base64').toString('binary');
}

testTokenRefresh().catch(console.error);
