import { SessionOptions } from '@authenticake/server';

const ONE_HOUR = 1000 * 60 * 60;
const THIRTY_MINUTES = ONE_HOUR / 2;

const { env } = process;

export const {
  SESSION_SECRET = 'please keep this secret, mate',
  SESSION_NAME = 'auth-sid',
  SESSION_IDLE_TIMEOUT = THIRTY_MINUTES,
  // API_ROOT = 'http://localhost',
  // PORT = 3000,
} = env;

export const SESSION_ABSOLUTE_TIMEOUT = +(
  env.SESSION_ABSOLUTE_TIMEOUT || ONE_HOUR * 6
);

export const SESSION_OPTIONS: SessionOptions = {
  secret: SESSION_SECRET,
  name: SESSION_NAME,
  cookie: {
    maxAge: +SESSION_IDLE_TIMEOUT,
    secure: false,
    sameSite: false,
    httpOnly: false,
    // domain: `${API_ROOT}:${PORT}`,
  },
  rolling: true,
  resave: false,
  saveUninitialized: false,
};

interface JwtOptions {
  useCookie: boolean | 'refresh' | 'access';
  // TODO: add all cookie opts
  cookieOpts?: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: boolean;
  };
  refreshExpires: number | string;
  accessExpires: number | string;
  refreshExpiresMS?: number;
  accessExpiresMS?: number;
}

export const JWT_OPTIONS: JwtOptions = {
  useCookie: 'refresh',
  cookieOpts: {
    httpOnly: false,
    secure: false,
    sameSite: false,
  },
  refreshExpires: '2d', // in seconds
  refreshExpiresMS: ONE_HOUR * 48, // in ms
  accessExpires: '15m', // in seconds
  accessExpiresMS: THIRTY_MINUTES / 2, // in ms
};
