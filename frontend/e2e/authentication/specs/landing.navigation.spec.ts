import { ROUTES } from '../../shared/config/constants';
import { TAGS } from '../../shared/config/test-tags';
import { test, expect } from '../../shared/fixtures';
import { LandingPage, LoginPage, RegisterPage } from '../pages';
import { sessionScenarios } from '../data';

/**
 * S01 / AUT-AUTH-01 — Guest landing entry to Login and Register.
 */
test.describe(`${TAGS.auth} Landing navigation`, () => {
  test(`${TAGS.happy} S01 AUT-AUTH-01 — guest can navigate to Login from landing`, async ({
    guestPage,
  }) => {
    const landing = new LandingPage(guestPage);
    await landing.open();
    await landing.goToLoginFromNav();

    const login = new LoginPage(guestPage);
    await login.expectReady();
    await expect(guestPage).toHaveURL(new RegExp(`${ROUTES.login}$`));
    await expect(login.emailInput).toBeVisible();
  });

  test(`${TAGS.happy} S01 AUT-AUTH-01 — guest can navigate to Register from landing`, async ({
    guestPage,
  }) => {
    const landing = new LandingPage(guestPage);
    await landing.open();
    await landing.goToRegisterFromNav();

    const register = new RegisterPage(guestPage);
    await register.expectReady();
    await expect(guestPage).toHaveURL(new RegExp(`${ROUTES.register}$`));
    await expect(register.nameInput).toBeVisible();
  });

  test(`${TAGS.happy} S01 AUT-AUTH-01 — landing entry paths are reachable`, async ({
    guestPage,
  }) => {
    const { landing, login, register } = sessionScenarios.landingEntry;
    await guestPage.goto(landing);
    await expect(guestPage).toHaveURL(/\/?$/);

    await guestPage.goto(login);
    await expect(guestPage).toHaveURL(new RegExp(`${ROUTES.login}`));

    await guestPage.goto(register);
    await expect(guestPage).toHaveURL(new RegExp(`${ROUTES.register}`));
  });
});
