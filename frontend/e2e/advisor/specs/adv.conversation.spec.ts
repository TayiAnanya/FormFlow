import { expect, test } from '../../shared/fixtures';
import { TAGS } from '../../shared/config/test-tags';
import { SAMPLE_GOAL, ADVISOR_LOADING_STEPS_TEXT } from '../data';
import {
  openAdvisor,
  stubAdvisorSuccess,
  stubAdvisorDelayed,
  fillAndSubmit,
  submitGoalAndAwaitResults,
} from '../workflows';

/**
 * Conversation submit flow: bubble, loading, controls, results (AUT-ADV-03/04/05).
 * One composite path instead of per-assertion permutations.
 */
test.describe(`${TAGS.advisor} AUT-ADV-03/04/05 Conversation`, () => {
  test(`${TAGS.happy} AUT-ADV-03/04/05 — submit shows bubble, loading, then results`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await stubAdvisorDelayed(page, 'loan', 800);
    const advisor = await openAdvisor(page);
    await advisor.fillMessage(SAMPLE_GOAL);
    await advisor.submitMessage();

    await expect(advisor.userBubble).toBeVisible();
    await expect(advisor.userBubble).toContainText(SAMPLE_GOAL);
    await advisor.expectPhase('loading');
    expect(await advisor.loadingSteps.count()).toBe(4);
    expect(await advisor.activeLoadingSteps.count()).toBeGreaterThanOrEqual(1);
    for (const stepText of ADVISOR_LOADING_STEPS_TEXT) {
      await expect(page.locator('ol.advisor-loading-steps').getByText(stepText)).toBeVisible();
    }
    await expect(advisor.messageInput).toBeDisabled();
    await expect(advisor.sendButton).toBeDisabled();
    await expect(advisor.suggestions.first()).toBeDisabled();

    await advisor.expectPhase('results');
    await expect(advisor.loadingIndicator).toBeHidden();
  });

  test(`${TAGS.happy} AUT-ADV-05 — results visible after successful response`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await stubAdvisorSuccess(page, 'loan');
    const advisor = await openAdvisor(page);
    await submitGoalAndAwaitResults(advisor, SAMPLE_GOAL);
    await advisor.expectPhase('results');
    await expect(advisor.loadingIndicator).toBeHidden();
  });

  test(`${TAGS.negative} AUT-ADV-03 — blank and whitespace messages do not submit`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const advisor = await openAdvisor(page);
    await expect(advisor.sendButton).toBeDisabled();
    await expect(advisor.loadingIndicator).toBeHidden();
    await expect(advisor.userBubble).toBeHidden();

    await advisor.fillMessage('   ');
    await expect(advisor.sendButton).toBeDisabled();
  });
});
