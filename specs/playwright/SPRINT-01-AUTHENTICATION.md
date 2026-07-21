# Sprint 01 — Authentication

**Document Type:** Sprint Specification  
**Project:** FormFlow Playwright Automation  
**Sprint:** 01 — Authentication  
**Version:** 1.0  
**Status:** Done  
**Parent Document:** [03-IMPLEMENTATION-ROADMAP.md](./03-IMPLEMENTATION-ROADMAP.md) (Approved)  
**Depends on:** [SPRINT-00-FOUNDATION.md](./SPRINT-00-FOUNDATION.md) (Approved & implemented)  
**Authoritative foundation:**  
[README.md](./README.md) · [00-AUTOMATION-ARCHITECTURE.md](./00-AUTOMATION-ARCHITECTURE.md) · [01-IMPLEMENTATION-SPEC.md](./01-IMPLEMENTATION-SPEC.md) · [02-PROJECT-STRUCTURE.md](./02-PROJECT-STRUCTURE.md)

**Code:** None in this document. Implementation begins only after this sprint specification is **Approved**.

**Traceability:** Primary AUT IDs — `AUT-AUTH-01` … `AUT-AUTH-10` ([01-IMPLEMENTATION-SPEC.md](./01-IMPLEMENTATION-SPEC.md) §14.1). Related journey seeds: `J01`, `J02`, `J15`, `J16` (full journey suite remains Sprint 08).

---

## 1. Sprint overview

| Field | Statement |
|---|---|
| **Sprint goal** | Automate FormFlow **Authentication** end-to-end on the Sprint 00 Playwright foundation: landing entry to login/register, registration, login, logout, session persistence, route guards, error handling, and mock-backend / localStorage verification. |
| **Business objective** | Prove customers can safely enter the portal, create accounts, sign in/out, and that unauthenticated users cannot reach protected banking routes. |
| **Engineering objective** | Establish the `authentication/` module (pages, workflows, fixtures, data, specs) reusing shared kernel only; deliver `@smoke` / `@critical` / `@auth` / `@security` coverage without touching workspace or forms. |
| **Expected outcome** | PR gate includes auth smoke/critical paths; AUT-AUTH catalogue for this sprint is green; no Workspace/Forms/AI automation. |

---

## 2. Business objective

FormFlow’s banking portal is useless without trusted access control. This sprint ensures:

- New users can register and land in an authenticated session.  
- Returning users can log in and log out.  
- Invalid credentials and validation failures are handled visibly.  
- Protected routes require authentication; guest routes behave correctly when already logged in.  
- Session survives refresh via the mock localStorage backend.  

Success is measured by automated proof of these behaviours against the live Angular UI — not by unit tests alone.

---

## 3. Engineering objective

- Populate `frontend/e2e/authentication/` per [02-PROJECT-STRUCTURE.md](./02-PROJECT-STRUCTURE.md).  
- Reuse Sprint 00: fixtures merge point, `DataSetupAdapter` / `LocalStorageDataSetupAdapter`, `TAGS`, `ROUTES`, `AUTH_STORAGE_KEYS`, utils, reporting, CI smoke script.  
- Prefer stable app control ids already present (`#login-email`, `#register-*`, etc.) via page objects — **no** locator duplication in specs.  
- Keep workflows assertion-free; keep specs as the sole assertion owners.  
- Do **not** duplicate framework code in the feature module.

---

## 4. Scope

### 4.1 In scope

| Area | Notes |
|---|---|
| Landing → Login / Register entry | Guest landing CTAs / links into auth pages (`AUT-AUTH-01` + entry paths) |
| Registration | Happy path, validation, duplicate email, auto-login |
| Login | Happy path, wrong password, unknown email, empty fields |
| Logout | Clears session; users retained in store |
| Session persistence | Reload restores authenticated session |
| Route guards | `authGuard`, `guestGuard`, safe/unsafe `returnUrl` |
| Redirect after login / logout | Post-auth destination; logout → login/guest |
| Mock backend / localStorage | Verify session keys and user store side-effects via adapter/storage reads |
| Auth Page Objects, workflows, fixtures, data | Under `authentication/` |
| Smoke & critical auth journeys | Tagged `@smoke` / `@critical` / `@auth` / `@security` / `@happy` / `@negative` |

### 4.2 Out of scope

| Area | Deferred to |
|---|---|
| Full portal shell navigation matrix | Sprint 02 |
| Workspace / dashboard / drafts / stats | Sprint 03 |
| Dynamic forms / joint / AI | Sprints 04–06 |
| A11y, responsive, visual, performance, full regression | Sprints 07–08 |
| CI matrix / sharding enhancements | Sprint 08–09 |
| Profile page deep editing | Sprint 03 (auth only needs post-login landing proof) |

### 4.3 Future scope (not this sprint)

- Expanding J01/J02/J15/J16 into full multi-module journeys (Sprint 08).  
- API-backed `DataSetupAdapter` when Spring Boot lands.

---

## 5. Deliverables

| Deliverable | Description (no code in this doc) |
|---|---|
| Authentication pages | Landing (guest entry), Login, Register page objects; logout action via shared shell or auth workflow |
| Authentication workflows | Register+auto-login, Login, Logout, Login-with-returnUrl |
| Authentication fixtures | Extend shared `test` with authenticated / newlyRegistered personas (adapter-based where UI is not under test) |
| Authentication test data | Valid/invalid/boundary packs under `authentication/data/` |
| Specs | Positive, negative, edge, guard, session, storage verification specs |
| Tags | All specs tagged per registry (`@auth`, suite tags, outcome tags) |
| Traceability | Map specs to `AUT-AUTH-*` in sprint notes or matrix update |
| Docs touch | Short auth section in `e2e/README` or `authentication/README` how to run auth smoke |

---

## 6. Repository impact

### 6.1 Paths to populate (already shelled in Sprint 00)

```text
frontend/e2e/authentication/
  pages/          # landing.page, login.page, register.page (names illustrative)
  workflows/      # auth.workflow (register, login, logout, loginWithReturnUrl)
  fixtures/       # authentication.fixture.ts → merged into shared/fixtures/index.ts
  data/           # users.valid, users.invalid, register.boundary, etc.
  specs/          # login, register, logout, guards, session, storage
```

### 6.2 Shared kernel — reuse only (do not fork)

| Sprint 00 asset | Sprint 01 use |
|---|---|
| `shared/fixtures` | Merge auth fixtures into exported `test` |
| `shared/adapters` | `seedUser`, `loginAs`, `reset` for setup/teardown and storage asserts |
| `shared/config/constants` | `ROUTES`, `AUTH_STORAGE_KEYS`, safe returnUrl prefixes |
| `shared/config/test-tags` | `@auth`, `@smoke`, `@critical`, `@security`, `@happy`, `@negative` |
| `shared/utils` | `uniqueEmail`, `uniqueMobile` for parallel-safe registration |
| `shared/pages/base.page` | Extend for auth pages |
| Reporting / CI smoke script | Auth tests appear under existing `test:e2e:smoke` via tags |

### 6.3 Must not change

- Hybrid folder layout or introduction of flat `e2e/pages/`.  
- Sprint 00 harness health spec (keep; add auth smokes alongside).  
- Architecture of `DataSetupAdapter`.

---

## 7. Page Objects to be created

Identify only — no classes/locators in this document.

| Page object | Route / surface | Owns |
|---|---|---|
| `LandingPage` | `/` | Guest entry CTAs to Login and Register |
| `LoginPage` | `/login` | Email, password, submit, visible errors, returnUrl-aware navigation |
| `RegisterPage` | `/register` | fullName, email, mobile, password, confirm, submit, validation messages |
| Logout control | Via Portal shell chrome **or** thin method on a minimal shell helper | Trigger logout; **do not** build full Sprint 02 nav matrix |

**Rules:** Extend `BasePage`; expose intent methods (`loginAs`, `register`, `expectError`); no assertions inside pages; use existing stable `#ids` from the app when implementing.

---

## 8. Workflows to be created

| Workflow | Steps (conceptual) | Assertions? |
|---|---|---|
| `registerAndEnterPortal` | Open register → fill valid unique user → submit → land authenticated | No — specs assert URL/session |
| `login` | Open login → fill credentials → submit | No |
| `logout` | From authenticated chrome → logout → guest/login | No |
| `loginWithReturnUrl` | Visit protected URL as guest → login → land on intended safe return URL | No |

Workflows compose pages only; return useful handles (e.g. email used) if needed by specs.

---

## 9. Fixtures to be extended

| Fixture | Mechanism | When to use |
|---|---|---|
| `guestPage` (exists) | Adapter `reset` | Guest landing/login/register UI tests |
| `authenticatedUser` | Adapter `loginAs` + unique or seeded user **or** UI login when UI is under test | Guard/session tests that are not testing the login form itself |
| `newlyRegisteredUser` | UI register workflow or seed+login | Post-register flows |
| Merge | `authentication/fixtures` composed into `shared/fixtures/index.ts` | Single `test` export remains |

**Rule:** Prefer adapter seeding for speed when the **subject under test** is not the login/register UI. Prefer UI workflows when validating the forms themselves.

---

## 10. Test data strategy

| Pack | Contents |
|---|---|
| Valid credentials | Generator-based unique email/mobile; password ≥ 6 chars meeting app rules |
| Invalid login | Wrong password; unknown email |
| Empty fields | Missing email and/or password; missing register required fields |
| Register validation | Mobile not matching `^[6-9]\d{9}$`; password too short; confirm mismatch |
| Duplicate registration | Same email seeded then register again |
| ReturnUrl samples | Safe: `/dashboard`, `/forms/account-opening`; unsafe: external URL |

Use `uniqueEmail` / `uniqueMobile` from shared utils for parallelism. Never commit production PII.

---

## 11. Authentication scenarios

| ID | Scenario | AUT |
|---|---|---|
| S01 | Guest opens landing and can reach login/register | AUT-AUTH-01 |
| S02 | Register with valid unique data → authenticated | AUT-AUTH-04 |
| S03 | Login with valid credentials → dashboard (or safe returnUrl) | AUT-AUTH-02 |
| S04 | Login wrong password / unknown email → stay on login with error | AUT-AUTH-03 |
| S05 | Register validation failures (empty, mobile, password, confirm) | AUT-AUTH-05 |
| S06 | Duplicate email registration blocked | AUT-AUTH-05 |
| S07 | Logout clears session; `bank_users` retained | AUT-AUTH-06 |
| S08 | Unauthenticated deep link to protected route → login + returnUrl | AUT-AUTH-07 |
| S09 | Authenticated user hitting `/login` or `/register` → redirected away | AUT-AUTH-08 |
| S10 | Authenticated reload restores session | AUT-AUTH-09 |
| S11 | Unsafe/external returnUrl rejected / not followed | AUT-AUTH-10 |
| S12 | Smoke: login happy path | subset of AUT-AUTH-02 |
| S13 | Critical: guard + login returnUrl | AUT-AUTH-07 |

---

## 12. Positive test cases

| Case | Expectation |
|---|---|
| Valid registration | Navigates to authenticated destination; session keys set; user in `bank_users` |
| Valid login | Authenticated destination; `is_logged_in` true; `current_user` public profile (no password) |
| Logout | Session cleared; can access login as guest |
| Login after register | Works with same credentials |
| Safe returnUrl after login | Lands on allowlisted path |

---

## 13. Negative test cases

| Case | Expectation |
|---|---|
| Wrong password | Error visible; remains on login; not authenticated |
| Unknown email | Error visible; not authenticated |
| Empty login fields | Validation / blocked submit |
| Empty register required fields | Validation messages |
| Password confirm mismatch | Validation; no session |
| Password below minimum length | Validation |
| Invalid mobile pattern | Validation |
| Duplicate email | Registration rejected |

---

## 14. Edge cases

| Case | Expectation |
|---|---|
| Refresh while logged in | Session restored (`AUT-AUTH-09`) |
| Refresh on login page as guest | Remains guest |
| Guest visits `/dashboard` | Redirect to login with returnUrl |
| Authenticated visits `/` or `/login` | `guestGuard` sends to post-auth default |
| External `returnUrl` | Not navigated to external origin |
| Logout then back-button to protected URL | Still blocked / redirected to login |

---

## 15. Mock backend interaction strategy

FormFlow auth uses **localStorage** (no REST). Sprint 01 strategy:

| Goal | Approach |
|---|---|
| Setup without UI | `DataSetupAdapter.seedUser` / `loginAs` / `reset` |
| Setup with UI under test | Drive Register/Login pages; still assert storage outcomes |
| Isolation | Fresh context + `guestPage` / explicit `reset` per test |
| No direct `localStorage.setItem` in specs | Always via adapter or page actions |

Do not invent a fake HTTP auth layer.

---

## 16. LocalStorage validation strategy

| Key | Assert when |
|---|---|
| `is_logged_in` | `"true"` after login/register; not authenticated after logout |
| `current_user` | Present JSON public profile after auth; absent/cleared after logout; **must not** contain password |
| `bank_users` | Contains registered user after register; **retained** after logout |

Prefer adapter-backed or small shared read helpers if needed — keep assertions in specs. Sanitize any failure dumps (Sprint 00 reporting already avoids logging passwords).

---

## 17. Acceptance Criteria

Sprint 01 implementation is acceptable when **all** are true:

1. `authentication/` pages, workflows, fixtures, data, and specs exist per §5–§10.  
2. Shared kernel reused; no duplicated tag/constant/adapter logic.  
3. Positive cases in §12 automated and green.  
4. Negative cases in §13 automated and green (representative matrix OK if data-driven).  
5. Edge/guard/session cases in §14 covering AUT-AUTH-07…10 green.  
6. At least one `@smoke` auth happy path and one `@critical` guard/returnUrl path.  
7. LocalStorage checks for session and user retention implemented for login/register/logout.  
8. No Workspace/Forms/AI/page objects outside auth scope.  
9. Existing Sprint 00 harness `@smoke` still passes.  
10. Specs tagged with `@auth` and appropriate suite/outcome tags.  
11. Traceability to `AUT-AUTH-*` documented.  
12. Code review against Sprint 00 standards + this contract complete.

---

## 18. Definition of Done

Sprint 01 is **complete** when:

1. This specification is **Approved**.  
2. Implementation satisfies §17 Acceptance Criteria.  
3. Sprint Review completed and recorded.  
4. `specs/playwright/README.md` updated to Sprint 01 Done.  
5. No open P0 auth automation defects blocking Sprint 02.  
6. Team authorized to author `SPRINT-02-LANDING-NAVIGATION.md` next.  
7. **Sprint 02 must not begin implementation** until this Definition of Done is met.

---

## 19. Review checklist

### 19.1 Specification review (this document)

- [ ] Scope limited to Authentication (no workspace/forms)  
- [ ] Reuses Sprint 00 kernel explicitly  
- [ ] AUT-AUTH coverage mapped  
- [ ] Handoff / gates clear  

### 19.2 Implementation review (after coding)

- [ ] Page objects under `authentication/pages` only (plus minimal logout chrome access)  
- [ ] Workflows have no assertions / no raw locators  
- [ ] Fixtures merged into shared `test`  
- [ ] Adapter used for storage setup/verify  
- [ ] Tags correct; smoke/critical present  
- [ ] Harness smoke still green  
- [ ] No out-of-scope modules automated  
- [ ] Locator hierarchy followed (`#id` first)  

---

## 20. Risks

| Risk | Mitigation |
|---|---|
| PrimeNG password control flake | Dedicated interaction via page object; avoid brittle overlay hacks in specs |
| Parallel unique email collisions | Always use shared generators |
| Over-building portal shell (Sprint 02 scope) | Logout only; defer full nav matrix |
| Storage assert races | Assert after navigation/readiness; use adapter reads |
| Testing only adapter, not UI | Require UI-driven specs for login/register forms themselves |
| Breaking harness | Keep Sprint 00 smoke; run both in PR |

---

## 21. Dependencies on Sprint 00

| Sprint 00 output | Required for Sprint 01 |
|---|---|
| Hybrid `e2e/` + `authentication/` shell | Drop-in module home |
| `playwright.config` + webServer | Run against app |
| `DataSetupAdapter` / localStorage | Seed, loginAs, reset, isolation |
| Fixtures `test` / `guestPage` | Extension point |
| `TAGS`, `ROUTES`, `AUTH_STORAGE_KEYS` | Consistency |
| `uniqueEmail` / `uniqueMobile` | Parallel registration |
| `BasePage` | Page inheritance |
| CI `test:e2e:smoke` | Auth smokes join gate |
| Engineering standards | Review bar |

Sprint 01 **must not** re-initialize Playwright or invent a parallel tree.

---

## 22. Handoff to Sprint 01 Implementation

**Sprint 01 planning is complete** when this document’s header `Status` is set to **Approved**.

### What happens next

1. **After Sprint 01 is approved, implementation begins** — and only then.  
2. **No implementation should occur before approval** of this specification.  
3. Implement strictly within §4 In Scope; follow §6 repository impact and Sprint 00 reuse rules.  
4. **Sprint 02 (Landing & Navigation) cannot begin** (neither authoring beyond gate nor implementation) until Sprint 01 satisfies its **Definition of Done** (§18).  
5. Do not treat chat history as authoritative over this contract once Approved.

### Implementation contract summary

| Allowed | Forbidden |
|---|---|
| Auth pages, workflows, fixtures, data, specs; storage/guard/session verification; smoke/critical auth tags | Workspace, forms, joint, AI, a11y/visual/regression suites, CI matrix expansion, architectural redesign |

---

## 23. Exit criteria (specification)

This sprint specification may be marked **Approved** when reviewers confirm:

1. Overview, objectives, and scope are accepted.  
2. Deliverables, POs, workflows, fixtures, and scenarios cover AUT-AUTH-01…10 intent.  
3. Acceptance Criteria and Definition of Done are testable.  
4. Sprint 00 reuse rules are binding.  
5. Implementation Handoff (§22) is accepted.

---

## 24. Approval

| Role | Name | Date | Decision |
|---|---|---|---|
| Author | Engineering Manager / Principal QA Automation Architect / Tech Lead | 2026-07-20 | Submitted for review |
| Reviewer | Product / QA Lead | 2026-07-20 | **Approved** — implementation authorized |

**To approve:** change header `Status` from `In Review` to `Approved`, complete the table, then authorize **Sprint 01 implementation** only.
