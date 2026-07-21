# Reporting and artifacts

Configured in `frontend/playwright.config.ts`.

## Policies

| Artifact | Policy | Location |
|---|---|---|
| HTML report | Always | `frontend/playwright-report/` |
| Trace | `on-first-retry` | Inside `test-results/` (+ linked from HTML report) |
| Screenshot | `only-on-failure` | `test-results/<test>/` |
| Video | `retain-on-failure` | `test-results/<test>/` |

These folders are **gitignored**.

## HTML report

```bash
cd frontend
npm run test:e2e:report
# or
npx playwright show-report
```

Use the report to filter failed tests, open traces, and view screenshots/videos.

## Trace Viewer

1. Open the HTML report → failed test → **Traces**.  
2. Or:

```bash
npx playwright show-trace path/to/trace.zip
```

Traces capture DOM snapshots, network, and actions for the retried run.

## Screenshots & video

- Appear only when a test fails (or is retried and fails).  
- Open from the HTML report attachments or browse `test-results/`.  
- CI uploads both report and `test-results` as Actions artifacts.

## CI downloads

GitHub Actions → workflow run → Artifacts → `playwright-report` / `test-results`.
