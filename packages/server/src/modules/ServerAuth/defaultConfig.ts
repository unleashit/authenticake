import { CookieOptions } from 'express';

import { RBACOpts } from '../authorization/rbac';
import { AuthConfig, AuthProps } from './types/authProps';

export const defaultMiddlewares = {
  onBeforeEach: [],
  onAfterEach: [],
  onBeforeLogin: [],
  onAfterLogin: [],
  onBeforeLogout: [],
  onAfterLogout: [],
  onBeforeRefresh: [],
  onAfterRefresh: [],
  onBeforeRegister: [],
  onAfterRegister: [],
  onBeforeForgotPasswordReq: [],
  onAfterForgotPasswordReq: [],
  onBeforeForgotPasswordConfirm: [],
  onAfterForgotPasswordConfirm: [],
  onBeforeErrorHandler: [],
};

const defaultSessionLength = 60 * 60 * 24 * 30;

// eslint-disable-next-line no-unused-vars
// @ts-ignore
const defaultCookieOpts = (config: AuthProps): CookieOptions => ({
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  path: config.basePath || '/',
});

const defaultSessionCookieOpts = (config: AuthProps): CookieOptions => ({
  ...defaultCookieOpts(config),
  maxAge: defaultSessionLength * 1000,
});

const authRoles: RBACOpts = {
  user: {
    can: [
      'authenticated',
      {
        name: 'account:read',
        when: ({ session, params }) =>
          session?.user_id.toString() === params?.account_id,
      },
      {
        name: 'account:write',
        when: ({ session, params }) =>
          session?.user_id.toString() === params?.account_id,
      },
      {
        name: 'profile:read',
        when: ({ session, params }) =>
          session?.user_id.toString() === params?.profile_id,
      },
      {
        name: 'profile:write',
        when: ({ session, params }) =>
          session?.user_id.toString() === params?.profile_id,
      },
    ],
  },
  manager: {
    can: [
      'account:read',
      'account:write',
      'account:create',
      'profile:read',
      'profile:write',
      'profile:create',
    ],
    inherits: ['user'],
  },
  admin: {
    can: ['*'],
  },
};

export const defaultOpts = (config: AuthProps): Required<AuthProps> => ({
  database: {
    type: 'postgres',
    schema: {
      sync: false,
      force: false,
      userTblName: 'users',
      accountTblName: 'accounts',
      profileTblName: 'profiles',
      sessionTblName: 'session',
      defaultAccount: {
        email: 'admin@example.com',
        password: 'admin',
        roles: ['admin'],
      },
    },
  },
  cache: {
    type: 'none',
  },
  session: {
    type: 'none',
    options: {
      secret: 'keyboard cat',
      name: 'auth-sid',
      resave: false,
      saveUninitialized: false,
      cookie: defaultSessionCookieOpts(config),
    },
    useSessionHandler: true,
  },
  localAuth: {
    type: 'jwt',
    options: {
      accessSecret: 'secret123',
      accessExpires: defaultSessionLength,
      accessCookieOpts: defaultCookieOpts(config),
      useRefreshToken: false,
      refreshExpires: defaultSessionLength,
      refreshCookieOpts: defaultCookieOpts(config),
      useCSRF: true,
      blacklist: 'none',
    },
  },
  socialAuth: [],
  validations: {},
  authorization: authRoles,
  middlewares: defaultMiddlewares,
  basePath: '/',
  useErrorHandler: true,
  logger: console.error,
});
