import { ROUTES } from '../../shared/config/constants';
import { TAGS } from '../../shared/config/test-tags';
import { test, expect } from '../../shared/fixtures';
import { PortalShellPage } from '../../shared/pages/portal-shell.page';
import { navigateShellTo } from '../../shared/workflows/navigation.workflow';
import { openProfileAndReturn } from '../workflows';

/**
 * Cross-feature navigation from workspace (compose Sprint 02 shell).
 */
test.describe(`${TAGS.workspace} Cross-feature navigation`, () => {
  test(`${TAGS.happy} AUT-WS-02 — shell Profile from workspace`, async ({
    returningWorkspaceUser,
  }) => {
    const { page, profile } = returningWorkspaceUser;
    await navigateShellTo(page, 'profile');
    await expect(page).toHaveURL(new RegExp(ROUTES.profile));
    const profilePage = await openProfileAndReturn(page);
    await expect(profilePage.title).toContainText(profile.fullName);
  });

  test(`${TAGS.happy} — fragment #applications lands on dashboard applications`, async ({
    returningWorkspaceUser,
  }) => {
    const { page, dashboard } = returningWorkspaceUser;
    await page.goto(`${ROUTES.dashboard}#applications`);
    await dashboard.expectReady();
    await expect(dashboard.applicationsPanel).toBeVisible();
  });

  test(`${TAGS.happy} — fragment #workflows lands on catalog`, async ({
    emptyWorkspaceUser,
  }) => {
    const { page, dashboard } = emptyWorkspaceUser;
    await page.goto(`${ROUTES.dashboard}#workflows`);
    await expect(dashboard.workflowsSection).toBeVisible();
  });

  test(`${TAGS.happy} — brand returns to dashboard workspace`, async ({
    returningWorkspaceUser,
  }) => {
    const { page, dashboard, pack } = returningWorkspaceUser;
    await navigateShellTo(page, 'advisor');
    const shell = new PortalShellPage(page);
    await shell.clickBrand();
    await expect(page).toHaveURL(new RegExp(ROUTES.dashboard));
    await expect(
      dashboard.applicationRow(pack!.applications[0].id),
    ).toBeVisible();
  });

  test(`${TAGS.happy} — Advisor nav then back to workspace via Dashboard`, async ({
    returningWorkspaceUser,
  }) => {
    const { page, dashboard } = returningWorkspaceUser;
    await navigateShellTo(page, 'advisor');
    await navigateShellTo(page, 'dashboard');
    await dashboard.expectReady();
    await expect(dashboard.myWorkspace).toBeVisible();
  });
});
