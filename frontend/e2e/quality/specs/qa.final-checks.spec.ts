import { expect, test } from '../../shared/fixtures';
import { TAGS } from '../../shared/config/test-tags';
import { ROUTES } from '../../shared/config/constants';
import { PortalShellPage } from '../../shared/pages/portal-shell.page';
import { LandingPage } from '../../authentication/pages';
import { BankingAdvisorPage } from '../../advisor/pages';
import { DashboardPage } from '../../workspace/pages';
import { DESKTOP, MOBILE } from '../data';
import { applyViewport, collectPageErrors } from '../workflows';

/**
 * Final quality checks + basic visual sanity (landmarks visible) — AUT-QA-08 / final.
 */
test.describe(`${TAGS.regression} AUT-QA Final quality checks`, () => {
  test(`${TAGS.happy} — desktop shell main navigation landmark`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await applyViewport(page, DESKTOP);
    const shell = new PortalShellPage(page);
    await shell.openDashboard();
    await expect(shell.mainNav).toBeVisible();
    await expect(shell.mainNav).toHaveAttribute('aria-label', /Main navigation/i);
  });

  test(`${TAGS.happy} — brand home link present on dashboard`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await applyViewport(page, DESKTOP);
    const shell = new PortalShellPage(page);
    await shell.openDashboard();
    await expect(shell.brandLink).toBeVisible();
  });

  test(`${TAGS.happy} — no pageerror on landing open`, async ({ guestPage }) => {
    await applyViewport(guestPage, DESKTOP);
    const errors = await collectPageErrors(guestPage, async () => {
      const landing = new LandingPage(guestPage);
      await landing.open();
      await landing.expectReady();
    });
    expect(errors).toEqual([]);
  });

  test(`${TAGS.happy} — no pageerror on advisor open`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await applyViewport(page, DESKTOP);
    const errors = await collectPageErrors(page, async () => {
      const advisor = new BankingAdvisorPage(page);
      await advisor.open();
      await advisor.expectReady();
    });
    expect(errors).toEqual([]);
  });

  test(`${TAGS.happy} ${TAGS.visual} — desktop dashboard visual sanity landmarks`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await applyViewport(page, DESKTOP);
    const dashboard = new DashboardPage(page);
    await dashboard.open();
    await expect(dashboard.heroTitle).toBeVisible();
    await expect(dashboard.advisorCard).toBeVisible();
    await expect(dashboard.myWorkspace).toBeVisible();
  });

  test(`${TAGS.happy} ${TAGS.visual} — mobile dashboard visual sanity without shell nav`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await applyViewport(page, MOBILE);
    const dashboard = new DashboardPage(page);
    await dashboard.open();
    await expect(dashboard.hero).toBeVisible();
    const shell = new PortalShellPage(page);
    await expect(shell.mainNav).toBeHidden();
    await expect(shell.logoutButton).toBeVisible();
  });

  test(`${TAGS.smoke} ${TAGS.happy} AUT-QA-08 — harness path still reachable`, async ({
    guestPage,
  }) => {
    await guestPage.goto(ROUTES.landing);
    await expect(guestPage).toHaveURL(/\/?$/);
    await expect(guestPage.locator('body')).toBeVisible();
  });
});
