// import { AuthConfig, DbClient } from '../modules/main/types/authProps';
// import { postgresQueries } from './postgres';
// import { PostgresQueries } from './postgres/postgresQueries';
import getCacheQueries from './cache';
import getDatabaseQueries from './database';

export * as postgres from './postgres';

export { getCacheQueries, getDatabaseQueries };
