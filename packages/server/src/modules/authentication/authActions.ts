import { debugLog } from '@authenticake/common';
import { Request, Response } from 'express';
import jwt, { VerifyCallback } from 'jsonwebtoken';

import { AuthError } from '../../lib/customErrors';
import { errors } from '../../lib/messages';
import { JWTPayload } from '../../model/types/Jwt';
import { JwtOptions } from '../ServerAuth/types/authProps';

export const isLoggedIn = (req: Request) => req.session && !!req.session.userId;

export const logIn = (
  req: Request,
  userId: string | number,
  // accessToken?: string,
): void => {
  // const { session /* localAuth */ } = req.authContext;

  // if (localAuth.type === 'jwt') {
  //   const options = localAuth.options as JwtOptions;
  //
  //   if (session.type === 'express' && options.blacklist === 'whitelist') {
  //     req.session.jwt = accessToken;
  //   }
  // }

  // write to express session if available
  // else declare req.session object and store basic info
  req.session = req.session || {};
  req.session.userId = userId;
  req.session.createdAt = Date.now();
};

export const logOut = (req: Request, res: Response): void | Promise<void> => {
  const { localAuth, session } = req.authContext;
  // const { sessionType } = standardAuth.options as JwtOptions;

  if (localAuth.type !== 'jwt') {
    debugLog.error(`server logout for ${localAuth.type} not yet implemented`);
  }

  if (localAuth.type === 'jwt') {
    // remove access token cookie
    if ((localAuth.options as JwtOptions).accessInCookie) {
      debugLog.info('removing auth-at cookie');
      res.clearCookie('auth-at');
    }

    // remove refresh token cookie
    if ((localAuth.options as JwtOptions).refreshInCookie) {
      debugLog.info('removing auth-rt cookie');
      res.clearCookie('auth-rt');
    }

    // remove csrf cookies
    if ((localAuth.options as JwtOptions).useCSRF) {
      res.clearCookie('_csrf-ac');
      res.clearCookie('XSRF-TOKEN');
    }
  }

  // if no session, nothing left to do
  if (!req.session) {
    return;
  }

  // destroy session
  return new Promise((resolve, reject) => {
    req.session.destroy((err: Error) => {
      if (err) reject(err);

      res.clearCookie((session.options as any).name);
      resolve();
    });
  });
};

export const getToken = (
  type: 'access' | 'refresh',
  req: Request,
): string | undefined => {
  const { localAuth } = req.authContext;
  const { accessInCookie } = localAuth.options as JwtOptions;
  const { refreshInCookie } = localAuth.options as JwtOptions;
  // const { useCookie } = JWT_OPTIONS;
  // const opts = type === 'access' ? [true, 'access'] : [true, 'refresh'];

  if (
    (type === 'access' && accessInCookie) ||
    (type === 'refresh' && refreshInCookie)
  ) {
    const cookie = `auth-${type === 'access' ? 'at' : 'rt'}`;
    debugLog.info('cookie received: ', cookie, req.cookies[cookie]);
    return req.cookies[cookie];
  }

  const authHeader = req.header('Authorization');
  return authHeader ? authHeader.replace('Bearer ', '') : undefined;
};

export const decodeToken = async (
  token: string,
  secret: string,
  type: 'access' | 'refresh' = 'access',
): Promise<JWTPayload> =>
  new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (
        err ||
        !decoded ||
        typeof decoded !== 'object' ||
        decoded.type !== type
      ) {
        debugLog.error(err);
        reject(new AuthError(errors.unauthorized, { status: 401 }));
      } else {
        resolve(decoded as JWTPayload);
      }
    });
  });
