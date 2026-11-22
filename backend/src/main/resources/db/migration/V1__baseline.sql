-- Baseline. Runs as kn_owner (Flyway); the application connects as kn_app.
-- Roles and databases are created outside Flyway (infra/postgres/init/, see docs/development/tenancy.md).

-- Runtime role: DML on everything kn_owner creates from now on, no ownership, no DDL.
GRANT USAGE ON SCHEMA public TO kn_app;
ALTER DEFAULT PRIVILEGES FOR ROLE kn_owner IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO kn_app;
ALTER DEFAULT PRIVILEGES FOR ROLE kn_owner IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO kn_app;
ALTER DEFAULT PRIVILEGES FOR ROLE kn_owner IN SCHEMA public
    GRANT EXECUTE ON FUNCTIONS TO kn_app;

-- Tenant context for row-level security, set per transaction by TenantContext (set_config(..., true)).
-- After a transaction-local setting ends, the value reverts to '' (not NULL) on that connection, and ''::uuid would
-- fail; NULLIF turns "no context" into NULL, so policies match no rows.
CREATE FUNCTION kn_current_notebook_id() RETURNS uuid
    LANGUAGE sql STABLE PARALLEL SAFE
AS $$ SELECT NULLIF(current_setting('app.notebook_id', true), '')::uuid $$;

CREATE FUNCTION kn_current_user_id() RETURNS uuid
    LANGUAGE sql STABLE PARALLEL SAFE
AS $$ SELECT NULLIF(current_setting('app.user_id', true), '')::uuid $$;

-- Spring Session JDBC (schema-postgresql.sql of spring-session-jdbc 4.x). Not a tenant table.
CREATE TABLE SPRING_SESSION (
    PRIMARY_ID CHAR(36) NOT NULL,
    SESSION_ID CHAR(36) NOT NULL,
    CREATION_TIME BIGINT NOT NULL,
    LAST_ACCESS_TIME BIGINT NOT NULL,
    MAX_INACTIVE_INTERVAL INT NOT NULL,
    EXPIRY_TIME BIGINT NOT NULL,
    PRINCIPAL_NAME VARCHAR(100),
    CONSTRAINT SPRING_SESSION_PK PRIMARY KEY (PRIMARY_ID)
);

CREATE UNIQUE INDEX SPRING_SESSION_IX1 ON SPRING_SESSION (SESSION_ID);
CREATE INDEX SPRING_SESSION_IX2 ON SPRING_SESSION (EXPIRY_TIME);
CREATE INDEX SPRING_SESSION_IX3 ON SPRING_SESSION (PRINCIPAL_NAME);

CREATE TABLE SPRING_SESSION_ATTRIBUTES (
    SESSION_PRIMARY_ID CHAR(36) NOT NULL,
    ATTRIBUTE_NAME VARCHAR(200) NOT NULL,
    ATTRIBUTE_BYTES BYTEA NOT NULL,
    CONSTRAINT SPRING_SESSION_ATTRIBUTES_PK PRIMARY KEY (SESSION_PRIMARY_ID, ATTRIBUTE_NAME),
    CONSTRAINT SPRING_SESSION_ATTRIBUTES_FK FOREIGN KEY (SESSION_PRIMARY_ID)
        REFERENCES SPRING_SESSION (PRIMARY_ID) ON DELETE CASCADE
);
