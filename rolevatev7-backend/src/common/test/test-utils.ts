import { Test, TestingModule } from '@nestjs/testing';
import { Repository, ObjectLiteral } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

/**
 * Create a mock TypeORM repository with common methods
 * @param entity The entity class
 * @returns A mock repository object
 */
export const createMockRepository = <T extends ObjectLiteral = any>(): Partial<Record<keyof Repository<T>, jest.Mock>> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  findAndCount: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getManyAndCount: jest.fn(),
    execute: jest.fn(),
  })),
  manager: {
    transaction: jest.fn((callback) => callback({
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getRepository: jest.fn(),
    })),
  } as any,
});

/**
 * Create a testing module with mocked repositories
 * @param providers The providers to include in the module
 * @param imports The imports to include in the module
 * @returns A TestingModule
 */
export const createTestingModuleWithMocks = async (
  providers: any[],
  imports: any[] = [],
  mockRepositories: { entity: any; mockMethods?: Partial<Record<keyof Repository<any>, jest.Mock>> }[] = [],
): Promise<TestingModule> => {
  const repositoryProviders = mockRepositories.map(({ entity, mockMethods }) => ({
    provide: getRepositoryToken(entity),
    useValue: mockMethods || createMockRepository(),
  }));

  return await Test.createTestingModule({
    imports,
    providers: [...providers, ...repositoryProviders],
  }).compile();
};

/**
 * Create a mock ConfigService
 */
export const createMockConfigService = (config: Record<string, any> = {}) => ({
  get: jest.fn((key: string, defaultValue?: any) => {
    if (config[key] !== undefined) {
      return config[key];
    }
    return defaultValue;
  }),
  getOrThrow: jest.fn((key: string) => {
    if (config[key] !== undefined) {
      return config[key];
    }
    throw new Error(`Configuration key ${key} not found`);
  }),
});

/**
 * Create a mock JwtService
 */
export const createMockJwtService = () => ({
  sign: jest.fn((payload) => `mock_token_${JSON.stringify(payload)}`),
  verify: jest.fn((token) => {
    if (token.startsWith('mock_token_')) {
      return JSON.parse(token.replace('mock_token_', ''));
    }
    throw new Error('Invalid token');
  }),
  decode: jest.fn((token) => {
    if (token.startsWith('mock_token_')) {
      return JSON.parse(token.replace('mock_token_', ''));
    }
    return null;
  }),
});

/**
 * Create a mock Logger
 */
export const createMockLogger = () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
});

/**
 * Create a mock AuditService
 */
export const createMockAuditService = () => ({
  logLoginAttempt: jest.fn(),
  logLoginSuccess: jest.fn(),
  logLogout: jest.fn(),
  logPasswordChange: jest.fn(),
  logPasswordResetRequest: jest.fn(),
  logPasswordResetComplete: jest.fn(),
  logUserCreation: jest.fn(),
  logUserUpdate: jest.fn(),
  logUserDeletion: jest.fn(),
  logApiKeyGeneration: jest.fn(),
  logApiKeyRevoked: jest.fn(),
  logApiKeyInvalid: jest.fn(),
  logJobCreation: jest.fn(),
  logJobUpdate: jest.fn(),
  logJobDeletion: jest.fn(),
  logJobPublished: jest.fn(),
  logApplicationCreation: jest.fn(),
  logApplicationUpdate: jest.fn(),
  logApplicationDeletion: jest.fn(),
  logApplicationStatusChange: jest.fn(),
  logApplicationNoteCreation: jest.fn(),
  logApplicationNoteUpdate: jest.fn(),
  logApplicationNoteDeletion: jest.fn(),
  logNotificationCreation: jest.fn(),
  logNotificationRead: jest.fn(),
  logNotificationDeleted: jest.fn(),
  logBulkNotificationRead: jest.fn(),
  logRateLimitExceeded: jest.fn(),
  logUnauthorizedAccess: jest.fn(),
  logForbiddenAccess: jest.fn(),
  logSystemError: jest.fn(),
  logDataExport: jest.fn(),
  logDataImport: jest.fn(),
});

/**
 * Create a mock User entity for testing
 */
export const createMockUser = (overrides: Partial<any> = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  userType: 'CANDIDATE',
  isActive: true,
  companyId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Create a mock Application entity for testing
 */
export const createMockApplication = (overrides: Partial<any> = {}) => ({
  id: 'test-application-id',
  jobId: 'test-job-id',
  candidateId: 'test-candidate-id',
  status: 'PENDING',
  cvUrl: 'https://example.com/cv.pdf',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Create a mock Job entity for testing
 */
export const createMockJob = (overrides: Partial<any> = {}) => ({
  id: 'test-job-id',
  title: 'Test Job',
  companyId: 'test-company-id',
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Create a mock Company entity for testing
 */
export const createMockCompany = (overrides: Partial<any> = {}) => ({
  id: 'test-company-id',
  name: 'Test Company',
  email: 'company@example.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Create a mock execution context for guards/interceptors
 */
export const createMockExecutionContext = (user: any = null, type: 'http' | 'graphql' = 'http') => {
  const request = {
    user,
    headers: {},
    method: 'GET',
    url: '/test',
  };

  const context = {
    switchToHttp: jest.fn(() => ({
      getRequest: jest.fn(() => request),
      getResponse: jest.fn(() => ({})),
    })),
    getType: jest.fn(() => type),
    getClass: jest.fn(),
    getHandler: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
  };

  if (type === 'graphql') {
    // @ts-ignore
    context.getType = jest.fn(() => 'graphql');
    // @ts-ignore
    context.getArgByIndex = jest.fn((index) => {
      if (index === 2) {
        return { req: request };
      }
      return undefined;
    });
  }

  return context;
};

/**
 * Wait for a specific amount of time (useful for testing async operations)
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Suppress console output during tests
 */
export const suppressConsole = () => {
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  };

  beforeAll(() => {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
    console.info = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
  });
};
