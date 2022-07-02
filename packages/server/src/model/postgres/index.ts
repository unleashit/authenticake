import { debugLog } from '@authenticake/common';
import { Pool, PoolConfig } from 'pg';

import { initDB } from './createSchema';
import postgresQueries from './postgresQueries';

let pool: Pool | undefined;

function connect(opts: PoolConfig) {
  pool = new Pool(opts);

  pool.on('error', (err) => {
    // TODO: should this be handled better?
    console.error('Unexpected error on idle client', err);
    process.exit(1);
  });

  return pool;
}

function getPool() {
  return pool;
}

async function getClient() {
  if (!pool) {
    debugLog.info('No pool available. Need to make a connection.');
    return;
  }

  try {
    return await pool.connect();
  } catch (err) {
    return console.error('Error aquiring client: ', err);
  }
}

export { connect, getClient, getPool, initDB, postgresQueries };
