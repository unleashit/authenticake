CREATE TABLE IF NOT EXISTS my_user (
    user_id SERIAL,
    email varchar(255) NOT NULL,
    email_verified timestamptz,
    password varchar(255) NOT NULL,
    grants text[],
    is_active boolean default true,
    inactive_reason text,
    created_at timestamptz NOT NULL default current_timestamp,
    updated_at timestamptz NOT NULL default current_timestamp,

    PRIMARY KEY (user_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS email
    ON my_user(email);

CREATE TABLE IF NOT EXISTS my_profile (
    profile_id SERIAL,
    user_id SERIAL,
    full_name varchar(255),
    avatar varchar(255),
    created_at timestamptz NOT NULL default current_timestamp,
    updated_at timestamptz NOT NULL default current_timestamp,

    PRIMARY KEY (profile_id)
);

CREATE TABLE IF NOT EXISTS my_account (
    account_id SERIAL,
    user_id INTEGER NOT NULL,
    provider_type VARCHAR(255) NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    created_at timestamptz NOT NULL default current_timestamp,
    updated_at timestamptz NOT NULL default current_timestamp,

    PRIMARY KEY (account_id),
    FOREIGN KEY (user_id) REFERENCES my_user(user_id)
);

CREATE INDEX IF NOT EXISTS provider_id
    ON my_account(provider_id);

CREATE INDEX IF NOT EXISTS provider_account_id
    ON my_account(provider_account_id);

CREATE INDEX IF NOT EXISTS user_id
    ON my_account(user_id);

-- add an optional default admin user
INSERT INTO my_user (email, email_verified, password, grants)
VALUES (
    'johndoe@gmail.com',
    current_timestamp,
    'password123',
    ARRAY ['authenticated', 'admin']
) RETURNING *;

-- optional session table needed only if you are using sessions and
-- opt to store them in the Database instead of a cache like Redis
-- IMPORTANT: this is the default express-pg-session schema and if modified may cause
-- things to break. Don't forget to modify the express-pg-session options in the config
CREATE TABLE IF NOT EXISTS my_session (
    "sid" varchar NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "my_session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "my_session" ("expire");
-- end of optional session table
