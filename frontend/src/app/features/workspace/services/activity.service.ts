import { Injectable, inject, signal } from '@angular/core';

import {
  ActivityEvent,
  WORKSPACE_STORAGE_KEYS,
} from '../models/workspace.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private readonly storage = inject(StorageService);
  private readonly revision = signal(0);

  readonly version = this.revision.asReadonly();

  listForUser(userId: string): ActivityEvent[] {
    void this.revision();
    return this.readAll()
      .filter((event) => event.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  record(event: Omit<ActivityEvent, 'id' | 'createdAt'> & { createdAt?: string }): ActivityEvent {
    const entry: ActivityEvent = {
      ...event,
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: event.createdAt ?? new Date().toISOString(),
    };

    const all = this.readAll();
    all.push(entry);
    this.storage.writeJson(WORKSPACE_STORAGE_KEYS.activities, all);
    this.revision.update((value) => value + 1);
    return entry;
  }

  private readAll(): ActivityEvent[] {
    return this.storage.readJson<ActivityEvent[]>(WORKSPACE_STORAGE_KEYS.activities, []);
  }
}
