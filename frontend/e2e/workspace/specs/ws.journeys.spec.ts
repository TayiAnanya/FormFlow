import { ROUTES } from '../../shared/config/constants';
import { TAGS } from '../../shared/config/test-tags';
import { test, expect } from '../../shared/fixtures';
import { PortalShellPage } from '../../shared/pages/portal-shell.page';
import { CATALOG_TITLES, EMPTY_COPY } from '../data';
import {
  continueDraftByTitle,
  openAdvisorFromPromo,
  openApplicationDetail,
  openCatalogFormByTitle,
  openProfileAndReturn,
  openRecommendationByTitle,
} from '../workflows';

/**
 * Multi-behaviour journeys (J-WS-A…K) — behavioural coverage over widget isolation.
 */
test.describe(`${TAGS.workspace} User journeys`, () => {
  test(`${TAGS.happy} ${TAGS.smoke} J-WS-A AUT-WS-01 — first look empty workspace then open catalog form`, async ({
    emptyWorkspaceUser,
  }) => {
    const { page, dashboard, user } = emptyWorkspaceUser;
    await expect(dashboard.heroTitle).toHaveText(/FormFlow/i);
    await expect(dashboard.emptyIn(dashboard.applicationsPanel)).toContainText(
      EMPTY_COPY.applications,
    );
    await expect(dashboard.emptyIn(dashboard.draftsPanel)).toContainText(
      EMPTY_COPY.drafts,
    );
    await expect(
      dashboard.emptyIn(dashboard.recommendationsPanel),
    ).toContainText(EMPTY_COPY.recommendations);

    const shell = new PortalShellPage(page);
    await expect(shell.logoutButton).toBeVisible();
    await expect(page.locator('.portal-welcome')).toContainText(
      user.fullName.split(/\s+/)[0],
    );

    await openCatalogFormByTitle(page, CATALOG_TITLES['account-opening']);
    await expect(page).toHaveURL(new RegExp(ROUTES.form('account-opening')));
  });

  test(`${TAGS.happy} ${TAGS.critical} J-WS-B AUT-WS-05 — resume draft continues to form route`, async ({
    draftWorkspaceUser,
  }) => {
    const { page, dashboard, pack } = draftWorkspaceUser;
    const draft = pack!.drafts[0];
    await expect(dashboard.draftRow(draft.formTitle)).toBeVisible();
    await continueDraftByTitle(page, draft.formTitle);
    await expect(page).toHaveURL(new RegExp(ROUTES.form(draft.formType)));
  });

  test(`${TAGS.happy} J-WS-C AUT-WS-03/04/07 — review application detail and return`, async ({
    returningWorkspaceUser,
  }) => {
    const { page, dashboard, pack } = returningWorkspaceUser;
    const app = pack!.applications[0];
    await expect(dashboard.applicationRow(app.id)).toBeVisible();
    await expect(dashboard.statValue('Submitted')).toHaveText(
      String(pack!.expectedStats.submitted),
    );

    const detail = await openApplicationDetail(page, app.id);
    await expect(detail.applicationId).toHaveText(app.id);
    await expect(detail.title).toContainText(app.formTitle);
    await detail.backToWorkspace();
    await expect(page).toHaveURL(new RegExp(ROUTES.dashboard));
    await expect(dashboard.applicationRow(app.id)).toBeVisible();
  });

  test(`${TAGS.happy} J-WS-D AUT-WS-08 — act on recommendation CTA`, async ({
    recommendationWorkspaceUser,
  }) => {
    const { page, pack } = recommendationWorkspaceUser;
    const card = pack!.recommendation!.productCards[0];
    await openRecommendationByTitle(page, card.title);
    await expect(page).toHaveURL(new RegExp(ROUTES.form(card.targetScenarioId)));
  });

  test(`${TAGS.happy} J-WS-E AUT-WS-02 — profile identity then back to workspace`, async ({
    returningWorkspaceUser,
  }) => {
    const { page, profile, dashboard } = returningWorkspaceUser;
    const profilePage = await openProfileAndReturn(page);
    await expect(profilePage.title).toContainText(profile.fullName);
    await expect(profilePage.customerId).toContainText(profile.customerId);
    await profilePage.backToWorkspace();
    await expect(page).toHaveURL(new RegExp(ROUTES.dashboard));
    await dashboard.expectReady();
  });

  test(`${TAGS.happy} J-WS-F AUT-WS-01 — advisor promo opens advisor route`, async ({
    emptyWorkspaceUser,
  }) => {
    const { page } = emptyWorkspaceUser;
    await openAdvisorFromPromo(page);
    await expect(page).toHaveURL(new RegExp(ROUTES.advisor));
  });

  test(`${TAGS.happy} J-WS-J AUT-WS-05 — multi-draft continue targets correct routes`, async ({
    draftWorkspaceUser,
  }) => {
    const { page, pack, dashboard } = draftWorkspaceUser;
    for (const draft of pack!.drafts) {
      await dashboard.open();
      await continueDraftByTitle(page, draft.formTitle);
      await expect(page).toHaveURL(new RegExp(ROUTES.form(draft.formType)));
    }
  });

  test(`${TAGS.negative} ${TAGS.happy} J-WS-I AUT-WS-04 — error recovery from missing application`, async ({
    returningWorkspaceUser,
  }) => {
    const { page, dashboard, pack } = returningWorkspaceUser;
    const { ApplicationDetailPage } = await import('../pages');
    const detail = new ApplicationDetailPage(page);
    await detail.open('ACC-999');
    await expect(detail.notFoundMessage).toBeVisible();
    await detail.backToWorkspace();
    await expect(page).toHaveURL(new RegExp(ROUTES.dashboard));
    await openApplicationDetail(page, pack!.applications[1].id);
    await expect(page).toHaveURL(
      new RegExp(ROUTES.application(pack!.applications[1].id)),
    );
    await dashboard.open();
    await expect(dashboard.applicationRow(pack!.applications[0].id)).toBeVisible();
  });
});
