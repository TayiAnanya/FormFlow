import { Component, Input } from '@angular/core';

import { HealthScoreTone, healthScoreTone } from '../../models/banking-advisor.model';

@Component({
  selector: 'app-financial-health-score',
  standalone: true,
  templateUrl: './financial-health-score.component.html',
  styleUrl: './financial-health-score.component.css',
})
export class FinancialHealthScoreComponent {
  @Input({ required: true }) score = 0;

  protected get tone(): HealthScoreTone {
    return healthScoreTone(this.score);
  }

  protected get clampedScore(): number {
    return Math.max(0, Math.min(100, Math.round(this.score)));
  }

  /** SVG circle dash offset for a 100-unit circumference scale. */
  protected get dashOffset(): number {
    const circumference = 2 * Math.PI * 54;
    return circumference - (this.clampedScore / 100) * circumference;
  }

  protected get circumference(): number {
    return 2 * Math.PI * 54;
  }
}
