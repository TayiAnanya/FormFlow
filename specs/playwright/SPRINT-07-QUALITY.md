# Sprint 07 — Quality

**Document Type:** Sprint Specification  
**Project:** FormFlow Playwright Automation  
**Sprint:** 07 — Quality (final implementation sprint)  
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
[SPRINT-06-AI-FEATURES.md](./SPRINT-06-AI-FEATURES.md) (Done)  
**Authoritative foundation:**  
[README.md](./README.md) · [00-AUTOMATION-ARCHITECTURE.md](./00-AUTOMATION-ARCHITECTURE.md) · [01-IMPLEMENTATION-SPEC.md](./01-IMPLEMENTATION-SPEC.md) · [02-PROJECT-STRUCTURE.md](./02-PROJECT-STRUCTURE.md)

**Code:** None in this document. Implementation begins only after this sprint specification is **Approved**.

**Traceability:** Primary AUT IDs — `AUT-QA-01` … `AUT-QA-08` (extends catalogue `AUT-QA-01`…`04` from [01-IMPLEMENTATION-SPEC.md](./01-IMPLEMENTATION-SPEC.md) §14.7 with Sprint 07 resilience IDs). Journeys **J-QA-A** … **J-QA-F**. Reuses fixtures/workflows from Sprints 01–06. Does **not** re-own feature functional coverage.

---

## 1. Sprint overview

| Field | Statement |
|---|---|
| **Sprint goal** | Deliver a **thin, cross-cutting quality suite** that proves FormFlow remains usable and safe under viewport change, keyboard use, loading/error resilience, network failure simulation, and cleared-session / unauthorized access — plus verify existing `@smoke` / `@critical` gates still pass. |
| **Business objective** | Give release stakeholders confidence that critical customer paths degrade gracefully and that PR-gate smoke/critical suites remain green before Sprint 08 regression / Sprint 09 release. |
| **Engineering objective** | Populate `frontend/e2e/quality/` with **~30–40 meaningful tests** (viewport matrix, keyboard paths, resilience stubs, gate verification) — **without** duplicating feature suites or inventing product behaviour the app does not have. |
| **Expected outcome** | AUT-QA-01…08 represented; quality matrices green; Gap Analysis honest; smoke/critical verification documented; prior feature suites remain green; Sprint 08 authoring unlocked after DoD. |

**This is the final implementation sprint** for feature-adjacent automation. Sprint 08–09 are regression / release governance (specs not authored here).

---

## 2. Business objective

Customers and auditors must see that FormFlow:

- Remains operable on **desktop / tablet / mobile** widths for critical surfaces.  
- Supports **keyboard** reachability of primary navigation and form/auth controls.  
- Surfaces **loading** and **error** states that do not strand the user.  
- Behaves predictably when the **network fails** or Gemini/API calls abort.  
- Redirects correctly when the **session is cleared** or a guest hits a protected route.  
- Continues to pass the established **smoke** and **critical** PR-gate slices.

Success is **cross-cutting quality proof**, not new feature depth.

---

## 3. Engineering objective

| Principle | Binding rule |
|---|---|
| **Cite, don’t duplicate** | Auth guards, nav shell, advisor loading/error, form schema errors, workspace empty states already live under Sprints 01–06. Sprint 07 **reuses** them via tags/grep runs or thin orchestrations — does **not** rewrite those suites under `quality/`. |
| **Honest product model** | No offline page, no idle session TTL, no hamburger menu. Automate **actual** behaviour (nav hidden &lt;768px; clear storage → login redirect; `page.route` abort → advisor/form error UI). |
| **Determinism** | Network failures via Playwright route abort / offline context; Gemini failures via existing advisor stubs. No live API dependency for PR quality gate. |
| **Thin suite** | Target **30–40** tests. Prefer parameterized viewport rows and shared helpers over one-test-per-page spam. |
| **Tags** | `@responsive`, `@a11y` (keyboard subset), `@security`, `@smoke`, `@critical`, `@negative`, `@regression` where appropriate. |

---

## 4. Scope

### 4.1 In scope

| Theme | Intent |
|---|---|
| Responsive behaviour | Critical pages at desktop / tablet / mobile viewports |
| Keyboard navigation | Tab / Enter / Escape on agreed primary controls |
| Loading states | Cross-feature loading that still exists (primarily Advisor; form schema readiness) |
| Error states | Visible, recoverable error UI on agreed surfaces |
| Offline / network failure | Simulated offline or aborted requests → safe UI / no hard crash |
| Session expiry (simulated) | Cleared `is_logged_in` / `current_user` → protected route blocked |
| Unauthorized redirects | Guest → `/login?returnUrl=…` (thin quality check; cite AUT-AUTH / AUT-NAV) |
| Smoke suite verification | Existing `@smoke` tests pass as a gate |
| Critical suite verification | Existing `@critical` tests pass as a gate |
| Final quality checks | Shell landmarks present; no uncaught pageerror on critical routes |

### 4.2 Out of scope

| Item | Why |
|---|---|
| New feature journeys (forms/joint/advisor happy paths) | Owned by Sprints 04–06 |
| Full axe-core critical/serious = 0 programme | Catalogue AUT-QA-01 depth → **deferred** beyond keyboard subset (Gap Analysis) |
| Visual screenshot baselines (AUT-QA-03) | Deferred to Sprint 08+ / nightly |
| Soft performance budgets (AUT-QA-04) | Deferred to Sprint 08+ |
| Multi-browser matrix (Firefox/WebKit) | Sprint 08 |
| Voice / PDF automation | Still out of product automation backlog |
| Inventing offline UI, session timeout dialogs, or mobile hamburger | **Not in product** |

### 4.3 Binding product facts

| Fact | Detail |
|---|---|
| Breakpoints | CSS uses **640 / 768 / 1024** px; Playwright viewports map to Mobile ≈ 390×844, Tablet ≈ 768×1024, Desktop ≈ 1280×720 |
| Shell nav | `.portal-nav` **hidden below 768px**; **no** mobile menu substitute |
| Session | localStorage `is_logged_in` + `current_user`; **no TTL / idle expiry** |
| Unauthorized | `authGuard` → `/login?returnUrl=` |
| Offline | **No** service worker / offline route — simulate with `context.setOffline(true)` and/or `page.route` abort |
| Advisor loading/error | Already automated deeply in Sprint 06 — quality suite samples resilience, does not re-matrix all ADV tests |
| Form errors | Schema / field `role="alert"` — sample one scenario; do not rebuild validation matrix |

---

## 5. Repository impact

```text
frontend/e2e/quality/
├── README.md                          ← update ownership for Sprint 07
├── data/
│   ├── viewports.packs.ts             ← desktop / tablet / mobile definitions
│   ├── quality.surfaces.ts            ← agreed routes + expected landmarks
│   └── index.ts
├── workflows/
│   ├── quality.workflow.ts            ← setViewport, clearSession, abortNetwork, keyboard helpers
│   └── index.ts
├── fixtures/                          ← only if required (prefer reuse shared fixtures)
└── specs/
    ├── qa.responsive.spec.ts
    ├── qa.keyboard.spec.ts
    ├── qa.loading-error.spec.ts
    ├── qa.network-offline.spec.ts
    ├── qa.session-unauthorized.spec.ts
    ├── qa.smoke-critical-gate.spec.ts ← or docs + npm script verification (see §8)
    └── qa.final-checks.spec.ts

frontend/playwright.config.ts          ← optional viewport project(s) OR in-test setViewportSize
```

**Do not** create duplicate page objects for Dashboard / Login / Advisor — import existing POs from feature modules.

---

## 6. Quality assets (implementation contract)

### 6.1 Data

| Module | Contents |
|---|---|
| `viewports.packs.ts` | `{ id, width, height, tag }` for mobile / tablet / desktop |
| `quality.surfaces.ts` | Agreed routes: `/`, `/login`, `/dashboard`, `/advisor`, one form scenario (e.g. `account-opening`) |

### 6.2 Workflows

| Helper | Role |
|---|---|
| `applyViewport(page, pack)` | `setViewportSize` |
| `clearSession(page)` | Remove auth keys via DataSetupAdapter / evaluate |
| `simulateOffline(context)` / `abortNextRequest(page, pattern)` | Network failure |
| `tabUntil(locator)` / `pressEnter` / `pressEscape` | Keyboard helpers (thin) |

### 6.3 Fixtures

Reuse `guestPage`, `authenticatedUser`, `emptyWorkspaceUser`. **No new persona required** unless a dedicated `qualityGuest` proves necessary (default: none).

---

## 7. Quality matrices

### 7.1 Viewport Matrix (AUT-QA-02)

| Surface | Mobile (&lt;768) | Tablet (≥768) | Desktop (≥1024) | Assert |
|---|---|---|---|---|
| Landing `/` | Usable CTAs to Login/Register | Same | Same | Primary CTAs visible |
| Login `/login` | Form operable | Form operable | Form operable | Email/password/submit visible |
| Dashboard `/dashboard` | Hero + workspace visible; **shell nav hidden** | Shell nav visible | Shell nav visible | No crash; brand + logout reachable |
| Advisor `/advisor` | Title + textarea + Send visible | Same | Same | Heading + input visible |
| Form host (one scenario) | Form root visible | Same | Same | `app-form-host` / form ready |

**Parameterized:** prefer one `test.describe` × viewport pack × surface pack (≈ 5 surfaces × 3 viewports = up to 15 rows — **collapse** where assertions are identical: e.g. 8–12 responsive tests total).

### 7.2 Keyboard Matrix (AUT-QA-01 subset)

| Path | Keys | Expected |
|---|---|---|
| Landing → Login CTA | Tab → Enter | Reaches `/login` |
| Login submit (valid seeded user) | Tab through fields → Enter | Reaches dashboard **or** submit activates |
| Shell (desktop viewport) | Tab to Advisor link → Enter | `/advisor` |
| Advisor suggestion (optional) | Tab to suggestion → Enter/Space | Textarea populated (no auto-submit) |
| Escape | Escape on open PrimeNG overlay if present | Overlay dismisses or no pageerror |

**Cap:** 5–7 keyboard tests. Not a full WCAG audit.

### 7.3 Loading / Error Matrix (AUT-QA-05)

| ID | Surface | Trigger | Expected |
|---|---|---|---|
| LE-01 | Advisor | Delayed stub submit | `.advisor-loading` visible; controls disabled |
| LE-02 | Advisor | HTTP error stub | Error alert; Start Over / retry possible |
| LE-03 | Form host | Unknown scenario id | Catalog / missing schema message + recovery link |
| LE-04 | Workspace detail | Unknown application id (seeded user) | “Application not found…” warn |
| LE-05 | Auth | Wrong password (cite) | Stays on login with error — **optional thin sample**; prefer cite AUT-AUTH-03 |

**Cap:** 4–6 tests. Reuse advisor workflows; do not re-implement ADV matrix.

### 7.4 Network / Offline Matrix (AUT-QA-06)

| ID | Setup | Action | Expected |
|---|---|---|---|
| NET-01 | `context.setOffline(true)` after login | Navigate `/dashboard` | Page does not throw uncaught exception; app shell still present **or** browser offline error handled without automation crash |
| NET-02 | Abort Gemini route | Advisor submit | Error phase (reuse stub pattern) |
| NET-03 | Abort schema JSON fetch (if applicable) | Open form scenario | Schema error helper visible |
| NET-04 | Restore online | Navigate dashboard | App recovers |

**Honest note:** FormFlow is largely **localStorage-first**. Offline may not change dashboard content. Assert **stability** (no pageerror; recoverable navigation), not a fictional offline banner.

### 7.5 Session / Unauthorized Matrix (AUT-QA-07)

| ID | Setup | Action | Expected |
|---|---|---|---|
| SEC-01 | Authenticated → clear session keys | `goto /dashboard` | Redirect `/login` with `returnUrl` |
| SEC-02 | Guest | `goto /advisor` | `/login?returnUrl=/advisor` |
| SEC-03 | Guest | `goto /forms/account-opening` | Login + returnUrl to form |
| SEC-04 | Authenticated → logout (reuse workflow) | `goto /profile` | Blocked / login |

**Cap:** 4–5 tests. Deep returnUrl allowlist already AUT-AUTH-10 / AUT-NAV — **cite**; do not rebuild full matrix.

### 7.6 Smoke / Critical Gate Matrix (AUT-QA-08)

| Gate | Mechanism | Expected |
|---|---|---|
| Smoke | `npx playwright test --grep "@smoke"` (CI-equivalent) | Exit 0; count ≥ established baseline |
| Critical | `npx playwright test --grep "@critical"` | Exit 0 |
| Combined PR gate | `--grep "@smoke|@critical"` | Exit 0 |

Implementation may be:

1. **Preferred:** documented npm scripts + CI job invocation recorded in DoD (not a Playwright “meta-test”).  
2. **Optional:** one thin `qa.smoke-critical-gate.spec.ts` that documents baseline counts via `test.info()` annotations **or** a shell check in CI — avoid nesting Playwright inside Playwright.

Sprint 07 **owns verification evidence**, not re-authoring feature smoke tests.

### 7.7 Final quality checks

| Check | Assert |
|---|---|
| Shell landmarks (desktop) | `navigation[aria-label="Main navigation"]` present when nav visible |
| Brand home | Brand link reachable |
| No `pageerror` | Listen for pageerror on landing + dashboard + advisor open |
| Harness health | Cite existing `@smoke harness health` |

---

## 8. User Journey Matrix (quality)

| ID | Journey | AUT | Notes |
|---|---|---|---|
| J-QA-A | Mobile viewport → login → dashboard usable | AUT-QA-02 | Nav may be hidden; logout still reachable |
| J-QA-B | Desktop keyboard → Advisor | AUT-QA-01 | Shell link |
| J-QA-C | Advisor network failure → error → Start Over | AUT-QA-05/06 | Reuse stubs |
| J-QA-D | Clear session mid-portal → login redirect | AUT-QA-07 | Simulated “expiry” |
| J-QA-E | Guest deep-link form → login → (optional) arrive | AUT-QA-07 | Cite AUT-NAV critical if full path too heavy |
| J-QA-F | Run smoke+critical gate | AUT-QA-08 | Evidence in CI / DoD |

---

## 9. Positive scenarios (summary)

- Viewport packs render critical surfaces without crash.  
- Keyboard can reach Login and Advisor on desktop.  
- Advisor loading/error remain visible and recoverable.  
- Cleared session forces login.  
- Smoke and critical gates pass.

---

## 10. Negative / resilience scenarios (summary)

- Offline / aborted Gemini → error UI, not silent hang forever.  
- Guest protected routes → login.  
- Unknown form / application → user-visible message.  
- Mobile: do **not** assert shell nav links (product hides them).

---

## 11. Edge cases

| Edge | Handling |
|---|---|
| Mobile shell without hamburger | Assert nav **hidden**; brand + account/logout still available |
| “Session expiry” without TTL | **Simulate** by clearing storage — document as simulation |
| Offline with localStorage app | Assert no pageerror; content may still render from cache/storage |
| Duplicate smoke tests | Forbidden — gate-verify existing tags only |

---

## 12. Acceptance Criteria

1. `e2e/quality/` contains data + workflows + specs for themes in §4.1.  
2. Approximately **30–40** meaningful quality tests (not feature rewrites).  
3. Viewport Matrix (§7.1) covered for agreed surfaces.  
4. Keyboard Matrix (§7.2) covered for primary paths.  
5. Loading/Error + Network + Session matrices (§7.3–§7.5) covered within caps.  
6. Smoke and Critical gate verification (§7.6) evidenced (script and/or CI).  
7. Final quality checks (§7.7) present.  
8. No new duplicate AUT-AUTH / AUT-NAV / AUT-ADV / AUT-JOINT functional suites.  
9. Prior feature suites remain green in regression.  
10. Coverage Gap Analysis completed (§14).  
11. Spec Approved before coding; Implementation Handoff followed (§16).

---

## 13. Definition of Done

- [x] This specification **Approved**  
- [x] Quality module implemented per §5  
- [x] ~30–40 tests green locally (**42** delivered)  
- [x] `@smoke` and `@critical` gate verification green  
- [x] Shared framework unchanged (no full regression required)  
- [x] Gap Analysis finalized in this document  
- [x] Completion Report delivered  
- [x] Sprint 08 **not** started  

---

## 14. Coverage Gap Analysis (Sprint 07 final)

| Gap | Status | Notes |
|---|---|---|
| Full axe AUT-QA-01 (critical/serious = 0) | **Deferred** | Keyboard + landmark smoke only |
| Visual screenshot baselines AUT-QA-03 | **Deferred** | Landmark visual sanity covered; pixel baselines Sprint 08+ |
| Soft performance AUT-QA-04 | **Deferred** | Sprint 08+ |
| Real session TTL / idle timeout | **N/A (product)** | Simulated `clearSession` only |
| Offline marketing page / SW | **N/A (product)** | `setOffline` + route abort |
| Mobile hamburger / drawer nav | **N/A (product)** | Assert nav hidden &lt;768px |
| Firefox / WebKit projects | **Sprint 08** | Chromium-only |
| Exhaustive form validation at all viewports | **Out of scope** | Sample surfaces only |
| Voice / PDF quality | **Out of scope** | Still deferred |

---

## 15. Sprint dependencies

| Depends on | Why |
|---|---|
| Sprint 01 | Session clear, login redirect, guest fixtures |
| Sprint 02 | Shell landmarks, nav behaviour at ≥768 |
| Sprint 03 | Dashboard / empty / not-found messages |
| Sprint 04–05 | Form host readiness sample |
| Sprint 06 | Advisor loading/error stubs |

| Unlocks | After DoD |
|---|---|
| Sprint 08 | Full regression & journeys specification |
| Sprint 09 | Release readiness specification |

---

## 16. Implementation Handoff

### Must implement

1. Viewport packs + `applyViewport`.  
2. Responsive specs for agreed surfaces (parameterized).  
3. Keyboard specs for landing / login / shell→advisor.  
4. Thin loading/error samples (advisor + one form/workspace error).  
5. Network/offline simulation specs (stability-focused).  
6. Session-cleared + guest unauthorized thin specs.  
7. Smoke/critical gate verification (npm script + CI evidence).  
8. Final checks (landmarks / pageerror).  
9. Update `e2e/quality/README.md`.  
10. Completion Report with metrics and final Gap Analysis.

### Must not implement

- Second copies of feature smoke/critical tests.  
- Full a11y axe programme, visual baselines, or perf budgets (deferred).  
- Product changes (hamburger, offline page, session TTL).  
- Voice / PDF suites.  
- Sprint 08 journey catalogue.

### Suggested test budget (~30–40)

| Spec file | Approx. tests |
|---|---|
| `qa.responsive.spec.ts` | 8–12 |
| `qa.keyboard.spec.ts` | 5–7 |
| `qa.loading-error.spec.ts` | 4–6 |
| `qa.network-offline.spec.ts` | 3–5 |
| `qa.session-unauthorized.spec.ts` | 4–5 |
| `qa.final-checks.spec.ts` | 3–4 |
| Gate verification | Script/CI (counts toward DoD, not necessarily Playwright count) |
| **Total Playwright** | **≈ 30–40** |

### AUT-QA mapping (Sprint 07)

| ID | Theme |
|---|---|
| AUT-QA-01 | Keyboard navigation (a11y subset) |
| AUT-QA-02 | Responsive critical paths |
| AUT-QA-03 | Visual baselines — **deferred** |
| AUT-QA-04 | Soft performance — **deferred** |
| AUT-QA-05 | Loading / error resilience samples |
| AUT-QA-06 | Offline / network failure simulation |
| AUT-QA-07 | Session cleared / unauthorized redirects |
| AUT-QA-08 | Smoke + critical suite verification |

---

## Document control

| Role | Name | Date | Decision |
|---|---|---|---|
| Author | Automation Architect (Cursor) | 2026-07-20 | Spec Approved → Implementation **Done** |
| Reviewer | Engineering | 2026-07-20 | Implementation complete; awaiting Sprint Review sign-off |

**Next:** Engineering review of Completion Report.  
**After Sprint 07 DoD sign-off:** Author `SPRINT-08-REGRESSION.md` (Specification Mode only — no Sprint 08 implementation yet).
