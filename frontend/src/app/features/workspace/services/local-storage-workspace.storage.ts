import { Injectable } from '@angular/core';

import { WorkspaceStorage } from './workspace-storage';

@Injectable()
export class LocalStorageWorkspaceStorage implements WorkspaceStorage {
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}
