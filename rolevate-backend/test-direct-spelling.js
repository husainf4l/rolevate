const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDirectSpellingUpdate() {
  console.log('🧪 Testing Company Spelling Field Direct Database Update...\n');

  try {
    // Find a company to update
    const companies = await prisma.company.findMany({
      take: 1,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (companies.length === 0) {
      console.log('❌ No companies found in database');
      return;
    }

    const company = companies[0];
    console.log(`📋 Testing with company: ${company.name} (ID: ${company.id})`);

    // Update the company with spelling
    const updatedCompany = await prisma.company.update({
      where: { id: company.id },
      data: {
        spelling: company.name.includes('papaya') ? 'Pah-pie-yah Trading' : 'Test Company Spelling'
      }
    });

    console.log('✅ Company updated successfully!');
    console.log(`📝 Company Name: ${updatedCompany.name}`);
    console.log(`🗣️ Spelling: ${updatedCompany.spelling}`);

    // Now test if we can query it back
    console.log('\n2. Testing Company Query with Spelling Field...');

    const queriedCompany = await prisma.company.findUnique({
      where: { id: company.id },
      select: {
        id: true,
        name: true,
        spelling: true,
        description: true
      }
    });

    console.log('✅ Query successful!');
    console.log(`📋 Retrieved Data:`);
    console.log(`   - Name: ${queriedCompany.name}`);
    console.log(`   - Spelling: ${queriedCompany.spelling || 'NULL'}`);

    console.log('\n3. Testing Room Service Query Compatibility...');

    // Test the same query structure used in room service
    const roomServiceQuery = await prisma.application.findFirst({
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
                spelling: true, // This is the new field
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
      },
      take: 1
    });

    if (roomServiceQuery && roomServiceQuery.job.company) {
      console.log('✅ Room service query structure works!');
      console.log(`📋 Company: ${roomServiceQuery.job.company.name}`);
      console.log(`🗣️ Spelling: ${roomServiceQuery.job.company.spelling || 'Not set'}`);

      // Simulate the metadata creation
      const mockMetadata = {
        candidateName: `${roomServiceQuery.candidate.firstName} ${roomServiceQuery.candidate.lastName}`,
        jobName: roomServiceQuery.job.title,
        companyName: roomServiceQuery.job.company.name,
        companySpelling: roomServiceQuery.job.company.spelling || roomServiceQuery.job.company.name,
        interviewLanguage: roomServiceQuery.job.interviewLanguage || 'english',
        interviewPrompt: roomServiceQuery.job.interviewPrompt || 'Conduct professional interview.'
      };

      console.log('\n4. Simulated AI Agent Metadata:');
      console.log('=====================================');
      console.log(JSON.stringify(mockMetadata, null, 2));

      console.log('\n🎉 SUCCESS: Company spelling is fully integrated!');
      console.log(`🤖 AI agent will pronounce: "${mockMetadata.companyName}" as "${mockMetadata.companySpelling}"`);

    } else {
      console.log('⚠️ No applications found to test room service query');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testDirectSpellingUpdate();
