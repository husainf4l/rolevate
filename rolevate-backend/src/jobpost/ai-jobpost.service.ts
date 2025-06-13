import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiJobPostService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find a valid user ID for a given company
   * This is useful for AI-generated job posts where the provided user ID may not exist
   */
  async findValidUserForCompany(companyId: string, fallbackUserId?: string): Promise<string> {
    // Try to find a company admin first
    const companyAdmin = await this.prisma.user.findFirst({
      where: {
        companyId,
        role: 'COMPANY_ADMIN',
      },
    });

    if (companyAdmin) {
      return companyAdmin.id;
    }

    // If no company admin found, look for any user in the company
    const anyCompanyUser = await this.prisma.user.findFirst({
      where: {
        companyId,
      },
    });

    if (anyCompanyUser) {
      return anyCompanyUser.id;
    }

    // If no users found for this company, try to use the fallback
    if (fallbackUserId) {
      const fallbackUser = await this.prisma.user.findUnique({
        where: { id: fallbackUserId },
      });
      
      if (fallbackUser) {
        return fallbackUserId;
      }
    }

    // If still no valid user, find any admin in the system
    const anyAdmin = await this.prisma.user.findFirst({
      where: {
        role: 'SUPER_ADMIN',
      },
    });

    if (anyAdmin) {
      return anyAdmin.id;
    }

    // Last resort, find any user at all
    const anyUser = await this.prisma.user.findFirst();
    
    if (anyUser) {
      return anyUser.id;
    }

    // If no user found anywhere, throw an error
    throw new Error('No valid user found in the system for AI job post creation');
  }
}
