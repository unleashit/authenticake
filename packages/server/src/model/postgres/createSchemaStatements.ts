type Statements = { [key: string]: (...args: any) => string };

const statements: Statements = {
  createDB: (POSTGRES_DB) => `CREATE DATABASE ${POSTGRES_DB}`,

  dropDB: (POSTGRES_DB) => `DROP DATABASE ${POSTGRES_DB}`,

  updateTimestampFunction: () => `
    CREATE OR REPLACE FUNCTION trigger_update_timestamp()
      RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `,

  updateTimestampTrigger: (tblName) => `
    DROP TRIGGER IF EXISTS update_timestamp on ${tblName};
    CREATE TRIGGER update_timestamp
      BEFORE UPDATE ON ${tblName}
      FOR EACH ROW
        EXECUTE PROCEDURE trigger_update_timestamp();
  `,

  // Base user data, not including profile
  userSchema: ({ userTblName }) => `
    CREATE TABLE IF NOT EXISTS ${userTblName} (
    user_id SERIAL,
    email varchar(255) NOT NULL,
    email_verified timestamptz,
    password varchar(255) NOT NULL,
    roles text[],
    is_active boolean default true,
    inactive_reason text,
    created_at timestamptz NOT NULL default current_timestamp,
    updated_at timestamptz NOT NULL default current_timestamp,

    PRIMARY KEY (user_id)
    );

    CREATE UNIQUE INDEX IF NOT EXISTS email
      ON ${userTblName}(email);

    ${statements.updateTimestampTrigger(userTblName)}
  `,

  // Extended user data
  profileSchema: ({ profileTblName, userTblName }) => `
    CREATE TABLE IF NOT EXISTS ${profileTblName} (
      profile_id SERIAL,
      user_id SERIAL,
      image varchar(255),
      first_name varchar(255),
      last_name varchar(255),
      phone varchar(255),
      created_at timestamptz NOT NULL default current_timestamp,
      updated_at timestamptz NOT NULL default current_timestamp,

      PRIMARY KEY (profile_id),
      FOREIGN KEY (user_id) REFERENCES ${userTblName}(user_id)
    );

    ${statements.updateTimestampTrigger(profileTblName)}
  `,

  // Each user can have 0 or more oauth accounts
  accountSchema: ({ accountTblName, userTblName }) => `
    CREATE TABLE IF NOT EXISTS ${accountTblName} (
      account_id SERIAL,
      user_id INTEGER NOT NULL,
      provider_type VARCHAR(255) NOT NULL,
      provider_id VARCHAR(255) NOT NULL,
      provider_account_id VARCHAR(255) NOT NULL,
      created_at timestamptz NOT NULL default current_timestamp,
      updated_at timestamptz NOT NULL default current_timestamp,

      PRIMARY KEY (account_id),
      FOREIGN KEY (user_id) REFERENCES ${userTblName}(user_id)
    );

    CREATE INDEX IF NOT EXISTS provider_id
      ON ${accountTblName}(provider_id);

    CREATE INDEX IF NOT EXISTS provider_account_id
      ON ${accountTblName}(provider_account_id);

    CREATE INDEX IF NOT EXISTS user_id
      ON ${accountTblName}(user_id);

    ${statements.updateTimestampTrigger(accountTblName)}
  `,

  insertDefaultAdmin: ({ userTblName }) => `
    INSERT INTO ${userTblName} (email, email_verified, password, roles)
      VALUES ($1, '${new Date().toISOString()}', $2, $3)
      ON CONFLICT DO NOTHING
      RETURNING *;
  `,

  // Optional session table if sessions stored in PG
  sessionSchema: ({ sessionTblName }) => `
    CREATE TABLE IF NOT EXISTS ${sessionTblName} (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL
    )
    WITH (OIDS=FALSE);

    ALTER TABLE ${sessionTblName}
        DROP CONSTRAINT IF EXISTS ${sessionTblName}_pkey;

    ALTER TABLE ${sessionTblName}
        ADD CONSTRAINT ${sessionTblName}_pkey
        PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

    CREATE INDEX IF NOT EXISTS "IDX_${sessionTblName}_expire"
        ON ${sessionTblName} ("expire");
  `,
};

export default statements;
