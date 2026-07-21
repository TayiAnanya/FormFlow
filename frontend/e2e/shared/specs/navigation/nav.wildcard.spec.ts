import { TAGS } from '../../config/test-tags';
import {
  invalidRouteExpectations,
  invalidRoutes,
  publicRoutes,
  shellRoutes,
} from '../../data/navigation';
import { test, expect } from '../../fixtures';
import { PortalShellPage } from '../../pages/portal-shell.page';

/**
 * Wildcard / unknown routes (AUT-NAV-04 / N10).
 */
test.describe(`${TAGS.navigation} Invalid routes`, () => {
  test(`${TAGS.negative} N10 AUT-NAV-04 — unknown route as guest redirects to landing`, async ({
    guestPage,
  }) => {
    await guestPage.goto(invalidRoutes.unknownPage);
    await expect(guestPage).toHaveURL(
      new RegExp(`${publicRoutes.landing === '/' ? '/?$' : publicRoutes.landing}`),
    );
    expect(invalidRouteExpectations.asGuest.path).toBe(publicRoutes.landing);
  });

  test(`${TAGS.negative} N10 AUT-NAV-04 — unknown route as authenticated redirects to dashboard`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await new PortalShellPage(page).openDashboard();
    await page.goto(invalidRoutes.adminSecret);
    await expect(page).toHaveURL(new RegExp(shellRoutes.dashboard));
    expect(invalidRouteExpectations.asAuthenticated.path).toBe(shellRoutes.dashboard);
  });

  test(`${TAGS.negative} N10 AUT-NAV-04 — nonsense path follows wildcard behaviour`, async ({
    guestPage,
  }) => {
    await guestPage.goto(invalidRoutes.nonsense);
    await expect(guestPage).toHaveURL(/\/?$/);
  });
});
