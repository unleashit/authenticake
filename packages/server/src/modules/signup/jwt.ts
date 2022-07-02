import { debugLog } from '@authenticake/common';
import argon2 from 'argon2';
import { Request, Response } from 'express';

import { ConflictError, InternalServerError } from '../../lib/customErrors';
import { logIn } from '../authentication/authActions';
import { generateTokensAndCookies } from '../login/jwt';
import ServerAuth from '../ServerAuth/ServerAuth';
import { JwtOptions } from '../ServerAuth/types/authProps';
import { SignupSchema } from './signupSchema';

async function handleJWT(
  req: Request,
  res: Response,
  { email, password }: SignupSchema,
  standardAuthOpts: Required<JwtOptions>,
): Promise<void> {
  const { dbQuery } = await ServerAuth();
  const { accessInCookie, useRefreshToken, refreshInCookie } = standardAuthOpts;

  const found = await dbQuery.findUserByEmail({ email });

  if (found) {
    throw new ConflictError(
      'There is already an account associated with that email',
    );
  }

  let hashedPassword: string;
  try {
    hashedPassword = await argon2.hash(password);
  } catch (err) {
    debugLog.error(err);
    throw new InternalServerError();
  }

  const user = await dbQuery.createUser({ email, password: hashedPassword });

  debugLog.info(`New user created: ${user.user_id} - ${email}`);

  logIn(req, user.user_id);

  const { accessToken, refreshToken } = generateTokensAndCookies(
    res,
    user,
    standardAuthOpts,
  );

  res.json({
    userId: user.user_id,
    ...(!accessInCookie && { accessToken }),
    ...(useRefreshToken && !refreshInCookie && { refreshToken }),
  });
}

export default handleJWT;
