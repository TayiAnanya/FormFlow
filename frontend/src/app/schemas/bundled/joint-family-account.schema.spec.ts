import { JOINT_FAMILY_ACCOUNT_SCHEMA } from './joint-family-account.schema';

describe('JOINT_FAMILY_ACCOUNT_SCHEMA', () => {
  it('defines the Joint / Family Account form identity', () => {
    expect(JOINT_FAMILY_ACCOUNT_SCHEMA.id).toBe('joint-family-account');
    expect(JOINT_FAMILY_ACCOUNT_SCHEMA.title).toBe('Joint / Family Account Builder');
    expect(JOINT_FAMILY_ACCOUNT_SCHEMA.submitLabel).toBeTruthy();
  });

  it('keeps primary applicant as flat top-level fields', () => {
    const keys = JOINT_FAMILY_ACCOUNT_SCHEMA.fields.map((field) => field.key);

    expect(keys).toContain('fullName');
    expect(keys).toContain('dateOfBirth');
    expect(keys).toContain('email');
    expect(keys).toContain('mobile');
    expect(keys).toContain('address');
    expect(keys).toContain('idType');
    expect(keys).toContain('idNumber');
  });

  it('declares schema-driven cross-applicant validation', () => {
    expect(JOINT_FAMILY_ACCOUNT_SCHEMA.crossApplicantValidation?.repeaterKey).toBe(
      'jointApplicants',
    );
    expect(JOINT_FAMILY_ACCOUNT_SCHEMA.crossApplicantValidation?.identityTypePriority).toEqual([
      'aadhaar',
      'pan',
      'passport',
    ]);
    expect(JOINT_FAMILY_ACCOUNT_SCHEMA.crossApplicantValidation?.messages.matchesPrimary).toBe(
      'This applicant already exists as the Primary Applicant.',
    );
  });

  it('defines a schema-driven jointApplicants repeater', () => {
    const repeater = JOINT_FAMILY_ACCOUNT_SCHEMA.fields.find(
      (field) => field.key === 'jointApplicants',
    );

    expect(repeater?.type).toBe('repeater');
    expect(repeater?.minItems).toBe(0);
    expect(repeater?.maxItems).toBe(4);
    expect(repeater?.addButtonText).toBe('Add Another Applicant');
    expect(repeater?.removeButtonText).toBe('Remove Applicant');
    expect(repeater?.itemLabel).toBe('Applicant {{index}}');
  });

  it('includes nested applicant fields and conditional rules', () => {
    const repeater = JOINT_FAMILY_ACCOUNT_SCHEMA.fields.find(
      (field) => field.key === 'jointApplicants',
    );
    const nestedKeys = (repeater?.fields ?? []).map((field) => field.key);

    expect(nestedKeys).toEqual(
      jasmine.arrayContaining([
        'fullName',
        'dateOfBirth',
        'relation',
        'idType',
        'idNumber',
        'occupation',
        'email',
        'mobile',
        'guardianName',
        'guardianContact',
        'guardianId',
        'jointSignature',
        'relationshipProof',
      ]),
    );

    const guardian = repeater?.fields?.find((field) => field.key === 'guardianName');
    expect(guardian?.visibleWhen).toEqual({
      field: 'relation',
      operator: 'equals',
      value: 'minor',
    });

    const signature = repeater?.fields?.find((field) => field.key === 'jointSignature');
    expect(signature?.visibleWhen).toEqual({
      field: 'relation',
      operator: 'equals',
      value: 'spouse',
    });

    const proof = repeater?.fields?.find((field) => field.key === 'relationshipProof');
    expect(proof?.type).toBe('file');
    expect(proof?.visibleWhen).toEqual({
      field: 'relation',
      operator: 'equals',
      value: 'parent',
    });
  });
});
