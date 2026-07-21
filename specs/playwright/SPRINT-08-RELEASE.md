# Sprint 08 — Release

**Document Type:** Sprint Specification  
**Project:** FormFlow Playwright Automation  
**Sprint:** 08 — Release (final sprint)  
**Version:** 1.0  
**Status:** Done  
**Parent Document:** [03-IMPLEMENTATION-ROADMAP.md](./03-IMPLEMENTATION-ROADMAP.md) (Approved)  
**Depends on:**  
[SPRINT-00-FOUNDATION.md](./SPRINT-00-FOUNDATION.md) (Done) ·  
[SPRINT-01-AUTHENTICATION.md](./SPRINT-01-AUTHENTICATION.md) (Done) ·  
[SPRINT-02-LANDING-NAVIGATION.md](./SPRINT-02-LANDING-NAVIGATION.md) (Done) ·  
[SPRINT-03-WORKSPACE.md](./SPRINT-03-WORKSPACE.md) (Done) ·  
[SPRINT-04-DYNAMIC-FORMS.md](./SPRINT-04-DYNAMIC-FORMS.md) (Done) ·  
[SPRINT-05-JOINT-ACCOUNT.md](./SPRINT-05-JOINT-ACCOUNT.md) (Done) ·  
[SPRINT-06-AI-FEATURES.md](./SPRINT-06-AI-FEATURES.md) (Done) ·  
[SPRINT-07-QUALITY.md](./SPRINT-07-QUALITY.md) (Done)  
**Authoritative foundation:**  
[README.md](./README.md) · [00-AUTOMATION-ARCHITECTURE.md](./00-AUTOMATION-ARCHITECTURE.md) · [01-IMPLEMENTATION-SPEC.md](./01-IMPLEMENTATION-SPEC.md) · [02-PROJECT-STRUCTURE.md](./02-PROJECT-STRUCTURE.md)

**Code:** None in this document. Implementation begins only after this sprint specification is **Approved**.

**Roadmap note:** Earlier planning split Sprint 08 (Regression) and Sprint 09 (Release). This specification **consolidates final release readiness** as the last implementation sprint. No new business automation is authorized. Multi-browser journey expansion remains a **future enhancement**, not a Sprint 08 deliverable.

---

## 1. Sprint overview

| Field | Statement |
|---|---|
| **Sprint goal** | Prepare the Playwright automation framework for **delivery and handover**: complete operator documentation, execution/reporting guidance, coverage & traceability summaries, regression strategy, cleanup, and a release readiness checklist. |
| **Business objective** | Enable another engineer to clone the repo, understand architecture, run tests, interpret reports, and maintain the suite with minimal onboarding. |
| **Engineering objective** | Documentation and release polish only — update READMEs, `e2e/docs/`, CI notes, metrics/traceability artifacts; **no** new Page Objects, Workflows, Fixtures, business data, or feature specs. |
| **Expected outcome** | Handover pack complete; release checklist signed; project marked release-ready under Chromium + documented gates. |

**This is the final sprint** of the FormFlow Playwright automation project (v1 delivery).

---

## 2. Business objective

Stakeholders require a maintainable automation asset, not only a large test count. Sprint 08 must prove that:

- The framework is **understandable** (architecture, folders, strategy).  
- The suite is **operable** (setup, install, run, env, commands).  
- Failures are **diagnosable** (HTML report, traces, screenshots, video).  
- Coverage is **traceable** to AUT-* / product features.  
- Limitations and next steps are **honest and explicit**.  
- A receiving team can execute **PR smoke/critical** and **full regression** without tribal knowledge.

---

## 3. Engineering objective

| Principle | Binding rule |
|---|---|
| **Docs over code** | Prefer updating existing `e2e/README.md` and `e2e/docs/*` over inventing parallel doc trees. |
| **Summarize, don’t duplicate** | Point to Approved `00`–`03` and Sprint 00–07 specs; do not paste full sprint bodies. |
| **No feature creep** | Zero new business tests, POs, workflows, fixtures, or business packs. |
| **Accuracy** | Commands, paths, and CI steps must match the live repo (`frontend/`). |
| **Handover mindset** | Write for an engineer who has never seen this chat history. |

---

## 4. Deliverables

| # | Deliverable | Type |
|---|---|---|
| D1 | Updated `frontend/e2e/README.md` (operator entrypoint) | Doc |
| D2 | Completed / refreshed `frontend/e2e/docs/` guides | Doc |
| D3 | Traceability Matrix (AUT-* ↔ modules ↔ primary specs) | Doc artifact |
| D4 | Coverage Summary (by module / tag / sprint) | Doc artifact |
| D5 | Automation Metrics snapshot (release baseline) | Doc artifact |
| D6 | Final regression execution playbook | Doc |
| D7 | CI/CD execution notes (aligned with `.github/workflows/playwright.yml`) | Doc |
| D8 | Reporting & artifacts guide (HTML / Trace / screenshot / video) | Doc |
| D9 | Known limitations + future roadmap (updated) | Doc |
| D10 | Repository cleanup checklist executed | Process |
| D11 | Final Release Checklist signed | Process |
| D12 | Optional: CI path/working-directory fixes **only if** required for accurate docs (no feature tests) | Config (allowed) |

---

## 5. Repository impact

```text
FormFlow/
├── specs/playwright/
│   ├── SPRINT-08-RELEASE.md              ← this contract
│   ├── README.md                         ← mark Sprint 08 In Review → Done
│   └── (foundation + Sprint 00–07 unchanged except status pointers)
└── frontend/
    ├── e2e/
    │   ├── README.md                     ← COMPLETE (primary handover doc)
    │   ├── docs/
    │   │   ├── architecture.md           ← refresh pointer + summary
    │   │   ├── folder-structure.md       ← refresh to post–Sprint 07 tree
    │   │   ├── naming-conventions.md     ← verify current
    │   │   ├── how-to-add-test.md        ← verify current
    │   │   ├── contribution-guide.md     ← verify current
    │   │   ├── debugging-guide.md        ← expand reporting/trace/video
    │   │   ├── known-limitations.md      ← replace Sprint 00 stub with release truth
    │   │   ├── setup-and-execution.md    ← NEW (or fold into README — prefer one source)
    │   │   ├── test-strategy.md          ← NEW (concise)
    │   │   ├── ci-cd.md                  ← NEW
    │   │   ├── reporting.md              ← NEW
    │   │   ├── traceability-matrix.md    ← NEW
    │   │   ├── coverage-summary.md       ← NEW
    │   │   └── automation-metrics.md     ← NEW (release baseline)
    │   ├── authentication/ … quality/    ← README touch-ups only if stale
    │   ├── journeys/ pdf/ voice/         ← document as reserved / empty shells
    │   └── metrics/                      ← document reserved collectors
    ├── playwright.config.ts              ← document only (change only if CI/doc accuracy requires)
    ├── package.json                      ← document scripts; add doc-only scripts if useful
    └── .github/workflows/playwright.yml  ← document; fix cwd/paths if broken
```

**Forbidden:** new `*.spec.ts` for business features; new POs/workflows/fixtures/business data modules.

---

## 6. Release artifacts

| Artifact | Location | Purpose |
|---|---|---|
| Operator README | `frontend/e2e/README.md` | Clone → run in &lt;30 minutes |
| Engineering guides | `frontend/e2e/docs/` | Strategy, setup, CI, reporting, debug |
| Spec workspace | `specs/playwright/` | Authoritative SDD contracts |
| HTML report | `frontend/playwright-report/` (gitignored) | Local/CI failure analysis |
| Traces / screenshots / video | `frontend/test-results/` (gitignored) | Deep debug |
| CI artifacts | GitHub Actions upload | 14-day retention (current workflow) |
| Traceability Matrix | `e2e/docs/traceability-matrix.md` | AUT ↔ code map |
| Coverage Summary | `e2e/docs/coverage-summary.md` | What is / isn’t covered |
| Metrics baseline | `e2e/docs/automation-metrics.md` | Counts + gate commands |

---

## 7. Documentation deliverables

### 7.1 Must complete / refresh

| Doc | Must include |
|---|---|
| `e2e/README.md` | Prerequisites, install, run commands, module map, links to specs + docs, PR gate, regression commands |
| Setup / Installation / Execution | Node LTS, `npm ci`, `npx playwright install chromium`, `npm run start` / webServer behaviour, `PLAYWRIGHT_*` env |
| Env configuration | `PLAYWRIGHT_BASE_URL`, `CI`, `PLAYWRIGHT_TIMEOUT_MS`, `PLAYWRIGHT_ACTION_TIMEOUT_MS`, `AI_LIVE`, `DATA_SETUP` (reserved) |
| Command reference | Table of npm scripts + equivalent `npx playwright test …` |
| Architecture summary | Layers, hybrid modules, adapter, tags — **summary** linking to `00` |
| Folder structure | Current tree post Sprint 07; reserved empty shells |
| Test strategy | Pyramid position, tag strategy, smoke/critical/regression, mocking AI |
| CI/CD | Workflow file, triggers, artifacts, required secrets (none for default smoke) |
| Reporting | HTML report, Trace Viewer, screenshot, video policies from `playwright.config.ts` |
| Traceability + Coverage + Metrics | As in §14–§16 |
| Known limitations + Future roadmap | As in §17–§18 |

### 7.2 Reuse rule

Do **not** rewrite `00`–`03` or Sprint 01–07 specs. Quote sparingly; link heavily.

---

## 8. Test strategy

### 8.1 Positioning

| Layer | Ownership |
|---|---|
| Unit (Karma/Jasmine) | Application — out of Playwright scope |
| Component | Application — out of Playwright scope |
| E2E behavioural | `frontend/e2e/` — this project |
| NFR samples | `e2e/quality/` (Sprint 07) |

### 8.2 Tag strategy (binding)

| Tag | Use |
|---|---|
| `@smoke` | Fast confidence; PR gate |
| `@critical` | Business-critical paths; PR gate |
| `@regression` | Broader suites / quality resilience |
| Feature tags | `@auth` `@navigation` `@workspace` `@forms` `@joint` `@advisor` `@responsive` `@a11y` `@security` |
| `@ai-live` | Optional live Gemini — **not** PR gate |
| `@quarantine` | Known flake isolation |

**PR gate (current):** `npm run test:e2e:smoke` → `--grep "@smoke|@critical"`.

### 8.3 Data & determinism

- Auth/workspace via `DataSetupAdapter` (localStorage).  
- Advisor Gemini via `page.route` stubs (Sprint 06).  
- Do not require production API keys for default suites.

### 8.4 What Sprint 08 does **not** change

Test design of Sprints 01–07 remains authoritative. Sprint 08 documents **how to run and interpret**, not how to expand coverage.

---

## 9. Automation architecture summary

*(Summary only — binding detail in [`00-AUTOMATION-ARCHITECTURE.md`](./00-AUTOMATION-ARCHITECTURE.md))*

| Concept | FormFlow choice |
|---|---|
| Host | Colocated under `frontend/e2e/` |
| Shape | Hybrid feature modules + shared kernel |
| Layers | Specs → Workflows → Pages/Components → Fixtures/Adapters |
| Data setup | `DataSetupAdapter` (localStorage v1; API reserved) |
| Assertions | In specs; workflows assertion-free |
| Config | `frontend/playwright.config.ts` — Chromium project; webServer `ng serve` |
| Artifacts | Trace on first retry; screenshot/video on failure |

Import rule: feature modules may use `shared/`; features must not deep-import other features’ internals except documented reuse (e.g. quality → advisor stubs).

---

## 10. Folder structure guide

*(Summary — binding blueprint in [`02-PROJECT-STRUCTURE.md`](./02-PROJECT-STRUCTURE.md))*

| Path | Status at release |
|---|---|
| `e2e/shared/` | Kernel — Done |
| `e2e/authentication/` | Done (Sprint 01) |
| `e2e/shared/specs/navigation/` | Done (Sprint 02) |
| `e2e/workspace/` | Done (Sprint 03) |
| `e2e/forms/` (+ `joint/`) | Done (Sprints 04–05) |
| `e2e/advisor/` | Done (Sprint 06) |
| `e2e/quality/` | Done (Sprint 07) |
| `e2e/journeys/` | Reserved shell — document; no Sprint 08 journey fill |
| `e2e/pdf/`, `e2e/voice/` | Reserved — out of v1 automation |
| `e2e/metrics/` | Reserved collectors — optional Sprint 08 doc only |
| `e2e/docs/` | **Primary Sprint 08 work area** |

Implementation must refresh `e2e/docs/folder-structure.md` to match disk reality (including quality + advisor).

---

## 11. Execution guide

### 11.1 Prerequisites

- Node.js LTS  
- Working directory: **`frontend/`**  
- Angular app runnable via `npm run start` (Playwright `webServer` can start it)

### 11.2 Installation

```bash
cd frontend
npm ci
npx playwright install chromium
```

### 11.3 Environment

| Variable | Default | Purpose |
|---|---|---|
| `PLAYWRIGHT_BASE_URL` | `http://localhost:4200` | App under test |
| `CI` | unset / `true` in Actions | Retries, workers, forbidOnly |
| `PLAYWRIGHT_TIMEOUT_MS` | `30000` | Test timeout |
| `PLAYWRIGHT_ACTION_TIMEOUT_MS` | `15000` | Action/expect timeout |
| `AI_LIVE` | unset | Reserved live Gemini |
| `DATA_SETUP` | `localStorage` | Adapter mode reserved |

### 11.4 Command reference (must document)

| Intent | Command |
|---|---|
| All e2e | `npm run test:e2e` |
| PR gate (smoke \| critical) | `npm run test:e2e:smoke` |
| Smoke only | `npm run test:e2e:smoke-only` |
| Critical only | `npm run test:e2e:critical-only` |
| Quality module | `npm run test:e2e:quality` |
| Module example | `npx playwright test e2e/advisor/specs` |
| Open HTML report | `npm run test:e2e:report` |
| UI mode (optional) | `npx playwright test --ui` |
| Headed debug | `npx playwright test --headed --debug` |

### 11.5 Final regression execution strategy

Document and (at DoD) **execute once** as evidence:

| Phase | Command / scope | Gate |
|---|---|---|
| 1. PR gate | `npm run test:e2e:smoke` | Must pass |
| 2. Quality | `npm run test:e2e:quality` | Must pass |
| 3. Full suite | `npm run test:e2e` | Must pass for release |
| 4. Optional module drills | Auth, Nav, Workspace, Forms, Advisor | If phase 3 flakes, isolate |

**Recording:** Capture pass counts + wall time into `e2e/docs/automation-metrics.md` (release baseline).

**Sharding / browsers:** Not required for v1 release. Document as future work.

---

## 12. CI/CD guide

### 12.1 Current workflow

File: `frontend/.github/workflows/playwright.yml`

| Item | Current behaviour |
|---|---|
| Name | Playwright Smoke |
| Triggers | `push` / `pull_request` to `main` \| `master` |
| Browser | Chromium (+ deps) |
| Command | `npm run test:e2e:smoke` |
| Artifacts | `playwright-report/`, `test-results/` (14 days) |

### 12.2 Sprint 08 CI documentation tasks

1. Document exact steps for contributors.  
2. **Verify** `defaults.run.working-directory` and artifact paths match `frontend/` layout — if incorrect, **fix CI only** (allowed config change; no feature tests).  
3. State that full regression is **manual / scheduled** unless a future workflow is added (out of scope to invent heavy CI without approval).  
4. No secrets required for default smoke (localStorage + mocked AI).

---

## 13. Reporting strategy

### 13.1 Configured policies (`playwright.config.ts`)

| Artifact | Policy |
|---|---|
| HTML report | Always written to `playwright-report/` (`open: 'never'`) |
| Trace | `on-first-retry` |
| Screenshot | `only-on-failure` |
| Video | `retain-on-failure` |
| CI reporters | `list` + `github` + `html` |

### 13.2 Operator playbook (must document)

| Need | How |
|---|---|
| Browse results | `npm run test:e2e:report` → Playwright HTML report |
| Open a trace | From report “Traces” or `npx playwright show-trace <path>` |
| Find screenshot/video | `test-results/<test-path>/` |
| CI download | Actions → job artifacts `playwright-report` / `test-results` |

### 13.3 What not to commit

`playwright-report/`, `test-results/`, and auth storage under `e2e/.auth/` (except README) remain gitignored.

---

## 14. Traceability Matrix

Sprint 08 must produce `e2e/docs/traceability-matrix.md` mapping:

| Domain | AUT IDs (representative) | Module | Primary specs |
|---|---|---|---|
| Auth | AUT-AUTH-01…10 | `authentication/` | `auth.*.spec.ts` |
| Navigation | AUT-NAV-01…04 | `shared/specs/navigation/` | `nav.*.spec.ts` |
| Workspace | AUT-WS-01…08 | `workspace/` | `ws.*.spec.ts` |
| Forms / Renderer | AUT-FORM / AUT-REN | `forms/` | `df.*.spec.ts`, renderer specs |
| Joint | AUT-JOINT-01…06 | `forms/joint` + joint specs | `ja.*.spec.ts` |
| Advisor | AUT-ADV-01…10 | `advisor/` | `adv.*.spec.ts` |
| Quality | AUT-QA-01…08 | `quality/` | `qa.*.spec.ts` |
| Harness | — | `shared/specs/` | `harness.health.spec.ts` |

Include journey IDs (J-WS-*, J-DF-*, J-ADV-*, J-QA-*) as a second table.  
Link product behaviour to [`specs/001-formflow/`](../001-formflow/) where relevant — do not invent product rules.

---

## 15. Coverage Summary

Sprint 08 must produce `e2e/docs/coverage-summary.md` with:

### 15.1 In coverage (v1)

- Authentication, landing/nav, workspace, dynamic forms, joint account, Smart Banking Advisor (mocked), quality (responsive/keyboard/resilience/session/network samples), harness health.

### 15.2 Explicit exclusions (v1)

- Voice Assist, PDF Smart Assist, live LLM quality, full axe, visual baselines, soft perf budgets, Firefox/WebKit, dedicated `journeys/` J01–J20 catalogue fill.

### 15.3 Counts (baseline — refresh at DoD)

Populate from live inventory at implementation time. **Indicative post–Sprint 07 baseline** (must be re-measured):

| Metric | Indicative |
|---|---|
| Total Playwright tests | ~400 |
| Spec files | ~51 |
| Page objects | ~11 |
| Workflows | ~7 |
| Fixtures modules | ~4 |
| Quality tests | 42 |
| Smoke / Critical (grep) | ~27 / ~18 |

---

## 16. Automation Metrics

`e2e/docs/automation-metrics.md` must record **release baseline** after final regression:

| Metric | Source |
|---|---|
| Total Playwright Tests | `npx playwright test --list` or suite totals |
| Total Spec Files | Inventory |
| Total Page Objects | `*.page.ts` count |
| Total Workflows | `*workflow*.ts` (excl. index) |
| Total Fixtures | `*fixture*.ts` (excl. index) |
| Total Data Modules | packs / matrices / responses |
| Smoke Tests | `--grep @smoke` |
| Critical Tests | `--grep @critical` |
| Quality Suite | `e2e/quality/specs` |
| Full regression wall time | Timed `npm run test:e2e` |
| PR gate wall time | Timed `npm run test:e2e:smoke` |
| Pass rate | Final run |

Update date + git SHA (or commit message) on the metrics doc.

---

## 17. Known limitations

Must be documented honestly (update `known-limitations.md`):

| Limitation | Detail |
|---|---|
| Chromium only | No Firefox/WebKit projects in config |
| localStorage backend | Demo auth/workspace — not REST |
| No real session TTL | Quality suite simulates clear-session |
| No offline product UI | Network tests use abort / `setOffline` |
| Shell nav hidden &lt;768px | No hamburger |
| Advisor AI mocked | Live Gemini optional `@ai-live` only |
| A11y | Keyboard/landmark smoke — not full axe |
| Visual | Landmark sanity — not pixel baselines |
| Journeys folder | Reserved; cross-feature catalogue not filled as separate module |
| Voice / PDF | Product features not automated |
| CI layout | Workflow may need `working-directory: frontend` — verify/fix in Sprint 08 |

---

## 18. Future improvements

Prioritized backlog (documentation only in Sprint 08 — no implementation):

1. Firefox / WebKit nightly projects  
2. Scheduled full-regression workflow  
3. `journeys/` J01–J20 consolidation suite  
4. axe-core critical/serious gate on agreed pages  
5. Selective visual baselines  
6. Soft performance budgets + metrics collectors  
7. Voice Assist + PDF Smart Assist automation  
8. `DataSetupAdapter` API mode when backend exists  
9. Quarantine / flake dashboard  
10. Playwright component testing (if adopted by app team)

---

## 19. Final Release Checklist

Implementation must complete and tick:

### Documentation

- [x] `e2e/README.md` complete for onboarding  
- [x] `e2e/docs/` guides listed in §7 present and accurate  
- [x] Traceability Matrix published  
- [x] Coverage Summary published  
- [x] Automation Metrics baseline published  
- [x] Known limitations + future roadmap updated  
- [x] Spec workspace README marks Sprint 08 Done  

### Execution evidence

- [x] PR gate green (`test:e2e:smoke`) — included in full regression (27 smoke / 18 critical)  
- [x] Quality suite green (`test:e2e:quality`) — 42/42 in final regression  
- [x] Full regression green with metrics recorded — **400/400**, ~12.8 min (sequential suites)  
- [x] HTML report openable via `test:e2e:report`  
- [x] Trace/screenshot/video behaviour documented from `playwright.config.ts` + `e2e/docs/reporting.md`  

### Repository hygiene

- [x] No secrets committed  
- [x] Gitignore covers reports / test-results / `.auth` state  
- [x] Stale Sprint 00 wording removed from module READMEs where misleading  
- [x] Empty shells (`journeys`, `pdf`, `voice`, `metrics`) clearly marked reserved  
- [x] Optional: `_restore_smart_assist` left as product recovery asset (not deleted)  

### Handover

- [x] Project Handover section (§22) filled with contacts / links  
- [x] Completion Report delivered  
- [x] No Sprint 09 leapfrog coding  

---

## 20. Acceptance Criteria

1. All documentation deliverables in §4 / §7 exist and are technically accurate.  
2. No new business automation (POs / workflows / fixtures / feature specs / business data) introduced.  
3. Operator can follow README alone to install and run PR gate.  
4. Traceability Matrix links AUT domains to modules.  
5. Coverage Summary states in/out of scope for v1.  
6. Automation Metrics capture release baseline after final regression.  
7. Reporting strategy documents HTML, Trace, screenshot, video.  
8. CI/CD guide matches (or fixes) the live workflow.  
9. Final Release Checklist completed.  
10. Spec Approved before implementation; Completion Report after.

**Status:** All acceptance criteria met (2026-07-21).

---

## 21. Definition of Done

- [x] This specification **Approved**  
- [x] Documentation pack implemented per §4–§7  
- [x] Final regression executed and metrics recorded  
- [x] Release Checklist §19 complete  
- [x] `specs/playwright/README.md` updated (Sprint 08 Done; project v1 released)  
- [x] Completion Report delivered  
- [x] No new business test code merged under this sprint  

---

## 22. Project Handover

### 22.1 Receiving engineer — first hour

1. Read `specs/playwright/README.md` (process).  
2. Skim `00` architecture + `02` structure.  
3. Open `frontend/e2e/README.md` and run install + `npm run test:e2e:smoke`.  
4. Open HTML report.  
5. Skim Traceability Matrix + Coverage Summary + Known limitations.

### 22.2 Where truth lives

| Question | Answer |
|---|---|
| How is the framework shaped? | `specs/playwright/00-…` |
| What was supposed to be covered? | `01-IMPLEMENTATION-SPEC.md` + Sprint 01–07 |
| Where do files go? | `02-PROJECT-STRUCTURE.md` + `e2e/docs/folder-structure.md` |
| How do I run tests today? | `frontend/e2e/README.md` |
| What is deferred? | `e2e/docs/known-limitations.md` + §18 |
| Release metrics | `e2e/docs/automation-metrics.md` |

### 22.3 Ownership

| Role | Name / team | Notes |
|---|---|---|
| Automation owner | FormFlow engineering | Primary maintainer of `frontend/e2e/` |
| Product / app owner | FormFlow engineering | Schema & UX changes in `frontend/src/` |
| CI owner | FormFlow engineering | `.github/workflows/playwright.yml` |

### 22.4 Support model

- Feature regressions → module README + owning sprint spec.  
- Framework changes → amend `00`/`02` via review before structure drift.  
- Flakes → quarantine tag + issue; do not disable smoke silently.

---

## Implementation Handoff

**Sprint 08 implementation complete (2026-07-21).** FormFlow Playwright automation **v1 is released**.

### Completed

1. Documentation under `frontend/e2e/README.md` and `frontend/e2e/docs/`.  
2. `specs/playwright/README.md` status (Sprint 08 Done).  
3. Final regression + metrics recorded.  
4. Release Checklist complete.  
5. CI working-directory / artifact paths aligned.  
6. Sprint 08 Completion Report delivered in chat.

### Forbidden going forward (v1 freeze)

- New business feature tests, Page Objects, Workflows, Fixtures, or business test data under “Sprint 09”.  
- Filling `journeys/`, `pdf/`, or `voice/` without a new approved spec.  
- Expanding axe / visual / multi-browser as mandatory without a new roadmap.

---

## Document control

| Role | Name | Date | Decision |
|---|---|---|---|
| Author | Automation Architect (Cursor) | 2026-07-20 | Spec authored |
| Reviewer | Engineering | 2026-07-20 | **Approved** |
| Implementer | Automation Engineer (Cursor) | 2026-07-21 | **Done** — v1 release complete |

**Status:** FormFlow Playwright automation **v1 release complete**. No Sprint 09 under this plan.
