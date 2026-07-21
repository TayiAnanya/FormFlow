import type { Page } from '@playwright/test';

import { WORKSPACE_STORAGE_KEYS } from '../../shared/config/constants';

export type StoredDraft = {
  userId: string;
  formType: string;
  formTitle: string;
  values: Record<string, unknown>;
  updatedAt: string;
};

export async function readDrafts(page: Page): Promise<StoredDraft[]> {
  const raw = await page.evaluate(
    (key) => window.localStorage.getItem(key),
    WORKSPACE_STORAGE_KEYS.drafts,
  );
  if (!raw) return [];
  return JSON.parse(raw) as StoredDraft[];
}

export async function readApplications(page: Page): Promise<
  Array<{ id: string; formType: string; status: string }>
> {
  const raw = await page.evaluate(
    (key) => window.localStorage.getItem(key),
    WORKSPACE_STORAGE_KEYS.applications,
  );
  if (!raw) return [];
  return JSON.parse(raw) as Array<{
    id: string;
    formType: string;
    status: string;
  }>;
}

export function draftForForm(
  drafts: StoredDraft[],
  userId: string,
  formType: string,
): StoredDraft | undefined {
  return drafts.find((d) => d.userId === userId && d.formType === formType);
}
