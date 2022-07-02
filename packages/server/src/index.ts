import ServerAuth from './modules/ServerAuth';

export default ServerAuth;

export * from './model';
export * from './lib';
export { csrfHelper } from './modules/csrf';
export type {
  AuthProps,
  JwtOptions,
  MiddlewareFnc,
  Middlewares,
} from './modules/ServerAuth/types/authProps';

// export relevant types from 3rd party packages
export type { SessionOptions } from 'express-session';
export type { RedisOptions } from 'ioredis';
export type { RequestHandler } from 'express';
