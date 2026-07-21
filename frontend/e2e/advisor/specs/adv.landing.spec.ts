import { expect, test } from '../../shared/fixtures';
import { TAGS } from '../../shared/config/test-tags';
import { ROUTES } from '../../shared/config/constants';
import { openAdvisor, openAdvisorViaNav, openAdvisorViaPromo } from '../workflows';

/**
 * Landing state, controls, suggestions, entry points (AUT-ADV-01/02).
 */
test.describe(`${TAGS.advisor} AUT-ADV-01/02 Landing`, () => {
  test(`${TAGS.happy} AUT-ADV-01/02 — page loads with controls and suggestions`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const advisor = await openAdvisor(page);
    await expect(page).toHaveURL(new RegExp(ROUTES.advisor));
    await expect(advisor.heading).toContainText('Smart Banking Advisor');
    await expect(advisor.messageInput).toBeVisible();
    await expect(advisor.messageInput).toHaveValue('');
    await expect(advisor.sendButton).toBeVisible();
    await expect(advisor.suggestions.first()).toBeVisible();
    expect(await advisor.suggestions.count()).toBeGreaterThan(0);
    await expect(advisor.startOverButton).toBeHidden();
  });

  test(`${TAGS.happy} AUT-ADV-01 — shell nav and dashboard promo reach /advisor`, async ({
    emptyWorkspaceUser,
  }) => {
    const { page } = emptyWorkspaceUser;
    await openAdvisorViaNav(page);
    await expect(page).toHaveURL(new RegExp(ROUTES.advisor));
    await page.goto(ROUTES.dashboard);
    await openAdvisorViaPromo(page);
    await expect(page).toHaveURL(new RegExp(ROUTES.advisor));
  });

  test(`${TAGS.happy} AUT-ADV-02 — suggestion populates textarea without auto-submit`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const advisor = await openAdvisor(page);
    await advisor.fillMessage('original text');
    await advisor.useSuggestion(0);
    const value = await advisor.messageInput.inputValue();
    expect(value).not.toBe('original text');
    expect(value.trim().length).toBeGreaterThan(0);
    await expect(advisor.loadingIndicator).toBeHidden();
    await expect(advisor.userBubble).toBeHidden();
    await expect(advisor.resultsSection).toBeHidden();
  });
});
