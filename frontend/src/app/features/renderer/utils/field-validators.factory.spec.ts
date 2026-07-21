import { FormControl } from '@angular/forms';

import { Field } from '../../../models/field.model';

import {
  buildDateValidators,
  buildFieldValidators,
  buildPatternValidators,
  buildRangeValidators,
  buildRequiredValidators,
} from './field-validators.factory';

function validateControl(field: Field, value: unknown) {
  const control = new FormControl(value, buildFieldValidators(field));
  control.updateValueAndValidity();
  return control;
}

describe('buildRequiredValidators', () => {
  it('marks required text fields as invalid when empty', () => {
    const field: Field = {
      key: 'fullName',
      type: 'text',
      label: 'Full Name',
      validation: { required: true },
    };

    const control = new FormControl('', buildRequiredValidators(field));
    control.updateValueAndValidity();

    expect(control.hasError('required')).toBeTrue();
  });

  it('requires checkbox fields to be checked', () => {
    const field: Field = {
      key: 'termsAccepted',
      type: 'checkbox',
      label: 'Terms',
      validation: { required: true },
    };

    const control = new FormControl(false, buildRequiredValidators(field));
    control.updateValueAndValidity();

    expect(control.hasError('required')).toBeTrue();
  });
});

describe('buildPatternValidators', () => {
  it('rejects values that do not match the schema pattern', () => {
    const field: Field = {
      key: 'email',
      type: 'text',
      label: 'Email',
      validation: {
        pattern: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$',
      },
    };

    const invalid = new FormControl('not-an-email', buildPatternValidators(field));
    invalid.updateValueAndValidity();

    const valid = new FormControl('user@example.com', buildPatternValidators(field));
    valid.updateValueAndValidity();

    expect(invalid.hasError('pattern')).toBeTrue();
    expect(valid.hasError('pattern')).toBeFalse();
  });

  it('skips pattern validation for empty values', () => {
    const field: Field = {
      key: 'email',
      type: 'text',
      label: 'Email',
      validation: { pattern: '^[A-Za-z0-9._%+-]+@' },
    };

    const control = new FormControl('', buildPatternValidators(field));
    control.updateValueAndValidity();

    expect(control.valid).toBeTrue();
  });
});

describe('buildDateValidators', () => {
  const dateField = (validation: Field['validation']): Field => ({
    key: 'dateOfBirth',
    type: 'date',
    label: 'Date of Birth',
    validation,
  });

  it('rejects future dates when allowFutureDates is false', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const iso = tomorrow.toISOString().slice(0, 10);

    const control = validateControl(
      dateField({ allowFutureDates: false }),
      iso,
    );

    expect(control.hasError('futureDate')).toBeTrue();
  });

  it('rejects applicants younger than the configured minimum age', () => {
    const control = validateControl(
      dateField({ minimumAge: 18 }),
      '2015-01-01',
    );

    expect(control.hasError('minimumAge')).toBeTrue();
  });

  it('rejects applicants older than the configured maximum age', () => {
    const control = validateControl(
      dateField({ maximumAge: 120 }),
      '1800-01-01',
    );

    expect(control.hasError('maximumAge')).toBeTrue();
  });
});

describe('buildRangeValidators', () => {
  const amountField = (validation: Field['validation']): Field => ({
    key: 'monthlyIncome',
    type: 'text',
    label: 'Monthly Income',
    validation,
  });

  it('rejects values below the configured minimum', () => {
    const control = validateControl(amountField({ min: 1 }), '0');

    expect(control.hasError('min')).toBeTrue();
  });

  it('rejects values above the configured maximum', () => {
    const control = validateControl(amountField({ max: 100 }), '150');

    expect(control.hasError('max')).toBeTrue();
  });
});

describe('buildFieldValidators', () => {
  it('skips all validators for readonly fields', () => {
    const field: Field = {
      key: 'customerId',
      type: 'text',
      label: 'Customer ID',
      readonly: true,
      defaultValue: 'CUS-00045821',
      validation: {
        required: true,
        pattern: '^[A-Z0-9]{8,12}$',
      },
    };

    const control = validateControl(field, 'CUS-00045821');

    expect(control.valid).toBeTrue();
    expect(control.hasError('pattern')).toBeFalse();
    expect(control.hasError('required')).toBeFalse();
  });
});
