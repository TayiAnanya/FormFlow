export {
  mockAdvisorData,
  buildGeminiResponse,
  buildGeminiVagueResponse,
  buildGeminiEmptyResponse,
  buildGeminiInvalidScoreResponse,
  buildGeminiNoProductsResponse,
  mockHighScoreData,
  mockAmberScoreData,
  mockRedScoreData,
} from './advisor.responses';
export type { AdvisorData, AdvisorMockVariant } from './advisor.responses';

export {
  ADVISOR_GOAL_PACKS,
  PRODUCT_SCENARIO_MAP,
  SAMPLE_GOAL,
  RETRY_GOAL,
  ADVISOR_ERROR_MESSAGE,
  ADVISOR_LOADING_STEPS_TEXT,
  HEALTH_SCORE_TONES,
} from './advisor.packs';
export type { AdvisorGoalPack } from './advisor.packs';
