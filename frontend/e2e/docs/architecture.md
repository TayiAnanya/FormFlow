# Architecture summary

**Binding specification:** [`specs/playwright/00-AUTOMATION-ARCHITECTURE.md`](../../../specs/playwright/00-AUTOMATION-ARCHITECTURE.md)

## Shape

- Playwright lives **colocated** under `frontend/e2e/` (not a separate package).  
- **Hybrid feature modules** + **shared kernel**.  
- Layers: Specs → Workflows → Pages / Components → Fixtures / Adapters.

## Shared kernel

| Area | Path |
|---|---|
| Config / routes / tags | `shared/config/` |
| DataSetupAdapter | `shared/adapters/` |
| Fixtures merge | `shared/fixtures/` |
| Base page / portal shell | `shared/pages/` |
| Utils / waits | `shared/utils/` |
| PrimeNG helpers | `shared/components/primeng/` |

## Import rule

Feature modules may import `shared/**`. Cross-feature reuse is allowed only where documented (e.g. quality specs reuse advisor stubs and form host).

## Config highlights

`frontend/playwright.config.ts`:

- Chromium project only  
- `webServer`: `npm run start`  
- Trace on first retry; screenshot & video on failure  
- HTML report → `playwright-report/`
