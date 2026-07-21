# Smart Document Assist — Recovery Inventory

**Cutoff:** agent transcript line 542 (just before Customer Profile + Smart Assist deletion).  
**Era:** post-Gemini LLM (pdf.js text → PII mask → Gemini → FieldMappingService → `patchValue()`).  
**Customer Profile:** intentionally excluded.

Recovered sources live under `frontend/_restore_smart_assist/recovered/` mirroring `frontend/`.

---

## A) Files to restore (relative to `frontend/`)

### Feature folder (copy as-is)

| Path |
|------|
| `src/app/features/smart-assist/models/document-extraction.model.ts` |
| `src/app/features/smart-assist/services/document-extraction.service.ts` |
| `src/app/features/smart-assist/services/document-extraction.service.spec.ts` |
| `src/app/features/smart-assist/services/document-parser.service.ts` |
| `src/app/features/smart-assist/services/field-mapping.service.ts` |
| `src/app/features/smart-assist/services/field-mapping.service.spec.ts` |
| `src/app/features/smart-assist/services/ai-extraction.types.ts` |
| `src/app/features/smart-assist/services/ai-extraction.types.spec.ts` |
| `src/app/features/smart-assist/services/ai-extraction.service.ts` |
| `src/app/features/smart-assist/services/ai-extraction.service.spec.ts` |
| `src/app/features/smart-assist/services/gemini-language-model.provider.ts` |
| `src/app/features/smart-assist/utils/form-patch.util.ts` |
| `src/app/features/smart-assist/utils/form-patch.util.spec.ts` |
| `src/app/features/smart-assist/utils/document-text.reader.ts` |
| `src/app/features/smart-assist/utils/document-text.reader.spec.ts` |
| `src/app/features/smart-assist/utils/document-field.parser.ts` |
| `src/app/features/smart-assist/utils/document-field.parser.spec.ts` |
| `src/app/features/smart-assist/utils/document-pii.mask.ts` |
| `src/app/features/smart-assist/utils/document-pii.mask.spec.ts` |
| `src/app/features/smart-assist/testing/pdf-test.helpers.ts` |
| `src/app/features/smart-assist/components/document-upload/document-upload.component.ts` |
| `src/app/features/smart-assist/components/document-upload/document-upload.component.html` |
| `src/app/features/smart-assist/components/document-upload/document-upload.component.css` |
| `src/app/features/smart-assist/components/smart-assist-panel/smart-assist-panel.ts` |
| `src/app/features/smart-assist/components/smart-assist-panel/smart-assist-panel.html` |
| `src/app/features/smart-assist/components/smart-assist-panel/smart-assist-panel.css` |
| `src/app/features/smart-assist/components/smart-assist-panel/smart-assist-panel.spec.ts` |
| `src/app/features/smart-assist/index.ts` |

### Environments + proxy

| Path | Notes |
|------|-------|
| `src/environments/environment.ts` | prod; empty key; `gemini-flash-latest` |
| `src/environments/environment.development.ts` | **API key redacted** → `YOUR_API_KEY_HERE`; base URL `/gemini-api/v1beta` |
| `src/environments/environment.example.ts` | template |
| `proxy.conf.json` | `/gemini-api` → Google Generative Language |
| `angular.json` | `fileReplacements` + `serve.options.proxyConfig` |

### Integration (merge carefully)

| Path | Action |
|------|--------|
| `src/app/app.config.ts` | ensure `provideHttpClient()` |
| `src/app/features/demo/form-host/form-host.ts` | Smart Assist imports + `onSmartAssistPatch` / `currentFormValues` |
| `src/app/features/demo/form-host/form-host.html` | `<app-smart-assist-panel>` above renderer |
| `src/app/features/renderer/dynamic-form-renderer/dynamic-form-renderer.ts` | add `patchFormValues` + `getFormValues` (full file reconstructed from live + methods) |
| `src/app/features/renderer/dynamic-form-renderer/dynamic-form-renderer.smart-assist.spec.ts` | integration tests |

### Dependency

| Change |
|--------|
| `package.json` → add `"pdfjs-dist": "4.10.38"` then `npm install` (see `PACKAGE_JSON_NOTE.md`) |

---

## B) Source code location

All finals are under `recovered/` (not inlined here). Parent agent should copy:

```
_restore_smart_assist/recovered/src/app/features/smart-assist/  → src/app/features/smart-assist/
_restore_smart_assist/recovered/src/environments/               → src/environments/
_restore_smart_assist/recovered/proxy.conf.json                 → proxy.conf.json
```

Then merge wiring files (form-host, renderer.ts, app.config, angular.json) — do **not** overwrite renderer `.html`/`.css` from this restore (those were deleted from recover set because transcript replay corrupted them; keep the live templates).

---

## C) Integration points

### Flow

```
Upload PDF
  → DocumentExtractionService.extractTextFromDocument (pdf.js / content streams)
  → AIExtractionService.extractStructuredFields
       → maskSensitiveIdentifiers (Aadhaar/PAN/passport)
       → GeminiLanguageModelProvider (HttpClient → /gemini-api/v1beta)
       → restoreSensitiveValuesOntoSchemaData
  → FieldMappingService.mapToSchemaFields
  → valuesReady → FormHost.onSmartAssistPatch
  → DynamicFormRenderer.patchFormValues → applyMappedValues → form.patchValue()
```

### `form-host`

- Imports `SmartAssistPanel`, `SmartAssistPatchRequest`
- Template hosts panel with `[schema]`, `[currentFormValues]`, `(valuesReady)`
- Customer Profile-specific title/docs helpers **removed** from recovered wiring

### `dynamic-form-renderer.ts`

```ts
patchFormValues(values, options = {}) {
  const result = applyMappedValues(this.schema, this.form, values, options);
  this.syncFieldVisibilityState();
  return result;
}

getFormValues() {
  return this.form.getRawValue();
}
```

### `app.config.ts`

- `provideHttpClient()` required for Gemini HTTP calls

### `angular.json`

- Development `fileReplacements`: `environment.ts` → `environment.development.ts`
- Serve `options.proxyConfig`: `proxy.conf.json`

---

## D) Environment vars (redacted)

| Key | Dev value (recovered) | Purpose |
|-----|----------------------|---------|
| `geminiApiKey` | `YOUR_API_KEY_HERE` | Google AI Studio key (was present in transcript; **rotated recommendation**) |
| `geminiModel` | `gemini-flash-latest` | Free-tier friendly model (`gemini-2.0-flash` hit HTTP 429) |
| `geminiApiBaseUrl` | `/gemini-api/v1beta` (dev) / full Google URL (prod) | Dev uses Angular proxy to avoid CORS |

---

## Evidence sources

1. Agent transcript `e4eb6e37-…jsonl` Write/StrReplace through line 541
2. Karma `dist/test-out/.../*.js.map` `sourcesContent` (Gemini-era compiled sources)
3. Compiled `chunk-635JQFBT.js` confirmed `patchFormValues` / `getFormValues`

## Caveats

- `document-field.parser.ts` remains in the tree (earlier regex phase) but the **runtime path no longer uses it** for understanding — Gemini does.
- A real Gemini API key was briefly in `environment.development.ts` in the chat transcript (`AQ.…`); recovered file uses `YOUR_API_KEY_HERE`. Rotate that key if it is still active.
- Cursor `%APPDATA%\Cursor\User\History` had no smart-assist entries.
- No git history available in this workspace.
