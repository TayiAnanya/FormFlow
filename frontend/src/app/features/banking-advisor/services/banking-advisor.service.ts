import { Injectable, inject } from '@angular/core';

import { AIExtractionService } from '../../smart-assist/services/ai-extraction.service';
import {
  BANKING_ADVISOR_ERROR_MESSAGE,
  BankingAdvisorResult,
} from '../models/banking-advisor.model';
import { buildBankingAdvisorPrompt } from '../utils/banking-advisor.prompt';
import { parseBankingAdvisorAdvice } from '../utils/banking-advisor.parser';
import { mapRecommendedProductsToCards } from '../utils/product-navigation.mapper';

@Injectable({ providedIn: 'root' })
export class BankingAdvisorService {
  private readonly aiExtraction = inject(AIExtractionService);

  async advise(customerMessage: string): Promise<BankingAdvisorResult> {
    const message = customerMessage.trim();
    if (!message) {
      return {
        success: false,
        errorMessage: BANKING_ADVISOR_ERROR_MESSAGE,
      };
    }

    const prompt = buildBankingAdvisorPrompt(message);
    const result = await this.aiExtraction.generateStructuredJson(prompt);

    if (!result.success || !result.data) {
      return {
        success: false,
        errorMessage: result.errorMessage ?? BANKING_ADVISOR_ERROR_MESSAGE,
        rawResponse: result.rawResponse,
      };
    }

    const advice = parseBankingAdvisorAdvice(result.data as Record<string, unknown>);
    if (!advice) {
      return {
        success: false,
        errorMessage: BANKING_ADVISOR_ERROR_MESSAGE,
        rawResponse: result.rawResponse,
      };
    }

    return {
      success: true,
      advice,
      productCards: mapRecommendedProductsToCards(advice),
      rawResponse: result.rawResponse,
    };
  }
}
