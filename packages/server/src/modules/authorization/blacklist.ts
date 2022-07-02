import { debugLog } from '@authenticake/common';

import { AuthError } from '../../lib/customErrors';
import generateJWT from '../../lib/generateJWT';
import { errors } from '../../lib/messages';
import nativeRequest from '../../lib/nativeRequest';

export const checkBlacklist = async (
  userId: string | number,
  // useBlacklist: JwtOptions['useBlacklist'],
  secret: string,
): Promise<any> => {
  const authServerURL =
    process.env.AUTHORIZATION_SERVER || 'http://localhost:3000';

  try {
    const token = generateJWT({
      type: 'access',
      user: { user_id: 0, email: 'system', roles: ['admin'] },
      secret,
      expires: 20000000,
    });

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    interface Data {
      found: boolean;
    }

    const { data } = await nativeRequest.post<Data>(
      `${authServerURL}/blacklist/${userId}`,
      { headers },
      undefined,
      true,
    );

    if ((data as Data).found) {
      // TODO: delete cookies and/or localstorage?

      throw new Error(`Found blacklisted token belonging to: ${userId}`);
    }
  } catch (err) {
    debugLog.error(err);
    throw new AuthError(errors.unauthorized, { status: 401 });
  }
};
