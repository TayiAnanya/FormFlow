/**
 * Environment helpers for FormFlow Playwright (Sprint 00).
 * Reserved flags AI_LIVE / DATA_SETUP are documented for later sprints.
 */
export const env = {
  baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4200',
  isCI: !!process.env.CI,
  /** Reserved — Sprint 06+ optional live Gemini. */
  aiLive: process.env.AI_LIVE === '1',
  /** Reserved — future `localStorage` | `api` data setup mode. */
  dataSetup: (process.env.DATA_SETUP ?? 'localStorage') as 'localStorage' | 'api',
  defaultTimeoutMs: Number(process.env.PLAYWRIGHT_TIMEOUT_MS ?? 30_000),
  actionTimeoutMs: Number(process.env.PLAYWRIGHT_ACTION_TIMEOUT_MS ?? 15_000),
  /** Draft autosave debounce in the app is ~600ms; buffer for future waits. */
  draftDebounceBufferMs: 700,
} as const;
