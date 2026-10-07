export type LateArrivalAction = 'NONE' | 'SKIP' | 'NO_SHOW' | 'ALLOW_GRACE_ARRIVAL';

export interface LateArrivalInput {
  now: Date;
  arrivalWindowEnd: Date;
  gracePeriodEnd: Date;
  hasCheckedIn: boolean;
}

export function determineLateArrivalAction(input: LateArrivalInput): LateArrivalAction {
  if (input.hasCheckedIn) return 'NONE';
  if (input.now <= input.arrivalWindowEnd) return 'NONE';
  if (input.now <= input.gracePeriodEnd) return 'SKIP';
  return 'NO_SHOW';
}

export function boundedTrafficExtensionMinutes(requestedMinutes: number): number {
  return Math.max(0, Math.min(5, Math.floor(requestedMinutes)));
}
