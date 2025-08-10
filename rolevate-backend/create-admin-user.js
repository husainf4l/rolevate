// Script to create admin user
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log('🔧 Creating admin user...');
  
  const adminEmail = 'admin@rolevate.com';
  const adminPassword = 'TT%%oo77';
  const adminName = 'System Administrator';

  try {
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingUser) {
      console.log('⚠️  Admin user already exists with email:', adminEmail);
      console.log('📋 User ID:', existingUser.id);
      console.log('👤 User Type:', existingUser.userType);
      console.log('✅ Active:', existingUser.isActive);
      
      // Update user type to ADMIN if it's not already
      if (existingUser.userType !== 'ADMIN') {
        console.log('🔄 Updating user type to ADMIN...');
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: { userType: 'ADMIN' }
        });
        console.log('✅ User type updated to ADMIN');
      }
      
      return existingUser;
    }

    // Hash the password
    console.log('🔐 Hashing password...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // Create the admin user
    console.log('👤 Creating admin user...');
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        userType: 'ADMIN',
        isActive: true,
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Name:', adminUser.name);
    console.log('🆔 ID:', adminUser.id);
    console.log('🔑 User Type:', adminUser.userType);
    console.log('✅ Active:', adminUser.isActive);
    console.log('📅 Created At:', adminUser.createdAt);

    return adminUser;

  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    
    if (error.code === 'P2002') {
      console.error('💡 Unique constraint violation - user might already exist');
    }
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('\n🎉 Admin user setup completed!');
    console.log('\n📋 Login Credentials:');
    console.log('   Email: admin@rolevate.com');
    console.log('   Password: TT%%oo77');
    console.log('\n🔗 Login URL: http://localhost:4005/api/auth/login');
    console.log('\n📝 Test with curl:');
    console.log(`curl -X POST http://localhost:4005/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@rolevate.com",
    "password": "TT%%oo77"
  }'`);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  });
