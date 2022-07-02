import { debugLog } from '@authenticake/common';
import argon2 from 'argon2';

import { InternalServerError } from '../../lib/customErrors';
import { BaseSession } from '../../model/types/User';
import ServerAuth from '../ServerAuth/ServerAuth';

const verifyPassword = async (
  ours: string,
  theirs: string,
): Promise<boolean> => {
  try {
    return await argon2.verify(ours, theirs);
  } catch (err) {
    debugLog.error(err);
    throw new InternalServerError();
  }
};

const loginService = async (
  email: string,
  password: string,
): Promise<BaseSession | false> => {
  const { dbQuery } = await ServerAuth();

  const user = await dbQuery.findUserByEmail({ email });

  if (
    user?.email === email &&
    user.password &&
    (await verifyPassword(user.password, password))
  ) {
    return user;
  }

  return false;
};

export default loginService;
