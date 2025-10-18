import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ApplicationService } from './src/application/application.service';

async function testAnonymousApplicationWithSMS() {
  console.log('🚀 Testing Anonymous Application with SMS Credentials...\n');

  try {
    // Create NestJS application context
    const app = await NestFactory.createApplicationContext(AppModule);
    
    // Get the Application service
    const applicationService = app.get(ApplicationService);

    // Test data
    const testJobId = '02a0e4f8-f1f2-47d5-a0a0-0924504af0cd'; // Replace with actual job ID
    const testPhone = '+962796026659'; // Your phone number
    const testEmail = `test_${Date.now()}@example.com`; // Unique email for testing
    
    console.log('📋 Test Parameters:');
    console.log('   Job ID:', testJobId);
    console.log('   Phone:', testPhone);
    console.log('   Email:', testEmail);
    console.log('   First Name: Test');
    console.log('   Last Name: User\n');

    console.log('⏳ Creating anonymous application...\n');

    // Create anonymous application
    const result = await applicationService.createAnonymousApplication({
      jobId: testJobId,
      resumeUrl: 'https://rolevate-bucket.s3.amazonaws.com/test-resume.pdf',
      email: testEmail,
      firstName: 'Test',
      lastName: 'User',
      phone: testPhone,
      coverLetter: 'This is a test application to verify SMS credentials are sent correctly.',
    });

    console.log('✅ Application created successfully!\n');
    console.log('📊 Results:');
    console.log('───────────────────────────────────────');
    console.log('Application ID:', result.application.id);
    console.log('Candidate ID:', result.application.candidateId);
    console.log('Status:', result.application.status);
    console.log('Applied At:', result.application.appliedAt);
    console.log('\n📱 Credentials:');
    
    if (result.candidateCredentials) {
      console.log('───────────────────────────────────────');
      console.log('✅ NEW ACCOUNT CREATED!');
      console.log('📧 Email:', result.candidateCredentials.email);
      console.log('🔑 Password:', result.candidateCredentials.password);
      console.log('🎫 Token:', result.candidateCredentials.token.substring(0, 50) + '...');
      console.log('\n📱 SMS Status:');
      console.log('   An SMS with login credentials should be sent to:', testPhone);
      console.log('   Message content:');
      console.log('   ┌──────────────────────────────────────┐');
      console.log('   │ Welcome to Rolevate!                 │');
      console.log('   │                                      │');
      console.log('   │ Track your application: rolevate.com │');
      console.log('   │                                      │');
      console.log('   │ Email:', result.candidateCredentials.email.padEnd(28), '│');
      console.log('   │ Password:', result.candidateCredentials.password.padEnd(25), '│');
      console.log('   └──────────────────────────────────────┘');
      console.log('\n🎉 SUCCESS! Check your phone for the SMS message!');
    } else {
      console.log('───────────────────────────────────────');
      console.log('ℹ️  Existing account used (no SMS sent)');
    }

    console.log('\n💬 Message:', result.message);
    console.log('───────────────────────────────────────');

    // Close the application
    await app.close();

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error('   Error:', error.message);
    if (error.response) {
      console.error('   Details:', JSON.stringify(error.response, null, 2));
    }
    console.error('\n📚 Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testAnonymousApplicationWithSMS()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    console.log('📱 Check your phone (+962796026659) for the SMS!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
