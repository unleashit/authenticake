import { AuthConfig, DbClient } from '../modules/ServerAuth/types/authProps';
import { postgresQueries } from './postgres';
import { PostgresQueries } from './postgres/postgresQueries';

export default function getDatabaseQueries(
  config: AuthConfig,
  dbClient: DbClient,
): PostgresQueries {
  const provider = config.database.type;

  switch (provider) {
    case 'postgres':
      return postgresQueries(config, dbClient);
    default:
      throw new Error('Invalid db provider');
  }
}
