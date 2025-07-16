#!/usr/bin/env node

/**
 * Script to add phone number to a candidate for testing
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateCandidateWithPhone() {
  try {
    console.log('🔍 Looking for candidates...');
    
    // Find the first candidate
    const candidate = await prisma.candidateProfile.findFirst({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true
      }
    });

    if (!candidate) {
      console.log('❌ No candidates found in database');
      return;
    }

    console.log('📋 Found candidate:', {
      id: candidate.id,
      name: `${candidate.firstName} ${candidate.lastName}`,
      email: candidate.email,
      currentPhone: candidate.phone
    });

    // Update with the phone number
    const phoneNumber = '962796026659';
    
    const updatedCandidate = await prisma.candidateProfile.update({
      where: { id: candidate.id },
      data: { phone: phoneNumber },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true
      }
    });

    console.log('✅ Successfully updated candidate with phone number:');
    console.log({
      id: updatedCandidate.id,
      name: `${updatedCandidate.firstName} ${updatedCandidate.lastName}`,
      email: updatedCandidate.email,
      phone: updatedCandidate.phone
    });

    console.log('\n🎯 Use this candidate ID for testing:', updatedCandidate.id);

  } catch (error) {
    console.error('❌ Error updating candidate:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCandidateWithPhone();
