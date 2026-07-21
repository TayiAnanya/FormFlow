import { expect, test } from '../../shared/fixtures';
import { TAGS } from '../../shared/config/test-tags';
import { ROUTES } from '../../shared/config/constants';
import { FormHostPage } from '../../forms/pages';
import { EMPTY_COPY, UNKNOWN_APPLICATION_PATH, UNKNOWN_FORM_PATH } from '../data';
import { DESKTOP } from '../data';
import { applyViewport } from '../workflows';

/**
 * Loading / error / empty samples — AUT-QA-05.
 * Advisor loading/error depth lives in the advisor suite — not duplicated here.
 */
test.describe(`${TAGS.regression} AUT-QA-05 Loading error empty`, () => {
  test.beforeEach(async ({ page }) => {
    await applyViewport(page, DESKTOP);
  });

  test(`${TAGS.negative} LE-03 — unknown form scenario shows catalog error`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = new FormHostPage(page);
    await host.goto(UNKNOWN_FORM_PATH);
    await host.expectReady();
    await expect(host.catalogMissingMessage).toBeVisible();
    await expect(host.returnToDashboard).toBeVisible();
  });

  test(`${TAGS.negative} LE-04 — unknown application shows not-found`, async ({
    emptyWorkspaceUser,
  }) => {
    const { page } = emptyWorkspaceUser;
    await page.goto(UNKNOWN_APPLICATION_PATH);
    await expect(page.getByText(/Application not found for your account/i)).toBeVisible();
  });

  test(`${TAGS.happy} — empty workspace applications and recommendations`, async ({
    emptyWorkspaceUser,
  }) => {
    const { page, dashboard } = emptyWorkspaceUser;
    await expect(dashboard.emptyIn(dashboard.applicationsPanel)).toContainText(
      EMPTY_COPY.applications,
    );
    await expect(
      dashboard.emptyIn(dashboard.recommendationsPanel),
    ).toContainText(EMPTY_COPY.recommendations);
    await dashboard.recommendationsPanel
      .getByRole('link', { name: /Smart Banking Advisor/i })
      .click();
    await expect(page).toHaveURL(new RegExp(ROUTES.advisor));
  });
});
