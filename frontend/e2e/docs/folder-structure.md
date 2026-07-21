# Folder structure

**Blueprint:** [`specs/playwright/02-PROJECT-STRUCTURE.md`](../../../specs/playwright/02-PROJECT-STRUCTURE.md)

## Live tree (v1)

```text
frontend/e2e/
├── README.md
├── docs/                    # Operator & maintainer guides (Sprint 08)
├── shared/                  # Kernel + navigation specs
├── authentication/          # Sprint 01
├── workspace/               # Sprint 03
├── forms/                   # Sprint 04 (+ joint/ Sprint 05)
├── advisor/                 # Sprint 06
├── quality/                 # Sprint 07
├── journeys/                # Reserved (empty shell)
├── pdf/                     # Reserved
├── voice/                   # Reserved
├── metrics/                 # Reserved
└── .auth/                   # Gitignored storage state (README only)
```

## Ownership

| Path | Owner sprint |
|---|---|
| `shared/` | 00 / 02 |
| `authentication/` | 01 |
| `workspace/` | 03 |
| `forms/` | 04–05 |
| `advisor/` | 06 |
| `quality/` | 07 |
| `docs/` | 08 |

Reserved folders keep a README only — do not treat them as incomplete defects.
