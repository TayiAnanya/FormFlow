import { expect, test } from '../../shared/fixtures';
import { TAGS } from '../../shared/config/test-tags';
import { ROUTES } from '../../shared/config/constants';
import { BankingAdvisorPage } from '../pages';
import { SAMPLE_GOAL, RETRY_GOAL } from '../data';
import {
  completeAdvisorFlow,
  openAdvisor,
  stubAdvisorSuccess,
  stubAdvisorVague,
  submitGoalAndAwaitResults,
  submitGoalAndAwaitError,
} from '../workflows';

/**
 * End-to-end AI journeys — distinct behaviours only (no smoke/CTA duplicates).
 */
test.describe(`${TAGS.advisor} ${TAGS.journey} AI Journeys`, () => {
  test(`${TAGS.happy} J-ADV-B — suggestion prompt → submit → results`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await stubAdvisorSuccess(page, 'loan');
    const advisor = await openAdvisor(page);
    await advisor.useSuggestion(1);
    const filledGoal = await advisor.messageInput.inputValue();
    expect(filledGoal.trim().length).toBeGreaterThan(0);
    await advisor.submitMessage();
    await advisor.waitForResults();
    await expect(advisor.userBubble).toContainText(filledGoal.trim());
    await expect(advisor.resultsSection).toBeVisible();
  });

  test(`${TAGS.happy} J-ADV-E — Start Over → fresh conversation → results`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { advisor } = await completeAdvisorFlow(page, 'loan', 'I want a car loan.');
    await advisor.startOver();
    await advisor.expectPhase('idle');
    await stubAdvisorSuccess(page, 'card');
    await submitGoalAndAwaitResults(advisor, 'I want a credit card.');
    await advisor.expectPhase('results');
  });

  test(`${TAGS.happy} J-ADV-F — dashboard empty state → advisor → submit`, async ({
    emptyWorkspaceUser,
  }) => {
    const { page } = emptyWorkspaceUser;
    await stubAdvisorSuccess(page, 'loan');
    const panel = page.locator('.my-workspace-panel-wide');
    await panel.getByRole('link', { name: /Smart Banking Advisor/i }).click();
    await expect(page).toHaveURL(new RegExp(ROUTES.advisor));
    const advisor = new BankingAdvisorPage(page);
    await advisor.expectReady();
    await submitGoalAndAwaitResults(advisor, SAMPLE_GOAL);
    await advisor.expectPhase('results');
  });

  test(`${TAGS.happy} J-ADV-C — error recovery journey (stub swap retry)`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await stubAdvisorVague(page);
    const advisor = await openAdvisor(page);
    await submitGoalAndAwaitError(advisor, 'Something vague');
    await advisor.expectPhase('error');
    await stubAdvisorSuccess(page, 'loan');
    await advisor.fillMessage(RETRY_GOAL);
    await submitGoalAndAwaitResults(advisor, RETRY_GOAL);
    await advisor.expectPhase('results');
  });
});
