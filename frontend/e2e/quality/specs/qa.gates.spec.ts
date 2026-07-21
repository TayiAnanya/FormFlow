import { expect, test } from '../../shared/fixtures';
import { TAGS } from '../../shared/config/test-tags';
import { GREP_PR_GATE } from '../../shared/config/test-tags';

/**
 * AUT-QA-08 — documents smoke/critical gate contract.
 * Full suites are executed in CI / Completion Report via:
 *   npx playwright test --grep "@smoke"
 *   npx playwright test --grep "@critical"
 * This file asserts the tag constants remain wired for the PR gate.
 */
test.describe(`${TAGS.smoke} ${TAGS.critical} AUT-QA-08 Gate contract`, () => {
  test(`${TAGS.smoke} — PR gate grep expression includes smoke and critical`, () => {
    expect(TAGS.smoke).toBe('@smoke');
    expect(TAGS.critical).toBe('@critical');
    expect(GREP_PR_GATE).toContain('@smoke');
    expect(GREP_PR_GATE).toContain('@critical');
  });

  test(`${TAGS.critical} — quality suite carries responsive and a11y tags`, () => {
    expect(TAGS.responsive).toBe('@responsive');
    expect(TAGS.a11y).toBe('@a11y');
    expect(TAGS.security).toBe('@security');
  });
});
