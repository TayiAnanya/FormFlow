# Debugging and troubleshooting

## Quick commands

```bash
cd frontend
npx playwright test --headed          # watch the browser
npx playwright test --ui              # interactive UI mode
npx playwright test path/to.spec.ts -g "test title"
npm run test:e2e:report               # last HTML report
npx playwright show-trace trace.zip   # deep dive
```

## Common failures

| Symptom | Likely cause | Fix |
|---|---|---|
| `webServer` timeout | App did not start | Run `npm run start` manually; check port 4200 |
| Auth redirect loops | Stale storage | Fixture `reset` / `guestPage`; clear site data |
| Send button not found (Advisor) | PrimeNG accessible name includes icon glyph | Scope to `.advisor-chat-actions` + `/Send/i` |
| Flaky multi-form journey | Timing between scenarios | Prefer module re-run; document if persistent |
| Offline / abort tests odd | App is localStorage-first | Assert stability, not offline banners |
| CI cannot find package.json | Wrong working directory | Workflow must use `working-directory: frontend` |

## Storage inspection

Auth keys: `bank_users`, `current_user`, `is_logged_in`  
Workspace keys: `ff_*` (see `shared/config/constants.ts`)

Use Playwright UI mode → Application → Local Storage, or `page.evaluate` in a debug test.

## Flake policy

1. Reproduce headed / UI mode.  
2. Stabilize waits (prefer assertions over fixed sleeps).  
3. If unresolved: `@quarantine` + Known Limitations entry — do not silently drop `@smoke`.

## Related

- [`reporting.md`](./reporting.md) — artifacts  
- [`setup-and-execution.md`](./setup-and-execution.md) — env & commands
