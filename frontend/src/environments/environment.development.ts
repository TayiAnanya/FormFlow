/**
 * Development environment configuration.
 * Set geminiApiKey locally for optional Gemini-backed demos.
 * Label-based document extraction works without a key.
 *
 * Use a Google AI Studio API key from https://aistudio.google.com/apikey
 */
export const environment = {
  production: false,
  geminiApiKey: 'YOUR_API_KEY_HERE',
  geminiModel: 'gemini-flash-latest',
  /**
   * Proxied through Angular dev-server (proxy.conf.json) to avoid browser CORS issues.
   * Real Google host: https://generativelanguage.googleapis.com/v1beta
   */
  geminiApiBaseUrl: '/gemini-api/v1beta',
};
