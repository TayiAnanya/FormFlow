import { TAGS } from '../../config/test-tags';
import { historySequences, shellRoutes } from '../../data/navigation';
import { test, expect } from '../../fixtures';
import { PortalShellPage } from '../../pages/portal-shell.page';
import {
  browserBack,
  browserForward,
  navigateShellTo,
} from '../../workflows/navigation.workflow';

/**
 * Browser history across shell routes (AUT-NAV-01 / N11).
 */
test.describe(`${TAGS.navigation} Browser history`, () => {
  test(`${TAGS.happy} N11 AUT-NAV-01 — browser back restores prior shell route`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const shell = new PortalShellPage(page);
    await shell.openDashboard();

    const [first, second] = historySequences.dashboardAdvisor;
    await shell.goto(first);
    await shell.goto(second);
    await expect(page).toHaveURL(new RegExp(shellRoutes.advisor));

    await browserBack(page);
    await expect(page).toHaveURL(new RegExp(shellRoutes.dashboard));
    await shell.expectReady();
  });

  test(`${TAGS.happy} N11 AUT-NAV-01 — browser forward restores next shell route`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const shell = new PortalShellPage(page);
    await shell.openDashboard();

    await navigateShellTo(page, 'advisor');
    await navigateShellTo(page, 'dashboard');
    await browserBack(page);
    await expect(page).toHaveURL(new RegExp(shellRoutes.advisor));

    await browserForward(page);
    await expect(page).toHaveURL(new RegExp(shellRoutes.dashboard));
    await shell.expectReady();
  });
});
