require('dotenv').config();

async function testWhatsAppTemplateWithQueryParams() {
    console.log('🧪 Testing WhatsApp Template with Query Parameters\n');
    
    // Test data
    const candidateName = "Test Candidate";
    const phone = "+962796026659"; // Updated to your test phone number
    const jobId = "test_job_123";
    const roomName = "interview_123_456";
    
    // Create query parameters as in the application service
    const cleanPhone = phone.replace(/[\+\s\-\(\)]/g, ''); // Clean phone number
    const queryParams = `?phone=${cleanPhone}&jobId=${encodeURIComponent(jobId)}&roomName=${encodeURIComponent(roomName)}`;
    
    console.log('📋 Template Parameters:');
    console.log('- candidateName:', candidateName);
    console.log('- originalPhone:', phone);
    console.log('- cleanPhone:', cleanPhone);
    console.log('- queryParams:', queryParams);
    console.log('- Final URL: https://rolevate.com/room' + queryParams);
    
    try {
        // Make direct API call to test template
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const accessToken = process.env.FACEBOOK_SYSTEM_USER_TOKEN;
        const apiVersion = 'v18.0';
        
        const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
        
        const payload = {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'template',
            template: {
                name: 'cv_received_notification',
                language: { code: 'en' },
                components: [
                    {
                        type: 'body',
                        parameters: [
                            { type: 'text', text: candidateName }
                        ]
                    },
                    {
                        type: 'button',
                        sub_type: 'url',
                        index: 0,
                        parameters: [
                            { type: 'text', text: queryParams }
                        ]
                    }
                ]
            }
        };
        
        console.log('\n📱 Sending WhatsApp template with query parameters...');
        console.log('Payload:', JSON.stringify(payload, null, 2));
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ WhatsApp template sent successfully!');
            console.log('Message ID:', result.messages[0].id);
            console.log('\n🔗 The candidate will receive a button with URL:');
            console.log(`https://rolevate.com/room${queryParams}`);
        } else {
            console.log('❌ Failed to send WhatsApp template:');
            console.log(JSON.stringify(result, null, 2));
        }
        
    } catch (error) {
        console.error('❌ Error testing WhatsApp template:', error.message);
    }
}

testWhatsAppTemplateWithQueryParams().catch(console.error);
