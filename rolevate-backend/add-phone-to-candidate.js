#!/usr/bin/env node

/**
 * Script to add phone number to a candidate for WhatsApp testing
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addPhoneToCandidate() {
  try {
    console.log('🔍 Finding candidates...');
    
    // Get the first candidate
    const candidates = await prisma.candidateProfile.findMany({
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true
      }
    });
    
    if (candidates.length === 0) {
      console.log('❌ No candidates found in database');
      return;
    }
    
    console.log('Found candidates:');
    candidates.forEach((candidate, index) => {
      console.log(`${index + 1}. ${candidate.firstName} ${candidate.lastName} (${candidate.email}) - Phone: ${candidate.phone || 'None'}`);
    });
    
    // Update the first candidate with the phone number
    const candidateToUpdate = candidates[0];
    
    console.log(`\n📱 Adding phone number 962796026659 to ${candidateToUpdate.firstName} ${candidateToUpdate.lastName}...`);
    
    const updatedCandidate = await prisma.candidateProfile.update({
      where: { id: candidateToUpdate.id },
      data: { phone: '962796026659' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true
      }
    });
    
    console.log('✅ Successfully updated candidate:');
    console.log(`   ID: ${updatedCandidate.id}`);
    console.log(`   Name: ${updatedCandidate.firstName} ${updatedCandidate.lastName}`);
    console.log(`   Email: ${updatedCandidate.email}`);
    console.log(`   Phone: ${updatedCandidate.phone}`);
    
    console.log('\n🎉 You can now test WhatsApp messaging with this candidate!');
    console.log(`   Use candidate ID: ${updatedCandidate.id}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addPhoneToCandidate();
