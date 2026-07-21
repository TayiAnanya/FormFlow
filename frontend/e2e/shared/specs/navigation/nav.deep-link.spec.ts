import { TAGS } from '../../config/test-tags';
import { defaultDeepLinkForm } from '../../data/navigation';
import { test, expect } from '../../fixtures';
import { PortalShellPage } from '../../pages/portal-shell.page';
import { deepLinkFormAsAuthenticated } from '../../workflows/navigation.workflow';

/**
 * Authenticated deep-link route arrival only (AUT-NAV-03) — no form fill.
 */
test.describe(`${TAGS.navigation} Deep links`, () => {
  test(`${TAGS.happy} N08 AUT-NAV-03 — authenticated form deep-link arrives under shell`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { intendedPath, shell } = await deepLinkFormAsAuthenticated(
      page,
      defaultDeepLinkForm.scenarioId,
    );

    await expect(page).toHaveURL(new RegExp(intendedPath));
    await shell.expectReady();
  });

  test(`${TAGS.happy} AUT-NAV-01 — refresh keeps authenticated shell route`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const shell = new PortalShellPage(page);
    await shell.openDashboard();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
    await shell.expectReady();
  });
});
