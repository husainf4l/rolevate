// Test the room status endpoint
async function testRoomStatusEndpoint() {
    console.log('🧪 Testing Room Status Endpoint\n');
    
    const testData = {
        roomName: "interview_cmd9hrag1001c3ssw6k20uuh1_1752883802865"
    };
    
    console.log('Request Data:', JSON.stringify(testData, null, 2));
    
    try {
        const response = await fetch('http://localhost:4005/api/room/status', {
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
            
            if (result.room) {
                console.log('\n📊 Room Summary:');
                console.log(`- Room Name: ${result.room.name}`);
                console.log(`- Duration: ${result.room.durationMinutes} minutes`);
                console.log(`- Status: ${result.room.status}`);
                console.log(`- Created At: ${result.room.createdAt}`);
                
                if (result.application) {
                    console.log('\n👤 Participant:');
                    console.log(`- Name: ${result.application.candidate.firstName} ${result.application.candidate.lastName}`);
                    console.log(`- Email: ${result.application.candidate.email}`);
                    console.log(`- Job: ${result.application.job.title} at ${result.application.job.company}`);
                    console.log(`- Application Status: ${result.application.status}`);
                }
            }
        } else {
            const errorText = await response.text();
            console.log('❌ Error Response:', errorText);
        }
        
    } catch (error) {
        console.error('❌ Network Error:', error.message);
    }
}

testRoomStatusEndpoint().catch(console.error);
