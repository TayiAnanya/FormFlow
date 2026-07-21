import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';

import { FormPrefillService } from '../../banking-advisor/services/form-prefill.service';
import { ApplicationStatus } from '../../workspace/models/workspace.model';
import { ActivityService } from '../../workspace/services/activity.service';
import { AdvisorMemoryService } from '../../workspace/services/advisor-memory.service';
import { ApplicationService } from '../../workspace/services/application.service';
import { DraftService } from '../../workspace/services/draft.service';
import { ProfileService } from '../../workspace/services/profile.service';
import { SCENARIO_CATALOG } from '../data/scenario-catalog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, Button, Tag, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly profile = inject(ProfileService);
  private readonly applications = inject(ApplicationService);
  private readonly drafts = inject(DraftService);
  private readonly activity = inject(ActivityService);
  private readonly advisorMemory = inject(AdvisorMemoryService);
  private readonly formPrefill = inject(FormPrefillService);

  constructor() {
    this.profile.syncFromAuth();
  }

  protected readonly scenarios = SCENARIO_CATALOG;

  /** Original dashboard catalog metrics (unchanged). */
  protected readonly stats = [
    { label: 'Available Forms', value: String(SCENARIO_CATALOG.length), icon: 'pi pi-file' },
    { label: 'Supported Field Types', value: '6', icon: 'pi pi-th-large' },
    { label: 'JSON Driven', value: '100%', icon: 'pi pi-code' },
    { label: 'Client Side Only', value: 'Yes', icon: 'pi pi-shield' },
  ];

  protected readonly customer = computed(() => {
    void this.applications.version();
    void this.drafts.version();
    void this.activity.version();
    void this.advisorMemory.version();
    return this.profile.profile();
  });

  protected readonly myApplications = computed(() => this.applications.listForCurrentUser());

  protected readonly myDrafts = computed(() => {
    const userId = this.customer()?.userId;
    return userId ? this.drafts.listForUser(userId) : [];
  });

  protected readonly applicationStats = computed(() =>
    this.applications.getStatisticsForCurrentUser(),
  );

  protected readonly recommendations = computed(() => this.advisorMemory.getForCurrentUser());

  protected readonly timeline = computed(() => {
    const userId = this.customer()?.userId;
    return userId ? this.activity.listForUser(userId).slice(0, 6) : [];
  });

  protected statusSeverity(
    status: ApplicationStatus,
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'Approved':
      case 'Resolved':
        return 'success';
      case 'Under Review':
      case 'Submitted':
        return 'info';
      case 'Draft':
        return 'secondary';
      case 'Rejected':
        return 'danger';
      default:
        return 'warn';
    }
  }

  protected continueRecommendation(prefill: Record<string, unknown>): void {
    this.formPrefill.queuePrefill(prefill);
  }
}
