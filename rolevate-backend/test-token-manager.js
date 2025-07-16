const { TokenManagerService } = require('./src/services/token-manager.service');

async function testTokenManager() {
  try {
    console.log('🔍 Testing TokenManagerService...');
    
    const tokenManager = new TokenManagerService();
    const token = await tokenManager.getAccessToken();
    
    console.log('✅ Got access token:', token?.substring(0, 20) + '...');
    console.log('Token length:', token?.length);
    
  } catch (error) {
    console.error('❌ Error getting token:', error.message);
    console.error('Stack:', error.stack);
  }
}

testTokenManager();
