import { expect, test } from '../../shared/fixtures';
import { TAGS } from '../../shared/config/test-tags';
import {
  ADVISOR_ERROR_MESSAGE,
  SAMPLE_GOAL,
  RETRY_GOAL,
} from '../data';
import {
  openAdvisor,
  stubAdvisorVague,
  stubAdvisorSuccess,
  submitGoalAndAwaitError,
  submitGoalAndAwaitResults,
  completeAdvisorErrorFlow,
} from '../workflows';

/**
 * Error states, recovery, Start Over, retry (AUT-ADV-08).
 * Distinct error sources + one recovery journey — not per-control slices.
 */
test.describe(`${TAGS.advisor} AUT-ADV-08 Error handling`, () => {
  test(`${TAGS.negative} AUT-ADV-08 ERR-02 — vague response shows error and re-enables input`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const advisor = await completeAdvisorErrorFlow(page, SAMPLE_GOAL, 'vague');
    await advisor.expectPhase('error');
    await expect(advisor.errorMessage).toContainText(ADVISOR_ERROR_MESSAGE);
    await expect(advisor.errorMessage).toBeVisible();
    await expect(advisor.messageInput).toBeEnabled();
    await expect(advisor.loadingIndicator).toBeHidden();
    await expect(advisor.resultsSection).toBeHidden();
    await expect(advisor.startOverButton).toBeVisible();
    await advisor.fillMessage(RETRY_GOAL);
    await expect(advisor.sendButton).toBeEnabled();
  });

  test(`${TAGS.negative} AUT-ADV-08 ERR-06 — HTTP 500 triggers error phase`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const advisor = await completeAdvisorErrorFlow(page, SAMPLE_GOAL, 'http');
    await advisor.expectPhase('error');
    await expect(advisor.errorMessage).toBeVisible();
  });

  test(`${TAGS.negative} AUT-ADV-08 ERR-07 — empty candidates triggers error phase`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const advisor = await completeAdvisorErrorFlow(page, SAMPLE_GOAL, 'empty');
    await advisor.expectPhase('error');
  });

  test(`${TAGS.happy} AUT-ADV-07 — Start Over from error returns to idle`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const advisor = await completeAdvisorErrorFlow(page, SAMPLE_GOAL, 'vague');
    await advisor.startOver();
    await advisor.expectPhase('idle');
    await expect(advisor.errorMessage).toBeHidden();
  });

  test(`${TAGS.happy} AUT-ADV-08 ERR-09 — retry after error succeeds on stub swap`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await stubAdvisorVague(page);
    const advisor = await openAdvisor(page);
    await submitGoalAndAwaitError(advisor, SAMPLE_GOAL);
    await advisor.expectPhase('error');

    await stubAdvisorSuccess(page, 'loan');
    await advisor.fillMessage(RETRY_GOAL);
    await submitGoalAndAwaitResults(advisor, RETRY_GOAL);
    await advisor.expectPhase('results');
  });
});
