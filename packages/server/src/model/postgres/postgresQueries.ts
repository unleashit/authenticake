import { debugLog } from '@authenticake/common';

import {
  AuthConfig,
  Database,
  DbClient,
  SchemaOptions,
} from '../../modules/ServerAuth/types/authProps';
import {
  CreateUserArgs,
  FindUserByEmailArgs,
  FindUserByIdArgs,
} from '../types/Queries';
import { BaseSession } from '../types/User';
import * as statements from './queryStatements';

// const withPool = (fn: any) => async (...args: any) => {
//   const serverAuth = await ServerAuth();
//   const schemaOpts: SchemaOptions = serverAuth.config('database').schema;
//
//   return fn(getPool(), schemaOpts, ...args);
// };

// export const createUser = withPool(createUserFn);

export interface PostgresQueries {
  // eslint-disable-next-line camelcase
  createUser: (args: CreateUserArgs) => Promise<BaseSession>;
  findUserByEmail: (
    args: FindUserByEmailArgs,
  ) => Promise<BaseSession | undefined>;
  findUserById: (args: FindUserByIdArgs) => Promise<BaseSession | undefined>;
}

// type CreateUser = (args: CreateUserArgs) => Promise<any>;
// type FindUserByEmail = (
//   args: FindUserByEmailArgs,
// ) => Promise<BaseUser | undefined>;

// export interface DatabaseQueries {
//   createUser: CreateUser;
//   findUserByEmail: FindUserByEmail;
// }

export default function postgresQueries(
  config: AuthConfig,
  dbClient: DbClient,
): PostgresQueries {
  // do something about this diabolical typing
  const schemaOpts = (config.database as Required<Database>)
    .schema as Required<SchemaOptions>;

  const createUser: PostgresQueries['createUser'] = async ({
    email,
    password,
  }) => {
    const query = statements.createUser({
      userTblName: schemaOpts.userTblName,
    });

    debugLog.info(query);

    const {
      rows: [newUser],
    } = await dbClient.query(query, [email, password, ['user']]);

    // TODO: make password field name agnostic
    delete newUser.password;
    return newUser;
  };

  const findUserByEmail: PostgresQueries['findUserByEmail'] = async ({
    email,
  }) => {
    const query = statements.findUserByEmail({
      userTblName: schemaOpts.userTblName,
    });

    debugLog.info(query);

    const {
      rows: [user],
    } = await dbClient.query(query, [email]);
    return user;
  };

  const findUserById: PostgresQueries['findUserById'] = async ({ id }) => {
    const query = statements.findUserById({
      userTblName: schemaOpts.userTblName,
    });

    debugLog.info(query);

    const {
      rows: [user],
    } = await dbClient.query(query, [id]);
    return user;
  };

  return {
    createUser,
    findUserByEmail,
    findUserById,
  };
}
