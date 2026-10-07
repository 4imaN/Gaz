export const USER_ROLES = [
  'DRIVER',
  'WORKER',
  'STATION_MANAGER',
  'SUPPORT_AGENT',
  'PLATFORM_ADMIN',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface ApiError {
  code: string;
  message: string;
  details: Record<string, unknown>;
  requestId: string;
}

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
}

export const REALTIME_EVENT_TYPES = [
  'queue.joined',
  'queue.position_changed',
  'queue.estimate_changed',
  'queue.prepare_to_leave',
  'queue.leave_now',
  'queue.arrival_window_started',
  'queue.skipped',
  'queue.grace_period_expiring',
  'queue.no_show',
  'queue.cancelled',
  'queue.station_cancelled',
  'pump.assigned',
  'pump.service_started',
  'pump.service_completed',
  'pump.status_changed',
  'station.status_changed',
  'inventory.status_changed',
] as const;

export type RealtimeEventType = (typeof REALTIME_EVENT_TYPES)[number];

export interface RealtimeEvent<T = Record<string, unknown>> {
  type: RealtimeEventType;
  occurredAt: string;
  payload: T;
}
