// express-session custom properties
import { AuthConfig } from './modules/ServerAuth/types/authProps';

// add props to express session
declare module 'express-session' {
  interface SessionData {
    userId?: string | number;
    createdAt?: number;
    jwt?: string;
  }
}

// add authContext prop to req
declare global {
  namespace Express {
    interface Application {
      authContext: AuthConfig;
    }
    interface Request {
      authContext: AuthConfig;
    }
  }
}

export {};
