import type { CorsOptions } from 'cors';
import { getEnv } from '../config/env.js';

// --------------------------------------------------------------------------
// Allowed origins
// --------------------------------------------------------------------------

export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // Server-to-server, mobile native, curl

  const env = getEnv();
  if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
    return true; // Allow all origins in dev mode (mobile on Wi-Fi, localtunnel, ngrok)
  }

  if (origin === env.CLIENT_URL) return true;

  // Allow local network IP addresses (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  if (
    /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(
      origin,
    )
  ) {
    return true;
  }

  // Allow localtunnel & ngrok development tunnels
  if (/\.(loca\.lt|ngrok-free\.app|ngrok\.io)$/.test(origin)) {
    return true;
  }

  return false;
}

// --------------------------------------------------------------------------
// CORS options for Express
// --------------------------------------------------------------------------

export const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ): void => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' is not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token',
  ],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400, // 24 h preflight cache
  optionsSuccessStatus: 204,
};
