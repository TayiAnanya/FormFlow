/**
 * Application environment configuration.
 * Never commit real API keys. Prefer local overrides or CI secrets.
 */
export const environment = {
  production: true,
  /**
   * Google Gemini API key for Smart Document Assist.
   * Leave empty to disable AI extraction until configured.
   */
  geminiApiKey: '',
  /** Gemini model id — swap providers later via AIExtractionService.setProvider(). */
  geminiModel: 'gemini-flash-latest',
  geminiApiBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
};
