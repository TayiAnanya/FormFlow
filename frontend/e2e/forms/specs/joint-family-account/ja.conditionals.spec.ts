import { expect, test } from '../../../shared/fixtures';
import { TAGS } from '../../../shared/config/test-tags';
import {
  addAndFillJoint,
  fillPrimary,
  openJointForm,
  submitJoint,
} from '../../joint/workflows';
import {
  CROSS_APPLICANT_MESSAGES,
  minorRow,
} from '../../joint/data';

/**
 * Relation-driven conditionals (AUT-JOINT-02/03/04).
 */
test.describe(`${TAGS.joint} Relation conditionals`, () => {
  test(`${TAGS.happy} AUT-JOINT-02 — minor shows guardian fields`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { repeater } = await openJointForm(page);
    await repeater.addApplicant();
    await repeater.fillRow(0, [
      {
        key: 'relation',
        type: 'dropdown',
        value: 'minor',
        label: 'Minor',
      },
    ]);
    await expect(
      page.locator(`#${repeater.nestedKey(0, 'guardianName')}`),
    ).toBeVisible();
    await expect(
      page.locator(`#${repeater.nestedKey(0, 'guardianContact')}`),
    ).toBeVisible();
    await expect(
      page.locator(`#${repeater.nestedKey(0, 'guardianId')}`),
    ).toBeVisible();
  });

  test(`${TAGS.happy} AUT-JOINT-03 — spouse shows joint signature`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { repeater } = await openJointForm(page);
    await repeater.addApplicant();
    await repeater.fillRow(0, [
      {
        key: 'relation',
        type: 'dropdown',
        value: 'spouse',
        label: 'Spouse',
      },
    ]);
    await expect(
      page.locator(`#${repeater.nestedKey(0, 'jointSignature')}`),
    ).toBeVisible();
  });

  test(`${TAGS.happy} AUT-JOINT-04 — parent shows relationship proof file`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { repeater } = await openJointForm(page);
    await repeater.addApplicant();
    await repeater.fillRow(0, [
      {
        key: 'relation',
        type: 'dropdown',
        value: 'parent',
        label: 'Parent',
      },
    ]);
    await expect(
      page.locator(
        `input#${repeater.nestedKey(0, 'relationshipProof')}[type="file"]`,
      ),
    ).toBeVisible();
  });

  test(`${TAGS.happy} — switching minor to spouse hides guardians`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { repeater } = await openJointForm(page);
    await repeater.addApplicant();
    await repeater.fillRow(0, [
      { key: 'relation', type: 'dropdown', value: 'minor', label: 'Minor' },
    ]);
    await expect(
      page.locator(`#${repeater.nestedKey(0, 'guardianName')}`),
    ).toBeVisible();
    await repeater.fillRow(0, [
      { key: 'relation', type: 'dropdown', value: 'spouse', label: 'Spouse' },
    ]);
    await expect(
      page.locator(`#${repeater.nestedKey(0, 'guardianName')}`),
    ).toHaveCount(0);
    await expect(
      page.locator(`#${repeater.nestedKey(0, 'jointSignature')}`),
    ).toBeVisible();
  });

  test(`${TAGS.negative} AUT-JOINT-02 — minor without guardian blocked`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    await repeater.addApplicant();
    await repeater.fillRow(0, [
      { key: 'fullName', type: 'text', value: 'Minor No Guard' },
      { key: 'dateOfBirth', type: 'date', value: '2014-05-01' },
      { key: 'relation', type: 'dropdown', value: 'minor', label: 'Minor' },
      { key: 'idType', type: 'dropdown', value: 'aadhaar', label: 'Aadhaar' },
      { key: 'idNumber', type: 'text', value: '711111111111' },
      { key: 'occupation', type: 'text', value: 'Student' },
    ]);
    await submitJoint(host);
    await expect(
      page.getByRole('alert').filter({
        hasText: CROSS_APPLICANT_MESSAGES.guardianName,
      }),
    ).toBeVisible();
    await expect(host.form.submissionSuccess).toHaveCount(0);
  });

  test(`${TAGS.negative} AUT-JOINT-03 — spouse without signature blocked`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    await repeater.addApplicant();
    await repeater.fillRow(0, [
      { key: 'fullName', type: 'text', value: 'Spouse No Sign' },
      { key: 'dateOfBirth', type: 'date', value: '1992-02-02' },
      { key: 'relation', type: 'dropdown', value: 'spouse', label: 'Spouse' },
      { key: 'idType', type: 'dropdown', value: 'aadhaar', label: 'Aadhaar' },
      { key: 'idNumber', type: 'text', value: '722222222222' },
      { key: 'occupation', type: 'text', value: 'Artist' },
    ]);
    await submitJoint(host);
    await expect(
      page.getByRole('alert').filter({
        hasText: CROSS_APPLICANT_MESSAGES.spouseSignature,
      }),
    ).toBeVisible();
  });

  test(`${TAGS.negative} AUT-JOINT-04 — parent without file blocked`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    await repeater.addApplicant();
    await repeater.fillRow(0, [
      { key: 'fullName', type: 'text', value: 'Parent No File' },
      { key: 'dateOfBirth', type: 'date', value: '1960-01-01' },
      { key: 'relation', type: 'dropdown', value: 'parent', label: 'Parent' },
      { key: 'idType', type: 'dropdown', value: 'aadhaar', label: 'Aadhaar' },
      { key: 'idNumber', type: 'text', value: '733333333333' },
      { key: 'occupation', type: 'text', value: 'Retired' },
    ]);
    await submitJoint(host);
    await expect(
      page.getByRole('alert').filter({
        hasText: CROSS_APPLICANT_MESSAGES.parentProof,
      }),
    ).toBeVisible();
  });

  test(`${TAGS.happy} AUT-JOINT-02 J08 — minor path submits JOINT*`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    await addAndFillJoint(repeater, minorRow(1));
    await submitJoint(host);
    await expect(host.applicationSavedBanner).toContainText('JOINT');
  });

  test(`${TAGS.happy} — sibling has no guardian or signature fields`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { repeater } = await openJointForm(page);
    await repeater.addApplicant();
    await repeater.fillRow(0, [
      {
        key: 'relation',
        type: 'dropdown',
        value: 'sibling',
        label: 'Sibling',
      },
    ]);
    await expect(
      page.locator(`#${repeater.nestedKey(0, 'guardianName')}`),
    ).toHaveCount(0);
    await expect(
      page.locator(`#${repeater.nestedKey(0, 'jointSignature')}`),
    ).toHaveCount(0);
  });
});
