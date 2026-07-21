import { FormArray, FormGroup } from '@angular/forms';

import { CrossApplicantValidationConfig } from '../../../models/cross-applicant-validation.model';
import { FormSchema } from '../../../models/form-schema.model';
import { JOINT_FAMILY_ACCOUNT_SCHEMA } from '../../../schemas/bundled/joint-family-account.schema';
import { ACCOUNT_OPENING_SCHEMA } from '../../../schemas/bundled/account-opening.schema';

import { crossApplicantErrorMessage } from './cross-applicant.validator';
import { addRepeaterItem, buildFormGroup, removeRepeaterItem } from './form-model.factory';

const TEST_CONFIG: CrossApplicantValidationConfig = {
  repeaterKey: 'jointApplicants',
  fullNameKey: 'fullName',
  dateOfBirthKey: 'dateOfBirth',
  emailKey: 'email',
  mobileKey: 'mobile',
  idTypeKey: 'idType',
  idNumberKey: 'idNumber',
  identityTypePriority: ['aadhaar', 'pan', 'passport'],
  messages: {
    matchesPrimary: 'This applicant already exists as the Primary Applicant.',
    duplicateJoint: 'Duplicate joint applicant detected.',
    duplicateEmail: 'Email address must be unique across all applicants.',
    duplicateMobile: 'Mobile number must be unique across all applicants.',
    identityFallback:
      'Possible duplicate applicant: matching full name, date of birth, and mobile number.',
  },
};

const MINI_SCHEMA: FormSchema = {
  id: 'cross-applicant-mini',
  title: 'Cross Applicant Mini',
  crossApplicantValidation: TEST_CONFIG,
  fields: [
    { key: 'fullName', type: 'text', label: 'Full Name' },
    { key: 'dateOfBirth', type: 'date', label: 'Date of Birth' },
    { key: 'email', type: 'text', label: 'Email' },
    { key: 'mobile', type: 'text', label: 'Mobile' },
    { key: 'idType', type: 'dropdown', label: 'ID Type' },
    { key: 'idNumber', type: 'text', label: 'ID Number' },
    {
      key: 'jointApplicants',
      type: 'repeater',
      label: 'Joint Applicants',
      maxItems: 4,
      fields: [
        { key: 'fullName', type: 'text', label: 'Full Name' },
        { key: 'dateOfBirth', type: 'date', label: 'Date of Birth' },
        { key: 'email', type: 'text', label: 'Email' },
        { key: 'mobile', type: 'text', label: 'Mobile' },
        { key: 'idType', type: 'dropdown', label: 'ID Type' },
        { key: 'idNumber', type: 'text', label: 'ID Number' },
      ],
    },
  ],
};

describe('crossApplicantUniquenessValidator', () => {
  function setup(): {
    form: FormGroup;
    array: FormArray;
    repeaterField: (typeof MINI_SCHEMA.fields)[number];
  } {
    const form = buildFormGroup(MINI_SCHEMA);
    const array = form.get('jointApplicants') as FormArray;
    const repeaterField = MINI_SCHEMA.fields.find((field) => field.key === 'jointApplicants')!;
    return { form, array, repeaterField };
  }

  function fillPrimary(
    form: FormGroup,
    values: Partial<Record<string, string>> = {},
  ): void {
    form.patchValue({
      fullName: 'Priya Sharma',
      dateOfBirth: '1988-05-12',
      email: 'priya@example.com',
      mobile: '9876543210',
      idType: 'aadhaar',
      idNumber: '1234-5678-9012',
      ...values,
    });
  }

  it('flags a joint applicant whose Aadhaar matches the primary', () => {
    const { form, array, repeaterField } = setup();
    fillPrimary(form);
    addRepeaterItem(array, repeaterField);

    (array.at(0) as FormGroup).patchValue({
      fullName: 'Someone Else',
      dateOfBirth: '1990-01-01',
      email: 'other@example.com',
      mobile: '9123456780',
      idType: 'aadhaar',
      idNumber: '1234 5678 9012',
    });
    form.updateValueAndValidity();

    const idControl = (array.at(0) as FormGroup).get('idNumber');
    expect(idControl?.hasError('matchesPrimary')).toBeTrue();
    expect(crossApplicantErrorMessage(idControl)).toBe(
      'This applicant already exists as the Primary Applicant.',
    );
    expect(form.get('idNumber')?.hasError('matchesPrimary')).toBeFalse();
    expect(form.hasError('crossApplicantConflict')).toBeTrue();
  });

  it('flags duplicate joint applicants sharing the same PAN', () => {
    const { form, array, repeaterField } = setup();
    fillPrimary(form, { idType: 'passport', idNumber: 'P1234567' });
    addRepeaterItem(array, repeaterField);
    addRepeaterItem(array, repeaterField);

    (array.at(0) as FormGroup).patchValue({
      fullName: 'Aarav',
      email: 'a@example.com',
      mobile: '9000000001',
      idType: 'pan',
      idNumber: 'ABCDE1234F',
    });
    (array.at(1) as FormGroup).patchValue({
      fullName: 'Rohan',
      email: 'r@example.com',
      mobile: '9000000002',
      idType: 'pan',
      idNumber: 'abcde1234f',
    });
    form.updateValueAndValidity();

    expect((array.at(0) as FormGroup).get('idNumber')?.hasError('duplicateJoint')).toBeTrue();
    expect((array.at(1) as FormGroup).get('idNumber')?.hasError('duplicateJoint')).toBeTrue();
    expect(crossApplicantErrorMessage((array.at(0) as FormGroup).get('idNumber'))).toBe(
      'Duplicate joint applicant detected.',
    );
  });

  it('requires unique emails across primary and joint applicants', () => {
    const { form, array, repeaterField } = setup();
    fillPrimary(form);
    addRepeaterItem(array, repeaterField);

    (array.at(0) as FormGroup).patchValue({
      fullName: 'Aarav',
      email: 'PRIYA@example.com',
      mobile: '9000000001',
      idType: 'passport',
      idNumber: 'Z9999999',
    });
    form.updateValueAndValidity();

    expect((array.at(0) as FormGroup).get('email')?.hasError('duplicateEmail')).toBeTrue();
    expect(form.get('email')?.hasError('duplicateEmail')).toBeFalse();
  });

  it('requires unique mobiles across joint applicants', () => {
    const { form, array, repeaterField } = setup();
    fillPrimary(form);
    addRepeaterItem(array, repeaterField);
    addRepeaterItem(array, repeaterField);

    (array.at(0) as FormGroup).patchValue({
      fullName: 'Aarav',
      email: 'a@example.com',
      mobile: '9000000001',
      idType: 'passport',
      idNumber: 'A1',
    });
    (array.at(1) as FormGroup).patchValue({
      fullName: 'Rohan',
      email: 'r@example.com',
      mobile: '9000000001',
      idType: 'passport',
      idNumber: 'A2',
    });
    form.updateValueAndValidity();

    expect((array.at(0) as FormGroup).get('mobile')?.hasError('duplicateMobile')).toBeTrue();
    expect((array.at(1) as FormGroup).get('mobile')?.hasError('duplicateMobile')).toBeTrue();
  });

  it('uses name + DOB + mobile fallback when no priority identity document exists', () => {
    const { form, array, repeaterField } = setup();
    fillPrimary(form, { idType: 'driving_licence', idNumber: 'DL-99' });
    addRepeaterItem(array, repeaterField);

    (array.at(0) as FormGroup).patchValue({
      fullName: 'Priya Sharma',
      dateOfBirth: '1988-05-12',
      email: 'joint@example.com',
      mobile: '9876543210',
      idType: 'driving_licence',
      idNumber: 'DL-11',
    });
    form.updateValueAndValidity();

    expect((array.at(0) as FormGroup).get('fullName')?.hasError('identityFallback')).toBeTrue();
    expect(crossApplicantErrorMessage((array.at(0) as FormGroup).get('fullName'))).toContain(
      'Possible duplicate applicant',
    );
  });

  it('clears conflicts when a duplicate applicant is removed', () => {
    const { form, array, repeaterField } = setup();
    fillPrimary(form);
    addRepeaterItem(array, repeaterField);
    addRepeaterItem(array, repeaterField);

    (array.at(0) as FormGroup).patchValue({
      fullName: 'Aarav',
      email: 'a@example.com',
      mobile: '9000000001',
      idType: 'aadhaar',
      idNumber: '111122223333',
    });
    (array.at(1) as FormGroup).patchValue({
      fullName: 'Clone',
      email: 'c@example.com',
      mobile: '9000000002',
      idType: 'aadhaar',
      idNumber: '111122223333',
    });
    form.updateValueAndValidity();
    expect(form.hasError('crossApplicantConflict')).toBeTrue();

    removeRepeaterItem(array, repeaterField, 1);
    expect(array.length).toBe(1);
    expect((array.at(0) as FormGroup).get('idNumber')?.hasError('duplicateJoint')).toBeFalse();
    expect(form.hasError('crossApplicantConflict')).toBeFalse();
  });

  it('revalidates immediately when an applicant is edited', () => {
    const { form, array, repeaterField } = setup();
    fillPrimary(form);
    addRepeaterItem(array, repeaterField);

    const row = array.at(0) as FormGroup;
    row.patchValue({
      fullName: 'Aarav',
      email: 'a@example.com',
      mobile: '9000000001',
      idType: 'aadhaar',
      idNumber: '1234-5678-9012',
    });
    form.updateValueAndValidity();
    expect(row.get('idNumber')?.hasError('matchesPrimary')).toBeTrue();

    row.patchValue({ idNumber: '9999-8888-7777' });
    form.updateValueAndValidity();
    expect(row.get('idNumber')?.hasError('matchesPrimary')).toBeFalse();
  });

  it('wires into the Joint Family Account schema build path', () => {
    const form = buildFormGroup(JOINT_FAMILY_ACCOUNT_SCHEMA);
    expect(form.validator).toBeTruthy();

    const array = form.get('jointApplicants') as FormArray;
    const repeaterField = JOINT_FAMILY_ACCOUNT_SCHEMA.fields.find(
      (field) => field.key === 'jointApplicants',
    )!;

    form.patchValue({
      fullName: 'Priya Sharma',
      dateOfBirth: '1988-05-12',
      email: 'priya@example.com',
      mobile: '9876543210',
      address: '12 MG Road, Bengaluru KA',
      idType: 'aadhaar',
      idNumber: '123456789012',
    });
    addRepeaterItem(array, repeaterField);
    (array.at(0) as FormGroup).patchValue({
      fullName: 'Clone',
      dateOfBirth: '2000-01-01',
      relation: 'sibling',
      idType: 'aadhaar',
      idNumber: '123456789012',
      occupation: 'Student',
      email: 'clone@example.com',
      mobile: '9000000001',
    });
    form.updateValueAndValidity();

    expect((array.at(0) as FormGroup).get('idNumber')?.hasError('matchesPrimary')).toBeTrue();
  });

  it('does not attach cross-applicant validation to unrelated schemas', () => {
    const form = buildFormGroup(ACCOUNT_OPENING_SCHEMA);
    expect(ACCOUNT_OPENING_SCHEMA.crossApplicantValidation).toBeUndefined();
    expect(form.validator).toBeNull();
  });
});
