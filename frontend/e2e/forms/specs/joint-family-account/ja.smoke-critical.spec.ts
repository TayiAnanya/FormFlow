import { expect, test } from '../../../shared/fixtures';
import { TAGS } from '../../../shared/config/test-tags';
import {
  addAndFillJoint,
  completeMultiApplicantSubmit,
  fillPrimary,
  openJointForm,
  resumeJointDraft,
  submitJoint,
  waitForJointDraft,
} from '../../joint/workflows';
import { maxFourRows, siblingRow } from '../../joint/data';

/**
 * Smoke + critical PR-gate slices for Joint Account.
 */
test.describe(`${TAGS.joint} Smoke and critical`, () => {
  test(`${TAGS.smoke} ${TAGS.happy} — joint landing smoke`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await expect(host.form.root).toBeVisible();
    await expect(repeater.addButton).toBeVisible();
  });

  test(`${TAGS.smoke} ${TAGS.happy} — primary plus one joint submit smoke`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await completeMultiApplicantSubmit(page, [siblingRow(1)]);
    await expect(host.applicationSavedBanner).toContainText('JOINT');
  });

  test(`${TAGS.critical} ${TAGS.happy} — resume draft then submit critical`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    await addAndFillJoint(repeater, siblingRow(2));
    await waitForJointDraft();
    const resumed = await resumeJointDraft(page);
    await submitJoint(resumed.host);
    await expect(resumed.host.applicationSavedBanner).toContainText('JOINT');
  });

  test(`${TAGS.critical} ${TAGS.boundary} J19 — max applicants critical path`, async ({
    authenticatedUser,
  }) => {
    test.setTimeout(120_000);
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    for (const row of maxFourRows()) {
      await addAndFillJoint(repeater, row);
    }
    await expect(repeater.addButton).toHaveCount(0);
    await submitJoint(host);
    await expect(host.applicationSavedBanner).toContainText('JOINT');
  });

  test(`${TAGS.smoke} ${TAGS.happy} — add control present until max`, async ({
    authenticatedUser,
  }) => {
    test.setTimeout(60_000);
    const { page } = authenticatedUser;
    const { repeater } = await openJointForm(page);
    await repeater.addApplicant();
    await expect(repeater.addButton).toBeVisible();
    await repeater.addApplicant();
    await repeater.addApplicant();
    await expect(repeater.addButton).toBeVisible();
    await repeater.addApplicant();
    await expect(repeater.addButton).toHaveCount(0);
  });
});
