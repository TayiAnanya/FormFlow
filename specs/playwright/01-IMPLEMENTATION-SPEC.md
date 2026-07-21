# FormFlow Playwright Implementation Specification

**Document Type:** Engineering Implementation Specification  
**Project:** FormFlow Playwright Automation  
**Version:** 1.0  
**Status:** Approved  
**Parent Document:** [00-AUTOMATION-ARCHITECTURE.md](./00-AUTOMATION-ARCHITECTURE.md) (Approved)  
**Related Documents:** [README.md](./README.md), [`../001-formflow/`](../001-formflow/)  
**Code:** None — this document does not authorize implementation or Sprint authoring beyond foundation sequencing intent

---

## 1. Document purpose

### 1.1 Why this specification exists

The approved [Automation Architecture](./00-AUTOMATION-ARCHITECTURE.md) defines **shape**: layers, hybrid modules, tags, adapter seam, and governance principles.

This document translates that architecture into an **engineering implementation blueprint**. It answers:

| Question | This document’s answer |
|---|---|
| What will be implemented? | Modules, layers, data/fixture capabilities, quality surfaces, AUT coverage intent |
| Why will it be implemented? | Principles, objectives, risk-driven priorities |
| In what order? | Dependency-ordered build sequence (refined by `03` into sprints) |
| What standards must be followed? | Naming, locators, waits, review gates, documentation |
| How will it evolve? | Adapter path to Spring Boot; metrics; visual maturity |

It is **not** an implementation guide (no config snippets, no classes, no locators, no tests).  
It is **not** a sprint backlog (that is `03` + sprint specs).  
It **is** the specification every future sprint must reference for *what* engineering work means when “done.”

### 1.2 Relationship to other documents

| Document | Relationship |
|---|---|
| [README.md](./README.md) | Process, hard gates, reading order. This spec obeys those gates. |
| [00-AUTOMATION-ARCHITECTURE.md](./00-AUTOMATION-ARCHITECTURE.md) | **Parent.** Wins on framework shape. This document must not conflict; it refines *implementation intent* under that shape. |
| `02-PROJECT-STRUCTURE.md` | **Next.** Will freeze folder paths that realize §§5–7 of this document. |
| `03-IMPLEMENTATION-ROADMAP.md` | Will map this blueprint onto Sprint 00–09 and CI cadence. |
| Sprint specs | Will slice AUT-* coverage into timeboxed deliverables without redefining this blueprint. |
| [`../001-formflow/`](../001-formflow/) | Product behaviour source. AUT-* IDs must remain traceable to app features. |

### 1.3 Authority

Once **Approved**, this document is the authoritative **implementation specification** for the Playwright program. Cursor chat and informal notes are not authoritative.

### 1.4 Explicit non-goals

This document does **not**:

- Generate Playwright config, tests, page objects, or locators  
- Author sprint specifications  
- Authorize `frontend/e2e` coding (blocked until Sprint 00 Approved)  
- Replace Architecture Review or `00` on structural conflicts  

---

## 2. Engineering principles

Every design and review decision must satisfy these principles.

| Principle | Meaning | Why it matters for FormFlow |
|---|---|---|
| **Scalability** | Structure absorbs new schemas, AI surfaces, and a future API without redesign | App will grow; flat POMs and inline storage seeding will not |
| **Reusability** | DynamicForm, PrimeNG helpers, workflows, and fixtures are shared | Five schemas share one renderer — tests must share one form API |
| **Maintainability** | Changes localize to one feature module or `shared/` | Schema or hydration changes must not require hunting across unrelated trees |
| **Modularity** | Hybrid feature folders + shared kernel | Mirrors Angular `features/*`; enables CODEOWNERS and tag-based CI |
| **Readability** | Specs read as business behaviour; pages expose intentful methods | Banking journeys must be reviewable by QA leads without DOM archaeology |
| **Test independence** | Fresh context; unique data; no order dependence | Parallel workers + localStorage demand isolation |
| **Single responsibility** | Pages ≠ workflows ≠ fixtures ≠ assertions | Prevents “god” page objects and untestable helpers |
| **Separation of concerns** | Data setup via adapter; UI via pages; outcomes via specs | Enables Spring Boot swap without rewriting feature specs |
| **Enterprise readiness** | Tags, gates, metrics, quarantine, docs, traceability | Merge discipline and auditability for a real program, not a demo script dump |

---

## 3. Framework objectives (measurable)

| ID | Objective | Success indicator |
|---|---|---|
| OBJ-01 | Consistent structure | All modules follow hybrid layout in `02`; zero parallel “shadow” trees |
| OBJ-02 | High reuse | Form scenarios use DynamicForm + data packs; no per-field PO explosion |
| OBJ-03 | Low maintenance | Schema field add → data pack + optional assertion; not new page class |
| OBJ-04 | Stable execution | Flaky rate &lt; 2% on nightly over a rolling 14-day window post Sprint 08 |
| OBJ-05 | Easy onboarding | New engineer productive from Approved specs + `e2e/docs` within one sprint |
| OBJ-06 | Future API compatibility | All data seeding goes through `DataSetupAdapter`; no raw storage in specs |
| OBJ-07 | CI/CD readiness | PR `@smoke\|@critical` gate; nightly regression/journey/visual jobs defined in `03` |
| OBJ-08 | Traceable coverage | AUT-* IDs map to modules, specs, and journeys (matrix maintained) |
| OBJ-09 | Deterministic AI | Default suites mock Gemini/speech; `@ai-live` optional only |
| OBJ-10 | Quality breadth | A11y, security, responsive, and selective visual suites exist by Sprint 07–08 |

---

## 4. Implementation scope

### 4.1 In scope

| Area | Why |
|---|---|
| Hybrid `frontend/e2e` framework (after Sprint 00 Approved) | Realizes Approved architecture |
| Auth, navigation, workspace, five form scenarios, joint deep suite | Core banking portal risk |
| Dynamic renderer behaviours (visibility, validators, repeaters, submit) | Product differentiator |
| PDF Smart Assist (deterministic fixtures) | Primary AI E2E path |
| Voice Assist (UI + mocked extraction on support) | Feature present; mic not in CI |
| Banking Advisor (mocked Gemini + apply/prefill/hydration) | Cross-module integration risk |
| Tagging, fixtures, adapter, reporting, CI outline | Enterprise operation |
| A11y, security, responsive, selective visual | NFR commitments in `00` |
| Journeys J01–J20 (as listed in §15) | Business proof points |
| Traceability and governance checklists | Spec-driven delivery |

### 4.2 Out of scope (this program version)

| Area | Why |
|---|---|
| Playwright code in this document | Spec-only phase |
| Live microphone / real Web Speech in CI | Non-deterministic; environment-bound |
| Live Gemini in default PR/nightly | Cost and flake; use `@ai-live` later if needed |
| Direct database access | Couples tests to schema; forbidden by architecture |
| Exhaustive unit-level validator math | Owned by Karma |
| Visual baselines for every PrimeNG overlay state | Flake and noise |
| Load/stress performance engineering | Soft `@performance` budgets only |
| Renaming or rewriting `specs/001-formflow` | App SDD remains separate |

### 4.3 Future scope

| Area | Trigger |
|---|---|
| `ApiDataSetupAdapter` + `shared/api` | Spring Boot backend lands |
| `@api` contract suite | Stable REST contracts exist |
| Visual as PR gate | Baselines stable ≥2 weeks |
| Broader browser visual parity | Explicit architecture amendment |
| Additional form scenarios | New bundled schemas in app |

---

## 5. Framework layers

Logical stack (implementation will realize this under hybrid folders per `02`):

```text
Repository (FormFlow monorepo)
    ↓
Framework kernel (config, tags, adapter, shared fixtures)
    ↓
Pages
    ↓
Components
    ↓
Workflows
    ↓
Fixtures (compose adapter + pages as needed)
    ↓
Utilities
    ↓
Tests (specs)
    ↓
Reports / metrics / artifacts
```

### 5.1 Repository

Owns app + specs + future `frontend/e2e`. Automation must not fork a separate product repo for v1.

### 5.2 Framework kernel

Owns Playwright project config (later), tag registry, constants (routes, storage keys, scenario IDs), `DataSetupAdapter`, base fixtures merge, global setup/teardown policy.

**Interacts with:** everything; imported by features; never imports feature pages.

### 5.3 Pages

Own a single route or chrome surface; expose readiness and user-intent actions.

**Interacts with:** components, utils; used by workflows and specs.

### 5.4 Components

Own reusable fragments (DynamicForm, Repeater, panels, PrimeNG).

**Interacts with:** utils; used by pages and workflows; no navigation ownership.

### 5.5 Workflows

Own multi-step business sequences; return handles/IDs; **no assertions**, **no locators**.

**Interacts with:** pages + components; used by journey and feature specs.

### 5.6 Fixtures

Own test preconditions (persona, seed, mocks). Prefer adapter over UI for speed except where UI register/login is under test.

**Interacts with:** adapter, network stubs; provide context to specs.

### 5.7 Utilities

Own cross-cutting helpers (wait, date, random, file, validation message, a11y, visual).

**Interacts with:** Playwright APIs only as needed; never product assertions.

### 5.8 Tests (specs)

Own Arrange–Act–Assert, tags, and AUT-* verification.

**Interacts with:** fixtures, pages, workflows; never raw locator soup.

### 5.9 Reports

Own HTML/trace/screenshot/video artifacts and later metrics JSON.

**Interacts with:** CI upload; failure diagnostics attach sanitized storage + URL + scenarioId.

---

## 6. Engineering standards

### 6.1 Folder organization

- Hybrid feature modules per `00` §5; exact tree in `02`.  
- No second parallel `pages/` root outside the hybrid model.  
- Feature-colocated `data/` and `specs/`; shared generators in `shared/data`.

### 6.2 Naming conventions

| Artifact | Convention |
|---|---|
| Page modules | `*.page.ts` (when implemented) |
| Components | `*.component.ts` |
| Workflows | `*.workflow.ts` |
| Specs | `*.spec.ts` |
| Adapters | `*.adapter.ts` |
| Data packs | `<scenario>.valid.ts` / `.invalid.ts` / `.boundary.ts` |
| Tags | `@smoke`, `@auth`, … as in `00` |
| Journeys | `J01`…`J20` identifiers stable across docs |
| Requirements | `AUT-<DOMAIN>-<nn>` (see §15) |
| Visual snapshots | `{surface}.{state}.{viewport}.png` |

### 6.3 Locator strategy (when coding begins)

Priority order (mandatory):

1. Stable `#id` / schema field-key API (including repeater prefixes)  
2. `getByRole`  
3. `getByLabel`  
4. `getByTestId` (only if product adds them)  
5. CSS last resort  

Banned: absolute XPath; nth-only chains except inside indexed Repeater API.

### 6.4 Assertions

- Web-first expectations on locators/URLs.  
- One primary behaviour per test where practical.  
- Soft asserts only for aggregated a11y violation lists.  
- Assert application ID by **prefix** (`ACC`, `LOAN`, `CARD`, `SUP`, `JOINT`), not brittle counters.  
- Assertions live in specs (or dedicated assertion helpers) — not in workflows.

### 6.5 Waiting and synchronization

- Prefer Playwright auto-waiting.  
- Use URL waits, locator readiness, and page `expectReady` patterns.  
- Draft persistence: dedicated wait respecting ~600ms debounce (+ small documented buffer).  
- Ban arbitrary `waitForTimeout` except that documented debounce case.

### 6.6 Logging and error handling

- Failures attach: URL, scenarioId (if any), sanitized storage snapshot, trace/screenshot/video per config.  
- Do not log secrets or plaintext passwords in artifacts.  
- Quarantine known flakes with ticket link and `@quarantine`.

### 6.7 Documentation and comments

- Public page/component methods: brief intent comments only when behaviour is non-obvious.  
- No commented-out tests in main.  
- `e2e/docs` filled per documentation plan in architecture (stubs from Sprint 00).  
- Spec titles describe behaviour: `should … when …`.

### 6.8 Reusability and maintainability

- DynamicForm for all schemas.  
- Data-driven `test.each` for validator matrices.  
- Shared PrimeNG helpers before mass form specs.  
- Prefer extending data packs over duplicating workflows.

### 6.9 Code review expectations (when coding exists)

Reviewers verify: correct feature module; tags; no illegal cross-feature imports; adapter usage; locator hierarchy; no hard sleeps; traceability row updated; size limits respected.

---

## 7. Dependency strategy

### 7.1 Dependency flow

```text
Tests
  → Fixtures
      → Adapter / network mocks
      → (optional) Workflows / Pages for UI login under test
  → Workflows
      → Pages → Components → Utilities
  → Pages / Components (direct for focused UI tests)
  → Config / Constants
```

### 7.2 Rules

| From | May depend on | Must not depend on |
|---|---|---|
| Tests | Fixtures, workflows, pages, data, tags | Sibling feature internals; raw storage keys |
| Fixtures | Adapter, shared config, network | Spec files; assertions |
| Workflows | Pages, components | Locators; expects; other workflows’ private state |
| Pages | Components, utils | Other feature pages; specs |
| Components | Utils, PrimeNG helpers | Pages; navigation |
| Utils / Adapter | Config, Node/Playwright low-level APIs | Pages; specs |
| Journeys | Multiple features’ **public** APIs + shared | Deep internals |

### 7.3 Build order (engineering sequence)

This is the **implementation dependency order**. Sprint calendar in `03` must respect it:

1. Config, constants, tag registry  
2. DataSetupAdapter (localStorage impl) + storage utilities  
3. Base page + PrimeNG helpers  
4. Auth fixtures + authentication pages/workflows  
5. Portal shell + navigation  
6. Workspace pages/components + seeded personas  
7. DynamicForm + Repeater + FormHost  
8. Scenario data packs + form specs (joint deep next)  
9. PDF / voice / advisor modules + mocks  
10. Journeys  
11. Quality (a11y, responsive, visual, security, performance)  
12. Metrics reporter + regression hardening  

---

## 8. Test data strategy

### 8.1 Static data

- Known `StoredUser`-shaped users for deterministic login (non-secret demo passwords in test-only packs).  
- Golden **valid** payloads per scenario (minimal submit set).  
- Safe vs unsafe `returnUrl` samples for security tests.

### 8.2 Dynamic data

- Unique email and Indian mobile (`^[6-9]\d{9}$`) per test via generators.  
- Parallel-safe names/IDs.  
- Never assert exact application counter values.

### 8.3 Random generators

- `buildUser()`, `buildApplicant()`, `uniqueEmail()`, DOB helpers for age boundaries (17/18/120/121).

### 8.4 Boundary data

- Password length edges; mobile pattern edges; age min/max; repeater `minItems`/`maxItems` (joint max 4); field min/maxLength where schema defines.

### 8.5 Negative data

- Wrong password; unknown email; duplicate registration email; confirm mismatch; empty required fields; cross-applicant duplicate email/mobile/identity.

### 8.6 AI prompts and responses

- Fixed advisor prompt strings for UI tests.  
- **Mocked** Gemini JSON fixtures for success, empty, and error/graceful-failure paths.  
- No reliance on live model output in default suites.

### 8.7 PDF samples

- Fixture PDFs with labels matching schema field labels (deterministic Smart Assist path).  
- Conflict and no-match samples.  
- Invalid/non-PDF upload negatives where product handles them.

### 8.8 Voice samples

- Mock transcripts mapped to support-form fields.  
- Unavailable SpeechRecognition stub for negative/UI-only paths.

### 8.9 User personas

| Persona | Intent |
|---|---|
| Guest | Empty session |
| Valid registered | Login happy path |
| Newly registered | Post-register auto-login |
| Returning customer | Profile + applications + activity |
| Draft holder | Existing `ff_form_drafts` |
| Joint account customer | Profile ready for multi-applicant |
| Advisor customer | Stored recommendation |
| Large dataset user | Many applications/activities for list/stats edge behaviour |

### 8.10 Scenario packs by domain

| Domain | Packs |
|---|---|
| Loan | `loan-inquiry` valid/invalid/boundary |
| Support | `customer-support` valid + category branches; voice-enabled pack |
| Account opening | valid/invalid; profile-prefill overlap keys |
| Credit card | conditional branch packs |
| Joint | primary + 0–4 applicants; minor/spouse/parent conditionals; duplicate negatives |

---

## 9. Fixture strategy

### 9.1 Philosophy

- Fixtures express **who the user is** and **what world state exists**, not test assertions.  
- Prefer adapter seeding for speed; use UI only when the UI flow is the subject under test.  
- One merged `test` export from shared fixtures index; feature fixtures compose into it.

### 9.2 Core fixtures

| Fixture | Provides |
|---|---|
| Guest | Clean auth + workspace |
| Authenticated | Logged-in session |
| Newly registered | Unique user just created |
| Returning user | Profile + history + activity |
| Joint account user | Joint-ready profile |
| Advisor user | Recommendation memory seeded |
| Large dataset user | Volume seeded applications/activities |
| Draft user | Scenario draft present |
| Mocked Gemini | Stable HTTP stubs |
| Mocked speech | Recognition stub |

### 9.3 Reuse and lifecycle

- Each test: fresh browser context (default isolation).  
- No sharing localStorage across tests.  
- Optional `storageState` from global setup for smoke speed; mutating-user tests still seed explicitly.  
- Teardown: context close; adapter reset as needed for API future mode.

---

## 10. Reporting strategy

| Artifact | Policy |
|---|---|
| HTML report | Always produced; open locally on demand |
| Trace viewer | On first retry (CI); optional retain-on-failure locally |
| Screenshots | Only on failure |
| Videos | Retain on failure |
| Artifacts | Upload `playwright-report/` + `test-results/` in CI |
| Failure diagnostics | URL, scenarioId, sanitized storage, tags |
| Historical execution | Metrics JSON over time (Sprint 07+); trend flaky % and duration |

Do not commit reports or auth state files to git.

---

## 11. Quality gates

### 11.1 Utility complete

- Single responsibility; covered by at least one consumer or focused unit/spec usage plan  
- No page imports  
- Documented edge cases (e.g. debounce ms)

### 11.2 Component complete

- Public API stable; used by a page or workflow  
- Locator hierarchy respected  
- Size guideline met; PrimeNG via shared helpers

### 11.3 Page complete

- `expectReady` (or equivalent readiness) defined  
- Only owns its route/chrome  
- No assertions belonging in specs  
- Linked from at least one tagged spec plan / AUT-*

### 11.4 Workflow complete

- Composes pages/components only  
- No locators; no expects  
- Used by a journey or feature spec  
- Documented preconditions (which fixture)

### 11.5 Test suite complete

- Tags correct (suite + module + outcome as needed)  
- Traceability row updated  
- Independent; deterministic data  
- Passes in isolation and under target project grep

### 11.6 Sprint complete

- Sprint exit criteria in that sprint spec satisfied  
- PR smoke/critical still green  
- Specs Amended if scope changed  
- No undocumented architecture drift  
- Handoff notes for next sprint authored

---

## 12. Risks and mitigations

| Risk domain | Risk | Mitigation |
|---|---|---|
| Dynamic renderer | Brittle label/position locators; visibility sync races | Field-key API; assert hidden excluded from submit; dedicated renderer specs |
| AI (advisor) | Non-deterministic Gemini | Route mocks; fixed fixtures; `@ai-live` opt-in |
| Voice | No SpeechRecognition in CI | Init-script mock; UI presence + patch seam tests |
| PDF | pdf.js worker / label mismatch | Ship fixtures; verify worker asset; conflict cases |
| Mock backend | Parallel localStorage pollution; key drift | Adapter + fresh context; constants mirror app keys |
| Workspace | Draft debounce; hydration order (profile → advisor → draft) | Wait helper; explicit `@integration` specs |
| Responsive | Shell/nav unusable on mobile | `@responsive` project; limited critical paths |
| Accessibility | Regressions on login/dashboard/forms | axe critical/serious = 0 on agreed pages |
| Flaky tests | PrimeNG overlays, animations, retries hiding bugs | Helpers first; CI retries limited; quarantine + 48h ownership; flaky &lt; 2% target |

---

## 13. Success metrics

| Metric | Target (program-level) |
|---|---|
| PR smoke/critical pass rate | ≥ 99% on main after Sprint 01 |
| Nightly regression pass rate | ≥ 97% after Sprint 08 |
| Flaky rate (pass on retry) | &lt; 2% rolling 14 days after Sprint 08 |
| Critical journeys J-IDs | All J01–J20 automated or explicitly deferred in Sprint 09 with waiver |
| Module coverage | Every in-scope module has `@regression` specs |
| Adapter compliance | 0 raw `localStorage.setItem` in specs |
| Documentation | Foundation + sprint docs Approved per gate; `e2e/docs` stubs from Sprint 00 |
| Reuse | ≥ 5 scenarios share one DynamicForm API (no per-schema PO field lists) |
| Onboarding | New contributor runs smoke using README + Approved specs without tribal knowledge |

---

## 14. Requirement catalogue (AUT-*) — implementation intent

IDs below are the **authoritative coverage vocabulary** for sprints. Detailed case design appears in sprint specs; this list defines **what must eventually exist**.

### 14.1 Authentication & session — `AUT-AUTH-*`

| ID | Intent |
|---|---|
| AUT-AUTH-01 | Landing reachable as guest |
| AUT-AUTH-02 | Login success → post-auth destination |
| AUT-AUTH-03 | Login failure (unknown/wrong password) |
| AUT-AUTH-04 | Register success → auto-login |
| AUT-AUTH-05 | Register validation (mobile, password, confirm, duplicate) |
| AUT-AUTH-06 | Logout clears session; users retained |
| AUT-AUTH-07 | `authGuard` redirects with safe `returnUrl` |
| AUT-AUTH-08 | `guestGuard` sends authenticated users away from guest pages |
| AUT-AUTH-09 | Session restore on reload |
| AUT-AUTH-10 | Unsafe/external `returnUrl` rejected |

### 14.2 Navigation & shell — `AUT-NAV-*`

| ID | Intent |
|---|---|
| AUT-NAV-01 | Portal shell links: dashboard, advisor, profile |
| AUT-NAV-02 | Landing CTAs to login/register |
| AUT-NAV-03 | Deep link to forms after auth |
| AUT-NAV-04 | Wildcard unknown routes → landing behaviour |

### 14.3 Workspace — `AUT-WS-*`

| ID | Intent |
|---|---|
| AUT-WS-01 | Dashboard catalog cards for five scenarios + advisor |
| AUT-WS-02 | Profile view/update and prefill into forms |
| AUT-WS-03 | Application list after submit |
| AUT-WS-04 | Application detail by id + prefix |
| AUT-WS-05 | Draft continue / resume |
| AUT-WS-06 | Recent activity updates |
| AUT-WS-07 | Statistics update |
| AUT-WS-08 | Recommendation panel CTA → form prefill |

### 14.4 Forms & renderer — `AUT-FORM-*` / `AUT-REN-*`

| ID | Intent |
|---|---|
| AUT-FORM-01…05 | Happy submit for each scenario id |
| AUT-FORM-06 | Required/validation failures visible |
| AUT-FORM-07 | Credit-card conditional branches |
| AUT-FORM-08 | Support category paths |
| AUT-REN-01 | Schema load for valid ids; unknown handled |
| AUT-REN-02 | Field types render and accept input |
| AUT-REN-03 | `visibleWhen` show/hide and submit exclusion |
| AUT-REN-04 | Pattern/age/min/max validators user-visible |
| AUT-REN-05 | Form arrays add/remove where applicable |
| AUT-REN-06 | Nested field id pattern for repeaters |

### 14.5 Joint account — `AUT-JOINT-*`

| ID | Intent |
|---|---|
| AUT-JOINT-01 | Add/remove applicants within max 4 |
| AUT-JOINT-02 | Minor → guardian fields |
| AUT-JOINT-03 | Spouse → signature |
| AUT-JOINT-04 | Parent → relationship proof file |
| AUT-JOINT-05 | Cross-applicant duplicate blocked |
| AUT-JOINT-06 | Multi-applicant happy submit → `JOINT*` |

### 14.6 AI — `AUT-PDF-*` / `AUT-VOICE-*` / `AUT-ADV-*`

| ID | Intent |
|---|---|
| AUT-PDF-01 | Label-based autofill from fixture PDF |
| AUT-PDF-02 | Conflict UI path |
| AUT-PDF-03 | No-match / bad file handling |
| AUT-VOICE-01 | Panel only on customer-support |
| AUT-VOICE-02 | Mock transcript patches fields |
| AUT-ADV-01 | Mocked advise results render |
| AUT-ADV-02 | Apply recommendation queues prefill |
| AUT-ADV-03 | Hydration order: profile → advisor → draft |

### 14.7 Quality — `AUT-QA-*`

| ID | Intent |
|---|---|
| AUT-QA-01 | A11y critical/serious = 0 on agreed pages |
| AUT-QA-02 | Responsive critical paths |
| AUT-QA-03 | Selective visual baselines |
| AUT-QA-04 | Soft performance budgets advisory |

### 14.8 Journeys — `J01`–`J20`

J01 New customer onboarding · J02 Returning login/logout · J03 Open account → `ACC*` · J04 Loan → `LOAN*` · J05 Credit card conditional → `CARD*` · J06 Support → `SUP*` · J07 Joint multi-applicant → `JOINT*` · J08 Joint minor path · J09 Draft resume · J10 Profile prefill · J11 Advisor apply · J12 Dashboard recommendation CTA · J13 PDF autofill submit · J14 Voice autofill submit · J15 Guard deep link + returnUrl · J16 Session restore · J17 Full bank day · J18 Rejection paths chain · J19 Max joint applicants · J20 Duplicate applicant blocked  

---

## 15. Evolution strategy

| Horizon | Change | Constraint |
|---|---|---|
| Near term | LocalStorage adapter only | Interface stable |
| Mid term | Spring Boot API adapter behind env flag | Dual-run critical smoke |
| Later | Retire localStorage adapter when app mock mode retired | Specs unchanged |
| Continuous | New schema → data pack + AUT-FORM row + happy spec | No architecture rewrite |
| Continuous | Metrics and flaky burn-down | Quarantine with tickets |

Any evolution that changes hybrid modules, tag meanings, or adapter responsibilities requires **architectural review** and an update to `00` before this document is amended.

---

## 16. Inputs / outputs / dependencies

| | |
|---|---|
| **Inputs** | Approved `00`; Architecture Review v1.1; app feature inventory; `001-formflow` |
| **Outputs** | AUT-* catalogue; standards; layer/data/fixture/reporting blueprint; build order; gates; metrics |
| **Dependencies** | `00` Approved (satisfied) |
| **Unlocks** | Authoring of `02-PROJECT-STRUCTURE.md` |

---

## 17. Exit criteria

This specification may be marked **Approved** when reviewers confirm:

1. Principles and objectives are accepted as binding for all sprints.  
2. In / out / future scope are accepted.  
3. Layer responsibilities and dependency/build order are accepted.  
4. Engineering standards (naming, locators, waits, review) are accepted.  
5. Data, fixture, and reporting strategies are accepted.  
6. Quality gates and success metrics are accepted.  
7. AUT-* catalogue and J01–J20 list are accepted as coverage vocabulary.  
8. No unresolved conflict with Approved `00`.  
9. Stakeholders agree the **next** document is `02-PROJECT-STRUCTURE.md`.

---

## 18. What comes next

### Next document: `02-PROJECT-STRUCTURE.md`

**Why next**

- This document defined *what* layers and modules must exist and *how* they depend.  
- Project Structure must freeze the **canonical folder tree**, ownership, and import paths that realize those modules.  
- Roadmap (`03`) and sprints cannot assign file-level work until structure is Approved.  

**Still blocked**

- Sprint specifications — until `00`–`03` are all Approved.  
- `frontend/e2e` implementation — until `SPRINT-00` is Approved.

---

## 19. Approval

| Role | Name | Date | Decision |
|---|---|---|---|
| Author | Principal QA Automation Architect | 2026-07-20 | Submitted for review |
| Reviewer | Product / QA Lead | 2026-07-20 | **Approved** |

**To approve:** *(Completed 2026-07-20 — Status set to Approved.)* Next document: `02-PROJECT-STRUCTURE.md`.
