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
import { AuditService } from '../audit.service';
import { LiveKitService } from '../livekit/livekit.service';
import { CommunicationService } from '../communication/communication.service';
import { NotificationService } from '../notification/notification.service';
import { CommunicationType, CommunicationDirection } from '../communication/communication.entity';
import { NotificationType, NotificationCategory } from '../notification/notification.entity';
import { OpenaiCvAnalysisService } from '../services/openai-cv-analysis.service';
import { CvParsingService } from '../services/cv-parsing.service';
import { Job } from '../job/job.entity';
import { User, UserType } from '../user/user.entity';
import { CandidateProfile } from '../candidate/candidate-profile.entity';
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
    private openaiCvAnalysisService: OpenaiCvAnalysisService,
    private cvParsingService: CvParsingService,
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

    // Get full job details for CV analysis
    const job = await this.applicationRepository.manager.findOne(Job, {
      where: { id: createApplicationInput.jobId },
      relations: ['company'],
    });

    // Trigger background CV analysis if resume and prompt are available
    if (savedApplication.resumeUrl && job?.cvAnalysisPrompt) {
      this.analyzeCVInBackground(savedApplication.id, savedApplication.resumeUrl, job.cvAnalysisPrompt, job);
    }

    // Create LiveKit room and send WhatsApp invitation
    this.createLiveKitRoomAndNotifyCandidate(savedApplication);

    return savedApplication;
  }

  async createAnonymousApplication(
    createApplicationInput: CreateApplicationInput
  ): Promise<Application & { candidateCredentials?: { email: string; password: string } }> {
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

    // Extract candidate information from CV and merge with manual input
    console.log('📄 Extracting candidate information from CV...');
    const cvCandidateInfo = await this.cvParsingService.extractCandidateInfoFromCV(createApplicationInput.resumeUrl);

    // Merge manual input with CV-extracted data (manual input takes priority)
    const candidateInfo = {
      ...cvCandidateInfo,
      firstName: createApplicationInput.firstName || cvCandidateInfo.firstName,
      lastName: createApplicationInput.lastName || cvCandidateInfo.lastName,
      email: createApplicationInput.email || cvCandidateInfo.email,
      phone: createApplicationInput.phone || cvCandidateInfo.phone,
      portfolioUrl: createApplicationInput.portfolioUrl,
    };

    // Validate required fields
    if (!candidateInfo.email) {
      throw new Error('Email is required (either provide manually or include in CV)');
    }
    if (!candidateInfo.firstName) {
      throw new Error('First name is required (either provide manually or include in CV)');
    }

    // Check if user already exists with this email
    const existingUser = await this.userRepository.findOne({
      where: { email: candidateInfo.email },
      relations: ['candidateProfile'],
    });

    let candidateId: string;
    let candidateCredentials: { email: string; password: string } | undefined;

    if (existingUser) {
      console.log('👤 Found existing user with email:', candidateInfo.email);

      if (!existingUser.candidateProfile) {
        throw new Error('User exists but is not a candidate');
      }

      candidateId = existingUser.candidateProfile.id;

      // Check if already applied
      const existingApplication = await this.applicationRepository.findOne({
        where: {
          jobId: createApplicationInput.jobId,
          candidateId: candidateId,
        },
      });

      if (existingApplication) {
        throw new Error('This candidate has already applied for this job');
      }
    } else {
      console.log('🆕 Creating new candidate account...');

      // Generate random password
      const randomPassword = this.generateRandomPassword();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // Create user and candidate profile
      const result = await this.createCandidateFromCV(candidateInfo, hashedPassword, createApplicationInput.resumeUrl);
      candidateId = result.candidateProfile.id;

      candidateCredentials = {
        email: candidateInfo.email,
        password: randomPassword
      };

      console.log('✅ Created new candidate account for:', candidateInfo.email);
    }

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

    // Trigger AI CV analysis in the background
    if (createApplicationInput.resumeUrl && job.cvAnalysisPrompt) {
      this.analyzeCVInBackground(savedApplication.id, createApplicationInput.resumeUrl, job.cvAnalysisPrompt, job);
    }

    // Create LiveKit room and send WhatsApp invitation
    this.createLiveKitRoomAndNotifyCandidate(savedApplication);

    // Notify company users about new application
    await this.notifyCompanyAboutNewApplication(savedApplication);

    // Include credentials for new accounts
    if (candidateCredentials) {
      return {
        ...savedApplication,
        candidateCredentials
      };
    }

    return savedApplication;
  }

  private async createCandidateFromCV(
    candidateInfo: any,
    hashedPassword: string,
    resumeUrl: string
  ) {
    console.log('🏗️ Creating user and candidate profile from CV data...');

    return await this.applicationRepository.manager.transaction(async (manager) => {
      // Create user
      const user = await manager.save(User, {
        email: candidateInfo.email,
        name: `${candidateInfo.firstName} ${candidateInfo.lastName}`,
        password: hashedPassword,
        userType: UserType.CANDIDATE,
        isActive: true,
      });

      // Create candidate profile
      const candidateProfile = await manager.save(CandidateProfile, {
        userId: user.id,
        firstName: candidateInfo.firstName,
        lastName: candidateInfo.lastName,
        email: candidateInfo.email,
        phone: candidateInfo.phone,
        currentJobTitle: candidateInfo.currentJobTitle,
        currentCompany: candidateInfo.currentCompany,
        totalExperience: candidateInfo.totalExperience,
        skills: candidateInfo.skills || [],
        resumeUrl: resumeUrl,
        profileSummary: candidateInfo.summary,
        isOpenToWork: true,
        isProfilePublic: true,
      });

      return {
        user,
        candidateProfile
      };
    });
  }

  private generateRandomPassword(): string {
    const length = 12;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  }

  async findAll(filter?: ApplicationFilterInput, pagination?: ApplicationPaginationInput): Promise<Application[]> {
    const queryBuilder = this.applicationRepository.createQueryBuilder('application')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('application.candidate', 'candidate')
      .leftJoinAndSelect('application.candidateProfile', 'candidateProfile')
      .leftJoinAndSelect('application.applicationNotes', 'applicationNotes');

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

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Application | null> {
    return this.applicationRepository.findOne({
      where: { id },
      relations: ['job', 'candidate', 'candidateProfile', 'applicationNotes'],
    });
  }

  async findByJobId(jobId: string): Promise<Application[]> {
    return this.applicationRepository.find({
      where: { jobId },
      relations: ['job', 'candidate', 'candidateProfile', 'applicationNotes'],
    });
  }

  async findByCandidateId(candidateId: string): Promise<Application[]> {
    return this.applicationRepository.find({
      where: { candidateId },
      relations: ['job', 'candidate', 'candidateProfile', 'applicationNotes'],
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
      [ApplicationStatus.PENDING]: [ApplicationStatus.REVIEWED, ApplicationStatus.REJECTED],
      [ApplicationStatus.REVIEWED]: [ApplicationStatus.SHORTLISTED, ApplicationStatus.INTERVIEWED, ApplicationStatus.REJECTED],
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
    try {
      console.log('🔍 Starting background CV analysis for application:', applicationId);

      // Run analysis in background (non-blocking)
      setTimeout(async () => {
        try {
          console.log('🤖 Performing AI CV analysis...');
          const analysisResult = await this.openaiCvAnalysisService.analyzeCVWithOpenAI(resumeUrl, analysisPrompt, job);

          // Generate AI recommendations based on the analysis
          const cvRecommendations = await this.generateCVRecommendations(analysisResult, job);
          const interviewRecommendations = await this.generateInterviewRecommendations(analysisResult, job);

          // Update application with analysis results
          await this.applicationRepository.update(applicationId, {
            cvAnalysisScore: analysisResult.score,
            cvAnalysisResults: analysisResult as any, // Cast to any for JSON field
            analyzedAt: new Date(),
            aiCvRecommendations: cvRecommendations,
            aiInterviewRecommendations: interviewRecommendations,
            recommendationsGeneratedAt: new Date(),
          });

          console.log('✅ CV analysis completed for application:', applicationId, 'Score:', analysisResult.score);

        } catch (error) {
          console.error('❌ Background CV analysis failed for application:', applicationId, error);
        }
      }, 1000); // Small delay to ensure application is saved

    } catch (error) {
      console.error('❌ Failed to start background CV analysis:', error);
    }
  }

  private async generateCVRecommendations(analysisResult: any, job: any): Promise<string> {
    try {
      const prompt = `Based on the CV analysis results for a ${job.title} position, provide specific recommendations for CV improvement.

CV Analysis Results:
- Score: ${analysisResult.score}/100
- Overall Fit: ${analysisResult.overallFit}
- Strengths: ${analysisResult.strengths?.join(', ') || 'N/A'}
- Weaknesses: ${analysisResult.weaknesses?.join(', ') || 'N/A'}
- Missing Skills: ${analysisResult.skillsMatch?.missing?.join(', ') || 'N/A'}

Job Requirements:
- Title: ${job.title}
- Skills: ${job.skills?.join(', ') || 'Not specified'}
- Experience: ${job.experience || 'Not specified'}
- Education: ${job.education || 'Not specified'}

Please provide specific, actionable recommendations to improve the CV for this position. Focus on:
1. Skills to highlight or add
2. Experience sections to enhance
3. Keywords to include
4. Format improvements
5. Specific achievements to emphasize

Format as clear, numbered recommendations.`;

      return await this.openaiCvAnalysisService.generateRecommendations(prompt);
    } catch (error) {
      console.error('Failed to generate CV recommendations:', error);
      return 'Unable to generate CV recommendations at this time. Please consult with your career advisor for personalized guidance.';
    }
  }

  private async generateInterviewRecommendations(analysisResult: any, job: any): Promise<string> {
    try {
      const prompt = `Based on the CV analysis results, generate specific interview preparation recommendations for a ${job.title} position.

CV Analysis Results:
- Score: ${analysisResult.score}/100
- Overall Fit: ${analysisResult.overallFit}
- Strengths: ${analysisResult.strengths?.join(', ') || 'N/A'}
- Weaknesses: ${analysisResult.weaknesses?.join(', ') || 'N/A'}
- Skills Match: ${analysisResult.skillsMatch?.matched?.join(', ') || 'N/A'}
- Missing Skills: ${analysisResult.skillsMatch?.missing?.join(', ') || 'N/A'}

Job Requirements:
- Title: ${job.title}
- Skills: ${job.skills?.join(', ') || 'Not specified'}
- Experience: ${job.experience || 'Not specified'}
- Education: ${job.education || 'Not specified'}

Please provide specific interview preparation recommendations including:
1. Key questions to prepare for based on the job requirements
2. How to address any skill gaps identified in the analysis
3. Stories/examples to prepare from their experience
4. Technical concepts they should review
5. Questions to ask the interviewer about the role/company

Format as clear, actionable recommendations for interview success.`;

      return await this.openaiCvAnalysisService.generateRecommendations(prompt);
    } catch (error) {
      console.error('Failed to generate interview recommendations:', error);
      return 'Unable to generate interview recommendations at this time. Please prepare by reviewing the job description and practicing common interview questions for this role.';
    }
  }

  private async createLiveKitRoomAndNotifyCandidate(application: Application): Promise<void> {
    try {
      console.log('🎥 Creating LiveKit room for interview...');

      // Get full application with relations
      const fullApplication = await this.applicationRepository.findOne({
        where: { id: application.id },
        relations: ['job', 'candidate', 'candidateProfile'],
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
        candidatePhone: fullApplication.candidateProfile?.phone || fullApplication.candidate.phone,
        jobId: fullApplication.jobId,
        jobTitle: fullApplication.job.title,
        companyId: fullApplication.job.companyId,
        interviewLanguage: 'english', // Default to English
        createdAt: new Date().toISOString(),
        type: 'interview'
      };

      // Create room with token for candidate
      const candidateProfile = fullApplication.candidateProfile;
      const participantName = candidateProfile 
        ? `${candidateProfile.firstName || 'Unknown'} ${candidateProfile.lastName || 'Candidate'}`.trim()
        : `${fullApplication.candidate.name || 'Unknown Candidate'}`;
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
      const candidatePhone = fullApplication.candidateProfile?.phone || fullApplication.candidate.phone;
      if (candidatePhone) {
        console.log('📱 Sending WhatsApp template invitation to candidate...');

        // Use cv_received_notification template
        // Template parameters:
        // - Body {{1}}: Candidate name
        // - Button URL {{1}}: Query parameters for https://rolevate.com/room{{1}}
        const candidateName = candidateProfile 
          ? `${candidateProfile.firstName || 'Unknown'} ${candidateProfile.lastName || 'Candidate'}`.trim()
          : `${fullApplication.candidate.name || 'Unknown Candidate'}`;

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
        relations: ['job', 'candidate', 'candidateProfile'],
      });

      if (!fullApplication || !fullApplication.job.companyId) {
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
      const candidateProfile = fullApplication.candidateProfile;
      const candidateName = candidateProfile
        ? `${candidateProfile.firstName || 'Unknown'} ${candidateProfile.lastName || 'Candidate'}`.trim()
        : `${fullApplication.candidate.name || 'Unknown Candidate'}`;

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
        relations: ['job', 'candidate', 'candidateProfile'],
      });

      if (!fullApplication) {
        console.log('⚠️ Application not found, skipping candidate notification');
        return;
      }

      // Get candidate name for notification
      const candidateProfile = fullApplication.candidateProfile;
      const candidateName = candidateProfile
        ? `${candidateProfile.firstName || 'Unknown'} ${candidateProfile.lastName || 'Candidate'}`.trim()
        : `${fullApplication.candidate.name || 'Unknown Candidate'}`;

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
        relations: ['job', 'candidate', 'candidateProfile'],
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
        candidatePhone: fullApplication.candidateProfile?.phone || fullApplication.candidate.phone,
        jobId: fullApplication.jobId,
        jobTitle: fullApplication.job.title,
        companyId: fullApplication.job.companyId,
        interviewLanguage: 'english',
        createdAt: new Date().toISOString(),
        type: 'scheduled_interview',
        status: 'scheduled'
      };

      // Get candidate name for participant
      const candidateProfile = fullApplication.candidateProfile;
      const participantName = candidateProfile
        ? `${candidateProfile.firstName || 'Unknown'} ${candidateProfile.lastName || 'Candidate'}`.trim()
        : `${fullApplication.candidate.name || 'Unknown Candidate'}`;

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
      const candidatePhone = fullApplication.candidateProfile?.phone || fullApplication.candidate.phone;
      if (candidatePhone) {
        console.log('📱 Sending WhatsApp interview notification...');

        const candidateName = candidateProfile
          ? `${candidateProfile.firstName || 'Unknown'} ${candidateProfile.lastName || 'Candidate'}`.trim()
          : `${fullApplication.candidate.name || 'Unknown Candidate'}`;

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