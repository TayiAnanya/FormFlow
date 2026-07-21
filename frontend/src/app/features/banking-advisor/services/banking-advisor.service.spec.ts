import { TestBed } from '@angular/core/testing';

import { AIExtractionService } from '../../smart-assist/services/ai-extraction.service';
import { BankingAdvisorService } from './banking-advisor.service';

describe('BankingAdvisorService', () => {
  let service: BankingAdvisorService;
  let aiExtraction: jasmine.SpyObj<AIExtractionService>;

  const sampleAiData = {
    financialGoals: ['Buy a Car', 'Travel Abroad'],
    recommendedProducts: ['Car Loan', 'High Interest Savings Account'],
    monthlySavingsRecommendation: 12000,
    estimatedLoanEligibility: 800000,
    estimatedEMI: 16300,
    financialHealthScore: 82,
    riskCategory: 'Low',
    advice: 'Increase your monthly savings by 10% to improve loan eligibility.',
    roadmap: [
      { period: 'Months 1-3', goal: 'Build Emergency Fund' },
      { period: 'Months 4-6', goal: 'Improve Credit Score' },
    ],
  };

  beforeEach(() => {
    aiExtraction = jasmine.createSpyObj('AIExtractionService', ['generateStructuredJson']);

    TestBed.configureTestingModule({
      providers: [
        BankingAdvisorService,
        { provide: AIExtractionService, useValue: aiExtraction },
      ],
    });

    service = TestBed.inject(BankingAdvisorService);
  });

  it('AI request — forwards customer message through AIExtractionService', async () => {
    aiExtraction.generateStructuredJson.and.resolveTo({
      success: true,
      data: sampleAiData,
    });

    const message =
      'I recently started a new job with a salary of ₹80,000 per month. I want to buy a car next year.';

    const result = await service.advise(message);

    expect(aiExtraction.generateStructuredJson).toHaveBeenCalled();
    const prompt = aiExtraction.generateStructuredJson.calls.mostRecent().args[0] as string;
    expect(prompt).toContain(message);
    expect(result.success).toBeTrue();
    if (result.success) {
      expect(result.advice.financialHealthScore).toBe(82);
      expect(result.productCards.length).toBeGreaterThan(0);
    }
  });

  it('Error handling — returns friendly message when AI fails', async () => {
    aiExtraction.generateStructuredJson.and.resolveTo({
      success: false,
      errorMessage: 'network down',
    });

    const result = await service.advise('I want a loan');
    expect(result.success).toBeFalse();
    if (!result.success) {
      expect(result.errorMessage).toContain('network down');
    }
  });

  it('Error handling — returns friendly message when AI JSON is vague', async () => {
    aiExtraction.generateStructuredJson.and.resolveTo({
      success: true,
      data: { financialGoals: [], recommendedProducts: [], financialHealthScore: 0 },
    });

    const result = await service.advise('hello');
    expect(result.success).toBeFalse();
    if (!result.success) {
      expect(result.errorMessage).toContain("couldn't fully understand");
    }
  });
});
