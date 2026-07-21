/**
 * Playwright title-tag constants (Sprint 00).
 * Apply in test titles, e.g. `@smoke harness health`.
 */
export const TAGS = {
  smoke: '@smoke',
  critical: '@critical',
  regression: '@regression',
  journey: '@journey',
  e2e: '@e2e',
  integration: '@integration',
  performance: '@performance',
  auth: '@auth',
  workspace: '@workspace',
  forms: '@forms',
  renderer: '@renderer',
  joint: '@joint',
  advisor: '@advisor',
  voice: '@voice',
  pdf: '@pdf',
  navigation: '@navigation',
  security: '@security',
  responsive: '@responsive',
  a11y: '@a11y',
  visual: '@visual',
  aiLive: '@ai-live',
  happy: '@happy',
  negative: '@negative',
  boundary: '@boundary',
  quarantine: '@quarantine',
} as const;

/** PR gate grep expression (smoke or critical). */
export const GREP_PR_GATE = `${TAGS.smoke}|${TAGS.critical}`;
