# FormFlow Playwright E2E

End-to-end UI automation for the FormFlow Angular banking portal.

**Status:** v1 **release-ready** (Sprints 00–08 complete).  
**Authoritative specs:** [`specs/playwright/`](../../specs/playwright/)

---

## Prerequisites

- Node.js LTS
- From repository root, work in `frontend/`

## Install

```bash
cd frontend
npm ci
npx playwright install chromium   # PR gate / daily
# npx playwright install           # all browsers for cross-browser runs
```

## Quick start

```bash
# PR gate — smoke | critical on Chromium
npm run test:e2e:smoke -- --project=chromium

# Chromium full suite
npm run test:chromium

# Cross-browser smoke (Chromium + Firefox + WebKit)
npm run test:cross-browser -- --grep "@smoke"

# Full suite (all projects — heavy)
npm run test:e2e

# Long regression on Windows — prefer sequential suites (see docs/setup-and-execution.md)
npm run start   # terminal A; then module suites in terminal B

# Quality module
npm run test:e2e:quality -- --project=chromium

# Open last HTML report
npm run test:e2e:report
```

Base URL: `http://localhost:4200` (override with `PLAYWRIGHT_BASE_URL`).

---

## Supported browsers

| Browser | Project | Script |
|---|---|---|
| Chromium | `chromium` | `npm run test:chromium` |
| Firefox | `firefox` | `npm run test:firefox` |
| WebKit | `webkit` | `npm run test:webkit` |
| All three | — | `npm run test:cross-browser` |

PR CI stays on **Chromium** (`--project=chromium`).

---

## Command reference

| Intent | Command |
|---|---|
| All e2e (all projects) | `npm run test:e2e` |
| Chromium only | `npm run test:chromium` |
| Firefox only | `npm run test:firefox` |
| WebKit only | `npm run test:webkit` |
| Cross-browser (all projects) | `npm run test:cross-browser` |
| PR gate (`@smoke` \| `@critical`) | `npm run test:e2e:smoke` |
| PR-equivalent (Chromium) | `npm run test:e2e:smoke -- --project=chromium` |
| Smoke only | `npm run test:e2e:smoke-only` |
| Critical only | `npm run test:e2e:critical-only` |
| Quality | `npm run test:e2e:quality` |
| Module | `npx playwright test e2e/<module>/specs --project=chromium` |
| UI mode | `npx playwright test --ui` |
| Headed | `npx playwright test --headed` |
| HTML report | `npm run test:e2e:report` |
| Show trace | `npx playwright show-trace <path-to.zip>` |

---

## Module map

| Path | Sprint | Role |
|---|---|---|
| `shared/` | 00 / 02 | Kernel, navigation specs, adapters, tags |
| `authentication/` | 01 | Login, register, session, guards |
| `workspace/` | 03 | Dashboard / My Workspace |
| `forms/` (+ `joint/`) | 04–05 | Dynamic forms + joint account |
| `advisor/` | 06 | Smart Banking Advisor (mocked Gemini) |
| `quality/` | 07 | Responsive, keyboard, resilience |
| `journeys/`, `pdf/`, `voice/`, `metrics/` | — | **Reserved** shells (not filled in v1) |
| `docs/` | 08 | Operator & maintainer guides |

---

## Documentation

| Guide | Path |
|---|---|
| Setup & execution | [`docs/setup-and-execution.md`](./docs/setup-and-execution.md) |
| Test strategy | [`docs/test-strategy.md`](./docs/test-strategy.md) |
| Architecture summary | [`docs/architecture.md`](./docs/architecture.md) |
| Folder structure | [`docs/folder-structure.md`](./docs/folder-structure.md) |
| CI/CD | [`docs/ci-cd.md`](./docs/ci-cd.md) |
| Reporting (HTML / Trace / video) | [`docs/reporting.md`](./docs/reporting.md) |
| Troubleshooting | [`docs/debugging-guide.md`](./docs/debugging-guide.md) |
| Traceability | [`docs/traceability-matrix.md`](./docs/traceability-matrix.md) |
| Coverage | [`docs/coverage-summary.md`](./docs/coverage-summary.md) |
| Metrics | [`docs/automation-metrics.md`](./docs/automation-metrics.md) |
| Known limitations | [`docs/known-limitations.md`](./docs/known-limitations.md) |
| How to add a test | [`docs/how-to-add-test.md`](./docs/how-to-add-test.md) |
| Contribution | [`docs/contribution-guide.md`](./docs/contribution-guide.md) |

---

## Design rules (short)

- Specs assert; workflows do not.
- Prefer field keys / roles over brittle CSS.
- Import `test` / `expect` from `e2e/shared/fixtures`.
- Tags live in `shared/config/test-tags.ts`.
- Advisor tests stub Gemini — no API key required for PR gate.

---

## Specs workspace

| Doc | Role |
|---|---|
| [00 Architecture](../../specs/playwright/00-AUTOMATION-ARCHITECTURE.md) | Binding shape |
| [01 Implementation Spec](../../specs/playwright/01-IMPLEMENTATION-SPEC.md) | AUT catalogue |
| [02 Project Structure](../../specs/playwright/02-PROJECT-STRUCTURE.md) | Folder blueprint |
| [03 Roadmap](../../specs/playwright/03-IMPLEMENTATION-ROADMAP.md) | Sprint sequence |
| [SPRINT-08-RELEASE](../../specs/playwright/SPRINT-08-RELEASE.md) | Release contract |
