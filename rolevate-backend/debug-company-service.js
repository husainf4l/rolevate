const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugCompanyService() {
  console.log('🔍 Debugging Company Service...\n');

  try {
    // Check the company user
    const companyUserEmail = 'al-hussein@papayatrading.com';
    
    console.log(`1. Checking user: ${companyUserEmail}`);
    const user = await prisma.user.findUnique({
      where: { email: companyUserEmail },
      include: { 
        company: {
          include: {
            address: true,
            invitations: true
          }
        }
      }
    });

    if (user) {
      console.log(`   User ID: ${user.id}`);
      console.log(`   User Type: ${user.userType}`);
      console.log(`   Company ID: ${user.companyId}`);
      console.log(`   Company Data: ${user.company ? 'Present' : 'NULL'}`);
      
      if (user.company) {
        console.log(`   Company Name: ${user.company.name}`);
        console.log(`   Company Industry: ${user.company.industry}`);
        console.log(`   Company Subscription: ${user.company.subscription}`);
      }
    } else {
      console.log('   User not found!');
    }

    console.log('\n2. Checking all companies in database...');
    const companies = await prisma.company.findMany({
      include: {
        address: true,
        users: true
      }
    });

    console.log(`   Total companies: ${companies.length}`);
    companies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.name} (ID: ${company.id})`);
      console.log(`      Users: ${company.users.length}`);
      company.users.forEach(user => {
        console.log(`        - ${user.email} (${user.userType})`);
      });
    });

    console.log('\n3. Testing getUserCompany logic manually...');
    if (user && user.company) {
      // Simulate findById call
      const companyDetails = await prisma.company.findUnique({
        where: { id: user.company.id },
        include: {
          address: true,
          invitations: true,
          users: true
        }
      });

      if (companyDetails) {
        console.log('   ✅ Company details found:');
        console.log(`     Name: ${companyDetails.name}`);
        console.log(`     Industry: ${companyDetails.industry}`);
        console.log(`     Employees: ${companyDetails.numberOfEmployees}`);
        console.log(`     Subscription: ${companyDetails.subscription}`);
        console.log(`     Address: ${companyDetails.address ? 'Present' : 'None'}`);
        console.log(`     Users: ${companyDetails.users.length}`);
      } else {
        console.log('   ❌ Company details not found via findById');
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCompanyService();