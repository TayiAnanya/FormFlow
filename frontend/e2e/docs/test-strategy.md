# Test strategy

## Position

| Layer | Tool | Owner |
|---|---|---|
| Unit / component | Jasmine / Karma | Application |
| E2E behavioural | Playwright | `frontend/e2e/` |
| NFR samples | Playwright quality | `e2e/quality/` |

## Principles

- Automate **application behaviour**, not LLM quality.  
- Prefer **parameterized matrices** and shared workflows over one-off copies.  
- Specs assert; workflows stay assertion-free.  
- External AI is **mocked** (`page.route`) for deterministic PR suites.  
- Auth / workspace seed via `DataSetupAdapter` (localStorage v1).

## Tags (PR gate)

| Tag | Meaning |
|---|---|
| `@smoke` | Fast confidence |
| `@critical` | Business-critical path |
| Feature tags | `@auth` `@navigation` `@workspace` `@forms` `@joint` `@advisor` `@responsive` `@a11y` `@security` |
| `@ai-live` | Optional live Gemini — **excluded** from PR gate |
| `@quarantine` | Known flake isolation |

**PR gate:** `npm run test:e2e:smoke` → `--grep "@smoke|@critical"`.

## Suite cadence

| Cadence | Command |
|---|---|
| Every PR | `test:e2e:smoke` |
| Module change | Module path under `e2e/<feature>/specs` |
| Release / nightly (manual) | `test:e2e` + `test:e2e:quality` |

## Authoritative sources

- Strategy & AUT catalogue: [`specs/playwright/01-IMPLEMENTATION-SPEC.md`](../../../specs/playwright/01-IMPLEMENTATION-SPEC.md)  
- Sprint scope: `specs/playwright/SPRINT-00` … `SPRINT-08`
