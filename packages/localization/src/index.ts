export const supportedLocales = ['en', 'am'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export const messages = {
  en: { common: { retry: 'Retry', offline: 'You are offline' } },
  am: { common: { retry: 'እንደገና ይሞክሩ', offline: 'ከበይነመረብ ተቋርጠዋል' } },
} as const;
