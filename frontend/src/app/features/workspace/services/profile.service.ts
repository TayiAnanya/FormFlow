import { Injectable, computed, inject, signal } from '@angular/core';

import { AuthUser } from '../../auth/models/auth.model';
import { AuthenticationService } from '../../auth/services/authentication.service';
import { CustomerProfile, WORKSPACE_STORAGE_KEYS } from '../models/workspace.model';
import { buildProfilePrefill } from '../utils/profile-prefill.mapper';
import { ActivityService } from './activity.service';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly storage = inject(StorageService);
  private readonly auth = inject(AuthenticationService);
  private readonly activity = inject(ActivityService);

  private readonly profileSignal = signal<CustomerProfile | null>(null);

  readonly profile = this.profileSignal.asReadonly();
  readonly customerId = computed(() => this.profileSignal()?.customerId ?? null);

  constructor() {
    this.syncFromAuth();
  }

  /** Ensures a workspace profile exists for the authenticated user. */
  syncFromAuth(): CustomerProfile | null {
    const user = this.auth.getCurrentUser();
    if (!user) {
      this.profileSignal.set(null);
      return null;
    }

    const existing = this.findByUserId(user.id);
    if (existing) {
      const merged = this.mergeAuthIntoProfile(existing, user);
      this.persistProfile(merged);
      this.profileSignal.set(merged);
      return merged;
    }

    const created = this.createFromAuthUser(user);
    this.persistProfile(created);
    this.profileSignal.set(created);
    this.activity.record({
      userId: user.id,
      type: 'registered',
      message: 'Registered',
      createdAt: user.registeredAt,
    });
    return created;
  }

  getCurrentProfile(): CustomerProfile | null {
    return this.profileSignal() ?? this.syncFromAuth();
  }

  updateProfile(
    patch: Partial<Pick<CustomerProfile, 'fullName' | 'email' | 'mobileNumber'>>,
  ): CustomerProfile {
    const current = this.getCurrentProfile();
    if (!current) {
      throw new Error('No authenticated customer profile.');
    }

    const updated: CustomerProfile = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    this.persistProfile(updated);
    this.profileSignal.set(updated);
    return updated;
  }

  /** Prefill map for schema-driven forms — never hardcodes values. */
  getPrefillValues(): Record<string, unknown> {
    const profile = this.getCurrentProfile();
    return profile ? buildProfilePrefill(profile) : {};
  }

  private createFromAuthUser(user: AuthUser): CustomerProfile {
    return {
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      customerId: this.generateCustomerId(user.id),
      updatedAt: new Date().toISOString(),
    };
  }

  private mergeAuthIntoProfile(profile: CustomerProfile, user: AuthUser): CustomerProfile {
    return {
      ...profile,
      fullName: user.fullName || profile.fullName,
      email: user.email || profile.email,
      mobileNumber: user.mobileNumber || profile.mobileNumber,
      updatedAt: new Date().toISOString(),
    };
  }

  private findByUserId(userId: string): CustomerProfile | null {
    return this.readAll().find((item) => item.userId === userId) ?? null;
  }

  private persistProfile(profile: CustomerProfile): void {
    const all = this.readAll().filter((item) => item.userId !== profile.userId);
    all.push(profile);
    this.storage.writeJson(WORKSPACE_STORAGE_KEYS.profiles, all);
  }

  private readAll(): CustomerProfile[] {
    return this.storage.readJson<CustomerProfile[]>(WORKSPACE_STORAGE_KEYS.profiles, []);
  }

  private generateCustomerId(userId: string): string {
    const digest = Math.abs(
      Array.from(userId).reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) | 0, 7),
    );
    return `CUST-${String((digest % 9000) + 1000)}`;
  }
}
