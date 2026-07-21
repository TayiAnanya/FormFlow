import { TestBed } from '@angular/core/testing';

import { FormSchema } from '../../../models/form-schema.model';
import { ACCOUNT_OPENING_SCHEMA } from '../../../schemas/bundled/account-opening.schema';
import { AIExtractionService } from './ai-extraction.service';
import { AI_EXTRACTION_FAILURE_MESSAGE, AIExtractionResult, AILanguageModelProvider } from './ai-extraction.types';
import { GeminiLanguageModelProvider } from './gemini-language-model.provider';

/** Minimal schema with identity fields — used only to exercise PII restore without Customer Profile. */
const IDENTITY_RESTORE_SCHEMA: FormSchema = {
  id: 'identity-restore-test',
  title: 'Identity Restore Test',
  fields: [
    { key: 'fullName', type: 'text', label: 'Full Name' },
    { key: 'aadhaarNumber', type: 'text', label: 'Aadhaar Number' },
    { key: 'panNumber', type: 'text', label: 'PAN Number' },
  ],
};

class MockLanguageModelProvider implements AILanguageModelProvider {
  readonly name = 'mock-llm';
  nextResult: AIExtractionResult = { success: true, data: { fullName: 'Ananya Tayi' } };
  lastSchemaId: string | undefined;
  lastText: string | undefined;
  lastFreeformPrompt: string | undefined;

  extractStructuredData(schema: { id: string }, documentText: string) {
    this.lastSchemaId = schema.id;
    this.lastText = documentText;
    return Promise.resolve(this.nextResult);
  }

  generateStructuredJson(prompt: string) {
    this.lastFreeformPrompt = prompt;
    return Promise.resolve(this.nextResult);
  }
}

describe('AIExtractionService', () => {
  let service: AIExtractionService;
  let mockProvider: MockLanguageModelProvider;

  beforeEach(() => {
    mockProvider = new MockLanguageModelProvider();

    TestBed.configureTestingModule({
      providers: [
        AIExtractionService,
        {
          provide: GeminiLanguageModelProvider,
          useValue: {
            name: 'gemini',
            extractStructuredData: () =>
              Promise.resolve({
                success: false,
                errorMessage: 'real Gemini must not be called in tests',
              }),
            generateStructuredJson: () =>
              Promise.resolve({
                success: false,
                errorMessage: 'real Gemini must not be called in tests',
              }),
          },
        },
      ],
    });

    service = TestBed.inject(AIExtractionService);
    service.setProvider(mockProvider);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Successful AI extraction', async () => {
    mockProvider.nextResult = {
      success: true,
      data: {
        fullName: 'Ananya Tayi',
        dateOfBirth: '2004-08-15',
        accountType: 'current',
      },
    };

    const result = await service.extractStructuredFields(
      ACCOUNT_OPENING_SCHEMA,
      'Name Ananya Tayi DOB 15 Aug 2004 Current A/c',
    );

    expect(result.success).toBeTrue();
    expect(result.data?.['fullName']).toBe('Ananya Tayi');
    expect(result.data?.['accountType']).toBe('current');
    expect(mockProvider.lastSchemaId).toBe('account-opening');
  });

  it('generateStructuredJson — free-form advisor prompts reuse the provider', async () => {
    mockProvider.nextResult = {
      success: true,
      data: {
        financialGoals: ['Buy a Car'],
        financialHealthScore: 80,
      },
    };

    const result = await service.generateStructuredJson('Customer wants a car loan');

    expect(result.success).toBeTrue();
    expect(result.data?.['financialGoals']).toEqual(['Buy a Car']);
    expect(mockProvider.lastFreeformPrompt).toContain('Customer wants a car loan');
  });

  it('masks Aadhaar and PAN before calling Gemini and restores originals locally', async () => {
    mockProvider.nextResult = {
      success: true,
      data: {
        fullName: 'Ananya Tayi',
        aadhaarNumber: 'XXXX XXXX 9012',
        panNumber: 'ABCDE****F',
      },
    };

    const result = await service.extractStructuredFields(
      IDENTITY_RESTORE_SCHEMA,
      'Name Ananya Tayi Aadhaar 1234 5678 9012 PAN ABCDE1234F',
    );

    expect(mockProvider.lastText).toContain('XXXX XXXX 9012');
    expect(mockProvider.lastText).toContain('ABCDE****F');
    expect(mockProvider.lastText).not.toContain('1234 5678 9012');
    expect(mockProvider.lastText).not.toContain('ABCDE1234F');

    expect(result.success).toBeTrue();
    expect(result.data?.['aadhaarNumber']).toBe('123456789012');
    expect(result.data?.['panNumber']).toBe('ABCDE1234F');
  });

  it('Empty AI response', async () => {
    mockProvider.nextResult = {
      success: false,
      errorMessage: AI_EXTRACTION_FAILURE_MESSAGE,
      data: {},
    };

    const result = await service.extractStructuredFields(ACCOUNT_OPENING_SCHEMA, 'irrelevant text');

    expect(result.success).toBeFalse();
    expect(result.errorMessage).toBe(AI_EXTRACTION_FAILURE_MESSAGE);
  });

  it('Invalid JSON response', async () => {
    mockProvider.nextResult = {
      success: false,
      errorMessage: AI_EXTRACTION_FAILURE_MESSAGE,
      rawResponse: 'not-json',
    };

    const result = await service.extractStructuredFields(ACCOUNT_OPENING_SCHEMA, 'document text');

    expect(result.success).toBeFalse();
    expect(result.errorMessage).toBe(AI_EXTRACTION_FAILURE_MESSAGE);
  });

  it('rejects blank document text without calling the provider', async () => {
    const result = await service.extractStructuredFields(ACCOUNT_OPENING_SCHEMA, '   ');

    expect(result.success).toBeFalse();
    expect(result.errorMessage).toBe(AI_EXTRACTION_FAILURE_MESSAGE);
    expect(mockProvider.lastText).toBeUndefined();
  });

  it('allows swapping LLM providers without touching the renderer', async () => {
    expect(service.getActiveProviderName()).toBe('mock-llm');
    service.resetProvider();
    expect(service.getActiveProviderName()).toBe('gemini');
  });
});
