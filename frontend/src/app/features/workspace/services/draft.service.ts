import { Injectable, inject, signal } from '@angular/core';

import { FormDraft, WORKSPACE_STORAGE_KEYS } from '../models/workspace.model';
import { ActivityService } from './activity.service';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class DraftService {
  private readonly storage = inject(StorageService);
  private readonly activity = inject(ActivityService);
  private readonly revision = signal(0);

  readonly version = this.revision.asReadonly();

  listForUser(userId: string): FormDraft[] {
    void this.revision();
    return this.readAll()
      .filter((draft) => draft.userId === userId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  getDraft(userId: string, formType: string): FormDraft | null {
    void this.revision();
    return (
      this.readAll().find((draft) => draft.userId === userId && draft.formType === formType) ??
      null
    );
  }

  saveDraft(input: {
    userId: string;
    formType: string;
    formTitle: string;
    values: Record<string, unknown>;
  }): FormDraft {
    const all = this.readAll();
    const existingIndex = all.findIndex(
      (draft) => draft.userId === input.userId && draft.formType === input.formType,
    );
    const isNew = existingIndex < 0;

    const draft: FormDraft = {
      userId: input.userId,
      formType: input.formType,
      formTitle: input.formTitle,
      values: structuredClone(input.values),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      all[existingIndex] = draft;
    } else {
      all.push(draft);
    }

    this.storage.writeJson(WORKSPACE_STORAGE_KEYS.drafts, all);

    if (isNew) {
      this.activity.record({
        userId: input.userId,
        type: 'draft_started',
        message: `Started ${input.formTitle}`,
        formType: input.formType,
      });
    }

    this.revision.update((value) => value + 1);
    return draft;
  }

  clearDraft(userId: string, formType: string): void {
    const next = this.readAll().filter(
      (draft) => !(draft.userId === userId && draft.formType === formType),
    );
    this.storage.writeJson(WORKSPACE_STORAGE_KEYS.drafts, next);
    this.revision.update((value) => value + 1);
  }

  private readAll(): FormDraft[] {
    return this.storage.readJson<FormDraft[]>(WORKSPACE_STORAGE_KEYS.drafts, []);
  }
}
