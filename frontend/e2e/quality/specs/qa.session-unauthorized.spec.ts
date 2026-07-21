import { expect, test } from '../../shared/fixtures';
import { TAGS } from '../../shared/config/test-tags';
import { ROUTES } from '../../shared/config/constants';
import { LoginPage } from '../../authentication/pages';
import { PortalShellPage } from '../../shared/pages/portal-shell.page';
import { DESKTOP } from '../data';
import { applyViewport, clearSession } from '../workflows';

/**
 * Session expiry (simulated) + unauthorized redirects — AUT-QA-07.
 */
test.describe(`${TAGS.security} AUT-QA-07 Session and unauthorized`, () => {
  test.beforeEach(async ({ page }) => {
    await applyViewport(page, DESKTOP);
  });

  test(`${TAGS.negative} SEC-01 — cleared session redirects dashboard to login`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await page.goto(ROUTES.dashboard);
    await clearSession(page);
    await page.goto(ROUTES.dashboard);
    await expect(page).toHaveURL(/\/login/);
    const returnUrl = new URL(page.url()).searchParams.get('returnUrl');
    expect(returnUrl).toBe(ROUTES.dashboard);
  });

  test(`${TAGS.negative} SEC-02 — guest advisor redirects with returnUrl`, async ({
    guestPage,
  }) => {
    await guestPage.goto(ROUTES.advisor);
    await expect(guestPage).toHaveURL(/\/login/);
    const returnUrl = new URL(guestPage.url()).searchParams.get('returnUrl');
    expect(returnUrl).toBe(ROUTES.advisor);
  });

  test(`${TAGS.negative} SEC-03 — guest form deep-link redirects with returnUrl`, async ({
    guestPage,
  }) => {
    const formPath = ROUTES.form('account-opening');
    await guestPage.goto(formPath);
    await expect(guestPage).toHaveURL(/\/login/);
    const returnUrl = new URL(guestPage.url()).searchParams.get('returnUrl');
    expect(returnUrl).toBe(formPath);
  });

  test(`${TAGS.negative} SEC-04 — after logout profile stays blocked`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const shell = new PortalShellPage(page);
    await shell.openDashboard();
    await shell.logout();
    await expect(page).toHaveURL(new RegExp(ROUTES.login));
    await page.goto(ROUTES.profile);
    await expect(page).toHaveURL(/\/login/);
  });

  test(`${TAGS.happy} — login page ready after unauthorized redirect`, async ({
    guestPage,
  }) => {
    await guestPage.goto(ROUTES.profile);
    const login = new LoginPage(guestPage);
    await login.expectReady();
    await expect(login.emailInput).toBeVisible();
  });
});
