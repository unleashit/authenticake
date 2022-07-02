import { debugLogAlways } from '@authenticake/common';
import cookieParser from 'cookie-parser';
import csurf, { CookieOptions } from 'csurf';
import { NextFunction, RequestHandler, Router } from 'express';

// export const csrfSetter: RequestHandler = (req, res, next) => {
//   res.cookie('XSRF-TOKEN', req.csrfToken());
//   next();
// };

// interface CsrfOpts {
//   cookiePath?: string;
//   setCSRFCookiePath?: string;
// }

export const csrfHelper = (
  app: Router,
  { cookiePath = '/', setCSRFCookiePath = '*' }: any = {},
): RequestHandler => {
  const sharedCookieOpts: CookieOptions = {
    path: cookiePath,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  };

  const csrfProtection = csurf({
    cookie: {
      ...sharedCookieOpts,
      key: '_csrf-ac',
      // maxAge: 3600,
    },
  });

  app.use(cookieParser(), csrfProtection);

  // set XSRF-TOKEN only on GET requests
  app.get(setCSRFCookiePath, (req, res, next) => {
    if (res.headersSent) {
      debugLogAlways(
        'Cannot set CSRF token cookie, headers already sent',
        'warning',
      );
    } else {
      res.cookie('XSRF-TOKEN', req.csrfToken(), sharedCookieOpts);
    }

    next();
  });

  return csrfProtection;
};
