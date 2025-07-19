require('dotenv').config();

async function getTemplateDetails() {
    const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    const apiVersion = 'v18.0';
    const accessToken = process.env.FACEBOOK_SYSTEM_USER_TOKEN;
    
    console.log('🔍 Getting detailed template structure...\n');
    
    const url = `https://graph.facebook.com/${apiVersion}/${businessAccountId}/message_templates`;
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Find the cv_received_notification template
    const template = data.data.find(t => t.name === 'cv_received_notification');
    
    if (template) {
        console.log('📋 Template: cv_received_notification');
        console.log('==================================================');
        console.log('Full template structure:');
        console.log(JSON.stringify(template, null, 2));
        
        console.log('\n🔘 Button Component Details:');
        const buttonComponent = template.components.find(c => c.type === 'BUTTONS');
        if (buttonComponent) {
            console.log(JSON.stringify(buttonComponent, null, 2));
            
            console.log('\n📝 Usage for LiveKit Integration:');
            console.log('Template Name: cv_received_notification');
            console.log('Language: en');
            console.log('Parameters needed:');
            console.log('- Body parameter 1: Candidate name');
            console.log('- Button URL parameter: Room ID (dynamic part)');
        }
    } else {
        console.log('❌ Template cv_received_notification not found');
    }
}

getTemplateDetails().catch(console.error);
