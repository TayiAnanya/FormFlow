import { expect, test } from '../../shared/fixtures';
import { TAGS } from '../../shared/config/test-tags';
import { ROUTES } from '../../shared/config/constants';
import { LandingPage } from '../../authentication/pages';
import { LoginPage } from '../../authentication/pages';
import { PortalShellPage } from '../../shared/pages/portal-shell.page';
import { BankingAdvisorPage } from '../../advisor/pages';
import { DESKTOP } from '../data';
import { applyViewport, tabUntilFocused } from '../workflows';
import { dismissOverlays } from '../../shared/components/primeng/primeng.helpers';

/**
 * Accessibility smoke — keyboard navigation + focus (AUT-QA-01 subset).
 */
test.describe(`${TAGS.a11y} AUT-QA-01 Keyboard and focus`, () => {
  test.beforeEach(async ({ page }) => {
    await applyViewport(page, DESKTOP);
  });

  test(`${TAGS.happy} — landing Login CTA reachable via keyboard`, async ({
    guestPage,
  }) => {
    const landing = new LandingPage(guestPage);
    await landing.open();
    const focused = await tabUntilFocused(guestPage, landing.navLogin);
    expect(focused).toBe(true);
    await guestPage.keyboard.press('Enter');
    await expect(guestPage).toHaveURL(new RegExp(ROUTES.login));
  });

  test(`${TAGS.happy} — login fields accept keyboard focus order`, async ({
    guestPage,
  }) => {
    const login = new LoginPage(guestPage);
    await login.open();
    await login.emailInput.focus();
    await expect(login.emailInput).toBeFocused();
    await guestPage.keyboard.press('Tab');
    // Password control (PrimeNG) should receive focus next
    await expect(login.passwordInput).toBeFocused();
  });

  test(`${TAGS.happy} — shell Advisor link activatable via keyboard`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const shell = new PortalShellPage(page);
    await shell.openDashboard();
    const focused = await tabUntilFocused(page, shell.advisorLink);
    expect(focused).toBe(true);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(ROUTES.advisor));
  });

  test(`${TAGS.happy} — advisor suggestion focusable and activates fill`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const advisor = new BankingAdvisorPage(page);
    await advisor.open();
    const first = advisor.suggestions.first();
    await first.focus();
    await expect(first).toBeFocused();
    // Native <button> activates on Space when focused
    await page.keyboard.press('Space');
    await expect(advisor.messageInput).not.toHaveValue('');
    await expect(advisor.loadingIndicator).toBeHidden();
  });

  test(`${TAGS.happy} — Escape dismisses overlays without page crash`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await page.goto(ROUTES.dashboard);
    await dismissOverlays(page);
    await page.keyboard.press('Escape');
    await expect(page.locator('header.portal-header')).toBeVisible();
  });

  test(`${TAGS.happy} — brand link retains accessible name`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const shell = new PortalShellPage(page);
    await shell.openDashboard();
    await expect(shell.brandLink).toHaveAttribute(
      'aria-label',
      /FormFlow Banking Portal home/i,
    );
  });
});
