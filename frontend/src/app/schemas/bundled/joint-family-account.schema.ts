import { FormSchema } from '../../models/form-schema.model';

/**
 * Joint / Family Account Builder — schema-driven demo of `repeater` + `file`.
 * Primary applicant uses flat fields; joint applicants use FormArray rows.
 */
export const JOINT_FAMILY_ACCOUNT_SCHEMA: FormSchema = {
  id: 'joint-family-account',
  title: 'Joint / Family Account Builder',
  description:
    'Open a joint savings account with a primary applicant and dynamically added joint applicants.',
  submitLabel: 'Submit Joint Application',
  crossApplicantValidation: {
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
  },
  fields: [
    {
      key: 'fullName',
      type: 'text',
      label: 'Full Name',
      section: 'Primary Applicant',
      placeholder: 'Enter primary applicant full name',
      validation: {
        required: true,
        minLength: 3,
        maxLength: 100,
        pattern: "^[A-Za-z][A-Za-z .'.-]{2,99}$",
        messages: {
          required: 'Full name is required',
          minLength: 'Full name must be at least 3 characters',
          maxLength: 'Full name must not exceed 100 characters',
          pattern:
            'Enter a valid full name using only letters, spaces, hyphens, apostrophes, or periods',
        },
      },
    },
    {
      key: 'dateOfBirth',
      type: 'date',
      label: 'Date of Birth',
      validation: {
        required: true,
        minimumAge: 18,
        maximumAge: 120,
        allowFutureDates: false,
        messages: {
          required: 'Date of birth is required',
          futureDate: 'Date of birth cannot be in the future.',
          minimumAge: 'Primary applicant must be at least 18 years old.',
          maximumAge: 'Please enter a valid date of birth.',
        },
      },
    },
    {
      key: 'email',
      type: 'text',
      label: 'Email Address',
      placeholder: 'name@example.com',
      validation: {
        required: true,
        pattern: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$',
        messages: {
          required: 'Email address is required',
          pattern: 'Enter a valid email address',
        },
      },
    },
    {
      key: 'mobile',
      type: 'text',
      label: 'Mobile Number',
      placeholder: '10-digit mobile number',
      validation: {
        required: true,
        pattern: '^[6-9][0-9]{9}$',
        messages: {
          required: 'Mobile number is required',
          pattern: 'Enter a valid 10-digit Indian mobile number',
        },
      },
    },
    {
      key: 'address',
      type: 'textarea',
      label: 'Residential Address',
      placeholder: 'Enter full residential address',
      validation: {
        required: true,
        minLength: 10,
        maxLength: 300,
        messages: {
          required: 'Address is required',
          minLength: 'Address must be at least 10 characters',
          maxLength: 'Address must not exceed 300 characters',
        },
      },
    },
    {
      key: 'idType',
      type: 'dropdown',
      label: 'ID Type',
      section: 'Identity Verification',
      options: [
        { label: 'Aadhaar', value: 'aadhaar' },
        { label: 'PAN', value: 'pan' },
        { label: 'Passport', value: 'passport' },
        { label: 'Driving Licence', value: 'driving_licence' },
      ],
      validation: {
        required: true,
        messages: { required: 'Please select an ID type' },
      },
    },
    {
      key: 'idNumber',
      type: 'text',
      label: 'ID Number',
      placeholder: 'Enter ID number',
      validation: {
        required: true,
        minLength: 4,
        maxLength: 30,
        messages: {
          required: 'ID number is required',
          minLength: 'ID number must be at least 4 characters',
          maxLength: 'ID number must not exceed 30 characters',
        },
      },
    },
    {
      key: 'jointApplicants',
      type: 'repeater',
      label: 'Joint Applicants',
      section: 'Joint Applicants',
      minItems: 0,
      maxItems: 4,
      addButtonText: 'Add Another Applicant',
      removeButtonText: 'Remove Applicant',
      itemLabel: 'Applicant {{index}}',
      fields: [
        {
          key: 'fullName',
          type: 'text',
          label: 'Full Name',
          placeholder: 'Enter applicant full name',
          validation: {
            required: true,
            minLength: 3,
            maxLength: 100,
            pattern: "^[A-Za-z][A-Za-z .'.-]{2,99}$",
            messages: {
              required: 'Full name is required',
              minLength: 'Full name must be at least 3 characters',
              maxLength: 'Full name must not exceed 100 characters',
              pattern: 'Enter a valid full name',
            },
          },
        },
        {
          key: 'dateOfBirth',
          type: 'date',
          label: 'Date of Birth',
          validation: {
            required: true,
            allowFutureDates: false,
            maximumAge: 120,
            messages: {
              required: 'Date of birth is required',
              futureDate: 'Date of birth cannot be in the future.',
              maximumAge: 'Please enter a valid date of birth.',
            },
          },
        },
        {
          key: 'relation',
          type: 'dropdown',
          label: 'Relation',
          options: [
            { label: 'Minor', value: 'minor' },
            { label: 'Spouse', value: 'spouse' },
            { label: 'Parent', value: 'parent' },
            { label: 'Sibling', value: 'sibling' },
            { label: 'Other', value: 'other' },
          ],
          validation: {
            required: true,
            messages: { required: 'Please select a relation' },
          },
        },
        {
          key: 'idType',
          type: 'dropdown',
          label: 'ID Type',
          options: [
            { label: 'Aadhaar', value: 'aadhaar' },
            { label: 'PAN', value: 'pan' },
            { label: 'Passport', value: 'passport' },
            { label: 'Driving Licence', value: 'driving_licence' },
          ],
          validation: {
            required: true,
            messages: { required: 'Please select an ID type' },
          },
        },
        {
          key: 'idNumber',
          type: 'text',
          label: 'ID Number',
          placeholder: 'Enter ID number',
          validation: {
            required: true,
            minLength: 4,
            maxLength: 30,
            messages: {
              required: 'ID number is required',
              minLength: 'ID number must be at least 4 characters',
              maxLength: 'ID number must not exceed 30 characters',
            },
          },
        },
        {
          key: 'occupation',
          type: 'text',
          label: 'Occupation',
          placeholder: 'Enter occupation',
          validation: {
            required: true,
            minLength: 2,
            maxLength: 80,
            messages: {
              required: 'Occupation is required',
              minLength: 'Occupation must be at least 2 characters',
              maxLength: 'Occupation must not exceed 80 characters',
            },
          },
        },
        {
          key: 'email',
          type: 'text',
          label: 'Email',
          placeholder: 'name@example.com',
          validation: {
            pattern: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$',
            messages: {
              pattern: 'Enter a valid email address',
            },
          },
        },
        {
          key: 'mobile',
          type: 'text',
          label: 'Mobile',
          placeholder: '10-digit mobile number',
          validation: {
            pattern: '^[6-9][0-9]{9}$',
            messages: {
              pattern: 'Enter a valid 10-digit Indian mobile number',
            },
          },
        },
        {
          key: 'guardianName',
          type: 'text',
          label: 'Guardian Name',
          placeholder: 'Enter guardian full name',
          visibleWhen: { field: 'relation', operator: 'equals', value: 'minor' },
          validation: {
            required: true,
            minLength: 3,
            maxLength: 100,
            messages: {
              required: 'Guardian name is required for minors',
              minLength: 'Guardian name must be at least 3 characters',
              maxLength: 'Guardian name must not exceed 100 characters',
            },
          },
        },
        {
          key: 'guardianContact',
          type: 'text',
          label: 'Guardian Contact',
          placeholder: 'Guardian mobile number',
          visibleWhen: { field: 'relation', operator: 'equals', value: 'minor' },
          validation: {
            required: true,
            pattern: '^[6-9][0-9]{9}$',
            messages: {
              required: 'Guardian contact is required for minors',
              pattern: 'Enter a valid 10-digit mobile number',
            },
          },
        },
        {
          key: 'guardianId',
          type: 'text',
          label: 'Guardian ID',
          placeholder: 'Guardian ID number',
          visibleWhen: { field: 'relation', operator: 'equals', value: 'minor' },
          validation: {
            required: true,
            minLength: 4,
            maxLength: 30,
            messages: {
              required: 'Guardian ID is required for minors',
              minLength: 'Guardian ID must be at least 4 characters',
              maxLength: 'Guardian ID must not exceed 30 characters',
            },
          },
        },
        {
          key: 'jointSignature',
          type: 'checkbox',
          label: 'Joint Signature Required',
          defaultValue: false,
          visibleWhen: { field: 'relation', operator: 'equals', value: 'spouse' },
          validation: {
            required: true,
            messages: {
              required: 'Joint signature confirmation is required for spouse applicants',
            },
          },
        },
        {
          key: 'relationshipProof',
          type: 'file',
          label: 'Relationship Proof Upload',
          accept: '.pdf,.jpg,.jpeg,.png',
          visibleWhen: { field: 'relation', operator: 'equals', value: 'parent' },
          validation: {
            required: true,
            messages: {
              required: 'Please upload relationship proof for parent applicants',
            },
          },
        },
      ],
    },
  ],
};
