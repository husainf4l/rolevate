const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateCandidateCV() {
  try {
    console.log('🔄 Updating candidate CV URL...');
    
    const updatedProfile = await prisma.candidateProfile.update({
      where: { userId: 'cmcvvinsb0000iul6uunqgsd0' },
      data: { 
        resumeUrl: 'https://example.com/cv/al-hussein-cv.pdf',
        firstName: 'Al-hussein',
        lastName: 'Abdullah',
        email: 'husain.f4l@gmail.com'
      }
    });
    
    console.log('✅ Candidate profile updated:');
    console.log({
      id: updatedProfile.id,
      firstName: updatedProfile.firstName,
      lastName: updatedProfile.lastName,
      email: updatedProfile.email,
      resumeUrl: updatedProfile.resumeUrl,
      userId: updatedProfile.userId
    });
    
  } catch (error) {
    console.error('Error updating candidate profile:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCandidateCV();
