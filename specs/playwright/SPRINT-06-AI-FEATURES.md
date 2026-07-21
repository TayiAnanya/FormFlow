# Sprint 06 — AI Features (Smart Banking Advisor)

**Document Type:** Sprint Specification  
**Project:** FormFlow Playwright Automation  
**Sprint:** 06 — AI Features  
**Version:** 1.0  
**Status:** Done  
**Parent Document:** [03-IMPLEMENTATION-ROADMAP.md](./03-IMPLEMENTATION-ROADMAP.md) (Approved)  
**Depends on:**  
[SPRINT-00-FOUNDATION.md](./SPRINT-00-FOUNDATION.md) (Done) ·  
[SPRINT-01-AUTHENTICATION.md](./SPRINT-01-AUTHENTICATION.md) (Done) ·  
[SPRINT-02-LANDING-NAVIGATION.md](./SPRINT-02-LANDING-NAVIGATION.md) (Done) ·  
[SPRINT-03-WORKSPACE.md](./SPRINT-03-WORKSPACE.md) (Done) ·  
[SPRINT-04-DYNAMIC-FORMS.md](./SPRINT-04-DYNAMIC-FORMS.md) (Done) ·  
[SPRINT-05-JOINT-ACCOUNT.md](./SPRINT-05-JOINT-ACCOUNT.md) (Done)  
**Authoritative foundation:**  
[README.md](./README.md) · [00-AUTOMATION-ARCHITECTURE.md](./00-AUTOMATION-ARCHITECTURE.md) · [01-IMPLEMENTATION-SPEC.md](./01-IMPLEMENTATION-SPEC.md) · [02-PROJECT-STRUCTURE.md](./02-PROJECT-STRUCTURE.md)

**Traceability:** Primary AUT IDs — `AUT-ADV-01` … `AUT-ADV-10`. Journeys **J-ADV-A** … **J-ADV-G**. Reuses authenticated + workspace fixtures from Sprints 01/03. Voice Assist and PDF Smart Assist remain out of scope.

---

## 1. Sprint overview

| Field | Statement |
|---|---|
| **Sprint goal** | Automate the **Smart Banking Advisor** behavioural surface: entry, conversation phases, results cards, memory persistence, error/retry, and recommendation navigation — without asserting LLM quality. |
| **Business objective** | Prove customers can open Advisor, describe goals, receive product recommendations, recover from failures, and continue into banking forms with saved memory on the dashboard. |
| **Engineering objective** | Add `frontend/e2e/advisor/` (Page Object + workflows + Gemini stubs + data packs + `@advisor` specs); deliver ~**50–80** deterministic behavioural tests via matrices and journeys. |
| **Expected outcome** | AUT-ADV-01…10 green; J-ADV-A…G represented; Gap Analysis final; PR gate includes `@advisor` smoke/critical; prior suites remain green. |

---

## 2. Business objective

Validate the complete AI-assisted **application** experience:

- Advisor entry (route, shell nav, dashboard promo, empty-state link)
- Conversation controls (textarea, Send, suggestions, Start Over)
- Loading indicators and disabled controls during analysis
- Results: product cards, insights, health score tone, roadmap
- Navigation from product CTAs into existing form scenarios
- Saved memory in `ff_advisor_recommendations` and dashboard panel
- Error, empty, and retry behaviours with stable UI copy
- Refresh / localStorage persistence

Success is **behaviour around AI**, not model correctness.

---

## 3. Engineering objective

- Treat Gemini as an external dependency; stub via `page.route` for deterministic suites.
- Prefer reusable workflows (`stubAdvisor*`, `completeAdvisorFlow`, `readSavedRecommendations`).
- Assert phase transitions, control enablement, routes, and storage shape — not exact generated prose.
- Reuse `authenticatedUser`, `emptyWorkspaceUser`, `recommendationWorkspaceUser` (no new fixtures required).
- Tag with `@advisor`, `@smoke`, `@critical`, `@journey`, `@happy`, `@negative`, `@boundary`.

---

## 4. Scope

### In scope

Smart Banking Advisor (`/advisor`): landing, suggestions, submit, loading, results, Start Over, product CTA navigation, memory write/read, dashboard panel continuity, error/retry, refresh persistence, smoke/critical journeys.

### Out of scope

LLM quality / prompt engineering · Voice Assist · PDF Autofill · Accessibility · Performance · Full browser-matrix regression · Live Gemini as PR gate (`@ai-live` optional only).

### Binding product facts

| Fact | Detail |
|---|---|
| Phases | `idle` → `loading` → `results` \| `error` (single-turn) |
| Loading | `.advisor-loading`; 4 steps; `.advisor-loading-active` |
| Error copy | `BANKING_ADVISOR_ERROR_MESSAGE` |
| Memory key | `ff_advisor_recommendations` (one entry per user; overwrite) |
| Product map | Car/Home/Personal loan → `loan-inquiry`; Platinum/Gold → `smart-credit-card`; Savings/FD/RD/Current → `account-opening` |
| Prefill | In-memory `FormPrefillService` (not localStorage) |
| Start Over | Visible only in `results` and `error` |

---

## 5. Repository impact

```text
frontend/e2e/advisor/
├── README.md
├── pages/
│   ├── banking-advisor.page.ts
│   └── index.ts
├── workflows/
│   ├── advisor.workflow.ts
│   └── index.ts
├── data/
│   ├── advisor.packs.ts
│   ├── advisor.responses.ts
│   └── index.ts
└── specs/
    ├── adv.landing.spec.ts
    ├── adv.conversation.spec.ts
    ├── adv.results.spec.ts
    ├── adv.navigation.spec.ts
    ├── adv.persistence.spec.ts
    ├── adv.error.spec.ts
    ├── adv.journeys.spec.ts
    └── adv.smoke-critical.spec.ts
```

---

## 6. AI Page Objects

| PO | Responsibility |
|---|---|
| `BankingAdvisorPage` | Heading, textarea, Send/Start Over (scoped to `.advisor-chat-actions`), suggestions, user bubble, loading steps, error alert, results/product/insight/health/roadmap locators; phase helpers |

---

## 7. AI Workflows

| Helper | Role |
|---|---|
| `stubAdvisorSuccess` / `Delayed` / `Vague` / `HttpError` / `Empty` / `WithData` | Deterministic Gemini stubs |
| `openAdvisor` / `ViaNav` / `ViaPromo` | Entry paths |
| `fillAndSubmit` / `submitGoalAndAwaitResults` / `Error` | Conversation actions |
| `completeAdvisorFlow` / `completeAdvisorErrorFlow` | Happy / error compositions |
| `readSavedRecommendations` | Storage read for asserts |

---

## 8. AI Fixtures

None new. Reuse `authenticatedUser`, `emptyWorkspaceUser`, `recommendationWorkspaceUser`.

---

## 9. AI Test Data

| Module | Contents |
|---|---|
| `advisor.responses.ts` | Mock advisor JSON + Gemini envelopes (loan/card/savings/multi; vague/empty/invalid) |
| `advisor.packs.ts` | Goal packs, product→scenario map, error copy, loading step text, health-tone thresholds |

---

## 10. AI State Matrix

| State | Expected UI | Coverage |
|---|---|---|
| Idle | Textarea empty/enabled; Send disabled when blank; Start Over hidden; no results/error | Landing + conversation |
| Loading | Loading list visible; textarea/Send/suggestions disabled; user bubble shown | Conversation |
| Results | Results section + product cards; Start Over visible; loading hidden | Results + navigation |
| Error | Warn alert with static copy; Start Over visible; controls re-enabled | Error |
| Memory written | `ff_advisor_recommendations` has user entry | Persistence |
| Dashboard recall | Recommendation cards on workspace panel | Persistence + journeys |

---

## 11. AI Error Matrix

| ID | Trigger | Expected |
|---|---|---|
| ERR-01 | Blank / whitespace message | Send stays disabled; no submit |
| ERR-02 | Vague/unparseable model JSON | Error phase + static message |
| ERR-06 | HTTP 5xx from Gemini | Error phase |
| ERR-07 | Empty candidates | Error phase |
| ERR-09 | Error → fix stub → retry | Results phase |

---

## 12. User Journey Matrix

| ID | Journey | Status |
|---|---|---|
| J-ADV-A | Goal → results → loan CTA → form | Covered |
| J-ADV-B | Suggestion → submit → results | Covered |
| J-ADV-C | Vague error → retry → results | Covered |
| J-ADV-D | Submit → dashboard memory panel | Covered |
| J-ADV-E | Start Over → fresh conversation | Covered |
| J-ADV-F | Empty-state advisor link → submit | Covered |
| J-ADV-G | Savings → account-opening | Covered |

---

## 13–15. Scenarios

Positive: landing, suggestions, loading, results, health tones, CTA routes, persistence, overwrite memory, parameterized goal packs.  
Negative: blank/whitespace, disabled controls in loading, error visibility, results hidden on error.  
Edge: health green/amber/red tones; second submit overwrites one-per-user memory; refresh keeps localStorage.

---

## 16. Acceptance Criteria

- [x] Advisor module under `e2e/advisor/` with PO, workflows, data, 8 specs  
- [x] Deterministic Gemini stubbing (no live key required for PR suite)  
- [x] AUT-ADV-01…10 represented  
- [x] J-ADV-A…G represented  
- [x] Smoke + critical PR-gate slice  
- [x] Prior suites remain green in full regression  

---

## 17. Definition of Done

- [x] Spec Approved → Implementation Done  
- [x] ~50–80 meaningful advisor tests (92 delivered)  
- [x] Full regression: AI + Forms (incl. Joint) + Workspace + Auth + Nav + Harness  
- [x] Coverage Gap Analysis finalized  
- [x] Completion Report delivered  
- [x] Sprint 07 **not** started  

---

## 18. Coverage Gap Analysis (Sprint 06 final)

| Gap | Status | Notes |
|---|---|---|
| Live Gemini (`@ai-live`) | **Deferred** | Optional; excluded from PR gate |
| FormPrefill field-level asserts after CTA | **Partial** | Route navigation covered; deep field prefill deferred |
| Multi-turn conversation history | **N/A (product)** | Single-turn advisor only |
| Voice Assist | **Out of scope** | Sprint 07+ |
| PDF Smart Assist | **Out of scope** | Sprint 07+ |
| LLM quality / prompt eval | **Out of scope** | By design |
| A11y / visual / perf | **Sprints 07–08** | Explicitly excluded |
| Exhaustive product-name string matrix | **Partial** | loan / card / savings(+FD) parameterized; not every template |

---

## 19. Sprint dependencies

Depends on Sprints 00–05 (auth session, dashboard recommendations panel, form routes). Unlocks Sprint 07 Quality Engineering only after DoD sign-off.

---

## 20. Implementation handoff

**Code:** `frontend/e2e/advisor/`  
**Run:** `npx playwright test e2e/advisor/specs`  
**PR gate:** `--grep "@smoke|@critical"` includes `@advisor` smoke/critical  

| Role | Name | Date | Decision |
|---|---|---|---|
| Author | Automation Architect (Cursor) | 2026-07-20 | Spec Approved → Implementation **Done** |
| Reviewer | Engineering | 2026-07-20 | Implementation complete; awaiting Sprint Review sign-off |

**Next:** Engineering review of Completion Report.  
**After Sprint 06 DoD sign-off:** Author `SPRINT-07-QUALITY-ENGINEERING.md` (Specification Mode only — no Sprint 07 implementation yet).
