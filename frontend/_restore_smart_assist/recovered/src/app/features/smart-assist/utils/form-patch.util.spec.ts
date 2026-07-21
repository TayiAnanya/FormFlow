import { FormControl, FormGroup } from '@angular/forms';

import { Field } from '../../../models/field.model';
import { FormSchema } from '../../../models/form-schema.model';
import { buildPatchValues, hasExistingUserValue } from './form-patch.util';

function createSchema(fields: Field[]): FormSchema {
  return {
    id: 'test-form',
    title: 'Test Form',
    fields,
  };
}

describe('form-patch.util', () => {
  describe('hasExistingUserValue', () => {
    it('returns false for empty string and default multiselect', () => {
      expect(hasExistingUserValue('')).toBeFalse();
      expect(hasExistingUserValue([])).toBeFalse();
      expect(hasExistingUserValue(false)).toBeFalse();
      expect(hasExistingUserValue(null)).toBeFalse();
    });

    it('returns true when the user has entered a value', () => {
      expect(hasExistingUserValue('Ananya')).toBeTrue();
      expect(hasExistingUserValue(['internet_banking'])).toBeTrue();
      expect(hasExistingUserValue(true)).toBeTrue();
    });
  });

  describe('buildPatchValues', () => {
    const schema = createSchema([
      { key: 'fullName', type: 'text', label: 'Full Name' },
      { key: 'dateOfBirth', type: 'date', label: 'Date of Birth' },
      { key: 'customerId', type: 'text', label: 'Customer ID', readonly: true },
      { key: 'supportTicketRef', type: 'text', label: 'Ticket Ref', hidden: true },
      { key: 'email', type: 'text', label: 'Email' },
    ]);

    it('should populate matching schema fields after extraction', () => {
      const form = new FormGroup({
        fullName: new FormControl(''),
        dateOfBirth: new FormControl(''),
        customerId: new FormControl('CUS-00045821'),
        supportTicketRef: new FormControl(''),
        email: new FormControl(''),
      });

      const patch = buildPatchValues(schema, form, {
        fullName: 'Ananya Tayi',
        dateOfBirth: '2004-08-15',
        email: 'ananya@example.com',
      });

      expect(patch).toEqual({
        fullName: 'Ananya Tayi',
        dateOfBirth: '2004-08-15',
        email: 'ananya@example.com',
      });
    });

    it('should preserve readonly fields', () => {
      const form = new FormGroup({
        fullName: new FormControl(''),
        dateOfBirth: new FormControl(''),
        customerId: new FormControl('CUS-00045821'),
        supportTicketRef: new FormControl(''),
        email: new FormControl(''),
      });

      const patch = buildPatchValues(schema, form, {
        customerId: 'CUS-99999999',
        fullName: 'Ananya Tayi',
      });

      expect(patch['customerId']).toBeUndefined();
      expect(patch['fullName']).toBe('Ananya Tayi');
    });

    it('should keep hidden fields hidden', () => {
      const form = new FormGroup({
        fullName: new FormControl(''),
        dateOfBirth: new FormControl(''),
        customerId: new FormControl('CUS-00045821'),
        supportTicketRef: new FormControl(''),
        email: new FormControl(''),
      });

      const patch = buildPatchValues(schema, form, {
        supportTicketRef: 'TKT-12345',
        fullName: 'Ananya Tayi',
      });

      expect(patch['supportTicketRef']).toBeUndefined();
    });

    it('should not overwrite user-entered values unless confirmed', () => {
      const form = new FormGroup({
        fullName: new FormControl('Existing Name'),
        dateOfBirth: new FormControl(''),
        customerId: new FormControl('CUS-00045821'),
        supportTicketRef: new FormControl(''),
        email: new FormControl(''),
      });

      const withoutOverwrite = buildPatchValues(schema, form, {
        fullName: 'Ananya Tayi',
        email: 'ananya@example.com',
      });

      expect(withoutOverwrite['fullName']).toBeUndefined();
      expect(withoutOverwrite['email']).toBe('ananya@example.com');

      const withOverwrite = buildPatchValues(
        schema,
        form,
        { fullName: 'Ananya Tayi', email: 'ananya@example.com' },
        { overwriteExisting: true },
      );

      expect(withOverwrite['fullName']).toBe('Ananya Tayi');
    });
  });
});
