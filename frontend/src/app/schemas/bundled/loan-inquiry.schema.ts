import { FormSchema } from '../../models/form-schema.model';

/** V1 bundled schema: Loan Inquiry — schema-contract.md §16 */
export const LOAN_INQUIRY_SCHEMA: FormSchema = {
  id: 'loan-inquiry',
  title: 'Loan Inquiry',
  description: 'Submit a personal loan inquiry.',
  submitLabel: 'Submit Inquiry',
  fields: [
    {
      key: 'applicantName',
      type: 'text',
      label: 'Applicant Name',
      section: 'Personal Information',
      validation: {
        required: true,
        minLength: 3,
        maxLength: 100,
        pattern: "^[A-Za-z][A-Za-z .'.-]{2,99}$",
        messages: {
          required: 'Applicant name is required',
          minLength: 'Applicant name must be at least 3 characters',
          maxLength: 'Applicant name must not exceed 100 characters',
          pattern:
            'Enter a valid name using only letters, spaces, hyphens, apostrophes, or periods',
        },
      },
    },
    {
      key: 'loanType',
      type: 'dropdown',
      label: 'Loan Type',
      section: 'Loan Details',
      options: [
        { label: 'Personal', value: 'personal' },
        { label: 'Home', value: 'home' },
        { label: 'Auto', value: 'auto' },
      ],
      validation: {
        required: true,
        messages: {
          required: 'Please select a loan type',
        },
      },
    },
    {
      key: 'loanAmount',
      type: 'text',
      label: 'Requested Amount',
      placeholder: 'e.g. 500000',
      validation: {
        required: true,
        pattern: '^[0-9]+$',
        messages: {
          required: 'Loan amount is required',
          pattern: 'Enter a valid numeric amount',
        },
      },
    },
    {
      key: 'purpose',
      type: 'textarea',
      label: 'Purpose of Loan',
      placeholder: 'Briefly describe the purpose',
      validation: {
        required: true,
        messages: {
          required: 'Purpose is required',
        },
      },
    },
    {
      key: 'preferredContactDate',
      type: 'date',
      label: 'Preferrable Contact Date',
    },
    {
      key: 'consentToContact',
      type: 'checkbox',
      label: 'I consent to be contacted regarding this inquiry',
      section: 'Declaration',
      defaultValue: false,
      validation: {
        required: true,
        messages: {
          required: 'Consent is required to proceed',
        },
      },
    },
  ],
};
