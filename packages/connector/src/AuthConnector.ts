import { debugLog } from '@authenticake/common';
// import {
//   BadRequestError,
//   ForbiddenError,
//   UnauthorizedError,
// } from '@authenticake/server/src/lib/customErrors';
// import generateJWT from '@authenticake/server/src/lib/generateJWT';
// import { errors } from '@authenticake/server/src/lib/messages';
// import { catchAsync } from '@authenticake/server/src/lib/middleware';
// import nativeRequest from '@authenticake/server/src/lib/nativeRequest';
// import {
//   encodeBase64QueryString,
//   isEmpty,
// } from '@authenticake/server/src/lib/utils';
// import { getToken } from '@authenticake/server/src/modules/authentication';
// import {
//   DefaultResources,
//   Permission,
// } from '@authenticake/server/src/modules/authorization/rbac';
// import { csrfHelper } from '@authenticake/server/src/modules/csrf';
// import express, {
//   NextFunction,
//   Request,
//   RequestHandler,
//   Response,
// } from 'express';
// import querystring from 'querystring';
// import url from 'url';

// type Perms<RESOURCES extends string> =
//   | Permission<RESOURCES>
//   | Permission<RESOURCES>[]
//   | 'authenticated'
//   | false;
//
// interface ConnectorParams {
//   host: string;
//   secret?: string;
//   logger: (msg: string) => void;
// }

// export class AuthConnector {
//   secret: string | undefined;
//
//   host: string;
//
//   csrfHelper;
//
//   logger: ConnectorParams['logger'];
//
//   constructor({
//     host,
//     secret,
//     logger = (msg) => console.log(msg),
//   }: ConnectorParams) {
//     if (host !== 'self' && !secret) {
//       debugLogAlways('Must provide authorization server secret', 'error');
//       process.exit(1);
//     }
//
//     this.host = host;
//     this.secret = secret || undefined;
//     this.csrfHelper = csrfHelper;
//     this.logger = logger;
//   }
//
//   // eslint-disable-next-line class-methods-use-this
//   callLocal<RESOURCES extends string>(
//     _req: Request,
//     _res: Response,
//     _next: NextFunction,
//     _perms: Perms<RESOURCES>,
//   ) {}
//
//   async callRemote(
//     req: Request,
//     _res: Response,
//     next: NextFunction,
//     perms: any,
//   ) {
//     // const authorizationToken = generateToken({
//     //   type: 'access',
//     //   user: { user_id: 0, email: 'system', roles: ['*'] },
//     //   secret: this.secret as string,
//     //   expires: 10000,
//     // });
//
//     // temp
//     const authorizationToken = 123;
//
//     // const clientAuthHeader = req.headers.Authorization;
//
//     const headers = {
//       ...req.headers,
//       // ...(clientAuthHeader && {
//       //   'X-Forwarded-Authorization': clientAuthHeader,
//       // }),
//       'X-Authorization': `Bearer ${authorizationToken}`,
//     };
//
//     // const parsedUrl = url.parse(req.url).query || {};
//     // const newQueryString = new URLSearchParams(parsedUrl);
//     const { searchParams } = new URL(req.url);
//
//     // add param(s) to query string
//     // WARNING: params will override query vars of same name
//     if (!isEmpty(req.params)) {
//       Object.entries(req.params).forEach(([key, value]) => {
//         if (searchParams.has(key)) {
//           this.logger(
//             `Warning: query string key '${key}' overriden by router param with same name`,
//           );
//         }
//         searchParams.append(key, value);
//       });
//     }
//
//     const requestURL = `${this.host}/authorize/${encodeBase64QueryString(
//       perms,
//     )}?${searchParams}`;
//
//     debugLog.info(
//       `Authorizing client request on ${req.url} for ${perms} permissions`,
//     );
//     debugLog.info(`Calling ${requestURL}`);
//
//     try {
//       const { status, ...rest } = await nativeRequest.get(
//         requestURL,
//         { headers },
//         undefined,
//         true,
//       );
//
//       debugLog.info(`Request response: ${status}`);
//       debugLog.info(JSON.stringify(rest));
//
//       if (status === 200) {
//         return next();
//       }
//
//       if (status === 400) {
//         return next(new BadRequestError(errors.tokenMissing));
//       }
//
//       if (status === 401) {
//         return next(new UnauthorizedError());
//       }
//
//       // should be a 403 unless there's a network or auth server issue
//       if (status !== 403) {
//         debugLog.error(
//           `Received unexpected status code ${status} from auth server`,
//         );
//       }
//
//       // assume 403 to the client
//       next(new ForbiddenError());
//     } catch (err) {
//       debugLog.error(err);
//       next(new ForbiddenError());
//     }
//   }
//
//   authorize<RESOURCES extends string = DefaultResources>(
//     perms:
//       | Permission<RESOURCES>
//       | Permission<RESOURCES>[]
//       | false = 'authenticated',
//   ): RequestHandler {
//     return catchAsync(
//       async (req, res, next) =>
//         this.host === 'self'
//           ? this.callLocal(req, res, next, perms)
//           : this.callRemote(req, res, next, perms),
//       // const token: string | undefined = getToken('access', req);
//       //
//       // console.log('token: ', token);
//       //
//       // if (!token) {
//       //   return next('no token');
//       // }
//
//       // mirror client request to auth server
//
//       // generate single use system token
//     );
//   }
// }

// export const authorize = <RESOURCES extends string = Resources>(
//   perms:
//     | Permission<RESOURCES>
//     | Permission<RESOURCES>[]
//     | false = 'authenticated',
// ): RequestHandler => {
//   const authServerURL =
//     process.env.AUTHORIZATION_SERVER || 'http://localhost:3000';
//
//   const authorizationSecret = process.env.AUTHORIZATION_SECRET;
//
//   if (!authorizationSecret) {
//     logAlways('AUTHORIZATION_SECRET environment variable is unset', 'error');
//     process.exit(1);
//   }
//
//   return async (req, _res, next) => {
//     // const token: string | undefined = getToken('access', req);
//     //
//     // console.log('token: ', token);
//     //
//     // if (!token) {
//     //   return next('no token');
//     // }
//
//     // mirror client request to auth server
//
//     // generate single use system token
//     const authorizationToken = generateToken({
//       type: 'access',
//       user: { user_id: 0, email: 'system', roles: ['*'] },
//       secret: authorizationSecret,
//       expires: 10000,
//     });
//
//     // const clientAuthHeader = req.headers.Authorization;
//
//     const headers = {
//       ...req.headers,
//       // ...(clientAuthHeader && {
//       //   'X-Forwarded-Authorization': clientAuthHeader,
//       // }),
//       'X-Authorization': `Bearer ${authorizationToken}`,
//     };
//
//     const parsedUrl = url.parse(req.url).query || {};
//
//     const newQueryString = new URLSearchParams(parsedUrl);
//     // add param(s) to query string
//     // WARNING: params will override query vars of same name
//     if (!isEmpty(req.params)) {
//       Object.entries(req.params).forEach(([key, value]) => {
//         newQueryString.append(key, value);
//       });
//     }
//
//     debugLog.info(
//       `Authorizing client request on ${req.url} for ${perms} permissions`,
//     );
//
//     const requestURL = `${authServerURL}/authorize/${encodeBase64QueryString(
//       perms,
//     )}?${decodeURIComponent(newQueryString.toString())}`;
//
//     try {
//       const { status, ...rest } = await nativeRequest.get(
//         requestURL,
//         { headers },
//         undefined,
//         true,
//       );
//
//       debugLog.info(`Request response: ${status}`);
//       debugLog.info(JSON.stringify(rest));
//
//       if (status === 200) {
//         return next();
//       }
//
//       if (status === 400) {
//         return next(new BadRequestError(errors.tokenMissing));
//       }
//
//       if (status === 401) {
//         return next(new UnauthorizedError());
//       }
//
//       // should be a 403 unless there's a network or auth server issue
//       if (status !== 403) {
//         debugLog.error(
//           `Received unexpected status code ${status} from auth server`,
//         );
//       }
//
//       // assume 403 to the client
//       next(new ForbiddenError());
//     } catch (err) {
//       debugLog.error(err);
//       next(new ForbiddenError());
//     }
//   };
// };

export class AuthConnector {
  static logMe(msg: string) {
    debugLog.info(msg);
  }
}
