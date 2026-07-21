import { expect, test } from '../../shared/fixtures';
import { TAGS } from '../../shared/config/test-tags';
import { ROUTES } from '../../shared/config/constants';
import { ADVISOR_GOAL_PACKS, SAMPLE_GOAL } from '../data';
import {
  completeAdvisorFlow,
  openAdvisor,
  submitGoalAndAwaitResults,
  stubAdvisorSuccess,
} from '../workflows';

/**
 * Product CTA navigation, Start Over, route transitions (AUT-ADV-06/07).
 * Parameterized goal packs only — no hand-written CTA duplicates.
 */
test.describe(`${TAGS.advisor} AUT-ADV-06/07 Navigation`, () => {
  test.describe('Parameterized: goal pack → correct form route', () => {
    for (const pack of ADVISOR_GOAL_PACKS) {
      test(`${TAGS.happy} AUT-ADV-06 — ${pack.label} goal routes to ${pack.expectedScenario}`, async ({
        authenticatedUser,
      }) => {
        const { page } = authenticatedUser;
        await stubAdvisorSuccess(page, pack.mockVariant);
        const advisor = await openAdvisor(page);
        await submitGoalAndAwaitResults(advisor, pack.goal);
        await advisor.productCardCta(0).click();
        await expect(page).toHaveURL(new RegExp(ROUTES.form(pack.expectedScenario)));
      });
    }
  });

  test(`${TAGS.happy} AUT-ADV-07 — Start Over from results resets conversation`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { advisor } = await completeAdvisorFlow(page, 'loan', SAMPLE_GOAL);
    await expect(advisor.startOverButton).toBeVisible();
    await advisor.startOver();
    await advisor.expectPhase('idle');
    await expect(advisor.userBubble).toBeHidden();
    await expect(advisor.resultsSection).toBeHidden();
    await expect(advisor.messageInput).toHaveValue('');
    await advisor.fillMessage(SAMPLE_GOAL);
    await expect(advisor.sendButton).toBeEnabled();
  });

  test(`${TAGS.happy} — Back to Dashboard navigates to /dashboard`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await openAdvisor(page);
    await page.getByRole('button', { name: /Back to Dashboard/i }).click();
    await expect(page).toHaveURL(new RegExp(ROUTES.dashboard));
  });
});
