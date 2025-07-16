#!/usr/bin/env node

/**
 * Check available WhatsApp templates
 */

const { WhatsAppService } = require('./src/whatsapp/whatsapp.service');
const { TokenManagerService } = require('./src/whatsapp/token-manager.service');
const { ConfigService } = require('@nestjs/config');

// Mock ConfigService
class MockConfigService {
  get(key) {
    return process.env[key];
  }
}

async function checkTemplates() {
  console.log('🔍 Checking available WhatsApp templates...\n');
  
  try {
    const configService = new MockConfigService();
    const tokenManager = new TokenManagerService(configService);
    const whatsappService = new WhatsAppService(configService, tokenManager);
    
    const templates = await whatsappService.listTemplates();
    
    console.log('✅ Available templates:');
    if (templates.data && templates.data.length > 0) {
      templates.data.forEach((template, index) => {
        console.log(`${index + 1}. Name: ${template.name}`);
        console.log(`   Status: ${template.status}`);
        console.log(`   Language: ${template.language}`);
        console.log(`   Category: ${template.category}`);
        if (template.components) {
          console.log(`   Components: ${template.components.length} components`);
          template.components.forEach((comp, i) => {
            console.log(`     - ${comp.type}: ${comp.text || comp.format || 'N/A'}`);
          });
        }
        console.log('');
      });
    } else {
      console.log('❌ No templates found');
    }
    
  } catch (error) {
    console.error('❌ Error fetching templates:', error.message);
  }
}

checkTemplates();
