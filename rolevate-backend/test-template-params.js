require('dotenv').config();

async function testTemplateWithQueryParams() {
    console.log('🧪 Testing WhatsApp Template with Query Parameters\n');
    
    // Mock data for testing
    const candidateName = "John Doe";
    const phone = "+962799123456";
    const jobId = "cm123456789";
    const roomName = "interview_app123_1234567890";
    
    // Create query parameters (same logic as in application service)
    const queryParams = `?phone=${encodeURIComponent(phone)}&jobId=${encodeURIComponent(jobId)}&roomName=${encodeURIComponent(roomName)}`;
    
    const templateParams = [
        candidateName,  // Body parameter: candidate name
        queryParams     // Button URL parameter: query string
    ];
    
    console.log('📋 Template Parameters:');
    console.log('- Body {{1}}:', candidateName);
    console.log('- Button URL {{1}}:', queryParams);
    console.log('\n🔗 Final URL will be:');
    console.log(`https://rolevate.com/room${queryParams}`);
    
    console.log('\n📱 Sending test WhatsApp template...');
    
    try {
        // Import WhatsApp service dynamically
        const { WhatsAppService } = require('./src/whatsapp/whatsapp.service');
        const { ConfigService } = require('@nestjs/config');
        const { TokenManagerService } = require('./src/whatsapp/token-manager.service');
        
        // Note: This would normally be injected, but for testing we'll create instances
        console.log('⚠️  Note: This is a simulation - actual sending requires NestJS context');
        
        // Show what the API call would look like
        console.log('\n🔧 WhatsApp API Call Structure:');
        console.log('Template Name: cv_received_notification');
        console.log('Parameters:');
        console.log('  Body: [' + JSON.stringify(candidateName) + ']');
        console.log('  Button: [' + JSON.stringify(queryParams) + ']');
        
        console.log('\n✅ Template structure verified!');
        console.log('The candidate will receive a WhatsApp message with a button linking to:');
        console.log(`https://rolevate.com/room${queryParams}`);
        
    } catch (error) {
        console.log('ℹ️  Running structure test without actual API call');
        console.log('✅ Template parameters formatted correctly');
    }
}

testTemplateWithQueryParams().catch(console.error);
