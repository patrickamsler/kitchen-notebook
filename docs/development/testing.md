# Testing rules

Applies to backend and frontend tests. Background: design D11 of `add-platform-foundation`.

## Kinds of tests

| Kind | Where | Runs with | Rules |
|---|---|---|---|
| Unit (`*Test`) | `backend/src/test/java` | Surefire, `./mvnw test` | No Spring context, no containers; fast |
| Integration (`*IT`) | `backend/src/test/java` | Failsafe, `./mvnw verify` | Spring context with Testcontainers (PostgreSQL, Keycloak); never H2 |
| Frontend unit | `frontend/src/**/*.spec.ts` next to the source | Vitest, `npm test` | Components, services, guards |
| End-to-end | `frontend/e2e/*.spec.ts` | Playwright, `npm run e2e` | Full stack: Compose, backend, frontend |

- Integration tests use the shared containers in `app.kitchennotebook.support` (`KnPostgres`, `KnKeycloak`) and the
  `@KnIntegrationTest` annotation (PostgreSQL + MockMvc, sign-in simulated with `oidcLogin()`). Tests of the real
  sign-in flow use `KnKeycloak` and `TestBrowser`.
- PostgreSQL in tests is bootstrapped with `infra/postgres/init/`, like Compose: Flyway as `kn_owner`, the app as
  `kn_app`. Test-only tables live in `src/test/resources/db/test-migration` (repeatable `R__` migrations).
- Every custom query gets an `*IT`. Every tenant table gets RLS tests (see [tenancy.md](tenancy.md)).
- New user flows get a Playwright test.

## Naming: requirement ID first

Searching for a requirement ID (e.g. `PLT-07`) finds the spec, the contract (`x-requirements`) and the tests.

```
JUnit       class  <ClassUnderTest>Test | <Feature><Topic>IT   (RLS: <Table>RlsIT, e.g. RlsProbeRlsIT)
            method <REQID>_<behaviour>   PLT07_rowsOfOtherNotebookInvisible
            @DisplayName("PLT-07 rows of another notebook are invisible")
            without a requirement:  <behaviour>_when<Condition>, @DisplayName in plain words
            ArchUnit rules (ArchitectureTest): method named after the rule, @DisplayName "<n>. <rule>"
Vitest      <name>.spec.ts next to the source; describe('<Unit>'); it('REC-02 shows the creator avatar')
Playwright  e2e/<feature>.spec.ts; test('SHOP-03 ticking moves an item to In the basket', { tag: ['@SHOP-03'] })
```

- One scenario of the spec = one test. A test covering two requirements lists both
  (`PLT02_PLT04_signInShowsEmailAndSignOut`).
- Structure every test body with `// given`, `// when`, `// then` comments (`// when / then` for expected
  exceptions).
- Test names describe behaviour, not implementation.
