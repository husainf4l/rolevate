
import 'dotenv/config';

import { WhatsAppService } from './whatsapp.service';
import { TokenManagerService } from './token-manager.service';

// Minimal mock for ConfigService
class MockConfigService {
  get(key: string) {
    return process.env[key];
  }
}

// Minimal mock for TokenManagerService
class MockTokenManagerService {
  async getAccessToken() {
    // Use the system user token for testing
    return process.env.FACEBOOK_SYSTEM_USER_TOKEN;
  }
}

async function main() {
  const configService = new MockConfigService();
  const tokenManager = new MockTokenManagerService();
  const service = new WhatsAppService(configService as any, tokenManager as any);
  // 1. List available templates
  const templates = await service.listTemplates();
  console.log('Available templates:', templates);
  if (!templates.data || templates.data.length === 0) {
    console.error('No templates found.');
    return;
  }
  // 2. Find the cv_received_notification template
  const template = templates.data.find(t => t.name === 'cv_received_notification');
  if (!template) {
    console.error('cv_received_notification template not found.');
    return;
  }
  console.log('Using template:', template.name);
  // DEBUG: Print the full template structure to inspect parameters
  console.dir(template, { depth: 10 });
  // 3. Send a test message to the given number with required parameters
  const to = '962796026659';
  // Parameters: [candidate name, room code]
  const params = ['Alhussein', '962796026659'];
  try {
    const result = await service.sendTemplateMessage(to, template.name, template.language || 'en', params);
    console.log('Message sent:', result);
  } catch (err) {
    console.error('Failed to send message:', err?.response?.data || err);
  }
}

main();
