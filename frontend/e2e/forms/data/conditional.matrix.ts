import type { ConditionalRow } from './form.types';

/** Conditional visibility rows for credit-card and support. */
export const CONDITIONAL_ROWS: ConditionalRow[] = [
  {
    id: 'CC-STUDENT',
    scenarioId: 'smart-credit-card',
    description: 'student branch shows student fields',
    setupSteps: [
      {
        key: 'employmentStatus',
        type: 'dropdown',
        value: 'student',
        label: 'Student',
      },
    ],
    visibleKeys: ['collegeName', 'studentId', 'graduationYear'],
    hiddenKeys: ['companyName', 'businessName'],
  },
  {
    id: 'CC-SALARIED',
    scenarioId: 'smart-credit-card',
    description: 'salaried branch shows employment fields',
    setupSteps: [
      {
        key: 'employmentStatus',
        type: 'dropdown',
        value: 'salaried_employee',
        label: 'Salaried Employee',
      },
    ],
    visibleKeys: ['companyName', 'jobTitle', 'monthlyIncome'],
    hiddenKeys: ['collegeName', 'businessName'],
  },
  {
    id: 'CC-SELF',
    scenarioId: 'smart-credit-card',
    description: 'self-employed branch shows business fields',
    setupSteps: [
      {
        key: 'employmentStatus',
        type: 'dropdown',
        value: 'self_employed',
        label: 'Self Employed',
      },
    ],
    visibleKeys: ['businessName', 'gstNumber', 'annualTurnover'],
    hiddenKeys: ['collegeName', 'companyName'],
  },
  {
    id: 'SUP-DISPUTE',
    scenarioId: 'customer-support',
    description: 'raise dispute shows dispute fields',
    setupSteps: [
      {
        key: 'supportRequestType',
        type: 'dropdown',
        value: 'raise_dispute',
        label: 'Raise Dispute',
      },
    ],
    visibleKeys: [
      'disputeTransactionDate',
      'disputeAmount',
      'merchantName',
      'disputeReason',
    ],
    hiddenKeys: ['fraudType', 'cardLastFourDigits', 'upiTransactionId'],
  },
  {
    id: 'SUP-FRAUD',
    scenarioId: 'customer-support',
    description: 'report fraud shows fraud fields',
    setupSteps: [
      {
        key: 'supportRequestType',
        type: 'dropdown',
        value: 'report_fraud',
        label: 'Report Fraud',
      },
    ],
    visibleKeys: ['fraudType', 'fraudTransactionDate'],
    hiddenKeys: ['disputeAmount', 'upiTransactionId', 'atmLocation'],
  },
  {
    id: 'SUP-BLOCK',
    scenarioId: 'customer-support',
    description: 'block lost card shows card fields',
    setupSteps: [
      {
        key: 'supportRequestType',
        type: 'dropdown',
        value: 'block_lost_card',
        label: 'Block Lost Card',
      },
    ],
    visibleKeys: ['cardLastFourDigits', 'cardLastUsedDate', 'blockReason'],
    hiddenKeys: ['disputeAmount', 'fraudType'],
  },
  {
    id: 'SUP-UPI',
    scenarioId: 'customer-support',
    description: 'failed UPI shows UPI fields',
    setupSteps: [
      {
        key: 'supportRequestType',
        type: 'dropdown',
        value: 'failed_upi_transaction',
        label: 'Failed UPI Transaction',
      },
    ],
    visibleKeys: [
      'upiTransactionId',
      'upiAmount',
      'payeeVpa',
      'upiTransactionDate',
    ],
    hiddenKeys: ['disputeAmount', 'atmLocation'],
  },
];
