import { ROUTES } from '../../shared/config/constants';
import { TAGS } from '../../shared/config/test-tags';
import { test, expect } from '../../shared/fixtures';
import {
  LOGIN_ERROR_MESSAGES,
  REGISTER_BANNER_ERROR_MESSAGES,
  REGISTER_FIELD_ERROR_MESSAGES,
  duplicateRegistrationPack,
  invalidLoginUsers,
  loginValidationCases,
  registerBoundaryCases,
  returnUrlScenarios,
  validSeedUser,
  wrongPasswordFor,
} from '../data';
import { LoginPage, RegisterPage } from '../pages';
import { login, loginWithReturnUrl, logout, registerAndEnterPortal } from '../workflows';

/**
 * Positive auth flows — registration, login, logout, returnUrl.
 */
test.describe(`${TAGS.auth} Authentication positive`, () => {
  test(`${TAGS.happy} S02 AUT-AUTH-04 — successful registration enters portal`, async ({
    guestPage,
  }) => {
    const user = await registerAndEnterPortal(guestPage);
    await expect(guestPage).toHaveURL(new RegExp(ROUTES.dashboard));
    expect(user.email).toBeTruthy();
  });

  test(`${TAGS.happy} ${TAGS.smoke} S03/S12 AUT-AUTH-02 — successful login to dashboard`, async ({
    guestPage,
    dataSetup,
  }) => {
    const user = validSeedUser();
    await dataSetup.seedUser(guestPage, user);
    await login(guestPage, { email: user.email, password: user.password });
    await expect(guestPage).toHaveURL(new RegExp(ROUTES.dashboard));
  });

  test(`${TAGS.happy} S07 AUT-AUTH-06 — successful logout navigates to login`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await page.goto(ROUTES.dashboard);
    await logout(page);
    await expect(page).toHaveURL(new RegExp(ROUTES.login));
  });

  test(`${TAGS.happy} ${TAGS.security} ${TAGS.critical} S08/S13 AUT-AUTH-07 — login redirects to intended return URL`, async ({
    guestPage,
    dataSetup,
  }) => {
    const user = validSeedUser();
    await dataSetup.seedUser(guestPage, user);
    const scenario = returnUrlScenarios.guestDeepLinkForm;

    await loginWithReturnUrl(
      guestPage,
      { email: user.email, password: user.password },
      scenario.protectedPath,
    );

    await expect(guestPage).toHaveURL(new RegExp(scenario.expectedAfterLogin));
  });
});

/**
 * Negative login / registration validation.
 */
test.describe(`${TAGS.auth} Authentication negative`, () => {
  test(`${TAGS.negative} S04 AUT-AUTH-03 — wrong password stays on login with error`, async ({
    guestPage,
    dataSetup,
  }) => {
    const user = validSeedUser();
    await dataSetup.seedUser(guestPage, user);
    await login(guestPage, wrongPasswordFor(user.email));

    const loginPage = new LoginPage(guestPage);
    await expect(guestPage).toHaveURL(new RegExp(ROUTES.login));
    await expect(loginPage.bannerError).toContainText(LOGIN_ERROR_MESSAGES.invalidCredentials);
  });

  test(`${TAGS.negative} S04 AUT-AUTH-03 — unknown email stays on login with error`, async ({
    guestPage,
  }) => {
    await login(guestPage, invalidLoginUsers.unknownEmail);

    const loginPage = new LoginPage(guestPage);
    await expect(guestPage).toHaveURL(new RegExp(ROUTES.login));
    await expect(loginPage.bannerError).toContainText(LOGIN_ERROR_MESSAGES.invalidCredentials);
  });

  test(`${TAGS.negative} ${TAGS.boundary} S05 AUT-AUTH-05 — empty login fields show validation`, async ({
    guestPage,
  }) => {
    const loginPage = new LoginPage(guestPage);
    await loginPage.open();
    await loginPage.login(loginValidationCases.emptyBoth);

    await expect(guestPage).toHaveURL(new RegExp(ROUTES.login));
    await expect(loginPage.fieldErrors.first()).toBeVisible();
  });

  test(`${TAGS.negative} ${TAGS.boundary} S05 AUT-AUTH-05 — empty registration fields show validation`, async ({
    guestPage,
  }) => {
    const cases = registerBoundaryCases();
    const registerPage = new RegisterPage(guestPage);
    await registerPage.open();
    await registerPage.register(cases.emptyRequired);

    await expect(guestPage).toHaveURL(new RegExp(ROUTES.register));
    await expect(registerPage.fieldErrors.first()).toBeVisible();
  });

  test(`${TAGS.negative} ${TAGS.boundary} S05 AUT-AUTH-05 — invalid email on register`, async ({
    guestPage,
  }) => {
    const cases = registerBoundaryCases();
    const registerPage = new RegisterPage(guestPage);
    await registerPage.open();
    await registerPage.register(cases.invalidEmailFormat);

    await expect(guestPage).toHaveURL(new RegExp(ROUTES.register));
    await expect(registerPage.fieldErrors).toContainText(REGISTER_FIELD_ERROR_MESSAGES.email);
  });

  test(`${TAGS.negative} ${TAGS.boundary} S05 AUT-AUTH-05 — invalid mobile on register`, async ({
    guestPage,
  }) => {
    const cases = registerBoundaryCases();
    const registerPage = new RegisterPage(guestPage);
    await registerPage.open();
    await registerPage.register(cases.mobileStartsWithFive);

    await expect(guestPage).toHaveURL(new RegExp(ROUTES.register));
    await expect(registerPage.fieldErrors).toContainText(REGISTER_FIELD_ERROR_MESSAGES.mobile);
  });

  test(`${TAGS.negative} ${TAGS.boundary} S05 AUT-AUTH-05 — password too short on register`, async ({
    guestPage,
  }) => {
    const cases = registerBoundaryCases();
    const registerPage = new RegisterPage(guestPage);
    await registerPage.open();
    await registerPage.register(cases.passwordTooShort);

    await expect(guestPage).toHaveURL(new RegExp(ROUTES.register));
    await expect(registerPage.fieldErrors).toContainText(REGISTER_FIELD_ERROR_MESSAGES.password);
  });

  test(`${TAGS.negative} ${TAGS.boundary} S05 AUT-AUTH-05 — password confirm mismatch`, async ({
    guestPage,
  }) => {
    const cases = registerBoundaryCases();
    const registerPage = new RegisterPage(guestPage);
    await registerPage.open();
    await registerPage.register(cases.confirmMismatch);

    await expect(guestPage).toHaveURL(new RegExp(ROUTES.register));
    await expect(registerPage.fieldErrors).toContainText(
      REGISTER_FIELD_ERROR_MESSAGES.confirmMismatch,
    );
  });

  test(`${TAGS.negative} S06 AUT-AUTH-05 — duplicate registration is blocked`, async ({
    guestPage,
    dataSetup,
  }) => {
    const pack = duplicateRegistrationPack();
    await dataSetup.seedUser(guestPage, pack.existing);

    const registerPage = new RegisterPage(guestPage);
    await registerPage.open();
    await registerPage.register(pack.attempt);

    await expect(guestPage).toHaveURL(new RegExp(ROUTES.register));
    await expect(registerPage.bannerError).toContainText(
      REGISTER_BANNER_ERROR_MESSAGES.duplicateEmail,
    );
  });
});
