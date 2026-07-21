import { Component, EventEmitter, Input, Output } from '@angular/core';

import {
  AdvisorProductCard,
  BankingAdvisorAdvice,
} from '../../models/banking-advisor.model';
import { AdvisorProductCardComponent } from '../advisor-product-card/advisor-product-card.component';
import { AdvisorRoadmapComponent } from '../advisor-roadmap/advisor-roadmap.component';
import { FinancialHealthScoreComponent } from '../financial-health-score/financial-health-score.component';

@Component({
  selector: 'app-advisor-results',
  standalone: true,
  imports: [FinancialHealthScoreComponent, AdvisorProductCardComponent, AdvisorRoadmapComponent],
  templateUrl: './advisor-results.component.html',
  styleUrl: './advisor-results.component.css',
})
export class AdvisorResultsComponent {
  @Input({ required: true }) advice!: BankingAdvisorAdvice;
  @Input({ required: true }) productCards: AdvisorProductCard[] = [];
  @Output() readonly productApply = new EventEmitter<AdvisorProductCard>();

  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  }

  protected onProductApply(product: AdvisorProductCard): void {
    this.productApply.emit(product);
  }
}
