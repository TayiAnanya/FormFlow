/**
 * Copy to environment.development.ts (or fill environment.development.ts)
 * and set your Gemini API key for local demos.
 *
 * Get a key from Google AI Studio:
 * https://aistudio.google.com/apikey
 */
export const environmentExample = {
  production: false,
  geminiApiKey: 'YOUR_API_KEY_HERE',
  geminiModel: 'gemini-flash-latest',
  /**
   * Dev: prefer '/gemini-api/v1beta' with proxy.conf.json.
   * Prod: 'https://generativelanguage.googleapis.com/v1beta'
   */
  geminiApiBaseUrl: '/gemini-api/v1beta',
};
