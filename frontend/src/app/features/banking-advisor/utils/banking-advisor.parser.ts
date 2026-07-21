import {
  BANKING_ADVISOR_ERROR_MESSAGE,
  AdvisorRoadmapStep,
  BankingAdvisorAdvice,
} from '../models/banking-advisor.model';

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((entry) => String(entry ?? '').trim())
    .filter((entry) => entry.length > 0);
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value.replace(/[,₹\s]/g, ''));
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function asRoadmap(value: unknown): AdvisorRoadmapStep[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }
      const row = entry as Record<string, unknown>;
      const period = String(row['period'] ?? '').trim();
      const goal = String(row['goal'] ?? '').trim();
      if (!period || !goal) {
        return null;
      }
      return { period, goal };
    })
    .filter((entry): entry is AdvisorRoadmapStep => entry !== null);
}

/**
 * Parses and validates Smart Banking Advisor JSON from the LLM.
 * Returns null when the payload is not confidently usable.
 */
export function parseBankingAdvisorAdvice(
  data: Record<string, unknown> | null | undefined,
): BankingAdvisorAdvice | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const financialGoals = asStringArray(data['financialGoals']);
  const recommendedProducts = asStringArray(data['recommendedProducts']);
  const roadmap = asRoadmap(data['roadmap']);
  const financialHealthScore = Math.round(
    Math.max(0, Math.min(100, asNumber(data['financialHealthScore'], -1))),
  );
  const advice = String(data['advice'] ?? '').trim();
  const riskCategory = String(data['riskCategory'] ?? '').trim();

  const tooVague =
    financialGoals.length === 0 ||
    recommendedProducts.length === 0 ||
    financialHealthScore <= 0 ||
    !advice ||
    !riskCategory;

  if (tooVague) {
    return null;
  }

  const investmentPlan = String(data['investmentPlan'] ?? data['suggestedInvestmentPlan'] ?? '').trim();

  return {
    financialGoals,
    recommendedProducts,
    monthlySavingsRecommendation: Math.max(0, asNumber(data['monthlySavingsRecommendation'])),
    estimatedLoanEligibility: Math.max(0, asNumber(data['estimatedLoanEligibility'])),
    estimatedEMI: Math.max(0, asNumber(data['estimatedEMI'])),
    financialHealthScore,
    riskCategory,
    advice,
    roadmap:
      roadmap.length > 0
        ? roadmap
        : [
            { period: 'Months 1-3', goal: 'Build an emergency fund' },
            { period: 'Months 4-6', goal: 'Strengthen savings habit' },
            { period: 'Months 7-9', goal: 'Review loan or investment readiness' },
            { period: 'Months 10-12', goal: 'Execute primary financial goal' },
          ],
    investmentPlan: investmentPlan || undefined,
  };
}

export function bankingAdvisorParseErrorMessage(): string {
  return BANKING_ADVISOR_ERROR_MESSAGE;
}
