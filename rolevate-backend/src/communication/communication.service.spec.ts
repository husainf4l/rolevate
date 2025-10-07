import { Test, TestingModule } from '@nestjs/testing';
import { CommunicationService } from './communication.service';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { CommunicationType, CommunicationDirection } from '@prisma/client';

// Mock implementations
const mockPrismaService = {
  communication: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  candidateProfile: {
    findUnique: jest.fn(),
  },
  company: {
    findUnique: jest.fn(),
  },
  job: {
    findFirst: jest.fn(),
  },
};

const mockWhatsAppService = {
  sendTemplateMessage: jest.fn(),
  sendTextMessage: jest.fn(),
};

describe('CommunicationService', () => {
  let service: CommunicationService;
  let _prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunicationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: WhatsAppService,
          useValue: mockWhatsAppService,
        },
      ],
    }).compile();

    service = module.get<CommunicationService>(CommunicationService);
    _prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a communication record', async () => {
      const mockCandidate = { 
        id: 'candidate-1', 
        firstName: 'John', 
        lastName: 'Doe',
        phone: '+1234567890'
      };
      const mockCompany = { id: 'company-1', name: 'Test Company' };
      const mockCommunication = {
        id: 'comm-1',
        candidateId: 'candidate-1',
        companyId: 'company-1',
        type: CommunicationType.WHATSAPP,
        direction: CommunicationDirection.OUTBOUND,
        content: 'Hello from WhatsApp!',
        status: 'SENT',
        phoneNumber: '+1234567890',
        whatsappId: 'msg-123',
      };

      mockPrismaService.candidateProfile.findUnique.mockResolvedValue(mockCandidate);
      mockPrismaService.company.findUnique.mockResolvedValue(mockCompany);
      mockPrismaService.communication.create.mockResolvedValue(mockCommunication);
      mockWhatsAppService.sendTextMessage.mockResolvedValue({ messages: [{ id: 'msg-123' }] });

      const result = await service.create({
        candidateId: 'candidate-1',
        companyId: 'company-1',
        type: CommunicationType.WHATSAPP,
        direction: CommunicationDirection.OUTBOUND,
        content: 'Hello from WhatsApp!',
      });

      expect(result).toEqual(mockCommunication);
      expect(mockPrismaService.communication.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          candidateId: 'candidate-1',
          companyId: 'company-1',
          type: CommunicationType.WHATSAPP,
          direction: CommunicationDirection.OUTBOUND,
          content: 'Hello from WhatsApp!',
          status: 'SENT',
          phoneNumber: '+1234567890',
          whatsappId: 'msg-123',
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('findByCompany', () => {
    it('should return paginated communications for a company', async () => {
      const mockCommunications = [
        {
          id: 'comm-1',
          candidateId: 'candidate-1',
          companyId: 'company-1',
          type: CommunicationType.WHATSAPP,
          content: 'Test message',
        },
      ];

      mockPrismaService.communication.findMany.mockResolvedValue(mockCommunications);
      mockPrismaService.communication.count.mockResolvedValue(1);

      const result = await service.findByCompany('company-1', { page: 1, limit: 20 });

      expect(result).toEqual({
        communications: mockCommunications,
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });
  });
});
