# Advisor (Sprint 06)

Smart Banking Advisor automation — conversation flow, results, persistence, error handling.

**Contract:** [`specs/playwright/SPRINT-06-AI-FEATURES.md`](../../../../specs/playwright/SPRINT-06-AI-FEATURES.md)

## Run

```bash
npx playwright test e2e/advisor/specs
npx playwright test e2e/advisor/specs --grep "@smoke|@critical"
```

## Design

| Asset | Role |
|---|---|
| `pages/banking-advisor.page.ts` | Advisor page PO: textarea, send, suggestions, loading, results, error |
| `data/advisor.responses.ts` | Gemini mock response builders (deterministic, no live API) |
| `data/advisor.packs.ts` | Goal packs, product→scenario map, constants |
| `workflows/advisor.workflow.ts` | Stubs, navigation, submit helpers, persistence reads |

## Mock strategy

All Gemini calls are intercepted via `page.route('**/gemini-api/**', ...)`.
No live API key is required. Tag `@ai-live` for optional live tests (excluded from PR gate).

Import `test` from `e2e/shared/fixtures`.
