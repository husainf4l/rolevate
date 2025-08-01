import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { CommunicationType, CommunicationDirection, CommunicationStatus } from '@prisma/client';
import {
  CreateCommunicationDto,
  SendWhatsAppDto,
  CommunicationFiltersDto
} from './dto/communication.dto';

@Injectable()
export class CommunicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsAppService,
  ) { }

  async findByCompany(companyId: string, filters: CommunicationFiltersDto) {
    const { page = 1, limit = 20, candidateId, jobId, type, status, dateFrom, dateTo } = filters;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      companyId,
      ...(candidateId && { candidateId }),
      ...(jobId && { jobId }),
      ...(type && { type }),
      ...(status && { status }),
      ...(dateFrom || dateTo) && {
        sentAt: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        },
      },
    };

    const [communications, total] = await Promise.all([
      this.prisma.communication.findMany({
        where,
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          job: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { sentAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      this.prisma.communication.count({ where }),
    ]);

    return {
      communications,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async findById(id: string, companyId: string) {
    const communication = await this.prisma.communication.findFirst({
      where: { id, companyId },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!communication) {
      throw new NotFoundException('Communication not found');
    }

    return communication;
  }

  async create(data: CreateCommunicationDto) {
    // Extract template-related fields that are not part of the database model
    const { templateName, templateParams, ...dbData } = data;

    // Verify candidate and company exist
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { id: data.candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const company = await this.prisma.company.findUnique({
      where: { id: data.companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (data.jobId) {
      const job = await this.prisma.job.findFirst({
        where: { id: data.jobId, companyId: data.companyId },
      });

      if (!job) {
        throw new NotFoundException('Job not found');
      }
    }

    let whatsappId: string | undefined;
    let communicationStatus: CommunicationStatus = CommunicationStatus.SENT;

    // If it's a WhatsApp message and direction is OUTBOUND, actually send it
    if (data.type === CommunicationType.WHATSAPP && data.direction === CommunicationDirection.OUTBOUND) {
      try {
        if (!candidate.phone) {
          throw new BadRequestException('Candidate has no phone number for WhatsApp');
        }

        // Send WhatsApp message
        console.log(`Sending WhatsApp message to ${candidate.phone}: ${data.content}`);

        let whatsappResult;

        if (templateName) {
          // Send template message with parameters
          console.log(`Using template: ${templateName} with params:`, templateParams);
          whatsappResult = await this.whatsappService.sendTemplateMessage(
            candidate.phone,
            templateName,
            undefined, // Auto-detect language
            templateParams
          );
        } else {
          // Send regular text message
          whatsappResult = await this.whatsappService.sendTextMessage(
            candidate.phone,
            data.content
          );
        }

        whatsappId = whatsappResult.messages?.[0]?.id;
        console.log(`WhatsApp message sent successfully. Message ID: ${whatsappId}`);

      } catch (error) {
        console.error('Failed to send WhatsApp message:', error.message);
        communicationStatus = CommunicationStatus.FAILED;
        // Continue to create the record but mark as failed
      }
    }

    return this.prisma.communication.create({
      data: {
        ...dbData,
        status: communicationStatus,
        whatsappId,
        phoneNumber: candidate.phone,
      },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async sendWhatsApp(companyId: string, data: SendWhatsAppDto) {
    try {
      // Get candidate details
      const candidate = await this.prisma.candidateProfile.findUnique({
        where: { id: data.candidateId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate not found');
      }

      if (!candidate.phone) {
        throw new BadRequestException('Candidate has no phone number');
      }

      let whatsappResult;
      let content = data.content;

      // Send WhatsApp message
      if (data.templateName) {
        // Send template message (with or without parameters)
        // Let WhatsApp service auto-detect the correct language for the template
        whatsappResult = await this.whatsappService.sendTemplateMessage(
          candidate.phone,
          data.templateName,
          undefined, // Auto-detect language based on template
          data.templateParams
        );
        content = `Template: ${data.templateName} - ${data.content}`;
      } else {
        // For now, we'll just log the message since we need text message capability
        console.log(`Would send WhatsApp text message to ${candidate.phone}: ${content}`);
        whatsappResult = { messages: [{ id: `msg_${Date.now()}` }] };
      }

      // Create communication record
      const communication = await this.create({
        candidateId: data.candidateId,
        companyId,
        jobId: data.jobId,
        type: CommunicationType.WHATSAPP,
        direction: CommunicationDirection.OUTBOUND,
        content,
        whatsappId: whatsappResult.messages?.[0]?.id,
        phoneNumber: candidate.phone,
      });

      return {
        communication,
        whatsappResult,
      };
    } catch (error) {
      // Create failed communication record
      await this.create({
        candidateId: data.candidateId,
        companyId,
        jobId: data.jobId,
        type: CommunicationType.WHATSAPP,
        direction: CommunicationDirection.OUTBOUND,
        content: data.content,
        phoneNumber: undefined,
      });

      // Update status to failed
      throw error;
    }
  }

  async getCommunicationHistory(companyId: string, candidateId: string, jobId?: string) {
    const where: any = {
      companyId,
      candidateId,
      ...(jobId && { jobId }),
    };

    const communications = await this.prisma.communication.findMany({
      where,
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { sentAt: 'asc' },
    });

    return communications;
  }

  async getStats(companyId: string, filters?: { dateFrom?: string; dateTo?: string; jobId?: string }) {
    const where: any = {
      companyId,
      ...(filters?.jobId && { jobId: filters.jobId }),
      ...(filters?.dateFrom || filters?.dateTo) && {
        sentAt: {
          ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
          ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
        },
      },
    };

    const [total, byType, byStatus] = await Promise.all([
      this.prisma.communication.count({ where }),
      this.prisma.communication.groupBy({
        by: ['type'],
        where,
        _count: true,
      }),
      this.prisma.communication.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
    ]);

    return {
      total,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {}),
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {}),
    };
  }
}
