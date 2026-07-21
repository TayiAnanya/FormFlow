import { Injectable, inject, signal } from '@angular/core';

import { AdvisorProductCard, BankingAdvisorAdvice } from '../../banking-advisor/models/banking-advisor.model';
import { StoredAdvisorRecommendation, WORKSPACE_STORAGE_KEYS } from '../models/workspace.model';
import { ActivityService } from './activity.service';
import { ProfileService } from './profile.service';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AdvisorMemoryService {
  private readonly storage = inject(StorageService);
  private readonly profile = inject(ProfileService);
  private readonly activity = inject(ActivityService);
  private readonly revision = signal(0);

  readonly version = this.revision.asReadonly();

  remember(input: {
    sourceMessage: string;
    advice: BankingAdvisorAdvice;
    productCards: readonly AdvisorProductCard[];
  }): StoredAdvisorRecommendation | null {
    const profile = this.profile.getCurrentProfile();
    if (!profile) {
      return null;
    }

    const entry: StoredAdvisorRecommendation = {
      userId: profile.userId,
      sourceMessage: input.sourceMessage,
      summary:
        input.advice.investmentPlan ||
        input.advice.advice ||
        'Personalized financial plan',
      productCards: input.productCards.map((card) => ({
        id: card.id,
        title: card.title,
        categoryLabel: card.categoryLabel,
        reason: card.benefits?.slice(0, 2).join(' · ') || card.title,
        targetScenarioId: card.targetScenarioId,
        ctaLabel: card.ctaLabel,
        icon: card.icon,
        prefill: { ...card.prefill },
      })),
      createdAt: new Date().toISOString(),
    };

    const all = this.readAll().filter((item) => item.userId !== profile.userId);
    all.push(entry);
    this.storage.writeJson(WORKSPACE_STORAGE_KEYS.advisorRecommendations, all);
    this.activity.record({
      userId: profile.userId,
      type: 'advisor_plan',
      message: 'Generated Financial Plan',
    });
    this.revision.update((value) => value + 1);
    return entry;
  }

  getForCurrentUser(): StoredAdvisorRecommendation | null {
    const profile = this.profile.getCurrentProfile();
    if (!profile) {
      return null;
    }
    return this.getForUser(profile.userId);
  }

  getForUser(userId: string): StoredAdvisorRecommendation | null {
    void this.revision();
    return this.readAll().find((item) => item.userId === userId) ?? null;
  }

  private readAll(): StoredAdvisorRecommendation[] {
    return this.storage.readJson<StoredAdvisorRecommendation[]>(
      WORKSPACE_STORAGE_KEYS.advisorRecommendations,
      [],
    );
  }
}
