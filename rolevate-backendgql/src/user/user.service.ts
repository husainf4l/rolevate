import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserType } from './user.entity';
import { AuditService } from '../audit.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private auditService: AuditService,
  ) {}

  async create(userType: UserType, email?: string, password?: string, name?: string, phone?: string): Promise<User> {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    const user = this.userRepository.create({
      userType,
      email,
      password: hashedPassword,
      name,
      phone,
      isActive: true
    });
    const savedUser = await this.userRepository.save(user);
    if (email) {
      this.auditService.logUserRegistration(savedUser.id, email);
    }
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async validatePassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && user.password && await bcrypt.compare(password, user.password)) {
      this.auditService.logUserLogin(user.id, email);
      return user;
    }
    return null;
  }
}