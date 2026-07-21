# Traceability matrix

Maps automation domains to AUT IDs and primary specs. Product behaviour: [`specs/001-formflow/`](../../../specs/001-formflow/).

## By domain

| Domain | AUT IDs | Module | Primary specs |
|---|---|---|---|
| Harness | — | `shared/specs/` | `harness.health.spec.ts` |
| Authentication | AUT-AUTH-01…10 | `authentication/` | `landing.navigation`, `auth.flows`, `auth.guards`, `auth.session`, `auth.storage` |
| Navigation | AUT-NAV-01…04 | `shared/specs/navigation/` | `nav.landing`, `nav.shell`, `nav.guards`, `nav.deep-link`, `nav.history`, `nav.wildcard` |
| Workspace | AUT-WS-01…08 | `workspace/` | `ws.landing`, `ws.panels`, `ws.recommendations`, `ws.persistence`, `ws.journeys`, `ws.smoke-critical` |
| Dynamic forms | AUT-FORM / AUT-REN | `forms/` | `df.*`, `renderer/*`, `scenarios/*` |
| Joint account | AUT-JOINT-01…06 | `forms/joint` + joint specs | `ja.management`, `ja.conditionals`, `ja.duplicates`, `ja.drafts`, `ja.journeys`, `ja.smoke-critical` |
| Advisor | AUT-ADV-01…10 | `advisor/` | `adv.landing` … `adv.smoke-critical` |
| Quality | AUT-QA-01…08 | `quality/` | `qa.responsive`, `qa.keyboard`, `qa.loading-error`, `qa.network-offline`, `qa.session-unauthorized`, `qa.final-checks`, `qa.gates` |

## Journey IDs (representative)

| Journey family | Examples | Module |
|---|---|---|
| Workspace | J-WS-A…J-WS-J | `workspace/specs` |
| Dynamic forms | J-DF-* | `forms/specs` |
| Joint | J07 / J08 / J19 / J20 (via AUT-JOINT) | `forms/specs/joint-family-account` |
| Advisor | J-ADV-A…G | `advisor/specs` |
| Quality | J-QA-A…F | `quality/specs` |

## Sprint contracts

| Sprint | Spec |
|---|---|
| 00–07 | `specs/playwright/SPRINT-0N-*.md` |
| 08 Release | `specs/playwright/SPRINT-08-RELEASE.md` |
