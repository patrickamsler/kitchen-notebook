# Frontend rules

Rules for code in `frontend/` (Angular 22, standalone, zoneless, signals, strict TypeScript, npm). Read this before
changing the web app. Look and layout: [design-system.md](../design/design-system.md). Tests: [testing.md](testing.md).

## Folder structure

```
src/app/
  api/        generated from api/openapi.yaml by ng-openapi-gen (gitignored, never edited)
  core/       app-wide services: auth (AuthService, authGuard), HTTP setup
  layout/     the app shell (top bar, later navigation rail / bottom bar)
  shared/     UI building blocks used by several features
  features/   one folder per feature (recipes, shopping, people, settings) with its routes and components
src/locale/   messages.xlf, the English source translation file (committed)
src/styles/   kn-tokens.css, the design tokens (loaded globally before src/styles.css)
src/assets/   illustrations (SVG)
e2e/          Playwright tests
```

## API calls: generated client only

- Never write HTTP calls by hand. `npm start`, `npm run build`, `npm test` and `npm run lint` first run
  `npm run generate:api`, which regenerates `src/app/api/` from `../api/openapi.yaml`.
- Call operations through the generated `Api` service: `api.invoke(getCurrentUser)`.
- Change the contract first (`api/openapi.yaml`), then use the regenerated functions and models.
- Same origin: the app calls relative URLs (`/api/...`). Locally `proxy.conf.json` forwards `/api`, `/oauth2`,
  `/login/oauth2` and `/logout` to the backend on `:8080`.

## Sign-in, sign-out and CSRF

- No tokens and no OIDC library in the browser (ADR-009). `AuthService.signIn()` navigates the whole page to
  `/oauth2/authorization/keycloak`; `authGuard` does this for signed-out users.
- `AuthService.me` is a signal with the signed-in user from `GET /api/me`; a 401 means signed out.
- `HttpClient` sends the `XSRF-TOKEN` cookie as `X-XSRF-TOKEN` on state-changing requests automatically.
- Sign-out is a full-page form POST to `/logout` with the token as `_csrf` (`AuthService.signOut()`), because the
  response redirects to Keycloak.

## State

Signals (`signal`, `computed`) for component and service state; no zone.js. Prefer `inject()` over constructor
parameters. Components are standalone.

## Text and translation (PLT-10)

- Every user-visible text and attribute in templates has an `i18n` marker with a custom ID:
  `<span i18n="@@shell.signOut">Sign out</span>`, `aria-label="..." i18n-aria-label="@@..."`. In TypeScript use
  `` $localize`:@@id:Text` ``.
- ESLint (`@angular-eslint/template/i18n`) reports unmarked text.
- After adding or changing text run `npm run i18n:extract` and commit `src/locale/messages.xlf`.
  `npm run i18n:check` (also in CI) fails on unmarked text and on an outdated `messages.xlf`.

## Styling

- Use only tokens from `src/styles/kn-tokens.css` (`--md-sys-color-*`, `--kn-*`): no hard-coded colours, radii,
  shadows or sizes.
- Touch targets are at least 48 px (`--kn-touch-target`) on phones and tablets (below 1024 px), even with compact
  desktop density.
- Light and dark follow the device setting through the tokens; check both, at 390 px and 1280 px.
- Plain components for now; the component library is open (ADR-010).

## PWA

`@angular/pwa` caches the app shell only (`ngsw-config.json`); API responses are never cached. `navigationUrls`
excludes `/api/**`, `/oauth2/**`, `/login/**` and `/logout`, so the service worker never answers a sign-in or
sign-out navigation with `index.html`. The service worker runs only in production builds; check them with
`npm run build && npm run serve:dist` (serves `dist/` on :4200 with the same proxy rules).

## Commands

| Command | Does |
|---|---|
| `npm start` | Dev server on http://localhost:4200 with the proxy |
| `npm run build` | Production build into `dist/` |
| `npm test` | Vitest unit tests |
| `npm run lint` | ESLint (TypeScript and templates) |
| `npm run format` | Prettier |
| `npm run i18n:extract` / `npm run i18n:check` | Update / check `src/locale/messages.xlf` |
| `npm run generate:api` | Regenerate the API client |
| `npm run e2e` | Playwright against the running stack |
