const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function clearCacheAndTest() {
  try {
    console.log('🧹 Clearing any potential cache issues...');
    
    // Disconnect and reconnect Prisma to clear any connection-level caching
    await prisma.$disconnect();
    
    console.log('✅ Prisma cache cleared');
    
    // Reconnect
    await prisma.$connect();
    
    // Test: Fetch the candidate profile directly
    console.log('🔍 Testing candidate profile fetch...');
    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId: 'cmcvvinsb0000iul6uunqgsd0' },
    });
    
    if (candidateProfile) {
      console.log('✅ Candidate profile found in database:');
      console.log({
        id: candidateProfile.id,
        firstName: candidateProfile.firstName,
        lastName: candidateProfile.lastName,
        email: candidateProfile.email,
        resumeUrl: candidateProfile.resumeUrl,
        userId: candidateProfile.userId
      });
    } else {
      console.log('❌ No candidate profile found in database');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearCacheAndTest();
