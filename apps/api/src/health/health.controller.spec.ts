import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns an OK liveness response without external dependencies', () => {
    const controller = new HealthController({ check: jest.fn() } as never);
    expect(controller.live().status).toBe('ok');
  });
});
