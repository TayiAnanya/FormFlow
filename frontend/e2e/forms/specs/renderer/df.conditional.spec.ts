import { expect, test } from '../../../shared/fixtures';
import { TAGS } from '../../../shared/config/test-tags';
import { CONDITIONAL_ROWS } from '../../data';
import {
  fillFormFromPack,
  openFormReady,
  submitForm,
} from '../../workflows';
import {
  customerSupportHappy,
  smartCreditCardHappy,
} from '../../data/happy.packs';

/**
 * Conditional rendering + hidden/readonly (AUT-FORM-07/08, AUT-REN-03).
 */
test.describe(`${TAGS.forms} ${TAGS.renderer} Conditional and visibility`, () => {
  for (const row of CONDITIONAL_ROWS) {
    test(`${TAGS.happy} ${row.id} — ${row.description}`, async ({
      authenticatedUser,
    }) => {
      const { page } = authenticatedUser;
      const host = await openFormReady(page, row.scenarioId);
      await fillFormFromPack(host, row.setupSteps);
      for (const key of row.visibleKeys) {
        await expect(host.form.field(key)).toBeVisible();
      }
      for (const key of row.hiddenKeys) {
        await expect(host.form.field(key)).toHaveCount(0);
      }
    });
  }

  test(`${TAGS.happy} AUT-REN-03 — hidden internalRiskScore never rendered`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await openFormReady(page, 'smart-credit-card');
    await expect(host.form.field('internalRiskScore')).toHaveCount(0);
  });

  test(`${TAGS.happy} AUT-REN-02 — readonly applicationNumber not editable`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await openFormReady(page, 'smart-credit-card');
    const appNo = host.form.field('applicationNumber');
    await expect(appNo).toBeVisible();
    await expect(appNo).toHaveAttribute('readonly', '');
  });

  test(`${TAGS.happy} AUT-FORM-07 — credit card student branch happy submit`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const pack = smartCreditCardHappy([
      {
        key: 'employmentStatus',
        type: 'dropdown',
        value: 'student',
        label: 'Student',
      },
    ]);
    // Replace default salaried employment with student — rebuild pack steps carefully
    const steps = pack.steps.filter((s) => s.key !== 'employmentStatus');
    steps.push({
      key: 'employmentStatus',
      type: 'dropdown',
      value: 'student',
      label: 'Student',
    });
    const host = await openFormReady(page, 'smart-credit-card');
    await fillFormFromPack(host, steps);
    await expect(host.form.field('collegeName')).toBeVisible();
    await submitForm(host, pack.submitLabel);
    await expect(host.form.submissionSuccess).toBeVisible();
    await expect(host.applicationSavedBanner).toContainText('CARD');
  });

  test(`${TAGS.happy} AUT-FORM-08 — support raise_dispute path submits SUP*`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const pack = customerSupportHappy();
    const host = await openFormReady(page, pack.scenarioId);
    await fillFormFromPack(host, pack.steps);
    await expect(host.form.field('disputeAmount')).toBeVisible();
    await submitForm(host, pack.submitLabel);
    await expect(host.form.submissionSuccess).toBeVisible();
    await expect(host.applicationSavedBanner).toContainText('SUP');
  });

  test(`${TAGS.happy} AUT-REN-03 — switching employment hides previous branch`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await openFormReady(page, 'smart-credit-card');
    await fillFormFromPack(host, [
      {
        key: 'employmentStatus',
        type: 'dropdown',
        value: 'student',
        label: 'Student',
      },
    ]);
    await expect(host.form.field('collegeName')).toBeVisible();
    await fillFormFromPack(host, [
      {
        key: 'employmentStatus',
        type: 'dropdown',
        value: 'self_employed',
        label: 'Self Employed',
      },
    ]);
    await expect(host.form.field('collegeName')).toHaveCount(0);
    await expect(host.form.field('businessName')).toBeVisible();
  });
});
