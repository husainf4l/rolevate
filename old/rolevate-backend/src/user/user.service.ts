import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserType } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(userData: {
    email: string;
    password: string;
    name?: string;
    userType: string;
    phone?: string;
    companyId?: string;
  }) {
    return this.prisma.user.create({
      data: {
        ...userData,
        userType: userData.userType as UserType,
      },
    });
  }
}
