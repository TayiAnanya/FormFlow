# Automation metrics

**Measured:** 2026-07-21 (suite reduction — quality over Cartesian permutations)  
**Host:** Chromium default · `frontend/` · `npx playwright test --project=chromium --list`

## Inventory

| Metric | Value |
|---|---|
| Total Playwright Tests (Chromium) | **310** |
| Spec Files | **51** |
| Total Page Objects (`*.page.ts`) | **11** |
| Total Workflows | **7** |
| Total Fixture modules | **4** |
| Total Data modules (packs/matrices/responses/surfaces) | **10** |
| Test suites (feature modules with specs) | **6** (+ shared nav/harness) |

> Firefox / WebKit projects exist for opt-in runs (`test:firefox`, `test:webkit`, `test:cross-browser`). They are **not** multiplied into the default inventory.

## Gates

| Gate | Count | Notes |
|---|---|---|
| `@smoke` | **21** | PR smoke gate (Chromium) |
| `@critical` | **17** | PR critical gate (Chromium) |
| Quality suite | **34** | `e2e/quality/specs` |

## Coverage by module (Chromium)

| Module | Tests | Target band |
|---|---:|---|
| Authentication | 27 | ~27 |
| Navigation | 22 | ~22 |
| Workspace | 59 | ~60–70 |
| Dynamic Forms (excl. Joint) | ~82 | ~90–100 |
| Joint Account | 50 | ~50–60 |
| Advisor (AI) | 36 | ~50–60 |
| Quality | 34 | ~30–40 |
| Harness | 1 | — |
| **Sum** | **310** | **300–400** |

## Reduction note (2026-07-21)

| Before | After |
|---|---|
| 400 Chromium tests (listed as **1200** with 3 browser projects) | **310** Chromium (default scripts pin `--project=chromium`) |

Removed redundant micro-assertions and matrices; behavioural coverage retained via composites.

## How to refresh

```bash
cd frontend
npx playwright test --project=chromium --list
```
