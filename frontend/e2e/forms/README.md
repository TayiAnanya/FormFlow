# Forms module (Sprint 04)

Schema-driven Dynamic Form automation via **FormHost + DynamicForm** (field-key API).

**Contract:** [`specs/playwright/SPRINT-04-DYNAMIC-FORMS.md`](../../../specs/playwright/SPRINT-04-DYNAMIC-FORMS.md)

## Run

```bash
npx playwright test e2e/forms/specs
npx playwright test e2e/forms/specs --grep "@smoke|@critical"
```

## Design

| Asset | Role |
|---|---|
| `pages/form-host.page.ts` | Route chrome, load/error/success |
| `components/dynamic-form.ts` | Field-key fill / submit |
| `data/*` | Happy packs + validation/conditional matrices |
| `workflows/` | Open, fill, submit, draft wait, resume |

Import `test` from `e2e/shared/fixtures`.

## Coverage gaps (summary)

| Gap | Rationale |
|---|---|
| Native radio type | Not in product — covered via dropdown |
| User-facing Reset | Not in product — scenario switch rebuild |
| Full invalid root schema injection | No E2E harness; unknown catalog covered |
| Unknown field type UI | No injectable bundled schema — deferred / gap |
| Joint repeater depth | Sprint 05 |
| PDF / Voice / Advisor | Sprint 06 |
