const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testInterviewLanguage() {
  console.log('🔍 Testing Interview Language Integration...\n');

  try {
    // 1. Find a job to check its interview language
    const job = await prisma.job.findFirst({
      select: {
        id: true,
        title: true,
        interviewLanguage: true,
        company: {
          select: {
            name: true
          }
        }
      }
    });

    if (job) {
      console.log('📋 Found Job:');
      console.log(`  - ID: ${job.id}`);
      console.log(`  - Title: ${job.title}`);
      console.log(`  - Company: ${job.company.name}`);
      console.log(`  - Interview Language: ${job.interviewLanguage}`);
      console.log('');

      // 2. Check if there's an application for this job
      const application = await prisma.application.findFirst({
        where: { jobId: job.id },
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
              title: true,
              interviewLanguage: true
            }
          }
        }
      });

      if (application) {
        console.log('✅ Found Application:');
        console.log(`  - Candidate: ${application.candidate.firstName} ${application.candidate.lastName}`);
        console.log(`  - Phone: ${application.candidate.phone}`);
        console.log(`  - Job Interview Language: ${application.job.interviewLanguage}`);
        console.log('');

        console.log('🎯 When creating a room for this application, the metadata will include:');
        console.log(`  - candidateName: ${application.candidate.firstName} ${application.candidate.lastName}`);
        console.log(`  - jobName: ${application.job.title}`);
        console.log(`  - interviewLanguage: ${application.job.interviewLanguage}`);
        console.log('');
      } else {
        console.log('⚠️ No applications found for this job');
      }
    } else {
      console.log('⚠️ No jobs found in the database');
    }

    // 3. Check all jobs and their languages
    const allJobs = await prisma.job.findMany({
      select: {
        id: true,
        title: true,
        interviewLanguage: true
      },
      take: 5
    });

    console.log('📊 Sample of Jobs and their Interview Languages:');
    allJobs.forEach(job => {
      console.log(`  - ${job.title}: ${job.interviewLanguage}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testInterviewLanguage();
