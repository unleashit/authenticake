// import { JwtOptions } from '@authenticake/server/modules/ServerAuth/types/authProps';
import ServerAuth from '@authenticake/server';
// import NativeRequest from '@authenticake/server/lib/nativeRequest';
// import { JWTPayload } from '@authenticake/server/model/types/Jwt';
// import {
//   DefaultActions,
//   RBACOpts,
//   // RBACOpts,
//   Roles,
// } from '@authenticake/server/modules/authorization/rbac';
import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';
// import * as fs from 'fs';
// import path from 'path';
import responseTime from 'response-time';

import { REDIS_OPTIONS, SESSION_OPTIONS } from './config';
import { logger } from './config/logs';

const {
  PORT = 3000,
  NODE_ENV,
  POSTGRES_HOST,
  POSTGRES_DB,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} = process.env;

const POSTGRES_OPTIONS = {
  host: POSTGRES_HOST || 'localhost',
  database: POSTGRES_DB || 'authenticake',
  user: POSTGRES_USER || 'authenticake',
  password: POSTGRES_PASSWORD || 'secret',
  port: parseInt(<string>POSTGRES_PORT, 10) || 5432,
  max: 20,
};

// const customSchema = fs.readFileSync(
//   path.resolve(__dirname, 'config/schema.sql'),
//   'utf8',
// );

// const hitCounter = (req: any, _res: any, next: any) => {
//   if (req.session) {
//     if (!req.session.hits) {
//       req.session.hits = 0;
//     }
//
//     req.session.hits++;
//     console.log(req.session);
//   }
//
//   return next();
// };

// type Resources = 'foo' | 'bar';
// type Actions = DefaultActions | 'push';
// type Special = 'openseseme' | '*';
//
// const authorization: RBACOpts<Resources, Actions, Special> = {
//   someone: {
//     can: [
//       'openseseme',
//       {
//         name: 'foo:push',
//         when: () => true,
//       },
//     ],
//   },
// };

async function startServer(): Promise<void> {
  const serverAuth = await ServerAuth({
    database: {
      type: 'postgres',
      options: POSTGRES_OPTIONS,
      schema: { sync: false, force: false, sessionTblName: 'my_session' },
    },
    cache: {
      type: 'redis',
      options: REDIS_OPTIONS,
    },
    session: {
      type: 'express',
      options: SESSION_OPTIONS,
      // useSessionHandler: false,
      // sessionMiddleware: hitCounter,
    },
    localAuth: {
      type: 'jwt',
      options: {
        accessSecret: ACCESS_TOKEN_SECRET,
        // accessExpires: 60 * 60,
        accessInCookie: true,
        useCSRF: false,
        // customPayload: (payload, user) => {
        //   const myPayload = {
        //     bday: new Date('1990-9-14'),
        //   };
        //
        //   return {
        //     ...payload,
        //     ...myPayload,
        //   };
        // },
        // useRefreshToken: true,
        // refreshSecret: REFRESH_TOKEN_SECRET,
        // refreshExpires: 60 * 60 * 24 * 14,
        // refreshInCookie: true,
        // blacklist: 'none',
      },
    },
    // authorization,
    // middlewares: {
    //   onAfterLogin: [
    //     (req: any, __: any, next: any) => {
    //       if (req.session.userId) {
    //         logger.info(`${req.session.userId} logged in!`);
    //       }
    //       next();
    //     },
    //   ],
    // },
    // logger: logger.error.bind(logger),
  });

  const app = express();
  const { authRoutes, authorize, csrfHelper } = serverAuth;

  if (NODE_ENV === 'development') {
    // app.use(responseTime());
    // app.use(expressLogger);
    // eslint-disable-next-line global-require,import/no-extraneous-dependencies
    const cors = require('cors');
    const corsOpts = {
      origin: 'http://localhost:3000',
      // optionsSuccessStatus: 200,
    };
    app.use(cors(corsOpts));
    app.options('*', cors(corsOpts));
  }

  // app.use(serverAuth.sessionHandler);

  app.use('/auth', authRoutes);

  // send XSRF token on GET requests AND
  // validate csrf of POST requests for all of the following routes...
  // csrfHelper(app);

  // use Authorization instead of ServerAuth
  // when API is on different server from the auth server
  // const { authorize, csrf } = new Authorization({
  //   host: process.env.AUTHORIZATION_SERVER,
  //   secret: process.env.AUTHORIZATION_SECRET,
  // });

  app.get('/test', (_req, res) => {
    logger.info('GET /test');
    res.sendStatus(200);
  });

  app.post('/test', (_req, res, next) => {
    logger.info('POST /test');
    res.send({ yo: 'blow' });
    next();
  });

  app.get('/authed', authorize(), (_req, res) => {
    logger.info('GET /authed');

    res.send('authenticated');
  });

  app.put('/profile/:profile_id', authorize('profile:write'), (req, res) => {
    logger.info(`PUT /profile ${req.params.profile_id}`);

    res.send('has profile perms');
  });

  // error handler specific to demo API routes (meant only for development)
  app.use(
    (
      err: Error & { [key: string]: unknown },
      _req: Request,
      res: Response,
      next: NextFunction,
    ): Response | void => {
      if (err) {
        console.error(err);
      }

      if (!res.headersSent) {
        return res
          .status(Number(err.status) || 500)
          .json({ error: err?.message ?? 'error from demo' });
      }
      next();
    },
  );

  return new Promise((resolve, reject) => {
    try {
      app.listen(Number(PORT), 'localhost', () => resolve());
    } catch (err) {
      reject(err);
    }
  });
}

export default startServer;
