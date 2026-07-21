# FormFlow Playwright Automation Architecture

**Document Type:** Automation Architecture Specification  
**Project:** FormFlow Playwright Automation  
**Version:** 1.0  
**Status:** Approved  
**Parent Document:** Approved Architecture Review (Cursor plan v1.1)  
**Related Documents:** [README.md](./README.md), [`../001-formflow/`](../001-formflow/)  
**Code:** None — this document does not authorize implementation

---

## 1. Document overview

### 1.1 Purpose

This document is the **binding automation architecture** for FormFlow’s Playwright program. It defines how the automation framework is structured, which layers and modules exist, how dependencies flow, and which engineering principles govern all later specifications and code.

It answers **how the framework is shaped**, not the full catalogue of every test case (owned later by `01-IMPLEMENTATION-SPEC.md`) and not the sprint calendar (owned later by `03-IMPLEMENTATION-ROADMAP.md`).

### 1.2 Why it exists

Without an approved architecture, each sprint invents structure, tags, and data setup. This document freezes those decisions so `01`–`03` and all sprints refine delivery **without redesign**.

### 1.3 Audience

| Audience | Use |
|---|---|
| Automation engineers | Build only within this shape |
| Reviewers | Reject PRs that violate layers, modules, or gates |
| Future maintainers | Understand why hybrid modules and the adapter exist |

### 1.4 Architecture fidelity

This specification **distills and organizes** the approved Architecture Review. It must **not** introduce conflicting architectural decisions. Any proposed conflict requires **explicit architectural review** before this document can be re-approved.

### 1.5 Explicit non-goals

This document does **not**:

- Authorize creation of Playwright tests, page objects, or locators  
- Define the full AUT-* requirement catalogue (see `01`)  
- Freeze the literal file tree line-by-line (see `02`, which must align with §5)  
- Schedule sprints day-by-day (see `03`)  
- Replace Karma/Jasmine unit tests  

---

## 2. System under test (context)

| Aspect | Fact |
|---|---|
| Application | FormFlow Angular 20 banking portal (`frontend/`) |
| URL | `http://localhost:4200` |
| Persistence | localStorage mock backend (auth + workspace); no bank REST API today |
| Forms | Schema-driven dynamic renderer; five bundled scenarios |
| AI | Smart Assist (PDF label path), Voice Assist (support only), Banking Advisor (Gemini) |
| Existing Playwright | Scaffold only (`playwright.config.ts`, example spec) — to be replaced after Sprint 00 |

Application behavioural authority remains [`specs/001-formflow/`](../001-formflow/).

---

## 3. Objectives of the automation framework

1. Prove critical banking portal journeys against the real Angular UI.  
2. Protect schema-driven renderer behaviour (visibility, validators, repeaters, submit).  
3. Stabilize auth, session, and route-guard behaviour against the localStorage mock.  
4. Cover AI features with **deterministic** mocks; optional live Gemini only behind `@ai-live`.  
5. Produce CI-ready artifacts (HTML reports, traces, screenshots, videos on failure).  
6. Remain evolvable when a Spring Boot backend replaces localStorage (§10).

---

## 4. Layered architecture

### 4.1 Layers and dependency rule

```text
Tests (specs)
    ↓
Fixtures
    ↓
Pages / Components / Workflows
    ↓
Utilities / Adapters / Data
    ↓
Config
```

**Strict rules**

- Specs → fixtures → pages/components/workflows → utils/adapters → config.  
- Pages never import specs.  
- Utilities never import pages.  
- Workflows compose pages/components; they do **not** own assertions or raw locators.  
- Specs do not embed locator logic (except forbidden exploratory spikes — banned in CI).

### 4.2 Layer responsibilities

| Layer | Responsibility | Must not |
|---|---|---|
| Config | Browsers, workers, retries, reporters, `webServer`, env | Contain assertions |
| Fixtures | Auth state, seeded data, scenario context, network stubs | Embed business assertions |
| Pages | Navigation, page-level actions, readiness | Know other pages’ internals |
| Components | Reusable UI fragments (form fields, panels, PrimeNG) | Own navigation |
| Workflows | Multi-step business journeys | Be thin single-click wrappers; assert outcomes |
| Data | Static/dynamic payloads, AI fixtures | Touch Playwright test APIs |
| Utils / Adapters | Storage, dates, files, waits, a11y, data setup seam | Contain product assertions |
| Specs | Arrange–Act–Assert; tags | Duplicate locator logic |

---

## 5. Hybrid feature-based modular architecture

### 5.1 Decision

**Adopt hybrid feature-based modular architecture.**

- Keep layered *responsibilities* (§4).  
- Change *physical ownership*: colocate pages, components, workflows, fixtures, specs, and data under product feature folders.  
- Place true cross-cuts in `shared/`.  
- Place multi-feature journeys in `journeys/`.  
- Place non-functional suites in `quality/`.  
- Place metrics exporters in `metrics/`.

**Rejected alternatives**

- Pure flat `pages/` + `components/` + `specs/` trees (ownership blur as FormFlow grows).  
- Pure feature folders with no `shared/` (duplication of PrimeNG, adapter, base fixtures).

### 5.2 Feature modules (logical)

| Module | Aligns to app | Owns |
|---|---|---|
| `shared/` | Cross-cutting | Config, tags, adapter, PrimeNG helpers, base page/shell, base fixtures |
| `authentication/` | `features/auth` | Landing/login/register pages (as owned here), auth workflows/specs |
| `workspace/` | dashboard + workspace services | Dashboard, profile, application detail, panels |
| `forms/` | form-host + renderer | FormHost, DynamicForm, Repeater, scenario specs, renderer specs |
| `advisor/` | banking-advisor | Advisor page, cards, apply workflows |
| `pdf/` | smart-assist | Document upload / PDF autofill |
| `voice/` | voice-assist | Voice panel / mocked speech path |
| `journeys/` | cross-feature | J01–J20 compositions only |
| `quality/` | NFR | a11y, responsive, security, visual, performance |
| `metrics/` | reporting | JSON/metrics reporter inputs |

Canonical path detail is frozen in `02-PROJECT-STRUCTURE.md` and **must** match this module set.

### 5.3 Import rules

1. Feature code may import from `shared/**` only — not from sibling features.  
2. Exception: `journeys/**` may compose public surfaces of multiple features.  
3. Exception: `pdf/` and `voice/` may use the forms DynamicForm patch seam (documented).  
4. `workspace/` must not import `advisor/` page internals; use shared recommendation DTOs/fixtures.  
5. Utils/adapters never import pages or specs.  
6. Data packs never import Playwright test APIs.

### 5.4 Form automation rule

- Do **not** create five full page objects that re-declare every schema field.  
- Do use **FormHost + DynamicForm** driven by scenario data packs (field-key API).  
- Scenario-specific specs add only schema-unique assertions (e.g. joint cross-applicant).

---

## 6. Test strategy (architectural)

### 6.1 Pyramid

| Layer | Owner | Role |
|---|---|---|
| Unit | Karma/Jasmine (existing) | Validators, services, pure logic |
| Component / renderer UI | Playwright | User-visible field/visibility/submit seams |
| Feature UI | Playwright | Auth, workspace, forms, AI panels |
| Journeys | Playwright | Multi-feature customer paths |

Playwright must not exhaustively re-test regex/unit edge cases already covered by Karma.

### 6.2 Suite types (summary)

| Suite | Primary tag | Cadence |
|---|---|---|
| Smoke | `@smoke` | Every PR |
| Critical | `@critical` | Every PR |
| Regression | `@regression` | Nightly + main |
| Integration | `@integration` | Touched areas on PR; full nightly |
| Journey | `@journey` (alias `@e2e`) | Nightly |
| Accessibility | `@a11y` | Critical pages on PR; full nightly |
| Responsive | `@responsive` | Nightly |
| Visual | `@visual` | Nightly + main (Chromium); not default PR gate until stable |
| Security | `@security` | PR |
| Performance | `@performance` | Nightly advisory |

Full tagging taxonomy, multi-tag rules, and script mapping are normative in §8. Detailed AUT coverage lives in `01`.

### 6.3 In scope / out of scope (architecture-level)

**In scope:** all portal routes; five form scenarios; guards/session; workspace; renderer behaviours; PDF Smart Assist; voice (mocked); advisor (mocked); a11y/responsive/security/visual as defined.

**Out of default CI:** live microphone/speech; live Gemini (except `@ai-live`); load/stress of change detection; direct DB access; full visual matrix of every PrimeNG overlay.

---

## 7. Page object inventory (identification only)

This section **identifies** surfaces. It does **not** define classes, locators, or code.

### 7.1 Pages

Landing, Login, Register, PortalShell, Dashboard, Profile, Advisor, FormHost, ApplicationDetail.

### 7.2 Reusable components

DynamicForm, Repeater, SmartAssist, DocumentUpload, VoiceAssist, ApplicationSummary, Advisor results/cards/score/roadmap, Drafts/Activity/Stats/Recommendation panels, PrimeNG password/select/datepicker/multiselect helpers.

### 7.3 Workflows (examples)

Register+Login, Fill+Submit scenario, Draft resume, Advisor apply, PDF autofill submit, Voice autofill submit, Joint multi-applicant submit, Profile prefill submit.

---

## 8. Tagging strategy (normative summary)

Tags are part of architecture. Exact constants live in implementation under `shared/config` after Sprint 00; meanings are fixed here.

### 8.1 Suite / cadence

`@smoke` `@critical` `@regression` `@journey` `@e2e` `@integration` `@performance`

### 8.2 Module

`@auth` `@workspace` `@forms` `@renderer` `@joint` `@advisor` `@voice` `@pdf` `@navigation` `@security` `@responsive` `@a11y` `@visual` `@ai-live`

### 8.3 Outcome / process

`@happy` `@negative` `@boundary` `@quarantine`

### 8.4 Rules

1. Every test has at least one suite tag and (when domain-specific) one module tag.  
2. Journeys may list multiple module tags.  
3. `@visual` / `@a11y` / `@responsive` / `@performance` live under `quality/`.  
4. CI excludes `@quarantine` from merge gates.  
5. `@ai-live` never joins default PR smoke.

### 8.5 Planned script mapping

`test:e2e:smoke` → `@smoke|@critical`  
`test:e2e:regression` → `@regression`  
`test:e2e:journey` → `@journey`  
`test:e2e:visual` → `@visual`  
`test:e2e:a11y` → `@a11y`  
(and module-specific greps as needed)

---

## 9. Fixtures, data, and utilities (architectural)

### 9.1 Fixture profiles (conceptual)

Guest, authenticated user, newly registered user, returning customer, draft holder, joint account customer, advisor customer; plus `mockedGemini` and `mockedSpeech`.

### 9.2 Data organization

- Static packs (users, valid/invalid/boundary form payloads).  
- Dynamic generators (unique email/mobile for parallelism).  
- AI fixtures (PDF samples, mocked Gemini JSON, voice transcripts).  
- Feature-colocated data under each module; shared generators under `shared/data`.

### 9.3 Utility domains

Storage (via adapter), date, random, file upload, validation messaging, draft debounce waits, a11y scan wrapper, visual helper, PrimeNG interaction helpers, route constants.

---

## 10. DataSetupAdapter (backend evolution seam)

Today the app uses localStorage. The framework **must** introduce a `DataSetupAdapter` interface from Sprint 00:

- `seedUser` / `loginAs` / `seedApplications` / `seedDraft` / `seedAdvisorRecommendation` / `reset`  
- **V1 implementation:** localStorage  
- **V2 implementation:** Spring Boot API via Playwright `APIRequestContext`  

Specs and fixtures depend on the **interface**, not raw `localStorage.setItem` calls.

**Future:** `shared/api/` helpers for auth/applications/drafts; hybrid API setup + UI assertion; **no** direct DB access from Playwright.

---

## 11. Reporting, visual, metrics, CI (architectural)

### 11.1 Reporting

HTML report; screenshot/video on failure; trace on first retry (CI); sanitized storage dump on failure; artifacts uploaded in CI.

### 11.2 Visual regression

- **Included**, selective, Chromium-only.  
- Stable surfaces only (landing, login/register, seeded dashboard, profile, advisor empty/results, key form states, application detail).  
- Naming: `{surface}.{state}.{viewport}.png`.  
- Nightly + main; not default PR gate until baselines stabilize.  
- Mask dynamic regions; disable animations; fixed viewport; seed identical data.

### 11.3 Metrics

Track over time: total tests, smoke/critical/regression counts, duration, pass/fail %, flaky (pass on retry), retries, skipped/quarantine, coverage by module, critical journey status. Custom JSON reporter by quality/regression phases.

### 11.4 CI outline

- PR: `@smoke|@critical` (+ `@security`; critical `@a11y` as adopted).  
- Nightly: `@regression`, `@journey`, `@visual`, quality tags; firefox/webkit matrix.  
- `webServer`: `ng serve` / `npm start` at `http://localhost:4200`.  
- Parallel workers only after context isolation is proven.

---

## 12. Governance principles (binding)

Detailed checklists belong in later docs / `e2e/docs`, but these principles are architectural:

| Rule | Standard |
|---|---|
| Page object size | Prefer ≤300 LOC or ≤15 public methods; split to components |
| Component size | Prefer ≤200 LOC; single fragment |
| Workflows | No locators; no assertions |
| Locator hierarchy | `#id` / field-key → role → label → test id → CSS last; ban absolute xpath |
| Waits | Auto-wait + URL/locator/adapter; no arbitrary sleeps except documented draft debounce buffer |
| Specs before code | Amend Approved specs before expanding automation scope |

---

## 13. Traceability model

```text
Requirement (app + AUT-*)
    → Business feature
        → Automation module (folder)
            → Playwright spec file
                → Business journey (J-ID)
```

Living matrix is maintained after `01` exists (and optionally under `e2e/docs`). PRs that add coverage update the matrix.

---

## 14. Major risks and mitigations

| Risk | Mitigation |
|---|---|
| localStorage cross-test pollution | Fresh context; adapter seeding; unique emails |
| Draft 600ms debounce races | Explicit draft-persist wait helper |
| PrimeNG overlay flake | Shared PrimeNG helpers before mass form specs |
| Dynamic repeater IDs | DynamicForm/Repeater field API |
| Gemini non-determinism | Route mocks; `@ai-live` opt-in only |
| Speech API in headless | Mock recognition |
| Architecture drift via `shared/` dumping ground | Import rules + review checklists |
| Coding from architecture chat | Spec gates in README |

---

## 15. Architecture review scores (recorded)

| Dimension | Score | Note |
|---|---|---|
| Scalability | 8.5 / 10 | Hybrid + tags + adapter; discipline required |
| Enterprise readiness | 9 / 10 | Pending in-repo docs, metrics, and Sprint gates |

---

## 16. Inputs / outputs / dependencies

| | |
|---|---|
| **Inputs** | Approved Architecture Review v1.1; FormFlow app structure; `specs/001-formflow` |
| **Outputs** | Binding architecture for `01`–`03`, all sprints, and eventual `frontend/e2e` |
| **Dependencies** | Application specs for feature vocabulary |
| **Does not depend on** | Sprint docs; implementation code |

---

## 17. Exit criteria

This document may be marked **Approved** when reviewers confirm:

1. Hybrid module set and import rules are accepted.  
2. Layer dependency rules are accepted.  
3. Tagging suite/module model is accepted.  
4. DataSetupAdapter seam is mandatory for Sprint 00.  
5. Visual strategy (selective, Chromium, non-default PR gate) is accepted.  
6. No conflicting decisions vs Architecture Review remain unresolved.  
7. Stakeholders accept that **no code** starts until Sprint 00 is Approved (after foundation `01`–`03`).

---

## 18. What comes next

| Step | Document | Condition |
|---|---|---|
| **Next to author** | [`01-IMPLEMENTATION-SPEC.md`](./01-IMPLEMENTATION-SPEC.md) | **Only after this document is Approved** |
| Then | `02-PROJECT-STRUCTURE.md` | After `01` Approved |
| Then | `03-IMPLEMENTATION-ROADMAP.md` | After `02` Approved |
| Then | `SPRINT-00-FOUNDATION.md` | After `00`–`03` all Approved |
| Code | `frontend/e2e` | **Only after Sprint 00 Approved** |

---

## 19. Approval

| Role | Name | Date | Decision |
|---|---|---|---|
| Author | Automation Architecture | 2026-07-20 | Submitted for review |
| Reviewer | Product / QA Lead | 2026-07-20 | **Approved** |

**To approve:** *(Completed 2026-07-20 — Status set to Approved.)* Next document authored: `01-IMPLEMENTATION-SPEC.md`.
