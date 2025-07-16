/**
 * Quick script to find candidate IDs for testing
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findCandidatesForTesting() {
  try {
    console.log('🔍 Finding candidates in Papaya Trading database...\n');
    
    // Get some candidates
    const candidates = await prisma.candidateProfile.findMany({
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (candidates.length === 0) {
      console.log('❌ No candidates found in the database.');
      console.log('You might need to create some test candidates first.');
      return;
    }
    
    console.log('✅ Found candidates:');
    candidates.forEach((candidate, index) => {
      console.log(`\n${index + 1}. Candidate ID: ${candidate.id}`);
      console.log(`   Name: ${candidate.firstName} ${candidate.lastName}`);
      console.log(`   Email: ${candidate.email}`);
      console.log(`   Phone: ${candidate.phone || 'No phone number'}`);
    });
    
    console.log('\n📋 You can use any of these candidate IDs for testing the WhatsApp communication.');
    
    // Check if any have phone numbers for WhatsApp
    const candidatesWithPhone = candidates.filter(c => c.phone);
    if (candidatesWithPhone.length > 0) {
      console.log(`\n📱 Candidates with phone numbers (good for WhatsApp testing):`);
      candidatesWithPhone.forEach(candidate => {
        console.log(`   - ${candidate.firstName} ${candidate.lastName} (${candidate.id}): ${candidate.phone}`);
      });
    } else {
      console.log('\n⚠️  No candidates have phone numbers. WhatsApp sending will fail without phone numbers.');
    }
    
  } catch (error) {
    console.error('❌ Error querying database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findCandidatesForTesting();
