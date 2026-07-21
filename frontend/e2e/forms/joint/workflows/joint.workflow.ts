import type { Page } from '@playwright/test';

import type { FormFillStep } from '../../data/form.types';
import { FormHostPage } from '../../pages';
import { JointApplicantsRepeater } from '../../components';
import {
  fillFormFromPack,
  openFormReady,
  resumeDraftFromWorkspace,
  submitForm,
  waitForDraftPersistence,
} from '../../workflows';
import {
  JOINT_SCENARIO,
  JOINT_SUBMIT_LABEL,
  JOINT_TITLE,
  jointPrimarySteps,
  type JointRowPack,
} from '../data';

export async function openJointForm(page: Page): Promise<{
  host: FormHostPage;
  repeater: JointApplicantsRepeater;
}> {
  const host = await openFormReady(page, JOINT_SCENARIO);
  const repeater = new JointApplicantsRepeater(page);
  return { host, repeater };
}

export async function fillPrimary(
  host: FormHostPage,
  steps: FormFillStep[] = jointPrimarySteps(),
): Promise<void> {
  await host.form.clearKeys([
    'fullName',
    'email',
    'mobile',
    'address',
    'idNumber',
  ]);
  await fillFormFromPack(host, steps);
}

export async function addAndFillJoint(
  repeater: JointApplicantsRepeater,
  pack: JointRowPack,
): Promise<number> {
  await repeater.addApplicant();
  const index = (await repeater.count()) - 1;
  await repeater.fillRow(index, pack.steps);
  if (pack.needsFile) {
    await repeater.uploadProof(index);
  }
  return index;
}

export async function submitJoint(host: FormHostPage): Promise<void> {
  await submitForm(host, JOINT_SUBMIT_LABEL);
}

export async function completeMultiApplicantSubmit(
  page: Page,
  rows: JointRowPack[],
): Promise<FormHostPage> {
  const { host, repeater } = await openJointForm(page);
  await fillPrimary(host);
  for (const row of rows) {
    await addAndFillJoint(repeater, row);
  }
  await submitJoint(host);
  return host;
}

export async function waitForJointDraft(): Promise<void> {
  await waitForDraftPersistence();
}

export async function resumeJointDraft(page: Page): Promise<{
  host: FormHostPage;
  repeater: JointApplicantsRepeater;
}> {
  const host = await resumeDraftFromWorkspace(page, JOINT_TITLE);
  const repeater = new JointApplicantsRepeater(page);
  return { host, repeater };
}

export { JOINT_TITLE, JOINT_SUBMIT_LABEL, JOINT_SCENARIO };
