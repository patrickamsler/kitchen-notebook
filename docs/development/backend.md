# Backend rules

Rules for code in `backend/` (Spring Boot 4, Java 25, Maven). Read this before changing the backend.
Background: design D2 and D6 of `add-platform-foundation`, [ADR-006](../adr/0006-modular-monolith-spring-modulith.md),
[ADR-011](../adr/0011-design-first-openapi-codegen.md). Tests: [testing.md](testing.md). Tenant tables:
[tenancy.md](tenancy.md).

## Packages

Root package `app.kitchennotebook`. Plain packages by convention (Spring Modulith was rejected), checked by ArchUnit.

```
shared/security      SecurityFilterChain, CurrentUser + CurrentUserProvider, 401 entry point, logout
shared/tenancy       TenantContext (set_config per transaction)
shared/web           /api prefix, problem details, ProblemException
shared/persistence   BaseEntity (UUIDv7 id, version, timestamps)
accounts/ notebooks/ invitations/ recipes/ shopping/ media/   feature packages
api/, api/model      generated from api/openapi.yaml (target/, never committed, never edited)
```

Inside a feature package (example `recipes`):

```
recipes/
  api/          RecipeController implements the generated RecipesApi; only delegates
  service/      RecipeService (@Service, @Transactional): the transaction boundary
                RecipeMapper (@Component): entity -> generated DTO, DTO -> entity changes
                capability helpers that need collaborators (@Component, e.g. RecipeSoftDeletion)
  domain/       Recipe, Ingredient (@Entity POJOs), value objects, domain exceptions
                Recipes (final class, static pure helpers, e.g. Recipes.scale(recipe, servings))
  persistence/  Spring Data repositories
```

## Layers

```
 HTTP --JSON--> controller --DTO--> service [@Transactional ...............] --> repository
                    ^                  |  entities live only in here        |
                    +------DTO---------+  service <-> service / helper:      |
                                          entities may be passed            |
                                       [.......................................]
```

- **The transaction boundary is the public service method.** Services carry `@Transactional` at class level, with
  `readOnly = true` on queries. Controllers, mappers called from controllers and the web layer never open
  transactions. Set the `TenantContext` first thing in every service transaction that touches tenant tables.
- **Entities never cross the boundary.** Public service methods take and return generated API DTOs, IDs, primitives or
  `CurrentUser`, never entities. Inside the transaction, entities may be passed to other services, mappers and
  helpers. Map to DTOs inside the service, so lazy associations load within the transaction. `open-in-view=false`
  makes violations fail fast with `LazyInitializationException`.
- **The API works with generated DTOs.** They carry the Jackson and Jakarta validation annotations from the contract,
  and request bodies are `@Valid`, so field validation happens on the DTOs and failures become 400 problem details.
  Add constraints in `api/openapi.yaml`, never by editing generated code.
- **Contract first.** Change `api/openapi.yaml` first, then implement the generated interface. An operation without an
  implementation fails the build (compile error, or `ApiContractTest` for a new tag).
- **Business rules live in the service.** Rules that need data or state (unique names per notebook, last owned
  notebook) are checked in the service and raised as domain exceptions extending `ProblemException`.
- **Repositories** are used only by services of the same feature. **Cross-feature calls** go through the other
  feature's public service, never its repository.
- **Mappers** are hand-written `@Component`s in `service/`.

### Entities and helpers

- **Entities are POJOs** extending `BaseEntity`: fields with JPA annotations, getters and setters, a protected no-arg
  constructor. `equals` / `hashCode` on the id come from `BaseEntity`. No business logic.
- **Pure logic lives in a plural static helper** in `domain/` named after the entity (`Recipe` -> `Recipes`): final,
  private constructor, static methods only, no I/O, no Spring. It works only on what is passed in and is unit-testable
  without a context. A plural class name always means such a helper, never a repository.
- **Logic that needs collaborators** (repositories, other services, clock, mail) is a `@Component` in `service/`
  named for its capability (`NotebookOwnershipTransfer`, `InvitationTokenIssuer`). It joins the caller's transaction.
- **No `*Helper` / `*Utils` classes.**
- **Invariants** change only through helpers or services, not through setters called from controllers or other
  features (review convention).

### Enforced by ArchUnit (`ArchitectureTest`)

1. `shared` does not depend on feature packages.
2. `api` packages do not depend on `domain` or `persistence`.
3. Repositories are accessed only from `service` packages of the same feature.
4. Public methods of `@Service` classes do not return `@Entity` types.
5. `@Transactional` appears only in `service` packages and `shared/tenancy`.
6. Classes in `domain` packages carry no Spring stereotype annotations.
7. No class name ends in `Helper` or `Utils`.

`ArchitectureRulesTest` proves each rule against a violating fixture in the test package `archfixture`. When you add a
rule, add its fixture.

## Errors and messages

- Errors are RFC 9457 problem details with type `urn:kn:problem:<slug>`. Title and detail come from
  `src/main/resources/messages.properties` (`problem.<slug>.title`, `problem.<slug>.detail`); never hard-code
  user-facing text in Java.
- Throw a `ProblemException` subclass (in the feature's `domain/`) with status, slug and detail arguments, and add the
  two message keys. Validation errors list the invalid fields in `errors[]`. Unexpected errors return a generic 500
  with a `correlationId` that is also logged.

## Current user

Inject `CurrentUserProvider` and call `currentUser()`. Generated interfaces cannot take extra handler parameters, so
there is no argument resolver.

## Queries (Spring Data JPA)

| Topic | Rule |
|---|---|
| Tenant filter | Every query on a tenant table takes `notebookId` explicitly and filters on it. Service-level authorisation comes first; RLS is the second safety net, not the only one |
| Simple lookups | Short derived query methods only: `findByIdAndNotebookId`, `existsByNotebookIdAndNameIgnoreCase` |
| Joins, fetches, more than ~2 conditions | `@Query` with JPQL in a text block and named parameters; no long derived method names |
| PostgreSQL-specific features | `@Query(nativeQuery = true)` for search (ILIKE / `pg_trgm`) and bulk purges |
| List and read views | Record projections (`select new ...RecipeCardRow(...)`) instead of loading entities; mapped to DTOs in the service |
| Fetching | Associations `LAZY`, never `EAGER`; load what the mapper needs with `@EntityGraph` or `join fetch` (no N+1) |
| Bulk writes | `@Modifying(clearAutomatically = true)` |
| Soft delete | Filtered explicitly (`deletedAt is null`), not with `@SQLRestriction`, because undo and purge must see deleted rows |
| Not used | Criteria API, Specifications, Querydsl |
| Tests | Every custom query has an `*IT` against real PostgreSQL (Testcontainers), never H2 |

## Migrations

Flyway, `src/main/resources/db/migration/V<n>__<description>.sql`, run as `kn_owner`. Hibernate only validates
(`ddl-auto=validate`). Never change an applied migration; add a new one. Tenant tables follow [tenancy.md](tenancy.md).

## Configuration

`application.yaml` reads environment variables with local defaults for non-secret values; locally they come from
`../.env`. Keycloak endpoints are derived from `kn.auth.keycloak.issuer-uri` without discovery, so the backend starts
when Keycloak is down. Logs are structured JSON (ECS); set `KN_LOG_FORMAT=` (empty) for plain text locally.
