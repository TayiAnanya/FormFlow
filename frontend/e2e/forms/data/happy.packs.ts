import { APPLICATION_ID_PREFIX, type ScenarioId } from '../../shared/config/constants';
import type { FormFillStep, ScenarioHappyPack } from './form.types';

export const SCENARIO_META: Record<
  ScenarioId,
  { title: string; submitLabel: string }
> = {
  'account-opening': {
    title: 'Account Opening',
    submitLabel: 'Submit Application',
  },
  'loan-inquiry': {
    title: 'Loan Inquiry',
    submitLabel: 'Submit Inquiry',
  },
  'smart-credit-card': {
    title: 'Smart Credit Card Application',
    submitLabel: 'Submit Application',
  },
  'customer-support': {
    title: 'Customer Support Hub',
    submitLabel: 'Submit Support Request',
  },
  'joint-family-account': {
    title: 'Joint / Family Account Builder',
    submitLabel: 'Submit Joint Application',
  },
};

export function accountOpeningHappy(
  overrides: FormFillStep[] = [],
): ScenarioHappyPack {
  const steps: FormFillStep[] = [
    { key: 'fullName', type: 'text', value: 'Priya Sharma' },
    { key: 'email', type: 'text', value: 'priya.sharma@example.com' },
    { key: 'dateOfBirth', type: 'date', value: '1995-06-15' },
    {
      key: 'accountType',
      type: 'dropdown',
      value: 'savings',
      label: 'Savings',
    },
    { key: 'termsAccepted', type: 'checkbox', value: true },
    ...overrides,
  ];
  return pack('account-opening', steps);
}

export function loanInquiryHappy(overrides: FormFillStep[] = []): ScenarioHappyPack {
  const steps: FormFillStep[] = [
    { key: 'applicantName', type: 'text', value: 'Rahul Mehta' },
    {
      key: 'loanType',
      type: 'dropdown',
      value: 'personal',
      label: 'Personal',
    },
    { key: 'loanAmount', type: 'text', value: '500000' },
    {
      key: 'purpose',
      type: 'textarea',
      value: 'Home renovation and furniture purchase',
    },
    { key: 'consentToContact', type: 'checkbox', value: true },
    ...overrides,
  ];
  return pack('loan-inquiry', steps);
}

export function smartCreditCardHappy(
  overrides: FormFillStep[] = [],
): ScenarioHappyPack {
  const steps: FormFillStep[] = [
    { key: 'fullName', type: 'text', value: 'Ananya Iyer' },
    { key: 'email', type: 'text', value: 'ananya.iyer@example.com' },
    { key: 'mobileNumber', type: 'text', value: '9876543210' },
    { key: 'dateOfBirth', type: 'date', value: '1992-03-20' },
    { key: 'cardType', type: 'dropdown', value: 'gold', label: 'Gold' },
    {
      key: 'preferredBranch',
      type: 'dropdown',
      value: 'mumbai_bkc',
      label: 'Mumbai — Bandra Kurla Complex',
    },
    {
      key: 'employmentStatus',
      type: 'dropdown',
      value: 'salaried_employee',
      label: 'Salaried Employee',
    },
    { key: 'termsAccepted', type: 'checkbox', value: true },
    ...overrides,
  ];
  return pack('smart-credit-card', steps);
}

export function customerSupportHappy(
  overrides: FormFillStep[] = [],
): ScenarioHappyPack {
  const steps: FormFillStep[] = [
    { key: 'customerName', type: 'text', value: 'Vikram Patel' },
    { key: 'email', type: 'text', value: 'vikram.patel@example.com' },
    { key: 'mobileNumber', type: 'text', value: '9123456789' },
    {
      key: 'supportRequestType',
      type: 'dropdown',
      value: 'raise_dispute',
      label: 'Raise Dispute',
    },
    { key: 'disputeTransactionDate', type: 'date', value: '2026-07-01' },
    { key: 'disputeAmount', type: 'text', value: '2500' },
    { key: 'merchantName', type: 'text', value: 'Amazon India' },
    {
      key: 'disputeReason',
      type: 'dropdown',
      value: 'unauthorized_charge',
      label: 'Unauthorized Charge',
    },
    {
      key: 'issueDescription',
      type: 'textarea',
      value: 'Transaction failed twice on 2026-07-10; need investigation of debit.',
    },
    {
      key: 'resolutionPreference',
      type: 'dropdown',
      value: 'email',
      label: 'Email Update',
    },
    { key: 'declarationAccepted', type: 'checkbox', value: true },
    ...overrides,
  ];
  return pack('customer-support', steps);
}

export function jointFamilyHappy(overrides: FormFillStep[] = []): ScenarioHappyPack {
  const steps: FormFillStep[] = [
    { key: 'fullName', type: 'text', value: 'Suresh Nair' },
    { key: 'dateOfBirth', type: 'date', value: '1988-11-05' },
    { key: 'email', type: 'text', value: 'suresh.nair@example.com' },
    { key: 'mobile', type: 'text', value: '9988776655' },
    {
      key: 'address',
      type: 'textarea',
      value: '12 MG Road, Bengaluru, Karnataka 560001',
    },
    { key: 'idType', type: 'dropdown', value: 'aadhaar', label: 'Aadhaar' },
    { key: 'idNumber', type: 'text', value: '123456789012' },
    ...overrides,
  ];
  return pack('joint-family-account', steps);
}

export const HAPPY_PACKS: ScenarioHappyPack[] = [
  accountOpeningHappy(),
  loanInquiryHappy(),
  smartCreditCardHappy(),
  customerSupportHappy(),
  jointFamilyHappy(),
];

function pack(scenarioId: ScenarioId, steps: FormFillStep[]): ScenarioHappyPack {
  const meta = SCENARIO_META[scenarioId];
  return {
    scenarioId,
    title: meta.title,
    submitLabel: meta.submitLabel,
    applicationPrefix: APPLICATION_ID_PREFIX[scenarioId],
    steps,
  };
}
