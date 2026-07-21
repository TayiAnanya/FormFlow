/**
 * FormFlow layer boundaries — implementation invariant (Design §5, NFR-02).
 *
 * Demo Layer: Banking Portal presentation, scenario catalog, form host chrome.
 * Renderer Layer: Configuration-driven Dynamic Form Renderer (product engine).
 */
export const APP_LAYERS = {
  DEMO: 'features/demo',
  RENDERER: 'features/renderer',
} as const;

export type AppLayer = (typeof APP_LAYERS)[keyof typeof APP_LAYERS];
