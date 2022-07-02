import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { AuthError } from '../../lib/customErrors';
import generateJWT from '../../lib/generateJWT';
import { errors } from '../../lib/messages';
import { JWTPayload } from '../../model/types/Jwt';
import { getToken } from '../authentication';

const { JWT_SECRET = 'secret', REFRESH_TOKEN_SECRET = 'secret2' } = process.env;

const checkSession = async (req: Request, _token: any): Promise<boolean> =>
  !!req.session?.userId;

interface RefreshReq {
  accessToken: string;
  refreshToken: string;
}

const refresh = async (
  req: Request<any, any, RefreshReq>,
  res: Response,
  next: NextFunction,
) => {
  // const { refreshToken } = req.body;
  const refreshToken = getToken('refresh', req);

  if (!refreshToken) {
    return next(new AuthError('Token is missing', { status: 400 }));
  }

  // if (!isLoggedIn(req)) {
  //   return next(new AuthError('You must be logged in to do that', { status: 400 }));
  // }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
    console.log(`decoded: ${JSON.stringify(decoded)}`);

    if (err) {
      return next(new AuthError(err.message, { status: 401 }));
    }

    if (!req.session?.userId) {
      return next(new AuthError(errors.sessionNotFound, { status: 401 }));
    }

    if (!decoded) {
      return next(new AuthError(errors.cannotExtractToken, { status: 400 }));
    }

    const { user_id, email, roles, type } = decoded as JWTPayload;

    if (type === undefined || type !== 'refresh') {
      return next(new AuthError(errors.cannotExtractToken, { status: 400 }));
    }

    const accessToken = generateJWT({
      type: 'access',
      user: { user_id, email, roles },
      secret: JWT_SECRET,
      expires: 0,
    });

    // TEMP
    const ONE_HOUR = 1000 * 60 * 60;
    const THIRTY_MINUTES = ONE_HOUR / 2;
    const JWT_OPTIONS = {
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

    const useATCookie = [true, 'access'].includes(JWT_OPTIONS.useCookie);

    if (useATCookie) {
      res.cookie('auth-at', accessToken, {
        maxAge: JWT_OPTIONS.accessExpiresMS,
        ...JWT_OPTIONS.cookieOpts,
      });
    }

    res.json({
      success: true,
      accessToken: useATCookie ? undefined : accessToken,
    });
  });

  // return undefined;
};

export default refresh;
