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
  PRIMARY_AADHAAR,
  PRIMARY_DOB,
  PRIMARY_EMAIL,
  PRIMARY_FULL_NAME,
  PRIMARY_MOBILE,
  siblingRow,
} from '../../joint/data';

/**
 * Cross-applicant business rules (AUT-JOINT-05, J20).
 */
test.describe(`${TAGS.joint} Cross-applicant validation`, () => {
  test(`${TAGS.negative} AUT-JOINT-05 — joint id matches primary blocked`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    await repeater.addApplicant();
    await repeater.fillRow(0, [
      { key: 'fullName', type: 'text', value: 'Clone Primary' },
      { key: 'dateOfBirth', type: 'date', value: '1993-01-01' },
      {
        key: 'relation',
        type: 'dropdown',
        value: 'sibling',
        label: 'Sibling',
      },
      { key: 'idType', type: 'dropdown', value: 'aadhaar', label: 'Aadhaar' },
      { key: 'idNumber', type: 'text', value: PRIMARY_AADHAAR },
      { key: 'occupation', type: 'text', value: 'Clerk' },
    ]);
    await submitJoint(host);
    await expect(
      page.getByRole('alert').filter({
        hasText: CROSS_APPLICANT_MESSAGES.matchesPrimary,
      }),
    ).toBeVisible();
    await expect(host.form.submissionSuccess).toHaveCount(0);
  });

  test(`${TAGS.negative} AUT-JOINT-05 — duplicate joint identity blocked`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    const sharedId = '444444444444';
    await repeater.addApplicant();
    await repeater.fillRow(0, [
      { key: 'fullName', type: 'text', value: 'Joint One' },
      { key: 'dateOfBirth', type: 'date', value: '1990-01-01' },
      {
        key: 'relation',
        type: 'dropdown',
        value: 'sibling',
        label: 'Sibling',
      },
      { key: 'idType', type: 'dropdown', value: 'aadhaar', label: 'Aadhaar' },
      { key: 'idNumber', type: 'text', value: sharedId },
      { key: 'occupation', type: 'text', value: 'One' },
    ]);
    await repeater.addApplicant();
    await repeater.fillRow(1, [
      { key: 'fullName', type: 'text', value: 'Joint Two' },
      { key: 'dateOfBirth', type: 'date', value: '1991-01-01' },
      {
        key: 'relation',
        type: 'dropdown',
        value: 'other',
        label: 'Other',
      },
      { key: 'idType', type: 'dropdown', value: 'aadhaar', label: 'Aadhaar' },
      { key: 'idNumber', type: 'text', value: sharedId },
      { key: 'occupation', type: 'text', value: 'Two' },
    ]);
    await submitJoint(host);
    await expect(
      page.getByRole('alert').filter({
        hasText: CROSS_APPLICANT_MESSAGES.duplicateJoint,
      }).first(),
    ).toBeVisible();
  });

  test(`${TAGS.negative} — duplicate email across applicants blocked`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    await repeater.addApplicant();
    await repeater.fillRow(0, [
      { key: 'fullName', type: 'text', value: 'Email Twin' },
      { key: 'dateOfBirth', type: 'date', value: '1994-04-04' },
      {
        key: 'relation',
        type: 'dropdown',
        value: 'sibling',
        label: 'Sibling',
      },
      { key: 'idType', type: 'dropdown', value: 'pan', label: 'PAN' },
      { key: 'idNumber', type: 'text', value: 'ABCDE1234F' },
      { key: 'occupation', type: 'text', value: 'Analyst' },
      { key: 'email', type: 'text', value: PRIMARY_EMAIL },
    ]);
    await submitJoint(host);
    await expect(
      page.getByRole('alert').filter({
        hasText: CROSS_APPLICANT_MESSAGES.duplicateEmail,
      }),
    ).toBeVisible();
  });

  test(`${TAGS.negative} — duplicate mobile across applicants blocked`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    await repeater.addApplicant();
    await repeater.fillRow(0, [
      { key: 'fullName', type: 'text', value: 'Mobile Twin' },
      { key: 'dateOfBirth', type: 'date', value: '1994-05-05' },
      {
        key: 'relation',
        type: 'dropdown',
        value: 'sibling',
        label: 'Sibling',
      },
      { key: 'idType', type: 'dropdown', value: 'pan', label: 'PAN' },
      { key: 'idNumber', type: 'text', value: 'ZZZZZ9999Z' },
      { key: 'occupation', type: 'text', value: 'Analyst' },
      { key: 'mobile', type: 'text', value: PRIMARY_MOBILE },
    ]);
    await submitJoint(host);
    await expect(
      page.getByRole('alert').filter({
        hasText: CROSS_APPLICANT_MESSAGES.duplicateMobile,
      }),
    ).toBeVisible();
  });

  test(`${TAGS.negative} — identity fallback duplicate blocked`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    // Fallback applies when neither conflicting side has priority identity types.
    await repeater.addApplicant();
    await repeater.fillRow(0, [
      { key: 'fullName', type: 'text', value: 'Fallback Twin' },
      { key: 'dateOfBirth', type: 'date', value: '1990-01-01' },
      {
        key: 'relation',
        type: 'dropdown',
        value: 'sibling',
        label: 'Sibling',
      },
      {
        key: 'idType',
        type: 'dropdown',
        value: 'driving_licence',
        label: 'Driving Licence',
      },
      { key: 'idNumber', type: 'text', value: 'DL-ONE-111' },
      { key: 'occupation', type: 'text', value: 'Driver' },
      { key: 'mobile', type: 'text', value: '9555555555' },
    ]);
    await repeater.addApplicant();
    await repeater.fillRow(1, [
      { key: 'fullName', type: 'text', value: 'Fallback Twin' },
      { key: 'dateOfBirth', type: 'date', value: '1990-01-01' },
      {
        key: 'relation',
        type: 'dropdown',
        value: 'other',
        label: 'Other',
      },
      {
        key: 'idType',
        type: 'dropdown',
        value: 'driving_licence',
        label: 'Driving Licence',
      },
      { key: 'idNumber', type: 'text', value: 'DL-TWO-222' },
      { key: 'occupation', type: 'text', value: 'Driver' },
      { key: 'mobile', type: 'text', value: '9555555555' },
    ]);
    await submitJoint(host);
    await expect(
      page
        .getByRole('alert')
        .filter({
          hasText: CROSS_APPLICANT_MESSAGES.identityFallback,
        })
        .first(),
    ).toBeVisible();
  });

  test(`${TAGS.happy} J20 — duplicate recovery then submit`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    await repeater.addApplicant();
    await repeater.fillRow(0, [
      { key: 'fullName', type: 'text', value: 'Recover Applicant' },
      { key: 'dateOfBirth', type: 'date', value: '1995-09-09' },
      {
        key: 'relation',
        type: 'dropdown',
        value: 'sibling',
        label: 'Sibling',
      },
      { key: 'idType', type: 'dropdown', value: 'aadhaar', label: 'Aadhaar' },
      { key: 'idNumber', type: 'text', value: PRIMARY_AADHAAR },
      { key: 'occupation', type: 'text', value: 'Recover' },
    ]);
    await submitJoint(host);
    await expect(
      page.getByRole('alert').filter({
        hasText: CROSS_APPLICANT_MESSAGES.matchesPrimary,
      }),
    ).toBeVisible();
    await repeater.fillRow(0, [
      { key: 'idNumber', type: 'text', value: '555555555555' },
    ]);
    await submitJoint(host);
    await expect(host.applicationSavedBanner).toContainText('JOINT');
  });

  test(`${TAGS.negative} — incomplete joint row shows required alerts`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    await repeater.addApplicant();
    await submitJoint(host);
    await expect(page.getByRole('alert').first()).toBeVisible();
    await expect(host.form.submissionSuccess).toHaveCount(0);
  });

  test(`${TAGS.negative} — relation required on joint row`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    await repeater.addApplicant();
    await repeater.fillRow(0, [
      { key: 'fullName', type: 'text', value: 'No Relation' },
      { key: 'dateOfBirth', type: 'date', value: '1990-01-01' },
      { key: 'idType', type: 'dropdown', value: 'aadhaar', label: 'Aadhaar' },
      { key: 'idNumber', type: 'text', value: '766666666666' },
      { key: 'occupation', type: 'text', value: 'Temp' },
    ]);
    await submitJoint(host);
    await expect(
      page.getByRole('alert').filter({
        hasText: CROSS_APPLICANT_MESSAGES.relationRequired,
      }),
    ).toBeVisible();
  });

  test(`${TAGS.happy} — optional joint email/mobile empty still submits`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    const pack = siblingRow(8);
    const steps = pack.steps.filter(
      (s) => s.key !== 'email' && s.key !== 'mobile',
    );
    await addAndFillJoint(repeater, { ...pack, steps });
    await submitJoint(host);
    await expect(host.applicationSavedBanner).toContainText('JOINT');
  });

  test(`${TAGS.happy} — distinct pan identities allow multi-joint submit`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    await addAndFillJoint(repeater, siblingRow(1));
    await addAndFillJoint(repeater, siblingRow(2));
    await submitJoint(host);
    await expect(host.applicationSavedBanner).toContainText('JOINT');
  });
});
