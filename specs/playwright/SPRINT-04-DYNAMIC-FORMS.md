# Sprint 04 — Dynamic Forms

**Document Type:** Sprint Specification  
**Project:** FormFlow Playwright Automation  
**Sprint:** 04 — Dynamic Forms  
**Version:** 1.0  
**Status:** Done  
**Parent Document:** [03-IMPLEMENTATION-ROADMAP.md](./03-IMPLEMENTATION-ROADMAP.md) (Approved)  
**Depends on:**  
[SPRINT-00-FOUNDATION.md](./SPRINT-00-FOUNDATION.md) (Done) ·  
[SPRINT-01-AUTHENTICATION.md](./SPRINT-01-AUTHENTICATION.md) (Done) ·  
[SPRINT-02-LANDING-NAVIGATION.md](./SPRINT-02-LANDING-NAVIGATION.md) (Done) ·  
[SPRINT-03-WORKSPACE.md](./SPRINT-03-WORKSPACE.md) (Done)  
**Authoritative foundation:**  
[README.md](./README.md) · [00-AUTOMATION-ARCHITECTURE.md](./00-AUTOMATION-ARCHITECTURE.md) · [01-IMPLEMENTATION-SPEC.md](./01-IMPLEMENTATION-SPEC.md) · [02-PROJECT-STRUCTURE.md](./02-PROJECT-STRUCTURE.md)  
**Product contracts:**  
[`../001-formflow/spec.md`](../001-formflow/spec.md) · [`../001-formflow/schema-contract.md`](../001-formflow/schema-contract.md)

**Code:** None in this document. Implementation begins only after this sprint specification is **Approved**.

**Traceability:** Primary AUT IDs — `AUT-FORM-01` … `AUT-FORM-08`, `AUT-REN-01` … `AUT-REN-06` ([01-IMPLEMENTATION-SPEC.md](./01-IMPLEMENTATION-SPEC.md) §14.4). Reuses `AUT-AUTH-*`, `AUT-NAV-*`, `AUT-WS-05` (draft continue). Joint **depth** (`AUT-JOINT-*`) remains Sprint 05. PDF / Voice / Advisor panels remain Sprint 06 (presence may be ignored; do not automate Smart Assist / Voice / Gemini).

---

## 1. Sprint overview

| Field | Statement |
|---|---|
| **Sprint goal** | Automate FormFlow’s **schema-driven Dynamic Form engine**: FormHost schema load, DynamicForm rendering, field-type behaviour, validation, conditional visibility, draft autosave/restore, multi-scenario switching, submit success (including draft clear), schema robustness, and realistic form journeys — on the Sprint 00–03 foundation. |
| **Business objective** | Prove that the configurable form engine correctly loads schemas, renders controls, enforces validation, applies conditional logic, persists drafts, and completes realistic banking submissions without per-field page-object explosion. |
| **Engineering objective** | Establish the `forms/` Playwright module with **FormHost + DynamicForm (field-key API)** + scenario data packs; deliver reusable parameterized suites (~70–100 meaningful tests); honour draft debounce waits; deliver `@smoke` / `@critical` / `@forms` / `@renderer` coverage — **without** joint-account depth, AI/PDF/voice automation, or a11y/perf/visual suites. |
| **Expected outcome** | All five scenario happy submits green; validation / field-type / schema / journey matrices green; draft lifecycle proven end-to-end; AUT-FORM / AUT-REN mapped; Coverage Gap Analysis delivered; PR gate includes forms smoke (at least one submit) + critical path. |

---

## 2. Business objective

Customers complete banking workflows through **one reusable renderer** driven by bundled schemas. Automation must prove:

- Valid scenario ids load and render FormHost + DynamicForm successfully.  
- Missing / unknown / invalid schema conditions surface correct error states.  
- Supported field types render, accept input, and participate in validation/submit.  
- Required, pattern, length, age, min/max, and consent validators show schema-configured messages.  
- Optional fields do not block submit when empty.  
- Conditional (`visibleWhen`) fields show/hide correctly and are excluded from submit when invisible/hidden.  
- Hidden / readonly / disabled behaviours match product rules.  
- Draft autosave (debounce) and restore (Continue from workspace + in-form hydrate) work.  
- Successful submit creates an application (`ACC*` / `LOAN*` / `CARD*` / `SUP*` / `JOINT*` prefix), clears the draft, and offers workspace follow-through.  
- Switching between scenarios rebuilds form state without cross-contamination.  
- Multi-step user journeys (open → fill → validate → draft → resume → submit) remain coherent.  

Success is measured by **behavioural proof of the form engine**, not by one isolated test per schema field label.

---

## 2.1 Enterprise automation expectations (binding)

Dynamic Forms automation **prioritizes behavioural coverage over requirement coverage**.

### Must include

| Pattern | Intent |
|---|---|
| End-to-end user journeys | Open → fill → validate → draft → resume → submit → application proof |
| Validation matrices | Required / pattern / age / consent parameterized — not copy-pasted specs |
| Field-type matrices | One reusable DynamicForm API exercised across types via data packs |
| Schema matrices | Five scenarios + missing/unknown/invalid robustness |
| Boundary values | Empty, min/max length, age edges, future dates, invalid email/mobile patterns |
| Negative testing | Submit blocked; messages visible; no false success panel |
| Stateful draft lifecycle | Autosave after debounce; restore; clear-on-submit |
| Multi-form / multi-scenario | Switch scenarios; isolation of drafts by `formType` |
| Data-driven testing | Scenario packs drive happy paths; matrices drive validation rows |
| Regression-oriented smoke/critical | Durable PR-gate submits and draft resume |

### Must avoid

- One test per field / per label / per AUT id when a matrix or journey covers the behaviour.  
- Five scenario-specific page objects that re-declare every field.  
- Duplicated fill/setup blocks — use DynamicForm + workflows + data packs.  
- Thin “field is visible” spam without interaction, validation, or submit outcome.  
- Automating PDF Smart Assist, Voice Assist, or live Gemini inside form suites.

### Expected suite size

| Metric | Target |
|---|---|
| Meaningful forms/renderer tests | **Approximately 70–100** (or more if justified by matrices/journeys) |
| Composition | Parameterized validation/field/schema rows + reusable journeys |
| Counting rule | Each parameterized row counts as a test; multi-assert journeys count as **one** test |

### Coverage Gap Analysis (mandatory deliverable)

At the end of Sprint 04 **implementation**, provide a **Coverage Gap Analysis** documenting:

1. In-scope form-engine behaviours intentionally left unautomated and **why**.  
2. Behaviours blocked by product constraints (e.g. no user-facing Reset; no `radio` type).  
3. Behaviours deferred to Sprint 05+ (joint depth, AI panels, prefill from advisor/PDF/voice).  
4. Residual risk accepted for PR gate vs nightly/regression.

The gap analysis is part of Sprint 04 Definition of Done.

---

## 3. Engineering objective

- Populate `frontend/e2e/forms/` per [02-PROJECT-STRUCTURE.md](./02-PROJECT-STRUCTURE.md).  
- Implement **FormHost page** + **DynamicForm component** (field-key API) + thin PrimeNG helpers (shared or forms-owned) for select / multiselect / datepicker / checkbox.  
- Drive **all five scenarios** through one DynamicForm API + per-scenario **data packs** — no per-field PO explosion.  
- Reuse Sprint 00 adapter (`WORKSPACE_STORAGE_KEYS.drafts`, applications, activities), draft debounce util (~**600 ms** + documented buffer), `ROUTES`, `SCENARIO_IDS`, `APPLICATION_ID_PREFIX`, tags.  
- Reuse Sprint 01 `authenticatedUser` / `loginAs`.  
- Reuse Sprint 02–03 shell/workspace entry for catalog Open Form, Continue Draft, and post-submit View application.  
- Prefer stable hooks: `field.key` as control `id`/`name`, `.formflow-field*`, `role="alert"` errors, schema `submitLabel`, FormHost chrome.  
- Prefer **workflows assertion-free**; assertions only in specs.  
- Do **not** invent Joint repeater depth automation beyond the Sprint 04 happy-submit / light renderer seam required by AUT-FORM-05 / AUT-REN-05–06 **minimum** (see §4.3).  
- Do **not** automate PDF / Voice / Advisor panels (ignore or dismiss presence).

---

## 4. Scope

### 4.1 In scope

| Area | Notes |
|---|---|
| Schema loading | Valid bundled ids; load success chrome / readiness |
| Dynamic rendering | FormHost + DynamicForm for all five scenarios |
| Field visibility | Visible vs `visibleWhen` false vs `hidden: true` |
| Required validation | Required empty → message; submit blocked |
| Optional fields | Empty optional does not block submit |
| Text inputs | Including email/mobile **as `text` + pattern** (see §4.3) |
| Email behaviour | Pattern + messages on email-shaped text fields |
| Mobile behaviour | 10-digit Indian mobile pattern + messages |
| Date pickers | DOB / transaction dates; future-date / age rules where configured |
| Dropdowns | PrimeNG select; placeholder / option selection |
| Radio buttons | **Product has no `radio` type** — cover equivalent exclusive choice via **dropdown** (document in Gap Analysis) |
| Checkboxes | Consent / boolean; required consent blocks submit |
| Textareas | Render + input + length rules where configured |
| Multiselect | Account-opening `services` (and any other bundled multiselect) |
| Conditional rendering | Credit-card branches; support category paths (`AUT-FORM-07/08`, `AUT-REN-03`) |
| Hidden fields | Not rendered; excluded from submission |
| Disabled fields | Renderer supports `disabled`; cover via schema flag / fixture if no bundled sample |
| Read-only fields | `aria-readonly` / readOnly; validation suppressed; credit-card / support samples |
| Validation messages | Schema `messages.*` visible via `role="alert"` when touched or submitted |
| Form reset | **No user Reset control** — cover **schema-switch rebuild** as reset behaviour (see §4.3) |
| Draft save | Autosave after debounce to `ff_form_drafts` |
| Draft restore | In-form hydrate + Workspace Continue → values restored |
| Multi-scenario switching | Navigate between scenario routes; state isolation |
| LocalStorage persistence | Adapter/read helpers for drafts + post-submit applications |
| Invalid schema handling | Root-invalid path as product allows (see §4.3 / Schema Matrix) |
| Missing schema handling | Unknown / blank scenario id error copy |
| Unknown field types | Unsupported `type` not rendered (control may still exist) — robustness case |
| Error states | Validation + schema load errors; no false success |
| User journeys | J-DF-* matrix (§15) |
| Smoke | Tagged `@smoke` forms path (includes at least one submit) |
| Critical flows | Draft resume → submit; conditional happy path |

### 4.2 Out of scope

| Area | Deferred to |
|---|---|
| Joint Account depth (repeater max, minor/spouse/parent, cross-applicant duplicates) | Sprint 05 |
| Advisor chat, scoring, roadmap, recommendation **prefill field asserts** from live AI | Sprint 06 |
| Voice Assistant panel / mock transcript | Sprint 06 |
| PDF Smart Assist / autofill / conflicts | Sprint 06 |
| Accessibility / performance / visual / responsive suites | Sprints 07–08 |
| Full cross-feature bank-day regression (J17 etc.) | Sprint 08 |
| Re-building Auth / Nav / Workspace widget matrices | Sprints 01–03 (reuse) |

### 4.3 Product constraints (binding for implementers)

| Topic | Live app fact | Sprint 04 treatment |
|---|---|---|
| **Field type system** | Supported: `text`, `textarea`, `date`, `dropdown`, `multiselect`, `checkbox`, `repeater`, `file`. **No** dedicated `email`, `mobile`, or `radio` types | Automate email/mobile as **text + pattern**. Map “radio” intent to **dropdown** exclusive choice. Multiselect is first-class. |
| **Schemas** | TypeScript bundled schemas (`BUNDLED_SCHEMAS`), not loose runtime JSON files | Treat scenario ids as schema ids; do not invent parallel JSON fixtures that the app cannot load unless a documented test harness is added |
| **Form reset** | No user-facing Reset/Clear Form; `resetFormState` runs on schema input change | Automate **multi-scenario switch** / re-entry as reset; do not invent a Reset button |
| **Draft clear** | No Delete Draft UI; draft cleared on **successful submit** | Automate clear-on-submit (closes Sprint 03 gap) |
| **Draft debounce** | **600 ms** autosave; skips empty/meaningless payloads; suppressed during hydrate/prefill and after submit | Specs must wait debounce + buffer before storage asserts |
| **Hydration order** | Profile prefill → advisor prefill → draft (draft last) | Sprint 04 owns **draft restore**; profile/advisor prefill depth is light/optional — full AI prefill = Sprint 06 (`AUT-ADV-03`) |
| **Joint scenario** | Fifth catalog scenario with repeater/file/cross-applicant | **Happy submit only** (+ minimal AUT-REN-05/06 seam if required). Full joint = Sprint 05 |
| **Smart Assist / Voice** | Panels present on form host (Voice on support) | Ignore; do not open/upload/chat |
| **Invalid schema** | Loader returns `not-found` / `invalid` with exact messages; bundled catalog is normally valid | Prefer unknown scenario id + blank id paths; full root-invalid injection only if implementable without production hacks — else document in Gap Analysis |
| **Unknown field type** | `@switch` has no default → control may exist but UI not rendered | One robustness case; do not require production schema change |
| **Application IDs** | Prefixes `ACC`, `LOAN`, `CARD`, `SUP`, `JOINT` | Assert **prefix**, not counters |
| **Submit success UI** | Renderer success copy + host “Application saved as {id}…” + View application | Assert both seams as implemented |

---

## 5. Deliverables

| Deliverable | Description (no code in this doc) |
|---|---|
| FormHost page object | Route chrome, schema summary, load error states, submit success host banner, Back to Workspace, View application |
| DynamicForm component | Field-key API: fill / clear / check / select / setDate / expectVisible / expectError; no per-schema field lists in pages |
| PrimeNG helpers | Shared or forms-owned select / multiselect / datepicker / checkbox helpers |
| Forms workflows | Open scenario, fill from pack, submit, draft wait, resume from workspace, switch scenario |
| Forms fixtures | Authenticated form user; optional draft-bearing / profile-prefill personas — merge into shared `test` |
| Scenario data packs | Happy + invalid matrices per scenario under `forms/data/` |
| Specs | Renderer specs + per-scenario specs + journey/draft/persistence suites |
| Tags | `@forms`, `@renderer`, `@smoke`, `@critical`, `@happy`, `@negative`, `@boundary` |
| Traceability | Map suites to `AUT-FORM-*` / `AUT-REN-*` |
| Coverage Gap Analysis | Written at implementation end |
| Docs touch | `forms/README` — how to run forms smoke/critical; link gap analysis |

---

## 6. Repository impact

### 6.1 Paths to populate

```text
frontend/e2e/forms/
  pages/            # form-host.page
  components/       # dynamic-form, (thin) repeater seam if needed for happy joint
  workflows/        # open, fill, submit, draft, switch
  fixtures/         # personas → merge shared/fixtures
  data/             # packs per scenario + shared validation tables
  specs/
    renderer/       # load, types, visibility, validators, robustness
    account-opening/
    loan-inquiry/
    smart-credit-card/
    customer-support/
    joint-family-account/   # happy + light only
  joint/            # OPTIONAL stub only — depth Sprint 05
```

### 6.2 Reuse (do not fork)

| Asset | Sprint 04 use |
|---|---|
| Sprint 00 adapter + keys + draft wait util | Seed/read drafts & applications; debounce |
| Sprint 01 auth fixtures | Session baseline |
| Sprint 02–03 shell / workspace | Catalog entry, Continue Draft, View application |
| `ROUTES.form`, `SCENARIO_IDS`, prefixes | Route and ID expectations |
| Shared fixtures merge | Single `test` export |

### 6.3 Must not change

- Hybrid module architecture or Sprint 00–03 contracts except additive helpers.  
- Auth / nav / workspace acceptance behaviour.  
- Introduction of PDF/Voice/Advisor automation.  
- Per-field page objects for each schema field.

---

## 7. Forms Page Objects & Components

Identify only — no classes/locators in this document.

| Asset | Surface | Owns |
|---|---|---|
| `FormHostPage` | `/forms/:scenarioId` | Schema load readiness / error banners; title; Back to Workspace; host submit success; View application |
| `DynamicForm` (component) | Renderer | Field-key interactions; visibility/error queries; submit click by `submitLabel` |
| `Repeater` (thin, optional) | Joint only | Minimal add/remove if required for AUT-FORM-05 happy path — **not** full AUT-JOINT suite |
| `PortalShellPage` / `DashboardPage` (existing) | Chrome / workspace | Entry and post-submit follow-through |

**Rules:** Extend `BasePage` where applicable; DynamicForm is **data-driven**; no assertions in pages/components; no Smart Assist / Voice APIs.

---

## 8. Forms Workflows

| Workflow | Steps (conceptual) | Assertions? |
|---|---|---|
| `openFormScenario` | Auth context → `/forms/{id}` ready (or error state) | No |
| `fillFormFromPack` | DynamicForm fills keys from pack | No |
| `submitForm` | Click schema submit label | No |
| `waitForDraftPersistence` | Debounce + buffer; optional storage read via adapter | No |
| `resumeDraftFromWorkspace` | Dashboard Continue → form ready with hydrate | No |
| `submitAndOpenApplication` | Submit → View application → detail ready | No |
| `switchScenario` | Navigate to another scenario route → ready | No |

Workflows compose pages/components only; return ids/titles useful to specs.

---

## 9. Forms Fixtures

| Fixture / persona | Mechanism | When to use |
|---|---|---|
| `authenticatedUser` | Sprint 01 | Baseline form sessions |
| `formUser` (illustrative) | Auth + clean drafts for target scenario | Happy / validation |
| `draftFormUser` | Auth + seeded or UI-created draft for scenario | Resume journeys |
| `profilePrefillUser` (optional) | Auth + profile seed overlapping form keys | Light prefill checks |
| Merge | `forms/fixtures` → `shared/fixtures/index.ts` | Single entry point |

**Rule:** Prefer UI fill when the subject is the **form engine**. Prefer adapter draft seed when proving **restore** without re-typing entire packs — but at least one journey must prove **UI autosave → restore**.

---

## 10. Forms Test Data

| Pack | Contents |
|---|---|
| Scenario happy packs | Minimal valid values for each of five scenario ids |
| Validation rows | Field key, invalid value, expected message, scenario id |
| Conditional packs | Credit-card employment branches; support request types |
| Draft packs | Partial valid progress suitable for autosave |
| Boundary rows | Age 17/18, future DOB, short/long strings, bad email/mobile |
| Schema robustness | Unknown scenario id; blank id if reachable; notes for invalid root |
| Expected submit labels | Per scenario (`Submit Application`, `Submit Inquiry`, etc.) |
| Application prefixes | `ACC`, `LOAN`, `CARD`, `SUP`, `JOINT` |

No production PII. No live Gemini payloads. No PDF fixtures (Sprint 06).

---

## 11. Forms Test Strategy

### 11.1 Design principles

| Principle | Practice |
|---|---|
| Behaviour over requirements | Journeys + matrices prove engine behaviour |
| One DynamicForm API | All scenarios share field-key API |
| Data-driven matrices | Validation / field-type / schema rows parameterized |
| Boundary honesty | Assert user-visible outcomes and storage via adapter |
| Draft stateful clarity | Explicit debounce waits; no racey immediate storage reads |
| Joint restraint | Happy path only; depth Sprint 05 |
| Ignore AI chrome | Do not open Smart Assist / Voice |
| Minimize duplication | Packs + workflows; ban copy-paste fills |

### 11.2 Anti-patterns (reject in review)

- `it('shows full name field')` with no interaction/outcome.  
- Five nearly identical scenario POs listing every key.  
- Separate specs for each validation message that differ only by data (use table).  
- Asserting PDF/Voice behaviour inside `@forms`.  
- Full joint duplicate/max-applicant suite in this sprint.

### 11.3 Suite shape (target ~70–100)

| Cluster | Approx. tests | Behaviour focus |
|---|---|---|
| Schema load / robustness | 6–10 | Valid load; missing; unknown; invalid/unknown-type as feasible |
| Field-type matrix | 10–14 | text/textarea/date/dropdown/multiselect/checkbox (+ email/mobile patterns) |
| Validation matrix | 14–20 | Required, pattern, age, future date, consent, optional |
| Conditional / visibility | 10–14 | Credit branches; support categories; hidden exclusion |
| Draft lifecycle | 8–12 | Autosave, restore, clear-on-submit, multi-scenario isolation |
| Happy submits (5 scenarios) | 5–8 | AUT-FORM-01…05 (+ smoke overlap OK) |
| Multi-scenario / reset-equivalent | 4–6 | Switch rebuild; no cross-draft bleed |
| User journeys | 8–12 | J-DF-* composites |
| Smoke / critical | 4–6 | PR-gate durability |
| **Total** | **~70–100** | Prefer matrices + journeys over widget spam |

### 11.4 Mapping rule

Avoid a separate test file per AUT id. Map **multiple behaviours per journey/matrix row** to AUT ids in titles/tags. Requirement coverage is a **traceability byproduct**.

---

## 12. Field Type Matrix

Parameterize; do **not** create one test per field instance across schemas.

| Type / behaviour | How product expresses it | Automation intent | AUT |
|---|---|---|---|
| Text | `type: 'text'` | Render, fill, clear, required/pattern | AUT-REN-02, AUT-REN-04 |
| Email | `text` + email pattern/messages | Valid/invalid email messages | AUT-REN-04 |
| Mobile | `text` + 10-digit mobile pattern | Valid/invalid mobile messages | AUT-REN-04 |
| Textarea | `textarea` | Render + input | AUT-REN-02 |
| Date | `date` + datepicker | Set date; age/future rules | AUT-REN-02/04 |
| Dropdown | `dropdown` | Select option; required empty | AUT-REN-02 |
| Radio (requested) | **N/A — use dropdown** | Document Gap; cover exclusive choice via dropdown | — |
| Checkbox | `checkbox` | Toggle; required consent | AUT-REN-02, AUT-FORM-06 |
| Multiselect | `multiselect` | Select options (account-opening) | AUT-REN-02 |
| Hidden | `hidden: true` | Not visible; excluded from submit payload/UI | AUT-REN-03 |
| Readonly | `readonly: true` | Not editable; no validation spam | AUT-REN-02 |
| Disabled | `disabled: true` | Not editable (fixture/schema as available) | AUT-REN-02 |
| Repeater / file | Joint only | Minimal for happy submit; depth Sprint 05 | AUT-FORM-05, AUT-REN-05/06 light |

---

## 13. Validation Matrix

Drive via data table rows (scenario + field key + input + expected message / blocked submit). Representative intents — packs supply exact schema messages:

| Row class | Example intent | Expectation |
|---|---|---|
| V-REQ | Required text/email/mobile empty on submit | Schema required message; no success |
| V-EMAIL | Invalid email pattern | `'Enter a valid email address'` (or schema message) |
| V-MOBILE | Invalid mobile | `'Enter a valid 10-digit Indian mobile number'` (or schema message) |
| V-AGE | DOB under 18 where configured | Age message |
| V-FUTURE | Future DOB / transaction date | Future-date message |
| V-CONSENT | Required checkbox unchecked | Consent/terms message |
| V-OPT | Optional empty | Submit still succeeds when other requireds valid |
| V-LEN | minLength / maxLength where configured | Length message |
| V-TOUCH | Invalid after blur/touch without submit | Message when touched **or** after submit (product rule) |

Cover **AUT-FORM-06** and **AUT-REN-04** through this matrix — not one-off widget tests.

---

## 14. Schema Matrix

| Case | Scenario / id | Expectation | AUT |
|---|---|---|---|
| S-OK | Each of five `SCENARIO_IDS` | Schema loads; form renders; title/submitLabel match | AUT-REN-01 |
| S-MISS | Unknown scenario id | Not-found / catalog error copy as implemented | AUT-REN-01 |
| S-BLANK | Blank/missing id if reachable | Blank-id error copy | AUT-REN-01 |
| S-INVALID | Root-invalid schema | Invalid banner + helper copy **if harness available**; else Gap | AUT-REN-01 |
| S-UNKNOWN-TYPE | Unknown field type (harness/fixture) | Field UI not rendered; form remains otherwise usable | robustness |
| S-SWITCH | A → B scenario navigation | Form rebuilds for B; A draft isolated by `formType` | multi-scenario |
| S-JOINT-LIGHT | `joint-family-account` | Happy submit only; no full joint matrix | AUT-FORM-05 |

Exact error strings (product):

- `"No form schema identifier was provided."`  
- `"No bundled form schema was found for id \"{schemaId}\"."`  
- `"The requested form scenario \"{id}\" was not found in the scenario catalog."`  
- Root missing property messages for `id` / `title` / `fields`  
- Helper: `"The form cannot be rendered until the schema configuration is corrected."`  
- Success load: `"Form schema loaded successfully for scenario {id}."`

---

## 15. User Journey Matrix

| Journey | Steps (compose) | Behaviours combined | AUT |
|---|---|---|---|
| J-DF-A Open & complete | Catalog/Open Form → fill happy pack → submit → application prefix | Happy engine path | AUT-FORM-01…05 |
| J-DF-B Validation gate | Open → submit empty → messages → correct → submit success | Negative + recovery | AUT-FORM-06 |
| J-DF-C Draft pause | Fill partial → wait debounce → leave → Continue → values restored → complete | Draft lifecycle | AUT-REN + AUT-WS-05 |
| J-DF-D Clear on submit | Draft exists → submit success → draft gone in storage/UI | Clear-on-submit | draft + AUT-WS-05 |
| J-DF-E Credit branch | Employment status branches → visible fields → submit `CARD*` | Conditionals | AUT-FORM-07, AUT-REN-03 |
| J-DF-F Support path | Request type category → category fields → submit `SUP*` | Conditionals | AUT-FORM-08 |
| J-DF-G Multi-scenario | Start A → switch to B → fill B → confirm A draft untouched | Isolation / reset-equivalent | multi-scenario |
| J-DF-H Boundary reject | Bad email/mobile/age → blocked → fix → submit | Boundaries | AUT-REN-04 |
| J-DF-I Workspace round-trip | Submit → View application → back to workspace → stats/apps coherent | Cross-feature | AUT-FORM + AUT-WS |
| J-DF-J Regression slice | Smoke: one happy submit; Critical: draft resume → submit | PR gate | subset |

Full joint multi-applicant / minor / duplicate journeys remain Sprint 05. PDF/Voice/Advisor hydration journeys remain Sprint 06 / 08.

---

## 16. Positive scenarios

| ID | Scenario | AUT |
|---|---|---|
| F01 | Valid schema loads for each scenario id | AUT-REN-01 |
| F02 | Field types render and accept input (matrix) | AUT-REN-02 |
| F03 | Happy submit `account-opening` → `ACC*` | AUT-FORM-01 |
| F04 | Happy submit `loan-inquiry` → `LOAN*` | AUT-FORM-02 |
| F05 | Happy submit `smart-credit-card` → `CARD*` | AUT-FORM-03 |
| F06 | Happy submit `customer-support` → `SUP*` | AUT-FORM-04 |
| F07 | Happy submit `joint-family-account` → `JOINT*` (light) | AUT-FORM-05 |
| F08 | Credit-card conditional branch completes | AUT-FORM-07 |
| F09 | Support category path completes | AUT-FORM-08 |
| F10 | Optional fields empty still allow submit | AUT-FORM-06 subset |
| F11 | Hidden fields excluded from submission UX | AUT-REN-03 |
| F12 | Draft autosave after debounce | persistence |
| F13 | Draft restore via Continue | AUT-WS-05 + forms |
| F14 | Submit clears draft | persistence |
| F15 | Smoke: one scenario submit end-to-end | smoke |

---

## 17. Negative scenarios

| ID | Scenario | Expectation |
|---|---|---|
| F16 | Submit with required empty | Messages; no success panel; no application |
| F17 | Invalid email / mobile / age / future date | Schema messages; submit blocked |
| F18 | Required consent unchecked | Consent message; blocked |
| F19 | Unknown scenario id | Schema/catalog error state |
| F20 | Invalid / blank schema id paths | Error copy as implemented |
| F21 | Invisible conditional fields | Not shown; not required until visible |

---

## 18. Edge cases

| Case | Expectation |
|---|---|
| Debounce timing | Storage assert only after 600ms + buffer |
| Meaningless form (all empty) | Autosave may skip — do not falsely require draft key |
| Readonly fields | Not editable; do not expect validation errors on them |
| Disabled fields | Not editable when present |
| Scenario switch mid-draft | Each `formType` draft isolated |
| Application id counters | Assert prefix only |
| Support status | Application may be `'Under Review'` vs `'Submitted'` for others |
| Unknown field type | UI absent for that type; no crash |
| Joint max/duplicates | **Out of scope** (Sprint 05) |

---

## 19. Data strategy

| Concern | Approach |
|---|---|
| Mock backend | localStorage via `DataSetupAdapter` |
| Scenario packs | Immutable builders per scenario id |
| Draft keying | `userId` + `formType` must match authenticated user |
| Debounce | Shared wait helper; document buffer |
| Prefill | Draft overwrite wins; do not assert advisor/PDF prefill depth |
| Reads | Adapter-backed helpers; no raw `setItem` in specs |
| Parallelism | Unique users/emails per test |
| PrimeNG | Shared helpers to reduce overlay flake |

---

## 20. Acceptance Criteria

Sprint 04 implementation is acceptable when **all** are true:

1. `forms/` pages, components (DynamicForm), workflows, fixtures, data, and specs exist per §5–§11.  
2. Sprint 00–03 reused; Authentication, Navigation, Workspace, and Harness suites remain green.  
3. Suite demonstrates **behaviour-first** design per §2.1 (matrices/journeys; no one-test-per-field).  
4. Approximately **70–100** meaningful forms/renderer tests delivered (or more if justified).  
5. Field Type Matrix, Validation Matrix, Schema Matrix, and Journey Matrix J-DF-A…J represented.  
6. All five scenario happy submits green (`AUT-FORM-01`…`05`).  
7. Validation failures visible and blocking (`AUT-FORM-06`); credit + support conditionals covered (`AUT-FORM-07/08`).  
8. Renderer behaviours `AUT-REN-01`…`04` covered; `AUT-REN-05/06` covered at **light** joint seam or explicitly deferred in Gap Analysis with rationale.  
9. Draft autosave, restore, and clear-on-submit covered with debounce-safe waits.  
10. Multi-scenario switching / reset-equivalent covered.  
11. Missing/unknown schema error paths covered; invalid/unknown-type handled or gap-documented.  
12. At least one `@smoke` forms submit and one `@critical` draft-resume→submit journey.  
13. **Coverage Gap Analysis** published (including radio→dropdown mapping and Reset absence).  
14. No Joint depth / AI / Voice / PDF / a11y / perf automation.  
15. Specs tagged `@forms` / `@renderer` as applicable.  
16. DynamicForm API used for all scenarios — **no per-field PO explosion**.  
17. Code review against foundation + this contract complete.

---

## 21. Definition of Done

Sprint 04 is **complete** when:

1. This specification is **Approved**.  
2. Implementation satisfies §20 Acceptance Criteria (including suite-size intent and Coverage Gap Analysis).  
3. Sprint Review completed and recorded.  
4. `specs/playwright/README.md` updated to Sprint 04 Done.  
5. No open P0 forms-engine automation defects blocking Sprint 05.  
6. Team authorized to author `SPRINT-05-JOINT-ACCOUNT.md` next.  
7. **Sprint 05 must not begin implementation** until this Definition of Done is met.

---

## 22. Risks

| Risk | Mitigation |
|---|---|
| PrimeNG overlay flake | Shared helpers; stable waits; avoid brittle overlays |
| Per-field PO explosion | Enforce DynamicForm + packs in review |
| Draft debounce races | Mandatory wait helper; no immediate storage asserts |
| Sliding into Joint sprint | Hard stop after light happy submit |
| Sliding into AI sprint | Ignore Smart Assist / Voice |
| Invalid schema untestable in E2E | Prefer not-found paths; Gap Analysis for harness gaps |
| Radio / Reset expectation mismatch | §4.3 product constraints; Gap Analysis |
| Inflating suite with presence-only tests | Enforce §2.1 / §11.2 |
| Undershooting matrices | Target 70–100 via parameterized rows |

---

## 23. Sprint dependencies

| Dependency | Required for Sprint 04 |
|---|---|
| Sprint 00 | Adapter, keys, tags, draft wait, config, CI |
| Sprint 01 | Authenticated session |
| Sprint 02–03 | Shell entry, Continue Draft, View application, workspace storage |
| Bundled schemas + FormHost + DynamicForm | Product under test |
| schema-contract + product spec | Message and type authority |

Sprint 04 **must not** re-initialize Playwright or invent a parallel tree.

---

## 24. Coverage Gap Analysis (specification placeholder)

**Implementation must replace this placeholder** with the final Sprint 04 Gap Analysis. Anticipated gaps (pre-implementation):

| Anticipated gap | Why |
|---|---|
| Native `radio` field type | Not in product `FieldType` — covered via dropdown |
| User-facing Form Reset | Not in product — covered via scenario switch rebuild |
| Full invalid root schema injection | May need harness; not-found paths are mandatory |
| Full joint depth / cross-applicant | Sprint 05 |
| PDF / Voice / Advisor prefill depth | Sprint 06 |
| Disabled field in bundled schemas | May need test-only schema/harness |
| Live Gemini / speech | Out of scope forever for default CI |

---

## 25. Implementation Handoff

**Sprint 04 planning is complete** when this document’s header `Status` is set to **Approved**.

### What happens next

1. **After Sprint 04 is approved, implementation begins** — and only then.  
2. **No implementation should occur before approval** of this specification.  
3. Implement strictly within §4 In Scope; honour §4.3 product constraints; follow §6 repository impact.  
4. **Sprint 05 (Joint Account) cannot begin** until Sprint 04 satisfies §21.  
5. Do not treat chat history as authoritative over this contract once Approved.

### Implementation contract summary

| Allowed | Forbidden |
|---|---|
| FormHost + DynamicForm + packs; five happy submits; validation/field/schema matrices; draft lifecycle; conditionals; smoke/critical; Gap Analysis | One-test-per-field spam; joint depth; PDF/Voice/Advisor automation; inventing Reset/Radio UI; a11y/visual/perf suites; redesigning Sprint 00–03 |

### App behaviour anchors (for implementers)

| Behaviour | Live app fact |
|---|---|
| Form route | `/forms/:scenarioId` (`app-form-host`) |
| Schemas | Bundled TS `BUNDLED_SCHEMAS` |
| Types | text, textarea, date, dropdown, multiselect, checkbox (+ repeater/file joint) |
| Drafts | `ff_form_drafts`; debounce **600 ms**; clear on submit |
| Errors | `.formflow-field-error` + `role="alert"` |
| Success | Renderer status + host “Application saved as …” |
| Entry | Catalog Open Form; Workspace Continue; deep link |

---

## 26. Exit criteria (specification)

This sprint specification may be marked **Approved** when reviewers confirm:

1. Overview, objectives, §2.1 enterprise expectations, and scope (including §4.3) are accepted.  
2. Field Type, Validation, Schema, and Journey matrices are sufficient.  
3. Acceptance Criteria (incl. Coverage Gap Analysis) and Definition of Done are testable.  
4. Sprint 00–03 reuse rules and DynamicForm-no-PO-explosion rule are binding.  
5. Implementation Handoff (§25) is accepted.

---

## Document control

| Role | Name | Date | Decision |
|---|---|---|---|
| Author | Automation Architect (Cursor) | 2026-07-20 | In Review (v1.0 — Dynamic Forms enterprise contract) |
| Reviewer | Product / Automation | 2026-07-20 | **Approved** for implementation |
| Implementer | Automation Engineer (Cursor) | 2026-07-20 | **Done** — Forms suite green; Auth/Nav/Workspace/Harness regression green |

**Next after Sprint 04 DoD:** Author `SPRINT-05-JOINT-ACCOUNT.md` (Specification Mode). Do **not** begin Sprint 05 implementation until that spec is Approved.
