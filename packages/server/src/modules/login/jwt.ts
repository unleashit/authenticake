import { debugLog } from '@authenticake/common';
import { Request, Response } from 'express';

import { UnauthorizedError } from '../../lib/customErrors';
import generateJWT from '../../lib/generateJWT';
import * as messages from '../../lib/messages';
import { BaseSession } from '../../model/types/User';
import { logIn } from '../authentication';
import { JwtOptions } from '../ServerAuth/types/authProps';
import loginService from './loginService';
import { LoginSchema } from './validationSchema';

export function generateTokensAndCookies(
  res: Response,
  user: BaseSession,
  {
    accessSecret,
    accessExpires,
    accessInCookie,
    accessCookieOpts,
    customPayload,
    refreshSecret,
    refreshExpires,
    useRefreshToken,
    refreshInCookie,
    refreshCookieOpts,
  }: Required<JwtOptions>,
) {
  const accessToken = generateJWT({
    type: 'access',
    user,
    secret: accessSecret,
    expires: accessExpires,
    customPayload,
  });

  const refreshToken =
    useRefreshToken &&
    generateJWT({
      type: 'refresh',
      user,
      secret: refreshSecret,
      expires: refreshExpires,
    });

  // logger.info(req.session!);

  // req.session!.refresh = refreshToken;
  if (accessInCookie) {
    debugLog.info('Setting access token cookie');
    res.cookie('auth-at', accessToken, {
      ...accessCookieOpts,
      expires: new Date(Date.now() + accessExpires * 1000), // convert secs to ms
    });
  }

  if (refreshInCookie) {
    debugLog.info('Setting refresh token cookie');
    res.cookie('auth-rt', refreshToken, {
      ...refreshCookieOpts,
      expires: new Date(Date.now() + refreshExpires * 1000), // convert secs to ms
    });
  }

  return { accessToken, refreshToken };
}

async function handleJWT(
  req: Request,
  res: Response,
  { email, password }: LoginSchema,
) {
  const { localAuth } = req.authContext;
  const { accessInCookie, useRefreshToken, refreshInCookie } =
    localAuth.options as JwtOptions;

  const jwtOptions = localAuth.options as Required<JwtOptions>;

  const user = await loginService(email, password);

  if (!user) {
    throw new UnauthorizedError(messages.errors.loginFailure);
  }

  const { accessToken, refreshToken } = generateTokensAndCookies(
    res,
    user,
    jwtOptions,
  );

  logIn(req, user.user_id);

  debugLog.info(`${user.user_id} logged in`);

  res.json({
    ...(!accessInCookie && { accessToken }),
    ...(useRefreshToken && !refreshInCookie && { refreshToken }),
  });
}

export default handleJWT;
