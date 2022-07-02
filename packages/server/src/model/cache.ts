import { AuthConfig, CacheClient } from '../modules/ServerAuth/types/authProps';
import redisQueries, { RedisQueries } from './redis';

export default function getCacheQueries(
  config: AuthConfig,
  cacheClient: CacheClient,
): RedisQueries {
  const provider = config.cache.type;

  switch (provider) {
    case 'redis':
      return redisQueries(config, cacheClient);
    default:
      throw new Error('Invalid cache provider');
  }
}
