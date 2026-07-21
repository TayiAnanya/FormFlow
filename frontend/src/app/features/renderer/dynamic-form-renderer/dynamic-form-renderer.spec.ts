import { FormArray, FormGroup } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { FormSchema } from '../../../models/form-schema.model';
import { ACCOUNT_OPENING_SCHEMA } from '../../../schemas/bundled/account-opening.schema';
import { CUSTOMER_SUPPORT_SCHEMA } from '../../../schemas/bundled/customer-support.schema';
import { JOINT_FAMILY_ACCOUNT_SCHEMA } from '../../../schemas/bundled/joint-family-account.schema';
import { LOAN_INQUIRY_SCHEMA } from '../../../schemas/bundled/loan-inquiry.schema';
import { SMART_CREDIT_CARD_SCHEMA } from '../../../schemas/bundled/smart-credit-card.schema';
import { SchemaLoaderService } from '../../../services/schema-loader.service';

import {
  createVisibilityTestSchema,
  fillStudentSmartCreditCardForm,
} from '../testing/formflow-test.helpers';
import { addRepeaterItem } from '../utils/form-model.factory';
import { syncFieldVisibility } from '../utils/field-visibility.util';

import { DynamicFormRenderer } from './dynamic-form-renderer';

type RendererHarness = DynamicFormRenderer & {
  form: DynamicFormRenderer['form'];
  submission: DynamicFormRenderer['submission'];
  onSubmit: () => void;
  shouldShowFieldError: (field: DynamicFormRenderer['schema']['fields'][number]) => boolean;
  fieldErrorMessage: (field: DynamicFormRenderer['schema']['fields'][number]) => string | undefined;
  isFieldHidden: (field: DynamicFormRenderer['schema']['fields'][number]) => boolean;
  isFieldReadonly: (field: DynamicFormRenderer['schema']['fields'][number]) => boolean;
  isFieldDisabled: (field: DynamicFormRenderer['schema']['fields'][number]) => boolean;
  isFieldVisible: (field: DynamicFormRenderer['schema']['fields'][number]) => boolean;
  formattedSubmission: () => string;
};

function asHarness(component: DynamicFormRenderer): RendererHarness {
  return component as RendererHarness;
}

describe('DynamicFormRenderer', () => {
  let fixture: ComponentFixture<DynamicFormRenderer>;
  let component: DynamicFormRenderer;
  let harness: RendererHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicFormRenderer],
      providers: [SchemaLoaderService, provideRouter([]), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicFormRenderer);
    component = fixture.componentInstance;
  });

  function initWithSchema(schema: FormSchema): void {
    fixture.componentRef.setInput('schema', schema);
    fixture.detectChanges();
    harness = asHarness(component);
  }

  it('creates successfully', () => {
    initWithSchema(ACCOUNT_OPENING_SCHEMA);
    expect(component).toBeTruthy();
  });

  it('builds a reactive form from the schema', () => {
    initWithSchema(ACCOUNT_OPENING_SCHEMA);

    expect(harness.form.contains('fullName')).toBeTrue();
    expect(harness.form.contains('email')).toBeTrue();
    expect(harness.form.contains('termsAccepted')).toBeTrue();
  });

  it('renders supported field types for account opening', () => {
    initWithSchema(ACCOUNT_OPENING_SCHEMA);
    const html = fixture.nativeElement as HTMLElement;

    expect(html.querySelector('input#fullName')).toBeTruthy();
    expect(html.querySelector('p-datepicker')).toBeTruthy();
    expect(html.querySelector('p-select')).toBeTruthy();
    expect(html.querySelector('p-multiselect')).toBeTruthy();
    expect(html.querySelector('p-checkbox')).toBeTruthy();
  });

  it('displays validation errors after an invalid submit', () => {
    initWithSchema(ACCOUNT_OPENING_SCHEMA);

    harness.onSubmit();
    fixture.detectChanges();

    const fullNameField = ACCOUNT_OPENING_SCHEMA.fields.find((field) => field.key === 'fullName')!;
    expect(harness.shouldShowFieldError(fullNameField)).toBeTrue();
    expect(harness.fieldErrorMessage(fullNameField)).toBe('Full name is required');
    expect(fixture.nativeElement.querySelector('.formflow-field-error')).toBeTruthy();
  });

  it('does not render hidden fields', () => {
    initWithSchema(SMART_CREDIT_CARD_SCHEMA);
    const html = fixture.nativeElement as HTMLElement;

    expect(html.querySelector('#internalRiskScore')).toBeNull();
    expect(
      harness.isFieldHidden(
        SMART_CREDIT_CARD_SCHEMA.fields.find((field) => field.key === 'internalRiskScore')!,
      ),
    ).toBeTrue();
  });

  it('marks readonly fields as readonly in the template', () => {
    initWithSchema(SMART_CREDIT_CARD_SCHEMA);
    const applicationInput = fixture.nativeElement.querySelector(
      '#applicationNumber',
    ) as HTMLInputElement;

    expect(applicationInput).toBeTruthy();
    expect(applicationInput.readOnly).toBeTrue();
    expect(
      harness.isFieldReadonly(
        SMART_CREDIT_CARD_SCHEMA.fields.find((field) => field.key === 'applicationNumber')!,
      ),
    ).toBeTrue();
  });

  it('disables schema-disabled fields through the reactive form', () => {
    const schema = createVisibilityTestSchema();
    initWithSchema(schema);

    expect(harness.form.get('lockedField')?.disabled).toBeTrue();
    expect(
      harness.isFieldDisabled(schema.fields.find((field) => field.key === 'lockedField')!),
    ).toBeTrue();
  });

  it('supports visibleWhen by showing and hiding conditional fields', () => {
    initWithSchema(SMART_CREDIT_CARD_SCHEMA);

    harness.form.get('employmentStatus')?.setValue('student');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#collegeName')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#companyName')).toBeNull();

    harness.form.get('employmentStatus')?.setValue('salaried_employee');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#collegeName')).toBeNull();
    expect(fixture.nativeElement.querySelector('#companyName')).toBeTruthy();
  });

  it('does not generate submission output for an invalid submit', () => {
    initWithSchema(ACCOUNT_OPENING_SCHEMA);

    harness.onSubmit();
    fixture.detectChanges();

    expect(harness.submission).toBeNull();
    expect(fixture.nativeElement.querySelector('.formflow-submission-json')).toBeNull();
  });

  it('generates submission output after a successful submit', () => {
    initWithSchema(SMART_CREDIT_CARD_SCHEMA);
    fillStudentSmartCreditCardForm(harness.form);
    fixture.detectChanges();

    harness.onSubmit();
    fixture.detectChanges();

    expect(harness.submission).not.toBeNull();
    expect(harness.formattedSubmission()).toContain('"fullName": "Ananya Tayi"');
    expect(fixture.nativeElement.querySelector('.formflow-submission-json')?.textContent).toContain(
      'Ananya Tayi',
    );
    expect(fixture.nativeElement.querySelector('.formflow-pdf-btn')).toBeTruthy();
  });

  it('builds a valid loan inquiry form when required values are provided', () => {
    initWithSchema(LOAN_INQUIRY_SCHEMA);

    harness.form.patchValue({
      applicantName: 'John Smith',
      loanType: 'personal',
      loanAmount: '500000',
      purpose: 'Home renovation',
      consentToContact: true,
    });
    fixture.detectChanges();

    harness.onSubmit();
    fixture.detectChanges();

    expect(harness.submission).not.toBeNull();
    expect(harness.submission?.['loanType']).toBe('personal');
  });

  it('submits successfully when readonly fields have schema defaults that would fail pattern rules', () => {
    initWithSchema(CUSTOMER_SUPPORT_SCHEMA);
    harness.form.patchValue({
      customerName: 'Ananya Tayi',
      email: 'ananya@example.com',
      mobileNumber: '9876543210',
      existingCustomer: true,
      supportRequestType: 'raise_dispute',
      disputeTransactionDate: '2026-01-15',
      disputeAmount: '2500',
      merchantName: 'Example Merchant',
      disputeReason: 'unauthorized_charge',
      issueDescription:
        'I noticed an unauthorized charge on my account and would like to dispute it immediately.',
      resolutionPreference: 'email',
      declarationAccepted: true,
    });
    fixture.detectChanges();

    harness.onSubmit();
    fixture.detectChanges();

    const customerIdField = CUSTOMER_SUPPORT_SCHEMA.fields.find(
      (field) => field.key === 'customerId',
    )!;
    expect(harness.shouldShowFieldError(customerIdField)).toBeFalse();
    expect(harness.submission).not.toBeNull();
    expect(harness.submission?.['customerId']).toBe('CUS-00045821');
  });

  it('shows validation errors on every visible invalid field after submit', () => {
    initWithSchema(ACCOUNT_OPENING_SCHEMA);

    harness.onSubmit();
    fixture.detectChanges();

    const invalidFields = ACCOUNT_OPENING_SCHEMA.fields.filter((field) => !field.hidden);
    const visibleInvalidFields = invalidFields.filter((field) => {
      const control = harness.form.get(field.key);
      return control?.enabled && control.invalid;
    });

    expect(visibleInvalidFields.length).toBeGreaterThan(0);
    for (const field of visibleInvalidFields) {
      expect(harness.shouldShowFieldError(field)).withContext(field.key).toBeTrue();
      expect(harness.fieldErrorMessage(field)).withContext(field.key).toBeTruthy();
    }
  });

  it('renders joint family repeater and supports add / remove applicant', () => {
    initWithSchema(JOINT_FAMILY_ACCOUNT_SCHEMA);
    const html = fixture.nativeElement as HTMLElement;

    expect(html.querySelector('.formflow-repeater')).toBeTruthy();
    expect(html.textContent).toContain('Joint Applicants');
    expect(html.textContent).toContain('Add Another Applicant');

    const addButton = fixture.debugElement.query(
      By.css('.formflow-repeater-actions button, .formflow-repeater-actions p-button'),
    );
    expect(addButton).toBeTruthy();

    const array = harness.form.get('jointApplicants') as FormArray;
    expect(array.length).toBe(0);

    const repeaterField = JOINT_FAMILY_ACCOUNT_SCHEMA.fields.find(
      (field) => field.key === 'jointApplicants',
    )!;
    addRepeaterItem(array, repeaterField);
    fixture.detectChanges();

    expect(array.length).toBe(1);
    expect(html.textContent).toContain('Applicant 1');
    expect(html.textContent).toContain('Remove Applicant');
  });

  it('enforces max applicants on the joint applicants repeater', () => {
    initWithSchema(JOINT_FAMILY_ACCOUNT_SCHEMA);
    const array = harness.form.get('jointApplicants') as FormArray;
    const repeaterField = JOINT_FAMILY_ACCOUNT_SCHEMA.fields.find(
      (field) => field.key === 'jointApplicants',
    )!;

    for (let index = 0; index < 4; index += 1) {
      expect(addRepeaterItem(array, repeaterField)).toBeTrue();
    }

    expect(array.length).toBe(4);
    expect(addRepeaterItem(array, repeaterField)).toBeFalse();
    expect(array.length).toBe(4);
  });

  it('applies nested conditional fields per joint applicant row', () => {
    initWithSchema(JOINT_FAMILY_ACCOUNT_SCHEMA);
    const array = harness.form.get('jointApplicants') as FormArray;
    const repeaterField = JOINT_FAMILY_ACCOUNT_SCHEMA.fields.find(
      (field) => field.key === 'jointApplicants',
    )!;

    addRepeaterItem(array, repeaterField);
    addRepeaterItem(array, repeaterField);

    const row0 = array.at(0) as FormGroup;
    const row1 = array.at(1) as FormGroup;
    row0.patchValue({ relation: 'minor' });
    row1.patchValue({ relation: 'spouse' });
    syncFieldVisibility(JOINT_FAMILY_ACCOUNT_SCHEMA, harness.form);
    fixture.detectChanges();

    expect(row0.get('guardianName')?.enabled).toBeTrue();
    expect(row0.get('jointSignature')?.disabled).toBeTrue();
    expect(row1.get('jointSignature')?.enabled).toBeTrue();
    expect(row1.get('guardianName')?.disabled).toBeTrue();
  });

  it('submits nested joint applicant JSON without flattening', () => {
    initWithSchema(JOINT_FAMILY_ACCOUNT_SCHEMA);

    harness.form.patchValue({
      fullName: 'Priya Sharma',
      dateOfBirth: '1988-05-12',
      email: 'priya@example.com',
      mobile: '9876543210',
      address: '12 MG Road, Bengaluru, Karnataka',
      idType: 'pan',
      idNumber: 'ABCDE1234F',
    });

    const array = harness.form.get('jointApplicants') as FormArray;
    const repeaterField = JOINT_FAMILY_ACCOUNT_SCHEMA.fields.find(
      (field) => field.key === 'jointApplicants',
    )!;
    addRepeaterItem(array, repeaterField);

    (array.at(0) as FormGroup).patchValue({
      fullName: 'Aarav Sharma',
      dateOfBirth: '2012-01-20',
      relation: 'minor',
      idType: 'aadhaar',
      idNumber: '1234-5678-9012',
      occupation: 'Student',
      email: '',
      mobile: '',
      guardianName: 'Priya Sharma',
      guardianContact: '9876543210',
      guardianId: 'AADHAAR-XXXX',
    });
    syncFieldVisibility(JOINT_FAMILY_ACCOUNT_SCHEMA, harness.form);
    fixture.detectChanges();

    harness.onSubmit();
    fixture.detectChanges();

    expect(harness.submission).not.toBeNull();
    expect(Array.isArray(harness.submission?.['jointApplicants'])).toBeTrue();
    const rows = harness.submission?.['jointApplicants'] as Record<string, unknown>[];
    expect(rows[0]['fullName']).toBe('Aarav Sharma');
    expect(rows[0]['guardianName']).toBe('Priya Sharma');
    expect(rows[0]['jointSignature']).toBeUndefined();
  });
});
