# Shared navigation specs

Sprint 02 — Landing & Navigation automation.

| Spec | Coverage |
|---|---|
| `nav.landing.spec.ts` | N01–N02 landing entry (AUT-NAV-02) |
| `nav.shell.spec.ts` | Shell menu, fragments, brand, active state, direct URL (AUT-NAV-01) |
| `nav.guards.spec.ts` | Guest protected, guest-only bounce, logout block, critical deep-link |
| `nav.deep-link.spec.ts` | Authenticated form deep-link + refresh |
| `nav.history.spec.ts` | Browser back/forward |
| `nav.wildcard.spec.ts` | Invalid routes (AUT-NAV-04) |

Run: `npx playwright test e2e/shared/specs/navigation`
