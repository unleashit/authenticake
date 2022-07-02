// called via REST when API/Authorize request  is not part of the auth server
import { debugLog } from '@authenticake/common';
import { RequestHandler } from 'express';

import { catchAsync } from '../../lib/middleware';
import { decodeBase64QueryString, isEmpty } from '../../lib/utils';
import { JWTPayload } from '../../model/types/Jwt';
import { decodeToken, getToken } from '../authentication';
import Authenticake from '../ServerAuth/ServerAuth';
import { JwtOptions } from '../ServerAuth/types/authProps';
import checkAuthorization from './checkAuthorization';

export const authorizationServiceRoute: RequestHandler = catchAsync(
  async (req, res, _next) => {
    // ensure a valid system token, or 401 / 403

    const serverAuth = await Authenticake();
    const { rbac } = serverAuth;
    const { localAuth, session } = req.authContext;
    const { accessSecret } = localAuth.options as JwtOptions;

    const perms = req.params.perms
      ? decodeBase64QueryString(req.params.perms)
      : 'authenticated';

    const token = getToken('access', req);

    const authed = await checkAuthorization(perms, req.query, token);

    // return res.sendStatus(authed ? 200 : 403);

    // unauthed only route like login or signup
    if (perms === false) {
      if (!token) {
        // unauthed can pass
        res.sendStatus(200);
        return;
      }
      // Forbidden, since unauthed/public only route
      // for example login or signup should return 403 for an authenticated user
      res.sendStatus(403);
      return;
    }

    if (!token) {
      res.sendStatus(400);
      return;
    }

    if (localAuth.type === 'jwt') {
      let jwtPayload: JWTPayload;

      try {
        // authenticate and decode jwt payload
        jwtPayload = await decodeToken(token, accessSecret);
      } catch (err) {
        debugLog.info('User failed authentication');
        debugLog.info(err);
        res.sendStatus(401);
        return;
      }

      const params = {
        session: jwtPayload,
        // perms,
        // ...(!isEmpty(req.params) && { params: req.params }),
        ...(!isEmpty(req.query) && { params: req.query }),
      };

      debugLog.info(jwtPayload.roles);
      debugLog.info(perms);
      debugLog.info(params);

      // authorize
      if (await rbac.can(jwtPayload.roles, perms, params)) {
        res.sendStatus(200);
        return;
      }
    } else if (localAuth.type === 'classic') {
      debugLog.info('Classic sessions are not yet implemented');
      res.sendStatus(500);
      return;
    } else {
      debugLog.error(
        'Only JWTs and classic sessions are supported in the Alpha',
      );
      res.sendStatus(500);
      return;
    }

    // reject requests that claim to be authenticated
    // if (grants === false) {
    //   // TODO: should verify the token?
    //   if (token) {
    //     debugLog.warning('Token found in request of unauthenticated only route');
    //     return next(new ForbiddenError(errors.forbidden));
    //   }
    //
    //   return next();
    // }

    // Failed RBAC or anything else, return Forbidden
    res.sendStatus(403);
  },
);
