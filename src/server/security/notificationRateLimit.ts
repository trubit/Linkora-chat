import rateLimit, { type Options as RateLimitOptions } from 'express-rate-limit';
import type { RequestHandler } from 'express';
import { RedisStore, type SendCommandFn } from 'rate-limit-redis';
import { redisClient } from '../redis/connection.js';

function buildRedisStore(prefix: string): RedisStore {
  const sendCommand: SendCommandFn = (...args: string[]) => {
    if (redisClient.status !== 'ready') {
      return Promise.resolve('') as ReturnType<SendCommandFn>;
    }
    return redisClient.call(args[0], ...args.slice(1)) as ReturnType<SendCommandFn>;
  };
  return new RedisStore({ sendCommand, prefix: `rl:${prefix}:` });
}

function buildOpts(
  windowMs: number,
  max: number,
  prefix: string,
  message: string,
): Partial<RateLimitOptions> {
  return {
    windowMs,
    max,
    store: buildRedisStore(prefix) as RateLimitOptions['store'],
    standardHeaders: 'draft-7' as const,
    legacyHeaders: false,
    message: { success: false, error: message },
    skip: () => process.env['NODE_ENV'] !== 'production',
  };
}

// 60 reads per minute per user
export const notificationReadLimiter: RequestHandler = rateLimit(
  buildOpts(60_000, 60, 'notif-read', 'Too many notification requests.') as RateLimitOptions,
);

// 5 status posts per hour per user
export const statusCreateLimiter: RequestHandler = rateLimit(
  buildOpts(60 * 60_000, 5, 'status-create', 'You can only post 5 status updates per hour.') as RateLimitOptions,
);

// 30 searches per minute per user
export const searchLimiter: RequestHandler = rateLimit(
  buildOpts(60_000, 30, 'search', 'Too many search requests.') as RateLimitOptions,
);
