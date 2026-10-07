import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import pino from 'pino';
import { parseEnvironment } from '@fuel-queue/config';

const config = parseEnvironment(process.env);
const logger = pino({ level: config.LOG_LEVEL });
const connection = new Redis(config.REDIS_URL, { maxRetriesPerRequest: null });
const queueNames = [
  'notifications',
  'queue-timing',
  'eta-refresh',
  'late-arrival',
  'inventory',
  'reporting',
  'cleanup',
  'audit',
];
const workers = queueNames.map(
  (name) =>
    new Worker(
      name,
      async (job) => {
        logger.info({ queue: name, jobId: job.id }, 'Received background job');
      },
      { connection },
    ),
);

for (const worker of workers) {
  worker.on('failed', (job, error) => logger.error({ jobId: job?.id, error }, 'Background job failed'));
}

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'Shutting down background worker');
  await Promise.all(workers.map((worker) => worker.close()));
  connection.disconnect();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
