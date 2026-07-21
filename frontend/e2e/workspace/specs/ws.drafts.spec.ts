import { ROUTES } from '../../shared/config/constants';
import { TAGS } from '../../shared/config/test-tags';
import { test, expect } from '../../shared/fixtures';
import { CATALOG_TITLES, EMPTY_COPY, buildActivity, buildAuthUser, buildProfile } from '../data';
import { seedWorkspaceState, continueDraftByTitle, openWorkspace } from '../workflows';

test.describe(`${TAGS.workspace} Draft lifecycle`, () => {
  test(`${TAGS.happy} AUT-WS-05 — draft titles match catalog`, async ({
    draftWorkspaceUser,
  }) => {
    const { dashboard, pack } = draftWorkspaceUser;
    for (const draft of pack!.drafts) {
      await expect(dashboard.draftRow(draft.formTitle)).toContainText(
        CATALOG_TITLES[draft.formType as keyof typeof CATALOG_TITLES],
      );
    }
  });

  test(`${TAGS.happy} AUT-WS-05 — continue second draft`, async ({
    draftWorkspaceUser,
  }) => {
    const { page, pack } = draftWorkspaceUser;
    const draft = pack!.drafts[1];
    await continueDraftByTitle(page, draft.formTitle);
    await expect(page).toHaveURL(new RegExp(ROUTES.form(draft.formType)));
  });

  test(`${TAGS.happy} AUT-WS-05 — drafts count in statistics`, async ({
    draftWorkspaceUser,
  }) => {
    const { dashboard, pack } = draftWorkspaceUser;
    await expect(dashboard.statValue('Drafts')).toHaveText(
      String(pack!.drafts.length),
    );
  });

  test(`${TAGS.negative} AUT-WS-05 — empty drafts when none seeded`, async ({
    emptyWorkspaceUser,
  }) => {
    const { dashboard } = emptyWorkspaceUser;
    await expect(dashboard.emptyIn(dashboard.draftsPanel)).toContainText(
      EMPTY_COPY.drafts,
    );
  });

  test(`${TAGS.happy} AUT-WS-06 — activity cap shows at most 6 events`, async ({
    page,
    dataSetup,
  }) => {
    const user = buildAuthUser({ fullName: 'Activity Cap User' });
    const profile = buildProfile(user);
    const activities = Array.from({ length: 8 }, (_, i) =>
      buildActivity(user.id, `Event number ${i}`, 'status_updated', i),
    );
    await dataSetup.reset(page);
    await dataSetup.loginAs(page, user);
    await seedWorkspaceState(page, dataSetup, {
      user,
      profile,
      applications: [],
      drafts: [],
      activities,
      recommendation: null,
    });
    const dashboard = await openWorkspace(page);
    const items = dashboard.activityPanel.locator('.my-workspace-activity li');
    await expect(items).toHaveCount(6);
  });
});
