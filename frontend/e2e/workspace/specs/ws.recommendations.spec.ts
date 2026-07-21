import { ROUTES } from '../../shared/config/constants';
import { TAGS } from '../../shared/config/test-tags';
import { test, expect } from '../../shared/fixtures';
import { EMPTY_COPY } from '../data';
import { openRecommendationByTitle } from '../workflows';

test.describe(`${TAGS.workspace} Recommendations`, () => {
  test(`${TAGS.happy} AUT-WS-08 — recommendation summary visible`, async ({
    recommendationWorkspaceUser,
  }) => {
    const { dashboard, pack } = recommendationWorkspaceUser;
    await expect(dashboard.recommendationsPanel).toContainText(
      pack!.recommendation!.summary,
    );
  });

  test(`${TAGS.happy} AUT-WS-08 — each product card CTA navigates`, async ({
    recommendationWorkspaceUser,
  }) => {
    const { page, pack, dashboard } = recommendationWorkspaceUser;
    for (const card of pack!.recommendation!.productCards) {
      await dashboard.open();
      await openRecommendationByTitle(page, card.title);
      await expect(page).toHaveURL(new RegExp(ROUTES.form(card.targetScenarioId)));
    }
  });

  test(`${TAGS.negative} AUT-WS-08 — empty recommendations link to advisor`, async ({
    emptyWorkspaceUser,
  }) => {
    const { dashboard } = emptyWorkspaceUser;
    await expect(
      dashboard.emptyIn(dashboard.recommendationsPanel),
    ).toContainText(EMPTY_COPY.recommendations);
    await dashboard.recommendationsPanel
      .getByRole('link', { name: /Smart Banking Advisor/i })
      .click();
    await expect(emptyWorkspaceUser.page).toHaveURL(/\/advisor/);
  });
});
