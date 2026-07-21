import { MappedFormValues } from '../../smart-assist/models/document-extraction.model';

export interface AdvisorRoadmapStep {
  period: string;
  goal: string;
}

export interface BankingAdvisorAdvice {
  financialGoals: string[];
  recommendedProducts: string[];
  monthlySavingsRecommendation: number;
  estimatedLoanEligibility: number;
  estimatedEMI: number;
  financialHealthScore: number;
  riskCategory: string;
  advice: string;
  roadmap: AdvisorRoadmapStep[];
  /** Optional investment narrative from the model. */
  investmentPlan?: string;
}

export type HealthScoreTone = 'green' | 'amber' | 'red';

export type ProductCtaKind = 'apply' | 'open' | 'invest';

/** Interactive product card ready for navigation into an existing banking module. */
export interface AdvisorProductCard {
  id: string;
  title: string;
  icon: string;
  categoryLabel: string;
  interestRate?: string;
  estimatedEmi?: number;
  maxLoan?: number;
  benefits?: string[];
  expectedReturns?: string;
  tenure?: string;
  ctaLabel: string;
  ctaKind: ProductCtaKind;
  targetScenarioId: string;
  prefill: MappedFormValues;
}

export interface BankingAdvisorSuccess {
  success: true;
  advice: BankingAdvisorAdvice;
  productCards: AdvisorProductCard[];
  rawResponse?: string;
}

export interface BankingAdvisorFailure {
  success: false;
  errorMessage: string;
  rawResponse?: string;
}

export type BankingAdvisorResult = BankingAdvisorSuccess | BankingAdvisorFailure;

export const BANKING_ADVISOR_ERROR_MESSAGE =
  "We couldn't fully understand your financial goals. Please provide a little more information.";

export const ADVISOR_SUGGESTED_PROMPTS = [
  'I want to buy a house.',
  'I want to buy a car.',
  'I want to save for retirement.',
  'I want to invest my monthly salary.',
  'I recently got married.',
  'I recently became a parent.',
  'I want to start a business.',
  'I want to buy my first home.',
  'I recently got a salary hike.',
  'I want to retire early.',
  'I want to save tax.',
  'I want to invest ₹10,000 every month.',
] as const;

export const ADVISOR_LOADING_STEPS = [
  'Understanding your financial goals...',
  'Analysing income and objectives...',
  'Finding suitable banking products...',
  'Preparing personalized financial roadmap...',
] as const;

export function healthScoreTone(score: number): HealthScoreTone {
  if (score >= 80) {
    return 'green';
  }
  if (score >= 60) {
    return 'amber';
  }
  return 'red';
}
