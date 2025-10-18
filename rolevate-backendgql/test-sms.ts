import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { JOSMSService } from './src/services/josms.service';

async function testSMS() {
  console.log('🚀 Starting SMS test...\n');

  try {
    // Create NestJS application context
    const app = await NestFactory.createApplicationContext(AppModule);
    
    // Get the JOSMS service
    const josmsService = app.get(JOSMSService);

    // Test phone number
    const phoneNumber = '+962796026659';
    const message = 'Hello from Rolevate! This is a test SMS from your new SMS service. 🎉';

    console.log('📱 Sending SMS to:', phoneNumber);
    console.log('📝 Message:', message);
    console.log('⏳ Please wait...\n');

    // Send SMS
    const result = await josmsService.sendSMS(phoneNumber, message);

    console.log('✅ SMS sent successfully!');
    console.log('📊 Response:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n🎉 SUCCESS! Check your phone for the message.');
      console.log('📋 Message ID:', result.messageId);
      console.log('� Response:', result.response);
      console.log('� Status Code:', result.statusCode);
    } else {
      console.log('\n❌ FAILED!');
      if (result.error) {
        console.log('🐛 Error details:', result.error);
      }
      if (result.statusCode) {
        console.log('📊 Status Code:', result.statusCode);
      }
    }

    // Close the application
    await app.close();

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testSMS()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
