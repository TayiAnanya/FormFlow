import { parseBankingAdvisorAdvice } from './banking-advisor.parser';

describe('parseBankingAdvisorAdvice', () => {
  const validPayload = {
    financialGoals: ['Buy a Car', 'Travel Abroad'],
    recommendedProducts: ['Car Loan', 'High Interest Savings Account', 'Fixed Deposit'],
    monthlySavingsRecommendation: 12000,
    estimatedLoanEligibility: 800000,
    estimatedEMI: 16300,
    financialHealthScore: 82,
    riskCategory: 'Low',
    advice: 'Increase your monthly savings by 10% to improve loan eligibility.',
    investmentPlan: 'SIP ₹8,000 into diversified equity funds.',
    roadmap: [
      { period: 'Months 1-3', goal: 'Build Emergency Fund' },
      { period: 'Months 4-6', goal: 'Improve Credit Score' },
      { period: 'Months 7-9', goal: 'Apply for Car Loan' },
      { period: 'Months 10-12', goal: 'Purchase Vehicle' },
    ],
  };

  it('parses a valid AI response', () => {
    const advice = parseBankingAdvisorAdvice(validPayload);
    expect(advice).not.toBeNull();
    expect(advice?.financialGoals).toEqual(['Buy a Car', 'Travel Abroad']);
    expect(advice?.financialHealthScore).toBe(82);
    expect(advice?.roadmap.length).toBe(4);
    expect(advice?.investmentPlan).toContain('SIP');
  });

  it('returns null when goals or products are missing (error handling)', () => {
    expect(
      parseBankingAdvisorAdvice({
        ...validPayload,
        financialGoals: [],
      }),
    ).toBeNull();

    expect(
      parseBankingAdvisorAdvice({
        ...validPayload,
        recommendedProducts: [],
      }),
    ).toBeNull();
  });

  it('clamps financial health score to 0-100', () => {
    const advice = parseBankingAdvisorAdvice({
      ...validPayload,
      financialHealthScore: 140,
    });
    expect(advice?.financialHealthScore).toBe(100);
  });
});
