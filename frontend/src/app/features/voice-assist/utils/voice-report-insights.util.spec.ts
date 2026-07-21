import { FormSchema } from '../../../models/form-schema.model';
import { MappedFormValues } from '../../smart-assist/models/document-extraction.model';
import { buildVoiceReportInsights } from './voice-report-insights.util';

describe('buildVoiceReportInsights', () => {
  const schema: FormSchema = {
    id: 'customer-support',
    title: 'Support Center',
    fields: [
      {
        key: 'supportRequestType',
        type: 'dropdown',
        label: 'Support Request Type',
        options: [{ label: 'Report Fraud', value: 'report_fraud' }],
      },
      { key: 'fraudCardLast4', type: 'text', label: 'Card Last 4 Digits', validation: { pattern: '^[0-9]{4}$' } },
      { key: 'fraudMerchant', type: 'text', label: 'Merchant / Website' },
      { key: 'fraudAmount', type: 'text', label: 'Transaction Amount (INR)' },
    ],
  };

  const mapped: MappedFormValues = {
    supportRequestType: 'report_fraud',
    fraudCardLast4: '4521',
    fraudMerchant: 'Amazon',
    fraudAmount: '2500',
  };

  it('builds an AI summary and confidence indicators from mapped fields', () => {
    const insights = buildVoiceReportInsights(
      schema,
      mapped,
      'My debit card ending 4521 was used at Amazon for 2500 rupees.',
      0.9,
    );

    expect(insights.summary).toContain('fraud');
    expect(insights.summary).toContain('Amazon');
    expect(insights.fields.length).toBe(4);
    expect(insights.overallConfidence).toBeGreaterThan(0.5);
    expect(insights.fields.find((f) => f.key === 'fraudCardLast4')?.level).toBe('high');
  });
});
