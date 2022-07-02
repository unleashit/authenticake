import { debugLog } from '@authenticake/common';
import { RequestHandler } from 'express';

import {
  AuthError,
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
} from '../../lib/customErrors';
import { errors } from '../../lib/messages';
import { AsyncRequestHandler, catchAsync } from '../../lib/middleware';
import { decodeBase64QueryString, isEmpty } from '../../lib/utils';
import { JWTPayload } from '../../model/types/Jwt';
import { decodeToken, getToken } from '../authentication';
import ServerAuth from '../ServerAuth/ServerAuth';
import {
  AuthConfig,
  AuthProps,
  JwtOptions,
} from '../ServerAuth/types/authProps';
import { checkBlacklist } from './blacklist';
import checkAuthorization from './checkAuthorization';
import RBAC from './rbac';

// import { catchAsync } from './errors';

// const checkGrants = (expected: string, actual: string[]) =>
//   actual.includes(expected);

// called when Auth Server and API are the same app
export const authorizationRoute = (
  perms: string | false = 'authenticated',
): RequestHandler =>
  catchAsync(async (req, res, next) => {
    const { rbac, config } = await ServerAuth();
    const { accessSecret, blacklist } = config.localAuth.options as JwtOptions;

    const token = getToken('access', req);

    const authed = await checkAuthorization(perms, {}, token);

    if (!authed) {
      next(new ForbiddenError());
    }

    res.locals.user = 1;

    // handle session if appropriate

    return next();

    // false means public only route
    // if (perms === false) {
    //   // reject requests that claim to be authenticated
    //   // TODO: should verify the token?
    //   if (token) {
    //     debugLog.warning(
    //       'Token found in request of unauthenticated only route',
    //     );
    //     return next(new ForbiddenError(errors.forbidden));
    //   }
    //
    //   return next();
    // }
    //
    // if (!token) {
    //   return next(new UnauthorizedError(errors.tokenMissing));
    // }

    // try {
    //   const decoded: JWTPayload = await decodeToken(token, accessSecret);
    //
    //   console.log(req.originalUrl);

    // skip /blacklist route to avoid endless loop
    // if (
    //   (blacklist === 'refresh' || blacklist === 'access') &&
    //   !/\/blacklist\//.test(req.originalUrl)
    // ) {
    //   checkBlacklist(decoded.user_id, accessSecret)
    //     .then(async () => {
    //       if (await rbac.can(decoded.roles, perms)) {
    //         res.locals.user = decoded;
    //         // req.session!.user = decoded;
    //         return next();
    //       }
    //
    //       console.log('checkGrants() after checkBlackList() failed');
    //     })
    //     .catch((err) => {
    //       next(err);
    //     });
    // }

    // if (await rbac.can(decoded.roles, perms)) {
    //   res.locals.user = decoded;
    //   // req.session!.user = decoded;
    //   return next();
    // }
    //
    // console.log('checkGrants() failed');

    // return next(new ForbiddenError());
    // } catch (err) {
    //   next(
    //     err instanceof AuthError && err.status === 401
    //       ? err
    //       : new AuthError(errors.forbidden, { status: 403 }),
    //   );
    // }
  });

// export const active = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     if (isLoggedIn(req)) {
//       const now = Date.now();
//       const { createdAt } = req.session as Express.Session;
//
//       if (now > createdAt + SESSION_ABSOLUTE_TIMEOUT) {
//         await logOut(req, res);
//
//         return next(new AuthError('Session expired', { status: 401 }));
//       }
//     }
//
//     next();
//   },
// );
