const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function revertPasswords() {
  const password = 'tt55oo77'; // Revert to original password
  
  try {
    console.log('🔄 Reverting all user passwords to tt55oo77...\n');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
      }
    });

    console.log(`Found ${users.length} users to update:\n`);

    // Hash the password with 12 salt rounds (maintaining security standards)
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('🔐 Password hashed with 12 salt rounds\n');

    // Update all users
    const updateResult = await prisma.user.updateMany({
      data: {
        password: hashedPassword,
      }
    });

    console.log(`✅ Successfully updated ${updateResult.count} user passwords\n`);

    // List updated users
    console.log('👥 Updated users:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.name}) - ${user.userType}`);
    });

    console.log(`\n🔑 Password for all users is now: ${password}`);
    
    // Revoke all existing refresh tokens for security
    console.log('\n🔄 Revoking all existing refresh tokens for security...');
    const tokenUpdate = await prisma.refreshToken.updateMany({
      data: {
        isRevoked: true,
      }
    });

    console.log(`✅ Revoked ${tokenUpdate.count} refresh tokens\n`);
    console.log('👤 Users will need to log in again with the updated password');

  } catch (error) {
    console.error('❌ Error updating passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the password revert
revertPasswords();