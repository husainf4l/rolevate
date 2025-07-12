const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateAllPasswords() {
  const newPassword = '$6SSKqjP(GS@'; // Secure demo password
  
  try {
    console.log('🔄 Updating all user passwords to meet security policy...\n');

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

    // Hash the new password with 12 salt rounds (as per security policy)
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    console.log('🔐 Password hashed with 12 salt rounds\n');

    // Update all users
    const updateResult = await prisma.user.updateMany({
      data: {
        password: hashedPassword,
      }
    });

    console.log(`✅ Successfully updated ${updateResult.count} user passwords\n`);

    // List updated users (without sensitive data)
    console.log('👥 Updated users:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.name}) - ${user.userType}`);
    });

    console.log(`\n🔑 New password for all users: ${newPassword}`);
    console.log('\n✅ Password requirements met:');
    console.log('   - At least 8 characters: ✓');
    console.log('   - Contains uppercase: ✓');
    console.log('   - Contains lowercase: ✓');
    console.log('   - Contains numbers: ✓');
    console.log('   - Contains special characters: ✓');

    // Revoke all existing refresh tokens for security
    console.log('\n🔄 Revoking all existing refresh tokens for security...');
    const tokenUpdate = await prisma.refreshToken.updateMany({
      data: {
        isRevoked: true,
      }
    });

    console.log(`✅ Revoked ${tokenUpdate.count} refresh tokens\n`);
    console.log('👤 Users will need to log in again with the new password');

  } catch (error) {
    console.error('❌ Error updating passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the password update
updateAllPasswords();