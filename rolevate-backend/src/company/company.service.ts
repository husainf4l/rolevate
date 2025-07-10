import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/company.dto';
import { getCompanySizeCategory, getCompanySizeRange } from './utils/company-size.util';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.company.findMany();
  }

  async findById(id: string) {
    const company = await this.prisma.company.findUnique({ 
      where: { id },
      include: {
        address: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            userType: true,
            isActive: true,
            createdAt: true,
          }
        },
        invitations: {
          where: {
            status: 'PENDING',
            expiresAt: { gt: new Date() }
          },
          select: {
            id: true,
            code: true,
            email: true,
            expiresAt: true,
            createdAt: true,
          }
        }
      }
    });

    if (!company) return null;

    // Add computed fields
    return {
      ...company,
      sizeCategory: getCompanySizeCategory(company.numberOfEmployees),
      sizeRange: getCompanySizeRange(company.numberOfEmployees),
    };
  }

  async create(createCompanyDto: CreateCompanyDto, userId: string) {
    // Check if user already has a company
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!existingUser) {
      throw new UnauthorizedException('User not found');
    }

    if (existingUser.companyId) {
      throw new BadRequestException('User already belongs to a company');
    }

    // Convert size string to number of employees
    let numberOfEmployees = createCompanyDto.numberOfEmployees;
    if (createCompanyDto.size && !numberOfEmployees) {
      const sizeRanges: { [key: string]: number } = {
        '1-10': 5,
        '11-50': 30,
        '51-200': 125,
        '201-500': 350,
        '501-1000': 750,
        '1000+': 1500
      };
      numberOfEmployees = sizeRanges[createCompanyDto.size] || 1;
    }

    // Prepare address data from flat fields or nested address object
    const addressData = createCompanyDto.address || 
      (createCompanyDto.street || createCompanyDto.city || createCompanyDto.country) ? {
        street: createCompanyDto.street,
        city: createCompanyDto.city,
        country: createCompanyDto.country as any
      } : null;

    // Create company
    const company = await this.prisma.company.create({
      data: {
        name: createCompanyDto.name,
        description: createCompanyDto.description,
        email: createCompanyDto.email,
        phone: createCompanyDto.phone,
        website: createCompanyDto.website,
        industry: createCompanyDto.industry as any, // Cast to Industry enum
        numberOfEmployees: numberOfEmployees,
        subscription: 'FREE', // Default subscription
        ...(addressData && {
          address: {
            create: {
              street: addressData.street,
              city: addressData.city,
              country: addressData.country,
            }
          }
        })
      },
    });

    // Update user to be connected to the company
    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        companyId: company.id,
        userType: 'COMPANY' // Make user a company user
      },
    });

    return this.findById(company.id);
  }

  async joinCompany(userId: string, invitationCode: string) {
    // Check if user already has a company
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!existingUser) {
      throw new UnauthorizedException('User not found');
    }

    if (existingUser.companyId) {
      throw new BadRequestException('User already belongs to a company');
    }

    // Find and validate invitation
    const invitation = await this.prisma.invitation.findUnique({
      where: { code: invitationCode },
      include: { company: true }
    });

    if (!invitation) {
      throw new BadRequestException('Invalid invitation code');
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException('Invitation has already been used');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }

    // Update user to join the company
    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        companyId: invitation.companyId,
        userType: 'COMPANY' // Make user a company user
      },
    });

    // Mark invitation as used
    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: { 
        status: 'ACCEPTED',
        usedAt: new Date()
      }
    });

    return this.findById(invitation.companyId);
  }

  async getUserCompany(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!user || !user.company) {
      return null;
    }

    return this.findById(user.company.id);
  }

  async getCompanyStats() {
    const totalCompanies = await this.prisma.company.count();
    
    const industryStats = await this.prisma.company.groupBy({
      by: ['industry'],
      _count: true,
      where: {
        industry: { not: null }
      }
    });

    const sizeRanges = [
      { range: '1-10', min: 1, max: 10 },
      { range: '11-50', min: 11, max: 50 },
      { range: '51-200', min: 51, max: 200 },
      { range: '201-1000', min: 201, max: 1000 },
      { range: '1000+', min: 1000, max: null }
    ];

    const sizeStats = await Promise.all(
      sizeRanges.map(async (range) => {
        const count = await this.prisma.company.count({
          where: {
            numberOfEmployees: {
              gte: range.min,
              ...(range.max && { lte: range.max })
            }
          }
        });
        return { range: range.range, count };
      })
    );

    const subscriptionStats = await this.prisma.company.groupBy({
      by: ['subscription'],
      _count: true
    });

    return {
      totalCompanies,
      industryStats,
      sizeStats,
      subscriptionStats
    };
  }
}
