# Joint Account (Sprint 05)

Multi-applicant depth for `joint-family-account` — Repeater, conditionals, cross-applicant rules.

**Contract:** [`specs/playwright/SPRINT-05-JOINT-ACCOUNT.md`](../../../../specs/playwright/SPRINT-05-JOINT-ACCOUNT.md)

## Run

```bash
npx playwright test e2e/forms/specs/joint-family-account
npx playwright test e2e/forms/specs/joint-family-account --grep "@smoke|@critical"
```

## Design

| Asset | Role |
|---|---|
| `components/joint-applicants.repeater.ts` | Add/remove/expand + nested keys |
| `joint/data` | Relation + duplicate packs |
| `joint/workflows` | Open, fill primary/rows, submit, resume |

Import `test` from `e2e/shared/fixtures`.
