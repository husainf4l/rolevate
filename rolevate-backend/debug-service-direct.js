const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugServiceDirect() {
  console.log('🔍 Debugging CompanyService.getUserCompany directly...\n');

  const userId = 'cmcvwkb0e0004iubwi3xpbakg'; // The company user ID

  try {
    console.log('1. Getting user with company...');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    console.log('   User found:', !!user);
    console.log('   User company:', !!user?.company);
    
    if (user && user.company) {
      console.log(`   Company ID: ${user.company.id}`);
      console.log(`   Company Name: ${user.company.name}`);
      
      console.log('\n2. Testing findById with company ID...');
      
      // Test the utility functions that might be causing issues
      const { getCompanySizeCategory, getCompanySizeRange } = require('/home/husain/rolevate/rolevate-backend/src/company/utils/company-size.util');
      
      const company = await prisma.company.findUnique({ 
        where: { id: user.company.id },
        include: {
          address: true,
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true,
              isActive: true,
              createdAt: true,
            }
          },
          invitations: {
            where: {
              status: 'PENDING',
              expiresAt: { gt: new Date() }
            },
            select: {
              id: true,
              code: true,
              email: true,
              expiresAt: true,
              createdAt: true,
            }
          }
        }
      });

      if (company) {
        console.log('   ✅ Company found via findUnique');
        console.log(`   Name: ${company.name}`);
        console.log(`   Industry: ${company.industry}`);
        console.log(`   Employees: ${company.numberOfEmployees}`);
        
        // Test the utility functions
        console.log('\n3. Testing utility functions...');
        try {
          const sizeCategory = getCompanySizeCategory(company.numberOfEmployees);
          const sizeRange = getCompanySizeRange(company.numberOfEmployees);
          
          console.log(`   Size Category: ${sizeCategory}`);
          console.log(`   Size Range: ${sizeRange}`);
          
          // Simulate the full service response
          const result = {
            ...company,
            sizeCategory,
            sizeRange,
          };
          
          console.log('\n4. Full service result simulation:');
          console.log('   Result type:', typeof result);
          console.log('   Result keys:', Object.keys(result));
          console.log('   JSON length:', JSON.stringify(result).length);
          
        } catch (utilError) {
          console.log('   ❌ Utility function error:', utilError.message);
        }
        
      } else {
        console.log('   ❌ Company not found via findUnique');
      }
    } else {
      console.log('   ❌ User has no company');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugServiceDirect();