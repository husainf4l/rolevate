import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DataSource } from 'typeorm';
import { User, UserType } from './src/user/user.entity';
import * as bcrypt from 'bcrypt';

async function createAdminUser() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('👤 Creating admin user...');

    const email = 'admin@rolevate.com';
    const password = 'TT%%oo77';
    const bcryptRounds = 12;

    // Check if admin user already exists
    const existingUser = await dataSource.getRepository(User).findOne({
      where: { email },
    });

    if (existingUser) {
      console.log(`⚠️  User with email ${email} already exists`);
      console.log(`ID: ${existingUser.id}`);
      console.log(`Type: ${existingUser.userType}`);
      await app.close();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, bcryptRounds);

    // Create admin user
    const adminUser = dataSource.getRepository(User).create({
      userType: UserType.ADMIN,
      email,
      password: hashedPassword,
      name: 'Admin User',
      isActive: true,
    });

    const savedUser = await dataSource.getRepository(User).save(adminUser);

    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${savedUser.email}`);
    console.log(`Type: ${savedUser.userType}`);
    console.log(`ID: ${savedUser.id}`);
    console.log(`Active: ${savedUser.isActive}`);

    await app.close();
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error?.message || error);
    await app.close();
    process.exit(1);
  }
}

createAdminUser();
