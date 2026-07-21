import { extractTextFromPdfBytes } from './document-text.reader';
import { buildSimplePdf } from '../testing/pdf-test.helpers';

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

describe('extractTextFromPdfBytes', () => {
  it('reads labeled text from two different PDF byte streams', () => {
    const aadhaarText = extractTextFromPdfBytes(
      toArrayBuffer(
        buildSimplePdf([
          'Name: Priya Sharma',
          'DOB: 1992-05-20',
          'Email: priya.sharma@example.com',
        ]),
      ),
    );

    const salaryText = extractTextFromPdfBytes(
      toArrayBuffer(
        buildSimplePdf([
          'Employee Name: Vikram Mehta',
          'Company Name: Contoso Banking',
          'Monthly Income: 92000',
        ]),
      ),
    );

    expect(aadhaarText).toContain('Name: Priya Sharma');
    expect(aadhaarText).toContain('Email: priya.sharma@example.com');
    expect(salaryText).toContain('Employee Name: Vikram Mehta');
    expect(salaryText).toContain('Company Name: Contoso Banking');
    expect(aadhaarText).not.toEqual(salaryText);
  });
});
