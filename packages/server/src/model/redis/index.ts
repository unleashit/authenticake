import { debugLog } from '@authenticake/common';

import {
  AuthConfig,
  CacheClient,
  Database,
  SchemaOptions,
} from '../../modules/ServerAuth/types/authProps';
// import { CreateUserArgs } from '../types/Queries';
// import { BaseUser } from '../types/User';
// import * as statements from './queryStatements';

// export interface RedisQueries {
//   // eslint-disable-next-line camelcase
//   getTokenById: (args: any) => Promise<number>;
// }

export default function redisQueries(
  config: AuthConfig,
  cacheClient: CacheClient,
) {
  // const schemaOpts = (config.database as Required<Database>)
  //   .schema as Required<SchemaOptions>;

  const getTokenById = async ({ id }: { id: string }) => {
    console.log(config, cacheClient);
    return id;
  };

  return {
    getTokenById,
  };
}

export type RedisQueries = ReturnType<typeof redisQueries>;
