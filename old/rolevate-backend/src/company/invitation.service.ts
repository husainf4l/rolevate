import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class InvitationService {
  constructor(private readonly prisma: PrismaService) {}

  async generateInvitation(companyId: string) {
    const code = randomBytes(8).toString('hex');
    // Set expiresAt to 7 days from now
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return this.prisma.invitation.create({
      data: {
        code,
        companyId,
        expiresAt,
      },
    });
  }

  async useInvitation(code: string) {
    const invitation = await this.prisma.invitation.findUnique({ where: { code } });
    if (!invitation || invitation.usedAt) return null;
    await this.prisma.invitation.update({
      where: { code },
      data: { usedAt: new Date(), status: 'ACCEPTED' },
    });
    return invitation;
  }

  async getCompanyIdByCode(code: string) {
    const invitation = await this.prisma.invitation.findUnique({ where: { code } });
    if (invitation && !invitation.usedAt) {
      return invitation.companyId;
    }
    return null;
  }

  async getInvitationDetails(code: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { code },
      include: {
        company: {
          include: {
            address: true,
          }
        }
      }
    });

    if (!invitation) {
      return null;
    }

    const isValid = invitation.status === 'PENDING' && 
                   invitation.expiresAt > new Date() && 
                   !invitation.usedAt;

    return {
      id: invitation.id,
      code: invitation.code,
      email: invitation.email,
      status: invitation.status,
      isValid,
      expiresAt: invitation.expiresAt,
      company: invitation.company,
    };
  }
}
