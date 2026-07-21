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
import {
  CROSS_APPLICANT_MESSAGES,
  maxFourRows,
  otherRow,
  PRIMARY_AADHAAR,
  siblingRow,
  spouseRow,
} from '../../joint/data';
import { ApplicationDetailPage, DashboardPage } from '../../../workspace/pages';

/**
 * End-to-end joint journeys (J07/J19/J20) — relation submits live in conditionals.
 */
test.describe(`${TAGS.joint} ${TAGS.journey} User journeys`, () => {
  test(`${TAGS.happy} ${TAGS.smoke} J07 AUT-JOINT-06 — multi-applicant happy`, async ({
    authenticatedUser,
  }) => {
    // Multi-row PrimeNG fills are slower on Firefox/WebKit than Chromium.
    test.setTimeout(90_000);
    const { page } = authenticatedUser;
    const host = await completeMultiApplicantSubmit(page, [
      siblingRow(1),
      otherRow(2),
    ]);
    await expect(host.applicationSavedBanner).toContainText('JOINT');
    await expect(host.form.submissionSuccess).toBeVisible();
  });

  test(`${TAGS.happy} — spouse + sibling multi journey`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await completeMultiApplicantSubmit(page, [
      spouseRow(1),
      siblingRow(2),
    ]);
    await expect(host.applicationSavedBanner).toContainText('JOINT');
  });

  test(`${TAGS.boundary} ${TAGS.critical} J19 — max four applicants submit`, async ({
    authenticatedUser,
  }) => {
    test.setTimeout(120_000);
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    for (const row of maxFourRows()) {
      await addAndFillJoint(repeater, row);
    }
    expect(await repeater.count()).toBe(4);
    await expect(repeater.addButton).toHaveCount(0);
    await submitJoint(host);
    await expect(host.applicationSavedBanner).toContainText('JOINT');
  });

  test(`${TAGS.happy} J-JA-H — remove applicant then submit remaining`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    await addAndFillJoint(repeater, siblingRow(1));
    await addAndFillJoint(repeater, siblingRow(2));
    await addAndFillJoint(repeater, siblingRow(3));
    await repeater.removeApplicant(1);
    expect(await repeater.count()).toBe(2);
    await submitJoint(host);
    await expect(host.applicationSavedBanner).toContainText('JOINT');
  });

  test(`${TAGS.happy} — submit then View application`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await completeMultiApplicantSubmit(page, [siblingRow(4)]);
    await host.viewApplication.click();
    const detail = new ApplicationDetailPage(page);
    await detail.expectReady();
    await expect(detail.applicationId).toContainText('JOINT');
  });

  test(`${TAGS.negative} J20 — duplicate blocked then recover in journey`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    await repeater.addApplicant();
    await repeater.fillRow(0, [
      { key: 'fullName', type: 'text', value: 'Journey Dup' },
      { key: 'dateOfBirth', type: 'date', value: '1992-02-02' },
      {
        key: 'relation',
        type: 'dropdown',
        value: 'sibling',
        label: 'Sibling',
      },
      { key: 'idType', type: 'dropdown', value: 'aadhaar', label: 'Aadhaar' },
      { key: 'idNumber', type: 'text', value: PRIMARY_AADHAAR },
      { key: 'occupation', type: 'text', value: 'Temp' },
    ]);
    await submitJoint(host);
    await expect(
      page.getByRole('alert').filter({
        hasText: CROSS_APPLICANT_MESSAGES.matchesPrimary,
      }),
    ).toBeVisible();
    await repeater.fillRow(0, [
      { key: 'idNumber', type: 'text', value: '888888888888' },
    ]);
    await submitJoint(host);
    await expect(host.applicationSavedBanner).toContainText('JOINT');
  });

  test(`${TAGS.happy} — draft pause mid multi-applicant then finish`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { host, repeater } = await openJointForm(page);
    await fillPrimary(host);
    await addAndFillJoint(repeater, siblingRow(1));
    await waitForJointDraft();
    await host.backToWorkspace.click();
    const resumed = await resumeJointDraft(page);
    await addAndFillJoint(resumed.repeater, siblingRow(2));
    await submitJoint(resumed.host);
    await expect(resumed.host.applicationSavedBanner).toContainText('JOINT');
  });
});
