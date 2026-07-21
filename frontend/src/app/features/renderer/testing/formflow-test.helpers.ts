import { FormGroup } from '@angular/forms';

import { FormSchema } from '../../../models/form-schema.model';
import { SMART_CREDIT_CARD_SCHEMA } from '../../../schemas/bundled/smart-credit-card.schema';

import { buildFormGroup } from '../utils/form-model.factory';
import { syncFieldVisibility } from '../utils/field-visibility.util';

/** Builds a reactive form for the Smart Credit Card schema and syncs visibility rules. */
export function createSmartCreditCardForm(): FormGroup {
  const form = buildFormGroup(SMART_CREDIT_CARD_SCHEMA);
  syncFieldVisibility(SMART_CREDIT_CARD_SCHEMA, form);
  return form;
}

/** Patches a valid student submission and re-syncs conditional visibility. */
export function fillStudentSmartCreditCardForm(form: FormGroup): void {
  form.patchValue({
    fullName: 'Ananya Tayi',
    email: 'ananya@example.com',
    mobileNumber: '9876543210',
    dateOfBirth: '2000-05-15',
    cardType: 'gold',
    preferredBranch: 'mumbai_bkc',
    employmentStatus: 'student',
    collegeName: 'Delhi University',
    studentId: 'STU2024001234',
    graduationYear: '2027',
    existingCustomer: false,
    termsAccepted: true,
  });
  syncFieldVisibility(SMART_CREDIT_CARD_SCHEMA, form);
}

/** Patches a valid salaried employee submission and re-syncs conditional visibility. */
export function fillEmployeeSmartCreditCardForm(form: FormGroup): void {
  form.patchValue({
    fullName: 'John Smith',
    email: 'john@example.com',
    mobileNumber: '9123456789',
    dateOfBirth: '1990-03-20',
    cardType: 'platinum',
    preferredBranch: 'mumbai_bkc',
    employmentStatus: 'salaried_employee',
    companyName: 'Acme Corp',
    jobTitle: 'Senior Software Engineer',
    monthlyIncome: '85000',
    existingCustomer: false,
    termsAccepted: true,
  });
  syncFieldVisibility(SMART_CREDIT_CARD_SCHEMA, form);
}

/** Patches a valid self-employed submission and re-syncs conditional visibility. */
export function fillSelfEmployedSmartCreditCardForm(form: FormGroup): void {
  form.patchValue({
    fullName: 'Mary-Jane Watson',
    email: 'mary@example.com',
    mobileNumber: '9988776655',
    dateOfBirth: '1985-11-08',
    cardType: 'titanium',
    preferredBranch: 'delhi_cp',
    employmentStatus: 'self_employed',
    businessName: 'Watson Consulting',
    gstNumber: '27AABCU9603R1ZM',
    annualTurnover: '2400000',
    existingCustomer: false,
    termsAccepted: true,
  });
  syncFieldVisibility(SMART_CREDIT_CARD_SCHEMA, form);
}

export const STUDENT_SUBMISSION_KEYS = [
  'fullName',
  'email',
  'mobileNumber',
  'dateOfBirth',
  'cardType',
  'preferredBranch',
  'employmentStatus',
  'collegeName',
  'studentId',
  'graduationYear',
  'existingCustomer',
  'applicationNumber',
  'termsAccepted',
] as const;

export const EMPLOYEE_SUBMISSION_KEYS = [
  'fullName',
  'email',
  'mobileNumber',
  'dateOfBirth',
  'cardType',
  'preferredBranch',
  'employmentStatus',
  'companyName',
  'jobTitle',
  'monthlyIncome',
  'existingCustomer',
  'applicationNumber',
  'termsAccepted',
] as const;

export const SELF_EMPLOYED_SUBMISSION_KEYS = [
  'fullName',
  'email',
  'mobileNumber',
  'dateOfBirth',
  'cardType',
  'preferredBranch',
  'employmentStatus',
  'businessName',
  'gstNumber',
  'annualTurnover',
  'existingCustomer',
  'applicationNumber',
  'termsAccepted',
] as const;

export function createVisibilityTestSchema(): FormSchema {
  return {
    id: 'visibility-test',
    title: 'Visibility Test',
    fields: [
      {
        key: 'employmentStatus',
        type: 'dropdown',
        label: 'Employment Status',
        options: [
          { label: 'Student', value: 'student' },
          { label: 'Employee', value: 'employee' },
        ],
      },
      {
        key: 'collegeName',
        type: 'text',
        label: 'College Name',
        visibleWhen: {
          field: 'employmentStatus',
          operator: 'equals',
          value: 'student',
        },
      },
      {
        key: 'companyName',
        type: 'text',
        label: 'Company Name',
        visibleWhen: {
          field: 'employmentStatus',
          operator: 'equals',
          value: 'employee',
        },
      },
      {
        key: 'internalRiskScore',
        type: 'text',
        label: 'Internal Risk Score',
        defaultValue: 'pending_review',
        hidden: true,
      },
      {
        key: 'applicationNumber',
        type: 'text',
        label: 'Application Number',
        defaultValue: 'APP-001',
        readonly: true,
      },
      {
        key: 'lockedField',
        type: 'text',
        label: 'Locked Field',
        defaultValue: 'locked',
        disabled: true,
      },
    ],
  };
}
