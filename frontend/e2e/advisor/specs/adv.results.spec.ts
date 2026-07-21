import { expect, test } from '../../shared/fixtures';
import { TAGS } from '../../shared/config/test-tags';
import {
  mockAdvisorData,
  mockHighScoreData,
  mockAmberScoreData,
  mockRedScoreData,
  SAMPLE_GOAL,
} from '../data';
import {
  completeAdvisorFlow,
  stubAdvisorWithData,
  openAdvisor,
  submitGoalAndAwaitResults,
} from '../workflows';

/**
 * Results rendering: cards, insights, health, roadmap (AUT-ADV-05).
 * Composite happy path + tone boundaries — not one test per DOM node.
 */
test.describe(`${TAGS.advisor} AUT-ADV-05 Results`, () => {
  test(`${TAGS.happy} AUT-ADV-05 — results render cards, insights, health, roadmap`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { advisor } = await completeAdvisorFlow(page, 'loan', SAMPLE_GOAL);
    await expect(advisor.resultsSection).toBeVisible();
    await expect(advisor.resultsSection).toHaveAttribute(
      'aria-label',
      'Personalized banking recommendations',
    );
    expect(await advisor.productCards.count()).toBeGreaterThanOrEqual(1);
    await expect(advisor.productCard(0).locator('.product-card-title')).toBeVisible();
    await expect(advisor.productCardCta(0)).toBeVisible();
    expect(await advisor.insightCards.count()).toBeGreaterThanOrEqual(1);
    await expect(advisor.healthScoreEl).toBeVisible();
    expect(['green', 'amber', 'red']).toContain(await advisor.healthScoreTone());
    expect(await advisor.roadmapItems.count()).toBeGreaterThanOrEqual(1);
    await expect(page.locator('.goal-chips')).toBeVisible();
  });

  test(`${TAGS.happy} AUT-ADV-05 — savings variant shows products and investment plan`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await stubAdvisorWithData(page, mockAdvisorData('savings'));
    const advisor = await openAdvisor(page);
    await submitGoalAndAwaitResults(advisor, 'I want to save and invest.');
    expect(await advisor.productCards.count()).toBeGreaterThanOrEqual(1);
    await expect(page.locator('.insight-investment')).toBeVisible();
  });

  test(`${TAGS.boundary} AUT-ADV-05 — health score green tone for score >=80`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await stubAdvisorWithData(page, mockHighScoreData());
    const advisor = await openAdvisor(page);
    await submitGoalAndAwaitResults(advisor, SAMPLE_GOAL);
    expect(await advisor.healthScoreTone()).toBe('green');
  });

  test(`${TAGS.boundary} AUT-ADV-05 — health score amber tone for 60 <= score < 80`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await stubAdvisorWithData(page, mockAmberScoreData());
    const advisor = await openAdvisor(page);
    await submitGoalAndAwaitResults(advisor, SAMPLE_GOAL);
    expect(await advisor.healthScoreTone()).toBe('amber');
  });

  test(`${TAGS.boundary} AUT-ADV-05 — health score red tone for score < 60`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await stubAdvisorWithData(page, mockRedScoreData());
    const advisor = await openAdvisor(page);
    await submitGoalAndAwaitResults(advisor, SAMPLE_GOAL);
    expect(await advisor.healthScoreTone()).toBe('red');
  });
});
