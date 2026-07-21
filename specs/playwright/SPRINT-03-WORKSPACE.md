# Sprint 03 — Workspace

**Document Type:** Sprint Specification  
**Project:** FormFlow Playwright Automation  
**Sprint:** 03 — Workspace  
**Version:** 1.1  
**Status:** Done  
**Parent Document:** [03-IMPLEMENTATION-ROADMAP.md](./03-IMPLEMENTATION-ROADMAP.md) (Approved)  
**Depends on:**  
[SPRINT-00-FOUNDATION.md](./SPRINT-00-FOUNDATION.md) (Done) ·  
[SPRINT-01-AUTHENTICATION.md](./SPRINT-01-AUTHENTICATION.md) (Done) ·  
[SPRINT-02-LANDING-NAVIGATION.md](./SPRINT-02-LANDING-NAVIGATION.md) (Done)  
**Authoritative foundation:**  
[README.md](./README.md) · [00-AUTOMATION-ARCHITECTURE.md](./00-AUTOMATION-ARCHITECTURE.md) · [01-IMPLEMENTATION-SPEC.md](./01-IMPLEMENTATION-SPEC.md) · [02-PROJECT-STRUCTURE.md](./02-PROJECT-STRUCTURE.md)

**Code:** None in this document. Implementation begins only after this sprint specification is **Approved**.

**Traceability:** Primary AUT IDs — `AUT-WS-01` … `AUT-WS-08` ([01-IMPLEMENTATION-SPEC.md](./01-IMPLEMENTATION-SPEC.md) §14.3). Reuses auth/nav as dependencies (`AUT-AUTH-*`, `AUT-NAV-*`). Form fill/submit and advisor chat remain Sprints 04–06.

---

## 1. Sprint overview

| Field | Statement |
|---|---|
| **Sprint goal** | Automate the FormFlow **Workspace** experience: authenticated dashboard landing, hero/greeting context, catalog entry points, My Workspace panels (applications, drafts, statistics, recent activity, saved AI recommendations), profile workspace entry, application detail navigation, empty/first-time/returning personas, refresh and localStorage persistence, and smoke/critical workspace journeys — on the Sprint 00–02 foundation. |
| **Business objective** | Prove the operational dashboard correctly reflects customer state after authentication and drives the right module entry points without requiring Dynamic Forms or live AI chat automation. |
| **Engineering objective** | Establish the `workspace/` Playwright module with **behaviour-first** suites (~50–70 meaningful tests via personas, journeys, and parameterization); extend `DataSetupAdapter` seeding as needed; deliver `@smoke` / `@critical` / `@workspace` coverage — **without** form field automation or advisor conversation flows. |
| **Expected outcome** | Behavioural workspace coverage green; draft **continue** path ready for Sprint 04; AUT-WS mapped; Coverage Gap Analysis delivered; PR gate includes workspace smoke/critical. |

---

## 2. Business objective

After sign-in, customers live in the Workspace. Automation must prove:

- The dashboard loads as the post-auth operational home.  
- Welcome / brand context and shell greeting reflect the signed-in user.  
- Catalog cards and advisor promo provide correct **navigation entry points** (route only).  
- My Workspace panels show truthful empty vs populated states.  
- Drafts can be **continued** into the form route (arrival only).  
- Applications can be listed and opened in **read-only detail**.  
- Statistics and recent activity reflect seeded mock-backend state.  
- Saved recommendation cards navigate to the intended form route (prefill queue may be primed — **do not** assert field values inside forms).  
- First-time vs returning users are distinguishable and stable across refresh.  
- Mock localStorage workspace keys persist correctly via the adapter seam.  

Success is measured by behavioural proof of **workspace state and journeys**, not by counting one test per UI label or one isolated test per widget.

---

## 2.1 Enterprise automation expectations (binding)

Workspace automation **prioritizes behavioural coverage over requirement coverage**.

### Must include

| Pattern | Intent |
|---|---|
| End-to-end user journeys | Multi-step flows that validate several behaviours in one coherent path (e.g. empty panels + catalog entry; list → detail → back → stats still coherent) |
| Persona-based testing | Empty / first-time / returning / draft-heavy / recommendation-bearing fixtures drive suites |
| Stateful scenarios | Seeded mock-backend state transitions visible on dashboard (without form submit UX) |
| Data-driven testing | Catalog scenarios, application statuses, draft formTypes parameterized — not copy-pasted |
| Empty vs populated comparisons | Same panel assertions under opposite personas |
| Refresh persistence | Reload retains workspace UI state |
| Session persistence | Authenticated workspace survives reload / re-entry (compose auth session behaviour) |
| Cross-feature navigation | Workspace ↔ profile, advisor entry, form **route** entry, application detail, fragments |
| Error recovery | Not-found application; wrong-owner application; return to workspace and continue |
| Regression-oriented scenarios | Durable smoke/critical + returning-user journeys that catch workspace regressions early |

### Must avoid

- One isolated test per widget/label/AUT id when a journey can cover multiple behaviours.  
- Duplicated setup blocks — use personas, workflows, and shared data packs.  
- Thin “presence-only” spam that does not prove state or navigation outcomes.

### Expected suite size

| Metric | Target |
|---|---|
| Meaningful workspace tests | **Approximately 50–70** (or more if justified by behavioural coverage) |
| Composition | Prefer parameterized cases + reusable journeys over unique one-off specs |
| Counting rule | Each parameterized row counts as a test; journeys that assert multiple outcomes still count as **one** test — do not inflate by splitting widgets |

### Coverage Gap Analysis (mandatory deliverable)

At the end of Sprint 03 **implementation**, provide a **Coverage Gap Analysis** documenting:

1. Any in-scope Workspace behaviour intentionally left unautomated and **why**.  
2. Behaviours blocked by product constraints (e.g. Delete Draft UI absent).  
3. Behaviours deferred to Sprint 04+ (form fill, submit-clear draft, advisor chat, prefill field asserts).  
4. Residual risk accepted for PR gate vs nightly/regression.

The gap analysis is part of Sprint 03 Definition of Done.

---

## 3. Engineering objective

- Populate `frontend/e2e/workspace/` per [02-PROJECT-STRUCTURE.md](./02-PROJECT-STRUCTURE.md).  
- Reuse Sprint 00: `DataSetupAdapter`, `WORKSPACE_STORAGE_KEYS`, `ROUTES`, `SCENARIO_IDS`, `APPLICATION_ID_PREFIX`, `TAGS`, fixtures merge, utils.  
- Reuse Sprint 01: `authenticatedUser`, `guestPage`, auth workflows only when session setup is part of a journey.  
- Reuse Sprint 02: `PortalShellPage`, fragment targets (`#workflows`, `#applications`), navigation workflows for entry to `/dashboard`.  
- Prefer stable hooks already in the app (`#workflows`, `#applications`, `#workspace`, `#my-workspace-title`, `.scenario-card`, `.advisor-feature-card`, panel empty copy).  
- Prefer **persona fixtures + seeded packs** over repeating UI setup; keep workflows assertion-free; assertions only in specs.  
- Extend adapter with additive seed helpers if required (profiles, activities, counters) — **do not** redesign the adapter architecture.  
- Do **not** invent FormHost field POs or Advisor chat POs in this sprint.

---

## 4. Scope

### 4.1 In scope

| Area | Notes |
|---|---|
| Workspace landing / dashboard loading | Authenticated `/dashboard` readiness; hero / My Workspace regions |
| Welcome banner / brand hero | Dashboard hero copy/structure (route-level presence) |
| User greeting | Portal shell greeting (`.portal-welcome`) for signed-in first name — workspace context, not nav matrix retest |
| Recent Activity | Empty + seeded timeline (cap/order as implemented — last N events) |
| Draft Forms panel | Empty + seeded drafts list |
| Continue Draft | CTA → `/forms/:formType` route arrival only |
| Delete Draft | **Product constraint:** no discard/delete control on dashboard; see §4.3 |
| Recommendation cards | Empty + seeded saved recommendations; CTA → `/forms/:scenarioId` (route only) |
| Quick Actions | Advisor promo “Open Advisor” → `/advisor`; catalog “Open Form” → `/forms/:id` (entry points) |
| Empty workspace state | First-time / no apps / no drafts / no activity / no recommendations |
| Returning user state | Seeded apps, drafts, activity, stats, recommendations |
| First-time user state | Fresh `loginAs` / newly registered with empty My Workspace panels |
| Refresh persistence | Reload dashboard retains seeded workspace state |
| LocalStorage persistence | Verify via adapter/read helpers for `ff_*` keys — no raw `setItem` in specs |
| Workspace widgets / panels | Applications, drafts, statistics, activity, recommendations |
| Navigation from workspace cards | Catalog, continue draft, recommendation CTA, application Quick View |
| Application detail | Open from list; ownership/not-found handling; back to workspace |
| Profile workspace entry | `/profile` shows workspace-linked identity (customerId); back to dashboard — **view only** |
| Error / empty handling | Panel empty copy; application not found |
| Mock backend scenarios | Adapter-seeded personas (empty, draft-heavy, application-rich, recommendation-bearing) |
| Smoke & critical journeys | Tagged `@smoke` / `@critical` / `@workspace` |

### 4.2 Out of scope

| Area | Deferred to |
|---|---|
| Dynamic Form rendering, field validation, submit UX | Sprint 04 |
| Draft autosave debounce / in-form restore mechanics (beyond Continue CTA) | Sprint 04 |
| Joint Account workflow depth | Sprint 05 |
| Advisor chat, scoring, roadmap generation | Sprint 06 |
| Voice Assistant / PDF Autofill | Sprint 06 |
| Accessibility, performance, visual, full regression | Sprints 07–08 |
| Re-testing auth login matrices / full nav menu matrix | Sprints 01–02 (reuse) |
| Asserting form field values after recommendation prefill | Sprint 04 / 06 boundary |

### 4.3 Product constraints (binding for implementers)

| Topic | Live app fact | Sprint 03 treatment |
|---|---|---|
| **Delete Draft** | No dashboard delete/discard control; drafts clear only on **successful form submit** | **Out of UI scope.** Optional: adapter-cleared draft → panel empty (mock-backend isolation), **or** defer clear-on-submit assert to Sprint 04. Do not invent a Delete button. |
| **Profile update** | Profile page is read-only display; `updateProfile` not exposed on this UI | AUT-WS-02 **view / identity / back-to-workspace** only; edit/prefill depth deferred |
| **Application list route** | No standalone list URL — list lives on dashboard `#applications` | Automate dashboard panel + detail page |
| **Quick Actions** | No separately named “Quick Actions” region | Cover advisor promo + catalog CTAs as the quick-action surface |
| **Statistics (catalog strip)** | Upper dashboard stats are largely **static catalog** metrics | Distinguish static hero stats vs **Application Statistics** panel (dynamic) — automate dynamic panel; static strip only as light presence if needed |
| **Recommendations content** | Workspace shows **saved** recommendation memory, not live Gemini | Seed via adapter; do not call live AI |

---

## 5. Deliverables

| Deliverable | Description (no code in this doc) |
|---|---|
| Workspace page objects | Dashboard (sections/panels), Application detail, Profile (workspace view slice) |
| Workspace workflows | Open workspace, continue draft, open application, open catalog form route, open recommendation CTA, open advisor from promo |
| Workspace fixtures / personas | `emptyWorkspaceUser`, `returningWorkspaceUser`, `draftWorkspaceUser`, `recommendationWorkspaceUser` (names illustrative) — merge into shared `test` |
| Workspace test data | Seed packs for profiles, applications, drafts, activities, recommendations, counters; empty-state expectations |
| Specs | Journey- and persona-oriented suites (~50–70 tests); parameterized catalogs/statuses; **not** one-test-per-widget |
| Adapter extensions (if needed) | Additive seed/read helpers for profiles/activities/counters — no architecture redesign |
| Coverage Gap Analysis | Written report at implementation end (see §2.1) |
| Tags | `@workspace`, `@smoke`, `@critical`, `@happy`, `@negative`, `@boundary` as applicable |
| Traceability | Map suites/journeys to `AUT-WS-01`…`08` (many behaviours per test OK) |
| Docs touch | `workspace/README` — how to run workspace smoke; link gap analysis |

---

## 6. Repository impact

### 6.1 Paths to populate

```text
frontend/e2e/workspace/
  pages/          # dashboard.page, application-detail.page, profile-workspace.page (illustrative)
  workflows/      # workspace.workflow composers
  fixtures/       # personas → merge into shared/fixtures/index.ts
  data/           # empty, returning, drafts, applications, recommendations packs
  specs/          # landing, panels, journeys, persistence, errors
```

### 6.2 Reuse (do not fork)

| Asset | Sprint 03 use |
|---|---|
| Sprint 00 adapter + `WORKSPACE_STORAGE_KEYS` | Seed/reset workspace mock backend |
| Sprint 01 `authenticatedUser` / `loginAs` | Session baseline |
| Sprint 02 `PortalShellPage` / nav workflows | Enter `/dashboard`, fragments `#workflows` / `#applications` |
| `ROUTES`, `SCENARIO_IDS`, `APPLICATION_ID_PREFIX` | Catalog and application id expectations |
| Shared fixtures merge point | Single `test` export |

### 6.3 Must not change

- Hybrid module architecture or Sprint 00/01/02 contracts except additive adapter methods.  
- Auth or navigation acceptance behaviour.  
- Introduction of Forms field-level page objects.

---

## 7. Workspace Page Objects

Identify only — no classes/locators in this document.

| Page object | Surface | Owns |
|---|---|---|
| `DashboardPage` | `/dashboard` | Hero, catalog cards (`#workflows`), advisor promo, My Workspace panels (applications, drafts, stats, activity, recommendations), empty-state locators, CTAs (Open Form, Continue, Quick View, recommendation CTA) |
| `ApplicationDetailPage` | `/applications/:id` | Status/summary readiness, not-found message, back to workspace |
| `ProfileWorkspacePage` | `/profile` | Identity/customerId visibility, empty profile message, back to workspace |
| `PortalShellPage` (existing) | Chrome | Greeting text exposure if needed; logout not re-owned |

**Rules:** Extend `BasePage`; intent methods (`openCatalogForm`, `continueDraft`, `openApplication`, `openRecommendation`); no assertions in pages; no DynamicForm field APIs.

---

## 8. Workspace Workflows

| Workflow | Steps (conceptual) | Assertions? |
|---|---|---|
| `openWorkspace` | Authenticated context → `/dashboard` ready | No |
| `openCatalogScenario` | Dashboard → Open Form for scenario id → form route | No |
| `continueDraft` | Dashboard → Continue for formType → form route | No |
| `openApplicationDetail` | Dashboard → Quick View → detail ready | No |
| `openRecommendationTarget` | Dashboard → recommendation CTA → form route | No |
| `openAdvisorFromPromo` | Dashboard → Open Advisor → `/advisor` | No |
| `openProfileFromWorkspace` | Navigate profile → back to dashboard (optional composer) | No |

Workflows compose pages only; return ids/titles useful to specs.

---

## 9. Workspace Fixtures

| Fixture / persona | Mechanism | When to use |
|---|---|---|
| `authenticatedUser` (Sprint 01) | `loginAs` | Minimal session; may still be “first-time” workspace |
| `emptyWorkspaceUser` | `loginAs` + ensure empty `ff_*` (or reset workspace keys after auth) | Empty-state matrix |
| `returningWorkspaceUser` | Seed profile + apps + activity + stats inputs | Returning dashboard |
| `draftWorkspaceUser` | Seed ≥1 draft | Continue Draft journeys |
| `recommendationWorkspaceUser` | Seed advisor recommendation memory | Recommendation CTA |
| Merge | `workspace/fixtures` → `shared/fixtures/index.ts` | Single entry point |

**Rule:** Prefer adapter seeding when UI under test is the **dashboard/panels**, not form fill. Prefer UI register/login only when the journey’s subject includes auth.

---

## 10. Workspace Test Data

| Pack | Contents |
|---|---|
| Empty expectations | Panel empty copy strings; zeroed application statistics |
| Profile seed | `userId`, names, email, mobile, `customerId` |
| Application seeds | Varied statuses (`Submitted`, `Approved`, `Pending`/`Under Review`, etc.), correct id prefixes |
| Draft seeds | One-per-formType samples with titles matching catalog |
| Activity seeds | Ordered timeline messages (registration, draft started, submit, etc.) |
| Recommendation seeds | Summary + product cards with `targetScenarioId` |
| Catalog matrix | Five `SCENARIO_IDS` for Open Form entry (route only) |
| Error samples | Unknown application id; other-user application id |

No production PII. No Gemini live payloads. No large schema field dictionaries (forms sprint).

---

## 11. Workspace Test Strategy

### 11.1 Design principles

| Principle | Practice |
|---|---|
| Behaviour over requirements | Prefer journeys that prove state + navigation over AUT checkbox tests |
| Personas first | Empty / returning / draft / recommendation fixtures drive most suites |
| Journeys over widgets | One journey may assert greeting + panels + CTA + route together |
| Data-driven where it pays | Catalog Open Form × scenario ids; status tags; multi-draft continue — parameterized |
| Empty vs populated | Pair comparisons (same panel contract, opposite seeds) |
| Stateful clarity | Each test owns its seed; never rely on prior test pollution |
| Persistence dual-check | UI after refresh **and** storage reads via adapter/helpers |
| Cross-feature | Profile, advisor entry, form route, detail, fragments composed with shell |
| Error recovery | Fail path → back to workspace → continue happy path in same or linked journey |
| Boundary honesty | Stop at form/advisor **route**; do not fill fields or chat |
| Minimize duplication | Workflows + persona fixtures + data packs; ban copy-paste setup |

### 11.2 Anti-patterns (reject in review)

- `it('shows applications panel')` with no state/outcome beyond visibility when a persona journey already covers it.  
- Separate specs for each catalog card that only differ by id (use `test.describe` + `for` / data table).  
- Re-implementing Sprint 01/02 guard/nav matrices inside workspace.  
- Asserting DynamicForm fields after recommendation click.

### 11.3 Suite shape (target ~50–70)

Organize for maintainability; approximate distribution (adjust if justified):

| Cluster | Approx. tests | Behaviour focus |
|---|---|---|
| Landing + greeting + hero (persona-aware) | 4–6 | Load, greeting, first-time vs returning chrome context |
| Empty vs populated panel matrix | 10–14 | Apps, drafts, activity, recommendations, stats — paired/parameterized |
| Catalog + advisor entry (data-driven) | 6–8 | Five Open Form routes + advisor promo + fragments |
| Draft journeys | 6–8 | Single/multi continue; empty draft; wrong-state recovery |
| Application list → detail → back | 8–10 | Status variants, not-found, wrong-owner, recovery to workspace |
| Recommendation journeys | 4–6 | Empty, CTA route, multi-card parameterize if present |
| Profile cross-nav | 3–5 | Identity, back, re-entry to workspace |
| Persistence (refresh + session + storage) | 6–8 | Returning persona survive reload; keys coherent |
| Error recovery composites | 4–6 | Not-found then navigate elsewhere successfully |
| Smoke / critical / regression-oriented | 4–6 | Vertical slices; durable PR-gate paths |
| **Total** | **~50–70** | Prefer depth in journeys over widget spam |

### 11.4 Mapping rule

Avoid a separate test file per AUT-WS id. Map **multiple behaviours per journey** to AUT ids in titles/tags. Requirement coverage is a **traceability byproduct** of behavioural suites — not the organizing principle.

---

## 12. Positive scenarios

| ID | Scenario | AUT |
|---|---|---|
| W01 | Authenticated user lands on loaded dashboard / workspace | AUT-WS-01 |
| W02 | Catalog shows five scenario cards; Open Form reaches `/forms/:id` | AUT-WS-01 |
| W03 | Advisor promo opens `/advisor` | AUT-WS-01 / entry |
| W04 | Shell greeting shows signed-in user first name | AUT-WS-02 (context) |
| W05 | Profile page shows workspace customer identity; back to dashboard | AUT-WS-02 |
| W06 | Returning user sees application list; Quick View opens detail | AUT-WS-03, AUT-WS-04 |
| W07 | Application detail shows expected id/status; back returns to workspace | AUT-WS-04 |
| W08 | Seeded draft appears; Continue reaches `/forms/:formType` | AUT-WS-05 |
| W09 | Seeded activity timeline visible | AUT-WS-06 |
| W10 | Application statistics reflect seeded applications/drafts | AUT-WS-07 |
| W11 | Seeded recommendation card CTA reaches target form route | AUT-WS-08 |
| W12 | Refresh retains returning workspace panels | persistence |
| W13 | Smoke: empty workspace loads with empty-state copy | subset |
| W14 | Critical: returning user → continue draft → form route | AUT-WS-05 |

---

## 13. Negative scenarios

| ID | Scenario | Expectation |
|---|---|---|
| W15 | Empty applications / drafts / activity / recommendations | Respective empty copy |
| W16 | Open unknown application id | “Application not found for your account.” (or equivalent) |
| W17 | Open application belonging to another user (seeded) | Not found / blocked for account |
| W18 | Profile with broken session edge (if reproducible without redesign) | Profile empty message — optional if fixture-heavy |
| W19 | Guest hits `/dashboard` | Redirect login (reuse Sprint 01/02 — smoke citation OK, do not rebuild guard matrix) |

---

## 14. Edge cases

| Case | Expectation |
|---|---|
| First-time user after `loginAs` | My Workspace empty; catalog still available |
| Multiple drafts (different formTypes) | Each continue targets correct route |
| Statistics boundaries | Zero vs non-zero; status buckets match seeds |
| Activity list length | Honours UI cap (e.g. last 6) when over-seeded |
| Fragment entry `#workflows` / `#applications` | Lands on dashboard with hash (Sprint 02 reuse) |
| Recommendation without cards | Empty recommendations panel + advisor link |
| Storage isolation | Reset between tests; unique user ids/emails |

---

## 15. User Journey Matrix

Reusable journeys validate **multiple business behaviours together**. Implement these (and variants via data/personas) rather than widget-isolated tests.

| Journey | Steps (compose) | Behaviours combined | AUT |
|---|---|---|---|
| J-WS-A First look | Session → dashboard → empty My Workspace → Open Form route | Empty state + catalog entry | AUT-WS-01 |
| J-WS-B Resume work | Seed draft(s) → dashboard → Continue → form route | Draft list + continue + route | AUT-WS-05 |
| J-WS-C Review submission | Seed app(s) → list → Quick View → detail → back → list/stats still valid | Apps + detail + recovery | AUT-WS-03/04/07 |
| J-WS-D Act on advice | Seed recommendation → CTA → form route | Rec panel + cross-nav | AUT-WS-08 |
| J-WS-E Identity check | Dashboard → profile → back → greeting/workspace still coherent | Profile + session context | AUT-WS-02 |
| J-WS-F Advisor door | Dashboard promo → `/advisor` → (optional) return to dashboard | Cross-feature entry | AUT-WS-01 |
| J-WS-G Empty vs returning | Same assertions under empty persona then returning persona (or paired tests sharing expect helpers) | Comparative state | AUT-WS-01/03/06/07 |
| J-WS-H Persist & refresh | Returning seed → assert panels → reload → re-assert UI + storage | Refresh + session persistence | persistence + AUT-WS-* |
| J-WS-I Error recovery | Open bad application id → not-found → back/home → open valid app or catalog | Negative + recovery | AUT-WS-04 |
| J-WS-J Multi-draft | Seed 2+ drafts → continue each targets correct formType | Stateful multi-entity | AUT-WS-05 |
| J-WS-K Regression slice | Smoke: empty load; Critical: returning → continue draft | PR-gate durability | subset |

Full journeys that **submit forms** or **chat with advisor** remain Sprint 08 / 04 / 06.

---

## 16. Data strategy

| Concern | Approach |
|---|---|
| Mock backend | localStorage `ff_*` via `DataSetupAdapter` (extend seed methods additively) |
| Personas | Immutable seed builders in `workspace/data` returning JSON-ready records |
| Coupling to auth user | Application/draft/activity `userId` must match authenticated profile user id |
| ID prefixes | Use `APPLICATION_ID_PREFIX` for expected application ids |
| Draft debounce | Not exercised in-workspace; Continue uses pre-seeded drafts |
| Prefill queue | May be set by recommendation click; **do not** assert form field values |
| Reads | Prefer adapter-backed or small workspace storage read helpers; no `setItem` in specs |
| Parallelism | Unique emails/userIds per test |

---

## 17. Acceptance Criteria

Sprint 03 implementation is acceptable when **all** are true:

1. `workspace/` pages, workflows, fixtures, data, and specs exist per §5–§11.  
2. Sprint 00–02 reused; auth and navigation suites remain green.  
3. Suite demonstrates **behaviour-first** design per §2.1 (journeys/personas/data-driven; no one-test-per-widget pattern).  
4. Approximately **50–70** meaningful workspace tests delivered (or more if justified); parameterization preferred over duplication.  
5. Journey matrix J-WS-A…K represented (variants OK).  
6. Empty vs populated, refresh persistence, session persistence, cross-feature navigation, and error recovery covered.  
7. Positive/negative/edge intents in §12–§14 covered through journeys (not isolated widget checks).  
8. At least one `@smoke` and one `@critical` workspace journey (regression-oriented).  
9. AUT-WS-01…08 mapped; §4.3 constraints respected (no invented Delete Draft UI; no form fill).  
10. LocalStorage / adapter verification for key workspace state implemented.  
11. **Coverage Gap Analysis** published (unautomated behaviours + rationale).  
12. No Dynamic Forms / Joint / Advisor-chat / Voice / PDF automation.  
13. Specs tagged `@workspace` (+ suite/outcome tags).  
14. Code review against foundation + this contract complete.

---

## 18. Definition of Done

Sprint 03 is **complete** when:

1. This specification is **Approved**.  
2. Implementation satisfies §17 Acceptance Criteria (including suite size intent and Coverage Gap Analysis).  
3. Sprint Review completed and recorded.  
4. `specs/playwright/README.md` updated to Sprint 03 Done.  
5. No open P0 workspace automation defects blocking Sprint 04.  
6. Team authorized to author `SPRINT-04-DYNAMIC-FORMS.md` next.  
7. **Sprint 04 must not begin implementation** until this Definition of Done is met.

---

## 19. Risks

| Risk | Mitigation |
|---|---|
| Empty vs seeded confusion | Explicit personas; never share storage across tests |
| Draft 600ms races | Do not rely on in-form autosave in this sprint; seed drafts |
| Over-asserting static marketing stats | Focus on My Workspace dynamic panels |
| Sliding into Forms sprint | Hard stop at route readiness for Continue / Open Form / recommendation |
| Recommendation prefill temptation | Route-only asserts; document prefill as Sprint 04/06 |
| Adapter gaps (profiles/activities) | Additive methods only; keep interface documented |
| Profile “update” AUT wording vs read-only UI | Scope AUT-WS-02 to view/identity per §4.3 |
| Inflating suite with widget-only tests | Enforce §2.1 / §11.2 anti-patterns in review |
| Undershooting behavioural depth | Target 50–70 meaningful tests via journeys + parameterization |
| Skipping gap analysis | Mandatory DoD artifact |

---

## 20. Sprint dependencies

| Dependency | Required for Sprint 03 |
|---|---|
| Sprint 00 | Adapter, keys, tags, config, CI smoke |
| Sprint 01 | Authenticated session fixtures/workflows |
| Sprint 02 | Portal shell, dashboard entry, fragments |
| App dashboard + workspace services | Panel behaviour and storage shapes |
| Catalog / scenario ids | Open Form matrix |

Sprint 03 **must not** re-initialize Playwright or invent a parallel tree.

---

## 21. Implementation handoff

**Sprint 03 planning is complete** when this document’s header `Status` is set to **Approved**.

### What happens next

1. **After Sprint 03 is approved, implementation begins** — and only then.  
2. **No implementation should occur before approval** of this specification.  
3. Implement strictly within §4 In Scope; honour §4.3 product constraints; follow §6 repository impact.  
4. **Sprint 04 (Dynamic Forms) cannot begin** (neither leapfrog implementation nor skipping this DoD) until Sprint 03 satisfies §18.  
5. Do not treat chat history as authoritative over this contract once Approved.

### Implementation contract summary

| Allowed | Forbidden |
|---|---|
| Journey/persona suites (~50–70); continue draft **route**; app list/detail; recommendation **route**; profile view; adapter seeding; persistence; error recovery; smoke/critical; Coverage Gap Analysis | One-test-per-widget spam; form fill/validate/submit; joint flows; advisor chat; voice/PDF; inventing Delete Draft UI; a11y/visual/perf suites; redesigning Sprint 00–02 |

### App behaviour anchors (for implementers)

| Behaviour | Live app fact |
|---|---|
| Workspace home | `/dashboard` (`app-dashboard`) |
| Catalog | `#workflows` · five scenario cards |
| Applications panel | `#applications` |
| Drafts | Continue → `/forms/:formType`; no delete button |
| Detail | `/applications/:applicationId` |
| Storage | `ff_customer_profiles`, `ff_applications`, `ff_form_drafts`, `ff_activity_timeline`, `ff_advisor_recommendations`, `ff_application_counters` |
| Empty copies | “No applications submitted yet.” · “No drafts in progress.” · activity/recommendations empty messages as implemented |

---

## 22. Exit criteria (specification)

This sprint specification may be marked **Approved** when reviewers confirm:

1. Overview, objectives, §2.1 enterprise expectations, and scope (including §4.3) are accepted.  
2. Journey matrix, suite-size target (~50–70), and AUT-WS mapping are sufficient.  
3. Acceptance Criteria (incl. Coverage Gap Analysis) and Definition of Done are testable.  
4. Sprint 00–02 reuse rules are binding.  
5. Implementation Handoff (§21) is accepted.

---

## Document control

| Role | Name | Date | Decision |
|---|---|---|---|
| Author | Automation Architect (Cursor) | 2026-07-20 | In Review (v1.1 — enterprise behavioural expectations) |
| Reviewer | Product / Automation | 2026-07-20 | **Approved** for implementation |
| Implementer | Automation Engineer (Cursor) | 2026-07-20 | **Done** — Workspace suite green; Auth/Nav/Harness regression green |

**Next after Sprint 03 DoD:** Author `SPRINT-04-DYNAMIC-FORMS.md` (Specification Mode). Do **not** begin Sprint 04 implementation until that spec is Approved.
