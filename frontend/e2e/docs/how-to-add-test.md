# How to add a test

1. Confirm coverage is allowed by an **Approved** sprint spec (or a reviewed amendment).  
2. Place the file under the owning feature `specs/` folder.  
3. Import `test` / `expect` from `e2e/shared/fixtures`.  
4. Tag with constants from `shared/config/test-tags.ts`.  
5. Prefer existing workflows / page objects; extend them instead of duplicating.  
6. Keep assertions in the spec; keep workflows assertion-free.  
7. Update [`traceability-matrix.md`](./traceability-matrix.md) if you introduce a new AUT ID.

## Do not

- Add business automation under `quality/` (quality is cross-cutting NFR only).  
- Put locators in specs when a page object already exists.  
- Commit `playwright-report/` or `test-results/`.
