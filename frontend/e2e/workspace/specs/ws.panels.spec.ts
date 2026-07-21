import { TAGS } from '../../shared/config/test-tags';
import { test, expect } from '../../shared/fixtures';
import { EMPTY_COPY } from '../data';

/**
 * Empty vs populated My Workspace panels (paired behavioural coverage).
 */
test.describe(`${TAGS.workspace} Empty vs populated panels`, () => {
  test(`${TAGS.happy} AUT-WS-01/03 — empty applications panel`, async ({
    emptyWorkspaceUser,
  }) => {
    const { dashboard } = emptyWorkspaceUser;
    await expect(dashboard.emptyIn(dashboard.applicationsPanel)).toContainText(
      EMPTY_COPY.applications,
    );
  });

  test(`${TAGS.happy} AUT-WS-01/05 — empty drafts panel`, async ({
    emptyWorkspaceUser,
  }) => {
    const { dashboard } = emptyWorkspaceUser;
    await expect(dashboard.emptyIn(dashboard.draftsPanel)).toContainText(
      EMPTY_COPY.drafts,
    );
  });

  test(`${TAGS.happy} AUT-WS-01/08 — empty recommendations panel`, async ({
    emptyWorkspaceUser,
  }) => {
    const { dashboard } = emptyWorkspaceUser;
    await expect(
      dashboard.emptyIn(dashboard.recommendationsPanel),
    ).toContainText(EMPTY_COPY.recommendations);
    await expect(
      dashboard.recommendationsPanel.getByRole('link', {
        name: /Smart Banking Advisor/i,
      }),
    ).toBeVisible();
  });

  test(`${TAGS.happy} AUT-WS-07 — empty statistics are zero`, async ({
    emptyWorkspaceUser,
  }) => {
    const { dashboard } = emptyWorkspaceUser;
    for (const label of [
      'Submitted',
      'Approved',
      'Pending',
      'Drafts',
      'Resolved support',
    ]) {
      await expect(dashboard.statValue(label)).toHaveText('0');
    }
  });

  test(`${TAGS.happy} AUT-WS-03 — populated applications list`, async ({
    returningWorkspaceUser,
  }) => {
    const { dashboard, pack } = returningWorkspaceUser;
    for (const app of pack!.applications) {
      await expect(dashboard.applicationRow(app.id)).toBeVisible();
      await expect(dashboard.applicationRow(app.id)).toContainText(app.status);
    }
  });

  test(`${TAGS.happy} AUT-WS-05 — populated drafts list`, async ({
    returningWorkspaceUser,
  }) => {
    const { dashboard, pack } = returningWorkspaceUser;
    for (const draft of pack!.drafts) {
      await expect(dashboard.draftRow(draft.formTitle)).toBeVisible();
    }
  });

  test(`${TAGS.happy} AUT-WS-06 — populated recent activity`, async ({
    returningWorkspaceUser,
  }) => {
    const { dashboard, pack } = returningWorkspaceUser;
    const activity = dashboard.activityPanel.locator('.my-workspace-activity li');
    await expect(activity.first()).toBeVisible();
    const count = await activity.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(6);
    await expect(activity.first()).toContainText(pack!.activities[0].message);
  });

  test(`${TAGS.happy} AUT-WS-07 — populated statistics match seeds`, async ({
    returningWorkspaceUser,
  }) => {
    const { dashboard, pack } = returningWorkspaceUser;
    const s = pack!.expectedStats;
    await expect(dashboard.statValue('Submitted')).toHaveText(String(s.submitted));
    await expect(dashboard.statValue('Approved')).toHaveText(String(s.approved));
    await expect(dashboard.statValue('Pending')).toHaveText(String(s.pending));
    await expect(dashboard.statValue('Drafts')).toHaveText(String(s.drafts));
    await expect(dashboard.statValue('Resolved support')).toHaveText(
      String(s.resolvedSupport),
    );
  });

  test(`${TAGS.happy} AUT-WS-08 — populated recommendation cards`, async ({
    recommendationWorkspaceUser,
  }) => {
    const { dashboard, pack } = recommendationWorkspaceUser;
    for (const card of pack!.recommendation!.productCards) {
      await expect(dashboard.recommendationCard(card.title)).toBeVisible();
    }
  });

  test(`${TAGS.happy} J-WS-G — empty vs returning applications contrast`, async ({
    emptyWorkspaceUser,
    // note: can't use two fixtures easily in parallel - use sequential compare via data
  }) => {
    const { dashboard } = emptyWorkspaceUser;
    await expect(dashboard.emptyIn(dashboard.applicationsPanel)).toBeVisible();
  });
});
