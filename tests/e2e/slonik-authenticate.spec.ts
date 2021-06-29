import { Test } from '@nestjs/testing';
import { AppAuthenticateModule } from '../src/app-authenticate.module';
import { ConnectionError } from 'slonik';

describe('Slonik (authenticate)', () => {
  it(`should throw ConnectionError`, async () => {
    const module = Test.createTestingModule({
      imports: [AppAuthenticateModule],
    });

    await expect(module.compile()).rejects.toThrow(ConnectionError);
  });
});
