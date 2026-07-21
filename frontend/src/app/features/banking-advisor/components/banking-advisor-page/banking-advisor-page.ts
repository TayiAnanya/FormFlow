import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Textarea } from 'primeng/textarea';

import {
  ADVISOR_LOADING_STEPS,
  ADVISOR_SUGGESTED_PROMPTS,
  AdvisorProductCard,
  BankingAdvisorAdvice,
} from '../../models/banking-advisor.model';
import { BankingAdvisorService } from '../../services/banking-advisor.service';
import { FormPrefillService } from '../../services/form-prefill.service';
import { AdvisorMemoryService } from '../../../workspace/services/advisor-memory.service';
import { ProfileService } from '../../../workspace/services/profile.service';
import { AdvisorResultsComponent } from '../advisor-results/advisor-results.component';

type AdvisorPagePhase = 'idle' | 'loading' | 'results' | 'error';

@Component({
  selector: 'app-banking-advisor-page',
  standalone: true,
  imports: [FormsModule, RouterLink, Button, Message, Textarea, AdvisorResultsComponent],
  templateUrl: './banking-advisor-page.html',
  styleUrl: './banking-advisor-page.css',
})
export class BankingAdvisorPage implements OnDestroy {
  private readonly advisorService = inject(BankingAdvisorService);
  private readonly prefillService = inject(FormPrefillService);
  private readonly advisorMemory = inject(AdvisorMemoryService);
  private readonly profile = inject(ProfileService);
  private readonly router = inject(Router);

  protected readonly suggestedPrompts = ADVISOR_SUGGESTED_PROMPTS;
  protected readonly loadingSteps = ADVISOR_LOADING_STEPS;

  protected phase: AdvisorPagePhase = 'idle';
  protected draftMessage = '';
  protected submittedMessage: string | null = null;
  protected loadingStepIndex = 0;
  protected errorMessage: string | null = null;
  protected advice: BankingAdvisorAdvice | null = null;
  protected productCards: AdvisorProductCard[] = [];

  private loadingTimer: ReturnType<typeof setInterval> | null = null;

  ngOnDestroy(): void {
    this.stopLoadingAnimation();
  }

  protected useSuggestion(prompt: string): void {
    this.draftMessage = prompt;
  }

  protected async submit(): Promise<void> {
    const message = this.draftMessage.trim();
    if (!message || this.phase === 'loading') {
      return;
    }

    this.submittedMessage = message;
    this.errorMessage = null;
    this.advice = null;
    this.productCards = [];
    this.phase = 'loading';
    this.loadingStepIndex = 0;
    this.startLoadingAnimation();

    try {
      const result = await this.advisorService.advise(message);
      this.stopLoadingAnimation();

      if (!result.success) {
        this.phase = 'error';
        this.errorMessage = result.errorMessage;
        return;
      }

      this.advice = result.advice;
      this.productCards = result.productCards;
      this.phase = 'results';
      this.profile.syncFromAuth();
      this.advisorMemory.remember({
        sourceMessage: message,
        advice: result.advice,
        productCards: result.productCards,
      });
    } catch {
      this.stopLoadingAnimation();
      this.phase = 'error';
      this.errorMessage =
        "We couldn't fully understand your financial goals. Please provide a little more information.";
    }
  }

  protected async onProductApply(product: AdvisorProductCard): Promise<void> {
    this.prefillService.queuePrefill(product.prefill);
    await this.router.navigate(['/forms', product.targetScenarioId]);
  }

  protected resetConversation(): void {
    this.phase = 'idle';
    this.draftMessage = '';
    this.submittedMessage = null;
    this.errorMessage = null;
    this.advice = null;
    this.productCards = [];
    this.stopLoadingAnimation();
  }

  private startLoadingAnimation(): void {
    this.stopLoadingAnimation();
    this.loadingTimer = setInterval(() => {
      if (this.loadingStepIndex < this.loadingSteps.length - 1) {
        this.loadingStepIndex += 1;
      }
    }, 900);
  }

  private stopLoadingAnimation(): void {
    if (this.loadingTimer) {
      clearInterval(this.loadingTimer);
      this.loadingTimer = null;
    }
  }
}
