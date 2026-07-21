import { ROUTES, SCENARIO_IDS, type ScenarioId } from '../../config/constants';

export type DeepLinkFormSample = {
  scenarioId: ScenarioId;
  path: string;
};

/**
 * Form deep-link route samples only — no schema/field payloads (Sprint 04).
 */
export const deepLinkFormSamples: readonly DeepLinkFormSample[] = [
  {
    scenarioId: 'account-opening',
    path: ROUTES.form('account-opening'),
  },
  {
    scenarioId: 'loan-inquiry',
    path: ROUTES.form('loan-inquiry'),
  },
] as const;

/** Default sample for smoke/critical deep-link journeys (N08 / N09 / N14). */
export const defaultDeepLinkForm = deepLinkFormSamples[0];

/** All scenario route paths derived from shared SCENARIO_IDS (route matrix only). */
export const allFormDeepLinkPaths = SCENARIO_IDS.map((id) => ({
  scenarioId: id,
  path: ROUTES.form(id),
}));
