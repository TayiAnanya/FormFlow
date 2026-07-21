import { expect, test } from '../../shared/fixtures';
import { TAGS } from '../../shared/config/test-tags';
import { ROUTES } from '../../shared/config/constants';
import { SAMPLE_GOAL } from '../data';
import {
  completeAdvisorFlow,
  readSavedRecommendations,
  stubAdvisorSuccess,
  openAdvisor,
  submitGoalAndAwaitResults,
} from '../workflows';

/**
 * LocalStorage persistence + dashboard panel (AUT-ADV-09/10).
 */
test.describe(`${TAGS.advisor} AUT-ADV-09/10 Persistence`, () => {
  test(`${TAGS.happy} AUT-ADV-09 — storage write includes userId, message, and product cards`, async ({
    authenticatedUser,
  }) => {
    const { page, user } = authenticatedUser;
    await completeAdvisorFlow(page, 'loan', SAMPLE_GOAL);
    const recs = await readSavedRecommendations(page);
    expect(recs.length).toBeGreaterThanOrEqual(1);
    const entry = recs[0] as Record<string, unknown>;
    expect(entry['userId']).toBe(user.id);
    expect(typeof entry['sourceMessage']).toBe('string');
    expect((entry['sourceMessage'] as string).trim().length).toBeGreaterThan(0);
    expect(Array.isArray(entry['productCards'])).toBe(true);
    expect((entry['productCards'] as unknown[]).length).toBeGreaterThanOrEqual(1);
  });

  test(`${TAGS.happy} AUT-ADV-09 — dashboard panel shows cards and CTA opens a form`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await completeAdvisorFlow(page, 'loan', SAMPLE_GOAL);
    await page.goto(ROUTES.dashboard);
    await page.waitForLoadState('domcontentloaded');
    const panel = page.locator('.my-workspace-panel-wide');
    await expect(panel).toBeVisible();
    expect(await panel.locator('.my-workspace-rec-card').count()).toBeGreaterThanOrEqual(1);
    await panel.locator('.my-workspace-rec-card').first().getByRole('button').click();
    await expect(page).toHaveURL(new RegExp('/forms/'));
  });

  test(`${TAGS.happy} AUT-ADV-10 — recommendations survive reload on advisor and dashboard`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await completeAdvisorFlow(page, 'loan', SAMPLE_GOAL);
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    expect((await readSavedRecommendations(page)).length).toBeGreaterThanOrEqual(1);

    await page.goto(ROUTES.dashboard);
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    expect(
      await page.locator('.my-workspace-panel-wide .my-workspace-rec-card').count(),
    ).toBeGreaterThanOrEqual(1);
  });

  test(`${TAGS.happy} AUT-ADV-09 — second submission overwrites recommendation (one per user)`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    await stubAdvisorSuccess(page, 'loan');
    const advisor = await openAdvisor(page);
    await submitGoalAndAwaitResults(advisor, 'I want a car loan.');
    const count1 = (await readSavedRecommendations(page)).length;

    await advisor.startOver();
    await stubAdvisorSuccess(page, 'card');
    await submitGoalAndAwaitResults(advisor, 'I want a credit card.');
    expect((await readSavedRecommendations(page)).length).toBe(count1);
  });

  test(`${TAGS.negative} — empty state on fresh user shows advisor link`, async ({
    emptyWorkspaceUser,
  }) => {
    const { page } = emptyWorkspaceUser;
    const panel = page.locator('.my-workspace-panel-wide');
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('link', { name: /Smart Banking Advisor/i })).toBeVisible();
  });
});
