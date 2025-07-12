const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function getCompanySizeCategory(numberOfEmployees) {
  if (!numberOfEmployees) return 'UNKNOWN';
  
  if (numberOfEmployees <= 10) return 'STARTUP';
  if (numberOfEmployees <= 50) return 'SMALL';
  if (numberOfEmployees <= 200) return 'MEDIUM';
  if (numberOfEmployees <= 1000) return 'LARGE';
  return 'ENTERPRISE';
}

function getCompanySizeRange(numberOfEmployees) {
  if (!numberOfEmployees) return 'Unknown';
  
  if (numberOfEmployees <= 10) return '1-10 employees';
  if (numberOfEmployees <= 50) return '11-50 employees';
  if (numberOfEmployees <= 200) return '51-200 employees';
  if (numberOfEmployees <= 1000) return '201-1000 employees';
  return '1000+ employees';
}

async function debugSimple() {
  console.log('🔍 Debugging Company Service Logic...\n');

  const userId = 'cmcvwkb0e0004iubwi3xpbakg';

  try {
    // Step 1: Simulate getUserCompany method
    console.log('1. Simulating getUserCompany...');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!user || !user.company) {
      console.log('   Result: null (no company)');
      return;
    }

    console.log('   User has company, calling findById...');

    // Step 2: Simulate findById method
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

    if (!company) {
      console.log('   Result: null (company not found)');
      return;
    }

    console.log('   Company found, adding computed fields...');

    // Step 3: Add computed fields (this is where it might fail)
    const result = {
      ...company,
      sizeCategory: getCompanySizeCategory(company.numberOfEmployees),
      sizeRange: getCompanySizeRange(company.numberOfEmployees),
    };

    console.log('   ✅ Final result generated successfully');
    console.log(`   Company: ${result.name}`);
    console.log(`   Size Category: ${result.sizeCategory}`);
    console.log(`   Size Range: ${result.sizeRange}`);
    console.log(`   Result type: ${typeof result}`);
    console.log(`   JSON serializable: ${typeof JSON.stringify(result) === 'string'}`);
    console.log(`   JSON length: ${JSON.stringify(result).length} characters`);

    return result;

  } catch (error) {
    console.error('❌ Error in simulation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

debugSimple();