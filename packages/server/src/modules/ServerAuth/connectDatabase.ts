import { debugLog } from '@authenticake/common';
import { PoolConfig } from 'pg';

import { postgres } from '../../model';
import { AuthConfig } from './types/authProps';

function connectDB({ type, options }: AuthConfig['database']) {
  if (type === 'postgres' && options) {
    const existingPool = postgres.getPool();

    if (existingPool) {
      debugLog.info('using existing pool');
      return existingPool;
    }

    return postgres.connect(options);
  }

  // we currently only support postgres
  // AuthProps.database.type is previously validated in validateConfig
  // so this is to satisfy typescript and should never execute
  throw new Error(`'${type}' is not a supported database`);
}

export default connectDB;
