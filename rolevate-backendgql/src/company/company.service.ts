import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { Address } from '../address/address.entity';
import { User, UserType } from '../user/user.entity';
import { CreateCompanyInput } from './create-company.input';
import { UpdateCompanyInput } from './update-company.input';
import { Invitation, InvitationStatus } from './invitation.entity';
import { CreateInvitationInput } from './invitation.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
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

  // ==================== INVITATION METHODS ====================

  /**
   * Generate a unique invitation code
   */
  private async generateUniqueCode(): Promise<string> {
    let code: string;
    let exists = true;

    while (exists) {
      // Generate 32-character random code
      code = randomBytes(16).toString('hex');
      
      // Check if code already exists
      const existing = await this.invitationRepository.findOne({
        where: { code },
      });
      
      exists = !!existing;
    }

    return code!;
  }

  /**
   * Create a company invitation
   */
  async createInvitation(
    companyId: string,
    invitedById: string,
    input: CreateInvitationInput,
  ): Promise<Invitation> {
    // Verify company exists
    const company = await this.findOne(companyId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Verify inviter is part of the company
    const inviter = await this.userRepository.findOne({
      where: { id: invitedById },
    });

    if (!inviter || inviter.companyId !== companyId) {
      throw new BadRequestException('You are not authorized to create invitations for this company');
    }

    // Generate unique code
    const code = await this.generateUniqueCode();

    // Calculate expiration (default 7 days)
    const expiresInHours = input.expiresInHours || 168; // 7 days
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Default to BUSINESS user type if not specified
    const userType = input.userType || UserType.BUSINESS;

    // Create invitation
    const invitation = this.invitationRepository.create({
      code,
      email: input.email,
      userType,
      status: InvitationStatus.PENDING,
      invitedById,
      companyId,
      expiresAt,
    });

    return this.invitationRepository.save(invitation);
  }

  /**
   * Get invitation by code
   */
  async getInvitationByCode(code: string): Promise<Invitation | null> {
    return this.invitationRepository.findOne({
      where: { code },
      relations: ['company', 'invitedBy'],
    });
  }

  /**
   * Validate invitation code
   */
  async validateInvitation(code: string): Promise<{ valid: boolean; message: string; invitation?: Invitation }> {
    const invitation = await this.getInvitationByCode(code);

    if (!invitation) {
      return { valid: false, message: 'Invitation not found' };
    }

    if (invitation.status === InvitationStatus.ACCEPTED) {
      return { valid: false, message: 'Invitation has already been used' };
    }

    if (invitation.status === InvitationStatus.CANCELLED) {
      return { valid: false, message: 'Invitation has been cancelled' };
    }

    if (invitation.expiresAt && new Date() > invitation.expiresAt) {
      return { valid: false, message: 'Invitation has expired' };
    }

    return { valid: true, message: 'Invitation is valid', invitation };
  }

  /**
   * Accept invitation and mark as used
   */
  async acceptInvitation(code: string, userId: string): Promise<Invitation> {
    const validation = await this.validateInvitation(code);
    
    if (!validation.valid || !validation.invitation) {
      throw new BadRequestException(validation.message);
    }

    const invitation = validation.invitation;

    // Update invitation status
    invitation.status = InvitationStatus.ACCEPTED;
    invitation.usedAt = new Date();
    await this.invitationRepository.save(invitation);

    // Link user to company
    await this.userRepository.update(userId, {
      companyId: invitation.companyId,
    });

    return invitation;
  }

  /**
   * List all invitations for a company
   */
  async listCompanyInvitations(companyId: string): Promise<Invitation[]> {
    return this.invitationRepository.find({
      where: { companyId },
      relations: ['invitedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Cancel an invitation
   */
  async cancelInvitation(invitationId: string, userId: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Verify user has permission (must be from same company)
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || user.companyId !== invitation.companyId) {
      throw new BadRequestException('You are not authorized to cancel this invitation');
    }

    invitation.status = InvitationStatus.CANCELLED;
    return this.invitationRepository.save(invitation);
  }
}