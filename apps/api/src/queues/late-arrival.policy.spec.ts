import { boundedTrafficExtensionMinutes, determineLateArrivalAction } from './late-arrival.policy';

describe('late arrival policy', () => {
  const arrivalWindowEnd = new Date('2026-07-21T09:00:00.000Z');
  const gracePeriodEnd = new Date('2026-07-21T09:10:00.000Z');

  it('skips after the arrival window and marks no-show only after grace expires', () => {
    expect(determineLateArrivalAction({ now: new Date('2026-07-21T09:01:00.000Z'), arrivalWindowEnd, gracePeriodEnd, hasCheckedIn: false })).toBe('SKIP');
    expect(determineLateArrivalAction({ now: new Date('2026-07-21T09:11:00.000Z'), arrivalWindowEnd, gracePeriodEnd, hasCheckedIn: false })).toBe('NO_SHOW');
  });

  it('caps automatic traffic extension at five minutes', () => {
    expect(boundedTrafficExtensionMinutes(8.9)).toBe(5);
  });
});
