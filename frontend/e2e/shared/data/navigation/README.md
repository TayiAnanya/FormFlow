# Navigation test data

Sprint 02 — route / target packs only (no Playwright, no Workspace/Forms business payloads).

Import from `e2e/shared/data/navigation`.

| Module | Purpose |
|---|---|
| `shell.routes` | Dashboard / Advisor / Profile |
| `fragment.routes` | Forms `#workflows`, Applications `#applications` |
| `protected.routes` | authGuard samples |
| `public.routes` | Landing / Login / Register |
| `deep-link.scenarios` | `/forms/:scenarioId` route samples |
| `history.sequences` | Back/forward path chains |
| `invalid.routes` | Wildcard unknown paths |
| `navigation.targets` | Shell menu targets + destinations |
