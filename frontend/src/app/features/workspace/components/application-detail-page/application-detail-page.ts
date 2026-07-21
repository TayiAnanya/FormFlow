import { JsonPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Message } from 'primeng/message';
import { Tag } from 'primeng/tag';

import { SchemaLoaderService } from '../../../../services/schema-loader.service';
import { ApplicationStatus } from '../../models/workspace.model';
import { ApplicationService } from '../../services/application.service';
import { ProfileService } from '../../services/profile.service';
import { ApplicationSummaryView } from '../application-summary-view/application-summary-view';

@Component({
  selector: 'app-application-detail-page',
  standalone: true,
  imports: [RouterLink, Button, Card, Message, Tag, ApplicationSummaryView, JsonPipe],
  templateUrl: './application-detail-page.html',
  styleUrl: './application-detail-page.css',
})
export class ApplicationDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly applications = inject(ApplicationService);
  private readonly profile = inject(ProfileService);
  private readonly schemaLoader = inject(SchemaLoaderService);

  private readonly applicationId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('applicationId') ?? '')),
    { initialValue: '' },
  );

  protected readonly application = computed(() => {
    void this.applications.version();
    const id = this.applicationId();
    if (!id) {
      return null;
    }
    const app = this.applications.getById(id);
    const profile = this.profile.getCurrentProfile();
    if (!app || !profile || app.userId !== profile.userId) {
      return null;
    }
    return app;
  });

  protected readonly schemaResult = computed(() => {
    const app = this.application();
    if (!app) {
      return null;
    }
    return this.schemaLoader.loadById(app.formType);
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

  protected formatDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return iso;
    }
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}
