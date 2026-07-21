import { FormArray, FormGroup } from '@angular/forms';

import { Field } from '../../../models/field.model';
import { FormSchema } from '../../../models/form-schema.model';
import { ACCOUNT_OPENING_SCHEMA } from '../../../schemas/bundled/account-opening.schema';
import { LOAN_INQUIRY_SCHEMA } from '../../../schemas/bundled/loan-inquiry.schema';

import {
  addRepeaterItem,
  buildFormGroup,
  createRepeaterItemGroup,
  removeRepeaterItem,
  resolveRepeaterItemLabel,
} from './form-model.factory';

const REPEATER_DEMO_SCHEMA: FormSchema = {
  id: 'repeater-demo',
  title: 'Repeater Demo',
  fields: [
    {
      key: 'ownerName',
      type: 'text',
      label: 'Owner Name',
      validation: { required: true },
    },
    {
      key: 'members',
      type: 'repeater',
      label: 'Members',
      minItems: 0,
      maxItems: 2,
      addButtonText: 'Add Member',
      removeButtonText: 'Remove Member',
      itemLabel: 'Member {{index}}',
      fields: [
        {
          key: 'fullName',
          type: 'text',
          label: 'Full Name',
          validation: { required: true, minLength: 2 },
        },
        {
          key: 'email',
          type: 'text',
          label: 'Email',
          validation: {
            required: true,
            pattern: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$',
          },
        },
        {
          key: 'proof',
          type: 'file',
          label: 'Proof Upload',
        },
      ],
    },
  ],
};

describe('buildFormGroup required validation', () => {
  it('account-opening becomes valid when all required fields are satisfied', () => {
    const form = buildFormGroup(ACCOUNT_OPENING_SCHEMA);

    form.patchValue({
      fullName: 'Jane Doe',
      email: 'jane.doe@example.com',
      dateOfBirth: '1990-05-15',
      accountType: 'savings',
      services: [],
      termsAccepted: true,
    });

    expect(form.valid).withContext(reportInvalidControls(form)).toBeTrue();
  });

  it('loan-inquiry becomes valid when all required fields are satisfied', () => {
    const form = buildFormGroup(LOAN_INQUIRY_SCHEMA);

    form.patchValue({
      applicantName: 'John Smith',
      loanType: 'personal',
      loanAmount: '500000',
      purpose: 'Home renovation',
      preferredContactDate: '',
      consentToContact: true,
    });

    expect(form.valid).withContext(reportInvalidControls(form)).toBeTrue();
  });
});

describe('buildFormGroup repeater FormArray', () => {
  it('creates a FormArray for repeater fields with nested FormGroups', () => {
    const form = buildFormGroup(REPEATER_DEMO_SCHEMA);
    const members = form.get('members') as FormArray;

    expect(members).toBeInstanceOf(FormArray);
    expect(members.length).toBe(0);
    expect(form.get('ownerName')).toBeTruthy();
  });

  it('seeds minItems rows on initialise', () => {
    const schema: FormSchema = {
      ...REPEATER_DEMO_SCHEMA,
      fields: REPEATER_DEMO_SCHEMA.fields.map((field) =>
        field.key === 'members' ? { ...field, minItems: 1 } : field,
      ),
    };

    const form = buildFormGroup(schema);
    const members = form.get('members') as FormArray;

    expect(members.length).toBe(1);
    expect(members.at(0)).toBeInstanceOf(FormGroup);
    expect((members.at(0) as FormGroup).get('fullName')).toBeTruthy();
  });

  it('adds and removes applicants dynamically', () => {
    const form = buildFormGroup(REPEATER_DEMO_SCHEMA);
    const membersField = REPEATER_DEMO_SCHEMA.fields.find((field) => field.key === 'members') as Field;
    const members = form.get('members') as FormArray;

    expect(addRepeaterItem(members, membersField)).toBeTrue();
    expect(members.length).toBe(1);

    expect(addRepeaterItem(members, membersField)).toBeTrue();
    expect(members.length).toBe(2);

    expect(addRepeaterItem(members, membersField)).toBeFalse();
    expect(members.length).toBe(2);

    expect(removeRepeaterItem(members, membersField, 0)).toBeTrue();
    expect(members.length).toBe(1);
  });

  it('isolates validation per repeater row', () => {
    const form = buildFormGroup(REPEATER_DEMO_SCHEMA);
    const membersField = REPEATER_DEMO_SCHEMA.fields.find((field) => field.key === 'members') as Field;
    const members = form.get('members') as FormArray;

    addRepeaterItem(members, membersField);
    addRepeaterItem(members, membersField);

    const row0 = members.at(0) as FormGroup;
    const row1 = members.at(1) as FormGroup;

    row0.patchValue({ fullName: 'Alice', email: 'alice@example.com' });
    row1.patchValue({ fullName: '', email: 'not-an-email' });

    expect(row0.valid).toBeTrue();
    expect(row1.valid).toBeFalse();
    expect(form.valid).toBeFalse();
  });

  it('creates nested groups with file controls defaulting to null', () => {
    const group = createRepeaterItemGroup(
      REPEATER_DEMO_SCHEMA.fields.find((field) => field.key === 'members') as Field,
    );

    expect(group.get('proof')?.value).toBeNull();
  });

  it('resolves item labels with index tokens', () => {
    const membersField = REPEATER_DEMO_SCHEMA.fields.find((field) => field.key === 'members') as Field;
    expect(resolveRepeaterItemLabel(membersField, 0)).toBe('Member 1');
    expect(resolveRepeaterItemLabel(membersField, 1)).toBe('Member 2');
  });
});

function reportInvalidControls(form: ReturnType<typeof buildFormGroup>): string {
  return Object.entries(form.controls)
    .filter(([, control]) => control.invalid)
    .map(([name, control]) => `${name}: ${JSON.stringify(control.errors)}`)
    .join('; ');
}
