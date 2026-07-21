import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Button } from 'primeng/button';

import { AdvisorProductCard } from '../../models/banking-advisor.model';

@Component({
  selector: 'app-advisor-product-card',
  standalone: true,
  imports: [Button],
  templateUrl: './advisor-product-card.component.html',
  styleUrl: './advisor-product-card.component.css',
})
export class AdvisorProductCardComponent {
  @Input({ required: true }) product!: AdvisorProductCard;
  @Output() readonly apply = new EventEmitter<AdvisorProductCard>();

  protected formatCurrency(value: number | undefined): string {
    if (value === undefined || value === null) {
      return '—';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  }

  protected onApply(): void {
    this.apply.emit(this.product);
  }
}
