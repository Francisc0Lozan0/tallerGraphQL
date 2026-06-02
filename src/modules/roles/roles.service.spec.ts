import { Test } from '@nestjs/testing';
import { RolesService } from './roles.service';

describe('RolesService', () => {
  it('se define', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [RolesService],
    }).compile();

    expect(moduleRef.get(RolesService)).toBeDefined();
  });
});
