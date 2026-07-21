import { ROUTES } from '../../shared/config/constants';
import { TAGS } from '../../shared/config/test-tags';
import { AUTH_STORAGE_KEYS, WORKSPACE_STORAGE_KEYS } from '../../shared/config/constants';
import { test, expect } from '../../shared/fixtures';
import { readWorkspaceStorage } from '../fixtures';
import { PortalShellPage } from '../../shared/pages/portal-shell.page';

/**
 * Refresh / session / localStorage persistence (J-WS-H).
 */
test.describe(`${TAGS.workspace} Persistence`, () => {
  test(`${TAGS.happy} J-WS-H — refresh retains returning panels`, async ({
    returningWorkspaceUser,
  }) => {
    const { page, dashboard, pack } = returningWorkspaceUser;
    const appId = pack!.applications[0].id;
    await expect(dashboard.applicationRow(appId)).toBeVisible();
    await page.reload();
    await dashboard.expectReady();
    await expect(dashboard.applicationRow(appId)).toBeVisible();
    await expect(dashboard.draftRow(pack!.drafts[0].formTitle)).toBeVisible();
  });

  test(`${TAGS.happy} — refresh retains empty applications state`, async ({
    emptyWorkspaceUser,
  }) => {
    const { page, dashboard } = emptyWorkspaceUser;
    await expect(dashboard.emptyIn(dashboard.applicationsPanel)).toBeVisible();
    await page.reload();
    await dashboard.expectReady();
    await expect(dashboard.emptyIn(dashboard.applicationsPanel)).toBeVisible();
  });

  test(`${TAGS.happy} — session survives reload with shell greeting`, async ({
    returningWorkspaceUser,
  }) => {
    const { page, user } = returningWorkspaceUser;
    await page.reload();
    const shell = new PortalShellPage(page);
    await shell.expectReady();
    await expect(page.locator('.portal-welcome')).toContainText(
      user.fullName.split(/\s+/)[0],
    );
  });

  test(`${TAGS.happy} — localStorage retains applications and drafts`, async ({
    returningWorkspaceUser,
  }) => {
    const { page, pack } = returningWorkspaceUser;
    const snap = await readWorkspaceStorage(page);
    expect(snap.applications).toContain(pack!.applications[0].id);
    expect(snap.drafts).toContain(pack!.drafts[0].formType);
    expect(snap.profiles).toContain(pack!.profile.customerId);
    expect(snap.recommendations).toContain(pack!.recommendation!.summary);
  });

  test(`${TAGS.happy} — activity timeline persisted in storage`, async ({
    returningWorkspaceUser,
  }) => {
    const { page, pack } = returningWorkspaceUser;
    const snap = await readWorkspaceStorage(page);
    expect(snap.activities).toContain(pack!.activities[0].message);
  });

  test(`${TAGS.happy} — auth session keys present while on workspace`, async ({
    returningWorkspaceUser,
  }) => {
    const { page } = returningWorkspaceUser;
    const loggedIn = await page.evaluate(
      (key) => window.localStorage.getItem(key),
      AUTH_STORAGE_KEYS.isLoggedIn,
    );
    expect(loggedIn).toBe('true');
  });

  test(`${TAGS.happy} — drafts storage key is workspace drafts key`, async ({
    draftWorkspaceUser,
  }) => {
    const { page } = draftWorkspaceUser;
    const raw = await page.evaluate(
      (key) => window.localStorage.getItem(key),
      WORKSPACE_STORAGE_KEYS.drafts,
    );
    expect(raw).toContain('loan-inquiry');
  });

  test(`${TAGS.happy} — re-enter dashboard via shell after advisor keeps apps`, async ({
    returningWorkspaceUser,
  }) => {
    const { page, dashboard, pack } = returningWorkspaceUser;
    await page.goto(ROUTES.advisor);
    await page.goto(ROUTES.dashboard);
    await dashboard.expectReady();
    await expect(
      dashboard.applicationRow(pack!.applications[0].id),
    ).toBeVisible();
  });
});
