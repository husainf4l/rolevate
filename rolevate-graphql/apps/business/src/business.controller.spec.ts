import { Test, TestingModule } from '@nestjs/testing';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';

describe('BusinessController', () => {
  let businessController: BusinessController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BusinessController],
      providers: [BusinessService],
    }).compile();

    businessController = app.get<BusinessController>(BusinessController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(businessController.getHello()).toBe('Hello World!');
    });
  });
});
