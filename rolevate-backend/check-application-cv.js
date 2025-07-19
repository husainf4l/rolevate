const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkApplicationData() {
  try {
    console.log('🔍 Checking application data for CV analysis...\n');

    // Find the application used in the test
    const application = await prisma.application.findFirst({
      where: {
        candidate: {
          phone: {
            contains: '962796026659'
          }
        },
        job: {
          id: 'cmcxmffqf000diuc17tbhwwiy'
        }
      },
      include: {
        candidate: {
          include: {
            cvs: {
              where: { isActive: true },
              take: 5
            }
          }
        },
        job: true
      }
    });

    if (application) {
      console.log('✅ Application found:');
      console.log('- Application ID:', application.id);
      console.log('- Resume URL:', application.resumeUrl);
      console.log('- CV Analysis Results:', application.cvAnalysisResults ? 'Present' : 'Missing');
      
      if (application.cvAnalysisResults) {
        console.log('- CV Analysis:', JSON.stringify(application.cvAnalysisResults, null, 2));
      }
      
      console.log('\n📄 Candidate CVs:');
      application.candidate.cvs.forEach((cv, index) => {
        console.log(`- CV ${index + 1}:`);
        console.log(`  - File Name: ${cv.fileName}`);
        console.log(`  - File URL: ${cv.fileUrl}`);
        console.log(`  - Status: ${cv.status}`);
        console.log(`  - Active: ${cv.isActive}`);
        console.log(`  - Created: ${cv.createdAt}`);
      });
      
    } else {
      console.log('❌ Application not found');
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
  }
}

checkApplicationData();
