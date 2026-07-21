import { TestBed } from '@angular/core/testing';

import { FormSchema } from '../../../models/form-schema.model';
import { ACCOUNT_OPENING_SCHEMA } from '../../../schemas/bundled/account-opening.schema';
import { SMART_CREDIT_CARD_SCHEMA } from '../../../schemas/bundled/smart-credit-card.schema';

import { FieldMappingService } from './field-mapping.service';

describe('FieldMappingService', () => {
  let service: FieldMappingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FieldMappingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('maps schema-key extraction results onto form fields', () => {
    const mapped = service.mapToSchemaFields(ACCOUNT_OPENING_SCHEMA, {
      fullName: 'Tayi Ananya',
      dateOfBirth: '12 May 2004',
      email: 'ananyatayi14@gmail.com',
    });

    expect(mapped['fullName']).toBe('Tayi Ananya');
    expect(mapped['dateOfBirth']).toBe('12 May 2004');
    expect(mapped['email']).toBe('ananyatayi14@gmail.com');
  });

  it('maps label-keyed extraction results using schema labels', () => {
    const mapped = service.mapToSchemaFields(ACCOUNT_OPENING_SCHEMA, {
      'Full Name': 'Tayi Ananya',
      'Email Address': 'ananyatayi14@gmail.com',
    });

    expect(mapped['fullName']).toBe('Tayi Ananya');
    expect(mapped['email']).toBe('ananyatayi14@gmail.com');
  });

  it('should ignore unknown extracted properties', () => {
    const mapped = service.mapToSchemaFields(ACCOUNT_OPENING_SCHEMA, {
      fullName: 'Tayi Ananya',
      unknownField: 'should be ignored',
      passportNumber: 'X1234567',
    });

    expect(mapped['fullName']).toBe('Tayi Ananya');
    expect(mapped['unknownField']).toBeUndefined();
    expect(mapped['passportNumber']).toBeUndefined();
    expect(
      Object.keys(mapped).every((key) => ACCOUNT_OPENING_SCHEMA.fields.some((field) => field.key === key)),
    ).toBeTrue();
  });

  it('maps employment-related properties for credit card schema keys', () => {
    const mapped = service.mapToSchemaFields(SMART_CREDIT_CARD_SCHEMA, {
      companyName: 'Infosys',
      monthlyIncome: '85000',
      fullName: 'Tayi Ananya',
    });

    expect(mapped['companyName']).toBe('Infosys');
    expect(mapped['monthlyIncome']).toBe('85000');
    expect(mapped['fullName']).toBe('Tayi Ananya');
  });

  it('maps business properties generically from the active schema', () => {
    const schema: FormSchema = {
      id: 'business-demo',
      title: 'Business Demo',
      fields: [
        { key: 'businessName', type: 'text', label: 'Business Name' },
        { key: 'gstNumber', type: 'text', label: 'GST Number' },
      ],
    };

    const mapped = service.mapToSchemaFields(schema, {
      'Business Name': 'Acme Corp',
      'GST Number': '29ABCDE1234F1Z5',
    });

    expect(mapped['businessName']).toBe('Acme Corp');
    expect(mapped['gstNumber']).toBe('29ABCDE1234F1Z5');
  });

  it('maps dropdown values using schema option labels', () => {
    const mapped = service.mapToSchemaFields(ACCOUNT_OPENING_SCHEMA, {
      accountType: 'Current',
    });

    expect(mapped['accountType']).toBe('current');
  });

  it('maps multiselect values using schema option labels', () => {
    const mapped = service.mapToSchemaFields(ACCOUNT_OPENING_SCHEMA, {
      services: 'Internet Banking, Debit Card',
    });

    expect(mapped['services']).toEqual(['internet_banking', 'debit_card']);
  });
});
