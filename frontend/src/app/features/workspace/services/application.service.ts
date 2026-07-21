import { Injectable, computed, inject, signal } from '@angular/core';

import {
  ApplicationStatistics,
  ApplicationStatus,
  BankingApplication,
  WORKSPACE_STORAGE_KEYS,
} from '../models/workspace.model';
import { nextApplicationId } from '../utils/application-id.generator';
import { buildApplicationSummary } from '../utils/application-summary.builder';
import { ActivityService } from './activity.service';
import { DraftService } from './draft.service';
import { ProfileService } from './profile.service';
import { StorageService } from './storage.service';

export interface SubmitApplicationRequest {
  formType: string;
  formTitle: string;
  values: Record<string, unknown>;
  status?: ApplicationStatus;
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly storage = inject(StorageService);
  private readonly profile = inject(ProfileService);
  private readonly drafts = inject(DraftService);
  private readonly activity = inject(ActivityService);

  private readonly revision = signal(0);

  readonly version = this.revision.asReadonly();

  listForCurrentUser(): BankingApplication[] {
    const profile = this.profile.getCurrentProfile();
    if (!profile) {
      return [];
    }
    return this.listForUser(profile.userId);
  }

  listForUser(userId: string): BankingApplication[] {
    void this.revision();
    return this.readAll()
      .filter((app) => app.userId === userId)
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }

  getById(applicationId: string): BankingApplication | null {
    void this.revision();
    return this.readAll().find((app) => app.id === applicationId) ?? null;
  }

  submit(request: SubmitApplicationRequest): BankingApplication {
    const profile = this.profile.getCurrentProfile();
    if (!profile) {
      throw new Error('Cannot submit an application without an authenticated profile.');
    }

    const id = this.allocateId(request.formType);
    const status = request.status ?? this.defaultStatus(request.formType);
    const application: BankingApplication = {
      id,
      userId: profile.userId,
      formType: request.formType,
      formTitle: request.formTitle,
      status,
      submittedAt: new Date().toISOString(),
      summary: buildApplicationSummary(request.formTitle, request.values),
      values: structuredClone(request.values),
    };

    const all = this.readAll();
    all.push(application);
    this.storage.writeJson(WORKSPACE_STORAGE_KEYS.applications, all);
    this.drafts.clearDraft(profile.userId, request.formType);
    this.activity.record({
      userId: profile.userId,
      type: 'application_submitted',
      message: `Submitted ${request.formTitle}`,
      relatedId: id,
      formType: request.formType,
    });
    this.revision.update((value) => value + 1);
    return application;
  }

  updateStatus(applicationId: string, status: ApplicationStatus): BankingApplication | null {
    const all = this.readAll();
    const index = all.findIndex((app) => app.id === applicationId);
    if (index < 0) {
      return null;
    }

    const updated = { ...all[index], status };
    all[index] = updated;
    this.storage.writeJson(WORKSPACE_STORAGE_KEYS.applications, all);
    this.activity.record({
      userId: updated.userId,
      type: 'status_updated',
      message: `${updated.formTitle} marked ${status}`,
      relatedId: updated.id,
      formType: updated.formType,
    });
    this.revision.update((value) => value + 1);
    return updated;
  }

  getStatisticsForCurrentUser(): ApplicationStatistics {
    const profile = this.profile.getCurrentProfile();
    if (!profile) {
      return { submitted: 0, approved: 0, pending: 0, drafts: 0, resolvedSupport: 0 };
    }
    return this.getStatistics(profile.userId);
  }

  getStatistics(userId: string): ApplicationStatistics {
    void this.revision();
    const apps = this.listForUser(userId);
    const drafts = this.drafts.listForUser(userId);

    return {
      submitted: apps.filter((app) => app.status !== 'Draft').length,
      approved: apps.filter((app) => app.status === 'Approved').length,
      pending: apps.filter(
        (app) => app.status === 'Submitted' || app.status === 'Under Review',
      ).length,
      drafts: drafts.length,
      resolvedSupport: apps.filter(
        (app) => app.formType === 'customer-support' && app.status === 'Resolved',
      ).length,
    };
  }

  private allocateId(formType: string): string {
    const counters = this.storage.readJson<Record<string, number>>(
      WORKSPACE_STORAGE_KEYS.applicationCounters,
      {},
    );
    const prefix = formType;
    const next = (counters[prefix] ?? 0) + 1;
    counters[prefix] = next;
    this.storage.writeJson(WORKSPACE_STORAGE_KEYS.applicationCounters, counters);
    return nextApplicationId(formType, next);
  }

  private defaultStatus(formType: string): ApplicationStatus {
    if (formType === 'customer-support') {
      return 'Under Review';
    }
    return 'Submitted';
  }

  private readAll(): BankingApplication[] {
    return this.storage.readJson<BankingApplication[]>(WORKSPACE_STORAGE_KEYS.applications, []);
  }
}
