import type { Page } from '@playwright/test';

import {
  AUTH_STORAGE_KEYS,
  WORKSPACE_STORAGE_KEYS,
} from '../config/constants';
import type { DataSetupAdapter, SeedUserInput } from './data-setup.adapter';

const ALL_KEYS = [
  AUTH_STORAGE_KEYS.users,
  AUTH_STORAGE_KEYS.currentUser,
  AUTH_STORAGE_KEYS.isLoggedIn,
  ...Object.values(WORKSPACE_STORAGE_KEYS),
] as const;

/**
 * localStorage implementation of DataSetupAdapter (FormFlow mock backend).
 */
export class LocalStorageDataSetupAdapter implements DataSetupAdapter {
  async reset(page: Page): Promise<void> {
    const clear = (keys: readonly string[]) => {
      for (const key of keys) {
        window.localStorage.removeItem(key);
      }
    };

    try {
      await page.evaluate(clear, ALL_KEYS);
    } catch {
      await page.goto('/');
      await page.evaluate(clear, ALL_KEYS);
    }
  }

  async seedUser(page: Page, user: SeedUserInput): Promise<void> {
    const stored = {
      id: user.id ?? `user-${Date.now()}`,
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      password: user.password,
      registeredAt: user.registeredAt ?? new Date().toISOString(),
    };

    const payload = { usersKey: AUTH_STORAGE_KEYS.users, userRecord: stored };
    const apply = ({
      usersKey,
      userRecord,
    }: {
      usersKey: string;
      userRecord: typeof stored;
    }) => {
      const raw = window.localStorage.getItem(usersKey);
      const users: unknown[] = raw ? (JSON.parse(raw) as unknown[]) : [];
      const without = users.filter(
        (u) => (u as { email?: string }).email !== userRecord.email,
      );
      without.push(userRecord);
      window.localStorage.setItem(usersKey, JSON.stringify(without));
    };

    try {
      await page.evaluate(apply, payload);
    } catch {
      await page.addInitScript(apply, payload);
    }
  }

  async loginAs(page: Page, user: SeedUserInput): Promise<void> {
    const publicUser = {
      id: user.id ?? `user-${Date.now()}`,
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      registeredAt: user.registeredAt ?? new Date().toISOString(),
    };

    try {
      await page.evaluate(() => true);
    } catch {
      await page.goto('/');
    }

    await this.seedUser(page, user);

    await page.evaluate(
      ({ currentUserKey, isLoggedInKey, publicUser: profile }) => {
        window.localStorage.setItem(currentUserKey, JSON.stringify(profile));
        window.localStorage.setItem(isLoggedInKey, 'true');
      },
      {
        currentUserKey: AUTH_STORAGE_KEYS.currentUser,
        isLoggedInKey: AUTH_STORAGE_KEYS.isLoggedIn,
        publicUser,
      },
    );
  }

  async seedApplications(page: Page, applicationsJson: string): Promise<void> {
    await this.writeStorageKey(page, WORKSPACE_STORAGE_KEYS.applications, applicationsJson);
  }

  async seedDraft(page: Page, draftJson: string): Promise<void> {
    await this.writeStorageKey(page, WORKSPACE_STORAGE_KEYS.drafts, draftJson);
  }

  async seedAdvisorRecommendation(
    page: Page,
    recommendationJson: string,
  ): Promise<void> {
    await this.writeStorageKey(
      page,
      WORKSPACE_STORAGE_KEYS.advisorRecommendations,
      recommendationJson,
    );
  }

  async seedProfiles(page: Page, profilesJson: string): Promise<void> {
    await this.writeStorageKey(page, WORKSPACE_STORAGE_KEYS.profiles, profilesJson);
  }

  async seedActivities(page: Page, activitiesJson: string): Promise<void> {
    await this.writeStorageKey(page, WORKSPACE_STORAGE_KEYS.activities, activitiesJson);
  }

  async seedApplicationCounters(page: Page, countersJson: string): Promise<void> {
    await this.writeStorageKey(
      page,
      WORKSPACE_STORAGE_KEYS.applicationCounters,
      countersJson,
    );
  }

  /** One-shot storage write — avoids perpetual init scripts after logout. */
  private async writeStorageKey(
    page: Page,
    key: string,
    value: string,
  ): Promise<void> {
    try {
      await page.evaluate(
        ({ storageKey, storageValue }) => {
          window.localStorage.setItem(storageKey, storageValue);
        },
        { storageKey: key, storageValue: value },
      );
    } catch {
      await page.goto('/');
      await page.evaluate(
        ({ storageKey, storageValue }) => {
          window.localStorage.setItem(storageKey, storageValue);
        },
        { storageKey: key, storageValue: value },
      );
    }
  }
}

/** Default adapter instance for fixtures (localStorage mode). */
export const defaultDataSetupAdapter: DataSetupAdapter =
  new LocalStorageDataSetupAdapter();
