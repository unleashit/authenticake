import Redis, { RedisOptions } from 'ioredis';

import { AuthConfig } from './types/authProps';

function connectCache({ type, options }: AuthConfig['cache']) {
  let client;

  if (type === 'redis') {
    client = new Redis(options as RedisOptions);
    client.on('error', (err) => {
      console.error(err);
      process.exit(1);
    });
  }
  // else if (type === 'postgres') {
  //   client = await getPool();
  //   if (!client) {
  //     throw new Error('Could not connect to cache');
  //   }
  // }

  return client;
}

export default connectCache;
