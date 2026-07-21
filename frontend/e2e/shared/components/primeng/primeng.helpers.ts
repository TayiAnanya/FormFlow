import type { Locator, Page } from '@playwright/test';

const OVERLAY_SELECTORS = [
  '.p-select-overlay',
  '.p-multiselect-overlay',
  '.p-datepicker-panel-overlay',
  '.p-datepicker-panel',
].join(', ');

/** Short layout settle without Playwright clock APIs. */
async function settle(page: Page, ms = 75): Promise<void> {
  await page.evaluate(
    (delay) => new Promise<void>((resolve) => setTimeout(resolve, delay)),
    ms,
  );
}

/**
 * Scroll via DOM — avoids Playwright `scrollIntoViewIfNeeded` hangs when
 * PrimeNG overlays / ripples keep the target "unstable".
 */
async function safeScrollIntoView(locator: Locator): Promise<void> {
  await locator.evaluate((el) => {
    el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
  });
  await settle(locator.page(), 50);
}

/**
 * Wait until the element's bounding box stops changing (animation / layout settle).
 */
async function waitForStable(locator: Locator, timeoutMs = 5_000): Promise<void> {
  const page = locator.page();
  const deadline = Date.now() + timeoutMs;
  let last: { x: number; y: number; width: number; height: number } | null = null;
  let hits = 0;

  while (Date.now() < deadline) {
    const box = await locator.boundingBox().catch(() => null);
    if (box) {
      if (
        last &&
        Math.abs(box.x - last.x) < 1 &&
        Math.abs(box.y - last.y) < 1 &&
        Math.abs(box.width - last.width) < 1 &&
        Math.abs(box.height - last.height) < 1
      ) {
        hits += 1;
        if (hits >= 2) {
          return;
        }
      } else {
        hits = 0;
        last = box;
      }
    }
    await settle(page, 40);
  }
}

/** Prepare a control: dismiss overlays, scroll, wait until layout-stable. */
async function prepareControl(locator: Locator): Promise<void> {
  await dismissOverlays(locator.page());
  await locator.waitFor({ state: 'visible', timeout: 15_000 });
  await safeScrollIntoView(locator);
  await waitForStable(locator);
}

/** Close PrimeNG overlays that intercept subsequent clicks. */
export async function dismissOverlays(page: Page): Promise<void> {
  const overlays = page.locator(OVERLAY_SELECTORS);

  for (let i = 0; i < 3; i++) {
    const visible = overlays.filter({ visible: true });
    if ((await visible.count()) === 0) {
      break;
    }
    await page.keyboard.press('Escape').catch(() => undefined);
    await visible
      .first()
      .waitFor({ state: 'hidden', timeout: 1_500 })
      .catch(() => undefined);
  }

  const remaining = overlays.filter({ visible: true });
  if ((await remaining.count()) > 0) {
    // Click a neutral corner of main to close connected overlays without hitting fields.
    await page
      .locator('main')
      .click({ position: { x: 4, y: 4 }, force: true })
      .catch(() => undefined);
    await remaining
      .first()
      .waitFor({ state: 'hidden', timeout: 2_000 })
      .catch(() => undefined);
  }

  await settle(page, 40);
}

function selectHost(page: Page, fieldKey: string): Locator {
  return page.locator('p-select').filter({ has: page.locator(`#${fieldKey}`) }).first();
}

async function comboboxLabel(select: Locator): Promise<string> {
  return ((await select.getByRole('combobox').textContent()) ?? '').trim();
}

async function openSelectOverlay(page: Page, select: Locator): Promise<Locator> {
  const combobox = select.getByRole('combobox');
  const triggerButton = select.getByRole('button', { name: 'dropdown trigger' });
  const overlay = page.locator('.p-select-overlay').filter({ visible: true }).last();

  if ((await triggerButton.count()) > 0) {
    await triggerButton.click({ force: true, timeout: 5_000 });
  } else {
    await combobox.click({ force: true, timeout: 5_000 });
  }

  const opened = await overlay
    .waitFor({ state: 'visible', timeout: 3_000 })
    .then(() => true)
    .catch(() => false);

  if (!opened) {
    await combobox.focus();
    await combobox.press('ArrowDown');
    await overlay.waitFor({ state: 'visible', timeout: 10_000 });
  }

  return overlay;
}

/** Open a PrimeNG p-select bound to `inputId` / field key and choose an option by visible label. */
export async function selectDropdownOption(
  page: Page,
  fieldKey: string,
  optionLabel: string,
): Promise<void> {
  const select = selectHost(page, fieldKey);
  await prepareControl(select);

  if ((await comboboxLabel(select)) === optionLabel) {
    return;
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    await dismissOverlays(page);
    await safeScrollIntoView(select);
    await waitForStable(select, 3_000);

    const overlay = await openSelectOverlay(page, select);
    const option = overlay
      .getByRole('option', { name: optionLabel, exact: true })
      .or(overlay.getByText(optionLabel, { exact: true }));
    await option.first().waitFor({ state: 'visible', timeout: 5_000 });
    await option.first().click({ force: true, timeout: 5_000 });

    await dismissOverlays(page);
    // Confirm overlay closed before reading label.
    await page
      .locator('.p-select-overlay')
      .filter({ visible: true })
      .first()
      .waitFor({ state: 'hidden', timeout: 2_000 })
      .catch(() => undefined);

    if ((await comboboxLabel(select)) === optionLabel) {
      return;
    }
  }

  throw new Error(`Failed to select "${optionLabel}" for dropdown #${fieldKey}`);
}

/** Open p-multiselect and toggle options by label. */
export async function selectMultiselectOptions(
  page: Page,
  fieldKey: string,
  optionLabels: string[],
): Promise<void> {
  const multi = page.locator(`p-multiselect`).filter({
    has: page.locator(`#${fieldKey}`),
  });
  await prepareControl(multi);
  await multi.click({ force: true, timeout: 5_000 });
  const overlay = page.locator('.p-multiselect-overlay').filter({ visible: true }).last();
  await overlay.waitFor({ state: 'visible', timeout: 10_000 });
  for (const label of optionLabels) {
    const option = overlay.getByText(label, { exact: true });
    await option.waitFor({ state: 'visible', timeout: 5_000 });
    await option.click({ force: true, timeout: 5_000 });
  }
  await dismissOverlays(page);
}

/**
 * Fill p-datepicker string input (YYYY-MM-DD).
 * Commits value into the Angular control and closes the calendar overlay.
 */
export async function fillDatePicker(
  page: Page,
  fieldKey: string,
  isoDate: string,
): Promise<void> {
  await dismissOverlays(page);
  const input = page.locator(`input#${fieldKey}, #${fieldKey}`).first();
  await input.waitFor({ state: 'attached', timeout: 10_000 });
  await prepareControl(input);

  await input.click({ force: true, timeout: 5_000 });
  await input.fill(isoDate, { force: true, timeout: 5_000 });
  // Commit into Angular control (Tab blur) then ensure calendar is gone.
  await input.press('Tab');
  await dismissOverlays(page);
  await page
    .locator('.p-datepicker-panel, .p-datepicker-panel-overlay')
    .filter({ visible: true })
    .first()
    .waitFor({ state: 'hidden', timeout: 2_000 })
    .catch(() => undefined);

  const current = ((await input.inputValue().catch(() => '')) ?? '').trim();
  if (current && current !== isoDate) {
    // Retry once if the panel stole focus / overwrote the value.
    await dismissOverlays(page);
    await input.fill(isoDate, { force: true, timeout: 5_000 });
    await input.press('Enter');
    await dismissOverlays(page);
  }
}

/** Toggle binary p-checkbox for field key. */
export async function setCheckbox(
  page: Page,
  fieldKey: string,
  checked: boolean,
): Promise<void> {
  await dismissOverlays(page);
  const box = page.locator(`#${fieldKey}`);
  await box.waitFor({ state: 'attached', timeout: 10_000 });
  const label = page.locator(`label[for="${fieldKey}"]`);
  const target = (await label.count()) > 0 ? label.first() : box;
  await safeScrollIntoView(target);
  await waitForStable(target, 3_000);
  const isChecked = await box.isChecked().catch(() => false);
  if (isChecked !== checked) {
    await target.click({ force: true, timeout: 5_000 });
  }
}

export function fieldRoot(page: Page, fieldKey: string): Locator {
  return page
    .locator('.formflow-field')
    .filter({
      has: page.locator(`#${fieldKey}`),
    })
    .first();
}
