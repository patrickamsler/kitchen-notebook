-- Test only: table of the test entity BaseEntityProbe (BaseEntityIT).
DROP TABLE IF EXISTS base_entity_probe;

CREATE TABLE base_entity_probe (
    id         uuid PRIMARY KEY,
    version    bigint      NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    label      text        NOT NULL
);
