import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { CreateCompanyInput } from './create-company.input';
import { UpdateCompanyInput } from './update-company.input';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async create(createCompanyInput: CreateCompanyInput): Promise<Company> {
    const company = this.companyRepository.create(createCompanyInput);
    return this.companyRepository.save(company);
  }

  async findAll(): Promise<Company[]> {
    return this.companyRepository.find({
      relations: ['address', 'users', 'jobs'],
    });
  }

  async findOne(id: string): Promise<Company | null> {
    return this.companyRepository.findOne({
      where: { id },
      relations: ['address', 'users', 'jobs'],
    });
  }

  async update(id: string, updateCompanyInput: UpdateCompanyInput): Promise<Company | null> {
    await this.companyRepository.update(id, updateCompanyInput);
    return this.findOne(id);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.companyRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findByUserId(userId: string): Promise<Company[]> {
    return this.companyRepository
      .createQueryBuilder('company')
      .leftJoin('company.users', 'user')
      .where('user.id = :userId', { userId })
      .getMany();
  }
}