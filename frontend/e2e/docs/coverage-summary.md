# Coverage summary (v1)

## In coverage

| Area | Notes |
|---|---|
| Authentication | Login, register, logout, session, guards, returnUrl, storage |
| Landing & shell navigation | Routes, fragments, history, wildcards, deep links |
| Workspace | Empty/populated panels, drafts continue, apps, recommendations, persistence |
| Dynamic forms | Happy paths, validation, conditionals, drafts, field types, schema errors |
| Joint account | Repeater lifecycle, relation conditionals, duplicates, drafts, journeys |
| Smart Banking Advisor | Entry, loading, results, errors, memory, CTA navigation (Gemini **mocked**) |
| Quality | Responsive viewports, keyboard/focus smoke, loading/error/empty samples, offline/abort, session clear, smoke/critical gate contract |
| Harness | Base URL health |

## Out of coverage (v1)

| Area | Status |
|---|---|
| Voice Assist | Not automated |
| PDF Smart Assist | Not automated |
| Live LLM quality / prompt eval | Out of scope |
| Full axe-core programme | Deferred (keyboard/landmark smoke only) |
| Pixel visual baselines | Deferred (landmark sanity only) |
| Soft performance budgets | Deferred |
| Firefox / WebKit projects | Supported via opt-in scripts — default / PR gate is Chromium only |
| Dedicated `journeys/` J01–J20 module | Reserved shell — journeys live in feature modules |
| REST `DataSetupAdapter` | Reserved |

## Module inventory (release baseline)

| Module | Spec files (approx.) | Focus |
|---|---|---|
| shared (nav + harness) | ~8 | Navigation + health |
| authentication | ~5 | Auth |
| workspace | ~8 | Dashboard |
| forms (+ joint) | ~20 | Forms |
| advisor | ~8 | Advisor |
| quality | ~7 | NFR samples |
| **Total** | **51** | **310 tests** (Chromium) |

Refresh counts in [`automation-metrics.md`](./automation-metrics.md) after each release regression.
