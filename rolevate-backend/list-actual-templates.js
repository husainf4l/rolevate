require('dotenv').config();
const axios = require('axios');

async function listWhatsAppTemplates() {
  try {
    const accessToken = process.env.FACEBOOK_SYSTEM_USER_TOKEN;
    const whatsappBusinessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    
    if (!accessToken || !whatsappBusinessAccountId) {
      console.error('Missing required environment variables:');
      console.error('FACEBOOK_SYSTEM_USER_TOKEN:', !!accessToken);
      console.error('WHATSAPP_BUSINESS_ACCOUNT_ID:', !!whatsappBusinessAccountId);
      return;
    }
    
    console.log('Using Business Account ID:', whatsappBusinessAccountId);
    
    // List templates using WhatsApp Business API
    const url = `https://graph.facebook.com/v21.0/${whatsappBusinessAccountId}/message_templates`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        limit: 50 // Get up to 50 templates
      }
    });
    
    console.log('Response status:', response.status);
    console.log('\n=== WHATSAPP BUSINESS API TEMPLATES ===');
    
    if (response.data && response.data.data) {
      console.log(`Found ${response.data.data.length} templates:\n`);
      
      response.data.data.forEach((template, index) => {
        console.log(`${index + 1}. Template Name: ${template.name}`);
        console.log(`   Status: ${template.status}`);
        console.log(`   Language: ${template.language}`);
        console.log(`   Category: ${template.category}`);
        
        if (template.components) {
          console.log(`   Components:`);
          template.components.forEach((comp, i) => {
            console.log(`     ${i + 1}. Type: ${comp.type}`);
            if (comp.parameters) {
              console.log(`        Parameters: ${comp.parameters.length}`);
            }
            if (comp.text) {
              console.log(`        Text: ${comp.text.substring(0, 100)}...`);
            }
          });
        }
        console.log('---');
      });
    } else {
      console.log('No templates found or unexpected response structure');
      console.log('Response data:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('Error listing templates:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

listWhatsAppTemplates();
