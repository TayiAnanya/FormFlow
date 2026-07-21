import { expect, test } from '../../../shared/fixtures';
import { TAGS } from '../../../shared/config/test-tags';
import { APPLICATION_ID_PREFIX } from '../../../shared/config/constants';
import { HAPPY_PACKS, SCENARIO_META } from '../../data';
import {
  completeHappySubmit,
  openFormReady,
  openFormScenario,
} from '../../workflows';

/**
 * Schema load sample + happy submits (AUT-REN-01, AUT-FORM-01…05).
 * One load sample (not × every scenario) — happy submits cover readiness.
 */
test.describe(`${TAGS.forms} Schema load and happy submits`, () => {
  test(`${TAGS.happy} AUT-REN-01 — loads schema for account-opening`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await openFormReady(page, 'account-opening');
    await expect(host.title).toContainText(SCENARIO_META['account-opening'].title);
    await expect(host.schemaSuccessMessage).toBeVisible();
    await expect(host.form.root).toBeVisible();
  });

  for (const pack of HAPPY_PACKS) {
    test(`${TAGS.happy} AUT-FORM — happy submit ${pack.scenarioId} → ${pack.applicationPrefix}*`, async ({
      authenticatedUser,
    }) => {
      const { page } = authenticatedUser;
      const host = await completeHappySubmit(page, pack);
      await expect(host.form.submissionSuccess).toBeVisible();
      await expect(host.applicationSavedBanner).toBeVisible();
      await expect(host.applicationSavedBanner).toContainText(
        APPLICATION_ID_PREFIX[pack.scenarioId],
      );
      await expect(host.viewApplication).toBeVisible();
    });
  }

  test(`${TAGS.negative} AUT-REN-01 — unknown scenario shows catalog error and recovers`, async ({
    authenticatedUser,
  }) => {
    const { page } = authenticatedUser;
    const host = await openFormScenario(page, 'not-a-real-scenario');
    await expect(host.catalogMissingMessage).toBeVisible();
    await expect(host.returnToDashboard).toBeVisible();
    await expect(host.form.root).toHaveCount(0);
    await host.returnToDashboard.click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
