const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    const jobPosts = await prisma.jobPost.findMany({
      select: {
        id: true,
        title: true,
        company: {
          select: {
            name: true
          }
        }
      }
    });
    
    console.log('Available Job Posts:');
    jobPosts.forEach(job => {
      console.log(`ID: ${job.id}`);
      console.log(`Title: ${job.title}`);
      console.log(`Company: ${job.company.name}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
