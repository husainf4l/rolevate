// Decode the JWT token from the logs to verify 2-hour expiration

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsLWh1c3NlaW5AcGFwYXlhdHJhZGluZy5jb20iLCJzdWIiOiJjbWRnaXJtc2MwMDAxajZobW8ydDdxNmlkIiwidXNlclR5cGUiOiJDT01QQU5ZIiwiaWF0IjoxNzU1MTU5NjcwLCJleHAiOjE3NTUxNjY4NzB9.2l1mZyiYelXYt4cNZK3SV1m4gQcwOAlr3UsjymVdx_c';

try {
    // Decode the JWT payload
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    console.log('🔍 Analyzing Token from Logs:\n');

    const issuedAt = new Date(payload.iat * 1000);
    const expiresAt = new Date(payload.exp * 1000);
    const now = new Date();

    const durationSeconds = payload.exp - payload.iat;
    const durationMinutes = Math.floor(durationSeconds / 60);
    const durationHours = Math.floor(durationMinutes / 60);

    const timeLeftSeconds = payload.exp - Math.floor(now.getTime() / 1000);
    const timeLeftMinutes = Math.floor(timeLeftSeconds / 60);
    const timeLeftHours = Math.floor(timeLeftMinutes / 60);

    console.log('📊 Token Details:');
    console.log(`   - Issued at (iat): ${payload.iat} → ${issuedAt.toISOString()}`);
    console.log(`   - Expires at (exp): ${payload.exp} → ${expiresAt.toISOString()}`);
    console.log(`   - Current time: ${Math.floor(now.getTime() / 1000)} → ${now.toISOString()}`);
    console.log('');
    console.log('⏱️  Duration Analysis:');
    console.log(`   - Total duration: ${durationSeconds} seconds`);
    console.log(`   - Total duration: ${durationMinutes} minutes`);
    console.log(`   - Total duration: ${durationHours} hours ${durationMinutes % 60} minutes`);
    console.log('');
    console.log('⏰ Time Remaining:');
    console.log(`   - Time left: ${timeLeftSeconds} seconds`);
    console.log(`   - Time left: ${timeLeftMinutes} minutes`);
    console.log(`   - Time left: ${timeLeftHours}h ${timeLeftMinutes % 60}m`);
    console.log('');

    // Verification
    if (durationHours === 2 && durationMinutes === 120) {
        console.log('✅ CONFIRMED: Token duration is EXACTLY 2 hours (120 minutes)');
    } else if (durationMinutes === 15) {
        console.log('❌ ISSUE: Token is still using old 15-minute duration');
    } else {
        console.log(`⚠️  UNEXPECTED: Token duration is ${durationHours}h ${durationMinutes % 60}m (expected 2h)');
  }
  
  console.log('');
  console.log('🔗 Raw Values:');
  console.log('   - iat:', payload.iat);
  console.log('   - exp:', payload.exp);
  console.log('   - exp - iat =', payload.exp - payload.iat, 'seconds =', (payload.exp - payload.iat)/3600, 'hours');
  
} catch (error) {
  console.error('❌ Error decoding token:', error.message);
}
