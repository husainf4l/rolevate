require('dotenv').config();

async function testWhatsAppTemplateIntegration() {
    console.log('🧪 Testing WhatsApp Template Integration\n');
    
    const API_BASE = 'http://localhost:4005';
    
    // First login to get access token
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'al-hussein@papayatrading.com',
            password: 'tt55oo77'
        })
    });
    
    if (!loginResponse.ok) {
        console.error('❌ Login failed:', loginResponse.status);
        return;
    }
    
    // Extract token from cookies
    const cookies = loginResponse.headers.get('set-cookie');
    const tokenMatch = cookies?.match(/access_token=([^;]+)/);
    const accessToken = tokenMatch?.[1];
    
    if (!accessToken) {
        console.error('❌ No access token found');
        return;
    }
    
    console.log('✅ Login successful\n');
    
    // Test sending template message
    console.log('2. Testing WhatsApp template message...');
    
    const templateResponse = await fetch(`${API_BASE}/api/communications/send-whatsapp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            candidateId: 'cmczzbfyz0004iut4igd2mkv4', // Replace with actual candidate ID
            content: 'Interview invitation sent to candidate for Software Developer',
            templateName: 'cv_received_notification',
            templateParams: [
                'John Doe',           // {{1}} in body: candidate name
                'room_interview_123'  // {{1}} in button URL: room ID
            ]
        })
    });
    
    if (templateResponse.ok) {
        const result = await templateResponse.json();
        console.log('✅ Template message sent successfully:');
        console.log('📋 Template: cv_received_notification');
        console.log('📝 Parameters:');
        console.log('   - Candidate Name: John Doe');
        console.log('   - Room ID: room_interview_123');
        console.log('🔗 Button URL will be: https://rolevate.com/roomroom_interview_123');
        console.log('📱 WhatsApp Result:', JSON.stringify(result.whatsappResult, null, 2));
    } else {
        const error = await templateResponse.text();
        console.error('❌ Template message failed:', templateResponse.status, error);
    }
    
    console.log('\n📋 Expected Template Structure:');
    console.log('════════════════════════════════════════');
    console.log('Header: Virtual Interview Invitation');
    console.log('Body: Dear John Doe,');
    console.log('      Thank you for submitting your CV...');
    console.log('Button: [Interview] → https://rolevate.com/roomroom_interview_123');
    console.log('Footer: Rolevate AI Team');
}

testWhatsAppTemplateIntegration().catch(console.error);
