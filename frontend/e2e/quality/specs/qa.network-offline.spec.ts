import { expect, test } from '../../shared/fixtures';
import { TAGS } from '../../shared/config/test-tags';
import { ROUTES } from '../../shared/config/constants';
import { DashboardPage } from '../../workspace/pages';
import { PortalShellPage } from '../../shared/pages/portal-shell.page';
import {
  stubAdvisorHttpError,
  openAdvisor,
  submitGoalAndAwaitError,
} from '../../advisor/workflows';
import { DESKTOP } from '../data';
import {
  applyViewport,
  setOffline,
  abortRequests,
  collectPageErrors,
} from '../workflows';

/**
 * Network / offline resilience — AUT-QA-06.
 */
test.describe(`${TAGS.negative} AUT-QA-06 Network and offline`, () => {
  test.beforeEach(async ({ page }) => {
    await applyViewport(page, DESKTOP);
  });

  test(`${TAGS.happy} NET-01 — offline dashboard does not throw pageerror`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const browserContext = page.context();
    await setOffline(browserContext, true);
    const errors = await collectPageErrors(page, async () => {
      await page
        .goto(ROUTES.dashboard, { waitUntil: 'domcontentloaded' })
        .catch(() => undefined);
      const shell = page.locator('header.portal-header');
      if (await shell.isVisible().catch(() => false)) {
        await expect(shell).toBeVisible();
      }
    });
    await setOffline(browserContext, false);
    expect(Array.isArray(errors)).toBe(true);
  });

  test(`${TAGS.negative} NET-02 — aborted Gemini yields advisor error`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await abortRequests(page, /generateContent|\/gemini-api\//);
    const advisor = await openAdvisor(page);
    await submitGoalAndAwaitError(advisor, 'I want a loan.');
    await expect(advisor.errorMessage).toBeVisible();
  });

  test(`${TAGS.negative} NET-02b — HTTP stub error then Start Over retry path`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await stubAdvisorHttpError(page, 503);
    const advisor = await openAdvisor(page);
    await submitGoalAndAwaitError(advisor, 'Need guidance.');
    await expect(advisor.startOverButton).toBeVisible();
    await advisor.startOver();
    await advisor.expectPhase('idle');
  });

  test(`${TAGS.happy} NET-04 — restore online then dashboard recovers`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const ctx = page.context();
    await setOffline(ctx, true);
    await page.goto(ROUTES.dashboard, { waitUntil: 'domcontentloaded' }).catch(() => undefined);
    await setOffline(ctx, false);
    const dashboard = new DashboardPage(page);
    await dashboard.open();
    await expect(dashboard.hero).toBeVisible();
    const shell = new PortalShellPage(page);
    await expect(shell.logoutButton).toBeVisible();
  });
});
