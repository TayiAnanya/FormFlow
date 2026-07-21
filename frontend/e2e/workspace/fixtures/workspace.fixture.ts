import type { Page } from '@playwright/test';

import type { DataSetupAdapter } from '../../shared/adapters/data-setup.adapter';
import { WORKSPACE_STORAGE_KEYS } from '../../shared/config/constants';
import {
  buildAuthUser,
  buildProfile,
  buildReturningPack,
  buildRecommendation,
  buildDraft,
  type WorkspaceProfile,
} from '../data';
import { seedWorkspaceState, openWorkspace } from '../workflows';
import { DashboardPage } from '../pages';

export type WorkspaceUserContext = {
  page: Page;
  user: ReturnType<typeof buildAuthUser>;
  profile: WorkspaceProfile;
  dashboard: DashboardPage;
  pack?: ReturnType<typeof buildReturningPack>;
};

export type WorkspaceFixtures = {
  emptyWorkspaceUser: WorkspaceUserContext;
  returningWorkspaceUser: WorkspaceUserContext;
  draftWorkspaceUser: WorkspaceUserContext;
  recommendationWorkspaceUser: WorkspaceUserContext;
};

async function loginAndOpen(
  page: Page,
  dataSetup: DataSetupAdapter,
  user: ReturnType<typeof buildAuthUser>,
): Promise<void> {
  await dataSetup.reset(page);
  await dataSetup.loginAs(page, user);
}

export function createWorkspaceFixtures() {
  return {
    emptyWorkspaceUser: async (
      {
        page,
        dataSetup,
      }: { page: Page; dataSetup: DataSetupAdapter },
      use: (ctx: WorkspaceUserContext) => Promise<void>,
    ) => {
      const user = buildAuthUser({ fullName: 'Empty Workspace User' });
      const profile = buildProfile(user);
      await loginAndOpen(page, dataSetup, user);
      await seedWorkspaceState(page, dataSetup, {
        user,
        profile,
        applications: [],
        drafts: [],
        activities: [],
        recommendation: null,
      });
      const dashboard = await openWorkspace(page);
      await use({ page, user, profile, dashboard });
    },

    returningWorkspaceUser: async (
      {
        page,
        dataSetup,
      }: { page: Page; dataSetup: DataSetupAdapter },
      use: (ctx: WorkspaceUserContext) => Promise<void>,
    ) => {
      const pack = buildReturningPack(
        buildAuthUser({ fullName: 'Returning Workspace User' }),
      );
      await loginAndOpen(page, dataSetup, pack.user);
      await seedWorkspaceState(page, dataSetup, pack);
      const dashboard = await openWorkspace(page);
      await use({
        page,
        user: pack.user,
        profile: pack.profile,
        dashboard,
        pack,
      });
    },

    draftWorkspaceUser: async (
      {
        page,
        dataSetup,
      }: { page: Page; dataSetup: DataSetupAdapter },
      use: (ctx: WorkspaceUserContext) => Promise<void>,
    ) => {
      const user = buildAuthUser({ fullName: 'Draft Workspace User' });
      const profile = buildProfile(user);
      const drafts = [
        buildDraft(user.id, 'loan-inquiry'),
        buildDraft(user.id, 'smart-credit-card'),
      ];
      await loginAndOpen(page, dataSetup, user);
      await seedWorkspaceState(page, dataSetup, {
        user,
        profile,
        applications: [],
        drafts,
        activities: [],
        recommendation: null,
      });
      const dashboard = await openWorkspace(page);
      await use({
        page,
        user,
        profile,
        dashboard,
        pack: {
          user,
          profile,
          applications: [],
          drafts,
          activities: [],
          recommendation: buildRecommendation(user.id),
          expectedStats: {
            submitted: 0,
            approved: 0,
            pending: 0,
            drafts: 2,
            resolvedSupport: 0,
          },
        },
      });
    },

    recommendationWorkspaceUser: async (
      {
        page,
        dataSetup,
      }: { page: Page; dataSetup: DataSetupAdapter },
      use: (ctx: WorkspaceUserContext) => Promise<void>,
    ) => {
      const user = buildAuthUser({ fullName: 'Recommendation Workspace User' });
      const profile = buildProfile(user);
      const recommendation = buildRecommendation(user.id, [
        'account-opening',
        'customer-support',
      ]);
      await loginAndOpen(page, dataSetup, user);
      await seedWorkspaceState(page, dataSetup, {
        user,
        profile,
        applications: [],
        drafts: [],
        activities: [],
        recommendation,
      });
      const dashboard = await openWorkspace(page);
      await use({
        page,
        user,
        profile,
        dashboard,
        pack: {
          user,
          profile,
          applications: [],
          drafts: [],
          activities: [],
          recommendation,
          expectedStats: {
            submitted: 0,
            approved: 0,
            pending: 0,
            drafts: 0,
            resolvedSupport: 0,
          },
        },
      });
    },
  };
}

/** Read workspace localStorage snapshot (specs only for asserts). */
export async function readWorkspaceStorage(page: Page) {
  return page.evaluate((keys) => {
    return {
      profiles: window.localStorage.getItem(keys.profiles),
      applications: window.localStorage.getItem(keys.applications),
      drafts: window.localStorage.getItem(keys.drafts),
      activities: window.localStorage.getItem(keys.activities),
      recommendations: window.localStorage.getItem(keys.advisorRecommendations),
    };
  }, WORKSPACE_STORAGE_KEYS);
}
