import { debugLog, debugLogAlways } from '@authenticake/common';
import { ErrorRequestHandler, RequestHandler, Router } from 'express';
import merge from 'lodash/merge';

import { errors } from '../../lib';
import { isExpressMiddleware } from '../../lib/isMIddleware';
import { errorHandler as errorHandlerMW } from '../../lib/middleware';
import { getCacheQueries, getDatabaseQueries } from '../../model';
import * as postgres from '../../model/postgres';
import { PostgresQueries } from '../../model/postgres/postgresQueries';
import { RedisQueries } from '../../model/redis';
import { authorizationRoute } from '../authorization';
import RBAC from '../authorization/rbac/lib/rbac';
import { csrfHelper } from '../csrf';
import authRoutes from '../router/authRoutes';
import connectCache from './connectCache';
import connectDatabase from './connectDatabase';
import createSession from './createSession';
import { defaultMiddlewares, defaultOpts } from './defaultConfig';
import {
  AuthConfig,
  AuthProps,
  CacheClient,
  DbClient,
  Middlewares,
  SchemaOptions,
} from './types/authProps';
import validateConfig from './validateConfig';

const instance = Symbol('instance');
// const config = Symbol('config');
const userMiddlewares = Symbol('userMiddlewares');
const errorHandler = Symbol('errorHandler');
const sessionHandler = Symbol('sessionHandler');
const asyncInit = Symbol('syncDB');

class ServerAuth {
  // eslint-disable-next-line no-use-before-define
  private static [instance]: ServerAuth;

  private [userMiddlewares]: Required<Middlewares> =
    Object.freeze(defaultMiddlewares);

  private [errorHandler]: ErrorRequestHandler;

  private [sessionHandler]: RequestHandler | undefined;

  config: AuthConfig;

  authRoutes: Router;

  dbClient: DbClient;

  dbQuery: PostgresQueries;

  cacheClient: CacheClient | undefined;

  cacheQuery: any;

  rbac: RBAC;

  authorize: typeof authorizationRoute;

  csrfHelper: typeof csrfHelper;

  logger: AuthProps['logger'];

  // some initial configuration checks and
  // optional schema sync before class instantiation
  static async [asyncInit](authProps: AuthProps) {
    validateConfig(authProps);

    const mergedProps: Required<AuthProps> = merge(
      defaultOpts(authProps),
      authProps,
    );

    const { database, cache } = mergedProps;

    // do nothing unless schema sync is truthy
    if (!database.schema?.sync) {
      return mergedProps;
    }

    const sessionInDB = cache?.type === 'database';
    // assuming Postgres for now...
    await postgres.initDB(database, sessionInDB);

    return mergedProps;
  }

  constructor({ middlewares, logger, ...rest }: Required<AuthProps>) {
    this.config = rest as AuthConfig;

    // const {
    //   useErrorHandler,
    //   session: { sessionMiddleware, useSessionHandler },
    // } = this[config];

    this.addMiddlewares(middlewares);

    const { dbClient, dbQueries } = this.initDatabase();
    this.dbClient = dbClient;
    this.dbQuery = dbQueries;

    const { cacheClient, cacheQueries } = this.initCache();
    this.cacheClient = cacheClient;
    this.cacheQuery = cacheQueries;

    this[sessionHandler] = this.initSession();
    this[errorHandler] = errorHandlerMW;
    // this.authRoutes = authRoutes({
    //   middlewares: this[userMiddlewares],
    //   useSessionHandler: useSessionHandler as boolean, // default config ensures it's defined
    //   useErrorHandler,
    //   sessionHandler: this._sessionHandler,
    //   sessionMiddleware,
    // });
    this.authRoutes = authRoutes({
      config: this.config,
      sessionHandler: this[sessionHandler],
      middlewares: this[userMiddlewares],
      useErrorHandler: this.config.useErrorHandler,
    });
    // this.authRoutes = router;
    this.csrfHelper = csrfHelper;

    this.rbac = new RBAC(this.config.authorization);
    this.authorize = authorizationRoute;
    // this.authorize = new Authorization({ host: 'self' }).authorize;

    this.logger = logger;
    this.addCleanupListeners();
  }

  // config(param?: keyof AuthConfig): AuthConfig | AuthConfig[keyof AuthConfig] {
  //   if (!param) {
  //     return this._config;
  //   }
  //
  //   let slice;
  //   try {
  //     slice = this._config[param];
  //   } catch (e) {
  //     console.error(e);
  //   }
  //
  //   if (!slice) {
  //     throw new Error(`Can't get config for '${param}'`);
  //   }
  //
  //   return slice;
  // }

  addMiddlewares(hooks: Middlewares) {
    // const keys = Object.keys as <T>(o: T) => (Extract<keyof T, string>)[];
    // const keys: key as keyof Middlewares = Object.keys(this.userMiddlewares);
    Object.entries(hooks).forEach(([hook, mws]) => {
      if (!Array.isArray(mws)) {
        throw new TypeError(errors.middlewareNotArray(hook));
      }

      if (mws.every(isExpressMiddleware)) {
        this[userMiddlewares][hook as keyof Middlewares].concat(mws);
      } else {
        throw new TypeError(errors.notMiddleWare);
      }
    });
  }

  initDatabase() {
    const { database } = this.config;
    const dbClient = connectDatabase(database);

    // instantiate Queries class
    const dbQueries = getDatabaseQueries(this.config, dbClient);

    return { dbClient, dbQueries };
  }

  initCache(): {
    cacheClient: CacheClient | undefined;
    cacheQueries: RedisQueries | undefined;
  } {
    const { cache } = this.config;

    // cache not required and is disabled by default
    if (!cache || cache.type === 'none' || cache.type === 'memory') {
      return { cacheClient: undefined, cacheQueries: undefined };
    }

    // reference database connection if cache connection is the same
    // currently, this is only possible with postgres
    // this.initDatabase() will throw error with any other db choice
    if (cache.type === 'database') {
      return { cacheClient: this.dbClient, cacheQueries: undefined };
    }

    const cacheClient = connectCache(cache);

    return {
      cacheClient,
      cacheQueries: cacheClient && getCacheQueries(this.config, cacheClient),
    };
  }

  initSession() {
    const { cache, session, database } = this.config;
    const { cacheClient } = this;
    const { sessionTblName } = database.schema as Required<SchemaOptions>;

    if (!session || !session.options || session.type === 'none') {
      debugLog.info(
        'Not creating session. Session config set to none or unset',
      );
      return;
    }

    return createSession(cache, session, sessionTblName, cacheClient);
  }

  get errorHandler() {
    if (!this.config.useErrorHandler) {
      return this[errorHandler];
    }
    throw new Error(
      'Error handler has been set internally. Set `useErrorHandler` to false to override',
    );
  }

  get sessionHandler() {
    if (!this.config.session.useSessionHandler) {
      return this[sessionHandler];
    }
    throw new Error(
      'Session handler has been set internally. Set `useSessionHandler` to false to override',
    );
  }

  addCleanupListeners() {
    const exitHandler = (eventType: string) => {
      debugLog.info('Process ended with: ', eventType);

      if (this.config.database.type === 'postgres') {
        if (this.dbClient && this.dbClient.totalCount > 0) {
          this.dbClient.end();
          debugLog.info('pool destroyed');
        }
      }

      process.exit();
    };

    [
      'SIGINT',
      'SIGUSR1',
      'SIGUSR2',
      'SIGTERM',
      'exit',
      'uncaughtException',
    ].forEach((eventType) => {
      process.once(eventType, exitHandler.bind(null, eventType));
    });

    debugLog.info('exit handler added to node process');
  }
}

// function cache(fn: any) {
//   const NO_RESULT = {}; // unique, would use Symbol if ES2015-able
//   let res = NO_RESULT;
//   return function () {
//     // if ES2015, name the function the same as fn
//     if (res === NO_RESULT) {
//       // @ts-ignore
//       // eslint-disable-next-line prefer-rest-params
//       res = fn.apply(this, arguments);
//       return res;
//     }
//     return res;
//   };
// }

// async function callAsync(authProps?: AuthProps) {
//   if (!authProps) {
//     throw new Error(
//       'Authenticake requires a configuration when called for the first time',
//     );
//   }
//
//   // merge user config with defaults and create or sync DB if needed
//   const mergedProps = await Authenticake[asyncInit](authProps);
//
//   // @ts-ignore
//   Authenticake[instance] = new Authenticake(mergedProps);
//   return Authenticake[instance];
// }
//
// export default (authProps?: AuthProps) => {
//   if (Authenticake[instance]) {
//     if (authProps) {
//       debugLogAlways(
//         'Authenticake was called with arguments after instantiation',
//       );
//     }
//     return Authenticake[instance];
//   }
//
//   return callAsync(authProps);
// };

const AuthenticakeInit = async (authProps?: AuthProps) => {
  if (ServerAuth[instance]) {
    if (authProps) {
      debugLogAlways(
        'Authenticake was called with arguments after instantiation',
      );
    }
    return ServerAuth[instance];
  }

  if (!authProps) {
    throw new Error(
      'Authenticake requires a configuration when called for the first time',
    );
  }

  // merge user config with defaults and create or sync DB if needed
  const mergedProps = await ServerAuth[asyncInit](authProps);

  ServerAuth[instance] = new ServerAuth(mergedProps);
  return ServerAuth[instance];
};

export default AuthenticakeInit;
