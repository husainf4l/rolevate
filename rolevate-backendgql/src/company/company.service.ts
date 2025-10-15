import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { Address } from '../address/address.entity';
import { User } from '../user/user.entity';
import { CreateCompanyInput } from './create-company.input';
import { UpdateCompanyInput } from './update-company.input';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createCompanyInput: CreateCompanyInput, userId?: string): Promise<Company> {
    let addressId = createCompanyInput.addressId;

    // Create address if inline fields are provided
    if (createCompanyInput.street || createCompanyInput.city || createCompanyInput.country) {
      const address = this.addressRepository.create({
        street: createCompanyInput.street,
        city: createCompanyInput.city,
        country: createCompanyInput.country,
      });
      const savedAddress = await this.addressRepository.save(address);
      addressId = savedAddress.id;
    }

    const { street, city, country, ...companyData } = createCompanyInput;
    const newCompany = this.companyRepository.create({
      ...companyData,
      addressId,
    });
    const savedCompany = await this.companyRepository.save(newCompany);

    // Link the user to the company if userId is provided
    if (userId) {
      await this.userRepository.update(userId, { companyId: savedCompany.id });
    }

    // Return the company with relations loaded
    const company = await this.findOne(savedCompany.id);
    return company!;
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