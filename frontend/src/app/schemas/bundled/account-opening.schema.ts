import { FormSchema } from '../../models/form-schema.model';

/** V1 bundled schema: Account Opening — schema-contract.md §15 */
export const ACCOUNT_OPENING_SCHEMA: FormSchema = {
  id: 'account-opening',
  title: 'Account Opening',
  description: 'Apply for a new savings or current account.',
  submitLabel: 'Submit Application',
  fields: [
    {
      key: 'fullName',
      type: 'text',
      label: 'Full Name',
      section: 'Personal Information',
      placeholder: 'Enter your full name',
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
          minimumAge: 'Applicant must be at least 18 years old.',
          maximumAge: 'Please enter a valid date of birth.',
        },
      },
    },
    {
      key: 'accountType',
      type: 'dropdown',
      label: 'Account Type',
      section: 'Account Details',
      options: [
        { label: 'Savings', value: 'savings' },
        { label: 'Current', value: 'current' },
      ],
      validation: {
        required: true,
        messages: {
          required: 'Please select an account type',
        },
      },
    },
    {
      key: 'services',
      type: 'multiselect',
      label: 'Additional Services',
      options: [
        { label: 'Internet Banking', value: 'internet_banking' },
        { label: 'Debit Card', value: 'debit_card' },
      ],
      defaultValue: [],
    },
    {
      key: 'termsAccepted',
      type: 'checkbox',
      label: 'I accept the terms and conditions',
      section: 'Declaration',
      defaultValue: false,
      validation: {
        required: true,
        messages: {
          required: 'You must accept the terms and conditions',
        },
      },
    },
  ],
};
