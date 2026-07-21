import { ROUTES } from '../../shared/config/constants';
import { TAGS } from '../../shared/config/test-tags';
import { test, expect } from '../../shared/fixtures';
import { EMPTY_COPY, buildApplication } from '../data';
import { ApplicationDetailPage } from '../pages';
import { openApplicationDetail } from '../workflows';

/**
 * Applications list/detail + error paths (AUT-WS-03/04).
 */
test.describe(`${TAGS.workspace} Applications`, () => {
  test(`${TAGS.happy} AUT-WS-03 — each seeded status visible in list`, async ({
    returningWorkspaceUser,
  }) => {
    const { dashboard, pack } = returningWorkspaceUser;
    for (const app of pack!.applications) {
      const row = dashboard.applicationRow(app.id);
      await expect(row).toContainText(app.formTitle);
      await expect(row).toContainText(app.status);
    }
  });

  test(`${TAGS.happy} AUT-WS-04 — detail shows id status and summary path`, async ({
    returningWorkspaceUser,
  }) => {
    const { page, pack } = returningWorkspaceUser;
    const app = pack!.applications.find((a) => a.status === 'Approved')!;
    const detail = await openApplicationDetail(page, app.id);
    await expect(detail.applicationId).toHaveText(app.id);
    await expect(detail.title).toContainText(app.formTitle);
    await expect(page.locator('.p-tag-label', { hasText: app.status })).toBeVisible();
  });

  test(`${TAGS.happy} AUT-WS-04 — open detail for each seeded status`, async ({
    returningWorkspaceUser,
  }) => {
    const { page, pack } = returningWorkspaceUser;
    for (const status of ['Submitted', 'Approved', 'Under Review', 'Resolved'] as const) {
      const app = pack!.applications.find((a) => a.status === status);
      if (!app) continue;
      const detail = await openApplicationDetail(page, app.id);
      await expect(page).toHaveURL(new RegExp(ROUTES.application(app.id)));
      await detail.backToWorkspace();
    }
  });

  test(`${TAGS.negative} AUT-WS-04 — unknown application id shows not found`, async ({
    returningWorkspaceUser,
  }) => {
    const { page } = returningWorkspaceUser;
    const detail = new ApplicationDetailPage(page);
    await detail.open('LOAN-404');
    await expect(detail.notFoundMessage).toContainText(EMPTY_COPY.applicationNotFound);
  });

  test(`${TAGS.negative} AUT-WS-04 — other-user application not visible to account`, async ({
    returningWorkspaceUser,
    dataSetup,
  }) => {
    const { page, user } = returningWorkspaceUser;
    const foreign = buildApplication('other-user-id', 'account-opening', 'Submitted', 9);
    // Append foreign app into storage without changing auth user
    const existing = JSON.parse(
      (await page.evaluate(() => localStorage.getItem('ff_applications'))) ?? '[]',
    ) as unknown[];
    await dataSetup.seedApplications(
      page,
      JSON.stringify([...existing, foreign]),
    );
    await page.reload();
    const detail = new ApplicationDetailPage(page);
    await detail.open(foreign.id);
    await expect(detail.notFoundMessage).toBeVisible();
    expect(user.id).not.toBe(foreign.userId);
  });

  test(`${TAGS.happy} AUT-WS-04 — back from detail restores dashboard list`, async ({
    returningWorkspaceUser,
  }) => {
    const { page, dashboard, pack } = returningWorkspaceUser;
    const detail = await openApplicationDetail(page, pack!.applications[0].id);
    await detail.backToWorkspace();
    await expect(dashboard.applicationsPanel).toBeVisible();
  });
});
