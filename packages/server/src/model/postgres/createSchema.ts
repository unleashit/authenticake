import { debugLog } from '@authenticake/common';
import argon2 from 'argon2';
import { ClientConfig, PoolClient } from 'pg';

import { InternalServerError } from '../../lib/customErrors';
import { Database } from '../../modules/ServerAuth/types/authProps';
import statements from './createSchemaStatements';
import { connect, getClient, getPool } from './index';
import { PGSchemaOpts } from './types/schema';

async function createDB(client: PoolClient, opts: ClientConfig, force = false) {
  if (force) {
    try {
      await client.query(statements.dropDB(opts.database));
      debugLog.info('+ DB dropped');
    } catch (err) {
      if (
        err instanceof Error &&
        /database "authenticake" does not exist/.test(err.message)
      ) {
        debugLog.warning(err.message);
      } else {
        console.error(err);
        process.exit(1);
      }
    }
  }

  try {
    await client.query(statements.createDB(opts.database));
    debugLog.info('+ DB created');
  } catch (err) {
    // console.error(err);
    // process.exit(1);
  }
}

async function createSchema(
  client: PoolClient,
  opts: Required<PGSchemaOpts>,
  addSessionTbl: boolean,
) {
  if (opts.customSchema) {
    await client.query(opts.customSchema);
    return debugLog.info('+ Custom schema added');
  }

  await client.query('BEGIN');

  await client.query(statements.updateTimestampFunction());
  debugLog.info('+ Update timestamp function added');

  await client.query(statements.userSchema(opts));
  debugLog.info('+ Users table added');

  await client.query(statements.accountSchema(opts));
  debugLog.info('+ Accounts table added');

  await client.query(statements.profileSchema(opts));
  debugLog.info('+ Profile table added');

  if (addSessionTbl) {
    await client.query(statements.sessionSchema(opts));
    debugLog.info('+ Session table added');
  }

  const hashedPassword = await argon2.hash(opts.defaultAccount!.password);

  const res = await client.query(statements.insertDefaultAdmin(opts), [
    opts.defaultAccount!.email,
    hashedPassword,
    opts.defaultAccount!.roles,
  ]);
  debugLog.info('Default admin user: ', res.rows[0]);

  await client.query('COMMIT');
  debugLog.info('Schema created successfully');
}

export async function initDB(dbOpts: Database, useSessionTbl: boolean) {
  if (!dbOpts || typeof dbOpts.options !== 'object') {
    throw new Error("Can't connect to Database, connection not provided");
  }

  const connection = dbOpts.options;
  const schemaOpts = dbOpts.schema as Required<PGSchemaOpts>;

  connect({ ...connection, database: 'postgres' });
  const pool = getPool();
  let client = await getClient();

  if (!pool || !client) {
    throw new Error("Can't get client from pool");
  }

  // first connect to postgres in order to create/drop database
  // then close the pool and make a new pool to the new database
  try {
    await createDB(client, connection, schemaOpts?.force ?? false);
  } catch (err) {
    if (
      err instanceof Error &&
      /database "authenticake" already exists/.test(err.message)
    ) {
      client.release();
      console.error('DB exists, not recreating. Use `true` to force');
    } else {
      console.error(err);
      client.release();
      await pool.end();
      process.exit(1);
    }
  } finally {
    client.release();
    await pool.end();
  }

  // create a new pool/connection to the fresh database
  // leave the pool open for future connections
  // setImmediate added to prevent race conditions
  // setImmediate(async () => {
  connect(connection);
  client = await getClient();
  if (!client) {
    throw new Error("Can't get client from pool");
  }

  try {
    await createSchema(client, schemaOpts, useSessionTbl);
  } catch (err) {
    client.release();
    await pool.end();
    console.error(err);
    process.exit(1);
  } finally {
    client.release();
  }
  // });
}
