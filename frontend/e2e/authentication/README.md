# Authentication module

Sprint 01 — Authentication automation.

- `pages/` — Landing, Login, Register, AuthenticatedChrome (logout)
- `workflows/` — `auth.workflow` (register, registerAndEnterPortal, login, logout, loginWithReturnUrl)
- `fixtures/` — `authenticatedUser`, `newlyRegisteredUser` (merged into `shared/fixtures`)
- `data/` — valid/invalid/boundary/session/returnUrl packs
- `specs/` — landing, flows, guards, session, storage
- `support/` — auth storage read helpers (read-only)

Reuses Sprint 00 shared kernel (`BasePage`, constants, adapter, fixtures merge point).

## Workflows (Milestone 2)

Import from `authentication/workflows` (or `./workflows/auth.workflow`).

| Workflow | Use when |
|---|---|
| `register` / `registerAndEnterPortal` | UI registration (unique user by default) |
| `login` | Direct login with known credentials |
| `logout` | End session from portal chrome |
| `loginWithReturnUrl` | Guard + returnUrl happy path |

Workflows compose page objects only — no assertions, no locators.

## Fixtures (Milestone 3)

Import `test` / `expect` from `e2e/shared/fixtures` (single entry point).

| Fixture | Mechanism | Use when |
|---|---|---|
| `guestPage` | Adapter `reset` | Guest landing / login / register UI |
| `authenticatedUser` | Adapter `loginAs` | Guards / session when login UI is not under test |
| `newlyRegisteredUser` | UI `registerAndEnterPortal` | Post-register flows |
| `dataSetup` | `DataSetupAdapter` | Storage setup / verification helpers |

## Test data (Milestone 4)

Import from `authentication/data` (or `./data`). Values only — no Playwright.

| Module | Contents |
|---|---|
| `users.valid` | Unique valid register/seed factories |
| `users.invalid` | Unknown email, wrong-password helper, login error copy |
| `login.validation` | Empty / partial login fields |
| `register.boundary` | Empty, mobile, password, confirm mismatch packs |
| `register.duplicate` | Seed + re-register same email pack |
| `session.scenarios` | Reload / guestGuard / landing paths |
| `return-url.scenarios` | Safe / unsafe returnUrl samples |

## Specs (Milestone 5)

Import `test` / `expect` from `e2e/shared/fixtures`.

| Spec file | Coverage |
|---|---|
| `landing.navigation.spec.ts` | S01 landing → login/register |
| `auth.flows.spec.ts` | Positive + negative auth (incl. `@smoke` / `@critical`) |
| `auth.guards.spec.ts` | authGuard, guestGuard, unsafe returnUrl |
| `auth.session.spec.ts` | Reload / post-logout protection |
| `auth.storage.spec.ts` | localStorage session + `bank_users` retention |

Tags follow Sprint 00 registry: `@auth`, `@smoke`, `@critical`, `@security`, `@happy`, `@negative`, `@boundary`.
