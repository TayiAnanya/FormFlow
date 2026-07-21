# Contribution guide

1. Read [`specs/playwright/README.md`](../../../specs/playwright/README.md) gates.  
2. Work only within Approved sprint / change-request scope.  
3. Prefer amending specs before inventing structure.  
4. PR checklist:
   - `npm run test:e2e:smoke` green  
   - No architecture drift vs `00` / `02`  
   - No secrets committed  
   - Docs updated if commands or folders change  

## Code review focus

- Stable locators (roles, field keys)  
- Deterministic data (adapter / stubs)  
- No assertion logic in workflows  
- Tags correctly applied for the PR gate
