import {
  CookieOptions,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';
import { SessionOptions } from 'express-session';
import Redis, { RedisOptions } from 'ioredis';
import { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { Pool, PoolConfig } from 'pg';

import { PGSchemaOpts } from '../../../model/postgres/types/schema';
import { JWTPayload } from '../../../model/types/Jwt';
import { BaseSession } from '../../../model/types/User';
import { RBACOpts } from '../../authorization/rbac/lib/types';
import { YupSchemas } from './validationTypes';

// interface Database extends ClientConfig {
//   type: 'postgres' | 'none';
// }

export type DbClient = Pool; // so far, we just support Postgres
export type SchemaOptions = PGSchemaOpts;

export interface Database {
  type: 'postgres';
  options?: PoolConfig;
  /** pg-node options * */
  schema?: SchemaOptions;
}

// export type RedisConn = { type: 'redis' } & RedisOptions;
// type Cache = RedisConn | { type: 'none' };

export type CacheClient = Redis | Pool; // TODO: verify Redis type (used to be Redis.Redis)
export type CacheOptions = RedisOptions | PoolConfig;

interface CacheProvider {
  type: 'redis' | 'database' | 'memory' | 'none';
  options?: CacheOptions;
}

/*
 * express session without auth
 * -express session with classic auth
 * jwt with no session
 * jwt in express session
 * jwt with blacklist of refresh tokens in session
 * jwt with blacklist of access tokens in session (no RTs)
 * */

interface Session {
  type: 'express' | 'none';
  options?: SessionOptions;
  useSessionHandler?: boolean;
  sessionMiddleware?: RequestHandler; // can access req.session
}

export interface JwtOptions {
  accessSecret: string; // currently only supporting
  accessExpires?: number; // TTL in seconds
  accessInCookie?: boolean;
  accessCookieOpts?: Omit<CookieOptions, 'maxAge' | 'expires'>;
  customPayload?: <T extends JWTPayload>(
    payload: JWTPayload,
    user: BaseSession,
  ) => T; // add to default jwt payload
  useRefreshToken?: boolean; // default: false
  refreshSecret?: string;
  refreshExpires?: number; // TTL in seconds
  refreshInCookie?: boolean; // default: false
  refreshCookieOpts?: Omit<CookieOptions, 'maxAge' | 'expires'>;
  useCSRF: boolean;
  blacklist?: 'refresh' | 'access' | 'whitelist' | 'none';
  customSignOpts?: Omit<SignOptions, 'payload'>; // from jsonwebtoken
  customVerifyOpts?: VerifyOptions; // from jsonwebtoken
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ClassicOptions {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface PasswordlessOptions {}

export interface LocalAuth {
  type: 'jwt' | 'classic' | 'passwordless' | 'none';
  options: JwtOptions | ClassicOptions | PasswordlessOptions;
  passwordFieldName?: string; // default: password
  emailFieldName?: string; // default: email
}

interface SocialLogin {
  name: 'google' | 'facebook' | 'twitter' | 'github';
  clientId: string;
  secret: string;
}

export type MiddlewareFnc = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void;

export interface Middlewares {
  onBeforeEach?: MiddlewareFnc[];
  onAfterEach?: MiddlewareFnc[];
  onBeforeLogin?: MiddlewareFnc[];
  onAfterLogin?: MiddlewareFnc[];
  onBeforeLogout?: MiddlewareFnc[];
  onAfterLogout?: MiddlewareFnc[];
  onBeforeRefresh?: MiddlewareFnc[];
  onAfterRefresh?: MiddlewareFnc[];
  onBeforeRegister?: MiddlewareFnc[];
  onAfterRegister?: MiddlewareFnc[];
  onBeforeForgotPasswordReq?: MiddlewareFnc[];
  onAfterForgotPasswordReq?: MiddlewareFnc[];
  onBeforeForgotPasswordConfirm?: MiddlewareFnc[];
  onAfterForgotPasswordConfirm?: MiddlewareFnc[];
  onBeforeErrorHandler?: (MiddlewareFnc | ((...args: any[]) => void))[];
}

// export type Resources = 'account' | 'profile';

export interface AuthProps {
  database: Database;
  cache?: CacheProvider;
  session?: Session;
  localAuth?: LocalAuth;
  socialAuth?: SocialLogin[];
  validations?: YupSchemas;
  authorization?: RBACOpts;
  basePath?: string;
  useErrorHandler?: boolean;
  middlewares?: Middlewares;
  logger?: (...args: any) => void;
}
type ConfigParts = Exclude<AuthProps, 'middlewares' | 'logger'>;
export type AuthConfig = Required<ConfigParts>;
