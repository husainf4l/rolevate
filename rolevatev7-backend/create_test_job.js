const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestJob() {
  try {
    // Check if test company exists
    let company = await prisma.company.findFirst({
      where: { name: 'Test Company' }
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Test Company',
          email: 'test@company.com',
          phone: '+962123456789',
          address: 'Test Address',
          industry: 'Technology',
          size: 'SMALL'
        }
      });
      console.log('Created test company:', company.id);
    }

    // Check if test user exists
    let user = await prisma.user.findFirst({
      where: { email: 'test@company.com' }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'test@company.com',
          name: 'Test User',
          password: 'hashedpassword',
          userType: 'BUSINESS',
          companyId: company.id,
          isActive: true
        }
      });
      console.log('Created test user:', user.id);
    }

    // Create test job
    const job = await prisma.job.create({
      data: {
        title: 'Test Job for SMS',
        description: 'Test job description',
        requirements: 'Test requirements',
        companyId: company.id,
        status: 'ACTIVE',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        salary: 50000,
        location: 'Amman',
        type: 'FULL_TIME',
        applicants: 0
      }
    });

    console.log('Created test job:', job.id);
    console.log('Job details:', {
      id: job.id,
      title: job.title,
      status: job.status,
      companyId: job.companyId
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestJob();