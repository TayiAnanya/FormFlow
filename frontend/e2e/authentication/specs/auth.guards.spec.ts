import { ROUTES } from '../../shared/config/constants';
import { TAGS } from '../../shared/config/test-tags';
import { test, expect } from '../../shared/fixtures';
import { returnUrlScenarios, sessionScenarios, validSeedUser } from '../data';
import { LoginPage } from '../pages';
import { login } from '../workflows';

/**
 * Route guards — authGuard, guestGuard, unsafe returnUrl (AUT-AUTH-07/08/10).
 */
test.describe(`${TAGS.auth} ${TAGS.security} Route guards`, () => {
  test(`${TAGS.security} S08 AUT-AUTH-07 — guest accessing protected route redirects to login with returnUrl`, async ({
    guestPage,
  }) => {
    const path = sessionScenarios.protectedAfterLogout.path;
    await guestPage.goto(path);

    await expect(guestPage).toHaveURL(new RegExp(ROUTES.login));
    const returnUrl = new URL(guestPage.url()).searchParams.get('returnUrl');
    expect(returnUrl).toBe(path);
  });

  test(`${TAGS.security} S09 AUT-AUTH-08 — authenticated user opening Login is redirected away`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await page.goto(ROUTES.dashboard);
    await page.goto(sessionScenarios.guestGuardTargets.login);
    await expect(page).toHaveURL(new RegExp(ROUTES.dashboard));
  });

  test(`${TAGS.security} S09 AUT-AUTH-08 — authenticated user opening Register is redirected away`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await page.goto(ROUTES.dashboard);
    await page.goto(sessionScenarios.guestGuardTargets.register);
    await expect(page).toHaveURL(new RegExp(ROUTES.dashboard));
  });

  test(`${TAGS.security} ${TAGS.negative} S11 AUT-AUTH-10 — unsafe returnUrl is rejected`, async ({
    guestPage,
    dataSetup,
  }) => {
    const user = validSeedUser();
    await dataSetup.seedUser(guestPage, user);
    const scenario = returnUrlScenarios.unsafeExternal;

    const loginPage = new LoginPage(guestPage);
    await loginPage.open(scenario.returnUrlQuery);
    await loginPage.login({ email: user.email, password: user.password });

    await expect(guestPage).toHaveURL(new RegExp(scenario.expectedAfterLogin));
    await expect(guestPage).not.toHaveURL(/evil\.example/);
  });
});
