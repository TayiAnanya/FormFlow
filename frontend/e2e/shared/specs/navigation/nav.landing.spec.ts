import { LandingPage, LoginPage, RegisterPage } from '../../../authentication/pages';
import { TAGS } from '../../config/test-tags';
import { landingEntryTargets } from '../../data/navigation';
import { test, expect } from '../../fixtures';

/**
 * N01 / N02 — Landing entry to Login and Register (AUT-NAV-02).
 */
test.describe(`${TAGS.navigation} Landing entry`, () => {
  test(`${TAGS.happy} N01 AUT-NAV-02 — landing navigates to Login`, async ({
    guestPage,
  }) => {
    const landing = new LandingPage(guestPage);
    await landing.open();
    await landing.goToLoginFromNav();

    const login = new LoginPage(guestPage);
    await login.expectReady();
    await expect(guestPage).toHaveURL(new RegExp(`${landingEntryTargets.login}$`));
  });

  test(`${TAGS.happy} N02 AUT-NAV-02 — landing navigates to Register`, async ({
    guestPage,
  }) => {
    const landing = new LandingPage(guestPage);
    await landing.open();
    await landing.goToRegisterFromNav();

    const register = new RegisterPage(guestPage);
    await register.expectReady();
    await expect(guestPage).toHaveURL(new RegExp(`${landingEntryTargets.register}$`));
  });
});
