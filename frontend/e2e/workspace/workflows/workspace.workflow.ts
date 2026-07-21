import type { Page } from '@playwright/test';

import type { DataSetupAdapter, SeedUserInput } from '../../shared/adapters/data-setup.adapter';
import { ROUTES } from '../../shared/config/constants';
import {
  ApplicationDetailPage,
  DashboardPage,
  ProfileWorkspacePage,
} from '../pages';
import type {
  WorkspaceActivity,
  WorkspaceApplication,
  WorkspaceDraft,
  WorkspaceProfile,
  WorkspaceRecommendation,
} from '../data';

export type SeededWorkspace = {
  user: Required<SeedUserInput>;
  profile: WorkspaceProfile;
  applications?: WorkspaceApplication[];
  drafts?: WorkspaceDraft[];
  activities?: WorkspaceActivity[];
  recommendation?: WorkspaceRecommendation | null;
};

/** Seed workspace keys for the authenticated user (evaluate writes). */
export async function seedWorkspaceState(
  page: Page,
  dataSetup: DataSetupAdapter,
  pack: SeededWorkspace,
): Promise<void> {
  await dataSetup.seedProfiles(page, JSON.stringify([pack.profile]));
  await dataSetup.seedApplications(
    page,
    JSON.stringify(pack.applications ?? []),
  );
  await dataSetup.seedDraft(page, JSON.stringify(pack.drafts ?? []));
  await dataSetup.seedActivities(page, JSON.stringify(pack.activities ?? []));
  if (pack.recommendation) {
    await dataSetup.seedAdvisorRecommendation(
      page,
      JSON.stringify([pack.recommendation]),
    );
  } else {
    await dataSetup.seedAdvisorRecommendation(page, JSON.stringify([]));
  }
}

export async function openWorkspace(page: Page): Promise<DashboardPage> {
  const dashboard = new DashboardPage(page);
  await dashboard.open();
  return dashboard;
}

export async function openCatalogFormByTitle(
  page: Page,
  title: string | RegExp,
): Promise<{ intendedPathPrefix: string }> {
  const dashboard = new DashboardPage(page);
  await dashboard.expectReady();
  await dashboard.openCatalogForm(title);
  return { intendedPathPrefix: ROUTES.form('') };
}

export async function continueDraftByTitle(
  page: Page,
  formTitle: string | RegExp,
): Promise<void> {
  const dashboard = new DashboardPage(page);
  await dashboard.expectReady();
  await dashboard.continueDraft(formTitle);
}

export async function openApplicationDetail(
  page: Page,
  applicationId: string,
): Promise<ApplicationDetailPage> {
  const dashboard = new DashboardPage(page);
  await dashboard.expectReady();
  await dashboard.openApplication(applicationId);
  const detail = new ApplicationDetailPage(page);
  await detail.expectReady();
  return detail;
}

export async function openRecommendationByTitle(
  page: Page,
  title: string | RegExp,
): Promise<void> {
  const dashboard = new DashboardPage(page);
  await dashboard.expectReady();
  await dashboard.openRecommendation(title);
}

export async function openAdvisorFromPromo(page: Page): Promise<void> {
  const dashboard = new DashboardPage(page);
  await dashboard.expectReady();
  await dashboard.openAdvisor();
}

export async function openProfileAndReturn(
  page: Page,
): Promise<ProfileWorkspacePage> {
  const profile = new ProfileWorkspacePage(page);
  await profile.open();
  await profile.expectReady();
  return profile;
}
