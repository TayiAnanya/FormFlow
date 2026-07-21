import { expect, test } from '../../../shared/fixtures';
import { TAGS } from '../../../shared/config/test-tags';
import { isoDateYearsAgo } from '../../../shared/utils/date.helper';
import {
  accountOpeningHappy,
  customerSupportHappy,
  jointFamilyHappy,
  loanInquiryHappy,
  smartCreditCardHappy,
} from '../../data/happy.packs';
import { readApplications } from '../../data/storage.read';
import {
  fillFormFromPack,
  openFormReady,
  submitForm,
} from '../../workflows';

/**
 * Per-scenario behavioural extras — parameterized where possible.
 */
test.describe(`${TAGS.forms} Scenario behaviours`, () => {
  test(`${TAGS.boundary} — age exactly 18 accepts on account-opening`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const dob = isoDateYearsAgo(18);
    const pack = accountOpeningHappy();
    const steps = pack.steps.filter((s) => s.key !== 'dateOfBirth');
    steps.push({ key: 'dateOfBirth', type: 'date', value: dob });
    const host = await openFormReady(page, 'account-opening');
    await fillFormFromPack(host, steps);
    await submitForm(host, pack.submitLabel);
    await expect(host.form.submissionSuccess).toBeVisible();
  });

  test(`${TAGS.boundary} — age 17 rejected on account-opening`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const dob = isoDateYearsAgo(17);
    const host = await openFormReady(page, 'account-opening');
    await fillFormFromPack(host, [
      { key: 'fullName', type: 'text', value: 'Teen User' },
      { key: 'email', type: 'text', value: 'teen@example.com' },
      { key: 'dateOfBirth', type: 'date', value: dob },
      {
        key: 'accountType',
        type: 'dropdown',
        value: 'savings',
        label: 'Savings',
      },
      { key: 'termsAccepted', type: 'checkbox', value: true },
    ]);
    await submitForm(host, 'Submit Application');
    await expect(host.form.fieldError('dateOfBirth')).toContainText(
      'Applicant must be at least 18 years old.',
    );
  });

  test(`${TAGS.happy} — loan inquiry home type submits`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const steps = loanInquiryHappy().steps.filter((s) => s.key !== 'loanType');
    steps.splice(1, 0, {
      key: 'loanType',
      type: 'dropdown',
      value: 'home',
      label: 'Home',
    });
    const host = await openFormReady(page, 'loan-inquiry');
    await fillFormFromPack(host, steps);
    await submitForm(host, 'Submit Inquiry');
    await expect(host.applicationSavedBanner).toContainText('LOAN');
  });

  test(`${TAGS.happy} — credit card self-employed branch visible then submit`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const steps = smartCreditCardHappy()
      .steps.filter((s) => s.key !== 'employmentStatus')
      .concat([
        {
          key: 'employmentStatus',
          type: 'dropdown',
          value: 'self_employed',
          label: 'Self Employed',
        },
      ]);
    const host = await openFormReady(page, 'smart-credit-card');
    await fillFormFromPack(host, steps);
    await expect(host.form.field('gstNumber')).toBeVisible();
    await submitForm(host, 'Submit Application');
    await expect(host.applicationSavedBanner).toContainText('CARD');
  });

  test(`${TAGS.happy} — support Under Review status after submit`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await openFormReady(page, 'customer-support');
    await fillFormFromPack(host, customerSupportHappy().steps);
    await submitForm(host, 'Submit Support Request');
    const apps = await readApplications(page);
    const sup = apps.find((a) => a.id.startsWith('SUP'));
    expect(sup?.status).toBe('Under Review');
  });

  const supportPaths = [
    {
      id: 'block_lost_card',
      label: 'Block Lost Card',
      extra: [
        { key: 'cardLastFourDigits', type: 'text' as const, value: '4321' },
        { key: 'cardLastUsedDate', type: 'date' as const, value: '2026-07-01' },
        {
          key: 'blockReason',
          type: 'dropdown' as const,
          value: 'lost',
          label: 'Card Lost',
        },
      ],
    },
    {
      id: 'failed_upi_transaction',
      label: 'Failed UPI Transaction',
      extra: [
        { key: 'upiTransactionId', type: 'text' as const, value: 'UPI123456789' },
        { key: 'upiAmount', type: 'text' as const, value: '1500' },
        { key: 'payeeVpa', type: 'text' as const, value: 'merchant@upi' },
        { key: 'upiTransactionDate', type: 'date' as const, value: '2026-07-01' },
      ],
    },
  ];

  for (const path of supportPaths) {
    test(`${TAGS.happy} AUT-FORM-08 — support path ${path.id}`, async ({
      authenticatedUser,
    }) => {
      const { page } = authenticatedUser;
      const base = [
        { key: 'customerName', type: 'text' as const, value: 'Vikram Patel' },
        { key: 'email', type: 'text' as const, value: 'vikram@example.com' },
        { key: 'mobileNumber', type: 'text' as const, value: '9123456789' },
        {
          key: 'supportRequestType',
          type: 'dropdown' as const,
          value: path.id,
          label: path.label,
        },
        ...path.extra,
        {
          key: 'issueDescription',
          type: 'textarea' as const,
          value: 'Need help with this support category request please.',
        },
        {
          key: 'resolutionPreference',
          type: 'dropdown' as const,
          value: 'email',
          label: 'Email Update',
        },
        { key: 'declarationAccepted', type: 'checkbox' as const, value: true },
      ];
      const host = await openFormReady(page, 'customer-support');
      await fillFormFromPack(host, base);
      await submitForm(host, 'Submit Support Request');
      await expect(host.applicationSavedBanner).toContainText('SUP');
    });
  }

  test(`${TAGS.happy} — joint primary-only submit JOINT*`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await openFormReady(page, 'joint-family-account');
    await fillFormFromPack(host, jointFamilyHappy().steps);
    await submitForm(host, 'Submit Joint Application');
    await expect(host.applicationSavedBanner).toContainText('JOINT');
  });

  test(`${TAGS.happy} — platinum card type submits`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const steps = smartCreditCardHappy()
      .steps.filter((s) => s.key !== 'cardType')
      .concat([
        {
          key: 'cardType',
          type: 'dropdown',
          value: 'platinum',
          label: 'Platinum',
        },
      ]);
    const host = await openFormReady(page, 'smart-credit-card');
    await fillFormFromPack(host, steps);
    await submitForm(host, 'Submit Application');
    await expect(host.applicationSavedBanner).toContainText('CARD');
  });

  test(`${TAGS.negative} — short full name rejected on account-opening`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await openFormReady(page, 'account-opening');
    await fillFormFromPack(host, [
      { key: 'fullName', type: 'text', value: 'Ab' },
      { key: 'email', type: 'text', value: 'ab@example.com' },
      { key: 'dateOfBirth', type: 'date', value: '1995-06-15' },
      {
        key: 'accountType',
        type: 'dropdown',
        value: 'savings',
        label: 'Savings',
      },
      { key: 'termsAccepted', type: 'checkbox', value: true },
    ]);
    await submitForm(host, 'Submit Application');
    await expect(host.form.fieldError('fullName')).toBeVisible();
    await expect(host.form.submissionSuccess).toHaveCount(0);
  });

  test(`${TAGS.happy} — re-open form after submit starts fresh (no draft)`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const pack = accountOpeningHappy();
    let host = await openFormReady(page, pack.scenarioId);
    await fillFormFromPack(host, pack.steps);
    await submitForm(host, pack.submitLabel);
    await expect(host.form.submissionSuccess).toBeVisible();
    host = await openFormReady(page, pack.scenarioId);
    // Fresh form: no success panel; profile may prefill name — draft must be absent.
    await expect(host.form.submissionSuccess).toHaveCount(0);
    const { draftForForm, readDrafts } = await import('../../data/storage.read');
    const { user } = authenticatedUser;
    expect(
      draftForForm(await readDrafts(page), user.id!, pack.scenarioId),
    ).toBeUndefined();
  });
});
