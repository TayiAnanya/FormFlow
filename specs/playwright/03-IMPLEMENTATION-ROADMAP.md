# FormFlow Playwright Implementation Roadmap

**Document Type:** Implementation Roadmap / Master Execution Plan  
**Project:** FormFlow Playwright Automation  
**Version:** 1.0  
**Status:** Approved  
**Parent Document:** [02-PROJECT-STRUCTURE.md](./02-PROJECT-STRUCTURE.md) (Approved)  
**Related Documents:** [00-AUTOMATION-ARCHITECTURE.md](./00-AUTOMATION-ARCHITECTURE.md), [01-IMPLEMENTATION-SPEC.md](./01-IMPLEMENTATION-SPEC.md), [README.md](./README.md)  
**Code:** None — this document does not authorize coding until `SPRINT-00-FOUNDATION` is Approved  
**Sprint specs:** Not authored in this document — only planned

---

## 1. Document purpose

### 1.1 Why this roadmap exists

Approved foundation documents define **shape** (`00`), **what** (`01`), and **where** (`02`).

This roadmap defines **how delivery proceeds over time**: milestones, sprint sequence, gates, reviews, risks, release stages, and success metrics. It is the **master execution plan** for building an empty harness into a production-ready enterprise Playwright solution.

### 1.2 Relationship to prior documents

| Document | Relationship |
|---|---|
| [README.md](./README.md) | Gates and reading order; this roadmap is step 5 before any sprint |
| [00-AUTOMATION-ARCHITECTURE.md](./00-AUTOMATION-ARCHITECTURE.md) | Binding architecture — roadmap must not contradict hybrid modules, tags, or adapter |
| [01-IMPLEMENTATION-SPEC.md](./01-IMPLEMENTATION-SPEC.md) | AUT-*, standards, journeys — sprints deliver slices of this catalogue |
| [02-PROJECT-STRUCTURE.md](./02-PROJECT-STRUCTURE.md) | Paths and ownership — sprint deliverables map to these folders |
| `SPRINT-XX-*.md` | Timeboxed specs authored **after** this roadmap is Approved |

### 1.3 Why implementation cannot begin without an approved roadmap

Without a roadmap:

- Teams start coding from architecture (forbidden leapfrog).  
- Sprint scope collides (forms before auth, AI before harness).  
- CI and quality work land too late or too early.  
- Progress cannot be measured against milestones.

**Rule:** Framework implementation in `frontend/e2e` begins only after **this roadmap is Approved** and **`SPRINT-00-FOUNDATION` is Approved**. Feature automation follows subsequent Approved sprint specs in order.

### 1.4 Explicit non-goals

- Playwright code, tests, page objects, locators  
- Full sprint specification bodies (authored one-at-a-time after this approval)  
- Changing Approved architecture, impl spec, or structure without change control (§11)

---

## 2. Delivery philosophy

| Principle | Meaning | Why chosen |
|---|---|---|
| **Incremental delivery** | Thin vertical slices: harness → auth → shell → workspace → forms → AI → quality → release | Reduces big-bang risk; early smoke gate |
| **Sprint-based development** | Fixed themes Sprint 00–09 | Clear ownership, demos, and exit criteria |
| **Specification-driven implementation** | Approved sprint spec before that sprint’s code | Matches FormFlow app SDD; prevents tribal backlogs |
| **Review before implementation** | Spec Review → Approve → Code → Sprint Review | Catches scope/architecture drift early |
| **Continuous validation** | PR `@smoke\|@critical` from Sprint 00/01 onward | Protects main continuously |
| **Quality-first** | Flake ownership, quarantine, a11y/security/visual planned — not bolted on at the end | Enterprise readiness (OBJ/ metrics in `01`) |

---

## 3. Project timeline (milestones)

```text
Foundation
    ↓
Core Framework
    ↓
Core Automation
    ↓
Advanced Features
    ↓
Quality Engineering
    ↓
Release Preparation
```

| Milestone | Sprints | Purpose |
|---|---|---|
| **Foundation** | Planning `00`–`03` + Sprint 00 | Specs complete; harness runnable; adapter/tags/CI shell |
| **Core Framework** | Sprint 00–01 (overlap) | Shared kernel stable; auth proves end-to-end path |
| **Core Automation** | Sprints 01–04 | Auth, nav, workspace, dynamic forms — majority of AUT-* |
| **Advanced Features** | Sprints 05–06 | Joint depth + AI (PDF/voice/advisor) |
| **Quality Engineering** | Sprint 07 | A11y, responsive, visual, security hardening, metrics |
| **Release Preparation** | Sprints 08–09 | Full regression/journeys, CI matrix, release readiness |

---

## 4. Sprint roadmap

Each sprint below is a **plan entry**. Detailed scope, AUT-* lists, and file-level DoD belong in the corresponding `SPRINT-XX-*.md` after this roadmap is Approved — authored sequentially.

### SPRINT-00 — Framework Foundation

| Field | Content |
|---|---|
| **Objective** | Stand up hybrid `frontend/e2e` skeleton, config, tags, DataSetupAdapter (localStorage), docs stubs, npm scripts, CI smoke shell |
| **Business value** | Enables all later automation; proves the project can run against FormFlow |
| **Deliverables** | Paths per `02`; Playwright config; shared kernel; retire scaffold example; `e2e/README` + docs stubs |
| **Dependencies** | `00`–`03` Approved |
| **Expected outcomes** | `test:e2e:smoke` job can execute (even minimal); no feature coverage required beyond harness health |
| **Definition of Done** | Structure matches `02`; adapter interface present; tags registry; CI workflow exists; no architecture drift |
| **Risks** | Over-building features in Sprint 00; config mis-wiring `webServer` |
| **Exit criteria** | Sprint 00 spec Approved **and** implemented exit checklist green → unlock Sprint 01 authoring/implementation per gates |

### SPRINT-01 — Authentication

| Field | Content |
|---|---|
| **Objective** | Automate login, register, logout, session, guards, returnUrl (`AUT-AUTH-*`) |
| **Business value** | Unlocks all authenticated portal work; highest security-adjacent risk |
| **Deliverables** | `authentication/` module; guest/auth fixtures; `@smoke`/`@critical`/`@security` auth coverage |
| **Dependencies** | Sprint 00 complete |
| **Expected outcomes** | PR gate includes auth smoke; unsafe returnUrl covered |
| **Definition of Done** | AUT-AUTH catalogue for this sprint green; docs/traceability updated |
| **Risks** | localStorage session flake; PrimeNG password control |
| **Exit criteria** | Auth DoD met; smoke green on main |

### SPRINT-02 — Landing & Navigation

| Field | Content |
|---|---|
| **Objective** | Landing CTAs, portal shell navigation, deep links (`AUT-NAV-*`) |
| **Business value** | Users can reach every module consistently |
| **Deliverables** | Shell/navigation coverage; landing flows |
| **Dependencies** | Sprint 01 (authenticated chrome) |
| **Expected outcomes** | Stable navigation helpers for later sprints |
| **Definition of Done** | AUT-NAV for sprint scope green |
| **Risks** | Coupling nav tests to brittle menu markup |
| **Exit criteria** | Nav suite stable under smoke/regression tags |

### SPRINT-03 — Workspace

| Field | Content |
|---|---|
| **Objective** | Dashboard, profile, drafts, activity, stats, applications, recommendations panel (`AUT-WS-*`) |
| **Business value** | Core customer workspace after submit/draft/advisor |
| **Deliverables** | `workspace/` module; returning/draft/advisor personas |
| **Dependencies** | Sprints 01–02 |
| **Expected outcomes** | Seeded dashboard tests; draft resume ready for forms sprint |
| **Definition of Done** | AUT-WS sprint slice green; draft debounce wait utility proven |
| **Risks** | Draft 600ms races; empty-state vs seeded-state confusion |
| **Exit criteria** | Workspace regression tagged and passing |

### SPRINT-04 — Dynamic Forms

| Field | Content |
|---|---|
| **Objective** | FormHost, DynamicForm, PrimeNG helpers, five scenario happy/validation paths, renderer behaviours (`AUT-FORM-*`, `AUT-REN-*`) — joint *depth* deferred |
| **Business value** | Protects FormFlow’s core differentiator |
| **Deliverables** | `forms/` module; scenario data packs; renderer specs |
| **Dependencies** | Sprints 00–03 (auth + workspace context) |
| **Expected outcomes** | All five scenarios submit happy path; validation matrices started |
| **Definition of Done** | DynamicForm API used for all scenarios; no per-field PO explosion |
| **Risks** | PrimeNG flake; rushing joint complexity into this sprint |
| **Exit criteria** | Forms smoke includes one submit; regression covers five happys |

### SPRINT-05 — Joint Account Builder

| Field | Content |
|---|---|
| **Objective** | Repeater, conditionals, cross-applicant, max applicants (`AUT-JOINT-*`, related journeys) |
| **Business value** | Highest form complexity; major defect magnet |
| **Deliverables** | `forms/joint` depth; joint data packs; journeys J07/J08/J19/J20 as scoped |
| **Dependencies** | Sprint 04 DynamicForm/Repeater |
| **Expected outcomes** | Duplicate detection and conditional paths reliable |
| **Definition of Done** | AUT-JOINT sprint scope green |
| **Risks** | Nested IDs; cross-field timing |
| **Exit criteria** | `@joint` suite stable |

### SPRINT-06 — AI Features

| Field | Content |
|---|---|
| **Objective** | PDF Smart Assist, Voice (mocked), Advisor (mocked), hydration order (`AUT-PDF-*`, `AUT-VOICE-*`, `AUT-ADV-*`) |
| **Business value** | Differentiating AI flows without live-model flake |
| **Deliverables** | `pdf/`, `voice/`, `advisor/` modules; Gemini/speech mocks; journeys J11–J14 as scoped |
| **Dependencies** | Forms + workspace (prefill/hydration) |
| **Expected outcomes** | Deterministic AI E2E; `@ai-live` documented as future optional |
| **Definition of Done** | Default suites never call live Gemini |
| **Risks** | pdf.js worker; speech API absence; over-scoping live AI |
| **Exit criteria** | `@pdf` `@voice` `@advisor` green under mocks |

### SPRINT-07 — Quality Engineering

| Field | Content |
|---|---|
| **Objective** | A11y, responsive, selective visual, security hardening, metrics reporter (`AUT-QA-*`) |
| **Business value** | Enterprise NFR proof; flake visibility |
| **Deliverables** | `quality/*`; baselines; metrics export |
| **Dependencies** | Core UI surfaces from prior sprints exist |
| **Expected outcomes** | Nightly quality jobs; visual not yet PR-blocking |
| **Definition of Done** | Agreed a11y pages clean; visual allowlist committed |
| **Risks** | Visual noise; a11y debt surprises |
| **Exit criteria** | Quality jobs green on nightly |

### SPRINT-08 — Regression & End-to-End

| Field | Content |
|---|---|
| **Objective** | Full `@regression`, journeys J01–J20 (or waived), browser matrix, shard, flake burn-down |
| **Business value** | Release confidence |
| **Deliverables** | `journeys/specs`; firefox/webkit nightly; quarantine process enforced |
| **Dependencies** | Features from 01–07 |
| **Expected outcomes** | Flaky &lt; 2% trajectory; critical journeys green |
| **Definition of Done** | Journey coverage vs `01` reconciled; matrix documented |
| **Risks** | Suite runtime explosion; flake spikes |
| **Exit criteria** | Nightly regression+journey gates accepted for RC |

### SPRINT-09 — Release & CI/CD

| Field | Content |
|---|---|
| **Objective** | Production-ready automation: CI finalized, docs complete, release notes, handoff |
| **Business value** | Sustainable enterprise operation |
| **Deliverables** | Release checklist; docs completeness; baseline freeze policy; ownership matrix |
| **Dependencies** | Sprint 08 exit |
| **Expected outcomes** | Alpha→Beta→RC→Production-Ready criteria met (§9) |
| **Definition of Done** | Release Review passed; planning frozen unless architecture change |
| **Risks** | Doc debt; unresolved quarantine |
| **Exit criteria** | Framework declared enterprise-ready per success metrics |

---

## 5. Sprint dependency graph

```text
Sprint 00 Foundation
    ↓
Sprint 01 Authentication
    ↓
Sprint 02 Landing & Navigation
    ↓
Sprint 03 Workspace
    ↓
Sprint 04 Dynamic Forms
    ↓
Sprint 05 Joint Account
    ↓
Sprint 06 AI Features
    ↓
Sprint 07 Quality Engineering
    ↓
Sprint 08 Regression & E2E
    ↓
Sprint 09 Release & CI/CD
```

**Why this order minimizes risk and maximizes reuse**

1. **Harness first** — no feature work without config/adapter/tags.  
2. **Auth before portal** — almost all routes need session.  
3. **Nav before deep modules** — shared shell APIs stabilize.  
4. **Workspace before forms depth** — drafts/stats need submit context; personas ready.  
5. **Generic forms before joint** — DynamicForm/PrimeNG reused by joint.  
6. **AI after forms/workspace** — patch/prefill/hydration depend on them.  
7. **Quality after surfaces exist** — a11y/visual need real pages.  
8. **Journeys late** — compose stable modules; avoid rewriting.  
9. **Release last** — freeze only when gates hold.

---

## 6. Milestone reviews

| Review | When | Expectations |
|---|---|---|
| **Architecture Review** | Before/at `00` Approved (done) | Hybrid, tags, adapter accepted |
| **Framework Review** | End of Sprint 00 | Structure matches `02`; CI shell; adapter present |
| **Sprint Review** | End of each sprint | Demo exit criteria; AUT-* delta; risks; handoff |
| **Regression Review** | End of Sprint 08 | Journey matrix; flake report; browser results |
| **Release Review** | End of Sprint 09 | Docs, CI, metrics, ownership, production-ready criteria |

Reviews are **blocking** for the next sprint’s implementation start when exit criteria fail.

---

## 7. Quality gates (between sprints)

Before starting the **next** sprint’s implementation:

| Gate | Requirement |
|---|---|
| Prior sprint spec | Approved |
| Prior sprint DoD | Met |
| Architecture | Still aligned (`00`); no unapproved drift |
| Framework stable | Smoke/critical green on main (from Sprint 01+) |
| Code review | Sprint PRs merged with review checklists from `01` |
| Documentation | Traceability + sprint notes updated |
| Tests passing | Tagged suites for that sprint green |
| No critical defects | No open P0/P1 on automation harness blocking progress |
| Review completed | Sprint Review recorded |

Foundation gate (already defined): `00`–`03` Approved before any sprint authored; Sprint 00 Approved before code.

---

## 8. Risk management (roadmap-level)

| Risk | Mitigation |
|---|---|
| Framework risks (structure drift) | Enforce `02`; Framework Review at Sprint 00 |
| Dynamic forms flake | PrimeNG helpers in Sprint 04 before volume; field-key API |
| AI non-determinism | Mocks only in Sprint 06; no live default |
| Voice recognition | Mock speech; UI + patch seam |
| PDF processing | Fixture PDFs; worker verification |
| Responsive / a11y debt | Dedicated Sprint 07; don’t defer forever |
| Regression growth | Tags + sharding in Sprint 08; journey budget |
| Future backend migration | Adapter from Sprint 00 (`01`/`00`) |
| Scope creep mid-sprint | Amend sprint spec + re-approve; no silent expansion |
| Skipping Sprint 00 | Hard gate in README — no exceptions |

---

## 9. Release strategy

| Stage | Criteria |
|---|---|
| **Alpha** | Sprint 00–03 done; auth+nav+workspace+basic forms smoke green; CI PR gate live |
| **Beta** | Through Sprint 06; joint + AI mocked suites green; draft/hydration covered |
| **Release Candidate** | Sprint 08 exit; journeys reconciled; flake &lt; 2% trajectory; multi-browser nightly |
| **Production Ready** | Sprint 09 Release Review passed; docs complete; quarantine empty or waived; ownership clear; metrics dashboard/export available |

Promotion requires the matching Sprint Review / Release Review — not calendar alone.

---

## 10. Success metrics

| Metric | Program target |
|---|---|
| Framework completeness | Hybrid tree + adapter + tags + CI per `02`/`00` |
| Module coverage | All modules in `02` have regression specs by Sprint 08 |
| Automation stability | Nightly pass ≥ 97% post Sprint 08 |
| Execution time | PR smoke/critical within agreed budget (set in Sprint 00/01; revisit Sprint 08) |
| Code reuse | All form scenarios via DynamicForm |
| Flaky % | &lt; 2% rolling 14 days post Sprint 08 |
| Documentation completeness | Foundation Approved; all sprint specs Approved; `e2e/docs` filled |
| Critical journey coverage | J01–J20 automated or explicitly waived in Sprint 09 |

---

## 11. Roadmap governance

| Change type | Process |
|---|---|
| Sprint scope change | Amend that sprint spec → re-Approve → then code |
| Requirement (AUT-*) change | Amend `01` → architectural check if shape impacted → cascade sprint specs |
| Architecture change | Architecture Review → amend `00` → cascade `01`/`02`/`03` as needed |
| Technical debt | Track in sprint exit; schedule explicitly (prefer Sprint 07–08) |
| Documentation updates | PR against `specs/playwright` or `e2e/docs`; status workflow for foundation docs |
| Versioning | Bump this doc `Version` on material timeline/gate changes |
| Approval process | Same Draft → In Review → Approved; only Approved roadmap governs delivery |

Silent roadmap divergence in chat is non-authoritative.

---

## 12. Transition to implementation

After **this roadmap is Approved**:

1. **Planning foundation is complete** (`00`–`03`).  
2. **Next document to author:** [`SPRINT-00-FOUNDATION.md`](./SPRINT-00-FOUNDATION.md) only.  
3. No further planning documents unless architecture changes significantly.  
4. **No `frontend/e2e` coding** until `SPRINT-00-FOUNDATION` is **Approved**.  
5. Subsequent sprints: author spec → Approve → implement → Sprint Review → next.

### Why Sprint 00 is first

- Realizes `02` on disk and `00`/`01` harness requirements.  
- Introduces adapter, tags, CI — prerequisites for every feature sprint.  
- Prevents feature automation on an undefined skeleton.

---

## 13. Final roadmap diagram

```text
Automation Architecture              (00) ✓
        ↓
Implementation Specification         (01) ✓
        ↓
Project Structure                    (02) ✓
        ↓
Implementation Roadmap               (03)  ← this document
        ↓ Approved
Sprint 00 — Framework Foundation
        ↓
Sprint 01 — Authentication
        ↓
Sprint 02 — Landing & Navigation
        ↓
Sprint 03 — Workspace
        ↓
Sprint 04 — Dynamic Forms
        ↓
Sprint 05 — Joint Account Builder
        ↓
Sprint 06 — AI Features
        ↓
Sprint 07 — Quality Engineering
        ↓
Sprint 08 — Regression & End-to-End
        ↓
Sprint 09 — Release & CI/CD
        ↓
Framework Complete
        ↓
Enterprise Playwright Automation Framework
```

---

## 14. Exit criteria

This roadmap may be marked **Approved** when reviewers confirm:

1. Delivery philosophy and milestones are accepted.  
2. Sprint 00–09 objectives, dependencies, DoD, and exit criteria are accepted.  
3. Dependency order and quality gates are accepted.  
4. Review types, release stages, success metrics, and governance are accepted.  
5. Transition rule is accepted: **next author `SPRINT-00-FOUNDATION.md` only**; no code until that sprint is Approved.  
6. No unresolved conflict with Approved `00`–`02`.

### Planning status upon approval

**Official planning foundation is complete.**

| Next | Rule |
|---|---|
| Create `SPRINT-00-FOUNDATION.md` | After this roadmap Approved |
| Further planning docs | Only if architecture changes significantly |
| Implementation | Only after Sprint 00 Approved |

---

## 15. Approval

| Role | Name | Date | Decision |
|---|---|---|---|
| Author | Engineering Manager / Tech Lead / QA Automation Architect | 2026-07-20 | Submitted for review |
| Reviewer | Product / QA Lead | 2026-07-20 | **Approved** |

**To approve:** *(Completed 2026-07-20 — Status set to Approved.)* Planning foundation complete. Next: author `SPRINT-00-FOUNDATION.md` only.
