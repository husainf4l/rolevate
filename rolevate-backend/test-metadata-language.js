const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testInterviewLanguageInMetadata() {
  console.log('🔍 Testing Interview Language in Room Metadata...\n');

  try {
    // Find an application with a phone number that we can test
    const application = await prisma.application.findFirst({
      include: {
        candidate: {
          select: {
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            interviewLanguage: true,
            interviewPrompt: true,
            cvAnalysisPrompt: true,
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (application && application.candidate.phone) {
      console.log('📋 Found Application:');
      console.log(`  - Candidate: ${application.candidate.firstName} ${application.candidate.lastName}`);
      console.log(`  - Phone: ${application.candidate.phone}`);
      console.log(`  - Job: ${application.job.title}`);
      console.log(`  - Company: ${application.job.company.name}`);
      console.log(`  - Interview Language: ${application.job.interviewLanguage}`);
      console.log('');

      // Simulate what the metadata will look like
      const mockMetadata = {
        candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`,
        jobName: application.job.title,
        companyName: application.job.company.name,
        interviewLanguage: application.job.interviewLanguage || 'english',
        interviewPrompt: application.job.interviewPrompt || "Conduct a professional interview for this position."
      };

      console.log('🎯 Room Metadata that will be sent:');
      console.log(JSON.stringify(mockMetadata, null, 2));
      console.log('');

      // Test if we can call the exact same query as the room service
      console.log('🔍 Testing exact room service query...');
      const cleanPhone = application.candidate.phone.replace(/[\+\s\-\(\)]/g, '');
      
      const testApplication = await prisma.application.findFirst({
        where: {
          jobId: application.job.id,
          candidate: {
            OR: [
              { phone: cleanPhone },
              { phone: { contains: cleanPhone } },
              { phone: application.candidate.phone },
              { phone: { contains: application.candidate.phone } },
              { phone: { endsWith: cleanPhone.slice(-8) } },
              ...(cleanPhone.length > 8 ? [{ phone: { contains: cleanPhone.slice(-8) } }] : []),
            ]
          }
        },
        include: {
          candidate: {
            include: {
              workExperiences: true,
              educationHistory: true,
              cvs: {
                where: { isActive: true },
                take: 1
              }
            }
          },
          job: {
            select: {
              id: true,
              title: true,
              interviewLanguage: true,
              interviewPrompt: true,
              cvAnalysisPrompt: true,
              company: {
                select: {
                  id: true,
                  name: true,
                  address: {
                    select: {
                      street: true,
                      city: true,
                      country: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (testApplication) {
        console.log('✅ Room service query works!');
        console.log(`  - Interview Language from query: ${testApplication.job.interviewLanguage}`);
        
        // Show what the actual metadata object would be
        const actualMetadata = {
          candidateName: `${testApplication.candidate.firstName} ${testApplication.candidate.lastName}`,
          jobName: testApplication.job.title,
          companyName: testApplication.job.company.name,
          interviewLanguage: testApplication.job.interviewLanguage || 'english',
          interviewPrompt: testApplication.job.interviewPrompt || "Conduct a professional interview for this position."
        };
        
        console.log('');
        console.log('🚀 ACTUAL metadata that would be sent to LiveKit:');
        console.log(JSON.stringify(actualMetadata, null, 2));
        
        // Verify the field exists
        if (actualMetadata.interviewLanguage) {
          console.log('');
          console.log(`✅ SUCCESS: interviewLanguage field is present: "${actualMetadata.interviewLanguage}"`);
        } else {
          console.log('');
          console.log('❌ ERROR: interviewLanguage field is missing!');
        }
      } else {
        console.log('❌ Room service query failed - could not find application');
      }

    } else {
      console.log('⚠️ No application with phone number found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testInterviewLanguageInMetadata();
