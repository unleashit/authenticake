import { debugLog } from '@authenticake/common';
import cookieParser from 'cookie-parser';
import express, { RequestHandler, Router } from 'express';

import { errorHandler } from '../../lib';
import {
  authorizationRoute as authorize,
  authorizationServiceRoute,
} from '../authorization';
import * as blacklist from '../blacklist';
import { csrfHelper } from '../csrf';
import login from '../login';
import logout from '../logout/logout';
import refresh from '../refresh/refresh';
import {
  AuthConfig,
  JwtOptions,
  Middlewares,
} from '../ServerAuth/types/authProps';
import signup from '../signup';

interface RouterProps {
  config: AuthConfig;
  sessionHandler?: RequestHandler;
  middlewares: Required<Middlewares>;
  useErrorHandler: boolean;
}

function authRoutes({
  config,
  sessionHandler,
  middlewares: {
    onBeforeEach,
    onAfterEach,
    onBeforeLogin,
    onAfterLogin,
    onBeforeLogout,
    onAfterLogout,
    onBeforeRefresh,
    onAfterRefresh,
    onBeforeErrorHandler,
  },
  useErrorHandler,
}: RouterProps): Router {
  const router = Router();

  const {
    session: { sessionMiddleware, useSessionHandler },
    basePath,
  } = config;

  // pass config as context to Request
  router.use((req, _res, next) => {
    req.authContext = config;
    req.app.set('authContext', config);

    next();
  });

  router.use(express.json());
  debugLog.info('body-parser (json) middleware enabled');

  // if (JWT_OPTIONS.useCookie) {
  router.use(cookieParser());
  debugLog.info('cookie-parser middleware enabled');
  // }

  if (useSessionHandler && sessionHandler) {
    router.use(sessionHandler);
    debugLog.info('express-session middleware enabled');
  }

  if (sessionMiddleware) {
    router.use(sessionMiddleware);
    debugLog.info('custom session middleware added');
  }

  if (
    config.localAuth.type === 'jwt' &&
    (config.localAuth.options as JwtOptions).useCSRF
  ) {
    debugLog.info('csrf protection added to base auth routes');
    csrfHelper(router, { cookiePath: basePath });
  }

  // handler to return a 405 for any disallowed HTTP verbs
  // WARNING: each applied route expects a response to the client or it will trigger the 405
  const methodNotAllowed: RequestHandler = (_req, res, next) =>
    res.headersSent ? next() : res.sendStatus(405);

  // router
  //   .route('/')
  //   .get(
  //     authorize('authenticated'),
  //     ...onBeforeEach,
  //     (_, res, next) => {
  //       res.send('Hello!');
  //       return next();
  //     },
  //     ...onAfterEach,
  //   )
  //   .all(methodNotAllowed);

  router
    .route('/login')
    .post(
      // csrfProtection,
      authorize(false),
      ...onBeforeEach,
      ...onBeforeLogin,
      login,
      ...onAfterLogin,
      ...onAfterEach,
    )
    .all(methodNotAllowed);

  router
    .route('/refresh')
    .post(
      ...onBeforeEach,
      ...onBeforeRefresh,
      refresh,
      ...onAfterRefresh,
      ...onAfterEach,
    )
    .all(methodNotAllowed);

  router
    .route('/logout')
    .post(
      authorize('authenticated'),
      ...onBeforeEach,
      ...onBeforeLogout,
      logout,
      ...onAfterLogout,
      ...onAfterEach,
    )
    .all(methodNotAllowed);

  router
    .route('/authorize/:perms')
    .get(...onBeforeEach, authorizationServiceRoute, ...onAfterEach)
    .all(methodNotAllowed);

  router
    .route('/blacklist/:userId')
    .get(authorize('admin'), ...onBeforeEach, blacklist.check, ...onAfterEach)
    .post(authorize('admin'), ...onBeforeEach, blacklist.add, ...onAfterEach)
    .all(methodNotAllowed);

  router
    .route('/signup')
    .post(authorize(false), ...onBeforeEach, signup, ...onAfterEach)
    .all(methodNotAllowed);

  // router
  //   .route('/authorize')
  //   .get((req, res, next) => {
  //     const { grants } = req.body;
  //     next();
  //   })
  //   .all(methodNotAllowed);

  // router.post(
  //   '/refresh-token/invalidate',
  //   authorize('admin'),
  //   ...onBeforeEach,
  //   ...onBeforeInvalidate,
  //   invalidate,
  //   ...onAfterInvalidate,
  //   ...onAfterEach,
  // );

  // router.post('/register', ...onBeforeAll, register, ...onAfterAll);
  // router.post('/forgot_password_request', ...onBeforeAll, passwordReset, ...onAfterAll);
  // router.post('/forgot_password_verify', ...onBeforeAll, passwordReset, ...onAfterAll);

  // debug memory store
  // router.use((req: any, _res, next) => {
  //   if (req.sessionStore) {
  //     console.log(req.sessionStore?.sessions);
  //   }
  //   next();
  // });

  if (onBeforeErrorHandler.length) {
    router.use(...onBeforeErrorHandler);
  }

  if (useErrorHandler) {
    router.use(errorHandler);
    debugLog.info('error handler middleware enabled');
  }

  return router;
}

export default authRoutes;
