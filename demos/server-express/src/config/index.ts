import { RedisOptions, SessionOptions } from '@authenticake/server';

const ONE_HOUR = 1000 * 60 * 60;
const THIRTY_MINUTES = ONE_HOUR / 2;

const { env } = process;

export const {
  SESSION_SECRET = 'what a password',
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
  // name: SESSION_NAME,
  // cookie: {
  //   // maxAge: +SESSION_IDLE_TIMEOUT,
  //   secure: false,
  //   sameSite: false,
  //   httpOnly: false,
  //   // domain: `${API_ROOT}:${PORT}`,
  // },
  // rolling: false,
  // resave: false,
  // saveUninitialized: false,
};

const {
  REDIS_PORT = 6379,
  REDIS_HOST = 'localhost',
  REDIS_PASSWORD = 'secret32',
} = process.env;

export const REDIS_OPTIONS: RedisOptions = {
  port: +REDIS_PORT,
  host: REDIS_HOST,
  password: REDIS_PASSWORD,
};
