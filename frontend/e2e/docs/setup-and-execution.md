# Setup and execution

## Install

```bash
cd frontend
npm ci
# Daily / PR gate (Chromium)
npx playwright install chromium
# Cross-browser (Chromium + Firefox + WebKit)
npx playwright install
```

## Supported browsers

| Browser | Playwright project | Device profile |
|---|---|---|
| Chromium | `chromium` | Desktop Chrome |
| Firefox | `firefox` | Desktop Firefox |
| WebKit (Safari engine) | `webkit` | Desktop Safari |

Shared timeouts, reporters, artifacts, and `webServer` apply to all projects. PR CI remains **Chromium-only**.

## Environment

| Variable | Default | Purpose |
|---|---|---|
| `PLAYWRIGHT_BASE_URL` | `http://localhost:4200` | App under test |
| `CI` | unset / `true` in Actions | Retries (2), workers (2), `forbidOnly` |
| `PLAYWRIGHT_TIMEOUT_MS` | `30000` | Per-test timeout |
| `PLAYWRIGHT_ACTION_TIMEOUT_MS` | `15000` | Action / expect timeout |
| `AI_LIVE` | unset | Reserved — live Gemini (not PR gate). Provide your own key locally; never commit real keys. |
| `DATA_SETUP` | `localStorage` | Adapter mode (API reserved) |

For optional live Gemini features in the app, set `geminiApiKey` in `src/environments/environment.development.ts` (see `environment.example.ts`). Use `YOUR_API_KEY_HERE` as the committed placeholder.

Defined in `e2e/shared/config/env.ts`.

## How the app starts

`playwright.config.ts` `webServer` runs `npm run start` (`ng serve`) unless a server is already listening (`reuseExistingServer: !CI`).

You may start the app yourself:

```bash
npm run start
# other terminal
npm run test:chromium -- --grep "@smoke"
```

## Recommended local flow

1. `npm run test:e2e:smoke -- --project=chromium` — PR-equivalent gate  
2. Module under change — e.g. `npx playwright test e2e/advisor/specs --project=chromium`  
3. Cross-browser smoke — `npm run test:cross-browser -- --grep "@smoke"`  
4. Before Chromium release — full regression (see below)  
5. Inspect failures — `npm run test:e2e:report`

## Cross-browser execution

```bash
# One browser (full suite)
npm run test:chromium
npm run test:firefox
npm run test:webkit

# All configured browsers (full suite × 3)
npm run test:cross-browser

# Smoke only on one browser
npm run test:chromium -- --grep "@smoke"
npm run test:firefox -- --grep "@smoke"
npm run test:webkit -- --grep "@smoke"

# Smoke on all browsers
npm run test:cross-browser -- --grep "@smoke"
```

Note: bare `npm run test:e2e` / `test:e2e:smoke` run **Chromium only** (avoids 3× browser expansion). Use `test:cross-browser` or `test:firefox` / `test:webkit` for multi-browser.

## Final / long regression (recommended on Windows)

A single full suite can drop the Playwright-managed `webServer` mid-run on Windows. Prefer sequential module suites against a manually started `ng serve` (Chromium first):

```bash
# Terminal A
npm run start

# Terminal B — sequential suites (workers=2)
npx playwright test e2e/advisor/specs --project=chromium --workers=2
npx playwright test e2e/forms/specs --project=chromium --workers=2
npx playwright test e2e/workspace/specs --project=chromium --workers=2
npx playwright test e2e/authentication/specs --project=chromium --workers=2
npx playwright test e2e/shared/specs/navigation --project=chromium --workers=2
npx playwright test e2e/quality/specs --project=chromium --workers=2
npx playwright test e2e/shared/specs/harness.health.spec.ts --project=chromium --workers=2
```

Sprint 08 Chromium baseline: **400/400 passed in ~12.8 min**.

## Command reference

See the table in [`../README.md`](../README.md).
