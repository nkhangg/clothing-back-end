import { Test, TestingModule } from '@nestjs/testing';
import { ConllectionsHomeService } from './conllections-home.service';

describe('ConllectionsHomeService', () => {
  let service: ConllectionsHomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConllectionsHomeService],
    }).compile();

    service = module.get<ConllectionsHomeService>(ConllectionsHomeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
