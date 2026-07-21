import { expect, test } from '../../../shared/fixtures';
import { TAGS } from '../../../shared/config/test-tags';
import { fillFormFromPack, openFormReady, submitForm } from '../../workflows';
import { accountOpeningHappy } from '../../data/happy.packs';

/**
 * Field-type behavioural matrix via DynamicForm API (AUT-REN-02).
 * Not one test per schema field — type families parameterized lightly.
 */
test.describe(`${TAGS.forms} ${TAGS.renderer} Field type matrix`, () => {
  test(`${TAGS.happy} AUT-REN-02 — text field accepts and retains input`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await openFormReady(page, 'account-opening');
    await fillFormFromPack(host, [
      { key: 'fullName', type: 'text', value: 'Field Type User' },
    ]);
    await expect(host.form.field('fullName')).toHaveValue('Field Type User');
  });

  test(`${TAGS.happy} AUT-REN-02 — email-shaped text accepts valid email`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await openFormReady(page, 'account-opening');
    await fillFormFromPack(host, [
      { key: 'email', type: 'text', value: 'type.matrix@example.com' },
    ]);
    await expect(host.form.field('email')).toHaveValue(
      'type.matrix@example.com',
    );
  });

  test(`${TAGS.happy} AUT-REN-02 — date picker accepts ISO date`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await openFormReady(page, 'account-opening');
    await fillFormFromPack(host, [
      { key: 'dateOfBirth', type: 'date', value: '1990-01-15' },
    ]);
    await expect(host.form.field('dateOfBirth')).toHaveValue('1990-01-15');
  });

  test(`${TAGS.happy} AUT-REN-02 — dropdown selection sticks`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await openFormReady(page, 'account-opening');
    await fillFormFromPack(host, [
      {
        key: 'accountType',
        type: 'dropdown',
        value: 'current',
        label: 'Current',
      },
    ]);
    await expect(
      page.locator('p-select').filter({ has: page.locator('#accountType') }),
    ).toContainText('Current');
  });

  test(`${TAGS.happy} AUT-REN-02 — multiselect accepts services chips`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await openFormReady(page, 'account-opening');
    await fillFormFromPack(host, [
      {
        key: 'services',
        type: 'multiselect',
        values: ['internet_banking', 'debit_card'],
        labels: ['Internet Banking', 'Debit Card'],
      },
    ]);
    await expect(page.locator('p-multiselect')).toContainText('Internet Banking');
  });

  test(`${TAGS.happy} AUT-REN-02 — checkbox consent toggles`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await openFormReady(page, 'account-opening');
    await fillFormFromPack(host, [
      { key: 'termsAccepted', type: 'checkbox', value: true },
    ]);
    await expect(host.form.field('termsAccepted')).toBeChecked();
  });

  test(`${TAGS.happy} AUT-REN-02 — textarea accepts long purpose`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await openFormReady(page, 'loan-inquiry');
    const text = 'Renovating kitchen and living room with eco materials';
    await fillFormFromPack(host, [
      { key: 'purpose', type: 'textarea', value: text },
    ]);
    await expect(page.locator('textarea#purpose')).toHaveValue(text);
  });

  test(`${TAGS.happy} AUT-REN-02 — mobile text field accepts valid number`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await openFormReady(page, 'smart-credit-card');
    await fillFormFromPack(host, [
      { key: 'mobileNumber', type: 'text', value: '9876543210' },
    ]);
    await expect(host.form.field('mobileNumber')).toHaveValue('9876543210');
  });

  test(`${TAGS.happy} AUT-REN-02 — account-opening with multiselect still submits`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const pack = accountOpeningHappy([
      {
        key: 'services',
        type: 'multiselect',
        values: ['internet_banking'],
        labels: ['Internet Banking'],
      },
    ]);
    const host = await openFormReady(page, pack.scenarioId);
    await fillFormFromPack(host, pack.steps);
    await submitForm(host, pack.submitLabel);
    await expect(host.form.submissionSuccess).toBeVisible();
  });

  test(`${TAGS.happy} AUT-REN-02 — submit control present on account-opening and loan-inquiry`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    for (const scenarioId of ['account-opening', 'loan-inquiry'] as const) {
      const host = await openFormReady(page, scenarioId);
      await expect(
        page.locator('.formflow-submit-btn, button.formflow-submit-btn').first(),
      ).toBeVisible();
      await expect(host.form.root).toBeVisible();
    }
  });
});
