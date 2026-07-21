import type { Page } from '@playwright/test';

import { ROUTES, type ScenarioId } from '../../shared/config/constants';
import { waitForDraftPersistBuffer } from '../../shared/utils/wait.helper';
import { DashboardPage } from '../../workspace/pages';
import { FormHostPage } from '../pages';
import type { FormFillStep, ScenarioHappyPack } from '../data';

export async function openFormScenario(
  page: Page,
  scenarioId: ScenarioId | string,
): Promise<FormHostPage> {
  const host = new FormHostPage(page);
  await host.open(scenarioId);
  return host;
}

export async function openFormReady(
  page: Page,
  scenarioId: ScenarioId,
): Promise<FormHostPage> {
  const host = await openFormScenario(page, scenarioId);
  await host.expectFormReady();
  return host;
}

export async function fillFormFromPack(
  host: FormHostPage,
  steps: FormFillStep[],
): Promise<void> {
  await host.form.fillSteps(steps);
}

export async function submitForm(
  host: FormHostPage,
  submitLabel: string,
): Promise<void> {
  await host.form.submitByLabel(submitLabel);
}

export async function completeHappySubmit(
  page: Page,
  pack: ScenarioHappyPack,
): Promise<FormHostPage> {
  const host = await openFormReady(page, pack.scenarioId);
  await fillFormFromPack(host, pack.steps);
  await submitForm(host, pack.submitLabel);
  return host;
}

export async function waitForDraftPersistence(): Promise<void> {
  await waitForDraftPersistBuffer();
}

export async function resumeDraftFromWorkspace(
  page: Page,
  formTitle: string | RegExp,
): Promise<FormHostPage> {
  const dashboard = new DashboardPage(page);
  await dashboard.open();
  await dashboard.continueDraft(formTitle);
  const host = new FormHostPage(page);
  await host.expectFormReady();
  return host;
}

export async function switchScenario(
  page: Page,
  scenarioId: ScenarioId,
): Promise<FormHostPage> {
  return openFormReady(page, scenarioId);
}

export async function backToWorkspace(page: Page): Promise<DashboardPage> {
  const host = new FormHostPage(page);
  await host.backToWorkspace.click();
  const dashboard = new DashboardPage(page);
  await dashboard.expectReady();
  return dashboard;
}

export { ROUTES };
