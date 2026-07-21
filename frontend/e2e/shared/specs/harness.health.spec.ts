import { TAGS } from '../config/test-tags';
import { test, expect } from '../fixtures';

/**
 * Harness health — proves Playwright can reach FormFlow.
 * No login, forms, or business assertions.
 */
test(`${TAGS.smoke} harness health — app responds at baseURL`, async ({
  guestPage,
}) => {
  const response = await guestPage.goto('/');
  expect(response, 'navigation should return a response').not.toBeNull();
  expect(response!.ok() || response!.status() === 304, 'app should respond OK').toBeTruthy();
  await expect(guestPage).toHaveURL(/\/?$/);
  await expect(guestPage.locator('body')).toBeVisible();
});
