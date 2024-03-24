import { Test, TestingModule } from '@nestjs/testing';
import { ConllectionsHomeController } from './conllections-home.controller';

describe('ConllectionsHomeController', () => {
  let controller: ConllectionsHomeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConllectionsHomeController],
    }).compile();

    controller = module.get<ConllectionsHomeController>(ConllectionsHomeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
