import { TAGS } from '../../shared/config/test-tags';
import { test, expect } from '../../shared/fixtures';
import { PortalShellPage } from '../../shared/pages/portal-shell.page';

test.describe(`${TAGS.workspace} Landing and greeting`, () => {
  test(`${TAGS.happy} AUT-WS-01 — dashboard hero loads`, async ({
    emptyWorkspaceUser,
  }) => {
    const { dashboard } = emptyWorkspaceUser;
    await expect(dashboard.hero).toBeVisible();
    await expect(dashboard.heroTitle).toHaveText('FormFlow');
    await expect(dashboard.page.getByText(/Your banking workspace/i)).toBeVisible();
  });

  test(`${TAGS.happy} AUT-WS-02 — shell greeting uses first name`, async ({
    returningWorkspaceUser,
  }) => {
    const { page, user } = returningWorkspaceUser;
    const first = user.fullName.split(/\s+/)[0];
    await expect(page.locator('.portal-welcome')).toContainText(first);
  });

  test(`${TAGS.happy} AUT-WS-01 — My Workspace region labelled`, async ({
    emptyWorkspaceUser,
  }) => {
    const { dashboard } = emptyWorkspaceUser;
    await expect(dashboard.page.locator('#my-workspace-title')).toHaveText(
      /My Workspace/i,
    );
  });

  test(`${TAGS.happy} — logout available from workspace shell`, async ({
    emptyWorkspaceUser,
  }) => {
    const shell = new PortalShellPage(emptyWorkspaceUser.page);
    await expect(shell.logoutButton).toBeVisible();
  });
});
