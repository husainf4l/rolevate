// Test the room join endpoint
async function testRoomJoinEndpoint() {
    console.log('🧪 Testing Room Join Endpoint\n');
    
    const testData = {
        phone: "962796026659",
        jobId: "cmczxqxwj0007iu9r7drwmmd1", 
        roomName: "interview_cmd9f0t2r00113snsg7yacfhb_1752879208091"
    };
    
    console.log('Request Data:', JSON.stringify(testData, null, 2));
    
    try {
        const response = await fetch('http://localhost:4005/api/room/join', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        console.log('Response Status:', response.status);
        console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
        
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

testRoomJoinEndpoint().catch(console.error);
