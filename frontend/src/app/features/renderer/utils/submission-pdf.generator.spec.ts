import { Field } from '../../../models/field.model';
import { SubmissionValue } from '../../../models/submission.model';

import { buildRepeaterPdfSections } from './submission-pdf.generator';
import { formatSubmissionDisplayValue } from './submission-value.formatter';

describe('formatSubmissionDisplayValue file + repeater', () => {
  it('formats file metadata as the filename', () => {
    const field: Field = { key: 'proof', type: 'file', label: 'Proof' };
    expect(
      formatSubmissionDisplayValue(field, { name: 'birth-cert.pdf', size: 10, type: 'application/pdf' }),
    ).toBe('birth-cert.pdf');
    expect(formatSubmissionDisplayValue(field, null)).toBe('');
  });
});

describe('buildRepeaterPdfSections', () => {
  it('builds ordered sections for each applicant row', () => {
    const field: Field = {
      key: 'jointApplicants',
      type: 'repeater',
      label: 'Joint Applicants',
      itemLabel: 'Applicant {{index}}',
      fields: [
        { key: 'fullName', type: 'text', label: 'Full Name' },
        { key: 'relation', type: 'dropdown', label: 'Relation', options: [{ label: 'Minor', value: 'minor' }] },
      ],
    };

    const value: SubmissionValue = [
      { fullName: 'Aarav', relation: 'minor' },
      { fullName: 'Rohan', relation: 'minor' },
    ];

    const sections = buildRepeaterPdfSections(field, value);

    expect(sections.length).toBe(2);
    expect(sections[0].title).toContain('Applicant 1');
    expect(sections[0].rows[0]).toEqual(['Full Name', 'Aarav']);
    expect(sections[1].title).toContain('Applicant 2');
    expect(sections[1].rows[0]).toEqual(['Full Name', 'Rohan']);
  });
});
