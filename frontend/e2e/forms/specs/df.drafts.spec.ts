import { expect, test } from '../../shared/fixtures';
import { TAGS } from '../../shared/config/test-tags';
import { WORKSPACE_STORAGE_KEYS } from '../../shared/config/constants';
import {
  draftForForm,
  readApplications,
  readDrafts,
  accountOpeningHappy,
  loanInquiryHappy,
  SCENARIO_META,
} from '../data';
import {
  fillFormFromPack,
  openFormReady,
  resumeDraftFromWorkspace,
  submitForm,
  waitForDraftPersistence,
} from '../workflows';

/**
 * Draft autosave / restore / clear-on-submit + localStorage (AUT-WS-05 seam).
 */
test.describe(`${TAGS.forms} Draft lifecycle and persistence`, () => {
  test(`${TAGS.happy} J-DF-C — autosave after debounce writes ff_form_drafts`, async ({
    authenticatedUser,
  }) => {
    const { page, user } = authenticatedUser;
    const host = await openFormReady(page, 'loan-inquiry');
    await fillFormFromPack(host, [
      { key: 'applicantName', type: 'text', value: 'Draft Rahul' },
      { key: 'loanAmount', type: 'text', value: '250000' },
    ]);
    await waitForDraftPersistence();
    const drafts = await readDrafts(page);
    const draft = draftForForm(drafts, user.id!, 'loan-inquiry');
    expect(draft).toBeTruthy();
    expect(draft!.values.applicantName).toBe('Draft Rahul');
  });

  test(`${TAGS.happy} — refresh retains draft values in storage`, async ({
    authenticatedUser,
  }) => {
    const { page, user } = authenticatedUser;
    const host = await openFormReady(page, 'account-opening');
    await fillFormFromPack(host, [
      { key: 'fullName', type: 'text', value: 'Refresh Persist User' },
      { key: 'email', type: 'text', value: 'refresh@example.com' },
    ]);
    await waitForDraftPersistence();
    await page.reload();
    await host.expectFormReady();
    await expect(host.form.field('fullName')).toHaveValue('Refresh Persist User');
    const drafts = await readDrafts(page);
    expect(draftForForm(drafts, user.id!, 'account-opening')).toBeTruthy();
  });

  test(`${TAGS.happy} J-DF-C — resume from workspace Continue restores values`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await openFormReady(page, 'loan-inquiry');
    await fillFormFromPack(host, [
      { key: 'applicantName', type: 'text', value: 'Resume Mehta' },
      {
        key: 'purpose',
        type: 'textarea',
        value: 'Resume draft purpose text here',
      },
    ]);
    await waitForDraftPersistence();
    const resumed = await resumeDraftFromWorkspace(
      page,
      SCENARIO_META['loan-inquiry'].title,
    );
    await expect(resumed.form.field('applicantName')).toHaveValue('Resume Mehta');
  });

  test(`${TAGS.happy} J-DF-D — successful submit clears draft for formType`, async ({
    authenticatedUser,
  }) => {
    const { page, user } = authenticatedUser;
    const pack = accountOpeningHappy();
    const host = await openFormReady(page, pack.scenarioId);
    await fillFormFromPack(host, pack.steps);
    await waitForDraftPersistence();
    expect(
      draftForForm(await readDrafts(page), user.id!, pack.scenarioId),
    ).toBeTruthy();
    await submitForm(host, pack.submitLabel);
    await expect(host.form.submissionSuccess).toBeVisible();
    await waitForDraftPersistence();
    expect(
      draftForForm(await readDrafts(page), user.id!, pack.scenarioId),
    ).toBeUndefined();
  });

  test(`${TAGS.happy} — submit creates application in localStorage`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const pack = loanInquiryHappy();
    const host = await openFormReady(page, pack.scenarioId);
    await fillFormFromPack(host, pack.steps);
    await submitForm(host, pack.submitLabel);
    await expect(host.applicationSavedBanner).toBeVisible();
    const apps = await readApplications(page);
    expect(apps.some((a) => a.id.startsWith('LOAN'))).toBeTruthy();
  });

  test(`${TAGS.happy} — multi-scenario drafts isolated by formType`, async ({
    authenticatedUser,
  }) => {
    const { page, user } = authenticatedUser;
    let host = await openFormReady(page, 'account-opening');
    await fillFormFromPack(host, [
      { key: 'fullName', type: 'text', value: 'Isolation Alpha' },
    ]);
    await waitForDraftPersistence();

    host = await openFormReady(page, 'loan-inquiry');
    await fillFormFromPack(host, [
      { key: 'applicantName', type: 'text', value: 'Isolation Beta' },
    ]);
    await waitForDraftPersistence();

    const drafts = await readDrafts(page);
    expect(draftForForm(drafts, user.id!, 'account-opening')!.values.fullName).toBe(
      'Isolation Alpha',
    );
    expect(
      draftForForm(drafts, user.id!, 'loan-inquiry')!.values.applicantName,
    ).toBe('Isolation Beta');
  });

  test(`${TAGS.happy} J-DF-G — switching scenario rebuilds form (reset-equivalent)`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    let host = await openFormReady(page, 'account-opening');
    await fillFormFromPack(host, [
      { key: 'fullName', type: 'text', value: 'Should Not Leak' },
    ]);
    host = await openFormReady(page, 'loan-inquiry');
    await expect(host.title).toContainText('Loan Inquiry');
    // Account-opening fields must not leak into loan schema.
    await expect(host.form.field('fullName')).toHaveCount(0);
    await expect(host.form.field('accountType')).toHaveCount(0);
    await expect(host.form.field('applicantName')).toBeVisible();
  });

  test(`${TAGS.happy} — empty form does not force meaningless draft`, async ({
    authenticatedUser,
  }) => {
    const { page, user } = authenticatedUser;
    await openFormReady(page, 'account-opening');
    await waitForDraftPersistence();
    const draft = draftForForm(await readDrafts(page), user.id!, 'account-opening');
    // App may skip empty — either absent or empty values object
    if (draft) {
      const vals = Object.values(draft.values ?? {});
      const meaningful = vals.some(
        (v) => v !== null && v !== undefined && v !== '' && v !== false,
      );
      expect(meaningful).toBeFalsy();
    }
  });

  test(`${TAGS.happy} — drafts storage key is workspace drafts key`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await openFormReady(page, 'loan-inquiry');
    await fillFormFromPack(host, [
      { key: 'applicantName', type: 'text', value: 'Key Check' },
    ]);
    await waitForDraftPersistence();
    const raw = await page.evaluate(
      (key) => window.localStorage.getItem(key),
      WORKSPACE_STORAGE_KEYS.drafts,
    );
    expect(raw).toBeTruthy();
  });

  test(`${TAGS.critical} J-DF-J — draft resume then complete submit`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const pack = loanInquiryHappy();
    let host = await openFormReady(page, pack.scenarioId);
    await fillFormFromPack(host, [
      { key: 'applicantName', type: 'text', value: 'Critical Resume' },
      { key: 'loanAmount', type: 'text', value: '100000' },
    ]);
    await waitForDraftPersistence();
    host = await resumeDraftFromWorkspace(page, pack.title);
    await fillFormFromPack(host, pack.steps);
    await submitForm(host, pack.submitLabel);
    await expect(host.form.submissionSuccess).toBeVisible();
    await expect(host.applicationSavedBanner).toContainText('LOAN');
  });
});
