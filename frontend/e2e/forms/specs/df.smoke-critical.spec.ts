import { expect, test } from '../../shared/fixtures';
import { TAGS } from '../../shared/config/test-tags';
import {
  accountOpeningHappy,
  loanInquiryHappy,
  smartCreditCardHappy,
} from '../data';
import {
  completeHappySubmit,
  fillFormFromPack,
  openFormReady,
  resumeDraftFromWorkspace,
  submitForm,
  waitForDraftPersistence,
} from '../workflows';

/**
 * Smoke + critical PR-gate slices for Dynamic Forms.
 * Schema readiness for all scenarios lives in df.schema — not duplicated here.
 */
test.describe(`${TAGS.forms} Smoke and critical`, () => {
  test(`${TAGS.smoke} ${TAGS.happy} — account-opening submit smoke`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await completeHappySubmit(page, accountOpeningHappy());
    await expect(host.form.submissionSuccess).toBeVisible();
    await expect(host.applicationSavedBanner).toContainText('ACC');
  });

  test(`${TAGS.smoke} ${TAGS.happy} — schema load smoke for loan-inquiry`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await openFormReady(page, 'loan-inquiry');
    await expect(host.schemaSuccessMessage).toBeVisible();
  });

  test(`${TAGS.critical} ${TAGS.happy} J-DF-J — resume draft then submit loan`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const pack = loanInquiryHappy();
    let host = await openFormReady(page, pack.scenarioId);
    await fillFormFromPack(host, [
      { key: 'applicantName', type: 'text', value: 'Smoke Resume' },
    ]);
    await waitForDraftPersistence();
    host = await resumeDraftFromWorkspace(page, pack.title);
    await fillFormFromPack(host, pack.steps);
    await submitForm(host, pack.submitLabel);
    await expect(host.applicationSavedBanner).toContainText('LOAN');
  });

  test(`${TAGS.critical} ${TAGS.happy} — credit card conditional critical path`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await completeHappySubmit(page, smartCreditCardHappy());
    await expect(host.applicationSavedBanner).toContainText('CARD');
  });
});
