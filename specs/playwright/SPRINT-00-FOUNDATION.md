# Sprint 00 — Framework Foundation

**Document Type:** Sprint Specification  
**Project:** FormFlow Playwright Automation  
**Sprint:** 00 — Framework Foundation  
**Version:** 1.0  
**Status:** Approved  
**Parent Document:** [03-IMPLEMENTATION-ROADMAP.md](./03-IMPLEMENTATION-ROADMAP.md) (Approved)  
**Authoritative foundation (Approved):**  
[README.md](./README.md) · [00-AUTOMATION-ARCHITECTURE.md](./00-AUTOMATION-ARCHITECTURE.md) · [01-IMPLEMENTATION-SPEC.md](./01-IMPLEMENTATION-SPEC.md) · [02-PROJECT-STRUCTURE.md](./02-PROJECT-STRUCTURE.md) · [03-IMPLEMENTATION-ROADMAP.md](./03-IMPLEMENTATION-ROADMAP.md)

**Code:** None in this document. Implementation begins only after this sprint specification is **Approved**.

---

## 1. Sprint overview


| Field                 | Statement                                                                                                                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sprint goal**       | Establish a runnable, enterprise-aligned Playwright automation **framework foundation** under `frontend/e2e/` that future sprints will extend — without automating any business features.          |
| **Business value**    | Creates the capability to protect FormFlow with reliable UI automation; unblocks Sprint 01+ delivery without rework.                                                                               |
| **Engineering value** | Realizes Approved hybrid structure, DataSetupAdapter seam, tag registry, reporting/CI shell, and shared kernel so feature work does not invent competing layouts.                                  |
| **Expected outcome**  | Engineers can run a minimal harness health check against the Angular app; folder tree matches `02`; standards from `01` are enforceable in review; **zero** login/register/form/AI business tests. |


---

## 2. Sprint scope

### 2.1 In scope


| Item                                                  | Notes                                                                                                 |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Playwright project initialization for FormFlow        | Replace scaffold; host under `frontend/` per `02`                                                     |
| TypeScript alignment with existing frontend toolchain | Use project TS; no parallel conflicting tsconfig unless required                                      |
| Hybrid folder hierarchy                               | Create module skeletons per `02` (empty feature specs OK)                                             |
| Shared kernel bootstrap                               | `shared/config`, `adapters`, `fixtures`, `utils`, `support`, `data` stubs                             |
| Environment / baseURL / webServer strategy            | Local `http://localhost:4200`; CI reuse rules                                                         |
| Reporting configuration                               | HTML, list, screenshot/video/trace policies per `00`/`01`                                             |
| Fixture architecture foundation                       | Guest/clean context fixture; merged `test` export pattern                                             |
| Utilities foundation                                  | Thin stubs or minimal implementations: wait, random, constants accessors — **not** business flows     |
| Constants & tag registry                              | Routes, storage keys, scenario IDs, tag string constants                                              |
| Test data structure                                   | `shared/data/users` + `generators` placeholders; no feature scenario packs required                   |
| Configuration files                                   | `playwright.config.ts`, gitignore entries, npm script names                                           |
| CI/CD preparation                                     | Workflow **structure** for smoke (may run harness-only); artifact upload paths                        |
| Documentation                                         | `frontend/e2e/README.md`, `e2e/docs` stubs, update `specs/playwright/README` progress                 |
| Harness health check                                  | One minimal `@smoke` (or equivalent) spec that proves runner + app reachability — **not** login/forms |
| Retire scaffold                                       | Remove or relocate `frontend/tests/example.spec.ts` playwright.dev sample                             |


### 2.2 Out of scope


| Item                                                  | Why                                          |
| ----------------------------------------------------- | -------------------------------------------- |
| Login / registration / logout tests                   | Sprint 01                                    |
| Landing / navigation business assertions              | Sprint 02                                    |
| Workspace / dashboard feature tests                   | Sprint 03                                    |
| Form / renderer / joint tests                         | Sprints 04–05                                |
| Advisor / PDF / voice tests                           | Sprint 06                                    |
| Business Page Objects (LoginPage, FormHost, etc.)     | Later sprints                                |
| Locators for product UI flows                         | Later sprints                                |
| Full browser matrix (firefox/webkit) as required gate | Sprint 08; chromium sufficient for Sprint 00 |
| Visual baselines, axe suites, journey suite           | Sprints 07–08                                |
| Live Gemini / speech mocks as feature tests           | Sprint 06                                    |
| ApiDataSetupAdapter implementation                    | Future backend                               |
| Metrics dashboard productization                      | Sprint 07+                                   |


### 2.3 Future scope (explicitly deferred)

- Feature modules’ pages/workflows/specs filled in Sprints 01–09  
- PrimeNG interaction helpers used by forms  
- Network mock fixtures for Gemini  
- Sharding, multi-browser nightly, visual PR gating

---

## 3. Deliverables

Describe **what** must exist after implementation — not how to code it.


| Deliverable                           | Description                                                                                                                      |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Playwright project initialization** | Configured runner with `testDir` pointing at `e2e`; chromium project; `baseURL`; `webServer` for `ng serve` / `npm start`        |
| **TypeScript configuration**          | Types resolve for e2e; Playwright Test types available; consistent with frontend conventions                                     |
| **Folder structure**                  | Full hybrid tree from `02` created (feature folders may contain `.gitkeep` or README placeholders)                               |
| **Base framework setup**              | Shared kernel importable; single extended `test` fixture entrypoint                                                              |
| **Environment configuration**         | Env helper for baseURL, CI flags, timeouts; documented defaults                                                                  |
| **Reporting configuration**           | HTML + list (+ github on CI); failure screenshot/video; trace on-first-retry                                                     |
| **Fixtures foundation**               | Guest/clean storage fixture; fixture merge index; pattern for future auth fixtures                                               |
| **Utilities foundation**              | Constants access; optional thin random/date/wait stubs; **no** business workflows                                                |
| **Constants**                         | Routes, `WORKSPACE`/`AUTH` storage key names mirroring app, scenario IDs, tag constants                                          |
| **Test data structure**               | Placeholder user/generator modules ready for Sprint 01 packs                                                                     |
| **Configuration files**               | `playwright.config.ts`; `.gitignore` for reports, test-results, `.auth`                                                          |
| **CI/CD preparation**                 | `.github/workflows/playwright.yml` (or equivalent) running harness smoke; artifact upload; Node setup                            |
| **npm scripts**                       | At minimum: `test:e2e`, `test:e2e:smoke`, `test:e2e:report` (names per `00`/`01`)                                                |
| **Documentation updates**             | e2e README (how to run); docs stubs listed in `00`/`02`; specs README progress                                                   |
| **DataSetupAdapter**                  | Interface + localStorage implementation wired for fixture use (seed/clear primitives) — **not** used to drive login UI tests yet |
| **Base page abstraction**             | Optional thin `BasePage` with readiness hook pattern only — **no** business pages                                                |
| **Harness health spec**               | Proves navigation to app base URL / landing reachable without auth assertions beyond “app responds”                              |


---

## 4. Repository impact

### 4.1 Folders to create

```text
frontend/e2e/                    # entire hybrid tree per 02-PROJECT-STRUCTURE
frontend/e2e/docs/               # stubs
frontend/e2e/.auth/              # gitignored placeholder policy
.github/workflows/               # if missing — playwright workflow
```

Feature module directories (`authentication/`, `workspace/`, …) **created as empty shells** with ownership README or `.gitkeep` — not filled with business POs/tests.

### 4.2 Folders / files to modify


| Path                                       | Change                                                        |
| ------------------------------------------ | ------------------------------------------------------------- |
| `frontend/package.json`                    | Add e2e scripts                                               |
| `frontend/.gitignore` or root `.gitignore` | Ignore `playwright-report/`, `test-results/`, `e2e/.auth/`    |
| `frontend/playwright.config.ts`            | Replace scaffold defaults                                     |
| `frontend/tests/`                          | Remove/retire example.spec.ts; do not keep parallel test root |
| `specs/playwright/README.md`               | Mark Sprint 00 in progress / complete after DoD               |


### 4.3 Configuration files (expected)

- `frontend/playwright.config.ts`  
- Optionally `frontend/e2e/tsconfig.json` if required for isolation  
- GitHub Actions workflow YAML  
- Gitignore entries

### 4.4 Documentation updates

- `frontend/e2e/README.md`  
- `frontend/e2e/docs/` stubs: architecture pointer, folder structure, naming, how-to-add-test (stub), debugging (stub), contribution (stub), known limitations  
- `specs/playwright/README.md` status table

### 4.5 Expected repository structure after Sprint 00

```text
FormFlow/
├── specs/playwright/          # unchanged planning + this sprint spec
├── .github/workflows/playwright.yml
└── frontend/
    ├── playwright.config.ts   # FormFlow-aware
    ├── package.json           # e2e scripts
    ├── e2e/                   # hybrid tree populated as skeletons + shared kernel
    ├── playwright-report/     # gitignored (generated)
    └── test-results/          # gitignored (generated)
```

No business page objects or feature specs beyond harness health.

---

## 5. Framework foundation (established this sprint)


| Piece                    | Sprint 00 responsibility                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| **Framework bootstrap**  | Runnable Playwright against FormFlow; correct `testDir`                                          |
| **Configuration**        | baseURL, webServer, retries/workers policy (CI vs local), reporters, trace/screenshot/video      |
| **Folder hierarchy**     | Exact hybrid modules from `02`                                                                   |
| **Base abstractions**    | `BasePage` pattern (optional); DataSetupAdapter interface + localStorage impl                    |
| **Shared utilities**     | Constants, tags, minimal helpers; placeholders for wait/random/date                              |
| **Fixture architecture** | Extended `test`; guest/clean fixture; merge point for future feature fixtures                    |
| **Reporting foundation** | HTML + failure artifacts; CI upload                                                              |
| **Execution strategy**   | Local: reuseExistingServer when possible; CI: start server; chromium first                       |
| **Environment strategy** | Document `CI`, timeouts; reserve `AI_LIVE` / `DATA_SETUP` for later without implementing live AI |


**Explicitly not established:** business workflows, PrimeNG form helpers as production-ready, network Gemini mocks, journey runners.

---

## 6. Engineering standards (binding for Sprint 00 implementation)

Implementation must follow [01-IMPLEMENTATION-SPEC.md](./01-IMPLEMENTATION-SPEC.md) §6 and [00](./00-AUTOMATION-ARCHITECTURE.md) governance. Sprint 00 specifics:


| Area                    | Standard                                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| **Naming**              | `*.adapter.ts`, `*.fixture.ts`, `test-tags.ts`, `constants.ts`, harness `*.spec.ts`                  |
| **Folder organization** | No flat `e2e/pages` root; no new top-level `playwright/` package                                     |
| **Coding conventions**  | TypeScript strictness consistent with repo; no `any` without justification                           |
| **Locator philosophy**  | Harness may only use stable app entry (URL / title / landmark) — **no** business form field locators |
| **Assertions**          | Harness asserts app reachable / document loaded — not product business rules                         |
| **Synchronization**     | Prefer Playwright auto-wait; webServer URL readiness; no arbitrary sleeps                            |
| **Logging**             | Failures produce configured artifacts; no password logging                                           |
| **Error handling**      | Clear failure when server not up; adapter errors surfaced                                            |
| **Comments**            | Explain non-obvious adapter/storage key mirroring only                                               |
| **Documentation**       | e2e README must allow a new engineer to run harness smoke                                            |
| **Maintainability**     | Feature folders empty but named correctly for Sprint 01 drop-in                                      |


---

## 7. Dependencies

### 7.1 Inputs from planning documents


| Document | Consumed as                                              |
| -------- | -------------------------------------------------------- |
| `00`     | Hybrid decision, tags, adapter, reporting, CI outline    |
| `01`     | Standards, objectives, fixture philosophy, quality gates |
| `02`     | Exact paths and ownership                                |
| `03`     | Sprint 00 placement, exit into Sprint 01, no leapfrog    |


### 7.2 Dependencies for future sprints

Sprint 00 outputs are **required inputs** for:

- Sprint 01 auth fixtures/pages (adapter + tags + config)  
- All modules (folder homes already exist)  
- CI (workflow to extend with greps)

### 7.3 How Sprint 00 enables Sprint 01


| Sprint 00 provides                         | Sprint 01 uses                                   |
| ------------------------------------------ | ------------------------------------------------ |
| `DataSetupAdapter` + guest fixture pattern | Seed users / session without reinventing storage |
| Tag constants + smoke script               | `@smoke @auth @critical` wiring                  |
| `authentication/` empty module             | Drop pages/specs without restructuring           |
| Playwright config + CI                     | Auth suites run in same pipeline                 |
| Engineering standards enforced             | Auth PRs reviewed against known checklist        |


---

## 8. Risks


| Risk                                                    | Mitigation                                           |
| ------------------------------------------------------- | ---------------------------------------------------- |
| Config / webServer misconfigured                        | Document URL; verify harness smoke locally and in CI |
| Framework setup overreach (building Login in Sprint 00) | Enforce out-of-scope list in review checklist        |
| Cross-browser premature complexity                      | Chromium only for Sprint 00 gate                     |
| Environment differences (Windows vs CI Linux)           | Path-safe scripts; Playwright install in CI          |
| Future scalability (wrong tree)                         | Diff structure against `02` in Framework Review      |
| Leaving scaffold example pointing at playwright.dev     | Delete/retire in DoD                                 |
| Empty folders confusing contributors                    | Module README or `.gitkeep` + e2e README map         |


---

## 9. Acceptance criteria

Sprint 00 implementation is acceptable when **all** are true:

1. `frontend/e2e/` hybrid tree matches [02-PROJECT-STRUCTURE.md](./02-PROJECT-STRUCTURE.md) module set.
2. `playwright.config.ts` uses FormFlow `baseURL` and starts/reuses the Angular app.
3. `DataSetupAdapter` interface and localStorage implementation exist under `shared/adapters/`.
4. Tag registry and route/storage/scenario constants exist under `shared/config/`.
5. Extended fixtures entrypoint exports `test` / `expect` with at least a guest/clean capability.
6. npm scripts `test:e2e`, `test:e2e:smoke`, `test:e2e:report` exist and are documented.
7. Harness health `@smoke` (or tagged equivalent) passes locally against running/served app.
8. CI workflow exists and runs harness smoke; uploads report artifacts.
9. Scaffold `tests/example.spec.ts` (playwright.dev) removed or no longer the active testDir.
10. `frontend/e2e/README.md` explains how to run the harness.
11. **No** login, registration, form, AI, or business page-object implementations merged.
12. Gitignore covers reports, test-results, auth state.
13. Framework Review (per `03`) completed with checklist §11 signed.

---

## 10. Definition of Done

Sprint 00 is **complete** when:

1. This specification is **Approved**.
2. Implementation satisfies §9 Acceptance Criteria.
3. Code review against §6 and §11 checklist is complete.
4. `specs/playwright/README.md` updated to reflect Sprint 00 Done.
5. Sprint Review recorded (Framework Review).
6. No open P0 defects on harness/CI blocking Sprint 01.
7. Team authorized to author `SPRINT-01-AUTHENTICATION.md` next (sequential gate).

---

## 11. Review checklist (before Sprint 00 Approved / before merge of implementation)

### 11.1 Specification review (this document)

- [ ] Scope excludes all business feature automation  
- [ ] Deliverables align with `00`–`03`  
- [ ] Structure matches `02`  
- [ ] Handoff rules clear  

### 11.2 Implementation review (after coding, before Sprint 00 closed)

- [ ] Folder tree matches `02` (no flat parallel layout)  
- [ ] No business Page Objects or feature specs beyond harness  
- [ ] Adapter + constants + tags present  
- [ ] Config baseURL/webServer correct  
- [ ] Reporting + gitignore correct  
- [ ] CI smoke green  
- [ ] Harness smoke green locally  
- [ ] Scaffold example retired  
- [ ] e2e README usable by a new engineer  
- [ ] Naming/standards from `01` followed  
- [ ] No architecture drift vs `00`  

---

## 12. Implementation Handoff

**Sprint 00 planning is complete** when this document’s header `Status` is set to **Approved**.

### What happens next

1. **The next step is implementation** of this sprint only.
2. **Agent Mode (or engineers) should now implement** the Sprint 00 deliverables in `frontend/e2e/` and related config/CI — strictly within §2 In Scope.
3. **No additional planning documents** are required unless major architectural changes occur (which require amending Approved `00`–`03`).
4. **All implementation must follow** the Approved planning documents listed in the header.
5. **Do not start Sprint 01 specification or auth automation** until this sprint’s Definition of Done (§10) is met.
6. **Do not** treat Cursor chat as authority over `00`–`03` or this sprint contract.

### Implementation contract summary


| Allowed                                                                                                       | Forbidden                                                                                                            |
| ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Framework bootstrap, config, folders, adapter, tags, fixtures foundation, harness smoke, CI shell, docs stubs | Login/register/form/AI tests; business page objects; locators for product flows; inventing a different folder layout |


---

## 13. Exit criteria (specification)

This sprint specification may be marked **Approved** when reviewers confirm:

1. Overview, scope, deliverables, and repository impact are accepted.
2. Out-of-scope business automation is explicit and agreed.
3. Acceptance criteria and Definition of Done are testable.
4. Review checklist is sufficient for Framework Review.
5. Implementation Handoff is accepted as authorization to code **only** Sprint 00 after approval.

---

## 14. Approval


| Role     | Name                                                                | Date       | Decision                                 |
| -------- | ------------------------------------------------------------------- | ---------- | ---------------------------------------- |
| Author   | Engineering Manager / Principal QA Automation Architect / Tech Lead | 2026-07-20 | Submitted for review                     |
| Reviewer | Product / QA Lead                                                   | 2026-07-20 | **Approved** — implementation authorized |


**To approve:** change header `Status` from `In Review` to `Approved`, complete the table, then begin **Sprint 00 implementation** (no further planning required for this sprint).