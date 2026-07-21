import { ROUTES } from '../../shared/config/constants';
import { TAGS } from '../../shared/config/test-tags';
import { test, expect } from '../../shared/fixtures';
import { CATALOG_TITLES, EMPTY_COPY } from '../data';
import {
  continueDraftByTitle,
  openAdvisorFromPromo,
  openApplicationDetail,
  openCatalogFormByTitle,
} from '../workflows';

/**
 * Smoke + critical + regression-oriented vertical slices.
 */
test.describe(`${TAGS.workspace} Smoke and critical`, () => {
  test(`${TAGS.smoke} ${TAGS.happy} W13 — empty workspace loads with empty-state copy`, async ({
    emptyWorkspaceUser,
  }) => {
    const { dashboard } = emptyWorkspaceUser;
    await expect(dashboard.hero).toBeVisible();
    await expect(dashboard.myWorkspace).toBeVisible();
    await expect(dashboard.emptyIn(dashboard.applicationsPanel)).toContainText(
      EMPTY_COPY.applications,
    );
    await expect(dashboard.emptyIn(dashboard.draftsPanel)).toContainText(
      EMPTY_COPY.drafts,
    );
    await expect(dashboard.scenarioCards).toHaveCount(5);
  });

  test(`${TAGS.critical} ${TAGS.happy} W14 J-WS-B — returning user continue draft`, async ({
    draftWorkspaceUser,
  }) => {
    const { page, pack } = draftWorkspaceUser;
    const draft = pack!.drafts[0];
    await continueDraftByTitle(page, draft.formTitle);
    await expect(page).toHaveURL(new RegExp(ROUTES.form(draft.formType)));
  });

  test(`${TAGS.smoke} ${TAGS.happy} — returning workspace shows apps and stats`, async ({
    returningWorkspaceUser,
  }) => {
    const { dashboard, pack } = returningWorkspaceUser;
    await expect(dashboard.applicationRow(pack!.applications[0].id)).toBeVisible();
    await expect(dashboard.statValue('Drafts')).toHaveText(
      String(pack!.expectedStats.drafts),
    );
  });

  test(`${TAGS.critical} ${TAGS.happy} — application quick view journey`, async ({
    returningWorkspaceUser,
  }) => {
    const { page, pack } = returningWorkspaceUser;
    await openApplicationDetail(page, pack!.applications[0].id);
    await expect(page).toHaveURL(
      new RegExp(ROUTES.application(pack!.applications[0].id)),
    );
  });

  test(`${TAGS.smoke} ${TAGS.happy} — catalog open form smoke path`, async ({
    emptyWorkspaceUser,
  }) => {
    const { page } = emptyWorkspaceUser;
    await openCatalogFormByTitle(page, CATALOG_TITLES['loan-inquiry']);
    await expect(page).toHaveURL(new RegExp(ROUTES.form('loan-inquiry')));
  });

  test(`${TAGS.smoke} ${TAGS.happy} — advisor door smoke`, async ({
    emptyWorkspaceUser,
  }) => {
    const { page } = emptyWorkspaceUser;
    await openAdvisorFromPromo(page);
    await expect(page).toHaveURL(new RegExp(ROUTES.advisor));
  });
});
