// import dotenv from 'dotenv';
// import path from 'path';

import startServer from './app';
import { logger } from './config/logs';

// const env = dotenv.config({ path: path.join(__dirname, '../../.env') });
const { PORT = 3000, NODE_ENV, API_ROOT } = process.env;

process.on('uncaughtException', (err) => {
  console.log(err);
});

Promise.resolve()
  .then(async () => {
    await startServer();

    logger.info(`Listening at ${API_ROOT || 'http://localhost'}:${PORT}`);
    logger.info(`NODE_ENV=${NODE_ENV}`);
  })
  .catch((error) => {
    logger.error(error);
    NODE_ENV !== 'production' && process.exit(1);
  });
