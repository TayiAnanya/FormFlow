import { ROUTES } from '../../shared/config/constants';
import { TAGS } from '../../shared/config/test-tags';
import { test, expect } from '../../shared/fixtures';
import { sessionScenarios } from '../data';
import { AuthenticatedChromePage } from '../pages';
import { logout } from '../workflows';
import { readAuthStorage } from '../support/auth-storage.read';

/**
 * Session persistence — reload restores authenticated session (AUT-AUTH-09).
 */
test.describe(`${TAGS.auth} Session persistence`, () => {
  test(`${TAGS.happy} S10 AUT-AUTH-09 — session persists after refresh`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const path = sessionScenarios.reloadWhileAuthenticated.path;

    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(ROUTES.dashboard));

    await page.reload();
    await expect(page).toHaveURL(new RegExp(ROUTES.dashboard));

    const chrome = new AuthenticatedChromePage(page);
    await chrome.expectReady();
    await expect(chrome.logoutButton).toBeVisible();

    const storage = await readAuthStorage(page);
    expect(storage.isLoggedIn).toBe('true');
  });

  test(`${TAGS.happy} S10 AUT-AUTH-09 — guest remains guest after login page refresh`, async ({
    guestPage,
  }) => {
    await guestPage.goto(sessionScenarios.reloadAsGuestOnLogin.path);
    await guestPage.reload();

    await expect(guestPage).toHaveURL(new RegExp(ROUTES.login));
    const storage = await readAuthStorage(guestPage);
    expect(storage.isLoggedIn).not.toBe('true');
  });

  test(`${TAGS.security} S07 AUT-AUTH-06 — after logout protected URL stays blocked`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await page.goto(ROUTES.dashboard);
    await logout(page);
    await expect(page).toHaveURL(new RegExp(ROUTES.login));

    await page.goto(sessionScenarios.protectedAfterLogout.path);
    await expect(page).toHaveURL(new RegExp(ROUTES.login));
  });
});
