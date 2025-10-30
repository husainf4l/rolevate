module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/*.entity.ts',
    '!**/*.dto.ts',
    '!**/*.input.ts',
    '!**/*.interface.ts',
    '!**/main.ts',
    '!**/data-source.ts',
    '!**/seed.ts',
    '!**/migrations/**',
    '!**/__tests__/**',
    '!**/test/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
  // Coverage thresholds - fail tests if coverage drops below these values
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    // Higher thresholds for critical services
    './common/services/resource-ownership.service.ts': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './auth/auth.service.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './user/user.service.ts': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
    './application/application.service.ts': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  // Timeout for slow tests
  testTimeout: 10000,
  // Display individual test results
  verbose: true,
  // Clear mocks between tests
  clearMocks: true,
  // Reset mocks between tests
  resetMocks: true,
  // Restore mocks between tests
  restoreMocks: true,
};
