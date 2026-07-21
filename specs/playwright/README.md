# FormFlow Playwright Automation — Specification Workspace

**Document Type:** Specification Workspace Guide  
**Project:** FormFlow Playwright Automation  
**Version:** 1.0  
**Status:** Approved  
**Related:** [../001-formflow/](../001-formflow/) (application Spec-Driven Development)

---

## 1. Why this folder exists

FormFlow already follows **Spec-Driven Development (SDD)** for the Angular application under [`specs/001-formflow/`](../001-formflow/).

This folder — [`specs/playwright/`](./) — extends the **same methodology** to the Playwright automation program.

These documents are the **authoritative source** for:

- Automation architecture  
- Implementation planning  
- Sprint planning  
- Engineering governance  

Chat history, Cursor plans, and ad-hoc notes are **not** authoritative once a document in this folder is **Approved**.

---

## 2. Relationship to application specs

| Tree | Owns |
|---|---|
| [`specs/001-formflow/`](../001-formflow/) | Product behaviour, schema contract, app design |
| [`specs/playwright/`](./) | How automation verifies that product, and how the framework is built |

Automation requirements must remain traceable to application features in `001-formflow`. Framework shape must not invent product behaviour the app does not have.

---

## 3. Document map

### Foundation (must be Approved before any sprint is authored)

| Document | Role |
|---|---|
| [00-AUTOMATION-ARCHITECTURE.md](./00-AUTOMATION-ARCHITECTURE.md) | Binding architecture: layers, hybrid modules, tags, adapter, governance principles |
| [01-IMPLEMENTATION-SPEC.md](./01-IMPLEMENTATION-SPEC.md) | **What** must be automated (coverage, journeys, acceptance) |
| [02-PROJECT-STRUCTURE.md](./02-PROJECT-STRUCTURE.md) | Canonical `frontend/e2e/` tree and ownership |
| [03-IMPLEMENTATION-ROADMAP.md](./03-IMPLEMENTATION-ROADMAP.md) | Sprint sequencing and quality gates |

### Sprint specifications (only after foundation Approved)

| Document | Role |
|---|---|
| [SPRINT-00-FOUNDATION.md](./SPRINT-00-FOUNDATION.md) | Framework harness — **Approved** (implemented) |
| [SPRINT-01-AUTHENTICATION.md](./SPRINT-01-AUTHENTICATION.md) | Auth automation — **Done** |
| [SPRINT-02-LANDING-NAVIGATION.md](./SPRINT-02-LANDING-NAVIGATION.md) | Landing & shell navigation — **Done** |
| [SPRINT-03-WORKSPACE.md](./SPRINT-03-WORKSPACE.md) | Workspace / dashboard — **Done** |
| [SPRINT-04-DYNAMIC-FORMS.md](./SPRINT-04-DYNAMIC-FORMS.md) | Schema-driven forms — **Done** |
| [SPRINT-05-JOINT-ACCOUNT.md](./SPRINT-05-JOINT-ACCOUNT.md) | Joint / family account — **Done** |
| [SPRINT-06-AI-FEATURES.md](./SPRINT-06-AI-FEATURES.md) | Smart Banking Advisor — **Done** |
| [SPRINT-07-QUALITY.md](./SPRINT-07-QUALITY.md) | Cross-cutting quality (responsive, keyboard, resilience, smoke/critical gates) — **Done** |
| [SPRINT-08-RELEASE.md](./SPRINT-08-RELEASE.md) | Release readiness, documentation, handover — **Done** |

**Project status:** Playwright automation **v1 released** (Sprints 00–08 complete). Operator docs: [`frontend/e2e/README.md`](../../frontend/e2e/README.md).

---

## 4. Hard gates (non-negotiable)

| Gate | Rule |
|---|---|
| **Sequential authoring** | Each specification must be **completed, reviewed, and Approved** before the **next** is **authored** |
| **Sprint gate** | Sprint specs may begin **only after** `00`–`03` are all **Approved** |
| **Implementation gate** | Code in `frontend/e2e` may begin **only after** `SPRINT-00-FOUNDATION` is **Approved** |
| **No leapfrog** | Implementation must **never** begin directly from architecture documents alone |
| **Architecture fidelity** | Foundation docs refine the approved Architecture Review; they must **not** introduce conflicting decisions without **explicit architectural review** |

### Status workflow

`Draft` → `In Review` → `Approved` → (optional) `Superseded`

Only **Approved** documents unlock the next authoring step.

---

## 5. Recommended reading order

1. This README (process and gates)  
2. [00-AUTOMATION-ARCHITECTURE.md](./00-AUTOMATION-ARCHITECTURE.md)  
3. `01-IMPLEMENTATION-SPEC.md` (when Approved)  
4. `02-PROJECT-STRUCTURE.md` (when Approved)  
5. `03-IMPLEMENTATION-ROADMAP.md` (when Approved)  
6. Current sprint specification only  
7. Application context as needed: [`../001-formflow/spec.md`](../001-formflow/spec.md), [`schema-contract.md`](../001-formflow/schema-contract.md)

Do **not** skip ahead to sprint docs or implementation while foundation documents are still Draft / In Review.

---

## 6. Engineering lifecycle

```text
Automation Architecture          (00)
        ↓ Approved
Implementation Specification    (01)
        ↓ Approved
Project Structure               (02)
        ↓ Approved
Implementation Roadmap          (03)
        ↓ All foundation Approved
Sprint Specifications           (00→09, sequential)
        ↓ Sprint 00 Approved
Framework Implementation        (frontend/e2e harness)
        ↓
Feature Automation              (Sprints 01–06)
        ↓
Regression & Quality Engineering (Sprints 07–08)
        ↓
CI/CD
        ↓
Release                         (Sprint 09)
```

---

## 7. How specifications relate to implementation

| Phase | Spec owns | Code location |
|---|---|---|
| Foundation docs | Architecture, coverage intent, folder contract, roadmap | None |
| Sprint 00 Approved | Harness scope and exit criteria | `frontend/e2e/` scaffold begins |
| Later sprints Approved | Feature automation scope | Feature modules under `frontend/e2e/` |

**Conflict rule**

- `00` wins on framework shape (layers, hybrid modules, tags, adapter, governance).  
- `01` wins on *what* must be covered.  
- `02` wins on folder paths and import rules.  
- `03` wins on sequencing and CI cadence.  
- Sprint specs win on *what this sprint delivers*.  

If a draft conflicts with Approved architecture → stop → architectural review → amend `00` (cascade) → re-approve → continue.

---

## 8. How new contributors should use these documents

1. Read this README and confirm which documents are **Approved**.  
2. Read all Approved foundation docs before touching code.  
3. Work only from the **current Approved sprint** specification.  
4. Do not invent folders, tags, or patterns that contradict `00` / `02`.  
5. If requirements are unclear, amend the relevant **spec** first — then implement.  
6. Never treat Cursor chat as the backlog once this workspace exists.

---

## 9. How sprint specs build on the architecture

- Sprint docs **reference** AUT-* requirement IDs from `01` (once authored).  
- Sprint deliverable paths **must** match `02`.  
- Sprint order and gates **must** match `03`.  
- Sprint scope may narrow architecture for timeboxing but must **not** redefine architecture without review.

---

## 10. Current progress

| Document | Status |
|---|---|
| README (this file) | Approved |
| 00–03 Foundation | Approved |
| SPRINT-00 … SPRINT-07 | Done |
| SPRINT-08-RELEASE | Done — **Playwright automation v1 complete** |

---

## 11. Next action

Playwright automation **v1 is released**. Maintain via contribution guide; future enhancements are listed in `frontend/e2e/docs/known-limitations.md`. No Sprint 09.
