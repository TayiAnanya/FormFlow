import { BankingAdvisorAdvice } from '../models/banking-advisor.model';
import { mapRecommendedProductsToCards } from './product-navigation.mapper';

describe('mapRecommendedProductsToCards', () => {
  const advice: BankingAdvisorAdvice = {
    financialGoals: ['Buy a Car'],
    recommendedProducts: ['Car Loan', 'High Interest Savings Account', 'Fixed Deposit', 'Platinum Card'],
    monthlySavingsRecommendation: 12000,
    estimatedLoanEligibility: 800000,
    estimatedEMI: 16300,
    financialHealthScore: 82,
    riskCategory: 'Low',
    advice: 'Save more each month.',
    roadmap: [{ period: 'Months 1-3', goal: 'Build Emergency Fund' }],
  };

  it('maps products to existing banking modules with prefill', () => {
    const cards = mapRecommendedProductsToCards(advice);

    const car = cards.find((card) => card.title === 'Car Loan');
    expect(car?.targetScenarioId).toBe('loan-inquiry');
    expect(car?.prefill['loanType']).toBe('auto');
    expect(car?.prefill['loanAmount']).toBe('800000');
    expect(car?.ctaLabel).toBe('Apply Now');

    const savings = cards.find((card) => card.title === 'High Interest Savings Account');
    expect(savings?.targetScenarioId).toBe('account-opening');
    expect(savings?.prefill['accountType']).toBe('savings');
    expect(savings?.ctaLabel).toBe('Open Account');

    const platinum = cards.find((card) => card.title === 'Platinum Card');
    expect(platinum?.targetScenarioId).toBe('smart-credit-card');
    expect(platinum?.prefill['cardType']).toBe('platinum');
  });
});
