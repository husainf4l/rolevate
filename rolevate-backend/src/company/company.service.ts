import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.company.findMany();
  }

  async findById(id: string) {
    return this.prisma.company.findUnique({ where: { id } });
  }
}
