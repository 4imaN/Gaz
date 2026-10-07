import { z } from 'zod';

const url = z.string().url();

export const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: url,
  REDIS_URL: url,
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  OTP_HASH_SECRET: z.string().min(32),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type Environment = z.infer<typeof environmentSchema>;

export function parseEnvironment(input: Record<string, unknown>): Environment {
  return environmentSchema.parse(input);
}

export const pilotConfigurationSchema = z.object({
  defaultServiceMinutes: z.number().positive().default(6),
  maximumJoiningTravelMinutes: z.number().positive().default(45),
  arrivalBufferMinutes: z.number().nonnegative().default(5),
  gracePeriodMinutes: z.number().positive().default(10),
  maximumTrafficExtensionMinutes: z.number().nonnegative().max(5).default(5),
  nearStationRadiusMetres: z.number().positive().default(300),
  arrivalRadiusMetres: z.number().positive().default(100),
});

export type PilotConfiguration = z.infer<typeof pilotConfigurationSchema>;
