import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { Field } from '../../../models/field.model';
import { FormSchema } from '../../../models/form-schema.model';

import { createVisibilityTestSchema } from '../testing/formflow-test.helpers';

import {
  evaluateVisibilityRule,
  isFieldVisible,
  markApplicableFieldsTouched,
  refreshApplicableValidationState,
  shouldIncludeFieldInSubmission,
  syncFieldVisibility,
} from './field-visibility.util';
import { addRepeaterItem, buildFormGroup } from './form-model.factory';

describe('evaluateVisibilityRule', () => {
  it('returns true when the equals rule matches', () => {
    expect(
      evaluateVisibilityRule(
        { field: 'employmentStatus', operator: 'equals', value: 'student' },
        'student',
      ),
    ).toBeTrue();
  });

  it('returns false when the equals rule does not match', () => {
    expect(
      evaluateVisibilityRule(
        { field: 'employmentStatus', operator: 'equals', value: 'student' },
        'employee',
      ),
    ).toBeFalse();
  });
});

describe('isFieldVisible', () => {
  const schema = createVisibilityTestSchema();
  let form: FormGroup;

  beforeEach(() => {
    form = buildFormGroup(schema);
  });

  it('returns true when visibleWhen evaluates true', () => {
    form.get('employmentStatus')?.setValue('student');
    const collegeField = schema.fields.find((field) => field.key === 'collegeName')!;

    expect(isFieldVisible(collegeField, form)).toBeTrue();
  });

  it('returns false when visibleWhen evaluates false', () => {
    form.get('employmentStatus')?.setValue('employee');
    const collegeField = schema.fields.find((field) => field.key === 'collegeName')!;

    expect(isFieldVisible(collegeField, form)).toBeFalse();
  });
});

describe('shouldIncludeFieldInSubmission', () => {
  const schema = createVisibilityTestSchema();
  let form: FormGroup;

  beforeEach(() => {
    form = buildFormGroup(schema);
  });

  it('excludes hidden fields from submission inclusion', () => {
    const hiddenField = schema.fields.find((field) => field.key === 'internalRiskScore')!;

    expect(shouldIncludeFieldInSubmission(hiddenField, form)).toBeFalse();
  });

  it('includes readonly fields when they are visible', () => {
    const readonlyField = schema.fields.find((field) => field.key === 'applicationNumber')!;

    expect(shouldIncludeFieldInSubmission(readonlyField, form)).toBeTrue();
  });
});

describe('syncFieldVisibility', () => {
  const schema = createVisibilityTestSchema();
  let form: FormGroup;

  beforeEach(() => {
    form = buildFormGroup(schema);
  });

  it('disables fields hidden by visibleWhen', () => {
    form.get('employmentStatus')?.setValue('student');
    syncFieldVisibility(schema, form);

    expect(form.get('companyName')?.disabled).toBeTrue();
    expect(form.get('collegeName')?.enabled).toBeTrue();
  });

  it('disables schema-disabled fields while keeping them visible', () => {
    syncFieldVisibility(schema, form);

    expect(form.get('lockedField')?.disabled).toBeTrue();
    expect(
      shouldIncludeFieldInSubmission(
        schema.fields.find((field) => field.key === 'lockedField')!,
        form,
      ),
    ).toBeTrue();
  });

  it('clears validation errors when a field becomes hidden', () => {
    const collegeField = schema.fields.find((field) => field.key === 'collegeName')!;
    const control = form.get('collegeName')!;

    form.get('employmentStatus')?.setValue('student');
    syncFieldVisibility(schema, form);
    control.setErrors({ required: true });
    control.markAsTouched();

    form.get('employmentStatus')?.setValue('employee');
    syncFieldVisibility(schema, form);

    expect(control.errors).toBeNull();
    expect(control.touched).toBeFalse();
  });
});

describe('refreshApplicableValidationState', () => {
  const schema = createVisibilityTestSchema();
  let form: FormGroup;

  beforeEach(() => {
    form = buildFormGroup(schema);
  });

  it('disables hidden conditional fields before validating enabled controls', () => {
    form.get('employmentStatus')?.setValue('student');
    refreshApplicableValidationState(schema, form);

    expect(form.get('companyName')?.disabled).toBeTrue();
    expect(form.valid).toBeTrue();
  });
});

describe('markApplicableFieldsTouched', () => {
  const schema = createVisibilityTestSchema();
  let form: FormGroup;

  beforeEach(() => {
    form = buildFormGroup(schema);
    syncFieldVisibility(schema, form);
  });

  it('marks only visible enabled fields as touched', () => {
    markApplicableFieldsTouched(schema, form);

    expect(form.get('applicationNumber')?.touched).toBeTrue();
    expect(form.get('internalRiskScore')?.touched).toBeFalse();
    expect(form.get('lockedField')?.touched).toBeFalse();
  });
});

describe('nested repeater visibility', () => {
  const nestedSchema: FormSchema = {
    id: 'nested-visibility',
    title: 'Nested Visibility',
    fields: [
      {
        key: 'applicants',
        type: 'repeater',
        label: 'Applicants',
        minItems: 0,
        maxItems: 3,
        fields: [
          {
            key: 'relation',
            type: 'dropdown',
            label: 'Relation',
            options: [
              { label: 'Minor', value: 'minor' },
              { label: 'Spouse', value: 'spouse' },
              { label: 'Parent', value: 'parent' },
            ],
          },
          {
            key: 'guardianName',
            type: 'text',
            label: 'Guardian Name',
            visibleWhen: { field: 'relation', operator: 'equals', value: 'minor' },
            validation: { required: true },
          },
          {
            key: 'jointSignature',
            type: 'checkbox',
            label: 'Joint Signature',
            visibleWhen: { field: 'relation', operator: 'equals', value: 'spouse' },
          },
          {
            key: 'relationshipProof',
            type: 'file',
            label: 'Relationship Proof',
            visibleWhen: { field: 'relation', operator: 'equals', value: 'parent' },
          },
        ],
      },
    ],
  };

  it('scopes visibleWhen per repeater row independently', () => {
    const form = buildFormGroup(nestedSchema);
    const applicantsField = nestedSchema.fields[0];
    const array = form.get('applicants') as FormArray;

    addRepeaterItem(array, applicantsField);
    addRepeaterItem(array, applicantsField);

    const row0 = array.at(0) as FormGroup;
    const row1 = array.at(1) as FormGroup;

    row0.patchValue({ relation: 'minor' });
    row1.patchValue({ relation: 'spouse' });
    syncFieldVisibility(nestedSchema, form);

    expect(isFieldVisible(applicantsField.fields![1], row0)).toBeTrue();
    expect(isFieldVisible(applicantsField.fields![2], row0)).toBeFalse();
    expect(row0.get('guardianName')?.enabled).toBeTrue();
    expect(row0.get('jointSignature')?.disabled).toBeTrue();

    expect(isFieldVisible(applicantsField.fields![2], row1)).toBeTrue();
    expect(isFieldVisible(applicantsField.fields![1], row1)).toBeFalse();
    expect(row1.get('jointSignature')?.enabled).toBeTrue();
    expect(row1.get('guardianName')?.disabled).toBeTrue();
  });
});
