import { FormSchema } from '../../models/form-schema.model';

/**
 * V1 bundled schema: Smart Credit Card Application
 *
 * Flagship schema for advanced schema-driven capabilities (FF-010).
 * Bonus properties (visibleWhen, hidden, readonly, disabled) are configuration
 * only — the renderer currently ignores them and renders all fields.
 */
export const SMART_CREDIT_CARD_SCHEMA: FormSchema = {
  id: 'smart-credit-card',
  title: 'Smart Credit Card Application',
  description:
    'Apply for a premium credit card. This advanced workflow demonstrates conditional sections, readonly fields, and hidden metadata — powered entirely by schema configuration.',
  submitLabel: 'Submit Application',
  fields: [
    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 1 — Personal Information
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'fullName',
      type: 'text',
      label: 'Full Name',
      section: 'Personal Information',
      placeholder: 'Enter your full legal name as per PAN card',
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
      key: 'mobileNumber',
      type: 'text',
      label: 'Mobile Number',
      placeholder: 'e.g. 9876543210',
      validation: {
        required: true,
        pattern: '^(?!0000000000|1111111111|1234567890)[6-9][0-9]{9}$',
        messages: {
          required: 'Mobile number is required',
          pattern: 'Enter a valid 10-digit Indian mobile number',
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

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 2 — Card Details
    // Employment Status is the controlling field for conditional sections (FF-010).
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'cardType',
      type: 'dropdown',
      label: 'Card Type',
      section: 'Card Details',
      options: [
        { label: 'Gold', value: 'gold' },
        { label: 'Platinum', value: 'platinum' },
        { label: 'Titanium', value: 'titanium' },
      ],
      validation: {
        required: true,
        messages: {
          required: 'Please select a card type',
        },
      },
    },
    {
      key: 'preferredBranch',
      type: 'dropdown',
      label: 'Preferred Branch',
      options: [
        { label: 'Mumbai — Bandra Kurla Complex', value: 'mumbai_bkc' },
        { label: 'Delhi — Connaught Place', value: 'delhi_cp' },
        { label: 'Bengaluru — Koramangala', value: 'bengaluru_koramangala' },
        { label: 'Chennai — T. Nagar', value: 'chennai_tnagar' },
        { label: 'Hyderabad — Hitech City', value: 'hyderabad_hitech' },
        { label: 'Pune — Shivajinagar', value: 'pune_shivajinagar' },
        { label: 'Kolkata — Park Street', value: 'kolkata_park_street' },
      ],
      validation: {
        required: true,
        messages: {
          required: 'Please select your preferred branch',
        },
      },
    },
    {
      key: 'employmentStatus',
      type: 'dropdown',
      label: 'Employment Status',
      section: 'Employment Details',
      options: [
        { label: 'Student', value: 'student' },
        { label: 'Salaried Employee', value: 'salaried_employee' },
        { label: 'Self Employed', value: 'self_employed' },
      ],
      validation: {
        required: true,
        messages: {
          required: 'Please select your employment status',
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 3 — Student Information
    // visibleWhen: Employment Status == Student (FF-010)
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'collegeName',
      type: 'text',
      label: 'College Name',
      placeholder: 'Enter your college or university name',
      visibleWhen: {
        field: 'employmentStatus',
        operator: 'equals',
        value: 'student',
      },
      validation: {
        messages: {
          required: 'College name is required',
        },
      },
    },
    {
      key: 'studentId',
      type: 'text',
      label: 'Student ID',
      placeholder: 'e.g. STU2024001234',
      visibleWhen: {
        field: 'employmentStatus',
        operator: 'equals',
        value: 'student',
      },
      validation: {
        messages: {
          required: 'Student ID is required',
        },
      },
    },
    {
      key: 'graduationYear',
      type: 'text',
      label: 'Graduation Year',
      placeholder: 'e.g. 2027',
      visibleWhen: {
        field: 'employmentStatus',
        operator: 'equals',
        value: 'student',
      },
      validation: {
        messages: {
          required: 'Graduation year is required',
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 4 — Employment Information
    // visibleWhen: Employment Status == Salaried Employee (FF-010)
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'companyName',
      type: 'text',
      label: 'Company Name',
      placeholder: 'Enter your current employer name',
      visibleWhen: {
        field: 'employmentStatus',
        operator: 'equals',
        value: 'salaried_employee',
      },
      validation: {
        messages: {
          required: 'Company name is required',
        },
      },
    },
    {
      key: 'jobTitle',
      type: 'text',
      label: 'Job Title',
      placeholder: 'e.g. Senior Software Engineer',
      visibleWhen: {
        field: 'employmentStatus',
        operator: 'equals',
        value: 'salaried_employee',
      },
      validation: {
        messages: {
          required: 'Job title is required',
        },
      },
    },
    {
      key: 'monthlyIncome',
      type: 'text',
      label: 'Monthly Income (INR)',
      placeholder: 'e.g. 85000',
      visibleWhen: {
        field: 'employmentStatus',
        operator: 'equals',
        value: 'salaried_employee',
      },
      validation: {
        min: 1,
        pattern: '^[0-9]+$',
        messages: {
          required: 'Monthly income is required',
          min: 'Monthly income must be greater than zero',
          pattern: 'Enter a valid numeric amount',
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 5 — Business Information
    // visibleWhen: Employment Status == Self Employed (FF-010)
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'businessName',
      type: 'text',
      label: 'Business Name',
      placeholder: 'Enter your registered business name',
      visibleWhen: {
        field: 'employmentStatus',
        operator: 'equals',
        value: 'self_employed',
      },
      validation: {
        messages: {
          required: 'Business name is required',
        },
      },
    },
    {
      key: 'gstNumber',
      type: 'text',
      label: 'GST Number',
      placeholder: 'e.g. 27AABCU9603R1ZM',
      visibleWhen: {
        field: 'employmentStatus',
        operator: 'equals',
        value: 'self_employed',
      },
      validation: {
        pattern:
          '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$',
        messages: {
          required: 'GST number is required',
          pattern: 'Enter a valid 15-character GSTIN',
        },
      },
    },
    {
      key: 'annualTurnover',
      type: 'text',
      label: 'Annual Turnover (INR)',
      placeholder: 'e.g. 2400000',
      visibleWhen: {
        field: 'employmentStatus',
        operator: 'equals',
        value: 'self_employed',
      },
      validation: {
        min: 1,
        pattern: '^[0-9]+$',
        messages: {
          required: 'Annual turnover is required',
          min: 'Annual turnover must be greater than zero',
          pattern: 'Enter a valid numeric amount',
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 6 — Customer Information
    // visibleWhen on Customer ID: Existing Customer == true (FF-010)
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'existingCustomer',
      type: 'checkbox',
      label: 'Existing Customer',
      section: 'Customer Information',
      defaultValue: false,
    },
    {
      key: 'customerId',
      type: 'text',
      label: 'Customer ID',
      placeholder: 'Auto-populated for existing customers',
      readonly: true,
      visibleWhen: {
        field: 'existingCustomer',
        operator: 'equals',
        value: true,
      },
      validation: {
        pattern: '^[A-Z0-9]{8,12}$',
        messages: {
          required: 'Customer ID is required for existing customers',
          pattern: 'Enter a valid customer ID (8–12 uppercase alphanumeric characters)',
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 7 — Application Information
    // readonly demonstration field (FF-010)
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'applicationNumber',
      type: 'text',
      label: 'Application Number',
      section: 'Application Information',
      defaultValue: 'CC-2026-00001',
      readonly: true,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 8 — Internal Metadata
    // hidden demonstration field (FF-010)
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'internalRiskScore',
      type: 'text',
      label: 'Internal Risk Score',
      defaultValue: 'pending_review',
      hidden: true,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 9 — Agreement
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'termsAccepted',
      type: 'checkbox',
      label: 'I agree to the Terms and Conditions',
      section: 'Declaration',
      defaultValue: false,
      validation: {
        required: true,
        messages: {
          required: 'You must agree to the Terms and Conditions',
        },
      },
    },
  ],
};
