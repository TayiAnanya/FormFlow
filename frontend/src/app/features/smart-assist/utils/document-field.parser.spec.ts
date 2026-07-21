import { ACCOUNT_OPENING_SCHEMA } from '../../../schemas/bundled/account-opening.schema';
import { SMART_CREDIT_CARD_SCHEMA } from '../../../schemas/bundled/smart-credit-card.schema';
import { extractFieldsBySchemaLabels, findValueAfterLabel } from './document-field.parser';

describe('document-field.parser (schema labels)', () => {
  it('extracts values that follow schema field labels on the next line', () => {
    const text = `
      Account Opening Application
      Full Name
      Tayi Ananya
      Email Address
      ananyatayi14@gmail.com
      Date of Birth
      12 May 2004
      Account Type
      Current
    `;

    const extracted = extractFieldsBySchemaLabels(ACCOUNT_OPENING_SCHEMA, text, { debug: false });

    expect(extracted['fullName']).toBe('Tayi Ananya');
    expect(extracted['email']).toBe('ananyatayi14@gmail.com');
    expect(extracted['dateOfBirth']).toBe('12 May 2004');
    expect(extracted['accountType']).toBe('Current');
  });

  it('supports Label: value on the same line using schema labels', () => {
    const text = `
      Full Name: Ravi Kumar
      Email Address: ravi.kumar@example.com
      Date of Birth: 12/03/1988
    `;

    const extracted = extractFieldsBySchemaLabels(ACCOUNT_OPENING_SCHEMA, text, { debug: false });

    expect(extracted['fullName']).toBe('Ravi Kumar');
    expect(extracted['email']).toBe('ravi.kumar@example.com');
    expect(extracted['dateOfBirth']).toBe('12/03/1988');
  });

  it('ignores schema fields that are not present in the document', () => {
    const text = `
      Full Name
      Priya Sharma
      Email Address
      priya.sharma@example.com
    `;

    const extracted = extractFieldsBySchemaLabels(ACCOUNT_OPENING_SCHEMA, text, { debug: false });

    expect(extracted['fullName']).toBe('Priya Sharma');
    expect(extracted['email']).toBe('priya.sharma@example.com');
    expect(extracted['dateOfBirth']).toBeUndefined();
    expect(extracted['accountType']).toBeUndefined();
    expect(extracted['services']).toBeUndefined();
  });

  it('derives labels from the active schema without hardcoded banking names', () => {
    const text = `
      Company Name
      Contoso Banking
      Monthly Income (INR)
      92000
      Full Name
      Vikram Mehta
    `;

    const extracted = extractFieldsBySchemaLabels(SMART_CREDIT_CARD_SCHEMA, text, { debug: false });

    expect(extracted['companyName']).toBe('Contoso Banking');
    expect(extracted['monthlyIncome']).toBe('92000');
    expect(extracted['fullName']).toBe('Vikram Mehta');
  });

  it('findValueAfterLabel returns undefined when the label is missing', () => {
    expect(findValueAfterLabel('Account Summary for March 2025', 'Full Name')).toBeUndefined();
  });

  it('returns empty object for blank text', () => {
    expect(extractFieldsBySchemaLabels(ACCOUNT_OPENING_SCHEMA, '', { debug: false })).toEqual({});
  });
});
