# FormFlow

A schema-driven dynamic form renderer for banking-style workflows, built with Angular. FormFlow turns JSON configuration into fully interactive forms — no hardcoded templates required.

## Features

- **Dynamic form rendering** — A single reusable renderer builds UI from schema definitions
- **Schema-driven configuration** — Fields, labels, validation, and behaviour are defined in JSON
- **Reactive Forms** — Angular `FormGroup` / `FormControl` model built programmatically from schema
- **Required and pattern validation** — Plus min/max, minLength/maxLength, and date rules (age, future dates)
- **Conditional visibility (`visibleWhen`)** — Show or hide fields based on other field values
- **Hidden, readonly, and disabled fields** — Schema-controlled presentation and interaction
- **Schema switching** — Route between form scenarios without duplicating renderer code
- **Dynamic submission output** — Flat JSON captured on successful submit
- **PDF export** — Client-side downloadable PDF after submission (jsPDF)
- **Unit tests** — 57 Jasmine/Karma tests across validators, utilities, services, and components

## Technologies Used

| Technology | Purpose |
|---|---|
| Angular | Application framework |
| TypeScript | Language |
| PrimeNG | UI components (inputs, dropdowns, date picker, etc.) |
| Tailwind CSS | Utility-first styling |
| Reactive Forms | Form state and validation |
| Jasmine & Karma | Unit testing |
| Playwright | End-to-end UI automation (`frontend/e2e/`) |

## Playwright E2E (v1 release)

Automation lives under `frontend/e2e/`. Specs and architecture: [`specs/playwright/`](./specs/playwright/).

Browsers: **Chromium** (PR gate), **Firefox**, **WebKit**.

```bash
cd frontend
npm ci
npx playwright install chromium
npm run test:e2e:smoke -- --project=chromium   # PR gate
npm run test:chromium                          # Chromium full suite
npm run test:cross-browser -- --grep "@smoke"  # smoke on all browsers
npm run test:e2e:report
```

Operator guide: [`frontend/e2e/README.md`](./frontend/e2e/README.md).

## Steps to Run the Application

```bash
cd frontend
npm install
ng serve
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

### Optional: Gemini API key (local only)

Smart Document Assist / live Gemini demos need a Google AI Studio key. Label-based extraction works without one.

1. Copy the pattern from `frontend/src/environments/environment.example.ts`
2. Set `geminiApiKey` in `frontend/src/environments/environment.development.ts` (replace `YOUR_API_KEY_HERE`)
3. Get a key from [Google AI Studio](https://aistudio.google.com/apikey)

**Never commit a real API key.** Keep secrets in your local `environment.development.ts` only (or CI secrets for `@ai-live` tests).

## JSON Schema Format

FormFlow schemas follow a flat JSON contract. Schemas live in `frontend/src/app/schemas/bundled/`.

### Root properties

| Property | Required | Description |
|---|---|---|
| `id` | Yes | Unique schema identifier (used in routing) |
| `title` | Yes | Display name shown in the UI |
| `description` | No | Short description of the form |
| `submitLabel` | No | Submit button text (defaults to `"Submit"`) |
| `fields` | Yes | Array of field definitions |

### Field properties

| Property | Required | Description |
|---|---|---|
| `key` | Yes | Unique field name (maps to `FormControl` and submission key) |
| `type` | Yes | `text`, `textarea`, `date`, `dropdown`, `multiselect`, or `checkbox` |
| `label` | Yes | Display label |
| `placeholder` | No | Placeholder text for text-based inputs |
| `defaultValue` | No | Initial value |
| `validation` | No | Validation rules and error messages |
| `options` | No | `{ label, value }[]` for `dropdown` and `multiselect` |
| `visibleWhen` | No | Conditional visibility rule (see below) |
| `hidden` | No | When `true`, field is omitted from the UI |
| `readonly` | No | When `true`, field is visible but not editable (`text` / `textarea`) |
| `disabled` | No | When `true`, field is visible but non-interactive |

### Validation properties

| Property | Applies to | Description |
|---|---|---|
| `required` | All types | Field must have a value |
| `pattern` | `text`, `textarea` | Regex pattern |
| `minLength` / `maxLength` | `text`, `textarea` | String length bounds |
| `min` / `max` | `text`, `textarea` | Numeric bounds |
| `minimumAge` / `maximumAge` | `date` | Age in years |
| `allowFutureDates` | `date` | Set `false` to reject future dates |
| `messages` | — | Custom error messages per rule |

### `visibleWhen` rule

```json
"visibleWhen": {
  "field": "employmentStatus",
  "operator": "equals",
  "value": "student"
}
```

The field is shown only when the referenced field's current value equals `value`.

### Example schema

```json
{
  "id": "account-opening",
  "title": "Account Opening",
  "description": "Apply for a new savings or current account.",
  "submitLabel": "Submit Application",
  "fields": [
    {
      "key": "fullName",
      "type": "text",
      "label": "Full Name",
      "placeholder": "Enter your full name",
      "validation": {
        "required": true,
        "messages": { "required": "Full name is required" }
      }
    },
    {
      "key": "accountType",
      "type": "dropdown",
      "label": "Account Type",
      "options": [
        { "label": "Savings", "value": "savings" },
        { "label": "Current", "value": "current" }
      ],
      "validation": {
        "required": true,
        "messages": { "required": "Please select an account type" }
      }
    },
    {
      "key": "termsAccepted",
      "type": "checkbox",
      "label": "I accept the terms and conditions",
      "defaultValue": false,
      "validation": {
        "required": true,
        "messages": { "required": "You must accept the terms and conditions" }
      }
    }
  ]
}
```

## Example Submission Output

On successful submit, FormFlow produces a flat JSON object keyed by field `key`. Only visible fields are included — hidden fields and fields whose `visibleWhen` condition is false are excluded.

```json
{
  "fullName": "Ananya Tayi",
  "email": "ananya@example.com",
  "mobileNumber": "9876543210",
  "dateOfBirth": "2000-05-15",
  "cardType": "gold",
  "preferredBranch": "mumbai_bkc",
  "employmentStatus": "student",
  "collegeName": "Delhi University",
  "studentId": "STU2024001234",
  "graduationYear": "2027",
  "existingCustomer": false,
  "applicationNumber": "CC-2026-00001",
  "termsAccepted": true
}
```

The same output is shown in the UI after submit, with an option to copy JSON or download a PDF.
