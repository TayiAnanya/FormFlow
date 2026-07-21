/**
 * Gemini API mock response builders for Sprint 06 advisor specs.
 * All stubs are deterministic — no live API calls required.
 */

export interface AdvisorData {
  financialGoals: string[];
  recommendedProducts: string[];
  monthlySavingsRecommendation: number;
  estimatedLoanEligibility: number;
  estimatedEMI: number;
  financialHealthScore: number;
  riskCategory: string;
  advice: string;
  roadmap: { period: string; goal: string }[];
  investmentPlan?: string;
}

export type AdvisorMockVariant = 'loan' | 'card' | 'savings' | 'multi';

const BASE_ROADMAP: AdvisorData['roadmap'] = [
  { period: 'Months 1–3', goal: 'Assess financial position and set targets' },
  { period: 'Months 4–6', goal: 'Initiate primary financial goal' },
  { period: 'Months 7–9', goal: 'Review progress and adjust strategy' },
  { period: 'Months 10–12', goal: 'Consolidate gains and plan next cycle' },
];

/** Deterministic advisor data per product variant. */
export function mockAdvisorData(variant: AdvisorMockVariant = 'loan'): AdvisorData {
  switch (variant) {
    case 'loan':
      return {
        financialGoals: ['Purchase a car for daily commute'],
        recommendedProducts: ['Car Loan'],
        monthlySavingsRecommendation: 15000,
        estimatedLoanEligibility: 600000,
        estimatedEMI: 12000,
        financialHealthScore: 72,
        riskCategory: 'Moderate',
        advice: 'A car loan with a manageable EMI suits your current income profile.',
        roadmap: BASE_ROADMAP,
      };
    case 'card':
      return {
        financialGoals: ['Maximize rewards on everyday spending'],
        recommendedProducts: ['Platinum Card'],
        monthlySavingsRecommendation: 20000,
        estimatedLoanEligibility: 0,
        estimatedEMI: 0,
        financialHealthScore: 85,
        riskCategory: 'Low',
        advice: 'A premium credit card with airport lounge access suits your spending patterns.',
        roadmap: BASE_ROADMAP,
      };
    case 'savings':
      return {
        financialGoals: ['Build an emergency fund and grow savings'],
        recommendedProducts: ['High Interest Savings Account', 'Fixed Deposit'],
        monthlySavingsRecommendation: 10000,
        estimatedLoanEligibility: 0,
        estimatedEMI: 0,
        financialHealthScore: 60,
        riskCategory: 'Low',
        advice: 'A savings account paired with a fixed deposit maximizes liquidity and returns.',
        roadmap: BASE_ROADMAP,
        investmentPlan: 'Allocate ₹5,000 per month to a 12-month fixed deposit.',
      };
    case 'multi':
      return {
        financialGoals: ['Purchase a home', 'Start a systematic investment plan'],
        recommendedProducts: ['Home Loan', 'Fixed Deposit'],
        monthlySavingsRecommendation: 25000,
        estimatedLoanEligibility: 3000000,
        estimatedEMI: 28000,
        financialHealthScore: 78,
        riskCategory: 'Moderate',
        advice: 'A home loan combined with FD investments balances growth and manageable debt.',
        roadmap: BASE_ROADMAP,
      };
  }
}

/**
 * Wraps advisor JSON as a valid Gemini API response envelope.
 * Shape: { candidates: [{ content: { parts: [{ text: JSON }] } }] }
 */
export function buildGeminiResponse(data: AdvisorData): object {
  return {
    candidates: [
      {
        content: {
          parts: [{ text: JSON.stringify(data) }],
        },
      },
    ],
  };
}

/** Response that parseBankingAdvisorAdvice rejects — vague/empty goals. */
export function buildGeminiVagueResponse(): object {
  return buildGeminiResponse({
    financialGoals: [],
    recommendedProducts: [],
    monthlySavingsRecommendation: 0,
    estimatedLoanEligibility: 0,
    estimatedEMI: 0,
    financialHealthScore: 0,
    riskCategory: '',
    advice: '',
    roadmap: [],
  });
}

/** Response with empty candidates array — unparseable. */
export function buildGeminiEmptyResponse(): object {
  return { candidates: [] };
}

/** Response with invalid score ≤ 0 — parser rejects. */
export function buildGeminiInvalidScoreResponse(): object {
  return buildGeminiResponse({
    financialGoals: ['Save money'],
    recommendedProducts: ['Savings Account'],
    monthlySavingsRecommendation: 5000,
    estimatedLoanEligibility: 0,
    estimatedEMI: 0,
    financialHealthScore: 0,
    riskCategory: 'Low',
    advice: '',
    roadmap: BASE_ROADMAP,
  });
}

/** Response with no recommended products — parser rejects. */
export function buildGeminiNoProductsResponse(): object {
  return buildGeminiResponse({
    financialGoals: ['Achieve financial freedom'],
    recommendedProducts: [],
    monthlySavingsRecommendation: 8000,
    estimatedLoanEligibility: 0,
    estimatedEMI: 0,
    financialHealthScore: 55,
    riskCategory: 'Low',
    advice: 'Keep saving',
    roadmap: BASE_ROADMAP,
  });
}

/** Mock data for a high health score → green tone (score >= 80). */
export function mockHighScoreData(): AdvisorData {
  return { ...mockAdvisorData('card'), financialHealthScore: 85 };
}

/** Mock data for an amber health score (60 <= score < 80). */
export function mockAmberScoreData(): AdvisorData {
  return { ...mockAdvisorData('loan'), financialHealthScore: 65 };
}

/** Mock data for a red health score (score < 60). */
export function mockRedScoreData(): AdvisorData {
  return { ...mockAdvisorData('savings'), financialHealthScore: 45 };
}
