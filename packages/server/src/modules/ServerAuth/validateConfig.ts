import { AuthProps, JwtOptions } from './types/authProps';

const prefix = (msg: TemplateStringsArray) => `invalid config - ${msg}`;

function validateConfig(config: AuthProps): void {
  const { database, cache, session, localAuth, socialAuth } = config;

  /*
   * Database
   * */

  // so far, postgres is the only DB we support...
  if (database.type !== 'postgres') {
    throw new Error(
      prefix`\`postgres\` is the only supported database. Stay tuned for more support...'`,
    );
  }

  // a database and connection options are required
  if (!database?.options) {
    throw new Error(prefix`database connection options were not provided`);
  }

  // when database is the cache type, cache options are ignored
  // since the connection is shared and database options are used instead
  if (cache?.type === 'database' && cache.options) {
    throw new Error(
      prefix`cannot designate cache options when using \`database\` as the type`,
    );
  }

  // when using database as the cache type, only postgres is (currently) supported as the DB
  if (cache?.type === 'database' && database.type !== 'postgres') {
    throw new Error(
      prefix`must specify \`postgres\` as the database type if you choose \`database\` as the cache type`,
    );
  }

  /*
   * Cache
   * */

  // must specify a cache provider when using sessions
  if ((!cache || cache.type === 'none') && session?.type === 'express') {
    throw new Error(prefix`must specify a cache type when using sessions`);
  }

  /*
   * Session
   * */

  if (session) {
    // in case user isn't using Typescript, check for missing type property of session
    // if (session.type !== 'express' && session.options) {
    //   throw new Error(
    //     withPrefix(
    //       'session.type must be set to `express` to set Express Session options',
    //     ),
    //   );
    // }

    // can't add a custom session middleware when not using a session
    if (session.type !== 'express' && session.sessionMiddleware) {
      throw new Error(
        prefix`cannot set sessionMiddleware property when not using an Express Session`,
      );
    }
  }

  /*
   * Standard Auth
   * */

  if (localAuth) {
    if (!['jwt', 'none'].some((t) => localAuth.type === t)) {
      throw new Error(
        prefix`Currently only \`jwt\` is supported as a standardAuth type`,
      );
    }

    if (localAuth.type === 'jwt') {
      const {
        useRefreshToken,
        refreshSecret,
        refreshExpires,
        blacklist,
        accessCookieOpts,
        refreshCookieOpts,
      } = localAuth.options as JwtOptions;

      if (useRefreshToken && (!refreshSecret || !refreshExpires)) {
        throw new Error(
          prefix`refreshSecret and refreshExpires must be set when using refresh tokens`,
        );
      }

      if (
        (accessCookieOpts as any)?.maxAge ||
        (accessCookieOpts as any)?.expires
      ) {
        throw new Error(
          prefix`access token cookie options should not contain \`maxAge\` or \`expires\`. Expires for access token is based on \`accessTokenExpires\``,
        );
      }

      if (
        (refreshCookieOpts as any)?.maxAge ||
        (refreshCookieOpts as any)?.expires
      ) {
        throw new Error(
          prefix`refresh token cookie options should not contain \`maxAge\` or \`expires\`. Expires for refresh token is based on \`refreshTokenExpires\``,
        );
      }

      if (
        blacklist &&
        blacklist !== 'none' &&
        (!session || session.type === 'none' || !cache || cache.type === 'none')
      ) {
        throw new Error(
          prefix`session and cache provider must be configured in order to choose a \`blacklist\` type in JWT options`,
        );
      }

      if (
        (blacklist === 'whitelist' || blacklist === 'access') &&
        useRefreshToken
      ) {
        throw new Error(
          prefix`when using refresh tokens \`standardAuth.blacklist\` can only be set to \`refresh\`  or  \`none\``,
        );
      }
    }
  }

  // else if (!socialLogins) {
  //   throw new Error(prefix`Must choose at least one authentication provider`);
  // }
}

export default validateConfig;
