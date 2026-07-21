# Quality (Sprint 07)

Cross-cutting quality automation — responsive, keyboard, resilience, session, network.

**Contract:** [`specs/playwright/SPRINT-07-QUALITY.md`](../../../../specs/playwright/SPRINT-07-QUALITY.md)

## Run

```bash
npx playwright test e2e/quality/specs
npx playwright test --grep "@smoke"
npx playwright test --grep "@critical"
```

## Design

| Asset | Role |
|---|---|
| `data/viewports.packs.ts` | Mobile / tablet / desktop sizes |
| `data/quality.surfaces.ts` | Agreed critical routes |
| `workflows/quality.workflow.ts` | Viewport, clearSession, offline, keyboard helpers |

Reuses feature Page Objects (Landing, Login, PortalShell, Dashboard, FormHost, BankingAdvisor) and advisor stubs. Does **not** duplicate business suites.
