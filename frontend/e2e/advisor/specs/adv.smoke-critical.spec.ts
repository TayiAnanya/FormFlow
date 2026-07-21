import { expect, test } from '../../shared/fixtures';
import { TAGS } from '../../shared/config/test-tags';
import { SAMPLE_GOAL } from '../data';
import {
  openAdvisor,
  completeAdvisorFlow,
  completeAdvisorErrorFlow,
  stubAdvisorSuccess,
  submitGoalAndAwaitResults,
  readSavedRecommendations,
} from '../workflows';
import { ROUTES } from '../../shared/config/constants';

/**
 * Smoke + critical PR-gate slices for Smart Banking Advisor.
 */
test.describe(`${TAGS.advisor} Smoke and critical`, () => {
  test(`${TAGS.smoke} ${TAGS.happy} AUT-ADV-01/02 — advisor loads with input controls`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const advisor = await openAdvisor(page);
    await expect(page).toHaveURL(new RegExp(ROUTES.advisor));
    await expect(advisor.messageInput).toBeVisible();
    await expect(advisor.suggestions.first()).toBeVisible();
  });

  test(`${TAGS.smoke} ${TAGS.happy} AUT-ADV-05 — submit goal returns results`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { advisor } = await completeAdvisorFlow(page, 'loan', SAMPLE_GOAL);
    await expect(advisor.resultsSection).toBeVisible();
    await expect(advisor.productCards.first()).toBeVisible();
  });

  test(`${TAGS.smoke} ${TAGS.negative} AUT-ADV-08 — error state smoke`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const advisor = await completeAdvisorErrorFlow(page, SAMPLE_GOAL, 'vague');
    await expect(advisor.errorMessage).toBeVisible();
  });

  test(`${TAGS.critical} ${TAGS.happy} AUT-ADV-06 — loan CTA journey critical`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { advisor } = await completeAdvisorFlow(page, 'loan', 'I want to buy a car.');
    await advisor.productCardCta(0).click();
    await expect(page).toHaveURL(new RegExp(ROUTES.form('loan-inquiry')));
  });

  test(`${TAGS.critical} ${TAGS.happy} AUT-ADV-09 — persistence critical`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await completeAdvisorFlow(page, 'loan', SAMPLE_GOAL);
    expect((await readSavedRecommendations(page)).length).toBeGreaterThanOrEqual(1);
  });

  test(`${TAGS.critical} ${TAGS.happy} AUT-ADV-07 — error recovery critical`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const advisor = await completeAdvisorErrorFlow(page, SAMPLE_GOAL, 'vague');
    await advisor.startOver();
    await advisor.expectPhase('idle');
    await stubAdvisorSuccess(page, 'loan');
    await submitGoalAndAwaitResults(advisor, 'I want a car loan.');
    await advisor.expectPhase('results');
  });
});
