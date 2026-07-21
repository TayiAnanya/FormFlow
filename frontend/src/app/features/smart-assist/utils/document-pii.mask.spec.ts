import {
  maskSensitiveIdentifiers,
  restoreSensitiveValuesOntoSchemaData,
} from './document-pii.mask';

describe('document-pii.mask', () => {
  it('masks Aadhaar numbers before Gemini sees them', () => {
    const result = maskSensitiveIdentifiers('Aadhaar 1234 5678 9012 Name Ananya');

    expect(result.maskedText).toContain('XXXX XXXX 9012');
    expect(result.maskedText).not.toContain('1234 5678 9012');
    expect(result.matches.some((match) => match.type === 'aadhaar' && match.original === '123456789012')).toBeTrue();
  });

  it('masks PAN numbers as ABCDE****F', () => {
    const result = maskSensitiveIdentifiers('PAN ABCDE1234F');

    expect(result.maskedText).toContain('ABCDE****F');
    expect(result.maskedText).not.toContain('ABCDE1234F');
    expect(result.matches[0]).toEqual({
      type: 'pan',
      original: 'ABCDE1234F',
      masked: 'ABCDE****F',
    });
  });

  it('masks passport numbers', () => {
    const result = maskSensitiveIdentifiers('Passport A1234567');

    expect(result.maskedText).toContain('A****67');
    expect(result.matches[0].original).toBe('A1234567');
  });

  it('restores original identity values onto schema fields after AI returns masked data', () => {
    const privacy = maskSensitiveIdentifiers('Aadhaar 1234 5678 9012 PAN ABCDE1234F');
    const restored = restoreSensitiveValuesOntoSchemaData(
      {
        fullName: 'Ananya Tayi',
        aadhaarNumber: 'XXXX XXXX 9012',
        panNumber: '',
      },
      privacy.matches,
      [
        { key: 'fullName', label: 'Full Name' },
        { key: 'aadhaarNumber', label: 'Aadhaar Number' },
        { key: 'panNumber', label: 'PAN Number' },
      ],
    );

    expect(restored['aadhaarNumber']).toBe('123456789012');
    expect(restored['panNumber']).toBe('ABCDE1234F');
    expect(restored['fullName']).toBe('Ananya Tayi');
  });
});
