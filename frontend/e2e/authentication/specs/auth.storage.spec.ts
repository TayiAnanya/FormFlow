import { ROUTES } from '../../shared/config/constants';
import { TAGS } from '../../shared/config/test-tags';
import { test, expect } from '../../shared/fixtures';
import { validSeedUser } from '../data';
import { login, logout, registerAndEnterPortal } from '../workflows';
import {
  parseBankUsers,
  parseCurrentUser,
  readAuthStorage,
} from '../support/auth-storage.read';

/**
 * localStorage / mock-backend verification (AUT-AUTH-02/04/06).
 */
test.describe(`${TAGS.auth} Storage verification`, () => {
  test(`${TAGS.happy} AUT-AUTH-02 — session created after login`, async ({
    guestPage,
    dataSetup,
  }) => {
    const user = validSeedUser();
    await dataSetup.seedUser(guestPage, user);
    await login(guestPage, { email: user.email, password: user.password });
    await expect(guestPage).toHaveURL(new RegExp(ROUTES.dashboard));

    const storage = await readAuthStorage(guestPage);
    expect(storage.isLoggedIn).toBe('true');

    const current = parseCurrentUser(storage.currentUserJson);
    expect(current).not.toBeNull();
    expect(current!.email).toBe(user.email.toLowerCase());
    expect(current).not.toHaveProperty('password');
  });

  test(`${TAGS.happy} AUT-AUTH-04 — session created after registration`, async ({
    guestPage,
  }) => {
    const user = await registerAndEnterPortal(guestPage);
    await expect(guestPage).toHaveURL(new RegExp(ROUTES.dashboard));

    const storage = await readAuthStorage(guestPage);
    expect(storage.isLoggedIn).toBe('true');

    const current = parseCurrentUser(storage.currentUserJson);
    expect(current).not.toBeNull();
    expect(current!.email).toBe(user.email.toLowerCase());
    expect(current).not.toHaveProperty('password');

    const users = parseBankUsers(storage.usersJson);
    expect(users.some((u) => u.email === user.email.toLowerCase())).toBeTruthy();
  });

  test(`${TAGS.happy} AUT-AUTH-06 — session removed after logout`, async ({
    authenticatedUser,
  }) => {
    const { page, user } = authenticatedUser;
    await page.goto(ROUTES.dashboard);
    await logout(page);
    await expect(page).toHaveURL(new RegExp(ROUTES.login));

    const storage = await readAuthStorage(page);
    expect(storage.isLoggedIn).not.toBe('true');
    expect(storage.currentUserJson).toBeNull();

    const users = parseBankUsers(storage.usersJson);
    expect(users.some((u) => u.email === user.email.toLowerCase())).toBeTruthy();
  });

  test(`${TAGS.happy} AUT-AUTH-06 — registered users retained after logout`, async ({
    guestPage,
  }) => {
    const user = await registerAndEnterPortal(guestPage);
    await logout(guestPage);

    const storage = await readAuthStorage(guestPage);
    expect(storage.isLoggedIn).not.toBe('true');

    const users = parseBankUsers(storage.usersJson);
    const retained = users.find((u) => u.email === user.email.toLowerCase());
    expect(retained).toBeTruthy();
    expect(retained).toHaveProperty('password');
  });
});
