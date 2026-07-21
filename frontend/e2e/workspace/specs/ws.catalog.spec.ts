import { ROUTES, SCENARIO_IDS } from '../../shared/config/constants';
import { TAGS } from '../../shared/config/test-tags';
import { test, expect } from '../../shared/fixtures';
import { CATALOG_TITLES } from '../data';
import { openAdvisorFromPromo, openCatalogFormByTitle } from '../workflows';

/**
 * Catalog + advisor entry (AUT-WS-01).
 * One Open Form sample — full scenario coverage is in forms happy submits.
 */
test.describe(`${TAGS.workspace} Catalog and quick actions`, () => {
  test(`${TAGS.happy} AUT-WS-01 — catalog section and five cards visible`, async ({
    emptyWorkspaceUser,
  }) => {
    const { dashboard } = emptyWorkspaceUser;
    await expect(dashboard.workflowsSection).toBeVisible();
    await expect(dashboard.scenarioCards).toHaveCount(5);
    for (const id of SCENARIO_IDS) {
      await expect(dashboard.scenarioCard(CATALOG_TITLES[id])).toBeVisible();
    }
  });

  test(`${TAGS.happy} AUT-WS-01 — Open Form reaches account-opening`, async ({
    emptyWorkspaceUser,
  }) => {
    const { page } = emptyWorkspaceUser;
    await openCatalogFormByTitle(page, CATALOG_TITLES['account-opening']);
    await expect(page).toHaveURL(new RegExp(ROUTES.form('account-opening')));
  });

  test(`${TAGS.happy} AUT-WS-01 — Open Advisor quick action`, async ({
    returningWorkspaceUser,
  }) => {
    const { page } = returningWorkspaceUser;
    await openAdvisorFromPromo(page);
    await expect(page).toHaveURL(new RegExp(ROUTES.advisor));
  });

  test(`${TAGS.happy} AUT-WS-01 — advisor feature card present on dashboard`, async ({
    emptyWorkspaceUser,
  }) => {
    const { dashboard } = emptyWorkspaceUser;
    await expect(dashboard.advisorCard).toBeVisible();
    await expect(dashboard.openAdvisorButton).toBeVisible();
  });
});
