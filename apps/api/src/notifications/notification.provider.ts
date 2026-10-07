export interface NotificationMessage {
  userId: string;
  titleKey: string;
  bodyKey: string;
  data: Record<string, string>;
}

export interface NotificationProvider {
  send(message: NotificationMessage): Promise<void>;
}

export const NOTIFICATION_PROVIDER = Symbol('NOTIFICATION_PROVIDER');
