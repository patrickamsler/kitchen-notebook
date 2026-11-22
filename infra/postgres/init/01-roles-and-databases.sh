#!/usr/bin/env bash
# Creates the cluster-level objects for local development and tests: roles and databases.
# Runs once, as the superuser, on the first start with an empty data volume (docker-entrypoint-initdb.d).
# Everything inside the database (schema, tables, policies, grants) is created by Flyway as kn_owner.
# See docs/development/tenancy.md. Reset with: docker compose down -v && docker compose up -d
set -euo pipefail

: "${KN_OWNER_PASSWORD:?KN_OWNER_PASSWORD is not set}"
: "${KN_APP_PASSWORD:?KN_APP_PASSWORD is not set}"
: "${KEYCLOAK_DB_PASSWORD:?KEYCLOAK_DB_PASSWORD is not set}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "${POSTGRES_DB:-postgres}" \
  -v owner_password="$KN_OWNER_PASSWORD" \
  -v app_password="$KN_APP_PASSWORD" \
  -v keycloak_password="$KEYCLOAK_DB_PASSWORD" <<'SQL'
-- Schema owner: used only by Flyway.
CREATE ROLE kn_owner LOGIN PASSWORD :'owner_password'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;

-- Runtime role of the backend: owns nothing and cannot bypass row-level security.
CREATE ROLE kn_app LOGIN PASSWORD :'app_password'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;

CREATE DATABASE kitchen_notebook OWNER kn_owner;
REVOKE ALL ON DATABASE kitchen_notebook FROM PUBLIC;
GRANT CONNECT, TEMPORARY ON DATABASE kitchen_notebook TO kn_app;

-- Keycloak keeps its data in a separate database with its own user.
CREATE ROLE keycloak LOGIN PASSWORD :'keycloak_password';
CREATE DATABASE keycloak OWNER keycloak;
SQL
