# Sprint 02 — Landing & Navigation

**Document Type:** Sprint Specification  
**Project:** FormFlow Playwright Automation  
**Sprint:** 02 — Landing & Navigation  
**Version:** 1.0  
**Status:** Done  
**Parent Document:** [03-IMPLEMENTATION-ROADMAP.md](./03-IMPLEMENTATION-ROADMAP.md) (Approved)  
**Depends on:**  
[SPRINT-00-FOUNDATION.md](./SPRINT-00-FOUNDATION.md) (Done) · [SPRINT-01-AUTHENTICATION.md](./SPRINT-01-AUTHENTICATION.md) (Done)  
**Authoritative foundation:**  
[README.md](./README.md) · [00-AUTOMATION-ARCHITECTURE.md](./00-AUTOMATION-ARCHITECTURE.md) · [01-IMPLEMENTATION-SPEC.md](./01-IMPLEMENTATION-SPEC.md) · [02-PROJECT-STRUCTURE.md](./02-PROJECT-STRUCTURE.md)

**Code:** None in this document. Implementation begins only after this sprint specification is **Approved**.

**Traceability:** Primary AUT IDs — `AUT-NAV-01` … `AUT-NAV-04` ([01-IMPLEMENTATION-SPEC.md](./01-IMPLEMENTATION-SPEC.md) §14.2). Reuses auth behaviours proven in Sprint 01 (`AUT-AUTH-*`) as **dependencies**, not re-implemented scope. Related journey seeds that *use* navigation (full multi-module journeys remain Sprint 08).

---

## 1. Sprint overview

| Field | Statement |
|---|---|
| **Sprint goal** | Automate FormFlow **Landing & Navigation**: guest landing entry points, portal shell chrome, menu routing, logo home, protected/direct/deep-link URLs, browser history, invalid-route handling, active nav state, and logout navigation — on the Sprint 00 + Sprint 01 foundation. |
| **Business objective** | Prove customers can move correctly between public pages and authenticated sections without broken routes, lost session context, or incorrect redirects. |
| **Engineering objective** | Establish reusable **portal shell / navigation** page objects and workflows (primarily under `shared/pages` + thin feature specs), reuse Sprint 01 auth fixtures/workflows, and deliver `@smoke` / `@critical` / `@navigation` coverage **without** Workspace business logic or Dynamic Forms automation. |
| **Expected outcome** | Stable navigation helpers for all later sprints; AUT-NAV catalogue for this sprint green; PR gate includes navigation smoke/critical paths. |

---

## 2. Business objective

FormFlow’s banking portal is a multi-surface product. Customers must:

- Discover Login / Register from the public landing experience.  
- Enter the authenticated portal (Dashboard) after sign-in.  
- Move between shell destinations (Dashboard, Advisor, Profile) via the navigation bar and logo.  
- Resume intended modules via deep links after authentication.  
- Be blocked or redirected correctly when unauthenticated or when hitting unknown routes.  
- Leave the portal cleanly via Logout navigation.  

Success is measured by automated proof of **navigation correctness and routing** against the live Angular UI — not by dashboard widgets, form fills, or advisor conversations.

---

## 3. Engineering objective

- Populate navigation / shell automation per [02-PROJECT-STRUCTURE.md](./02-PROJECT-STRUCTURE.md):  
  - **Landing** remains owned by `authentication/pages` (already delivered in Sprint 01) — **extend usage**, do not fork.  
  - **Portal shell chrome** owned by `shared/pages` (e.g. `portal-shell.page`) — Sprint 01’s thin `AuthenticatedChromePage` (logout-only) is **superseded/extended** into full shell navigation for this sprint (logout retained; nav matrix added).  
- Reuse Sprint 00 kernel: fixtures merge point, `DataSetupAdapter`, `TAGS`, `ROUTES`, utils, reporting, CI smoke script.  
- Reuse Sprint 01: `guestPage`, `authenticatedUser`, auth workflows (`login`, `logout`, `loginWithReturnUrl`, `registerAndEnterPortal`), auth data factories where a session is required.  
- Prefer stable selectors already present (`.portal-nav-link`, `.portal-brand`, landing `.lp-nav-*` / hero CTAs, `routerLinkActive` class `portal-nav-link-active`).  
- Keep workflows assertion-free; assertions only in specs.  
- Do **not** duplicate Authentication module logic; do **not** invent Workspace/Forms page objects.

---

## 4. Scope

### 4.1 In scope

| Area | Notes |
|---|---|
| Landing page navigation | Guest landing sections/links that route to Login, Register, and (as guest) protected module entry that redirects via `authGuard` |
| Navigation bar | Portal shell main nav: Dashboard, Forms (dashboard fragment), Applications (dashboard fragment), Advisor, Profile |
| Logo navigation | Brand link → `/dashboard` while authenticated |
| Login / Register entry points | Landing nav + hero CTAs (reuse Sprint 01 Landing page object; expand coverage where needed for AUT-NAV-02) |
| Dashboard entry after login | Post-auth default `/dashboard` (and safe returnUrl landings already proven in Sprint 01 — referenced, not re-owned) |
| Navigation menu | Shell nav link clicks → correct route (or fragment) |
| Protected route navigation | Authenticated users can open `/dashboard`, `/advisor`, `/profile`, `/forms/:scenarioId` **as destinations** (route reached / shell ready — not business content) |
| Browser back / forward | History traversal between portal routes and guest surfaces preserves expected auth/route behaviour |
| Direct URL navigation | Typed/`goto` URLs for known routes as guest and as authenticated user |
| Route guard redirects | Guest → protected URL → `/login?returnUrl=…`; authenticated → `/login` or `/register` or `/` → post-auth default (reuse Sprint 01 guard proofs; add nav-context cases) |
| Invalid route (404) handling | App wildcard `**` → redirect to `''` (landing); guest stays on landing; authenticated visitor is redirected by `guestGuard` to post-auth destination |
| Logout navigation | Logout control → `/login` (and subsequent protected URL blocked) |
| Active navigation state | `portal-nav-link-active` (or equivalent) reflects current route for Dashboard / Advisor / Profile |
| Deep-link navigation | Authenticated deep link to `/forms/:scenarioId` (and optional guest deep link → login → return) — **arrive at FormHost route only**; no schema fill/submit |
| Navigation smoke tests | Tagged `@smoke` + `@navigation` |
| Critical navigation journeys | Tagged `@critical` + `@navigation` (e.g. guest deep-link → login → intended module; shell cross-nav matrix) |

### 4.2 Out of scope

| Area | Deferred to |
|---|---|
| Workspace widgets, catalog cards, statistics, drafts, recent activity, application list/detail **business** asserts | Sprint 03 |
| Dynamic Forms fill/validation/submit; renderer behaviours | Sprint 04 |
| Joint Account depth | Sprint 05 |
| Smart Banking Advisor conversation / recommendations content | Sprint 06 |
| Voice Assistant / PDF Autofill | Sprint 06 |
| Accessibility, responsive, visual, performance suites | Sprint 07 |
| Full regression / multi-module journeys | Sprint 08 |
| CI matrix / sharding enhancements | Sprint 08–09 |
| Re-implementing Authentication register/login validation matrices | Sprint 01 (Done) — **reuse only** |
| Redesigning Sprint 00 harness or Sprint 01 auth module | Forbidden |

### 4.3 Future scope (not this sprint)

- Full journey packs (J*) that chain nav + workspace + forms (Sprint 08).  
- Asserting fragment scroll positions beyond “URL/fragment updated” if flaky — prefer route/hash assertions.  
- Dedicated 404 page UX (app currently redirects; match live behaviour).

---

## 5. Deliverables

| Deliverable | Description (no code in this doc) |
|---|---|
| Portal shell page object | Full chrome: brand/logo, nav links, active-state exposure, logout (extends/replaces thin logout-only helper from Sprint 01) |
| Landing navigation usage | Reuse/extend Sprint 01 `LandingPage` for AUT-NAV-02 entry coverage |
| Navigation workflows | e.g. `openShellRoute`, `navigateViaMenu`, `deepLinkAsGuestThenLogin`, `logoutAndLandOnLogin`, optional `traverseHistory` composers |
| Navigation fixtures | Prefer Sprint 01 `authenticatedUser` / `guestPage`; add only if a nav-specific persona is required (avoid parallel fixture systems) |
| Navigation test data | Route packs, fragment targets, unknown-path samples, deep-link scenario ids (from shared `ROUTES` / `SCENARIO_IDS`) |
| Specs | Landing nav, shell menu, logo, guards-in-nav-context, history, direct URL, wildcard, active state, deep-link, logout nav |
| Tags | `@navigation`, `@smoke`, `@critical`, `@security`, `@happy`, `@negative`, `@auth` where session-coupled |
| Traceability | Map specs to `AUT-NAV-01`…`04` (and cite reused `AUT-AUTH-*` where guards/logout overlap) |
| Docs touch | Short navigation section in `e2e/README` or module README: how to run nav smoke |

---

## 6. Repository impact

### 6.1 Paths to populate / extend

```text
frontend/e2e/
  shared/
    pages/
      portal-shell.page.ts     # NEW — full shell navigation + logout
      base.page.ts             # REUSE (no redesign)
    fixtures/index.ts          # EXTEND merge only if new fixtures added
    config/constants.ts        # REUSE ROUTES / SCENARIO_IDS (add nav constants only if missing)
  authentication/
    pages/landing.page.ts      # REUSE (entry points)
    workflows/                 # REUSE login/logout/loginWithReturnUrl
    fixtures/                  # REUSE authenticatedUser / guestPage
  # Optional thin home for nav-only specs if preferred over shared/specs:
  # Prefer feature-aligned placement per 02-PROJECT-STRUCTURE —
  # navigation specs may live under shared/specs/navigation/ OR a lightweight
  # e2e area documented at implementation time without inventing a new top-level
  # product module. Do NOT place Workspace/Forms business specs here.
```

**Ownership rule (binding):**  
Navigation / shell → `shared/pages` (portal shell). Landing → `authentication/pages`. Do **not** create `workspace/pages` for shell chrome.

### 6.2 Shared kernel & Sprint 01 — reuse only (do not fork)

| Asset | Sprint 02 use |
|---|---|
| Sprint 00 `BasePage`, `TAGS`, `ROUTES`, utils, reporting, CI smoke | Foundation |
| `DataSetupAdapter` / `LocalStorageDataSetupAdapter` | Session setup for authenticated nav without retesting login UI |
| Sprint 01 `guestPage`, `authenticatedUser` | Guest vs authenticated navigation contexts |
| Sprint 01 auth workflows | Login, logout, loginWithReturnUrl for deep-link journeys |
| Sprint 01 `LandingPage` | Landing CTAs / nav entry |
| Sprint 01 guard/session proofs | Treat as green dependency; add only nav-matrix gaps |

### 6.3 Must not change

- Sprint 00 harness health contract or hybrid folder architecture.  
- Sprint 01 Authentication acceptance behaviour (may **consume** APIs; must not break auth suite).  
- Introduction of flat `e2e/pages/` outside approved structure.  
- Workspace/Forms/AI modules beyond route-arrival smoke for deep links.

---

## 7. Navigation Page Objects

Identify only — no classes/locators in this document.

| Page object | Surface | Owns |
|---|---|---|
| `LandingPage` (existing) | `/` | Guest CTAs/links to Login & Register; optional service cards that trigger protected deep links as guest |
| `PortalShellPage` (new; extends Sprint 01 logout chrome) | Authenticated layout | Brand/logo → dashboard; nav links (Dashboard, Forms fragment, Applications fragment, Advisor, Profile); expose active-link locator/state; logout |
| `LoginPage` / `RegisterPage` (existing) | `/login`, `/register` | Only as endpoints of navigation / guard redirects — **no** new validation matrices |
| Destination readiness (thin) | `/dashboard`, `/advisor`, `/profile`, `/forms/:id` | Optional minimal “route ready” hooks (title/landmark/shell visible) — **not** workspace widgets or form fields |

**Rules:** Extend `BasePage`; intent methods (`goToAdvisor`, `goToProfile`, `clickBrand`, `logout`); no assertions inside pages; prefer existing classes/`routerLink` targets; Forms/Applications shell items may navigate to `/dashboard#…` — model that honestly.

---

## 8. Navigation Workflows

| Workflow | Steps (conceptual) | Assertions? |
|---|---|---|
| `enterPortalAsAuthenticated` | Adapter `loginAs` or reuse `authenticatedUser` → open dashboard | No — specs assert URL/shell |
| `navigateShellTo` | From shell → click menu target → wait for readiness of destination | No |
| `deepLinkProtectedAsGuest` | Guest `goto` protected path → land on login with returnUrl → login → intended path | No (compose Sprint 01 `loginWithReturnUrl`) |
| `deepLinkFormAsAuthenticated` | Authenticated `goto` `/forms/{scenarioId}` → FormHost route ready | No |
| `logoutToLogin` | Shell logout → login route | No (reuse auth logout) |
| `browserBack` / `browserForward` | Perform history steps after a known nav sequence | No |

Workflows compose pages only; return useful handles (e.g. scenario id, intended URL) if specs need them.

---

## 9. Navigation Fixtures

| Fixture | Mechanism | When to use |
|---|---|---|
| `guestPage` (Sprint 01) | Adapter `reset` | Landing, guest direct URLs, wildcard as guest, guest deep links |
| `authenticatedUser` (Sprint 01) | Adapter `loginAs` | Shell menu, logo, active state, authenticated deep links, history inside portal |
| New fixtures | **Avoid** unless a clear gap appears | Prefer composing existing auth fixtures |

**Rule:** Prefer adapter seeding when navigation (not login UI) is under test. Prefer auth UI workflows only when the journey’s subject includes the login step (guest deep-link → login → module).

---

## 10. Navigation Test Data

| Pack | Contents |
|---|---|
| Shell routes | `/dashboard`, `/advisor`, `/profile` |
| Fragment targets | `/dashboard#workflows` (Forms), `/dashboard#applications` (Applications) — match live `routerLink` + `fragment` |
| Deep-link forms | One or more `SCENARIO_IDS` (e.g. `account-opening`, `loan-inquiry`) as **route** samples only |
| Unknown / invalid paths | e.g. `/this-route-does-not-exist`, `/admin/secret` |
| Guard samples | Protected paths for guest: `/dashboard`, `/advisor`, `/profile`, `/forms/account-opening` |
| History sequences | Ordered lists of shell routes for back/forward cases |

Reuse shared `ROUTES` and `SCENARIO_IDS`. No production PII. No Workspace seed payloads beyond what auth adapter already provides for session.

---

## 11. Navigation scenarios

| ID | Scenario | AUT |
|---|---|---|
| N01 | Guest uses landing Login entry | AUT-NAV-02 |
| N02 | Guest uses landing Register entry | AUT-NAV-02 |
| N03 | Authenticated shell → Dashboard / Advisor / Profile | AUT-NAV-01 |
| N04 | Authenticated shell → Forms / Applications fragment links | AUT-NAV-01 (fragment navigation) |
| N05 | Logo / brand returns to Dashboard | AUT-NAV-01 |
| N06 | Active nav state updates with route | AUT-NAV-01 |
| N07 | Guest direct URL to protected route → login + returnUrl | AUT-NAV-01 + AUT-AUTH-07 (reuse) |
| N08 | Authenticated deep link to `/forms/:scenarioId` arrives | AUT-NAV-03 |
| N09 | Guest deep link to form → login → form route | AUT-NAV-03 + AUT-AUTH-07 |
| N10 | Invalid/unknown route redirects per app wildcard | AUT-NAV-04 |
| N11 | Browser back/forward across shell routes | AUT-NAV-01 |
| N12 | Logout navigates to login; protected URL blocked after | AUT-NAV-01 + AUT-AUTH-06 (reuse) |
| N13 | Smoke: authenticated shell nav Dashboard ↔ Advisor | subset AUT-NAV-01 |
| N14 | Critical: guest deep-link → login → intended module | AUT-NAV-03 |

---

## 12. Positive test cases

| Case | Expectation |
|---|---|
| Landing → Login | URL `/login`; login form ready |
| Landing → Register | URL `/register`; register form ready |
| Shell → Dashboard | URL `/dashboard`; shell visible; Dashboard active (when applicable) |
| Shell → Advisor | URL `/advisor`; Advisor active |
| Shell → Profile | URL `/profile`; Profile active |
| Shell → Forms link | Navigates to dashboard with workflows fragment (per app) |
| Shell → Applications link | Navigates to dashboard with applications fragment (per app) |
| Brand/logo click | Lands on `/dashboard` |
| Post-login dashboard entry | Authenticated session reaches `/dashboard` (default) |
| Authenticated form deep link | `/forms/{id}` loads under shell (route/readiness only) |
| Guest form deep link + login | Ends on requested form route |
| Logout | Lands on `/login` |
| Valid direct URLs (authenticated) | Each known portal route resolves without guard bounce |

---

## 13. Negative test cases

| Case | Expectation |
|---|---|
| Guest opens `/dashboard` (and other protected routes) | Redirect to `/login` with `returnUrl` |
| Guest opens `/forms/:id` | Redirect to login with returnUrl |
| Authenticated opens `/login` or `/register` or `/` | `guestGuard` sends to post-auth default (`/dashboard` or safe returnUrl) |
| Unknown path as guest | Wildcard → landing (`/`) |
| Unknown path as authenticated | Wildcard → `''` then `guestGuard` → post-auth destination (typically `/dashboard`) |
| After logout, revisit protected URL | Redirect to login (not prior shell) |

---

## 14. Edge cases

| Case | Expectation |
|---|---|
| Browser back from Advisor to Dashboard | URL and active state match history |
| Browser forward restores prior shell route | Same |
| Back after logout toward protected URL | Still blocked / redirected to login |
| Direct URL with safe returnUrl after guest bounce | Login then intended module (compose auth) |
| Fragment-only shell links | Hash/fragment present; do not assert Workspace section business content |
| Refresh on shell route | Session + route restored (auth dependency; nav confirms shell still correct) |
| Rapid consecutive menu clicks | Final route matches last intent (no stuck intermediate — use Playwright auto-wait, no hard sleeps) |

---

## 15. Route guard strategy

| Goal | Approach |
|---|---|
| Prove nav + guards together | Guest protected navigations and authenticated guest-route hits in **navigation** specs |
| Avoid duplicating Sprint 01 | Do not re-matrix wrong-password / register validation; cite AUT-AUTH where logout/session already proven |
| returnUrl | Prefer composing Sprint 01 `loginWithReturnUrl` / deep-link workflow for N09/N14 |
| Unsafe returnUrl | Already AUT-AUTH-10 in Sprint 01 — **out of scope** to retest unless a nav regression is found |
| Adapter vs UI | Use `authenticatedUser` for shell matrix speed; use UI login only when login is part of the journey under test |

---

## 16. Browser navigation strategy

| Concern | Approach |
|---|---|
| History API | Use Playwright `page.goBack()` / `page.goForward()` after deterministic `goto` or menu sequences |
| Assertions | Assert URL (and active nav where stable); optional shell readiness — no arbitrary timeouts |
| Auth interaction | History must not resurrect a cleared session after logout |
| Fragments | Assert `hash` when Forms/Applications links are under test |
| Independence | Each test starts from `guestPage` or `authenticatedUser`; no order dependence |

---

## 17. Acceptance Criteria

Sprint 02 implementation is acceptable when **all** are true:

1. Portal shell navigation page object exists under shared pages; Landing reuse is intact; specs cover §11 N01–N14 intent.  
2. Sprint 00 + Sprint 01 reused; no duplicated auth/tag/adapter logic; auth suite remains green.  
3. Positive cases in §12 automated and green (representative matrix OK).  
4. Negative cases in §13 automated and green.  
5. Edge cases in §14 covering history + wildcard + post-logout protection green.  
6. At least one `@smoke` navigation path and one `@critical` deep-link/guard navigation journey.  
7. AUT-NAV-01…04 intents covered and mapped.  
8. No Workspace widget/draft/stats asserts; no Dynamic Form fill/submit; no AI/Voice/PDF automation.  
9. Sprint 00 harness `@smoke` and Sprint 01 auth `@smoke`/`@critical` still pass.  
10. Specs tagged with `@navigation` and appropriate suite/outcome tags.  
11. Traceability to `AUT-NAV-*` documented.  
12. Code review against Sprint 00/01 standards + this contract complete.

---

## 18. Definition of Done

Sprint 02 is **complete** when:

1. This specification is **Approved**.  
2. Implementation satisfies §17 Acceptance Criteria.  
3. Sprint Review completed and recorded.  
4. `specs/playwright/README.md` updated to Sprint 02 Done.  
5. No open P0 navigation automation defects blocking Sprint 03.  
6. Team authorized to author `SPRINT-03-WORKSPACE.md` next.  
7. **Sprint 03 must not begin implementation** until this Definition of Done is met.

---

## 19. Review checklist

### 19.1 Specification review (this document)

- [ ] Scope limited to Landing & Navigation (no workspace/forms business)  
- [ ] Reuses Sprint 00 kernel and Sprint 01 authentication explicitly  
- [ ] AUT-NAV coverage mapped  
- [ ] Ownership matches `02-PROJECT-STRUCTURE` (shell in shared; landing in auth)  
- [ ] Handoff / gates clear  

### 19.2 Implementation review (after coding)

- [ ] Portal shell PO under `shared/pages`; no Workspace POs for chrome  
- [ ] Workflows have no assertions / no raw locators  
- [ ] Fixtures compose Sprint 01 auth fixtures  
- [ ] Deep-link tests stop at route readiness (no form automation)  
- [ ] Tags correct; smoke/critical present  
- [ ] Harness + auth smoke still green  
- [ ] No out-of-scope modules automated  
- [ ] Locator hierarchy followed; active-state asserts stable  

---

## 20. Risks

| Risk | Mitigation |
|---|---|
| Brittle menu markup | Prefer `getByRole('navigation')` + accessible names; centralize in `PortalShellPage` |
| Coupling nav tests to Workspace content | Assert URL/shell/active only |
| Fragment scroll flake | Assert location hash; avoid pixel-perfect scroll asserts |
| Duplicating Sprint 01 guard suites | Reuse workflows; keep nav specs focused on matrix gaps |
| Expanding thin logout chrome incorrectly | Extend one shell page object; update auth logout callers to shared shell |
| Deep-link mistaken for Forms sprint | Explicit AC: no field fill/submit |
| History + SPA timing | Rely on Playwright auto-wait + URL assertions |

---

## 21. Sprint dependencies

| Dependency | Required for Sprint 02 |
|---|---|
| Sprint 00 foundation | Config, tags, adapter, base page, CI smoke |
| Sprint 01 authentication | Session fixtures, login/logout/returnUrl workflows, Landing/Login pages, guard baseline |
| App routes (`app.routes.ts`) | Landing/guest routes; PortalShell children; `**` → `''` |
| Portal shell template | Nav labels, brand link, active class, logout |
| Shared `ROUTES` / `SCENARIO_IDS` | Direct URL and deep-link data |

Sprint 02 **must not** re-initialize Playwright or invent a parallel tree.  
Sprint 02 **must not** modify Sprint 00/01 contracts except additive shell extension required for nav.

---

## 22. Implementation handoff

**Sprint 02 planning is complete** when this document’s header `Status` is set to **Approved**.

### What happens next

1. **After Sprint 02 is approved, implementation begins** — and only then.  
2. **No implementation should occur before approval** of this specification.  
3. Implement strictly within §4 In Scope; follow §6 repository impact and Sprint 00/01 reuse rules.  
4. **Sprint 03 (Workspace) cannot begin** (neither authoring beyond gate nor implementation) until Sprint 02 satisfies its **Definition of Done** (§18).  
5. Do not treat chat history as authoritative over this contract once Approved.

### Implementation contract summary

| Allowed | Forbidden |
|---|---|
| Landing entry reuse; portal shell nav PO/workflows/data/specs; deep-link **route** arrival; history; wildcard; active state; nav smoke/critical | Workspace widgets/drafts/stats; form fill/submit; joint; AI/voice/PDF; a11y/visual/responsive/perf; redesigning Sprint 00/01; parallel fixture systems |

### App behaviour anchors (for implementers)

| Behaviour | Live app fact |
|---|---|
| Invalid routes | `path: '**'` → `redirectTo: ''` (no dedicated 404 component) |
| Shell Forms / Applications | Links to `/dashboard` with fragments `workflows` / `applications` |
| Brand | `routerLink="/dashboard"` |
| Active class | `portal-nav-link-active` |
| Logout | Clears session and navigates to `/login` |

---

## 23. Exit criteria (specification)

This sprint specification may be marked **Approved** when reviewers confirm:

1. Overview, objectives, and scope are accepted.  
2. Deliverables, POs, workflows, fixtures, and scenarios cover AUT-NAV-01…04 intent.  
3. Acceptance Criteria and Definition of Done are testable.  
4. Sprint 00/01 reuse rules are binding.  
5. Implementation Handoff (§22) is accepted.

---

## Document control

| Role | Name | Date | Decision |
|---|---|---|---|
| Author | Automation Architect (Cursor) | 2026-07-20 | In Review |
| Reviewer | Product / QA Lead | 2026-07-20 | **Approved** — implementation authorized |

**Next after approval:** Sprint 02 **implementation** (Specification Mode ends for this sprint).  
**Next after Sprint 02 DoD:** Author `SPRINT-03-WORKSPACE.md` (Specification Mode).
