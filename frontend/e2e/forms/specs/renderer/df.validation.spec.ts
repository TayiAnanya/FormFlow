import { expect, test } from '../../../shared/fixtures';
import { TAGS } from '../../../shared/config/test-tags';
import { VALIDATION_ROWS } from '../../data';
import { fillFormFromPack, openFormReady, submitForm } from '../../workflows';

/**
 * Parameterized validation / boundary matrix (AUT-FORM-06, AUT-REN-04).
 */
test.describe(`${TAGS.forms} ${TAGS.renderer} Validation matrix`, () => {
  for (const row of VALIDATION_ROWS) {
    test(`${TAGS.negative} ${TAGS.boundary} ${row.id} — ${row.description}`, async ({
      authenticatedUser,
    }) => {
      const { page } = authenticatedUser;
      const host = await openFormReady(page, row.scenarioId);
      // Profile hydration can fill name/email/mobile — clear targets under test.
      await host.form.clearKeys([
        'fullName',
        'applicantName',
        'customerName',
        'email',
        'mobileNumber',
        'mobile',
      ]);
      await fillFormFromPack(host, row.setupSteps);
      // Ensure the asserted field stays in the intended invalid state.
      if (row.setupSteps.every((s) => s.key !== row.errorField)) {
        if (
          row.errorField === 'termsAccepted' ||
          row.errorField === 'declarationAccepted' ||
          row.errorField === 'consentToContact'
        ) {
          await host.form.ensureUnchecked(row.errorField);
        } else if (
          row.errorField === 'fullName' ||
          row.errorField === 'applicantName' ||
          row.errorField === 'mobileNumber' ||
          row.errorField === 'email'
        ) {
          await host.form.clearText(row.errorField);
        }
      }
      await submitForm(host, row.submitLabel);
      await expect(
        page.getByRole('alert').filter({ hasText: row.expectedMessage }),
      ).toBeVisible();
      await expect(host.form.submissionSuccess).toHaveCount(0);
      await expect(host.applicationSavedBanner).toHaveCount(0);
    });
  }

  test(`${TAGS.happy} V-OPT — optional services empty still submits account-opening`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const { accountOpeningHappy } = await import('../../data/happy.packs');
    const pack = accountOpeningHappy();
    const host = await openFormReady(page, pack.scenarioId);
    await fillFormFromPack(host, pack.steps);
    await submitForm(host, pack.submitLabel);
    await expect(host.form.submissionSuccess).toBeVisible();
  });

  test(`${TAGS.negative} AUT-FORM-06 — empty account-opening submit shows multiple required alerts`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await openFormReady(page, 'account-opening');
    await host.form.clearKeys(['fullName', 'email']);
    await submitForm(host, 'Submit Application');
    await expect(page.getByRole('alert')).not.toHaveCount(0);
    await expect(host.form.submissionSuccess).toHaveCount(0);
  });
});
