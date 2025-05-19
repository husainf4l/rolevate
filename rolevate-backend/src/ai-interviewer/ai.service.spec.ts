import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatMessage } from './interfaces/ai-interviewer.interfaces';

// Mock OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Mock OpenAI response',
              },
            },
          ],
        }),
      },
    },
  }));
});

describe('AiService', () => {
  let service: AiService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-openai-api-key'),
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateResponse', () => {
    it('should generate a response based on messages', async () => {
      const messages: ChatMessage[] = [
        { role: 'system', content: 'You are an AI interviewer' },
        { role: 'user', content: 'Tell me about yourself' },
      ];

      const response = await service.generateResponse(messages);
      expect(response).toEqual('Mock OpenAI response');
      
      // Validate the OpenAI instance was created with the API key
      expect(OpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKey: 'test-openai-api-key',
        }),
      );
    });
  });

  describe('generateInterviewQuestions', () => {
    it('should generate interview questions', async () => {
      // Mock the OpenAI response for this specific test
      const mockContent = `
        1. Tell me about your experience with Node.js?
        2. How do you handle asynchronous code in JavaScript?
        3. What is dependency injection and how does it work in NestJS?
        4. Describe a challenging project you worked on recently.
        5. How do you approach testing in your projects?
      `;
      
      jest.spyOn(service as any, 'openai').mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: mockContent,
                  },
                },
              ],
            }),
          },
        },
      }));

      const questions = await service.generateInterviewQuestions(
        'Full Stack Developer',
        'Looking for someone with experience in Node.js and React',
        3,
      );

      expect(questions).toHaveLength(3);
      expect(questions[0]).toContain('experience with Node.js');
    });
  });

  describe('analyzeResponse', () => {
    it('should analyze a candidate response', async () => {
      const question = 'What is dependency injection?';
      const response = 'Dependency injection is a design pattern where...';

      const analysis = await service.analyzeResponse(question, response);
      expect(analysis).toEqual('Mock OpenAI response');
    });
  });

  describe('generateFollowUp', () => {
    it('should generate a follow-up question', async () => {
      const question = 'What is dependency injection?';
      const response = 'Dependency injection is a design pattern where...';

      const followUp = await service.generateFollowUp(question, response);
      expect(followUp).toEqual('Mock OpenAI response');
    });
  });
});
