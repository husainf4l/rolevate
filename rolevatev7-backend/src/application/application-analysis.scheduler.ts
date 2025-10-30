import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, LessThan } from 'typeorm';
import { Application } from './application.entity';
import axios from 'axios';

@Injectable()
export class ApplicationAnalysisScheduler {
  private readonly logger = new Logger(ApplicationAnalysisScheduler.name);
  private isProcessing = false;

  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) {}

  /**
   * Runs every hour to check for applications that haven't been analyzed
   * Submits them to CV analysis one by one
   */
  @Cron(CronExpression.EVERY_HOUR)
  async processUnanalyzedApplications(): Promise<void> {
    if (this.isProcessing) {
      this.logger.warn('Previous batch is still processing, skipping this run');
      return;
    }

    this.isProcessing = true;
    try {
      this.logger.log('🔍 Starting hourly check for unanalyzed applications...');

      // Find applications that:
      // 1. Have a resume URL (can be analyzed)
      // 2. Don't have a CV analysis score (not analyzed yet)
      // 3. Were created more than 5 minutes ago (to avoid immediate re-submission)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      const unanalyzedApplications = await this.applicationRepository.find({
        where: {
          resumeUrl: Not(IsNull()),
          cvAnalysisScore: IsNull(),
          createdAt: LessThan(fiveMinutesAgo),
        },
        relations: ['candidate', 'job'],
        take: 50, // Process max 50 per hour to avoid overload
        order: { createdAt: 'ASC' },
      });

      if (unanalyzedApplications.length === 0) {
        this.logger.log('✅ No unanalyzed applications found');
        return;
      }

      this.logger.log(`📊 Found ${unanalyzedApplications.length} unanalyzed applications`);

      // Process applications one by one
      let successCount = 0;
      let failureCount = 0;

      for (const application of unanalyzedApplications) {
        try {
          await this.submitApplicationForAnalysis(application);
          successCount++;
          // Add small delay between submissions to avoid overwhelming the FastAPI service
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          failureCount++;
          this.logger.error(
            `❌ Failed to submit application ${application.id} for analysis: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      this.logger.log(
        `✅ Batch completed: ${successCount} successful, ${failureCount} failed out of ${unanalyzedApplications.length}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error in processUnanalyzedApplications: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Manual trigger to run the analysis check immediately
   * Can be called via API/GraphQL
   */
  async runAnalysisCheckManually(): Promise<string> {
    if (this.isProcessing) {
      this.logger.warn('Analysis is already running, skipping manual trigger');
      return '❌ Analysis is already running from previous trigger. Please wait.';
    }

    this.isProcessing = true;
    try {
      this.logger.log('🔄 Manual trigger: Starting unanalyzed applications check...');

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      const unanalyzedApplications = await this.applicationRepository.find({
        where: {
          resumeUrl: Not(IsNull()),
          cvAnalysisScore: IsNull(),
          createdAt: LessThan(fiveMinutesAgo),
        },
        relations: ['candidate', 'job'],
        take: 50,
        order: { createdAt: 'ASC' },
      });

      if (unanalyzedApplications.length === 0) {
        this.logger.log('✅ No unanalyzed applications found');
        return '✅ No unanalyzed applications found';
      }

      this.logger.log(`📊 Found ${unanalyzedApplications.length} unanalyzed applications`);

      let successCount = 0;
      let failureCount = 0;

      for (const application of unanalyzedApplications) {
        try {
          await this.submitApplicationForAnalysis(application);
          successCount++;
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          failureCount++;
          this.logger.error(
            `❌ Failed to submit application ${application.id}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      const result = `✅ Batch completed: ${successCount} successful, ${failureCount} failed out of ${unanalyzedApplications.length}`;
      this.logger.log(result);
      return result;
    } catch (error) {
      const errorMessage = `❌ Error: ${error instanceof Error ? error.message : String(error)}`;
      this.logger.error(errorMessage);
      return errorMessage;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Submit a single application for CV analysis
   */
  private async submitApplicationForAnalysis(application: Application): Promise<void> {
    try {
      if (!application.resumeUrl) {
        this.logger.warn(`Application ${application.id} has no resume URL, skipping`);
        return;
      }

      const fastApiUrl = process.env.CV_ANALYSIS_API_URL || 'http://localhost:8000';
      const payload = {
        application_id: application.id,
        candidateid: application.candidateId,
        jobid: application.jobId,
        cv_link: application.resumeUrl,
        callbackUrl: process.env.GRAPHQL_API_URL || 'http://localhost:4005/api/graphql',
        systemApiKey: process.env.SYSTEM_API_KEY || '',
      };

      this.logger.log(
        `🚀 Submitting application ${application.id} for analysis (Resume: ${application.resumeUrl})`,
      );

      await axios.post(`${fastApiUrl}/cv-analysis`, payload, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' },
      });

      this.logger.log(`✅ Application ${application.id} submitted for analysis`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Failed to submit application ${application.id}: ${errorMessage}`);
      throw error;
    }
  }
}
