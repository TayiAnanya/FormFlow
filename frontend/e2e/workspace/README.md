# Workspace module (Sprint 03)

Persona- and journey-oriented automation for the authenticated dashboard.

**Contract:** [`specs/playwright/SPRINT-03-WORKSPACE.md`](../../../specs/playwright/SPRINT-03-WORKSPACE.md) (Done)  
**Coverage Gap Analysis:** see Sprint 03 Completion Report (chat) and § below.

## Run

```bash
npx playwright test e2e/workspace/specs
npx playwright test e2e/workspace/specs --grep "@smoke|@critical"
```

## Personas

| Fixture | Use |
|---|---|
| `emptyWorkspaceUser` | Empty My Workspace panels |
| `returningWorkspaceUser` | Apps, drafts, activity, recommendations, stats |
| `draftWorkspaceUser` | Draft continue journeys |
| `recommendationWorkspaceUser` | Recommendation CTAs |

Import `test` from `e2e/shared/fixtures`.

## Coverage gaps (summary)

| Gap | Rationale |
|---|---|
| Delete Draft UI | Product has no discard control; clear-on-submit → Sprint 04 |
| Form field asserts after Open Form / Continue / recommendation | Route-only boundary; Sprint 04 |
| Advisor chat / live Gemini | Sprint 06 |
| Profile edit | Read-only UI; AUT-WS-02 view only |
| Guest `/dashboard` guard matrix | Covered in Auth/Nav; not rebuilt here |
