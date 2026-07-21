import {
  buildDocumentExtractionPrompt,
  parseAIJsonResponse,
  sanitizeAIExtractionData,
} from './ai-extraction.types';
import { ACCOUNT_OPENING_SCHEMA } from '../../../schemas/bundled/account-opening.schema';

describe('ai-extraction.types helpers', () => {
  it('builds a prompt that includes schema and document text', () => {
    const prompt = buildDocumentExtractionPrompt(ACCOUNT_OPENING_SCHEMA, 'Name: Ananya Tayi');

    expect(prompt).toContain('intelligent banking document extraction assistant');
    expect(prompt).toContain('fullName');
    expect(prompt).toContain('Name: Ananya Tayi');
    expect(prompt).toContain('Return ONLY JSON');
    expect(prompt).toContain('Never invent values');
  });

  it('parses valid JSON responses', () => {
    const parsed = parseAIJsonResponse('{"fullName":"Ananya Tayi","email":"a@example.com"}');
    expect(parsed).toEqual({ fullName: 'Ananya Tayi', email: 'a@example.com' });
  });

  it('parses fenced JSON responses', () => {
    const parsed = parseAIJsonResponse('```json\n{"fullName":"Ananya Tayi"}\n```');
    expect(parsed).toEqual({ fullName: 'Ananya Tayi' });
  });

  it('returns null for invalid JSON responses', () => {
    expect(parseAIJsonResponse('not-json')).toBeNull();
    expect(parseAIJsonResponse('[]')).toBeNull();
    expect(parseAIJsonResponse('')).toBeNull();
  });

  it('sanitizes empty AI values', () => {
    expect(
      sanitizeAIExtractionData({
        fullName: 'Ananya',
        email: '',
        mobileNumber: '   ',
        services: [],
      }),
    ).toEqual({ fullName: 'Ananya' });
  });
});
