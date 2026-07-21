import { expect, test } from '../../shared/fixtures';
import { TAGS } from '../../shared/config/test-tags';
import {
  accountOpeningHappy,
  customerSupportHappy,
  draftForForm,
  jointFamilyHappy,
  loanInquiryHappy,
  readDrafts,
  smartCreditCardHappy,
} from '../data';
import {
  completeHappySubmit,
  fillFormFromPack,
  openFormReady,
  openFormScenario,
  submitForm,
  waitForDraftPersistence,
} from '../workflows';
import { ApplicationDetailPage, DashboardPage } from '../../workspace/pages';

/**
 * Multi-step behavioural journeys (J-DF-*).
 */
test.describe(`${TAGS.forms} ${TAGS.journey} User journeys`, () => {
  test(`${TAGS.happy} ${TAGS.smoke} J-DF-A — open fill submit account-opening`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const pack = accountOpeningHappy();
    const host = await completeHappySubmit(page, pack);
    await expect(host.form.submissionSuccess).toContainText(
      'Form submitted successfully',
    );
    await expect(host.applicationSavedBanner).toContainText('ACC');
  });

  test(`${TAGS.happy} J-DF-B — validation gate then recover and submit`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const pack = accountOpeningHappy();
    const host = await openFormReady(page, pack.scenarioId);
    await host.form.clearKeys(['fullName', 'email']);
    await submitForm(host, pack.submitLabel);
    await expect(
      page.getByRole('alert').filter({ hasText: 'Full name is required' }),
    ).toBeVisible();
    await fillFormFromPack(host, pack.steps);
    await submitForm(host, pack.submitLabel);
    await expect(host.form.submissionSuccess).toBeVisible();
  });

  test(`${TAGS.happy} J-DF-E — credit conditional then submit CARD*`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const pack = smartCreditCardHappy();
    const host = await openFormReady(page, pack.scenarioId);
    await fillFormFromPack(host, pack.steps);
    await expect(host.form.field('companyName')).toBeVisible();
    await submitForm(host, pack.submitLabel);
    await expect(host.applicationSavedBanner).toContainText('CARD');
  });

  test(`${TAGS.happy} J-DF-F — support category path SUP*`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const pack = customerSupportHappy();
    const host = await completeHappySubmit(page, pack);
    await expect(host.applicationSavedBanner).toContainText('SUP');
  });

  test(`${TAGS.happy} J-DF-H — boundary reject then fix email and submit`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await openFormReady(page, 'account-opening');
    await fillFormFromPack(host, [
      { key: 'fullName', type: 'text', value: 'Boundary User' },
      { key: 'email', type: 'text', value: 'bad-email' },
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
    await expect(host.form.fieldError('email')).toContainText(
      'Enter a valid email address',
    );
    await fillFormFromPack(host, [
      { key: 'email', type: 'text', value: 'boundary.ok@example.com' },
    ]);
    await submitForm(host, 'Submit Application');
    await expect(host.form.submissionSuccess).toBeVisible();
  });

  test(`${TAGS.happy} J-DF-I — submit then View application detail`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const pack = accountOpeningHappy();
    const host = await completeHappySubmit(page, pack);
    await host.viewApplication.click();
    const detail = new ApplicationDetailPage(page);
    await detail.expectReady();
    await expect(detail.applicationId).toContainText('ACC');
  });

  test(`${TAGS.happy} J-DF-G — multi-form journey account then loan`, async ({
    authenticatedUser,
  }) => {
    const { page, user } = authenticatedUser;
    await completeHappySubmit(page, accountOpeningHappy());
    const loan = await completeHappySubmit(page, loanInquiryHappy());
    await expect(loan.applicationSavedBanner).toContainText('LOAN');
    const drafts = await readDrafts(page);
    expect(draftForForm(drafts, user.id!, 'account-opening')).toBeUndefined();
    expect(draftForForm(drafts, user.id!, 'loan-inquiry')).toBeUndefined();
  });

  test(`${TAGS.negative} J-DF — error recovery from unknown schema to valid form`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const bad = await openFormScenario(page, 'missing-schema-xyz');
    await expect(bad.catalogMissingMessage).toBeVisible();
    await bad.returnToDashboard.click();
    const dashboard = new DashboardPage(page);
    await dashboard.expectReady();
    const host = await openFormReady(page, 'account-opening');
    await expect(host.form.root).toBeVisible();
  });

  test(`${TAGS.happy} — Back to My Workspace from form host`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await openFormReady(page, 'account-opening');
    await host.backToWorkspace.click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test(`${TAGS.happy} — catalog Open Form lands on FormHost ready`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const dashboard = new DashboardPage(page);
    await dashboard.open();
    await dashboard.openCatalogForm('Account Opening');
    const host = await openFormReady(page, 'account-opening');
    await expect(host.title).toContainText('Account Opening');
  });

  test(`${TAGS.happy} — partial draft then leave via back retains storage`, async ({
    authenticatedUser,
  }) => {
    const { page, user } = authenticatedUser;
    const host = await openFormReady(page, 'loan-inquiry');
    await fillFormFromPack(host, [
      { key: 'applicantName', type: 'text', value: 'Parked Draft' },
    ]);
    await waitForDraftPersistence();
    await host.backToWorkspace.click();
    expect(
      draftForForm(await readDrafts(page), user.id!, 'loan-inquiry')?.values
        .applicantName,
    ).toBe('Parked Draft');
  });

  test(`${TAGS.happy} AUT-REN-05 — joint happy path without repeater depth`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await completeHappySubmit(page, jointFamilyHappy());
    await expect(host.applicationSavedBanner).toContainText('JOINT');
  });
});
