import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../application/application.entity';
import { ApplicationNote } from '../../application/application-note.entity';
import { Job } from '../../job/job.entity';
import { CandidateProfile } from '../../candidate/candidate-profile.entity';

export interface OwnershipCheckResult {
  isOwner: boolean;
  reason?: string;
  resource?: any;
}

@Injectable()
export class ResourceOwnershipService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(ApplicationNote)
    private applicationNoteRepository: Repository<ApplicationNote>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(CandidateProfile)
    private candidateProfileRepository: Repository<CandidateProfile>,
  ) {}

  /**
   * Check if user owns or has access to an application
   * Candidates can access their own applications
   * Business users can access applications for their company's jobs
   * System users have full access
   */
  async checkApplicationOwnership(
    applicationId: string,
    userId: string,
    userType: string,
    companyId?: string
  ): Promise<OwnershipCheckResult> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['job', 'candidate'],
    });

    if (!application) {
      return { isOwner: false, reason: 'Application not found' };
    }

    // Candidate can access their own application
    if (userType === 'CANDIDATE' && application.candidateId === userId) {
      return { isOwner: true, resource: application };
    }

    // Business user can access applications for their company's jobs
    if (userType === 'BUSINESS' && companyId && application.job.companyId === companyId) {
      return { isOwner: true, resource: application };
    }

    // System/admin users have full access
    if (userType === 'SYSTEM' || userType === 'ADMIN') {
      return { isOwner: true, resource: application };
    }

    return { 
      isOwner: false, 
      reason: 'You do not have permission to access this application',
      resource: application
    };
  }

  /**
   * Check if user owns or has access to an application note
   * Note author can access their own notes
   * Business users from same company can access notes
   */
  async checkApplicationNoteOwnership(
    noteId: string,
    userId: string,
    userType: string,
    companyId?: string
  ): Promise<OwnershipCheckResult> {
    const note = await this.applicationNoteRepository.findOne({
      where: { id: noteId },
      relations: ['application', 'application.job', 'user'],
    });

    if (!note) {
      return { isOwner: false, reason: 'Note not found' };
    }

    // Note author can access their own note
    if (note.userId === userId) {
      return { isOwner: true, resource: note };
    }

    // Business user from same company can access notes on their jobs
    if (userType === 'BUSINESS' && companyId && note.application.job.companyId === companyId) {
      return { isOwner: true, resource: note };
    }

    // System/admin users have full access
    if (userType === 'SYSTEM' || userType === 'ADMIN') {
      return { isOwner: true, resource: note };
    }

    return { 
      isOwner: false, 
      reason: 'You do not have permission to access this note',
      resource: note
    };
  }

  /**
   * Check if user owns or has access to a job
   * Job poster can access their job
   * Any business user from the same company can access the job
   */
  async checkJobOwnership(
    jobId: string,
    userId: string,
    userType: string,
    companyId?: string
  ): Promise<OwnershipCheckResult> {
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
      relations: ['postedBy', 'company'],
    });

    if (!job) {
      return { isOwner: false, reason: 'Job not found' };
    }

    // Job poster can access their job
    if (job.postedById === userId) {
      return { isOwner: true, resource: job };
    }

    // Business user from same company can access company jobs
    if (userType === 'BUSINESS' && companyId && job.companyId === companyId) {
      return { isOwner: true, resource: job };
    }

    // System/admin users have full access
    if (userType === 'SYSTEM' || userType === 'ADMIN') {
      return { isOwner: true, resource: job };
    }

    return { 
      isOwner: false, 
      reason: 'You do not have permission to access this job',
      resource: job
    };
  }

  /**
   * Check if user owns or has access to a candidate profile
   * Candidate can access their own profile
   * Business users can view profiles of applicants to their jobs
   */
  async checkCandidateProfileOwnership(
    profileId: string,
    userId: string,
    userType: string
  ): Promise<OwnershipCheckResult> {
    const profile = await this.candidateProfileRepository.findOne({
      where: { id: profileId },
      relations: ['user'],
    });

    if (!profile) {
      return { isOwner: false, reason: 'Profile not found' };
    }

    // Candidate can access their own profile
    if (profile.userId === userId) {
      return { isOwner: true, resource: profile };
    }

    // System/admin users have full access
    if (userType === 'SYSTEM' || userType === 'ADMIN') {
      return { isOwner: true, resource: profile };
    }

    // Business users can view profiles (read-only in resolver)
    if (userType === 'BUSINESS') {
      return { isOwner: true, resource: profile };
    }

    return { 
      isOwner: false, 
      reason: 'You do not have permission to access this profile',
      resource: profile
    };
  }

  /**
   * Check if user can modify a candidate profile
   * Only the candidate themselves can modify their profile
   */
  async checkCandidateProfileModifyPermission(
    profileId: string,
    userId: string,
    userType: string
  ): Promise<OwnershipCheckResult> {
    const profile = await this.candidateProfileRepository.findOne({
      where: { id: profileId },
      relations: ['user'],
    });

    if (!profile) {
      return { isOwner: false, reason: 'Profile not found' };
    }

    // Only the candidate can modify their own profile
    if (profile.userId === userId) {
      return { isOwner: true, resource: profile };
    }

    // System/admin users can modify
    if (userType === 'SYSTEM' || userType === 'ADMIN') {
      return { isOwner: true, resource: profile };
    }

    return { 
      isOwner: false, 
      reason: 'You can only modify your own profile',
      resource: profile
    };
  }

  /**
   * Verify ownership and throw exception if not authorized
   */
  async verifyApplicationOwnership(
    applicationId: string,
    userId: string,
    userType: string,
    companyId?: string
  ): Promise<Application> {
    const result = await this.checkApplicationOwnership(applicationId, userId, userType, companyId);
    
    if (!result.isOwner) {
      throw new ForbiddenException(result.reason || 'Access denied');
    }

    if (!result.resource) {
      throw new NotFoundException('Application not found');
    }

    return result.resource;
  }

  /**
   * Verify note ownership and throw exception if not authorized
   */
  async verifyApplicationNoteOwnership(
    noteId: string,
    userId: string,
    userType: string,
    companyId?: string
  ): Promise<ApplicationNote> {
    const result = await this.checkApplicationNoteOwnership(noteId, userId, userType, companyId);
    
    if (!result.isOwner) {
      throw new ForbiddenException(result.reason || 'Access denied');
    }

    if (!result.resource) {
      throw new NotFoundException('Note not found');
    }

    return result.resource;
  }

  /**
   * Verify job ownership and throw exception if not authorized
   */
  async verifyJobOwnership(
    jobId: string,
    userId: string,
    userType: string,
    companyId?: string
  ): Promise<Job> {
    const result = await this.checkJobOwnership(jobId, userId, userType, companyId);
    
    if (!result.isOwner) {
      throw new ForbiddenException(result.reason || 'Access denied');
    }

    if (!result.resource) {
      throw new NotFoundException('Job not found');
    }

    return result.resource;
  }

  /**
   * Verify profile ownership and throw exception if not authorized
   */
  async verifyCandidateProfileOwnership(
    profileId: string,
    userId: string,
    userType: string
  ): Promise<CandidateProfile> {
    const result = await this.checkCandidateProfileOwnership(profileId, userId, userType);
    
    if (!result.isOwner) {
      throw new ForbiddenException(result.reason || 'Access denied');
    }

    if (!result.resource) {
      throw new NotFoundException('Profile not found');
    }

    return result.resource;
  }
}
