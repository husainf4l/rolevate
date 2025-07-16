#!/usr/bin/env node

/**
 * Quick script to find candidates and update one with phone number for testing
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateCandidateWithPhone() {
  try {
    console.log('🔍 Finding candidates...');
    
    // Find all candidates
    const candidates = await prisma.candidateProfile.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true
      },
      take: 5 // Get first 5 candidates
    });

    if (candidates.length === 0) {
      console.log('❌ No candidates found in database');
      return;
    }

    console.log(`📋 Found ${candidates.length} candidates:`);
    candidates.forEach((candidate, index) => {
      console.log(`  ${index + 1}. ${candidate.id} - ${candidate.firstName} ${candidate.lastName} - ${candidate.email} - Phone: ${candidate.phone || 'None'}`);
    });

    // Update the first candidate with phone number
    const candidateToUpdate = candidates[0];
    const phoneNumber = '962796026659';
    
    console.log(`\n📱 Updating candidate "${candidateToUpdate.firstName} ${candidateToUpdate.lastName}" with phone number...`);
    
    const updatedCandidate = await prisma.candidateProfile.update({
      where: { id: candidateToUpdate.id },
      data: { phone: phoneNumber },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true
      }
    });

    console.log('✅ Successfully updated candidate:');
    console.log({
      id: updatedCandidate.id,
      name: `${updatedCandidate.firstName} ${updatedCandidate.lastName}`,
      email: updatedCandidate.email,
      phone: updatedCandidate.phone
    });

    console.log(`\n🎯 Use this candidate ID for testing: ${updatedCandidate.id}`);
    console.log(`📱 Phone number: ${updatedCandidate.phone}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCandidateWithPhone();
