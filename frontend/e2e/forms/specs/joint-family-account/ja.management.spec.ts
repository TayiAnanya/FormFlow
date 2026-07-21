import { expect, test } from '../../../shared/fixtures';
import { TAGS } from '../../../shared/config/test-tags';
import {
  addAndFillJoint,
  fillPrimary,
  openJointForm,
  submitJoint,
} from '../../joint/workflows';
import { otherRow, siblingRow } from '../../joint/data';

/**
 * Landing + applicant lifecycle (AUT-JOINT-01).
 */
test.describe(`${TAGS.joint} Applicant management`, () => {
  test(`${TAGS.happy} — joint form lands with empty repeater`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await expect(host.title).toContainText('Joint / Family Account Builder');
    await expect(repeater.addButton).toBeVisible();
    expect(await repeater.count()).toBe(0);
  });

  test(`${TAGS.happy} AUT-JOINT-01 — add applicant creates Applicant 1`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { repeater } = await openJointForm(page);
    await repeater.addApplicant();
    expect(await repeater.count()).toBe(1);
    await expect(repeater.itemTitle(0)).toContainText('Applicant 1');
  });

  test(`${TAGS.happy} AUT-JOINT-01 — add then remove restores empty repeater`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { repeater } = await openJointForm(page);
    await repeater.addApplicant();
    await repeater.removeApplicant(0);
    expect(await repeater.count()).toBe(0);
    await expect(repeater.addButton).toBeVisible();
  });

  test(`${TAGS.happy} AUT-JOINT-01 — add two applicants shows Applicant 1 and 2`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { repeater } = await openJointForm(page);
    await repeater.addApplicant();
    await repeater.addApplicant();
    expect(await repeater.count()).toBe(2);
    await expect(repeater.itemTitle(0)).toContainText('Applicant 1');
    await expect(repeater.itemTitle(1)).toContainText('Applicant 2');
  });

  test(`${TAGS.boundary} AUT-JOINT-01 J19 — max 4 hides Add control`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { repeater } = await openJointForm(page);
    for (let i = 0; i < 4; i++) {
      await repeater.addApplicant();
    }
    expect(await repeater.count()).toBe(4);
    await expect(repeater.addButton).toHaveCount(0);
  });

  test(`${TAGS.happy} AUT-JOINT-01 — remove middle row re-indexes titles`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { repeater } = await openJointForm(page);
    await repeater.addApplicant();
    await repeater.addApplicant();
    await repeater.addApplicant();
    await repeater.removeApplicant(1);
    expect(await repeater.count()).toBe(2);
    await expect(repeater.itemTitle(0)).toContainText('Applicant 1');
    await expect(repeater.itemTitle(1)).toContainText('Applicant 2');
  });

  test(`${TAGS.happy} AUT-REN-06 — nested field id pattern operable`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { repeater } = await openJointForm(page);
    await repeater.addApplicant();
    const key = repeater.nestedKey(0, 'fullName');
    await expect(page.locator(`#${key}`)).toBeVisible();
    await repeater.fillRow(0, [
      { key: 'fullName', type: 'text', value: 'Nested Id User' },
    ]);
    await expect(page.locator(`#${key}`)).toHaveValue('Nested Id User');
  });

  test(`${TAGS.happy} — primary Residential Address field present`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host } = await openJointForm(page);
    await expect(host.form.field('address')).toBeVisible();
    await expect(page.getByText('Residential Address')).toBeVisible();
  });

  test(`${TAGS.happy} — zero joints remains valid (minItems 0)`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    expect(await repeater.count()).toBe(0);
    await submitJoint(host);
    await expect(host.applicationSavedBanner).toContainText('JOINT');
  });

  test(`${TAGS.happy} AUT-JOINT-01 — remove last joint keeps Add visible`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { repeater } = await openJointForm(page);
    await repeater.addApplicant();
    await repeater.addApplicant();
    await repeater.removeApplicant(1);
    await repeater.removeApplicant(0);
    expect(await repeater.count()).toBe(0);
    await expect(repeater.addButton).toBeVisible();
  });

  test(`${TAGS.happy} — filled sibling row submit JOINT*`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    await addAndFillJoint(repeater, siblingRow(1));
    await submitJoint(host);
    await expect(host.applicationSavedBanner).toContainText('JOINT');
  });

  test(`${TAGS.happy} — other relation row submits`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    await addAndFillJoint(repeater, otherRow(1));
    await submitJoint(host);
    await expect(host.form.submissionSuccess).toBeVisible();
  });
});
