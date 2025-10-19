import { Injectable } from '@nestjs/common';
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
import { NotificationType, NotificationCategory } from '../notification/notification.entity';
import { SMSService } from '../services/sms.service';
import { SMSMessageType } from '../services/sms.input';
import { Job } from '../job/job.entity';
import { User, UserType } from '../user/user.entity';
import { CandidateProfile } from '../candidate/candidate-profile.entity';
import { WorkExperience } from '../candidate/work-experience.entity';
import { Education } from '../candidate/education.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(ApplicationNote)
    private applicationNoteRepository: Repository<ApplicationNote>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CandidateProfile)
    private candidateProfileRepository: Repository<CandidateProfile>,
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

    // Create LiveKit room and send WhatsApp invitation
    this.createLiveKitRoomAndNotifyCandidate(savedApplication);

    return savedApplication;
  }

  async createAnonymousApplication(
    createApplicationInput: CreateApplicationInput
  ): Promise<ApplicationResponse> {
    console.log('🔄 Processing anonymous application...');

    // Validate that resumeUrl is provided for anonymous applications
    if (!createApplicationInput.resumeUrl) {
      throw new Error('Resume URL is required for anonymous applications');
    }

    // Get job details to verify it exists and is active
    const job = await this.applicationRepository.manager.findOne(Job, {
      where: { id: createApplicationInput.jobId },
      relations: ['company'],
    });

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status !== 'ACTIVE') {
      throw new Error('Job is not accepting applications');
    }

    if (new Date() > job.deadline) {
      throw new Error('Job application deadline has passed');
    }

    // Generate anonymous candidate info - FastAPI will extract real data later
    console.log('🆕 Creating anonymous candidate with placeholder data...');
    const timestamp = Date.now();
    const anonymousId = `anonymous-${timestamp}`;
    
    const candidateInfo = {
      firstName: createApplicationInput.firstName || 'Anonymous',
      lastName: createApplicationInput.lastName || anonymousId,
      email: createApplicationInput.email || `${anonymousId}@placeholder.temp`,
      phone: createApplicationInput.phone || null,
      linkedin: createApplicationInput.linkedin || null,
      portfolioUrl: createApplicationInput.portfolioUrl,
    };

    // Always create new anonymous candidate - FastAPI will update with real data later
    console.log('🆕 Creating new anonymous candidate account...');

    // Generate random password
    const randomPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create user and candidate profile with placeholder data
    const result = await this.createCandidateFromCV(candidateInfo, hashedPassword, createApplicationInput.resumeUrl);
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
    console.log('📧 Placeholder email:', candidateInfo.email);
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

    // Create LiveKit room and send WhatsApp invitation
    this.createLiveKitRoomAndNotifyCandidate(savedApplication);

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
    console.log('🏗️ Creating user and candidate profile from CV data...');

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
        console.log('ℹ️ Candidate profile already exists, updating it...');
        // Update existing profile
        await manager.update(CandidateProfile, { userId: user.id }, {
          firstName: candidateInfo.firstName,
          lastName: candidateInfo.lastName,
          phone: candidateInfo.phone,
          location: candidateInfo.location,
          skills: candidateInfo.skills || [],
          linkedinUrl: candidateInfo.linkedin || candidateInfo.linkedinUrl,
          githubUrl: candidateInfo.githubUrl,
          portfolioUrl: candidateInfo.portfolioUrl,
          resumeUrl: resumeUrl,
          bio: candidateInfo.summary || candidateInfo.bio,
        });
        // Reload to get updated profile
        candidateProfile = await manager.findOne(CandidateProfile, {
          where: { userId: user.id }
        });
      } else {
        // Create new candidate profile
        console.log('🆕 Creating new candidate profile for user:', user.id);
        candidateProfile = await manager.save(CandidateProfile, {
          userId: user.id,
          firstName: candidateInfo.firstName,
          lastName: candidateInfo.lastName,
          phone: candidateInfo.phone,
          location: candidateInfo.location,
          skills: candidateInfo.skills || [],
          linkedinUrl: candidateInfo.linkedin || candidateInfo.linkedinUrl,
          githubUrl: candidateInfo.githubUrl,
          portfolioUrl: candidateInfo.portfolioUrl,
          resumeUrl: resumeUrl,
          bio: candidateInfo.summary || candidateInfo.bio,
        });
      }

      if (!candidateProfile) {
        throw new Error('Failed to create or find candidate profile');
      }

      // Process work experience (handles both string and structured array formats)
      if (candidateInfo.experience) {
        await this.processWorkExperience(candidateProfile.id, candidateInfo.experience, manager);
      }

      // Process education (handles both string and structured array formats)
      if (candidateInfo.education) {
        await this.processEducation(candidateProfile.id, candidateInfo.education, manager);
      }

      return {
        user,
        candidateProfile
      };
    });
  }

  private generateRandomPassword(): string {
    const length = 6;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let password = '';

    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
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
      console.error('❌ Error processing work experience:', error.message);
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
      console.error('❌ Error processing education:', error.message);
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

  private async sendLoginCredentialsSMS(
    phone: string,
    email: string,
    password: string,
    jobTitle: string
  ): Promise<void> {
    try {
      console.log('📱 Sending login credentials SMS to:', phone);

      // Clean phone number - ensure it has country code
      let cleanPhone = phone.replace(/[\s\-()]/g, '');
      if (!cleanPhone.startsWith('+')) {
        // If no country code, assume Jordan (+962)
        if (cleanPhone.startsWith('0')) {
          cleanPhone = '+962' + cleanPhone.substring(1);
        } else if (cleanPhone.startsWith('962')) {
          cleanPhone = '+' + cleanPhone;
        } else {
          cleanPhone = '+962' + cleanPhone;
        }
      }

      // Create SMS message
      const message = `Welcome to Rolevate!

Your application for "${jobTitle}" has been submitted successfully.

Track your application:
🌐 rolevate.com

Login Details:
📧 Email: ${email}
🔑 Password: ${password}

Please change your password after first login.`;

      // Send SMS
      await this.smsService.sendSMS({
        phoneNumber: cleanPhone,
        message: message,
        type: SMSMessageType.GENERAL,
      });

      console.log('✅ Login credentials SMS sent successfully to:', cleanPhone);

    } catch (error) {
      console.error('❌ Failed to send login credentials SMS:', error.message);
      // Don't throw error - SMS failure shouldn't block application creation
    }
  }

  async findAll(filter?: ApplicationFilterInput, pagination?: ApplicationPaginationInput, user?: any): Promise<Application[]> {
    console.log('🔍 DEBUG - findAll called with user:', {
      userId: user?.id,
      userType: user?.userType,
      companyId: user?.companyId,
      companyIdType: typeof user?.companyId
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
        console.log('🔍 DEBUG - Filtering by companyId:', companyId);
        queryBuilder.andWhere('job.companyId = :companyId', { companyId });
      } else {
        console.log('⚠️ DEBUG - BUSINESS user without company');
        // BUSINESS user without company - return no results
        queryBuilder.andWhere('1 = 0');
      }
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

    // Log the generated SQL for debugging
    const sql = queryBuilder.getSql();
    console.log('🔍 DEBUG - Generated SQL:', sql);
    console.log('🔍 DEBUG - Query parameters:', queryBuilder.getParameters());

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Application | null> {
    return this.applicationRepository.findOne({
      where: { id },
      relations: ['job', 'job.company', 'candidate', 'applicationNotes'],
    });
  }

  async findByJobId(jobId: string): Promise<Application[]> {
    return this.applicationRepository.find({
      where: { jobId },
      relations: ['job', 'job.company', 'candidate', 'applicationNotes'],
    });
  }

  async findByCandidateId(candidateId: string): Promise<Application[]> {
    return this.applicationRepository.find({
      where: { candidateId },
      relations: ['job', 'job.company', 'candidate', 'applicationNotes'],
    });
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
            const newProfile = this.applicationRepository.manager.getRepository(CandidateProfile).create({
              userId: application.candidate.id,
              firstName: candidateInfo.firstName,
              lastName: candidateInfo.lastName,
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
          
          // Send SMS with real credentials if phone was extracted
          if (candidateInfo.phone && candidateInfo.email && !application.candidate.email?.includes('@placeholder.temp')) {
            // Get the password from candidateCredentials if stored, or generate new instructions
            console.log('📱 Candidate has real contact info, consider sending login credentials');
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

  private async analyzeCVInBackground(applicationId: string, resumeUrl: string, analysisPrompt: string, job: any): Promise<void> {
    // This method is deprecated and replaced by triggerCVAnalysis
    // Kept for backward compatibility during migration
    console.warn('⚠️ analyzeCVInBackground is deprecated. Use triggerCVAnalysis instead.');
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
      console.error('❌ Error triggering CV analysis:', error.message);
      // Don't throw - this is a background process, we don't want to fail the application creation
    }
  }

  private async generateCVRecommendations(analysisResult: any, job: any): Promise<string> {
    // This method is deprecated and will be handled by FastAPI service
    console.warn('⚠️ generateCVRecommendations is deprecated. Handled by CV analysis service.');
    return '';
  }

  private async generateInterviewRecommendations(analysisResult: any, job: any): Promise<string> {
    // This method is deprecated and will be handled by FastAPI service
    console.warn('⚠️ generateInterviewRecommendations is deprecated. Handled by CV analysis service.');
    return '';
  }

  private async createLiveKitRoomAndNotifyCandidate(application: Application): Promise<void> {
    try {
      console.log('🎥 Creating LiveKit room for interview...');

      // Get full application with relations including candidate profile for phone number
      const fullApplication = await this.applicationRepository.findOne({
        where: { id: application.id },
        relations: ['job', 'candidate', 'candidate.candidateProfile'],
      });

      if (!fullApplication) {
        throw new Error('Application not found');
      }

      // Create unique room name
      const roomName = `interview_${application.id}_${Date.now()}`;

      // Prepare metadata
      const metadata = {
        applicationId: application.id,
        candidateId: fullApplication.candidateId,
        candidatePhone: fullApplication.candidate.phone,
        jobId: fullApplication.jobId,
        jobTitle: fullApplication.job.title,
        companyId: fullApplication.job.companyId,
        interviewLanguage: fullApplication.job.interviewLanguage || 'english',
        createdAt: new Date().toISOString(),
        type: 'interview'
      };

      // Create room with token for candidate
      const participantName = fullApplication.candidate.name || 'Unknown Candidate';
      const { room } = await this.liveKitService.createRoomWithToken(
        roomName,
        metadata,
        'system', // Created by system
        participantName
      );

      console.log('✅ LiveKit room created:', {
        roomId: room.id,
        roomName: room.name,
      });

      // Send WhatsApp template message to candidate
      // Get phone from candidate profile
      const candidatePhone = fullApplication.candidate.candidateProfile?.phone;
      if (candidatePhone) {
        console.log('📱 Sending WhatsApp template invitation to candidate...');

        // Use cv_received_notification template
        // Template parameters:
        // - Body {{1}}: Candidate name
        // - Button URL {{1}}: Query parameters for https://rolevate.com/room{{1}}
        const candidateName = fullApplication.candidate.name || 'Unknown Candidate';

        // Clean phone number (remove + and any spaces/special chars)
        const cleanPhone = candidatePhone.replace(/[+\s\-()]/g, '');

        // Create query parameters for the interview room
        const queryParams = `?phone=${cleanPhone}&jobId=${encodeURIComponent(fullApplication.jobId)}&roomName=${encodeURIComponent(room.name)}`;

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
          content: `Interview invitation sent to ${candidateName} for ${fullApplication.job.title}`,
          phoneNumber: candidatePhone,
          templateName: 'cv_received_notification',
          templateParams: templateParams,
        });

        console.log('✅ WhatsApp template invitation sent to:', candidatePhone);
        console.log('📋 Template params:', { candidateName, queryParams });
      } else {
        console.log('⚠️ No phone number available for candidate, skipping WhatsApp notification');
      }

      // Update application with room information
      await this.applicationRepository.update(application.id, {
        companyNotes: `LiveKit room created: ${room.name}. Interview link sent via WhatsApp.`,
      });

      console.log('🎬 Interview setup completed successfully!');

    } catch (error) {
      console.error('❌ Failed to create LiveKit room or send notification:', error);

      // Log the error but don't fail the application creation
      await this.applicationRepository.update(application.id, {
        companyNotes: `Error creating interview room: ${error.message}`,
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

      // Get candidate name for notification
      const candidateName = fullApplication.candidate.name || 'Unknown Candidate';

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
        roomName: room.name,
      });

      // Send WhatsApp notification about scheduled interview
      const candidatePhone = fullApplication.candidate.phone;
      if (candidatePhone) {
        console.log('📱 Sending WhatsApp interview notification...');

        const candidateName = fullApplication.candidate.name || 'Unknown Candidate';

        // Clean phone number
        const cleanPhone = candidatePhone.replace(/[+\s\-()]/g, '');

        // Create query parameters for the interview room
        const queryParams = `?phone=${cleanPhone}&jobId=${encodeURIComponent(fullApplication.jobId)}&roomName=${encodeURIComponent(room.name)}&type=interview`;

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
        companyNotes: `Interview room created: ${room.name}. Interview link sent via WhatsApp.`,
        interviewScheduled: true,
        interviewScheduledAt: new Date(),
      });

      console.log('🎬 Interview room setup completed successfully!');

    } catch (error) {
      console.error('❌ Failed to create interview room:', error);

      // Log the error but don't fail the status update
      await this.applicationRepository.update(application.id, {
        companyNotes: `Error creating interview room: ${error.message}`,
      });
    }
  }
}