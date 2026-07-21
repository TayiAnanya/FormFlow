# Sprint 05 — Joint Account

**Document Type:** Sprint Specification  
**Project:** FormFlow Playwright Automation  
**Sprint:** 05 — Joint Account Builder  
**Version:** 1.0  
**Status:** Done  
**Parent Document:** [03-IMPLEMENTATION-ROADMAP.md](./03-IMPLEMENTATION-ROADMAP.md) (Approved)  
**Depends on:**  
[SPRINT-00-FOUNDATION.md](./SPRINT-00-FOUNDATION.md) (Done) ·  
[SPRINT-01-AUTHENTICATION.md](./SPRINT-01-AUTHENTICATION.md) (Done) ·  
[SPRINT-02-LANDING-NAVIGATION.md](./SPRINT-02-LANDING-NAVIGATION.md) (Done) ·  
[SPRINT-03-WORKSPACE.md](./SPRINT-03-WORKSPACE.md) (Done) ·  
[SPRINT-04-DYNAMIC-FORMS.md](./SPRINT-04-DYNAMIC-FORMS.md) (Done)  
**Authoritative foundation:**  
[README.md](./README.md) · [00-AUTOMATION-ARCHITECTURE.md](./00-AUTOMATION-ARCHITECTURE.md) · [01-IMPLEMENTATION-SPEC.md](./01-IMPLEMENTATION-SPEC.md) · [02-PROJECT-STRUCTURE.md](./02-PROJECT-STRUCTURE.md)  
**Product contracts:**  
[`../001-formflow/spec.md`](../001-formflow/spec.md) · [`../001-formflow/schema-contract.md`](../001-formflow/schema-contract.md)

**Code:** None in this document. Implementation begins only after this sprint specification is **Approved**.

**Traceability:** Primary AUT IDs — `AUT-JOINT-01` … `AUT-JOINT-06`, nested id depth `AUT-REN-05` / `AUT-REN-06` ([01-IMPLEMENTATION-SPEC.md](./01-IMPLEMENTATION-SPEC.md) §14.4–§14.5). Journeys **J07**, **J08**, **J19**, **J20**. Reuses FormHost + DynamicForm from Sprint 04. PDF / Voice / Advisor remain Sprint 06.

---

## 1. Sprint overview

| Field | Statement |
|---|---|
| **Sprint goal** | Automate the **Joint / Family Account Builder** depth: multi-applicant repeater management, relation-driven conditionals, cross-applicant business rules, nested field identity, joint draft persistence, and realistic multi-applicant journeys — on the Sprint 00–04 foundation. |
| **Business objective** | Prove that customers can safely assemble, validate, persist, and submit joint applications with primary + up to four joint applicants under banking duplicate and conditional rules. |
| **Engineering objective** | Extend `forms/` with a **`forms/joint`** depth module (Repeater component + joint data packs + `@joint` specs); reuse DynamicForm field-key API with nested ids; deliver ~**40–70** meaningful behavioural tests via matrices and journeys — **without** AI/PDF/voice, a11y/perf, or full regression suites. |
| **Expected outcome** | AUT-JOINT-01…06 green; J07/J08/J19/J20 represented; Coverage Gap Analysis delivered; PR gate includes `@joint` smoke/critical; Sprint 04 forms suite remains green. |

---

## 2. Business objective

Joint Account is FormFlow’s highest-complexity form workflow. Automation must prove:

- The joint scenario lands and renders primary + empty Joint Applicants repeater.  
- Applicants can be **added** and **removed** within product limits.  
- **Maximum** of four joint applicants is enforced (Add control hidden at cap).  
- **Minimum** joint count is **zero** (primary-only remains valid) — do not invent a “must add joint” rule.  
- Primary applicant identity and required fields remain authoritative.  
- Secondary (joint) applicants carry relation, identity, and occupation.  
- Relation selection drives conditional sections (minor / spouse / parent).  
- Cross-applicant rules block duplicate identity, email, and mobile conflicts.  
- Nested field ids follow `{repeaterKey}-{index}-{childKey}`.  
- Multi-applicant state persists through draft autosave / resume / clear-on-submit.  
- Validation and business-rule messages are user-visible and block false success.  
- End-to-end journeys complete with application prefix `JOINT*`.  

Success is measured by **behavioural proof of multi-applicant workflows**, not by one isolated test per nested field label.

### 2.1 Enterprise automation expectations (binding)

Joint automation **prioritizes behavioural coverage over requirement coverage**.

### Must include

| Pattern | Intent |
|---|---|
| End-to-end multi-applicant journeys | Add → fill → validate → draft → resume → submit |
| Applicant management matrix | Add/remove/order/max parameterized |
| Relation conditional matrix | Minor / spouse / parent (+ sibling/other baseline) |
| Cross-applicant validation matrix | Matches primary, duplicate joint, email, mobile, fallback |
| Boundary testing | Max 4; min 0; remove last; index shifts after remove |
| Stateful draft lifecycle | Multi-row repeater values survive debounce + Continue |
| Recovery scenarios | Duplicate blocked → fix identity → submit |
| Parameterized datasets | Relation packs; duplicate conflict packs |
| Smoke / critical | Durable PR-gate joint paths |

### Must avoid

- Re-proving Sprint 04 primary-only happy submit as the sprint’s main deliverable (cite as baseline; deepen).  
- One test per nested field label.  
- Inventing **shared address / individual address** UI the product does not have.  
- Automating PDF Smart Assist, Voice, or Advisor inside `@joint`.  
- Full a11y / perf / browser-matrix regression (later sprints).

### Expected suite size

| Metric | Target |
|---|---|
| Meaningful `@joint` / joint-depth tests | **Approximately 40–70** (or more if justified) |
| Composition | Matrices + journeys; reuse Sprint 04 FormHost/DynamicForm |
| Counting rule | Parameterized rows count as tests; multi-assert journeys count as **one** |

### Coverage Gap Analysis (mandatory)

At implementation end, document unautomated in-scope behaviours, product-constraint gaps (e.g. no shared address), deferred Sprint 06+ items, and PR vs nightly residual risk.

---

## 3. Engineering objective

- Populate `frontend/e2e/forms/joint/` (and joint specs under `forms/specs/joint-family-account/` or `forms/joint/specs/`) per [02-PROJECT-STRUCTURE.md](./02-PROJECT-STRUCTURE.md).  
- Implement / deepen **Repeater** component API (add / remove / row field-key) on Sprint 04 DynamicForm — **no** per-child page-object explosion.  
- Deliver joint **data packs**: primary, joint rows by relation, duplicate conflict sets, max-4 builder.  
- Reuse Sprint 04 FormHost, draft wait (~600 ms + buffer), storage reads, PrimeNG helpers, auth fixtures.  
- Tag suites `@joint` (+ `@forms` / `@smoke` / `@critical` / `@happy` / `@negative` / `@boundary` as applicable).  
- Keep Sprint 04 Dynamic Forms suite green (no regressions).  
- Ignore Smart Assist / Voice / Gemini chrome on FormHost.

---

## 4. Scope

### 4.1 In scope

| Area | Notes |
|---|---|
| Joint Account landing | `/forms/joint-family-account` ready; title; empty repeater |
| Applicant management | Repeater `jointApplicants` add/remove/collapse as implemented |
| Add applicant | `Add Another Applicant` creates row; label `Applicant {{index}}` |
| Remove applicant | `Remove Applicant`; indices re-pack |
| Maximum applicant limit | **4** joint rows; Add hidden at max (`AUT-JOINT-01`, J19) |
| Minimum applicant validation | Joint **minItems = 0**; primary required — automate both empty-repeater validity and incomplete-row requireds |
| Primary applicant | Top-level fields; age ≥ 18 |
| Secondary applicant | Repeater row required children |
| Relationship selection | `minor` / `spouse` / `parent` / `sibling` / `other` |
| Shared address | **Product has no shared-address feature** — see §4.3 |
| Individual address | **Product has no per-joint address** — primary `address` only (§4.3) |
| Duplicate applicant detection | Identity match primary / between joints |
| Duplicate email | Cross-applicant unique email |
| Duplicate mobile | Cross-applicant unique mobile |
| Conditional applicant sections | Minor guardians; spouse signature; parent file |
| Cross-applicant validation | Full message matrix |
| Applicant ordering | Applicant 1…N labels; order after remove |
| Draft save / resume | Multi-row values in `ff_form_drafts` |
| Multi-applicant persistence | Refresh + Continue restore rows |
| Validation messages | Row + cross-applicant alerts |
| Business rule enforcement | Block submit on conflicts |
| Error states | Incomplete row; max boundary; file required |
| Journey testing | J07 / J08 / J19 / J20 (+ J-JA-* composites) |
| Smoke / critical | Tagged PR-gate slices |

### 4.2 Out of scope

| Area | Deferred to |
|---|---|
| AI Features / Advisor chat / recommendation prefill depth | Sprint 06 |
| Voice Assistant | Sprint 06 |
| PDF Autofill / Smart Assist | Sprint 06 |
| Accessibility / performance / visual suites | Sprints 07–08 |
| Full portal regression / browser matrix | Sprint 08 |
| Re-building Auth / Nav / Workspace / non-joint form matrices | Sprints 01–04 (reuse) |

### 4.3 Product constraints (binding)

| Topic | Live app fact | Sprint 05 treatment |
|---|---|---|
| **Shared / individual address** | Only primary **Residential Address** (`address`). No toggle; no joint address fields | **Do not invent UI.** Cover primary address required behaviour; document address gap in Coverage Gap Analysis |
| **Joint minimum** | `minItems: 0` — primary-only submit is valid | Automate zero-joint as valid baseline; do not fail if zero joints |
| **Joint maximum** | `maxItems: 4`; Add button **not rendered** at cap | Assert Add absence at 4; no invented toast required |
| **Primary-only happy** | Already automated in Sprint 04 (AUT-FORM-05 light) | Reuse as smoke citation / thin baseline; focus depth on repeater |
| **Nested ids** | `jointApplicants-{index}-{childKey}` | Binding for Repeater/DynamicForm API (`AUT-REN-06`) |
| **Identity priority** | Cross-applicant identity uses `aadhaar` → `pan` → `passport` only (**not** `driving_licence`) | Design duplicate packs accordingly |
| **File proof** | Parent relation → `relationshipProof` (pdf/jpg/png) | Use fixture file under `forms/joint` or `forms/data` |
| **Draft meaningfulness** | Empty `jointApplicants: []` alone may not create draft | Seed/fill at least one meaningful field/row before storage asserts |
| **AI chrome** | Smart Assist present | Ignore |

---

## 5. Repository impact

### 5.1 Paths to populate

```text
frontend/e2e/forms/
  components/           # deepen repeater.ts (or joint/repeater)
  joint/                # joint-only workflows / fixtures / data (preferred)
    workflows/
    fixtures/           # optional; merge to shared if needed
    data/               # relation packs, duplicate packs, max-4 builder
  specs/
    joint-family-account/   # @joint specs (journeys, matrices, smoke)
  data/                 # may extend shared form packs if cleaner
```

Exact folder names may follow [02-PROJECT-STRUCTURE.md](./02-PROJECT-STRUCTURE.md) (`forms/joint` + scenario specs). Prefer **one** home for joint depth — do not fork a parallel tree outside `forms/`.

### 5.2 Reuse (do not fork)

| Asset | Sprint 05 use |
|---|---|
| Sprint 04 FormHost + DynamicForm | Open/fill/submit primary + nested keys |
| PrimeNG helpers | Select / date / checkbox / file where needed |
| Draft wait + storage readers | Multi-applicant persistence |
| Auth / workspace Continue | Resume journeys |
| `APPLICATION_ID_PREFIX['joint-family-account']` | `JOINT` |

### 5.3 Must not change

- Sprint 00–04 contracts except additive Repeater APIs.  
- Non-joint scenario acceptance behaviour.  
- Introduction of PDF/Voice/Advisor automation.

---

## 6. Page Objects

Identify only — no classes/locators in this document.

| Asset | Surface | Owns |
|---|---|---|
| `FormHostPage` (existing) | `/forms/joint-family-account` | Host chrome, success, back |
| `DynamicForm` (existing) | Renderer | Field-key fill including nested ids |
| `Repeater` (new/deepen) | `jointApplicants` | Add / remove / row count / row title; nested field targeting |
| `DashboardPage` (existing) | Workspace | Continue Draft for joint title |

**Rules:** No assertions in pages/components; no Smart Assist APIs; nested access via Repeater + DynamicForm — not five hand-written row POs.

---

## 7. Workflows

| Workflow | Steps (conceptual) | Assertions? |
|---|---|---|
| `openJointForm` | Auth → joint route ready | No |
| `fillPrimaryApplicant` | DynamicForm primary pack | No |
| `addJointApplicant` | Click Add → optional expand | No |
| `fillJointRow` | Nested keys for index + relation pack | No |
| `removeJointRow` | Remove at index | No |
| `fillToMaxApplicants` | Add until Add hidden (4) | No |
| `submitJointApplication` | Submit Joint Application | No |
| `waitForJointDraft` | Debounce buffer | No |
| `resumeJointDraft` | Workspace Continue → hydrate | No |
| `uploadRelationshipProof` | File input for parent row | No |

---

## 8. Fixtures

| Fixture / persona | Mechanism | When to use |
|---|---|---|
| `authenticatedUser` | Sprint 01 | Baseline |
| `jointFormUser` (illustrative) | Auth + clean drafts for joint | Most joint specs |
| `jointDraftUser` | Auth + seeded multi-row draft | Resume-only speed paths |
| Merge | Optional `forms/joint/fixtures` → `shared/fixtures` | Single `test` export |

**Rule:** Prefer UI add/fill when testing applicant management. Prefer seeded draft when proving restore of complex multi-row state — at least one journey must prove **UI autosave → Continue**.

---

## 9. Test data

| Pack | Contents |
|---|---|
| Primary happy | Valid primary including Residential Address |
| Joint row by relation | `minor`, `spouse`, `parent`, `sibling`/`other` builders |
| Guardian / signature / file | Conditional required values + sample upload file |
| Duplicate conflict sets | Matching primary id; matching joint ids; shared email; shared mobile; name+DOB+mobile fallback |
| Max-4 builder | Four distinct valid joint rows |
| Incomplete row | Missing relation / occupation for negative |
| Expected messages | Exact cross-applicant and conditional strings (§10) |

No production PII. No live Gemini. Small fixture PDF/JPG for parent proof only.

---

## 10. Validation Matrix

Parameterize; assert `role="alert"` (or field error id) and blocked submit.

| Row id | Intent | Expectation |
|---|---|---|
| JV-PRIM-AGE | Primary under 18 | `Primary applicant must be at least 18 years old.` |
| JV-ROW-REQ | Joint row missing required child | Schema required message; blocked |
| JV-REL-REQ | Relation empty on row | `Please select a relation` |
| JV-MINOR | Minor without guardian | Guardian required messages |
| JV-SPOUSE | Spouse without signature | `Joint signature confirmation is required for spouse applicants` |
| JV-PARENT | Parent without file | `Please upload relationship proof for parent applicants` |
| JV-DUP-PRIM | Joint id matches primary (priority type) | `This applicant already exists as the Primary Applicant.` |
| JV-DUP-JOINT | Two joints same priority identity | `Duplicate joint applicant detected.` |
| JV-DUP-EMAIL | Shared email across applicants | `Email address must be unique across all applicants.` |
| JV-DUP-MOBILE | Shared mobile | `Mobile number must be unique across all applicants.` |
| JV-DUP-FALLBACK | Name+DOB+mobile without priority ids | `Possible duplicate applicant: matching full name, date of birth, and mobile number.` |
| JV-RECOVER | Duplicate then fix id/email → submit | Success `JOINT*` |

Invisible conditionals must **not** raise their required messages until relation makes them visible.

---

## 11. Applicant Matrix

| Case | Setup | Expectation | AUT |
|---|---|---|---|
| A0 | Primary only, 0 joints | Submit success (baseline) | AUT-FORM-05 cite / thin |
| A1 | Add one joint (sibling/other) | Row `Applicant 1`; submit `JOINT*` | AUT-JOINT-01/06 |
| A2 | Add then remove | Count returns; Add visible again | AUT-JOINT-01 |
| A3 | Add to 4 | Add control **absent**; 4 titles | AUT-JOINT-01, J19 |
| A4 | Remove middle row | Remaining labels re-index 1…N | ordering |
| A5 | Minor relation | Guardian fields visible + required | AUT-JOINT-02 |
| A6 | Spouse relation | Signature checkbox visible + required | AUT-JOINT-03 |
| A7 | Parent relation | File control visible + required | AUT-JOINT-04 |
| A8 | Switch relation minor→spouse | Guardian hidden; signature shown | conditionals |
| A9 | Nested id pattern | Interact via `jointApplicants-0-*` | AUT-REN-06 |
| A10 | Multi-row draft | 2+ rows survive refresh/Continue | persistence |

---

## 12. User Journey Matrix

| Journey | Steps | Behaviours | Trace |
|---|---|---|---|
| J-JA-A / **J07** Multi-applicant happy | Primary → add 2 joints → fill → submit → `JOINT*` | Management + submit | AUT-JOINT-06 |
| J-JA-B / **J08** Minor path | Add joint → relation minor → guardians → submit | Conditional depth | AUT-JOINT-02 |
| J-JA-C Spouse path | Relation spouse → signature → submit | Conditional | AUT-JOINT-03 |
| J-JA-D Parent path | Relation parent → upload proof → submit | File + conditional | AUT-JOINT-04 |
| J-JA-E / **J19** Max applicants | Add until Add gone → fill 4 → submit | Boundary | AUT-JOINT-01 |
| J-JA-F / **J20** Duplicate blocked | Seed conflict → submit blocked → fix → submit | Business rules | AUT-JOINT-05 |
| J-JA-G Draft multi-row | Fill primary + joints → debounce → leave → Continue → values/rows restored → submit | Persistence | draft + AUT-WS-05 |
| J-JA-H Remove & recover | Add 3 → remove one → complete remaining → submit | Ordering + recovery | AUT-JOINT-01/06 |
| J-JA-I Regression slice | Smoke: add one + submit; Critical: duplicate or max path | PR gate | subset |

Full AI/PDF/Voice journeys remain Sprint 06 / 08.

---

## 13. Positive scenarios

| ID | Scenario | AUT |
|---|---|---|
| JA01 | Joint form lands with empty repeater | landing |
| JA02 | Add applicant creates Applicant 1 | AUT-JOINT-01 |
| JA03 | Remove applicant restores capacity | AUT-JOINT-01 |
| JA04 | Max 4 joints; Add hidden | AUT-JOINT-01 |
| JA05 | Minor path completes | AUT-JOINT-02 |
| JA06 | Spouse path completes | AUT-JOINT-03 |
| JA07 | Parent path with proof upload completes | AUT-JOINT-04 |
| JA08 | Multi-applicant happy → `JOINT*` | AUT-JOINT-06 |
| JA09 | Nested field ids operable | AUT-REN-06 |
| JA10 | Multi-row draft resume | persistence |
| JA11 | Smoke: primary + one joint submit | smoke |
| JA12 | Primary Residential Address accepted in multi path | address (primary only) |

---

## 14. Negative scenarios

| ID | Scenario | Expectation |
|---|---|---|
| JA13 | Incomplete joint row submit | Required alerts; no success |
| JA14 | Minor missing guardian | Guardian messages; blocked |
| JA15 | Spouse missing signature | Signature message; blocked |
| JA16 | Parent missing file | Proof message; blocked |
| JA17 | Joint matches primary identity | Matches-primary message; blocked |
| JA18 | Duplicate joint identity | Duplicate-joint message; blocked |
| JA19 | Duplicate email / mobile | Uniqueness messages; blocked |
| JA20 | Fallback duplicate (name+DOB+mobile) | Fallback message; blocked |

---

## 15. Edge cases

| Case | Expectation |
|---|---|
| Zero joints | Valid submit (do not require joints) |
| Add at max | Add control not present |
| Remove last joint | Repeater empty; primary-only still submittable |
| Index shift after remove | Nested ids track new indices |
| `driving_licence` identity | Selectable but outside priority duplicate rules — cover carefully |
| Optional joint email/mobile empty | No uniqueness error |
| Draft with only empty array | May not persist — fill meaningful content |
| Profile prefill on primary | Clear or account for hydration in negatives (Sprint 04 lesson) |
| Collapsible rows | Ensure target row expanded before fill |

---

## 16. Acceptance Criteria

Sprint 05 implementation is acceptable when **all** are true:

1. `forms/joint` (or equivalent structure) delivers Repeater API, joint data packs, workflows, and `@joint` specs.  
2. Sprint 00–04 reused; Authentication, Navigation, Workspace, Forms (Sprint 04), and Harness remain green.  
3. Behaviour-first design: matrices + journeys; no one-test-per-nested-field.  
4. Approximately **40–70** meaningful joint-depth tests (or more if justified).  
5. Validation Matrix, Applicant Matrix, and Journey Matrix (incl. J07/J08/J19/J20) represented.  
6. AUT-JOINT-01…06 mapped and green.  
7. AUT-REN-05/06 nested repeater depth covered for joint.  
8. Cross-applicant duplicate rules covered with exact messages.  
9. Minor / spouse / parent conditionals covered (including parent file upload).  
10. Max-4 and add/remove behaviours covered.  
11. Multi-applicant draft save/resume/clear-on-submit covered with debounce-safe waits.  
12. §4.3 respected (no invented shared/individual address UI).  
13. At least one `@smoke` and one `@critical` `@joint` journey.  
14. **Coverage Gap Analysis** published.  
15. No AI / Voice / PDF / a11y / perf automation.  
16. Code review against foundation + this contract complete.

---

## 17. Definition of Done

Sprint 05 is **complete** when:

1. This specification is **Approved**.  
2. Implementation satisfies §16 Acceptance Criteria (including Gap Analysis).  
3. Sprint Review completed and recorded.  
4. `specs/playwright/README.md` updated to Sprint 05 Done.  
5. No open P0 joint automation defects blocking Sprint 06.  
6. Team authorized to author `SPRINT-06-AI-FEATURES.md` next.  
7. **Sprint 06 must not begin implementation** until this Definition of Done is met.

---

## 18. Coverage Gap Analysis (Sprint 05 final)

| Gap | Status | Notes |
|---|---|---|
| Shared / individual address workflows | **Out of scope (product)** | Only primary `address` (Residential Address); asserted present, not invented |
| “Minimum one joint applicant” rule | **Out of scope (product)** | `minItems: 0` — primary-only covered as valid |
| Dedicated max-reached toast | **N/A** | Add control hidden at 4; no toast in product |
| Primary-only happy depth | **Deferred to Sprint 04** | `JOINT*` without repeater depth already in forms suite (`AUT-REN-05`) |
| Full UI FormArray restore after hard refresh | **Partial** | Drafts assert `ff_form_drafts` persistence; Continue/resume paths covered; UI expand-all restore can be flaky under debounce |
| Exhaustive cross-type identity matrix (every id-type pair) | **Partial** | Priority types + duplicate joint + email/mobile + driving-licence fallback covered; not every combinatorial pair |
| PDF / Voice / Advisor | **Sprint 06** | Explicitly excluded |
| A11y / visual / perf / full release regression | **Sprints 07–08** | Explicitly excluded |
| Nightly expansion of multi-relation combinatorial packs | **Deferred** | Core relation packs (minor/spouse/parent/sibling/other) covered via matrices |

---

## 19. Sprint dependencies

| Dependency | Required for Sprint 05 |
|---|---|
| Sprint 00 | Adapter, tags (`@joint`), draft wait, config |
| Sprint 01–03 | Auth session; workspace Continue Draft |
| Sprint 04 | FormHost, DynamicForm, PrimeNG helpers, form patterns |
| Joint bundled schema + repeater renderer | Product under test |

Sprint 05 **must not** re-initialize Playwright or invent a parallel automation tree.

---

## 20. Implementation Handoff

**Sprint 05 planning is complete** when this document’s header `Status` is set to **Approved**.

### What happens next

1. **After Sprint 05 is approved, implementation begins** — and only then.  
2. **No implementation should occur before approval** of this specification.  
3. Implement strictly within §4; honour §4.3; follow §5 repository impact.  
4. **Sprint 06 (AI Features) cannot begin** until Sprint 05 satisfies §17.  
5. Do not treat chat history as authoritative over this contract once Approved.

### Implementation contract summary

| Allowed | Forbidden |
|---|---|
| Repeater depth; relation conditionals; cross-applicant matrix; max-4; multi-row draft; J07/J08/J19/J20; smoke/critical; Gap Analysis | Inventing shared/individual address UI; requiring min≥1 joint; PDF/Voice/Advisor; one-test-per-nested-field spam; redesigning Sprint 00–04 |

### App behaviour anchors (for implementers)

| Behaviour | Live app fact |
|---|---|
| Route | `/forms/joint-family-account` |
| Title | `Joint / Family Account Builder` |
| Submit | `Submit Joint Application` → `JOINT*` |
| Repeater | `jointApplicants` · min 0 · max 4 |
| Add / Remove | `Add Another Applicant` / `Remove Applicant` |
| Row label | `Applicant {{index}}` (1-based) |
| Nested id | `jointApplicants-{n}-{childKey}` |
| Address | Primary `address` only (**Residential Address**) |
| Drafts | `ff_form_drafts` · 600 ms debounce · clear on submit |

---

## Document control

| Role | Name | Date | Decision |
|---|---|---|---|
| Author | Automation Architect (Cursor) | 2026-07-20 | Spec Approved → Implementation **Done** |
| Reviewer | Engineering | 2026-07-20 | Implementation complete; awaiting Sprint Review sign-off |

**Next:** Engineering review of this Completion Report.  
**After Sprint 05 DoD sign-off:** Author `SPRINT-06-AI-FEATURES.md` (Specification Mode only — no Sprint 06 implementation yet).
