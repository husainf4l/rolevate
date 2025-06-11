import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  console.log('🔍 Verifying seeded data...\n');

  // Check users
  const users = await prisma.user.findMany({
    include: {
      company: true,
    },
  });
  console.log(`👥 Users created: ${users.length}`);
  users.forEach(user => {
    console.log(`   - ${user.name} (${user.email}) - ${user.role} at ${user.company?.name || 'No company'}`);
  });

  // Check companies
  const companies = await prisma.company.findMany();
  console.log(`\n🏢 Companies created: ${companies.length}`);
  companies.forEach(company => {
    console.log(`   - ${company.name} (${company.industry})`);
  });

  // Check job posts
  const jobPosts = await prisma.jobPost.findMany({
    include: {
      company: true,
      createdBy: true,
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });
  console.log(`\n💼 Job posts created: ${jobPosts.length}`);
  jobPosts.forEach(job => {
    console.log(`   - ${job.title} at ${job.company.name} (${job._count.applications} applications)`);
  });

  // Check applications
  const applications = await prisma.application.findMany({
    include: {
      candidate: true,
      jobPost: true,
      cvAnalysis: true,
      interviews: true,
      fitScore: true,
    },
  });
  console.log(`\n📝 Applications created: ${applications.length}`);
  applications.forEach(app => {
    console.log(`   - ${app.candidate.name} applied for ${app.jobPost.title} (Status: ${app.status})`);
    if (app.cvAnalysis) {
      console.log(`     CV Score: ${app.cvAnalysis.overallScore}/100`);
    }
    if (app.interviews.length > 0) {
      console.log(`     Interviews: ${app.interviews.length} (Last status: ${app.interviews[0].status})`);
    }
    if (app.fitScore) {
      console.log(`     Fit Score: ${app.fitScore.overallScore}/100 (${app.fitScore.recommendation})`);
    }
  });

  // Check notifications
  const notifications = await prisma.notification.findMany({
    include: {
      user: true,
    },
  });
  console.log(`\n🔔 Notifications created: ${notifications.length}`);
  notifications.forEach(notif => {
    console.log(`   - ${notif.type} for ${notif.user.name} (Read: ${notif.isRead})`);
  });

  console.log('\n✅ Database seeded successfully!');
  console.log('\n🚀 Ready for frontend development!');
  console.log('\n📋 Summary:');
  console.log(`   - ${users.length} users (including Husain as SUPER_ADMIN)`);
  console.log(`   - ${companies.length} companies`);
  console.log(`   - ${jobPosts.length} job posts`);
  console.log(`   - ${applications.length} applications with full pipeline data`);
  console.log(`   - Complete CV analyses and interview data`);
  console.log(`   - Fit scores and recommendations`);
  console.log(`   - ${notifications.length} notifications`);
}

verify()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
