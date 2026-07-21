import { expect, test } from '../../shared/fixtures';
import { TAGS } from '../../shared/config/test-tags';
import { LandingPage } from '../../authentication/pages';
import { PortalShellPage } from '../../shared/pages/portal-shell.page';
import { DashboardPage } from '../../workspace/pages';
import { FormHostPage } from '../../forms/pages';
import { BankingAdvisorPage } from '../../advisor/pages';
import { VIEWPORT_PACKS } from '../data';
import { applyViewport } from '../workflows';

/**
 * Responsive Matrix — AUT-QA-02 (Desktop + Mobile only).
 * Tablet omitted — shell behaviour matches desktop for this app.
 */
test.describe(`${TAGS.responsive} AUT-QA-02 Responsive matrix`, () => {
  const desktop = VIEWPORT_PACKS.find((v) => v.id === 'desktop')!;
  const mobile = VIEWPORT_PACKS.find((v) => v.id === 'mobile')!;

  test(`${TAGS.happy} — mobile + desktop guest landing CTAs`, async ({ guestPage }) => {
    for (const vp of [mobile, desktop]) {
      await applyViewport(guestPage, vp);
      const landing = new LandingPage(guestPage);
      await landing.open();
      await expect(landing.navLogin).toBeVisible();
      await expect(landing.navRegister).toBeVisible();
    }
  });

  for (const vp of [mobile, desktop]) {
    test(`${TAGS.happy} — ${vp.label} dashboard shell chrome`, async ({
      authenticatedUser,
    }) => {
      const { page } = authenticatedUser;
      await applyViewport(page, vp);
      const dashboard = new DashboardPage(page);
      await dashboard.open();
      await expect(dashboard.hero).toBeVisible();
      await expect(dashboard.myWorkspace).toBeVisible();

      const shell = new PortalShellPage(page);
      await expect(shell.logoutButton).toBeVisible();
      if (vp.shellNavVisible) {
        await expect(shell.mainNav).toBeVisible();
        await expect(shell.advisorLink).toBeVisible();
      } else {
        await expect(shell.mainNav).toBeHidden();
      }
    });

    test(`${TAGS.happy} — ${vp.label} advisor controls visible`, async ({
      authenticatedUser,
    }) => {
      const { page } = authenticatedUser;
      await applyViewport(page, vp);
      const advisor = new BankingAdvisorPage(page);
      await advisor.open();
      await expect(advisor.heading).toBeVisible();
      await expect(advisor.messageInput).toBeVisible();
      await expect(advisor.sendButton).toBeVisible();
    });

    test(`${TAGS.happy} — ${vp.label} form host ready for account-opening`, async ({
      authenticatedUser,
    }) => {
      const { page } = authenticatedUser;
      await applyViewport(page, vp);
      const host = new FormHostPage(page);
      await host.open('account-opening');
      await host.expectFormReady();
      await expect(host.form.root).toBeVisible();
    });
  }
});
