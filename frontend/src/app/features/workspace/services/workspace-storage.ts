import { InjectionToken } from '@angular/core';

/**
 * Key/value persistence port for the customer workspace.
 * Swap LocalStorageWorkspaceStorage for an HTTP-backed implementation later
 * without changing ProfileService / ApplicationService / DraftService.
 */
export interface WorkspaceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const WORKSPACE_STORAGE = new InjectionToken<WorkspaceStorage>('WORKSPACE_STORAGE');
