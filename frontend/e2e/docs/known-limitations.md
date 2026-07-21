# Known limitations (v1 release)

| Limitation | Detail |
|---|---|
| Chromium is the PR gate | Firefox / WebKit supported via projects; CI smoke stays `--project=chromium` |
| Full cross-browser regression | Opt-in via `test:cross-browser`; default scripts are Chromium-only to avoid 3× inventory |
| Firefox form submit (smoke) | Two `@smoke` paths can miss success banners on Firefox: account-opening submit and joint multi-applicant (J07). Chromium and WebKit smoke are green. Likely PrimeNG overlay / control commit timing under Firefox — investigate app + `selectDropdownOption` / date fill; do not weaken assertions |
| WebKit joint fills | Multi-row joint fills need longer test timeouts than Chromium (already applied on heavy smoke paths) |
| localStorage backend | Demo auth/workspace — not a REST API |
| No real session TTL | Quality simulates expiry via cleared storage |
| No offline product UI | Tests use `setOffline` / route abort; no offline page |
| Shell nav &lt;768px | Nav hidden; no hamburger menu |
| Advisor AI mocked | Live Gemini optional (`AI_LIVE` / `@ai-live`) — not PR gate |
| Accessibility | Keyboard + landmark smoke — not full axe |
| Visual | Landmark sanity — not pixel baselines |
| Performance | Soft budgets not automated |
| `journeys/` folder | Reserved; cross-feature journeys live in feature modules |
| Voice / PDF automation | Not in v1 |
| Occasional long-run `page.goto` timeouts | Seen under heavy load; re-run the isolated suite if needed |
| Monolithic full-suite `webServer` drop | On Windows, a single `npx playwright test` (all 400) may lose `localhost:4200` mid-run if Playwright-managed `ng serve` exits. Prefer sequential module suites against a manually started `ng serve`, or ensure `reuseExistingServer: true` with a healthy server |
| Windows `ENOTEMPTY` on `test-results` | Rare race when Playwright deletes `test-results` between runs; delete the folder manually and retry |
| Sandbox / missing browser binaries | Fresh environments need `npx playwright install` (or at least `chromium`) before the first run |

## Future enhancements

1. Scheduled full-regression CI workflow (optional multi-browser smoke)  
2. Optional consolidated `journeys/` catalogue  
3. axe-core critical/serious gate on agreed pages  
4. Selective visual baselines  
5. Soft performance budgets + metrics collectors  
6. Voice Assist + PDF Smart Assist automation  
7. `DataSetupAdapter` API mode when backend exists  
8. Flake / quarantine dashboard  

See also Sprint 07–08 Gap Analysis sections in `specs/playwright/`.
