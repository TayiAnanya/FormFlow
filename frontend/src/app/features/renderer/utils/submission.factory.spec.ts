import { FormArray, FormGroup } from '@angular/forms';

import { SMART_CREDIT_CARD_SCHEMA } from '../../../schemas/bundled/smart-credit-card.schema';
import { FormSchema } from '../../../models/form-schema.model';

import {
  createSmartCreditCardForm,
  EMPLOYEE_SUBMISSION_KEYS,
  fillEmployeeSmartCreditCardForm,
  fillSelfEmployedSmartCreditCardForm,
  fillStudentSmartCreditCardForm,
  SELF_EMPLOYED_SUBMISSION_KEYS,
  STUDENT_SUBMISSION_KEYS,
} from '../testing/formflow-test.helpers';

import { syncFieldVisibility } from './field-visibility.util';
import { addRepeaterItem, buildFormGroup } from './form-model.factory';
import { buildSubmission } from './submission.factory';

describe('buildSubmission', () => {
  let form: FormGroup;

  beforeEach(() => {
    form = createSmartCreditCardForm();
  });

  it('builds a student submission with only visible student fields', () => {
    fillStudentSmartCreditCardForm(form);

    const submission = buildSubmission(SMART_CREDIT_CARD_SCHEMA, form);

    expect(Object.keys(submission).sort()).toEqual([...STUDENT_SUBMISSION_KEYS].sort());
    expect(submission['employmentStatus']).toBe('student');
    expect(submission['collegeName']).toBe('Delhi University');
    expect(submission['companyName']).toBeUndefined();
    expect(submission['businessName']).toBeUndefined();
  });

  it('builds an employee submission with only visible employment fields', () => {
    fillEmployeeSmartCreditCardForm(form);

    const submission = buildSubmission(SMART_CREDIT_CARD_SCHEMA, form);

    expect(Object.keys(submission).sort()).toEqual([...EMPLOYEE_SUBMISSION_KEYS].sort());
    expect(submission['employmentStatus']).toBe('salaried_employee');
    expect(submission['companyName']).toBe('Acme Corp');
    expect(submission['collegeName']).toBeUndefined();
    expect(submission['annualTurnover']).toBeUndefined();
  });

  it('builds a self-employed submission with only visible business fields', () => {
    fillSelfEmployedSmartCreditCardForm(form);

    const submission = buildSubmission(SMART_CREDIT_CARD_SCHEMA, form);

    expect(Object.keys(submission).sort()).toEqual([...SELF_EMPLOYED_SUBMISSION_KEYS].sort());
    expect(submission['employmentStatus']).toBe('self_employed');
    expect(submission['businessName']).toBe('Watson Consulting');
    expect(submission['companyName']).toBeUndefined();
    expect(submission['studentId']).toBeUndefined();
  });

  it('never includes hidden fields such as internalRiskScore', () => {
    fillStudentSmartCreditCardForm(form);

    const submission = buildSubmission(SMART_CREDIT_CARD_SCHEMA, form);

    expect(submission['internalRiskScore']).toBeUndefined();
  });

  it('excludes conditional fields when their visibleWhen rule is false', () => {
    fillEmployeeSmartCreditCardForm(form);

    const submission = buildSubmission(SMART_CREDIT_CARD_SCHEMA, form);

    expect(submission['collegeName']).toBeUndefined();
    expect(submission['businessName']).toBeUndefined();
  });

  it('includes readonly visible fields such as applicationNumber', () => {
    fillStudentSmartCreditCardForm(form);

    const submission = buildSubmission(SMART_CREDIT_CARD_SCHEMA, form);

    expect(submission['applicationNumber']).toBe('CC-2026-00001');
  });

  it('excludes customerId when existingCustomer is false', () => {
    fillStudentSmartCreditCardForm(form);

    const submission = buildSubmission(SMART_CREDIT_CARD_SCHEMA, form);

    expect(submission['customerId']).toBeUndefined();
  });

  it('includes customerId when existingCustomer is true', () => {
    fillStudentSmartCreditCardForm(form);
    form.patchValue({ existingCustomer: true, customerId: 'CUST12345' });

    const submission = buildSubmission(SMART_CREDIT_CARD_SCHEMA, form);

    expect(submission['customerId']).toBe('CUST12345');
  });
});

describe('buildSubmission nested repeater', () => {
  const schema: FormSchema = {
    id: 'nested-submit',
    title: 'Nested Submit',
    fields: [
      { key: 'fullName', type: 'text', label: 'Full Name' },
      {
        key: 'jointApplicants',
        type: 'repeater',
        label: 'Joint Applicants',
        itemLabel: 'Applicant {{index}}',
        fields: [
          { key: 'fullName', type: 'text', label: 'Full Name' },
          {
            key: 'relation',
            type: 'dropdown',
            label: 'Relation',
            options: [
              { label: 'Minor', value: 'minor' },
              { label: 'Spouse', value: 'spouse' },
            ],
          },
          {
            key: 'guardianName',
            type: 'text',
            label: 'Guardian Name',
            visibleWhen: { field: 'relation', operator: 'equals', value: 'minor' },
          },
          {
            key: 'jointSignature',
            type: 'checkbox',
            label: 'Joint Signature',
            visibleWhen: { field: 'relation', operator: 'equals', value: 'spouse' },
          },
          { key: 'proof', type: 'file', label: 'Proof' },
        ],
      },
    ],
  };

  it('serializes nested FormArray rows without flattening', () => {
    const form = buildFormGroup(schema);
    form.patchValue({ fullName: 'Priya Sharma' });

    const array = form.get('jointApplicants') as FormArray;
    const repeaterField = schema.fields[1];
    addRepeaterItem(array, repeaterField);
    addRepeaterItem(array, repeaterField);

    (array.at(0) as FormGroup).patchValue({
      fullName: 'Aarav',
      relation: 'minor',
      guardianName: 'Priya',
      proof: { name: 'id.pdf', size: 1200, type: 'application/pdf' },
    });
    (array.at(1) as FormGroup).patchValue({
      fullName: 'Rohan',
      relation: 'spouse',
      jointSignature: true,
    });
    syncFieldVisibility(schema, form);

    const submission = buildSubmission(schema, form);

    expect(submission['fullName']).toBe('Priya Sharma');
    expect(Array.isArray(submission['jointApplicants'])).toBeTrue();

    const rows = submission['jointApplicants'] as Record<string, unknown>[];
    expect(rows.length).toBe(2);
    expect(rows[0]['fullName']).toBe('Aarav');
    expect(rows[0]['guardianName']).toBe('Priya');
    expect(rows[0]['jointSignature']).toBeUndefined();
    expect(rows[0]['proof']).toEqual({ name: 'id.pdf', size: 1200, type: 'application/pdf' });

    expect(rows[1]['fullName']).toBe('Rohan');
    expect(rows[1]['jointSignature']).toBeTrue();
    expect(rows[1]['guardianName']).toBeUndefined();
  });
});
