// Using built-in fetch (Node 18+)

async function listWhatsAppTemplates() {
  try {
    // Load environment variables
    require('dotenv').config();
    
    const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    const accessToken = process.env.FACEBOOK_SYSTEM_USER_TOKEN; // Use system user token directly
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v18.0';

    console.log('🔍 Listing WhatsApp Templates...');
    console.log('Business Account ID:', businessAccountId);
    console.log('API Version:', apiVersion);
    console.log('Access Token (first 20 chars):', accessToken?.substring(0, 20) + '...');

    const url = `https://graph.facebook.com/${apiVersion}/${businessAccountId}/message_templates`;
    
    const response = await fetch(url, {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', response.status, response.statusText);
      console.error('Error details:', errorText);
      return;
    }

    const result = await response.json();
    
    console.log('\n✅ Available Templates:');
    console.log('Total templates:', result.data?.length || 0);
    
    if (result.data && result.data.length > 0) {
      result.data.forEach((template, index) => {
        console.log(`\n${index + 1}. Template: ${template.name}`);
        console.log(`   Status: ${template.status}`);
        console.log(`   Language: ${template.language}`);
        console.log(`   Category: ${template.category}`);
        
        if (template.components) {
          console.log('   Components:');
          template.components.forEach((comp, i) => {
            console.log(`     ${i + 1}. Type: ${comp.type}`);
            if (comp.text) {
              console.log(`        Text: ${comp.text}`);
            }
            if (comp.parameters) {
              console.log(`        Parameters: ${comp.parameters.length}`);
            }
          });
        }
      });
    } else {
      console.log('No templates found');
    }

  } catch (error) {
    console.error('❌ Error listing templates:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

listWhatsAppTemplates();
