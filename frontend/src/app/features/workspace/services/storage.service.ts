import { Injectable, inject } from '@angular/core';

import { WORKSPACE_STORAGE } from './workspace-storage';

/**
 * Typed JSON helpers over WorkspaceStorage.
 * Components must not touch localStorage — use this or domain services.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly storage = inject(WORKSPACE_STORAGE);

  readJson<T>(key: string, fallback: T): T {
    const raw = this.storage.getItem(key);
    if (!raw) {
      return fallback;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  writeJson<T>(key: string, value: T): void {
    this.storage.setItem(key, JSON.stringify(value));
  }

  remove(key: string): void {
    this.storage.removeItem(key);
  }
}
