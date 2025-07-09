import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class InvitationService {
  constructor(private readonly prisma: PrismaService) {}

  async generateInvitation(companyId: string) {
    const code = randomBytes(8).toString('hex');
    return this.prisma.invitation.create({
      data: {
        code,
        companyId,
      },
    });
  }

  async useInvitation(code: string) {
    const invitation = await this.prisma.invitation.findUnique({ where: { code } });
    if (!invitation || invitation.used) return null;
    await this.prisma.invitation.update({
      where: { code },
      data: { used: true, usedAt: new Date() },
    });
    return invitation;
  }

  async getCompanyIdByCode(code: string) {
    const invitation = await this.prisma.invitation.findUnique({ where: { code } });
    if (invitation && !invitation.used) {
      return invitation.companyId;
    }
    return null;
  }
}
