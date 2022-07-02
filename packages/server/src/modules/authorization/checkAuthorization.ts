import { debugLog } from '@authenticake/common';

import {
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
} from '../../lib/customErrors';
import { errors } from '../../lib/messages';
import { JWTPayload } from '../../model/types/Jwt';
import Authenticake from '../ServerAuth/ServerAuth';
import { JwtOptions } from '../ServerAuth/types/authProps';
import { decodeToken } from './index';
import RBAC from './rbac';

const handleJWT = async (
  config: any,
  rbac: RBAC,
  perms: any,
  params: any,
  token: any,
) => {
  try {
    const { accessSecret, blacklist } = config.localAuth.options as JwtOptions;
    const decoded: JWTPayload = await decodeToken(token, accessSecret);

    // console.log(req.originalUrl);

    if (await rbac.can(decoded.roles, perms, params)) {
      // res.locals.user = decoded;
      // req.session!.user = decoded;
      return true;
    }

    debugLog.info('checkGrants() failed');
    return false;
  } catch (err) {
    debugLog.error(err);

    throw new BadRequestError('Unable to parse jwt');
  }
};

const checkAuthorization = async (
  perms: string | false,
  params: Record<string, any>,
  token?: string,
): Promise<boolean> => {
  const { config, rbac } = await Authenticake();
  const { type: authType } = config.localAuth;

  // false perms means unauthed only route
  if (perms === false) {
    // reject requests that claim to be authenticated
    // TODO: should verify the token?
    if (token) {
      debugLog.warning('Token found in request of unauthenticated only route');
      throw new ForbiddenError(errors.forbidden);
    }

    return true;
  }

  // perms != false so token is required
  if (!token) {
    throw new UnauthorizedError(errors.logoutFailure);
  }

  switch (authType) {
    case 'jwt':
      return handleJWT(config, rbac, perms, params, token);
    default:
      return false;
  }
};

export default checkAuthorization;
