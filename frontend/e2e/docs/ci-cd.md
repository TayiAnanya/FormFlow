# CI/CD

## Workflow

File: `frontend/.github/workflows/playwright.yml`

| Item | Value |
|---|---|
| Name | Playwright Smoke |
| Triggers | `push` / `pull_request` → `main` \| `master` |
| Runner | `ubuntu-latest` |
| Working directory | `frontend` |
| Install | `npm ci` + `npx playwright install chromium --with-deps` |
| Command | `npm run test:e2e:smoke -- --project=chromium` |
| Env | `CI=true` |
| Artifacts | `playwright-report/`, `test-results/` (14 days) |

## Local equivalent

```bash
cd frontend
npm ci
npx playwright install chromium
npm run test:e2e:smoke -- --project=chromium
```

## Cross-browser (manual / optional)

```bash
npx playwright install
npm run test:cross-browser -- --grep "@smoke"
```

PR gate remains Chromium-only for speed and runner deps.

## Secrets

None required for the default PR gate (localStorage auth + mocked Advisor).

## Full regression

Not scheduled in this workflow. Run manually before release (pin Chromium unless intentionally cross-browser):

```bash
cd frontend
npm run test:chromium
```

Optional future: nightly workflow with full suite and/or multi-browser smoke.
