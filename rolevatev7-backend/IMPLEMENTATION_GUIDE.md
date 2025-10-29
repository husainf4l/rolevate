# Quick Implementation Guide - Remaining Critical Items

## 🎯 Authorization Checks Implementation

### Step 1: Create Authorization Helper Service

Create `src/common/authorization.service.ts`:

```typescript
import { Injectable, ForbiddenException } from '@nestjs/common';
import { User, UserType } from '../user/user.entity';
import { Application } from '../application/application.entity';

@Injectable()
export class AuthorizationService {
  /**
   * Check if user can modify an application
   */
  canModifyApplication(user: User, application: Application): boolean {
    // Candidate can modify their own application
    if (application.candidateId === user.id) {
      return true;
    }

    // Business user can modify applications for their company's jobs
    if (user.userType === UserType.BUSINESS && user.companyId) {
      // Need to check if application belongs to a job from their company
      return application.job?.companyId === user.companyId;
    }

    // Admin can modify all applications
    if (user.userType === UserType.ADMIN || user.userType === UserType.SYSTEM) {
      return true;
    }

    return false;
  }

  /**
   * Throw exception if user cannot modify application
   */
  enforceApplicationAccess(user: User, application: Application): void {
    if (!this.canModifyApplication(user, application)) {
      throw new ForbiddenException(
        'You do not have permission to modify this application'
      );
    }
  }

  /**
   * Check if user can view an application
   */
  canViewApplication(user: User, application: Application): boolean {
    // Same logic as modify for now
    return this.canModifyApplication(user, application);
  }
}
```

### Step 2: Update ApplicationService Methods

In `src/application/application.service.ts`, replace TODOs:

```typescript
// Add to constructor
constructor(
  // ... existing injections ...
  private authorizationService: AuthorizationService,
) {}

// Update create method (line 53)
async create(createApplicationInput: CreateApplicationInput, userId: string): Promise<Application> {
  // Get user
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  // Validate that the candidate is applying for themselves or is authorized
  if (createApplicationInput.candidateId !== userId) {
    // Only ADMIN, SYSTEM, or BUSINESS users can create applications for others
    if (![UserType.ADMIN, UserType.SYSTEM, UserType.BUSINESS].includes(user.userType)) {
      throw new ForbiddenException('You can only create applications for yourself');
    }
  }

  // ... rest of method
}

// Update update method (line 762)
async update(id: string, updateApplicationInput: UpdateApplicationInput, userId: string): Promise<Application | null> {
  const application = await this.findOne(id);
  if (!application) {
    throw new NotFoundException('Application not found');
  }

  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  // Use authorization service
  this.authorizationService.enforceApplicationAccess(user, application);

  // ... rest of method
}

// Update remove method (line 813)
async remove(id: string, userId: string): Promise<boolean> {
  const application = await this.findOne(id);
  if (!application) {
    throw new NotFoundException('Application not found');
  }

  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  this.authorizationService.enforceApplicationAccess(user, application);

  const result = await this.applicationRepository.delete(id);
  
  if (userId && (result.affected ?? 0) > 0) {
    this.auditService.logApplicationDeletion(userId, id);
  }

  return (result.affected ?? 0) > 0;
}

// Update createApplicationNote method (line 1016)
async createApplicationNote(createNoteInput: CreateApplicationNoteInput, userId: string): Promise<ApplicationNote> {
  const application = await this.applicationRepository.findOne({
    where: { id: createNoteInput.applicationId },
    relations: ['job'],
  });
  
  if (!application) {
    throw new NotFoundException('Application not found');
  }

  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  this.authorizationService.enforceApplicationAccess(user, application);

  const note = this.applicationNoteRepository.create({
    ...createNoteInput,
    userId,
  });
  
  const savedNote = await this.applicationNoteRepository.save(note);
  this.auditService.logApplicationNoteCreation(userId, savedNote.id, createNoteInput.applicationId);

  return savedNote;
}

// Update updateApplicationNote method (line 1044)
async updateApplicationNote(id: string, updateNoteInput: UpdateApplicationNoteInput, userId: string): Promise<ApplicationNote | null> {
  const note = await this.findApplicationNote(id);
  if (!note) {
    throw new NotFoundException('Application note not found');
  }

  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  // Only note author, company users, or admins can update
  if (note.userId !== userId) {
    this.authorizationService.enforceApplicationAccess(user, note.application);
  }

  await this.applicationNoteRepository.update(id, updateNoteInput);
  const updatedNote = await this.findApplicationNote(id);

  if (updatedNote) {
    this.auditService.logApplicationNoteUpdate(userId, id, updatedNote.applicationId);
  }

  return updatedNote;
}

// Update removeApplicationNote method (line 1057)
async removeApplicationNote(id: string, userId: string): Promise<boolean> {
  const note = await this.findApplicationNote(id);
  if (!note) {
    throw new NotFoundException('Application note not found');
  }

  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  // Only note author, company users, or admins can delete
  if (note.userId !== userId) {
    this.authorizationService.enforceApplicationAccess(user, note.application);
  }

  const result = await this.applicationNoteRepository.delete(id);

  if ((result.affected ?? 0) > 0) {
    this.auditService.logApplicationNoteDeletion(userId, id, note.applicationId);
  }

  return (result.affected ?? 0) > 0;
}
```

### Step 3: Update ApplicationModule

Add AuthorizationService to providers:

```typescript
// src/application/application.module.ts
import { AuthorizationService } from '../common/authorization.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, ApplicationNote, User, CandidateProfile]),
    // ... other imports
  ],
  providers: [
    ApplicationService, 
    ApplicationResolver,
    AuthorizationService, // Add this
  ],
  exports: [ApplicationService],
})
export class ApplicationModule {}
```

---

## 🔐 Password Reset Token System (Remove SMS Password)

### Step 1: Create Password Reset Entity

```typescript
// src/user/password-reset-token.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;
}
```

### Step 2: Update User Service with Token Methods

```typescript
// src/user/user.service.ts

import { PasswordResetToken } from './password-reset-token.entity';
import * as crypto from 'crypto';

// Add to constructor
@InjectRepository(PasswordResetToken)
private tokenRepository: Repository<PasswordResetToken>,

/**
 * Generate a password reset token
 */
async generatePasswordResetToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Token valid for 1 hour

  await this.tokenRepository.save({
    userId,
    token,
    expiresAt,
    used: false,
  });

  return token;
}

/**
 * Validate and use password reset token
 */
async validatePasswordResetToken(token: string): Promise<User | null> {
  const resetToken = await this.tokenRepository.findOne({
    where: { token, used: false },
    relations: ['user'],
  });

  if (!resetToken) {
    return null;
  }

  if (new Date() > resetToken.expiresAt) {
    return null; // Token expired
  }

  // Mark token as used
  await this.tokenRepository.update(resetToken.id, { used: true });

  return resetToken.user;
}

/**
 * Reset password using token
 */
async resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
  const user = await this.validatePasswordResetToken(token);
  
  if (!user) {
    throw new BadRequestException('Invalid or expired reset token');
  }

  const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await this.userRepository.update(user.id, { password: hashedPassword });

  this.logger.log(`Password reset completed for user ${user.id}`);
  return true;
}
```

### Step 3: Update Application Service SMS Method

Replace password SMS with reset link:

```typescript
// In application.service.ts, replace sendLoginCredentialsSMS method

private async sendLoginCredentialsSMS(
  phone: string,
  email: string,
  userId: string,
  jobTitle: string
): Promise<void> {
  try {
    this.logger.log('Sending account setup SMS to:', phone);

    // Clean phone number
    let cleanPhone = phone.replace(/[\s\-()]/g, '');
    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '+962' + cleanPhone.substring(1);
      } else if (cleanPhone.startsWith('962')) {
        cleanPhone = '+' + cleanPhone;
      } else {
        cleanPhone = '+962' + cleanPhone;
      }
    }

    // Generate password reset token
    const resetToken = await this.userService.generatePasswordResetToken(userId);
    const resetLink = `${process.env.FRONTEND_URL}/set-password?token=${resetToken}`;

    const message = `Welcome to Rolevate!

Your application for "${jobTitle}" has been submitted successfully.

Complete your account setup:
${resetLink}

This link expires in 1 hour.

Track your application at: ${process.env.FRONTEND_URL}`;

    await this.smsService.sendSMS({
      phoneNumber: cleanPhone,
      message: message,
      type: SMSMessageType.GENERAL,
    });

    this.logger.log('Account setup SMS sent successfully to:', cleanPhone);

  } catch (error) {
    this.logger.error('Failed to send account setup SMS:', error.message);
  }
}
```

---

## 📝 Replace Console.log with Logger

Run this find-and-replace across all service files:

### Automated Script

Create `scripts/replace-console-logs.sh`:

```bash
#!/bin/bash

# Find all TypeScript files in src directory
find src -name "*.service.ts" -type f | while read file; do
  echo "Processing $file..."
  
  # Add Logger import if not present
  if ! grep -q "import.*Logger.*from '@nestjs/common'" "$file"; then
    sed -i '' '1i\
import { Logger } from '\''@nestjs/common'\'';
' "$file"
  fi
  
  # Add logger property if not present (after class declaration)
  if ! grep -q "private readonly logger" "$file"; then
    # This is more complex, might need manual addition
    echo "  -> Add: private readonly logger = new Logger(ClassName.name);"
  fi
  
  # Replace console.log
  sed -i '' 's/console\.log(/this.logger.log(/g' "$file"
  sed -i '' 's/console\.error(/this.logger.error(/g' "$file"
  sed -i '' 's/console\.warn(/this.logger.warn(/g' "$file"
  sed -i '' 's/console\.debug(/this.logger.debug(/g' "$file"
done

echo "Done! Please review changes and add logger properties where needed."
```

Make executable and run:
```bash
chmod +x scripts/replace-console-logs.sh
./scripts/replace-console-logs.sh
```

---

## 🔍 SQL Injection Prevention

Add sanitization helper:

```typescript
// src/common/sql-sanitizer.ts

export class SqlSanitizer {
  /**
   * Escape SQL wildcards in LIKE/ILIKE queries
   */
  static escapeWildcards(value: string): string {
    return value.replace(/[%_\\]/g, '\\$&');
  }

  /**
   * Sanitize search input for SQL LIKE queries
   */
  static sanitizeSearchInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }
    
    // Remove special SQL characters
    return input
      .trim()
      .replace(/[%_\\]/g, '\\$&') // Escape wildcards
      .substring(0, 200); // Limit length
  }
}
```

Use in services:

```typescript
// In job.service.ts
import { SqlSanitizer } from '../common/sql-sanitizer';

if (filter.location) {
  const sanitized = SqlSanitizer.sanitizeSearchInput(filter.location);
  queryBuilder.andWhere('job.location ILIKE :location', { 
    location: `%${sanitized}%`
  });
}
```

---

## 🎯 Quick Wins Checklist

After implementing the above:

- [ ] All 7 authorization TODOs resolved
- [ ] Password reset token system implemented
- [ ] SMS no longer sends passwords
- [ ] Console.log replaced with Logger in service files
- [ ] SQL input sanitization added
- [ ] AuthorizationService created and tested
- [ ] PasswordResetToken entity and migration created
- [ ] Frontend updated to handle password reset flow

---

## 🧪 Testing Commands

```bash
# Build to check for TypeScript errors
npm run build

# Run linting
npm run lint

# Generate migration for PasswordResetToken
npm run migration:generate -- -n AddPasswordResetToken

# Run migrations
npm run migration:run

# Start development server
npm run start:dev
```

---

## 📊 Progress Tracking

Phase 1 Critical Fixes: **90% Complete**

Remaining:
- [ ] Authorization checks (2 hours)
- [ ] Password reset system (3 hours)
- [ ] Console.log replacement (1 hour)

**Total Estimated Time:** 6 hours

---

Good luck with implementation! 🚀
