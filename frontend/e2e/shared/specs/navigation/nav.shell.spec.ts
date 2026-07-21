import { TAGS } from '../../config/test-tags';
import {
  activeStateTargets,
  brandHomeDestination,
  fragmentRoutes,
  shellRoutes,
} from '../../data/navigation';
import { test, expect } from '../../fixtures';
import { PortalShellPage } from '../../pages/portal-shell.page';
import {
  clickBrandAndReturnHome,
  navigateShellTo,
} from '../../workflows/navigation.workflow';

/**
 * N03–N06 / N13 — Portal shell menu, fragments, brand, active state (AUT-NAV-01).
 */
test.describe(`${TAGS.navigation} Portal shell`, () => {
  test.beforeEach(async ({ authenticatedUser }) => {
    const shell = new PortalShellPage(authenticatedUser.page);
    await shell.openDashboard();
  });

  test(`${TAGS.happy} N03 AUT-NAV-01 — shell navigates to Dashboard`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await navigateShellTo(page, 'advisor');
    const { intended } = await navigateShellTo(page, 'dashboard');
    await expect(page).toHaveURL(new RegExp(intended.path));
  });

  test(`${TAGS.happy} ${TAGS.smoke} N03/N13 AUT-NAV-01 — shell navigates Dashboard ↔ Advisor`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await navigateShellTo(page, 'advisor');
    await expect(page).toHaveURL(new RegExp(shellRoutes.advisor));

    await navigateShellTo(page, 'dashboard');
    await expect(page).toHaveURL(new RegExp(shellRoutes.dashboard));
  });

  test(`${TAGS.happy} N03 AUT-NAV-01 — shell navigates to Profile`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { intended } = await navigateShellTo(page, 'profile');
    await expect(page).toHaveURL(new RegExp(intended.path));
  });

  test(`${TAGS.happy} N04 AUT-NAV-01 — Forms fragment navigation`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { intended } = await navigateShellTo(page, 'forms');
    await expect(page).toHaveURL(new RegExp(intended.path));
    expect(new URL(page.url()).hash).toBe(fragmentRoutes.forms.hash);
  });

  test(`${TAGS.happy} N04 AUT-NAV-01 — Applications fragment navigation`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { intended } = await navigateShellTo(page, 'applications');
    await expect(page).toHaveURL(new RegExp(intended.path));
    expect(new URL(page.url()).hash).toBe(fragmentRoutes.applications.hash);
  });

  test(`${TAGS.happy} N05 AUT-NAV-01 — brand/logo returns to Dashboard`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await navigateShellTo(page, 'advisor');
    const { intendedPath } = await clickBrandAndReturnHome(page);
    await expect(page).toHaveURL(new RegExp(intendedPath));
    expect(intendedPath).toBe(brandHomeDestination);
  });

  test(`${TAGS.happy} N06 AUT-NAV-01 — active navigation state updates with route`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const shell = new PortalShellPage(page);

    for (const target of activeStateTargets) {
      await navigateShellTo(page, target);
      await expect(shell.navLink(target)).toHaveClass(/portal-nav-link-active/);
    }
  });

  test(`${TAGS.happy} AUT-NAV-01 — authenticated direct URL to shell routes`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const shell = new PortalShellPage(page);

    await shell.goto(shellRoutes.advisor);
    await expect(page).toHaveURL(new RegExp(shellRoutes.advisor));
    await shell.expectReady();

    await shell.goto(shellRoutes.profile);
    await expect(page).toHaveURL(new RegExp(shellRoutes.profile));
    await shell.expectReady();

    await shell.goto(shellRoutes.dashboard);
    await expect(page).toHaveURL(new RegExp(shellRoutes.dashboard));
    await shell.expectReady();
  });
});
