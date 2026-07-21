import { validSeedUser } from '../../../authentication/data';
import { ROUTES } from '../../config/constants';
import { TAGS } from '../../config/test-tags';
import {
  defaultDeepLinkForm,
  logoutDestination,
  protectedRouteList,
  protectedRoutes,
  publicRoutes,
  shellRoutes,
} from '../../data/navigation';
import { test, expect } from '../../fixtures';
import { PortalShellPage } from '../../pages/portal-shell.page';
import {
  deepLinkProtectedAsGuest,
  logoutToLogin,
} from '../../workflows/navigation.workflow';

/**
 * Guarded / guest navigation (AUT-NAV-01 + auth guard reuse).
 */
test.describe(`${TAGS.navigation} ${TAGS.security} Navigation guards`, () => {
  test(`${TAGS.negative} ${TAGS.security} N07 AUT-NAV-01 — guest opening protected routes redirects to login`, async ({
    guestPage,
  }) => {
    for (const path of protectedRouteList) {
      await guestPage.goto(path);
      await expect(guestPage).toHaveURL(new RegExp(ROUTES.login));
      const returnUrl = new URL(guestPage.url()).searchParams.get('returnUrl');
      expect(returnUrl).toBe(path);
    }
  });

  test(`${TAGS.negative} ${TAGS.security} N07 AUT-NAV-01 — guest form deep-link redirects to Login`, async ({
    guestPage,
  }) => {
    await guestPage.goto(defaultDeepLinkForm.path);
    await expect(guestPage).toHaveURL(new RegExp(ROUTES.login));
    expect(new URL(guestPage.url()).searchParams.get('returnUrl')).toBe(
      defaultDeepLinkForm.path,
    );
  });

  test(`${TAGS.security} AUT-NAV-01 — authenticated user cannot stay on guest-only pages`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await page.goto(shellRoutes.dashboard);

    await page.goto(publicRoutes.login);
    await expect(page).toHaveURL(new RegExp(shellRoutes.dashboard));

    await page.goto(publicRoutes.register);
    await expect(page).toHaveURL(new RegExp(shellRoutes.dashboard));

    await page.goto(publicRoutes.landing);
    await expect(page).toHaveURL(new RegExp(shellRoutes.dashboard));
  });

  test(`${TAGS.negative} ${TAGS.security} N12 AUT-NAV-01 — protected route blocked after logout`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await new PortalShellPage(page).openDashboard();
    const { intendedPath } = await logoutToLogin(page);
    await expect(page).toHaveURL(new RegExp(intendedPath));
    expect(intendedPath).toBe(logoutDestination);

    await page.goto(protectedRoutes.dashboard);
    await expect(page).toHaveURL(new RegExp(ROUTES.login));
  });

  test(`${TAGS.happy} ${TAGS.security} ${TAGS.critical} N09/N14 AUT-NAV-03 — guest deep-link then login reaches module`, async ({
    guestPage,
    dataSetup,
  }) => {
    const user = validSeedUser();
    await dataSetup.seedUser(guestPage, user);

    const { intendedReturnUrl } = await deepLinkProtectedAsGuest(
      guestPage,
      { email: user.email, password: user.password },
      defaultDeepLinkForm.path,
    );

    await expect(guestPage).toHaveURL(new RegExp(intendedReturnUrl));
    await new PortalShellPage(guestPage).expectReady();
  });
});
