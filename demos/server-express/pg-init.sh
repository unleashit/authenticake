#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-'EOF'
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email varchar(128) UNIQUE NOT NULL,
    password varchar(64) NOT NULL,
    grants varchar(128) NOT NULL,
    is_active boolean default true,
    inactive_reason text,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
  );

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
EOF
