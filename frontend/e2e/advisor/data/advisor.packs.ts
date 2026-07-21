/**
 * Parameterized goal packs and product scenario mappings for Sprint 06 advisor specs.
 */

/** Product → targetScenarioId mapping mirroring product-navigation.mapper.ts. */
export const PRODUCT_SCENARIO_MAP: Record<string, string> = {
  'Car Loan': 'loan-inquiry',
  'Home Loan': 'loan-inquiry',
  'Personal Loan': 'loan-inquiry',
  'Platinum Card': 'smart-credit-card',
  'Gold Card': 'smart-credit-card',
  'High Interest Savings Account': 'account-opening',
  'Fixed Deposit': 'account-opening',
  'Recurring Deposit': 'account-opening',
  'Current Account': 'account-opening',
};

/** Advisor goal strings for parameterized journey tests. */
export const ADVISOR_GOAL_PACKS = [
  {
    label: 'car-loan',
    goal: 'I want to buy a car.',
    mockVariant: 'loan' as const,
    expectedProduct: 'Car Loan',
    expectedScenario: 'loan-inquiry',
  },
  {
    label: 'credit-card',
    goal: 'I want a platinum credit card.',
    mockVariant: 'card' as const,
    expectedProduct: 'Platinum Card',
    expectedScenario: 'smart-credit-card',
  },
  {
    label: 'savings',
    goal: 'I want to open a savings account.',
    mockVariant: 'savings' as const,
    expectedProduct: 'High Interest Savings Account',
    expectedScenario: 'account-opening',
  },
] as const;

export type AdvisorGoalPack = (typeof ADVISOR_GOAL_PACKS)[number];

/** Standard goal for single-turn happy path tests. */
export const SAMPLE_GOAL = 'I want to buy a car and build savings.';

/** Goal for error-recovery tests (submit → error → fix → retry). */
export const RETRY_GOAL = 'I need financial guidance for my future.';

/** Static error copy from BANKING_ADVISOR_ERROR_MESSAGE. */
export const ADVISOR_ERROR_MESSAGE =
  "We couldn't fully understand your financial goals. Please provide a little more information.";

/** ADVISOR_LOADING_STEPS text from banking-advisor.model.ts (for assertions). */
export const ADVISOR_LOADING_STEPS_TEXT = [
  'Understanding your financial goals...',
  'Analysing income and objectives...',
  'Finding suitable banking products...',
  'Preparing personalized financial roadmap...',
] as const;

/** Health score tone thresholds matching healthScoreTone() function. */
export const HEALTH_SCORE_TONES = [
  { score: 85, expectedTone: 'green' as const },
  { score: 65, expectedTone: 'amber' as const },
  { score: 45, expectedTone: 'red' as const },
] as const;
