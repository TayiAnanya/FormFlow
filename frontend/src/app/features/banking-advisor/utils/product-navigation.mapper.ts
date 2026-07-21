import { MappedFormValues } from '../../smart-assist/models/document-extraction.model';
import { AdvisorProductCard, BankingAdvisorAdvice, ProductCtaKind } from '../models/banking-advisor.model';

interface ProductRouteTemplate {
  match: RegExp;
  title: string;
  icon: string;
  categoryLabel: string;
  ctaLabel: string;
  ctaKind: ProductCtaKind;
  targetScenarioId: string;
  buildPrefill: (advice: BankingAdvisorAdvice) => MappedFormValues;
  enrich: (advice: BankingAdvisorAdvice) => Partial<AdvisorProductCard>;
}

const PRODUCT_TEMPLATES: ProductRouteTemplate[] = [
  {
    match: /car\s*loan|auto\s*loan|vehicle\s*loan/i,
    title: 'Car Loan',
    icon: 'pi pi-car',
    categoryLabel: 'Loan',
    ctaLabel: 'Apply Now',
    ctaKind: 'apply',
    targetScenarioId: 'loan-inquiry',
    buildPrefill: (advice) => ({
      loanType: 'auto',
      purpose: advice.financialGoals.join(', ') || 'Vehicle purchase',
      loanAmount: String(advice.estimatedLoanEligibility || 500000),
    }),
    enrich: (advice) => ({
      interestRate: '8.75% p.a. onwards',
      estimatedEmi: advice.estimatedEMI || undefined,
      maxLoan: advice.estimatedLoanEligibility || undefined,
    }),
  },
  {
    match: /home\s*loan|housing\s*loan|house\s*loan/i,
    title: 'Home Loan',
    icon: 'pi pi-home',
    categoryLabel: 'Loan',
    ctaLabel: 'Apply Now',
    ctaKind: 'apply',
    targetScenarioId: 'loan-inquiry',
    buildPrefill: (advice) => ({
      loanType: 'home',
      purpose: advice.financialGoals.join(', ') || 'Home purchase',
      loanAmount: String(advice.estimatedLoanEligibility || 2500000),
    }),
    enrich: (advice) => ({
      interestRate: '8.40% p.a. onwards',
      estimatedEmi: advice.estimatedEMI || undefined,
      maxLoan: advice.estimatedLoanEligibility || undefined,
    }),
  },
  {
    match: /personal\s*loan/i,
    title: 'Personal Loan',
    icon: 'pi pi-wallet',
    categoryLabel: 'Loan',
    ctaLabel: 'Apply Now',
    ctaKind: 'apply',
    targetScenarioId: 'loan-inquiry',
    buildPrefill: (advice) => ({
      loanType: 'personal',
      purpose: advice.financialGoals.join(', ') || 'Personal financing',
      loanAmount: String(advice.estimatedLoanEligibility || 300000),
    }),
    enrich: (advice) => ({
      interestRate: '10.99% p.a. onwards',
      estimatedEmi: advice.estimatedEMI || undefined,
      maxLoan: advice.estimatedLoanEligibility || undefined,
    }),
  },
  {
    match: /platinum\s*card|credit\s*card|platinum/i,
    title: 'Platinum Card',
    icon: 'pi pi-credit-card',
    categoryLabel: 'Cards',
    ctaLabel: 'Apply Now',
    ctaKind: 'apply',
    targetScenarioId: 'smart-credit-card',
    buildPrefill: () => ({
      cardType: 'platinum',
    }),
    enrich: () => ({
      interestRate: 'Rewards-focused premium card',
      benefits: ['Airport lounge access', 'Reward points', 'Fuel surcharge waiver'],
    }),
  },
  {
    match: /gold\s*card/i,
    title: 'Gold Card',
    icon: 'pi pi-credit-card',
    categoryLabel: 'Cards',
    ctaLabel: 'Apply Now',
    ctaKind: 'apply',
    targetScenarioId: 'smart-credit-card',
    buildPrefill: () => ({
      cardType: 'gold',
    }),
    enrich: () => ({
      benefits: ['Welcome benefits', 'Reward points on spends'],
    }),
  },
  {
    match: /fixed\s*deposit|\bfd\b/i,
    title: 'Fixed Deposit',
    icon: 'pi pi-chart-line',
    categoryLabel: 'Investments',
    ctaLabel: 'Invest',
    ctaKind: 'invest',
    targetScenarioId: 'account-opening',
    buildPrefill: () => ({
      accountType: 'savings',
      services: ['internet_banking'],
    }),
    enrich: (advice) => ({
      expectedReturns: '6.5% – 7.1% p.a.',
      tenure: '12–60 months',
      benefits: [
        advice.investmentPlan || 'Park surplus funds for predictable returns',
      ],
    }),
  },
  {
    match: /recurring\s*deposit|\brd\b/i,
    title: 'Recurring Deposit',
    icon: 'pi pi-calendar',
    categoryLabel: 'Investments',
    ctaLabel: 'Invest',
    ctaKind: 'invest',
    targetScenarioId: 'account-opening',
    buildPrefill: () => ({
      accountType: 'savings',
    }),
    enrich: (advice) => ({
      expectedReturns: '6.0% – 6.8% p.a.',
      tenure: '12–36 months',
      benefits: [
        `Suggested monthly contribution ≈ ₹${advice.monthlySavingsRecommendation || 5000}`,
      ],
    }),
  },
  {
    match: /current\s*account/i,
    title: 'Current Account',
    icon: 'pi pi-briefcase',
    categoryLabel: 'Accounts',
    ctaLabel: 'Open Account',
    ctaKind: 'open',
    targetScenarioId: 'account-opening',
    buildPrefill: () => ({
      accountType: 'current',
      services: ['internet_banking', 'debit_card'],
    }),
    enrich: () => ({
      interestRate: 'Business-friendly transaction banking',
      benefits: ['High transaction limits', 'Debit card', 'Internet banking'],
    }),
  },
  {
    match: /savings|high\s*interest/i,
    title: 'High Interest Savings Account',
    icon: 'pi pi-money-bill',
    categoryLabel: 'Accounts',
    ctaLabel: 'Open Account',
    ctaKind: 'open',
    targetScenarioId: 'account-opening',
    buildPrefill: () => ({
      accountType: 'savings',
      services: ['internet_banking', 'debit_card'],
    }),
    enrich: (advice) => ({
      interestRate: 'Up to 7% p.a. on savings balances',
      benefits: [
        `Aim to save ≈ ₹${advice.monthlySavingsRecommendation || 10000} / month`,
        'Debit card & internet banking',
      ],
    }),
  },
];

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Maps AI product name strings onto interactive cards that deep-link into existing forms.
 */
export function mapRecommendedProductsToCards(advice: BankingAdvisorAdvice): AdvisorProductCard[] {
  const cards: AdvisorProductCard[] = [];
  const seenScenarios = new Set<string>();

  for (const productName of advice.recommendedProducts) {
    const template =
      PRODUCT_TEMPLATES.find((entry) => entry.match.test(productName)) ??
      PRODUCT_TEMPLATES.find((entry) => entry.match.test('savings'));

    if (!template) {
      continue;
    }

    const dedupeKey = `${template.targetScenarioId}:${template.title}`;
    if (seenScenarios.has(dedupeKey)) {
      continue;
    }
    seenScenarios.add(dedupeKey);

    const enrich = template.enrich(advice);
    cards.push({
      id: slugify(`${template.title}-${cards.length}`),
      title: template.title,
      icon: template.icon,
      categoryLabel: template.categoryLabel,
      ctaLabel: template.ctaLabel,
      ctaKind: template.ctaKind,
      targetScenarioId: template.targetScenarioId,
      prefill: template.buildPrefill(advice),
      interestRate: enrich.interestRate,
      estimatedEmi: enrich.estimatedEmi,
      maxLoan: enrich.maxLoan,
      benefits: enrich.benefits,
      expectedReturns: enrich.expectedReturns,
      tenure: enrich.tenure,
    });
  }

  return cards;
}
