import { Component, Input } from '@angular/core';

import { AdvisorRoadmapStep } from '../../models/banking-advisor.model';

@Component({
  selector: 'app-advisor-roadmap',
  standalone: true,
  templateUrl: './advisor-roadmap.component.html',
  styleUrl: './advisor-roadmap.component.css',
})
export class AdvisorRoadmapComponent {
  @Input({ required: true }) steps: AdvisorRoadmapStep[] = [];
}
