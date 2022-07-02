import { RedisOptions } from '@authenticake/server';

const {
  REDIS_PORT = 6379,
  REDIS_HOST = 'localhost',
  REDIS_PASSWORD = 'secret32',
} = process.env;

const REDIS_OPTIONS: RedisOptions = {
  port: +REDIS_PORT,
  host: REDIS_HOST,
  password: REDIS_PASSWORD,
};

export const CACHE = {
  type: 'redis',
  ...REDIS_OPTIONS,
};
