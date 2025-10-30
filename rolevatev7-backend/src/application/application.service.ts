import { Injectable, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from './application.entity';
import { ApplicationNote } from './application-note.entity';
import { CreateApplicationInput } from './create-application.input';
import { UpdateApplicationInput } from './update-application.input';
import { CreateApplicationNoteInput } from './create-application-note.input';
import { UpdateApplicationNoteInput } from './update-application-note.input';
import { ApplicationFilterInput } from './application-filter.input';
import { ApplicationPaginationInput } from './application-filter.input';
import { ApplicationResponse } from './application-response.dto';
import { AuditService } from '../audit.service';
import { LiveKitService } from '../livekit/livekit.service';
import { CommunicationService } from '../communication/communication.service';
import { NotificationService } from '../notification/notification.service';
import { CommunicationType, CommunicationDirection } from '../communication/communication.entity';
import { SMSService } from '../services/sms.service';
import { SMSMessageType } from '../services/sms.input';
import { Job } from '../job/job.entity';
import { User, UserType } from '../user/user.entity';
import { CandidateProfile } from '../candidate/candidate-profile.entity';
import { WorkExperience } from '../candidate/work-experience.entity';
import { Education } from '../candidate/education.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name);

  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(ApplicationNote)
    private applicationNoteRepository: Repository<ApplicationNote>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private auditService: AuditService,
    private liveKitService: LiveKitService,
    private communicationService: CommunicationService,
    private notificationService: NotificationService,
    private smsService: SMSService,
    private jwtService: JwtService,
  ) {}

  async create(createApplicationInput: CreateApplicationInput, userId?: string): Promise<Application> {
    // Validate that the candidate is applying for themselves or is authorized
    if (userId && createApplicationInput.candidateId !== userId) {
      // TODO: Add role-based check for recruiters/admins
      throw new Error('Unauthorized: Can only apply on behalf of yourself');
    }

    // Check if user has already applied to this job
    const existingApplication = await this.applicationRepository.findOne({
      where: {
        jobId: createApplicationInput.jobId,
        candidateId: createApplicationInput.candidateId,
      },
    });

    if (existingApplication) {
      throw new Error('You have already applied to this job');
    }

    const application = this.applicationRepository.create(createApplicationInput);
    const savedApplication = await this.applicationRepository.save(application);

    // Log audit event
    if (userId) {
      this.auditService.logApplicationCreation(userId, savedApplication.id, createApplicationInput.jobId);
    }

    // Notify company users about new application
    await this.notifyCompanyAboutNewApplication(savedApplication);

    // Trigger CV analysis via FastAPI service if resume is available
    if (savedApplication.resumeUrl) {
      this.triggerCVAnalysis(
        savedApplication.id, 
        savedApplication.candidateId,
        createApplicationInput.jobId,
        savedApplication.resumeUrl
      ).catch(error => {
        console.error('Failed to trigger CV analysis:', error);
      });
    }

    // Send interview room link to candidate (room will be created on-demand)
    this.sendInterviewLinkToCandidate(savedApplication);

    return savedApplication;
  }

  async createAnonymousApplication(
    createApplicationInput: CreateApplicationInput
  ): Promise<ApplicationResponse> {
    console.log('🔄 Processing anonymous application...');

    // Resume URL is optional for now - allow applications without resumes
    // Later we can make it required after implementing file upload
    const resumeUrl = createApplicationInput.resumeUrl || null;

    // Get job details to verify it exists and is active
    const job = await this.applicationRepository.manager.findOne(Job, {
      where: { id: createApplicationInput.jobId },
      relations: ['company'],
    });

    if (!job) {
      throw new Error('Job not found');
    }

    // Allow applications for ACTIVE and PAUSED jobs
    if (job.status === 'CLOSED' || job.status === 'EXPIRED' || job.status === 'DELETED') {
      throw new Error(`Job is ${job.status.toLowerCase()} and not accepting applications`);
    }

    if (new Date() > job.deadline) {
      throw new Error('Job application deadline has passed');
    }

    // Validate required candidate information
    // Email and phone are optional - they can be extracted from CV or provided by user
    if (createApplicationInput.email) {
      // Validate email format only if provided
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(createApplicationInput.email.trim())) {
        throw new BadRequestException('Invalid email format');
      }
    }

    if (createApplicationInput.phone) {
      // Validate phone number format only if provided
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanPhone = createApplicationInput.phone.replace(/[\s\-\(\)]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        throw new BadRequestException('Invalid phone number format');
      }
    }

    // Generate anonymous candidate info - FastAPI will extract real data later
    console.log('🆕 Creating anonymous candidate with placeholder data...');
    const timestamp = Date.now();
    const anonymousId = `anonymous-${timestamp}`;
    
    // If email is not provided, generate a placeholder email
    // FastAPI will update it with the real email from the CV
    const email = createApplicationInput.email || `${anonymousId}@placeholder.temp`;
    const phone = createApplicationInput.phone || `+962${timestamp.toString().slice(-9)}`;
    
    const candidateInfo = {
      firstName: createApplicationInput.firstName || 'Anonymous',
      lastName: createApplicationInput.lastName || anonymousId,
      email: email,
      phone: phone,
      linkedin: createApplicationInput.linkedin || null,
      portfolioUrl: createApplicationInput.portfolioUrl,
    };

    // Always create new anonymous candidate - FastAPI will update with real data later
    console.log('🆕 Creating new anonymous candidate account...');

    // Generate random password
    const randomPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create user and candidate profile with or without CV
    const result = resumeUrl 
      ? await this.createCandidateFromCV(candidateInfo, hashedPassword, resumeUrl)
      : await this.createCandidateWithoutCV(candidateInfo, hashedPassword);
    const candidateId = result.user.id;

    // Generate JWT token for the new candidate
    const payload = { 
      email: result.user.email, 
      sub: result.user.id, 
      userType: result.user.userType,
      companyId: null
    };
    const token = this.jwtService.sign(payload);

    const candidateCredentials = {
      email: candidateInfo.email,
      password: randomPassword,
      token: token
    };

    console.log('✅ Created anonymous candidate account with ID:', candidateId);
    console.log('📧 Email:', candidateInfo.email, candidateInfo.email.includes('@placeholder.temp') ? '(placeholder - will be extracted from CV)' : '(provided)');
    console.log('📱 Phone:', candidateInfo.phone, createApplicationInput.phone ? '(provided)' : '(placeholder - will be extracted from CV)');
    console.log('🔄 FastAPI will update with real candidate data from CV');

    // Create the application
    const application = this.applicationRepository.create({
      ...createApplicationInput,
      candidateId: candidateId,
    });
    const savedApplication = await this.applicationRepository.save(application);

    // Increment job applicants count
    await this.applicationRepository.manager.update(Job, job.id, {
      applicants: job.applicants + 1,
    });

    // Trigger CV analysis via FastAPI service if resume is available
    if (createApplicationInput.resumeUrl) {
      this.triggerCVAnalysis(
        savedApplication.id, 
        savedApplication.candidateId,
        createApplicationInput.jobId,
        createApplicationInput.resumeUrl
      ).catch(error => {
        console.error('Failed to trigger CV analysis:', error);
      });
    }

    // Send interview room link to candidate (room will be created on-demand)
    this.sendInterviewLinkToCandidate(savedApplication);

    // Send login credentials via WhatsApp to candidate if phone number is available
    if (candidateInfo.phone && !candidateInfo.phone.includes('timestamp')) {
      console.log('📱 Sending login credentials via WhatsApp to candidate...');
      await this.sendLoginCredentialsWhatsApp(
        candidateInfo.phone,
        candidateInfo.email,
        randomPassword,
        job.title
      );
    } else {
      console.log('⚠️ No valid phone number available for WhatsApp, skipping login credentials message');
    }

    // Notify company users about new application
    await this.notifyCompanyAboutNewApplication(savedApplication);

    // Reload application with all relations for GraphQL response
    const applicationWithRelations = await this.applicationRepository.findOne({
      where: { id: savedApplication.id },
      relations: ['job', 'job.company', 'candidate', 'candidate.candidateProfile'],
    });

    if (!applicationWithRelations) {
      throw new Error('Failed to load application after creation');
    }

    // Return response with anonymous credentials
    return {
      application: applicationWithRelations,
      candidateCredentials,
      message: 'Application submitted successfully! Anonymous account created. We will extract your details from the CV and update your profile.'
    };
  }

  private async createCandidateFromCV(
    candidateInfo: any,
    hashedPassword: string,
    resumeUrl: string
  ) {
    console.log('🏗️ Creating user and empty candidate profile from basic CV data...');

    return await this.applicationRepository.manager.transaction(async (manager) => {
      // Check if user already exists with this email
      let user = await manager.findOne(User, {
        where: { email: candidateInfo.email }
      });

      if (user) {
        console.log('ℹ️ User already exists with email:', candidateInfo.email);
        // Update user info if needed
        await manager.update(User, { id: user.id }, {
          name: `${candidateInfo.firstName} ${candidateInfo.lastName}`,
          password: hashedPassword, // Update password
          phone: candidateInfo.phone, // Save phone to User entity
        });
        // Reload user
        user = await manager.findOne(User, {
          where: { email: candidateInfo.email }
        });
      } else {
        // Create new user
        console.log('🆕 Creating new user with email:', candidateInfo.email);
        user = await manager.save(User, {
          email: candidateInfo.email,
          name: `${candidateInfo.firstName} ${candidateInfo.lastName}`,
          password: hashedPassword,
          userType: UserType.CANDIDATE,
          phone: candidateInfo.phone, // Save phone to User entity
          isActive: true,
        });
      }

      if (!user) {
        throw new Error('Failed to create or find user');
      }

      // Check if candidate profile already exists for this user
      let candidateProfile = await manager.findOne(CandidateProfile, {
        where: { userId: user.id }
      });

      if (candidateProfile) {
        console.log('ℹ️ Candidate profile already exists, updating basic info...');
        // Update existing profile with basic info only
        // Combine firstName and lastName into name
        const fullName = [candidateInfo.firstName, candidateInfo.lastName]
          .filter(Boolean)
          .join(' ')
          .trim() || undefined;
          
        await manager.update(CandidateProfile, { userId: user.id }, {
          name: fullName,
          phone: candidateInfo.phone,
          resumeUrl: resumeUrl,
          // Leave CV analysis fields empty - FastAPI will fill them
        });
        // Reload to get updated profile
        candidateProfile = await manager.findOne(CandidateProfile, {
          where: { userId: user.id }
        });
      } else {
        // Create new candidate profile with basic info only
        console.log('🆕 Creating new candidate profile with basic info...');
        // Combine firstName and lastName into name
        const fullName = [candidateInfo.firstName, candidateInfo.lastName]
          .filter(Boolean)
          .join(' ')
          .trim() || undefined;
          
        candidateProfile = await manager.save(CandidateProfile, {
          userId: user.id,
          name: fullName,
          phone: candidateInfo.phone,
          resumeUrl: resumeUrl,
          // Leave all CV analysis fields empty - FastAPI will populate them
          skills: [],
          experience: undefined,
          education: undefined,
          bio: undefined,
          location: undefined,
          linkedinUrl: undefined,
          githubUrl: undefined,
          portfolioUrl: undefined,
        });
      }

      if (!candidateProfile) {
        throw new Error('Failed to create or find candidate profile');
      }

      return {
        user,
        candidateProfile
      };
    });
  }

  private generateRandomPassword(): string {
    // Use cryptographically secure random bytes
    const buffer = crypto.randomBytes(12);
    const password = buffer.toString('base64').slice(0, 12);
    
    // Ensure it has required character types
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '@$!%*?&';
    
    // Replace some characters to ensure variety
    const chars = password.split('');
    if (chars.length >= 4) {
      chars[0] = uppercase[crypto.randomInt(0, uppercase.length)];
      chars[1] = lowercase[crypto.randomInt(0, lowercase.length)];
      chars[2] = numbers[crypto.randomInt(0, numbers.length)];
      chars[3] = symbols[crypto.randomInt(0, symbols.length)];
    }
    
    // Shuffle using crypto
    for (let i = chars.length - 1; i > 0; i--) {
      const j = crypto.randomInt(0, i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    
    return chars.join('');
  }

  /**
   * Create candidate without CV (basic registration only)
   */
  private async createCandidateWithoutCV(
    candidateInfo: any,
    hashedPassword: string
  ) {
    console.log('🏗️ Creating user and candidate profile without CV...');

    return await this.applicationRepository.manager.transaction(async (manager) => {
      // Check if user already exists with this email
      let user = await manager.findOne(User, {
        where: { email: candidateInfo.email }
      });

      if (user) {
        console.log('ℹ️ User already exists with email:', candidateInfo.email);
      } else {
        // Create new user
        console.log('🆕 Creating new user with email:', candidateInfo.email);
        user = await manager.save(User, {
          email: candidateInfo.email,
          name: `${candidateInfo.firstName} ${candidateInfo.lastName}`,
          password: hashedPassword,
          userType: UserType.CANDIDATE,
          phone: candidateInfo.phone,
          isActive: true,
        });
      }

      if (!user) {
        throw new Error('Failed to create or find user');
      }

      // Check if candidate profile already exists
      let candidateProfile = await manager.findOne(CandidateProfile, {
        where: { userId: user.id }
      });

      if (!candidateProfile) {
        console.log('🆕 Creating new candidate profile without CV...');
        candidateProfile = await manager.save(CandidateProfile, {
          userId: user.id,
          firstName: candidateInfo.firstName,
          lastName: candidateInfo.lastName,
          phone: candidateInfo.phone,
          linkedinUrl: candidateInfo.linkedin || undefined,
          portfolioUrl: candidateInfo.portfolioUrl || undefined,
          skills: [],
        });
      }

      if (!candidateProfile) {
        throw new Error('Failed to create candidate profile');
      }

      return {
        user,
        candidateProfile
      };
    });
  }

  /**
   * Process and save work experience data from CV analysis
   * Handles both string (summary) and structured array formats
   */
  private async processWorkExperience(
    candidateProfileId: string,
    experienceData: any,
    manager: any
  ): Promise<void> {
    if (!experienceData) return;

    try {
      // If experience is a string, save it to the profile's experience field
      if (typeof experienceData === 'string') {
        await manager.update(CandidateProfile, candidateProfileId, {
          experience: experienceData
        });
        console.log('📝 Saved experience summary to profile');
        return;
      }

      // If it's an array of structured experience objects
      if (Array.isArray(experienceData) && experienceData.length > 0) {
        // Delete existing work experiences for this profile to avoid duplicates
        await manager.delete(WorkExperience, { candidateProfileId });

        // Create new work experience records
        for (const exp of experienceData) {
          if (!exp.company && !exp.position) continue; // Skip invalid entries

          const workExperience = {
            candidateProfileId,
            company: exp.company || exp.organization || 'Not specified',
            position: exp.position || exp.title || exp.role || 'Not specified',
            description: exp.description || exp.responsibilities || null,
            startDate: this.parseDate(exp.startDate || exp.start_date),
            endDate: exp.isCurrent || exp.is_current ? null : this.parseDate(exp.endDate || exp.end_date),
            isCurrent: exp.isCurrent || exp.is_current || false,
          };

          await manager.save(WorkExperience, workExperience);
        }

        // Also save a summary to the experience field
        const experienceSummary = experienceData
          .map(exp => `${exp.position || exp.title} at ${exp.company || exp.organization}`)
          .join('; ');
        
        await manager.update(CandidateProfile, candidateProfileId, {
          experience: experienceSummary
        });

        console.log(`✅ Created ${experienceData.length} work experience records`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Error processing work experience:', errorMessage);
      // Continue execution - don't fail the whole process
    }
  }

  /**
   * Process and save education data from CV analysis
   * Handles both string (summary) and structured array formats
   */
  private async processEducation(
    candidateProfileId: string,
    educationData: any,
    manager: any
  ): Promise<void> {
    if (!educationData) return;

    try {
      // If education is a string, save it to the profile's education field
      if (typeof educationData === 'string') {
        await manager.update(CandidateProfile, candidateProfileId, {
          education: educationData
        });
        console.log('📝 Saved education summary to profile');
        return;
      }

      // If it's an array of structured education objects
      if (Array.isArray(educationData) && educationData.length > 0) {
        // Delete existing education records for this profile to avoid duplicates
        await manager.delete(Education, { candidateProfileId });

        // Create new education records
        for (const edu of educationData) {
          if (!edu.institution && !edu.degree) continue; // Skip invalid entries

          const education = {
            candidateProfileId,
            institution: edu.institution || edu.school || edu.university || 'Not specified',
            degree: edu.degree || edu.qualification || 'Not specified',
            fieldOfStudy: edu.fieldOfStudy || edu.field_of_study || edu.major || null,
            grade: edu.grade || edu.gpa || null,
            description: edu.description || null,
            startDate: this.parseDate(edu.startDate || edu.start_date),
            endDate: this.parseDate(edu.endDate || edu.end_date || edu.graduationDate),
          };

          await manager.save(Education, education);
        }

        // Also save a summary to the education field
        const educationSummary = educationData
          .map(edu => `${edu.degree || edu.qualification} in ${edu.fieldOfStudy || edu.field_of_study || 'General'} from ${edu.institution || edu.school}`)
          .join('; ');
        
        await manager.update(CandidateProfile, candidateProfileId, {
          education: educationSummary
        });

        console.log(`✅ Created ${educationData.length} education records`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Error processing education:', errorMessage);
      // Continue execution - don't fail the whole process
    }
  }

  /**
   * Parse date from various formats (string, Date object, or null)
   * Returns a Date object or null
   */
  private parseDate(dateValue: any): Date | null {
    if (!dateValue) return null;
    
    try {
      // If it's already a Date object
      if (dateValue instanceof Date) {
        return dateValue;
      }
      
      // If it's a string
      if (typeof dateValue === 'string') {
        // Handle "Present", "Current", etc.
        if (['present', 'current', 'now'].includes(dateValue.toLowerCase())) {
          return null;
        }
        
        const parsed = new Date(dateValue);
        return isNaN(parsed.getTime()) ? null : parsed;
      }
      
      return null;
    } catch (error) {
      console.warn('⚠️ Could not parse date:', dateValue);
      return null;
    }
  }

  private async sendLoginCredentialsWhatsApp(
    phone: string,
    _email: string,
    password: string,
    jobTitle: string
  ): Promise<void> {
    try {
      console.log('📱 Sending login credentials via WhatsApp to:', phone);

      // Clean phone number - remove + and any spaces/special chars for WhatsApp
      let cleanPhone = phone.replace(/[\s\-()]/g, '');
      if (cleanPhone.startsWith('+')) {
        cleanPhone = cleanPhone.substring(1);
      }
      
      // If no country code, assume Jordan (+962)
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '962' + cleanPhone.substring(1);
      } else if (!cleanPhone.startsWith('962')) {
        cleanPhone = '962' + cleanPhone;
      }

      console.log('📱 Cleaned phone number:', cleanPhone);

      // Send WhatsApp template message using temppassword template
      // Template has only 1 parameter: the temporary password
      const templateParams = [
        password    // {{1}} - Temporary password
      ];

      // Send via communication service to track the message
      await this.communicationService.create({
        candidateId: undefined,
        companyId: undefined,
        jobId: undefined,
        applicationId: undefined,
        type: CommunicationType.WHATSAPP,
        direction: CommunicationDirection.OUTBOUND,
        content: `Temporary password sent via WhatsApp for ${jobTitle}`,
        phoneNumber: phone,
        templateName: 'temppassword',
        templateParams: templateParams,
      });

      console.log('✅ Login credentials WhatsApp message sent successfully to:', cleanPhone);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Failed to send login credentials WhatsApp:', errorMessage);
      // Don't throw error - WhatsApp failure shouldn't block application creation
    }
  }

  async findAll(filter?: ApplicationFilterInput, pagination?: ApplicationPaginationInput, user?: any): Promise<Application[]> {
    try {
      this.logger.log('Finding all applications with filters and pagination', {
        userId: user?.id,
        userType: user?.userType,
        companyId: user?.companyId,
      });

      const queryBuilder = this.applicationRepository.createQueryBuilder('application')
        .leftJoinAndSelect('application.job', 'job')
        .leftJoinAndSelect('job.company', 'company')
        .leftJoinAndSelect('application.candidate', 'candidate')
        .leftJoinAndSelect('candidate.candidateProfile', 'candidateProfile')
        .leftJoinAndSelect('application.applicationNotes', 'applicationNotes');

      // If user is a BUSINESS user, filter by their company
      if (user && user.userType === UserType.BUSINESS) {
        if (user.companyId) {
          const companyId = user.companyId;
          this.logger.debug(`Filtering applications by companyId: ${companyId}`);
          queryBuilder.andWhere('job.companyId = :companyId', { companyId });
        } else {
          this.logger.warn('BUSINESS user without company - returning no results');
          // BUSINESS user without company - return no results
          queryBuilder.andWhere('1 = 0');
        }
      }

      // If user is a CANDIDATE user, filter by their candidate ID
      if (user && user.userType === UserType.CANDIDATE) {
        const candidateId = user.userId;
        this.logger.debug(`Filtering applications by candidateId: ${candidateId}`);
        queryBuilder.andWhere('application.candidateId = :candidateId', { candidateId });
      }

      // Apply filters
      if (filter) {
        if (filter.status) {
          queryBuilder.andWhere('application.status = :status', { status: filter.status });
        }
        if (filter.jobId) {
          queryBuilder.andWhere('application.jobId = :jobId', { jobId: filter.jobId });
        }
        if (filter.candidateId) {
          queryBuilder.andWhere('application.candidateId = :candidateId', { candidateId: filter.candidateId });
        }
        if (filter.source) {
          queryBuilder.andWhere('application.source = :source', { source: filter.source });
        }
        if (filter.search) {
          queryBuilder.andWhere(
            '(application.coverLetter ILIKE :search OR application.notes ILIKE :search OR candidate.firstName ILIKE :search OR candidate.lastName ILIKE :search OR job.title ILIKE :search)',
            { search: `%${filter.search}%` }
          );
        }
      }

      // Apply pagination and sorting
      if (pagination) {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
        const skip = (page - 1) * limit;

        queryBuilder
          .orderBy(`application.${sortBy}`, sortOrder)
          .skip(skip)
          .take(limit);
      } else {
        queryBuilder.orderBy('application.createdAt', 'DESC');
      }

      const applications = await queryBuilder.getMany();
      this.logger.log(`Found ${applications.length} applications`);
      
      return applications;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to find applications: ${errorMessage}`, errorStack);
      throw new InternalServerErrorException('Failed to retrieve applications');
    }
  }

  async findOne(id: string): Promise<Application | null> {
    try {
      const application = await this.applicationRepository.findOne({
        where: { id },
        relations: ['job', 'job.company', 'candidate', 'applicationNotes'],
      });
      
      if (!application) {
        this.logger.warn(`Application not found: ${id}`);
        return null;
      }
      
      return application;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to find application ${id}: ${errorMessage}`, errorStack);
      throw new InternalServerErrorException('Failed to retrieve application');
    }
  }

  async findByJobId(jobId: string): Promise<Application[]> {
    try {
      this.logger.log(`Finding applications for job: ${jobId}`);
      return await this.applicationRepository.find({
        where: { jobId },
        relations: ['job', 'job.company', 'candidate', 'applicationNotes'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to find applications for job ${jobId}: ${errorMessage}`, errorStack);
      throw new InternalServerErrorException('Failed to retrieve job applications');
    }
  }

  async findByCandidateId(candidateId: string): Promise<Application[]> {
    try {
      this.logger.log(`Finding applications for candidate: ${candidateId}`);
      return await this.applicationRepository.find({
        where: { candidateId },
        relations: ['job', 'job.company', 'candidate', 'applicationNotes'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to find applications for candidate ${candidateId}: ${errorMessage}`, errorStack);
      throw new InternalServerErrorException('Failed to retrieve candidate applications');
    }
  }

  async update(id: string, updateApplicationInput: UpdateApplicationInput, userId?: string): Promise<Application | null> {
    const application = await this.findOne(id);
    if (!application) {
      return null;
    }

    // TODO: Add authorization check - only allow updates by the candidate or authorized personnel

    // Handle status transitions with timestamp updates
    if (updateApplicationInput.status && updateApplicationInput.status !== application.status) {
      await this.validateStatusTransition(application.status, updateApplicationInput.status);

      const now = new Date();
      const statusUpdates: Partial<Application> = { status: updateApplicationInput.status };

      switch (updateApplicationInput.status) {
        case ApplicationStatus.REVIEWED:
          statusUpdates.reviewedAt = now;
          break;
        case ApplicationStatus.INTERVIEWED:
          statusUpdates.interviewedAt = now;
          break;
        case ApplicationStatus.REJECTED:
          statusUpdates.rejectedAt = now;
          break;
        case ApplicationStatus.HIRED:
          statusUpdates.acceptedAt = now;
          break;
      }

      await this.applicationRepository.update(id, { ...updateApplicationInput, ...statusUpdates });

      // Log status change
      if (userId) {
        this.auditService.logApplicationStatusChange(userId, id, application.status, updateApplicationInput.status);
      }

      // Notify candidate about status change
      await this.notifyCandidateAboutStatusChange(application, updateApplicationInput.status);

      // If status changed to INTERVIEWED, create interview room
      if (updateApplicationInput.status === ApplicationStatus.INTERVIEWED) {
        await this.createInterviewRoom(application);
      }
    } else {
      await this.applicationRepository.update(id, updateApplicationInput);

      // Log general update
      if (userId) {
        this.auditService.logApplicationUpdate(userId, id);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string, userId?: string): Promise<boolean> {
    // TODO: Add authorization check - only allow deletion by the candidate or authorized personnel
    const result = await this.applicationRepository.delete(id);

    // Log deletion
    if (userId && (result.affected ?? 0) > 0) {
      this.auditService.logApplicationDeletion(userId, id);
    }

    return (result.affected ?? 0) > 0;
  }

  private async validateStatusTransition(currentStatus: ApplicationStatus, newStatus: ApplicationStatus): Promise<void> {
    // Define valid status transitions
    const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
      [ApplicationStatus.PENDING]: [ApplicationStatus.REVIEWED, ApplicationStatus.ANALYZED, ApplicationStatus.REJECTED],
      [ApplicationStatus.REVIEWED]: [ApplicationStatus.ANALYZED, ApplicationStatus.SHORTLISTED, ApplicationStatus.INTERVIEWED, ApplicationStatus.REJECTED],
      [ApplicationStatus.ANALYZED]: [ApplicationStatus.REVIEWED, ApplicationStatus.SHORTLISTED, ApplicationStatus.INTERVIEWED, ApplicationStatus.REJECTED],
      [ApplicationStatus.SHORTLISTED]: [ApplicationStatus.INTERVIEWED, ApplicationStatus.REJECTED],
      [ApplicationStatus.INTERVIEWED]: [ApplicationStatus.OFFERED, ApplicationStatus.REJECTED],
      [ApplicationStatus.OFFERED]: [ApplicationStatus.HIRED, ApplicationStatus.REJECTED],
      [ApplicationStatus.HIRED]: [], // Final state
      [ApplicationStatus.REJECTED]: [], // Final state
      [ApplicationStatus.WITHDRAWN]: [], // Final state
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }

  /**
   * Update application with CV analysis results from FastAPI service
   */
  async updateApplicationAnalysis(input: any): Promise<Application> {
    try {
      console.log('📊 Updating application analysis for:', input.applicationId);

      // Parse the JSON results
      const cvAnalysisResults = typeof input.cvAnalysisResults === 'string'
        ? JSON.parse(input.cvAnalysisResults)
        : input.cvAnalysisResults;

      // Prepare update data
      const updateData: any = {
        analyzedAt: new Date(),
        recommendationsGeneratedAt: new Date(),
      };

      // Add score fields if provided
      if (input.cvAnalysisScore !== undefined) updateData.cvAnalysisScore = input.cvAnalysisScore;
      if (input.cvScore !== undefined) updateData.cvScore = input.cvScore;
      if (input.firstInterviewScore !== undefined) updateData.firstInterviewScore = input.firstInterviewScore;
      if (input.secondInterviewScore !== undefined) updateData.secondInterviewScore = input.secondInterviewScore;
      if (input.finalScore !== undefined) updateData.finalScore = input.finalScore;

      // Add analysis results and recommendations if provided
      if (cvAnalysisResults !== undefined) updateData.cvAnalysisResults = cvAnalysisResults;
      if (input.aiCvRecommendations !== undefined) updateData.aiCvRecommendations = input.aiCvRecommendations;
      if (input.aiInterviewRecommendations !== undefined) updateData.aiInterviewRecommendations = input.aiInterviewRecommendations;
      if (input.aiSecondInterviewRecommendations !== undefined) updateData.aiSecondInterviewRecommendations = input.aiSecondInterviewRecommendations;
      if (input.aiAnalysis !== undefined) updateData.aiAnalysis = input.aiAnalysis;

      // Update application with analysis results
      await this.applicationRepository.update(input.applicationId, updateData);

      // If FastAPI extracted candidate info from CV, update the candidate profile
      if (input.candidateInfo) {
        console.log('👤 Updating candidate profile with data extracted from CV...');
        
        const application = await this.applicationRepository.findOne({
          where: { id: input.applicationId },
          relations: ['candidate', 'candidate.candidateProfile'],
        });

        if (application?.candidate) {
          const candidateInfo = input.candidateInfo;
          
          // Update User entity if email is placeholder
          if (application.candidate.email?.includes('@placeholder.temp') && candidateInfo.email) {
            await this.userRepository.update(application.candidate.id, {
              email: candidateInfo.email,
              name: candidateInfo.name || `${candidateInfo.firstName} ${candidateInfo.lastName}`,
            });
            console.log('✅ Updated user email from placeholder to:', candidateInfo.email);
          }

          // Create or Update CandidateProfile entity
          if (!application.candidate.candidateProfile) {
            // Create new candidate profile if it doesn't exist
            console.log('🆕 Creating new candidate profile...');
            
            // Combine firstName and lastName into name
            const fullName = [candidateInfo.firstName, candidateInfo.lastName]
              .filter(Boolean)
              .join(' ')
              .trim() || undefined;
            
            const newProfile = this.applicationRepository.manager.getRepository(CandidateProfile).create({
              userId: application.candidate.id,
              name: fullName,
              phone: candidateInfo.phone,
              location: candidateInfo.location,
              bio: candidateInfo.bio,
              skills: candidateInfo.skills || [],
              linkedinUrl: candidateInfo.linkedinUrl,
              githubUrl: candidateInfo.githubUrl,
              portfolioUrl: candidateInfo.portfolioUrl,
            });
            const savedProfile = await this.applicationRepository.manager.getRepository(CandidateProfile).save(newProfile);
            console.log('✅ Created new candidate profile with extracted data');

            // Process work experience and education using transaction manager
            await this.applicationRepository.manager.transaction(async (manager) => {
              if (candidateInfo.experience) {
                await this.processWorkExperience(savedProfile.id, candidateInfo.experience, manager);
              }
              if (candidateInfo.education) {
                await this.processEducation(savedProfile.id, candidateInfo.education, manager);
              }
            });
          } else {
            // Update existing profile
            const profileUpdate: any = {};
            
            if (candidateInfo.firstName) profileUpdate.firstName = candidateInfo.firstName;
            if (candidateInfo.lastName) profileUpdate.lastName = candidateInfo.lastName;
            if (candidateInfo.phone) profileUpdate.phone = candidateInfo.phone;
            if (candidateInfo.location) profileUpdate.location = candidateInfo.location;
            if (candidateInfo.bio) profileUpdate.bio = candidateInfo.bio;
            if (candidateInfo.skills) profileUpdate.skills = candidateInfo.skills;
            if (candidateInfo.linkedinUrl) profileUpdate.linkedinUrl = candidateInfo.linkedinUrl;
            if (candidateInfo.githubUrl) profileUpdate.githubUrl = candidateInfo.githubUrl;
            if (candidateInfo.portfolioUrl) profileUpdate.portfolioUrl = candidateInfo.portfolioUrl;
            
            await this.applicationRepository.manager.getRepository(CandidateProfile).update(
              application.candidate.candidateProfile.id,
              profileUpdate
            );
            
            console.log('✅ Updated candidate profile with extracted data');

            // Process work experience and education using transaction manager
            const profileId = application.candidate.candidateProfile.id;
            await this.applicationRepository.manager.transaction(async (manager) => {
              if (candidateInfo.experience) {
                await this.processWorkExperience(profileId, candidateInfo.experience, manager);
              }
              if (candidateInfo.education) {
                await this.processEducation(profileId, candidateInfo.education, manager);
              }
            });
          }
          
          // Send SMS with real credentials if phone was extracted and it's a real phone number
          if (candidateInfo.phone && candidateInfo.email && !application.candidate.email?.includes('@placeholder.temp')) {
            // Check if this is a real phone number (not a generated placeholder)
            const isRealPhone = !candidateInfo.phone.includes('timestamp') && 
                               candidateInfo.phone.length >= 10 && 
                               /^\+?\d+$/.test(candidateInfo.phone.replace(/\s/g, ''));
            
            if (isRealPhone) {
              console.log('📱 Sending login credentials SMS with real extracted data...');
              // Note: We don't have the original password here, so we'll send a message asking them to reset password
              const resetMessage = `Welcome to Rolevate!

Your CV has been analyzed and your profile updated with the information extracted from your resume.

Your application for "${application.job.title}" is being processed.

To access your account:
🌐 rolevate.com

📧 Email: ${candidateInfo.email}

If you don't remember your password, please use the "Forgot Password" feature on the login page.`;

              await this.smsService.sendSMS({
                phoneNumber: candidateInfo.phone,
                message: resetMessage,
                type: SMSMessageType.GENERAL,
              });
              
              console.log('✅ Login credentials reminder SMS sent to:', candidateInfo.phone);
            }
          }
        }
      }

      console.log('✅ Application analysis updated successfully');

      // Return updated application
      const updatedApplication = await this.applicationRepository.findOne({
        where: { id: input.applicationId },
        relations: ['job', 'job.company', 'candidate', 'candidate.candidateProfile'],
      });

      if (!updatedApplication) {
        throw new Error('Application not found after update');
      }

      return updatedApplication;
    } catch (error) {
      console.error('❌ Failed to update application analysis:', error);
      throw error;
    }
  }

  // Application Notes CRUD
  async createApplicationNote(createNoteInput: CreateApplicationNoteInput, userId?: string): Promise<ApplicationNote> {
    // TODO: Add authorization check - only allow notes by authorized personnel or the candidate
    const note = this.applicationNoteRepository.create(createNoteInput);
    const savedNote = await this.applicationNoteRepository.save(note);

    // Log audit event
    if (userId) {
      this.auditService.logApplicationNoteCreation(userId, savedNote.id, createNoteInput.applicationId);
    }

    return savedNote;
  }

  async findApplicationNotes(applicationId: string): Promise<ApplicationNote[]> {
    return this.applicationNoteRepository.find({
      where: { applicationId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findApplicationNote(id: string): Promise<ApplicationNote | null> {
    return this.applicationNoteRepository.findOne({
      where: { id },
      relations: ['application', 'user'],
    });
  }

  async updateApplicationNote(id: string, updateNoteInput: UpdateApplicationNoteInput, userId?: string): Promise<ApplicationNote | null> {
    // TODO: Add authorization check - only allow updates by the note author or authorized personnel
    await this.applicationNoteRepository.update(id, updateNoteInput);
    const updatedNote = await this.findApplicationNote(id);

    // Log audit event
    if (userId && updatedNote) {
      this.auditService.logApplicationNoteUpdate(userId, id, updatedNote.applicationId);
    }

    return updatedNote;
  }

  async removeApplicationNote(id: string, userId?: string): Promise<boolean> {
    // TODO: Add authorization check - only allow deletion by the note author or authorized personnel
    const note = await this.findApplicationNote(id);
    const result = await this.applicationNoteRepository.delete(id);

    // Log deletion
    if (userId && note && (result.affected ?? 0) > 0) {
      this.auditService.logApplicationNoteDeletion(userId, id, note.applicationId);
    }

    return (result.affected ?? 0) > 0;
  }

  /**
   * Trigger CV analysis by calling FastAPI service
   * The FastAPI service will handle the analysis and post results back via GraphQL
   */
  private async triggerCVAnalysis(
    applicationId: string, 
    candidateId: string,
    jobId: string,
    cvUrl: string
  ): Promise<void> {
    try {
      const fastApiUrl = process.env.CV_ANALYSIS_API_URL || 'http://localhost:8000';
      
      console.log('🚀 Triggering CV analysis for application:', applicationId);
      console.log('👤 Candidate ID:', candidateId);
      console.log('� Job ID:', jobId);
      console.log('� CV URL:', cvUrl);

      const payload = {
        application_id: applicationId,
        candidateid: candidateId,
        jobid: jobId,
        cv_link: cvUrl,
        callbackUrl: process.env.GRAPHQL_API_URL || 'http://localhost:4005/api/graphql',
        systemApiKey: process.env.SYSTEM_API_KEY || '',
      };

      // Fire and forget - FastAPI will analyze and post results back via callback
      const axios = await import('axios');
      axios.default.post(`${fastApiUrl}/cv-analysis`, payload, {
        timeout: 30000, // 30 seconds - CV analysis with OpenAI can take time
        headers: { 'Content-Type': 'application/json' }
      }).catch(err => {
        console.error('❌ Failed to trigger CV analysis:', err.message);
      });

      console.log('✅ CV analysis triggered successfully');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Error triggering CV analysis:', errorMessage);
      // Don't throw - this is a background process, we don't want to fail the application creation
    }
  }

  /**
   * Send interview room link to candidate via WhatsApp
   * Room will be created on-demand when candidate clicks the link
   */
  private async sendInterviewLinkToCandidate(application: Application): Promise<void> {
    try {
      console.log('📱 Sending interview room link to candidate...');

      // Get full application with relations including candidate profile for phone number
      const fullApplication = await this.applicationRepository.findOne({
        where: { id: application.id },
        relations: ['job', 'candidate', 'candidate.candidateProfile'],
      });

      if (!fullApplication) {
        throw new Error('Application not found');
      }

      // Get phone from candidate profile or User entity
      const candidatePhone = fullApplication.candidate.candidateProfile?.phone || fullApplication.candidate.phone;
      
      if (!candidatePhone) {
        console.log('⚠️ No phone number available for candidate, skipping WhatsApp notification');
        return;
      }

      console.log('📱 Sending WhatsApp interview link to candidate...');

      const candidateName = fullApplication.candidate.name || 'Candidate';

      // Create query parameters for the interview room link
      // Room will be created on-demand when user accesses this link
      // Only include applicationId - the backend can get all other info from it
      const queryParams = `?applicationId=${encodeURIComponent(application.id)}`;

      const templateParams = [
        candidateName,  // Body parameter: candidate name
        queryParams     // Button URL parameter: query string for room URL
      ];

      // Send WhatsApp template message using communication service
      await this.communicationService.create({
        candidateId: fullApplication.candidateId,
        companyId: fullApplication.job.companyId,
        jobId: fullApplication.jobId,
        applicationId: application.id,
        type: CommunicationType.WHATSAPP,
        direction: CommunicationDirection.OUTBOUND,
        content: `Interview link sent to ${candidateName} for ${fullApplication.job.title}`,
        phoneNumber: candidatePhone,
        templateName: 'cv_received_notification',
        templateParams: templateParams,
      });

      console.log('✅ WhatsApp interview link sent to:', candidatePhone);
      console.log('📋 Link params:', { candidateName, queryParams });

      // Update application with notification info
      await this.applicationRepository.update(application.id, {
        companyNotes: `Interview link sent via WhatsApp. Room will be created when candidate joins.`,
      });

      console.log('🎬 Interview link notification completed successfully!');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Failed to send interview link:', error);

      // Log the error but don't fail the application creation
      await this.applicationRepository.update(application.id, {
        companyNotes: `Error sending interview link: ${errorMessage}`,
      });
    }
  }

  private async notifyCompanyAboutNewApplication(application: Application): Promise<void> {
    try {
      console.log('📢 Notifying company about new application...');

      // Get full application with job and company details
      const fullApplication = await this.applicationRepository.findOne({
        where: { id: application.id },
        relations: ['job', 'candidate'],
      });

      if (!fullApplication || !fullApplication.job?.companyId) {
        console.log('⚠️ No company associated with this job, skipping company notification');
        return;
      }

      // Get company users (business users)
      const companyUsers = await this.userRepository.find({
        where: {
          companyId: fullApplication.job.companyId,
          userType: UserType.BUSINESS,
          isActive: true,
        },
      });

      if (companyUsers.length === 0) {
        console.log('⚠️ No active business users found for company, skipping notification');
        return;
      }

      // Get candidate name for notification
      const candidateName = fullApplication.candidate.name || 'Unknown Candidate';

      // Create notification for each company user
      const notificationPromises = companyUsers.map(user =>
        this.notificationService.createJobNotification(
          user.id,
          'New Job Application Received',
          `A new application has been received for "${fullApplication.job.title}" from ${candidateName}.`,
          fullApplication.jobId
        )
      );

      await Promise.all(notificationPromises);

      console.log(`✅ Notified ${companyUsers.length} company user(s) about new application`);

    } catch (error) {
      console.error('❌ Failed to notify company about new application:', error);
      // Don't fail the application creation if notification fails
    }
  }

  private async notifyCandidateAboutStatusChange(application: Application, newStatus: ApplicationStatus): Promise<void> {
    try {
      console.log('📢 Notifying candidate about status change...');

      // Get full application with relations
      const fullApplication = await this.applicationRepository.findOne({
        where: { id: application.id },
        relations: ['job', 'candidate'],
      });

      if (!fullApplication) {
        console.log('⚠️ Application not found, skipping candidate notification');
        return;
      }

      let notificationTitle = '';
      let notificationMessage = '';

      // Customize notification based on status
      switch (newStatus) {
        case ApplicationStatus.REVIEWED:
          notificationTitle = 'Application Under Review';
          notificationMessage = `Your application for "${fullApplication.job.title}" is now under review. We'll get back to you soon!`;
          break;
        case ApplicationStatus.SHORTLISTED:
          notificationTitle = 'Congratulations! You\'re Shortlisted';
          notificationMessage = `Great news! You've been shortlisted for "${fullApplication.job.title}". We'll be in touch soon with next steps.`;
          break;
        case ApplicationStatus.INTERVIEWED:
          notificationTitle = 'Interview Scheduled';
          notificationMessage = `Your interview for "${fullApplication.job.title}" has been scheduled. Check your WhatsApp for the interview link.`;
          break;
        case ApplicationStatus.OFFERED:
          notificationTitle = 'Job Offer Received';
          notificationMessage = `Congratulations! You've received a job offer for "${fullApplication.job.title}". Please check your email for details.`;
          break;
        case ApplicationStatus.HIRED:
          notificationTitle = 'Welcome Aboard!';
          notificationMessage = `Congratulations! You've been hired for "${fullApplication.job.title}". Welcome to the team!`;
          break;
        case ApplicationStatus.REJECTED:
          notificationTitle = 'Application Update';
          notificationMessage = `Thank you for your interest in "${fullApplication.job.title}". Unfortunately, we won't be moving forward with your application at this time.`;
          break;
        default:
          notificationTitle = 'Application Status Updated';
          notificationMessage = `Your application status for "${fullApplication.job.title}" has been updated to ${newStatus}.`;
      }

      // Create notification for the candidate
      await this.notificationService.createJobNotification(
        fullApplication.candidateId,
        notificationTitle,
        notificationMessage,
        fullApplication.jobId
      );

      console.log(`✅ Notified candidate about status change to ${newStatus}`);

    } catch (error) {
      console.error('❌ Failed to notify candidate about status change:', error);
      // Don't fail the status update if notification fails
    }
  }

  private async createInterviewRoom(application: Application): Promise<void> {
    try {
      console.log('🎥 Creating interview room for scheduled interview...');

      // Get full application with relations
      const fullApplication = await this.applicationRepository.findOne({
        where: { id: application.id },
        relations: ['job', 'candidate'],
      });

      if (!fullApplication) {
        throw new Error('Application not found');
      }

      // Create unique room name for interview
      const roomName = `interview_${application.id}_${Date.now()}`;

      // Prepare metadata for interview room
      const metadata = {
        applicationId: application.id,
        candidateId: fullApplication.candidateId,
        candidatePhone: fullApplication.candidate.phone,
        jobId: fullApplication.jobId,
        jobTitle: fullApplication.job.title,
        companyId: fullApplication.job.companyId,
        interviewLanguage: 'english',
        createdAt: new Date().toISOString(),
        type: 'scheduled_interview',
        status: 'scheduled'
      };

      // Get candidate name for participant
      const participantName = fullApplication.candidate.name || 'Unknown Candidate';

      // Create room with token for candidate
      const { room } = await this.liveKitService.createRoomWithToken(
        roomName,
        metadata,
        'system',
        participantName
      );

      console.log('✅ Interview room created:', {
        roomId: room.id,
        roomName: room.roomName,
      });

      // Send WhatsApp notification about scheduled interview
      const candidatePhone = fullApplication.candidate.phone;
      if (candidatePhone) {
        console.log('📱 Sending WhatsApp interview notification...');

        const candidateName = fullApplication.candidate.name || 'Unknown Candidate';

        // Clean phone number
        const cleanPhone = candidatePhone.replace(/[+\s\-()]/g, '');

        // Create query parameters for the interview room
        const queryParams = `?phone=${cleanPhone}&jobId=${encodeURIComponent(fullApplication.jobId)}&roomName=${encodeURIComponent(room.roomName)}&type=interview`;

        const templateParams = [
          candidateName,
          fullApplication.job.title,
          queryParams
        ];

        // Send WhatsApp template message for interview scheduling
        await this.communicationService.create({
          candidateId: fullApplication.candidateId,
          companyId: fullApplication.job.companyId,
          jobId: fullApplication.jobId,
          applicationId: application.id,
          type: CommunicationType.WHATSAPP,
          direction: CommunicationDirection.OUTBOUND,
          content: `Interview scheduled for ${candidateName} for ${fullApplication.job.title}`,
          phoneNumber: candidatePhone,
          templateName: 'interview_scheduled',
          templateParams: templateParams,
        });

        console.log('✅ WhatsApp interview notification sent');
      }

      // Update application with interview room information
      await this.applicationRepository.update(application.id, {
        companyNotes: `Interview room created: ${room.roomName}. Interview link sent via WhatsApp.`,
        interviewScheduled: true,
        interviewScheduledAt: new Date(),
      });

      console.log('🎬 Interview room setup completed successfully!');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Failed to create interview room:', error);

      // Log the error but don't fail the status update
      await this.applicationRepository.update(application.id, {
        companyNotes: `Error creating interview room: ${errorMessage}`,
      });
    }
  }
}