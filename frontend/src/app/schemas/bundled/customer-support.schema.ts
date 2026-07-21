import { FormSchema } from '../../models/form-schema.model';

/**
 * V1 bundled schema: Customer Support Hub
 *
 * Unified banking support workflow with request-type-driven dynamic sections (FF-010).
 */
export const CUSTOMER_SUPPORT_SCHEMA: FormSchema = {
  id: 'customer-support',
  title: 'Customer Support Hub',
  description:
    'Raise disputes, report issues, and request banking support services through a unified workflow.',
  submitLabel: 'Submit Support Request',
  fields: [
    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 1 — Customer Information
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'customerName',
      type: 'text',
      label: 'Customer Name',
      section: 'Customer Information',
      placeholder: 'Enter your full name as per bank records',
      validation: {
        required: true,
        minLength: 3,
        maxLength: 100,
        pattern: "^[A-Za-z][A-Za-z .'.-]{2,99}$",
        messages: {
          required: 'Customer name is required',
          minLength: 'Customer name must be at least 3 characters',
          maxLength: 'Customer name must not exceed 100 characters',
          pattern:
            'Enter a valid name using only letters, spaces, hyphens, apostrophes, or periods',
        },
      },
    },
    {
      key: 'email',
      type: 'text',
      label: 'Email',
      placeholder: 'name@example.com',
      validation: {
        required: true,
        pattern: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$',
        messages: {
          required: 'Email is required',
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
      key: 'existingCustomer',
      type: 'checkbox',
      label: 'Existing Customer',
      defaultValue: false,
    },
    {
      key: 'customerId',
      type: 'text',
      label: 'Customer ID',
      placeholder: 'Auto-populated for existing customers',
      defaultValue: 'CUS-00045821',
      readonly: true,
      visibleWhen: {
        field: 'existingCustomer',
        operator: 'equals',
        value: true,
      },
      validation: {
        required: true,
        pattern: '^[A-Z0-9]{8,12}$',
        messages: {
          required: 'Customer ID is required for existing customers',
          pattern: 'Enter a valid customer ID (8–12 uppercase alphanumeric characters)',
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 2 — Support Request Type
    // Controls the dynamic section below (FF-010).
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'supportRequestType',
      type: 'dropdown',
      label: 'Support Request Type',
      section: 'Support Request',
      options: [
        { label: 'Raise Dispute', value: 'raise_dispute' },
        { label: 'Report Fraud', value: 'report_fraud' },
        { label: 'Block Lost Card', value: 'block_lost_card' },
        { label: 'Failed UPI Transaction', value: 'failed_upi_transaction' },
        { label: 'ATM Cash Not Dispensed', value: 'atm_cash_not_dispensed' },
        { label: 'Internet Banking Issue', value: 'internet_banking_issue' },
      ],
      validation: {
        required: true,
        messages: {
          required: 'Please select a support request type',
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 3 — Dynamic Section: Raise Dispute
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'disputeTransactionDate',
      type: 'date',
      label: 'Transaction Date',
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'raise_dispute',
      },
      validation: {
        required: true,
        allowFutureDates: false,
        messages: {
          required: 'Transaction date is required',
          futureDate: 'Transaction date cannot be in the future',
        },
      },
    },
    {
      key: 'disputeAmount',
      type: 'text',
      label: 'Transaction Amount (INR)',
      placeholder: 'e.g. 2500',
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'raise_dispute',
      },
      validation: {
        required: true,
        min: 1,
        pattern: '^[0-9]+$',
        messages: {
          required: 'Transaction amount is required',
          min: 'Amount must be greater than zero',
          pattern: 'Enter a valid numeric amount',
        },
      },
    },
    {
      key: 'merchantName',
      type: 'text',
      label: 'Merchant / Payee Name',
      placeholder: 'Enter merchant or payee name',
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'raise_dispute',
      },
      validation: {
        required: true,
        minLength: 2,
        maxLength: 120,
        messages: {
          required: 'Merchant or payee name is required',
          minLength: 'Name must be at least 2 characters',
          maxLength: 'Name must not exceed 120 characters',
        },
      },
    },
    {
      key: 'disputeReason',
      type: 'dropdown',
      label: 'Dispute Reason',
      options: [
        { label: 'Unauthorized Charge', value: 'unauthorized_charge' },
        { label: 'Duplicate Charge', value: 'duplicate_charge' },
        { label: 'Incorrect Amount', value: 'incorrect_amount' },
        { label: 'Service Not Received', value: 'service_not_received' },
        { label: 'Other', value: 'other' },
      ],
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'raise_dispute',
      },
      validation: {
        required: true,
        messages: {
          required: 'Please select a dispute reason',
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 3 — Dynamic Section: Report Fraud
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'fraudType',
      type: 'dropdown',
      label: 'Fraud Type',
      options: [
        { label: 'Card Fraud', value: 'card_fraud' },
        { label: 'Account Takeover', value: 'account_takeover' },
        { label: 'Phishing', value: 'phishing' },
        { label: 'Identity Theft', value: 'identity_theft' },
        { label: 'Other', value: 'other' },
      ],
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'report_fraud',
      },
      validation: {
        required: true,
        messages: {
          required: 'Please select a fraud type',
        },
      },
    },
    {
      key: 'fraudTransactionDate',
      type: 'date',
      label: 'Date of Suspected Fraud',
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'report_fraud',
      },
      validation: {
        required: true,
        allowFutureDates: false,
        messages: {
          required: 'Date of suspected fraud is required',
          futureDate: 'Date cannot be in the future',
        },
      },
    },
    {
      key: 'fraudCardLast4',
      type: 'text',
      label: 'Card Last 4 Digits',
      placeholder: 'e.g. 4521',
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'report_fraud',
      },
      validation: {
        pattern: '^[0-9]{4}$',
        messages: {
          pattern: 'Enter exactly 4 digits',
        },
      },
    },
    {
      key: 'fraudMerchant',
      type: 'text',
      label: 'Merchant / Website',
      placeholder: 'e.g. Amazon',
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'report_fraud',
      },
      validation: {
        maxLength: 100,
        messages: {
          maxLength: 'Merchant name must not exceed 100 characters',
        },
      },
    },
    {
      key: 'fraudAmount',
      type: 'text',
      label: 'Transaction Amount (INR)',
      placeholder: 'e.g. 2500',
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'report_fraud',
      },
      validation: {
        pattern: '^[0-9]+(\\.[0-9]{1,2})?$',
        messages: {
          pattern: 'Enter a valid amount',
        },
      },
    },
    {
      key: 'reportedToPolice',
      type: 'checkbox',
      label: 'Reported to Police',
      defaultValue: false,
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'report_fraud',
      },
    },
    {
      key: 'policeReportNumber',
      type: 'text',
      label: 'Police Report Number',
      placeholder: 'Required if reported to police — e.g. FIR/2026/004521',
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'report_fraud',
      },
      validation: {
        minLength: 5,
        maxLength: 30,
        messages: {
          minLength: 'Report number must be at least 5 characters',
          maxLength: 'Report number must not exceed 30 characters',
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 3 — Dynamic Section: Block Lost Card
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'cardLastFourDigits',
      type: 'text',
      label: 'Card Last Four Digits',
      placeholder: 'e.g. 4582',
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'block_lost_card',
      },
      validation: {
        required: true,
        pattern: '^[0-9]{4}$',
        messages: {
          required: 'Last four digits are required',
          pattern: 'Enter exactly 4 digits',
        },
      },
    },
    {
      key: 'cardLastUsedDate',
      type: 'date',
      label: 'Last Used Date',
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'block_lost_card',
      },
      validation: {
        required: true,
        allowFutureDates: false,
        messages: {
          required: 'Last used date is required',
          futureDate: 'Date cannot be in the future',
        },
      },
    },
    {
      key: 'blockReason',
      type: 'dropdown',
      label: 'Block Reason',
      options: [
        { label: 'Card Lost', value: 'lost' },
        { label: 'Card Stolen', value: 'stolen' },
        { label: 'Card Damaged', value: 'damaged' },
      ],
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'block_lost_card',
      },
      validation: {
        required: true,
        messages: {
          required: 'Please select a block reason',
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 3 — Dynamic Section: Failed UPI Transaction
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'upiTransactionId',
      type: 'text',
      label: 'UPI Transaction ID',
      placeholder: 'e.g. UPI12345678901234',
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'failed_upi_transaction',
      },
      validation: {
        required: true,
        minLength: 8,
        maxLength: 40,
        messages: {
          required: 'UPI transaction ID is required',
          minLength: 'Transaction ID must be at least 8 characters',
          maxLength: 'Transaction ID must not exceed 40 characters',
        },
      },
    },
    {
      key: 'upiAmount',
      type: 'text',
      label: 'Transaction Amount (INR)',
      placeholder: 'e.g. 1500',
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'failed_upi_transaction',
      },
      validation: {
        required: true,
        min: 1,
        pattern: '^[0-9]+$',
        messages: {
          required: 'Transaction amount is required',
          min: 'Amount must be greater than zero',
          pattern: 'Enter a valid numeric amount',
        },
      },
    },
    {
      key: 'payeeVpa',
      type: 'text',
      label: 'Payee VPA',
      placeholder: 'e.g. merchant@upi',
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'failed_upi_transaction',
      },
      validation: {
        required: true,
        pattern: '^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$',
        messages: {
          required: 'Payee VPA is required',
          pattern: 'Enter a valid UPI VPA (e.g. name@bank)',
        },
      },
    },
    {
      key: 'upiTransactionDate',
      type: 'date',
      label: 'Transaction Date',
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'failed_upi_transaction',
      },
      validation: {
        required: true,
        allowFutureDates: false,
        messages: {
          required: 'Transaction date is required',
          futureDate: 'Transaction date cannot be in the future',
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 3 — Dynamic Section: ATM Cash Not Dispensed
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'atmLocation',
      type: 'text',
      label: 'ATM Location',
      placeholder: 'Branch name, city, or address',
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'atm_cash_not_dispensed',
      },
      validation: {
        required: true,
        minLength: 5,
        maxLength: 150,
        messages: {
          required: 'ATM location is required',
          minLength: 'Location must be at least 5 characters',
          maxLength: 'Location must not exceed 150 characters',
        },
      },
    },
    {
      key: 'atmTransactionDate',
      type: 'date',
      label: 'Transaction Date',
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'atm_cash_not_dispensed',
      },
      validation: {
        required: true,
        allowFutureDates: false,
        messages: {
          required: 'Transaction date is required',
          futureDate: 'Transaction date cannot be in the future',
        },
      },
    },
    {
      key: 'atmAmount',
      type: 'text',
      label: 'Amount Debited (INR)',
      placeholder: 'e.g. 5000',
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'atm_cash_not_dispensed',
      },
      validation: {
        required: true,
        min: 1,
        pattern: '^[0-9]+$',
        messages: {
          required: 'Debited amount is required',
          min: 'Amount must be greater than zero',
          pattern: 'Enter a valid numeric amount',
        },
      },
    },
    {
      key: 'atmId',
      type: 'text',
      label: 'ATM ID',
      placeholder: 'e.g. ATM-MUM-BKC-0142',
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'atm_cash_not_dispensed',
      },
      validation: {
        required: true,
        minLength: 4,
        maxLength: 30,
        messages: {
          required: 'ATM ID is required',
          minLength: 'ATM ID must be at least 4 characters',
          maxLength: 'ATM ID must not exceed 30 characters',
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 3 — Dynamic Section: Internet Banking Issue
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'bankingIssueCategory',
      type: 'dropdown',
      label: 'Issue Category',
      options: [
        { label: 'Login Problem', value: 'login_problem' },
        { label: 'Fund Transfer Failed', value: 'fund_transfer_failed' },
        { label: 'Beneficiary Not Added', value: 'beneficiary_not_added' },
        { label: 'Statement Download', value: 'statement_download' },
        { label: 'Other', value: 'other' },
      ],
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'internet_banking_issue',
      },
      validation: {
        required: true,
        messages: {
          required: 'Please select an issue category',
        },
      },
    },
    {
      key: 'deviceBrowser',
      type: 'text',
      label: 'Device / Browser',
      placeholder: 'e.g. Chrome on Windows 11, Safari on iPhone',
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'internet_banking_issue',
      },
      validation: {
        required: true,
        minLength: 3,
        maxLength: 100,
        messages: {
          required: 'Device or browser information is required',
          minLength: 'Please provide at least 3 characters',
          maxLength: 'Must not exceed 100 characters',
        },
      },
    },
    {
      key: 'errorDetails',
      type: 'text',
      label: 'Error Message Shown',
      placeholder: 'Copy the error message displayed on screen',
      visibleWhen: {
        field: 'supportRequestType',
        operator: 'equals',
        value: 'internet_banking_issue',
      },
      validation: {
        required: true,
        minLength: 3,
        maxLength: 200,
        messages: {
          required: 'Error message is required',
          minLength: 'Please provide at least 3 characters',
          maxLength: 'Must not exceed 200 characters',
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 4 — Issue Description
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'issueDescription',
      type: 'textarea',
      label: 'Issue Description',
      section: 'Issue Details',
      placeholder: 'Describe the issue in detail, including dates, amounts, and any reference numbers',
      validation: {
        required: true,
        minLength: 20,
        maxLength: 2000,
        messages: {
          required: 'Issue description is required',
          minLength: 'Please provide at least 20 characters',
          maxLength: 'Description must not exceed 2000 characters',
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 5 — Resolution Preference
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'resolutionPreference',
      type: 'dropdown',
      label: 'Resolution Preference',
      section: 'Resolution Preference',
      options: [
        { label: 'Email Update', value: 'email' },
        { label: 'Phone Callback', value: 'phone' },
        { label: 'Branch Visit', value: 'branch' },
        { label: 'SMS Notification', value: 'sms' },
      ],
      validation: {
        required: true,
        messages: {
          required: 'Please select your preferred resolution method',
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 6 — Internal Details (hidden metadata)
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'supportTicketRef',
      type: 'text',
      label: 'Support Ticket Reference',
      defaultValue: 'CS-2026-00001',
      hidden: true,
    },
    {
      key: 'internalPriority',
      type: 'text',
      label: 'Internal Priority',
      defaultValue: 'medium',
      hidden: true,
    },
    {
      key: 'assignedQueue',
      type: 'text',
      label: 'Assigned Queue',
      defaultValue: 'general_support',
      hidden: true,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 7 — Declaration
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'declarationAccepted',
      type: 'checkbox',
      label:
        'I declare that the information provided is true and accurate to the best of my knowledge',
      section: 'Declaration',
      defaultValue: false,
      validation: {
        required: true,
        messages: {
          required: 'You must accept the declaration to submit this request',
        },
      },
    },
  ],
};
