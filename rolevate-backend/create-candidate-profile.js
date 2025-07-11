const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function createCandidateProfile() {
  try {
    // Create a candidate profile for the user
    const candidateProfile = await prisma.candidateProfile.create({
      data: {
        firstName: 'Al-hussein',
        lastName: 'Abdullah',
        email: 'husain.f4l@gmail.com',
        phone: '962796026659',
        currentLocation: 'Jordan',
        isOpenToWork: true,
        isProfilePublic: true,
        resumeUrl: 'https://example.com/cv/al-hussein-cv.pdf', // This is the CV link
        userId: 'cmcvvinsb0000iul6uunqgsd0', // Your user ID
      },
    });

    console.log('Candidate profile created successfully:');
    console.log(candidateProfile);
  } catch (error) {
    console.error('Error creating candidate profile:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCandidateProfile();
