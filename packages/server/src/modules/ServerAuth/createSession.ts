import { debugLog } from '@authenticake/common';
import pgSimple from 'connect-pg-simple';
import connectRedis from 'connect-redis';
import { RequestHandler } from 'express';
import expressSession, { Store } from 'express-session';
import { Redis } from 'ioredis';
import { Pool } from 'pg';

import { AuthConfig, CacheClient } from './types/authProps';

// const maxAgeToExpires = (maxAge: number) =>
//   new Date(Date.now() + maxAge * 1000);

function createSession(
  { type: cacheType }: AuthConfig['cache'],
  { type: sessionType, options }: AuthConfig['session'],
  sessionTblName: string,
  client?: CacheClient,
): RequestHandler | undefined {
  if (cacheType === 'none' || sessionType === 'none' || !options) {
    return;
  }

  // TODO: move to auth props validation
  if (sessionType !== 'express') {
    throw new Error('Invalid session type. Please choose `express` or `none`');
  }

  if (cacheType === 'redis') {
    const RedisStore = connectRedis(expressSession);
    const store: Store = new RedisStore({ client: client as Redis });

    return expressSession({ ...options, store });
  }

  if (cacheType === 'database') {
    const PGSession = pgSimple(expressSession);
    const store = new PGSession({
      pool: client as Pool, // Connection pool
      tableName: sessionTblName,
    });

    return expressSession({ ...options, store });
  }

  // default to memory
  debugLog.warning(
    'Using express-session memory store. Do not use in production',
  );
  return expressSession(options);
}

export default createSession;
