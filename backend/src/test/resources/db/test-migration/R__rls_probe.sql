-- Test only (not in db/migration): a tenant table following the recipe in docs/development/tenancy.md,
-- used by RlsProbeRlsIT to prove row-level security (PLT-07).
DROP TABLE IF EXISTS rls_probe;

CREATE TABLE rls_probe (
    id          uuid PRIMARY KEY DEFAULT uuidv7(),
    notebook_id uuid NOT NULL,
    label       text NOT NULL
);

CREATE INDEX rls_probe_notebook_id_idx ON rls_probe (notebook_id);

ALTER TABLE rls_probe ENABLE ROW LEVEL SECURITY;
ALTER TABLE rls_probe FORCE ROW LEVEL SECURITY;

CREATE POLICY rls_probe_tenant_isolation ON rls_probe
    USING (notebook_id = kn_current_notebook_id())
    WITH CHECK (notebook_id = kn_current_notebook_id());
