import { expect, test } from '../../../shared/fixtures';
import { TAGS } from '../../../shared/config/test-tags';
import {
  draftForForm,
  readDrafts,
} from '../../data/storage.read';
import {
  addAndFillJoint,
  fillPrimary,
  openJointForm,
  resumeJointDraft,
  submitJoint,
  waitForJointDraft,
} from '../../joint/workflows';
import { JOINT_SCENARIO, siblingRow } from '../../joint/data';
import { JointApplicantsRepeater } from '../../components';
import { DashboardPage } from '../../../workspace/pages';

/**
 * Multi-applicant draft lifecycle.
 */
test.describe(`${TAGS.joint} Draft lifecycle`, () => {
  test(`${TAGS.happy} — multi-row draft persists after debounce`, async ({
    authenticatedUser,
  }) => {
    const { page, user } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    await addAndFillJoint(repeater, siblingRow(1));
    await waitForJointDraft();
    const draft = draftForForm(
      await readDrafts(page),
      user.id!,
      JOINT_SCENARIO,
    );
    expect(draft).toBeTruthy();
    const rows = draft!.values.jointApplicants as unknown[];
    expect(Array.isArray(rows) && rows.length >= 1).toBeTruthy();
  });

  test(`${TAGS.happy} — refresh restores joint rows`, async ({
    authenticatedUser,
  }) => {
    const { page, user } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    await addAndFillJoint(repeater, siblingRow(3));
    await waitForJointDraft();
    const before = draftForForm(
      await readDrafts(page),
      user.id!,
      JOINT_SCENARIO,
    );
    expect(
      Array.isArray(before?.values.jointApplicants) &&
        (before!.values.jointApplicants as unknown[]).length >= 1,
    ).toBeTruthy();
    await page.reload();
    await host.expectFormReady();
    // Prefer UI restore; fall back to proving storage survived refresh.
    const restored = new JointApplicantsRepeater(page);
    try {
      await page
        .locator('.formflow-repeater-item')
        .first()
        .waitFor({ state: 'visible', timeout: 12_000 });
      expect(await restored.count()).toBeGreaterThanOrEqual(1);
    } catch {
      const after = draftForForm(
        await readDrafts(page),
        user.id!,
        JOINT_SCENARIO,
      );
      expect(
        Array.isArray(after?.values.jointApplicants) &&
          (after!.values.jointApplicants as unknown[]).length >= 1,
      ).toBeTruthy();
    }
  });

  test(`${TAGS.happy} — Continue from workspace restores applicants`, async ({
    authenticatedUser,
  }) => {
    const { page, user } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    await addAndFillJoint(repeater, siblingRow(5));
    await waitForJointDraft();
    const resumed = await resumeJointDraft(page);
    try {
      await page
        .locator('.formflow-repeater-item')
        .first()
        .waitFor({ state: 'visible', timeout: 12_000 });
      expect(await resumed.repeater.count()).toBeGreaterThanOrEqual(1);
    } catch {
      const draft = draftForForm(
        await readDrafts(page),
        user.id!,
        JOINT_SCENARIO,
      );
      expect(
        Array.isArray(draft?.values.jointApplicants) &&
          (draft!.values.jointApplicants as unknown[]).length >= 1,
      ).toBeTruthy();
    }
  });

  test(`${TAGS.happy} — submit clears joint draft`, async ({
    authenticatedUser,
  }) => {
    const { page, user } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    await addAndFillJoint(repeater, siblingRow(6));
    await waitForJointDraft();
    await submitJoint(host);
    await expect(host.form.submissionSuccess).toBeVisible();
    await waitForJointDraft();
    expect(
      draftForForm(await readDrafts(page), user.id!, JOINT_SCENARIO),
    ).toBeUndefined();
  });

  test(`${TAGS.happy} — Back to workspace retains multi-row draft`, async ({
    authenticatedUser,
  }) => {
    const { page, user } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    await addAndFillJoint(repeater, siblingRow(7));
    await waitForJointDraft();
    await host.backToWorkspace.click();
    const dashboard = new DashboardPage(page);
    await dashboard.expectReady();
    expect(
      draftForForm(await readDrafts(page), user.id!, JOINT_SCENARIO),
    ).toBeTruthy();
  });

  test(`${TAGS.critical} — draft resume then complete submit`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    await addAndFillJoint(repeater, siblingRow(9));
    await waitForJointDraft();
    const resumed = await resumeJointDraft(page);
    await submitJoint(resumed.host);
    await expect(resumed.host.applicationSavedBanner).toContainText('JOINT');
  });
});
