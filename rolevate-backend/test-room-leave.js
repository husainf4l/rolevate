// Test the room leave endpoint
async function testRoomLeaveEndpoint() {
    console.log('🧪 Testing Room Leave Endpoint\n');
    
    const testData = {
        candidateId: "cmd9e96o0000i3sg9g4kvykeh",
        roomName: "interview_cmd9f0t2r00113snsg7yacfhb_1752879208091"
    };
    
    console.log('Request Data:', JSON.stringify(testData, null, 2));
    
    try {
        const response = await fetch('http://localhost:4005/api/room/leave', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        console.log('Response Status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Success Response:', JSON.stringify(result, null, 2));
        } else {
            const errorText = await response.text();
            console.log('❌ Error Response:', errorText);
        }
        
    } catch (error) {
        console.error('❌ Network Error:', error.message);
    }
}

testRoomLeaveEndpoint().catch(console.error);
