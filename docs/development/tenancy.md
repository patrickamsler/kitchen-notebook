# Tenancy rules

A notebook is the tenant. All notebooks share one schema; every tenant table has a `notebook_id`, and PostgreSQL
row-level security (RLS) restricts each transaction to one notebook. RLS is the **second** safety net: services still
check membership and roles and filter every query on `notebookId` explicitly (see [backend.md](backend.md)).
Background: [ADR-004](../adr/0004-shared-schema-rls-tenancy.md), design D5 of `add-platform-foundation`.

## Roles and who creates what

| Role | Used by | Rights |
|---|---|---|
| `kn_owner` | Flyway only | Owns the database `kitchen_notebook` and every object in it |
| `kn_app` | The backend at runtime | `LOGIN`, `NOBYPASSRLS`, `NOSUPERUSER`; owns nothing; DML grants only |
| `keycloak` | Keycloak | Owns the separate database `keycloak` |

- **Cluster level** (roles, databases): created by `infra/postgres/init/01-roles-and-databases.sh`. Compose runs it on
  the first start with an empty volume; the backend tests copy the same directory into their Testcontainers
  PostgreSQL. In production (ADR-007) the hosting setup creates the same roles; the script documents what is required.
- **Database level** (tables, policies, functions, grants): created by Flyway migrations running as `kn_owner`.
  `V1__baseline.sql` sets default privileges, so every table `kn_owner` creates is readable and writable by `kn_app`.
- Changing the init script requires a reset: `docker compose down -v && docker compose up -d` (deletes local data).

Because `kn_app` neither owns the tables nor has `BYPASSRLS`, policies always apply to it. `FORCE ROW LEVEL SECURITY`
makes them apply to the owner too, as a second guard.

## Setting the tenant: `TenantContext`

```java
@Service
@Transactional
public class RecipeService {

    public RecipeDto get(UUID notebookId, UUID recipeId, CurrentUser user) {
        // 1. authorise: membership and role of the user in notebookId (notebook access guard)
        UUID userId = ...;                                // the user's profile ID (accounts)
        tenantContext.set(notebookId, userId);           // 2. first statement of the transaction
        return recipes.findByIdAndNotebookId(recipeId, notebookId)   // 3. explicit notebookId filter
                .map(mapper::toDto)
                .orElseThrow(...);
    }
}
```

- `TenantContext.set(notebookId, userId)` runs
  `select set_config('app.notebook_id', ?, true), set_config('app.user_id', ?, true)` on the transaction's
  connection. `true` (`is_local`) is the parameterisable form of `SET LOCAL`: the values end with the transaction and
  never leak to the next user of the pooled connection.
- It throws `IllegalStateException` outside a transaction. Call it only from services (the transaction boundary).
- Policies read the settings through `kn_current_notebook_id()` and `kn_current_user_id()`. After a transaction-local
  setting ends, PostgreSQL leaves `''` (not `NULL`) on the connection; the functions turn that into `NULL`, so a
  transaction without context sees no rows and cannot insert any.

## Recipe for a new tenant table

In a Flyway migration of the feature change:

```sql
CREATE TABLE recipe (
    id          uuid PRIMARY KEY,                      -- UUIDv7 from BaseEntity
    notebook_id uuid NOT NULL REFERENCES notebook (id),
    version     bigint      NOT NULL,
    created_at  timestamptz NOT NULL,
    updated_at  timestamptz NOT NULL
    -- feature columns
);

CREATE INDEX recipe_notebook_id_idx ON recipe (notebook_id);

ALTER TABLE recipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe FORCE ROW LEVEL SECURITY;

CREATE POLICY recipe_tenant_isolation ON recipe
    USING (notebook_id = kn_current_notebook_id())
    WITH CHECK (notebook_id = kn_current_notebook_id());
```

1. **Columns:** `notebook_id uuid NOT NULL` plus the `BaseEntity` columns; index `notebook_id`.
2. **RLS:** `ENABLE` and `FORCE ROW LEVEL SECURITY`.
3. **Policy:** the template above, `USING` and `WITH CHECK`, so rows of other notebooks can be neither read nor written.
4. **Grants:** nothing to do; the default privileges from `V1__baseline.sql` grant DML to `kn_app`. Never grant
   ownership or DDL to `kn_app`.
5. **RLS tests:** a `<Table>RlsIT` with at least the four PLT-07 scenarios, modelled on `RlsProbeRlsIT`:
   rows of another notebook invisible, no context no rows (and insert rejected), writing into another notebook
   rejected, no leak across pooled connections.

The test-only table `rls_probe` (`backend/src/test/resources/db/test-migration/R__rls_probe.sql`) follows this recipe
and is the reference.
