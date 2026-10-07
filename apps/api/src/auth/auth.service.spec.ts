import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

function config() {
  return {
    get: jest.fn().mockReturnValue('development'),
    getOrThrow: jest.fn().mockReturnValue('a-secret-used-only-for-unit-tests-123456'),
  };
}

describe('AuthService', () => {
  it('persists a hash rather than the development OTP plaintext', async () => {
    const prisma = {
      user: { upsert: jest.fn().mockResolvedValue({ id: 'user-1' }) },
      authOtpChallenge: {
        updateMany: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation((operations) => Promise.all(operations)),
    };
    const service = new AuthService(prisma as never, {} as never, config() as never);

    const result = await service.requestOtp('+251911234567');

    expect(result.developmentCode).toBe('123456');
    expect(prisma.authOtpChallenge.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ codeHash: expect.not.stringMatching('123456') }) }),
    );
  });

  it('rejects a refresh token that was already revoked by another request', async () => {
    const prisma = {
      authSession: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'session-1',
          userId: 'user-1',
          user: { id: 'user-1', phoneNumber: '+251911234567', status: 'ACTIVE', roles: [{ role: 'DRIVER' }] },
        }),
      },
      $transaction: jest.fn().mockImplementation(async (callback) =>
        callback({ authSession: { updateMany: jest.fn().mockResolvedValue({ count: 0 }), create: jest.fn() } }),
      ),
    };
    const jwt = { signAsync: jest.fn().mockResolvedValue('access-token') };
    const service = new AuthService(prisma as never, jwt as never, config() as never);

    await expect(service.refresh('x'.repeat(64))).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
