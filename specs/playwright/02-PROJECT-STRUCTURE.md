# FormFlow Playwright Project Structure

**Document Type:** Repository & Project Structure Specification  
**Project:** FormFlow Playwright Automation  
**Version:** 1.0  
**Status:** Approved  
**Parent Document:** [01-IMPLEMENTATION-SPEC.md](./01-IMPLEMENTATION-SPEC.md) (Approved)  
**Related Documents:** [00-AUTOMATION-ARCHITECTURE.md](./00-AUTOMATION-ARCHITECTURE.md), [README.md](./README.md), [`../001-formflow/`](../001-formflow/)  
**Code:** None — this document defines organization only; it does not create folders on disk beyond this specification file

---

## 1. Document purpose

### 1.1 Why this document exists

Approved [Architecture](./00-AUTOMATION-ARCHITECTURE.md) defines **shape**.  
Approved [Implementation Spec](./01-IMPLEMENTATION-SPEC.md) defines **what** engineering work must deliver.

This document freezes **where** everything lives: repository hierarchy, framework modules, documentation, reports, CI, and navigation rules. It is the **official repository blueprint**.

Without it, sprints invent conflicting folder trees and ownership blurs.

### 1.2 Relationship to prior documents

| Document | Relationship |
|---|---|
| [README.md](./README.md) | Process and gates; this blueprint is what engineers navigate after reading the README |
| [00-AUTOMATION-ARCHITECTURE.md](./00-AUTOMATION-ARCHITECTURE.md) | Parent of parent — hybrid modules and import rules are binding; this doc materializes them as paths |
| [01-IMPLEMENTATION-SPEC.md](./01-IMPLEMENTATION-SPEC.md) | Immediate parent — layers, standards, and AUT-* map onto these folders |
| `03-IMPLEMENTATION-ROADMAP.md` | **Next** — assigns sprint work to these paths |

### 1.3 Why Project Structure before Sprint planning

Sprint specs must name deliverable paths (e.g. `authentication/specs/`, `forms/joint/`).  
Roadmap must schedule “create shared kernel” before “auth specs.”  
Those statements are meaningless until the tree is **Approved**.

**Rule:** Do not author sprint specifications until `00`–`03` are Approved. Do not invent folders that contradict this blueprint.

### 1.4 Explicit non-goals

- Creating Playwright code, page objects, locators, or tests  
- Authoring sprint specifications  
- Authoring `03` in this step  
- Changing application source layout under `frontend/src/`  

### 1.5 Naming decision: no top-level `playwright/` app package

Some enterprise layouts use a root `playwright/` package. **FormFlow does not.**

Per Approved Architecture, the Playwright project is **colocated with the Angular app**:

| Conceptual name | Canonical path |
|---|---|
| Playwright framework | `frontend/e2e/` |
| Playwright config | `frontend/playwright.config.ts` |
| Generated reports | `frontend/playwright-report/`, `frontend/test-results/` (gitignored) |
| Automation SDD | `specs/playwright/` |
| Framework docs (runtime) | `frontend/e2e/docs/` |

A separate top-level `playwright/` directory is **out of scope** unless Architecture is amended.

---

## 2. Repository organization

### 2.1 Top-level hierarchy (target blueprint)

```text
FormFlow/                          # Repository root
├── README.md                      # Product + pointer to specs (optional update later)
├── .github/
│   └── workflows/                 # CI/CD (playwright.yml and related) — created when coding allowed
├── specs/
│   ├── 001-formflow/              # Application Spec-Driven Development (existing)
│   └── playwright/                # Automation Spec-Driven Development (this workspace)
├── frontend/                      # Angular application + Playwright project host
│   ├── src/                       # Application source (product code)
│   ├── e2e/                       # Playwright automation framework (canonical)
│   ├── playwright.config.ts       # Playwright project configuration (Sprint 00+)
│   ├── playwright-report/         # HTML report output (gitignored)
│   ├── test-results/              # Traces, screenshots, videos (gitignored)
│   ├── package.json               # App + e2e npm scripts
│   └── …                          # angular.json, etc.
└── (no top-level playwright/)
```

Optional later (not required for v1 blueprint):

```text
FormFlow/
├── docs/                          # Cross-cutting org docs if needed; prefer specs/ + e2e/docs/
└── reports/                       # Published historical aggregates (CI Pages); not local git noise
```

### 2.2 Ownership of every top-level area

| Path | Purpose | Owner |
|---|---|---|
| `specs/001-formflow/` | Product behaviour, schema, app design | Product / app engineering |
| `specs/playwright/` | Automation architecture, impl spec, structure, roadmap, sprints | QA Automation Lead |
| `frontend/src/` | Angular Banking Portal | App engineering |
| `frontend/e2e/` | Playwright framework and specs | Automation engineering |
| `frontend/playwright.config.ts` | Runner projects, reporters, webServer | Automation engineering |
| `frontend/playwright-report/`, `test-results/` | Ephemeral execution artifacts | CI + local runs (not committed) |
| `.github/workflows/` | PR/nightly pipelines, artifact upload | Automation + platform |
| Root `README.md` | How to run the app; may link to both spec trees | Maintainers |

---

## 3. Playwright framework organization

Canonical tree under `frontend/e2e/` (hybrid feature modules). **Responsibilities only — no files created by this document.**

```text
frontend/e2e/
├── README.md
├── docs/                          # Framework how-to docs (see §4)
├── shared/                        # KERNEL — no feature business rules
│   ├── config/                    # env, constants, test-tags
│   ├── adapters/                  # DataSetupAdapter + localStorage (+ future api)
│   ├── api/                       # Future Spring Boot helpers (empty until backend)
│   ├── fixtures/                  # base merge, storage, network
│   ├── pages/                     # base.page, portal-shell
│   ├── components/
│   │   └── primeng/               # password, select, datepicker, multiselect
│   ├── utils/                     # date, random, file, wait, validation, a11y, visual, screenshot
│   ├── data/
│   │   ├── users/
│   │   └── generators/
│   └── support/                   # global-setup, global-teardown
├── authentication/
│   ├── pages/
│   ├── workflows/
│   ├── fixtures/
│   ├── data/
│   └── specs/
├── workspace/
│   ├── pages/
│   ├── components/
│   ├── workflows/
│   ├── fixtures/
│   ├── data/
│   └── specs/
├── forms/
│   ├── pages/                     # form-host
│   ├── components/                # dynamic-form, repeater
│   ├── workflows/
│   ├── fixtures/
│   ├── data/                      # per-scenario packs
│   ├── specs/
│   │   ├── renderer/
│   │   ├── account-opening/
│   │   ├── loan-inquiry/
│   │   ├── smart-credit-card/
│   │   ├── customer-support/
│   │   └── joint-family-account/
│   └── joint/                     # joint-only workflows/components if needed
├── advisor/
│   ├── pages/
│   ├── components/
│   ├── workflows/
│   ├── fixtures/
│   ├── data/
│   └── specs/
├── pdf/
│   ├── components/
│   ├── workflows/
│   ├── fixtures/
│   ├── data/                      # PDF samples
│   └── specs/
├── voice/
│   ├── components/
│   ├── workflows/
│   ├── fixtures/
│   ├── data/                      # mock transcripts
│   └── specs/
├── journeys/
│   ├── workflows/                 # optional composers
│   ├── data/
│   └── specs/                     # J01–J20
├── quality/
│   ├── a11y/
│   ├── responsive/
│   ├── security/
│   ├── visual/
│   └── performance/
└── metrics/
    └── (reporter / collectors — Sprint 07+)
```

### 3.1 Layer folder responsibilities

| Folder role | Responsibility | Ownership |
|---|---|---|
| **pages/** | Route/chrome surfaces; readiness; user-intent actions | Feature module or `shared/pages` |
| **components/** | Reusable UI fragments; no navigation | Feature or `shared/components` |
| **workflows/** | Multi-step sequences; no locators; no assertions | Feature or `journeys` |
| **fixtures/** | Personas, seeds, mocks for that feature; compose into shared index | Feature + `shared/fixtures` |
| **utils/** | Cross-cutting helpers | `shared/utils` only (do not scatter utils per feature unless feature-private and tiny) |
| **helpers/** | Alias not used as a root — prefer `utils/` and `adapters/` to avoid dual homes | N/A |
| **constants/** | Live under `shared/config/constants.ts` (routes, keys, scenario IDs) | Shared |
| **data/** | Static/dynamic packs for the module | Feature `data/` + `shared/data` |
| **config/** | Env, tags, timeouts | `shared/config` + `playwright.config.ts` |
| **specs/** (tests) | Tagged Playwright specs | Feature / journeys / quality |
| **reports/** | Not source — generated under `frontend/playwright-report` | CI/local |

### 3.2 Mapping common names → canonical paths

| Common name | Canonical location |
|---|---|
| `tests/` | `**/specs/` inside modules (not a flat root `tests/`) |
| `helpers/` | `shared/utils/` (+ adapters) |
| `constants/` | `shared/config/` |
| Scaffold `frontend/tests/` | **Retired** in Sprint 00 in favor of `e2e/` |

---

## 4. Documentation organization

| Document | Location | When referenced |
|---|---|---|
| Workspace README | `specs/playwright/README.md` | Always first for automation contributors |
| Architecture | `specs/playwright/00-…` | Before any structural or coding debate |
| Implementation Spec | `specs/playwright/01-…` | When defining coverage, standards, AUT-* |
| Project Structure | `specs/playwright/02-…` (this file) | When adding folders/modules |
| Implementation Roadmap | `specs/playwright/03-…` | When planning sprints/CI cadence |
| Sprint Specifications | `specs/playwright/SPRINT-XX-…` | During that sprint only |
| Coding standards / contribution / debugging | `frontend/e2e/docs/` (stubs Sprint 00; filled over sprints) | During implementation & PR review |
| Release notes | `frontend/e2e/docs/release-notes.md` or Sprint 09 appendix | Release |
| App product docs | `specs/001-formflow/` | When tracing product behaviour |

**Rule:** Specs under `specs/playwright/` govern *what/when/why*. `e2e/docs/` govern *how to work in the repo day-to-day* after code exists.

---

## 5. Specification organization and lifecycle

```text
README.md
    ↓ Approved (continuous updates allowed)
00-AUTOMATION-ARCHITECTURE.md
    ↓ Approved
01-IMPLEMENTATION-SPEC.md
    ↓ Approved
02-PROJECT-STRUCTURE.md          ← this document
    ↓ Approved
03-IMPLEMENTATION-ROADMAP.md
    ↓ All foundation Approved
SPRINT-00-FOUNDATION.md
    ↓ Approved → framework implementation may begin
SPRINT-01 … SPRINT-09
    ↓ each Approved before the next is authored
```

### 5.1 Dependencies

| Document | Depends on | Unlocks |
|---|---|---|
| README | — | Navigation |
| 00 | Architecture Review + app specs | 01 |
| 01 | 00 Approved | 02 |
| 02 | 01 Approved | 03 |
| 03 | 02 Approved | SPRINT-00 |
| SPRINT-00 | 00–03 Approved | Code + later sprints |
| SPRINT-0N | Prior sprint Approved | Next sprint + that sprint’s implementation |

---

## 6. Test organization

Suites are organized by **tags** (see `00` / `01`) and by **folder**:

| Suite | Primary home | Responsibility |
|---|---|---|
| Smoke | Tagged across modules; thin set | Fast PR gate |
| Critical | Tagged subset | Highest business risk |
| Regression | Feature `specs/` | Full feature matrix |
| Feature | `authentication/`, `workspace/`, `forms/`, … | Domain behaviour |
| Integration | Feature + `@integration` | Hydration, draft, advisor→form, storage seams |
| Journey | `journeys/specs/` | Multi-feature J01–J20 |
| Accessibility | `quality/a11y/` | axe critical/serious |
| Responsive | `quality/responsive/` | Viewport projects |
| Security | `quality/security/` (+ auth guard specs) | Guards, returnUrl, session |
| Performance | `quality/performance/` | Soft budgets advisory |
| Visual | `quality/visual/` | Selective Chromium baselines |

Do **not** create a parallel flat `tests/smoke/` tree that duplicates feature ownership. Smoke is a **tag**, not a second copy of files (optional thin `journeys` or auth smoke files may carry `@smoke`).

---

## 7. Feature organization (module boundaries)

| Business feature | Automation module | Boundary |
|---|---|---|
| Authentication | `authentication/` | Login/register/session/guards; landing may live here or shared — prefer `authentication/pages` for landing/login/register |
| Landing | `authentication/` (landing page) | Marketing/guest entry; no workspace imports |
| Navigation / shell | `shared/pages/portal-shell` | Chrome only; no form field logic |
| Workspace | `workspace/` | Dashboard, profile, applications, panels |
| Dynamic forms | `forms/` | FormHost, DynamicForm, scenario specs, renderer |
| Joint account | `forms/joint` + joint scenario specs | Repeater/cross-applicant; may import forms components only |
| Advisor | `advisor/` | Advise UI, apply, memory fixtures |
| Voice | `voice/` | Support-only panel; may use DynamicForm patch seam |
| PDF / Smart Assist | `pdf/` | Upload/autofill/conflicts; may use DynamicForm patch seam |
| Shared components | `shared/components` + `forms/components` | PrimeNG in shared; DynamicForm in forms |

**Import rule reminder:** features do not import sibling feature internals; journeys and documented patch seams are the exceptions.

---

## 8. Reporting organization

| Artifact | Location | Retention |
|---|---|---|
| HTML report | `frontend/playwright-report/` | Local ephemeral; CI artifact per run |
| Trace / screenshots / videos | `frontend/test-results/` | Failure retain; CI artifact |
| Auth storage state | `frontend/e2e/.auth/` (or `shared` auth-state) | Gitignored |
| Visual baselines | `frontend/e2e/quality/visual/` (committed) | Versioned with intentional PRs |
| Metrics JSON | `frontend/e2e/metrics/output/` or CI artifact | Historical via CI retention |
| Failure logs | CI job logs + report attachments | Per pipeline retention policy |
| Historical reports | CI artifacts / optional `reports/` publish site | 30–90 days recommended |

**Retention strategy:** Do not commit HTML/trace/video. Commit visual baselines only. Keep CI artifacts long enough for flake triage (e.g. 14–30 days).

---

## 9. CI/CD organization

| Concern | Location / ownership |
|---|---|
| Workflows | `.github/workflows/playwright.yml` (and optional nightly split) |
| Artifacts | Upload `playwright-report/`, `test-results/` |
| Browser matrix | Projects in `playwright.config.ts` (chromium PR; firefox/webkit nightly) |
| Environment | `shared/config/env.ts` + CI env vars (`CI`, `AI_LIVE`) |
| Secrets | GitHub Secrets (`GEMINI_API_KEY` only for `@ai-live`) |
| Execution reports | Job summary + HTML artifact |
| Scalability | Shard regression; raise workers after isolation proven; path filters for visual |

CI must not invent a second folder layout; it only invokes scripts against `frontend/e2e`.

---

## 10. Repository navigation guide (new engineer)

```text
1. specs/playwright/README.md          → gates and map
2. 00-AUTOMATION-ARCHITECTURE.md       → why hybrid / tags / adapter
3. 01-IMPLEMENTATION-SPEC.md           → AUT-*, standards, what “done” means
4. 02-PROJECT-STRUCTURE.md             → where everything lives (this file)
5. 03-IMPLEMENTATION-ROADMAP.md        → when work happens
6. Current SPRINT-XX-*.md              → this sprint’s scope only
7. frontend/e2e/README.md + e2e/docs/  → how to run/debug (after Sprint 00)
8. Implementation in frontend/e2e/     → only after Sprint 00 Approved
```

**Why this order:** Process → shape → requirements → paths → schedule → sprint slice → hands-on. Skipping to code causes architecture drift.

---

## 11. Repository growth strategy (app / suite doubles)

| Growth | Action |
|---|---|
| New Angular feature | Add `frontend/e2e/<feature>/` matching app feature; add module tag; extend AUT-* in `01` (amend + approve); add sprint or backlog item via roadmap |
| New form scenario | Add `forms/data/<id>.*` + `forms/specs/<id>/`; reuse DynamicForm; no new page-per-field |
| New AI surface | Prefer new module folder (`pdf`-style) over dumping into `shared/` |
| Documentation | Amend foundation docs if structure/standards change; add sprint notes; keep `e2e/docs` how-tos current |
| Ownership | One CODEOWNERS (or documented owner) per feature module; `shared/` owned by Automation Lead |

**Forbidden growth patterns:** recreating flat `e2e/pages/`; putting feature specs under `shared/`; unchecked `shared/utils` dumping ground.

---

## 12. Governance

| Area | Rule |
|---|---|
| Folder ownership | Feature teams own their module; shared kernel changes require Automation Lead review |
| Documentation ownership | `specs/playwright/` = QA Lead; `e2e/docs/` = automation contributors with Lead review on standards |
| Specification ownership | Only Approved specs are authoritative; amend via PR with status workflow |
| Review process | Spec PRs: architecture fidelity check; Code PRs: structure + `01` standards |
| Versioning | Spec docs carry `Version:` in header; breaking structure changes bump `02` and require `00` review if conflicting |
| Contribution rules | Specs before code; no leapfrog gates; no raw storage in specs |
| Engineering review | Reject PRs that add folders outside this blueprint without amending `02` |

---

## 13. Final repository blueprint

```text
Repository (FormFlow)
│
├── Specifications
│   ├── specs/001-formflow/          → Product SDD
│   └── specs/playwright/            → Automation SDD (00→03→SPRINTS)
│
├── Framework
│   └── frontend/e2e/                → Hybrid modules + shared kernel
│       ├── shared/
│       ├── authentication/ | workspace/ | forms/ | advisor/ | pdf/ | voice/
│       ├── journeys/ | quality/ | metrics/
│       └── docs/
│
├── Documentation
│   ├── specs/playwright/*.md        → Authoritative planning
│   └── frontend/e2e/docs/           → Day-to-day engineering guides
│
├── Reports (generated)
│   ├── frontend/playwright-report/
│   ├── frontend/test-results/
│   └── CI artifacts / optional published history
│
├── CI/CD
│   └── .github/workflows/           → Tag-based jobs, matrix, secrets, artifacts
│
└── Implementation (application)
    └── frontend/src/                → Angular app under test
```

**How parts connect**

- Specs define *what/when*.  
- Framework paths realize *where*.  
- CI executes *tagged* specs against the app.  
- Reports prove *outcomes*.  
- App `src/` remains the system under test — automation never owns product behaviour.

---

## 14. Exit criteria

This document may be marked **Approved** when reviewers confirm:

1. Top-level ownership (`specs/`, `frontend/e2e/`, `.github/`) is accepted.  
2. Decision against a separate top-level `playwright/` package is accepted (or formally amended in `00`).  
3. Hybrid `e2e/` module tree matches Approved Architecture.  
4. Layer folder responsibilities and test/feature organization are accepted.  
5. Reporting and CI locations are accepted.  
6. Growth and governance rules are accepted.  
7. Stakeholders agree the **next** document is `03-IMPLEMENTATION-ROADMAP.md`.

### Next document: `03-IMPLEMENTATION-ROADMAP.md`

**Why the roadmap depends on this document**

- Roadmap must schedule “create `shared/adapters`,” “auth module,” “quality/visual,” etc.  
- Those deliverables are **paths and ownership** defined here.  
- Without an Approved structure, sprint plans cannot assign concrete work or CI jobs to directories locations.

**Still blocked after this approval:** Sprint specs (need `03` too). Code (need Sprint 00 Approved).

---

## 15. Approval

| Role | Name | Date | Decision |
|---|---|---|---|
| Author | Principal Software Architect / QA Automation Lead | 2026-07-20 | Submitted for review |
| Reviewer | Product / QA Lead | 2026-07-20 | **Approved** |

**To approve:** *(Completed 2026-07-20 — Status set to Approved.)* Next document: `03-IMPLEMENTATION-ROADMAP.md`.
